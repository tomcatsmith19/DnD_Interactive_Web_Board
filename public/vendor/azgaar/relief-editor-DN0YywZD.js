import{En as e,Ft as t,K as n,Sn as r,U as i,Xt as a,j as o,w as s}from"./utils-BYaxf2yO.js";import{n as c,r as l,t as u}from"./tooltips-CSQuPvuv.js";import{C as d,Pt as f,S as p,Yt as m,ct as h,jt as g,kt as _,n as v,st as y,t as b,x}from"./index-DqeJMjPz.js";var S=40,C=null,w=()=>Object.entries(d).map(([e,{name:t}])=>`<option value="${e}">${t}</option>`).join(``),T=()=>Object.keys(d).map(e=>`<div data-type="${e}" style="display: none">${E(e)}</div>`).join(``),E=e=>p.filter(({set:t})=>t===d[e].base).flatMap(({type:t,variants:n,zoom:r=1})=>{let i=S*r,a=50-50*r,o=s(t.replace(/([A-Z])/g,` $1`).toLowerCase());return n.map(n=>{let r=x(t,n,e);return`<svg data-type="${r}" data-tip="Select ${o} icon">
          <use href="#${r}" x="${a}%" y="${a}%" width="${i}" height="${i}"></use>
        </svg>`})}).join(``);function D(e){customization||(_(`.stable`),layerIsOn(`toggleRelief`)||toggleRelief(),C=K(e),r(`#terrain`).call(m().on(`start`,k)).classed(`draggable`,!0),O(),A(),j(),M(),$(`#reliefEditor`).dialog({title:`Edit Relief Icons`,resizable:!1,width:`27em`,position:{my:`left top`,at:`left+10 top+10`,of:`#map`},close:q}))}function O(){g(`reliefEditor`);let e=`<div id="reliefEditor" class="dialog">
    <div id="reliefTools" data-tip="Select mode of operation">
      <div class="reliefEditorLabel">Mode:</div>
      <button id="reliefIndividual" data-tip="Edit individual selected icon" class="icon-info pressed"></button>
      <button id="reliefBulkAdd" data-tip="Place icons in a bulk" class="icon-brush"></button>
      <button id="reliefBulkRemove" data-tip="Remove icons in a bulk" class="icon-eraser"></button>
      <div style="margin-left: 4.6em">Set:</div>
      <select id="reliefEditorSet">${w()}</select>
    </div>
    <div id="reliefSizeDiv" data-tip="Set icon size for individual icon or for bulk placement">
      <div class="reliefEditorLabel">Size:</div>
      <input
        id="reliefSize"
        oninput="reliefSizeNumber.value = this.value"
        type="range"
        min="2"
        max="50"
        value="5"
      />
      <input id="reliefSizeNumber" oninput="reliefSize.value = this.value" type="number" min="2" value="5" />
    </div>
    <div id="reliefRadiusDiv" data-tip="Set brush radius for icons placement on deletion" style="display: none">
      <div class="reliefEditorLabel">Radius:</div>
      <input
        id="reliefRadius"
        oninput="reliefRadiusNumber.value = this.value"
        type="range"
        min="1"
        max="100"
        value="15"
      />
      <input id="reliefRadiusNumber" oninput="reliefRadius.value = this.value" type="number" min="1" value="15" />
    </div>
    <div id="reliefSpacingDiv" data-tip="Set spacing between relief icons" style="display: none">
      <div class="reliefEditorLabel">Spacing:</div>
      <input
        id="reliefSpacing"
        oninput="reliefSpacingNumber.value = this.value"
        type="range"
        min="2"
        max="20"
        value="5"
      />
      <input id="reliefSpacingNumber" oninput="reliefSpacing.value = this.value" type="number" min="2" value="5" />
    </div>
    <div id="reliefIconsDiv" data-tip="Select icon">
${T()}
      <svg id="reliefIconsSeletionAny" data-tip="Select any type of icons"><text x="50%" y="50%">Any</text></svg>
    </div>
    <div id="reliefBottom">
      <button id="reliefEditStyle" data-tip="Edit Relief Icons style in Style Editor" class="icon-adjust"></button>
      <button id="reliefCopy" data-tip="Copy selected relief icon" class="icon-clone"></button>
      <button id="reliefMoveFront" data-tip="Move selected relief icon to front" class="icon-level-up"></button>
      <button id="reliefMoveBack" data-tip="Move selected relief icon back" class="icon-level-down"></button>
      <button
        id="reliefRemove"
        data-tip="Remove selected relief icon or icon type"
        data-shortcut="Delete"
        class="icon-trash fastDelete"
      ></button>
    </div>
  </div>`;i(`dialogs`).insertAdjacentHTML(`beforeend`,e),i(`reliefIndividual`).addEventListener(`click`,N),i(`reliefBulkAdd`).addEventListener(`click`,P),i(`reliefBulkRemove`).addEventListener(`click`,R),i(`reliefSize`).addEventListener(`input`,B),i(`reliefSizeNumber`).addEventListener(`input`,B),i(`reliefEditorSet`).addEventListener(`change`,V),i(`reliefIconsDiv`).querySelectorAll(`svg`).forEach(e=>{e.addEventListener(`click`,H)}),i(`reliefEditStyle`).addEventListener(`click`,()=>editStyle(`terrain`)),i(`reliefCopy`).addEventListener(`click`,U),i(`reliefMoveFront`).addEventListener(`click`,()=>W(`front`)),i(`reliefMoveBack`).addEventListener(`click`,()=>W(`back`)),i(`reliefRemove`).addEventListener(`click`,G),V()}function k(e){let n=K(e.sourceEvent?.target);if(!n)return;let r=n.x-e.x,i=n.y-e.y;e.on(`drag`,e=>{n.x=t(r+e.x,2),n.y=t(i+e.y,2),h()})}function A(){i(`reliefTools`).querySelector(`button.pressed`)?i(`reliefBulkAdd`).classList.contains(`pressed`)?P():i(`reliefBulkRemove`).classList.contains(`pressed`)&&R():N()}function j(){if(!C)return;let e=i(`reliefIconsDiv`),t=e.querySelector(`svg[data-type='${C.icon}']`);if(!t)return;e.querySelectorAll(`svg.pressed`).forEach(e=>{e.classList.remove(`pressed`)}),t.classList.add(`pressed`),e.querySelectorAll(`div`).forEach(e=>{e.style.display=`none`});let n=t.parentNode;n.style.display=`block`,i(`reliefEditorSet`).value=n.dataset.type}function M(){C&&(i(`reliefSize`).value=i(`reliefSizeNumber`).value=String(t(C.s)))}function N(){i(`reliefTools`).querySelectorAll(`button.pressed`).forEach(e=>{e.classList.remove(`pressed`)}),i(`reliefIndividual`).classList.add(`pressed`),i(`reliefSizeDiv`).style.display=`block`,i(`reliefRadiusDiv`).style.display=`none`,i(`reliefSpacingDiv`).style.display=`none`,i(`reliefIconsSeletionAny`).style.display=`none`,v(),M(),f(),u()}function P(){i(`reliefTools`).querySelectorAll(`button.pressed`).forEach(e=>{e.classList.remove(`pressed`)}),i(`reliefBulkAdd`).classList.add(`pressed`),i(`reliefSizeDiv`).style.display=`block`,i(`reliefRadiusDiv`).style.display=`block`,i(`reliefSpacingDiv`).style.display=`block`,i(`reliefIconsSeletionAny`).style.display=`none`;let e=i(`reliefIconsDiv`);e.querySelector(`svg.pressed`)?.id===`reliefIconsSeletionAny`&&(i(`reliefIconsSeletionAny`).classList.remove(`pressed`),e.querySelector(`svg`)?.classList.add(`pressed`)),r(`#viewbox`).style(`cursor`,`crosshair`).call(m().on(`start`,I)).on(`touchmove mousemove`,F),l(`Drag to place relief icons within radius`,!0)}function F(e){c();let t=n(e,this),r=+i(`reliefRadiusNumber`).value;b(t[0],t[1],r)}function I(r){let o=i(`reliefIconsDiv`).querySelector(`svg.pressed`);if(!o){l(`Please select an icon`,!1,`error`);return}let s=o.dataset.type,c=+i(`reliefRadiusNumber`).value,u=+i(`reliefSpacingNumber`).value,d=+i(`reliefSizeNumber`).value,f=a(pack.relief.map(({x:e,y:t,s:n})=>[e+n/2,t+n/2]));r.on(`drag`,function(r){let i=n(r,this);b(i[0],i[1],c),e(Math.ceil(c/10)).forEach(()=>{let e=Math.PI*2*Math.random(),n=c*Math.random(),r=i[0]+n*Math.cos(e),a=i[1]+n*Math.sin(e);if(f.find(r,a,u)||pack.cells.h[findCell(r,a)]<20)return;let o=t(d/2*(Math.random()*.4+.8),2);f.add([r,a]),L({icon:s,x:t(r-o,2),y:t(a-o,2),s:t(o*2,2)})}),h()})}function L(e){let t=e.y+e.s,n=0,r=pack.relief.length;for(;n<r;){let e=n+r>>1;pack.relief[e].y+pack.relief[e].s<=t?n=e+1:r=e}pack.relief.splice(n,0,e)}function R(){i(`reliefTools`).querySelectorAll(`button.pressed`).forEach(e=>{e.classList.remove(`pressed`)}),i(`reliefBulkRemove`).classList.add(`pressed`),i(`reliefSizeDiv`).style.display=`none`,i(`reliefRadiusDiv`).style.display=`block`,i(`reliefSpacingDiv`).style.display=`none`,i(`reliefIconsSeletionAny`).style.display=`inline-block`,r(`#viewbox`).style(`cursor`,`crosshair`).call(m().on(`start`,z)).on(`touchmove mousemove`,F),l(`Drag to remove relief icons in radius`,!0)}function z(e){let t=i(`reliefIconsDiv`).querySelector(`svg.pressed`);if(!t){l(`Please select an icon`,!1,`error`);return}let r=+i(`reliefRadiusNumber`).value,s=t.dataset.type,c=a();for(let e of pack.relief)s&&e.icon!==s||c.add([e.x+e.s/2,e.y+e.s/2,e]);e.on(`drag`,function(e){let t=n(e,this);b(t[0],t[1],r);let i=o(t[0],t[1],r,c);if(!i.length)return;let a=new Set(i.map(e=>e[2]));for(let e of i)c.remove(e);pack.relief=pack.relief.filter(e=>!a.has(e)),C&&a.has(C)&&(C=null),h()})}function B(){if(!C||!i(`reliefIndividual`).classList.contains(`pressed`))return;let e=+i(`reliefSizeNumber`).value,n=(e-C.s)/2;C.s=e,C.x=t(C.x-n,2),C.y=t(C.y-n,2),h()}function V(){let e=i(`reliefEditorSet`).value,t=i(`reliefIconsDiv`);t.querySelectorAll(`div`).forEach(e=>{e.style.display=`none`}),t.querySelector(`div[data-type='${e}']`).style.display=`block`}function H(){this.classList.contains(`pressed`)||(i(`reliefIconsDiv`).querySelectorAll(`svg.pressed`).forEach(e=>{e.classList.remove(`pressed`)}),this.classList.add(`pressed`),i(`reliefIndividual`).classList.contains(`pressed`)&&C&&(C.icon=this.dataset.type,h()))}function U(){if(!C)return;let{x:e,y:t}=C;do e-=3,t-=3;while(pack.relief.some(n=>n.x===e&&n.y===t));let n={...C,x:e,y:t};pack.relief.push(n),C=n,h()}function W(e){if(!C)return;let t=pack.relief.indexOf(C);t<0||(pack.relief.splice(t,1),e===`front`?pack.relief.push(C):pack.relief.unshift(C),h())}function G(){let e=i(`reliefTools`).querySelector(`button.pressed`)?.id===`reliefIndividual`,t=i(`reliefIconsDiv`).querySelector(`svg.pressed`)?.dataset.type,n=e?new Set(C?[C]:[]):new Set(pack.relief.filter(e=>!t||e.icon===t));e?alertMessage.innerHTML=`Are you sure you want to remove the icon?`:alertMessage.innerHTML=t?`Are you sure you want to remove all ${t} icons (${n.size})?`:`Are you sure you want to remove all icons (${n.size})?`,$(`#alert`).dialog({resizable:!1,title:`Remove relief icons`,buttons:{Remove:function(){pack.relief=pack.relief.filter(e=>!n.has(e)),C=null,h(),$(this).dialog(`close`),$(`#reliefEditor`).dialog(`close`)},Cancel:function(){$(this).dialog(`close`)}}})}function K(e){if(e?.tagName!==`use`)return null;let t=e.dataset.id;return t&&y(t)||null}function q(){let e=!i(`reliefIndividual`).classList.contains(`pressed`);r(`#terrain`).on(`.drag`,null).classed(`draggable`,!1),C=null,v(),e&&f(),u(),$(`#reliefEditor`).dialog(`destroy`),i(`reliefEditor`).remove()}var J={open:D};export{J as ReliefEditor};