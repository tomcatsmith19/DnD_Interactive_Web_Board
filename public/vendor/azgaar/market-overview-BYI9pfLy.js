import{Ft as e,K as t,S as n,Sn as r,U as i,n as a,x as o}from"./utils-BYaxf2yO.js";import{r as s,t as c}from"./tooltips-CSQuPvuv.js";import{Lt as l,N as u,Nt as d,P as f,Pt as p,kt as m,mt as h}from"./index-DqeJMjPz.js";import{i as g,n as _,r as v,t as y}from"./table-BDnPiVU4.js";var b=0,x=`marketOverview`,S={my:`right top`,at:`right-10 top+10`,of:`svg`,collision:`fit`},C=[{key:`icon`,width:`2.5em`,permanent:!0},{key:`good`,label:`Good`,width:`8em`,permanent:!0,sortBy:e=>e.good,sortType:`alpha`},{key:`stock`,label:`Stock`,width:`5em`,sortBy:e=>e.stock,defaultSort:`desc`},{key:`price`,label:`Price`,width:`5em`,sortBy:e=>e.price},{key:`actions`,width:`1.2em`,permanent:!0}],w=_({getData:A,onUpdate:j});function T(e){if(customization)return;let t=Markets.get(e);if(!t){s(`Invalid market. The selected market does not exist`,!0,`error`,5e3);return}b=e,m(`#${x}, .stable`),E(),w.reset(),D(t),$(`#${x}`).dialog({title:`Market Stock: ${Markets.getName(t)}`,width:`auto`,close:F,position:S})}function E(){document.getElementById(x)?.remove();let e=`<div id="${x}" class="dialog stable editorDialog">
      ${v({dialogId:x,columns:C})}
      <div id="marketOverviewGoodsBody" class="table" style="max-height:40em"></div>
      <div id="marketOverviewSummary" class="totalLine"></div>
      <div id="marketOverviewNameLine" style="display: flex; align-items: center; margin-bottom: 0.4em">
        <div class="label">Name:</div>
        <input
          id="marketOverviewName"
          data-tip="Type to rename the market. Clear the field to reset to the default name"
          autocorrect="off"
          spellcheck="false"
          style="width: 11em; margin-left: 0.3em;"
        />
        <span
          id="marketOverviewNameReset"
          data-tip="Reset to the default name (center burg name)"
          class="icon-ccw pointer"
          style="margin-left: 0.3em"
        ></span>
      </div>
      <div id="marketOverviewInfo" style="margin-bottom: 0.3em"></div>
      <div id="marketOverviewBottom">
        <button id="marketOverviewRefresh" data-tip="Refresh the Overview screen" class="icon-cw"></button>
        <button id="marketOverviewOpenDeals" data-tip="View market deals" class="icon-list-bullet"></button>
        <button
          id="marketOverviewRelocate"
          data-tip="Relocate market. Click on a burg on the map to move the market center"
          class="icon-map-pin"
        ></button>
        <button id="marketOverviewExport" data-tip="Save market deals data as a text file (.csv)" class="icon-download"></button>
      </div>
  </div>`;i(`dialogs`).insertAdjacentHTML(`beforeend`,e),u(x,w.reset),y({dialogId:x,columns:C,onUpdate:()=>d(x,{width:`fit-content`,position:S})}),i(`marketOverviewRefresh`).addEventListener(`click`,w.refresh),i(`marketOverviewExport`).addEventListener(`click`,P),i(`marketOverviewOpenDeals`).addEventListener(`click`,()=>l.MarketDealsOverview.open(b)),i(`marketOverviewRelocate`).addEventListener(`click`,M),i(`marketOverviewName`).addEventListener(`input`,O),i(`marketOverviewNameReset`).addEventListener(`click`,k)}function D(e){let t=i(`marketOverviewName`);t.value=e.name||``,t.placeholder=pack.burgs[e.centerBurgId]?.name||`Market ${e.i}`}function O(){let e=Markets.get(b);e&&(e.name=this.value.trim()||void 0,$(`#marketOverview`).dialog(`option`,`title`,`Market Stock: ${Markets.getName(e)}`))}function k(){let e=Markets.get(b);e&&(e.name=void 0,i(`marketOverviewName`).value=``,$(`#marketOverview`).dialog(`option`,`title`,`Market Stock: ${Markets.getName(e)}`))}function A(){let e=Markets.get(b);if(!e)return s(`Invalid market. The selected market does not exist`,!0,`error`,5e3),[];let t=pack.burgs[e.centerBurgId];return!t||t.removed?(s(`Invalid market. The selected market has no center burg`,!0,`error`,5e3),[]):f(x,Object.entries(e.goods).flatMap(([e,t])=>{let n=Goods.get(+e);return n?[{goodId:+e,good:n.name,stock:t.stock,price:t.price}]:[]}),C)}function j(t){let n=Markets.get(b);if(!n)return;let r=t.rows.map(t=>{let n=Goods.get(t.goodId),r=Goods.getStroke(n.color);return`<div class="states marketGood"
      data-good="${n.name}"
      data-stock="${e(t.stock,2)}"
      data-price="${e(t.price,2)}">
      <svg data-col="icon" data-tip="Good icon" width="2em" height="2em" class="goodIcon">
        <circle cx="50%" cy="50%" r="42%" fill="${n.color}" stroke="${r}"/>
        <use href="#${n.icon}" x="10%" y="10%" width="80%" height="80%"/>
      </svg>
      <div data-col="good" data-tip="Good name" class="goodName">${n.name}</div>
      <div data-col="stock" data-tip="Good stock" class="marketGoodStock">${e(t.stock,2)}</div>
      <div data-col="price" data-tip="Good price" class="marketGoodPrice">${a(t.price)}</div>
    </div>`});i(`marketOverviewGoodsBody`).innerHTML=r.join(``)||`No market goods available`;let o=pack.burgs[n.centerBurgId],s=pack.states[o?.state||0],c=`stateCOA${s.i}`;s&&COArenderer.trigger(c,s.coa),i(`marketOverviewInfo`).innerHTML=`<svg class="coaIcon" viewBox="0 0 200 200"><use href="#${c}"></use></svg><b>Owner:</b> ${s.fullName||s.name}`;let l=pack.burgs.filter(e=>!e.removed&&e.market===n.i),u=t.all.reduce((e,t)=>e+t.stock,0);i(`marketOverviewSummary`).innerHTML=`
    <div style="margin-left:5px">Cells: ${pack.cells.market.reduce((e,t)=>e+ +(t===n.i),0)}</div>
    <div style="margin-left:12px">Burgs: ${l.length}</div>
    <div data-col="stock" style="margin-left:12px">Stock: ${e(u,2)}</div>`,g(i(`marketOverviewSummary`),t,w.goto),d(x,{width:`fit-content`,position:S})}function M(){let e=i(`marketOverviewRelocate`);e.classList.toggle(`pressed`),e.classList.contains(`pressed`)?(r(`#viewbox`).style(`cursor`,`crosshair`).on(`click`,N),s(`Click on a burg on the map to relocate the market center`,!0)):(c(),p())}function N(e){let n=Markets.get(b);if(!n)return;let[r,i]=t(e,this),a=findCell(r,i);if(a===void 0)return;let o=pack.cells.burg[a],c=pack.burgs[o];if(!o||!c||c.removed){s(`No valid burg in this cell. Click on a cell with a burg`,!1,`error`);return}if(o===n.centerBurgId){s(`This burg is already the center of this market`,!1,`error`);return}if(pack.markets.some(e=>e.centerBurgId===o)){s(`This burg is already a center of another market`,!1,`error`);return}Markets.relocateMarket(b,o)&&(M(),layerIsOn(`toggleMarketsLayer`)&&h(),D(n),$(`#marketOverview`).dialog(`option`,`title`,`Market Stock: ${Markets.getName(n)}`),w.refresh())}function P(){let t=Markets.get(b);if(!t)return;let r=`Good,Stock,Buy Price,Sell Price
`;for(let[n,i]of Object.entries(t.goods)){let t=Goods.get(Number(n));if(!t)continue;let a=e(Markets.customerBuyPrice(i.price),2),o=e(Markets.customerSellPrice(i.price),2);r+=`${[t.name,e(i.stock,2),a,o].join(`,`)}\n`}o(r,`${n(`Market`)}.csv`)}function F(){i(`marketOverviewRelocate`).classList.contains(`pressed`)&&M(),$(`#${x}`).dialog(`destroy`),i(x).remove()}var I={open:T};export{I as MarketOverview};