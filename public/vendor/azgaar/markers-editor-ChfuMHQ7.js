import{Ft as e,Sn as t,U as n,W as r}from"./utils-BYaxf2yO.js";import{t as i}from"./tooltips-CSQuPvuv.js";import{At as a,Lt as o,Mt as s,Yt as c,jt as l,kt as u,vt as d}from"./index-DqeJMjPz.js";import{t as f}from"./map-placement-xLBCnD0P.js";var p,m;function h(e,n){if(customization)return;u(`.stable`);let i=_(e,n);i&&([p,m]=i,t(p).raise().call(c().on(`start`,y)).classed(`draggable`,!0),r(`notesEditor`)&&o.NotesEditor.open(p.id,p.id),g(),b(),$(`#markerEditor`).dialog({title:`Edit Marker`,resizable:!1,position:{my:`left top`,at:`left+10 top+10`,of:`svg`,collision:`fit`},close:R}))}function g(){l(`markerEditor`),n(`dialogs`).insertAdjacentHTML(`beforeend`,`<div id="markerEditor" class="dialog">
    <div id="markerBody" style="padding-bottom: 0.3em">
      <div data-tip="Marker type. Style changes will apply to all markers of the same type. Leave blank if the marker is unique">
        <div class="label">Type:</div>
        <input id="markerType" style="width: 10.3em" />
      </div>
      <div data-tip="Marker icon" style="display: flex; align-items: center">
        <div class="label">Icon:</div>
        <div id="markerIcon" style="font-size: 1.5em; width: 3.7em">👑</div>
        <button id="markerIconSelect" style="width: 5em">select</button>
      </div>
      <div data-tip="Marker marker element and icon sizes in pixels">
        <div class="label">Size:</div>
        <input data-tip="Marker element size in pixels" id="markerSize" type="number" min="2" max="500" style="width: 5em" />
        <input data-tip="Marker icon sizes in pixels" id="markerIconSize" type="number" min="2" max="20" step="0.5" style="width: 5em" />
      </div>
      <div data-tip="Marker icon shift (by X and by Y axis), percent. Set to 50 to position icon in center">
        <div class="label">Icon shift:</div>
        <input id="markerIconShiftX" type="number" min="0" max="100" step="1" style="width: 5em" />
        <input id="markerIconShiftY" type="number" min="0" max="100" step="1" style="width: 5em" />
      </div>
      <div data-tip="Marker pin shape">
        <div class="label">Pin shape:</div>
        <select id="markerPin" style="width: 10.3em">
          <option value="bubble">Bubble</option>
          <option value="pin">Pin</option>
          <option value="square">Square</option>
          <option value="squarish">Squarish</option>
          <option value="diamond">Diamond</option>
          <option value="hex">Hex</option>
          <option value="hexy">Hexy</option>
          <option value="shieldy">Shieldy</option>
          <option value="shield">Shield</option>
          <option value="pentagon">Pentagon</option>
          <option value="heptagon">Heptagon</option>
          <option value="circle">Circle</option>
          <option value="no">No</option>
        </select>
      </div>
      <div data-tip="Pin fill and stroke colors">
        <div class="label">Pin colors:</div>
        <input id="markerFill" type="color" style="width: 5em; height: 1.6em" />
        <input id="markerStroke" type="color" style="width: 5em; height: 1.6em" />
      </div>
    </div>
    <div id="markerBottom">
      <button id="markerNotes" data-tip="Edit place legend (notes)" class="icon-edit"></button>
      <button id="markerRadius" data-tip="Show markers within a radius of this one" class="icon-dot-circled"></button>
      <button id="markerLock" class="icon-lock-open" onmouseover="showElementLockTip(event)"></button>
      <button id="markerAdd" data-tip="Add additional marker of that type" class="icon-plus"></button>
      <button id="markerRemove" data-tip="Remove the marker" data-shortcut="Delete" class="icon-trash fastDelete"></button>
    </div>
  </div>`),n(`markerType`).addEventListener(`change`,x),n(`markerIconSelect`).addEventListener(`click`,S),n(`markerIconSize`).addEventListener(`input`,C),n(`markerIconShiftX`).addEventListener(`input`,w),n(`markerIconShiftY`).addEventListener(`input`,T),n(`markerSize`).addEventListener(`input`,E),n(`markerPin`).addEventListener(`change`,D),n(`markerFill`).addEventListener(`input`,O),n(`markerStroke`).addEventListener(`input`,k),n(`markerNotes`).addEventListener(`click`,M),n(`markerRadius`).addEventListener(`click`,N),n(`markerLock`).addEventListener(`click`,P),n(`markerAdd`).addEventListener(`click`,F),n(`markerRemove`).addEventListener(`click`,I)}function _(e,t){if(t){let e=t.closest(`svg`);if(!e)return null;let n=pack.markers.find(({i:t})=>Number(e.id.slice(6))===t);return n?[e,n]:null}let r=n(`marker${e}`),i=pack.markers.find(({i:t})=>t===e);return r&&i?[r,i]:null}function v(){let e=m.type;return e?pack.markers.filter(({type:t})=>t===e):[m]}function y(t){let n=+this.getAttribute(`x`)-t.x,r=+this.getAttribute(`y`)-t.y;t.on(`drag`,function(e){this.setAttribute(`x`,String(n+e.x)),this.setAttribute(`y`,String(r+e.y))}),t.on(`end`,function(t){let{x:i,y:a}=t;this.setAttribute(`x`,String(e(n+i,2))),this.setAttribute(`y`,String(e(r+a,2)));let o=m.size||30,s=Math.max(e(o/5+24/scale,2),1);m.x=e(i+n+s/2,1),m.y=e(a+r+s,1),m.cell=findCell(m.x,m.y)})}function b(){let e=m;n(`markerIcon`).innerHTML=e.icon.startsWith(`http`)||e.icon.startsWith(`data:image`)?`<img src="${e.icon}" style="width: 1em; height: 1em;">`:e.icon,n(`markerType`).value=e.type||``,n(`markerIconSize`).value=String(e.px||12),n(`markerIconShiftX`).value=String(e.dx||50),n(`markerIconShiftY`).value=String(e.dy||50),n(`markerSize`).value=String(e.size||30),n(`markerPin`).value=e.pin||`bubble`,n(`markerFill`).value=e.fill||`#ffffff`,n(`markerStroke`).value=e.stroke||`#000000`,n(`markerLock`).className=e.lock?`icon-lock`:`icon-lock-open`}function x(){m.type=this.value}function S(){o.IconSelector.open(m.icon,e=>{let t=e.startsWith(`http`)||e.startsWith(`data:image`);n(`markerIcon`).innerHTML=t?`<img src="${e}" style="width: 1em; height: 1em;">`:e,v().forEach(t=>{t.icon=e,A(t)})})}function C(){let e=+this.value;v().forEach(t=>{t.px=e,A(t)})}function w(){let e=+this.value;v().forEach(t=>{t.dx=e,A(t)})}function T(){let e=+this.value;v().forEach(t=>{t.dy=e,A(t)})}function E(){let n=+this.value,r=+t(`#markers`).attr(`rescale`);v().forEach(t=>{t.size=n;let{i,x:a,y:o,hidden:s}=t,c=!s&&document.getElementById(`marker${i}`);if(!c)return;let l=r?Math.max(e(n/5+24/scale,2),1):n;c.setAttribute(`width`,String(l)),c.setAttribute(`height`,String(l)),c.setAttribute(`x`,String(e(a-l/2,1))),c.setAttribute(`y`,String(e(o-l,1)))})}function D(){let e=this.value;v().forEach(t=>{t.pin=e,j(t)})}function O(){let e=this.value;v().forEach(t=>{t.fill=e,j(t)})}function k(){let e=this.value;v().forEach(t=>{t.stroke=e,j(t)})}function A({i:e,hidden:t,icon:n,dx:r=50,dy:i=50,px:a=12}){let o=n.startsWith(`http`)||n.startsWith(`data:image`),s=!t&&document.querySelector(`#marker${e} > text`);s&&(s.innerHTML=o?``:n,s.setAttribute(`x`,`${r}%`),s.setAttribute(`y`,`${i}%`),s.setAttribute(`font-size`,`${a}px`));let c=!t&&document.querySelector(`#marker${e} > image`);c&&(c.setAttribute(`x`,`${r/2}%`),c.setAttribute(`y`,`${i/2}%`),c.setAttribute(`width`,`${a}px`),c.setAttribute(`height`,`${a}px`),c.setAttribute(`href`,o?n:``))}function j({i:e,hidden:t,pin:n=`bubble`,fill:r=`#fff`,stroke:i=`#000`}){let a=!t&&document.querySelector(`#marker${e} > g`);a&&(a.innerHTML=d(n,r,i))}function M(){let e=p.id;o.NotesEditor.open(e,e)}function N(){o.MarkersInRadius.open(m)}function P(){m.lock=!m.lock;let e=n(`markerLock`);e.classList.toggle(`icon-lock-open`),e.classList.toggle(`icon-lock`)}function F(){o.MarkerCreator.toggle(m)}function I(){a({title:`Remove marker`,message:`Are you sure you want to remove this marker? The action cannot be reverted`,confirm:`Remove`,onConfirm:L})}function L(){Markers.deleteMarker(m.i),p.remove(),$(`#markerEditor`).dialog(`close`),s()}function R(){t(p).on(`.drag`,null).classed(`draggable`,!1),n(`addMarker`).classList.contains(`pressed`)&&f(),i(),l(`markerEditor`)}var z={open:h};export{z as MarkersEditor};