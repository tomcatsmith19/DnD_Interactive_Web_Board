function hashSeed(value='seed') {
  let h=2166136261;
  for (const char of String(value)) { h^=char.charCodeAt(0); h=Math.imul(h,16777619); }
  return h>>>0;
}

function rngFor(seed) {
  let state=hashSeed(seed)||1;
  return () => { state+=0x6D2B79F5; let t=state; t=Math.imul(t^(t>>>15),t|1); t^=t+Math.imul(t^(t>>>7),t|61); return ((t^(t>>>14))>>>0)/4294967296; };
}

function svg(tag,attrs={}) {
  const node=document.createElementNS('http://www.w3.org/2000/svg',tag);
  Object.entries(attrs).forEach(([key,value])=>node.setAttribute(key,String(value)));
  return node;
}

function markerLayer(root,children,onSelect,width=1000,height=700) {
  const group=svg('g',{'class':'generated-markers'});
  const radius=Math.max(.65,Math.min(13,Math.min(width,height)/40));
  children.forEach(child=>{
    const x=Math.max(0,Math.min(1,Number(child.placement?.x) || .5))*width;
    const y=Math.max(0,Math.min(1,Number(child.placement?.y) || .5))*height;
    const button=svg('g',{tabindex:'0',role:'button','aria-label':`Open ${child.name}`,'data-map-id':child.id,transform:`translate(${x} ${y})`});
    button.classList.add('map-marker');
    button.append(svg('circle',{r:radius,fill:'#111',stroke:'#FFD700','stroke-width':radius*.3}),svg('path',{d:`M0 ${-radius*.55}L${radius*.45} ${radius*.38}L0 ${radius*.16}L${-radius*.45} ${radius*.38}Z`,fill:'#FFD700'}));
    const label=svg('text',{x:radius*1.4,y:radius*.38,fill:'#fff','font-size':radius*1.05,'paint-order':'stroke',stroke:'#111','stroke-width':radius*.3}); label.textContent=child.name; button.append(label);
    const choose=event=>{event.stopPropagation();onSelect(child);};
    button.addEventListener('click',choose); button.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();choose(event);}});
    group.append(button);
  });
  root.append(group);
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
    return {seed:String(seed),params:{...params,width,height}};
  }
  render(container,map,{children=[],onSelect,onPlace,onOpenGeneratedTown}={}) {
    container.replaceChildren();
    const frameHost=document.createElement('div');frameHost.className='azgaar-world-host';
    const frame=document.createElement('iframe');frame.className='azgaar-world-frame';frame.title='Azgaar Fantasy Map Generator';frame.allow='fullscreen';
    const query=new URLSearchParams({seed:map.seed,width:String(map.params.width),height:String(map.params.height)});
    frame.src=`vendor/azgaar/index.html?${query}`;
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
    return{setPlacementMode(active){markerOverlay.classList.toggle('is-placing',!!active);},destroy(){markerTransformObserver?.disconnect();try{frame.contentWindow?.removeEventListener('map:generated',renderUniverseMarkers);frame.contentDocument?.removeEventListener('click',interceptTownOpen,true);}catch{}frame.src='about:blank';frameHost.remove();}};
  }
}

