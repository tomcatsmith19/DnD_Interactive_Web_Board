import{Ft as e,K as t,Nt as n,Sn as r,U as i,c as a,it as o,kt as s,ot as c,t as l,u}from"./utils-BYaxf2yO.js";import{r as d,t as f}from"./tooltips-CSQuPvuv.js";import{At as p,Lt as m,Pt as ee,Q as h,jt as te,kt as g}from"./index-DqeJMjPz.js";var _={k:1,x:0,y:0};function v({k:e,x:t,y:r},i){return{k:e,x:n(t,i.width*(1-e),0),y:n(r,i.height*(1-e),0)}}function y(e,t,r,i,a=32){let o=n(e.k*r,1,Math.max(1,a)),s=o/e.k;return v({k:o,x:t.x-(t.x-e.x)*s,y:t.y-(t.y-e.y)*s},i)}function b(e,t,n,r){return v({k:e.k,x:e.x+t,y:e.y+n},r)}var x=null,S={..._},C=32,w=1,T=0,E=!1;function D(e){customization||(g(`.stable`),layerIsOn(`toggleBurgIcons`)||toggleBurgIcons(),layerIsOn(`toggleLabels`)||toggleLabels(),x=r(`#labels`).select(`[data-label-type='burg'][data-id='${e}']`),x.size()||(x=r(`#burgIcons`).select(`[data-id='${e}']`)),O(),ne(),re(),$(`#burgEditor`).dialog({title:`Edit Burg`,resizable:!1,close:Se,position:{my:`left top`,at:`left+10 top+10`,of:`svg`,collision:`fit`}}))}function O(){te(`burgEditor`);let e=`<div id="burgEditor" class="dialog" data-burg-id="${k()}">
      <div id="burgBody" style="padding-bottom: 0.3em">
        <div style="display: flex; align-items: center">
          <svg data-tip="Burg emblem. Click to edit" class="pointer" viewBox="0 0 200 200" width="13em" height="13em">
            <use id="burgEmblem"></use>
          </svg>
          <div style="display: grid; grid-auto-rows: minmax(1.6em, auto)">
            <div id="burgProvinceAndState" style="font-weight: bold; max-width: 16em"></div>
            <div>
              <div class="label">Name:</div>
              <input
                id="burgName"
                data-tip="Type to rename the burg"
                autocorrect="off"
                spellcheck="false"
                style="width: 9em"
              />
              <span id="burgNameSpeak" data-tip="Speak the name. You can change voice and language in options" class="speaker">🔊</span>
              <span
                id="burgNameReRandom"
                data-tip="Generate random name for the burg"
                class="icon-globe pointer"
              ></span>
            </div>
            <div data-tip="Select burg group. Groups defines burg icon, label size and style">
              <div class="label">Group:</div>
              <select id="burgGroup" style="width: 9em"></select>
              <span id="burgGroupConfigure" data-tip="Configure burg groups" class="icon-cog pointer"></span>
            </div>
            <div data-tip="Select burg type. Type slightly affects emblem generation">
              <div class="label">Type:</div>
              <select id="burgType" style="width: 9em">
                <option value="Generic">Generic</option>
                <option value="River">River</option>
                <option value="Lake">Lake</option>
                <option value="Naval">Naval</option>
                <option value="Nomadic">Nomadic</option>
                <option value="Hunting">Hunting</option>
                <option value="Highland">Highland</option>
              </select>
            </div>
            <div data-tip="Select dominant culture">
              <div class="label">Culture:</div>
              <select id="burgCulture" style="width: 9em"></select>
              <span
                id="burgNameReCulture"
                data-tip="Generate culture-specific name for the burg"
                class="icon-book pointer"
              ></span>
            </div>
            <div data-tip="Set burg population">
              <div class="label">Population:</div>
              <input id="burgPopulation" type="number" min="0" step="1" style="width: 9em" />
            </div>
            <div data-tip="Burg average yearly temperature" style="display: flex; justify-content: space-between">
              <div>
                <div class="label">Temperature:</div>
                <span id="burgTemperature"></span>
              </div>
              <div style="display: flex; gap: 0.5em">
                <i class="icon-info-circled" id="burgTemperatureLikeIn"></i>
                <i
                  id="burgTemperatureGraph"
                  data-tip="Show temperature graph for the burg"
                  class="icon-chart-area pointer"
                ></i>
              </div>
            </div>
            <div data-tip="Burg height above mean sea level">
              <div class="label">Elevation:</div>
              <span id="burgElevation"></span> above sea level
            </div>
            <div>
              <div class="label">Features:</div>
              <span
                id="burgCapital"
                data-tip="Shows whether the burg is a state capital. Click to toggle"
                data-feature="capital"
                class="burgFeature icon-star"
              ></span>
              <span
                id="burgPort"
                data-tip="Shows whether the burg is a port. Click to toggle"
                data-feature="port"
                class="burgFeature icon-anchor"
              ></span>
              <span
                id="burgCitadel"
                data-tip="Shows whether the burg has a citadel (castle). Click to toggle"
                data-feature="citadel"
                class="burgFeature icon-chess-rook"
                style="font-size: 1.1em"
              ></span>
              <span
                id="burgWalls"
                data-tip="Shows whether the burg is walled. Click to toggle"
                data-feature="walls"
                class="burgFeature icon-fort-awesome"
              ></span>
              <span
                id="burgPlaza"
                data-tip="Shows whether the burg is a trade center (market center). Click to toggle"
                data-feature="plaza"
                class="burgFeature icon-store"
                style="font-size: 1em"
              ></span>
              <span
                id="burgTemple"
                data-tip="Shows whether the burg is a religious center. Click to toggle"
                data-feature="temple"
                class="burgFeature icon-chess-bishop"
                style="font-size: 1.1em; margin-left: 3px"
              ></span>
              <span
                id="burgShanty"
                data-tip="Shows whether the burg has a shanty town. Click to toggle"
                data-feature="shanty"
                class="burgFeature icon-campground"
                style="font-size: 1em"
              ></span>
            </div>
            <div data-tip="Burg average daily production">
              <div class="label">Production:</div>
              <span id="burgProduction" style="display: inline-flex; flex-wrap: wrap; column-gap: 0.3em; max-width: 110px;"></span>
            </div>
            <div data-tip="Gross product per population point, daily average">
              <div class="label">Wealth</div>
              <span id="burgWealth"></span>
            </div>
            <div data-tip="Treasury balance after production, purchases, and sales">
              <div class="label">Treasury</div>
              <span id="burgTreasury"></span>
            </div>
          </div>
        </div>
        <div id="burgPreviewSection" data-tip="Burg map preview: scroll to zoom, drag to pan" style="display: flex; flex-direction: column">
          <div style="display: flex; justify-content: space-between">
            <span>Burg preview:</span>
            <div style="display: flex; gap: 0.5em">
              <i id="burgPreviewReset" data-tip="Reset preview zoom" class="icon-ccw pointer"></i>
              <i id="burgLinkOpen" data-tip="Open burg map in a new tab" class="icon-link-ext pointer"></i>
            </div>
          </div>
          <div
            id="burgPreviewObject"
            style="overflow: hidden; position: relative; touch-action: none; height: 320px; max-width: 60vw; max-height: 60vh"
          ></div>
        </div>
      </div>
      <div id="burgBottom">
        <button id="burgStyleShow" data-tip="Show style edit section" class="icon-brush"></button>
        <div id="burgStyleSection" style="display: none">
          <button id="burgStyleHide" data-tip="Hide style edit section" class="icon-brush"></button>
          <button
            id="burgEditLabelStyle"
            data-tip="Edit label style for burg group in Style Editor"
            class="icon-font"
          ></button>
          <button
            id="burgEditIconStyle"
            data-tip="Edit icon style for burg group in Style Editor"
            class="icon-dot-circled"
          ></button>
          <button
            id="burgEditAnchorStyle"
            data-tip="Edit port icon (anchor) style for burg group in Style Editor"
            class="icon-anchor"
          ></button>
        </div>
        <button id="burgEditLabel" data-tip="Edit this burg label" class="icon-font"></button>
        <button id="burgEditEmblem" data-tip="Edit emblem" class="icon-shield-alt"></button>
        <button id="burgSetPreviewLink" data-tip="Set custom burg map URL" class="icon-map-o"></button>
        <button id="burgLocate" data-tip="Zoom map and center view in the burg" class="icon-target"></button>
        <button
          id="burgProductionOverview"
          data-tip="Show production overview for this burg"
          class="icon-chart-bar"
        ></button>
        <button
          id="burgRelocate"
          data-tip="Relocate burg. Click on map to move the burg"
          class="icon-map-pin"
        ></button>
        <button id="burglLegend" data-tip="Edit free text notes (legend) for this burg" class="icon-edit"></button>
        <button id="burgLock" class="icon-lock-open" onmouseover="showElementLockTip(event)"></button>
        <button
          id="burgRemove"
          data-tip="Remove non-capital burg"
          data-shortcut="Delete"
          class="icon-trash fastDelete"
        ></button>
      </div>
    </div>`;i(`dialogs`).insertAdjacentHTML(`beforeend`,e),i(`burgName`).addEventListener(`input`,A),i(`burgNameSpeak`).addEventListener(`click`,()=>c(i(`burgName`).value)),i(`burgNameReRandom`).addEventListener(`click`,ie),i(`burgGroup`).addEventListener(`change`,ae),i(`burgGroupConfigure`).addEventListener(`click`,xe),i(`burgType`).addEventListener(`change`,oe),i(`burgCulture`).addEventListener(`change`,se),i(`burgNameReCulture`).addEventListener(`click`,ce),i(`burgPopulation`).addEventListener(`change`,j),i(`burgBody`).querySelectorAll(`.burgFeature`).forEach(e=>void e.addEventListener(`click`,M)),i(`burgLinkOpen`).addEventListener(`click`,me),i(`burgPreviewReset`).addEventListener(`click`,K),i(`burgPreviewObject`).addEventListener(`wheel`,le,{passive:!1}),i(`burgPreviewObject`).addEventListener(`dblclick`,ue),i(`burgPreviewObject`).addEventListener(`pointerdown`,de),i(`burgStyleShow`).addEventListener(`click`,L),i(`burgStyleHide`).addEventListener(`click`,R),i(`burgEditLabelStyle`).addEventListener(`click`,z),i(`burgEditIconStyle`).addEventListener(`click`,V),i(`burgEditAnchorStyle`).addEventListener(`click`,H),i(`burgEmblem`).addEventListener(`click`,X),i(`burgSetPreviewLink`).addEventListener(`click`,he),i(`burgEditEmblem`).addEventListener(`click`,X),i(`burgLocate`).addEventListener(`click`,ge),i(`burgEditLabel`).addEventListener(`click`,B),i(`burgRelocate`).addEventListener(`click`,Z),i(`burglLegend`).addEventListener(`click`,Q),i(`burgLock`).addEventListener(`click`,F),i(`burgRemove`).addEventListener(`click`,be),i(`burgTemperatureGraph`).addEventListener(`click`,ve),i(`burgProductionOverview`).addEventListener(`click`,ye)}function k(){return+x.attr(`data-id`)}function ne(){let e=i(`burgGroup`);e.options.length=0;for(let{name:t}of options.burgs.groups)e.options.add(new Option(t,t))}function re(){let t=k(),n=pack.burgs[t],r=pack.cells.province[n.cell],o=r?`${pack.provinces[r].fullName}, `:``,s=pack.states[n.state].fullName||pack.states[n.state].name;i(`burgProvinceAndState`).innerHTML=o+s,i(`burgName`).value=n.name,i(`burgGroup`).value=n.group,i(`burgType`).value=n.type||`Generic`,i(`burgPopulation`).value=String(e(n.population*populationRate*urbanization)),i(`burgWealth`).innerHTML=`🟡 ${e(n.population>0?(n.product||0)/n.population:0,2)}`,i(`burgTreasury`).innerHTML=`🟡 ${e(n.treasury||0,2)}`,i(`burgEditAnchorStyle`).style.display=+n.port?`inline-block`:`none`;let c=i(`burgCulture`);c.options.length=0,pack.cultures.filter(e=>!e.removed).forEach(e=>void c.options.add(new Option(e.name,String(e.i),!1,e.i===n.culture)));let d=grid.cells.temp[pack.cells.g[n.cell]];i(`burgTemperature`).innerHTML=l(d),i(`burgTemperatureLikeIn`).dataset.tip=`Average yearly temperature is like in ${u(d)}`,i(`burgElevation`).innerHTML=a(pack.cells.h[n.cell]),i(`burgCapital`).classList.toggle(`inactive`,!n.capital),i(`burgPort`).classList.toggle(`inactive`,!n.port),i(`burgCitadel`).classList.toggle(`inactive`,!n.citadel),i(`burgWalls`).classList.toggle(`inactive`,!n.walls),i(`burgPlaza`).classList.toggle(`inactive`,!n.plaza),i(`burgTemple`).classList.toggle(`inactive`,!n.temple),i(`burgShanty`).classList.toggle(`inactive`,!n.shanty),i(`burgProduction`).innerHTML=Ce(Production.getBurgProduction(n)),I();let f=`burgCOA${t}`;COArenderer.trigger(f,n.coa),i(`burgEmblem`).setAttribute(`href`,`#${f}`),Y(n)}function A(){let e=k(),t=i(`burgName`).value;pack.burgs[e].name=t,pack.burgs[e].label||(pack.burgs[e].label={}),Object.assign(pack.burgs[e].label,{text:t}),h()}function ie(){let e=s(Names.nameBases.length-1);i(`burgName`).value=Names.getBase(e),A()}function ae(){let e=k(),t=pack.burgs[e];Burgs.changeGroup(t,this.value),h()}function oe(){let e=k();pack.burgs[e].type=this.value}function se(){let e=k();pack.burgs[e].culture=+this.value}function ce(){let e=k(),t=pack.burgs[e].culture;i(`burgName`).value=Names.getCulture(t),A()}function j(){let t=k(),n=pack.burgs[t];pack.burgs[t].population=e(i(`burgPopulation`).valueAsNumber/populationRate/urbanization,4),Y(n)}function M(){let e=k(),t=pack.burgs[e],n=this.dataset.feature,r=Number(this.classList.contains(`inactive`));n===`port`?N(e):n===`capital`?P(e):t[n]=r,this.classList.toggle(`inactive`,!t[n]),i(`burgEditAnchorStyle`).style.display=t.port?`inline-block`:`none`,Y(t)}function N(e){let t=pack.burgs[e];if(t.port){t.port=0;let n=document.querySelector(`#anchors [data-id='${e}']`);n&&n.remove()}else{let{cells:e,features:n}=pack,i=e.haven[t.cell],a;if(i){let t=e.f[i],r=n[t];a=r?.type===`lake`&&r.outlet?Rivers.resolveLakeDrainFeature(t)??t:t}else if(a=Rivers.resolveDrainFeature(t.cell),!a){d(`No navigable water body found downstream, cannot assign port`,!1,`warn`);return}t.port=a,r(`#anchors`).select(`#${t.group}`).append(`use`).attr(`href`,`#icon-anchor`).attr(`id`,`anchor${t.i}`).attr(`data-id`,t.i).attr(`x`,t.x).attr(`y`,t.y)}}function P(e){let{burgs:t,states:n}=pack;if(t[e].capital){d(`To change capital please assign a capital status to another burg of this state`,!1,`error`);return}let r=t[e].state;if(!r){d(`Neutral lands cannot have a capital`,!1,`error`);return}let i=n[r].capital;n[r].capital=e,n[r].center=t[e].cell;let a=t[e];a.capital=1,Burgs.changeGroup(a);let o=t[i];o.capital=0,Burgs.changeGroup(o),h()}function F(){let e=k(),t=pack.burgs[e];t.lock=!t.lock,I()}function I(){let e=k();pack.burgs[e].lock?(i(`burgLock`).classList.remove(`icon-lock-open`),i(`burgLock`).classList.add(`icon-lock`)):(i(`burgLock`).classList.remove(`icon-lock`),i(`burgLock`).classList.add(`icon-lock-open`))}function L(){document.querySelectorAll(`#burgBottom > button`).forEach(e=>{e.style.display=`none`}),i(`burgStyleSection`).style.display=`inline-block`}function R(){document.querySelectorAll(`#burgBottom > button`).forEach(e=>{e.style.display=`inline-block`}),i(`burgStyleSection`).style.display=`none`}function z(){let e=x.node().parentNode;g(`.stable`),editStyle(`labels`,e.id)}function B(){let e=k();$(`#burgEditor`).dialog(`close`),m.LabelsEditor.open(`burg`,e)}function V(){let e=x.node().parentNode;g(`.stable`),editStyle(`burgIcons`,e.id)}function H(){let e=x.node().parentNode;g(`.stable`),editStyle(`anchors`,e.id)}function U(){let e=i(`burgPreviewObject`);return{width:e.clientWidth,height:e.clientHeight}}function W(){let e=i(`burgPreviewObject`),t=e.querySelector(`iframe`);if(!t)return;let{k:n,x:r,y:a}=S;t.style.transformOrigin=`0 0`,t.style.transform=`translate(${r}px, ${a}px) scale(${n/w})`,t.style.left=`0`,t.style.top=`0`,e.style.cursor=n>1?`grab`:`default`,clearTimeout(T),E||(T=window.setTimeout(G,200))}function G(){if(E)return;let e=i(`burgPreviewObject`).querySelector(`iframe`);if(!e)return;let{k:t,x:n,y:r}=S;w=t,e.style.width=`${t*100}%`,e.style.height=`${t*100}%`,e.style.transform=`none`,e.style.left=`${n}px`,e.style.top=`${r}px`}function K(){S={..._},clearTimeout(T),E?W():G(),i(`burgPreviewObject`).style.cursor=`default`}function q(e){let t=i(`burgPreviewObject`).getBoundingClientRect();return{x:e.clientX-t.left,y:e.clientY-t.top}}function le(e){e.preventDefault();let t=Math.exp(-e.deltaY*(e.deltaMode===1?.05:e.deltaMode?1:.002));S=y(S,q(e),t,U(),C),W()}function ue(e){S=y(S,q(e),2,U(),C),W()}function de(e){if(S.k<=1)return;e.preventDefault();let t=i(`burgPreviewObject`);t.setPointerCapture(e.pointerId),t.style.cursor=`grabbing`;let n={x:e.clientX,y:e.clientY},r=e=>{let t=e;S=b(S,t.clientX-n.x,t.clientY-n.y,U()),n={x:t.clientX,y:t.clientY},W()},a=()=>{t.removeEventListener(`pointermove`,r),t.removeEventListener(`pointerup`,a),t.removeEventListener(`pointercancel`,a),t.style.cursor=`grab`};t.addEventListener(`pointermove`,r),t.addEventListener(`pointerup`,a),t.addEventListener(`pointercancel`,a)}var J=0;function fe(){if(!J){let e=document.createElement(`canvas`).getContext(`webgl`);J=e?e.getParameter(e.MAX_TEXTURE_SIZE):4096}return J}function pe(){let{width:e,height:t}=U(),n=Math.max(e,t,1);return fe()/2/(devicePixelRatio*n)}function Y(e){let t=Burgs.getPreview(e).preview;if(!t){i(`burgPreviewSection`).style.display=`none`;return}i(`burgPreviewSection`).style.display=`block`;let n=i(`burgPreviewObject`);n.innerHTML=``;let r=document.createElement(`iframe`);if(r.style.position=`absolute`,r.style.border=`none`,r.style.pointerEvents=`none`,r.setAttribute(`sandbox`,`allow-scripts allow-same-origin`),r.src=t,n.insertBefore(r,null),E=t.includes(`watabou.github.io`),E){let e=Math.max(1,Math.min(4,pe()));w=e,r.style.width=`${e*100}%`,r.style.height=`${e*100}%`,C=Math.min(32,e*2.5)}else w=1,C=32;K()}function me(){let e=k(),t=pack.burgs[e],n=Burgs.getPreview(t).link;n&&o(n)}function he(){let e=k(),t=pack.burgs[e];prompt(`Provide custom URL to the burg map. It can be a link to a generator or just an image. Leave empty to use the default map preview`,{default:Burgs.getPreview(t).link||``,required:!1},e=>{e?t.link=String(e):delete t.link,Y(t)})}function X(){let e=k(),t=pack.burgs[e];m.EmblemsEditor.open(`burg`,`burgCOA${e}`,t)}function ge(){let e=k(),t=pack.burgs[e];zoomTo(t.x,t.y,8,2e3)}function Z(){let e=i(`toggleCells`);i(`burgRelocate`).classList.toggle(`pressed`),i(`burgRelocate`).classList.contains(`pressed`)?(r(`#viewbox`).style(`cursor`,`crosshair`).on(`click`,_e),d(`Click on map to relocate burg. Hold Shift for continuous move`,!0),layerIsOn(`toggleCells`)||(toggleCells(),e.dataset.forced=`true`)):(f(),ee(),layerIsOn(`toggleCells`)&&e.dataset.forced&&(toggleCells(),e.dataset.forced=`false`))}function _e(n){let i=pack.cells,a=t(n,this),o=findCell(a[0],a[1]),s=k(),c=pack.burgs[s];if(i.h[o]<20){d(`Cannot place burg into the water! Select a land cell`,!1,`error`);return}if(i.burg[o]&&i.burg[o]!==s){d(`There is already a burg in this cell. Please select a free cell`,!1,`error`);return}let l=i.state[o];if(l!==c.state&&c.capital){d(`Capital cannot be relocated into another state!`,!1,`error`);return}let u=e(a[0],2),f=e(a[1],2);r(`#burgIcons`).select(`#burg${s}`).attr(`x`,u).attr(`y`,f);let p=r(`#anchors`).select(`use[data-id='${s}']`);if(p.size()){let t=+p.attr(`width`),n=e(u-t*.47,2),r=e(f-t*.47,2);p.attr(`transform`,null).attr(`x`,n).attr(`y`,r)}i.burg[c.cell]=0,i.burg[o]=s,c.cell=o,c.state=l,c.x=u,c.y=f,c.capital&&(pack.states[l].center=c.cell),c.label&&Object.assign(c.label,{dx:0,dy:0,pathPoints:void 0}),h(),n.shiftKey===!1&&Z()}function Q(){let e=x.attr(`data-id`),t=x.text();m.NotesEditor.open(`burg${e}`,t)}function ve(){let e=+x.attr(`data-id`);m.TemperatureGraph.open(e)}function ye(){let e=k();m.ProductionOverview.open(e)}function be(){let e=k();pack.burgs[e].capital?(alertMessage.innerHTML=`You cannot remove the capital. You must change the state capital first`,$(`#alert`).dialog({resizable:!1,title:`Remove burg`,buttons:{Ok:function(){$(this).dialog(`close`)}}})):pack.markets?.some(t=>t.centerBurgId===e)?(alertMessage.innerHTML=`You cannot remove a market center burg. Please remove the market first`,$(`#alert`).dialog({resizable:!1,title:`Remove burg`,buttons:{Ok:function(){$(this).dialog(`close`)}}})):p({title:`Remove burg`,message:`Are you sure you want to remove the burg? <br>This action cannot be reverted`,confirm:`Remove`,onConfirm:()=>{Burgs.remove(e),h(),$(`#burgEditor`).dialog(`close`)}})}function xe(){m.BurgGroupEditor.open()}function Se(){i(`burgRelocate`).classList.contains(`pressed`)&&Z(),x=null,$(`#burgEditor`).dialog(`destroy`),i(`burgEditor`).remove()}function Ce(e){if(!e)return``;let t=``,n=Object.entries(e).sort(([,e],[,t])=>t-e);for(let[e,r]of n){let n=Goods.get(+e);if(!n)continue;let{name:i,unit:a,icon:o}=n,s=r===1?a:`${a}s`;t+=`<span data-tip="${i}: ${r} ${s} per day">
      <svg class="resIcon" width="1em" height="1em"><use href="#${o}"></use></svg>
      <span style="margin: 0 0.2em 0 -0.2em">${r}</span>
    </span>`}return t}var we={open:D};export{we as BurgEditor};