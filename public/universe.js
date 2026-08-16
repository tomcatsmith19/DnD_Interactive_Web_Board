import {generatorRegistry,providerForType} from './universe-generators.js?v=16';

const firebaseConfig={apiKey:'AIzaSyDeUJ3781n8fi4QhVWvHAfeW7ueRqaw87E',authDomain:'dnd-interactive-web-board.firebaseapp.com',projectId:'dnd-interactive-web-board',storageBucket:'dnd-interactive-web-board.firebasestorage.app',messagingSenderId:'474147936717',appId:'1:474147936717:web:5a4101401f5bde9a368c84',measurementId:'G-G9KT6WQ5F4'};
const app=firebase.apps.length?firebase.app():firebase.initializeApp(firebaseConfig);
const auth=app.auth(),db=app.firestore();
const params=new URLSearchParams(location.search);
const campaignId=(params.get('campaign')||localStorage.getItem('selectedCampaignId')||'default').replace(/[^a-zA-Z0-9_-]/g,'').slice(0,80)||'default';
const isDm=(sessionStorage.getItem('vttRole')||'dm')==='dm';
const mapsRef=db.collection('campaigns').doc(campaignId).collection('universeMaps');
const host=document.getElementById('mapHost'),statusPanel=document.getElementById('statusPanel'),breadcrumbs=document.getElementById('breadcrumbs'),infoPanel=document.getElementById('infoPanel'),dialog=document.getElementById('mapDialog'),form=document.getElementById('mapForm');
const dmControls=document.getElementById('dmControls'),placementBanner=document.getElementById('placementBanner');
const maps=new Map(),generatedCache=new Map();
let currentMap=null,currentController=null,selectedMarker=null,placing=false,pendingPlacement=null,unsubscribe=null,previewMap=null,previewGenerated=null;

const defaults={world:{width:1536,height:1024},town:{size:'medium'},dungeon:{size:'medium'},dwelling:{tags:'medium'},cave:{tags:'medium,cave'},glade:{tags:'medium,glade'}};

function showStatus(title,message,action='') {statusPanel.hidden=false;statusPanel.replaceChildren();const heading=document.createElement('h2');heading.textContent=title;const text=document.createElement('p');text.textContent=message;statusPanel.append(heading,text);if(action&&(isDm||action==='Retry')){const button=document.createElement('button');button.className='gold-button';button.textContent=action;button.addEventListener('click',()=>action==='Retry'?renderCurrent():openCreateDialog(null,'world'));statusPanel.append(button);}}
function hideStatus(){statusPanel.hidden=true;}
function numericOrNull(value){return value===null||value===''||value===undefined||!Number.isFinite(Number(value))?null:Number(value);}
function validMap(raw,id){if(!raw||typeof raw!=='object')return null;const supported=['world','town','dungeon','dwelling','cave','glade'];const type=supported.includes(raw.type)?raw.type:'town';const generator=raw.generator&&typeof raw.generator==='object'?raw.generator:{};return{id:id||raw.id,name:String(raw.name||'Unnamed Location').slice(0,80),campaignId,parentMapId:raw.parentMapId||null,type,description:String(raw.description||'').slice(0,500),generator:{provider:generatorRegistry.has(generator.provider)?generator.provider:providerForType(type),version:String(generator.version||'generator-1'),seed:String(generator.seed||id||'seed').slice(0,100),params:generator.params&&typeof generator.params==='object'&&!Array.isArray(generator.params)?generator.params:{},permalink:typeof generator.permalink==='string'?generator.permalink:null},placement:{latitude:numericOrNull(raw.placement?.latitude),longitude:numericOrNull(raw.placement?.longitude),x:numericOrNull(raw.placement?.x),y:numericOrNull(raw.placement?.y)},createdAt:raw.createdAt||null,updatedAt:raw.updatedAt||null};}
function childrenOf(parentId){return[...maps.values()].filter(map=>map.parentMapId===parentId);}
function cacheKey(map){return JSON.stringify([map.generator.provider,map.generator.seed,map.generator.params,map.generator.permalink]);}

