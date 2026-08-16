import{A as e,Ft as t,K as n,L as r,Qt as i,R as a,S as o,Sn as s,T as c,U as l,Y as u,d,ht as f,i as p,r as m,x as ee}from"./utils-BYaxf2yO.js";import{t as h}from"./sin-DXK16t1M.js";import{n as g,r as _,t as v}from"./tooltips-CSQuPvuv.js";import{At as y,Ft as b,It as te,Lt as x,N as ne,Nt as S,P as re,Pt as C,Ut as ie,Yt as w,jt as T,kt as ae,n as E,t as D}from"./index-DqeJMjPz.js";import{t as O}from"./highlighting-CH83CMtN.js";import{a as k,i as oe,n as se,r as ce,t as le}from"./table-BDnPiVU4.js";var A=null,j=`religionsEditor`,M={my:`right top`,at:`right-10 top+10`,of:`svg`,collision:`fit`},N=[{key:`color`,width:`1.2em`,permanent:!0},{key:`name`,label:`Religion`,width:`14em`,permanent:!0,sortBy:e=>e.name||``,sortType:`alpha`},{key:`type`,label:`Type`,width:`6em`,defaultSort:`asc`,sortBy:e=>e.type||``,sortType:`alpha`},{key:`form`,label:`Form`,width:`7em`,mobileHidden:!0,sortBy:e=>e.form||``,sortType:`alpha`},{key:`deity`,label:`Deity`,width:`14em`,mobileHidden:!0,sortBy:e=>e.deity||``,sortType:`alpha`},{key:`area`,label:`Area`,width:`7em`,mobileHidden:!0,sortBy:e=>e.area||0},{key:`population`,label:`Population`,width:`6em`,sortBy:e=>(e.rural||0)*populationRate+(e.urban||0)*populationRate*urbanization},{key:`expansion`,label:`Expansion`,width:`5em`,hidden:!0,mobileHidden:!0,sortBy:e=>e.expansion||``,sortType:`alpha`},{key:`expansionism`,label:`Expansionism`,width:`5em`,hidden:!0,mobileHidden:!0,sortBy:e=>e.expansionism||0},{key:`actions`,width:`3.2em`,permanent:!0,align:`right`}];function P(){return pack.religions.filter(e=>!e.removed&&!(e.i&&!e.cells&&l(`religionsBody`).dataset.extinct!==`show`))}var F=se({getData:()=>re(j,P(),N),onUpdate:B});function I(){customization||(ae(`#${j}, .stable`),layerIsOn(`toggleReligions`)||toggleReligions(),layerIsOn(`toggleStates`)&&toggleStates(),layerIsOn(`toggleBiomes`)&&toggleBiomes(),layerIsOn(`toggleCultures`)&&toggleCultures(),layerIsOn(`toggleProvinces`)&&toggleProvinces(),L(),z(),q(),F.reset(),$(`#${j}`).dialog({title:`Religions Editor`,resizable:!1,width:`fit-content`,close:Fe,position:M}))}function L(){T(`religionsEditor`);let e=`<div id="religionsEditor" class="dialog stable editorDialog">
    <div id="religionsBody" class="table" data-type="absolute">${ce({dialogId:j,columns:N})}</div>

    <div id="religionsFooter" class="totalLine">
      <div data-tip="Total number of organized religions" style="margin-left: 12px">
        Organized:&nbsp;<span id="religionsOrganized">0</span>
      </div>
      <div data-tip="Total number of heresies" style="margin-left: 12px">
        Heresies:&nbsp;<span id="religionsHeresies">0</span>
      </div>
      <div data-tip="Total number of cults" style="margin-left: 12px">
        Cults:&nbsp;<span id="religionsCults">0</span>
      </div>
      <div data-tip="Total number of folk religions" style="margin-left: 12px">
        Folk:&nbsp;<span id="religionsFolk">0</span>
      </div>
      <div data-tip="Total land area" style="margin-left: 12px" data-col="area">
        Land Area:&nbsp;<span id="religionsFooterArea">0</span>
      </div>
      <div data-tip="Total number of believers (population)" style="margin-left: 12px" data-col="population">
        Believers:&nbsp;<span id="religionsFooterPopulation">0</span>
      </div>
    </div>

    <div id="religionsBottom" class="editorToolbar">
      <button id="religionsEditorRefresh" data-tip="Refresh the Editor" class="icon-cw"></button>
      <button id="religionsEditStyle" data-tip="Edit religions style in Style Editor" class="icon-adjust"></button>
      <button id="religionsLegend" data-tip="Toggle Legend box" class="icon-list-bullet"></button>
      <button id="religionsPercentage" data-tip="Toggle percentage / absolute values display mode" class="icon-percent"></button>
      <button id="religionsHeirarchy" data-tip="Show religions hierarchy tree" class="icon-sitemap"></button>
      <button id="religionsExtinct" data-tip="Show/hide extinct religions (religions without cells)" class="icon-eye-off"></button>

      <button id="religionsManually" data-tip="Manually re-assign religions" class="icon-brush"></button>
      <div id="religionsManuallyButtons" class="editorToolbarPanel" style="display: none">
        <div data-tip="Change brush size. Shortcuts: + or ] to increase; - or [ to decrease" style="margin-block: 0.3em;">
          <slider-input id="religionsBrush" min="1" max="100" value="15">Brush size:</slider-input>
        </div>
        <button id="religionsManuallyApply" data-tip="Apply assignment" class="icon-check"></button>
        <button id="religionsManuallyCancel" data-tip="Cancel assignment" class="icon-cancel"></button>
        <div data-tip="When enabled, only cells without religion can be painted" style="display: inline-block">
          <input id="religionsManuallyProtect" class="checkbox" type="checkbox" />
          <label for="religionsManuallyProtect" class="checkbox-label"><i>do not overwrite existing</i></label>
        </div>
      </div>
      <button id="religionsAdd" data-tip="Add a new religion. Hold Shift to add multiple" class="icon-plus"></button>
      <button id="religionsExport" data-tip="Download religions-related data" class="icon-download"></button>
      <button id="religionsRecalculate" data-tip="Recalculate religions based on current values of growth-related attributes" class="icon-retweet"></button>
      <span
        data-tip="Allow religion center, extent, and expansionism changes to take an immediate effect"
        class="editorToolbarPanel"
      >
        <input id="religionsAutoChange" class="checkbox" type="checkbox" />
        <label for="religionsAutoChange" class="checkbox-label"><i>auto-apply changes</i></label>
      </span>
    </div>
  </div>`;l(`dialogs`).insertAdjacentHTML(`beforeend`,e),ne(j,F.reset),O(j,({cellId:e})=>pack.cells.religion[e]),l(`religionsEditorRefresh`).addEventListener(`click`,R),le({dialogId:j,columns:N,onUpdate:()=>S(j,{width:`fit-content`,position:M})}),l(`religionsEditStyle`).addEventListener(`click`,()=>editStyle(`relig`)),l(`religionsLegend`).addEventListener(`click`,xe),l(`religionsPercentage`).addEventListener(`click`,J),l(`religionsHeirarchy`).addEventListener(`click`,Se),l(`religionsExtinct`).addEventListener(`click`,Ce),l(`religionsManually`).addEventListener(`click`,we),l(`religionsManuallyApply`).addEventListener(`click`,Ae),l(`religionsManuallyCancel`).addEventListener(`click`,()=>Y()),l(`religionsAdd`).addEventListener(`click`,je),l(`religionsExport`).addEventListener(`click`,Ne),l(`religionsRecalculate`).addEventListener(`click`,()=>Q(!0))}function R(){z(),F.refresh()}function z(){let{cells:e,religions:t,burgs:n}=pack;t.forEach(e=>{e.cells=e.area=e.rural=e.urban=0});for(let r of e.i){if(e.h[r]<20)continue;let i=e.religion[r];t[i].cells+=1,t[i].area+=e.area[r],t[i].rural+=e.pop[r];let a=e.burg[r];a&&(t[i].urban+=n[a].population)}}function B(e){let n=` ${p()}`,r=``,i=0,a=0;for(let n of e.all)i+=m(n.area??0),a+=t((n.rural??0)*populationRate+(n.urban??0)*populationRate*urbanization);for(let i of e.rows){let e=m(i.area??0),a=(i.rural??0)*populationRate,o=(i.urban??0)*populationRate*urbanization,s=t(a+o),c=`Believers: ${d(s)}; Rural areas: ${d(a)}; Urban areas: ${d(o)}. Click to change`;if(!i.i){r+=`<div
        class="states"
        data-id="${i.i}"
        data-name="${i.name}"
        data-color=""
        data-area="${e}"
        data-population="${s}"
        data-type=""
        data-form=""
        data-deity=""
        data-expansion=""
        data-expansionism=""
      >
        <svg width="9" height="9" class="placeholder" data-col="color"></svg>
        <input data-tip="Religion name. Click and type to change" class="religionName italic"
          value="${i.name}" autocorrect="off" spellcheck="false" data-col="name" />
        <select data-tip="Religion type" class="religionType placeholder" data-col="type">
          ${V(i.type)}
        </select>
        <input data-tip="Religion form" class="religionForm placeholder" value="" autocorrect="off" spellcheck="false" data-col="form" />
        <div data-col="deity">
          <span data-tip="Click to re-generate supreme deity" class="icon-arrows-cw placeholder"></span>
          <input data-tip="Religion supreme deity" class="religionDeity placeholder" value="" autocorrect="off" spellcheck="false" />
        </div>
        <div data-col="area">
          <span data-tip="Religion area" style="padding-right: 4px" class="icon-map-o"></span>
          <div data-tip="Religion area" class="religionArea">${d(e)+n}</div>
        </div>
        <div data-col="population">
          <span data-tip="${c}" class="icon-male"></span>
          <div data-tip="${c}" class="religionPopulation pointer">${d(s)}</div>
        </div>
        <div data-col="expansion">
          <span class="icon-resize-full-alt placeholder" style="padding-right: 2px"></span>
          <span class="religionExtent placeholder">n/a</span>
        </div>
        <div data-col="expansionism">
          <span class="icon-resize-full placeholder"></span>
          <input class="religionExpantion placeholder" disabled type="number" value="0" />
        </div>
        <div data-col="actions"></div>
      </div>`;continue}r+=`<div
      class="states"
      data-id=${i.i}
      data-name="${i.name}"
      data-color="${i.color}"
      data-area=${e}
      data-population=${s}
      data-type="${i.type}"
      data-form="${i.form}"
      data-deity="${i.deity||``}"
      data-expansion="${i.expansion}"
      data-expansionism="${i.expansionism}"
    >
      <fill-box fill="${i.color}" data-col="color"></fill-box>
      <input data-tip="Religion name. Click and type to change" class="religionName"
        value="${i.name}" autocorrect="off" spellcheck="false" data-col="name" />
      <select data-tip="Religion type" class="religionType" data-col="type">
        ${V(i.type)}
      </select>
      <input data-tip="Religion form" class="religionForm"
        value="${i.form}" autocorrect="off" spellcheck="false" data-col="form" />
      <div data-col="deity">
        <span data-tip="Click to re-generate supreme deity" class="icon-arrows-cw"></span>
        <input data-tip="Religion supreme deity" class="religionDeity"
          value="${i.deity||``}" autocorrect="off" spellcheck="false" />
      </div>
      <div data-col="area">
        <span data-tip="Religion area" style="padding-right: 4px" class="icon-map-o"></span>
        <div data-tip="Religion area" class="religionArea">${d(e)+n}</div>
      </div>
      <div data-col="population">
        <span data-tip="${c}" class="icon-male"></span>
        <div data-tip="${c}" class="religionPopulation pointer">${d(s)}</div>
      </div>
      ${H(i)}
      <div data-col="actions">
        <span data-tip="Locate the religion" class="icon-target"></span>
        <span data-tip="Lock this religion" class="icon-lock${i.lock?``:`-open`}"></span>
        <span data-tip="Remove religion" class="icon-trash-empty"></span>
      </div>
    </div>`}let o=l(`religionsBody`);o.querySelectorAll(`:scope > .states`).forEach(e=>{e.remove()}),o.insertAdjacentHTML(`beforeend`,r),customization===7&&A!==null&&l(`religionsBody`).querySelector(`div[data-id='${A}']`)?.classList.add(`selected`);let s=pack.religions.filter(e=>e.i&&!e.removed);l(`religionsOrganized`).innerHTML=String(s.filter(e=>e.type===`Organized`).length),l(`religionsHeresies`).innerHTML=String(s.filter(e=>e.type===`Heresy`).length),l(`religionsCults`).innerHTML=String(s.filter(e=>e.type===`Cult`).length),l(`religionsFolk`).innerHTML=String(s.filter(e=>e.type===`Folk`).length),l(`religionsFooterArea`).innerHTML=d(i)+n,l(`religionsFooterPopulation`).innerHTML=d(a),l(`religionsFooterArea`).dataset.area=String(i),l(`religionsFooterPopulation`).dataset.population=String(a),oe(l(`religionsFooter`),e,F.goto),l(`religionsBody`).querySelectorAll(`:scope > .states`).forEach(e=>{e.addEventListener(`mouseenter`,W),e.addEventListener(`mouseleave`,G),e.addEventListener(`click`,Te)}),l(`religionsBody`).querySelectorAll(`fill-box`).forEach(e=>void e.addEventListener(`click`,K)),l(`religionsBody`).querySelectorAll(`div > input.religionName`).forEach(e=>void e.addEventListener(`input`,ue)),l(`religionsBody`).querySelectorAll(`div > select.religionType`).forEach(e=>void e.addEventListener(`change`,de)),l(`religionsBody`).querySelectorAll(`div > input.religionForm`).forEach(e=>void e.addEventListener(`input`,fe)),l(`religionsBody`).querySelectorAll(`div > input.religionDeity`).forEach(e=>void e.addEventListener(`input`,pe)),l(`religionsBody`).querySelectorAll(`div > span.icon-arrows-cw`).forEach(e=>void e.addEventListener(`click`,me)),l(`religionsBody`).querySelectorAll(`div > div.religionPopulation`).forEach(e=>void e.addEventListener(`click`,he)),l(`religionsBody`).querySelectorAll(`div > select.religionExtent`).forEach(e=>void e.addEventListener(`change`,ge)),l(`religionsBody`).querySelectorAll(`div > input.religionExpantion`).forEach(e=>void e.addEventListener(`change`,_e)),l(`religionsBody`).querySelectorAll(`div > span.icon-trash-empty`).forEach(e=>void e.addEventListener(`click`,ve)),l(`religionsBody`).querySelectorAll(`div > span.icon-target`).forEach(e=>void e.addEventListener(`click`,Pe)),l(`religionsBody`).querySelectorAll(`div > span.icon-lock`).forEach(e=>void e.addEventListener(`click`,Z)),l(`religionsBody`).querySelectorAll(`div > span.icon-lock-open`).forEach(e=>void e.addEventListener(`click`,Z)),l(`religionsBody`).dataset.type===`percentage`&&(l(`religionsBody`).dataset.type=`absolute`,J()),S(j,{width:`fit-content`,position:M})}function V(e){let t=``;return[`Folk`,`Organized`,`Cult`,`Heresy`].forEach(n=>{t+=`<option ${e===n?`selected`:``} value="${n}">${n}</option>`}),t}function H(e){if(e.type===`Folk`){let e=`Folk religions are not competitive and do not expand. Initially they cover all cells of their parent culture, but get ousted by organized religions when they expand`;return`
      <div data-col="expansion">
        <span data-tip="${e}" class="icon-resize-full-alt" style="padding-right: 2px"></span>
        <span data-tip="${e}" class="religionExtent">culture</span>
      </div>
      <div data-col="expansionism">
        <span data-tip="${e}" class="icon-resize-full"></span>
        <input data-tip="${e}" class="religionExpantion" disabled type="number" value='0' />
      </div>`}return`
    <div data-col="expansion">
      <span data-tip="Potential religion extent" class="icon-resize-full-alt" style="padding-right: 2px"></span>
      <select data-tip="Potential religion extent" class="religionExtent">
        ${U(e.expansion)}
      </select>
    </div>
    <div data-col="expansionism">
      <span data-tip="Religion expansionism. Defines competitive size" class="icon-resize-full"></span>
      <input
        data-tip="Religion expansionism. Defines competitive size. Click to change, then click Recalculate to apply change"
        class="religionExpantion"
        type="number"
        min="0"
        max="99"
        step=".1"
        value=${e.expansionism}
      />
    </div>`}function U(e){let t=``;return[`global`,`state`,`culture`].forEach(n=>{t+=`<option ${e===n?`selected`:``} value="${n}">${n}</option>`}),t}var W=u(e=>{let t=Number(e.id||e.target.dataset.id),n=l(`religionsBody`).querySelector(`div[data-id='${t}']`);if(n&&n.classList.add(`active`),!layerIsOn(`toggleReligions`)||customization)return;let r=i().duration(2e3).ease(h);s(`#relig`).select(`#religion${t}`).raise().transition(r).attr(`stroke-width`,2.5).attr(`stroke`,`#d0240f`),s(`#debug`).select(`#religionsCenter${t}`).raise().transition(r).attr(`r`,3).attr(`stroke`,`#d0240f`)},200);function G(e){let t=Number(e.id||e.target.dataset.id),n=l(`religionsBody`).querySelector(`div[data-id='${t}']`);n&&n.classList.remove(`active`),s(`#relig`).select(`#religion${t}`).transition().attr(`stroke-width`,null).attr(`stroke`,null),s(`#debug`).select(`#religionsCenter${t}`).transition().attr(`r`,2).attr(`stroke`,null)}function K(){let e=this.getAttribute(`fill`)||`#ffffff`,t=+this.parentNode.dataset.id;x.ColorPicker.open(e,e=>{this.fill=e,pack.religions[t].color=e,s(`#relig`).select(`#religion${t}`).attr(`fill`,e),s(`#debug`).select(`#religionsCenter${t}`).attr(`fill`,e)})}function ue(){let e=+this.parentNode.dataset.id;this.parentNode.dataset.name=this.value;let t=pack.religions;t[e].name=this.value,t[e].code=f(this.value,t.flatMap(e=>e.code?[e.code]:[]))}function de(){let e=+this.parentNode.dataset.id;this.parentNode.dataset.type=this.value;let t=this.value;pack.religions[e].type=t}function fe(){let e=+this.parentNode.dataset.id;this.parentNode.dataset.form=this.value,pack.religions[e].form=this.value}function pe(){let e=this.closest(`.states`),t=+e.dataset.id;e.dataset.deity=this.value,pack.religions[t].deity=this.value}function me(){let e=this.closest(`.states`),t=+e.dataset.id,n=pack.religions[t].culture,r=Religions.getDeityName(n)??``;e.dataset.deity=r,pack.religions[t].deity=r,this.nextElementSibling.value=r}function he(){let e=+this.closest(`.states`).dataset.id,n=pack.religions[e];if(!n.cells){_(`Religion does not have any cells, cannot change population`,!1,`error`);return}let r=t((n.rural??0)*populationRate),i=t((n.urban??0)*populationRate*urbanization),a=r+i,o=e=>Number(e).toLocaleString(),s=pack.burgs.filter(t=>!t.removed&&pack.cells.religion[t.cell]===e);alertMessage.innerHTML=`<div>
    <i>All population of religion territory is considered believers of this religion. It means believers number change will directly affect population</i>
    <div style="margin: 0.5em 0">
      Rural: <input type="number" min="0" step="1" id="ruralPop" value=${r} style="width:6em" />
      Urban: <input type="number" min="0" step="1" id="urbanPop" value=${i} style="width:6em"
        ${s.length?``:`disabled`} />
    </div>
    <div>Total population: ${o(a)} ⇒ <span id="totalPop">${o(a)}</span>
      (<span id="totalPopPerc">100</span>%)
    </div>
  </div>`;let c=l(`ruralPop`),u=l(`urbanPop`),d=l(`totalPop`),f=l(`totalPopPerc`),p=()=>{let e=c.valueAsNumber+u.valueAsNumber;Number.isNaN(e)||(d.innerHTML=o(e),f.innerHTML=String(t(e/a*100)))};c.oninput=()=>p(),u.oninput=()=>p(),$(`#alert`).dialog({resizable:!1,title:`Change believers number`,width:`24em`,buttons:{Apply:function(){m(),$(this).dialog(`close`)},Cancel:function(){$(this).dialog(`close`)}},position:{my:`center`,at:`center`,of:`svg`}});function m(){let n=+c.value/r;if(Number.isFinite(n)&&n!==1&&pack.cells.i.filter(t=>pack.cells.religion[t]===e).forEach(e=>{pack.cells.pop[e]*=n}),!Number.isFinite(n)&&+c.value>0){let n=+c.value/populationRate,r=pack.cells.i.filter(t=>pack.cells.religion[t]===e),i=t(n/r.length);r.forEach(e=>{pack.cells.pop[e]=i})}let a=+u.value/i;if(Number.isFinite(a)&&a!==1&&s.forEach(e=>{e.population=t((e.population??0)*a,4)}),!Number.isFinite(a)&&+u.value>0){let e=t(+u.value/populationRate/urbanization/s.length,4);s.forEach(t=>{t.population=e})}layerIsOn(`togglePopulation`)&&drawPopulation(),R()}}function ge(){let e=this.closest(`.states`),t=+e.dataset.id;e.dataset.expansion=this.value,pack.religions[t].expansion=this.value,Q()}function _e(){let e=this.closest(`.states`),t=+e.dataset.id;e.dataset.expansionism=this.value,pack.religions[t].expansionism=+this.value,Q()}function ve(){if(customization)return;let e=+this.closest(`.states`).dataset.id;y({title:`Remove religion`,message:`Are you sure you want to remove the religion? <br>This action cannot be reverted`,confirm:`Remove`,onConfirm:()=>ye(e)})}function ye(e){s(`#relig`).select(`#religion${e}`).remove(),s(`#relig`).select(`#religion-gap${e}`).remove(),s(`#debug`).select(`#religionsCenter${e}`).remove(),pack.cells.religion.forEach((t,n)=>{t===e&&(pack.cells.religion[n]=0)}),pack.religions[e].removed=!0,pack.religions.filter(e=>e.i&&!e.removed).forEach(t=>{t.origins=(t.origins??[]).filter(t=>t!==e),t.origins.length||(t.origins=[0])}),R()}function q(){let e=s(`#debug`);e.select(`#religionCenters`).remove();let t=e.append(`g`).attr(`id`,`religionCenters`).attr(`stroke-width`,.8).attr(`stroke`,`#444444`).style(`cursor`,`move`),n=pack.religions.filter(e=>e.i&&e.center&&!e.removed);l(`religionsBody`).dataset.extinct!==`show`&&(n=n.filter(e=>(e.cells??0)>0)),t.selectAll(`circle`).data(n).enter().append(`circle`).attr(`id`,e=>`religionsCenter${e.i}`).attr(`data-id`,e=>e.i).attr(`r`,2).attr(`fill`,e=>e.color).attr(`cx`,e=>pack.cells.p[e.center][0]).attr(`cy`,e=>pack.cells.p[e.center][1]).on(`mouseenter`,(e,t)=>{_(`${t.name}. Drag to move the religion center`,!0),W(e)}).on(`mouseleave`,e=>{_(``,!0),G(e)}).call(w().on(`start`,be))}function be(e){let t=+this.dataset.id,n=c(this.getAttribute(`transform`)),r=+n[0]-e.x,i=+n[1]-e.y;function a(e){let{x:n,y:a}=e;this.setAttribute(`transform`,`translate(${r+n},${i+a})`);let o=findCell(n,a);o==null||pack.cells.h[o]<20||(pack.religions[t].center=o,Q())}let o=u(a,50);e.on(`drag`,o)}function xe(){if(s(`#legend`).selectAll(`*`).size()){b();return}te(`Religions`,pack.religions.filter(e=>e.i&&!e.removed&&e.area).sort((e,t)=>(t.area??0)-(e.area??0)).map(e=>[e.i,e.color,e.name]))}function J(){if(l(`religionsBody`).dataset.type===`absolute`){l(`religionsBody`).dataset.type=`percentage`;let e=+l(`religionsFooterArea`).dataset.area,n=+l(`religionsFooterPopulation`).dataset.population;l(`religionsBody`).querySelectorAll(`:scope > .states`).forEach(r=>{let{area:i,population:a}=r.dataset;r.querySelector(`.religionArea`).innerText=`${t(+i/e*100)}%`,r.querySelector(`.religionPopulation`).innerText=`${t(+a/n*100)}%`})}else l(`religionsBody`).dataset.type=`absolute`,F.refresh()}async function Se(){customization||x.HierarchyTree.open({type:`religions`,data:pack.religions,onNodeEnter:W,onNodeLeave:G,getDescription:e=>{let{name:n,type:r,form:i,rural:a,urban:o}=e,s=()=>n.includes(r)||i.includes(r)?``:r===`Folk`||r===`Organized`?`. ${r} religion`:`. ${r}`,c=i===r?``:`. ${i}`,l=a*populationRate+o*populationRate*urbanization,u=l>0?`${d(t(l))} people`:`Extinct`;return`${n}${s()}${c}. ${u}`},getShape:({type:e})=>{if(e===`Folk`)return`circle`;if(e===`Organized`)return`square`;if(e===`Cult`)return`hexagon`;if(e===`Heresy`)return`diamond`}})}function Ce(){l(`religionsBody`).dataset.extinct=l(`religionsBody`).dataset.extinct===`show`?`hide`:`show`,F.reset(),q()}function we(){layerIsOn(`toggleReligions`)||toggleReligions(),customization=7,s(`#relig`).append(`g`).attr(`id`,`temp`),document.querySelectorAll(`#religionsBottom > *`).forEach(e=>{e.style.display=`none`}),l(`religionsManuallyButtons`).style.display=`inline-block`,s(`#debug`).select(`#religionCenters`).style(`display`,`none`),k(j,N.filter(e=>!e.permanent).map(e=>e.key)),l(`religionsFooter`).style.display=`none`,l(`religionsBody`).querySelectorAll(`div > input, select, span, svg`).forEach(e=>{e.style.pointerEvents=`none`}),$(`#${j}`).dialog({position:M}),_(`Click on religion to select, drag the circle to change religion`,!0),s(`#viewbox`).style(`cursor`,`crosshair`).on(`click`,Ee).call(w().on(`start`,De)).on(`touchmove mousemove`,ke);let e=l(`religionsBody`).querySelector(`.states`);e&&(e.classList.add(`selected`),A=+e.dataset.id)}function Te(){if(customization!==7)return;let e=l(`religionsBody`).querySelector(`div.selected`);e&&e.classList.remove(`selected`),this.classList.add(`selected`),A=+this.dataset.id}function Ee(e){let t=n(e,this),r=findCell(t[0],t[1]);if(pack.cells.h[r]<20)return;let i=s(`#relig`).select(`#temp`).select(`polygon[data-cell='${r}']`),a=i.size()?+i.attr(`data-religion`):pack.cells.religion[r];l(`religionsBody`).querySelector(`div.selected`)?.classList.remove(`selected`),A=a,l(`religionsBody`).querySelector(`div[data-id='${a}']`)?.classList.add(`selected`)}function De(t){let r=+l(`religionsBrush`).value;t.on(`drag`,t=>{if(!t.dx&&!t.dy)return;let[i,o]=n(t,this);D(i,o,r);let s=(r>5?e(i,o,r,pack):[findCell(i,o,r)]).filter(e=>e!==void 0&&a(e,pack));s&&Oe(s)})}function Oe(e){if(A===null)return;let t=s(`#relig`).select(`#temp`),n=A,i=pack.religions[n].color||`#ffffff`,a=document.getElementById(`religionsManuallyProtect`)?.checked;e.forEach(e=>{let o=t.select(`polygon[data-cell='${e}']`),s=o.size()?+o.attr(`data-religion`):pack.cells.religion[e];n!==s&&(a&&s||(o.size()?o.attr(`data-religion`,n).attr(`fill`,i):t.append(`polygon`).attr(`data-cell`,e).attr(`data-religion`,n).attr(`points`,r(e,pack)).attr(`fill`,i)))})}function ke(e){g();let[t,r]=n(e,this);D(t,r,+l(`religionsBrush`).value)}function Ae(){let e=s(`#relig`).select(`#temp`).selectAll(`polygon`);e.each(function(){let e=+this.dataset.cell,t=+this.dataset.religion;pack.cells.religion[e]=t}),e.size()&&(drawReligions(),R(),q()),Y()}function Y(e){customization=0,s(`#relig`).select(`#temp`).remove(),E(),document.querySelectorAll(`#religionsBottom > *`).forEach(e=>{e.style.display=`inline-block`}),l(`religionsManuallyButtons`).style.display=`none`,k(j,[]),l(`religionsFooter`).style.display=`block`,l(`religionsBody`).querySelectorAll(`div > input, select, span, svg`).forEach(e=>{e.style.removeProperty(`pointer-events`)}),e||$(`#${j}`).dialog({position:M}),s(`#debug`).select(`#religionCenters`).style(`display`,null),C(),v();let t=l(`religionsBody`).querySelector(`div.selected`);t&&t.classList.remove(`selected`),A=null}function je(){if(this.classList.contains(`pressed`)){X();return}customization=8,this.classList.add(`pressed`),_(`Click on the map to add a new religion`,!0),s(`#viewbox`).style(`cursor`,`crosshair`).on(`click`,Me),l(`religionsBody`).querySelectorAll(`div > input, select, span, svg`).forEach(e=>{e.style.pointerEvents=`none`})}function X(){customization=0,C(),v(),l(`religionsBody`).querySelectorAll(`div > input, select, span, svg`).forEach(e=>{e.style.removeProperty(`pointer-events`)});let e=l(`religionsAdd`);e.classList.contains(`pressed`)&&e.classList.remove(`pressed`)}function Me(e){let[t,r]=n(e,this),i=findCell(t,r);if(pack.cells.h[i]<20){_(`You cannot place religion center into the water. Please click on a land cell`,!1,`error`);return}if(pack.religions.some(e=>!e.removed&&e.center===i)){_(`This cell is already a religion center. Please select a different cell`,!1,`error`);return}e.shiftKey===!1&&X(),Religions.add(i),drawReligions(),R(),q()}function Ne(){let e=`Id,Name,Color,Type,Form,Supreme Deity,Area ${p(`2`)},Believers,Origins,Potential,Expansionism`,n=F.view().all.map(e=>{let n=m(e.area??0),r=t((e.rural??0)*populationRate+(e.urban??0)*populationRate*urbanization),i=`"${e.deity||``}"`,a=`"${(e.origins??[]).filter(e=>!!e).map(e=>pack.religions[e].name).join(`, `)}"`;return[e.i,e.name,e.color??``,e.type??``,e.form??``,i,n,r,a,e.expansion??``,e.i?e.expansionism??``:``].join(`,`)});ee([e].concat(n).join(`
`),`${o(`Religions`)}.csv`)}function Pe(){let e=+this.closest(`.states`).dataset.id,t=s(`#relig`).select(`#religion${e}`).node();t&&ie(t,4)}function Z(){if(customization)return;let e=+this.closest(`.states`).dataset.id,t=this.classList,n=pack.religions[e];n.lock=!n.lock,t.toggle(`icon-lock-open`),t.toggle(`icon-lock`)}function Q(e){!e&&!l(`religionsAutoChange`).checked||(Religions.recalculate(),drawReligions(),R(),q())}function Fe(){s(`#debug`).select(`#religionCenters`).remove(),Y(`close`),X(),$(`#religionsEditor`).dialog(`destroy`),l(`religionsEditor`).remove()}var Ie={open:I};export{Ie as ReligionsEditor};