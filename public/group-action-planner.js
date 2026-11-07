(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else { root.GroupActionPlanner = api; api.initialize(); }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const abilityNames = {str:'STR',dex:'DEX',con:'CON',int:'INT',wis:'WIS',cha:'CHA'};
  let plans = [], selectedActors = [], generationSerial = 0;

  function activateActionTab(name) {
    const receiverTab=document.getElementById('mapReceiverActionsTab'),groupTab=document.getElementById('mapGroupActionsTab');
    const receiverPane=document.getElementById('mapReceiverActionsPane'),groupPane=document.getElementById('mapGroupActionsPane');
    if(!receiverTab||!groupTab||!receiverPane||!groupPane)return;
    const showGroup=name==='group'&&!groupTab.disabled;
    receiverTab.classList.toggle('is-active',!showGroup);receiverTab.setAttribute('aria-selected',String(!showGroup));
    groupTab.classList.toggle('is-active',showGroup);groupTab.setAttribute('aria-selected',String(showGroup));
    receiverPane.hidden=showGroup;groupPane.hidden=!showGroup;
    if(showGroup&&!plans.length)void generate();
  }

  function textOf(value) {
    return Array.isArray(value) ? value.map(textOf).join(' ') : typeof value === 'string' ? value : value?.entries ? textOf(value.entries) : value?.items ? textOf(value.items) : '';
  }
  function cleanText(value) {
    return textOf(value).replace(/\{@(?:damage|dice)\s+([^}]+)\}/gi, '$1').replace(/\{@dc\s+(\d+)\}/gi, 'DC $1').replace(/\{@condition\s+([^}]+)\}/gi, '$1').replace(/\{@\w+\s+([^}|]+)(?:\|[^}]*)?\}/gi,'$1').replace(/\s+/g, ' ').trim();
  }
  function parseDamageParts(raw) {
    const text = cleanText(raw), parts = [];
    const parenthetical = /(\d+)\s*\(([^)]*?\d+d\d+[^)]*)\)\s*([a-z]+)\s+damage/gi;
    let match,previousEnd=0,matchedDamage=0;
    while ((match = parenthetical.exec(text))) {
      const alternative=matchedDamage>0&&/\bor\b/i.test(text.slice(previousEnd,match.index));
      matchedDamage++;
      previousEnd=parenthetical.lastIndex;
      if(alternative)continue;
      const formula = match[2].replace(/\bdamage\b/gi, '').trim();
      parts.push({ average:Number(match[1]), formula, type:match[3].toLowerCase() });
    }
    if (!parts.length) {
      const formulaMatch = text.match(/(\d*d\d+(?:\s*[+-]\s*\d+)?)\s+([a-z]+)\s+damage/i);
      if (formulaMatch) parts.push({ average:null, formula:formulaMatch[1], type:formulaMatch[2].toLowerCase() });
      else {
        const fixed = text.match(/(?:takes?|deals?|Hit:)\s*(\d+)\s+([a-z]+)\s+damage/i);
        if (fixed) parts.push({ average:Number(fixed[1]), formula:String(fixed[1]), type:fixed[2].toLowerCase() });
        else {
          const untyped = text.match(/\(?(\d*d\d+(?:\s*[+-]\s*\d+)?)\)?(?:\s+damage)?/i);
          if (untyped) parts.push({ average:null, formula:untyped[1], type:'damage' });
        }
      }
    }
    return parts;
  }
  function parseAction(entry = {}) {
    const sourceRaw=textOf(entry.entries),raw = cleanText(entry.entries), base = typeof CpuActionAdvisor !== 'undefined' ? CpuActionAdvisor.parseAction(entry) : {};
    const save = raw.match(/DC\s*(\d+)\s*(Strength|Dexterity|Constitution|Intelligence|Wisdom|Charisma|STR|DEX|CON|INT|WIS|CHA)\s+saving throw/i);
    const ability = save ? save[2].slice(0,3).toLowerCase() : null;
    const conditions=[...sourceRaw.matchAll(/\{@condition\s+([^}]+)\}/gi)].map(match=>match[1].replace(/^./,letter=>letter.toUpperCase()));
    for(const match of raw.matchAll(/(?:knocked|becomes?|is)\s+(prone|restrained|poisoned|frightened|charmed|blinded|stunned|paralyzed|unconscious)/gi)){const condition=match[1].replace(/^./,letter=>letter.toUpperCase());if(!conditions.includes(condition))conditions.push(condition);}
    return {
      ...base,
      name:String(entry.name || base.name || 'Action'), raw,
      attackBonus:base.attackBonus ?? Number(raw.match(/([+-]\s*\d+)\s+to hit/i)?.[1]?.replace(/\s+/g,'') || NaN),
      saveDc:save ? Number(save[1]) : null, saveAbility:ability,
      damageParts:parseDamageParts(raw),
      conditions,
      successHalf:/half as much damage on a successful (?:one|save)/i.test(raw),
      area:/\b(?:cone|sphere|radius|line|cube|each creature|all creatures)\b/i.test(raw)
    };
  }
  const countWords={a:1,an:1,one:1,once:1,two:2,twice:2,three:3,thrice:3,four:4,five:5,six:6,seven:7,eight:8,nine:9,ten:10};
  function attackCount(value) {
    const token=String(value||'').toLowerCase().replace(/\s+times?$/,'');
    if(/^\d+d\d+$/.test(token)){const [count,sides]=token.split('d').map(Number);return Array.from({length:count},()=>secureDie(sides)).reduce((sum,roll)=>sum+roll,0);}
    return Number(token)||countWords[token]||0;
  }
  const countToken='once|twice|thrice|one|two|three|four|five|six|seven|eight|nine|ten|an|a|\\d+d\\d+|\\d+';
  function actionNameBase(name) { return cleanText(name).replace(/\s*\([^)]*\)\s*/g,' ').replace(/\s+/g,' ').trim(); }
  function mentionPattern(name) {
    const words=actionNameBase(name).toLowerCase().match(/[a-z0-9]+/g)||[];
    if(!words.length)return null;
    const patterns=[words].map(parts=>parts.map((word,index)=>{
      const escaped=word.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
      if(index!==parts.length-1)return escaped;
      return word.endsWith('s')?`${escaped}|${escaped.slice(0,-1)}`:`${escaped}(?:s|es)?`;
    }).join('[\\s-]+'));
    return patterns.length?new RegExp(`\\b(?:${patterns.join('|')})\\b`,'i'):null;
  }
  function nearbyAttackCount(raw,index,length) {
    const before=raw.slice(Math.max(0,index-70),index),after=raw.slice(index+length,index+length+35);
    const beforeMatch=before.match(new RegExp(`\\b(${countToken})(?:\\s+times?)?(?:\\s+(?:melee|ranged|weapon|attacks?)){0,2}(?:\\s+(?:with|using|of))?(?:\\s+(?:his|her|its|the|a|an))?\\s*$`,'i'));
    if(beforeMatch)return attackCount(beforeMatch[1]);
    const afterMatch=after.match(new RegExp(`^\\s+(?:attacks?|strikes?)?\\s*(${countToken})(?:\\s+times?)?\\b`,'i'));
    return afterMatch?attackCount(afterMatch[1]):0;
  }
  function totalAttackCount(raw) {
    const nonArticleToken='once|twice|thrice|one|two|three|four|five|six|seven|eight|nine|ten|\\d+d\\d+|\\d+';
    const patterns=[
      new RegExp(`\\b(?:makes?|performs?)\\s+(${countToken})(?:\\s+(?:melee|ranged|weapon))?\\s+attacks?\\b`,'i'),
      new RegExp(`\\battacks?\\s+(${countToken})(?:\\s+times?)?\\b`,'i'),
      new RegExp(`\\b(?:makes?|hurls?|uses?)\\s+(${nonArticleToken})\\b`,'i'),
      /\b(once|twice|thrice)\b/i
    ];
    for(const pattern of patterns){const match=raw.match(pattern);if(match)return attackCount(match[1]);}
    return 0;
  }
  function genericMultiattackComponents(action,actions,statblock) {
    const raw=action.raw.toLowerCase(),rollables=actions.filter(candidate=>candidate!==action&&(Number.isFinite(candidate.attackBonus)||candidate.saveDc||candidate.damageParts?.length));
    const mentions=[];
    for(const candidate of rollables){
      const pattern=mentionPattern(candidate.name);let match=pattern?.exec(raw);
      if(!match){
        const words=(actionNameBase(candidate.name).toLowerCase().match(/[a-z0-9]+/g)||[]).filter(word=>word.length>=4&&!['attack','touch','strike','weapon','melee','ranged'].includes(word));
        const uniqueWord=words.find(word=>rollables.filter(other=>actionNameBase(other.name).toLowerCase().match(/[a-z0-9]+/g)?.includes(word)).length===1&&new RegExp(`\\b${word}s?\\b`,'i').test(raw));
        if(uniqueWord)match=new RegExp(`\\b${uniqueWord}s?\\b`,'i').exec(raw);
      }
      if(!match)continue;
      mentions.push({action:candidate,index:match.index,length:match[0].length,count:nearbyAttackCount(raw,match.index,match[0].length)});
    }
    mentions.sort((a,b)=>a.index-b.index);
    const total=totalAttackCount(raw),components=[];
    for(let index=0;index<mentions.length;index++){
      const mention=mentions[index],prior=mentions[index-1],connector=prior?raw.slice(prior.index+prior.length,mention.index):'';
      if(prior&&/\bor\b/i.test(connector)&&!/[.;]\s*[^.;]*$/i.test(connector))continue;
      components.push({...mention,count:mention.count||1});
    }
    const hasExplicitCount=mentions.some(mention=>mention.count);
    if(components.length&&(!total||hasExplicitCount)&&!(total&&/only one/i.test(raw)))return components.map(({action:componentAction,count})=>({action:componentAction,count}));
    if(mentions.length&&total&&!/only one/i.test(raw)&&!/then makes?\s+(?:a|an|one|two|three|four|five|six|\d+)\s+(?:melee|ranged|weapon)?\s*attacks?/i.test(raw))return [{action:mentions[0].action,count:total}];
    let resolvedTotal=total;
    if(!resolvedTotal&&/half (?:its|the) proficiency bonus/i.test(raw))resolvedTotal=Math.max(1,Math.floor((Number(statblock?.prof_bonus)||0)/2));
    if(!resolvedTotal||!rollables.length)return [];
    const restricted=[...raw.matchAll(/only one (?:of which )?(?:can be )?(?:an? |with (?:its|a) )?([a-z-]+)/gi)].map(match=>match[1].replace(/s$/,'').toLowerCase());
    const mode=/\branged attacks?\b/i.test(raw)&&!/\bmelee attacks?\b/i.test(raw)?'ranged':/\bmelee attacks?\b/i.test(raw)&&!/\branged attacks?\b/i.test(raw)?'melee':null;
    const eligible=rollables.filter(candidate=>!restricted.some(word=>actionNameBase(candidate.name).toLowerCase().includes(word))).filter(candidate=>mode!=='ranged'||candidate.range).filter(candidate=>mode!=='melee'||candidate.reach||!candidate.range);
    return [{action:eligible[0]||rollables[0],count:resolvedTotal}];
  }
  function resolveMultiattacks(actions,statblock) {
    const byName=new Map(actions.map(action=>[action.name.toLowerCase(),action]));
    return actions.map(action=>{
      if(!/multiattack/i.test(action.name))return action;
      const components=[];
      for(const match of action.raw.matchAll(/\b(one|two|three|four|five|six|\d+)\s+(?:attacks?\s+)?with (?:its|the)\s+([a-z][a-z '-]*?)(?=\s+and\s+|[.,;]|$)/gi)){
        const referenced=byName.get(match[2].trim().replace(/s$/i,'').toLowerCase())||byName.get(match[2].trim().toLowerCase());
        if(referenced)components.push({action:referenced,count:attackCount(match[1])});
      }
      if(!components.length){
        const repeated=action.raw.match(/\b(one|two|three|four|five|six|\d+)\s+(?:melee\s+|ranged\s+)?attacks?\s+with (?:its|the)\s+([a-z][a-z '-]*?)(?=[.,;]|$)/i);
        const referenced=repeated&&(byName.get(repeated[2].trim().replace(/s$/i,'').toLowerCase())||byName.get(repeated[2].trim().toLowerCase()));
        if(referenced)components.push({action:referenced,count:attackCount(repeated[1])});
      }
      if(!components.length){
        const weaponFirst=action.raw.match(/\b(one|two|three|four|five|six|\d+)\s+([a-z][a-z '-]*?)\s+attacks?\b/i);
        const weaponName=weaponFirst?.[2].trim().replace(/^(?:melee|ranged)\s+/i,'');
        const referenced=weaponName&&(byName.get(weaponName.replace(/s$/i,'').toLowerCase())||byName.get(weaponName.toLowerCase()));
        if(referenced)components.push({action:referenced,count:attackCount(weaponFirst[1])});
      }
      const generic=genericMultiattackComponents(action,actions,statblock),componentTotal=components.reduce((sum,component)=>sum+component.count,0),genericTotal=generic.reduce((sum,component)=>sum+component.count,0);
      const resolved=genericTotal>componentTotal?generic:components;
      return resolved.length?{...action,components:resolved}:action;
    });
  }
  function withStandardActions(actions) {
    const standards=[
      {name:'Dodge',raw:'Take the Dodge action.',standardAction:'dodge',attackBonus:null,saveDc:null,saveAbility:null,damageParts:[],conditions:['Dodging'],area:false},
      {name:'Dash',raw:'Take the Dash action.',standardAction:'dash',attackBonus:null,saveDc:null,saveAbility:null,damageParts:[],conditions:[],area:false}
    ];
    return [...actions,...standards.filter(standard=>!actions.some(action=>action.name.toLowerCase()===standard.name.toLowerCase()))];
  }
  function secureDie(sides) {
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) { const value = new Uint32Array(1); crypto.getRandomValues(value); return value[0] % sides + 1; }
    return Math.floor(Math.random() * sides) + 1;
  }
  function rollFormula(formula, roller = secureDie) {
    const normalized = String(formula || '').replace(/\s+/g, '').toLowerCase();
    if (/^\d+$/.test(normalized)) return { formula:normalized, rolls:[], modifier:Number(normalized), total:Number(normalized) };
    const dice = normalized.match(/^(\d*)d(\d+)([+-]\d+)?$/);
    if (!dice) return { formula:normalized || '—', rolls:[], modifier:0, total:null };
    const count = Math.max(1, Math.min(100, Number(dice[1]) || 1)), sides = Number(dice[2]), modifier = Number(dice[3] || 0);
    const rolls = Array.from({length:count}, () => roller(sides));
    return { formula:normalized, rolls, modifier, total:rolls.reduce((sum, value) => sum + value, modifier) };
  }
  function rollAction(action, roller = secureDie) {
    if(action.components?.length){
      const attacks=action.components.flatMap(component=>Array.from({length:component.count},()=>({action:component.action,rolled:rollAction(component.action,roller)})));
      return {attackRoll:null,damage:[],attacks};
    }
    const attackRoll=Number.isFinite(action.attackBonus) ? roller(20) : null;
    const damage=action.damageParts.map(part => {
      const roll=rollFormula(part.formula, roller);
      if(attackRoll===20){const dice=roll.formula.match(/^(\d*)d(\d+)(?:[+-]\d+)?$/);if(dice){const extra=Array.from({length:Number(dice[1])||1},()=>roller(Number(dice[2])));roll.rolls.push(...extra);roll.total+=extra.reduce((sum,value)=>sum+value,0);roll.critical=true;}}
      return { ...part, roll };
    });
    return { attackRoll, damage };
  }
  function actionDamageTotal(rolled,target) {
    if(rolled.attacks)return rolled.attacks.reduce((sum,strike)=>{
      const result=attackResult({action:strike.action,rolled:strike.rolled},target);
      return sum+(!result||result.hit?actionDamageTotal(strike.rolled,target):0);
    },0);
    return rolled.damage.reduce((sum, part) => sum + (Number(part.roll.total) || 0), 0);
  }
  function attackResult(plan, target) {
    if (plan.rolled.attackRoll == null) return null;
    const total = plan.rolled.attackRoll + (Number(plan.action.attackBonus) || 0), ac = Math.max(1, Number(target?.ac) || 10);
    return { total, ac, hit:plan.rolled.attackRoll !== 1 && (plan.rolled.attackRoll === 20 || total >= ac) };
  }
  function selectedMonsters() {
    if (typeof monsters === 'undefined' || typeof selectedMapTokenIds === 'undefined') return [];
    return monsters.filter(monster => selectedMapTokenIds.has(monster.id) && !monster.isplayer && !monster.isNpc && Number(monster.hp) > 0).sort((a,b) => Number(b.init)-Number(a.init) || a.name.localeCompare(b.name));
  }
  function playerTargets() { return typeof monsters === 'undefined' ? [] : monsters.filter(monster => monster.isplayer && Number(monster.hp) > 0); }
  function refreshSelection(selected = selectedMonsters()) {
    const next = selected.filter(monster => !monster.isplayer && !monster.isNpc && Number(monster.hp) > 0).sort((a,b) => Number(b.init)-Number(a.init) || a.name.localeCompare(b.name));
    const changed = next.map(monster=>monster.id).join('|') !== selectedActors.map(monster=>monster.id).join('|');
    selectedActors = next;
    const section = document.getElementById('mapGroupActionPlanner');
    if (!section) return;
    section.hidden = selectedActors.length < 2;
    const groupTab=document.getElementById('mapGroupActionsTab');
    if(groupTab){groupTab.disabled=selectedActors.length<2;if(groupTab.disabled&&groupTab.getAttribute('aria-selected')==='true')activateActionTab('receiver');}
    if (changed) {
      generationSerial++;plans = [];render();
      const status=document.getElementById('mapGroupActionStatus');if(status){status.textContent='';status.hidden=true;}
      if(groupTab?.getAttribute('aria-selected')==='true'&&!groupTab.disabled)void generate();
    }
  }
  async function generate() {
    const status = document.getElementById('mapGroupActionStatus'), rerollAll=document.getElementById('mapRerollGroupActions'), request=++generationSerial, actors=selectedMonsters(), nextPlans=[];
    selectedActors=actors;
    const players = playerTargets();
    if (!players.length) { if (status) {status.textContent = 'No living player tokens are available as targets.';status.hidden=false;} return; }
    if(rerollAll)rerollAll.disabled=true;
    if (status) {status.textContent = 'Planning actions and rolling monster dice…';status.hidden=false;}
    try {
      for (const actor of actors) {
        const definition = await loadMonsterDefinitionByName(actor.name), statblock = definition.monsterData;
        const recommendation = CpuActionAdvisor.recommend({ actor, statblock, enemies:players, allies:monsters.filter(item=>!item.isplayer&&item.hp>0), mapWidth, mapHeight, tokenSize:currentTokenSize });
        const actions = withStandardActions(resolveMultiattacks((statblock.actions || []).map(parseAction),statblock));
        let action = actions.find(item => item.name === recommendation.actionName);
        if (!action) action = { name:recommendation.actionName || 'No recommendation', raw:recommendation.reason || '', damageParts:[], attackBonus:null, saveDc:null, saveAbility:null, area:false };
        nextPlans.push({ actorId:actor.id, actor, statblock, actions, recommendation, actionName:action.name, action, targetId:recommendation.targetId || players[0].id, rolled:rollAction(action), applied:false });
      }
      if(request!==generationSerial)return;
      plans=nextPlans;
      if (status) {status.textContent = '';status.hidden=true;}
      if(rerollAll)rerollAll.disabled=false;
      render();
    } catch (error) {
      if(request!==generationSerial)return;
      console.error('Could not generate group actions:', error);
      if (status) {status.textContent = 'Could not generate every action. Try again.';status.hidden=false;}
      if(rerollAll)rerollAll.disabled=false;
    }
  }
  function formatDamage(plan) {
    if (!plan.rolled.damage.length) return 'No parsed damage dice';
    return plan.rolled.damage.map(part => `${part.roll.total} ${part.type}`).join(' + ');
  }
  function formatRollDetails(plan) {
    if(plan.rolled.attacks)return plan.rolled.attacks.map(strike=>`${strike.action.name}: ${formatRollDetails({rolled:strike.rolled})}`).join('; ');
    if (!plan.rolled.damage.length) return '';
    return plan.rolled.damage.map(part => {
      if (!part.roll.rolls.length) return `${part.roll.total} ${part.type}`;
      const modifier = part.roll.modifier ? ` ${part.roll.modifier < 0 ? '-' : '+'} ${Math.abs(part.roll.modifier)}` : '';
      return `${part.roll.critical?'CRIT ':''}${part.roll.formula}: ${part.roll.rolls.join(' + ')}${modifier} = ${part.roll.total} ${part.type}`;
    }).join(' + ');
  }
  function formatResult(plan,target) {
    if(plan.action.standardAction==='dodge')return 'DODGE — Apply Dodging to self';
    if(plan.action.standardAction==='dash')return 'DASH — movement only';
    if(plan.rolled.attacks){
      return plan.rolled.attacks.map(strike=>{
        const strikePlan={action:strike.action,rolled:strike.rolled,recommendation:plan.recommendation};
        return `${strike.action.name} ${formatResult(strikePlan,target)}`;
      }).join('\n');
    }
    const attack=attackResult(plan,target),damage=formatDamage(plan),conditions=plan.action.conditions?.join(', '),hasDamage=plan.rolled.damage.length>0;
    const effects=[hasDamage?damage:'',conditions?`${conditions}${plan.action.saveDc?' on failure':''}`:''].filter(Boolean).join(' · ');
    if(attack)return attack.hit?`HIT${effects?` — ${effects}`:''}`:'MISS';
    if(plan.action.saveDc)return `${abilityNames[plan.action.saveAbility]||plan.action.saveAbility?.toUpperCase()} DC ${plan.action.saveDc}${effects?` — ${effects}`:''}`;
    if(effects)return effects;
    return plan.recommendation.movement?.type&&!['none','hold'].includes(plan.recommendation.movement.type)?`${plan.recommendation.movement.type} ${plan.recommendation.movement.distance||''} ft.`:'DM adjudication';
  }
  function renderResultCell(cell,plan,target) {
    if(plan.rolled.attacks){
      plan.rolled.attacks.forEach((strike,index)=>{
        if(index)cell.append(document.createElement('br'));
        const strikePlan={action:strike.action,rolled:strike.rolled,recommendation:plan.recommendation},result=attackResult(strikePlan,target),line=document.createElement('span');
        line.className=result?.hit?'group-action-result-hit':'group-action-result-miss';line.textContent=`${strike.action.name} ${formatResult(strikePlan,target)}`;cell.append(line);
      });
      return;
    }
    const result=attackResult(plan,target),text=formatResult(plan,target);cell.textContent=text;
    if(result)cell.classList.add(result.hit?'group-action-result-hit':'group-action-result-miss');
    else if(text==='DM adjudication')cell.classList.add('group-action-result-warning');
  }
  function attackRolls(plan) {
    if(plan.rolled.attacks)return plan.rolled.attacks.map(strike=>strike.rolled.attackRoll).filter(Number.isFinite);
    return Number.isFinite(plan.rolled.attackRoll)?[plan.rolled.attackRoll]:[];
  }
  function resolvedDiceGroups(plan) {
    const strikeGroups=(action,rolled)=>{
      const groups=[];
      if(Number.isFinite(rolled.attackRoll))groups.push({sides:20,rolls:[rolled.attackRoll]});
      for(const part of rolled.damage||[]){
        const sides=Number(String(part.roll.formula||part.formula||'').match(/^\d*d(\d+)/i)?.[1]);
        if(sides&&part.roll.rolls?.length)groups.push({sides,rolls:[...part.roll.rolls]});
      }
      return groups;
    };
    if(plan.rolled.attacks)return plan.rolled.attacks.flatMap(strike=>strikeGroups(strike.action,strike.rolled));
    return strikeGroups(plan.action,plan.rolled);
  }
  function rollAppliedActionDice(plan,target) {
    const show=document.getElementById('mapGroupShowRolledDice')?.checked,share=document.getElementById('mapGroupShareDice')?.checked,groups=resolvedDiceGroups(plan);
    if((!show&&!share)||!groups.length||!window.diceRoller3d?.rollResolvedDice)return;
    const appearance=window.diceRoller3d.getCustomizationDetails?.('dm');
    const markup=`<div><b>${escape(plan.actor.name)} vs ${escape(target?.name||'target')}:</b> ${escape(formatResult(plan,target))}</div><div>${escape(formatRollDetails(plan))}</div>`;
    window.diceRoller3d.rollResolvedDice({id:`${Date.now()}-${Math.random().toString(36).slice(2)}`,createdAt:Date.now(),roller:'Dungeon Master',sourcePrefix:'dm',themeConfig:appearance?.themeConfig||window.diceRoller3d.getCustomization?.('dm'),appearanceSummary:appearance?.summary||'',markup},groups,share);
  }
  function escape(value) { return String(value ?? '').replace(/[&<>"']/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character])); }
  function render() {
    const body = document.getElementById('mapGroupActionRows'); if (!body) return;
    body.replaceChildren();
    const players = playerTargets();
    plans.forEach((plan, index) => {
      const target = players.find(player => player.id === plan.targetId), selfAction=Boolean(plan.action.standardAction), attack = attackResult(plan, target), damageTotal = actionDamageTotal(plan.rolled,target);
      const row = body.insertRow(); row.dataset.actorId = plan.actorId;
      const actorCell = row.insertCell(), actorLink=document.createElement('button'), nameParts=String(plan.actor.name||'Monster').trim().split(/\s+/), firstName=nameParts.shift(); actorCell.className='group-action-monster';
      actorLink.type='button';actorLink.className='group-action-monster-link';actorLink.title=`Zoom to ${plan.actor.name}`;actorLink.setAttribute('aria-label',`Zoom to ${plan.actor.name} on the map`);
      const actorPrefix=document.createElement('span');actorPrefix.className='group-action-monster-prefix';actorPrefix.textContent=`${Number(plan.actor.init) || 0}-${firstName}`;actorLink.append(actorPrefix);
      if(nameParts.length)actorLink.append(document.createTextNode(` ${nameParts.join(' ')}`));
      actorLink.addEventListener('click',()=>{if(typeof focusMapToken==='function')focusMapToken(plan.actorId);});actorCell.append(actorLink);
      const actionCell = row.insertCell(), actionSelect = document.createElement('select'); actionSelect.setAttribute('aria-label', `Action for ${plan.actor.name}`);
      const choices = plan.actions.some(action => action.name === plan.actionName) ? plan.actions : [plan.action,...plan.actions];
      choices.forEach(action => { const option=document.createElement('option'); option.value=action.name; option.textContent=action.name; option.selected=action.name===plan.actionName; actionSelect.append(option); });
      actionSelect.addEventListener('change', () => { plan.actionName=actionSelect.value; plan.action=plan.actions.find(action=>action.name===actionSelect.value)||plan.action; plan.rolled=rollAction(plan.action); plan.applied=false; render(); }); actionCell.append(actionSelect);
      actionSelect.title=plan.action.raw||plan.action.name;
      const targetCell = row.insertCell(), targetSelect = document.createElement('select'); targetSelect.setAttribute('aria-label', `Target for ${plan.actor.name}`);
      if(selfAction){const option=document.createElement('option');option.value=plan.actorId;option.textContent='Self';option.selected=true;targetSelect.append(option);targetSelect.disabled=true;}
      else players.forEach(player => { const option=document.createElement('option'); option.value=player.id; option.textContent=player.name; option.selected=player.id===plan.targetId; targetSelect.append(option); });
      targetSelect.addEventListener('change', () => { plan.targetId=targetSelect.value; plan.applied=false; render(); }); targetCell.append(targetSelect);
      const resultCell = row.insertCell(), rollDetails=formatRollDetails(plan);renderResultCell(resultCell,plan,target);
      const attackDetails=plan.rolled.attacks?.map(strike=>{const result=attackResult({action:strike.action,rolled:strike.rolled},target);return result?`${strike.action.name}: d20 ${strike.rolled.attackRoll} + ${strike.action.attackBonus} = ${result.total} vs AC ${result.ac}`:'';}).filter(Boolean).join('\n');
      resultCell.title=[attackDetails||attack?attackDetails||`d20 ${plan.rolled.attackRoll} + ${plan.action.attackBonus} = ${attack.total} vs AC ${attack.ac}`:plan.action.saveDc?'Player rolls this save.':'',rollDetails?`Damage roll: ${rollDetails}`:''].filter(Boolean).join('\n');
      const controls = row.insertCell(), reroll = document.createElement('button'), apply = document.createElement('button');controls.className='group-action-controls-cell';
      reroll.type='button'; reroll.className='group-action-reroll'; reroll.title='Reroll this row'; reroll.setAttribute('aria-label',`Reroll ${plan.actor.name}`); reroll.textContent='↻';
      reroll.addEventListener('click',()=>{plan.rolled=rollAction(plan.action);plan.applied=false;render();});
      apply.type='button'; apply.className='group-action-apply'; apply.innerHTML='<span aria-hidden="true">⚔</span>';
      apply.setAttribute('aria-label',plan.applied?`${plan.actor.name} action applied`:`Apply ${plan.actor.name} action`);
      const hasSuccessfulStrike=plan.rolled.attacks?.some(strike=>attackResult({action:strike.action,rolled:strike.rolled},target)?.hit),isDodge=plan.action.standardAction==='dodge';
      const mayApply = isDodge || (damageTotal > 0 && (hasSuccessfulStrike||!attack||attack.hit) && target);
      apply.disabled=!mayApply||plan.applied; apply.title=plan.applied?'Action applied':isDodge?'Apply Dodging to this monster':attack&&!attack.hit?'A missed attack has no damage to apply':plan.action.saveDc?'Apply the displayed raw damage only after the player resolves the save.':'Apply displayed raw damage';
      apply.addEventListener('click',async()=>{
        const generation=plan.actor._boardGeneration||boardSync.generation,changes=isDodge?new Map([[plan.actorId,{amount:0,apply:['Dodging'],remove:[]}]]) : new Map([[plan.targetId,{amount:damageTotal,apply:[],remove:[]}]]),succeeded=await runBoardWrite(boardSync.resolvedActions(changes,generation));
        if(succeeded){rollAppliedActionDice(plan,target);plan.applied=true;render();}
      });
      controls.append(reroll,apply);
      if(plan.action.area){const warning=document.createElement('small');warning.className='group-action-warning';warning.textContent='Area action: confirm every affected player manually.';resultCell.append(document.createElement('br'),warning);}
    });
  }
  function initialize() {
    document.getElementById('mapReceiverActionsTab')?.addEventListener('click',()=>activateActionTab('receiver'));
    document.getElementById('mapGroupActionsTab')?.addEventListener('click',()=>activateActionTab('group'));
    document.getElementById('mapRerollGroupActions')?.addEventListener('click',()=>void generate());
    refreshSelection();
  }
  return { initialize, activateActionTab, refreshSelection, generate, parseAction, parseDamageParts, resolveMultiattacks, withStandardActions, rollFormula, rollAction, actionDamageTotal, attackResult, formatResult, attackRolls, resolvedDiceGroups };
});
