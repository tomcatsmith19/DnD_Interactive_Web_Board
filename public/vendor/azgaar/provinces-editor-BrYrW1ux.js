import{A as e,Ft as t,H as n,In as r,K as i,L as a,Qt as o,R as s,S as c,Sn as l,U as u,d,i as f,kt as p,ln as m,mt as h,nn as g,ot as _,r as v,rn as y,x as b,xt as x}from"./utils-BYaxf2yO.js";import{t as S}from"./sin-DXK16t1M.js";import{r as C,t as w}from"./stratify-CGdiYggi.js";import{n as T,t as E}from"./constant-CUk6ox2a.js";import{n as ee,r as D,t as O}from"./tooltips-CSQuPvuv.js";import{At as k,Dt as A,Lt as j,N as te,Nt as M,P as ne,Pt as N,Q as P,Ut as re,X as ie,Yt as ae,Z as F,jt as I,kt as L,n as oe,t as R}from"./index-DqeJMjPz.js";import{t as se}from"./highlighting-CH83CMtN.js";import{a as z,i as ce,n as le,r as ue,t as de}from"./table-BDnPiVU4.js";function fe(e){e.x0=Math.round(e.x0),e.y0=Math.round(e.y0),e.x1=Math.round(e.x1),e.y1=Math.round(e.y1)}function pe(e,t,n,r,i){for(var a=e.children,o,s=-1,c=a.length,l=e.value&&(r-t)/e.value;++s<c;)o=a[s],o.y0=n,o.y1=i,o.x0=t,o.x1=t+=o.value*l}function me(e,t,n,r,i){for(var a=e.children,o,s=-1,c=a.length,l=e.value&&(i-n)/e.value;++s<c;)o=a[s],o.x0=t,o.x1=r,o.y0=n,o.y1=n+=o.value*l}var he=(1+Math.sqrt(5))/2;function ge(e,t,n,r,i,a){for(var o=[],s=t.children,c,l,u=0,d=0,f=s.length,p,m,h=t.value,g,_,v,y,b,x,S;u<f;){p=i-n,m=a-r;do g=s[d++].value;while(!g&&d<f);for(_=v=g,x=Math.max(m/p,p/m)/(h*e),S=g*g*x,b=Math.max(v/S,S/_);d<f;++d){if(g+=l=s[d].value,l<_&&(_=l),l>v&&(v=l),S=g*g*x,y=Math.max(v/S,S/_),y>b){g-=l;break}b=y}o.push(c={value:g,dice:p<m,children:s.slice(u,d)}),c.dice?pe(c,n,r,i,h?r+=m*g/h:a):me(c,n,r,h?n+=p*g/h:i,a),h-=g,u=d}return o}var _e=(function e(t){function n(e,n,r,i,a){ge(t,e,n,r,i,a)}return n.ratio=function(t){return e((t=+t)>1?t:1)},n})(he);function ve(){var e=_e,t=!1,n=1,r=1,i=[0],a=E,o=E,s=E,c=E,l=E;function u(e){return e.x0=e.y0=0,e.x1=n,e.y1=r,e.eachBefore(d),i=[0],t&&e.eachBefore(fe),e}function d(t){var n=i[t.depth],r=t.x0+n,u=t.y0+n,d=t.x1-n,f=t.y1-n;d<r&&(r=d=(r+d)/2),f<u&&(u=f=(u+f)/2),t.x0=r,t.y0=u,t.x1=d,t.y1=f,t.children&&(n=i[t.depth+1]=a(t)/2,r+=l(t)-n,u+=o(t)-n,d-=s(t)-n,f-=c(t)-n,d<r&&(r=d=(r+d)/2),f<u&&(u=f=(u+f)/2),e(t,r,u,d,f))}return u.round=function(e){return arguments.length?(t=!!e,u):t},u.size=function(e){return arguments.length?(n=+e[0],r=+e[1],u):[n,r]},u.tile=function(t){return arguments.length?(e=C(t),u):e},u.padding=function(e){return arguments.length?u.paddingInner(e).paddingOuter(e):u.paddingInner()},u.paddingInner=function(e){return arguments.length?(a=typeof e==`function`?e:T(+e),u):a},u.paddingOuter=function(e){return arguments.length?u.paddingTop(e).paddingRight(e).paddingBottom(e).paddingLeft(e):u.paddingTop()},u.paddingTop=function(e){return arguments.length?(o=typeof e==`function`?e:T(+e),u):o},u.paddingRight=function(e){return arguments.length?(s=typeof e==`function`?e:T(+e),u):s},u.paddingBottom=function(e){return arguments.length?(c=typeof e==`function`?e:T(+e),u):c},u.paddingLeft=function(e){return arguments.length?(l=typeof e==`function`?e:T(+e),u):l},u}var B=`provincesEditor`,V={my:`right top`,at:`right-10 top+10`,of:`svg`,collision:`fit`},H=e=>v(e.area),U=e=>t(e.rural*populationRate+e.urban*populationRate*urbanization),W=[{key:`color`,width:`1.2em`,permanent:!0},{key:`name`,label:`Province`,width:`7em`,permanent:!0,sortBy:e=>e.name||``,sortType:`alpha`},{key:`emblem`,width:`1.4em`},{key:`form`,label:`Form`,width:`7em`,mobileHidden:!0,sortBy:e=>e.formName||``,sortType:`alpha`},{key:`capital`,label:`Capital`,width:`7em`,sortBy:e=>e.burg&&pack.burgs[e.burg]?.name||``,sortType:`alpha`},{key:`state`,label:`State`,width:`7em`,permanent:!0,sortBy:e=>pack.states[e.state]?.name||``,sortType:`alpha`},{key:`burgs`,label:`Burgs`,width:`5em`,mobileHidden:!0,sortBy:e=>e.burgs?.length||0},{key:`area`,label:`Area`,width:`7em`,mobileHidden:!0,defaultSort:`desc`,sortBy:H},{key:`population`,label:`Population`,width:`6em`,sortBy:U},{key:`actions`,width:`5.4em`,permanent:!0,align:`right`}],G=le({getData:J,onUpdate:Se});function ye(){customization||(L(`#provincesEditor, .stable`),layerIsOn(`toggleProvinces`)||toggleProvinces(),layerIsOn(`toggleBorders`)||toggleBorders(),layerIsOn(`toggleStates`)&&toggleStates(),layerIsOn(`toggleCultures`)&&toggleCultures(),be(),K(),$(`#provincesEditor`).dialog({title:`Provinces Editor`,resizable:!1,width:`fit-content`,close:rt,position:V}))}function be(){I(`provincesEditor`);let e=`<div id="provincesEditor" class="dialog stable editorDialog">
      <div id="provincesBodySection" class="table" data-type="absolute">
        ${ue({dialogId:B,columns:W})}
      </div>
      <div id="provincesFooter" class="totalLine">
        <div data-tip="Provinces displayed" style="margin-left: 4px">
          Provinces:&nbsp;<span id="provincesFooterNumber">0</span>
        </div>
        <div data-tip="Total burgs number" style="margin-left: 12px" data-col="burgs">
          Burgs:&nbsp;<span id="provincesFooterBurgs">0</span>
        </div>
        <div data-tip="Average area" style="margin-left: 14px" data-col="area">
          Mean area:&nbsp;<span id="provincesFooterArea">0</span>
        </div>
        <div data-tip="Average population" style="margin-left: 14px" data-col="population">
          Mean population:&nbsp;<span id="provincesFooterPopulation">0</span>
        </div>
      </div>
      <div id="provincesBottom" class="editorToolbar">
        <button id="provincesEditorRefresh" data-tip="Refresh the Editor" class="icon-cw"></button>
        <button id="provincesEditStyle" data-tip="Edit provinces style in Style Editor" class="icon-adjust"></button>
        <button
          id="provincesRecolor"
          data-tip="Recolor listed provinces based on state color"
          class="icon-paint-roller"
        ></button>
        <button
          id="provincesPercentage"
          data-tip="Toggle percentage / absolute values views"
          class="icon-percent"
        ></button>
        <button id="provincesChart" data-tip="Show provinces chart" class="icon-chart-area"></button>
        <button
          id="provincesExport"
          data-tip="Save provinces-related data as a text file (.csv)"
          class="icon-download"
        ></button>
        <button id="provincesManually" data-tip="Manually re-assign provinces" class="icon-brush"></button>
        <div id="provincesManuallyButtons" style="display: none">
          <div data-tip="Change brush size. Shortcut: + to increase; – to decrease" style="margin-block: 0.3em">
            Brush size:
            <slider-input id="provincesBrush" min="1" max="100" value="8"></slider-input>
          </div>
          <button id="provincesManuallyApply" data-tip="Apply assignment" class="icon-check"></button>
          <button id="provincesManuallyCancel" data-tip="Cancel assignment" class="icon-cancel"></button>
        </div>
        <button
          id="provincesRelease"
          data-tip="Release all provinces. It will make all provinces with burgs independent"
          class="icon-flag"
        ></button>
        <button
          id="provincesAdd"
          data-tip="Add a new province. Hold Shift to add multiple"
          class="icon-plus"
        ></button>
        <button id="provincesMerge" data-tip="Merge several provinces into one" class="icon-layer-group"></button>
        <button
          id="provincesRemoveAll"
          data-tip="Remove all provinces. States will remain as they are"
          class="icon-trash"
        ></button>
        <span>State: </span>
        <select id="provincesFilterState"></select>
      </div>
    </div>`;u(`dialogs`).insertAdjacentHTML(`beforeend`,e),te(B,G.reset),de({dialogId:B,columns:W,onUpdate:()=>M(B,{width:`fit-content`,position:V})}),se(`provincesEditor`,({cellId:e})=>pack.cells.province[e]),u(`provincesEditorRefresh`).addEventListener(`click`,K),u(`provincesEditStyle`).addEventListener(`click`,()=>editStyle(`provs`)),u(`provincesFilterState`).addEventListener(`change`,G.reset),u(`provincesPercentage`).addEventListener(`click`,He),u(`provincesChart`).addEventListener(`click`,Ue),u(`provincesExport`).addEventListener(`click`,tt),u(`provincesRemoveAll`).addEventListener(`click`,nt),u(`provincesManually`).addEventListener(`click`,Ge),u(`provincesManuallyApply`).addEventListener(`click`,Ze),u(`provincesManuallyCancel`).addEventListener(`click`,()=>Z()),u(`provincesRelease`).addEventListener(`click`,We),u(`provincesAdd`).addEventListener(`click`,Qe),u(`provincesMerge`).addEventListener(`click`,it),u(`provincesRecolor`).addEventListener(`click`,et),u(`provincesBodySection`).addEventListener(`click`,e=>{if(customization)return;let t=e.target,n=t.classList,r=t.closest(`.states`);if(!r)return;let i=+r.dataset.id,a=pack.provinces[i].state;t.tagName===`FILL-BOX`?Te(t):n.contains(`name`)?Ne(i):n.contains(`coaIcon`)?j.EmblemsEditor.open(`province`,`provinceCOA${i}`,pack.provinces[i]):n.contains(`icon-star-empty`)?Ee(i):n.contains(`icon-flag-empty`)?De(i):n.contains(`icon-dot-circled`)?j.BurgsOverview.open({stateId:a}):n.contains(`culturePopulation`)?Ae(i):n.contains(`icon-target`)?re(l(`#provs`).select(`#province${i}`).node(),8):n.contains(`icon-pin`)?je(i,n):n.contains(`icon-trash-empty`)?Me(i):(n.contains(`icon-lock`)||n.contains(`icon-lock-open`))&&ct(i,n)}),u(`provincesBodySection`).addEventListener(`change`,e=>{let t=e.target,n=t.classList,r=t.closest(`.states`);if(!r)return;let i=+r.dataset.id;n.contains(`cultureBase`)&&Ve(i,r,t.value)})}function K(){q(),xe(),G.reset()}function q(){let{cells:e,provinces:t,burgs:n}=pack;t.forEach(e=>{!e.i||e.removed||(e.area=e.rural=e.urban=0,e.burgs=[],(e.burg&&!n[e.burg]||n[e.burg]?.removed)&&(e.burg=0))});for(let r of e.i){let i=e.province[r];i&&(t[i].area+=e.area[r],t[i].rural+=e.pop[r],e.burg[r]&&(t[i].urban+=n[e.burg[r]].population??0,t[i].burgs.push(e.burg[r])))}t.forEach(e=>{!e.i||e.removed||!e.burg&&e.burgs.length&&(e.burg=e.burgs[0])})}function xe(){let e=u(`provincesFilterState`),t=e.value||`1`;e.options.length=0,e.options.add(new Option(`all`,`-1`,!1,t===`-1`)),pack.states.filter(e=>e.i&&!e.removed).sort((e,t)=>e.name>t.name?1:-1).forEach(n=>{e.options.add(new Option(n.name,String(n.i),!1,String(n.i)===t))})}function J(){let e=+u(`provincesFilterState`).value,t=pack.provinces.filter(e=>e.i&&!e.removed);return ne(B,e===-1?t:t.filter(t=>t.state===e),W)}function Se(e){let n=u(`provincesBodySection`),r=` ${f()}`,i=e.all.reduce((e,t)=>({area:e.area+H(t),population:e.population+U(t),burgs:e.burgs+t.burgs.length}),{area:0,population:0,burgs:0}),a=n.dataset.type===`percentage`,o=e.rows.map(e=>{let n=H(e),o=e.rural*populationRate,s=e.urban*populationRate*urbanization,c=U(e),u=`Total population: ${d(c)}; Rural population: ${d(o)}; Urban population: ${d(s)}`,f=pack.states[e.state].name,p=e.burg&&e.burg!==pack.states[e.state].capital,m=l(`#deftemp`).select(`#fog #focusProvince${e.i}`).size();return COArenderer.trigger(`provinceCOA${e.i}`,e.coa),`<div class="states" data-id=${e.i}>
      <fill-box data-col="color" fill="${e.color}"></fill-box>
      <input data-col="name" data-tip="Province name. Click to change" class="name pointer" value="${e.name}" readonly />
      <svg data-col="emblem" data-tip="Click to show and edit province emblem" class="coaIcon pointer" viewBox="0 0 200 200"><use href="#provinceCOA${e.i}"></use></svg>
      <input data-col="form" data-tip="Province form name. Click to change" class="name pointer" value="${e.formName}" readonly />
      <div data-col="capital">
        <span data-tip="Province capital. Click to zoom into view" class="icon-star-empty pointer ${e.burg?``:`placeholder`}"></span>
        <select data-tip="Province capital. Click to select from burgs within the state. No capital means the province is governed from the state capital" class="cultureBase ${e.burgs.length?``:`placeholder`}">${e.burgs.length?Ce(e.burgs,e.burg):``}</select>
      </div>
      <input data-col="state" data-tip="Province owner" class="provinceOwner" value="${f}" disabled>
      <div data-col="burgs">
        <span data-tip="Click to overview province burgs" class="icon-dot-circled pointer"></span>
        <span data-tip="Burgs count" class="provinceBurgs">${a?`${t(i.burgs?e.burgs.length/i.burgs*100:0)}%`:e.burgs.length}</span>
      </div>
      <div data-col="area">
        <span data-tip="Province area" class="icon-map-o" style="padding-right: 4px"></span>
        <span data-tip="Province area" class="biomeArea">${a?`${t(i.area?n/i.area*100:0)}%`:d(n)+r}</span>
      </div>
      <div data-col="population">
        <span data-tip="${u}" class="icon-male"></span>
        <span data-tip="${u}" class="culturePopulation">${a?`${t(i.population?c/i.population*100:0)}%`:d(c)}</span>
      </div>
      <div data-col="actions"><span data-tip="Declare province independence (turn non-capital province with burgs into a new state)" class="icon-flag-empty ${p?``:`placeholder`}"></span><span data-tip="Locate the province" class="icon-target"></span><span data-tip="Toggle province focus" class="icon-pin ${m?``:` inactive`}"></span><span data-tip="Lock the province" class="icon-lock${e.lock?``:`-open`}"></span><span data-tip="Remove the province" class="icon-trash-empty"></span></div>
    </div>`}).join(``);n.querySelectorAll(`:scope > .states`).forEach(e=>{e.remove()}),n.insertAdjacentHTML(`beforeend`,o),u(`provincesFooterNumber`).innerHTML=String(e.all.length),u(`provincesFooterBurgs`).innerHTML=String(i.burgs),u(`provincesFooterArea`).innerHTML=e.all.length?d(i.area/e.all.length)+r:`0${r}`,u(`provincesFooterPopulation`).innerHTML=e.all.length?d(i.population/e.all.length):`0`,u(`provincesFooterArea`).dataset.area=String(i.area),u(`provincesFooterPopulation`).dataset.population=String(i.population),ce(u(`provincesFooter`),e,G.goto),n.querySelectorAll(`div.states`).forEach(e=>{e.addEventListener(`click`,Ke),e.addEventListener(`mouseenter`,we),e.addEventListener(`mouseleave`,Y)}),M(B,{width:`fit-content`,position:V})}function Ce(e,t){let n=``;return e.forEach(e=>{n+=`<option ${e===t?`selected`:``} value="${e}">${pack.burgs[e].name}</option>`}),n}function we(e){let t=+e.target.dataset.id,n=u(`provincesBodySection`).querySelector(`div[data-id='${t}']`);if(n&&n.classList.add(`active`),!layerIsOn(`toggleProvinces`)||customization)return;let r=o().duration(2e3).ease(S);l(`#provs`).select(`#province${t}`).raise().transition(r).attr(`stroke-width`,2.5).attr(`stroke`,`#d0240f`)}function Y(e){let t=e.target?.dataset?.id?+e.target.dataset.id:null;if(t){let e=u(`provincesBodySection`).querySelector(`div[data-id='${t}']`);e&&e.classList.remove(`active`)}if(!layerIsOn(`toggleProvinces`)||!t){l(`#debug`).selectAll(`.highlight`).remove();return}l(`#provs`).select(`#province${t}`).transition().attr(`stroke-width`,null).attr(`stroke`,null),l(`#debug`).selectAll(`.highlight`).remove()}function Te(e){let t=e.getAttribute(`fill`),n=+e.closest(`.states`).dataset.id;j.ColorPicker.open(t,t=>{e.fill=t,pack.provinces[n].color=t,drawProvinces()})}function Ee(e){let t=pack.provinces[e].burg,{x:n,y:r}=pack.burgs[t];zoomTo(n,r,8,2e3)}function De(e){k({title:`Declare independence`,message:`Are you sure you want to declare province independence? <br>It will turn province into a new state`,confirm:`Declare`,onConfirm:()=>{let t=Oe(e);if(!t)return;let[n,r]=t;ke([n],[r])}})}function Oe(e){let{states:t,provinces:n,cells:r,burgs:i}=pack,a=n[e],{name:o,burg:s,burgs:c}=a;if(c.some(e=>i[e].capital)){D(`Cannot declare independence of a province having capital burg. Please change capital first`,!1,`error`);return}if(!s){D(`Cannot declare independence of a province without burg`,!1,`error`);return}let d=a.state,f=t.length,p=i[s];p.capital=1,Burgs.changeGroup(p),P(),a.burgs.forEach(e=>{i[e].state=f});let{cell:m,culture:g}=i[s],_=h(),v=a.coa,y=u(`provinceCOA${e}`);y&&(y.id=`stateCOA${f}`),l(`#emblems`).select(`#provinceEmblems > use[data-i='${e}']`).remove(),r.i.filter(t=>r.province[t]===e).forEach(e=>{r.province[e]=0,r.state[e]=f});let b=t.map(e=>{if(!e.i||e.removed)return`x`;let n=t[d].diplomacy[e.i];return e.i===d?n=`Enemy`:n===`Ally`||n===`Friendly`?n=`Suspicion`:n===`Suspicion`?n=`Neutral`:n===`Enemy`||n===`Rival`?n=`Friendly`:n===`Vassal`?n=`Suspicion`:n===`Suzerain`&&(n=`Enemy`),e.diplomacy.push(n),n});return b.push(`x`),t[0].diplomacy.push([`Independance declaration`,`${o} declared its independance from ${t[d].name}`]),t.push({i:f,name:o,diplomacy:b,provinces:[],color:_,expansionism:.5,capital:s,type:`Generic`,center:m,culture:g,military:[],alert:1,coa:v}),t[d].provinces=t[d].provinces.filter(t=>t!==e),n[e]={i:e,removed:!0},[d,f]}function ke(e,t){let n=r([...e,...t]);layerIsOn(`toggleProvinces`)&&toggleProvinces(),layerIsOn(`toggleStates`)?drawStates():toggleStates(),layerIsOn(`toggleBorders`)?A():toggleBorders(),States.getPoles(),States.findNeighbors(),States.collectStatistics(),States.defineStateForms(t),P(),n.forEach(e=>{l(`#emblems`).select(`#stateEmblems > use[data-i='${e}']`).remove();let{coa:t,pole:n}=pack.states[e];COArenderer.add(`state`,e,t,n[0],n[1])}),layerIsOn(`toggleProvinces`)&&toggleProvinces(),layerIsOn(`toggleStates`)?drawStates():toggleStates(),layerIsOn(`toggleBorders`)?A():toggleBorders(),F(),L(),j.StatesEditor.open()}function Ae(e){let n=pack.provinces[e],r=pack.cells.i.filter(t=>pack.cells.province[t]===e);if(!r.length){D(`Province does not have any cells, cannot change population`,!1,`error`);return}let i=t(n.rural*populationRate),a=t(n.urban*populationRate*urbanization),o=i+a,s=e=>Number(e).toLocaleString();alertMessage.innerHTML=` Rural: <input type="number" min="0" step="1" id="ruralPop" value=${i} style="width:6em" /> Urban:
    <input type="number" min="0" step="1" id="urbanPop" value=${a} style="width:6em" ${n.burgs.length?``:`disabled`} />
    <p>Total population: ${s(o)} ⇒ <span id="totalPop">${s(o)}</span> (<span id="totalPopPerc">100</span>%)</p>`;let c=u(`ruralPop`),l=u(`urbanPop`),d=()=>{let e=c.valueAsNumber+l.valueAsNumber;Number.isNaN(e)||(u(`totalPop`).innerHTML=s(e),u(`totalPopPerc`).innerHTML=String(t(e/o*100)))};c.oninput=()=>d(),l.oninput=()=>d(),$(`#alert`).dialog({resizable:!1,title:`Change province population`,width:`24em`,buttons:{Apply:function(){f(),$(this).dialog(`close`)},Cancel:function(){$(this).dialog(`close`)}},position:{my:`center`,at:`center`,of:`svg`}});function f(){let e=+c.value/i;if(Number.isFinite(e)&&e!==1&&r.forEach(t=>{pack.cells.pop[t]*=e}),!Number.isFinite(e)&&+c.value>0){let e=t(+c.value/populationRate/r.length);r.forEach(t=>{pack.cells.pop[t]=e})}let o=+l.value/a;if(Number.isFinite(o)&&o!==1&&n.burgs.forEach(e=>{pack.burgs[e].population=t((pack.burgs[e].population??0)*o,4)}),!Number.isFinite(o)&&+l.value>0){let e=t(+l.value/populationRate/urbanization/n.burgs.length,4);n.burgs.forEach(t=>{pack.burgs[t].population=e})}layerIsOn(`togglePopulation`)&&drawPopulation(),K()}}function je(e,t){let n=l(`#provs`).select(`#province${e}`).attr(`d`),r=`focusProvince${e}`;t.contains(`inactive`)?ie(r,n):F(r),t.toggle(`inactive`)}function Me(e){alertMessage.innerHTML=`Are you sure you want to remove the province? <br />This action cannot be reverted`,$(`#alert`).dialog({resizable:!1,title:`Remove province`,buttons:{Remove:function(){pack.cells.province.forEach((t,n)=>{t===e&&(pack.cells.province[n]=0)});let t=pack.provinces[e].state,n=pack.states[t];n.provinces.includes(e)&&n.provinces.splice(n.provinces.indexOf(e),1),F(`focusProvince${e}`);let r=document.getElementById(`provinceCOA${e}`);r&&r.remove(),l(`#emblems`).select(`#provinceEmblems > use[data-i='${e}']`).remove(),pack.provinces[e]={i:e,removed:!0};let i=l(`#provs`).select(`#provincesBody`);i.select(`#province${e}`).remove(),i.select(`#province-gap${e}`).remove(),layerIsOn(`toggleBorders`)&&A(),P(),K(),$(this).dialog(`close`)},Cancel:function(){$(this).dialog(`close`)}}})}function Ne(e){Pe();let t=pack.provinces[e];u(`provinceNameEditor`).dataset.province=String(e),u(`provinceNameEditorShort`).value=t.name,n(u(`provinceNameEditorSelectForm`),t.formName),u(`provinceNameEditorFull`).value=t.fullName;let r=pack.cells.culture[t.center];u(`provinceCultureDisplay`).innerText=pack.cultures[r].name,$(`#provinceNameEditor`).dialog({resizable:!1,title:`Change province name`,buttons:{Apply:function(){Be(t),$(this).dialog(`close`)},Cancel:function(){$(this).dialog(`close`)}},position:{my:`center`,at:`center`,of:`svg`},close:Fe})}function Pe(){I(`provinceNameEditor`),u(`dialogs`).insertAdjacentHTML(`beforeend`,`<div id="provinceNameEditor" class="dialog" data-province="0">
      <div>
        <div data-tip="Province short name" class="label">Short name:</div>
        <input
          id="provinceNameEditorShort"
          data-tip="Type to change the short name"
          autocorrect="off"
          spellcheck="false"
          style="width: 11em"
        />
        <span id="provinceNameEditorShortSpeak" data-tip="Speak the name. You can change voice and language in options" class="speaker">🔊</span>
        <span
          id="provinceNameEditorShortCulture"
          data-tip="Generate culture-specific name for the province"
          class="icon-book pointer"
        ></span>
        <span id="provinceNameEditorShortRandom" data-tip="Generate random name" class="icon-globe pointer"></span>
      </div>
      <div data-tip="Select form name">
        <div data-tip="Province form name" class="label">Form name:</div>
        <select id="provinceNameEditorSelectForm" style="display: inline-block; width: 11em; height: 1.645em">
          <option value="">blank</option>
          <option value="Area">Area</option>
          <option value="Autonomy">Autonomy</option>
          <option value="Barony">Barony</option>
          <option value="Canton">Canton</option>
          <option value="Captaincy">Captaincy</option>
          <option value="Chiefdom">Chiefdom</option>
          <option value="Clan">Clan</option>
          <option value="Colony">Colony</option>
          <option value="Council">Council</option>
          <option value="County">County</option>
          <option value="Deanery">Deanery</option>
          <option value="Department">Department</option>
          <option value="Dependency">Dependency</option>
          <option value="Diaconate">Diaconate</option>
          <option value="District">District</option>
          <option value="Earldom">Earldom</option>
          <option value="Governorate">Governorate</option>
          <option value="Island">Island</option>
          <option value="Islands">Islands</option>
          <option value="Land">Land</option>
          <option value="Landgrave">Landgrave</option>
          <option value="Mandate">Mandate</option>
          <option value="Margrave">Margrave</option>
          <option value="Municipality">Municipality</option>
          <option value="Occupation zone">Occupation zone</option>
          <option value="Parish">Parish</option>
          <option value="Prefecture">Prefecture</option>
          <option value="Province">Province</option>
          <option value="Region">Region</option>
          <option value="Republic">Republic</option>
          <option value="Reservation">Reservation</option>
          <option value="Seneschalty">Seneschalty</option>
          <option value="Shire">Shire</option>
          <option value="State">State</option>
          <option value="Territory">Territory</option>
          <option value="Tribe">Tribe</option>
        </select>
        <input
          id="provinceNameEditorCustomForm"
          placeholder="type form name"
          data-tip="Create custom province form name"
          style="display: none; width: 11em"
        />
        <span
          id="provinceNameEditorAddForm"
          data-tip="Click to add custom province form name to the list"
          class="icon-plus pointer"
        ></span>
      </div>
      <div>
        <div data-tip="Province full name" class="label">Full name:</div>
        <input
          id="provinceNameEditorFull"
          data-tip="Type to change the full name"
          autocorrect="off"
          spellcheck="false"
          style="width: 11em"
        />
        <span id="provinceNameEditorFullSpeak" data-tip="Speak the name. You can change voice and language in options" class="speaker">🔊</span>
        <span
          id="provinceNameEditorFullRegenerate"
          data-tip="Click to re-generate full name"
          class="icon-arrows-cw pointer"
        ></span>
      </div>
      <div
        id="provinceCultureName"
        data-tip="Dominant culture in the province. This defines culture-based naming. Can be changed via the Cultures Editor"
        style="margin-top: 0.2em"
      >
        Dominant culture:&nbsp;<span id="provinceCultureDisplay"></span>
      </div>
    </div>`),u(`provinceNameEditorShortCulture`).addEventListener(`click`,Ie),u(`provinceNameEditorShortRandom`).addEventListener(`click`,Le),u(`provinceNameEditorShortSpeak`).addEventListener(`click`,()=>_(u(`provinceNameEditorShort`).value)),u(`provinceNameEditorAddForm`).addEventListener(`click`,Re),u(`provinceNameEditorFullRegenerate`).addEventListener(`click`,ze),u(`provinceNameEditorFullSpeak`).addEventListener(`click`,()=>_(u(`provinceNameEditorFull`).value))}function Fe(){$(`#provinceNameEditor`).dialog(`destroy`),u(`provinceNameEditor`).remove()}function Ie(){let e=+u(`provinceNameEditor`).dataset.province,t=pack.cells.culture[pack.provinces[e].center],n=Names.getState(Names.getCultureShort(t),t);u(`provinceNameEditorShort`).value=n}function Le(){let e=p(Names.nameBases.length-1),t=Names.getState(Names.getBase(e),void 0,e);u(`provinceNameEditorShort`).value=t}function Re(){let e=u(`provinceNameEditorCustomForm`),t=u(`provinceNameEditorSelectForm`),r=e.value,i=e.style.display===`inline-block`;e.style.display=i?`none`:`inline-block`,t.style.display=i?`inline-block`:`none`,i&&n(t,r)}function ze(){let e=u(`provinceNameEditorShort`).value,t=u(`provinceNameEditorSelectForm`).value,n=()=>t?!e&&t?`The ${t}`:`${e} ${t}`:e;u(`provinceNameEditorFull`).value=n()}function Be(e){e.name=u(`provinceNameEditorShort`).value,e.formName=u(`provinceNameEditorSelectForm`).value,e.fullName=u(`provinceNameEditorFull`).value,layerIsOn(`toggleProvinces`)&&drawProvinces(),P(),K()}function Ve(e,t,n){t.dataset.capital=pack.burgs[+n].name,pack.provinces[e].center=pack.burgs[+n].cell,pack.provinces[e].burg=+n}function He(){let e=u(`provincesBodySection`);e.dataset.type=e.dataset.type===`absolute`?`percentage`:`absolute`,G.refresh()}function Ue(){let e=e=>!e.i||e.removed||e.color[0]!==`#`?`#666`:String(m(e.color).darker()),n=pack.states.map(t=>({id:t.i,state:t.i?0:null,color:e(t)})),r=pack.provinces.filter(e=>e.i&&!e.removed).map(e=>({id:e.i+n.length-1,i:e.i,state:e.state,color:e.color,name:e.name,fullName:e.fullName,area:e.area,urban:e.urban,rural:e.rural})),i=[...n,...r],a=w().parentId(e=>e.state)(i).sum(e=>e.area),o=+u(`uiSize`).value,s=300+300*o,c=90+90*o,p={top:10,right:10,bottom:0,left:10},h=s-p.left-p.right,g=c-p.top-p.bottom,_=ve().size([h,g]).padding(2);alertMessage.innerHTML=`<select id="provincesTreeType" style="display:block; margin-left:13px; font-size:11px">
    <option value="area" selected>Area</option>
    <option value="population">Total population</option>
    <option value="rural">Rural population</option>
    <option value="urban">Urban population</option>
  </select>`,alertMessage.innerHTML+=`<div id='provinceInfo' class='chartInfo'>&#8205;</div>`;let y=l(`#alertMessage`).insert(`svg`,`#provinceInfo`).attr(`id`,`provincesTree`).attr(`width`,s).attr(`height`,c).attr(`font-size`,`10px`).append(`g`).attr(`transform`,`translate(10, 0)`);u(`provincesTreeType`).addEventListener(`change`,T),_(a);let b=y.selectAll(`g`).data(a.leaves()).enter().append(`g`).attr(`data-id`,e=>e.data.i).on(`mouseenter`,(e,t)=>x(e,t)).on(`mouseleave`,e=>S(e));function x(e,n){l(e.currentTarget).select(`rect`).classed(`selected`,!0);let r=n.data.fullName,i=pack.states[n.data.state].fullName,a=`${v(n.data.area)} ${f()}`,o=t(n.data.rural*populationRate),s=t(n.data.urban*populationRate*urbanization),c=u(`provincesTreeType`).value,p=c===`area`?`Area: ${a}`:c===`rural`?`Rural population: ${d(o)}`:c===`urban`?`Urban population: ${d(s)}`:`Population: ${d(o+s)}`;u(`provinceInfo`).innerHTML=`${r}. ${i}. ${p}`,we(e)}function S(e){Y(e),document.getElementById(`provinceInfo`)&&(u(`provinceInfo`).innerHTML=`&#8205;`,l(e.currentTarget).select(`rect`).classed(`selected`,!1))}b.append(`rect`).attr(`stroke`,e=>e.parent.data.color).attr(`stroke-width`,1).attr(`fill`,e=>e.data.color).attr(`x`,e=>e.x0).attr(`y`,e=>e.y0).attr(`width`,e=>e.x1-e.x0).attr(`height`,e=>e.y1-e.y0),b.append(`text`).attr(`text-rendering`,`optimizeSpeed`).attr(`dx`,`.2em`).attr(`dy`,`1em`).attr(`x`,e=>e.x0).attr(`y`,e=>e.y0);function C(){b.select(`text`).each(function(e){this.innerHTML=e.data.name;let t=this.getBBox();t.y+t.height>e.y1+1&&(this.innerHTML=``);for(let n=0;n<15&&t.width>0&&t.x+t.width>e.x1;n++){if(this.innerHTML.length<3){this.innerHTML=``;break}this.innerHTML=`${this.innerHTML.slice(0,-2)}…`,t=this.getBBox()}})}function T(){let e=this.value===`area`?e=>e.area:this.value===`rural`?e=>e.rural:this.value===`urban`?e=>e.urban:e=>e.rural+e.urban;a.sum(e),b.data(_(a).leaves()),b.select(`rect`).transition().duration(1500).attr(`x`,e=>e.x0).attr(`y`,e=>e.y0).attr(`width`,e=>e.x1-e.x0).attr(`height`,e=>e.y1-e.y0),b.select(`text`).transition().duration(1500).attr(`x`,e=>e.x0).attr(`y`,e=>e.y0),setTimeout(C,2e3)}$(`#alert`).dialog({title:`Provinces chart`,width:`fit-content`,position:{my:`left bottom`,at:`left+10 bottom-10`,of:`svg`},buttons:{},close:()=>{alertMessage.innerHTML=``}}),C()}function We(){k({title:`Release provinces`,message:`Are you sure you want to release all provinces?
        </br>It will turn all separable provinces into independent states.
        </br>Capital province and provinces without any burgs will state as they are`,confirm:`Release`,onConfirm:()=>{let e=[],t=[];J().forEach(n=>{if(!n.burg||n.burg===pack.states[n.state].capital||n.burgs.some(e=>pack.burgs[e].capital))return;let r=Oe(n.i);r&&(e.push(r[0]),t.push(r[1]))}),ke(r(e),t)}})}function Ge(){layerIsOn(`toggleProvinces`)||toggleProvinces(),layerIsOn(`toggleBorders`)||toggleBorders(),l(`#provinceBorders`).select(`path`).attr(`stroke`,`#000`).attr(`stroke-width`,.5),l(`#stateBorders`).select(`path`).attr(`stroke`,`#000`).attr(`stroke-width`,1.2),customization=11,l(`#provs`).select(`g#provincesBody`).append(`g`).attr(`id`,`temp`).attr(`stroke-width`,.3),l(`#provs`).select(`g#provincesBody`).append(`g`).attr(`id`,`centers`).attr(`fill`,`none`).attr(`stroke`,`#ff0000`).attr(`stroke-width`,1),document.querySelectorAll(`#provincesBottom > *`).forEach(e=>{e.style.display=`none`}),u(`provincesManuallyButtons`).style.display=`inline-block`,z(B,[...W.filter(e=>!e.permanent).map(e=>e.key),`actions`]),u(`provincesFooter`).style.display=`none`,u(`provincesBodySection`).querySelectorAll(`div > input, select, span, svg`).forEach(e=>{e.style.pointerEvents=`none`}),$(`#provincesEditor`).dialog({position:{my:`right top`,at:`right-10 top+10`,of:`svg`,collision:`fit`}}),D(`Click on a province to select, drag the circle to change province`,!0),l(`#viewbox`).style(`cursor`,`crosshair`).on(`click`,qe).call(ae().on(`start`,Je)).on(`touchmove mousemove`,Xe);let e=u(`provincesBodySection`).querySelector(`:scope > .states`);e?.classList.add(`selected`),e&&X(+e.dataset.id)}function Ke(){this.parentNode.id===`provincesBodySection`&&customization===11&&(u(`provincesBodySection`).querySelector(`div.selected`)?.classList.remove(`selected`),this.classList.add(`selected`),X(+this.dataset.id))}function qe(e){let t=i(e,this),n=findCell(t[0],t[1]);if(pack.cells.h[n]<20||!pack.cells.state[n])return;let r=l(`#provs`).select(`g#temp`).select(`polygon[data-cell='${n}']`),a=r.size()?+r.attr(`data-province`):pack.cells.province[n],o=u(`provincesBodySection`).querySelector(`div[data-id='${a}']`);if(!o){D(`You cannot select a province if it is not in the Editor list`,!1,`error`);return}u(`provincesBodySection`).querySelector(`div.selected`)?.classList.remove(`selected`),o.classList.add(`selected`),X(a)}function X(e){l(`#debug`).selectAll(`path.selected`).remove();let t=l(`#provs`).select(`#province${e}`).attr(`d`);l(`#debug`).append(`path`).attr(`class`,`selected`).attr(`d`,t)}function Je(t){let n=+u(`provincesBrush`).value;t.on(`drag`,t=>{if(!t.dx&&!t.dy)return;let r=i(t,this);R(r[0],r[1],n);let a=(n>5?e(r[0],r[1],n,pack):[findCell(r[0],r[1])]).filter(e=>s(e,pack));a&&Ye(a)})}function Ye(e){let t=l(`#provs`).select(`#temp`),n=l(`#provs`).select(`#centers`),r=+u(`provincesBodySection`).querySelector(`div.selected`).dataset.id,i=pack.provinces[r].state,o=pack.provinces[r].color||`#ffffff`;e.forEach(e=>{if(!pack.cells.state[e]||pack.cells.state[e]!==i)return;let s=t.select(`polygon[data-cell='${e}']`),c=s.size()?+s.attr(`data-province`):pack.cells.province[e];if(r!==c){if(e===pack.provinces[c].center){n.select(`polygon[data-center='${e}']`).size()||n.append(`polygon`).attr(`data-center`,e).attr(`points`,a(e,pack)),D(`Province center cannot be assigned to a different region. Please remove the province first`,!1,`error`);return}s.size()?pack.cells.province[e]===r?s.remove():s.attr(`data-province`,r).attr(`fill`,o):t.append(`polygon`).attr(`points`,a(e,pack)).attr(`data-cell`,e).attr(`data-province`,r).attr(`fill`,o).attr(`stroke`,`#555`)}})}function Xe(e){ee();let t=i(e,this),n=+u(`provincesBrush`).value;R(t[0],t[1],n)}function Ze(){l(`#provs`).select(`#temp`).selectAll(`polygon`).each(function(){let e=+this.dataset.cell;pack.cells.province[e]=+this.dataset.province}),Provinces.getPoles(),layerIsOn(`toggleBorders`)&&A(),layerIsOn(`toggleProvinces`)&&drawProvinces(),P(),Z(),K()}function Z(e){customization=0,l(`#provs`).select(`#temp`).remove(),l(`#provs`).select(`#centers`).remove(),oe(),l(`#provinceBorders`).select(`path`).attr(`stroke`,null).attr(`stroke-width`,null),l(`#stateBorders`).select(`path`).attr(`stroke`,null).attr(`stroke-width`,null),l(`#debug`).selectAll(`path.selected`).remove(),document.querySelectorAll(`#provincesBottom > *`).forEach(e=>{e.style.display=`inline-block`}),u(`provincesManuallyButtons`).style.display=`none`,z(B,[]),u(`provincesFooter`).style.display=``,u(`provincesBodySection`).querySelectorAll(`div > input, select, span, svg`).forEach(e=>{e.style.removeProperty(`pointer-events`)}),e||$(`#provincesEditor`).dialog({position:{my:`right top`,at:`right-10 top+10`,of:`svg`,collision:`fit`}}),N(),O();let t=u(`provincesBodySection`).querySelector(`div.selected`);t&&t.classList.remove(`selected`)}function Qe(){if(this.classList.contains(`pressed`)){Q();return}customization=12,this.classList.add(`pressed`),D(`Click on the map to place a new province center`,!0),l(`#viewbox`).style(`cursor`,`crosshair`).on(`click`,$e),u(`provincesBodySection`).querySelectorAll(`div > input, select, span, svg`).forEach(e=>{e.style.pointerEvents=`none`})}function $e(e){let{cells:t,provinces:n}=pack,r=i(e,this),a=findCell(r[0],r[1]);if(t.h[a]<20){D(`You cannot place province into the water. Please click on a land cell`,!1,`error`);return}let o=t.province[a];if(o&&n[o].center===a){D(`The cell is already a center of a different province. Select other cell`,!1,`error`);return}let s=t.state[a];if(!s){D(`You cannot create a province in neutral lands. Please assign this land to a state first`,!1,`error`);return}e.shiftKey===!1&&Q();let c=n.length;pack.states[s].provinces.push(c);let l=t.burg[a],d=t.culture[a],f=l?pack.burgs[l].name:Names.getState(Names.getCultureShort(d),d),p=o?n[o].formName:`Province`,_=`${f} ${p}`,v=pack.states[s].color,y=h(),b=v[0]===`#`?m(g(v,y)(.2)).hex():y,S=l?.8:.4,C=l?pack.burgs[l].coa:pack.states[s].coa,w=Burgs.getType(a,C.port),T=COA.generate(C,S,+x(.1),w);T.shield=COA.getShield(d,s),COArenderer.add(`province`,c,T,r[0],r[1]),n.push({i:c,state:s,center:a,burg:l,name:f,formName:p,fullName:_,color:b,coa:T}),t.province[a]=c,t.c[a].forEach(e=>{t.h[e]<20||t.state[e]!==s||n.find(t=>!t.removed&&t.center===e)||(t.province[e]=c)}),layerIsOn(`toggleBorders`)&&A(),layerIsOn(`toggleProvinces`)&&drawProvinces(),P(),q(),u(`provincesFilterState`).value=String(s),G.reset()}function Q(){customization=0,N(),O(),u(`provincesBodySection`).querySelectorAll(`div > input, select, span, svg`).forEach(e=>{e.style.removeProperty(`pointer-events`)});let e=u(`provincesAdd`);e.classList.contains(`pressed`)&&e.classList.remove(`pressed`)}function et(){let e=+u(`provincesFilterState`).value;pack.provinces.forEach(t=>{if(!t||t.removed||e!==-1&&t.state!==e)return;let n=pack.states[t.state].color,r=h();t.color=n[0]===`#`?m(g(n,r)(.2)).hex():r}),layerIsOn(`toggleProvinces`)?drawProvinces():toggleProvinces()}function tt(){let e=`Id,Province,Full Name,Form,State,Color,Capital,Area ${areaUnit.value===`square`?`${distanceUnitInput.value}2`:areaUnit.value},Total Population,Rural Population,Urban Population,Burgs\n`;for(let t of J()){let n=t.burg?pack.burgs[t.burg].name:``;e+=`${t.i},${t.name},${t.fullName},${t.formName},${pack.states[t.state].name},${t.color},${n},${H(t)},${U(t)},${Math.round(t.rural*populationRate)},${Math.round(t.urban*populationRate*urbanization)},${t.burgs.length}\n`}let t=`${c(`Provinces`)}.csv`;b(e,t)}function nt(){alertMessage.innerHTML=`Are you sure you want to remove all provinces? <br />This action cannot be reverted`,$(`#alert`).dialog({resizable:!1,title:`Remove all provinces`,buttons:{Remove:function(){$(this).dialog(`close`),document.querySelectorAll(`[id^='provinceCOA']`).forEach(e=>{e.remove()}),l(`#emblems`).select(`#provinceEmblems`).selectAll(`*`).remove(),pack.provinces=[0],pack.cells.province=new Uint16Array(pack.cells.i.length),pack.states.forEach(e=>{e.provinces=[]}),F(),layerIsOn(`toggleBorders`)&&A(),l(`#provs`).select(`#provincesBody`).remove(),turnButtonOff(`toggleProvinces`),P(),G.reset()},Cancel:function(){$(this).dialog(`close`)}}})}function rt(){customization===11&&Z(`close`),customization===12&&Q(),$(`#provincesEditor`).dialog(`destroy`),u(`provincesEditor`).remove()}function it(){let e=+u(`provincesFilterState`).value;if(e===-1){alertMessage.innerHTML=`Please select a specific state from the filter to merge provinces within that state.`,$(`#alert`).dialog({title:`Merge Provinces`,buttons:{OK:function(){$(this).dialog(`close`)}}});return}let t=pack.provinces.filter(t=>t.i&&!t.removed&&t.state===e);if(t.length<2){alertMessage.innerHTML=`Not enough provinces in the selected state to merge.`,$(`#alert`).dialog({title:`Merge Provinces`,buttons:{OK:function(){$(this).dialog(`close`)}}});return}let n=e=>`<svg class="coaIcon" viewBox="0 0 200 200"><use href="#provinceCOA${e}"></use></svg>`,r=t.map(e=>`
    <div data-id="${e.i}" data-tip="${e.fullName||e.name}" style="cursor:default">
      <input type="radio" name="rulingProvince" value="${e.i}" />
      <input id="selectProvince${e.i}" class="checkbox" type="checkbox" name="provincesToMerge" value="${e.i}" />
      <label for="selectProvince${e.i}" class="checkbox-label"><fill-box fill="${e.color}" disabled></fill-box>${n(e.i)}${e.name}</label>
    </div>
  `).join(``);alertMessage.innerHTML=`
    <form id='mergeProvincesForm' style="overflow: hidden; display: flex; flex-direction: column; gap: 1em;">
      <p style="margin:0">
        Check the <b>checkbox</b> next to each province you want to merge.
        Use the <b>radio button</b> to pick the <em>primary province</em> that will absorb all others.
        Hover over a row to highlight the province on the map.
      </p>
      <main style='display: grid; grid-template-columns: 1fr 1fr; gap: .3em;'>
        ${r}
      </main>
    </form>
  `,u(`mergeProvincesForm`).querySelectorAll(`div[data-id]`).forEach(e=>{e.addEventListener(`mouseenter`,at),e.addEventListener(`mouseleave`,Y)}),$(`#alert`).dialog({width:600,title:`Merge provinces`,close:Y,buttons:{Merge:function(){let e=new FormData(u(`mergeProvincesForm`)),t=Number(e.get(`rulingProvince`));if(!t){D(`Please select a province to merge into`,!1,`error`);return}let r=e.getAll(`provincesToMerge`).map(Number).filter(e=>e!==t);if(!r.length){D(`Please select several provinces to merge`,!1,`error`);return}k({title:`Merge provinces`,message:`
            <p>The following provinces will be <strong>removed</strong>: ${r.map(e=>`${n(e)}${pack.provinces[e].name}`).join(`, `)}.</p>
            <p>Removed provinces data (burgs and cells) will be assigned to ${n(t)}${pack.provinces[t].name}.</p>
            <p>Are you sure you want to merge provinces? This action cannot be reverted.</p>`,confirm:`Merge`,onConfirm:()=>{st(r,t),$(this).dialog(`close`)}})},Cancel:function(){$(this).dialog(`close`)}}})}function at(e){if(!layerIsOn(`toggleProvinces`))return;let t=+e.currentTarget.dataset.id;if(!t)return;let n=l(`#provs`).select(`#province${t}`).attr(`d`);if(!n)return;Y(e);let r=l(`#debug`).append(`path`).attr(`class`,`highlight`).attr(`d`,n).attr(`fill`,`none`).attr(`stroke`,`red`).attr(`stroke-width`,1).attr(`opacity`,1).attr(`filter`,`url(#blur1)`),i=r.node().getTotalLength(),a=(i+5e3)/2,o=y(`0, ${i}`,`${i}, ${i}`);r.transition().duration(a).attrTween(`stroke-dasharray`,()=>o)}function ot(e){F(`focusProvince${e}`);let t=document.getElementById(`provinceCOA${e}`);t&&t.remove(),l(`#emblems`).select(`#provinceEmblems > use[data-i='${e}']`).remove()}function st(e,t){let n=pack.provinces[t],r=new Map;e.forEach(e=>{if(e===t)return;let i=pack.provinces[e];i.burgs.forEach(e=>{pack.burgs[e].province=t,n.burgs.includes(e)||n.burgs.push(e)}),!n.burg&&i.burg&&(n.burg=i.burg),r.set(e,t),ot(e),pack.provinces[e]={i:e,removed:!0}}),pack.cells.province.forEach((e,t)=>{let n=r.get(e);n!==void 0&&(pack.cells.province[t]=n)});let i=pack.states[n.state];i.provinces=i.provinces.filter(e=>!pack.provinces[e].removed),q(),Provinces.getPoles(),layerIsOn(`toggleProvinces`)&&drawProvinces(),layerIsOn(`toggleBorders`)&&A(),P(),F(),l(`#debug`).selectAll(`.highlight`).remove(),K()}function ct(e,t){let n=pack.provinces[e];n.lock=!n.lock,t.toggle(`icon-lock-open`),t.toggle(`icon-lock`)}var lt={open:ye};export{lt as ProvincesEditor};