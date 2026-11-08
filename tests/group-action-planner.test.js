const assert=require('node:assert/strict');
const test=require('node:test');
const fs=require('node:fs');
const path=require('node:path');
const Planner=require('../public/group-action-planner');

test('parses attack bonuses and damage dice from existing monster action text',()=>{
  const action=Planner.parseAction({name:'Scimitar',entries:['Melee atk +4 to hit, reach 5 ft., one target. 5 (1d6 + 2 damage) slashing damage.']});
  assert.equal(action.attackBonus,4);
  assert.deepEqual(action.damageParts,[{average:5,formula:'1d6 + 2',type:'slashing'}]);
  const rolled=Planner.rollAction(action,()=>4);
  assert.equal(rolled.attackRoll,4);
  assert.equal(rolled.damage[0].roll.total,6);
});

test('parses save DCs without inventing player saving throw modifiers',()=>{
  const action=Planner.parseAction({name:'Flame Burst',entries:['Each creature must make a {@dc 15} Dexterity saving throw, taking 14 ({@damage 4d6}) fire damage on a failed save, or half as much damage on a successful one.']});
  assert.equal(action.saveDc,15);
  assert.equal(action.saveAbility,'dex');
  assert.equal(action.successHalf,true);
  assert.equal(action.area,true);
  assert.equal(action.attackBonus!==action.attackBonus,true);
});

test('parses action conditions for the condensed result',()=>{
  const action=Planner.parseAction({name:'Tentacle',entries:['Hit: 8 ({@damage 1d8 + 4}) bludgeoning damage, and the target is {@condition restrained}.']});
  assert.deepEqual(action.conditions,['Restrained']);
});

test('adds Dodge and Dash to every action list without duplicating existing actions',()=>{
  const claw=Planner.parseAction({name:'Claw',entries:['Melee atk +4 to hit. 5 (1d6 + 2 damage) slashing damage.']});
  const actions=Planner.withStandardActions([claw]);
  assert.deepEqual(actions.map(action=>action.name),['Claw','Dodge','Dash']);
  assert.deepEqual(actions.find(action=>action.name==='Dodge').conditions,['Dodging']);
  assert.equal(Planner.formatResult({action:actions[1],rolled:{attackRoll:null,damage:[]},recommendation:{}},null),'DODGE — Apply Dodging to self');
  assert.equal(Planner.formatResult({action:actions[2],rolled:{attackRoll:null,damage:[]},recommendation:{}},null),'DASH — movement only');
  assert.deepEqual(Planner.withStandardActions([{name:'Dodge'},{name:'Dash'}]).map(action=>action.name),['Dodge','Dash']);
});

test('attack outcomes use only the fixed roll, monster bonus, and player AC',()=>{
  const plan={action:{attackBonus:5},rolled:{attackRoll:12}};
  assert.deepEqual(Planner.attackResult(plan,{ac:16}),{total:17,ac:16,hit:true});
  plan.rolled.attackRoll=1;
  assert.equal(Planner.attackResult(plan,{ac:2}).hit,false);
  plan.rolled.attackRoll=20;
  assert.equal(Planner.attackResult(plan,{ac:40}).hit,true);
});

test('natural twenties pre-roll critical damage dice without doubling modifiers',()=>{
  const action=Planner.parseAction({name:'Claw',entries:['Melee atk +5 to hit. 6 (1d6 + 3 damage) slashing damage.']});
  const values=[20,4,5],rolled=Planner.rollAction(action,()=>values.shift());
  assert.equal(rolled.damage[0].roll.critical,true);
  assert.deepEqual(rolled.damage[0].roll.rolls,[4,5]);
  assert.equal(rolled.damage[0].roll.total,12);
});

test('condenses attack, damage, and conditions into one result',()=>{
  const action=Planner.parseAction({name:'Claw',entries:['Melee atk +5 to hit. 6 (1d6 + 3 damage) slashing damage, and the target is {@condition prone}.']});
  const hit={action,rolled:{attackRoll:12,damage:[{type:'slashing',roll:{total:7}}]},recommendation:{}};
  assert.equal(Planner.formatResult(hit,{ac:15}),'HIT — 7 slashing · Prone');
  hit.rolled.attackRoll=2;
  assert.equal(Planner.formatResult(hit,{ac:15}),'MISS');
});

test('condenses player saves, damage, and failed-save conditions into one result',()=>{
  const action=Planner.parseAction({name:'Gaze',entries:['The target must make a {@dc 14} Wisdom saving throw, taking 9 ({@damage 2d8}) psychic damage and becoming {@condition frightened} on a failed save.']});
  const plan={action,rolled:{attackRoll:null,damage:[{type:'psychic',roll:{total:9}}]},recommendation:{}};
  assert.equal(Planner.formatResult(plan,{ac:12}),'WIS DC 14 — 9 psychic · Frightened on failure');
});