async function renderCurrent(){
  currentController?.destroy?.();currentController=null;infoPanel.hidden=true;selectedMarker=null;
  const displayedMap=previewMap||currentMap;if(!displayedMap){showEmpty();return;}
  showStatus('Generating map...',previewMap?`Previewing ${displayedMap.name}. Save Map when you want to keep it.`:`Loading ${displayedMap.name} from its saved permalink.`);renderBreadcrumbs();updateControls();
  try{const adapter=generatorRegistry.get(displayedMap.generator.provider)||generatorRegistry.get(providerForType(displayedMap.type));const key=cacheKey(displayedMap);let generated=generatedCache.get(key);if(!generated){generated=adapter.generate(displayedMap.generator.seed,{...displayedMap.generator.params,_permalink:displayedMap.generator.permalink});generatedCache.set(key,generated);}previewGenerated=previewMap?generated:null;currentController=adapter.render(host,generated,{children:childrenOf(displayedMap.id),onSelect:selectMarker,onPlace:handlePlacement,onOpenGeneratedTown:handleGeneratedTown});hideStatus();}
  catch(error){console.error(error);showStatus('Map generation failed',error.message||'This descriptor could not be rendered.','Retry');}
}

function showEmpty(){host.replaceChildren();breadcrumbs.replaceChildren();updateControls();showStatus('No world exists',isDm?'Create a deterministic world to begin this campaign universe.':'The Dungeon Master has not created a world yet.',isDm?'Create World':'');}
function renderBreadcrumbs(){breadcrumbs.replaceChildren();const chain=[],seen=new Set();let node=currentMap;while(node&&!seen.has(node.id)){seen.add(node.id);chain.unshift(node);node=node.parentMapId?maps.get(node.parentMapId):null;}chain.forEach((map,index)=>{if(index){const sep=document.createElement('span');sep.textContent='›';breadcrumbs.append(sep);}const button=document.createElement('button');button.type='button';button.textContent=map.name;button.addEventListener('click',()=>navigateTo(map.id));breadcrumbs.append(button);});}
function updateControls(){const hasMap=!!(previewMap||currentMap);dmControls.hidden=!isDm;document.getElementById('newWorldButton').hidden=!isDm;for(const id of ['regenerateButton','settingsButton'])document.getElementById(id).disabled=!hasMap;for(const id of ['addLocationButton','renameButton','deleteButton'])document.getElementById(id).disabled=!currentMap;document.getElementById('saveMapButton').disabled=!previewMap;document.getElementById('backButton').textContent=currentMap?.parentMapId?'← Parent':'← Menu';}
function updateUrl(mapId,push=true){const url=new URL(location.href);url.searchParams.set('campaign',campaignId);mapId?url.searchParams.set('map',mapId):url.searchParams.delete('map');history[push?'pushState':'replaceState']({mapId},'',url);}
function navigateTo(id,{push=true}={}){const next=maps.get(id);if(!next){showStatus('Map not found','This location may have been deleted or belongs to another campaign.');return;}previewMap=null;previewGenerated=null;currentMap=next;if(push)updateUrl(id,true);renderCurrent();}
function selectMarker(map){selectedMarker=map;document.getElementById('infoName').textContent=map.name;document.getElementById('infoType').textContent=map.type[0].toUpperCase()+map.type.slice(1);document.getElementById('infoDescription').textContent=map.description||'No description provided.';document.getElementById('editMarkerButton').hidden=!isDm;infoPanel.hidden=false;}
function handlePlacement(placement){if(!placing)return;placing=false;currentController?.setPlacementMode?.(false);placementBanner.hidden=true;pendingPlacement=placement;openCreateDialog(currentMap,'town');}

