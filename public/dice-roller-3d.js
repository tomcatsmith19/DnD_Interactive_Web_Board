import DiceBox from "./vendor/dice-box/dice-box.es.min.js";

const style = document.createElement('style');
style.textContent = `
  #sharedDiceStage { position:fixed; inset:0; z-index:5000; pointer-events:none; visibility:hidden; background:radial-gradient(ellipse at center,rgba(56,42,20,.18),rgba(0,0,0,.08)); }
  #sharedDiceStage.is-rolling { visibility:visible; }
  #sharedDiceStage canvas { width:100% !important; height:100% !important; }
  #sharedDicePopup { position:fixed; z-index:5100; left:50%; top:12%; width:min(520px,calc(100vw - 32px)); transform:translate(-50%,-25px); box-sizing:border-box; padding:16px 20px; color:white; background:rgba(18,18,18,.96); border:2px solid #FFD700; border-radius:12px; box-shadow:0 10px 40px #000; text-align:center; opacity:0; visibility:hidden; transition:opacity .2s ease,transform .2s ease; pointer-events:none; }
  #sharedDicePopup.is-visible { opacity:1; visibility:visible; transform:translate(-50%,0); }
  #sharedDicePopup h2 { margin:0 0 8px; color:#FFD700; font-family:'MedievalSharp',serif; }
  #sharedDicePopup .dice-popup-total { color:#FFD700; font-size:2rem; font-weight:bold; }
  #sharedDicePopup .dice-popup-groups { margin-top:8px; line-height:1.45; }
`;
document.head.appendChild(style);

const stage = document.createElement('div');
stage.id = 'sharedDiceStage';
stage.setAttribute('aria-hidden','true');
const popup = document.createElement('section');
popup.id = 'sharedDicePopup';
popup.setAttribute('role','status');
popup.setAttribute('aria-live','polite');
document.body.append(stage,popup);

let diceBox;
let diceReady;
let animationQueue = Promise.resolve();
let popupTimer;
let lastRollId = '';
const listenerStartedAt = Date.now();

function initializeDiceBox(){
  if(diceReady)return diceReady;
  diceBox = new DiceBox({
    container:'#sharedDiceStage',
    assetPath:'/assets/',
    origin:location.origin,
    theme:'default',
    themeColor:'#FFD700',
    scale:5,
    offscreen:true,
    enableShadows:true
  });
  diceReady = diceBox.init().catch(error=>{console.error('Could not initialize 3D dice:',error);diceReady=null;throw error;});
  return diceReady;
}

function safeMarkup(markup){
  const template=document.createElement('template');
  template.innerHTML=markup||'';
  template.content.querySelectorAll('script,style,iframe,object,embed').forEach(node=>node.remove());
  template.content.querySelectorAll('*').forEach(node=>[...node.attributes].forEach(attribute=>{if(attribute.name.startsWith('on'))node.removeAttribute(attribute.name);}));
  return template.innerHTML;
}

function showResult(payload,shared){
  clearTimeout(popupTimer);
  popup.innerHTML=`<h2>${shared?'Shared roll':'Dice roll'} — ${payload.roller||'Adventurer'}</h2><div class="dice-popup-total">${Number(payload.total)||0}</div><div class="dice-popup-groups">${safeMarkup(payload.markup)}</div>`;
  popup.classList.add('is-visible');
  popupTimer=setTimeout(()=>popup.classList.remove('is-visible'),5000);
}

function notationFor(payload){
  return payload.dice.map(die=>({qty:Math.min(100,Math.max(0,Number(die.count)||0)),sides:Number(die.sides)})).filter(die=>die.qty);
}

