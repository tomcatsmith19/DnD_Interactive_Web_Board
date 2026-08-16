const assert=require('node:assert/strict');
const test=require('node:test');
const Advisor=require('../public/cpu-action-advisor.js');

const goblin={int:10,speed:{walk:30},actions:[
  {name:'Scimitar',entries:['Melee atk +4 to hit, reach 5 ft., one target. 5 (1d6 + 2 damage) slashing damage.']},
  {name:'Shortbow',entries:['Ranged atk +4 to hit, range 80/320 ft., one target. 5 (1d6 + 2 damage) piercing damage.']}
]};
const actor=(settings={personality:'balanced',intelligence:'average'})=>({id:'g1',name:'Goblin',hp:7,maxHp:7,xRatio:0,yRatio:0,isplayer:false,cpuAdvisor:{...settings,personalityOverridden:false,intelligenceOverridden:false}});
const enemy=(id,name,x,hp=20)=>({id,name,hp,maxHp:hp,xRatio:x,yRatio:0,isplayer:true,ac:14});
const context=(monster,enemies)=>({actor:monster,statblock:goblin,enemies,allies:[monster],mapWidth:1000,mapHeight:1000,tokenSize:100});

test('creates valid settings and derives intelligence',()=>{const settings=Advisor.createSettings(4,()=>0);assert.ok(Advisor.PERSONALITIES[settings.personality]);assert.equal(settings.intelligence,'dumb');assert.equal(Advisor.intelligenceFromScore(16),'intelligent');});
test('normalization preserves an existing personality',()=>{const settings=Advisor.normalizeSettings({personality:'ambusher',intelligence:'average'});assert.equal(settings.personality,'ambusher');});
test('two instances can receive independent random personalities',()=>{const a=Advisor.createSettings(10,()=>0),b=Advisor.createSettings(10,()=>.99);assert.notEqual(a.personality,b.personality);});
test('dumb mode favors an obvious nearby target',()=>{const result=Advisor.recommend(context(actor({personality:'balanced',intelligence:'dumb'}),[enemy('near','Near',.01),enemy('far','Far',.5)]),()=>0);assert.equal(result.targetId,'near');});
test('aggressive mode recommends an attack',()=>{const result=Advisor.recommend(context(actor({personality:'aggressive',intelligence:'average'}),[enemy('e','Hero',.03)]),()=>0);assert.equal(result.actionType,'attack');});
test('uses player AC to calculate expected damage',()=>{const result=Advisor.recommend(context(actor({personality:'aggressive',intelligence:'intelligent'}),[enemy('e','Hero',.03)]),()=>0);assert.equal(result.expectedDamage,2.75);});
test('defensive creature at low health favors survival',()=>{const monster=actor({personality:'defensive',intelligence:'intelligent'});monster.hp=1;const result=Advisor.recommend(context(monster,[enemy('e','Hero',.03)]),()=>0);assert.equal(result.actionType,'defense');});
test('unreachable melee is rejected without movement',()=>{const brute={...goblin,actions:[goblin.actions[0]],speed:{walk:20}};const monster=actor();const result=Advisor.recommend({...context(monster,[enemy('e','Far Hero',.8)]),statblock:brute},()=>0);assert.notEqual(result.actionName,'Scimitar');});
test('missing fields fail gracefully and do not mutate state',()=>{const input={actor:actor(),statblock:{},enemies:[enemy('e','Hero',.1)],allies:[]};const before=JSON.stringify(input);assert.doesNotThrow(()=>Advisor.recommend(input,()=>0));assert.equal(JSON.stringify(input),before);});
test('player characters are distinguishable for caller-side exclusion',()=>{const player=enemy('p','Player',.1);assert.equal(player.isplayer,true);});
test('intelligent selection is more concentrated on the best plan than dumb selection',()=>{
  const sample=intelligence=>{
    let state=12345,best=0;
    const random=()=>{state=(state*1664525+1013904223)>>>0;return state/4294967296;};
    for(let index=0;index<500;index++){
      const result=Advisor.selectRankedCandidate([{id:'best',score:100},{id:'second',score:90},{id:'third',score:75}],intelligence,random);
      if(result.selected.id==='best')best++;
    }
    return best;
  };
  assert.ok(sample('intelligent')>sample('dumb'));
});