test('multiattack rolls and reports every referenced attack separately',()=>{
  const actions=Planner.resolveMultiattacks([
    Planner.parseAction({name:'Multiattack',entries:['The gnoll makes three attacks: one with its bite and two with its shortsword.']}),
    Planner.parseAction({name:'Bite',entries:['Melee atk +4 to hit. 4 (1d4 + 2 damage) piercing damage.']}),
    Planner.parseAction({name:'Shortsword',entries:['Melee atk +4 to hit. 5 (1d6 + 2 damage) piercing damage.']})
  ]);
  const values=[15,2,5,3,18,4],rolled=Planner.rollAction(actions[0],()=>values.shift());
  const plan={action:actions[0],rolled,recommendation:{}};
  assert.equal(rolled.attacks.length,3);
  assert.equal(Planner.formatResult(plan,{ac:14}),'Bite HIT — 4 piercing\nShortsword MISS\nShortsword HIT — 6 piercing');
  assert.equal(Planner.actionDamageTotal(rolled,{ac:14}),10);
});

test('repeated-weapon multiattack and negative untyped attacks are rollable',()=>{
  const locathah=Planner.resolveMultiattacks([
    Planner.parseAction({name:'Multiattack',entries:['The locathah makes two melee attacks with its spear.']}),
    Planner.parseAction({name:'Spear',entries:['Melee atk +3 to hit. 4 (1d6 + 1 damage) piercing damage.']})
  ]);
  assert.equal(locathah[0].components[0].count,2);
  const spear=locathah[1];
  assert.deepEqual(spear.damageParts,[{average:4,formula:'1d6 + 1',type:'piercing'}]);
  const gun=Planner.parseAction({name:'Machine Gun',entries:['Ranged weapon attack: -1 to hit, hit (4d12), range (90/300) ft.']});
  assert.equal(gun.attackBonus,-1);
  assert.deepEqual(gun.damageParts,[{average:null,formula:'4d12',type:'damage'}]);
});

test('resolves Hobgoblin Captain weapon-first multiattack wording',()=>{
  const actions=Planner.resolveMultiattacks([
    Planner.parseAction({name:'Multiattack',entries:['The hobgoblin makes two greatsword attacks.']}),
    Planner.parseAction({name:'Greatsword',entries:['Melee atk +4 to hit. 9 (2d6 + 2 damage) slashing damage.']})
  ]);
  assert.equal(actions[0].components[0].action.name,'Greatsword');
  assert.equal(actions[0].components[0].count,2);
  assert.equal(Planner.rollAction(actions[0],()=>10).attacks.length,2);
});

test('resolves alternatives, limited attacks, sequential actions, and proficiency counts',()=>{
  const resolve=(entries,prof_bonus)=>Planner.resolveMultiattacks(entries.map(Planner.parseAction),{prof_bonus})[0].components.map(component=>[component.action.name,component.count]);
  assert.deepEqual(resolve([
    {name:'Multiattack',entries:['The elf makes two Longsword or Longbow attacks.']},
    {name:'Longsword',entries:['Melee atk +5 to hit. 7 (1d8 + 3 damage) slashing damage.']},
    {name:'Longbow',entries:['Ranged atk +5 to hit. 7 (1d8 + 3 damage) piercing damage.']}
  ]),[['Longsword',2]]);
  assert.deepEqual(resolve([
    {name:'Multiattack',entries:['The vampire makes two attacks, only one of which can be a bite attack.']},
    {name:'Bite',entries:['Melee atk +5 to hit. 6 (1d6 + 3 damage) piercing damage.']},
    {name:'Claws',entries:['Melee atk +5 to hit. 8 (2d4 + 3 damage) slashing damage.']}
  ]),[['Claws',2]]);
  assert.deepEqual(resolve([
    {name:'Multiattack',entries:['The widow uses Disintegrating Touch and Withering Gaze.']},
    {name:'Disintegrating Touch',entries:['Melee atk +10 to hit. 16 (3d6 + 6 damage) force damage.']},
    {name:'Withering Gaze',entries:['The target suffers 21 (6d6 damage) necrotic damage.']}
  ]),[['Disintegrating Touch',1],['Withering Gaze',1]]);
  assert.deepEqual(resolve([
    {name:'Multiattack',entries:['The defender makes a number of attacks equal to half its proficiency bonus (rounded down).']},
    {name:'Paper Cut',entries:['Melee atk +3 to hit. 7 (1d8 + 3 damage) slashing damage.']}
  ],6),[['Paper Cut',3]]);
});

test('all bundled multiattack formats resolve except a spell-level-dependent summon',()=>{
  const directory=path.join('public','data','monsters'),unresolved=[];let total=0;
  for(const file of fs.readdirSync(directory)){
    if(!file.endsWith('.json'))continue;
    const monster=JSON.parse(fs.readFileSync(path.join(directory,file),'utf8'));
    const actions=Planner.resolveMultiattacks((monster.actions||[]).map(Planner.parseAction),monster);
    for(const action of actions.filter(item=>/multiattack/i.test(item.name))){total++;if(!action.components?.length)unresolved.push(monster.name);}
  }
  assert.ok(total>2000);
  assert.deepEqual(unresolved,['Shadow Spirit']);
});

