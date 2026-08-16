import{Ft as e,In as t,U as n,mt as r,w as i}from"./utils-BYaxf2yO.js";import{r as a}from"./tooltips-CSQuPvuv.js";import{E as o,Lt as s,Mt as c,_ as l,jt as u,mt as d,q as f,v as p,wt as m}from"./index-DqeJMjPz.js";function h(r,o){let h=Array.from(n(`good-icons`).querySelectorAll(`symbol`)).map(e=>e.id),x={...r?.demandCoverage||{}},S={...r?.biomeOutput||{}},C=()=>{let e=p.map(e=>[e,x[e]??0]).filter(([,e])=>e>0);return e.length?e.map(([e,t])=>`${l[e]} ${i(e)}: ${t}`).join(`, `):`none`},w=()=>{let e=Object.entries(S).filter(([,e])=>(e??0)>0);return e.length?e.map(([e,t])=>`${pack.biomes[Number(e)].name}: ${t}`).join(`, `):`none`},T={cultureType:{...r?.multipliers?.cultureType??{}},culture:{...r?.multipliers?.culture??{}},state:{...r?.multipliers?.state??{}},religion:{...r?.multipliers?.religion??{}},biome:{...r?.multipliers?.biome??{}},zone:{...r?.multipliers?.zone??{}}},E=t=>{let n=T[t]??{},r=Object.entries(n).filter(([,e])=>e!==1);return r.length?r.map(([n,r])=>`${g(t,n)} ×${e(r,2)}`).join(`, `):`none`},D=(e,t)=>`
      <label data-tip="Production multiplier by ${t.toLowerCase()}. 1 = no effect, 0 = fully suppressed.">${t}</label>
      <div class="ge-edit-row">
        <span id="mSummary_${e}">${E(e)}</span>
        <button class="mEdit icon-pencil ge-edit" data-dim="${e}" data-tip="Edit ${t} multipliers"></button>
      </div>`,O=r?.recipes||[],k;A(),$(k).dialog({width:`30em`,resizable:!1,title:r?`Edit good`:`Add new good`,open:function(){r&&(this.parentElement?.querySelector(`.ui-dialog-buttonpane`))?.insertAdjacentHTML(`afterbegin`,`<div class="dontAsk" data-tip="Re-place this good and recompute production, trade and taxes. Uncheck to update the good only, without disturbing the current economy.">
          <input id="goodRegenerateEconomy" class="checkbox" type="checkbox" checked />
          <label for="goodRegenerateEconomy" class="checkbox-label"><i>regenerate economy on apply</i></label>
        </div>`)},close:()=>{u(`goodEditor`)},buttons:{Cancel:function(){$(this).dialog(`close`)},[r?`Apply`:`Add`]:()=>{let e=[],i=n(`newGoodName`).value.trim(),s=t(n(`newGoodTags`).value.trim().split(`,`).map(e=>e.trim().toLocaleLowerCase())),l=+n(`newGoodValue`).value,u=+n(`newGoodChance`).value,p=n(`newGoodUnit`).value.trim(),h=n(`newGoodIcon`).value,g=n(`newGoodColor`).value,_=n(`newGoodDistribution`).textContent?.trim()??``;if(i||e.push(`Name is required`),(!Number.isFinite(l)||l<0)&&e.push(`Value must be a valid non-negative number`),(!Number.isFinite(u)||u<0||u>100)&&e.push(`Chance must be between 0 and 100`),_)try{let e=Goods.getMethods(),t=`{${Object.keys(e).join(`, `)}}`;Function(t,`return ${_}`)(e)}catch(t){e.push(`Distribution function is invalid: ${t.message||t}`)}for(let t of O){for(let[n,r]of Object.entries(t)){let t=Number(n),i=Goods.get(t);i||e.push(`Recipe references unknown good id: ${t}`);let a=Number(r);(Number.isNaN(a)||!Number.isFinite(a)||a<=0)&&e.push(`Invalid recipe amount for good ${i?.name}`)}Object.keys(t).length||e.push(`Each recipe must have at least one ingredient`)}if(n(`newGoodError`).textContent=e.join(`. `),e.length)return;function v(){let e={};for(let[t,n]of Object.entries(T)){let r=Object.fromEntries(Object.entries(n??{}).filter(([,e])=>e!==void 0&&e!==1));Object.keys(r).length&&(e[t]=r)}return Object.keys(e).length?e:void 0}r?(r.name=i,r.tags=s,r.icon=h,r.color=g,r.value=l,r.chance=u,r.unit=p,r.demandCoverage=x,r.multipliers=v(),r.distribution=_||void 0,r.biomeOutput=Object.keys(S).length?S:void 0,r.recipes=O.length?O:void 0,n(`goodRegenerateEconomy`).checked?(Goods.regeneratePlacement(r.i),Production.regenerateEconomy(),layerIsOn(`toggleMarketsLayer`)&&d(),layerIsOn(`toggleGoods`)&&m(),layerIsOn(`toggleTrade`)&&f.restart(),c()):Goods.sync()):(pack.goods.push({i:(()=>{let e=pack.goods?.at(-1)?.i??1;for(;Goods.get(e);)e++;return e})(),name:i,tags:s,icon:h,color:g,value:l,chance:u,unit:p,demandCoverage:x,multipliers:v(),distribution:_||void 0,biomeOutput:Object.keys(S).length?S:void 0,recipes:O.length?O:void 0}),Goods.sync()),a(r?`Good is updated`:`Good is added`,!1,`success`,5e3),o?.(),$(k).dialog(`close`)}}});function A(){u(`goodEditor`),n(`dialogs`).insertAdjacentHTML(`beforeend`,`<div id="goodEditor" class="dialog">
    <style>
      .ge                 { display:flex; width: auto !important; flex-direction:column; gap:9px; max-height:72vh; overflow-y:auto; padding-right:2px; }
      .ge-section-title   { display:flex; align-items:center; justify-content:space-between; font-weight:bold; text-transform:uppercase; font-size:.8em; letter-spacing:.06em; margin-bottom:7px; padding-bottom:4px; border-bottom:1px solid #666; }
      .ge-grid            { display:grid; grid-template-columns:9em minmax(0, 1fr); gap:.2em; align-items:center; }
      .ge-grid--top       { align-items:start; }
      .ge-grid > *        { min-width:0; }
      .ge-grid > label    { color:#555; }
      .ge-field           { width:100%; }
      input.ge-num        { width:6em; }
      .ge-inline          { display:flex; align-items:center; gap:.4em; }
      .ge-icon-select     { flex:1; min-width:0; }
      .ge-icon-preview    { flex-shrink:0; }
      .ge-color           { width:2.4em; height:1.4em; padding:0; border:none; flex-shrink:0; }
      .ge-edit-row        { display:flex; align-items:flex-start; justify-content:space-between; gap:6px; }
      .ge-edit-row > span { flex:1; min-width:0; }
      .ge-edit            { flex-shrink:0; }
      .ge-dist            { flex:1; min-width:0; color:#555; font-size:.9em; font-family:var(--monospace); word-break:break-all; }
      .ge-note            { color:#777; font-style:italic; font-size:.9em; }
      .ge-error           { color:#b20000; min-height:1.2em; }
      .ge-recipe-list     { display:flex; flex-direction:column; gap:.45em; }
      .ge-recipe          { border:1px solid #ccc; border-radius:3px; }
      .ge-recipe-head     { display:flex; align-items:center; justify-content:space-between; padding:.2em .3em; }
      .ge-recipe-actions  { display:flex; gap:.3em; }
      .ge-recipe-ings     { display:flex; flex-direction:column; gap:.2em; padding:.3em .4em; }
      .ge-recipe-ing      { display:grid; grid-template-columns:1fr 5em 1.5em; gap:.25em; align-items:center; }
    </style>

    <div class="ge">
      <div>
        <div class="ge-section-title">General</div>
        <div class="ge-grid">
          <label for="newGoodName">Name*</label>
          <input id="newGoodName" class="ge-field" value="${r?.name||``}" />

          <label for="newGoodTags">Tags</label>
          <input id="newGoodTags" class="ge-field" value="${r?.tags.join(`, `)||``}" placeholder="comma separated" />

          <label for="newGoodValue">Base Price*</label>
          <span class="ge-inline"><input id="newGoodValue" class="ge-num" type="number" min="0" step="1" value="${r?.value??1}" /> 🟡</span>

          <label for="newGoodChance">Chance</label>
          <input id="newGoodChance" class="ge-num" type="number" min="0" max="100" step="0.1" value="${r?.chance??1}" />

          <label for="newGoodUnit">Unit</label>
          <input id="newGoodUnit" class="ge-field" placeholder="e.g. wagon, barrel" value="${r?.unit||``}" />

          <label for="newGoodIcon">Icon*</label>
          <div class="ge-inline">
            <select id="newGoodIcon" class="ge-icon-select">${h.map(e=>`<option value="${e}" ${r?.icon===e?`selected`:``}>${e}</option>`).join(``)}</select>
            <svg class="ge-icon-preview" width="2em" height="2em">
              <circle id="newGoodIconCircle" cx="50%" cy="50%" r="42%" fill="${r?.color||`#ff5959`}" stroke="${Goods.getStroke(r?.color||`#ff5959`)}"/>
              <use id="newGoodIconPreview" href="#${r?.icon||`good-unknown`}" x="10%" y="10%" width="80%" height="80%"/>
            </svg>
            <button id="newGoodUploadIconRaster" class="icon-upload" data-tip="Upload raster icon"></button>
            <button id="newGoodUploadIconVector" class="icon-upload-cloud" data-tip="Upload vector (SVG) icon"></button>
            <input id="newGoodColor" class="ge-color" type="color" data-tip="Set a stroke color" value="${r?.color||`#ff5959`}" />
          </div>

          <label data-tip="How much of each demand category this good satisfies. Click the pencil icon to edit.">Demand Coverage</label>
          <div class="ge-edit-row">
            <span id="demandCoverageSummary" >${C()}</span>
            <button class="dcEdit icon-pencil ge-edit" data-tip="Edit demand coverage"></button>
          </div>
        </div>
      </div>

      <div>
        <div class="ge-section-title">Raw Production</div>
        <div class="ge-grid ge-grid--top">
          <label data-tip="For raw resources: sets the baseline production per biome">Rural production</label>
          <div class="ge-edit-row">
            <span id="biomeProductionSummary">${w()}</span>
            <button class="bpEdit icon-pencil ge-edit" data-tip="Edit biome baseline production"></button>
          </div>

          <label data-tip="For raw resources: controls where and how this good is produced directly from the environment (e.g. biome, elevation, temperature)">Bonus distribution</label>
          <div class="ge-edit-row">
            <div id="newGoodDistribution" class="ge-dist">${r?.distribution||``}</div>
            <button id="newGoodDistributionEditor" class="icon-pencil ge-edit" data-tip="Open the Distribution visual editor"></button>
          </div>
        </div>
        <div id="newGoodRawNote" class="ge-note"></div>
      </div>

      <div>
        <div class="ge-section-title">
          <span data-tip="For manufactured goods: recipes define which other goods are required to produce this good">Recipes</span>
          <button id="newGoodAddRecipe" class="icon-plus" data-tip="Add a recipe"></button>
        </div>
        <div id="newGoodRecipeList" class="ge-recipe-list"></div>
        <div id="newGoodRecipeNote" class="ge-note"></div>
      </div>

      <div>
        <div class="ge-section-title">
          <span data-tip="Per-dimension production multipliers. 1 = no effect, 0 = fully suppressed.">Multipliers</span>
        </div>
        <div class="ge-grid ge-grid--top">
          ${D(`cultureType`,`Culture Type`)}
          ${D(`culture`,`Culture`)}
          ${D(`state`,`State`)}
          ${D(`religion`,`Religion`)}
          ${D(`biome`,`Biome`)}
          ${D(`zone`,`Zone`)}
        </div>
      </div>

      <div id="newGoodError" class="ge-error"></div>
    </div>
  </div>`),k=n(`goodEditor`);let e=n(`newGoodRecipeList`),t=pack.goods[0]?.i??0,i=[...pack.goods].sort((e,t)=>e.name.localeCompare(t.name)),a=()=>!Object.values(S).some(e=>(e??0)>0)&&!document.getElementById(`newGoodDistribution`)?.textContent?.trim(),o=()=>{let e=a(),t=O.length===0,r=n(`newGoodRecipeNote`);r.textContent=`This good is raw-only: gathered from the environment.`,r.style.display=t&&!e?``:`none`;let i=n(`newGoodRawNote`);i.textContent=`This good is manufactured-only: made from recipes in burgs.`,i.style.display=e&&!t?``:`none`},c=()=>{e.innerHTML=O.map((e,t)=>`
          <div class="recipeOption ge-recipe" data-recipe-index="${t}" >
            <div class="ge-recipe-head">
              <span>Recipe ${t+1}</span>
              <div class="ge-recipe-actions">
                <span class="recipeAddIngredient icon-plus pointer" data-recipe-index="${t}" data-tip="Add ingredient"></span>
                <span class="recipeRemoveOption icon-trash-empty pointer" data-recipe-index="${t}" data-tip="Remove recipe"></span>
              </div>
            </div>
            <div class="recipeIngredients ge-recipe-ings">
              ${Object.entries(e).map(([e,n],r)=>`
                    <div class="ge-recipe-ing" data-recipe-index="${t}" data-ingredient-index="${r}">
                      <select class="recipeGoodSelect" data-recipe-index="${t}" data-ingredient-index="${r}">${i.map(t=>`<option value="${t.i}" ${t.i===Number(e)?`selected`:``}>${t.name}</option>`).join(``)}</select>
                      <input class="recipeAmountInput" data-recipe-index="${t}" data-ingredient-index="${r}" type="number" min="1" step="1" value="${n}" />
                      <span class="recipeRemoveIngredient icon-trash-empty pointer" data-recipe-index="${t}" data-ingredient-index="${r}" data-tip="Remove ingredient" />
                    </div>`).join(``)}
            </div>
          </div>
        `).join(``),e.querySelectorAll(`.recipeGoodSelect`).forEach(e=>{e.onchange=()=>{let t=+e.value,n=+e.dataset.recipeIndex,r=+e.dataset.ingredientIndex,i=O[n],a=i[r]||0;delete i[r],i[t]=a,c()}}),e.querySelectorAll(`.recipeAmountInput`).forEach(e=>{e.onchange=()=>{let t=+e.dataset.recipeIndex,n=+e.dataset.ingredientIndex,r=O[t],i=Number(Object.keys(r)[n]);r[i]=+e.value}}),e.querySelectorAll(`.recipeAddIngredient`).forEach(e=>{e.onclick=n=>{n.preventDefault();let r=O[+e.dataset.recipeIndex],i=Object.keys(r).length?Math.max(...Object.keys(r).map(e=>+e))+1:t;r[i]=1,c()}}),e.querySelectorAll(`.recipeRemoveIngredient`).forEach(e=>{e.onclick=t=>{t.preventDefault();let n=+e.dataset.recipeIndex,r=+e.dataset.ingredientIndex,i=O[n];if(Object.keys(i).length>1){let e=Number(Object.keys(i)[r]);delete i[e],c()}}}),e.querySelectorAll(`.recipeRemoveOption`).forEach(e=>{e.onclick=t=>{t.preventDefault();let n=+e.dataset.recipeIndex;O.splice(n,1),c()}}),o()};c(),k.querySelectorAll(`.mEdit`).forEach(e=>{e.addEventListener(`click`,()=>{let t=e.dataset.dim;v(t,T[t]??{},e=>{T[t]=e;let n=document.getElementById(`mSummary_${t}`);n&&(n.textContent=E(t))})})}),k.querySelector(`.dcEdit`).addEventListener(`click`,()=>{y({...x},e=>{Object.keys(x).forEach(e=>void delete x[e]),Object.assign(x,e);let t=document.getElementById(`demandCoverageSummary`);t&&(t.textContent=C())})}),k.querySelector(`.bpEdit`).addEventListener(`click`,()=>{b({...S},e=>{Object.keys(S).forEach(e=>void delete S[+e]),Object.assign(S,e);let t=document.getElementById(`biomeProductionSummary`);t&&(t.textContent=w()),o()})}),n(`newGoodAddRecipe`).addEventListener(`click`,e=>{e.preventDefault(),O.push({[t]:1}),c()}),n(`newGoodDistributionEditor`).addEventListener(`click`,()=>{let e=n(`newGoodDistribution`);s.DistributionEditor.open(t=>{e.textContent=t,o()},e.textContent?.trim()??``)});let l=n(`newGoodIcon`);l.onchange=()=>n(`newGoodIconPreview`).setAttribute(`href`,`#${l.value}`);let d=n(`newGoodColor`);d.oninput=()=>{let e=n(`newGoodIconCircle`);e.setAttribute(`fill`,d.value),e.setAttribute(`stroke`,Goods.getStroke(d.value))};let f=(e,t)=>{n(`newGoodIconPreview`).setAttribute(`href`,`#${t}`),l.innerHTML+=`<option value="${t}">${t}</option>`,l.value=t};n(`newGoodUploadIconRaster`).onclick=()=>n(`imageToLoad`).click(),n(`newGoodUploadIconVector`).onclick=()=>n(`svgToLoad`).click(),n(`imageToLoad`).onchange=()=>_(`image`,f),n(`svgToLoad`).onchange=()=>_(`svg`,f)}}function g(e,t){return e===`cultureType`?t:e===`culture`?pack.cultures[+t]?.name??`Culture ${t}`:e===`state`?pack.states[+t]?.name??`State ${t}`:e===`religion`?pack.religions[+t]?.name??`Religion ${t}`:e===`zone`?pack.zones.find(e=>e.i===+t)?.name??`Zone ${t}`:pack.biomes[+t]?.name??`Biome ${t}`}function _(e,t){let r=n(e===`image`?`imageToLoad`:`svgToLoad`),i=r.files[0];if(r.value=``,i.size>2e5){a(`File is too big, please optimize file size up to 200kB and re-upload. Recommended size is 48x48 px and up to 10kB`,!0,`error`,5e3);return}let o=new FileReader;o.onload=r=>{let i=r.target;if(!i)return;let o=i.result,s=`good-custom-${Math.random().toString(36).slice(-6)}`,c=n(`good-icons`);if(e===`image`){let e=`<svg id="${s}" xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><image x="0" y="0" width="200" height="200" href="${o}"/></svg>`;c.insertAdjacentHTML(`beforeend`,e)}else{let e=document.createElement(`html`);e.innerHTML=o,e.querySelectorAll(`*`).forEach(e=>{e.getAttributeNames().forEach(t=>{(t.includes(`inkscape`)||t.includes(`sodipodi`))&&e.removeAttribute(t)})}),o.includes(`from the Noun Project`)&&e.querySelectorAll(`text`).forEach(e=>void e.remove());let t=e.querySelector(`svg`);if(!t)return void a(`The file should be prepared for load to FMG. If you don't know why it's happening, try to upload raster image`,!1,`error`);let n=c.appendChild(t);n.id=s,n.setAttribute(`width`,`200`),n.setAttribute(`height`,`200`)}t(e,s)},e===`image`?o.readAsDataURL(i):o.readAsText(i)}function v(e,t,n){let i,a;switch(e){case`cultureType`:i=o.map(e=>({id:e,name:e})),a=`Culture Type`;break;case`culture`:i=pack.cultures.filter(e=>e.i&&!e.removed).map(e=>({id:String(e.i),name:e.name,color:e.color})),a=`Culture`;break;case`state`:i=pack.states.filter(e=>e.i&&!e.removed).map(e=>({id:String(e.i),name:e.fullName||e.name,color:e.color})),a=`State`;break;case`religion`:i=pack.religions.filter(e=>e.i&&!e.removed).map(e=>({id:String(e.i),name:e.name,color:e.color})),a=`Religion`;break;case`biome`:i=pack.biomes.filter(e=>!e.removed).map(({i:e,name:t,color:n})=>({id:String(e),name:t,color:n})),a=`Biome`;break;case`zone`:i=pack.zones.map(e=>({id:String(e.i),name:e.name,color:e.color})),a=`Zone`;break}let s=i.map(e=>{let n=t[e.id]??1;return`${`<fill-box fill="${e.color||r()}" size="1em" disabled data-tip="${e.name}"></fill-box>`}<span>${e.name}</span><input type="number" class="mPopupInput" data-id="${e.id}" min="0" step="0.1" style="width:5em;" value="${n}" />`}),c=document.createElement(`div`);document.body.appendChild(c),c.innerHTML=`<div style="max-height:320px; overflow-y:auto; padding:.2em;">${s.length?`<div style="display:grid; grid-template-columns:auto 1fr 5em; gap:.3em .5em; align-items:center;">${s.join(``)}</div>`:`<div style="color:#777; font-style:italic;">No ${a.toLowerCase()}s available</div>`}</div>`,$(c).dialog({title:`${a} multipliers`,width:`22em`,resizable:!1,buttons:{Cancel:function(){$(this).dialog(`close`)},Apply:function(){let e=Array.from(c.querySelectorAll(`.mPopupInput`)),t={};for(let n of e){let e=n.dataset.id,r=Number(n.value);Number.isFinite(r)&&r>=0&&r!==1&&(t[e]=r)}n(t),$(this).dialog(`close`)}},close:()=>{$(c).dialog(`destroy`),c.remove()}})}function y(e,t){let n=p.map(t=>{let n=e[t]??0;return`<span>${l[t]} ${i(t)}</span><input type="number" class="dcPopupInput" data-cat="${t}" min="0" step="0.05" style="width:5em;" value="${n}" />`}).join(``),r=document.createElement(`div`);document.body.appendChild(r),r.innerHTML=`<div style="display:grid;grid-template-columns:1fr 5em;gap:.3em .5em;align-items:center;padding:.2em;">${n}</div>`,$(r).dialog({title:`Demand Coverage`,width:`18em`,resizable:!1,buttons:{Cancel:function(){$(this).dialog(`close`)},Apply:function(){let e={};r.querySelectorAll(`.dcPopupInput`).forEach(t=>{let n=t.dataset.cat,r=Number(t.value);Number.isFinite(r)&&r>0&&(e[n]=r)}),t(e),$(this).dialog(`close`)}},close:()=>{$(r).dialog(`destroy`),r.remove()}})}function b(e,t){let n=pack.biomes.filter(e=>!e.removed).map(({i:t,name:n})=>`<span>${n}</span><input type="number" class="bpPopupInput" data-id="${t}" min="0" step="0.01" style="width:5em;" value="${e[t]??0}" />`).join(``),r=document.createElement(`div`);document.body.appendChild(r),r.innerHTML=`<div style="max-height:320px;overflow-y:auto;padding:.2em;"><div style="display:grid;grid-template-columns:1fr 5em;gap:.3em .5em;align-items:center;">${n}</div></div>`,$(r).dialog({title:`Biome Baseline Production`,width:`22em`,resizable:!1,buttons:{Cancel:function(){$(this).dialog(`close`)},Apply:function(){let e={};r.querySelectorAll(`.bpPopupInput`).forEach(t=>{let n=Number(t.dataset.id),r=Number(t.value);Number.isFinite(r)&&r>0&&(e[n]=r)}),t(e),$(this).dialog(`close`)}},close:()=>{$(r).dialog(`destroy`),r.remove()}})}var x={open:h};export{x as GoodEditor};