import{E as e,K as t,Sn as n,U as r,Vt as i,ot as a}from"./utils-BYaxf2yO.js";import{n as o,r as s}from"./tooltips-CSQuPvuv.js";import{$ as c,At as l,Gt as u,Lt as d,Pt as f,Q as p,Yt as m,jt as h,kt as ee,rt as te,tt as ne}from"./index-DqeJMjPz.js";import{t as g}from"./label-arc-Bxz8zjQM.js";var _=``,v;function y(e,t){if(customization)return;ee(`.stable`),layerIsOn(`toggleLabels`)||toggleLabels();let r=document.querySelector(`#labels text[data-label-type='${e}'][data-id='${t}']`);if(!r)return;let i=c(e,t);i&&(v={...i},Q(r.id),n(`#viewbox`).on(`touchmove mousemove`,D),b(),$(`#labelEditor`).dialog({title:`Edit Label`,resizable:!1,width:`fit-content`,position:{my:`center top+10`,at:`bottom`,of:r,collision:`fit`},close:de}),O(),x(v.group),w(),S())}function b(){h(`labelEditor`),r(`dialogs`).insertAdjacentHTML(`beforeend`,`<div id="labelEditor" class="dialog">
      <button id="labelGroupShow" data-tip="Show the group selection" class="icon-tags"></button>
      <div id="labelGroupSection" style="display: none">
        <button id="labelGroupHide" data-tip="Hide the group selection" class="icon-tags"></button>
        <select id="labelGroupSelect" data-tip="Select a group for this label" style="width: 10em"></select>
        <button
          id="labelGroupsConfigure"
          data-tip="Open the Label Groups Configurator to create, edit and reorder groups"
          class="icon-cog"
        ></button>
      </div>
      <button id="labelTextShow" data-tip="Show the edit label text section" class="icon-pencil"></button>
      <div id="labelTextSection" style="display: none">
        <button id="labelTextHide" data-tip="Hide the edit label text section" class="icon-pencil"></button>
        <input
          id="labelText"
          data-tip='Type to change the label. Enter "|" to move to a new line'
          style="width: 12em"
        />
        <span id="labelTextSpeak" data-tip="Speak the name. You can change voice and language in options" class="speaker">🔊</span>
        <span id="labelTextRandom" data-tip="Generate random name" class="icon-shuffle pointer"></span>
      </div>
      <button id="labelEditStyle" data-tip="Edit label group style in Style Editor" class="icon-brush"></button>
      <button id="labelPathToggle"></button>
      <button id="labelSizeShow" data-tip="Show the font size section" class="icon-text-height"></button>
      <div id="labelSizeSection" style="display: none">
        <button id="labelSizeHide" data-tip="Hide the font size section" class="icon-text-height"></button>
        <span data-tip="Set relative size for the particular label">Size:</span>
        <input
          id="labelRelativeSize"
          data-tip="Set relative size for the particular label (% of group default)"
          type="number"
          min="30"
          max="300"
          step="1"
          style="width: 4.5em"
        />
      </div>
      <button id="labelOffsetShow" data-tip="Show the label offset section" class="icon-sliders"></button>
      <div id="labelOffsetSection" style="display: none">
        <button id="labelOffsetHide" data-tip="Hide the label offset section" class="icon-sliders"></button>
        <span data-tip="Set starting offset for the particular label">Offset:</span>
        <input
          id="labelStartOffset"
          data-tip="Set starting offset for the particular label (% along the path)"
          type="range"
          min="20"
          max="80"
          style="width: 8em"
        />
        <input
          id="labelStartOffsetValue"
          type="number"
          min="20"
          max="80"
          step="1"
          style="width: 3.5em"
          data-tip="Set starting offset numerically"
        />
      </div>
      <button id="labelLetterSpacingShow" data-tip="Show the letter spacing section" class="icon-text-width"></button>
      <div id="labelLetterSpacingSection" style="display: none">
        <button
          id="labelLetterSpacingHide"
          data-tip="Hide the letter spacing section"
          class="icon-text-width"
        ></button>
        <slider-input
          id="labelLetterSpacingSize"
          style="display: inline-block"
          data-tip="Set the letter spacing size for this label"
          min="0"
          max="20"
          step=".01"
          value="0"
        ></slider-input>
      </div>
      <button id="labelVisibility"></button>
      <button id="labelLegend" data-tip="Edit free text notes (legend) for this label" class="icon-edit"></button>
      <button id="labelReset" data-tip="Restore the default label" class="icon-arrows-cw"></button>
      <button
        id="labelRemoveSingle"
        data-tip="Remove the label"
        data-shortcut="Delete"
        class="icon-trash fastDelete"
      ></button>
    </div>`),r(`labelGroupShow`).addEventListener(`click`,F),r(`labelGroupHide`).addEventListener(`click`,I),r(`labelGroupSelect`).addEventListener(`change`,L),r(`labelGroupsConfigure`).addEventListener(`click`,()=>void d.LabelGroupsConfigurator.open()),r(`labelTextShow`).addEventListener(`click`,R),r(`labelTextHide`).addEventListener(`click`,z),r(`labelText`).addEventListener(`input`,B),r(`labelTextSpeak`).addEventListener(`click`,()=>a(r(`labelText`).value)),r(`labelTextRandom`).addEventListener(`click`,re),r(`labelEditStyle`).addEventListener(`click`,H),r(`labelSizeShow`).addEventListener(`click`,U),r(`labelSizeHide`).addEventListener(`click`,W),r(`labelOffsetShow`).addEventListener(`click`,G),r(`labelOffsetHide`).addEventListener(`click`,K),r(`labelStartOffset`).addEventListener(`input`,Y),r(`labelStartOffsetValue`).addEventListener(`input`,ie),r(`labelRelativeSize`).addEventListener(`input`,ae),r(`labelLetterSpacingShow`).addEventListener(`click`,q),r(`labelLetterSpacingHide`).addEventListener(`click`,J),r(`labelLetterSpacingSize`).addEventListener(`input`,oe),r(`labelPathToggle`).addEventListener(`click`,se),r(`labelVisibility`).addEventListener(`click`,ce),r(`labelLegend`).addEventListener(`click`,le),r(`labelReset`).addEventListener(`click`,ue),r(`labelRemoveSingle`).addEventListener(`click`,X)}function x(e){_=e,I();let t=r(`labelGroupSelect`);t.options.length=0;for(let n of options.labels.groups)t.options.add(new Option(n.name,n.name,!1,n.name===e))}function S(){let e=C(),t=!r(`labelEditor`).classList.contains(`section-open`);r(`labelOffsetShow`).style.display=t&&e?`inline-block`:`none`,r(`labelRemoveSingle`).style.display=t&&v.type===`added`?`inline-block`:`none`,r(`labelReset`).style.display=t&&Labels.hasOverride(v.type,v.entityId)?`inline-block`:`none`;let n=r(`labelPathToggle`);n.className=e?`icon-resize-horizontal`:`icon-bezier-curve`,n.dataset.tip=e?`Remove the label path, render the label as a straight text`:`Curve the label along a path`;let i=r(`labelVisibility`);i.className=v.hidden?`icon-eye-off`:`icon-eye`,i.dataset.tip=v.hidden?`Show the label`:`Hide the label. You can toggle it on later in Labels Overview`}function C(){return!!v.pathPoints?.length}function w(){let e=v.startOffset||50;r(`labelText`).value=v.text||``,r(`labelStartOffset`).value=String(e),r(`labelStartOffsetValue`).value=String(e),r(`labelRelativeSize`).value=String(v.fontSize??100),r(`labelLetterSpacingSize`).value=String(v.letterSpacing??0)}function T(){r(`labelEditor`).classList.add(`section-open`),document.querySelectorAll(`#labelEditor > button`).forEach(e=>{e.style.display=`none`})}function E(){r(`labelEditor`).classList.remove(`section-open`),document.querySelectorAll(`#labelEditor > button`).forEach(e=>{e.style.display=`inline-block`}),S()}function D(e){o();let t=e.target,n=t.parentNode;t.closest(`#${v.id}`)?s(`Drag to move the label`):n?.id===`controlPoints`&&(t.tagName===`circle`&&s(`Drag to move, click to delete the control point`),t.tagName===`path`&&s(`Click to add a control point`))}function O(){if(n(`#debug`).select(`#controlPoints`).remove(),!C())return;let e=v.dx||v.dy?`translate(${v.dx||0}, ${v.dy||0})`:null;n(`#debug`).append(`g`).attr(`id`,`controlPoints`).attr(`transform`,e).append(`path`).attr(`d`,te(v)).style(`stroke-width`,Math.max(2.2/scale,.2)).on(`click`,N),v.pathPoints?.forEach(k)}function k(e){n(`#debug`).select(`#controlPoints`).append(`circle`).attr(`cx`,e[0]).attr(`cy`,e[1]).attr(`r`,Math.max(3/scale,.35)).style(`stroke-width`,Math.max(1/scale,.15)).call(m().on(`drag`,A)).on(`click`,M)}function A(e){this.setAttribute(`cx`,e.x),this.setAttribute(`cy`,e.y),j()}function j(){let t=[];n(`#debug > #controlPoints`).selectAll(`circle`).each(function(){let e=rn(+this.getAttribute(`cx`),2),n=rn(+this.getAttribute(`cy`),2);t.push([e,n])});let r=e(i().curve(u)(t)||``);n(`#debug`).select(`#controlPoints > path`).attr(`d`,r),v.pathPoints=t,Z(),t.length||O()}function M(){this.remove(),j()}function N(e){let r=t(e,this),i=[];n(`#debug #controlPoints`).selectAll(`circle`).each(function(){let e=+this.getAttribute(`cx`),t=+this.getAttribute(`cy`);i.push((r[0]-e)**2+(r[1]-t)**2)});let a=i.length;if(i.length>1){let e=i.slice(0).sort((e,t)=>e-t),t=i.indexOf(e[0]),n=i.indexOf(e[1]);a=t<=n?t+1:n+1}let o=`:nth-child(${a+2})`;n(`#debug`).select(`#controlPoints`).insert(`circle`,o).attr(`cx`,r[0]).attr(`cy`,r[1]).attr(`r`,2.5).attr(`stroke-width`,.8).call(m().on(`drag`,A)).on(`click`,M),j()}function P(e){let t=(v.dx||0)-e.x,r=(v.dy||0)-e.y;e.on(`drag`,e=>{v.dx=rn(t+e.x,2),v.dy=rn(r+e.y,2);let i=`translate(${v.dx}, ${v.dy})`;this.setAttribute(`transform`,i),n(`#debug #controlPoints`).attr(`transform`,i)}),e.on(`end`,()=>Z())}function F(){T(),r(`labelGroupSection`).style.display=`inline-block`}function I(){E(),r(`labelGroupSection`).style.display=`none`}function L(){let e=this.value,t=options.labels.groups.find(t=>t.name===e)?.type,n=()=>{_=e,v.group=e,Z()};if(t===v.type)return void n();l({title:`Assign cross-type Label Group`,message:`Assign this ${v.type} label to the ${t} group "${e}"? It's better to avoid such cross-type assignment.`,confirm:`Assign`,onConfirm:n,onCancel:()=>{this.value=v.group}})}function R(){T(),r(`labelTextSection`).style.display=`inline-block`}function z(){E(),r(`labelTextSection`).style.display=`none`}function B(){let e=r(`labelText`).value;v.text=e,Z(),v.type===`state`&&s(`Use States Editor to change the actual state name, not just a label`,!1,`warn`),v.type===`province`&&s(`Use Provinces Editor to change the actual province name, not just a label`,!1,`warn`)}var V={burg:e=>Names.getCulture(pack.burgs[e.entityId].culture??0),state:e=>{let t=pack.states[e.entityId].culture;return Names.getState(Names.getCulture(t,4,7,``),t)},province:e=>{let t=pack.provinces[e.entityId];return Names.getState(t.name,pack.cells.culture[t.center])},added:e=>{let t=findCell(...e.anchor);return t?Names.getCulture(pack.cells.culture[t]):``},river:e=>{let t=findCell(...e.anchor);return t?Rivers.getName(t):``},route:e=>{let t=pack.routes.find(t=>t.i===e.entityId)?.points??[];return Routes.generateName({group:e.group,points:t})||`Unnamed route segment`}};function re(){r(`labelText`).value=V[v.type](v),B()}function H(){editStyle(`labels`,v.group)}function U(){T(),r(`labelSizeSection`).style.display=`inline-block`}function W(){E(),r(`labelSizeSection`).style.display=`none`}function G(){T(),r(`labelOffsetSection`).style.display=`inline-block`}function K(){E(),r(`labelOffsetSection`).style.display=`none`}function q(){T(),r(`labelLetterSpacingSection`).style.display=`inline-block`}function J(){E(),r(`labelLetterSpacingSection`).style.display=`none`}function Y(){if(!C())return;let e=this.value;r(`labelStartOffsetValue`).value=e,v.startOffset=+e,Z(),s(`Label offset: ${e}%`)}function ie(){if(!C())return;let e=Math.min(80,Math.max(20,+this.value));r(`labelStartOffset`).value=String(e),this.value=String(e),v.startOffset=e,Z(),s(`Label offset: ${e}%`)}function ae(){v.fontSize=+this.value,Z(),s(`Label relative size: ${this.value}%`)}function oe(){v.letterSpacing=+this.value,Z(),s(`Label letter-spacing size: ${this.value}px`)}function se(){v.pathPoints=C()?[]:g(v),Z(),O()}function ce(){v.hidden?delete v.hidden:v.hidden=!0,Z()}function le(){let e=v.type===`burg`?`burg${v.entityId}`:v.id;d.NotesEditor.open(e,v.text)}function X(){alertMessage.innerHTML=`Are you sure you want to remove the label?`,$(`#alert`).dialog({resizable:!1,title:`Remove label`,buttons:{Remove:function(){$(this).dialog(`close`),v.type===`added`&&(AddedLabels.remove(v.entityId),p(),$(`#labelEditor`).dialog(`close`))},Cancel:function(){$(this).dialog(`close`)}}})}function Z(){let e=Labels.getEntity(v.type,v.entityId);e&&(e.label=fe(),ne(v),Q(v.id),S())}function Q(e){n(`#${e}`).call(m().on(`start`,P)).classed(`draggable`,!0)}function ue(){let{type:e,entityId:t}=v;Labels.resetOverride(e,t),p(),v={...c(e,t)??v},Q(v.id),x(v.group),w(),S(),O()}function de(){n(`#debug`).select(`#controlPoints`).remove(),n(`#${v.id}`).on(`.drag`,null).classed(`draggable`,!1),f(),$(`#labelEditor`).dialog(`destroy`),r(`labelEditor`).remove()}function fe(){return{text:v.text,group:v.group,dx:v.dx,dy:v.dy,fontSize:v.fontSize,letterSpacing:v.letterSpacing,pathPoints:v.pathPoints??[],startOffset:v.startOffset,hidden:v.hidden}}var pe={open:y,getLastSelectedGroup:()=>_};export{pe as LabelsEditor};