async function handleGeneratedTown(burg){
  const world=currentMap;if(!world||world.type!=='world')return;
  const stableTownUrl=burg.generatedUrl?ensureTownSeed(burg.generatedUrl,`${world.generator.seed}-${burg.id}`):null;
  const existing=childrenOf(world.id).find(map=>map.type==='town'&&String(map.generator.params?.azgaarBurgId)===String(burg.id));
  if(existing){
    if(isDm&&stableTownUrl&&(existing.generator.provider!=='azgaar-town'||!existing.generator.permalink)){
      const upgrade={generator:{provider:'azgaar-town',version:'1.143.2+992246f',seed:existing.generator.seed,params:{...existing.generator.params,generatedUrl:stableTownUrl},permalink:stableTownUrl},updatedAt:firebase.firestore.FieldValue.serverTimestamp()};
      await mapsRef.doc(existing.id).update(upgrade);existing.generator=upgrade.generator;
    }
    navigateTo(existing.id);return;
  }
  if(!isDm){showStatus('Town not available',`${burg.name} has not yet been added to the campaign hierarchy by the Dungeon Master.`);return;}
  if(!stableTownUrl){showStatus('Town map unavailable',`${burg.name} does not expose a generated town URL. Try reopening its burg editor after the Azgaar map finishes loading.`);return;}
  const id=mapsRef.doc().id,now=firebase.firestore.FieldValue.serverTimestamp();
  const town={id,campaignId,parentMapId:world.id,type:'town',name:String(burg.name||'Generated Town').slice(0,80),description:[burg.capital?'Capital settlement':burg.port?'Port settlement':'Settlement',burg.population?`Azgaar population index: ${burg.population}`:''].filter(Boolean).join('. '),generator:{provider:'azgaar-town',version:'1.143.2+992246f',seed:`${world.generator.seed}-burg-${burg.id}`.slice(0,100),params:{azgaarBurgId:burg.id,azgaarWorldSeed:world.generator.seed,generatedUrl:stableTownUrl},permalink:stableTownUrl},placement:{latitude:(.5-burg.y)*180,longitude:(burg.x-.5)*360,x:burg.x,y:burg.y},createdAt:now,updatedAt:now};
  try{await mapsRef.doc(id).set(town);maps.set(id,validMap(town,id));navigateTo(id);}
  catch(error){console.error(error);showStatus('Could not open town',error.message||'The generated town could not be saved.','Retry');}
}

function ensureTownSeed(value,fallbackSeed){
  try{const url=new URL(value),seed=url.searchParams.get('seed');if(!/^\d{1,15}$/.test(seed||''))url.searchParams.set('seed',String(stableNumericSeed(fallbackSeed)));url.searchParams.delete('preview');url.searchParams.set('random','0');return url.toString();}
  catch{return null;}
}

function stableNumericSeed(value){let hash=2166136261;for(const character of String(value)){hash^=character.charCodeAt(0);hash=Math.imul(hash,16777619);}return hash>>>0;}

function paramsFromControls(type){
  if(type==='world'){
    const resolutions={standard:{width:1536,height:1024},wide:{width:1920,height:1080},large:{width:2560,height:1440}};
    return resolutions[document.getElementById('worldResolution').value]||resolutions.standard;
  }
  const size=document.getElementById('mapSize').value;
  if(type==='dwelling')return{tags:size};
  if(type==='cave'||type==='glade')return{tags:`${size},${type}`};
  return{size};
}

function controlsFromParams(type,params={}){
  const resolution=Number(params.width)>=2500?'large':Number(params.width)>=1900?'wide':'standard';
  document.getElementById('worldResolution').value=resolution;
  const rawSize=String(params.size||params.tags||'medium').split(',')[0];
  document.getElementById('mapSize').value=['small','medium','large'].includes(rawSize)?rawSize:'medium';
  document.getElementById('worldResolutionField').hidden=type!=='world';
  document.getElementById('mapSizeField').hidden=type==='world';
}

