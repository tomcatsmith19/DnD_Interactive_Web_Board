import{D as e,Ft as t,S as n,Sn as r,U as i,ct as a,d as o,rn as s,w as c,x as l}from"./utils-BYaxf2yO.js";import{r as u}from"./tooltips-CSQuPvuv.js";import{Lt as d,N as f,Nt as p,P as m,Xt as h,kt as g}from"./index-DqeJMjPz.js";import{t as _}from"./highlighting-CH83CMtN.js";import{i as v,n as y,r as b,t as x}from"./table-BDnPiVU4.js";var S=`militaryOverview`,C={my:`right top`,at:`right-10 top+10`,of:`svg`,collision:`fit`},w=[],T=y({getData:N,onUpdate:F});function E(){customization||(g(`#militaryOverview, .stable`),layerIsOn(`toggleStates`)||toggleStates(),layerIsOn(`toggleBorders`)||toggleBorders(),layerIsOn(`toggleMilitary`)||toggleMilitary(),D(),T.reset(),$(`#militaryOverview`).dialog({title:`Military Overview`,resizable:!1,width:`fit-content`,close:O,position:C}))}function D(){w=A(),document.getElementById(`militaryOverview`)?.remove();let e=`<div id="${S}" class="dialog stable editorDialog">
      <div id="militaryBody" class="table" data-type="absolute">
        ${b({dialogId:S,columns:w})}
      </div>
      <div id="militaryFooter" class="totalLine">
        <div data-tip="States number" style="margin-left: 4px">
          States:&nbsp;<span id="militaryFooterStates">0</span>
        </div>
        <div data-tip="Total military forces" style="margin-left: 14px" data-col="total">
          Total forces:&nbsp;<span id="militaryFooterForcesTotal">0</span>
        </div>
        <div data-tip="Average military forces per state" style="margin-left: 14px" data-col="total">
          Average forces:&nbsp;<span id="militaryFooterForces">0</span>
        </div>
        <div data-tip="Average forces rate per state" style="margin-left: 14px" data-col="rate">
          Average rate:&nbsp;<span id="militaryFooterRate">0%</span>
        </div>
        <div data-tip="Average War Alert" style="margin-left: 14px" data-col="alert">
          Average alert:&nbsp;<span id="militaryFooterAlert">0</span>
        </div>
      </div>
      <div id="militaryBottom" class="editorToolbar">
        <button id="militaryOverviewRefresh" data-tip="Refresh the overview screen" class="icon-cw"></button>
        <button id="militaryOptionsButton" data-tip="Edit Military units" class="icon-cog"></button>
        <button id="militaryRegimentsList" data-tip="Show regiments list" class="icon-list-bullet"></button>
        <button
          id="militaryPercentage"
          data-tip="Toggle percentage / absolute values views"
          class="icon-percent"
        ></button>
        <button
          id="militaryOverviewRecalculate"
          data-tip="Recalculate military forces based on current options"
          class="icon-retweet"
        ></button>
        <button
          id="militaryExport"
          data-tip="Save military-related data as a text file (.csv)"
          class="icon-download"
        ></button>
        <button id="militaryWiki" data-tip="Open Military Forces Tutorial" class="icon-info"></button>
      </div>
    </div>`;i(`dialogs`).insertAdjacentHTML(`beforeend`,e),j(),_(`militaryOverview`,({cellId:e})=>pack.cells.state[e]);let t=i(`militaryBody`);i(`militaryOverviewRefresh`).addEventListener(`click`,P),i(`militaryPercentage`).addEventListener(`click`,B),i(`militaryOptionsButton`).addEventListener(`click`,V),i(`militaryRegimentsList`).addEventListener(`click`,()=>k(-1)),i(`militaryOverviewRecalculate`).addEventListener(`click`,W),i(`militaryExport`).addEventListener(`click`,G),i(`militaryWiki`).addEventListener(`click`,()=>a(`Military-Forces`)),t.addEventListener(`change`,e=>{let t=e.target,n=t.closest(`.states`);n&&I(+n.dataset.id,+t.value)}),t.addEventListener(`click`,e=>{let t=e.target,n=t.closest(`.states`);if(!n)return;let r=+n.dataset.id;t.tagName===`SPAN`&&k(r)})}function O(){$(`#militaryOverview`).dialog(`destroy`),i(`militaryOverview`).remove()}async function k(e){d.RegimentsOverview.open(e)}function A(){return[{key:`color`,width:`1.2em`,permanent:!0},{key:`state`,label:`State`,width:`7em`,permanent:!0,sortBy:e=>e.state.name||``,sortType:`alpha`},...options.military.map(e=>({key:`unit:${e.name}`,label:c(e.name.replace(/_/g,` `)),width:`5em`,mobileHidden:!0,tip:`State ${e.name} units number. Click to sort`,sortBy:t=>t.forces[e.name]||0})),{key:`total`,label:`Total`,width:`5em`,defaultSort:`desc`,sortBy:e=>e.total,tip:`Total military personnel (considering crew). Click to sort`},{key:`population`,label:`Population`,width:`6.5em`,mobileHidden:!0,sortBy:e=>e.population},{key:`rate`,label:`Rate`,width:`5em`,sortBy:e=>e.rate,tip:`Military personnel rate (% of state population). Depends on war alert. Click to sort`},{key:`alert`,label:`War Alert`,width:`5.5em`,sortBy:e=>e.alert,tip:`War Alert. Modifier to military forces number, depends on political situation. Click to sort`},{key:`actions`,width:`1.4em`,permanent:!0,align:`right`}]}function j(){f(S,T.reset),x({dialogId:S,columns:w,onUpdate:()=>p(S,{width:`fit-content`,position:C})})}function M(){w=A(),i(`${S}Header`).outerHTML=b({dialogId:S,columns:w}),j(),T.reset()}function N(){return m(S,pack.states.filter(e=>e.i&&!e.removed).map(e=>{let n=Object.fromEntries(options.military.map(t=>[t.name,(e.military||[]).reduce((e,n)=>e+(n.u[t.name]||0),0)])),r=t(((e.rural||0)+(e.urban||0)*urbanization)*populationRate),i=options.military.reduce((e,t)=>e+(n[t.name]||0)*t.crew,0);return{state:e,forces:n,total:i,population:r,rate:r?i/r*100:0,alert:e.alert??0}}),w)}function P(){T.refresh()}function F(e){let n=i(`militaryBody`),r=n.dataset.type===`percentage`,a=e.all.reduce((e,t)=>{e.total+=t.total,e.population+=t.population;for(let n of options.military)e.units[n.name]=(e.units[n.name]||0)+t.forces[n.name];return e},{total:0,population:0,units:{}}),s=(e,n)=>`${t(n?e/n*100:0)}%`,c=e.rows.map(e=>{let n=options.military.map(t=>{let n=e.forces[t.name]||0;return`<div data-col="${`unit:${t.name}`}" data-tip="State ${t.name} units number">${r?s(n,a.units[t.name]||0):n}</div>`}).join(``);return`<div class="states" data-id="${e.state.i}">
        <fill-box data-col="color" data-tip="${e.state.fullName}" fill="${e.state.color}" disabled></fill-box>
        <input data-col="state" data-tip="${e.state.fullName}" value="${e.state.name}" readonly />
        ${n}
        <div data-col="total" data-tip="Total state military personnel (considering crew)" style="font-weight:bold">${r?s(e.total,a.total):o(e.total)}</div>
        <div data-col="population" data-tip="State population">${r?s(e.population,a.population):o(e.population)}</div>
        <div data-col="rate" data-tip="Military personnel rate (% of state population). Depends on war alert">${t(e.rate,2)}%</div>
        <input data-col="alert" data-tip="War Alert. Editable modifier to military forces number, depends on political situation" type="number" min="0" step=".01" value="${t(e.alert,2)}" />
        <div data-col="actions"><span data-tip="Show regiments list" class="icon-list-bullet pointer"></span></div>
      </div>`}).join(``);n.querySelectorAll(`:scope > .states`).forEach(e=>{e.remove()}),n.insertAdjacentHTML(`beforeend`,c),L(e),v(i(`militaryFooter`),e,T.goto),n.querySelectorAll(`:scope > .states`).forEach(e=>{e.addEventListener(`mouseenter`,R),e.addEventListener(`mouseleave`,z)}),p(S,{width:`fit-content`,position:C})}function I(e,n){let i=pack.states[e],a=i.alert??1,o=a?n/a:0;i.alert=n,(i.military||[]).forEach(e=>{Object.keys(e.u).forEach(n=>{e.u[n]=t(e.u[n]*o)}),e.a=h(Object.values(e.u)),r(`#armies > g > g#regiment${i.i}-${e.i} > text`).text(Military.getTotal(e))}),T.refresh()}function L(e){let n=e.all.length,r=h(e.all.map(e=>e.total));i(`militaryFooterStates`).innerHTML=String(n),i(`militaryFooterForcesTotal`).innerHTML=o(r),i(`militaryFooterForces`).innerHTML=o(n?r/n:0),i(`militaryFooterRate`).innerHTML=`${t(n?h(e.all.map(e=>e.rate))/n:0,2)}%`,i(`militaryFooterAlert`).innerHTML=String(t(n?h(e.all.map(e=>e.alert))/n:0,2))}function R(e){let t=+e.target.dataset.id;if(customization||!t||(r(`#armies > g > g#army${t}`).transition().duration(2e3).style(`fill`,`#ff0000`),!layerIsOn(`toggleStates`)))return;let n=r(`#regions`).select(`#state${t}`).attr(`d`),i=r(`#debug`).append(`path`).attr(`class`,`highlight`).attr(`d`,n).attr(`fill`,`none`).attr(`stroke`,`red`).attr(`stroke-width`,1).attr(`opacity`,1).attr(`filter`,`url(#blur1)`),a=i.node().getTotalLength(),o=(a+5e3)/2,c=s(`0,${a}`,`${a},${a}`);i.transition().duration(o).attrTween(`stroke-dasharray`,()=>e=>c(e))}function z(e){r(`#debug`).selectAll(`.highlight`).each(function(){r(this).transition().duration(1e3).attr(`opacity`,0).remove()}),r(`#armies > g > g#army${+e.target.dataset.id}`).transition().duration(1e3).style(`fill`,null)}function B(){let e=i(`militaryBody`);e.dataset.type=e.dataset.type===`absolute`?`percentage`:`absolute`,T.refresh()}function V(){H();let t=[`melee`,`ranged`,`mounted`,`machinery`,`naval`,`armored`,`aviation`,`magical`],n=i(`militaryOptions`).querySelector(`tbody`);if(r(),options.military.map(e=>c(e)),$(`#militaryOptions`).dialog({title:`Edit Military Units`,resizable:!1,width:`fit-content`,position:{my:`center`,at:`center`,of:`svg`},close:U,buttons:{Apply:p,Add:()=>c({icon:`🛡️`,name:`custom${i(`militaryOptionsTable`).rows.length}`,rural:.2,urban:.5,crew:1,power:1,type:`melee`,separate:0}),Restore:l,Cancel:function(){$(this).dialog(`close`)}},open:function(){let e=$(this).dialog(`widget`).find(`.ui-dialog-buttonset > button`);e[0].addEventListener(`mousemove`,()=>u(`Apply military units settings. <span style='color:#cb5858'>All forces will be recalculated!</span>`)),e[1].addEventListener(`mousemove`,()=>u(`Add new military unit to the table`)),e[2].addEventListener(`mousemove`,()=>u(`Restore default military units and settings`)),e[3].addEventListener(`mousemove`,()=>u(`Close the window without saving the changes`))}}),modules.overviewMilitaryCustomize)return;modules.overviewMilitaryCustomize=!0,n.addEventListener(`click`,e=>{let t=e.target;if(t.tagName!==`BUTTON`)return;let n=t.dataset.type;if(n===`icon`){d.IconSelector.open(t.textContent||``,e=>{t.innerHTML=e.startsWith(`http`)||e.startsWith(`data:image`)?`<img src="${e}" style="width:1.2em;height:1.2em;pointer-events:none;">`:e});return}if(n===`biomes`){f(t,pack.biomes.filter(e=>!e.removed).map(({i:e,name:t,color:n})=>({i:e,name:t,color:n})));return}if(n===`states`)return f(t,pack.states);if(n===`cultures`)return f(t,pack.cultures);if(n===`religions`)return f(t,pack.religions)});function r(){n.querySelectorAll(`tr`).forEach(e=>{e.remove()})}function a(e){return e?.join(`,`)||``}function o(e){return e?.length?`some`:`all`}function s(e,t){return e?.length?e.map(e=>t?.[e]?.name||``).join(`, `):``}function c(e){let{type:r,icon:i,name:c,rural:l,urban:u,power:d,crew:f,separate:p}=e,m=document.createElement(`tr`),h=t.map(e=>`<option ${r===e?`selected`:``} value="${e}">${e}</option>`).join(` `),g=t=>{let n=t===`biomes`?[]:pack[t];return`<button
          data-tip="Select allowed ${t}"
          data-type="${t}"
          title="${s(e[t],n)}"
          data-value="${a(e[t])}">
          ${o(e[t])}
        </button>`};m.innerHTML=`<td>
          <button data-type="icon" data-tip="Click to select unit icon">
            ${i.startsWith(`http`)||i.startsWith(`data:image`)?`<img src="${i}" style="width:1.2em;height:1.2em;pointer-events:none;">`:i||``}
          </button>
        </td>
        <td><input data-tip="Type unit name. If name is changed for existing unit, old unit will be replaced" value="${c}" /></td>
        <td>${g(`biomes`)}</td>
        <td>${g(`states`)}</td>
        <td>${g(`cultures`)}</td>
        <td>${g(`religions`)}</td>
        <td><input data-tip="Enter conscription percentage for rural population" type="number" min="0" max="100" step=".01" value="${l}" /></td>
        <td><input data-tip="Enter conscription percentage for urban population" type="number" min="0" max="100" step=".01" value="${u}" /></td>
        <td><input data-tip="Enter average number of people in crew (for total personnel calculation)" type="number" min="1" step="1" value="${f}" /></td>
        <td><input data-tip="Enter military power (used for battle simulation)" type="number" min="0" step=".1" value="${d}" /></td>
        <td>
          <select data-tip="Select unit type to apply special rules on forces recalculation">
            ${h}
          </select>
        </td>
        <td data-tip="Check if unit is <b>separate</b> and can be stacked only with the same units">
          <input id="${c}Separate" type="checkbox" class="checkbox" ${p?`checked`:``} />
          <label for="${c}Separate" class="checkbox-label"></label>
        </td>
        <td data-tip="Remove the unit">
          <span data-tip="Remove unit type" class="icon-trash-empty pointer" onclick="this.parentElement.parentElement.remove();"></span>
        </td>`,n.appendChild(m)}function l(){r(),Military.getDefaultOptions().map(e=>c(e))}function f(e,t){let n=e.dataset.type,r=e.dataset.value,a=r?r.split(`,`).map(e=>+e):[],o=t.filter(e=>e.i&&!e.removed).map(({i:e,name:t,fullName:n,color:r})=>`
          <tr data-tip="${t}">
            <td><span style="color:${r}">⬤</span></td>
            <td>
              <input data-i="${e}" id="el${e}" type="checkbox" class="checkbox"
                ${!a.length||a.includes(e)?`checked`:``} >
              <label for="el${e}" class="checkbox-label">${n||t}</label>
            </td>
          </tr>`);i(`alertMessage`).innerHTML=`<b>Limit unit by ${n}:</b>
        <table style="margin-top:.3em">
          <tbody>
            ${o.join(``)}
          </tbody>
        </table>`,$(`#alert`).dialog({width:`fit-content`,title:`Limit unit`,buttons:{Invert:()=>{alertMessage.querySelectorAll(`input`).forEach(e=>{e.checked=!e.checked})},Apply:function(){let n=Array.from(alertMessage.querySelectorAll(`input`)),r=n.reduce((e,t)=>(t.checked&&e.push(t.dataset.i),e),[]);if(!r.length){u(`Select at least one element`,!1,`error`);return}let i=r.length===n.length;e.dataset.value=i?``:r.join(`,`),e.innerHTML=i?`all`:`some`,e.setAttribute(`title`,s(r.map(Number),t)),$(this).dialog(`close`)},Cancel:function(){$(this).dialog(`close`)}}})}function p(){let t=Array.from(n.querySelectorAll(`tr`)),r=t.map(t=>e(t.querySelector(`input`).value));if(new Set(r).size!==r.length){u(`All units should have unique names`,!1,`error`);return}$(`#militaryOptions`).dialog(`close`),options.military=t.map((e,t)=>{let[n,,i,a,o,s,c,l,u,d,f,p]=Array.from(e.querySelectorAll(`input, button, select`)).map(e=>{let{type:t,value:n}=e.dataset||{};if(t===`icon`){let t=e.innerHTML.trim();return t.startsWith(`<img`)?t.match(/src="([^"]*)"/)[1]:t||`⠀`}return t?n?n.split(`,`).map(e=>parseInt(e,10)):null:e.type===`number`?+e.value||0:e.type===`checkbox`?+e.checked||0:e.value}),m={icon:n,name:r[t],rural:c,urban:l,crew:u,power:d,type:f,separate:p};return i&&(m.biomes=i),a&&(m.states=a),o&&(m.cultures=o),s&&(m.religions=s),m}),localStorage.setItem(`military`,JSON.stringify(options.military)),Military.generate(),M()}}function H(){document.getElementById(`militaryOptions`)?.remove(),i(`dialogs`).insertAdjacentHTML(`beforeend`,`<div id="militaryOptions" class="dialog stable">
      <div class="table">
        <table id="militaryOptionsTable">
          <thead>
            <tr>
              <th data-tip="Unit icon">Icon</th>
              <th data-tip="Unit name. If name is changed for existing unit, old unit will be replaced">Unit name</th>
              <th style="width: 5em" data-tip="Select allowed biomes">Biomes</th>
              <th style="width: 5em" data-tip="Select allowed states">States</th>
              <th style="width: 5em" data-tip="Select allowed cultures">Cultures</th>
              <th style="width: 5em" data-tip="Select allowed religions">Religions</th>
              <th data-tip="Conscription percentage for rural population">Rural</th>
              <th data-tip="Conscription percentage for urban population">Urban</th>
              <th data-tip="Average number of people in crew (used for total personnel calculation)">Crew</th>
              <th data-tip="Unit military power (used for battle simulation)">Power</th>
              <th data-tip="Unit type to apply special rules on forces recalculation">Type</th>
              <th data-tip="Check if unit is separate and can be stacked only with units of the same type">
                Separate
              </th>
            </tr>
          </thead>
          <tbody></tbody>
        </table>
      </div>
    </div>`)}function U(){$(`#militaryOptions`).dialog(`destroy`),i(`militaryOptions`).remove()}function W(){i(`alertMessage`).innerHTML=`Are you sure you want to recalculate military forces for all states?<br>Regiments for all states will be regenerated`,$(`#alert`).dialog({resizable:!1,title:`Recalculate military`,buttons:{Recalculate:function(){$(this).dialog(`close`),Military.generate(),layerIsOn(`toggleMilitary`)&&drawMilitary(),P()},Cancel:function(){$(this).dialog(`close`)}}})}function G(){let e=options.military.map(e=>e.name),r=`Id,State,${e.map(e=>c(e)).join(`,`)},Total,Population,Rate,War Alert\n`;for(let n of N())r+=`${n.state.i},${n.state.name},${e.map(e=>n.forces[e]||0).join(`,`)},${n.total},${n.population},${t(n.rate,2)}%,${n.alert}\n`;let i=`${n(`Military`)}.csv`;l(r,i)}var K={open:E};export{K as MilitaryOverview};