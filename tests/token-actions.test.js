const assert = require('node:assert/strict');
const test = require('node:test');
const fs = require('node:fs');
const vm = require('node:vm');
function fixture() {
  const elements = [];
  class Element {
    constructor(tag) { this.tag=tag; this.children=[]; this.dataset={}; this.style={}; this.classList={add:()=>{}}; this.listeners={}; elements.push(this); }
    append(...children) { children.forEach(child=>{ child.parent=this; this.children.push(child); }); }
    setAttribute(name,value) { this[name]=value; }
    addEventListener(name,fn) { this.listeners[name]=fn; }
    remove() { if(this.parent) this.parent.children=this.parent.children.filter(child=>child!==this); }
    querySelector(selector) { return this.children.find(child=>child.className===selector.slice(1)); }
    querySelectorAll() { return elements.filter(el=>el.type==='checkbox'); }
  }
  const grid=new Element('div'), panel=new Element('div'), calls=[]; panel.id='mapActionPanel';
  const context={module:{exports:{}},document:{createElement:tag=>new Element(tag),getElementById:id=>id==='mapConditionsGrid'?grid:elements.find(el=>el.id===id)},applyMapTokenAction:(...args)=>calls.push(args)};
  vm.runInNewContext(fs.readFileSync('public/token-actions.js','utf8'),context);
  return {actions:context.module.exports,grid,panel,elements,calls,Element};
}
test('categories, alphabetical entries, icon order and legacy Mark selections',()=>{
  const {actions,grid,calls}=fixture();
  actions.refresh([{conditions:['Mark','mark1','Exhaustion 2']},{conditions:["Hunter's Mark"]}]);
  assert.deepEqual(grid.children.map(folder=>folder.children[0].textContent),['General Conditions','Spell conditions','Class Specific Conditions']);
  let names=[],category;
  const check=()=>{assert.deepEqual(names,names.slice().sort((a,b)=>a.localeCompare(b)));names=[];};
  for(const row of grid.children.flatMap(folder=>[folder.children[0],...folder.children[1].children])) {
    if(row.tag==='summary'){check();category=row.textContent;continue;}
    const [box,icon,label]=row.children;
    assert.equal(box.type,'checkbox'); assert.ok(icon.className.includes('condition-icon')); assert.equal(label.tag,'label');
    assert.notEqual(box.dataset.condition,'Mark');
    if(box.dataset.condition!=='Exhaustion') names.push(label.textContent);
    if(/^mark[123]$/.test(box.dataset.condition)) assert.equal(category,'General Conditions');
    if(box.dataset.condition==="Hunter's Mark") { assert.equal(box.checked,true); box.checked=false;box.listeners.change();assert.equal(calls.at(-1)[0],'remove'); }
  }
  check();
});
test('size formats and centered scaled geometry',()=>{
  const {actions}=fixture();
  for(const [size,expected] of [['T',50],['Small',75],[['M'],100],['Large',200],[['H'],300],['Gargantuan',400],[undefined,100]]) {
    assert.equal(actions.tokenSize({size},100),expected);
    const left=500-expected/2; assert.equal(left+actions.tokenSize({size},100)/2,500);
  }
});
test('condition rings preserve aliases and levels, replace stale icons and handle many conditions',()=>{
  const {actions,Element}=fixture(), token=new Element('div');
  actions.renderTokenConditions({conditions:['Mark',"Hunter's Mark",'Exhaustion 4','mark2','Blade Ward'],size:'L'},token,100);
  const ring=token.children[0]; assert.equal(ring.children.length,4);
  assert.ok(ring.children[0].title.startsWith("Hunter's Mark:"));
  assert.equal(ring.children[1].children.at(-1).textContent,4);
  assert.equal(ring.children[2].children.at(-1).textContent,'2');
  actions.renderTokenConditions({conditions:['Prone']},token,100);assert.equal(token.children.length,1);assert.equal(token.children[0].children.length,1);
  actions.renderTokenConditions({conditions:[]},token,100);assert.equal(token.children.length,0);
  actions.renderTokenConditions({conditions:Array.from({length:30},(_,i)=>`Custom ${i}`),size:'T'},token,100);
  assert.equal(token.children[0].children.length,30);
  assert.ok(token.children[0].children.every(badge=>!badge.style.cssText.includes('NaN')));
});
test('legacy sizes resolve once per creature definition',async()=>{
  const {actions}=fixture();let loads=0;
  const loader=async()=>{loads++;return {monsterData:{size:['H']}};};
  await Promise.all([1,2].map(()=>new Promise(resolve=>actions.resolveSize({name:'Giant'},resolve,loader))));
  assert.equal(loads,1);assert.equal(actions.tokenSize({name:'Giant'},100),300);
});

