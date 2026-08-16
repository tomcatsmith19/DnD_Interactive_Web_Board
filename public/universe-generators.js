function hashSeed(value='seed') {
  let h=2166136261;
  for (const char of String(value)) { h^=char.charCodeAt(0); h=Math.imul(h,16777619); }
  return h>>>0;
}

export class MapGeneratorAdapter {
  generate(seed,params={}) { return {seed,params}; }
  render() { throw new Error('Renderer not implemented'); }
  serializeSettings(params={}) { return {...params}; }
  getPermalink() { return null; }
  destroy() {}
}

class WorldAdapter extends MapGeneratorAdapter {
  generate(seed,params={}) {
    const width=Math.max(600,Math.min(4096,Number(params.width)||1536));
    const height=Math.max(400,Math.min(2160,Number(params.height)||1024));
    const supplied=params._permalink||null;
    let url;
    if(supplied){try{url=new URL(supplied,location.href);url.searchParams.set('random','0');}catch{url=null;}}
    if(!url){const query=new URLSearchParams({seed:String(seed),width:String(width),height:String(height),random:'0'});url=new URL(`vendor/azgaar/index.html?${query}`,location.href);}
    return {seed:String(seed),params:{...params,width,height},url:url.toString()};
  }
  render(container,map,{children=[],onSelect,onPlace,onOpenGeneratedTown}={}) {
    container.replaceChildren();
    const frameHost=document.createElement('div');frameHost.className='azgaar-world-host';
    const frame=document.createElement('iframe');frame.className='azgaar-world-frame';frame.title='Azgaar Fantasy Map Generator';frame.allow='fullscreen';
    frame.src=map.url;
    const manualChildren=children.filter(child=>child.generator?.params?.azgaarBurgId==null);
    let markerTransformObserver=null;
    const renderUniverseMarkers=()=>{try{
      const win=frame.contentWindow,doc=frame.contentDocument,viewbox=doc?.getElementById('viewbox'),svgRoot=doc?.getElementById('map');if(!viewbox||!svgRoot)return;
      doc.getElementById('universeLocationMarkers')?.remove();const group=doc.createElementNS('http://www.w3.org/2000/svg','g');group.id='universeLocationMarkers';
      const width=Number(win.graphWidth)||map.params.width,height=Number(win.graphHeight)||map.params.height;
      const markerRecords=[];
      manualChildren.forEach(child=>{const x=Math.max(0,Math.min(1,Number(child.placement?.x)||.5))*width,y=Math.max(0,Math.min(1,Number(child.placement?.y)||.5))*height,marker=doc.createElementNS('http://www.w3.org/2000/svg','g');marker.setAttribute('transform',`translate(${x} ${y})`);marker.setAttribute('role','button');marker.setAttribute('tabindex','0');marker.style.cursor='pointer';
        const circle=doc.createElementNS('http://www.w3.org/2000/svg','circle');circle.setAttribute('r','6');circle.setAttribute('fill','#111');circle.setAttribute('stroke','#FFD700');circle.setAttribute('stroke-width','2');
        const label=doc.createElementNS('http://www.w3.org/2000/svg','text');label.setAttribute('x','9');label.setAttribute('y','4');label.setAttribute('fill','#fff');label.setAttribute('font-size','11');label.setAttribute('stroke','#111');label.setAttribute('stroke-width','3');label.setAttribute('paint-order','stroke');label.textContent=child.name;
        const choose=event=>{event.preventDefault();event.stopImmediatePropagation();event.stopPropagation();onSelect(child);};marker.addEventListener('click',choose,true);marker.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();choose(event);}});marker.append(circle,label);group.append(marker);markerRecords.push({marker,x,y});});
      const mirrorTransform=()=>{const mapTransform=viewbox.getAttribute('transform')||'',scaleMatch=mapTransform.match(/scale\(([-+\d.eE]+)\)/),zoom=Math.max(1,Number(scaleMatch?.[1])||1);group.setAttribute('transform',mapTransform);const inverseZoom=1/zoom;markerRecords.forEach(record=>record.marker.setAttribute('transform',`translate(${record.x} ${record.y}) scale(${inverseZoom})`));};mirrorTransform();svgRoot.insertBefore(group,doc.getElementById('scaleBar')||null);
      markerTransformObserver?.disconnect();markerTransformObserver=new MutationObserver(mirrorTransform);markerTransformObserver.observe(viewbox,{attributes:true,attributeFilter:['transform']});
    }catch(error){console.warn('Could not render Universe markers in Azgaar',error);}};
    const interceptTownOpen=event=>{
      const openButton=event.target?.closest?.('#burgLinkOpen');if(!openButton)return;
      const win=frame.contentWindow,editor=win?.document?.getElementById('burgEditor'),id=Number(editor?.dataset?.burgId);
      const burg=Number.isFinite(id)?win?.pack?.burgs?.[id]:null;if(!burg)return;
      event.preventDefault();event.stopImmediatePropagation();event.stopPropagation();
      const width=Number(win.graphWidth)||map.params.width,height=Number(win.graphHeight)||map.params.height;
      const previewLinks=win?.Burgs?.getPreview?.(burg),generatedUrl=previewLinks?.link||null;
      onOpenGeneratedTown?.({id:burg.i,name:burg.name||`Settlement ${burg.i}`,x:Math.max(0,Math.min(1,Number(burg.x)/width)),y:Math.max(0,Math.min(1,Number(burg.y)/height)),population:Number(burg.population)||null,capital:Boolean(burg.capital),port:Boolean(burg.port),generatedUrl});
    };
    const stabilizeBurgUrl=(value,burgId,isPreview)=>{if(!value)return null;try{const url=new URL(value),seed=url.searchParams.get('seed');if(!/^\d{1,15}$/.test(seed||''))url.searchParams.set('seed',String(hashSeed(`${map.seed}-${burgId}`)));url.searchParams.set('random','0');isPreview?url.searchParams.set('preview','1'):url.searchParams.delete('preview');return url.toString();}catch{return value;}};
    frame.addEventListener('load',()=>{try{
      const win=frame.contentWindow,burgs=win?.Burgs;
      if(burgs?.getPreview&&!burgs.getPreview.__universeStable){
        const original=burgs.getPreview.bind(burgs),stablePreview=burg=>{const result=original(burg)||{};return{link:stabilizeBurgUrl(result.link,burg?.i,false),preview:stabilizeBurgUrl(result.preview||result.link,burg?.i,true)};};
        stablePreview.__universeStable=true;burgs.getPreview=stablePreview;
      }
      win.addEventListener('map:generated',renderUniverseMarkers);if(win.mapId)renderUniverseMarkers();
      frame.contentDocument?.addEventListener('click',interceptTownOpen,true);
    }catch(error){console.warn('Could not attach Azgaar town bridge',error);}});
    const markerOverlay=document.createElement('div');markerOverlay.className='azgaar-marker-overlay';
    markerOverlay.addEventListener('click',event=>{if(event.target!==markerOverlay)return;try{const win=frame.contentWindow,svg=frame.contentDocument?.getElementById('map'),viewbox=frame.contentDocument?.getElementById('viewbox'),frameRect=frame.getBoundingClientRect(),point=svg.createSVGPoint();point.x=event.clientX-frameRect.left;point.y=event.clientY-frameRect.top;const local=point.matrixTransform(viewbox.getScreenCTM().inverse()),x=Math.max(0,Math.min(1,local.x/(Number(win.graphWidth)||map.params.width))),y=Math.max(0,Math.min(1,local.y/(Number(win.graphHeight)||map.params.height)));onPlace?.({x,y,latitude:(.5-y)*180,longitude:(x-.5)*360});}catch{const rect=markerOverlay.getBoundingClientRect(),x=(event.clientX-rect.left)/rect.width,y=(event.clientY-rect.top)/rect.height;onPlace?.({x,y,latitude:(.5-y)*180,longitude:(x-.5)*360});}});
    frameHost.append(frame,markerOverlay);container.append(frameHost);
    return{setPlacementMode(active){markerOverlay.classList.toggle('is-placing',!!active);},destroy(){markerTransformObserver?.disconnect();try{frame.contentWindow?.removeEventListener('map:generated',renderUniverseMarkers);frame.contentDocument?.removeEventListener('click',interceptTownOpen,true);}catch{}frameHost.remove();}};
  }
  getPermalink(map){return map.url||null;}
}

