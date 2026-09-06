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
  assert.deepEqual(grid.children.map(folder=>folder.children[0].textContent),['General','Spells','Class Specific']);
  let names=[],category;
  const check=()=>{assert.deepEqual(names,names.slice().sort((a,b)=>a.localeCompare(b)));names=[];};
  for(const row of grid.children.flatMap(folder=>[folder.children[0],...folder.children[1].children])) {
    if(row.tag==='summary'){check();category=row.textContent;continue;}
    const [box,icon,label]=row.children;
    assert.equal(box.type,'checkbox'); assert.ok(icon.className.includes('condition-icon')); assert.equal(label.tag,'label');
    assert.notEqual(box.dataset.condition,'Mark');
    if(box.dataset.condition!=='Exhaustion') names.push(label.textContent);
    if(/^mark[123]$/.test(box.dataset.condition)) assert.equal(category,'General');
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

test('folders retain expansion state and toggles preserve mixed selections',()=>{
  const {actions,grid,elements,calls,panel}=fixture();
  actions.refresh([{conditions:['Shield']},{conditions:[]}]);
  const spells=grid.children[1]; assert.equal(spells.tag,'details'); assert.equal(spells.open,true);
  spells.open=false;
  actions.refresh([{conditions:['Shield']},{conditions:[]}]);
  assert.equal(spells.open,false);
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
