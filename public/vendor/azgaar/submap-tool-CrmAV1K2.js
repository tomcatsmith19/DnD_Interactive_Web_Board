import{$ as e,Ft as t,Nt as n,U as r,et as i}from"./utils-BYaxf2yO.js";import{jt as a,m as o}from"./index-DqeJMjPz.js";function s(){c(),l(),$(`#submapTool`).dialog({title:`Create a submap`,resizable:!1,width:`32em`,position:{my:`center`,at:`center`,of:`svg`},close:u,buttons:{Submap:function(){f(),$(this).dialog(`close`)},Cancel:function(){$(this).dialog(`close`)}}})}function c(){a(`submapTool`);let e=r(`pointsInput`).value,t=cellsDensityMap[+e],n=`<div id="submapTool" class="dialog">
    <p style="font-weight: bold">
      This operation is destructive and irreversible. It will create a completely new map based on the current one.
      Don't forget to save the .map file to your machine first!
    </p>
    <div style="display: flex; flex-direction: column; gap: 0.5em">
      <div data-tip="Set points (cells) number of the submap" style="display: flex; gap: 1em">
        <div>Points number</div>
        <div>
          <input id="submapPointsInput" type="range" min="1" max="13" value="${e}" />
          <output id="submapPointsFormatted" style="color: ${getCellsDensityColor(t)}">${t/1e3}K</output>
        </div>
      </div>
      <div data-tip="Check to fit burg styles (icon and label size) to the submap scale">
        <input type="checkbox" class="checkbox" id="submapRescaleBurgStyles" checked />
        <label for="submapRescaleBurgStyles" class="checkbox-label">Rescale burg styles</label>
      </div>
    </div>
  </div>`;r(`dialogs`).insertAdjacentHTML(`beforeend`,n)}function l(){r(`submapPointsInput`).oninput=d}function u(){a(`submapTool`)}function d(e){let t=cellsDensityMap[+e.target.value],n=r(`submapPointsFormatted`);n.value=`${t/1e3}K`,n.style.color=getCellsDensityColor(t)}function f(){INFO&&console.group(`generateSubmap`);let[e,t]=[Math.abs(viewX/scale),Math.abs(viewY/scale)];p(e,t);let n=r(`submapPointsInput`).value;n!==r(`pointsInput`).value&&changeCellsDensity(n),applyGraphSize(),fitMapToScreen(),resetZoom(0),undraw(),o.process({projection:(n,r)=>[(n-e)*scale,(r-t)*scale],inverse:(n,r)=>[n/scale+e,r/scale+t],scale}),r(`submapRescaleBurgStyles`).checked&&m(scale),drawLayers(),INFO&&console.groupEnd()}function p(n,a){options.mapSize=t(options.mapSize/scale,2);let o=(mapCoordinates.latT??0)/scale,s=e(a,mapCoordinates,graphHeight);options.latitude=t((90-s)/(180-o)*100,2);let c=(mapCoordinates.lonT??0)/scale,l=i(n+graphWidth/scale,mapCoordinates,graphWidth);options.longitude=t((180-l)/(360-c)*100,2),distanceScale=t(distanceScale/scale,2),r(`distanceScaleInput`).value=String(distanceScale),populationRate=t(populationRate/scale,2),r(`populationRateInput`).value=String(populationRate)}function m(e){for(let i of r(`burgIcons`).querySelectorAll(`:scope > g`)){let r={...style.burgIcons[i.id]};for(let{name:e,value:t}of i.attributes)r[e]=t;let a=Number(r[`font-size`])||1;r[`font-size`]=String(t(n(a*e,.2,10),2)),style.burgIcons[i.id]=r,i.remove()}let i=new Set(pack.burgs.filter(e=>e.i&&!e.removed).map(e=>e.label?.group||e.group||`burg`));for(let n of i){let r=style.labels.groups[n];if(!r)continue;let i=Number.parseFloat(r[`font-size`])||0;r[`font-size`]=`${t(Math.max(t((i+i/e)/2,2),1)*e,2)}%`}}var h={open:s};export{h as SubmapTool};