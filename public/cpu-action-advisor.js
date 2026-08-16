(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.CpuActionAdvisor = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const PERSONALITIES = Object.freeze({
    balanced:'Balanced', aggressive:'Aggressive', defensive:'Defensive', cowardly:'Cowardly',
    protective:'Protective', controller:'Controller', ambusher:'Ambusher', packHunter:'Pack Hunter'
  });
  const INTELLIGENCE = Object.freeze({dumb:'Dumb', average:'Average', intelligent:'Intelligent'});
  const CONFIG = Object.freeze({
    personalityWeights:Object.freeze(Object.fromEntries(Object.keys(PERSONALITIES).map(key=>[key,1]))),
    nearBest:Object.freeze({dumb:.30,average:.15,intelligent:.05}),
    selection:Object.freeze({
      dumb:Object.freeze({power:.7,rankDecay:.12}),
      average:Object.freeze({power:1.8,rankDecay:.65}),
      intelligent:Object.freeze({power:4,rankDecay:1.8})
    }),
    base:Object.freeze({damage:5,kill:24,movement:-.22,unreachable:-100,survival:18,focus:10,isolation:7,coordination:9,control:12}),
    personality:Object.freeze({
      balanced:{},aggressive:{damage:1.45,kill:1.35,approach:12,dodge:-12,retreat:-15},
      defensive:{damage:.8,survival:1.55,dodge:18,disengage:15,retreat:10},
      cowardly:{damage:.72,survival:1.8,dodge:14,disengage:22,retreat:28},
      protective:{damage:.9,protect:22,coordination:1.25},controller:{damage:.8,control:1.7},
      ambusher:{damage:1.05,ranged:11,hide:20,isolation:1.5},packHunter:{damage:1.05,focus:1.6,coordination:1.7}
    })
  });

  const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));
  const number=value=>value===null||value===undefined||value===''?null:Number.isFinite(Number(value))?Number(value):null;
  const textOf=value=>Array.isArray(value)?value.map(textOf).join(' '):typeof value==='string'?value:value?.entries?textOf(value.entries):value?.items?textOf(value.items):'';
  function weightedChoice(weights=CONFIG.personalityWeights,random=Math.random){const entries=Object.entries(weights).filter(([,weight])=>weight>0);const total=entries.reduce((sum,[,weight])=>sum+weight,0);let pick=random()*total;for(const[key,weight]of entries){pick-=weight;if(pick<=0)return key;}return entries.at(-1)?.[0]||'balanced';}
  function intelligenceFromScore(score){const value=number(score);return value==null?'average':value<=5?'dumb':value>=14?'intelligent':'average';}
  function createSettings(intScore,random=Math.random){return{personality:weightedChoice(CONFIG.personalityWeights,random),intelligence:intelligenceFromScore(intScore),personalityOverridden:false,intelligenceOverridden:false};}
  function normalizeSettings(settings,intScore,random=Math.random){const created=createSettings(intScore,random);return{personality:PERSONALITIES[settings?.personality]?settings.personality:created.personality,intelligence:INTELLIGENCE[settings?.intelligence]?settings.intelligence:created.intelligence,personalityOverridden:Boolean(settings?.personalityOverridden),intelligenceOverridden:Boolean(settings?.intelligenceOverridden)};}
  function parseAction(entry){
    const raw=textOf(entry?.entries),name=String(entry?.name||'Action');
    const attackBonus=number(raw.match(/\+(\d+)\s+to hit/i)?.[1]);
    const reach=number(raw.match(/reach\s+(\d+)\s*ft/i)?.[1]);
    const rangeMatch=raw.match(/range\s+(\d+)(?:\s*\/\s*(\d+))?\s*ft/i);
    const average=number(raw.match(/(?:Hit:\s*)?(\d+)\s*\([^)]*(?:damage)?\)/i)?.[1]||raw.match(/(?:takes?|deals?)\s+(\d+)\s+[^.]*damage/i)?.[1]);
    const recharge=/recharge/i.test(name),unavailable=/recharge\s+after|used up|no uses/i.test(raw);
    const isAttack=attackBonus!=null||/\b(?:melee|ranged)\b.*\b(?:attack|atk)\b/i.test(raw);
    const isControl=/grapple|restrain|stun|prone|frighten|charm|blind|paraly|push|pull/i.test(raw);
    const isArea=/\b(?:cone|sphere|radius|line|cube|each creature)\b/i.test(raw);
    return{name,raw,type:isAttack?'attack':average!=null?'damage':isControl?'control':'other',attackBonus,reach:reach||null,range:rangeMatch?number(rangeMatch[1]):null,longRange:rangeMatch?number(rangeMatch[2]):null,averageDamage:average,control:isControl,area:isArea,recharge,available:!unavailable};
  }
  function parseActions(statblock={}){return(statblock.actions||[]).map(parseAction).filter(action=>action.available&&(action.type!=='other'||/multiattack/i.test(action.name)));}
  function distanceFeet(a,b,context){if(typeof context.distance==='function')return context.distance(a,b);const dx=(number(a.xRatio)||0)-(number(b.xRatio)||0),dy=(number(a.yRatio)||0)-(number(b.yRatio)||0);return Math.hypot(dx*(context.mapWidth||1),dy*(context.mapHeight||1))/Math.max(1,context.tokenSize||100)*5;}
  function hitExpected(action,target){if(action.averageDamage==null)return null;const ac=number(target.ac);if(action.attackBonus==null||ac==null)return null;return clamp((21+action.attackBonus-ac)/20,.05,.95)*action.averageDamage;}
  function candidateReason(candidate,personality){const pieces=[];if(candidate.target)pieces.push(`${candidate.target.name} is ${Math.round(candidate.distance)} ft. away`);if(candidate.expectedDamage!=null)pieces.push(`estimated damage is ${candidate.expectedDamage.toFixed(1)}`);if(candidate.killChance)pieces.push('the target is vulnerable to being defeated');if(candidate.focused)pieces.push('allies are already pressuring this target');if(candidate.action.control)pieces.push('it can hinder the opposition');pieces.push(`this fits a ${PERSONALITIES[personality].toLowerCase()} approach`);return pieces.join(', ').replace(/^./,letter=>letter.toUpperCase())+'.';}
  function selectRankedCandidate(candidates,intelligence='average',random=Math.random){
    const ranked=[...candidates].sort((a,b)=>b.score-a.score),best=ranked[0]?.score??0,margin=CONFIG.nearBest[intelligence]??CONFIG.nearBest.average;
    const pool=ranked.filter(candidate=>candidate.score>=best-Math.max(1,Math.abs(best))*margin),floor=Math.min(...pool.map(candidate=>candidate.score)),span=Math.max(1,best-floor),selection=CONFIG.selection[intelligence]||CONFIG.selection.average;
    const weights=Object.fromEntries(pool.map((candidate,index)=>{const normalized=clamp((candidate.score-floor+span*.08)/(span*1.08),.01,1);return[index,Math.pow(normalized,selection.power)*Math.exp(-index*selection.rankDecay)];}));
    return{selected:pool[Number(weightedChoice(weights,random))]||ranked[0],ranked};
  }
  function recommend(context,random=Math.random){
    const actor=context.actor,statblock=context.statblock||{};
    if(!actor)return{disabled:true,reason:'No acting monster is available.'};
    const settings=normalizeSettings(actor.cpuAdvisor,statblock.int,random);
    const enemies=(context.enemies||[]).filter(enemy=>enemy&&enemy.hp>0),allies=(context.allies||[]).filter(ally=>ally&&ally.hp>0&&ally.id!==actor.id);
    if(!actor||!enemies.length)return{disabled:true,reason:'No living enemy tokens with battlefield positions are available.'};
    const speed=number(typeof statblock.speed?.walk==='object'?statblock.speed.walk.number:statblock.speed?.walk)||30;
    const actions=parseActions(statblock),hpRatio=clamp((number(actor.hp)||0)/Math.max(1,number(actor.maxHp)||1),0,1),mods=CONFIG.personality[settings.personality]||{};
    const candidates=[];
    for(const target of enemies){
      const distance=distanceFeet(actor,target,context),nearAllies=allies.filter(ally=>distanceFeet(ally,target,context)<=10).length,focused=nearAllies>0,isolated=(context.enemies||[]).filter(enemy=>enemy.id!==target.id&&distanceFeet(enemy,target,context)<=15).length===0;
      for(const action of actions){
        const range=action.reach||action.range||5,needed=Math.max(0,distance-range),reachable=needed<=speed;
        if(!reachable)continue;
        const expectedDamage=hitExpected(action,target),killChance=expectedDamage!=null&&number(target.hp)!=null?clamp(expectedDamage/Math.max(1,target.hp),0,1):0;
        let score=20+(expectedDamage??2)*CONFIG.base.damage+killChance*CONFIG.base.kill+needed*CONFIG.base.movement;
        score+=(mods.damage?((expectedDamage??2)*CONFIG.base.damage*(mods.damage-1)):0)+(mods.kill?killChance*CONFIG.base.kill*(mods.kill-1):0);
        if(needed)score+=mods.approach||0;if(action.range)score+=mods.ranged||0;if(action.control)score+=CONFIG.base.control*(mods.control||1);if(focused)score+=CONFIG.base.focus*(mods.focus||1);if(isolated)score+=CONFIG.base.isolation*(mods.isolation||1);
        if(settings.intelligence==='dumb')score-=distance*.35+(focused?6:0);if(settings.intelligence==='intelligent')score+=(focused?CONFIG.base.coordination*(mods.coordination||1):0)+(killChance>.7?8:0);
        const movement=needed?{type:'approach',distance:Math.ceil(needed/5)*5,destination:null}:{type:'none',distance:0,destination:null};
        candidates.push({actionName:action.name,actionType:action.type,targetId:target.id,targetName:target.name,target,movement,expectedDamage,score,distance,killChance,focused,reason:'',warnings:distance>range?[]:[],action});
      }
    }
    const low=hpRatio<.4;
    candidates.push({actionName:'Dodge',actionType:'defense',targetName:null,movement:{type:'hold',distance:0,destination:null},expectedDamage:null,score:12+(1-hpRatio)*CONFIG.base.survival+(mods.dodge||0),reason:'Improve survival while remaining in position.',warnings:[]});
    candidates.push({actionName:'Disengage and retreat',actionType:'defense',targetName:null,movement:{type:'retreat',distance:speed,destination:null},expectedDamage:null,score:8+(low?18:0)+(mods.disengage||0)+(mods.retreat||0),reason:'Create distance without inviting an opportunity attack.',warnings:[]});
    if(/hide/i.test(textOf(statblock.traits)))candidates.push({actionName:'Hide',actionType:'utility',targetName:null,movement:{type:'seek cover',distance:0,destination:null},expectedDamage:null,score:10+(mods.hide||0),reason:'Use the creature’s documented ability to hide; the DM must confirm suitable concealment.',warnings:['Requires sufficient concealment or cover.']});
    candidates.forEach(candidate=>{if(candidate.target)candidate.reason=candidateReason(candidate,settings.personality);});
    const selectionResult=selectRankedCandidate(candidates,settings.intelligence,random),selected=selectionResult.selected,ranked=selectionResult.ranked;
    return{...selected,score:Math.round(selected.score),alternatives:ranked.filter(candidate=>candidate!==selected).slice(0,2).map(candidate=>({actionName:candidate.actionName,targetName:candidate.targetName,movement:candidate.movement,reason:candidate.reason,score:Math.round(candidate.score)})),settings};
  }
  return{PERSONALITIES,INTELLIGENCE,CONFIG,weightedChoice,intelligenceFromScore,createSettings,normalizeSettings,parseAction,parseActions,distanceFeet,selectRankedCandidate,recommend};
});
