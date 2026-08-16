import{Ft as e,S as t,U as n,n as r,x as i}from"./utils-BYaxf2yO.js";import{r as a}from"./tooltips-CSQuPvuv.js";import{N as o,Nt as s,P as c}from"./index-DqeJMjPz.js";import{i as l,n as u,r as d,t as f}from"./table-BDnPiVU4.js";var p=0,m=`all`,h=`marketDeals`,g={my:`right top`,at:`right bottom+10`,of:`#marketOverview`,collision:`fit`},_=[{key:`icon`,width:`2em`,permanent:!0},{key:`good`,label:`Good`,width:`6.8em`,permanent:!0,sortBy:e=>Goods.get(e.good)?.name??``,sortType:`alpha`},{key:`direction`,label:`Type`,width:`5em`,sortBy:e=>E(e,p),sortType:`alpha`},{key:`counterparty`,label:`Counterparty`,width:`8em`,sortBy:e=>k(e)?.name??``,sortType:`alpha`},{key:`units`,label:`Units`,width:`5em`,sortBy:e=>e.units},{key:`income`,label:`Income`,width:`5em`,sortBy:e=>A(e,p)},{key:`actions`,width:`1.2em`,permanent:!0}],v=u({getData:S,onUpdate:C});function y(e){let t=Markets.get(e);if(!t){a(`Invalid market. The selected market does not exist`,!0,`error`,5e3);return}p=e,m=`all`,b(),n(`marketDealsFilter`).value=`all`,v.reset(),$(`#${h}`).dialog({title:`${Markets.getName(t)} Market Deals`,position:g,close:x})}function b(){document.getElementById(h)?.remove();let e=`<div id="${h}" class="dialog stable editorDialog">
      <div>
        ${d({dialogId:h,columns:_})}
        <div id="marketDealsBody" class="table" style="max-height:30em"></div>

        <div id="marketDealsFooter" class="totalLine">
          <div style="margin-left: 5px" data-tip="Deals count">Deals: <span id="marketDealsFooterDeals">0</span></div>
          <div data-col="income" style="margin-left: 12px" data-tip="Net flow for this market">Net Flow: <span id="marketDealsFooterNet">🟡 0</span></div>
        </div>

        <div id="marketDealsBottom">
          <button id="marketDealsRefresh" data-tip="Refresh the Deals screen" class="icon-cw"></button>
          <button id="marketDealsExport" data-tip="Save market deals data as a text file (.csv)" class="icon-download"></button>
          <select id="marketDealsFilter" data-tip="Filter deals by scope" style="margin-left: 8px">
            <option value="all">All</option>
            <option value="local">Local</option>
            <option value="global">Global</option>
          </select>
        </div>
      </div>
  </div>`;n(`dialogs`).insertAdjacentHTML(`beforeend`,e),o(h,v.reset),f({dialogId:h,columns:_,onUpdate:()=>s(h,{width:`fit-content`,position:g})}),n(`marketDealsRefresh`).addEventListener(`click`,v.refresh),n(`marketDealsExport`).addEventListener(`click`,j),n(`marketDealsBody`).addEventListener(`click`,e=>{let t=e.target.closest(`.marketDealParty`)?.closest(`.marketDeal`)?.dataset.id,n=pack.deals.find(e=>e.i===Number(t));if(!n)return;let r=k(n);r&&zoomTo(r.x,r.y,8,2e3)}),n(`marketDealsFilter`).addEventListener(`change`,e=>{m=e.target.value,v.reset()})}function x(){$(`#${h}`).dialog(`destroy`),n(h).remove()}function S(){return Markets.get(p)?c(h,w(pack.deals,p).filter(e=>{if(m===`all`)return!0;let t=D(e,p);return m===`local`?t.type===`burg`:t.type===`market`}),_):(a(`Invalid market. The selected market does not exist`,!0,`error`,5e3),[])}function C(e){let t=e.rows.map(O).join(``),i=e.all.reduce((e,t)=>e+A(t,p),0);n(`marketDealsBody`).innerHTML=t||`No market deals recorded`,n(`marketDealsFooterDeals`).innerHTML=String(e.all.length),n(`marketDealsFooterNet`).innerHTML=r(i),l(n(`marketDealsFooter`),e,v.goto),s(h,{width:`fit-content`,position:g})}function w(e,t){return e.filter(e=>e.sellerType===`market`&&e.seller===t||e.buyerType===`market`&&e.buyer===t)}function T(e,t){return e.sellerType===`market`&&e.seller===t}function E(e,t){return T(e,t)?`out`:`in`}function D(e,t){return T(e,t)?{id:e.buyer,type:e.buyerType}:{id:e.seller,type:e.sellerType}}function O(t){let n=Goods.get(t.good);if(!n)return``;let i=A(t,p),a=k(t),o=D(t,p),s=E(t,p),c=i>=0?`#2a6`:`#c44`,l=i>=0?`#dff0d8`:`#f2dede`;return`<div class="states marketDeal" data-id="${t.i}" data-good="${n.name}" data-direction="${s}" data-units="${e(t.units,2)}" data-counterparty="${o.type}_${a?.name}" data-income="${i}">
      <svg data-col="icon" data-tip="Good icon" width="1.3em" height="1.3em" class="goodIcon">
        <circle cx="50%" cy="50%" r="42%" fill="${n.color}" stroke="${Goods.getStroke(n.color)}"/>
        <use href="#${n.icon}" x="10%" y="10%" width="80%" height="80%"/>
      </svg>
      <div data-col="good" data-tip="Good name" class="goodName">${n.name}</div>
      <div data-col="direction"><span class="marketBadge" style="background:${l}; color:${c}">${s.toUpperCase()}</span></div>
      <div data-col="counterparty" class="marketDealParty pointer" data-tip="Click to zoom">
        <div class="${o.type===`burg`?`icon-dot-circled`:`icon-store`}" style="display:inline-block; width: 0.8em; ${o.type===`market`?`font-size: 0.85em;`:``}"></div>
        <div style="display:inline-block; width: 6.8em;">${a?.name}</div>
      </div>
      <div data-col="units" class="marketDealUnits">${e(t.units,2)}</div>
      <div data-col="income" class="marketDealIncome" style="color:${c}">${r(i)}</div>
    </div>`}function k(e){let t=D(e,p),n=t.type===`burg`?t.id:Markets.get(t.id)?.centerBurgId;return n&&pack.burgs[n]||null}function A(t,n){let r=e(t.units*t.price,2);return T(t,n)?r:-r}function j(){if(!Markets.get(p))return;let n=w(pack.deals,p),r=`Id,Good,Type,Client,Units,Price,Net
`;for(let t of n){let n=Goods.get(t.good);n&&(r+=[t.i,n.name,E(t,p),k(t)?.name??``,e(t.units,2),e(t.price,2),e(A(t,p),2)].join(`,`),r+=`
`)}i(r,`${t(`Market_${p}_Deals`)}.csv`)}var M={open:y};export{M as MarketDealsOverview};