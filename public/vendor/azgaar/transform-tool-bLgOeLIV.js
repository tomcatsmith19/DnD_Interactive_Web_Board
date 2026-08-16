import{Ft as e,U as t}from"./utils-BYaxf2yO.js";import{jt as n,m as r}from"./index-DqeJMjPz.js";var i=!1,a=0,o=0;function s(){c(),l(),d(),$(`#transformTool`).dialog({title:`Transform map`,resizable:!1,position:{my:`center`,at:`center`,of:`svg`},close:u,buttons:{Transform:function(){v(),$(this).dialog(`close`)},Cancel:function(){$(this).dialog(`close`)}}})}function c(){n(`transformTool`);let e=t(`pointsInput`).value,r=cellsDensityMap[+e],i=`<div id="transformTool" class="dialog">
    <div style="padding-top: 0.5em; width: 40em; font-weight: bold">
      This operation is destructive and irreversible. It will create a completely new map based on the current one.
      Don't forget to save the .map file to your machine first!
    </div>
    <div
      id="transformToolBody"
      style="
        padding: 0.5em 0;
        width: 100%;
        display: grid;
        grid-template-columns: 1fr 1fr;
        grid-template-rows: repeat(5, 1fr);
        align-items: center;
      "
    >
      <div>Points number</div>
      <div>
        <input id="transformPointsInput" type="range" min="1" max="13" value="${e}" />
        <output id="transformPointsFormatted" style="color: ${getCellsDensityColor(r)}">${r/1e3}K</output>
      </div>
      <div>Shift</div>
      <div>
        <label>X: <input id="transformShiftX" type="number" size="4" value="0" /></label>
        <label>Y: <input id="transformShiftY" type="number" size="4" value="0" /></label>
      </div>
      <div>Rotate</div>
      <div>
        <input id="transformAngleInput" type="range" min="0" max="359" value="0" />
        <output id="transformAngleOutput">0</output>°
      </div>
      <div>Scale</div>
      <div>
        <input id="transformScaleInput" type="range" min="-25" max="25" value="0" />
        <output id="transformScaleResult">1</output>x
      </div>
      <div>Mirror</div>
      <div style="display: flex; gap: 0.5em">
        <input type="checkbox" class="checkbox" id="transformMirrorH" />
        <label for="transformMirrorH" class="checkbox-label">horizontally</label>
        <input type="checkbox" class="checkbox" id="transformMirrorV" />
        <label for="transformMirrorV" class="checkbox-label">vertically</label>
      </div>
    </div>
    <div id="transformPreview" style="position: relative; overflow: hidden; outline: 1px solid #666">
      <canvas id="transformPreviewCanvas" style="position: absolute; transform-origin: center"></canvas>
    </div>
  </div>`;t(`dialogs`).insertAdjacentHTML(`beforeend`,i)}function l(){t(`transformToolBody`).addEventListener(`input`,p),t(`transformPointsInput`).oninput=f;let e=t(`transformPreview`);e.addEventListener(`mousedown`,m),e.addEventListener(`mouseup`,h),e.addEventListener(`mousemove`,g),e.addEventListener(`wheel`,_)}function u(){i=!1,n(`transformTool`)}async function d(){let e=Math.min(400,window.innerWidth*.5),n=e/graphWidth,r=graphHeight*n;t(`transformPreview`).style.width=`${e}px`,t(`transformPreview`).style.height=`${r}px`;let i=await window.Services.ExportMap.getMapURL(`png`,{noWater:!0,fullMap:!0,noLabels:!0,noScaleBar:!0,noVignette:!0,noIce:!0}),a=new Image;a.src=i,a.onload=()=>{let n=t(`transformPreviewCanvas`);n.style.width=`${e}px`,n.style.height=`${r}px`,n.width=e*4,n.height=r*4,n.getContext(`2d`)?.drawImage(a,0,0,e*4,r*4)}}function f(e){let n=cellsDensityMap[+e.target.value],r=t(`transformPointsFormatted`);r.value=`${n/1e3}K`,r.style.color=getCellsDensityColor(n)}function p(){let n=Math.min(400,window.innerWidth*.5)/graphWidth,r=t(`transformAngleInput`).value;t(`transformAngleOutput`).value=r;let i=r/180*Math.PI,a=+t(`transformShiftX`).value,o=+t(`transformShiftY`).value,s=t(`transformMirrorH`).checked,c=t(`transformMirrorV`).checked,l=e(1.0965**t(`transformScaleInput`).value,2);t(`transformScaleResult`).value=String(l),t(`transformPreviewCanvas`).style.transform=`
    translate(${a*n}px, ${o*n}px)
    scale(${s?-l:l}, ${c?-l:l})
    rotate(${i}rad)
  `}function m(e){let n=Math.min(400,window.innerWidth*.5)/graphWidth;i=!0;let r=+t(`transformShiftX`).value,s=+t(`transformShiftY`).value;a=r-e.clientX/n,o=s-e.clientY/n}function h(){i=!1}function g(e){if(!i)return;e.preventDefault();let n=Math.min(400,window.innerWidth*.5)/graphWidth;t(`transformShiftX`).value=String(Math.round(a+e.clientX/n)),t(`transformShiftY`).value=String(Math.round(o+e.clientY/n)),p()}function _(e){let n=t(`transformScaleInput`);n.value=String(n.valueAsNumber-Math.sign(e.deltaY)),p()}function v(){INFO&&console.group(`transformMap`);let e=t(`transformPointsInput`).value;e!==t(`pointsInput`).value&&changeCellsDensity(e);let[n,i]=y();applyGraphSize(),fitMapToScreen(),resetZoom(0),undraw(),r.process({projection:n,inverse:i,scale:1}),drawLayers(),INFO&&console.groupEnd()}function y(){let e=graphWidth/2,n=graphHeight/2,r=+t(`transformShiftX`).value,i=+t(`transformShiftY`).value,a=t(`transformAngleInput`).value/180*Math.PI,o=Math.cos(a),s=Math.sin(a),c=+t(`transformScaleResult`).value,l=t(`transformMirrorH`).checked,u=t(`transformMirrorV`).checked;function d(t,d){return t-=e,d-=n,c!==1&&(t*=c,d*=c),a&&([t,d]=[t*o-d*s,t*s+d*o]),l&&(t=-t),u&&(d=-d),[t+e+r,d+n+i]}function f(t,d){return t-=e+r,d-=n+i,u&&(d=-d),l&&(t=-t),a!==0&&([t,d]=[t*o+d*s,-t*s+d*o]),c!==1&&(t/=c,d/=c),[t+e,d+n]}return[d,f]}var b={open:s};export{b as TransformTool};