test('collects the pre-rolled d20s used by single and multiattacks',()=>{
  assert.deepEqual(Planner.attackRolls({rolled:{attackRoll:17,damage:[]}}),[17]);
  assert.deepEqual(Planner.attackRolls({rolled:{attackRoll:null,damage:[],attacks:[{rolled:{attackRoll:4}},{rolled:{attackRoll:19}}]}}),[4,19]);
});

test('replays each attack d20 and every pre-rolled damage die',()=>{
  const plan={action:{},rolled:{attackRoll:null,damage:[],attacks:[
    {action:{name:'Bite'},rolled:{attackRoll:14,damage:[{roll:{formula:'1d4+2',rolls:[3]}}]}},
    {action:{name:'Sword'},rolled:{attackRoll:20,damage:[{roll:{formula:'1d6+2',rolls:[4,5],critical:true}}]}}
  ]}};
  assert.deepEqual(Planner.resolvedDiceGroups(plan),[
    {sides:20,rolls:[14]},{sides:4,rolls:[3]},{sides:20,rolls:[20]},{sides:6,rolls:[4,5]}
  ]);
});

test('DM action panel owns a draft group planner sorted and applied one row at a time',()=>{
  const dm=fs.readFileSync('public/dm.html','utf8'),player=fs.readFileSync('public/player.html','utf8'),script=fs.readFileSync('public/group-action-planner.js','utf8');
  assert.match(dm,/id="mapGroupActionPlanner"[\s\S]*?id="mapGroupActionRows"/);
  assert.match(dm,/group-action-planner\.js\?v=5/);
  assert.doesNotMatch(player,/mapGroupActionPlanner|group-action-planner\.js/);
  assert.match(script,/sort\(\(a,b\) => Number\(b\.init\)-Number\(a\.init\)/);
  assert.match(script,/className='group-action-apply'/);
  assert.match(script,/apply:\[\],remove:\[\]/);
  assert.match(dm,/<th>Result<\/th>/);
  assert.doesNotMatch(dm,/Attack \/ Save|<th>Damage<\/th>/);
  assert.doesNotMatch(script,/group-action-reason/);
  assert.doesNotMatch(dm,/mapGroupActionCount|Recommendations use only player position/);
  assert.doesNotMatch(script,/Draft only\. Change targets|monsters selected/);
  assert.match(script,/className='group-action-monster'/);
  assert.match(dm,/<div id="mapGroupActionPlanner" class="map-group-action-planner" hidden>/);
  assert.doesNotMatch(dm,/group-action-summary|mapGenerateGroupActions|Plan &amp; Roll/);
  assert.match(dm,/<th>Monster<\/th><th>Action<\/th><th>Target<\/th><th>Result<\/th>/);
  assert.doesNotMatch(dm,/<th>Init<\/th>/);
  assert.match(script,/className='group-action-monster-link'/);
  assert.match(script,/focusMapToken\(plan\.actorId\)/);
  assert.match(script,/toggleDmLeftPanel\('initiative'\)/);
  assert.match(script,/showInitiativeSubtab\('statblock'\)/);
  assert.match(script,/openMonsterStatblock\(plan\.actorId\)/);
  assert.match(dm,/id="mapReceiverActionsTab"[\s\S]*?<span>Defenders<\/span><\/button>/);
  assert.match(dm,/id="mapGroupActionsTab"[\s\S]*?<span>Attackers<\/span><\/button>/);
  assert.match(dm,/id="mapReceiverActionsPane"[\s\S]*?id="mapGroupActionsPane"/);
  assert.match(script,/activateActionTab\('group'\)/);
  assert.match(script,/if\(showGroup&&!plans\.length\)void generate\(\)/);
  assert.match(dm,/id="mapGroupShowRolledDice"[\s\S]*?id="mapGroupShareDice"/);
  assert.match(dm,/id="mapGroupShowRolledDice"[\s\S]*?map-action-d20-icon[\s\S]*?id="mapGroupShareDice"[\s\S]*?map-action-d20-icon/);
  assert.match(dm,/id="mapRerollGroupActions"[\s\S]*?Reroll table/);
  assert.match(script,/mapRerollGroupActions'[\s\S]*?generate\(\)/);
  assert.match(script,/diceRoller3d\.rollResolvedDice/);
  assert.match(script,/group-action-result-hit/);
  assert.match(script,/group-action-result-miss/);
  assert.match(script,/group-action-result-warning/);
  assert.match(script,/className='group-action-controls-cell'/);
  assert.match(script,/className='group-action-apply'[\s\S]*?<span aria-hidden="true">⚔<\/span>/);
  assert.match(script,/option\.textContent='Self'/);
  assert.match(script,/apply:\['Dodging'\],remove:\[\]/);
});