function completedPayload(request,rollResults){
  const grouped=request.dice.map((die,index)=>{
    const group=rollResults[index];
    const groupRolls=Array.isArray(group?.rolls)?group.rolls:rollResults.filter(result=>Number(result.groupId)===index);
    const rolls=groupRolls.map(result=>Number(result.value??result.result)).filter(Number.isFinite);
    return{sides:Number(die.sides),count:rolls.length,rolls};
  });
  const expectedDice=request.dice.reduce((sum,die)=>sum+Number(die.count||0),0);
  const completedDice=grouped.reduce((sum,group)=>sum+group.rolls.length,0);
  if(!completedDice||completedDice!==expectedDice)throw new Error(`Dice Box returned ${completedDice} of ${expectedDice} results.`);
  const subtotal=grouped.reduce((sum,group)=>sum+group.rolls.reduce((groupSum,value)=>groupSum+value,0),0);
  const modifier=Math.trunc(Number(request.modifier)||0);
  const total=subtotal+modifier;
  const groups=grouped.map(group=>`<div><b>${group.count}d${group.sides}:</b> ${group.rolls.join(', ')}</div>`).join('');
  const markup=`<div><strong>${total}</strong> total</div>${groups}<div>${subtotal} ${modifier<0?'−':'+'} ${Math.abs(modifier)} = ${total}</div>`;
  return{...request,createdAt:Date.now(),modifier,subtotal,total,markup};
}

function updateLocalOutput(payload){
  if(!payload.sourcePrefix)return;
  const output=document.getElementById(`${payload.sourcePrefix}DiceResult`);
  if(output)output.innerHTML=safeMarkup(payload.markup);
}

async function physicalRoll(payload){
  stage.classList.add('is-rolling');
  await initializeDiceBox();
  const theme=payload.theme||'default';
  const themeConfig=await diceBox.loadTheme(theme);
  const fallbackColors={default:'#FFD700',gemstone:'#6750d8',smooth:'#2e8555'};
  await diceBox.updateConfig({theme,themeColor:themeConfig?.themeColor||fallbackColors[theme]||'#2e8555'});
  return new Promise((resolve,reject)=>{
    const timeoutId=setTimeout(()=>reject(new Error('Dice Box roll timed out.')),15000);
    diceBox.onRollComplete=results=>{clearTimeout(timeoutId);resolve(results);};
    try{
      const rollPromise=diceBox.roll(notationFor(payload));
      rollPromise?.catch(error=>{clearTimeout(timeoutId);reject(error);});
    }catch(error){clearTimeout(timeoutId);reject(error);}
  });
}

async function runOwnRoll(request,share){
  try{
    const rollResults=await physicalRoll(request);
    const completed=completedPayload(request,rollResults);
    updateLocalOutput(completed);
    showResult(completed,false);
    if(share&&sharedRollRef){lastRollId=completed.id;await sharedRollRef.set(completed);}
    setTimeout(()=>{diceBox?.clear();stage.classList.remove('is-rolling');},3500);
  }catch(error){
    stage.classList.remove('is-rolling');
    const output=document.getElementById(`${request.sourcePrefix}DiceResult`);
    if(output)output.textContent='The 3D dice could not be rolled. Please try again.';
    console.error('3D dice roll failed:',error);
  }
}

async function runSharedRoll(payload){
  try{await physicalRoll(payload);}catch(error){console.error('Shared 3D dice animation failed:',error);}
  diceBox?.clear();
  stage.classList.remove('is-rolling');
  showResult(payload,true);
}

function queueRoll(task){
  animationQueue=animationQueue.then(task).catch(error=>console.error(error));
  return animationQueue;
}

const sharedRollRef=window.firebase?.firestore?.().collection('shared').doc('diceRoll');
if(sharedRollRef){
  sharedRollRef.onSnapshot(snapshot=>{
    if(!snapshot.exists)return;
    const payload=snapshot.data()||{};
    if(!payload.id||payload.id===lastRollId||Number(payload.createdAt)<listenerStartedAt-1000)return;
    lastRollId=payload.id;
    queueRoll(()=>runSharedRoll(payload));
  },error=>console.error('Could not receive shared dice rolls:',error));
}

window.diceRoller3d={
  roll(payload,share=false){
    return queueRoll(()=>runOwnRoll(payload,share));
  }
};

initializeDiceBox().catch(()=>{});
