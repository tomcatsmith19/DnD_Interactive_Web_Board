import{Dn as e,Ft as t,In as n,L as r,Sn as i,U as a,W as o,c as s,d as c,i as l,kt as u,ot as d,r as f}from"./utils-BYaxf2yO.js";import{r as p}from"./tooltips-CSQuPvuv.js";import{Dt as m,Jt as h,Lt as g,Pt as _,Qt as v,Yt as y,jt as b,kt as x,l as S,s as C}from"./index-DqeJMjPz.js";function w(e){for(var t=-1,n=e.length,r=e[n-1],i,a,o=r[0],s=r[1],c=0;++t<n;)i=o,a=s,r=e[t],o=r[0],s=r[1],i-=o,a-=s,c+=Math.hypot(i,a);return c}var T;function E(e){customization||(x(`.stable`),layerIsOn(`toggleCells`)&&toggleCells(),D(),i(`#debug`).append(`g`).attr(`id`,`vertices`),T=i(e),k(),I(),A(),i(`#viewbox`).on(`touchmove mousemove`,null),$(`#lakeEditor`).dialog({title:`Edit Lake`,resizable:!1,position:{my:`center top+20`,at:`top`,of:`svg`,collision:`fit`},close:U}))}function D(){b(`lakeEditor`),a(`dialogs`).insertAdjacentHTML(`beforeend`,`<div id="lakeEditor" class="dialog">
    <div id="lakeBody" style="padding-bottom: 0.3em">
      <div>
        <div class="label" style="width: 4.8em">Name:</div>
        <span id="lakeNameCulture" data-tip="Generate culture-specific name for the lake" class="icon-book pointer"></span>
        <span id="lakeNameRandom" data-tip="Generate random name for the lake" class="icon-globe pointer"></span>
        <input id="lakeName" data-tip="Type to rename the lake" autocorrect="off" spellcheck="false" />
        <span id="lakeNameSpeak" data-tip="Speak the name. You can change voice and language in options" class="speaker">🔊</span>
      </div>
      <div data-tip="Type to change lake type (group)">
        <div class="label" style="width: 4.8em">Type:</div>
        <span id="lakeGroupRemove" data-tip="Remove the group" class="icon-trash-empty pointer"></span>
        <span id="lakeGroupAdd" data-tip="Create a new type (group) for the lake" class="icon-plus pointer"></span>
        <select id="lakeGroup" data-tip="Select lake type (group)"></select>
        <input id="lakeGroupName" placeholder="type name" data-tip="Provide a name for the new group" style="display: none" />
        <span id="lakeEditStyle" data-tip="Edit lake group style in Style Editor" class="icon-brush pointer"></span>
      </div>
      <div data-tip="Lake area in selected units">
        <div class="label">Area:</div>
        <input id="lakeArea" disabled />
      </div>
      <div data-tip="Lake shore length in selected units">
        <div class="label">Shore length:</div>
        <input id="lakeShoreLength" disabled />
      </div>
      <div data-tip="Lake elevation in selected units">
        <div class="label">Elevation:</div>
        <input id="lakeElevation" disabled />
      </div>
      <div data-tip="Lake average depth in selected units">
        <div class="label">Average depth:</div>
        <input id="lakeAverageDepth" disabled />
      </div>
      <div data-tip="Lake maximum depth in selected units">
        <div class="label">Max depth:</div>
        <input id="lakeMaxDepth" disabled />
      </div>
      <div data-tip="Lake water supply. If supply > evaporation and there is an outlet, the lake water is fresh. If supply is very low, the lake becomes dry">
        <div class="label">Supply:</div>
        <input id="lakeFlux" disabled />
      </div>
      <div data-tip="Evaporation from lake surface. If evaporation > supply, the lake water is saline. If difference is high, the lake becomes dry">
        <div class="label">Evaporation:</div>
        <input id="lakeEvaporation" disabled />
      </div>
      <div data-tip="Number of lake inlet rivers">
        <div class="label">Inlets:</div>
        <input id="lakeInlets" disabled />
      </div>
      <div data-tip="Lake outlet river">
        <div class="label">Outlet:</div>
        <input id="lakeOutlet" disabled />
      </div>
    </div>
    <div id="lakeBottom">
      <button id="lakeLegend" data-tip="Edit free text notes (legend) for the lake" class="icon-edit"></button>
    </div>
  </div>`),a(`lakeName`).addEventListener(`input`,N),a(`lakeNameSpeak`).addEventListener(`click`,()=>d(a(`lakeName`).value)),a(`lakeNameCulture`).addEventListener(`click`,P),a(`lakeNameRandom`).addEventListener(`click`,F),a(`lakeGroup`).addEventListener(`change`,L),a(`lakeGroupAdd`).addEventListener(`click`,R),a(`lakeGroupName`).addEventListener(`change`,z),a(`lakeGroupRemove`).addEventListener(`click`,B),a(`lakeEditStyle`).addEventListener(`click`,V),a(`lakeLegend`).addEventListener(`click`,H)}function O(){let e=+T.attr(`data-f`);return pack.features.find(t=>t.i===e)}function k(){let{cells:t,vertices:n,rivers:r}=pack,i=O();a(`lakeName`).value=i.name,a(`lakeArea`).value=`${c(f(i.area))} ${l()}`;let o=w(i.vertices.map(e=>n.p[e]));a(`lakeShoreLength`).value=`${c(o*distanceScale)} ${distanceUnitInput.value}`;let u=Array.from(t.i.filter(e=>t.f[e]===i.i)).map(e=>t.h[e]);a(`lakeElevation`).value=s(i.height),a(`lakeAverageDepth`).value=s(v(u)??0,!0),a(`lakeMaxDepth`).value=s(e(u)??0,!0),a(`lakeFlux`).value=String(i.flux),a(`lakeEvaporation`).value=String(i.evaporation);let d=i.inlets?.map(e=>r.find(t=>t.i===e)?.name),p=i.outlet?r.find(e=>e.i===i.outlet)?.name:`no`,m=a(`lakeInlets`);m.value=d?String(d.length):`no`,m.title=d?d.join(`, `):``,a(`lakeOutlet`).value=p??`no`}function A(){let e=O().vertices,t=n(e.flatMap(e=>pack.vertices.c[e]));i(`#debug`).select(`#vertices`).selectAll(`polygon`).data(t).enter().append(`polygon`).attr(`points`,e=>r(e,pack)).attr(`data-c`,e=>e),i(`#debug`).select(`#vertices`).selectAll(`circle`).data(e).enter().append(`circle`).attr(`cx`,e=>pack.vertices.p[e][0]).attr(`cy`,e=>pack.vertices.p[e][1]).attr(`r`,.4).attr(`data-v`,e=>e).call(y().on(`drag`,j).on(`end`,M)).on(`mousemove`,()=>p(`Drag to move the vertex. Please use for fine-tuning only! Edit heightmap to change actual cell heights`))}function j(e,n){let o=t(e.x,2),s=t(e.y,2);this.setAttribute(`cx`,String(o)),this.setAttribute(`cy`,String(s)),pack.vertices.p[n]=[o,s];let u=O();i(`#deftemp`).select(`#featurePaths > path#feature_${u.i}`).attr(`d`,C(u));let d=u.vertices.map(e=>pack.vertices.p[e]);u.area=Math.abs(h(d)),a(`lakeArea`).value=`${c(f(u.area))} ${l()}`,i(`#debug`).select(`#vertices`).selectAll(`polygon`).attr(`points`,e=>r(e,pack))}function M(){layerIsOn(`toggleStates`)&&drawStates(),layerIsOn(`toggleProvinces`)&&drawProvinces(),layerIsOn(`toggleBorders`)&&m(),layerIsOn(`toggleBiomes`)&&S(),layerIsOn(`toggleReligions`)&&drawReligions(),layerIsOn(`toggleCultures`)&&drawCultures()}function N(){O().name=this.value}function P(){let e=O();e.name=a(`lakeName`).value=Lakes.getName(e)}function F(){let e=O();e.name=a(`lakeName`).value=Names.getBase(u(Names.nameBases.length-1))}function I(){let e=O(),t=a(`lakeGroup`);t.options.length=0,i(`#lakes`).selectAll(`g`).each(function(){t.options.add(new Option(this.id,this.id,!1,this.id===e.group))})}function L(){a(this.value).appendChild(T.node()),O().group=this.value}function R(){let e=a(`lakeGroupName`),t=a(`lakeGroup`);e.style.display===`none`?(e.style.display=`inline-block`,e.focus(),t.style.display=`none`):(e.style.display=`none`,t.style.display=`inline-block`)}function z(){if(!this.value){p(`Please provide a valid group name`);return}let e=this.value.toLowerCase().replace(/ /g,`_`).replace(/[^\w\s]/gi,``);if(o(e)){p(`Element with this id already exists. Please provide a unique name`,!1,`error`);return}if(Number.isFinite(+e.charAt(0))){p(`Group name should start with a letter`,!1,`error`);return}let t=T.node().parentNode;if(![`freshwater`,`salt`,`sinkhole`,`frozen`,`lava`,`dry`].includes(t.id)&&t.childElementCount===1){a(`lakeGroup`).selectedOptions[0].remove(),a(`lakeGroup`).options.add(new Option(e,e,!1,!0)),t.id=e,R(),a(`lakeGroupName`).value=``;return}let n=T.node().parentNode.cloneNode(!1);a(`lakes`).appendChild(n),n.id=e,a(`lakeGroup`).options.add(new Option(e,e,!1,!0)),a(e).appendChild(T.node()),R(),a(`lakeGroupName`).value=``}function B(){let e=T.node().parentNode.id;if([`freshwater`,`salt`,`sinkhole`,`frozen`,`lava`,`dry`].includes(e)){p(`This is one of the default groups, it cannot be removed`,!1,`error`);return}let t=T.node().parentNode.childElementCount;alertMessage.innerHTML=`Are you sure you want to remove the group? All lakes of the group (${t}) will be turned into Freshwater`,$(`#alert`).dialog({resizable:!1,title:`Remove lake group`,width:`26em`,buttons:{Remove:function(){$(this).dialog(`close`);let t=a(`freshwater`),n=a(e);for(;n.childNodes.length;)t.appendChild(n.childNodes[0]);n.remove(),a(`lakeGroup`).selectedOptions[0].remove(),a(`lakeGroup`).value=`freshwater`},Cancel:function(){$(this).dialog(`close`)}}})}function V(){let e=T.node().parentNode.id;editStyle(`lakes`,e)}function H(){let e=T.attr(`id`);g.NotesEditor.open(e,`${O().name} ${a(`lakeGroup`).value} lake`)}function U(){i(`#debug`).select(`#vertices`).remove(),_(),b(`lakeEditor`)}var W={open:E};export{W as LakesEditor};