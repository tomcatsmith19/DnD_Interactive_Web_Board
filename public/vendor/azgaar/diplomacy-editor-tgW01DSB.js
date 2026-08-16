import{K as e,S as t,Sn as n,U as r,W as i,gt as a,ln as o,rn as s,x as c}from"./utils-BYaxf2yO.js";import{r as l,t as u}from"./tooltips-CSQuPvuv.js";import{N as d,Nt as f,P as p,Pt as m,jt as h,kt as g}from"./index-DqeJMjPz.js";import{t as _}from"./highlighting-CH83CMtN.js";import{i as v,n as y,r as b,t as x}from"./table-BDnPiVU4.js";var S={Ally:{inText:`is an ally of`,color:`#00b300`,tip:`Allies formed a defensive pact and protect each other in case of third party aggression`},Friendly:{inText:`is friendly to`,color:`#d4f8aa`,tip:`State is friendly to anouther state when they share some common interests`},Neutral:{inText:`is neutral to`,color:`#edeee8`,tip:`Neutral means states relations are neither positive nor negative`},Suspicion:{inText:`is suspicious of`,color:`#eeafaa`,tip:`Suspicion means state has a cautious distrust of another state`},Enemy:{inText:`is at war with`,color:`#e64b40`,tip:`Enemies are states at war with each other`},Unknown:{inText:`does not know about`,color:`#a9a9a9`,tip:`Relations are unknown if states do not have enough information about each other`},Rival:{inText:`is a rival of`,color:`#ad5a1f`,tip:`Rivalry is a state of competing for dominance in the region`},Vassal:{inText:`is a vassal of`,color:`#87CEFA`,tip:`Vassal is a state having obligation to its suzerain`},Suzerain:{inText:`is suzerain to`,color:`#00008B`,tip:`Suzerain is a state having some control over its vassals`}},C=`diplomacyEditor`,w={my:`right top`,at:`right-10 top+10`,of:`svg`,collision:`fit`},T=0,E=[{key:`name`,label:`State`,width:`15em`,permanent:!0,sortBy:e=>e.fullName||e.name,sortType:`alpha`},{key:`relations`,label:`Relations`,width:`7em`,sortBy:e=>e.diplomacy?.[T]??``,sortType:`alpha`},{key:`actions`,width:`1.4em`,permanent:!0}],D=y({getData:()=>p(C,pack.states.filter(e=>e.i&&!e.removed&&e.i!==T),E),onUpdate:M}),O=()=>pack.states[0].diplomacy;function k(){if(!customization){if(pack.states.filter(e=>e.i&&!e.removed).length<2){l(`There should be at least 2 states to edit the diplomacy`,!1,`error`);return}(!T||!pack.states[T]||pack.states[T].removed)&&(T=pack.states.find(e=>e.i&&!e.removed).i),g(`#${C}, .stable`),layerIsOn(`toggleStates`)||toggleStates(),layerIsOn(`toggleBorders`)||toggleBorders(),layerIsOn(`toggleProvinces`)&&toggleProvinces(),layerIsOn(`toggleCultures`)&&toggleCultures(),layerIsOn(`toggleBiomes`)&&toggleBiomes(),layerIsOn(`toggleReligions`)&&toggleReligions(),A(),j(),n(`#viewbox`).style(`cursor`,`crosshair`).on(`click`,I),$(`#${C}`).dialog({title:`Diplomacy Editor`,resizable:!1,width:`fit-content`,close:q,position:w})}}function A(){h(C);let e=`<div id="${C}" class="dialog stable editorDialog">
      ${b({dialogId:C,columns:E})}
      <div id="diplomacyBodySection" class="table"></div>
      <div id="diplomacyFooter" class="totalLine"><div>States: <span id="diplomacyFooterStates">0</span></div></div>
      <div class="info-line">Click on state name to see relations.<br />Click on relations name to change it</div>
      <div id="diplomacyBottom" style="margin-top: 0.1em">
        <button id="diplomacyEditorRefresh" data-tip="Refresh the Editor" class="icon-cw"></button>
        <button
          id="diplomacyEditStyle"
          data-tip="Edit states (including diplomacy view) style in Style Editor"
          class="icon-adjust"
        ></button>
        <button id="diplomacyRegenerate" data-tip="Regenerate diplomatical relations" class="icon-retweet"></button>
        <button
          id="diplomacyReset"
          data-tip="Reset diplomatical relations of selected state to Neutral"
          class="icon-eraser"
        ></button>
        <button id="diplomacyHistory" data-tip="Show relations history" class="icon-hourglass-1"></button>
        <button id="diplomacyShowMatrix" data-tip="Show relations matrix" class="icon-list-bullet"></button>
        <button
          id="diplomacyExport"
          data-tip="Save state relations matrix as a text file (.csv)"
          class="icon-download"
        ></button>
      </div>
  </div>`;r(`dialogs`).insertAdjacentHTML(`beforeend`,e),d(C,D.reset),_(C,({cellId:e})=>pack.cells.state[e]),x({dialogId:C,columns:E,onUpdate:()=>f(C,{width:`fit-content`,position:w})}),r(`diplomacyEditorRefresh`).addEventListener(`click`,j),r(`diplomacyEditStyle`).addEventListener(`click`,()=>editStyle(`regions`)),r(`diplomacyRegenerate`).addEventListener(`click`,z),r(`diplomacyReset`).addEventListener(`click`,B),r(`diplomacyShowMatrix`).addEventListener(`click`,U),r(`diplomacyHistory`).addEventListener(`click`,V),r(`diplomacyExport`).addEventListener(`click`,K),r(`diplomacyBodySection`).addEventListener(`click`,e=>{let t=e.target,n=t.closest(`.states`);if(!(!n||n.classList.contains(`Self`))){if(t.closest(`.changeRelations`)){let e=+n.dataset.id,t=+r(`diplomacyBodySection`).querySelector(`div.Self`).dataset.id,i=n.dataset.relations;L(e,t,i);return}T=+n.dataset.id,j()}})}function j(){D.reset(),F()}function M(e){let t=r(`diplomacyBodySection`),n=pack.states,i=T,a=n[i].name;COArenderer.trigger(`stateCOA${i}`,n[i].coa);let o=`<div class="states Self" data-id=${i} data-tip="List below shows relations to ${a}">
    <div data-col="name"><svg class="coaIcon" viewBox="0 0 200 200"><use href="#stateCOA${i}"></use></svg><span>${n[i].fullName}</span></div>
    <div data-col="relations"></div>
    <div data-col="actions"></div>
  </div>`;for(let t of e.rows){let e=t.diplomacy[i],{color:n,inText:r}=S[e],s=`${t.name} ${r} ${a}`,c=`${s}. Click to see relations to ${t.name}`,l=`Click to change relations. ${s}`,u=t.fullName.length<23?t.fullName:t.name;COArenderer.trigger(`stateCOA${t.i}`,t.coa),o+=`<div class="states" data-id=${t.i} data-name="${u}" data-relations="${e}">
      <div data-col="name" data-tip="${c}"><svg class="coaIcon" viewBox="0 0 200 200"><use href="#stateCOA${t.i}"></use></svg><span>${u}</span></div>
      <div data-col="relations" data-tip="${l}" class="changeRelations">
        <fill-box fill="${n}" size=".9em"></fill-box>
        ${e}
      </div>
      <div data-col="actions"></div>
    </div>`}t.innerHTML=o,t.querySelectorAll(`div.states`).forEach(e=>{e.addEventListener(`mouseenter`,N)}),t.querySelectorAll(`div.states`).forEach(e=>{e.addEventListener(`mouseleave`,P)}),r(`diplomacyFooterStates`).textContent=String(e.all.length+1),v(r(`diplomacyFooter`),e,D.goto),f(C,{width:`fit-content`,position:w})}function N(e){if(!layerIsOn(`toggleStates`))return;let t=+e.target.dataset.id;if(customization||!t)return;let r=n(`#regions`).select(`#state${t}`).attr(`d`),i=n(`#debug`).append(`path`).attr(`class`,`highlight`).attr(`d`,r).attr(`fill`,`none`).attr(`stroke`,`red`).attr(`stroke-width`,1).attr(`opacity`,1).attr(`filter`,`url(#blur1)`),a=i.node().getTotalLength(),o=(a+5e3)/2,c=s(`0,${a}`,`${a},${a}`);i.transition().duration(o).attrTween(`stroke-dasharray`,()=>e=>c(e))}function P(){n(`#debug`).selectAll(`.highlight`).each(function(){n(this).transition().duration(1e3).attr(`opacity`,0).remove()})}function F(){let e=r(`diplomacyBodySection`).querySelector(`div.Self`),t=e?+e.dataset.id:pack.states.find(e=>e.i&&!e.removed).i;t&&(layerIsOn(`toggleStates`)||toggleStates(),n(`#statesBody`).selectAll(`path`).each(function(){if(this.id.slice(0,9)===`state-gap`)return;let e=+this.id.slice(5),r=S[pack.states[e].diplomacy[t]]?.color||`#4682b4`;this.setAttribute(`fill`,r),n(`#statesBody`).select(`#state-gap${e}`).attr(`stroke`,r),n(`#statesHalo`).select(`#state-border${e}`).attr(`stroke`,o(r).darker().hex())}))}function I(t){let n=e(t,this),i=findCell(n[0],n[1]),a=pack.cells.state[i];if(!a)return;let o=r(`diplomacyBodySection`).querySelector(`div.Self`);+o.dataset.id!==a&&(o.classList.remove(`Self`),r(`diplomacyBodySection`).querySelector(`div[data-id='${a}']`).classList.add(`Self`),j())}function L(e,t,n){let i=pack.states,a=i[e],o=Object.entries(S).map(([e,{color:t,inText:r,tip:i}])=>`
        <div data-tip="${i}">
          <label class="pointer">
            <input type="radio" name="relationSelect" value="${e}"
            ${n===e?`checked`:``} >
            <fill-box fill="${t}" size=".8em"></fill-box>
            ${r}
        </label>
        </div>
      `).join(``),s=i.filter(t=>t.i&&!t.removed&&t.i!==e).map(e=>`
        <div data-tip="${e.fullName}">
          <input id="selectState${e.i}" class="checkbox" type="checkbox" name="objectSelect" value="${e.i}"
          ${e.i===t?`checked`:``} />
          <label for="selectState${e.i}" class="checkbox-label">
            <svg class="coaIcon" viewBox="0 0 200 200">
              <use href="#stateCOA${e.i}"></use>
            </svg>
            ${e.fullName}
          </label>
        </div>
      `).join(``);alertMessage.innerHTML=`
    <form id='relationsForm' style="overflow: hidden; display: flex; flex-direction: column; gap: .3em; padding: 0.1em 0;">
      <header>
        <svg class="coaIcon" viewBox="0 0 200 200">
          <use href="#stateCOA${a.i}"></use>
        </svg>
        <b>${a.fullName}</b>
      </header>

      <main style='display: flex; gap: 1em;'>
        <section style="display: flex; flex-direction: column; gap: .3em;">${o}</section>
        <section style="display: flex; flex-direction: column; gap: .3em;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.3em;">
            <label style="font-weight: 500; font-size: 0.95em;">States:</label>
            <button id="selectAllNoneBtn" type="button" style="padding: 0.3em 0.8em; cursor: pointer; font-size: 0.9em;" data-tip="Toggle selection of all states. Also supports Ctrl+A.">Select All / None</button>
          </div>
          <div id="stateSelectionContainer" style="display: flex; flex-direction: column; gap: .3em;">${s}</div>
        </section>
      </main>
    </form>
  `,$(`#alert`).dialog({width:`fit-content`,title:`Change relations`,buttons:{Apply:function(){let t=new FormData(r(`relationsForm`)),i=t.get(`relationSelect`),a=[...t.getAll(`objectSelect`)].map(Number);for(let t of a)R(e,t,n,i);$(this).dialog(`close`)},Cancel:function(){$(this).dialog(`close`)}}});let c=r(`selectAllNoneBtn`),l=()=>document.querySelectorAll(`#stateSelectionContainer input[name='objectSelect']`);function u(){let e=l();Array.from(e).every(e=>e.checked)&&e.length>0?c.classList.add(`pressed`):c.classList.remove(`pressed`)}function d(){let e=l(),t=!Array.from(e).every(e=>e.checked);e.forEach(e=>{e.checked=t}),u()}c.addEventListener(`click`,e=>{e.preventDefault(),d()}),u()}function R(e,t,n,r){if(r===n)return;let o=pack.states,s=O(),c=o[e].name,l=o[t].name;o[e].diplomacy[t]=r,o[t].diplomacy[e]=r===`Vassal`?`Suzerain`:r===`Suzerain`?`Vassal`:r;let u=()=>[`Relations change`,`${c}-${a(l)} relations changed to ${r.toLowerCase()}`],d=()=>[`Defence pact`,`${c} entered into defensive pact with ${l}`],f=()=>[`Vassalization`,`${c} became a vassal of ${l}`],p=()=>[`Vassalization`,`${c} vassalized ${l}`],m=()=>[`Rivalization`,`${c} and ${l} became rivals`],h=()=>[`Relations severance`,`${c} recalled their ambassadors and wiped all the records about ${l}`];n===`Enemy`?s.push([`War termination`,`${c} and ${l} agreed to cease fire and signed a peace treaty`,(r===`Ally`?d():r===`Vassal`?f():r===`Suzerain`?p():r===`Unknown`?h():u())[1]]):r===`Enemy`?s.push([`War declaration`,`${c} declared a war on its enemy ${l}`]):r===`Vassal`?s.push(f()):r===`Suzerain`?s.push(p()):r===`Ally`?s.push(d()):r===`Unknown`?s.push(h()):r===`Rival`?s.push(m()):s.push(u()),j(),i(`diplomacyMatrix`)&&U()}function z(){States.generateDiplomacy(),j()}function B(){let e=+r(`diplomacyBodySection`).querySelector(`div.Self`).dataset.id;if(!e)return;let t=pack.states;t[e].diplomacy.forEach((n,r)=>{n!==`x`&&(t[e].diplomacy[r]=`Neutral`,t[r].diplomacy[e]=`Neutral`)}),j()}function V(){let e=O(),n=`<div autocorrect="off" spellcheck="false">`;e.forEach((e,t)=>{n+=`<div>`,e.forEach((e,r)=>{n+=`<div contenteditable="true" data-id="${t}-${r}"
        ${r?``:`style='font-weight:bold'`}>${e}</div>`}),n+=`&#8205;</div>`}),e.length||(pack.states[0].diplomacy=[[]],n+=`<div><div contenteditable="true" data-id="0-0">No historical records</div>&#8205;</div>`),alertMessage.innerHTML=`${n}</div><div class="info-line">Type to edit. Press Enter to add a new line, empty the element to remove it</div>`,alertMessage.querySelectorAll(`div[contenteditable='true']`).forEach(e=>{e.addEventListener(`input`,H)}),$(`#alert`).dialog({title:`Relations history`,position:{my:`center`,at:`center`,of:`svg`},buttons:{Save:function(){c(this.querySelector(`div`).innerText.split(`
`).join(`\r
`),`${t(`Relations history`)}.txt`)},Clear:function(){pack.states[0].diplomacy=[],$(this).dialog(`close`)},Close:function(){$(this).dialog(`close`)}}})}function H(){let e=this.dataset.id.split(`-`),t=O()[+e[0]];this.innerHTML===``?(t.splice(+e[1],1),this.remove()):t[+e[1]]=this.innerHTML}function U(){W();let e=pack.states.filter(e=>e.i&&!e.removed),t=e.map(e=>e.i),n=r(`diplomacyMatrixBody`),i=`<table><thead><tr><th data-tip='&#8205;'></th>`;i+=`${e.map(e=>`<th data-tip='Relations to ${e.fullName}'>${e.name}</th>`).join(``)}</tr>`,i+=`<tbody>`,e.forEach(e=>{i+=`<tr data-id=${e.i}><th data-tip='Relations of ${e.fullName}'>${e.name}</th>${e.diplomacy.filter((e,n)=>t.includes(n)).map((n,r)=>{let i=S[n];if(!i)return`<td class='${n}'>${n}</td>`;let a=pack.states[t[r]],o=`${e.fullName} ${i.inText} ${a.fullName}`;return`<td data-id=${a.i} data-tip='${o}' class='${n}'>${n}</td>`}).join(``)}</tr>`}),i+=`</tbody></table>`,n.innerHTML=i,n.querySelector(`table`).addEventListener(`click`,e=>{let t=e.target;if(t.tagName!==`TD`)return;let n=t.innerText;S[n]&&L(+t.closest(`tr`).dataset.id,+t.dataset.id,n)}),$(`#diplomacyMatrix`).dialog({title:`Relations matrix`,position:{my:`center`,at:`center`,of:`svg`},close:G,buttons:{}})}function W(){h(`diplomacyMatrix`),r(`dialogs`).insertAdjacentHTML(`beforeend`,`<div id="diplomacyMatrix" class="dialog">
      <div id="diplomacyMatrixBody" class="matrix-table"></div>
    </div>`)}function G(){$(`#diplomacyMatrix`).dialog(`destroy`),r(`diplomacyMatrix`).remove()}function K(){let e=pack.states.filter(e=>e.i&&!e.removed),n=e.map(e=>e.i),r=`,${e.map(e=>e.name).join(`,`)}\n`;e.forEach(e=>{let t=e.diplomacy.filter((e,t)=>n.includes(t));r+=`${e.name},${t.join(`,`)}\n`});let i=`${t(`Relations`)}.csv`;c(r,i)}function q(){m(),u();let e=r(`diplomacyBodySection`).querySelector(`div.Self`);e&&e.classList.remove(`Self`),layerIsOn(`toggleStates`)?drawStates():toggleStates(),n(`#debug`).selectAll(`.highlight`).remove(),$(`#${C}`).dialog(`destroy`),r(C).remove()}var J={open:k};export{J as DiplomacyEditor};