import{A as e,Ft as t,H as n,K as r,L as i,On as a,Ot as o,R as s,S as c,Sn as l,U as u,d,gt as f,i as p,kt as m,mt as h,n as g,ot as _,pt as v,r as y,rn as b,x,xt as ee}from"./utils-BYaxf2yO.js";import{t as te}from"./stratify-CGdiYggi.js";import{t as ne}from"./pack-CyBKcrr4.js";import{n as re,r as S,t as C}from"./tooltips-CSQuPvuv.js";import{At as w,Dt as T,Ft as ie,Ht as ae,It as oe,Lt as E,N as se,Nt as D,P as ce,Pt as O,Q as k,Ut as le,Vt as ue,X as de,Yt as fe,Z as A,jt as j,kt as pe,n as me,t as M,wt as he}from"./index-DqeJMjPz.js";import{t as N}from"./highlighting-CH83CMtN.js";import{a as P,i as ge,n as F,r as I,t as _e}from"./table-BDnPiVU4.js";var L=[],R=`statesEditor`,z={my:`right top`,at:`right-10 top+10`,of:`svg`,collision:`fit`},B=[{key:`color`,width:`1.2em`,permanent:!0},{key:`name`,label:`State`,width:`7em`,permanent:!0,sortBy:e=>e.name||``,sortType:`alpha`},{key:`emblem`,width:`1.4em`},{key:`form`,label:`Form`,width:`8em`,mobileHidden:!0,sortBy:e=>e.i&&e.formName||``,sortType:`alpha`},{key:`capital`,label:`Capital`,width:`7em`,sortBy:e=>e.i&&pack.burgs[e.capital]?.name||``,sortType:`alpha`},{key:`culture`,label:`Culture`,width:`10em`,mobileHidden:!0,sortBy:e=>e.i&&pack.cultures[e.culture]?.name||``,sortType:`alpha`},{key:`burgs`,label:`Burgs`,width:`5em`,mobileHidden:!0,sortBy:e=>e.burgs||0},{key:`cells`,label:`Cells`,width:`5em`,hidden:!0,mobileHidden:!0,sortBy:e=>e.cells||0},{key:`area`,label:`Area`,width:`7em`,mobileHidden:!0,defaultSort:`desc`,sortBy:e=>y(e.area||0)},{key:`population`,label:`Population`,width:`6em`,sortBy:e=>t((e.rural||0)*populationRate+(e.urban||0)*populationRate*urbanization)},{key:`treasury`,label:`Treasury`,width:`6em`,mobileHidden:!0,tip:`Click to sort by state treasury. Click on a value to view and edit taxes`,sortBy:e=>e.treasury||0},{key:`type`,label:`Type`,width:`5em`,hidden:!0,sortBy:e=>e.i&&e.type||``,sortType:`alpha`},{key:`expansionism`,label:`Expansion`,width:`5em`,hidden:!0,sortBy:e=>e.i&&e.expansionism||0},{key:`actions`,width:`4.2em`,permanent:!0,align:`right`}],V=F({getData:()=>ce(R,pack.states.filter(e=>!e.removed),B),onUpdate:xe});function ve(){customization||(pe(`#${R}, .stable`),layerIsOn(`toggleStates`)||toggleStates(),layerIsOn(`toggleBorders`)||toggleBorders(),layerIsOn(`toggleCultures`)&&toggleCultures(),layerIsOn(`toggleBiomes`)&&toggleBiomes(),layerIsOn(`toggleReligions`)&&toggleReligions(),ye(),States.collectStatistics(),V.reset(),$(`#${R}`).dialog({title:`States Editor`,resizable:!1,width:`fit-content`,position:z,close:be}))}function ye(){j(R);let e=`<div id="${R}" class="dialog stable editorDialog">
    <div id="statesBodySection" class="table" data-type="absolute">
      ${I({dialogId:R,columns:B})}
    </div>

    <div id="statesFooter" class="totalLine">
      <div data-tip="States number" style="margin-left: 5px">States:&nbsp;<span id="statesFooterStates">0</span></div>
      <div data-tip="Total burgs number" style="margin-left: 12px" data-col="burgs">Burgs:&nbsp;<span id="statesFooterBurgs">0</span></div>
      <div data-tip="Total land area" style="margin-left: 12px" data-col="area">Land Area:&nbsp;<span id="statesFooterArea">0</span></div>
      <div data-tip="Total population" style="margin-left: 12px" data-col="population">Population:&nbsp;<span id="statesFooterPopulation">0</span></div>
    </div>

    <div id="statesBottom" class="editorToolbar">
      <button id="statesEditorRefresh" data-tip="Refresh the Editor" class="icon-cw"></button>
      <button id="statesEditStyle" data-tip="Edit states style in Style Editor" class="icon-adjust"></button>
      <button id="statesLegend" data-tip="Toggle Legend box" class="icon-list-bullet"></button>
      <button id="statesPercentage" data-tip="Toggle percentage / absolute values views" class="icon-percent"></button>
      <button id="statesChart" data-tip="Show states bubble chart" class="icon-chart-area"></button>

      <button id="statesRegenerate" data-tip="Show the regeneration menu and more data" class="icon-cog-alt"></button>
      <div id="statesRegenerateButtons" style="display: none">
        <button id="statesRegenerateBack" data-tip="Hide the regeneration menu" class="icon-cog-alt"></button>
        <button id="statesRandomize" data-tip="Randomize states Expansion value and re-calculate states and provinces" class="icon-shuffle"></button>
        <div data-tip="Additional growth rate. Defines how many land cells remain neutral" style="display: inline-block">
          <slider-input id="statesGrowthRate" min=".1" max="3" step=".05" value="1">Growth rate:</slider-input>
        </div>
        <button id="statesRecalculate" data-tip="Recalculate states based on current values of growth-related attributes" class="icon-retweet"></button>
        <div data-tip="Allow states neutral distance, expansion and type changes to take an immediate effect" style="display: inline-block">
          <input id="statesAutoChange" class="checkbox" type="checkbox" />
          <label for="statesAutoChange" class="checkbox-label"><i>auto-apply changes</i></label>
        </div>
        <div data-tip="Allow system to change state labels when states data is change" style="display: inline-block">
          <input id="adjustLabels" class="checkbox" type="checkbox" />
          <label for="adjustLabels" class="checkbox-label"><i>auto-change labels</i></label>
        </div>
      </div>

      <button id="statesManually" data-tip="Manually re-assign states" class="icon-brush"></button>
      <div id="statesManuallyButtons" style="display: none">
        <div data-tip="Change brush size. Shortcuts: + / ] to increase; - / [ to decrease" style="margin-block: 0.3em;">
          <slider-input id="statesBrush" min="1" max="100" value="15">Brush size:</slider-input>
        </div>
        <button id="statesManuallyUndo" data-tip="Undo last brush stroke" class="icon-ccw"></button>
        <button id="statesManuallyApply" data-tip="Apply assignment" class="icon-check"></button>
        <button id="statesManuallyCancel" data-tip="Cancel assignment" class="icon-cancel"></button>
        <div data-tip="When enabled, only neutral cells can be painted" style="display: inline-block">
          <input id="statesManuallyProtect" class="checkbox" type="checkbox" />
          <label for="statesManuallyProtect" class="checkbox-label"><i>do not overwrite existing</i></label>
        </div>
      </div>

      <button id="statesAdd" data-tip="Add a new state. Hold Shift to add multiple" class="icon-plus"></button>
      <button id="statesMerge" data-tip="Merge several states into one" class="icon-layer-group"></button>
      <button id="statesExport" data-tip="Save state-related data as a text file (.csv)" class="icon-download"></button>
    </div>
  </div>`;u(`dialogs`).insertAdjacentHTML(`beforeend`,e),se(R,V.reset),N(R,({cellId:e})=>pack.cells.h[e]<20?void 0:pack.cells.state[e]),_e({dialogId:R,columns:B,onUpdate:()=>D(R,{width:`fit-content`,position:z})}),u(`statesEditorRefresh`).addEventListener(`click`,H),u(`statesEditStyle`).addEventListener(`click`,()=>editStyle(`regions`)),u(`statesLegend`).addEventListener(`click`,Fe),u(`statesPercentage`).addEventListener(`click`,q),u(`statesChart`).addEventListener(`click`,Ie),u(`statesRegenerate`).addEventListener(`click`,Le),u(`statesRegenerateBack`).addEventListener(`click`,ze),u(`statesRecalculate`).addEventListener(`click`,()=>J(!0)),u(`statesRandomize`).addEventListener(`click`,Re),u(`statesGrowthRate`).addEventListener(`input`,()=>J(!1)),u(`statesManually`).addEventListener(`click`,Be),u(`statesManuallyUndo`).addEventListener(`click`,qe),u(`statesManuallyApply`).addEventListener(`click`,Ge),u(`statesManuallyCancel`).addEventListener(`click`,()=>Z(!1)),u(`statesAdd`).addEventListener(`click`,Je),u(`statesMerge`).addEventListener(`click`,Xe),u(`statesExport`).addEventListener(`click`,Ze),u(`statesBodySection`).addEventListener(`click`,e=>{let t=e.target,n=t.classList,r=t.closest(`.states`);if(!r)return;let i=Number(r.dataset.id);t.tagName===`FILL-BOX`?Se(t):n.contains(`name`)?Ce(i):n.contains(`coaIcon`)?E.EmblemsEditor.open(`state`,`stateCOA${i}`,pack.states[i]):n.contains(`icon-star-empty`)?Oe(i):n.contains(`icon-dot-circled`)?E.BurgsOverview.open({stateId:i}):n.contains(`statePopulation`)?Ee(i):n.contains(`stateTreasury`)?De(i):n.contains(`icon-pin`)?Me(i,n):n.contains(`icon-target`)?le(l(`#regions`).select(`#state${i}`).node(),4):n.contains(`icon-trash-empty`)?Ne(i):(n.contains(`icon-lock`)||n.contains(`icon-lock-open`))&&Qe(i,n)}),u(`statesBodySection`).addEventListener(`change`,e=>{let t=e.target,n=t.classList,r=t.closest(`.states`);if(!r)return;let i=+r.dataset.id;n.contains(`stateCulture`)?ke(i,r,t.value):n.contains(`cultureType`)?Ae(i,r,t.value):n.contains(`statePower`)&&je(i,r,t.value)})}function be(){customization===2&&Z(!0),customization===3&&Q(),l(`#debug`).selectAll(`.highlight`).remove(),j(R)}function H(){States.collectStatistics(),V.refresh()}function xe(e){let n=p(),r=0,i=0,a=0;for(let n of e.all){r+=y(n.area||0);let e=(n.rural||0)*populationRate,o=(n.urban||0)*populationRate*urbanization;i+=t(e+o),a+=n.burgs||0}let o=``;for(let r of e.rows){let e=y(r.area||0),i=(r.rural||0)*populationRate,a=(r.urban||0)*populationRate*urbanization,s=t(i+a),c=`Total population: ${d(s)}; Rural population: ${d(i)}; Urban population: ${d(a)}. Click to change`,u=l(`#deftemp`).select(`#fog #focusState${r.i}`).size(),f=`Current treasury: 🟡 ${d(r.treasury)}. Sales Tax: ${t((r.salesTax||0)*100,1)}%. Poll Tax: ${t((r.pollTax||0)*100,1)}%. Click to view and edit taxes`;if(!r.i){o+=`<div
        class="states"
        data-id=${r.i}
        data-name="${r.name}"
        data-cells=${r.cells}
        data-area=${e}
        data-population=${s}
        data-burgs=${r.burgs}
        data-treasury="0"
        data-color=""
        data-form=""
        data-capital=""
        data-culture=""
        data-type=""
        data-expansionism=""
      >
        <svg width="1em" height="1em" class="placeholder" data-col="color"></svg>
        <input data-tip="Neutral lands name. Click to change" class="stateName name pointer italic" value="${r.name}" readonly data-col="name" />
        <svg class="coaIcon placeholder" viewBox="0 0 200 200" data-col="emblem"></svg>
        <input class="stateForm placeholder" value="none" data-col="form" />
        <div data-col="capital">
          <span class="icon-star-empty placeholder"></span>
          <div class="stateCapital placeholder"></div>
        </div>
        <select class="stateCulture placeholder" data-col="culture">${U(0)}</select>
        <div data-col="burgs">
          <span data-tip="Click to overview neutral burgs" class="icon-dot-circled pointer" style="padding-right: 1px"></span>
          <div data-tip="Burgs count" class="stateBurgs">${r.burgs}</div>
        </div>
        <div data-col="cells">
          <span data-tip="Cells count" class="icon-check-empty"></span>
          <div data-tip="Cells count" class="stateCells">${r.cells}</div>
        </div>
        <div data-col="area">
          <span data-tip="Neutral lands area" style="padding-right: 4px" class="icon-map-o"></span>
          <div data-tip="Neutral lands area" class="stateArea">${d(e)} ${n}</div>
        </div>
        <div data-col="population">
          <span data-tip="${c}" class="icon-male"></span>
          <div data-tip="${c}" class="statePopulation pointer">${d(s)}</div>
        </div>
        <div data-tip="Neutrals collect no taxes" class="stateTreasury placeholder" data-col="treasury"></div>
        <select class="cultureType placeholder" data-col="type">${W(0)}</select>
        <div data-col="expansionism">
          <span class="icon-resize-full placeholder"></span>
          <input class="statePower placeholder" type="number" value="0" />
        </div>
        <div data-col="actions"></div>
      </div>`;continue}let p=pack.burgs[r.capital].name;COArenderer.trigger(`stateCOA${r.i}`,r.coa),o+=`<div
      class="states"
      data-id=${r.i}
      data-name="${r.name}"
      data-form="${r.formName}"
      data-capital="${p}"
      data-color="${r.color}"
      data-cells=${r.cells}
      data-area=${e}
      data-population=${s}
      data-burgs=${r.burgs}
      data-treasury="${r.treasury}"
      data-culture=${pack.cultures[r.culture].name}
      data-type=${r.type}
      data-expansionism=${r.expansionism}
    >
      <fill-box fill="${r.color}" data-col="color"></fill-box>
      <input data-tip="State name. Click to change" class="stateName name pointer" value="${r.name}" readonly data-col="name" />
      <svg data-tip="Click to show and edit state emblem" class="coaIcon pointer" viewBox="0 0 200 200" data-col="emblem"><use href="#stateCOA${r.i}"></use></svg>
      <input data-tip="State form name. Click to change" class="stateForm name pointer" value="${r.formName}" readonly data-col="form" />
      <div data-col="capital">
        <span data-tip="State capital. Click to zoom into view" class="icon-star-empty pointer"></span>
        <div data-tip="Capital name" class="stateCapital">${p}</div>
      </div>
      <select data-tip="Dominant culture. Click to change" class="stateCulture" data-col="culture">${U(r.culture)}</select>
      <div data-col="burgs">
        <span data-tip="Click to overview state burgs" style="padding-right: 1px" class="icon-dot-circled pointer"></span>
        <div data-tip="Burgs count" class="stateBurgs">${r.burgs}</div>
      </div>
      <div data-col="cells">
        <span data-tip="Cells count" class="icon-check-empty"></span>
        <div data-tip="Cells count" class="stateCells">${r.cells}</div>
      </div>
      <div data-col="area">
        <span data-tip="State area" style="padding-right: 4px" class="icon-map-o"></span>
        <div data-tip="State area" class="stateArea">${d(e)} ${n}</div>
      </div>
      <div data-col="population">
        <span data-tip="${c}" class="icon-male"></span>
        <div data-tip="${c}" class="statePopulation pointer">${d(s)}</div>
      </div>
      <div data-tip="${f}" class="stateTreasury pointer" data-col="treasury">🟡 ${d(r.treasury)}</div>
      <select data-tip="State type. Defines growth model. Click to change" class="cultureType" data-col="type">${W(r.type)}</select>
      <div data-col="expansionism">
        <span data-tip="State expansionism" class="icon-resize-full"></span>
        <input data-tip="Expansionism (defines competitive size). Change to re-calculate states based on new value"
          class="statePower" type="number" min="0" max="99" step=".1" value=${r.expansionism} />
      </div>
      <div data-col="actions">
        <span data-tip="Locate the state" class="icon-target"></span>
        <span data-tip="Toggle state focus" class="icon-pin ${u?``:` inactive`}"></span>
        <span data-tip="Lock the state to protect it from re-generation" class="icon-lock${r.lock?``:`-open`}"></span>
        <span data-tip="Remove the state" class="icon-trash-empty"></span>
      </div>
    </div>`}let s=u(`statesBodySection`);s.querySelectorAll(`:scope > .states`).forEach(e=>{e.remove()}),s.insertAdjacentHTML(`beforeend`,o),u(`statesFooterStates`).innerHTML=String(pack.states.filter(e=>e.i&&!e.removed).length),u(`statesFooterBurgs`).innerHTML=String(a),u(`statesFooterArea`).innerHTML=d(r)+n,u(`statesFooterArea`).dataset.area=String(r),u(`statesFooterPopulation`).innerHTML=d(i),u(`statesFooterPopulation`).dataset.population=String(i),ge(u(`statesFooter`),e,V.goto),u(`statesBodySection`).querySelectorAll(`:scope > .states`).forEach(e=>{e.addEventListener(`mouseenter`,G),e.addEventListener(`mouseleave`,K),e.addEventListener(`click`,Ve)}),u(`statesBodySection`).dataset.type===`percentage`&&(u(`statesBodySection`).dataset.type=`absolute`,q()),D(R,{width:`fit-content`,position:z})}function U(e){let t=``;return pack.cultures.forEach(n=>{n.removed||(t+=`<option ${n.i===e?`selected`:``} value="${n.i}">${n.name}</option>`)}),t}function W(e){let t=``;return[`Generic`,`River`,`Lake`,`Naval`,`Nomadic`,`Hunting`,`Highland`].forEach(n=>{t+=`<option ${e===n?`selected`:``} value="${n}">${n}</option>`}),t}function G(e){if(!layerIsOn(`toggleStates`)||l(`#deftemp`).select(`#fog path`).size())return;let t=+e.target.dataset.id;if(customization||!t)return;let n=l(`#regions`).select(`#state${t}`).attr(`d`),r=l(`#debug`).append(`path`).attr(`class`,`highlight`).attr(`d`,n).attr(`fill`,`none`).attr(`stroke`,`red`).attr(`stroke-width`,1).attr(`opacity`,1).attr(`filter`,`url(#blur1)`),i=r.node().getTotalLength(),a=(i+5e3)/2,o=b(`0, ${i}`,`${i}, ${i}`);r.transition().duration(a).attrTween(`stroke-dasharray`,()=>o)}function K(){l(`#debug`).selectAll(`.highlight`).each(function(){l(this).transition().duration(1e3).attr(`opacity`,0).remove()})}function Se(e){let t=e.getAttribute(`fill`)||`#ffffff`,n=+e.closest(`.states`).dataset.id;E.ColorPicker.open(t,t=>{e.fill=t,pack.states[n].color=t,drawStates(),layerIsOn(`toggleMilitary`)&&drawMilitary()})}function Ce(e){we();let t=u(`stateNameEditorCustomForm`),r=u(`stateNameEditorSelectForm`);t.value=``,t.style.display===`inline-block`&&(t.style.display=`none`,r.style.display=`inline-block`);let i=pack.states[e];u(`stateNameEditor`).dataset.state=String(e),u(`stateNameEditorShort`).value=i.name||``,n(r,i.formName||``),u(`stateNameEditorFull`).value=i.fullName||``,$(`#stateNameEditor`).dialog({resizable:!1,title:`Change state name`,buttons:{Apply:function(){l(i),$(this).dialog(`close`)},Cancel:function(){$(this).dialog(`close`)}},position:{my:`center`,at:`center`,of:`svg`},close:Te}),u(`stateNameEditorShortCulture`).addEventListener(`click`,a),u(`stateNameEditorShortRandom`).addEventListener(`click`,o),u(`stateNameEditorShortSpeak`).addEventListener(`click`,()=>_(u(`stateNameEditorShort`).value)),u(`stateNameEditorAddForm`).addEventListener(`click`,s),u(`stateNameEditorCustomForm`).addEventListener(`change`,s),u(`stateNameEditorFullRegenerate`).addEventListener(`click`,c),u(`stateNameEditorFullSpeak`).addEventListener(`click`,()=>_(u(`stateNameEditorFull`).value));function a(){let e=+u(`stateNameEditor`).dataset.state,t=pack.states[e].culture,n=Names.getState(Names.getCultureShort(t),t);u(`stateNameEditorShort`).value=n}function o(){let e=m(Names.nameBases.length-1),t=Names.getState(Names.getBase(e),void 0,e);u(`stateNameEditorShort`).value=t}function s(){let e=t.value,i=t.style.display===`inline-block`;t.style.display=i?`none`:`inline-block`,r.style.display=i?`inline-block`:`none`,e&&i&&n(r,e),t.value=``}function c(){let e=u(`stateNameEditorShort`).value,t=u(`stateNameEditorSelectForm`).value;u(`stateNameEditorFull`).value=n();function n(){if(!t)return e;if(!e&&t)return`The ${t}`;let n=u(`stateNameEditorFullRegenerate`),r=+n.dataset.tick;return n.dataset.tick=String(r+1),r%2?`${f(e)} ${t}`:`${t} of ${e}`}}function l(e){let t=u(`stateNameEditorShort`),n=u(`stateNameEditorSelectForm`),r=u(`stateNameEditorFull`),i=t.value!==e.name,a=n.value!==e.formName,o=r.value!==e.fullName,s=i||a||o;if(a){let t=n.selectedOptions[0].parentElement?.getAttribute(`label`)||null;t&&(e.form=t)}e.name=t.value,e.formName=n.value,e.fullName=r.value,s&&u(`stateNameEditorUpdateLabel`).checked&&(e.label?.text&&delete e.label.text,k()),H()}}function we(){j(`stateNameEditor`),u(`dialogs`).insertAdjacentHTML(`beforeend`,`<div id="stateNameEditor" class="dialog" data-state="0">
      <div>
        <div data-tip="State short name" class="label">Short name:</div>
        <input
          id="stateNameEditorShort"
          data-tip="Type to change the short name"
          autocorrect="off"
          spellcheck="false"
          style="width: 11em"
        />
        <span id="stateNameEditorShortSpeak" data-tip="Speak the name. You can change voice and language in options" class="speaker">🔊</span>
        <span
          id="stateNameEditorShortCulture"
          data-tip="Generate culture-specific name"
          class="icon-book pointer"
        ></span>
        <span id="stateNameEditorShortRandom" data-tip="Generate random name" class="icon-globe pointer"></span>
      </div>
      <div data-tip="Select form name">
        <div data-tip="State form name" class="label">Form name:</div>
        <select id="stateNameEditorSelectForm" style="width: 11em">
          <option value="">blank</option>
          <optgroup label="Monarchy">
            <option value="Beylik">Beylik</option>
            <option value="Despotate">Despotate</option>
            <option value="Dominion">Dominion</option>
            <option value="Duchy">Duchy</option>
            <option value="Emirate">Emirate</option>
            <option value="Empire">Empire</option>
            <option value="Horde">Horde</option>
            <option value="Grand Duchy">Grand Duchy</option>
            <option value="Heptarchy">Heptarchy</option>
            <option value="Khaganate">Khaganate</option>
            <option value="Khanate">Khanate</option>
            <option value="Kingdom">Kingdom</option>
            <option value="Marches">Marches</option>
            <option value="Principality">Principality</option>
            <option value="Satrapy">Satrapy</option>
            <option value="Shogunate">Shogunate</option>
            <option value="Sultanate">Sultanate</option>
            <option value="Tsardom">Tsardom</option>
            <option value="Ulus">Ulus</option>
            <option value="Viceroyalty">Viceroyalty</option>
          </optgroup>
          <optgroup label="Republic">
            <option value="Chancellery">Chancellery</option>
            <option value="City-state">City-state</option>
            <option value="Diarchy">Diarchy</option>
            <option value="Federation">Federation</option>
            <option value="Free City">Free City</option>
            <option value="Most Serene Republic">Most Serene Republic</option>
            <option value="Oligarchy">Oligarchy</option>
            <option value="Protectorate">Protectorate</option>
            <option value="Republic">Republic</option>
            <option value="Tetrarchy">Tetrarchy</option>
            <option value="Trade Company">Trade Company</option>
            <option value="Triumvirate">Triumvirate</option>
          </optgroup>
          <optgroup label="Union">
            <option value="Confederacy">Confederacy</option>
            <option value="Confederation">Confederation</option>
            <option value="Conglomerate">Conglomerate</option>
            <option value="Commonwealth">Commonwealth</option>
            <option value="League">League</option>
            <option value="Union">Union</option>
            <option value="United Hordes">United Hordes</option>
            <option value="United Kingdom">United Kingdom</option>
            <option value="United Provinces">United Provinces</option>
            <option value="United Republic">United Republic</option>
            <option value="United States">United States</option>
            <option value="United Tribes">United Tribes</option>
          </optgroup>
          <optgroup label="Theocracy">
            <option value="Bishopric">Bishopric</option>
            <option value="Brotherhood">Brotherhood</option>
            <option value="Caliphate">Caliphate</option>
            <option value="Diocese">Diocese</option>
            <option value="Divine Duchy">Divine Duchy</option>
            <option value="Divine Grand Duchy">Divine Grand Duchy</option>
            <option value="Divine Principality">Divine Principality</option>
            <option value="Divine Kingdom">Divine Kingdom</option>
            <option value="Divine Empire">Divine Empire</option>
            <option value="Eparchy">Eparchy</option>
            <option value="Exarchate">Exarchate</option>
            <option value="Holy State">Holy State</option>
            <option value="Imamah">Imamah</option>
            <option value="Patriarchate">Patriarchate</option>
            <option value="Theocracy">Theocracy</option>
          </optgroup>
          <optgroup label="Anarchy">
            <option value="Commune">Commune</option>
            <option value="Community">Community</option>
            <option value="Council">Council</option>
            <option value="Free Territory">Free Territory</option>
            <option value="Tribes">Tribes</option>
          </optgroup>
        </select>
        <input
          id="stateNameEditorCustomForm"
          placeholder="type form name"
          data-tip="Enter custom form name"
          style="display: none; width: 11em"
        />
        <span
          id="stateNameEditorAddForm"
          data-tip="Click to add custom state form name to the list"
          class="icon-plus pointer"
        ></span>
      </div>
      <div>
        <div data-tip="State full name" class="label">Full name:</div>
        <input
          id="stateNameEditorFull"
          data-tip="Type to change the full name"
          autocorrect="off"
          spellcheck="false"
          style="width: 11em"
        />
        <span id="stateNameEditorFullSpeak" data-tip="Speak the name. You can change voice and language in options" class="speaker">🔊</span>
        <span
          id="stateNameEditorFullRegenerate"
          data-tip="Click to re-generate full name"
          data-tick="0"
          class="icon-arrows-cw pointer"
        ></span>
      </div>
      <div data-tip="Uncheck to not update state label on name change" style="padding-block: 0.2em">
        <input id="stateNameEditorUpdateLabel" class="checkbox" type="checkbox" checked />
        <label for="stateNameEditorUpdateLabel" class="checkbox-label"><i>Update label on Apply</i></label>
      </div>
    </div>`)}function Te(){$(`#stateNameEditor`).dialog(`destroy`),u(`stateNameEditor`).remove()}function Ee(e){let n=pack.states[e];if(!n.cells){S(`State does not have any cells, cannot change population`,!1,`error`);return}let r=t((n.rural||0)*populationRate),i=t((n.urban||0)*populationRate*urbanization),a=r+i,o=e=>Number(e).toLocaleString();alertMessage.innerHTML=`<div>
    <i>Change population of all cells assigned to the state</i>
    <div style="margin: 0.5em 0">
      Rural: <input type="number" min="0" step="1" id="ruralPop" value=${r} style="width:6em" />
      Urban: <input type="number" min="0" step="1" id="urbanPop" value=${i} style="width:6em" />
    </div>
    <div>Total population: ${o(a)} ⇒ <span id="totalPop">${o(a)}</span>
      (<span id="totalPopPerc">100</span>%)
    </div>
  </div>`;let s=u(`ruralPop`),c=u(`urbanPop`),l=u(`totalPop`),d=u(`totalPopPerc`),f=()=>{let e=s.valueAsNumber+c.valueAsNumber;Number.isNaN(e)||(l.innerHTML=o(e),d.innerHTML=String(t(e/a*100)))};s.oninput=()=>f(),c.oninput=()=>f(),$(`#alert`).dialog({resizable:!1,title:`Change state population`,width:`24em`,buttons:{Apply:function(){p(),$(this).dialog(`close`)},Cancel:function(){$(this).dialog(`close`)}},position:{my:`center`,at:`center`,of:`svg`}});function p(){let n=+s.value/r;if(Number.isFinite(n)&&n!==1&&pack.cells.i.filter(t=>pack.cells.state[t]===e).forEach(e=>{pack.cells.pop[e]*=n}),!Number.isFinite(n)&&+s.value>0){let t=+s.value/populationRate,n=pack.cells.i.filter(t=>pack.cells.state[t]===e),r=t/n.length;n.forEach(e=>{pack.cells.pop[e]=r})}let a=+c.value/i;if(Number.isFinite(a)&&a!==1&&pack.burgs.filter(t=>!t.removed&&t.state===e).forEach(e=>{e.population=t((e.population||0)*a,4)}),!Number.isFinite(a)&&+c.value>0){let n=+c.value/populationRate/urbanization,r=pack.burgs.filter(t=>!t.removed&&t.state===e),i=t(n/r.length,4);r.forEach(e=>{e.population=i})}layerIsOn(`togglePopulation`)&&drawPopulation(),H()}}function De(e){let n=pack.states[e];if(!e||!n||n.removed)return;let r=t(n.pollTax*((n.rural||0)+(n.urban||0)),2),i=pack.deals.reduce((t,n)=>{if(!n.tax)return t;let r=0;if(n.sellerType===`burg`)r=pack.burgs[n.seller]?.state||0;else if(n.sellerType===`market`){let e=Markets.get(n.seller)?.centerBurgId;r=e&&pack.burgs[e]?.state||0}return r===e?t+n.tax:t},0);alertMessage.innerHTML=`<div data-tip="Sales tax is applied to deals with a seller from the state. Poll tax is applied to all population of the state. Tax changes take effect on Production regeneration" style="margin: 0.6em 0; display: grid; grid-template-columns: 7em auto auto; row-gap: 0.4em; align-items: center">
      <label for="stateSalesTaxInput">Sales Tax:</label>
      <input id="stateSalesTaxInput" type="number" min="0" max="1" step="0.01" value="${n.salesTax}" style="width: 6em"/> = ${g(i)}
      <label for="statePollTaxInput">Poll Tax:</label>
      <input id="statePollTaxInput" type="number" min="0" max="10" step="0.01" value="${n.pollTax}" style="width: 6em"/> = ${g(r)}
      <label for="stateTreasuryInput">Treasury:</label>
      <input id="stateTreasuryInput" type="number" step="1" value="${n.treasury}" style="width: 6em" />
    </div>`,$(`#alert`).dialog({resizable:!1,title:`Taxes and Treasury: ${n.name}`,width:`26em`,buttons:{Apply:function(){let e=u(`stateSalesTaxInput`),r=u(`statePollTaxInput`),i=u(`stateTreasuryInput`),a=Math.max(0,Math.min(1,+e.value)),o=Math.max(0,+r.value),s=+i.value;Number.isFinite(a)&&(n.salesTax=t(a,4)),Number.isFinite(o)&&(n.pollTax=t(o,4)),Number.isFinite(s)&&(n.treasury=t(s,2)),H(),$(this).dialog(`close`)},Cancel:function(){$(this).dialog(`close`)}},position:{my:`center`,at:`center`,of:`svg`}})}function Oe(e){let t=pack.states[e].capital,{x:n,y:r}=pack.burgs[t];zoomTo(n,r,8,2e3)}function ke(e,t,n){pack.states[e].culture=+n,t.dataset.base=String(+n)}function Ae(e,t,n){pack.states[e].type=n,t.dataset.type=n,J()}function je(e,t,n){pack.states[e].expansionism=Number(n),t.dataset.expansionism=n,J()}function Me(e,t){if(customization)return;let n=l(`#statesBody`).select(`#state${e}`).attr(`d`),r=`focusState${e}`;t.contains(`inactive`)?de(r,n):A(r),t.toggle(`inactive`)}function Ne(e){customization||w({title:`Remove state`,message:`Are you sure you want to remove the state? <br>This action cannot be reverted`,confirm:`Remove`,onConfirm:()=>Pe(e)})}function Pe(e){l(`#statesBody`).select(`#state${e}`).remove(),l(`#statesBody`).select(`#state-gap${e}`).remove(),l(`#statesHalo`).select(`#state-border${e}`).remove(),delete pack.states[e].label,A(`focusState${e}`),pack.burgs.forEach(t=>{t.state===e&&(t.state=0,t.capital&&(t.capital=0,Burgs.changeGroup(t,null)))}),k(),pack.cells.state.forEach((t,n)=>{t===e&&(pack.cells.state[n]=0)}),u(`stateCOA${e}`).remove(),l(`#emblems`).select(`#stateEmblems > use[data-i='${e}']`).remove(),(pack.states[e].provinces||[]).forEach(e=>{pack.provinces[e]={i:e,removed:!0},pack.cells.province.forEach((t,n)=>{t===e&&(pack.cells.province[n]=0)});let t=`provinceCOA${e}`;document.getElementById(t)&&u(t).remove(),l(`#emblems`).select(`#provinceEmblems > use[data-i='${e}']`).remove();let n=l(`#provs`).select(`#provincesBody`);n.select(`#province${e}`).remove(),n.select(`#province-gap${e}`).remove()}),(pack.states[e].military||[]).forEach(t=>{let n=`regiment${e}-${t.i}`,r=notes.findIndex(e=>e.id===n);r!==-1&&notes.splice(r,1)}),armies.select(`g#army${e}`).remove(),pack.states.forEach(t=>{!t.i||t.removed||!t.neighbors||(t.neighbors=t.neighbors.filter(t=>t!==e))}),pack.states[e]={i:e,removed:!0},l(`#debug`).selectAll(`.highlight`).remove(),layerIsOn(`toggleStates`)&&drawStates(),layerIsOn(`toggleBorders`)&&T(),layerIsOn(`toggleProvinces`)&&drawProvinces(),H()}function Fe(){if(l(`#legend`).selectAll(`*`).size()){ie();return}oe(`States`,pack.states.filter(e=>e.i&&!e.removed&&e.cells).sort((e,t)=>(t.area??0)-(e.area??0)).map(e=>[e.i,e.color,e.name]))}function q(){if(u(`statesBodySection`).dataset.type===`absolute`){u(`statesBodySection`).dataset.type=`percentage`;let e=+u(`statesFooterBurgs`).innerText,n=+u(`statesFooterArea`).dataset.area,r=+u(`statesFooterPopulation`).dataset.population,i=pack.states.reduce((e,t)=>e+(t.treasury||0),0),a=pack.states.reduce((e,t)=>e+(t.i&&!t.removed&&t.cells||0),0);u(`statesBodySection`).querySelectorAll(`:scope > .states`).forEach(o=>{let{burgs:s,area:c,population:l,treasury:u,cells:d}=o.dataset;o.querySelector(`.stateBurgs`).innerText=`${t(+s/e*100)}%`,o.querySelector(`.stateCells`).innerText=`${t(+d/a*100)}%`,o.querySelector(`.stateArea`).innerText=`${t(+c/n*100)}%`,o.querySelector(`.statePopulation`).innerText=`${t(+l/r*100)}%`,o.querySelector(`.stateTreasury`).innerText=`${t(+u/i*100,2)}%`})}else u(`statesBodySection`).dataset.type=`absolute`,V.refresh()}function Ie(){let e=pack.states.filter(e=>!e.removed);if(e.length<2){S(`There are no states to show`,!1,`error`);return}let n=te().id(e=>String(e.i)).parentId(e=>e.i?`0`:null)(e).sum(e=>e.area).sort((e,t)=>t.value-e.value),r=150+200*u(`uiSize`).valueAsNumber,i={top:0,right:-50,bottom:0,left:-50},o=r-i.left-i.right,s=r-i.top-i.bottom,c=ne().size([o,s]).padding(3);alertMessage.innerHTML=`<select id="statesTreeType" style="display:block; margin-left:13px; font-size:11px">
    <option value="area" selected>Area</option>
    <option value="population">Total population</option>
    <option value="rural">Rural population</option>
    <option value="urban">Urban population</option>
    <option value="burgs">Burgs number</option>
  </select>`,alertMessage.innerHTML+=`<div id='statesInfo' class='chartInfo'>&#8205;</div>`;let f=l(`#alertMessage`).insert(`svg`,`#statesInfo`).attr(`id`,`statesTree`).attr(`width`,r).attr(`height`,r).style(`font-family`,`Almendra SC`).attr(`text-anchor`,`middle`).attr(`dominant-baseline`,`central`).append(`g`).attr(`transform`,`translate(-50, 0)`);u(`statesTreeType`).addEventListener(`change`,b),c(n);let m=f.selectAll(`g`).data(n.leaves()).enter().append(`g`).attr(`transform`,e=>`translate(${e.x},${e.y})`).attr(`data-id`,e=>e.data.i).on(`mouseenter`,(e,t)=>_(e,t)).on(`mouseleave`,e=>v(e));m.append(`circle`).attr(`fill`,e=>e.data.color).attr(`r`,e=>e.r);let h=/(?=[A-Z][^A-Z])/g,g=e=>(a(e.split(h).map(e=>e.length))??0)+1;m.append(`text`).attr(`text-rendering`,`optimizeSpeed`).style(`font-size`,e=>`${t(e.r**.97*4/g(e.data.name),2)}px`).selectAll(`tspan`).data(e=>e.data.name.split(h)).join(`tspan`).attr(`x`,0).text(e=>e).attr(`dy`,(e,t,n)=>`${t?1:(n.length-1)/-2}em`);function _(e,n){l(e.target).select(`circle`).classed(`selected`,!0);let r=n.data.fullName,i=`${y(n.data.area)} ${p()}`,a=t(n.data.rural*populationRate),o=t(n.data.urban*populationRate*urbanization),s=u(`statesTreeType`).value,c=s===`area`?`Area: ${i}`:s===`rural`?`Rural population: ${d(a)}`:s===`urban`?`Urban population: ${d(o)}`:s===`burgs`?`Burgs number: ${n.data.burgs}`:`Population: ${d(a+o)}`;u(`statesInfo`).innerHTML=`${r}. ${c}`,G(e)}function v(e){K(),document.getElementById(`statesInfo`)&&(u(`statesInfo`).innerHTML=`&#8205;`,l(e.target).select(`circle`).classed(`selected`,!1))}function b(){let e=this.value===`area`?e=>e.area:this.value===`rural`?e=>e.rural:this.value===`urban`?e=>e.urban:this.value===`burgs`?e=>e.burgs:e=>e.rural+e.urban;n.sum(e),m.data(c(n).leaves()),m.transition().duration(1500).attr(`transform`,e=>`translate(${e.x},${e.y})`),m.select(`circle`).transition().duration(1500).attr(`r`,e=>e.r),m.select(`text`).transition().duration(1500).style(`font-size`,e=>`${t(e.r**.97*4/g(e.data.name),2)}px`)}$(`#alert`).dialog({title:`States bubble chart`,width:`fit-content`,position:{my:`left bottom`,at:`left+10 bottom-10`,of:`svg`},buttons:{},close:()=>{alertMessage.innerHTML=``}})}function Le(){u(`statesBottom`).querySelectorAll(`:scope > button`).forEach(e=>{e.style.display=`none`}),u(`statesRegenerateButtons`).style.display=`block`,$(`#statesEditor`).dialog({position:{my:`right top`,at:`right-10 top+10`,of:`svg`,collision:`fit`}})}function J(e){if(!(!e&&!u(`statesAutoChange`).checked)){if(States.expandStates(),Provinces.generate(),Provinces.getPoles(),States.getPoles(),layerIsOn(`toggleStates`)&&drawStates(),layerIsOn(`toggleBorders`)&&T(),layerIsOn(`toggleProvinces`)&&drawProvinces(),u(`adjustLabels`).checked){for(let e of pack.states)e.label&&(e.label.pathPoints=void 0);k()}layerIsOn(`toggleGoods`)&&he(),layerIsOn(`toggleEmblems`)&&(ue([`state`,`province`]),ae()),H()}}function Re(){pack.states.forEach(e=>{if(!e.i||e.removed)return;let n=t(Math.random()*4+1,1);e.expansionism=n,u(`statesBodySection`).querySelector(`div.states[data-id='${e.i}'] input.statePower`).value=String(n)}),J(!0)}function ze(){u(`statesBottom`).querySelectorAll(`:scope > button`).forEach(e=>{e.style.display=`inline-block`}),u(`statesRegenerateButtons`).style.display=`none`,$(`#statesEditor`).dialog({position:{my:`right top`,at:`right-10 top+10`,of:`svg`,collision:`fit`}})}function Be(){layerIsOn(`toggleStates`)||toggleStates(),customization=2,l(`#statesBody`).append(`g`).attr(`id`,`temp`),document.querySelectorAll(`#statesBottom > button`).forEach(e=>{e.style.display=`none`}),u(`statesManuallyButtons`).style.display=`inline-block`,u(`statesHalo`).style.display=`none`,P(R,B.filter(e=>!e.permanent).map(e=>e.key)),u(`statesFooter`).style.display=`none`,u(`statesBodySection`).querySelectorAll(`div > input, select, span, svg`).forEach(e=>{e.style.pointerEvents=`none`}),$(`#statesEditor`).dialog({position:{my:`right top`,at:`right-10 top+10`,of:`svg`,collision:`fit`}}),S(`Click on state to select, drag the circle to change state`,!0),l(`#viewbox`).style(`cursor`,`crosshair`).on(`click`,He).call(fe().on(`start`,Ue)).on(`touchmove mousemove`,Y),u(`statesBodySection`).querySelector(`.states`)?.classList.add(`selected`),L=[]}function Ve(){customization===2&&this.parentNode.id===`statesBodySection`&&(u(`statesBodySection`).querySelector(`div.selected`)?.classList.remove(`selected`),this.classList.add(`selected`))}function He(e){let t=r(e,this),n=findCell(t[0],t[1]);if(pack.cells.h[n]<20)return;let i=l(`#statesBody`).select(`#temp`).select(`polygon[data-cell='${n}']`),a=i.size()?+i.attr(`data-state`):pack.cells.state[n];u(`statesBodySection`).querySelector(`div.selected`)?.classList.remove(`selected`),u(`statesBodySection`).querySelector(`div[data-id='${a}']`)?.classList.add(`selected`)}function Ue(t){let n=+u(`statesBrush`).value;Ke(),t.on(`drag`,t=>{if(!t.dx&&!t.dy)return;let i=r(t,this);M(i[0],i[1],n);let a=(n>5?e(i[0],i[1],n,pack):[findCell(i[0],i[1])]).filter(e=>e!==void 0&&s(e,pack));a&&We(a)})}function We(e){let t=l(`#statesBody`).select(`#temp`),n=+u(`statesBodySection`).querySelector(`div.selected`).dataset.id,r=pack.states[n].color||`#ffffff`,a=document.getElementById(`statesManuallyProtect`)?.checked;e.forEach(e=>{let o=t.select(`polygon[data-cell='${e}']`),s=o.size()?+o.attr(`data-state`):pack.cells.state[e];n!==s&&(a&&s||e!==pack.states[s].center&&(o.size()?o.attr(`data-state`,n).attr(`fill`,r).attr(`stroke`,r):t.append(`polygon`).attr(`data-cell`,e).attr(`data-state`,n).attr(`points`,i(e,pack)).attr(`fill`,r).attr(`stroke`,r)))})}function Y(e){re();let t=r(e,this),n=+u(`statesBrush`).value;M(t[0],t[1],n)}function Ge(){let{cells:e}=pack,t=[],n=[];if(l(`#statesBody`).select(`#temp`).selectAll(`polygon`).each(function(){let r=+this.dataset.cell,i=+this.dataset.state;t.push(e.state[r],i),n.push(e.province[r]),e.state[r]=i,e.burg[r]&&(pack.burgs[e.burg[r]].state=i)}),t.length){if(H(),States.getPoles(),layerIsOn(`toggleStates`)?drawStates():toggleStates(),u(`adjustLabels`).checked){let e=[...new Set(t)];for(let t of e)pack.states[t].label&&delete pack.states[t].label;k()}X([...new Set(n)]),layerIsOn(`toggleBorders`)?T():toggleBorders(),layerIsOn(`toggleProvinces`)&&drawProvinces()}Z(!1)}function X(e){let{cells:t,provinces:n,states:r,burgs:i}=pack;e.forEach(e=>{if(!n[e])return;let r=t.i.filter(n=>t.province[n]===e),i=[...new Set(r.map(e=>t.state[e]))];if(e&&i.length===1){a(e,i[0],r);return}s(e,i,r)});function a(e,i,a){let o=n[e],s=r[o.state];s.provinces=s.provinces.filter(t=>t!==e),i?(o.state=i,r[i].provinces.push(e)):(n[e]={i:e,removed:!0},a.forEach(e=>{t.province[e]=0}))}function s(e,i,a){let o=n[e],s=r[o.state],u=t.state[o.center];i.forEach(i=>{let d=a.filter(e=>t.state[e]===i);if(i===u){if(i===s.i)return;if(!i){n[e]={i:e,removed:!0},d.forEach(e=>{t.province[e]=0});return}s.provinces=s.provinces.filter(t=>t!==e),o.state=i,o.color=v(r[i].color),r[i].provinces.push(e);return}if(!i){d.forEach(e=>{t.province[e]=0});return}if(d.length<20){let n=l(e,i,d);if(n){d.forEach(e=>{t.province[e]=n});return}}c(o,i,d)})}function c(e,a,s){let c=n.length,l=s.find(e=>t.burg[e]),u=l||s[0],d=l?t.burg[l]:0,f=d?i[d]:null,p=t.culture[u],m=l&&ee(.5),h=m?f.name:e.name||Names.getState(Names.getCultureShort(p),p),g=l&&e.formName?e.formName:o([`Zone`,`Area`,`Territory`,`Province`]),_=v(r[a].color),y=m?.8:.4,b=Burgs.getType(u,f?.port),x=COA.generate(f?.coa||r[a].coa,y,f?null:.9,b);x.shield=COA.getShield(p,a),n.push({i:c,state:a,center:u,burg:d,name:h,formName:g,fullName:`${h} ${g}`,color:_,coa:x}),s.forEach(e=>{t.province[e]=c}),r[a].provinces.push(c)}function l(e,n,r){let i=r.find(r=>t.c[r].some(r=>t.state[r]===n&&t.province[r]&&t.province[r]!==e));return i&&t.c[i].map(e=>t.province[e]).find(t=>t&&t!==e)}}function Z(e){customization=0,L=[],l(`#statesBody`).select(`#temp`).remove(),me(),document.querySelectorAll(`#statesBottom > button`).forEach(e=>{e.style.display=`inline-block`}),u(`statesManuallyButtons`).style.display=`none`,u(`statesHalo`).style.display=`block`,P(R,[]),u(`statesFooter`).style.display=`block`,u(`statesBodySection`).querySelectorAll(`div > input, select, span, svg`).forEach(e=>{e.style.removeProperty(`pointer-events`)}),e||$(`#statesEditor`).dialog({position:{my:`right top`,at:`right-10 top+10`,of:`svg`,collision:`fit`}}),O(),C();let t=u(`statesBodySection`).querySelector(`div.selected`);t&&t.classList.remove(`selected`)}function Ke(){let e=l(`#statesBody`).select(`#temp`).node();e&&(L.push(e.innerHTML),L.length>100&&L.shift())}function qe(){let e=l(`#statesBody`).select(`#temp`).node();!e||!L.length||(e.innerHTML=L.pop())}function Je(){if(this.classList.contains(`pressed`)){Q();return}customization=3,this.classList.add(`pressed`),S(`Click on the map to create a new capital or promote an existing burg`,!0),l(`#viewbox`).style(`cursor`,`crosshair`).on(`click`,Ye),u(`statesBodySection`).querySelectorAll(`div > input, select, span, svg`).forEach(e=>{e.style.pointerEvents=`none`})}function Ye(e){let{cells:t,states:n,burgs:i}=pack,a=r(e,this),o=findCell(a[0],a[1]);if(t.h[o]<20){S(`You cannot place state into the water. Please click on a land cell`,!1,`error`);return}let s=t.burg[o];if(s&&i[s].capital){S(`Existing capital cannot be selected as a new state capital! Select other cell`,!1,`error`);return}s||=Burgs.add(a);let c=t.state[o],l=n.length;i[s].capital=1,i[s].state=l,Burgs.changeGroup(i[s],null),k(),e.shiftKey===!1&&Q();let u=t.culture[o],d=o%5==0?i[s].name:Names.getCulture(u),f=Names.getState(d,u),p=h(),m=pack.cultures[u].type,g=COA.generate(i[s].coa,.4,null,m);g.shield=COA.getShield(u,void 0);let _=n.map(e=>{if(!e.i||e.removed)return`x`;if(!c)return e.diplomacy.push(`Neutral`),`Neutral`;let t=n[c].diplomacy[e.i];return e.i===c?t=`Enemy`:t===`Ally`||t===`Friendly`?t=`Suspicion`:t===`Suspicion`?t=`Neutral`:t===`Enemy`||t===`Rival`?t=`Friendly`:t===`Vassal`?t=`Suspicion`:t===`Suzerain`&&(t=`Enemy`),e.diplomacy.push(t),t});_.push(`x`),n[0].diplomacy.push([`Independance declaration`,`${f} declared its independance from ${n[c].name}`]),t.state[o]=l,t.province[o]=0,n.push({i:l,name:f,diplomacy:_,provinces:[],color:p,expansionism:.5,capital:s,type:`Generic`,center:o,culture:u,military:[],alert:1,coa:g}),States.getPoles(),States.findNeighbors(),States.collectStatistics(),States.defineStateForms([l]),X([t.province[o]]),k(),COArenderer.add(`state`,l,g,n[l].pole[0],n[l].pole[1]),layerIsOn(`toggleProvinces`)&&toggleProvinces(),layerIsOn(`toggleStates`)?drawStates():toggleStates(),layerIsOn(`toggleBorders`)?T():toggleBorders(),V.refresh()}function Q(){customization=0,O(),C(),u(`statesBodySection`).querySelectorAll(`div > input, select, span, svg`).forEach(e=>{e.style.removeProperty(`pointer-events`)});let e=u(`statesAdd`);e.classList.contains(`pressed`)&&e.classList.remove(`pressed`)}function Xe(){let e=e=>`<svg class="coaIcon" viewBox="0 0 200 200"><use href="#stateCOA${e}"></use></svg>`,t=pack.states.filter(e=>e.i&&!e.removed).map(t=>`
      <div data-id="${t.i}" data-tip="${t.fullName}" style="cursor:default">
        <input type="radio" name="rulingState" value="${t.i}" />
        <input id="selectState${t.i}" class="checkbox" type="checkbox" name="statesToMerge" value="${t.i}" />
        <label for="selectState${t.i}" class="checkbox-label"><fill-box fill="${t.color}" disabled></fill-box>${e(t.i)}${t.fullName}</label>
      </div>
    `).join(``);alertMessage.innerHTML=`
    <form id='mergeStatesForm' style="overflow: hidden; display: flex; flex-direction: column; gap: 1em;">
      <p style="margin:0">
        Check the <b>checkbox</b> next to each state you want to merge.
        Use the <b>radio button</b> to pick the <em>ruling state</em> that will absorb all others (its name, color, and capital will be kept).
        Hover over a row to highlight the state on the map.
      </p>
      <main style='display: grid; grid-template-columns: 1fr 1fr; gap: .3em;'>
        ${t}
      </main>
    </form>
  `,u(`mergeStatesForm`).querySelectorAll(`div[data-id]`).forEach(e=>{e.addEventListener(`mouseenter`,n),e.addEventListener(`mouseleave`,K)}),N(`mergeStatesForm`,({cellId:e})=>pack.cells.state[e]);function n(e){if(!layerIsOn(`toggleStates`))return;let t=+e.currentTarget.dataset.id;if(!t)return;let n=l(`#regions`).select(`#state${t}`).attr(`d`);if(!n)return;K();let r=l(`#debug`).append(`path`).attr(`class`,`highlight`).attr(`d`,n).attr(`fill`,`none`).attr(`stroke`,`red`).attr(`stroke-width`,1).attr(`opacity`,1).attr(`filter`,`url(#blur1)`),i=r.node().getTotalLength(),a=(i+5e3)/2,o=b(`0, ${i}`,`${i}, ${i}`);r.transition().duration(a).attrTween(`stroke-dasharray`,()=>o)}$(`#alert`).dialog({width:600,title:`Merge states`,close:K,buttons:{Merge:function(){let t=new FormData(u(`mergeStatesForm`)),n=Number(t.get(`rulingState`));if(!n){S(`Please select a state to merge into`,!1,`error`);return}let i=pack.states[n],a=t.getAll(`statesToMerge`).map(Number).filter(e=>e!==n);if(!a.length){S(`Please select several states to merge`,!1,`error`);return}w({title:`Merge states`,message:`
            <p>The following states will be <strong>removed</strong>: ${a.map(t=>`${e(t)}${pack.states[t].name}`).join(`, `)}.</p>
            <p>Removed states data (burgs, provinces, regiments) will be assigned to ${e(i.i)}${i.name}.</p>
            <p>Are you sure you want to merge states? This action cannot be reverted.</p>`,confirm:`Merge`,onConfirm:()=>{r(a,n),$(this).dialog(`close`)}})},Cancel:function(){$(this).dialog(`close`)}}});function r(e,t){let n=pack.states[t],r=u(`army${t}`);e.forEach(e=>{let i=pack.states[e];i.removed=!0,l(`#statesBody`).select(`#state${e}`).remove(),l(`#statesBody`).select(`#state-gap${e}`).remove(),l(`#statesHalo`).select(`#state-border${e}`).remove(),delete pack.states[e].label,u(`stateCOA${e}`).remove(),l(`#emblems`).select(`#stateEmblems > use[data-i='${e}']`).remove(),(i.military||[]).forEach(i=>{let a=`regiment${e}-${i.i}`,o=(n.military||[]).length;(n.military||[]).push({...i,i:o});let s=`regiment${t}-${o}`,c=notes.find(e=>e.id===a);c&&(c.id=s);let l=document.getElementById(a);l&&(l.id=s,l.dataset.state=String(t),l.dataset.id=String(o),r.appendChild(l))}),armies.select(`g#army${e}`).remove()}),pack.burgs.forEach(n=>{e.includes(n.state??0)&&(n.capital&&(n.capital=0,Burgs.changeGroup(n,null)),n.state=t)}),pack.provinces.forEach(n=>{e.includes(n.state)&&(n.state=t)}),pack.cells.state.forEach((n,r)=>{e.includes(n)&&(pack.cells.state[r]=t)}),A(),l(`#debug`).selectAll(`.highlight`).remove(),States.getPoles(),layerIsOn(`toggleStates`)?drawStates():toggleStates(),layerIsOn(`toggleBorders`)?T():toggleBorders(),layerIsOn(`toggleProvinces`)&&drawProvinces(),pack.states[t].label||delete pack.states[t].label,k(),H()}}function Ze(){let e=`Id,State,Full Name,Form,Color,Capital,Culture,Type,Expansionism,Cells,Burgs,Area ${p(`2`)},Total Population,Rural Population,Urban Population`,n=V.view().all.map(e=>{let n=e.rural||0,r=e.urban||0,i=t(n*populationRate+r*populationRate*urbanization);return[e.i,e.name,e.fullName||``,e.i?e.formName:``,e.i?e.color:``,e.i?pack.burgs[e.capital].name:``,e.i?pack.cultures[e.culture].name:``,e.i?e.type:``,e.i?e.expansionism:``,e.cells,e.burgs,y(e.area||0),i,Math.round(n*populationRate),Math.round(r*populationRate*urbanization)].join(`,`)});x([e].concat(n).join(`
`),`${c(`States`)}.csv`)}function Qe(e,t){let n=pack.states[e];n.lock=!n.lock,t.toggle(`icon-lock-open`),t.toggle(`icon-lock`)}var $e={open:ve};export{$e as StatesEditor};