class AzgaarTownAdapter extends MapGeneratorAdapter {
  generate(seed,params={}) {
    const rawUrl=params._permalink||params.generatedUrl||null;
    let url=rawUrl;
    if(rawUrl){try{const parsed=new URL(rawUrl),urlSeed=parsed.searchParams.get('seed');parsed.searchParams.delete('preview');parsed.searchParams.set('random','0');if(!/^\d{1,15}$/.test(urlSeed||''))parsed.searchParams.set('seed',String(hashSeed(seed)));url=parsed.toString();}catch{}}
    return{seed,params:{...params},url};
  }
  render(container,map,{children=[],onSelect,onPlace}={}) {
    container.replaceChildren();const host=document.createElement('div');host.className='azgaar-world-host';
    if(!map.url)throw new Error('This Azgaar settlement does not include a generated town URL. Reopen it from the world map to repair it.');
    const frame=document.createElement('iframe');frame.className='azgaar-world-frame';frame.title='Generated town map';frame.src=map.url;frame.setAttribute('sandbox','allow-scripts allow-same-origin allow-forms allow-downloads');
    const overlay=document.createElement('div');overlay.className='azgaar-marker-overlay';
    children.forEach(child=>{const button=document.createElement('button');button.type='button';button.className='azgaar-location-marker';button.style.left=`${Math.max(0,Math.min(1,Number(child.placement?.x)||.5))*100}%`;button.style.top=`${Math.max(0,Math.min(1,Number(child.placement?.y)||.5))*100}%`;button.textContent=child.name;button.addEventListener('click',event=>{event.stopPropagation();onSelect(child);});overlay.append(button);});
    overlay.addEventListener('click',event=>{if(event.target!==overlay)return;const rect=overlay.getBoundingClientRect(),x=(event.clientX-rect.left)/rect.width,y=(event.clientY-rect.top)/rect.height;onPlace?.({x,y,latitude:null,longitude:null});});
    host.append(frame,overlay);container.append(host);
    return{setPlacementMode(active){overlay.classList.toggle('is-placing',!!active);},destroy(){frame.src='about:blank';host.remove();}};
  }
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

class TownAdapter extends MapGeneratorAdapter {
  generate(seed,params={}) {
    const random=rngFor(seed),size=Math.max(8,Math.min(80,Number(params.size)||32)),buildings=[];
    for(let i=0;i<size;i++){const angle=random()*Math.PI*2,radius=Math.sqrt(random())*260;buildings.push({x:500+Math.cos(angle)*radius,y:350+Math.sin(angle)*radius,w:18+random()*36,h:14+random()*28,a:random()*.8-.4,district:i%5});}
    return{seed,params:{size,walled:params.walled!==false,river:!!params.river,coast:!!params.coast,density:Number(params.density)||.65,palette:params.palette||'parchment'},buildings};
  }
  render(container,map,{children=[],onSelect,onPlace}={}) {
    container.replaceChildren();const root=svg('svg',{viewBox:'0 0 1000 700',class:'generated-map',role:'img','aria-label':'Generated town map'});container.append(root);
    root.append(svg('rect',{width:1000,height:700,fill:'#d9c590'}));
    if(map.params.coast)root.append(svg('path',{d:'M0 570 Q230 500 470 590 T1000 540 V700 H0Z',fill:'#4c92a4'}));
    if(map.params.river)root.append(svg('path',{d:'M-20 110 Q250 250 450 170 T1020 250',fill:'none',stroke:'#4c92a4','stroke-width':48}));
    const roads=svg('g',{fill:'none',stroke:'#8c7652','stroke-width':12,'stroke-linecap':'round'});for(let i=0;i<7;i++){const a=i/7*Math.PI*2;roads.append(svg('path',{d:`M500 350 Q${500+Math.cos(a+.4)*160} ${350+Math.sin(a+.4)*130} ${500+Math.cos(a)*430} ${350+Math.sin(a)*310}`}));}root.append(roads);
    if(map.params.walled)root.append(svg('ellipse',{cx:500,cy:350,rx:330,ry:285,fill:'none',stroke:'#5a4a36','stroke-width':16,'stroke-dasharray':'70 12'}));
    const colors=['#b45f45','#c58a4a','#8d6946','#a56f5b','#806b55'];map.buildings.forEach(b=>root.append(svg('rect',{x:b.x-b.w/2,y:b.y-b.h/2,width:b.w,height:b.h,rx:2,fill:colors[b.district],stroke:'#3a2a20','stroke-width':3,transform:`rotate(${b.a*57.3} ${b.x} ${b.y})`})));
    markerLayer(root,children,onSelect);root.addEventListener('click',event=>{if(event.target.closest('.map-marker'))return;const point=root.createSVGPoint();point.x=event.clientX;point.y=event.clientY;const local=point.matrixTransform(root.getScreenCTM().inverse());onPlace?.({x:local.x/1000,y:local.y/700,latitude:null,longitude:null});});return{destroy(){}};
  }
}

class DungeonAdapter extends MapGeneratorAdapter {
  generate(seed,params={}) {
    const random=rngFor(seed),width=Math.max(24,Math.min(80,Number(params.width)||48)),height=Math.max(18,Math.min(60,Number(params.height)||34)),rooms=[],cells=Array.from({length:height},()=>Array(width).fill(0));
    const target=Math.max(5,Math.floor(width*height*(Number(params.density)||.18)/35));
    for(let attempts=0;attempts<target*15&&rooms.length<target;attempts++){const rw=4+Math.floor(random()*7),rh=4+Math.floor(random()*6),x=1+Math.floor(random()*(width-rw-2)),y=1+Math.floor(random()*(height-rh-2));if(rooms.some(r=>x<r.x+r.w+2&&x+rw+2>r.x&&y<r.y+r.h+2&&y+rh+2>r.y))continue;const room={x,y,w:rw,h:rh,label:rooms.length+1};rooms.push(room);for(let yy=y;yy<y+rh;yy++)for(let xx=x;xx<x+rw;xx++)cells[yy][xx]=1;if(rooms.length>1){const a=rooms[rooms.length-2],ax=Math.floor(a.x+a.w/2),ay=Math.floor(a.y+a.h/2),bx=Math.floor(x+rw/2),by=Math.floor(y+rh/2);for(let xx=Math.min(ax,bx);xx<=Math.max(ax,bx);xx++)cells[ay][xx]=1;for(let yy=Math.min(ay,by);yy<=Math.max(ay,by);yy++)cells[yy][bx]=1;}}
    return{seed,params:{width,height,algorithm:params.algorithm||'rooms',density:Number(params.density)||.18,theme:params.theme||'stone'},rooms,cells,entrance:rooms[0]||null};
  }
  render(container,map,{children=[],onSelect,onPlace}={}) {container.replaceChildren();const root=svg('svg',{viewBox:`0 0 ${map.params.width} ${map.params.height}`,class:'generated-map dungeon-map'});container.append(root);root.append(svg('rect',{width:map.params.width,height:map.params.height,fill:'#090909'}));map.cells.forEach((row,y)=>row.forEach((cell,x)=>{if(cell)root.append(svg('rect',{x,y,width:1,height:1,fill:'#c8c1a8',stroke:'#766f60','stroke-width':.06}));}));map.rooms.forEach(room=>{const text=svg('text',{x:room.x+room.w/2,y:room.y+room.h/2+.25,'text-anchor':'middle','font-size':1.2,fill:'#342f27'});text.textContent=room.label;root.append(text);});markerLayer(root,children,onSelect,map.params.width,map.params.height);root.addEventListener('click',event=>{if(event.target.closest('.map-marker'))return;const p=root.createSVGPoint();p.x=event.clientX;p.y=event.clientY;const q=p.matrixTransform(root.getScreenCTM().inverse());onPlace?.({x:q.x/map.params.width,y:q.y/map.params.height,latitude:null,longitude:null});});return{destroy(){}};}
}

class WildernessAdapter extends MapGeneratorAdapter {
  generate(seed,params={}) {const random=rngFor(seed),features=[];const density=Math.max(.1,Math.min(1,Number(params.density)||.55));for(let i=0;i<Math.floor(90*density);i++)features.push({x:random()*1000,y:random()*700,r:5+random()*24,t:random()});return{seed,params:{biome:params.biome||'forest',width:Number(params.width)||1000,height:Number(params.height)||700,density,water:Number(params.water)||.2,paths:params.paths!==false,grid:params.grid!==false},features};}
  render(container,map,{children=[],onSelect,onPlace}={}) {container.replaceChildren();const palettes={forest:['#233f2a','#52734d','#8daa68'],grassland:['#667a3c','#a2ad62','#d0c57c'],desert:['#a76f37','#d7a85c','#efd58d'],swamp:['#273c31','#536044','#84906a'],mountain:['#494a47','#77766f','#aaa897'],arctic:['#8da7af','#d7e4e4','#f4f7f4'],coastal:['#315d69','#d3bd78','#577b49'],underdark:['#171521','#3b3150','#67557b']};const colors=palettes[map.params.biome]||palettes.forest,root=svg('svg',{viewBox:'0 0 1000 700',class:'generated-map wilderness-map'});container.append(root);root.append(svg('rect',{width:1000,height:700,fill:colors[0]}));map.features.forEach(f=>root.append(svg(f.t<map.params.water?'ellipse':'circle',f.t<map.params.water?{cx:f.x,cy:f.y,rx:f.r*2.5,ry:f.r,fill:'#315f78',opacity:.8}:{cx:f.x,cy:f.y,r:f.r,fill:f.t>.7?colors[2]:colors[1],opacity:.85})));if(map.params.paths)root.append(svg('path',{d:'M-20 620 Q190 430 380 500 T720 250 T1020 100',fill:'none',stroke:'#c7ad76','stroke-width':22,opacity:.8}));if(map.params.grid){const grid=svg('path',{d:Array.from({length:21},(_,i)=>`M${i*50} 0V700`).join('')+Array.from({length:15},(_,i)=>`M0 ${i*50}H1000`).join(''),stroke:'#fff','stroke-width':1,opacity:.14});root.append(grid);}markerLayer(root,children,onSelect);root.addEventListener('click',event=>{if(event.target.closest('.map-marker'))return;const p=root.createSVGPoint();p.x=event.clientX;p.y=event.clientY;const q=p.matrixTransform(root.getScreenCTM().inverse());onPlace?.({x:q.x/1000,y:q.y/700,latitude:null,longitude:null});});return{destroy(){}};}
}

export const generatorRegistry = new Map([
  ['azgaar',new WorldAdapter()],['azgaar-compatible',new WorldAdapter()],['azgaar-town',new AzgaarTownAdapter()],['town',new TownAdapter()],
  ['watabou-dungeon',new WatabouLocationAdapter('https://watabou.github.io/one-page-dungeon/',{size:'medium'})],
  ['watabou-dwelling',new WatabouLocationAdapter('https://watabou.github.io/dwellings/',{tags:'medium'})],
  ['watabou-cave',new WatabouLocationAdapter('https://watabou.github.io/cave-generator/',{tags:'medium,cave'})],
  ['watabou-glade',new WatabouLocationAdapter('https://watabou.github.io/cave-generator/',{tags:'medium,glade'})],
  ['rot-dungeon',new DungeonAdapter()],['wilderness',new WildernessAdapter()]
]);

export function providerForType(type) {return type==='world'?'azgaar':type==='dungeon'?'watabou-dungeon':type==='dwelling'?'watabou-dwelling':type==='cave'?'watabou-cave':type==='glade'?'watabou-glade':type==='wilderness'?'wilderness':'town';}
