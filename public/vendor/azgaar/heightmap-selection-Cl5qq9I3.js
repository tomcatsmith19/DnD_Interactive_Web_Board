import{Et as e,F as t,H as n,U as r,V as i,k as a}from"./utils-BYaxf2yO.js";import{At as o,D as s,O as c,W as l,kt as u}from"./index-DqeJMjPz.js";var d=e(),f=x(grid);m(),h(),g();function p(){u(`.stable`);let e=r(`templateInput`);v(e.value),f=x(f),$(`#heightmapSelection`).dialog({title:`Select Heightmap`,resizable:!1,position:{my:`center`,at:`center`,of:`svg`},buttons:{Cancel:function(){$(this).dialog(`close`)},Select:function(){let t=_();t&&(n(e,t,b(t)),l(`template`),$(this).dialog(`close`))},"New Map":function(){let t=_();if(!t)return;n(e,t,b(t)),l(`template`);let r=y();regeneratePrompt({seed:r,graph:f}),$(this).dialog(`close`)}}})}function m(){let e=document.createElement(`style`);e.textContent=`
    div.dialog > div.heightmap-selection {
      width: 70vw;
      height: 70vh;
    }

    .heightmap-selection_container {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
      grid-gap: 6px;
    }

    @media (max-width: 600px) {
      .heightmap-selection_container {
        grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
        grid-gap: 4px;
      }
    }

    @media (min-width: 2000px) {
      .heightmap-selection_container {
        grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
        grid-gap: 8px;
      }
    }

    .heightmap-selection_options {
      display: grid;
      grid-template-columns: 2fr 1fr;
    }

    .heightmap-selection_options > div:first-child {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      align-items: center;
      justify-self: start;
      justify-items: start;
    }

    @media (max-width: 600px) {
      .heightmap-selection_options {
        grid-template-columns: 3fr 1fr;
      }

      .heightmap-selection_options > div:first-child {
        display: block;
      }
    }

    .heightmap-selection_options > div:last-child {
      justify-self: end;
    }

    .heightmap-selection article {
      padding: 4px;
      border-radius: 8px;
      transition: all 0.1s ease-in-out;
      filter: drop-shadow(1px 1px 4px #999);
    }

    .heightmap-selection article:hover {
      background-color: #ddd;
      filter: drop-shadow(1px 1px 8px #999);
      cursor: pointer;
    }

    .heightmap-selection article.selected {
      background-color: #ccc;
      outline: 1px solid var(--dark-solid);
      filter: drop-shadow(1px 1px 8px #999);
    }

    .heightmap-selection article > div {
      display: flex;
      justify-content: space-between;
      padding: 2px 1px;
    }

    .heightmap-selection article > img {
      width: 100%;
      aspect-ratio: ${graphWidth}/${graphHeight};
      border-radius: 8px;
      object-fit: fill;
    }

    .heightmap-selection article .regeneratePreview {
      outline: 1px solid #bbb;
      padding: 1px 3px;
      border-radius: 4px;
      transition: all 0.1s ease-in-out;
    }

    .heightmap-selection article .regeneratePreview:hover {
      outline: 1px solid #666;
    }

    .heightmap-selection article .regeneratePreview:active {
      outline: 1px solid #333;
      color: #000;
      transform: rotate(45deg);
    }
  `,document.head.appendChild(e)}function h(){let e=`<div id="heightmapSelection" class="dialog stable">
    <div class="heightmap-selection">
      <section data-tip="Select heightmap template – template provides unique, but similar-looking maps on generation">
        <header><h1>Heightmap templates</h1></header>
        <div class="heightmap-selection_container"></div>
      </section>
      <section data-tip="Select precreated heightmap – it will be the same for each map">
        <header><h1>Precreated heightmaps</h1></header>
        <div class="heightmap-selection_container"></div>
      </section>
      <section>
        <header><h1>Options</h1></header>
        <div class="heightmap-selection_options">
          <div>
            <label data-tip="Rerender all preview images" class="checkbox-label" id="heightmapSelectionRedrawPreview">
              <i class="icon-cw"></i>
              Redraw preview
            </label>
            <div>
              <input id="heightmapSelectionRenderOcean" class="checkbox" type="checkbox" />
              <label data-tip="Draw heights of water cells" for="heightmapSelectionRenderOcean" class="checkbox-label">Render ocean heights</label>
            </div>
            <div data-tip="Color scheme used for heightmap preview">
              Color scheme
              <select id="heightmapSelectionColorScheme">${Object.keys(heightmapColorSchemes).map(e=>`<option value="${e}">${e}</option>`).join(``)}</select>
            </div>
          </div>
          <div>
            <button data-tip="Open Template Editor" data-tool="templateEditor" id="heightmapSelectionEditTemplates">Edit Templates</button>
            <button data-tip="Open Image Converter" data-tool="imageConverter" id="heightmapSelectionImportHeightmap">Import Heightmap</button>
          </div>
        </div>
      </section>
    </div>
  </div>`;r(`dialogs`).insertAdjacentHTML(`beforeend`,e);let t=document.getElementsByClassName(`heightmap-selection_container`);t[0].innerHTML=Object.keys(c).map(e=>{let t=c[e].name;return Math.random=aleaPRNG(d),`<article data-id="${e}" data-seed="${d}">
        <img src="${D(HeightmapGenerator.fromTemplate(f,e))}" alt="${t}" />
        <div>
          ${t}
          <span data-tip="Regenerate preview" class="icon-cw regeneratePreview"></span>
        </div>
      </article>`}).join(``),t[1].innerHTML=Object.keys(s).map(e=>{let t=s[e].name;return C(e),`<article data-id="${e}" data-seed="${d}">
        <img alt="${t}" />
        <div>${t}</div>
      </article>`}).join(``)}function g(){r(`heightmapSelection`).addEventListener(`click`,e=>{let t=e.target,n=t.closest(`#heightmapSelection article`);if(!n)return;let r=n.dataset.id;r&&(t.matches(`span.icon-cw`)&&w(n,r),v(r))}),r(`heightmapSelectionRenderOcean`).addEventListener(`change`,T),r(`heightmapSelectionColorScheme`).addEventListener(`change`,T),r(`heightmapSelectionRedrawPreview`).addEventListener(`click`,T),r(`heightmapSelectionEditTemplates`).addEventListener(`click`,e=>E(e.currentTarget)),r(`heightmapSelectionImportHeightmap`).addEventListener(`click`,e=>E(e.currentTarget))}function _(){return r(`heightmapSelection`).querySelector(`.selected`)?.dataset?.id}function v(e){let t=r(`heightmapSelection`);t.querySelector(`.selected`)?.classList?.remove(`selected`),t.querySelector(`[data-id="${e}"]`)?.classList?.add(`selected`)}function y(){return r(`heightmapSelection`).querySelector(`.selected`)?.dataset?.seed}function b(e){return e in c?c[e].name:s[e].name}function x(e){let n=i(e,seed,graphWidth,graphHeight)?t(seed,graphWidth,graphHeight):structuredClone(e);return delete n.cells.h,n}function S(e){let t=D(HeightmapGenerator.fromTemplate(f,e));r(`heightmapSelection`).querySelector(`[data-id="${e}"]`)?.querySelector(`img`)?.setAttribute(`src`,t)}async function C(e){let t=D(await HeightmapGenerator.fromPrecreated(f,e));r(`heightmapSelection`).querySelector(`[data-id="${e}"]`)?.querySelector(`img`)?.setAttribute(`src`,t)}function w(t,n){f=x(f);let r=e();t.dataset.seed=r,Math.random=aleaPRNG(r),S(n)}function T(){f=x(f);let e=r(`heightmapSelection`).querySelectorAll(`article`);for(let t of e){let{id:e,seed:n}=t.dataset;!e||!n||(Math.random=aleaPRNG(n),e in c?S(e):C(e))}}function E(e){let t=e.dataset.tool;t&&o({title:e.dataset.tip??``,message:`Opening the tool will erase the current map. Are you sure you want to proceed?`,confirm:`Continue`,onConfirm:()=>window.Controllers.HeightmapEditor.open({mode:`erase`,tool:t})})}function D(e){let t=getColorScheme(r(`heightmapSelectionColorScheme`).value),n=r(`heightmapSelectionRenderOcean`).checked;return a({heights:e,width:f.cellsX,height:f.cellsY,scheme:t,renderOcean:n})}var O={open:p};export{O as HeightmapSelection};