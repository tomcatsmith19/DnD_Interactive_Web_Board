import{C as e,En as t,Et as n,Fn as r,Ft as i,I as a,In as o,K as s,Mt as c,N as l,Nt as u,On as d,P as f,S as p,Sn as m,U as h,W as g,Xt as _,an as v,cn as y,fn as ee,mn as b,on as te,pn as ne,rt as re,sn as ie,tn as ae,un as x,x as oe}from"./utils-BYaxf2yO.js";import{n as se}from"./sin-DXK16t1M.js";import{n as ce,r as S,t as le}from"./tooltips-CSQuPvuv.js";import{Lt as C,Mt as ue,O as de,Pt as fe,Qt as pe,Yt as me,c as he,jt as w,kt as T,mt as ge,n as _e,q as ve,t as ye,wt as be}from"./index-DqeJMjPz.js";var E=18,xe=.96422,Se=1,Ce=.82521,we=4/29,D=6/29,Te=3*D*D,Ee=D*D*D;function De(e){if(e instanceof O)return new O(e.l,e.a,e.b,e.opacity);if(e instanceof N)return je(e);e instanceof y||(e=ee(e));var t=M(e.r),n=M(e.g),r=M(e.b),i=k((.2225045*t+.7168786*n+.0606169*r)/Se),a,o;return t===n&&n===r?a=o=i:(a=k((.4360747*t+.3850649*n+.1430804*r)/xe),o=k((.0139322*t+.0971045*n+.7141733*r)/Ce)),new O(116*i-16,500*(a-i),200*(i-o),e.opacity)}function Oe(e,t,n,r){return arguments.length===1?De(e):new O(e,t,n,r??1)}function O(e,t,n,r){this.l=+e,this.a=+t,this.b=+n,this.opacity=+r}ne(O,Oe,b(ie,{brighter(e){return new O(this.l+E*(e??1),this.a,this.b,this.opacity)},darker(e){return new O(this.l-E*(e??1),this.a,this.b,this.opacity)},rgb(){var e=(this.l+16)/116,t=isNaN(this.a)?e:e+this.a/500,n=isNaN(this.b)?e:e-this.b/200;return t=xe*A(t),e=Se*A(e),n=Ce*A(n),new y(j(3.1338561*t-1.6168667*e-.4906146*n),j(-.9787684*t+1.9161415*e+.033454*n),j(.0719453*t-.2289914*e+1.4052427*n),this.opacity)}}));function k(e){return e>Ee?e**(1/3):e/Te+we}function A(e){return e>D?e*e*e:Te*(e-we)}function j(e){return 255*(e<=.0031308?12.92*e:1.055*e**(1/2.4)-.055)}function M(e){return(e/=255)<=.04045?e/12.92:((e+.055)/1.055)**2.4}function ke(e){if(e instanceof N)return new N(e.h,e.c,e.l,e.opacity);if(e instanceof O||(e=De(e)),e.a===0&&e.b===0)return new N(NaN,0<e.l&&e.l<100?0:NaN,e.l,e.opacity);var t=Math.atan2(e.b,e.a)*v;return new N(t<0?t+360:t,Math.sqrt(e.a*e.a+e.b*e.b),e.l,e.opacity)}function Ae(e,t,n,r){return arguments.length===1?ke(e):new N(e,t,n,r??1)}function N(e,t,n,r){this.h=+e,this.c=+t,this.l=+n,this.opacity=+r}function je(e){if(isNaN(e.h))return new O(e.l,0,0,e.opacity);var t=e.h*te;return new O(e.l,Math.cos(t)*e.c,Math.sin(t)*e.c,e.opacity)}ne(N,Ae,b(ie,{brighter(e){return new N(this.h,this.c,this.l+E*(e??1),this.opacity)},darker(e){return new N(this.h,this.c,this.l-E*(e??1),this.opacity)},rgb(){return je(this).rgb()}}));var P=`all`;function Me(e){let{mode:t,tool:n}=e||{};We(),m(`#viewbox`).selectAll(`#heights`).remove(),m(`#viewbox`).insert(`g`,`#terrs`).attr(`id`,`heights`),t?I(t,n):Ie(n)}Fe();function Ne(){w(`templateEditor`),h(`dialogs`).insertAdjacentHTML(`beforeend`,`<div id="templateEditor" class="dialog stable">
      <div id="templateTop">
        <i>Select template: </i>
        <select id="templateSelect" style="width: 16em" data-prev="templateCustom" data-tip="Select base template">
          <option value="custom" selected>Custom</option>
          <option value="volcano">Volcano</option>
          <option value="highIsland">High Island</option>
          <option value="lowIsland">Low Island</option>
          <option value="continents">Continents</option>
          <option value="archipelago">Archipelago</option>
          <option value="atoll">Atoll</option>
          <option value="mediterranean">Mediterranean</option>
          <option value="peninsula">Peninsula</option>
          <option value="pangea">Pangea</option>
          <option value="isthmus">Isthmus</option>
          <option value="shattered">Shattered</option>
          <option value="taklamakan">Taklamakan</option>
          <option value="oldWorld">Old World</option>
          <option value="fractious">Fractious</option>
        </select>
      </div>
      <div id="templateTools">
        <button data-type="Hill" data-tip="Hill: small blob">H</button>
        <button data-type="Pit" data-tip="Pit: round depression">P</button>
        <button data-type="Range" data-tip="Range: elongated elevation">R</button>
        <button data-type="Trough" data-tip="Trough: elongated depression">T</button>
        <button data-type="Strait" data-tip="Strait: centered vertical or horizontal depression">S</button>
        <button data-type="Mask" data-tip="Mask: lower cells near edges or in map center">M</button>
        <button data-type="Invert" data-tip="Invert heightmap along the axes">I</button>
        <button data-type="Add" data-tip="Add or subtract value from all heights in range">+</button>
        <button data-type="Multiply" data-tip="Multiply all heights in range by factor">*</button>
        <button
          data-type="Smooth"
          data-tip="Smooth the map replacing cell heights by an average values of its neighbors"
        >
          ~
        </button>
      </div>
      <div id="templateBody" data-changed="0" class="table" style="padding: 2px 0">
        <div data-type="Hill">
          <div class="icon-check" data-tip="Click to skip the step"></div>
          <div style="width: 4em">Hill</div>
          <i class="icon-trash-empty pointer" data-tip="Remove the step"></i>
          <i class="icon-resize-vertical" data-tip="Drag to reorder"></i>
          <span
            >y:<input class="templateY" data-tip="Y axis position in percentage (minY-maxY or Y)" value="47-53"
          /></span>
          <span
            >x:<input class="templateX" data-tip="X axis position in percentage (minX-maxX or X)" value="65-75"
          /></span>
          <span
            >h:<input
              class="templateHeight"
              data-tip="Blob maximum height, use hyphen to get a random number in range"
              value="90-100"
          /></span>
          <span
            >n:<input
              class="templateCount"
              data-tip="Blobs to add, use hyphen to get a random number in range"
              value="1"
          /></span>
        </div>
      </div>
      <div id="templateBottom">
        <button id="templateRun" data-tip="Execute the template" class="icon-play-circled2"></button>
        <button id="templateUndo" data-tip="Undo the latest action" class="icon-ccw" disabled></button>
        <button id="templateRedo" data-tip="Redo the action" class="icon-cw" disabled></button>
        <button id="templateSave" data-tip="Download the template as a text file" class="icon-download"></button>
        <button id="templateLoad" data-tip="Open previously downloaded template" class="icon-upload"></button>
        <button
          id="templateCA"
          data-tip="Find or share custom template on Cartography Assets portal"
          class="icon-drafting-compass"
          onclick="
            openURL('https://cartographyassets.com/asset-category/specific-assets/azgaars-generator/templates')
          "
        ></button>
        <button
          id="templateTutorial"
          data-tip="Open Template Editor Tutorial"
          class="icon-info"
          onclick="wiki('Heightmap-template-editor')"
        ></button>
        <label
          data-tip="Enter seed for template to generate the same heightmap each time"
        >
          Seed: <input id="templateSeed" value="" type="number" min="1" max="999999999" step="1" style="width: 8em" />
        </label>
      </div>
    </div>`);let t=h(`templateBody`);$(`#templateBody`).sortable({items:`> div`,handle:`.icon-resize-vertical`,containment:`#templateBody`,axis:`y`}),t.addEventListener(`click`,e=>{let n=e.target;if(n.classList.contains(`icon-check`)){n.classList.remove(`icon-check`),n.classList.add(`icon-check-empty`),n.parentElement.style.opacity=`0.5`,t.dataset.changed=`1`;return}if(n.classList.contains(`icon-check-empty`)){n.classList.add(`icon-check`),n.classList.remove(`icon-check-empty`),n.parentElement.style.opacity=`1`;return}n.classList.contains(`icon-trash-empty`)&&n.parentElement.remove()}),h(`templateEditor`).addEventListener(`keypress`,e=>{e.key===`Enter`&&(e.preventDefault(),mt())}),h(`templateTools`).addEventListener(`click`,lt),h(`templateSelect`).addEventListener(`change`,ft),h(`templateRun`).addEventListener(`click`,mt),h(`templateUndo`).addEventListener(`click`,()=>W(edits.n-1)),h(`templateRedo`).addEventListener(`click`,()=>W(edits.n+1)),h(`templateSave`).addEventListener(`click`,ht),h(`templateLoad`).addEventListener(`click`,()=>h(`templateToLoad`).click()),h(`templateToLoad`).onchange=()=>{e(h(`templateToLoad`),gt)}}function Pe(){w(`imageConverter`),h(`dialogs`).insertAdjacentHTML(`beforeend`,`<div id="imageConverter" class="dialog stable">
      <div id="convertImageButtons">
        <button id="convertImageLoad" data-tip="Load image to convert" class="icon-upload"></button>
        <button
          id="convertAutoLum"
          data-tip="Auto-assign colors based on liminosity (good for monochrome images)"
          class="icon-adjust"
        ></button>
        <button
          id="convertAutoHue"
          data-tip="Auto-assign colors based on hue (good for colored images)"
          class="icon-paint-roller"
        ></button>
        <button
          id="convertAutoFMG"
          data-tip="Auto-assign colors using generator scheme (for exported colored heightmaps)"
          class="icon-layer-group"
        ></button>
        <button id="convertColorsButton" data-tip="Set maximum number of colors" class="icon-signal"></button>
        <input id="convertColors" value="100" style="display: none" />
        <button
          id="convertCancel"
          data-tip="Cancel the conversion. Previous heightmap will be restored"
          class="icon-cancel"
        ></button>
      </div>
      <div data-tip="Set opacity of the loaded image" style="padding-top: 0.4em">
        <i>Overlay opacity:</i><br />
        <input id="convertOverlay" type="range" min="0" max="1" step=".01" value="0" style="width: 12.6em" />
        <input id="convertOverlayNumber" type="number" min="0" max="1" step=".01" value="0" style="width: 4.2em" />
      </div>
      <div data-tip="Select a color below and assign a height value for it" id="colorsSelect" style="display: none">
        <i>Set height: </i>
        <span id="colorsSelectValue"></span>
        <span>(<span id="colorsSelectFriendly">0</span>)</span><br />
        <div id="imageConverterPalette"></div>
      </div>
      <div data-tip="Select a color to re-assign the height value" id="colorsAssigned" style="display: none">
        <i>Assigned colors (<span id="colorsAssignedNumber"></span>):</i>
        <div id="colorsAssignedContainer" class="colorsContainer"></div>
      </div>
      <div data-tip="Select a color to assign a height value" id="colorsUnassigned" style="display: none">
        <i>Unassigned colors (<span id="colorsUnassignedNumber"></span>):</i>
        <div id="colorsUnassignedContainer" class="colorsContainer"></div>
      </div>
      <button
        id="convertComplete"
        data-tip="Complete the conversion. All unassigned colors will be considered as ocean"
        style="margin: 0.4em 0"
        class="glow"
      >
        Complete the conversion
      </button>
    </div>`),m(`#imageConverterPalette`).selectAll(`div`).data(t(101)).enter().append(`div`).attr(`data-color`,e=>e).style(`background-color`,e=>color(1-(e<20?e-5:e)/100)).style(`width`,e=>e<40||e>68?`.2em`:`.1em`).on(`touchmove mousemove`,vt).on(`click`,St),h(`convertImageLoad`).addEventListener(`click`,()=>h(`imageToLoad`).click()),h(`imageToLoad`).onchange=()=>yt.call(h(`imageToLoad`)),h(`convertAutoLum`).addEventListener(`click`,()=>Y(`lum`)),h(`convertAutoHue`).addEventListener(`click`,()=>Y(`hue`)),h(`convertAutoFMG`).addEventListener(`click`,()=>Y(`scheme`)),h(`convertColorsButton`).addEventListener(`click`,Ct),h(`convertComplete`).addEventListener(`click`,wt),h(`convertCancel`).addEventListener(`click`,Tt),h(`convertOverlay`).addEventListener(`input`,function(){X(+this.value)}),h(`convertOverlayNumber`).addEventListener(`input`,function(){X(+this.value)})}var F=[];function Fe(){h(`paintBrushes`).addEventListener(`click`,G),h(`applyTemplate`).addEventListener(`click`,st),h(`convertImage`).addEventListener(`click`,_t),h(`heightmapPreview`).addEventListener(`click`,Dt),h(`heightmap3DView`).addEventListener(`click`,changeViewMode),h(`finalizeHeightmap`).addEventListener(`click`,Re),h(`renderOcean`).addEventListener(`click`,z)}function Ie(e){alertMessage.innerHTML=`Heightmap is a core element on which all other data (rivers, burgs, states etc) is based. So the best edit approach is to
    <i>erase</i> the secondary data and let the system automatically regenerate it on edit completion.
    <p><i>Erase</i> mode also allows you Convert an Image into a heightmap or use Template Editor.</p>
    <p>You can <i>keep</i> the data, but you won't be able to change the coastline.</p>
    <p>Try <i>risk</i> mode to change the coastline and keep the data. The data will be restored as much as possible, but it can cause unpredictable errors.</p>
    <p>Please <span class="pseudoLink" onclick="window.Services.Save.saveMap('machine')">save the map</span> before editing the heightmap!</p>
    <p style="margin-bottom: 0">Check out ${re(`https://github.com/Azgaar/Fantasy-Map-Generator/wiki/Heightmap-customization`,`wiki`)} for guidance.</p>`,$(`#alert`).dialog({resizable:!1,title:`Edit Heightmap`,width:`28em`,buttons:{Erase:()=>I(`erase`,e),Keep:()=>I(`keep`,e),Risk:()=>I(`risk`,e),Cancel:function(){$(this).dialog(`close`)}}})}function I(e,t){F=Array.from(h(`mapLayers`).querySelectorAll(`li:not(.buttonoff)`)).map(e=>e.id),F.forEach(e=>{h(e).click()}),customization=1,T(),S(`Heightmap edit mode is active. Click on "Exit Customization" to finalize the heightmap`,!0),h(`options`).querySelectorAll(`.tabcontent`).forEach(e=>{e.style.display=`none`}),h(`options`).querySelector(`.tab > .active`).classList.remove(`active`),h(`customizationMenu`).style.display=`block`,h(`toolsTab`).classList.add(`active`),h(`heightmapEditMode`).innerHTML=e,e===`erase`?(undraw(),P=`all`):e===`keep`?(m(`#viewbox`).selectAll(`#landmass, #lakes`).style(`display`,`none`),P=`land`):e===`risk`&&(m(`#deftemp`).selectAll(`#land, #water`).selectAll(`path`).remove(),m(`#deftemp`).select(`#featurePaths`).selectAll(`path`).remove(),m(`#viewbox`).selectAll(`#coastline use, #lakes path, #oceanLayers path`).remove(),P=`all`);let n=g(`cellTypeFilter`);n&&(n.value=P),h(`applyTemplate`).style.display=e===`erase`?`inline-block`:`none`,h(`convertImage`).style.display=e===`erase`?`inline-block`:`none`,h(`allowErosionBox`).style.display=e===`keep`?`none`:`inline-block`;let r=h(`exitCustomization`);if(sessionStorage.getItem(`noExitButtonAnimation`))r.style.display=`block`;else{sessionStorage.setItem(`noExitButtonAnimation`,`true`),r.style.opacity=`0`;let e=12*h(`uiSize`).value*11;r.style.right=`${(svgWidth-e)/2}px`,r.style.bottom=`${svgHeight/2}px`,r.style.transform=`scale(2)`,r.style.display=`block`,m(`#exitCustomization`).transition().duration(1e3).style(`opacity`,1).transition().duration(2e3).ease(se).style(`right`,`10px`).style(`bottom`,`10px`).style(`transform`,`scale(1)`)}turnButtonOn(`toggleHeight`);let i=h(`layersPreset`);i.value=`heightmap`,i.disabled=!0,z(),m(`#viewbox`).on(`touchmove mousemove`,Le),m(`#map`).on(`dblclick.zoom`,null),t===`templateEditor`?st():t===`imageConverter`?_t():G()}function Le(e){let[t,n]=s(e,this),r=f(t,n,grid);h(`heightmapInfoX`).innerHTML=String(i(t)),h(`heightmapInfoY`).innerHTML=String(i(n)),h(`heightmapInfoCell`).innerHTML=String(r),h(`heightmapInfoHeight`).innerHTML=`${grid.cells.h[r]} (${L(grid.cells.h[r])})`,h(`tooltip`).dataset.main&&ce();let a=g(`brushesButtons`)?.querySelector(`button.pressed`);if(a){if(a.id===`brushLine`){m(`#debug`).select(`line`).attr(`x2`,t).attr(`y2`,n);return}if(a.id===`brushFill`){_e();return}ye(t,n,h(`heightmapBrushRadius`).valueAsNumber)}}function L(e){let t=heightUnit.value,n=3.281;t===`m`?n=1:t===`f`&&(n=.5468);let r=-990;return e>=20?r=(e-18)**heightExponentInput.value:e<20&&e>0&&(r=(e-20)/e*50),`${i(r*n)} ${t}`}function Re(){if(m(`#viewbox`).select(`#heights`).selectAll(`*`).size()<200){S(`Insufficient land area. There should be at least 200 land cells!`,!1,`error`);return}if(g(`imageConverter`)){S(`Please exit the Image Conversion mode first`,!1,`error`);return}window.edits=void 0,H(!0,!0),customization=0,h(`customizationMenu`).style.display=`none`,h(`options`).querySelector(`.tab > button.active`).id===`toolsTab`&&(h(`toolsContent`).style.display=`block`),h(`layersPreset`).disabled=!1,h(`exitCustomization`).style.display=`none`,fe(),le(),T(),resetZoom(),document.getElementById(`preview`)?.remove(),document.getElementById(`canvas3d`)&&C.View3d.enterStandard();let e=h(`heightmapEditMode`).innerHTML;e===`erase`?ze():e===`keep`?Be():e===`risk`&&He(),he(),m(`#viewbox`).selectAll(`#heights`).remove(),turnButtonOff(`toggleHeight`),h(`mapLayers`).querySelectorAll(`li`).forEach(e=>{let t=F.includes(e.id);(t&&!layerIsOn(e.id)||!t&&layerIsOn(e.id))&&e.click()}),layerIsOn(`toggleBorders`)||m(`#borders`).selectAll(`path`).remove(),layerIsOn(`toggleStates`)||m(`#regions`).selectAll(`path`).remove(),layerIsOn(`toggleRivers`)||m(`#rivers`).selectAll(`*`).remove(),getCurrentPreset()}function ze(){INFO&&console.group(`Edit Heightmap`),TIME&&console.time(`regenerateErasedData`),pack.cultures=[],pack.burgs=[],pack.states=[],pack.provinces=[],pack.religions=[];let e=h(`allowErosion`).checked;if(Features.markupGrid(),e&&(addLakesInDeepDepressions(),openNearSeaLakes()),OceanLayers(),calculateTemperatures(),generatePrecipitation(),reGraph(),Features.markupPack(),Rivers.generate(e),!e)for(let e of pack.cells.i){let t=pack.cells.g[e];pack.cells.h[e]!==grid.cells.h[t]&&pack.cells.h[e]>=20==grid.cells.h[t]>=20&&(pack.cells.h[e]=grid.cells.h[t])}Biomes.define(),Features.defineGroups(),Goods.generate(),rankCells(),Cultures.generate(),Cultures.expand(),Burgs.generate(),States.generate(),Routes.generate(),Religions.generate(),Burgs.specify(),States.collectStatistics(),States.defineStateForms(),Provinces.generate(),Provinces.getPoles(),Rivers.specify(),Lakes.defineNames(),Markets.generate(),Production.produce(),States.collectTaxes(),Ice.generate(),Military.generate(),Markers.generate(),Zones.generate(),TIME&&console.timeEnd(`regenerateErasedData`),INFO&&console.groupEnd()}function Be(){m(`#viewbox`).selectAll(`#landmass, #lakes`).style(`display`,null);for(let e of pack.cells.i)pack.cells.h[e]=grid.cells.h[pack.cells.g[e]]}var Ve=e=>{let t=[];for(let n=0;n<e.p.length;n++)e.h[n]>=20&&t.push([e.p[n][0],e.p[n][1],n]);let n=_(t);return(e,t)=>{let r=n.find(e,t);if(r)return n.remove(r),r[2]}};function He(){INFO&&console.group(`Edit Heightmap`),TIME&&console.time(`restoreRiskedData`);let e=h(`allowErosion`).checked,t=grid.cells.i.length,n=new Uint8Array(t),r=new Uint16Array(t),i={},a=new Uint16Array(t),s=new Uint16Array(t),c=new Uint16Array(t),l=new Uint16Array(t),u=new Uint16Array(t),d=new Uint16Array(t),f=new Uint16Array(t),p=new Uint16Array(t),g=new Uint16Array(t),_=new Uint8Array(t);for(let t of pack.cells.i){let o=pack.cells.g[t];n[o]=pack.cells.biome[t],u[o]=pack.cells.culture[t],r[o]=pack.cells.pop[t],i[o]=pack.cells.routes[t],a[o]=pack.cells.s[t],c[o]=pack.cells.state[t],l[o]=pack.cells.province[t],s[o]=pack.cells.burg[t],d[o]=pack.cells.religion[t],f[o]=pack.cells.good?.[t]||0,e||(p[o]=pack.cells.fl[t],g[o]=pack.cells.r[t],_[o]=pack.cells.conf[t])}for(let e of grid.cells.i)s[e]&&grid.cells.h[e]<20&&(grid.cells.h[e]=20);for(let e of pack.cultures){if(!e.i||e.removed)continue;let t=pack.cells.p[e.center];e.x=t[0],e.y=t[1]}let v=new Map;for(let e of pack.zones){if(!e.cells?.length)continue;let t=e.cells.map(e=>pack.cells.g[e]);v.set(e.i,o(t))}Features.markupGrid(),e&&addLakesInDeepDepressions(),OceanLayers(),calculateTemperatures(),generatePrecipitation(),reGraph(),Features.markupPack(),e&&(Rivers.generate(!0),Features.defineGroups());let y=pack.cells.i.length;pack.cells.pop=new Float32Array(y),pack.cells.routes={},pack.cells.s=new Uint16Array(y),pack.cells.burg=new Uint16Array(y),pack.cells.state=new Uint16Array(y),pack.cells.province=new Uint16Array(y),pack.cells.culture=new Uint16Array(y),pack.cells.religion=new Uint16Array(y),pack.cells.biome=new Uint8Array(y),pack.cells.good=new Uint16Array(y),e||(pack.cells.r=new Uint16Array(y),pack.cells.conf=new Uint8Array(y),pack.cells.fl=new Uint16Array(y));for(let t of pack.cells.i){let o=pack.cells.g[t],s=pack.cells.h[t]>=20;e||(pack.cells.r[t]=g[o],pack.cells.conf[t]=_[o],pack.cells.fl[t]=p[o]),pack.cells.biome[t]=s&&n[o]?n[o]:Biomes.getId(grid.cells.prec[o],grid.cells.temp[o],pack.cells.h[t],!!pack.cells.r[t]),pack.cells.good[t]=f[o],s&&(pack.cells.culture[t]=u[o],pack.cells.pop[t]=r[o],pack.cells.routes[t]=i[o],pack.cells.s[t]=a[o],pack.cells.state[t]=c[o],pack.cells.province[t]=l[o],pack.cells.religion[t]=d[o])}let ee=Ve(pack.cells);for(let e of pack.burgs){if(!e.i||e.removed)continue;let t=ee(e.x,e.y);if(t===void 0){ERROR&&console.error(`[Data integrity] Burg ${e.i} has no available land cell after Risk restoration. Removing the burg`),Burgs.remove(e.i);continue}e.cell=t,e.feature=pack.cells.f[e.cell],pack.cells.burg[e.cell]=e.i,!e.capital&&pack.cells.h[e.cell]<20&&Burgs.remove(e.i),e.capital&&(pack.states[e.state].center=e.cell)}for(let e of pack.provinces){if(!e.i||e.removed)continue;let t=pack.cells.i.filter(t=>pack.cells.province[t]===e.i);if(!t.length){let t=e.state,n=pack.states[t].provinces;n.includes(e.i)&&pack.states[t].provinces.splice(n.indexOf(e.i),1),e.removed=!0;continue}e.burg&&!pack.burgs[e.burg].removed?e.center=pack.burgs[e.burg].cell:(e.center=t[0],e.burg=pack.cells.burg[e.center])}for(let e of pack.cultures)!e.i||e.removed||(e.center=findCell(e.x,e.y));States.getPoles(),States.findNeighbors(),States.collectStatistics(),e&&(Rivers.specify(),Lakes.defineNames());let b=new Map;for(let e of pack.cells.i){let t=pack.cells.g[e];b.has(t)||b.set(t,[]),b.get(t).push(e)}for(let e of pack.zones){let t=v.get(e.i);t?.length?e.cells=o(t.flatMap(e=>b.get(e)||[])):e.cells=[]}pack.goods?.length?(pack.markets=(pack.markets||[]).filter(e=>{let t=pack.burgs[e.centerBurgId];return!!(t&&!t.removed)}),Production.regenerateEconomy(),layerIsOn(`toggleMarketsLayer`)&&ge(),layerIsOn(`toggleGoods`)&&be(),layerIsOn(`toggleTrade`)&&ve.restart(),ue()):(Goods.generate(),Markets.generate(),Production.produce(),States.collectTaxes()),Ice.generate(),m(`#ice`).selectAll(`*`).remove(),TIME&&console.timeEnd(`restoreRiskedData`),INFO&&console.groupEnd()}function R(){let e=r(edits),t=grid.cells.h.reduce((t,n,r)=>n===e[r]?t:t+1,0);if(S(`Cells changed: ${t}`),!t)return;let n=g(`cellTypeFilter`)?.value??P;if(n===`land`)for(let t of grid.cells.i)(e[t]<20||grid.cells.h[t]<20)&&(grid.cells.h[t]=e[t]);if(n===`water`)for(let t of grid.cells.i)(e[t]>=20||grid.cells.h[t]>=20)&&(grid.cells.h[t]=e[t]);z(),U()}function Ue(e,t=getColorScheme(`bright`)){return t(1-(e<20?e-5:e)/100)}function z(){let e=h(`renderOcean`).checked?grid.cells.i:grid.cells.i.filter(e=>grid.cells.h[e]>=20);m(`#viewbox`).select(`#heights`).selectAll(`polygon`).data(e).join(`polygon`).attr(`points`,e=>a(e,grid)).attr(`id`,e=>`cell${e}`).attr(`fill`,e=>Ue(grid.cells.h[e]))}function B(e){let t=h(`renderOcean`).checked;e.forEach(e=>{let n=m(`#viewbox`).select(`#heights`).select(`#cell${e}`);if(!t&&grid.cells.h[e]<20){n.remove();return}n.size()||(n=m(`#viewbox`).select(`#heights`).append(`polygon`).attr(`points`,a(e,grid)).attr(`id`,`cell${e}`)),n.attr(`fill`,Ue(grid.cells.h[e]))})}function V(){let e=grid.cells.h.reduce((e,t)=>t>=20?e+1:e,0);h(`landmassCounter`).innerText=`${e} (${i(e/grid.cells.i.length*100)}%)`,h(`landmassAverage`).innerText=String(i(pe(grid.cells.h)??0))}function H(e,t){let n=(n,r)=>{let i=g(n);i&&(i.disabled=e);let a=g(r);a&&(a.disabled=t)};n(`undo`,`redo`),n(`templateUndo`,`templateRedo`)}function U(e){let t=edits.n;edits=edits.slice(0,t),edits[t]=grid.cells.h.slice(),edits.n=t+1,H(edits.n<=1,!0),e||(V(),document.getElementById(`preview`)&&Q(),document.getElementById(`canvas3d`)&&C.View3d.redraw())}function W(e){edits.n=e,H(edits.n<=1,edits.n>=edits.length),edits[edits.n-1]!==void 0&&(grid.cells.h=edits[edits.n-1].slice(),z(),V(),document.getElementById(`preview`)&&Q(),document.getElementById(`canvas3d`)&&C.View3d.redraw())}function We(){window.edits=[],edits.n=0,H(!0,!0),U()}function G(){document.getElementById(`brushesPanel`)||(Ge(),$(`#brushesPanel`).dialog({title:`Paint Brushes`,resizable:!1,position:{my:`right top`,at:`right-10 top+10`,of:`svg`},close:Ke}))}function Ge(){w(`brushesPanel`);let e=`<div id="brushesPanel" class="dialog stable">
    <div id="brushesButtons" style="display: inline-block">
      <button id="brushRaise" data-tip="Raise brush: increase height of cells in radius by Power value">
        <svg viewBox="15 15 70 70" height="1em" width="1.6em">
          <path d="m20,39 h60 M50,85 v-35 l-12,8 m12,-8 l12,8" fill="none" stroke="#000" stroke-width="5" />
        </svg>
      </button>
      <button id="brushElevate" data-tip="Elevate brush: drag to gradually increase height of cells in radius by Power value">
        <svg viewBox="15 15 70 70" height="1em" width="1.6em">
          <path d="m20,50 q30,-35 60,0 M50,85 v-35 l-12,8 m12,-8 l12,8" fill="none" stroke="#000" stroke-width="5" />
        </svg>
      </button>
      <button id="brushLower" data-tip="Lower brush: drag to decrease height of cells in radius by Power value">
        <svg viewBox="15 15 70 70" height="1em" width="1.6em">
          <path d="M50,30 v35 l-12,-8 m12,8 l12,-8 M20,78 h60" fill="none" stroke="#000" stroke-width="5" />
        </svg>
      </button>
      <button id="brushDepress" data-tip="Depress brush: drag to gradually decrease height of cells in radius by Power value">
        <svg viewBox="15 15 70 70" height="1em" width="1.6em">
          <path d="M50,30 v35 l-12,-8 m12,8 l12,-8 M20,63 q30,35 60,0" fill="none" stroke="#000" stroke-width="5" />
        </svg>
      </button>
      <button id="brushAlign" data-tip="Align brush: drag to set height of cells in radius to height of the cell at mousepoint">
        <svg viewBox="15 15 70 70" height="1em" width="1.6em">
          <path d="m20,50 h56 m0,20 h-56" fill="none" stroke="#000" stroke-width="5" />
        </svg>
      </button>
      <button id="brushSmooth" data-tip="Smooth brush: drag to level height of cells in radius to height of adjacent cells">
        <svg viewBox="15 15 70 70" height="1em" width="1.6em">
          <path d="m15,60 q15,-15 30,0 q15,15 35,0" fill="none" stroke="#000" stroke-width="5" />
        </svg>
      </button>
      <button id="brushDisrupt" data-tip="Disrupt brush: drag to randomize height of cells in radius based on Power value">
        <svg viewBox="15 15 70 70" height="1em" width="1.6em">
          <path d="m15,63 l15,-13 15,20 15,-20 15,19 15,-14" fill="none" stroke="#000" stroke-width="5" />
        </svg>
      </button>
      <button id="brushFill" data-tip="Fill: click enclosed water or same-height land area to create a cone blob">
        <svg viewBox="20 10 60 60" height="1em" width="1.6em">
          <path d="M30,70 h40 M30,70 q0,-20 20,-20 q20,0 20,20" fill="none" stroke="#000" stroke-width="5" />
          <path d="M50,20 v25 M50,20 l-10,8 M50,20 l10,8" fill="none" stroke="#000" stroke-width="5" />
        </svg>
      </button>
      <button id="brushLine" data-tip="Line: select two points to change heights along the line">
        <svg viewBox="0 -5 100 100" height="1em" width="1.6em">
          <path d="M0 90 L100 10" fill="none" stroke="#000" stroke-width="7"></path>
        </svg>
      </button>
    </div>
    <div id="brushesSliders" style="display: none">
      <div data-tip="Change brush size. Shortcut: + to increase; – to decrease">
        <slider-input id="heightmapBrushRadius" min="1" max="100" value="25">
          <div style="width: 3.5em">Radius:</div>
        </slider-input>
      </div>
      <div data-tip="Change brush power">
        <slider-input id="heightmapBrushPower" min="1" max="10" value="5">
          <div style="width: 3.5em">Power:</div>
        </slider-input>
      </div>
    </div>
    <div id="lineSlider" style="display: none">
      <div data-tip="Change tool power. Shortcut: + to increase; – to decrease">
        <slider-input id="heightmapLinePower" min="-100" max="100" value="30">
          <div style="width: 5.5em">Power:</div>
        </slider-input>
      </div>
      <div data-tip="Change line randomness. Zero makes the line as straight as possible">
        <slider-input id="heightmapLineRandomness" min="0" max="100" value="30">
          <div style="width: 5.5em">Randomness:</div>
        </slider-input>
      </div>
    </div>
    <div data-tip="Restrict brush to specific cell types" style="margin-bottom: 0.6em">
      <label for="cellTypeFilter"><i>Cells to change:</i></label>
      <select id="cellTypeFilter">
        <option value="all" ${P===`all`?`selected`:``}>all cells</option>
        <option value="land" ${P===`land`?`selected`:``}>only land cells</option>
        <option value="water" ${P===`water`?`selected`:``}>only water cells</option>
      </select>
    </div>
    <div id="modifyButtons">
      <button id="undo" data-tip="Undo the latest action (Ctrl + Z)" class="icon-ccw" disabled></button>
      <button id="redo" data-tip="Redo the action (Ctrl + Y)" class="icon-cw" disabled></button>
      <button id="rescaleShow" data-tip="Show rescaler slider" class="icon-exchange"></button>
      <button id="rescaleCondShow" data-tip="Rescaler: change height if condition is fulfilled" class="icon-if"></button>
      <button id="smoothHeights" data-tip="Smooth all heights a bit" class="icon-smooth"></button>
      <button id="disruptHeights" data-tip="Disrupt (randomize) heights a bit" class="icon-disrupt"></button>
      <button id="brushClear" data-tip="Set height for all cells to 0 (erase the map)" class="icon-eraser"></button>
    </div>
    <div id="rescaleSection" style="display: none">
      <button id="rescaleHide" data-tip="Hide rescaler slider" class="icon-exchange"></button>
      <input id="rescaler" data-tip="Change height for all cells" type="range" min="-10" max="10" step="1" value="0" />
    </div>
    <div
      id="rescaleCondSection"
      data-tip="If height is greater or equal to X and less or equal to Y, then perform an operation Z with operand V"
      style="display: none"
    >
      <button id="rescaleCondHide" data-tip="Hide rescaler" class="icon-if"></button>
      <label>h ≥</label>
      <input id="rescaleLower" value="20" type="number" min="0" max="100" />
      <label>≤</label>
      <input id="rescaleHigher" value="100" type="number" min="1" max="100" />
      <label>⇒</label>
      <select id="conditionSign">
        <option value="multiply" selected>×</option>
        <option value="divide">÷</option>
        <option value="add">+</option>
        <option value="subtract">-</option>
        <option value="exponent">^</option>
      </select>
      <input id="rescaleModifier" type="number" value="0.9" min="0" max="1.5" step="0.01" />
      <button id="rescaleExecute" data-tip="Click to perform an operation" class="icon-play-circled2"></button>
    </div>
  </div>`;h(`dialogs`).insertAdjacentHTML(`beforeend`,e),qe()}function Ke(){K(),w(`brushesPanel`)}function qe(){h(`brushesButtons`).addEventListener(`click`,Je),h(`cellTypeFilter`).addEventListener(`change`,tt),h(`undo`).addEventListener(`click`,()=>W(edits.n-1)),h(`redo`).addEventListener(`click`,()=>W(edits.n+1)),h(`rescaleShow`).addEventListener(`click`,()=>{h(`modifyButtons`).style.display=`none`,h(`rescaleSection`).style.display=`block`}),h(`rescaleHide`).addEventListener(`click`,()=>{h(`modifyButtons`).style.display=`block`,h(`rescaleSection`).style.display=`none`}),h(`rescaler`).addEventListener(`change`,e=>nt(e.target.valueAsNumber)),h(`rescaleCondShow`).addEventListener(`click`,()=>{h(`modifyButtons`).style.display=`none`,h(`rescaleCondSection`).style.display=`block`}),h(`rescaleCondHide`).addEventListener(`click`,()=>{h(`modifyButtons`).style.display=`block`,h(`rescaleCondSection`).style.display=`none`}),h(`rescaleExecute`).addEventListener(`click`,rt),h(`smoothHeights`).addEventListener(`click`,it),h(`disruptHeights`).addEventListener(`click`,at),h(`brushClear`).addEventListener(`click`,ot)}function K(){let e=document.querySelector(`#brushesButtons > button.pressed`);e&&e.classList.remove(`pressed`),fe(),m(`#map`).on(`dblclick.zoom`,null),m(`#viewbox`).on(`touchmove mousemove`,Le),m(`#debug`).selectAll(`.lineCircle`).remove(),_e(),h(`brushesSliders`).style.display=`none`,h(`lineSlider`).style.display=`none`}function Je(e){let t=e.target.closest(`#brushesButtons > button`);if(!t)return;if(t.classList.contains(`pressed`)){K();return}K(),t.classList.add(`pressed`);let n=h(`heightmapBrushRadius`).parentElement;n&&(n.style.display=t.id===`brushFill`?`none`:``),t.id===`brushLine`?(h(`lineSlider`).style.display=`block`,m(`#viewbox`).style(`cursor`,`crosshair`).on(`click`,Ye)):t.id===`brushFill`?(h(`brushesSliders`).style.display=`block`,m(`#viewbox`).style(`cursor`,`crosshair`).on(`click`,Xe)):(h(`brushesSliders`).style.display=`block`,m(`#viewbox`).style(`cursor`,`crosshair`).call(me().on(`start`,$e)))}function Ye(e){let[t,n]=s(e,this),r=f(t,n,grid),i=m(`#debug`).selectAll(`.lineCircle`);if(!i.size()){m(`#debug`).append(`line`).attr(`id`,`brushCircle`).attr(`x1`,t).attr(`y1`,n).attr(`x2`,t).attr(`y2`,n),m(`#debug`).append(`circle`).attr(`data-cell`,r).attr(`class`,`lineCircle`).attr(`r`,6).attr(`cx`,t).attr(`cy`,n).attr(`fill`,`yellow`).attr(`stroke`,`#333`).attr(`stroke-width`,2);return}let a=+i.attr(`data-cell`);m(`#debug`).selectAll(`*`).remove();let o=h(`heightmapLinePower`).valueAsNumber;if(o===0){S(`Power should not be zero`,!1,`error`);return}let c=h(`heightmapLineRandomness`).valueAsNumber/200,l=grid.cells.h,u=o>0?HeightmapGenerator.addRange.bind(HeightmapGenerator):HeightmapGenerator.addTrough.bind(HeightmapGenerator);HeightmapGenerator.setGraph(grid),u(`1`,String(Math.abs(o)),``,``,a,r,c);let d=HeightmapGenerator.getHeights(),p=h(`cellTypeFilter`).value,g=[];for(let e=0;e<l.length;e++)d[e]!==l[e]&&(p===`land`&&l[e]<20||p===`water`&&l[e]>=20||(l[e]=d[e],g.push(e)));B(g),U()}function Xe(e){let[t,n]=s(e,this),r=f(t,n,grid),i=grid.cells.h[r],a=i<20,o=h(`cellTypeFilter`).value;if(o===`water`){S(`Fill brush is not available with 'only water cells' filter`,!1,`error`);return}if(o===`land`&&a){S(`Land filter is active, water areas cannot be filled`,!1,`error`);return}let{selection:c,reachedBorder:l}=Ze(r,a,i);if(c.length<3){S(`No enclosed area found to fill`,!1,`error`);return}if(a&&l){S(`Selected water area is open to map border and is not enclosed`,!1,`error`);return}let u=Qe(c,a,i);u.length&&(B(u),R())}function Ze(e,t,n){let{h:r,c:i,i:a}=grid.cells,o=new Uint8Array(a.length),s=[e],c=[],l=!1;for(;s.length;){let e=s.pop();o[e]||(o[e]=1,(t?r[e]<20:r[e]===n)&&(c.push(e),grid.cells.b[e]&&(l=!0),i[e].forEach(e=>{o[e]||s.push(e)})))}return{selection:c,reachedBorder:l}}function Qe(e,t,n){let r=h(`heightmapBrushPower`).valueAsNumber*10,{h:i,c:a,i:o}=grid.cells,s=new Uint8Array(o.length),c=new Uint16Array(o.length),l=[];e.forEach(e=>{s[e]=1});let f=[],p=0;for(e.forEach(e=>{a[e].some(e=>!s[e])&&(s[e]=2,f.push(e))});p<f.length;){let e=f[p++],t=c[e]+1;a[e].forEach(e=>{s[e]===1&&(s[e]=2,c[e]=t,f.push(e))})}let m=d(e,e=>c[e])||0,g=t?20:n;return e.forEach(e=>{let t=m?c[e]/m:1,n=u(g+Math.max(1,Math.round(r*t)),0,100);n!==i[e]&&(i[e]=n,l.push(e))}),l}function $e(e){let t=h(`heightmapBrushRadius`).valueAsNumber,[n,r]=s(e,this),i=f(n,r,grid),a=e=>{let n=s(e,this);ye(n[0],n[1],t);let r=l(n[0],n[1],t,grid),a=r,o=h(`cellTypeFilter`).value;o===`land`?a=r.filter(e=>grid.cells.h[e]>=20):o===`water`&&(a=r.filter(e=>grid.cells.h[e]<20)),a?.length&&et(a,i)};a(e),e.on(`drag`,a),e.on(`end`,R)}function et(e,t){let n=h(`heightmapBrushPower`).valueAsNumber,r=ae(n,1),a=h(`cellTypeFilter`).value===`land`,o=h(`cellTypeFilter`).value===`water`,s=e=>u(e,a?20:0,o?19:100),c=grid.cells.h,l=document.querySelector(`#brushesButtons > button.pressed`).id;l===`brushRaise`?e.forEach(e=>{c[e]=!o&&c[e]<20?20:s(c[e]+n)}):l===`brushElevate`?e.forEach((t,n)=>{c[t]=s(c[t]+r(n/Math.max(e.length-1,1)))}):l===`brushLower`?e.forEach(e=>{c[e]=s(c[e]-n)}):l===`brushDepress`?e.forEach((t,n)=>{c[t]=s(c[t]-r(n/Math.max(e.length-1,1)))}):l===`brushAlign`?e.forEach(e=>{c[e]=s(c[t])}):l===`brushSmooth`?e.forEach(e=>{c[e]=i(((pe(grid.cells.c[e].filter(e=>a?c[e]>=20:o?c[e]<20:!0).map(e=>c[e]))??0)+c[e]*(10-n)+.6)/(11-n),1)}):l===`brushDisrupt`&&e.forEach(e=>{c[e]=c[e]<15?c[e]:s(c[e]+n/1.6-Math.random()*n)}),B(e)}function tt(){let e=h(`cellTypeFilter`);e.value===`land`&&h(`heightmapEditMode`).innerHTML===`keep`&&(S(`You cannot change the coastline in 'Keep' edit mode`,!1,`error`),e.value=`all`)}function nt(e){let t=h(`cellTypeFilter`).value===`land`,n=h(`cellTypeFilter`).value===`water`;grid.cells.h=grid.cells.h.map(r=>{if(t&&(r<20||r+e<20)||n&&r>=20)return r;let i=c(r+e);return n?Math.min(i,19):i}),R(),h(`rescaler`).value=`0`}function rt(){let e=`${h(`rescaleLower`).value}-${h(`rescaleHigher`).value}`,t=h(`conditionSign`).value,n=h(`rescaleModifier`).valueAsNumber;if(Number.isNaN(n)){S(`Operand should be a number`,!1,`error`);return}if((t===`add`||t===`subtract`)&&!Number.isInteger(n)){S(`Operand should be an integer`,!1,`error`);return}HeightmapGenerator.setGraph(grid),t===`multiply`?HeightmapGenerator.modify(e,0,n,0):t===`divide`?HeightmapGenerator.modify(e,0,1/n,0):t===`add`?HeightmapGenerator.modify(e,n,1,0):t===`subtract`?HeightmapGenerator.modify(e,-1*n,1,0):t===`exponent`&&HeightmapGenerator.modify(e,0,1,n),grid.cells.h=HeightmapGenerator.getHeights(),R()}function it(){HeightmapGenerator.setGraph(grid),HeightmapGenerator.smooth(4,1.5),grid.cells.h=HeightmapGenerator.getHeights(),R()}function at(){grid.cells.h=grid.cells.h.map(e=>e<15?e:c(e+2.5-Math.random()*4)),R()}function ot(){let e=h(`cellTypeFilter`).value;if(e===`land`){S(`Not allowed when 'only land cells' filter is set`,!1,`error`);return}if(e===`water`){S(`Not allowed when 'only water cells' filter is set`,!1,`error`);return}if(!grid.cells.h.some(e=>e)){S(`Heightmap is already cleared, please do not click twice if not required`,!1,`error`);return}grid.cells.h=new Uint8Array(grid.cells.i.length),m(`#viewbox`).select(`#heights`).selectAll(`*`).remove(),U()}function st(){document.getElementById(`templateEditor`)||(Ne(),$(`#templateEditor`).dialog({title:`Template Editor`,minHeight:`auto`,width:`fit-content`,resizable:!1,position:{my:`right top`,at:`right-10 top+10`,of:`svg`},close:ct}))}function ct(){$(`#templateEditor`).dialog(`destroy`),h(`templateEditor`).remove()}function lt(e){let t=e.target;if(t.tagName!==`BUTTON`)return;let n=t.dataset.type;h(`templateBody`).dataset.changed=`1`,q(n)}function q(e,t,n,r,i){let a=h(`templateBody`);a.insertAdjacentHTML(`beforeend`,ut(e,t,n,r,i));let o=a.querySelector(`div:last-child > span > .templateDist`);if(o&&o.addEventListener(`change`,dt),n&&o&&o.tagName===`SELECT`){for(let e of Array.from(o.options))e.value===n&&(o.value=n);if(o.value!==n){let e=document.createElement(`option`);e.value=e.innerHTML=n,o.add(e),o.value=n}}}function ut(e,t,n,r,i){let a=`<div data-type="${e}"><div class="icon-check" data-tip="Click to skip the step"></div><div style="width:4em">${e}</div><i class="icon-trash-empty pointer" data-tip="Click to remove the step"></i><i class="icon-resize-vertical" data-tip="Drag to reorder"></i>`,o=`<span>y:
      <input class="templateY" data-tip="Placement range percentage along Y axis (minY-maxY)" value=${i||`20-80`} />
    </span>`,s=`<span>x:
      <input class="templateX" data-tip="Placement range percentage along X axis (minX-maxX)" value=${r||`15-85`} />
    </span>`,c=`<span>h:
      <input class="templateHeight" data-tip="Blob maximum height, use hyphen to get a random number in range" value=${n||`40-50`} />
    </span>`,l=`<span>n:
      <input class="templateCount" data-tip="Blobs to add, use hyphen to get a random number in range" value=${t||`1-2`} />
    </span>`;return e===`Hill`||e===`Pit`||e===`Range`||e===`Trough`?`${a}${o}${s}${c}${l}</div>`:e===`Strait`?`${a}
      <span>d:
        <select class="templateDist" data-tip="Strait direction">
          <option value="vertical" selected>vertical</option>
          <option value="horizontal">horizontal</option>
        </select>
      </span>
      <span>w:
        <input class="templateCount" data-tip="Strait width, use hyphen to get a random number in range" value=${t||`2-7`} />
      </span>
    </div>`:e===`Invert`?`${a}
      <span>by:
        <select class="templateDist" data-tip="Mirror heightmap along axis" style="width: 7.8em">
          <option value="x" selected>x</option>
          <option value="y">y</option>
          <option value="xy">both</option>
        </select>
      </span>
      <span>n:
        <input class="templateCount" data-tip="Probability of inversion, range 0-1" value=${t||`0.5`} />
      </span>
    </div>`:e===`Mask`?`${a}
      <span>f:
        <input class="templateCount"
          data-tip="Set masking fraction. 1 - full insulation (prevent land on map edges), 2 - half-insulation, etc. Negative number to inverse the effect"
          type="number" min=-10 max=10 value=${t||1} />
      </span>
    </div>`:e===`Add`?`${a}
      <span>to:
        <select class="templateDist" data-tip="Change only land or all cells">
          <option value="all" selected>all cells</option>
          <option value="land">land only</option>
          <option value="interval">interval</option>
        </select>
      </span>
      <span>v:
        <input class="templateCount" data-tip="Add value to height of all cells (negative values are allowed)"
        type="number" value=${t||-10} min=-100 max=100 step=1 />
      </span>
    </div>`:e===`Multiply`?`${a}
      <span>to:
        <select class="templateDist" data-tip="Change only land or all cells">
          <option value="all" selected>all cells</option>
          <option value="land">land only</option>
          <option value="interval">interval</option>
        </select>
      </span>
      <span>v:
        <input class="templateCount" data-tip="Multiply all cells Height by the value" type="number"
          value=${t||1.1} min=0 max=10 step=.1 />
      </span>
    </div>`:e===`Smooth`?`${a}
      <span>f:
        <input class="templateCount" data-tip="Set smooth fraction. 1 - full smooth, 2 - half-smooth, etc."
          type="number" min=1 max=10 step=1 value=${t||2} />
      </span>
    </div>`:``}function dt(e){let t=e.target;t.value===`interval`&&prompt(`Set a height interval. Avoid space, use hyphen as a separator`,{default:`17-20`},e=>{let n=document.createElement(`option`);n.value=n.innerHTML=String(e),t.add(n),t.value=String(e)})}function ft(e){let t=h(`templateBody`),n=t.querySelectorAll(`div`).length,r=+t.getAttribute(`data-changed`),i=e.target.value;if(!n||!r){pt(i);return}alertMessage.innerHTML=`Are you sure you want to select a different template? All changes will be lost.`,$(`#alert`).dialog({resizable:!1,title:`Change Template`,buttons:{Change:function(){pt(i),$(this).dialog(`close`)},Cancel:function(){$(this).dialog(`close`)}}})}function pt(e){let t=h(`templateBody`);t.setAttribute(`data-changed`,`0`),t.innerHTML=``;let n=de[e]?.template;if(!n)return;let r=n.split(`
`);if(!r.length){S(`Heightmap template: no steps defined`,!1,`error`);return}for(let e of r){let t=e.trim().split(` `);q(t[0],t[1],t[2],t[3],t[4])}}function mt(){let e=h(`templateBody`).querySelectorAll(`#templateBody > div`);if(!e.length)return;let t=h(`templateSeed`).value;Math.random=aleaPRNG(t||n()),grid.cells.h=new Uint8Array(grid.points.length),HeightmapGenerator.setGraph(grid),We();for(let t of e){if(t.style.opacity===`0.5`)continue;let e=t.querySelector(`.templateCount`)?.value||``,n=t.querySelector(`.templateHeight`)?.value||``,r=t.querySelector(`.templateDist`)?.value||``,i=t.querySelector(`.templateX`)?.value||``,a=t.querySelector(`.templateY`)?.value||``,o=t.dataset.type;o===`Hill`?HeightmapGenerator.addHill(e,n,i,a):o===`Pit`?HeightmapGenerator.addPit(e,n,i,a):o===`Range`?HeightmapGenerator.addRange(e,n,i,a):o===`Trough`?HeightmapGenerator.addTrough(e,n,i,a):o===`Strait`?HeightmapGenerator.addStrait(e,r):o===`Mask`?HeightmapGenerator.mask(+e):o===`Invert`?HeightmapGenerator.invert(+e,r):o===`Add`?HeightmapGenerator.modify(r,+e,1):o===`Multiply`?HeightmapGenerator.modify(r,0,+e):o===`Smooth`&&HeightmapGenerator.smooth(+e),grid.cells.h=HeightmapGenerator.getHeights(),U(`noStat`)}grid.cells.h=HeightmapGenerator.getHeights(),V(),z(),document.getElementById(`preview`)&&Q(),document.getElementById(`canvas3d`)&&C.View3d.redraw()}function ht(){let e=h(`templateBody`);e.dataset.changed=`0`;let t=e.querySelectorAll(`#templateBody > div`);if(!t.length)return;let n=``;for(let e of Array.from(t)){if(e.style.opacity===`0.5`)continue;let t=e.getAttribute(`data-type`),r=e.querySelector(`.templateCount`)?.value||`0`,i=e.querySelector(`.templateHeight`)?.value||e.querySelector(`.templateDist`)?.value||`0`,a=e.querySelector(`.templateX`)?.value||`0`,o=e.querySelector(`.templateY`)?.value||`0`;n+=`${t} ${r} ${i} ${a} ${o}\r\n`}let r=`template_${Date.now()}.txt`;oe(n,r)}function gt(e){let t=e.split(`\r
`);if(!t.length){S(`Cannot parse the template, please check the file`,!1,`error`);return}h(`templateBody`).innerHTML=``;for(let e of t){let t=e.split(` `);if(t.length!==5){ERROR&&console.error(`Cannot parse step, wrong arguments count`,e);continue}q(t[0],t[1],t[2],t[3],t[4])}}function _t(){if(document.getElementById(`imageConverter`))return;h(`imageToLoad`).click(),T(`#imageConverter`),Pe(),$(`#imageConverter`).dialog({title:`Image Converter`,maxHeight:svgHeight*.8,minHeight:`auto`,width:`20em`,position:{my:`right top`,at:`right-10 top+10`,of:`svg`},beforeClose:Et});let e=document.createElement(`canvas`);e.id=`canvas`,e.width=graphWidth,e.height=graphHeight,document.body.insertBefore(e,h(`optionsContainer`)),X(0),le(),S(`Image Converter is opened. Upload image and assign height value for each color`,!1,`warn`),grid.cells.h=new Uint8Array(grid.cells.i.length),m(`#viewbox`).select(`#heights`).selectAll(`*`).remove(),U()}function vt(){let e=+this.getAttribute(`data-color`);h(`colorsSelectValue`).innerHTML=String(e),h(`colorsSelectFriendly`).innerHTML=L(e);let t=h(`imageConverterPalette`).querySelector(`.hoveredColor`);t&&(t.className=``),this.className=`hoveredColor`}function yt(){let e=this.files[0];this.value=``;let t=new FileReader,n=new Image;n.id=`imageToConvert`,n.style.display=`none`,document.body.appendChild(n),n.onload=()=>{h(`canvas`).getContext(`2d`).drawImage(n,0,0,graphWidth,graphHeight),J(+h(`convertColors`).value),resetZoom()},t.onloadend=()=>{n.src=t.result},t.readAsDataURL(e)}function J(e){let t=h(`canvas`),n=document.createElement(`canvas`);n.width=grid.cellsX,n.height=grid.cellsY,n.getContext(`2d`).drawImage(t,0,0,grid.cellsX,grid.cellsY);let r=new RgbQuant({colors:e});r.sample(n);let i=r.reduce(n),o=r.palette(!0);m(`#viewbox`).select(`#heights`).selectAll(`*`).remove(),m(`#imageConverter`).selectAll(`div.color-div`).remove(),h(`colorsSelect`).style.display=`block`,h(`colorsUnassigned`).style.display=`block`,h(`colorsAssigned`).style.display=`none`,n.remove(),m(`#viewbox`).select(`#heights`).selectAll(`polygon`).data(grid.cells.i).join(`polygon`).attr(`points`,e=>a(e,grid)).attr(`id`,e=>`cell${e}`).attr(`fill`,e=>`rgb(${i[e*4]}, ${i[e*4+1]}, ${i[e*4+2]})`).on(`click`,bt);let s=o.map(e=>`rgb(${e[0]}, ${e[1]}, ${e[2]})`);m(`#colorsUnassignedContainer`).selectAll(`div`).data(s).enter().append(`div`).attr(`data-color`,e=>e).style(`background-color`,e=>e).attr(`class`,`color-div`).on(`click`,xt),h(`colorsUnassignedNumber`).innerHTML=String(s.length)}function bt(){let e=this.getAttribute(`fill`);h(`imageConverter`).querySelector(`div[data-color="${e}"]`)?.click()}function xt(){m(`#viewbox`).select(`#heights`).selectAll(`.selectedCell`).attr(`class`,null);let e=this.classList.contains(`selectedColor`),t=h(`imageConverter`).querySelector(`div.selectedColor`);t&&t.classList.remove(`selectedColor`);let n=h(`imageConverterPalette`).querySelector(`div.hoveredColor`);if(n&&n.classList.remove(`hoveredColor`),h(`colorsSelectValue`).innerHTML=h(`colorsSelectFriendly`).innerHTML=`0`,e)return;if(this.classList.add(`selectedColor`),this.dataset.height){let e=+this.dataset.height;h(`imageConverterPalette`).querySelector(`div[data-color="${e}"]`)?.classList.add(`hoveredColor`),h(`colorsSelectValue`).innerHTML=String(e),h(`colorsSelectFriendly`).innerHTML=L(e)}let r=this.getAttribute(`data-color`);m(`#viewbox`).select(`#heights`).selectAll(`polygon.selectedCell`).classed(`selectedCell`,!1),m(`#viewbox`).select(`#heights`).selectAll(`polygon[fill='${r}']`).classed(`selectedCell`,!0)}function St(){let e=+this.dataset.color,t=color(1-(e<20?e-5:e)/100),n=h(`imageConverter`).querySelector(`div.selectedColor`);n.style.backgroundColor=t,n.setAttribute(`data-color`,t),n.setAttribute(`data-height`,String(e)),m(`#viewbox`).select(`#heights`).selectAll(`.selectedCell`).each(function(){this.setAttribute(`fill`,t),this.setAttribute(`data-height`,String(e))}),n.parentNode.id===`colorsUnassignedContainer`&&(h(`colorsAssignedContainer`).appendChild(n),h(`colorsAssigned`).style.display=`block`,h(`colorsUnassignedNumber`).innerHTML=String(h(`colorsUnassignedContainer`).childElementCount-2),h(`colorsAssignedNumber`).innerHTML=String(h(`colorsAssignedContainer`).childElementCount-2))}function Y(e){let n=h(`colorsUnassignedContainer`),r=n.querySelectorAll(`div`);if(!r.length&&(J(+h(`convertColors`).value),r=n.querySelectorAll(`div`),!r.length)){S(`No unassigned colors. Please load an image and click the button again`,!1,`error`);return}let i=e=>{let t=x(e).h;return t>300&&(t-=360),t>170?Math.abs(t-250)/3|0:Math.abs(t-250+20)/3|0},a=e=>{let t=Oe(e).l;return t<13?t/13*20|0:t|0},o=t(101).map(e=>Ue(e)),s=o.map(e=>x(e).h|0),c=e=>{let t=o.indexOf(e);if(t!==-1)return t;let n=x(e).h,r=s.reduce((e,t)=>Math.abs(t-n)<Math.abs(e-n)?t:e);return s.indexOf(r)},l=[],u=h(`colorsAssignedContainer`);r.forEach(t=>{let n=t.dataset.color,r=e===`hue`?i(n):e===`lum`?a(n):c(n),o=color(1-(r<20?(r-5)/100:r/100));if(m(`#viewbox`).select(`#heights`).selectAll(`polygon[fill='${n}']`).attr(`fill`,o).attr(`data-height`,r),l[r]){t.remove();return}t.style.backgroundColor=t.dataset.color=o,t.dataset.height=String(r),u.appendChild(t),l[r]=!0}),Array.from(u.children).sort((e,t)=>e.dataset.height-+t.dataset.height).forEach(e=>{u.appendChild(e)}),h(`colorsAssigned`).style.display=`block`,h(`colorsUnassigned`).style.display=`none`,h(`colorsAssignedNumber`).innerHTML=String(u.childElementCount-2)}function Ct(){prompt(`Please set maximum number of colors. <br>An actual number is usually lower and depends on color scheme`,{default:+h(`convertColors`).value,step:1,min:3,max:255},e=>{h(`convertColors`).value=String(e),J(+e)})}function X(e){h(`convertOverlay`).value=h(`convertOverlayNumber`).value=String(e),h(`canvas`).style.opacity=String(e)}function wt(){if(h(`colorsAssignedContainer`).childElementCount<3){S(`Please assign colors to heights first`,!1,`error`);return}m(`#viewbox`).select(`#heights`).selectAll(`polygon`).each(function(){let e=+(this.dataset.height??`0`)||0,t=+this.id.slice(4);grid.cells.h[t]=e}),m(`#viewbox`).select(`#heights`).selectAll(`polygon`).remove(),R(),Z()}function Tt(){Z(),m(`#viewbox`).select(`#heights`).selectAll(`polygon`).remove(),W(edits.n-1)}function Z(){document.getElementById(`canvas`)?.remove(),document.getElementById(`imageToConvert`)?.remove(),m(`#imageConverter`).selectAll(`div.color-div`).remove(),h(`colorsAssigned`).style.display=`none`,h(`colorsUnassigned`).style.display=`none`,h(`colorsSelectValue`).innerHTML=h(`colorsSelectFriendly`).innerHTML=`0`,m(`#viewbox`).style(`cursor`,`default`).on(`.drag`,null),S(`Heightmap edit mode is active. Click on "Exit Customization" to finalize the heightmap`,!0),$(`#imageConverter`).dialog(`destroy`),h(`imageConverter`).remove(),G()}function Et(e){e.preventDefault(),e.stopPropagation(),alertMessage.innerHTML=`Are you sure you want to close the Image Converter? Click "Cancel" to keep editing. Click "Complete" to apply
  the conversion and close the tool. Click "Close" to discard the conversion and restore the previous heightmap.`,$(`#alert`).dialog({resizable:!1,title:`Close Image Converter`,buttons:{Cancel:function(){$(this).dialog(`close`)},Complete:function(){$(this).dialog(`close`),wt()},Close:function(){$(this).dialog(`close`),Z(),m(`#viewbox`).select(`#heights`).selectAll(`polygon`).remove(),W(edits.n-1)}}})}function Dt(){let e=document.getElementById(`preview`);if(e){e.remove();return}let t=document.createElement(`canvas`);t.id=`preview`,t.width=grid.cellsX,t.height=grid.cellsY,document.body.insertBefore(t,h(`optionsContainer`)),t.addEventListener(`mouseover`,()=>S(`Heightmap preview. Click to download a screen-sized image`)),t.addEventListener(`click`,Ot),Q()}function Q(){let e=document.getElementById(`preview`).getContext(`2d`),t=e.createImageData(grid.cellsX,grid.cellsY);grid.cells.h.forEach((e,n)=>{let r=(e<20?Math.max(e/1.5,0):e)/100*255,i=n*4;t.data[i]=r,t.data[i+1]=r,t.data[i+2]=r,t.data[i+3]=255}),e.putImageData(t,0,0)}function Ot(){let e=document.getElementById(`preview`).toDataURL(`image/png`),t=new Image;t.src=e,t.onload=()=>{let e=document.createElement(`canvas`),n=e.getContext(`2d`);e.width=graphWidth,e.height=graphHeight,document.body.insertBefore(e,h(`optionsContainer`)),n.drawImage(t,0,0,graphWidth,graphHeight);let r=e.toDataURL(`image/png`),i=document.createElement(`a`);i.download=`${p(`Heightmap`)}.png`,i.href=r,i.click(),e.remove()}}var kt={open:Me};export{kt as HeightmapEditor};