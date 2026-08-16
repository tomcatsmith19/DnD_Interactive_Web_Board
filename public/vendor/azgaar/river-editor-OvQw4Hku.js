import{Ft as e,K as t,L as n,Sn as r,U as i,W as a,kt as o,ot as s,tt as c}from"./utils-BYaxf2yO.js";import{r as l,t as u}from"./tooltips-CSQuPvuv.js";import{Lt as d,Q as f,Yt as p,jt as m,kt as h}from"./index-DqeJMjPz.js";var g;function _(e){if(customization||a(`riverEditor`)&&e===g.attr(`id`))return;h(`.stable`),layerIsOn(`toggleRivers`)||toggleRivers(),i(`toggleCells`).dataset.forced=String(+!layerIsOn(`toggleCells`)),layerIsOn(`toggleCells`)||toggleCells(),g=r(`#${e}`).on(`click`,k),l(`Drag control points to change the river course. Click on point to remove it. Click on river to add additional control point. For major changes please create a new river instead`,!0),r(`#debug`).append(`g`).attr(`id`,`controlCells`),r(`#debug`).append(`g`).attr(`id`,`controlPoints`),v(),S();let{cells:t,points:n}=x();T(Rivers.getRiverPoints(t,n??null)),E(t),$(`#riverEditor`).dialog({title:`Edit River`,resizable:!1,position:{my:`left top`,at:`left+10 top+10`,of:`#map`},close:V})}function v(){m(`riverEditor`),i(`dialogs`).insertAdjacentHTML(`beforeend`,`<div id="riverEditor" class="dialog">
    <div id="riverBody" style="padding-bottom: 0.3em">
      <div>
        <div class="label" style="width: 4.8em">Name:</div>
        <span id="riverNameCulture" data-tip="Generate culture-specific name for the river" class="icon-book pointer"></span>
        <span id="riverNameRandom" data-tip="Generate random name for the river" class="icon-globe pointer"></span>
        <input id="riverName" data-tip="Type to rename the river" autocorrect="off" spellcheck="false" />
        <span id="riverNameSpeak" data-tip="Speak the name. You can change voice and language in options" class="speaker">🔊</span>
      </div>
      <div data-tip="Type to change river type (e.g. fork, creek, river, brook, stream)">
        <div class="label">Type:</div>
        <input id="riverType" autocorrect="off" spellcheck="false" />
      </div>
      <div data-tip="Select parent river">
        <div class="label">Mainstem:</div>
        <select id="riverMainstem"></select>
      </div>
      <div data-tip="River drainage basin (watershed)">
        <div class="label">Basin:</div>
        <input id="riverBasin" disabled />
      </div>
      <div data-tip="River discharge (flux power)">
        <div class="label">Discharge:</div>
        <input id="riverDischarge" disabled />
      </div>
      <div data-tip="River length in selected units">
        <div class="label">Length:</div>
        <input id="riverLength" disabled />
      </div>
      <div data-tip="River mouth width in selected units">
        <div class="label">Mouth width:</div>
        <input id="riverWidth" disabled />
      </div>
      <div data-tip="River source additional width. Default value is 0">
        <div class="label">Source width:</div>
        <input id="riverSourceWidth" type="number" min="0" max="3" step=".01" />
      </div>
      <div data-tip="River width multiplier. Default value is 1">
        <div class="label">Width modifier:</div>
        <input id="riverWidthFactor" type="number" min=".1" max="4" step=".1" />
      </div>
    </div>
    <div id="riverBottom">
      <button id="riverCreateSelectingCells" data-tip="Create a new river selecting river cells" class="icon-map-pin"></button>
      <button id="riverEditStyle" data-tip="Edit style for all rivers in Style Editor" class="icon-brush"></button>
      <button id="riverElevationProfile" data-tip="Show the elevation profile for the river" class="icon-chart-area"></button>
      <button id="riverLegend" data-tip="Edit free text notes (legend) for the river" class="icon-edit"></button>
      <button id="riverRemove" data-tip="Remove river" data-shortcut="Delete" class="icon-trash fastDelete"></button>
    </div>
  </div>`),i(`riverCreateSelectingCells`).addEventListener(`click`,y),i(`riverEditStyle`).addEventListener(`click`,b),i(`riverElevationProfile`).addEventListener(`click`,R),i(`riverLegend`).addEventListener(`click`,z),i(`riverRemove`).addEventListener(`click`,B),i(`riverName`).addEventListener(`input`,j),i(`riverNameSpeak`).addEventListener(`click`,()=>s(i(`riverName`).value)),i(`riverType`).addEventListener(`input`,M),i(`riverNameCulture`).addEventListener(`click`,N),i(`riverNameRandom`).addEventListener(`click`,P),i(`riverMainstem`).addEventListener(`change`,F),i(`riverSourceWidth`).addEventListener(`input`,I),i(`riverWidthFactor`).addEventListener(`input`,L)}function y(){d.RiverCreator.open()}function b(){editStyle(`rivers`)}function x(){let e=+g.attr(`id`).slice(5);return pack.rivers.find(t=>t.i===e)}function S(){let e=x();i(`riverName`).value=e.name,i(`riverType`).value=e.type;let t=i(`riverMainstem`);t.options.length=0;let n=e.parent||e.i;pack.rivers.slice().sort((e,t)=>e.name>t.name?1:-1).forEach(e=>{let r=new Option(e.name,String(e.i),!1,e.i===n);t.options.add(r)}),i(`riverBasin`).value=pack.rivers.find(t=>t.i===e.basin).name,i(`riverDischarge`).value=`${e.discharge} m³/s`,i(`riverSourceWidth`).value=String(e.sourceWidth),i(`riverWidthFactor`).value=String(e.widthFactor),C(e),w(e)}function C(t){t.length=e(g.node().getTotalLength()/2,2);let n=`${e(t.length*distanceScale)} ${distanceUnitInput.value}`;i(`riverLength`).value=n}function w(t){let{cells:n,discharge:r,widthFactor:a,sourceWidth:o}=t,s=Rivers.addMeandering(n);t.width=Rivers.getWidth(Rivers.getOffset({flux:r,pointIndex:s.length,widthFactor:a,startingWidth:o}));let c=`${e(t.width*distanceScale,3)} ${distanceUnitInput.value}`;i(`riverWidth`).value=c}function T(e){r(`#controlPoints`).selectAll(`circle`).data(e).join(`circle`).attr(`cx`,e=>e[0]).attr(`cy`,e=>e[1]).attr(`r`,.6).call(p().on(`start`,D)).on(`click`,A)}function E(e){let t=[...new Set(e)].filter(e=>pack.cells.i[e]);r(`#controlCells`).selectAll(`polygon`).data(t).join(`polygon`).attr(`points`,e=>n(e,pack))}function D(t){let{r:n,fl:r}=pack.cells,i=x(),{x:a,y:o}=t,s=findCell(a,o),c=null;t.on(`drag`,function(t){let{x:n,y:r}=t,a=findCell(n,r);c=s===a?null:a,this.setAttribute(`cx`,n),this.setAttribute(`cy`,r),this.__data__=[e(n,1),e(r,1)],O(),E(i.cells)}),t.on(`end`,()=>{if(c&&!n[c]){n[s]=0,n[c]=i.i;let e=r[s];r[s]=r[c],r[c]=e,O()}})}function O(){let e=x();e.points=r(`#controlPoints`).selectAll(`*`).data(),e.cells=e.points.map(([e,t])=>findCell(e,t));let t=Rivers.addMeandering(e.cells,e.points),n=Rivers.getRiverPath(t,e.widthFactor,e.sourceWidth);g.attr(`d`,n),C(e),f(),a(`elevationProfile`)&&R()}function k(n){let[i,a]=t(n,this),o=[e(i,1),e(a,1)],s=x();s.points||=r(`#controlPoints`).selectAll(`*`).data();let l=c(s.points,o,2);s.points.splice(l,0,o),T(s.points),O()}function A(){this.remove(),O();let{cells:e}=x();E(e)}function j(){x().name=this.value}function M(){x().type=this.value}function N(){let e=x();e.name=i(`riverName`).value=Rivers.getName(e.mouth)}function P(){let e=x();e&&(e.name=i(`riverName`).value=Names.getBase(o(Names.nameBases.length-1)))}function F(){let e=x();e.parent=+this.value,e.basin=pack.rivers.find(t=>t.i===e.parent).basin,i(`riverBasin`).value=pack.rivers.find(t=>t.i===e.basin).name}function I(){let e=x();e.sourceWidth=+this.value,w(e),O()}function L(){let e=x();e.widthFactor=+this.value,w(e),O()}function R(){let t=r(`#controlPoints`).selectAll(`*`).data().map(([e,t])=>findCell(e,t)),n=e(x().length*distanceScale);d.ElevationProfile.open(t,n,!0)}function z(){let e=g.attr(`id`),t=x();d.NotesEditor.open(e,`${t.name} ${t.type}`)}function B(){alertMessage.innerHTML=`Are you sure you want to remove the river and all its tributaries`,$(`#alert`).dialog({resizable:!1,width:`22em`,title:`Remove river and tributaries`,buttons:{Remove:function(){$(this).dialog(`close`);let e=+g.attr(`id`).slice(5);Rivers.remove(e),g.remove(),$(`#riverEditor`).dialog(`close`)},Cancel:function(){$(this).dialog(`close`)}}})}function V(){r(`#controlPoints`).remove(),r(`#controlCells`).remove(),g.on(`click`,null),u();let e=+i(`toggleCells`).dataset.forced;i(`toggleCells`).dataset.forced=`0`,e&&layerIsOn(`toggleCells`)&&toggleCells(),m(`riverEditor`)}var H={open:_};export{H as RiverEditor};