test('condition search tolerates partial names and small typos',()=>{
  const {actions}=fixture();
  assert.equal(actions.fuzzyConditionMatch('paralized','Paralyzed'),true);
  assert.equal(actions.fuzzyConditionMatch('hun mark',"Hunter's Mark"),true);
  assert.equal(actions.fuzzyConditionMatch('poison','Poisoned'),true);
  assert.equal(actions.fuzzyConditionMatch('invisible','Blessed'),false);
});

test('advanced damage resolves individual saves before resistance and immunity',()=>{
  const {actions}=fixture();
  const data={dex:14,skills:{'dex save':'+5'},resist:['fire'],immune:['poison']};
  assert.equal(actions.damageProfile(data).saves.dex,5);
  assert.equal(actions.resolveAdvancedDamage(21,{}, {saveType:'dex',dc:15,successDamage:'half',damageType:'fire'},data,()=>10).amount,5);
  assert.equal(actions.resolveAdvancedDamage(21,{}, {saveType:'dex',dc:15,successDamage:'none',damageType:'fire'},data,()=>10).amount,0);
  assert.equal(actions.resolveAdvancedDamage(21,{}, {saveType:'dex',dc:20,failureDamage:'full',damageType:'fire'},data,()=>10).amount,10);
  assert.equal(actions.resolveAdvancedDamage(21,{}, {saveType:'dex',dc:20,failureDamage:'full',damageType:'poison'},data,()=>10).amount,0);
  assert.equal(actions.resolveAdvancedDamage(21,{}, {saveType:'dex',dc:20,failureDamage:'full',damageType:''},data,()=>10).amount,21);
});

test('save-linked conditions apply on failure, remove on success, and respect condition immunity',()=>{
  const {actions}=fixture(), definition={dex:12,conditionImmune:['poisoned']};
  const plain=value=>JSON.parse(JSON.stringify(value));
  const failed=actions.resolveAdvancedDamage(8,{}, {saveType:'dex',dc:15,onSuccess:'half'},definition,()=>5);
  assert.deepEqual(plain(actions.resolveSaveConditions(failed,['Prone','Poisoned'],['Restrained'])),{apply:['Prone'],remove:[],skippedImmune:['Poisoned']});
  const saved=actions.resolveAdvancedDamage(8,{}, {saveType:'dex',dc:10,onSuccess:'half'},definition,()=>15);
  assert.deepEqual(plain(actions.resolveSaveConditions(saved,['Prone'],['Restrained'])),{apply:[],remove:['Restrained'],skippedImmune:[]});
  const acMiss=actions.resolveAdvancedDamage(8,{ac:15}, {saveType:'ac'},definition,()=>1);
  assert.equal(acMiss.amount,4);
  assert.deepEqual(plain(actions.resolveSaveConditions(acMiss,['Prone'],['Restrained'])),{apply:[],remove:['Restrained'],skippedImmune:[]});
  const acHit=actions.resolveAdvancedDamage(8,{ac:15}, {saveType:'ac'},definition,()=>18);
  assert.equal(acHit.amount,8);
  assert.deepEqual(plain(actions.resolveSaveConditions(acHit,['Prone'],['Restrained'])),{apply:['Prone'],remove:[],skippedImmune:[]});
});

test('advanced action controls exist on both boards with the requested defaults',()=>{
  for(const page of ['dm','player']) {
    const html=fs.readFileSync(`public/${page}.html`,'utf8');
    assert.match(html,/id="mapAdvancedOptions"[\s\S]*?<summary>[\s\S]*?map-advanced-chevron[\s\S]*?<span>Advanced options<\/span>[\s\S]*?map-advanced-reset/);
    assert.match(html,/id="mapDamageType"[\s\S]*?<option value="">No damage type<\/option>/);
    assert.match(html,/id="mapSaveType"[\s\S]*?<option value="ac">AC<\/option>/);
    assert.match(html,/id="mapSaveDC"[^>]*value="10"/);
    assert.match(html,/id="mapFailureDamage"[\s\S]*?Full damage[\s\S]*?Half damage[\s\S]*?No damage/);
    assert.match(html,/id="mapSuccessDamage"[\s\S]*?Half damage[\s\S]*?Full damage[\s\S]*?No damage/);
    assert.match(html,/id="mapFailureConditionAction"[\s\S]*?Apply condition/);
    assert.match(html,/id="mapSuccessConditionAction"[\s\S]*?Remove condition/);
    assert.match(html,/id="mapActionResultsDialog"[\s\S]*?id="mapActionResultList"[^>]*aria-live="polite"/);
    assert.match(html,/id="mapShowRolledDice"[\s\S]*?id="mapShareActionDice"/);
    assert.equal((html.match(/class="map-action-d20-icon"/g)||[]).length,page==='dm'?4:2);
    assert.doesNotMatch(html,/mapShowActionSummary|Open result summary/);
    assert.doesNotMatch(html,/>Damage on (?:failed|successful) defense</);
    assert.match(html,/class="map-results-history"[\s\S]*?<svg/);
    assert.match(html,/class="map-advanced-apply"[^>]*applyMapTokenAction\('damage'\)/);
    assert.match(html,/applyMapTokenAction\('damage'\)">Apply<\/button>/);
    assert.match(html,/>Immediate conditions</);
  }
});

test('advanced dice preferences reuse the Dice tab d20 asset',()=>{
  const css=fs.readFileSync('public/token-actions.css','utf8');
  assert.match(css,/\.map-action-d20-icon[^}]*d20-black\.png/);
});