class AzgaarTownAdapter extends MapGeneratorAdapter {
  generate(seed,params={}) {
    const rawUrl=params._permalink||params.generatedUrl||null;
    let url=rawUrl;
    if(rawUrl){try{const parsed=new URL(rawUrl),urlSeed=parsed.searchParams.get('seed');parsed.searchParams.delete('preview');parsed.searchParams.set('random','0');if(!/^\d{1,15}$/.test(urlSeed||''))parsed.searchParams.set('seed',String(hashSeed(seed)));url=parsed.toString();}catch{}}
    return{seed,params:{...params},url};
  }
  render(container,map,{children=[],onSelect,onPlace}={}) {
    container.replaceChildren();const host=document.createElement('div');host.className='watabou-pan-host';
    if(!map.url)throw new Error('This generated location does not include a valid Watabou permalink.');
    const stage=document.createElement('div');stage.className='watabou-map-stage';
    const frame=document.createElement('iframe');frame.className='azgaar-world-frame';frame.title='Generated Watabou map';frame.src=map.url;frame.setAttribute('sandbox','allow-scripts allow-same-origin allow-forms allow-downloads');
    const overlay=document.createElement('div');overlay.className='azgaar-marker-overlay';
    children.forEach(child=>{const button=document.createElement('button');button.type='button';button.className='azgaar-location-marker';button.style.left=`${Math.max(0,Math.min(1,Number(child.placement?.x)||.5))*100}%`;button.style.top=`${Math.max(0,Math.min(1,Number(child.placement?.y)||.5))*100}%`;button.textContent=child.name;button.addEventListener('click',event=>{event.stopPropagation();onSelect(child);});overlay.append(button);});
    overlay.addEventListener('click',event=>{if(event.target!==overlay)return;const rect=overlay.getBoundingClientRect(),x=(event.clientX-rect.left)/rect.width,y=(event.clientY-rect.top)/rect.height;onPlace?.({x,y,latitude:null,longitude:null});});
    const panLayer=document.createElement('div');panLayer.className='watabou-pan-layer';
    const controls=document.createElement('div');controls.className='watabou-map-controls';controls.setAttribute('aria-label','Map zoom and pan controls');
    const makeButton=(label,title,action)=>{const button=document.createElement('button');button.type='button';button.textContent=label;button.title=title;button.setAttribute('aria-label',title);button.addEventListener('click',action);controls.append(button);return button;};
    const baseWidth=1200,baseHeight=800;let scale=1,translateX=0,translateY=0,dragStart=null,panActive=false;
    const applyTransform=()=>{stage.style.transform=`translate(${translateX}px,${translateY}px) scale(${scale})`;};
    const fit=()=>{const rect=host.getBoundingClientRect();if(!rect.width||!rect.height)return;scale=Math.min(rect.width/baseWidth,rect.height/baseHeight);translateX=(rect.width-baseWidth*scale)/2;translateY=(rect.height-baseHeight*scale)/2;applyTransform();};
    const zoom=change=>{const rect=host.getBoundingClientRect(),centerX=rect.width/2,centerY=rect.height/2,oldScale=scale;scale=Math.max(.25,Math.min(4,scale*change));translateX=centerX-(centerX-translateX)*(scale/oldScale);translateY=centerY-(centerY-translateY)*(scale/oldScale);applyTransform();};
    makeButton('+','Zoom in',()=>zoom(1.25));makeButton('−','Zoom out',()=>zoom(.8));makeButton('Reset','Reset map view',fit);
    const panButton=makeButton('Pan','Toggle pan mode',()=>{panActive=!panActive;panButton.classList.toggle('is-active',panActive);panLayer.classList.toggle('is-active',panActive);panButton.setAttribute('aria-pressed',String(panActive));});panButton.setAttribute('aria-pressed','false');
    panLayer.addEventListener('pointerdown',event=>{dragStart={x:event.clientX,y:event.clientY,translateX,translateY};panLayer.setPointerCapture(event.pointerId);panLayer.classList.add('is-dragging');});
    panLayer.addEventListener('pointermove',event=>{if(!dragStart)return;translateX=dragStart.translateX+event.clientX-dragStart.x;translateY=dragStart.translateY+event.clientY-dragStart.y;applyTransform();});
    const endDrag=()=>{dragStart=null;panLayer.classList.remove('is-dragging');};panLayer.addEventListener('pointerup',endDrag);panLayer.addEventListener('pointercancel',endDrag);
    panLayer.addEventListener('wheel',event=>{event.preventDefault();zoom(event.deltaY<0?1.15:.87);},{passive:false});
    stage.append(frame,overlay,panLayer);host.append(stage,controls);container.append(host);
    const resizeObserver=new ResizeObserver(fit);resizeObserver.observe(host);requestAnimationFrame(fit);
    return{setPlacementMode(active){const placing=!!active;overlay.classList.toggle('is-placing',placing);if(placing&&panActive){panActive=false;panButton.classList.remove('is-active');panButton.setAttribute('aria-pressed','false');panLayer.classList.remove('is-active');}},destroy(){resizeObserver.disconnect();host.remove();}};
  }
  getPermalink(map){return map.url||null;}
}

