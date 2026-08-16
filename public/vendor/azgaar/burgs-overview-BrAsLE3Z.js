import{$ as e,C as t,Ft as n,S as r,Sn as i,U as a,c as o,d as s,et as c,t as l,u,x as d}from"./utils-BYaxf2yO.js";import{t as f}from"./stratify-CGdiYggi.js";import{t as p}from"./pack-CyBKcrr4.js";import{r as m}from"./tooltips-CSQuPvuv.js";import{At as h,Lt as g,N as _,Nt as v,P as y,Q as b,kt as x}from"./index-DqeJMjPz.js";import{t as S}from"./highlighting-CH83CMtN.js";import{i as C,n as w,r as T,t as E}from"./table-BDnPiVU4.js";var D=`burgsOverview`,O={my:`right top`,at:`right-10 top+10`,of:`svg`,collision:`fit`},k=[{key:`locate`,width:`0.8em`,permanent:!0},{key:`name`,label:`Burg`,width:`8em`,permanent:!0,sortBy:e=>e.name||``,sortType:`alpha`},{key:`province`,label:`Province`,width:`8em`,hidden:!0,mobileHidden:!0,sortType:`alpha`,sortBy:e=>{let t=pack.cells.province[e.cell];return t&&pack.provinces[t]?.name||``}},{key:`state`,label:`State`,width:`8em`,sortBy:e=>pack.states[e.state]?.name||``,sortType:`alpha`},{key:`culture`,label:`Culture`,width:`10em`,mobileHidden:!0,sortBy:e=>pack.cultures[e.culture]?.name||``,sortType:`alpha`},{key:`group`,label:`Group`,width:`6em`,mobileHidden:!0,sortBy:e=>e.group||``,sortType:`alpha`},{key:`population`,label:`Population`,width:`7em`,defaultSort:`desc`,sortBy:e=>e.population*populationRate*urbanization},{key:`grossproduct`,label:`Product`,width:`6.5em`,hidden:!0,mobileHidden:!0,sortBy:e=>n(e.product||0,2)},{key:`productpercapita`,label:`Wealth`,width:`6.5em`,mobileHidden:!0,tip:`Click to sort by burg wealth (gross product per capita)`,sortBy:e=>n(e.population>0?(e.product||0)/e.population:0,2)},{key:`treasury`,label:`Treasury`,width:`6.5em`,mobileHidden:!0,sortBy:e=>n(e.treasury||0,2)},{key:`features`,label:`Features`,width:`6em`,mobileHidden:!0,sortType:`alpha`,sortBy:e=>e.capital&&e.port?`a-capital-port`:e.capital?`c-capital`:e.port?`p-port`:`z-burg`},{key:`actions`,width:`3.2em`,permanent:!0,align:`right`}],A=w({getData:()=>y(D,I(),k),onUpdate:L});function j(e={stateId:null,cultureId:null}){customization||(x(`#${D}, .stable`),layerIsOn(`toggleBurgIcons`)||toggleBurgIcons(),layerIsOn(`toggleLabels`)||toggleLabels(),M(),F(e),Z(),A.reset(),$(`#${D}`).dialog({title:`Burgs Overview`,resizable:!1,close:N,width:`fit-content`,position:O}))}function M(){document.getElementById(`burgsOverview`)?.remove();let e=`<div id="burgsOverview" class="dialog stable editorDialog">
      <div id="burgsBody" class="table">${T({dialogId:D,columns:k})}</div>
      <div id="burgsFilters" data-tip="Apply a filter" class="editorFilters">
        <label for="burgsSearch" data-tip="Filter by name, province, state, culture, or group"
          >Search: <input id="burgsSearch" type="search"
        /></label>
        <label for="burgsFilterState"
          >State:
          <select id="burgsFilterState"></select
        ></label>
        <label for="burgsFilterCulture"
          >Culture:
          <select id="burgsFilterCulture"></select
        ></label>
      </div>
      <div id="burgsFooter" class="totalLine">
        <div data-tip="Burgs displayed" style="margin-left: 5px">
          Burgs:&nbsp;<span id="burgsFooterBurgs">0 of 0</span>
        </div>
        <div data-tip="Average population" style="margin-left: 12px" data-col="population">
          Avg population:&nbsp;<span id="burgsFooterPopulation">0</span>
        </div>
        <div data-tip="Average gross product" style="margin-left: 12px" data-col="grossproduct">
          Avg product:&nbsp;<span id="burgsFooterGrossProduct">0</span> 🟡
        </div>
        <div data-tip="Average wealth (product per capita)" style="margin-left: 12px" data-col="productpercapita">
          Avg wealth:&nbsp;<span id="burgsFooterProductPerCapita">0</span> 🟡
        </div>
        <div data-tip="Average treasury" style="margin-left: 12px" data-col="treasury">
          Avg treasury:&nbsp;<span id="burgsFooterTreasury">0</span> 🟡
        </div>
      </div>
      <div id="burgsBottom" class="editorToolbar">
        <button id="burgsOverviewRefresh" data-tip="Refresh the Editor" class="icon-cw"></button>
        <button id="burgsGroupsEditorButton" data-tip="Edit burg groups" class="icon-cog"></button>
        <button id="burgsChart" data-tip="Show burgs bubble chart" class="icon-chart-area"></button>
        <button
          id="regenerateBurgNames"
          data-tip="Regenerate burg names based on assigned culture"
          class="icon-retweet"
        ></button>
        <button id="addNewBurg" data-tip="Add a new burg. Hold Shift to add multiple" class="icon-plus"></button>
        <button
          id="burgsExport"
          data-tip="Save burgs-related data as a text file (.csv)"
          class="icon-download"
        ></button>
        <button id="burgNamesImport" data-tip="Rename burgs in bulk" class="icon-upload"></button>
        <button id="burgsLockAll" data-tip="Lock or unlock all burgs" class="icon-lock"></button>
        <button
          id="burgsRemoveAll"
          data-tip="Remove all unlocked burgs except for capitals. To remove a capital remove its state first"
          class="icon-trash"
        ></button>
      </div>
    </div>`;a(`dialogs`).insertAdjacentHTML(`beforeend`,e),_(D,A.reset),S(D,({target:e,cellId:t})=>{let n=pack.cells.burg[t];if(n)return n;let r=e.closest(`#labels [data-label-type='burg'][data-id], #burgIcons [data-id]`);return r?Number(r.dataset.id):void 0}),E({dialogId:D,columns:k,onUpdate:()=>v(D,{width:`fit-content`,position:O})}),a(`burgsOverviewRefresh`).addEventListener(`click`,P),a(`burgsGroupsEditorButton`).addEventListener(`click`,()=>g.BurgGroupEditor.open()),a(`burgsChart`).addEventListener(`click`,G),a(`burgsFilterState`).addEventListener(`change`,A.reset),a(`burgsFilterCulture`).addEventListener(`change`,A.reset),a(`burgsSearch`).addEventListener(`input`,A.reset),a(`regenerateBurgNames`).addEventListener(`click`,W),a(`addNewBurg`).addEventListener(`click`,()=>void g.BurgCreator.toggle()),a(`burgsExport`).addEventListener(`click`,K),a(`burgNamesImport`).addEventListener(`click`,q),a(`burgsListToLoad`).addEventListener(`change`,function(){t(this,J)}),a(`burgsLockAll`).addEventListener(`click`,X),a(`burgsRemoveAll`).addEventListener(`click`,Y)}function N(){document.getElementById(`addBurgTool`)?.classList.contains(`pressed`)&&g.BurgCreator.stop(),$(`#burgsOverview`).dialog(`destroy`),a(`burgsOverview`).remove()}function P(){F(),A.reset()}function F(e={}){let t=a(`burgsFilterState`),n=e.stateId==null?+t.value||-1:e.stateId;t.options.length=0,t.options.add(new Option(`all`,`-1`,!1,n===-1)),t.options.add(new Option(pack.states[0].name,`0`,!1,n===0)),pack.states.filter(e=>e.i&&!e.removed).sort((e,t)=>e.name>t.name?1:-1).forEach(e=>void t.options.add(new Option(e.name,String(e.i),!1,e.i===n)));let r=a(`burgsFilterCulture`),i=e.cultureId==null?+r.value||-1:e.cultureId;r.options.length=0,r.options.add(new Option(`all`,`-1`,!1,i===-1)),r.options.add(new Option(pack.cultures[0].name,`0`,!1,i===0)),pack.cultures.filter(e=>e.i&&!e.removed).sort((e,t)=>e.name>t.name?1:-1).forEach(e=>void r.options.add(new Option(e.name,String(e.i),!1,e.i===i)))}function I(){let e=a(`burgsSearch`).value.toLowerCase().trim(),t=+a(`burgsFilterState`).value,n=+a(`burgsFilterCulture`).value,r=pack.burgs.filter(e=>e.i&&!e.removed);return e&&(r=r.filter(t=>{let n=t.name.toLowerCase(),r=(pack.states[t.state]?.name||``).toLowerCase(),i=pack.cells.province[t.cell],a=i?pack.provinces[i]?.name.toLowerCase():``,o=(pack.cultures[t.culture]?.name||``).toLowerCase();return n.includes(e)||r.includes(e)||a.includes(e)||o.includes(e)||t.group.toLowerCase().includes(e)})),t!==-1&&(r=r.filter(e=>e.state===t)),n!==-1&&(r=r.filter(e=>e.culture===n)),r}function L(e){let t=a(`burgsBody`),r=pack.burgs.filter(e=>e.i&&!e.removed).length;t.querySelectorAll(`:scope > .states`).forEach(e=>{e.remove()});let i=``,o=0,c=0,l=0,u=0;for(let t of e.all){let e=t.population*populationRate*urbanization,r=n(t.product||0,2),i=n(t.population>0?(t.product||0)/t.population:0,2),a=n(t.treasury||0,2);o+=e,c+=r,l+=i,u+=a}for(let t of e.rows){let e=t.population*populationRate*urbanization,r=n(t.product||0,2),a=n(t.population>0?(t.product||0)/t.population:0,2),o=n(t.treasury||0,2),c=t.capital&&t.port?`a-capital-port`:t.capital?`c-capital`:t.port?`p-port`:`z-burg`,l=pack.states[t.state].name,u=pack.cells.province[t.cell],d=u?pack.provinces[u].name:``,f=pack.cultures[t.culture].name;i+=`<div
        class="states"
        data-id=${t.i}
        data-name="${t.name}"
        data-state="${l}"
        data-province="${d}"
        data-culture="${f}"
        data-group="${t.group}"
        data-population=${e}
        data-grossproduct=${r}
        data-productpercapita=${a}
        data-treasury=${o}
        data-features="${c}"
      >
        <span data-tip="Click to zoom into view" class="icon-dot-circled pointer" data-col="locate"></span>
        <input data-tip="Burg name" class="burgName" value="${t.name}" data-col="name" disabled />
        <input data-tip="Burg province" value="${d}" data-col="province" disabled />
        <input data-tip="Burg state" value="${l}" data-col="state" disabled />
        <input data-tip="Dominant culture" value="${f}" data-col="culture" disabled />
        <input data-tip="Burg group" value="${t.group}" data-col="group" disabled />
        <div data-col="population">
          <span data-tip="Burg population" class="icon-male"></span>
          <input data-tip="Burg population" value=${s(e)} disabled />
        </div>
        <div data-col="grossproduct">
          <span data-tip="Gross Product: local sale revenue minus purchased ingredient costs during the production.">🟡</span>
          <input data-tip="Gross Product: local sale revenue minus purchased ingredient costs during the production." value=${r} disabled />
        </div>
        <div data-col="productpercapita">
          <span data-tip="Wealth: gross product divided by population">🟡</span>
          <input data-tip="Wealth: gross product divided by population" value=${a} disabled />
        </div>
        <div data-col="treasury">
          <span data-tip="Treasury: accumulated cash balance">🟡</span>
          <input data-tip="Treasury: accumulated cash balance" value=${o} disabled />
        </div>
        <div data-col="features">
          <span
            data-tip="${t.capital?` This burg is a state capital`:`This burg is a NOT state capital`}"
            class="icon-star-empty${t.capital?``:` inactive`}" style="padding: 0 1px;"></span>
          <span data-tip="${t.port?` This burg is a port`:`This burg is NOT a port`}"
          class="icon-anchor${t.port?``:` inactive`}" style="font-size: .9em; padding: 0 1px;"></span>
        </div>
        <div data-col="actions">
          <span data-tip="Edit burg" class="icon-pencil"></span>
          <span class="locks pointer ${t.lock?`icon-lock`:`icon-lock-open inactive`}" onmouseover="showElementLockTip(event)"></span>
          <span data-tip="Remove burg" class="icon-trash-empty"></span>
        </div>
      </div>`}t.insertAdjacentHTML(`beforeend`,i),a(`burgsFooterBurgs`).innerHTML=`${e.all.length} of ${r}`,a(`burgsFooterPopulation`).innerHTML=e.all.length?s(o/e.all.length):`0`,a(`burgsFooterGrossProduct`).innerHTML=e.all.length?String(n(c/e.all.length,2)):`0`,a(`burgsFooterProductPerCapita`).innerHTML=e.all.length?String(n(l/e.all.length,2)):`0`,a(`burgsFooterTreasury`).innerHTML=e.all.length?String(n(u/e.all.length,2)):`0`,C(a(`burgsFooter`),e,A.goto),t.querySelectorAll(`div.states`).forEach(e=>void e.addEventListener(`mouseenter`,e=>R(e))),t.querySelectorAll(`div.states`).forEach(e=>void e.addEventListener(`mouseleave`,()=>z())),t.querySelectorAll(`div > span.icon-dot-circled`).forEach(e=>void e.addEventListener(`click`,B)),t.querySelectorAll(`div > span.locks`).forEach(e=>void e.addEventListener(`click`,V)),t.querySelectorAll(`div > span.icon-pencil`).forEach(e=>void e.addEventListener(`click`,H)),t.querySelectorAll(`div > span.icon-trash-empty`).forEach(e=>void e.addEventListener(`click`,U))}function R(e){let t=+e.target.dataset.id,n=i(`#labels`).select(`[data-label-type='burg'][data-id='${t}']`);n.size()&&n.classed(`drag`,!0)}function z(){i(`#labels`).selectAll(`text[data-label-type='burg'].drag`).classed(`drag`,!1)}function B(){let e=+this.closest(`.states`).dataset.id,{x:t,y:n}=pack.burgs[e];zoomTo(t,n,8,2e3)}function V(){let e=+this.closest(`.states`).dataset.id,t=pack.burgs[e];t.lock=!t.lock,this.classList.contains(`icon-lock`)?(this.classList.remove(`icon-lock`),this.classList.add(`icon-lock-open`),this.classList.add(`inactive`)):(this.classList.remove(`icon-lock-open`),this.classList.add(`icon-lock`),this.classList.remove(`inactive`))}function H(){let e=+this.closest(`.states`).dataset.id;g.BurgEditor.open(e)}function U(){let e=+this.closest(`.states`).dataset.id;if(pack.burgs[e].capital){m(`You cannot remove the capital. Please change the state capital first`,!1,`error`);return}h({title:`Remove burg`,message:`Are you sure you want to remove the burg? <br>This action cannot be reverted`,confirm:`Remove`,onConfirm:()=>{Burgs.remove(e),A.refresh(),b()}})}function W(){for(let e of I())e.lock||(e.name=Names.getCulture(e.culture));A.refresh(),b()}function G(){let e=pack.states.map(e=>{let t=e.color?e.color:`#ccc`,n=e.fullName?e.fullName:e.name;return{id:e.i,state:e.i?0:null,color:t,name:n}}),t=pack.burgs.filter(e=>e.i&&!e.removed).map(t=>{let n=t.i+e.length-1,r=t.population,i=t.capital,a=pack.cells.province[t.cell],o=a?a+e.length-1:t.state;return{id:n,i:t.i,state:t.state,culture:t.culture,province:a,parent:o,name:t.name,population:r,capital:i,x:t.x,y:t.y}}),n=e.concat(t);if(n.length<2){m(`No burgs to show`,!1,`error`);return}let r=f().parentId(e=>e.state)(n).sum(e=>e.population).sort((e,t)=>t.value-e.value),o=a(`uiSize`).valueAsNumber,c=150+200*o,l=150+200*o,u={top:0,right:-50,bottom:-10,left:-50},d=c-u.left-u.right,h=l-u.top-u.bottom,g=p().size([d,h]).padding(3);alertMessage.innerHTML=`<select id="burgsTreeType" style="display:block; margin-left:13px; font-size:11px">
      <option value="states" selected>Group by state</option>
      <option value="cultures">Group by culture</option>
      <option value="parent">Group by province and state</option>
      <option value="provinces">Group by province</option>
    </select>`,alertMessage.innerHTML+=`<div id='burgsInfo' class='chartInfo'>&#8205;</div>`;let _=i(`#alertMessage`).insert(`svg`,`#burgsInfo`).attr(`id`,`burgsTree`).attr(`width`,c).attr(`height`,l-10).attr(`stroke-width`,2).append(`g`).attr(`transform`,`translate(-50, -10)`);a(`burgsTreeType`).addEventListener(`change`,x),g(r);let v=_.selectAll(`circle`).data(r.leaves()).join(`circle`).attr(`data-id`,e=>e.data.i).attr(`r`,e=>e.r).attr(`fill`,e=>e.parent.data.color).attr(`cx`,e=>e.x).attr(`cy`,e=>e.y).on(`mouseenter`,(e,t)=>y(e,t)).on(`mouseleave`,e=>b(e)).on(`click`,(e,t)=>zoomTo(t.data.x,t.data.y,8,2e3));function y(e,t){i(e.target).transition().duration(1500).attr(`stroke`,`#c13119`);let n=t.data.name,r=t.parent.data.name,o=s(t.value*populationRate*urbanization);a(`burgsInfo`).innerHTML=`${n}. ${r}. Population: ${o}`,R(e),m(`Click to zoom into view`)}function b(e){z(),a(`burgsInfo`)&&(a(`burgsInfo`).innerHTML=`&#8205;`,i(e.target).transition().attr(`stroke`,null),m(``))}function x(){let e=()=>pack.states.map(e=>{let t=e.color?e.color:`#ccc`,n=e.fullName?e.fullName:e.name;return{id:e.i,state:e.i?0:null,color:t,name:n}}),n=()=>pack.cultures.map(e=>{let t=e.color?e.color:`#ccc`;return{id:e.i,culture:e.i?0:null,color:t,name:e.name}}),r=()=>{let e=pack.states.map(e=>{let t=e.color?e.color:`#ccc`,n=e.fullName?e.fullName:e.name;return{id:e.i,parent:e.i?0:null,color:t,name:n}}),t=pack.provinces.filter(e=>e.i&&!e.removed).map(t=>({id:t.i+e.length-1,parent:t.state,color:t.color,name:t.fullName}));return e.concat(t)},i=()=>pack.provinces.map(e=>{let t=e.color?e.color:`#ccc`,n=e.fullName?e.fullName:e.name;return{id:e.i?e.i:0,province:e.i?0:null,color:t,name:n}}),a=e=>{if(this.value===`states`)return e.state;if(this.value===`cultures`)return e.culture;if(this.value===`parent`)return e.parent;if(this.value===`provinces`)return e.province},o={states:e,cultures:n,parent:r,provinces:i}[this.value]();t.forEach(e=>{e.id=e.i+o.length-1});let s=o.concat(t),c=f().parentId(e=>a(e))(s).sum(e=>e.population).sort((e,t)=>t.value-e.value);v.data(g(c).leaves()).transition().duration(2e3).attr(`data-id`,e=>e.data.i).attr(`fill`,e=>e.parent.data.color).attr(`cx`,e=>e.x).attr(`cy`,e=>e.y).attr(`r`,e=>e.r)}$(`#alert`).dialog({title:`Burgs bubble chart`,width:`fit-content`,position:{my:`left bottom`,at:`left+10 bottom-10`,of:`svg`},buttons:{},close:()=>alertMessage.innerHTML=``})}function K(){let t=`Id,Burg,Province,Province Full Name,State,State Full Name,Culture,Religion,Group,Population,X,Y,Latitude,Longitude,Elevation (${heightUnit.value}),Temperature,Temperature likeness,Capital,Port,Citadel,Walls,Plaza,Temple,Shanty Town,Emblem,Preview link\n`;pack.burgs.filter(e=>e.i&&!e.removed).forEach(r=>{t+=`${r.i},`,t+=`${r.name},`;let i=pack.cells.province[r.cell];t+=i?`${pack.provinces[i].name},`:`,`,t+=i?`${pack.provinces[i].fullName},`:`,`,t+=`${pack.states[r.state].name},`,t+=`${pack.states[r.state].fullName},`,t+=`${pack.cultures[r.culture].name},`,t+=`${pack.religions[pack.cells.religion[r.cell]].name},`,t+=`${r.group},`,t+=`${n(r.population*populationRate*urbanization)},`,t+=`${r.x},`,t+=`${r.y},`,t+=`${e(r.y,mapCoordinates,graphHeight,2)},`,t+=`${c(r.x,mapCoordinates,graphWidth,2)},`,t+=`${parseInt(o(pack.cells.h[r.cell]),10)},`;let a=grid.cells.temp[pack.cells.g[r.cell]];t+=`${l(a)},`,t+=`${u(a)},`,t+=r.capital?`capital,`:`,`,t+=r.port?`port,`:`,`,t+=r.citadel?`citadel,`:`,`,t+=r.walls?`walls,`:`,`,t+=r.plaza?`plaza,`:`,`,t+=r.temple?`temple,`:`,`,t+=r.shanty?`shanty town,`:`,`,t+=r.coa?`${JSON.stringify(r.coa).replace(/"/g,``).replace(/,/g,`;`)},`:`,`,t+=Burgs.getPreview(r).link,t+=`
`});let i=`${r(`Burgs`)}.csv`;d(t,i)}function q(){alertMessage.innerHTML=`Download burgs list as a text file, make changes and re-upload the file. Make sure the file is a plain text document with each
    name on its own line (the dilimiter is CRLF). If you do not want to change the name, just leave it as is`,$(`#alert`).dialog({title:`Burgs bulk renaming`,width:`22em`,position:{my:`center`,at:`center`,of:`svg`},buttons:{Download:()=>{d(pack.burgs.filter(e=>e.i&&!e.removed).map(e=>e.name).join(`\r
`),`${r(`Burg names`)}.txt`)},Upload:()=>a(`burgsListToLoad`).click(),Cancel:function(){$(this).dialog(`close`)}}})}function J(e){if(!e){m(`Cannot load the file, please check the format`,!1,`error`);return}let t=e.replace(/\r\n|\r/g,`
`).split(`
`).filter(Boolean);if(!t.length){m(`Cannot parse the list, please check the file format`,!1,`error`);return}let n=[],r=`Burgs to be renamed as below:`;r+=`<table class="overflow-table"><tr><th>Id</th><th>Current name</th><th>New Name</th></tr>`;let i=pack.burgs.filter(e=>e.i&&!e.removed);for(let e=0;e<t.length&&e<=i.length;e++){let a=t[e];!a||!i[e]||a===i[e].name||(n.push({id:i[e].i,name:a}),r+=`<tr><td style="width:20%">${i[e].i}</td><td style="width:40%">${i[e].name}</td><td style="width:40%">${a}</td></tr>`)}r+=`</tr></table>`,n.length||(r=`No changes found in the file. Please change some names to get a result`),alertMessage.innerHTML=r,h({title:`Burgs bulk renaming`,message:r,confirm:`Rename`,onConfirm:()=>{for(let e=0;e<n.length;e++){let t=n[e].id;pack.burgs[t].name=n[e].name}A.refresh(),b()}})}function Y(){let e=pack.burgs.filter(e=>e.i&&!e.removed&&!e.capital&&!e.lock).length;h({title:`Remove ${e} burgs`,message:`
        Are you sure you want to remove all <i>unlocked</i> burgs except for capitals?
        <br><i>To remove a capital you have to remove its state first</i>`,confirm:`Remove`,onConfirm:()=>{pack.burgs.filter(e=>e.i&&!(e.capital||e.lock)).forEach(e=>void Burgs.remove(e.i)),A.refresh(),b()}})}function X(){let e=pack.burgs.filter(e=>e.i&&!e.removed),t=e.every(e=>e.lock);e.forEach(e=>{e.lock=!t}),A.refresh(),a(`burgsLockAll`).className=t?`icon-lock`:`icon-lock-open`}function Z(){let e=pack.burgs.every(({lock:e,i:t,removed:n})=>e||!t||n);a(`burgsLockAll`).className=e?`icon-lock-open`:`icon-lock`}var Q={open:j};export{Q as BurgsOverview};