test('advanced action dice reuse resolved d20 values in the shared 3D roller',()=>{
  const dice=fs.readFileSync('public/dice-roller-3d.js','utf8'),boardUI=fs.readFileSync('public/board-ui.js','utf8');
  assert.match(dice,/rollResolved\(request, values, share = false\)/);
  assert.match(dice,/rollResolvedDice\(request, groups, share = false\)/);
  assert.match(dice,/rolls\.length \? \[\{sides:20,rolls\}\] : \[\]/);
  assert.match(dice,/return \{sides,count:rolls\.length,rolls\}/);
  assert.match(boardUI,/rollAdvancedActionDice\(advancedResults\)/);
  assert.match(boardUI,/diceRoller3d\.rollResolved/);
});

test('advanced reset clears effects and uses the requested safe success outcome',()=>{
  const boardUI=fs.readFileSync('public/board-ui.js','utf8');
  assert.match(boardUI,/mapDamageType:'', mapSaveType:'ac', mapSaveDC:'10', mapFailureDamage:'full', mapSuccessDamage:'none'/);
  assert.match(boardUI,/mapFailureConditionChips'\)\?\.replaceChildren\(\)/);
  assert.match(boardUI,/mapSuccessConditionChips'\)\?\.replaceChildren\(\)/);
});

test('folders retain expansion state and toggles preserve mixed selections',()=>{
  const {actions,grid,elements,calls,panel}=fixture();
  actions.refresh([{conditions:['Shield']},{conditions:[]}]);
  assert.ok(grid.children.every(folder=>folder.open===false));
  const spells=grid.children[1]; assert.equal(spells.tag,'details');
  spells.open=true;
  actions.refresh([{conditions:['Shield']},{conditions:[]}]);
  assert.equal(spells.open,true);
  const toggle=elements.find(el=>el.dataset.condition==='Shield');
  assert.equal(toggle.className,'condition-toggle'); assert.equal(toggle.indeterminate,true);
  toggle.checked=true;toggle.listeners.change();assert.deepEqual(calls.at(-1),['apply','Shield',1]);
  toggle.checked=false;toggle.listeners.change();assert.deepEqual(calls.at(-1),['remove','Shield',0]);
  let stopped=false;panel.listeners.wheel({stopPropagation(){stopped=true;}});assert.equal(stopped,true);
});
test('new spell assets exist and appear on tokens',()=>{
  const {actions,Element}=fixture(), token=new Element('div');
  actions.renderTokenConditions({conditions:['Shield','Blade Ward']},token,100);
  for(const badge of token.children[0].children) {
    const icon=badge.children[0];assert.equal(icon.tag,'img');assert.ok(fs.existsSync('public/'+decodeURIComponent(icon.src)));
  }
});

test('DM action panel includes a player-visibility eye beside the token name',()=>{
  const dm=fs.readFileSync('public/dm.html','utf8'),player=fs.readFileSync('public/player.html','utf8'),css=fs.readFileSync('public/token-actions.css','utf8'),boardUI=fs.readFileSync('public/board-ui.js','utf8');
  assert.match(dm,/class="map-action-target-group">[\s\S]*?id="mapTokenPlayerVisibility"[\s\S]*?id="mapActionTargets"/);
  assert.match(dm,/function toggleSelectedTokensPlayerVisibility\(\)[\s\S]*?hiddenFromPlayers/);
  assert.match(css,/\.token-player-visibility \{[^}]*width:34px/);
  assert.match(boardUI,/classList\.toggle\('is-hidden-from-players', boardPageRole === 'dm' && token\.hiddenFromPlayers === true\)/);
  assert.match(css,/\.monster-token\.is-hidden-from-players::after \{[^}]*data:image\/svg\+xml/);
  assert.match(dm,/token-actions\.css\?v=22/);
  assert.match(player,/token-actions\.css\?v=22/);
});