class WatabouLocationAdapter extends AzgaarTownAdapter {
  constructor(baseUrl,defaults={}) { super();this.baseUrl=baseUrl;this.defaults=defaults; }
  generate(seed,params={}) {
    const supplied=params._permalink||params.generatedUrl||null;
    let url;
    try{url=new URL(supplied||this.baseUrl);}catch{url=new URL(this.baseUrl);}
    if(!supplied)Object.entries({...this.defaults,...params}).forEach(([key,value])=>{if(!key.startsWith('_')&&value!==null&&value!==undefined&&value!=='')url.searchParams.set(key,String(value));});
    const urlSeed=url.searchParams.get('seed');
    if(!/^\d{1,15}$/.test(urlSeed||''))url.searchParams.set('seed',String(hashSeed(seed)));
    url.searchParams.set('random','0');url.searchParams.delete('preview');
    return{seed:String(seed),params:{...params},url:url.toString()};
  }
}

export const generatorRegistry = new Map([
  ['azgaar',new WorldAdapter()],['azgaar-town',new AzgaarTownAdapter()],
  ['watabou-town',new WatabouLocationAdapter('https://watabou.github.io/city-generator/',{size:'medium'})],
  ['watabou-dungeon',new WatabouLocationAdapter('https://watabou.github.io/one-page-dungeon/',{size:'medium'})],
  ['watabou-dwelling',new WatabouLocationAdapter('https://watabou.github.io/dwellings/',{tags:'medium'})],
  ['watabou-cave',new WatabouLocationAdapter('https://watabou.github.io/cave-generator/',{tags:'medium,cave'})],
  ['watabou-glade',new WatabouLocationAdapter('https://watabou.github.io/cave-generator/',{tags:'medium,glade'})]
]);

export function providerForType(type) {return type==='world'?'azgaar':type==='dungeon'?'watabou-dungeon':type==='dwelling'?'watabou-dwelling':type==='cave'?'watabou-cave':type==='glade'?'watabou-glade':'watabou-town';}
