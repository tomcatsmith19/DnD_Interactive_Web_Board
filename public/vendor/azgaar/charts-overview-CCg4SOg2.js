import{Cn as e,Dn as t,En as n,Ft as r,Kt as i,On as a,S as o,Sn as s,U as c,Ut as l,Wt as u,Yt as d,c as f,d as p,i as m,l as h,n as g,r as _,t as v,w as y,x as b,z as x}from"./utils-BYaxf2yO.js";import{n as ee,r as S}from"./axis-I8_pxNLd.js";import{r as C}from"./tooltips-CSQuPvuv.js";import{$t as w,Qt as T,Xt as E,kt as D}from"./index-DqeJMjPz.js";var O=class extends Map{constructor(e,t=M){if(super(),Object.defineProperties(this,{_intern:{value:new Map},_key:{value:t}}),e!=null)for(let[t,n]of e)this.set(t,n)}get(e){return super.get(k(this,e))}has(e){return super.has(k(this,e))}set(e,t){return super.set(A(this,e),t)}delete(e){return super.delete(j(this,e))}};function k({_intern:e,_key:t},n){let r=t(n);return e.has(r)?e.get(r):n}function A({_intern:e,_key:t},n){let r=t(n);return e.has(r)?e.get(r):(e.set(r,n),n)}function j({_intern:e,_key:t},n){let r=t(n);return e.has(r)&&(n=e.get(r),e.delete(r)),n}function M(e){return typeof e==`object`&&e?e.valueOf():e}function N(e,t,...n){return P(e,Array.from,t,n)}function P(e,t,n,r){return(function e(i,a){if(a>=r.length)return n(i);let o=new O,s=r[a++],c=-1;for(let e of i){let t=s(e,++c,i),n=o.get(t);n?n.push(e):o.set(t,[e])}for(let[t,n]of o)o.set(t,e(n,a));return t(o)})(e,0)}function F(t){return s(e(t).call(document.documentElement))}var I=Symbol(`implicit`);function L(){var e=new O,t=[],n=[],r=I;function i(i){let a=e.get(i);if(a===void 0){if(r!==I)return r;e.set(i,a=t.push(i)-1)}return n[a%n.length]}return i.domain=function(n){if(!arguments.length)return t.slice();t=[],e=new O;for(let r of n)e.has(r)||e.set(r,t.push(r)-1);return i},i.range=function(e){return arguments.length?(n=Array.from(e),i):n.slice()},i.unknown=function(e){return arguments.length?(r=e,i):r},i.copy=function(){return L(t,n).unknown(r)},d.apply(i,arguments),i}function R(){var e=L().unknown(void 0),t=e.domain,r=e.range,i=0,a=1,o,s,c=!1,l=0,u=0,f=.5;delete e.unknown;function p(){var e=t().length,d=a<i,p=d?a:i,m=d?i:a;o=(m-p)/Math.max(1,e-l+u*2),c&&(o=Math.floor(o)),p+=(m-p-o*(e-l))*f,s=o*(1-l),c&&(p=Math.round(p),s=Math.round(s));var h=n(e).map(function(e){return p+o*e});return r(d?h.reverse():h)}return e.domain=function(e){return arguments.length?(t(e),p()):t()},e.range=function(e){return arguments.length?([i,a]=e,i=+i,a=+a,p()):[i,a]},e.rangeRound=function(e){return[i,a]=e,i=+i,a=+a,c=!0,p()},e.bandwidth=function(){return s},e.step=function(){return o},e.round=function(e){return arguments.length?(c=!!e,p()):c},e.padding=function(e){return arguments.length?(l=Math.min(1,u=+e),p()):l},e.paddingInner=function(e){return arguments.length?(l=Math.min(1,e),p()):l},e.paddingOuter=function(e){return arguments.length?(u=+e,p()):u},e.align=function(e){return arguments.length?(f=Math.max(0,Math.min(1,e)),p()):f},e.copy=function(){return R(t(),[i,a]).round(c).paddingInner(l).paddingOuter(u).align(f)},d.apply(p(),arguments)}function z(e,t){if((o=e.length)>1)for(var n=1,r,i,a=e[t[0]],o,s=a.length;n<o;++n)for(i=a,a=e[t[n]],r=0;r<s;++r)a[r][1]+=a[r][0]=isNaN(i[r][1])?i[r][0]:i[r][1]}function B(e){for(var t=e.length,n=Array(t);--t>=0;)n[t]=t;return n}function V(e,t){return e[t]}function te(e){let t=[];return t.key=e,t}function ne(){var e=u([]),t=B,n=z,r=V;function i(i){var a=Array.from(e.apply(this,arguments),te),o,s=a.length,c=-1,u;for(let e of i)for(o=0,++c;o<s;++o)(a[o][c]=[0,+r(e,a[o].key,c,i)]).data=e;for(o=0,u=l(t(a));o<s;++o)a[u[o]].index=o;return n(a,u),a}return i.keys=function(t){return arguments.length?(e=typeof t==`function`?t:u(Array.from(t)),i):e},i.value=function(e){return arguments.length?(r=typeof e==`function`?e:u(+e),i):r},i.order=function(e){return arguments.length?(t=e==null?B:typeof e==`function`?e:u(Array.from(e)),i):t},i.offset=function(e){return arguments.length?(n=e??z,i):n},i}function H(e,t){if((r=e.length)>0){for(var n,r,i=0,a=e[0].length,o;i<a;++i){for(o=n=0;n<r;++n)o+=e[n][i][1]||0;if(o)for(n=0;n<r;++n)e[n][i][1]/=o}z(e,t)}}function U(e,t){if((c=e.length)>0)for(var n,r=0,i,a,o,s,c,l=e[t[0]].length;r<l;++r)for(o=s=0,n=0;n<c;++n)(a=(i=e[t[n]][r])[1]-i[0])>0?(i[0]=o,i[1]=o+=a):a<0?(i[1]=s,i[0]=s+=a):(i[0]=0,i[1]=a)}var W={states:{label:`State`,getId:e=>pack.cells.state[e],getName:Z(`states`),getColors:Q(`states`),landOnly:!0},cultures:{label:`Culture`,getId:e=>pack.cells.culture[e],getName:Z(`cultures`),getColors:Q(`cultures`),landOnly:!0},religions:{label:`Religion`,getId:e=>pack.cells.religion[e],getName:Z(`religions`),getColors:Q(`religions`),landOnly:!0},provinces:{label:`Province`,getId:e=>pack.cells.province[e],getName:Z(`provinces`),getColors:Q(`provinces`),landOnly:!0},biomes:{label:`Biome`,getId:e=>pack.cells.biome[e],getName:ye,getColors:be,landOnly:!1},markets:{label:`Market`,getId:e=>pack.cells.market[e],getName:xe,getColors:Se,landOnly:!1},goods:{label:`Good`,requires:`good`,getId:(e,t)=>t.good,getName:Ce,getColors:we,landOnly:!1}},G={total_population:{label:`Total population`,quantize:e=>Ee(e)+De(e),aggregate:e=>r(E(e)),formatTicks:e=>p(e),stringify:e=>e.toLocaleString(),stackable:!0,landOnly:!0},urban_population:{label:`Urban population`,quantize:Ee,aggregate:e=>r(E(e)),formatTicks:e=>p(e),stringify:e=>e.toLocaleString(),stackable:!0,landOnly:!0},rural_population:{label:`Rural population`,quantize:De,aggregate:e=>r(E(e)),formatTicks:e=>p(e),stringify:e=>e.toLocaleString(),stackable:!0,landOnly:!0},area:{label:`Land area`,quantize:e=>_(pack.cells.area[e]),aggregate:e=>r(E(e)),formatTicks:e=>`${p(e)} ${m()}`,stringify:e=>`${e.toLocaleString()} ${m()}`,stackable:!0,landOnly:!0},cells:{label:`Cells`,hint:`Number of land cells`,quantize:()=>1,aggregate:e=>E(e),formatTicks:e=>e,stringify:e=>e.toLocaleString(),stackable:!0,landOnly:!0},burgs_number:{label:`Burgs`,hint:`Number of burgs`,quantize:e=>+!!pack.cells.burg[e],aggregate:e=>E(e),formatTicks:e=>e,stringify:e=>e.toLocaleString(),stackable:!0,landOnly:!0},average_elevation:{label:`Average elevation`,quantize:e=>pack.cells.h[e],aggregate:e=>T(e),formatTicks:e=>f(e),stringify:e=>f(e),stackable:!1,landOnly:!1},max_elevation:{label:`Maximum mean elevation`,quantize:e=>pack.cells.h[e],aggregate:e=>a(e),formatTicks:e=>f(e),stringify:e=>f(e),stackable:!1,landOnly:!1},min_elevation:{label:`Minimum mean elevation`,quantize:e=>pack.cells.h[e],aggregate:e=>t(e),formatTicks:e=>f(e),stringify:e=>f(e),stackable:!1,landOnly:!1},average_temperature:{label:`Annual mean temperature`,quantize:e=>grid.cells.temp[pack.cells.g[e]],aggregate:e=>T(e),formatTicks:e=>v(e),stringify:e=>v(e),stackable:!1,landOnly:!1},max_temperature:{label:`Annual max temperature`,hint:`Highest mean temperature of the year`,quantize:e=>grid.cells.temp[pack.cells.g[e]],aggregate:e=>a(e),formatTicks:e=>v(e),stringify:e=>v(e),stackable:!1,landOnly:!1},min_temperature:{label:`Annual min temperature`,hint:`Lowest mean temperature of the year`,quantize:e=>grid.cells.temp[pack.cells.g[e]],aggregate:e=>t(e),formatTicks:e=>v(e),stringify:e=>v(e),stackable:!1,landOnly:!1},average_precipitation:{label:`Annual mean precipitation`,quantize:e=>grid.cells.prec[pack.cells.g[e]],aggregate:e=>r(T(e)),formatTicks:e=>h(r(e)),stringify:e=>h(r(e)),stackable:!1,landOnly:!0},max_precipitation:{label:`Annual max precipitation`,hint:`Highest mean precipitation of the year`,quantize:e=>grid.cells.prec[pack.cells.g[e]],aggregate:e=>r(a(e)),formatTicks:e=>h(r(e)),stringify:e=>h(r(e)),stackable:!1,landOnly:!0},min_precipitation:{label:`Annual min precipitation`,hint:`Lowest mean precipitation of the year`,quantize:e=>grid.cells.prec[pack.cells.g[e]],aggregate:e=>r(t(e)),formatTicks:e=>h(r(e)),stringify:e=>h(r(e)),stackable:!1,landOnly:!0},coastal_cells:{label:`Number of coastal cells`,quantize:e=>+(pack.cells.t[e]===1),aggregate:e=>E(e),formatTicks:e=>e,stringify:e=>e.toLocaleString(),stackable:!0,landOnly:!0},river_cells:{label:`Number of river cells`,quantize:e=>+!!pack.cells.r[e],aggregate:e=>E(e),formatTicks:e=>e,stringify:e=>e.toLocaleString(),stackable:!0,landOnly:!0},production_value:{label:`Production value`,hint:`Worth of produced goods`,provides:[`good`],prepare:()=>({biomeProduction:Goods.getBiomesProduction()}),getContributions:(e,{biomeProduction:t})=>{let n=Te(e,t),r=[];for(let[e,t]of Object.entries(n)){let n=Goods.get(+e);n&&r.push({good:+e,value:t*n.value})}return r},aggregate:e=>r(E(e)),formatTicks:e=>p(e),stringify:e=>g(e),stackable:!0,landOnly:!0},production_units:{label:`Production volume`,hint:`Units of goods produced`,provides:[`good`],prepare:()=>({biomeProduction:Goods.getBiomesProduction()}),getContributions:(e,{biomeProduction:t})=>{let n=Te(e,t),r=[];for(let[e,t]of Object.entries(n))r.push({good:+e,value:t});return r},aggregate:e=>r(E(e)),formatTicks:e=>p(e),stringify:e=>`${e.toLocaleString()} units`,stackable:!0,landOnly:!0},burgs_profit:{label:`Burgs profit`,hint:`Burgs profit from trade and manufacturing`,quantize:e=>{let t=pack.cells.burg[e];return t&&pack.burgs[t].product||0},aggregate:e=>r(E(e)),formatTicks:e=>p(e),stringify:e=>g(e),stackable:!0,landOnly:!0}},re={stackedBar:{offset:U},normalizedStackedBar:{offset:H,formatX:e=>`${r(e*100)}%`}},K=[],ie;function ae(){if(oe(),fe(),se(),D(`#chartsOverview, .stable`),ie!==mapId&&(K=[],ie=mapId),!K.length)ce();else for(let e of K)le(e);$(`#chartsOverview`).dialog({title:`Data Charts`,width:`60vw`,height:`auto`,position:{my:`center`,at:`center`,of:`svg`},close:pe})}function oe(){document.getElementById(`chartsOverview`)?.remove();let e=Object.entries(W).map(([e,{label:t}])=>[e,t]),t=Object.entries(G).map(([e,{label:t}])=>[e,t]),n=([e,t])=>`<option value="${e}">${t}</option>`,r=e=>e.map(n).join(``),i=`<div id="chartsOverview" class="dialog stable">
    <form id="chartsOverview__form">
      <div>
        <button data-tip="Add a chart" type="submit">Plot</button>

        <select data-tip="Select entity (y axis)" id="chartsOverview__entitiesSelect">
          ${r(e)}
        </select>

        <label for="chartsOverview__plotBySelect" data-tip="Select metric to plot (x axis)">
          <span>by</span>
          <select id="chartsOverview__plotBySelect">
            ${r(t)}
          </select>
          <i id="chartsOverview__plotByInfo" class="icon-info-circled" style="display: none"></i>
        </label>

        <label for="chartsOverview__groupBySelect" data-tip="Select entity to group by. If you don't need grouping, set it the same as the entity">
          <span>grouped by</span>
          <select id="chartsOverview__groupBySelect">
            ${r(e)}
          </select>
        </label>

        <label data-tip="Sorting type" for="chartsOverview__sortingSelect">
          <span>sorted</span>
          <select id="chartsOverview__sortingSelect">
            <option value="value">by value</option>
            <option value="name">by name</option>
            <option value="natural">naturally</option>
          </select>
        </label>
      </div>

      <div>
        <label data-tip="Select chart type" for="chartsOverview__chartType">
          <span>Type</span>
          <select id="chartsOverview__chartType">
            <option value="stackedBar" selected>Stacked Bar</option>
            <option value="normalizedStackedBar">Normalized Bar</option>
          </select>
        </label>

        <label data-tip="Show the charts in 1, 2, 3 or 4 columns" for="chartsOverview__viewColumns">
          <span>Columns</span>
          <select id="chartsOverview__viewColumns">
            <option value="1" selected>1</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
          </select>
        </label>

        <label data-tip="Exclude zero element from the results (id 0, e.g. the neutral state)" for="chartsOverview__excludeNeutral">
          <input id="chartsOverview__excludeNeutral" type="checkbox" class="native" />
          <span>Exclude neutral</span>
        </label>
      </div>
    </form>

    <section id="chartsOverview__charts"></section>
  </div>`;c(`dialogs`).insertAdjacentHTML(`beforeend`,i),c(`chartsOverview__entitiesSelect`).value=`states`,c(`chartsOverview__plotBySelect`).value=`total_population`,c(`chartsOverview__groupBySelect`).value=`cultures`,c(`chartsOverview__form`).addEventListener(`submit`,ce),c(`chartsOverview__viewColumns`).addEventListener(`change`,fe),c(`chartsOverview__plotBySelect`).addEventListener(`change`,se),document.getElementById(`chartsOverviewStyle`)?.remove();let a=document.createElement(`style`);a.id=`chartsOverviewStyle`,a.textContent=`
    #chartsOverview {
      max-width: 90vw !important;
      max-height: 90vh !important;
      overflow: hidden;
      display: grid;
      grid-template-rows: auto 1fr;
    }

    #chartsOverview__form {
      display: grid;
      font-size: 1.1em;
      margin: 0.3em 0;
    }

    #chartsOverview__form > div:first-child {
      display: flex;
      align-items: center;
      gap: 0.2em;
    }

    #chartsOverview__form > div:nth-child(2) {
      display: flex;
      align-items: center;
      gap: 1em;
    }

    #chartsOverview__form label {
      display: inline-flex;
      align-items: center;
    }

    #chartsOverview__charts {
      overflow: auto;
      scroll-behavior: smooth;
      display: grid;
    }

    #chartsOverview__charts figure {
      margin: 0;
      padding: 0.6em 0 1em;
      border-top: 1px solid rgba(128, 128, 128, 0.4);
    }

    #chartsOverview__charts figcaption {
      font-size: 1.2em;
      margin: 0 1% 0.4em 4%;
      display: grid;
      align-items: center;
      grid-template-columns: 1fr auto;
    }

    #chartsOverview__plotByInfo {
      margin-left: 0.3em;
      cursor: help;
      opacity: 0.6;
    }
  `,document.head.appendChild(a)}function se(){let e=c(`chartsOverview__plotBySelect`).value,t=c(`chartsOverview__plotByInfo`),{hint:n}=G[e];n?(t.dataset.tip=n,t.style.display=``):t.style.display=`none`}function ce(e){e&&e.preventDefault();let t=c(`chartsOverview__entitiesSelect`).value,n=c(`chartsOverview__plotBySelect`).value,r=c(`chartsOverview__groupBySelect`).value,i=c(`chartsOverview__sortingSelect`).value,a=c(`chartsOverview__chartType`).value,o=c(`chartsOverview__excludeNeutral`).checked,{label:s,stackable:l,provides:u=[]}=G[n],d=[t,r].find(e=>{let t=W[e].requires;return t?!u.includes(t):!1});if(d){C(`${s} cannot be broken down by ${W[d].label.toLowerCase()}`,!1,`error`,4e3);return}!l&&r!==t&&(C(`Grouping is not supported for ${n}`,!1,`warn`,4e3),r=t);let f={id:Date.now(),entity:t,plotBy:n,groupBy:r,sorting:i,type:a,excludeNeutral:o};K.push(f),le(f),q()}function le({id:e,entity:t,plotBy:n,groupBy:i,sorting:a,type:o,excludeNeutral:s}){let{label:l,stringify:u,quantize:d,getContributions:f,prepare:p,aggregate:m,formatTicks:h,landOnly:g}=G[n],_=i===t,{label:v,getName:b,getId:ee,landOnly:S}=W[t],{label:C,getName:w,getId:T,getColors:E}=W[i],D=p?p():void 0,O=f?e=>f(e,D):e=>[{value:d(e)}],k=`${y(t)} by ${l}${_?``:` grouped by ${C}`}`,A=(e,t,n,i)=>{let a=`${v}: ${e}`,o=_?``:`${C}: ${t}`,s=`${l}: ${u(n)}`;return _||(s+=` (${r(i*100)}%)`),[a,o,s].filter(Boolean)},j={},M=new Set;for(let e of pack.cells.i)if(!((S||g)&&x(e,pack)))for(let t of O(e)){let n=ee(e,t),r=T(e,t);if(s&&(n===0||r===0))continue;let{value:i}=t;j[n]?j[n][r]?j[n][r].push(i):j[n][r]=[i]:j[n]={[r]:[i]},M.add(r)}let N=Oe(Object.entries(j).flatMap(([e,t])=>{let n=b(e);return Object.entries(t).map(([e,t])=>({name:n,group:w(e),value:m(t)}))}),a),P=E(),{offset:F,formatX:I=h}=re[o];de(e,N,ue(N,{colors:P,tooltip:A,offset:F,formatX:I}),k),c(`chartsOverview__charts`).lastElementChild?.scrollIntoView()}function ue(e,{colors:t,tooltip:r,offset:a,formatX:o}){let s=e.map(e=>e.value),c=e.map(e=>e.name),l=e.map(e=>e.group),u=new Set(c),d=new Set(l),f=n(s.length).filter(e=>u.has(c[e])&&d.has(l[e])),p=Array.from(u),m=Array.from(d),h=_e(p),g=ve(m,X-h-15),_={top:30,right:15,bottom:g*20+10,left:h},v=[_.left,X-_.right],y=u.size*25+_.top+_.bottom,b=[y-_.bottom,_.top],x=N(f,([e])=>e,e=>c[e],e=>l[e]),T=ne().keys(m).value(([,e],t)=>s[new Map(e).get(t)]).order(B).offset(a)(x).map(e=>{let t=e.filter(e=>!Number.isNaN(e[1])).map(t=>Object.assign(t,{i:new Map(t.data[1]).get(e.key)}));return{key:e.key,data:t}}),D=i(w(T.flatMap(e=>e.data.flatMap(e=>[e[0],e[1]]))),v),O=R(p,b).paddingInner(me),k=S(D).ticks(X/80,null),A=ee(O).tickSizeOuter(0),j=F(`svg`).attr(`version`,`1.1`).attr(`xmlns`,`http://www.w3.org/2000/svg`).attr(`viewBox`,`0 0 ${X} ${y}`).attr(`style`,`max-width: 100%; height: auto; height: intrinsic;`);j.append(`g`).attr(`transform`,`translate(0,${_.top})`).call(k).call(e=>e.select(`.domain`).remove()).call(e=>e.selectAll(`text`).text(e=>o(e))).call(e=>e.selectAll(`.tick line`).clone().attr(`y2`,y-_.top-_.bottom).attr(`stroke-opacity`,.1));let M=j.append(`g`).attr(`stroke`,`#666`).attr(`stroke-width`,.5).selectAll(`g`).data(T).join(`g`).attr(`fill`,e=>t[e.key]).selectAll(`rect`).data(e=>e.data.filter(([e,t])=>e!==t)).join(`rect`).attr(`x`,([e,t])=>Math.min(D(e),D(t))).attr(`y`,({i:e})=>O(c[e])).attr(`width`,([e,t])=>Math.abs(D(e)-D(t))).attr(`height`,O.bandwidth()),P=Object.fromEntries(N(f,e=>E(e,e=>s[e]),e=>c[e])),I=({i:e})=>r(c[e],l[e],s[e],s[e]/P[c[e]]);M.append(`title`).text(e=>I(e).join(`\r
`)),M.on(`mouseover`,(e,t)=>C(I(t).join(`. `))),j.append(`g`).attr(`transform`,`translate(${D(0)},0)`).call(A);let L=Math.ceil(m.length/g),z=X/(L+.5),V=(e,t)=>t%L*z,te=(e,t)=>V(e,t)+ge,H=(e,t)=>Math.floor(t/L)*20,U=j.append(`g`).attr(`stroke`,`#666`).attr(`stroke-width`,.5).attr(`dominant-baseline`,`central`).attr(`transform`,`translate(${_.left},${y-_.bottom+15})`);return U.selectAll(`circle`).data(m).join(`rect`).attr(`x`,V).attr(`y`,H).attr(`width`,10).attr(`height`,10).attr(`transform`,`translate(-5, -5)`).attr(`fill`,e=>t[e]),U.selectAll(`text`).data(m).join(`text`).attr(`x`,te).attr(`y`,H).text(e=>e),j.node()}function de(e,t,n,r){let i=c(`chartsOverview__charts`),a=document.createElement(`figure`),s=document.createElement(`figcaption`);s.innerHTML=`
    <div>
      <strong>Figure ${i.childElementCount+1}</strong>. ${r}
    </div>
    <div>
      <button data-tip="Download chart data as a text file (.csv)" class="icon-download"></button>
      <button data-tip="Download the chart as a PNG image" class="icon-export"></button>
      <button data-tip="Download the chart in SVG format (vector, opens in a browser or Inkscape)" class="icon-chart-bar"></button>
      <button data-tip="Remove the chart" class="icon-trash"></button>
    </div>
  `,a.appendChild(s),a.appendChild(n),i.appendChild(a),a.querySelector(`button.icon-download`)?.addEventListener(`click`,()=>{let e=`${o(r)}.csv`;b(`Name,Group,Value
`+t.map(({name:e,group:t,value:n})=>`${e},${t},${n}`).join(`
`),e)}),a.querySelector(`button.icon-export`)?.addEventListener(`click`,()=>{let{width:e,height:t}=n.viewBox.baseVal,i=n.cloneNode(!0);i.setAttribute(`width`,String(e)),i.setAttribute(`height`,String(t));let a=new XMLSerializer().serializeToString(i),s=URL.createObjectURL(new Blob([a],{type:`image/svg+xml;charset=utf-8`})),c=new Image;c.onload=()=>{let n=document.createElement(`canvas`);n.width=e*2,n.height=t*2;let i=n.getContext(`2d`);i&&(i.fillStyle=`#fff`,i.fillRect(0,0,n.width,n.height),i.drawImage(c,0,0,n.width,n.height),n.toBlob(e=>e&&b(e,`${o(r)}.png`,`image/png`))),URL.revokeObjectURL(s)},c.src=s}),a.querySelector(`button.icon-chart-bar`)?.addEventListener(`click`,()=>{let e=`${o(r)}.svg`;b(n.outerHTML,e)}),a.querySelector(`button.icon-trash`)?.addEventListener(`click`,()=>{a.remove(),K=K.filter(t=>t.id!==e),q()})}function fe(){let e=c(`chartsOverview__viewColumns`).value,t=c(`chartsOverview__charts`);t.style.gridTemplateColumns=`repeat(${e}, 1fr)`,q()}function q(){$(`#chartsOverview`).dialog({position:{my:`center`,at:`center`,of:`svg`}})}function pe(){$(`#chartsOverview`).dialog(`destroy`),c(`chartsOverview`).remove(),document.getElementById(`chartsOverviewStyle`)?.remove()}var J=`#ccc`,Y=`no`,X=800,me=.2,he=7,ge=10;function _e(e){return a(e.map(e=>e.length))*he}function ve(e,t){if(!e.length)return 0;let n=ge+_e(e),r=Math.max(1,Math.floor(t/n));return Math.ceil(e.length/r)}function Z(e){return t=>pack[e][+t]?.name||Y}function Q(e){return()=>Object.fromEntries(pack[e].map(e=>[e.name||Y,e.color||J]))}function ye(e){return pack.biomes[+e]?.name||Y}function be(){return Object.fromEntries(pack.biomes.map(({name:e,color:t})=>[e,t]))}function xe(e){let t=Markets.get(+e);return t?t.name||pack.burgs[t.centerBurgId]?.name||`Market ${t.i}`:Y}function Se(){return Object.fromEntries((pack.markets||[]).map(e=>[xe(e.i),e.color||J]))}function Ce(e){return Goods.get(+e)?.name||Y}function we(){return Object.fromEntries((pack.goods||[]).map(e=>[e.name||Y,e.color||J]))}function Te(e,t){let n=Production.getCellProduction(e,t),r=pack.cells.burg[e];if(r){let e=Production.getBurgProduction(pack.burgs[r]);for(let[t,r]of Object.entries(e))n[+t]=(n[+t]||0)+r}return n}function Ee(e){let t=pack.cells.burg[e];return t?(pack.burgs[t].population||0)*populationRate*urbanization:0}function De(e){return pack.cells.pop[e]*populationRate}function Oe(e,t){if(t===`natural`)return e;if(t===`name`)return e.sort((e,t)=>e.name===t.name?e.group.localeCompare(t.group):t.name.localeCompare(e.name));if(t===`value`){let t={},n={};for(let{name:r,group:i,value:a}of e)t[r]=(t[r]||0)+a,n[i]=(n[i]||0)+a;return e.sort((e,r)=>e.name===r.name?n[r.group]-n[e.group]:t[e.name]-t[r.name])}return e}var ke={open:ae};export{ke as ChartsOverview};