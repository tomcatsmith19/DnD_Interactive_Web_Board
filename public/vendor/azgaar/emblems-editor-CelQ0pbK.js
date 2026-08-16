import{Ft as e,S as t,Sn as n,U as r,it as i,x as a}from"./utils-BYaxf2yO.js";import{r as o,t as s}from"./tooltips-CSQuPvuv.js";import{Wt as c,Yt as l,jt as u}from"./index-DqeJMjPz.js";var d,f,p;async function m(){let e=pack.states.find(e=>e.i&&!e.removed&&e.coa),t=pack.burgs.find(e=>e.i&&!e.removed&&e.coa),n=e?`state`:`burg`,r=e??t;if(!r?.coa){o(`No emblems to edit, please generate states and burgs first`,!1,`error`);return}let i=`${n}COA${r.i}`;await COArenderer.trigger(i,r.coa),h(n,i,r)}function h(e,t,r,i){customization||(!t&&i?_(i):(d=e,f=t,p=r),g(),n(`#emblems`).selectAll(`use`).call(l().on(`drag`,R)).classed(`draggable`,!0),v(),$(`#emblemEditor`).dialog({title:`Edit Emblem`,resizable:!0,width:`18.2em`,height:`auto`,position:{my:`left top`,at:`left+10 top+10`,of:`svg`,collision:`fit`},close:z}))}function g(){u(`emblemEditor`),r(`dialogs`).insertAdjacentHTML(`beforeend`,`<div id="emblemEditor" class="dialog stable">
      <svg viewBox="0 0 200 200"><use id="emblemImage"></use></svg>
      <div id="emblemBody">
        <div>
          <b id="emblemArmiger"></b>
        </div>
        <hr />
        <div data-tip="Select state">
          <div class="label">State:</div>
          <select id="emblemStates"></select>
        </div>
        <div data-tip="Select province in state">
          <div class="label">Province:</div>
          <select id="emblemProvinces"></select>
        </div>
        <div data-tip="Select burg in province or state">
          <div class="label">Burg:</div>
          <select id="emblemBurgs"></select>
        </div>
        <hr />
        <div data-tip="Select shape of the emblem">
          <div class="label">Shape:</div>
          <select id="emblemShapeSelector">
            <optgroup label="Basic">
              <option value="heater">Heater</option>
              <option value="spanish">Spanish</option>
              <option value="french">French</option>
            </optgroup>
            <optgroup label="Regional">
              <option value="horsehead">Horsehead</option>
              <option value="horsehead2">Horsehead Edgy</option>
              <option value="polish">Polish</option>
              <option value="hessen">Hessen</option>
              <option value="swiss">Swiss</option>
            </optgroup>
            <optgroup label="Historical">
              <option value="boeotian">Boeotian</option>
              <option value="roman">Roman</option>
              <option value="kite">Kite</option>
              <option value="oldFrench">Old French</option>
              <option value="renaissance">Renaissance</option>
              <option value="baroque">Baroque</option>
            </optgroup>
            <optgroup label="Specific">
              <option value="targe">Targe</option>
              <option value="targe2">Targe2</option>
              <option value="pavise">Pavise</option>
              <option value="wedged">Wedged</option>
            </optgroup>
            <optgroup label="Banner">
              <option value="flag">Flag</option>
              <option value="pennon">Pennon</option>
              <option value="guidon">Guidon</option>
              <option value="banner">Banner</option>
              <option value="dovetail">Dovetail</option>
              <option value="gonfalon">Gonfalon</option>
              <option value="pennant">Pennant</option>
            </optgroup>
            <optgroup label="Simple">
              <option value="round">Round</option>
              <option value="oval">Oval</option>
              <option value="vesicaPiscis">Vesica Piscis</option>
              <option value="square">Square</option>
              <option value="diamond">Diamond</option>
            </optgroup>
            <optgroup label="Fantasy">
              <option value="fantasy1">Fantasy1</option>
              <option value="fantasy2">Fantasy2</option>
              <option value="fantasy3">Fantasy3</option>
              <option value="fantasy4">Fantasy4</option>
              <option value="fantasy5">Fantasy5</option>
            </optgroup>
            <optgroup label="Middle Earth">
              <option value="noldor">Noldor</option>
              <option value="gondor">Gondor</option>
              <option value="easterling">Easterling</option>
              <option value="erebor">Erebor</option>
              <option value="ironHills">Iron Hills</option>
              <option value="urukHai">UrukHai</option>
              <option value="moriaOrc">Moria Orc</option>
            </optgroup>
          </select>
        </div>
        <div
          data-tip="Set size of particular Emblem. To hide set to 0. To change the entire category go to Menu ⭢ Style ⭢ Emblems"
        >
          <div class="label" style="width: 2.8em">Size:</div>
          <input id="emblemSizeSlider" type="range" min="0" max="5" step=".1" style="width: 7em" />
          <input id="emblemSizeNumber" type="number" min="0" max="5" step=".1" />
        </div>
      </div>
      <div id="emblemsBottom">
        <button id="emblemsRegenerate" data-tip="Regenerate emblem" class="icon-shuffle"></button>
        <button
          id="emblemsArmoria"
          data-tip="Edit the emblem in Armoria - dedicated heraldry editor. Download emblem and upload it back map the generator"
          class="icon-brush"
        ></button>
        <button
          id="emblemsDownload"
          data-tip="Set size, select file format and download emblem image"
          class="icon-download"
        ></button>
        <button
          id="emblemsUpload"
          data-tip="Upload png, jpg or svg image from Armoria or other sources as emblem"
          class="icon-upload"
        ></button>
        <button
          id="emblemsGallery"
          data-tip="Download emblems gallery as html document (open in browser; downloading takes some time)"
          class="icon-layer-group"
        ></button>
        <button id="emblemsFocus" data-tip="Show emblem associated area or place" class="icon-target"></button>
      </div>
      <div id="emblemUploadControl" class="hidden">
        <button
          id="emblemsUploadImage"
          data-tip="Upload SVG or PNG image from any source. Make sure background is transparent"
        >
          Any image
        </button>
        <button
          id="emblemsUploadSVG"
          data-tip="Upload prepared SVG image (SVG from Armoria or SVG processed with 'Optimize vector' tool)"
        >
          Prepared SVG
        </button>
        <a
          href="https://www.iloveimg.com/compress-image"
          target="_blank"
          data-tip="Use external tool to compress/resize raster images before upload"
          >Comperess raster</a
        >
        <span> | </span>
        <a
          href="https://jakearchibald.github.io/svgomg"
          target="_blank"
          data-tip="Use external tool to optimize vector images before upload"
          >Optimize vector</a
        >
      </div>
      <div id="emblemDownloadControl" class="hidden">
        <input
          id="emblemsDownloadSize"
          data-tip="Set image size in pixels"
          type="number"
          value="500"
          step="100"
          min="100"
          max="10000"
        />
        <button
          id="emblemsDownloadSVG"
          data-tip="Download as SVG: scalable vector image. Best quality, can be opened in browser or Inkscape"
        >
          SVG
        </button>
        <button id="emblemsDownloadPNG" data-tip="Download as PNG: lossless raster image with transparent background">
          PNG
        </button>
        <button
          id="emblemsDownloadJPG"
          data-tip="Download as JPG: lossy compressed raster image with solid white background"
        >
          JPG
        </button>
      </div>
    </div>`),r(`emblemStates`).oninput=b,r(`emblemProvinces`).oninput=x,r(`emblemBurgs`).oninput=S,r(`emblemShapeSelector`).oninput=C,r(`emblemSizeSlider`).oninput=T,r(`emblemSizeNumber`).oninput=T,r(`emblemsRegenerate`).onclick=E,r(`emblemsArmoria`).onclick=D,r(`emblemsUpload`).onclick=O,r(`emblemsUploadImage`).onclick=()=>r(`emblemImageToLoad`).click(),r(`emblemsUploadSVG`).onclick=()=>r(`emblemSVGToLoad`).click(),r(`emblemImageToLoad`).onchange=()=>k(`image`),r(`emblemSVGToLoad`).onchange=()=>k(`svg`),r(`emblemsDownload`).onclick=A,r(`emblemsDownloadSVG`).onclick=()=>j(`svg`),r(`emblemsDownloadPNG`).onclick=()=>j(`png`),r(`emblemsDownloadJPG`).onclick=()=>j(`jpeg`),r(`emblemsGallery`).onclick=I,r(`emblemsFocus`).onclick=w}function _(e){let t=e.parentNode,[n,r]=t.id===`burgEmblems`?[pack.burgs,`burg`]:t.id===`provinceEmblems`?[pack.provinces,`province`]:[pack.states,`state`],i=+e.dataset.i;d=r,f=`${d}COA${i}`,p=n[i]}function v(){let e=d,t=p,n=r(`emblemStates`),i=r(`emblemProvinces`),a=r(`emblemBurgs`),o=0,s=0,c=0;n.parentElement.className=e===`state`?`active`:``,i.parentElement.className=e===`province`?`active`:``,a.parentElement.className=e===`burg`?`active`:``,e===`state`?o=t.i:e===`province`?(s=t.i,o=pack.states[t.state].i):(c=t.i,s=pack.cells.province[t.cell]?pack.provinces[pack.cells.province[t.cell]].i:0,o=t.state);let l=pack.burgs.filter(e=>e.i&&!e.removed&&e.coa);n.options.length=0,l.filter(e=>!e.state).length&&n.options.add(new Option(pack.states[0].name,`0`,!1,!o)),pack.states.filter(e=>e.i&&!e.removed).forEach(e=>{n.options.add(new Option(e.name,String(e.i),!1,e.i===o))}),i.options.length=0,i.options.add(new Option(``,`0`,!1,!s)),pack.provinces.filter(e=>!e.removed&&e.state===o).forEach(e=>{i.options.add(new Option(e.name,String(e.i),!1,e.i===s))}),a.options.length=0,a.options.add(new Option(``,`0`,!1,!c)),l.filter(e=>s?pack.cells.province[e.cell]===s:e.state===o).forEach(e=>{a.options.add(new Option(e.capital?`👑 ${e.name}`:e.name,String(e.i),!1,e.i===c))}),a.options[0].disabled=!0,COArenderer.trigger(f,t.coa),y()}function y(){let e=p;if(!e.coa)return;r(`emblemImage`).setAttribute(`href`,`#${f}`);let t=e.fullName||e.name;d===`burg`&&(t=`Burg of ${t}`),r(`emblemArmiger`).innerText=t;let n=r(`emblemShapeSelector`);e.coa.custom?n.disabled=!0:(n.disabled=!1,n.value=e.coa.shield);let i=e.coa.size||1;r(`emblemSizeSlider`).value=i,r(`emblemSizeNumber`).value=i}function b(){let e=+r(`emblemStates`).value;if(e)d=`state`,p=pack.states[e],f=`stateCOA${e}`;else{let e=pack.burgs.filter(e=>e.i&&!e.removed&&!e.state);if(!e.length)return;d=`burg`,p=e[0],f=`burgCOA${e[0].i}`}v()}function x(){let e=+r(`emblemProvinces`).value;if(e)d=`province`,p=pack.provinces[e],f=`provinceCOA${e}`;else{let e=+r(`emblemStates`).value;d=`state`,p=pack.states[e],f=`stateCOA${e}`}v()}function S(){let e=+r(`emblemBurgs`).value;d=`burg`,p=pack.burgs[e],f=`burgCOA${e}`,v()}function C(){p.coa.shield=r(`emblemShapeSelector`).value;let e=document.getElementById(f);e&&e.remove(),COArenderer.trigger(f,p.coa)}function w(){c(d,p)}function T(t){let i=+t.currentTarget.value;p.coa.size=i,r(`emblemSizeSlider`).value=String(i),r(`emblemSizeNumber`).value=String(i);let a=n(`#emblems`).select(`#${d}Emblems`);if(a.select(`[data-i='${p.i}']`).remove(),!i)return;let o=+a.attr(`font-size`)*i/2,s=p.coa.x||p.x||p.pole[0],c=p.coa.y||p.y||p.pole[1];a.append(`use`).attr(`data-i`,p.i).attr(`x`,e(s-o,2)).attr(`y`,e(c-o,2)).attr(`width`,`${i}em`).attr(`height`,`${i}em`).attr(`href`,`#${f}`)}function E(){let e=p,t=null;if(d===`province`)t=pack.states[e.state];else if(d===`burg`){let n=pack.cells.province[e.cell];t=n?pack.provinces[n]:pack.states[e.state]}let n=e.coa.shield||COA.getShield(e.culture||t?.culture||0,e.state);e.coa=COA.generate(t?t.coa:null,.3,.1,void 0),e.coa.shield=n;let i=r(`emblemShapeSelector`);i.disabled=!1,i.value=e.coa.shield;let a=document.getElementById(f);a&&a.remove(),COArenderer.trigger(f,e.coa)}function D(){let e=p.coa&&!p.coa.custom?p.coa:{t1:`sable`};i(`https://azgaar.github.io/Armoria/?coa=${JSON.stringify(e).replaceAll(`#`,`%23`)}&from=FMG`)}function O(){r(`emblemDownloadControl`).classList.add(`hidden`),r(`emblemUploadControl`).classList.toggle(`hidden`)}function k(e){let t=p,n=r(e===`image`?`emblemImageToLoad`:`emblemSVGToLoad`),i=n.files[0];if(n.value=``,i.size>5e5){o(`File is too big, please optimize file size up to 500kB and re-upload. Recommended size is 200x200 px and up to 100kB`,!0,`error`,5e3);return}let a=new FileReader;a.onload=n=>{let i=n.target.result,a=r(`defs-emblems`),s=document.getElementById(f),c=i;if(e===`svg`){let e=document.createElement(`html`);e.innerHTML=i,e.querySelectorAll(`*`).forEach(e=>{e.id===`adobe_illustrator_pgf`&&e.remove(),e.getAttributeNames().forEach(t=>{(t.includes(`inkscape`)||t.includes(`sodipodi`))&&e.removeAttribute(t)})});let t=e.querySelector(`svg`);if(!t){o(`The file is not a valid SVG. Please use Armoria or other relevant tools`,!1,`error`);return}let n=new XMLSerializer().serializeToString(t);c=`data:image/svg+xml;base64,${window.btoa(n)}`}let l=`<svg id="${f}" viewBox="0 0 200 200"><image width="200" height="200" href="${c}"/></svg>`;a.insertAdjacentHTML(`beforeend`,l),s&&s.remove();let u={custom:!0};t.coa.size&&(u.size=t.coa.size),t.coa.x&&(u.x=t.coa.x),t.coa.y&&(u.y=t.coa.y),t.coa=u,r(`emblemShapeSelector`).disabled=!0},e===`image`?a.readAsDataURL(i):a.readAsText(i)}function A(){r(`emblemUploadControl`).classList.add(`hidden`),r(`emblemDownloadControl`).classList.toggle(`hidden`)}async function j(e){let n=document.getElementById(f),i=+r(`emblemsDownloadSize`).value,a=await P(n,i),o=document.createElement(`a`);o.download=`${t(`Emblem ${p.fullName||p.name}`)}.${e}`,e===`svg`?M(a,o):N(e,a,o,i),r(`emblemDownloadControl`).classList.add(`hidden`)}function M(e,t){t.href=e,t.click()}function N(e,t,n,r){let i=document.createElement(`canvas`),a=i.getContext(`2d`);i.width=r,i.height=r;let o=new Image;o.src=t,o.onload=()=>{e===`jpeg`&&(a.fillStyle=`#fff`,a.fillRect(0,0,i.width,i.height)),a.drawImage(o,0,0,i.width,i.height);let t=i.toDataURL(`image/${e}`,.92);n.href=t,n.click(),window.setTimeout(()=>window.URL.revokeObjectURL(t),6e3)}}async function P(e,t){let n=F(e,t),r=new Blob([n],{type:`image/svg+xml;charset=utf-8`}),i=window.URL.createObjectURL(r);return window.setTimeout(()=>window.URL.revokeObjectURL(i),6e3),i}function F(e,t){let n=e.cloneNode(!0);return n.setAttribute(`width`,String(t)),n.setAttribute(`height`,String(t)),new XMLSerializer().serializeToString(n)}async function I(){let e=t(`Emblems Gallery`),n=pack.states.filter(e=>e.i&&!e.removed&&e.coa),r=pack.provinces.filter(e=>e.i&&!e.removed&&e.coa),i=pack.burgs.filter(e=>e.i&&!e.removed&&e.coa);await L(n,r,i);let o=`<a href="javascript:history.back()">Go Back</a>`,s=`<div><h2>States</h2>${n.map(e=>{let t=document.getElementById(`stateCOA${e.i}`);return`<figure id="state_${e.i}"><a href="#provinces_${e.i}"><figcaption>${e.fullName}</figcaption>${F(t,200)}</a></figure>`}).join(``)}</div>`,c=n.map(e=>{let t=r.filter(t=>t.state===e.i),n=t.map(e=>{let t=document.getElementById(`provinceCOA${e.i}`);return`<figure id="province_${e.i}"><a href="#burgs_${e.i}"><figcaption>${e.fullName}</figcaption>${F(t,200)}</a></figure>`}).join(``);return t.length?`<div id="provinces_${e.i}">${o}<h2>${e.fullName} provinces</h2>${n}</div>`:``}).join(``),l=n.map(e=>{let t=i.filter(t=>t.state===e.i),n=r.filter(t=>t.state===e.i).map(e=>{let n=t.filter(t=>pack.cells.province[t.cell]===e.i),r=n.map(e=>{let t=document.getElementById(`burgCOA${e.i}`);return t?`<figure id="burg_${e.i}"><figcaption>${e.name}</figcaption>${F(t,200)}</figure>`:``}).join(``);return n.length?`<div id="burgs_${e.i}">${o}<h2>${e.fullName} burgs</h2>${r}</div>`:``}).join(``),a=t.filter(e=>!pack.cells.province[e.cell]).map(e=>{let t=document.getElementById(`burgCOA${e.i}`);return t?`<figure id="burg_${e.i}"><figcaption>${e.name}</figcaption>${F(t,200)}</figure>`:``}).join(``);return a&&(n+=`<div><h2>${e.fullName} burgs under direct control</h2>${a}</div>`),n}).join(``),u=i.filter(e=>!e.state),d=u.length?`<div><h2>Independent burgs</h2>${u.map(e=>{let t=document.getElementById(`burgCOA${e.i}`);return t?`<figure id="burg_${e.i}"><figcaption>${e.name}</figcaption>${F(t,200)}</figure>`:``}).join(``)}</div>`:``;a(`<!DOCTYPE html>
    <html>
      <head>
        <title>${mapName.value} Emblems Gallery</title>
      </head>
      <style type="text/css">
        body { margin: 0; padding: 1em; font-family: serif; }
        h1, h2 { font-family: "Forum"; }
        div { width: 100%; max-width: 1018px; margin: 0 auto; border-bottom: 1px solid #ddd; }
        figure { margin: 0 0 2em; display: inline-block; transition: 0.2s; }
        figure:hover { background-color: #f6f6f6; }
        figcaption { text-align: center; margin: 0.4em 0; width: 200px; font-family: "Overlock SC"; }
        address { width: 100%; max-width: 1018px; margin: 0 auto; }
        a { color: black; }
        figure > a { text-decoration: none; }
        div > a { float: right; font-family: var(--monospace); margin-top: 0.8em; }
      </style>
      <link href="https://fonts.googleapis.com/css2?family=Forum&family=Overlock+SC" rel="stylesheet" />
      <body>
        <div><h1>${mapName.value} Emblems Gallery</h1></div>
        ${s} ${c} ${l} ${d}
        <address>Generated by <a href="https://azgaar.github.io/Fantasy-Map-Generator" target="_blank">Azgaar's Fantasy Map Generator</a>. The tool is free, but images may be copyrighted, see <a target="_blank" href="https://github.com/Azgaar/Armoria#license">the license</a></address>
      </body>
    </html>`,`${e}.html`,`text/plain`)}async function L(e,t,n){o(`Preparing for download...`,!0,`warn`);let r=e.map(e=>COArenderer.trigger(`stateCOA${e.i}`,e.coa)),i=t.map(e=>COArenderer.trigger(`provinceCOA${e.i}`,e.coa)),a=n.map(e=>COArenderer.trigger(`burgCOA${e.i}`,e.coa)),c=[...r,...i,...a];await Promise.allSettled(c),s()}function R(t){let n=Number(this.getAttribute(`x`))-t.x,r=Number(this.getAttribute(`y`))-t.y;t.on(`drag`,function(e){this.setAttribute(`x`,String(n+e.x)),this.setAttribute(`y`,String(r+e.y))}),t.on(`end`,function(t){let i=Number(this.parentNode.getAttribute(`font-size`))*(p.coa.size||1)/2;p.coa.x=e(n+t.x+i,2),p.coa.y=e(r+t.y+i,2)})}function z(){n(`#emblems`).selectAll(`use`).call(l().on(`drag`,null)).attr(`class`,null),$(`#emblemEditor`).dialog(`destroy`),r(`emblemEditor`).remove()}var B={open:h,openDefault:m};export{B as EmblemsEditor};