function openCreateDialog(parent,type='town',existing=null){
  if(!isDm)return;
  const source=existing||(previewMap&&(!currentMap||previewMap.id===currentMap.id)?previewMap:null);
  pendingPlacement=source?.placement||pendingPlacement||{latitude:null,longitude:null,x:.5,y:.5};
  const selectedType=source?.type||type;
  document.getElementById('dialogTitle').textContent=source?'Generator Settings':selectedType==='world'?'Create World':'Add Location';
  document.getElementById('editingMapId').value=source?.id||'';
  document.getElementById('mapName').value=source?.name||'';
  document.getElementById('mapType').value=selectedType;
  document.getElementById('mapProvider').value=source?.generator.provider||providerForType(selectedType);
  document.getElementById('mapSeed').value=source?.generator.seed||`${selectedType}-${crypto.randomUUID?.()||Date.now()}`;
  document.getElementById('mapDescription').value=source?.description||'';
  document.getElementById('mapPermalink').value=source?.generator.permalink||'';
  document.getElementById('mapType').disabled=!!source||selectedType==='world';
  controlsFromParams(selectedType,source?.generator.params||defaults[selectedType]||{});
  document.getElementById('formError').textContent='';
  dialog.dataset.parentId=source?.parentMapId??parent?.id??'';
  dialog.showModal();document.getElementById('mapName').focus();
}

function syncProvider(){
  const type=document.getElementById('mapType').value;
  document.getElementById('mapProvider').value=providerForType(type);
  controlsFromParams(type,defaults[type]||{});
}

function validateForm(){
  const name=document.getElementById('mapName').value.trim(),seed=document.getElementById('mapSeed').value.trim(),type=document.getElementById('mapType').value,provider=document.getElementById('mapProvider').value,permalink=document.getElementById('mapPermalink').value.trim();
  if(!name||name.length>80)throw new Error('Enter a name of 1-80 characters.');
  if(!seed||seed.length>100)throw new Error('Enter a seed of 1-100 characters.');
  if(!['world','town','dungeon','dwelling','cave','glade'].includes(type))throw new Error('Invalid map type.');
  if(!generatorRegistry.has(provider))throw new Error('Choose an available Azgaar or Watabou generator.');
  if(permalink){const url=new URL(permalink);if(!['http:','https:'].includes(url.protocol))throw new Error('Permalink must use HTTP or HTTPS.');}
  return{name,seed,type,provider,permalink:permalink||null,params:paramsFromControls(type),description:document.getElementById('mapDescription').value.trim().slice(0,500)};
}

function previewFromForm(){
  const values=validateForm(),editingId=document.getElementById('editingMapId').value,id=editingId||mapsRef.doc().id,parentMapId=values.type==='world'?null:(dialog.dataset.parentId||currentMap?.id||null);
  if(parentMapId===id)throw new Error('A map cannot be its own parent.');
  const existing=maps.get(id);
  previewMap={id,campaignId,parentMapId,type:values.type,name:values.name,description:values.description,generator:{provider:values.provider,version:values.provider==='azgaar'?'1.143.2+992246f':'watabou-permalink',seed:values.seed,params:values.params,permalink:values.permalink},placement:values.type==='world'?{latitude:null,longitude:null,x:null,y:null}:(pendingPlacement||existing?.placement||{latitude:null,longitude:null,x:.5,y:.5}),createdAt:existing?.createdAt||null,updatedAt:null};
  previewGenerated=null;dialog.close();renderCurrent();
}

async function saveMap(){
  if(!isDm||!previewMap)return;
  const adapter=generatorRegistry.get(previewMap.generator.provider);const permalink=adapter?.getPermalink?.(previewGenerated)||previewMap.generator.permalink;
  const existing=maps.get(previewMap.id),payload={...previewMap,generator:{...previewMap.generator,permalink},updatedAt:firebase.firestore.FieldValue.serverTimestamp()};
  if(!existing)payload.createdAt=firebase.firestore.FieldValue.serverTimestamp();
  await mapsRef.doc(previewMap.id).set(payload,{merge:true});
  const saved=validMap({...payload,createdAt:existing?.createdAt||null,updatedAt:null},previewMap.id);maps.set(saved.id,saved);currentMap=saved;previewMap=null;previewGenerated=null;pendingPlacement=null;updateUrl(saved.id,!existing&&saved.type==='world');renderCurrent();
}
async function deleteCurrent(){if(!isDm||!currentMap)return;const descendants=[];const collect=id=>childrenOf(id).forEach(child=>{descendants.push(child);collect(child.id);});collect(currentMap.id);const message=descendants.length?`“${currentMap.name}” has ${descendants.length} child location(s). Delete it and every descendant? Cancel leaves everything unchanged.`:`Delete “${currentMap.name}”?`;if(!confirm(message))return;const parent=currentMap.parentMapId,targets=[...descendants,currentMap];for(let start=0;start<targets.length;start+=450){const batch=db.batch();targets.slice(start,start+450).forEach(map=>batch.delete(mapsRef.doc(map.id)));await batch.commit();}parent&&maps.has(parent)?navigateTo(parent):showEmpty();}
async function regenerate(){if(!isDm||(!currentMap&&!previewMap))return;const source=previewMap||currentMap,newSeed=`${Date.now()}-${Math.floor(Math.random()*1000000)}`;previewMap={...source,generator:{...source.generator,seed:newSeed.slice(0,100),permalink:null}};previewGenerated=null;renderCurrent();}
async function rename(){if(!isDm||!currentMap)return;const name=prompt('Location name:',currentMap.name)?.trim();if(!name)return;await mapsRef.doc(currentMap.id).set({name:name.slice(0,80),updatedAt:firebase.firestore.FieldValue.serverTimestamp()},{merge:true});}

