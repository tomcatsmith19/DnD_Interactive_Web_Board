import{A as e,Ft as t,K as n,L as r,Qt as i,R as a,S as o,Sn as s,U as c,d as l,i as u,it as d,mt as f,r as p,x as m}from"./utils-BYaxf2yO.js";import{t as h}from"./sin-DXK16t1M.js";import{n as g,r as _,t as v}from"./tooltips-CSQuPvuv.js";import{Ft as y,It as b,Lt as x,N as S,Nt as C,Ot as w,P as T,Pt as E,Xt as D,Yt as ee,jt as O,kt as te,l as k,n as A,t as j,wt as ne}from"./index-DqeJMjPz.js";import{t as re}from"./highlighting-CH83CMtN.js";import{a as M,i as N,n as P,r as F,t as I}from"./table-BDnPiVU4.js";var L=`biomesEditor`,R={my:`right top`,at:`right-10 top+10`,of:`svg`,collision:`fit`},z=[],B=[{key:`name`,label:`Biome`,width:`15em`,permanent:!0,sortBy:e=>e.name,sortType:`alpha`},{key:`habitability`,label:`Habitability`,width:`6.5em`,sortBy:e=>e.habitability},{key:`cells`,label:`Cells`,width:`5em`,sortBy:e=>z[e.i]?.cells??0,defaultSort:`desc`},{key:`area`,label:`Area`,width:`7em`,mobileHidden:!0,sortBy:e=>z[e.i]?.area??0},{key:`population`,label:`Population`,width:`6.2em`,mobileHidden:!0,sortBy:e=>{let t=z[e.i];return t?t.rural+t.urban:0}},{key:`actions`,width:`1.2em`,permanent:!0}],V=P({getData:()=>T(L,pack.biomes.filter(e=>e.i&&!e.removed),B),onUpdate:e=>q(e,z)});function H(){customization||(te(`#${L}, .stable`),layerIsOn(`toggleBiomes`)||toggleBiomes(),layerIsOn(`toggleStates`)&&toggleStates(),layerIsOn(`toggleCultures`)&&toggleCultures(),layerIsOn(`toggleReligions`)&&toggleReligions(),layerIsOn(`toggleProvinces`)&&toggleProvinces(),U(),z=K(),V.reset(),$(`#${L}`).dialog({title:`Biomes Editor`,resizable:!1,close:Se,position:R}))}function U(){O(L);let e=`<div id="${L}" class="dialog stable editorDialog">
      ${F({dialogId:L,columns:B})}
      <div id="biomesBody" class="table" data-type="absolute"></div>
      <div id="biomesFooter" class="totalLine">
        <div data-tip="Number of land biomes" style="margin-left: 12px">
          Biomes:&nbsp;<span id="biomesFooterBiomes">0</span>
        </div>
        <div data-col="cells" data-tip="Total land cells number" style="margin-left: 12px">
          Cells:&nbsp;<span id="biomesFooterCells">0</span>
        </div>
        <div data-col="area" data-tip="Total land area" style="margin-left: 12px">
          Land Area:&nbsp;<span id="biomesFooterArea">0</span>
        </div>
        <div data-col="population" data-tip="Total population" style="margin-left: 12px">
          Population:&nbsp;<span id="biomesFooterPopulation">0</span>
        </div>
      </div>
      <div id="biomesBottom">
        <button id="biomesEditorRefresh" data-tip="Refresh the Editor" class="icon-cw"></button>
        <button id="biomesEditStyle" data-tip="Edit biomes style in Style Editor" class="icon-adjust"></button>
        <button id="biomesLegend" data-tip="Toggle Legend box" class="icon-list-bullet"></button>
        <button
          id="biomesPercentage"
          data-tip="Toggle percentage / absolute values views"
          class="icon-percent"
        ></button>
        <button
          id="biomesManually"
          data-tip="Manually re-assign biomes to not follow the default moisture/temperature pattern"
          class="icon-brush"
        ></button>
        <div id="biomesManuallyButtons" style="display: none">
          <div data-tip="Change brush size. Shortcut: + to increase; – to decrease" style="margin-block: 0.3em">
            Brush size:
            <slider-input id="biomesBrush" min="1" max="100" value="15"></slider-input>
          </div>
          <button id="biomesManuallyApply" data-tip="Apply current assignment" class="icon-check"></button>
          <button id="biomesManuallyCancel" data-tip="Cancel assignment" class="icon-cancel"></button>
        </div>
        <button id="biomesAdd" data-tip="Add a custom biome" class="icon-plus"></button>
        <button
          id="biomesRestore"
          data-tip="Restore the defaults and re-define biomes based on current moisture and temperature"
          class="icon-history"
        ></button>
        <button
          id="biomesExport"
          data-tip="Save biomes-related data as a text file (.csv)"
          class="icon-download"
        ></button>
      </div>
    </div>`;c(`dialogs`).insertAdjacentHTML(`beforeend`,e),I({dialogId:L,columns:B,onUpdate:()=>C(L,{width:`fit-content`,position:R})}),c(`biomesEditorRefresh`).addEventListener(`click`,W),c(`biomesEditStyle`).addEventListener(`click`,()=>editStyle(`biomes`)),c(`biomesLegend`).addEventListener(`click`,ce),c(`biomesPercentage`).addEventListener(`click`,X),c(`biomesManually`).addEventListener(`click`,me),c(`biomesManuallyApply`).addEventListener(`click`,be),c(`biomesManuallyCancel`).addEventListener(`click`,()=>Z()),c(`biomesRestore`).addEventListener(`click`,xe),c(`biomesAdd`).addEventListener(`click`,de),c(`biomesExport`).addEventListener(`click`,pe),S(L,V.reset),re(L,({cellId:e})=>e&&pack.cells.biome[e]),c(`biomesBody`).addEventListener(`click`,e=>{let t=e.target,n=t.classList;if(t.tagName===`FILL-BOX`?ie(t):n.contains(`icon-info-circled`)?se(t):n.contains(`icon-trash-empty`)&&fe(t),customization===6){let e=t.closest(`.biomes`);e&&he(e)}}),c(`biomesBody`).addEventListener(`change`,e=>{let t=e.target,n=t.classList;n.contains(`biomeName`)?ae(t):n.contains(`biomeHabitability`)&&oe(t)})}function W(){z=K(),V.refresh()}function G(e=pack){let{cells:t}=e,n=e.biomes.map(()=>({cells:0,area:0,rural:0,urban:0}));for(let r of t.i){if(t.h[r]<20)continue;let i=n[t.biome[r]];i.cells++,i.area+=t.area[r],i.rural+=t.pop[r];let a=t.burg[r]?e.burgs[t.burg[r]]:null;a&&(i.urban+=a.population??0)}return n}function K(){return G(pack)}function q(e,n){let r=` ${u()}`,i=``,a=0,o=0;for(let a of e.rows){let{i:e,name:o,color:s,habitability:c}=a,{cells:u,area:d,rural:f,urban:m}=n[e],h=p(d),g=f*populationRate,_=m*populationRate*urbanization,v=t(g+_),y=`Total population: ${l(v)}; Rural population: ${l(g)}; Urban population: ${l(_)}`;i+=`
      <div
        class="states biomes"
        data-id="${e}"
        data-name="${o}"
        data-habitability="${c}"
        data-cells=${u}
        data-area=${h}
        data-population=${v}
        data-color=${s}
      >
        <div data-col="name">
          <fill-box fill="${s}"></fill-box>
          <input data-tip="Biome name. Click and type to change" class="biomeName" value="${o}" autocorrect="off" spellcheck="false" />
        </div>
        <div data-col="habitability" class="hide">
          <span data-tip="Biome habitability percent">%</span>
          <input data-tip="Biome habitability percent. Click and set new value to change" type="number" min="0" max="9999" class="biomeHabitability" value=${c} />
        </div>
        <div data-col="cells" class="hide"><span data-tip="Cells count" class="icon-check-empty"></span><span data-tip="Cells count" class="biomeCells">${u}</span></div>
        <div data-col="area" class="hide"><span data-tip="Biome area" class="icon-map-o" style="padding-right: 2px"></span><span data-tip="Biome area" class="biomeArea">${l(h)+r}</span></div>
        <div data-col="population" class="hide"><span data-tip="${y}" class="icon-male"></span><span data-tip="${y}" class="biomePopulation">${l(v)}</span></div>
        <div data-col="actions" class="hide">
          <span data-tip="Open Wikipedia article about the biome" class="icon-info-circled pointer"></span>
          ${e>12&&!u?`<span data-tip="Remove the custom biome" class="icon-trash-empty"></span>`:``}
        </div>
      </div>
    `}let s=c(`biomesBody`);s.innerHTML=i;for(let r of e.all){let e=n[r.i];a+=p(e.area),o+=t(e.rural*populationRate+e.urban*populationRate*urbanization)}let d=p(D(pack.cells.area));c(`biomesFooterBiomes`).innerHTML=String(e.all.length),c(`biomesFooterCells`).innerHTML=String(pack.cells.h.filter(e=>e>=20).length);let f=c(`biomesFooterArea`);f.innerHTML=l(a)+r,c(`biomesFooterPopulation`).innerHTML=l(o),f.dataset.area=String(a),f.dataset.mapArea=String(d),c(`biomesFooterPopulation`).dataset.population=String(o),N(c(`biomesFooter`),e,V.goto),s.querySelectorAll(`div.biomes`).forEach(e=>{e.addEventListener(`mouseenter`,J)}),s.querySelectorAll(`div.biomes`).forEach(e=>{e.addEventListener(`mouseleave`,Y)}),s.dataset.type===`percentage`&&(s.dataset.type=`absolute`,X()),C(L,{width:`fit-content`,position:R})}function J(e){if(customization===6)return;let t=+e.target.dataset.id,n=i().duration(2e3).ease(h);s(`#biomes > #biome${t}`).raise().transition(n).attr(`stroke-width`,2).attr(`stroke`,`#cd4c11`)}function Y(e){if(customization===6)return;let t=+e.target.dataset.id,n=pack.biomes[t].color;s(`#biomes > #biome${t}`).transition().attr(`stroke-width`,.7).attr(`stroke`,n)}function ie(e){let t=e.getAttribute(`fill`),n=+e.closest(`.biomes`).dataset.id;x.ColorPicker.open(t,t=>{e.fill=t,pack.biomes[n].color=t,k()})}function ae(e){let t=e.closest(`.biomes`),n=+t.dataset.id;t.dataset.name=e.value,pack.biomes[n].name=e.value}function oe(e){let t=e.closest(`.biomes`),n=+t.dataset.id;if(Number.isNaN(+e.value)||+e.value<0||+e.value>9999){e.value=String(pack.biomes[n].habitability),_(`Please provide a valid number in range 0-9999`,!1,`error`);return}pack.biomes[n].habitability=+e.value,t.dataset.habitability=e.value,Q(),W()}function se(e){let t=e.closest(`.biomes`)?.dataset.name;if(t===`Custom`||!t){_(`Please fill in the biome name`,!1,`error`);return}let n={"Hot desert":`Desert_climate#Hot_desert_climates`,"Cold desert":`Desert_climate#Cold_desert_climates`,Savanna:`Tropical_and_subtropical_grasslands,_savannas,_and_shrublands`,Grassland:`Temperate_grasslands,_savannas,_and_shrublands`,"Tropical seasonal forest":`Seasonal_tropical_forest`,"Temperate deciduous forest":`Temperate_deciduous_forest`,"Tropical rainforest":`Tropical_rainforest`,"Temperate rainforest":`Temperate_rainforest`,Taiga:`Taiga`,Tundra:`Tundra`,Glacier:`Glacier`,Wetland:`Wetland`},r=`https://en.wikipedia.org/w/index.php?search=${t}`;d(n[t]?`https://en.wikipedia.org/wiki/`+n[t]:r)}function ce(){if(s(`#legend`).selectAll(`*`).size()){y();return}let e=K();b(`Biomes`,pack.biomes.filter(({i:t})=>e[t].cells).sort((t,n)=>e[n.i].area-e[t.i].area).map(({i:e,color:t,name:n})=>[e,t,n]))}function X(){let e=c(`biomesBody`);if(e.dataset.type===`absolute`){e.dataset.type=`percentage`;let n=+c(`biomesFooterCells`).innerHTML,r=c(`biomesFooterArea`),i=+r.dataset.area,a=+r.dataset.mapArea,o=+c(`biomesFooterPopulation`).dataset.population;e.querySelectorAll(`:scope > div`).forEach(e=>{e.querySelector(`.biomeCells`).innerHTML=`${t(+e.dataset.cells/n*100)}%`,e.querySelector(`.biomeArea`).innerHTML=`${t(+e.dataset.area/i*100)}%`,e.querySelector(`.biomePopulation`).innerHTML=`${t(+e.dataset.population/o*100)}%`}),r.innerHTML=`${t(i/a*100)}%`}else e.dataset.type=`absolute`,V.refresh()}function le(e,t){let n=e.length;if(n>254)return null;let r={i:n,name:`Custom`,color:t,habitability:50,iconsDensity:0,icons:[],cost:50};return e.push(r),r}function ue(e,t,n){let r=e[n];if(n<=12||!r||r.removed)return!1;for(let e=0;e<t.length;e++)if(t[e]===n)return!1;return r.removed=!0,!0}function de(){if(!le(pack.biomes,f())){_(`Maximum number of biomes reached (255), data cleansing is required`,!1,`error`);return}z=K(),V.refresh()}function fe(e){let t=+e.closest(`.biomes`).dataset.id;ue(pack.biomes,pack.cells.biome,t)&&(z=K(),V.refresh())}function pe(){let e=`Id,Biome,Color,Habitability,Cells,Area ${areaUnit.value===`square`?`${distanceUnitInput.value}2`:areaUnit.value},Population\n`,n=K();for(let r of pack.biomes){if(!r.i||r.removed)continue;let{cells:i,area:a,rural:o,urban:s}=n[r.i],c=t(o*populationRate+s*populationRate*urbanization);e+=`${r.i},${r.name},${r.color},${r.habitability}%,${i},${p(a)},${c}\n`}let r=`${o(`Biomes`)}.csv`;m(e,r)}function me(){layerIsOn(`toggleBiomes`)||toggleBiomes(),customization=6,M(L,[`habitability`,`cells`,`area`,`population`,`actions`]),s(`#biomes`).append(`g`).attr(`id`,`temp`),document.querySelectorAll(`#biomesBottom > button`).forEach(e=>{e.style.display=`none`}),document.querySelectorAll(`#biomesBottom > div`).forEach(e=>{e.style.display=`block`}),c(`biomesBody`).querySelector(`div.biomes`).classList.add(`selected`),c(`biomesEditor`).querySelectorAll(`.hide`).forEach(e=>{e.classList.add(`hidden`)}),c(`biomesBody`).querySelectorAll(`div > input, select, span, svg`).forEach(e=>{e.style.pointerEvents=`none`}),c(`biomesFooter`).style.display=`none`,$(`#biomesEditor`).dialog({position:{my:`right top`,at:`right-10 top+10`,of:`svg`}}),_(`Click on biome to select, drag the circle to change biome`,!0),s(`#viewbox`).style(`cursor`,`crosshair`).on(`click`,ge).call(ee().on(`start`,_e)).on(`touchmove mousemove`,ye)}function he(e){let t=c(`biomesBody`).querySelector(`div.selected`);t&&t.classList.remove(`selected`),e.classList.add(`selected`)}function ge(e){let t=n(e,this),r=findCell(t[0],t[1]);if(pack.cells.h[r]<20){_(`You cannot reassign water via biomes. Please edit the Heightmap to change water`,!1,`error`);return}let i=s(`#biomes`).select(`#temp`).select(`polygon[data-cell='${r}']`),a=i.size()?+i.attr(`data-biome`):pack.cells.biome[r];c(`biomesBody`).querySelector(`div.selected`)?.classList.remove(`selected`),c(`biomesBody`).querySelector(`div[data-id='${a}']`).classList.add(`selected`)}function _e(t){let r=+c(`biomesBrush`).value;t.on(`drag`,t=>{if(!t.dx&&!t.dy)return;let i=n(t,this);j(i[0],i[1],r);let o=(r>5?e(i[0],i[1],r,pack):[findCell(i[0],i[1])]).filter(e=>a(e,pack));o&&ve(o)})}function ve(e){let t=s(`#biomes`).select(`#temp`),n=c(`biomesBody`).querySelector(`div.selected`).dataset.id,i=pack.biomes[+n].color;e.forEach(e=>{let a=t.select(`polygon[data-cell='${e}']`);n!==(a.size()?a.attr(`data-biome`):String(pack.cells.biome[e]))&&(a.size()?a.attr(`data-biome`,n).attr(`fill`,i).attr(`stroke`,i):t.append(`polygon`).attr(`data-cell`,e).attr(`data-biome`,n).attr(`points`,r(e,pack)).attr(`fill`,i).attr(`stroke`,i))})}function ye(e){g();let t=n(e,this),r=+c(`biomesBrush`).value;j(t[0],t[1],r)}function be(){let e=s(`#biomes`).select(`#temp`).selectAll(`polygon`);e.each(function(){let e=+this.dataset.cell,t=+this.dataset.biome;pack.cells.biome[e]=t}),e.size()&&(k(),W()),Z()}function Z(e){customization=0,M(L,[]),s(`#biomes`).select(`#temp`).remove(),A(),document.querySelectorAll(`#biomesBottom > button`).forEach(e=>{e.style.display=`inline-block`}),document.querySelectorAll(`#biomesBottom > div`).forEach(e=>{e.style.display=`none`}),c(`biomesBody`).querySelectorAll(`div > input, select, span, svg`).forEach(e=>{e.style.removeProperty(`pointer-events`)}),c(`biomesEditor`).querySelectorAll(`.hide`).forEach(e=>{e.classList.remove(`hidden`)}),c(`biomesFooter`).style.display=`block`,e||$(`#biomesEditor`).dialog({position:{my:`right top`,at:`right-10 top+10`,of:`svg`}}),E(),v();let t=document.querySelector(`#biomesBody > div.selected`);t&&t.classList.remove(`selected`)}function xe(){pack.biomes=Biomes.getDefault(),Biomes.define(),k(),Q(),W()}function Se(){Z(!0),$(`#biomesEditor`).dialog(`destroy`),c(`biomesEditor`).remove()}function Q(){w.regenerate(),layerIsOn(`togglePopulation`)&&drawPopulation(),layerIsOn(`toggleGoods`)&&ne()}var Ce={open:H};export{Ce as BiomesEditor};