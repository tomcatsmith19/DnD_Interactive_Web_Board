import{Ln as e,U as t,q as n}from"./utils-BYaxf2yO.js";import{c as r,d as i,f as a,jt as o,kt as s,p as c,u as l}from"./index-DqeJMjPz.js";var u=e(n()),d=[{id:`coastMaxDepth`,label:`Detail depth`,tip:`Maximum recursion levels per edge. Each +1 can double point count in rough zones.`,min:1,max:5,step:1,key:`maxDepth`},{id:`coastBaseAmplitude`,label:`Roughness amplitude`,tip:`Peak perpendicular displacement. Scales with √(edge length) so large edges stay proportional.`,min:.2,max:4,step:.1,key:`baseAmplitude`},{id:`coastAmplitudeDecay`,label:`Amplitude decay`,tip:`Amplitude multiplier per recursion level (Hurst exponent). Lower = more jagged finer detail.`,min:.01,max:.99,step:.01,key:`amplitudeDecay`},{id:`coastMinEdge`,label:`Minimum edge`,tip:`Edges shorter than this (map units) are never subdivided regardless of roughness.`,min:.1,max:10,step:.1,key:`minEdge`},{id:`coastSmoothThreshold`,label:`Smooth threshold`,tip:`Profile values below this receive zero displacement → glassy arc. Controls calm-coast coverage.`,min:.01,max:.5,step:.01,key:`smoothThreshold`},{id:`coastRoughnessContrast`,label:`Roughness contrast`,tip:`Power applied to the roughness profile. Higher = sharper calm/rough transition.`,min:.5,max:10,step:.1,key:`roughnessContrast`},{id:`coastProfileHarmonics`,label:`Roughness zones`,tip:`Number of cosine harmonics shaping the roughness envelope. 1 = one large concentrated patch; 8 = many small scattered zones.`,min:1,max:8,step:1,key:`profileHarmonics`},{id:`coastLakeSmoothThreshMult`,label:`Lake smooth multiplier`,tip:`Smooth-threshold multiplier for lake shores. 1 = same roughness as ocean.`,min:.1,max:5,step:.1,key:`lakeSmoothThreshMult`}],f={Default:{...i},Smooth:{maxDepth:3,baseAmplitude:1,amplitudeDecay:.6,minEdge:1,smoothThreshold:.3,roughnessContrast:2,profileHarmonics:1,lakeSmoothThreshMult:3},Rocky:{maxDepth:4,baseAmplitude:3,amplitudeDecay:.7,minEdge:.5,smoothThreshold:.05,roughnessContrast:.8,profileHarmonics:7,lakeSmoothThreshMult:1.2},Fjords:{maxDepth:4,baseAmplitude:2.8,amplitudeDecay:.92,minEdge:.3,smoothThreshold:.25,roughnessContrast:5,profileHarmonics:2,lakeSmoothThreshMult:2.5},Archipelago:{maxDepth:4,baseAmplitude:1.8,amplitudeDecay:.88,minEdge:.5,smoothThreshold:.18,roughnessContrast:1,profileHarmonics:8,lakeSmoothThreshMult:1.5}},p=`preview_coastline`;function m(){customization||(s(`#culturesEditor, .stable`),h(),_(),$(`#coastlineSettingsDialog`).dialog({title:`Coastline Settings Editor`,resizable:!1,width:`auto`,position:{my:`right top`,at:`right-10 top+10`,of:`svg`},close:()=>{o(`coastlineSettingsDialog`)}}))}function h(){o(`coastlineSettingsDialog`),document.body.insertAdjacentHTML(`beforeend`,g());for(let{id:e,key:n}of d){let a=t(e),o=t(`${e}Reset`),s=i[n];a.addEventListener(`input`,e=>{e.target===e.currentTarget&&(i[n]=a.valueAsNumber,_(),r())}),o.addEventListener(`click`,()=>{i[n]=s,a.value=String(s),_(),r()})}let e=t(`coastEnabled`),n=t(`coastSliders`),a=t(`coastEnabledTrack`),s=t(`coastEnabledThumb`);e.checked=i.enabled;let c=()=>{a.style.background=i.enabled?`#33bb88`:`#bbb`,s.style.left=i.enabled?`18px`:`2px`,n.style.opacity=i.enabled?``:`0.4`,n.style.pointerEvents=i.enabled?``:`none`,Object.keys(f).forEach(e=>{let n=t(`coastPreset_${e}`);n.disabled=!i.enabled})};c(),e.addEventListener(`change`,()=>{i.enabled=e.checked,c(),_(),r()});for(let e of Object.keys(f))t(`coastPreset_${e}`).addEventListener(`click`,()=>{let n=f[e];for(let{id:e,key:r}of d){if(!(r in n))continue;let a=n[r];i[r]=a;let o=t(e);o.value=String(a)}_(),r()})}function g(){let e=Object.keys(f).map(e=>`<button id="coastPreset_${e}" style="font-size:.78em;padding:2px 8px">${e}</button>`).join(``),t=d.map(({id:e,label:t,tip:n,min:r,max:a,step:o,key:s})=>`
      <tr data-tip="${n}">
        <td style="padding:2px 0;white-space:nowrap">${t}</td>
        <td style="padding:2px 4px">
          <slider-input id="${e}" min="${r}" max="${a}" step="${o}" value="${i[s]}"></slider-input>
        </td>
        <td style="padding:2px 0">
          <button id="${e}Reset" title="Reset to default"
            style="font-size:.75em;padding:1px 5px;cursor:pointer">↺</button>
        </td>
      </tr>`).join(``);return`
    <div id="coastlineSettingsDialog" style="display:none" class="dialog">
      <style>
        #coastlineSettingsDialog slider-input input[type=range] { width:100%; }
      </style>
      <div style="display:flex;justify-content:space-between;gap:10px;margin-bottom:8px;padding-bottom:8px;border-bottom:1px solid #ddd">
        <label style="display:flex;align-items:center;gap:8px;cursor:pointer;user-select:none" data-tip="Enable or disable coastline fractalization. When disabled, coastlines are simple arcs between feature vertices. Enabling adds naturalistic roughness but can increase rendering time, especially at high detail levels.">
          <input id="coastEnabled" type="checkbox" ${i.enabled?`checked`:``}
            style="position:absolute;opacity:0;pointer-events:none;width:0;height:0"/>
          <span id="coastEnabledTrack" style="position:relative;display:inline-block;width:36px;height:20px;border-radius:10px;background:${i.enabled?`#33bb88`:`#bbb`};cursor:pointer;flex-shrink:0">
            <span id="coastEnabledThumb" style="position:absolute;top:2px;left:${i.enabled?`18px`:`2px`};width:16px;height:16px;border-radius:50%;background:#fff;box-shadow:0 1px 3px rgba(0,0,0,.3)"></span>
          </span>
        </label>
        <div style="display:flex;align-items:center;gap:4px">
          <span style="color:#999;font-size:.85em">Preset</span>
          ${e}
        </div>
      </div>
      <div id="coastSliders">
        <table style="border-collapse:collapse;width:100%">
          <colgroup>
            <col style="width:35%">
            <col style="width:60%">
            <col style="width:5%">
          </colgroup>
          <tbody>${t}</tbody>
        </table>
      </div>
      <div style="display:flex;gap:6px;margin-top:10px;align-items:flex-start">
        <div style="flex:1;min-width:0">
          <div style="color:#999;font-size:.85em;margin-bottom:3px">Roughness profile</div>
          <canvas id="coastRoughnessGraph" width="auto" height="100" style="display:block"></canvas>
        </div>
        <div>
          <div style="color:#999;font-size:.85em;margin-bottom:3px">Shape preview</div>
          <canvas id="coastShapePreview" width="100" height="100" style="display:block"></canvas>
        </div>
      </div>
    </div>`}function _(){v(t(`coastRoughnessGraph`)),y(t(`coastShapePreview`))}function v(e){let t=e.width,n=e.height,r=e.getContext(`2d`);r.clearRect(0,0,t,n);let a=c((0,u.default)(p),i.roughnessContrast,i.profileHarmonics),o=n*(1-Math.min(Math.max(i.smoothThreshold,0),1)),s=n,l=[],d=[];for(let e=0;e<=256;e++)l.push(e/256*t),d.push(n*(1-a[e%256]));let f=(e,n,i)=>{let a=n-e;if(!(a<=0)){r.save(),r.beginPath(),r.rect(0,e,t,a),r.clip(),r.beginPath(),r.moveTo(l[0],d[0]);for(let e=1;e<l.length;e++)r.lineTo(l[e],d[e]);r.lineTo(l[l.length-1],s),r.lineTo(l[0],s),r.closePath(),r.fillStyle=i,r.fill(),r.restore()}},m=(e,n,i)=>{let a=n-e;if(!(a<=0)){r.save(),r.beginPath(),r.rect(0,e,t,a),r.clip(),r.beginPath(),r.moveTo(l[0],d[0]);for(let e=1;e<l.length;e++)r.lineTo(l[e],d[e]);r.strokeStyle=i,r.lineWidth=1.5,r.stroke(),r.restore()}};f(0,o,`rgba(210,90,30,0.20)`),m(0,o,`#c85520`),f(o,s,`rgba(30,165,135,0.20)`),m(o,s,`#18a888`),r.save(),r.beginPath(),r.setLineDash([4,3]),r.moveTo(0,o),r.lineTo(t,o),r.strokeStyle=`rgba(30,140,100,0.75)`,r.lineWidth=1,r.stroke(),r.setLineDash([]),r.restore(),r.font=`bold 8px sans-serif`,r.textAlign=`left`,o>12&&(r.fillStyle=`#c85520`,r.fillText(`ROUGH`,12,11)),s-o>10&&(r.fillStyle=`#18a888`,r.fillText(`CALM`,12,s-4)),i.enabled||(r.fillStyle=`rgba(0,0,0,0.38)`,r.fillRect(0,0,t,n),r.fillStyle=`#fff`)}function y(e){let t=e.width,n=e.height,r=e.getContext(`2d`);r.clearRect(0,0,t,n);let o=t/2,s=n/2,c=Math.min(t,n)*.34,d=[[o,s-c],[o+c,s],[o,s+c],[o-c,s]],f=i.enabled?a(d,(0,u.default)(p),i):{points:d,origIndices:[0,1,2,3]},m=new Path2D(`${l(f)}Z`),h=r.createRadialGradient(o,s,0,o,s,Math.max(t,n)*.85);h.addColorStop(0,`#cce5f5`),h.addColorStop(1,`#6aa4cb`),r.fillStyle=h,r.fillRect(0,0,t,n);let g=r.createRadialGradient(o-c*.1,s-c*.1,c*.05,o,s,c*1.1);g.addColorStop(0,`#d8c87a`),g.addColorStop(.5,`#9cbc60`),g.addColorStop(1,`#5c8e40`),r.save(),r.shadowColor=`rgba(0,20,60,0.35)`,r.shadowBlur=8,r.shadowOffsetX=3,r.shadowOffsetY=3,r.fillStyle=g,r.fill(m),r.restore(),r.strokeStyle=`#5c4526`,r.lineWidth=1.5,r.stroke(m);let _=f.origIndices.map(e=>f.points[e]);r.beginPath();for(let e=0;e<_.length;e++){let[t,n]=_[e];e===0?r.moveTo(t,n):r.lineTo(t,n)}r.closePath(),r.strokeStyle=`rgba(255,255,255,0.45)`,r.lineWidth=.8,r.setLineDash([3,3]),r.stroke(),r.setLineDash([]);for(let[e,t]of _)r.beginPath(),r.arc(e,t,2.5,0,Math.PI*2),r.fillStyle=`rgba(255,255,255,0.85)`,r.fill(),r.strokeStyle=`rgba(60,40,10,0.55)`,r.lineWidth=.8,r.stroke();i.enabled||(r.fillStyle=`rgba(0,0,0,0.38)`,r.fillRect(0,0,t,n),r.fillStyle=`#fff`,r.font=`bold 11px sans-serif`,r.textAlign=`center`,r.textBaseline=`middle`,r.fillText(`OFF`,o,s),r.textBaseline=`alphabetic`,r.textAlign=`left`)}var b={open:m};export{b as CoastlineEditor};