document.getElementById('backButton').addEventListener('click',()=>{if(currentMap?.parentMapId)navigateTo(currentMap.parentMapId);else location.href='menu.html';});
document.getElementById('newWorldButton').addEventListener('click',()=>openCreateDialog(null,'world'));
document.getElementById('addLocationButton').addEventListener('click',()=>{if(!currentMap)return;placing=true;currentController?.setPlacementMode?.(true);placementBanner.hidden=false;infoPanel.hidden=true;});
document.getElementById('regenerateButton').addEventListener('click',regenerate);document.getElementById('saveMapButton').addEventListener('click',async()=>{try{await saveMap();}catch(error){showStatus('Could not save map',error.message||'The preview could not be saved.');}});document.getElementById('renameButton').addEventListener('click',rename);document.getElementById('settingsButton').addEventListener('click',()=>{const source=previewMap||currentMap;if(source)openCreateDialog(maps.get(source.parentMapId),source.type,source);});document.getElementById('deleteButton').addEventListener('click',deleteCurrent);
document.getElementById('openMarkerButton').addEventListener('click',()=>selectedMarker&&navigateTo(selectedMarker.id));document.getElementById('editMarkerButton').addEventListener('click',()=>selectedMarker&&openCreateDialog(currentMap,selectedMarker.type,selectedMarker));
document.getElementById('cancelDialog').addEventListener('click',()=>{pendingPlacement=null;dialog.close();});document.getElementById('mapType').addEventListener('change',syncProvider);document.getElementById('mapProvider').addEventListener('change',()=>controlsFromParams(document.getElementById('mapType').value,{}));form.addEventListener('submit',event=>{event.preventDefault();try{previewFromForm();}catch(error){document.getElementById('formError').textContent=error.message;}});
window.addEventListener('keydown',event=>{if(event.key==='Escape'&&placing){placing=false;currentController?.setPlacementMode?.(false);placementBanner.hidden=true;}});window.addEventListener('popstate',event=>{const id=event.state?.mapId||new URLSearchParams(location.search).get('map');id?navigateTo(id,{push:false}):showEmpty();});

auth.onAuthStateChanged(user=>{
  if(!user){location.href='index.html';return;}dmControls.hidden=!isDm;
  unsubscribe=mapsRef.onSnapshot(snapshot=>{const previous=currentMap?.id;maps.clear();snapshot.forEach(doc=>{const map=validMap(doc.data(),doc.id);if(map)maps.set(map.id,map);});const requested=new URLSearchParams(location.search).get('map');const root=[...maps.values()].find(map=>map.type==='world'&&!map.parentMapId);const target=(previous&&maps.get(previous))||(requested&&maps.get(requested))||root||null;currentMap=target;if(target){updateUrl(target.id,false);renderCurrent();}else showEmpty();},error=>{console.error(error);showStatus('Could not load universe',error.message||'Check your connection and try again.');});
});
window.addEventListener('beforeunload',()=>{unsubscribe?.();currentController?.destroy?.();});
