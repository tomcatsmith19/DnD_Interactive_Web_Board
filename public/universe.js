import {generatorRegistry,providerForType} from './universe-generators.js?v=14';

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
let currentMap=null,currentController=null,selectedMarker=null,placing=false,pendingPlacement=null,unsubscribe=null;

const defaults={
  world:{width:1536,height:1024},town:{size:32,walled:true,river:false,coast:false,density:.65,palette:'parchment'},dungeon:{size:'medium'},dwelling:{tags:'medium'},cave:{tags:'medium,cave'},glade:{tags:'medium,glade'},wilderness:{biome:'forest',width:1000,height:700,density:.55,water:.2,paths:true,grid:true},other:{size:22,walled:false,density:.5}
};

function showStatus(title,message,action='') {statusPanel.hidden=false;statusPanel.replaceChildren();const heading=document.createElement('h2');heading.textContent=title;const text=document.createElement('p');text.textContent=message;statusPanel.append(heading,text);if(action&&(isDm||action==='Retry')){const button=document.createElement('button');button.className='gold-button';button.textContent=action;button.addEventListener('click',()=>action==='Retry'?renderCurrent():openCreateDialog(null,'world'));statusPanel.append(button);}}
function hideStatus(){statusPanel.hidden=true;}
function numericOrNull(value){return value===null||value===''||value===undefined||!Number.isFinite(Number(value))?null:Number(value);}
function validMap(raw,id){if(!raw||typeof raw!=='object')return null;const type=['world','town','dungeon','dwelling','cave','glade','wilderness','other'].includes(raw.type)?raw.type:'other';const generator=raw.generator&&typeof raw.generator==='object'?raw.generator:{};return{id:id||raw.id,name:String(raw.name||'Unnamed Location').slice(0,80),campaignId,parentMapId:raw.parentMapId||null,type,description:String(raw.description||'').slice(0,500),generator:{provider:generatorRegistry.has(generator.provider)?generator.provider:providerForType(type),version:String(generator.version||'local-1'),seed:String(generator.seed||id||'seed').slice(0,100),params:generator.params&&typeof generator.params==='object'&&!Array.isArray(generator.params)?generator.params:{},permalink:typeof generator.permalink==='string'?generator.permalink:null},placement:{latitude:numericOrNull(raw.placement?.latitude),longitude:numericOrNull(raw.placement?.longitude),x:numericOrNull(raw.placement?.x),y:numericOrNull(raw.placement?.y)},createdAt:raw.createdAt||null,updatedAt:raw.updatedAt||null};}
function childrenOf(parentId){return[...maps.values()].filter(map=>map.parentMapId===parentId);}
function cacheKey(map){return JSON.stringify([map.generator.provider,map.generator.seed,map.generator.params,map.generator.permalink]);}

async function renderCurrent(){
  currentController?.destroy?.();currentController=null;infoPanel.hidden=true;selectedMarker=null;
  if(!currentMap){showEmpty();return;}
  showStatus('Generating map…',`Regenerating ${currentMap.name} from its saved seed.`);renderBreadcrumbs();updateControls();
  try{const adapter=generatorRegistry.get(currentMap.generator.provider)||generatorRegistry.get(providerForType(currentMap.type));const key=cacheKey(currentMap);let generated=generatedCache.get(key);if(!generated){generated=adapter.generate(currentMap.generator.seed,{...currentMap.generator.params,_permalink:currentMap.generator.permalink});generatedCache.set(key,generated);}currentController=adapter.render(host,generated,{children:childrenOf(currentMap.id),onSelect:selectMarker,onPlace:handlePlacement,onOpenGeneratedTown:handleGeneratedTown});hideStatus();}
  catch(error){console.error(error);showStatus('Map generation failed',error.message||'This descriptor could not be rendered.','Retry');}
}

function showEmpty(){host.replaceChildren();breadcrumbs.replaceChildren();updateControls();showStatus('No world exists',isDm?'Create a deterministic world to begin this campaign universe.':'The Dungeon Master has not created a world yet.',isDm?'Create World':'');}
function renderBreadcrumbs(){breadcrumbs.replaceChildren();const chain=[],seen=new Set();let node=currentMap;while(node&&!seen.has(node.id)){seen.add(node.id);chain.unshift(node);node=node.parentMapId?maps.get(node.parentMapId):null;}chain.forEach((map,index)=>{if(index){const sep=document.createElement('span');sep.textContent='›';breadcrumbs.append(sep);}const button=document.createElement('button');button.type='button';button.textContent=map.name;button.addEventListener('click',()=>navigateTo(map.id));breadcrumbs.append(button);});}
function updateControls(){dmControls.hidden=!isDm;document.getElementById('newWorldButton').hidden=!isDm;for(const id of ['addLocationButton','regenerateButton','renameButton','settingsButton','deleteButton'])document.getElementById(id).disabled=!currentMap;document.getElementById('backButton').textContent=currentMap?.parentMapId?'← Parent':'← Menu';}
function updateUrl(mapId,push=true){const url=new URL(location.href);url.searchParams.set('campaign',campaignId);mapId?url.searchParams.set('map',mapId):url.searchParams.delete('map');history[push?'pushState':'replaceState']({mapId},'',url);}
function navigateTo(id,{push=true}={}){const next=maps.get(id);if(!next){showStatus('Map not found','This location may have been deleted or belongs to another campaign.');return;}currentMap=next;if(push)updateUrl(id,true);renderCurrent();}
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

function openCreateDialog(parent,type='town',existing=null){
  if(!isDm)return;pendingPlacement=existing?.placement||pendingPlacement||{latitude:null,longitude:null,x:.5,y:.5};
  document.getElementById('dialogTitle').textContent=existing?'Edit Location':type==='world'?'Create World':'Add Location';document.getElementById('editingMapId').value=existing?.id||'';document.getElementById('mapName').value=existing?.name||'';document.getElementById('mapType').value=existing?.type||type;document.getElementById('mapProvider').value=existing?.generator.provider||providerForType(type);document.getElementById('mapSeed').value=existing?.generator.seed||`${type}-${crypto.randomUUID?.()||Date.now()}`;document.getElementById('mapDescription').value=existing?.description||'';document.getElementById('mapParams').value=JSON.stringify(existing?.generator.params||defaults[type]||{},null,2);document.getElementById('mapPermalink').value=existing?.generator.permalink||'';document.getElementById('mapType').disabled=!!existing||type==='world';document.getElementById('formError').textContent='';dialog.dataset.parentId=existing?.parentMapId??parent?.id??'';dialog.showModal();document.getElementById('mapName').focus();
}
function syncProvider(){const type=document.getElementById('mapType').value;document.getElementById('mapProvider').value=providerForType(type);document.getElementById('mapParams').value=JSON.stringify(defaults[type]||{},null,2);}
function validateForm(){const name=document.getElementById('mapName').value.trim(),seed=document.getElementById('mapSeed').value.trim(),type=document.getElementById('mapType').value,provider=document.getElementById('mapProvider').value,permalink=document.getElementById('mapPermalink').value.trim();if(!name||name.length>80)throw new Error('Enter a name of 1–80 characters.');if(!seed||seed.length>100)throw new Error('Enter a seed of 1–100 characters.');if(!['world','town','dungeon','dwelling','cave','glade','wilderness','other'].includes(type))throw new Error('Invalid map type.');if(!generatorRegistry.has(provider))throw new Error('Invalid generator provider.');let generatorParams;try{generatorParams=JSON.parse(document.getElementById('mapParams').value||'{}');}catch{throw new Error('Generator Parameters must be valid JSON.');}if(!generatorParams||typeof generatorParams!=='object'||Array.isArray(generatorParams))throw new Error('Generator Parameters must be a JSON object.');if(JSON.stringify(generatorParams).length>12000)throw new Error('Generator Parameters are too large. Keep them below 12 KB.');if(permalink){const url=new URL(permalink);if(!['http:','https:'].includes(url.protocol))throw new Error('Permalink must use HTTP or HTTPS.');}return{name,seed,type,provider,permalink:permalink||null,params:generatorParams,description:document.getElementById('mapDescription').value.trim().slice(0,500)};}

async function saveMap(){
  const values=validateForm(),editingId=document.getElementById('editingMapId').value,id=editingId||mapsRef.doc().id,parentMapId=values.type==='world'?null:(dialog.dataset.parentId||currentMap?.id||null);if(parentMapId===id)throw new Error('A map cannot be its own parent.');const existing=maps.get(id);const version=values.provider.startsWith('azgaar')?'1.143.2+992246f':values.provider.startsWith('watabou-')?'watabou-permalink':'local-1';const payload={id,campaignId,parentMapId,type:values.type,name:values.name,description:values.description,generator:{provider:values.provider,version,seed:values.seed,params:values.params,permalink:values.permalink},placement:values.type==='world'?{latitude:null,longitude:null,x:null,y:null}:(pendingPlacement||existing?.placement||{latitude:null,longitude:null,x:.5,y:.5}),updatedAt:firebase.firestore.FieldValue.serverTimestamp()};if(!existing)payload.createdAt=firebase.firestore.FieldValue.serverTimestamp();await mapsRef.doc(id).set(payload,{merge:true});pendingPlacement=null;dialog.close();if(values.type==='world'||editingId===currentMap?.id)navigateTo(id,{push:values.type==='world'&&!editingId});}

async function deleteCurrent(){if(!isDm||!currentMap)return;const descendants=[];const collect=id=>childrenOf(id).forEach(child=>{descendants.push(child);collect(child.id);});collect(currentMap.id);const message=descendants.length?`“${currentMap.name}” has ${descendants.length} child location(s). Delete it and every descendant? Cancel leaves everything unchanged.`:`Delete “${currentMap.name}”?`;if(!confirm(message))return;const parent=currentMap.parentMapId,targets=[...descendants,currentMap];for(let start=0;start<targets.length;start+=450){const batch=db.batch();targets.slice(start,start+450).forEach(map=>batch.delete(mapsRef.doc(map.id)));await batch.commit();}parent&&maps.has(parent)?navigateTo(parent):showEmpty();}
async function regenerate(){if(!isDm||!currentMap)return;const seed=prompt('New deterministic seed:',currentMap.generator.seed);if(!seed)return;await mapsRef.doc(currentMap.id).set({'generator.seed':seed.slice(0,100),updatedAt:firebase.firestore.FieldValue.serverTimestamp()},{merge:true});}
async function rename(){if(!isDm||!currentMap)return;const name=prompt('Location name:',currentMap.name)?.trim();if(!name)return;await mapsRef.doc(currentMap.id).set({name:name.slice(0,80),updatedAt:firebase.firestore.FieldValue.serverTimestamp()},{merge:true});}

document.getElementById('backButton').addEventListener('click',()=>{if(currentMap?.parentMapId)navigateTo(currentMap.parentMapId);else location.href='menu.html';});
document.getElementById('newWorldButton').addEventListener('click',()=>openCreateDialog(null,'world'));
document.getElementById('addLocationButton').addEventListener('click',()=>{if(!currentMap)return;placing=true;currentController?.setPlacementMode?.(true);placementBanner.hidden=false;infoPanel.hidden=true;});
document.getElementById('regenerateButton').addEventListener('click',regenerate);document.getElementById('renameButton').addEventListener('click',rename);document.getElementById('settingsButton').addEventListener('click',()=>currentMap&&openCreateDialog(maps.get(currentMap.parentMapId),currentMap.type,currentMap));document.getElementById('deleteButton').addEventListener('click',deleteCurrent);
document.getElementById('openMarkerButton').addEventListener('click',()=>selectedMarker&&navigateTo(selectedMarker.id));document.getElementById('editMarkerButton').addEventListener('click',()=>selectedMarker&&openCreateDialog(currentMap,selectedMarker.type,selectedMarker));
document.getElementById('cancelDialog').addEventListener('click',()=>{pendingPlacement=null;dialog.close();});document.getElementById('mapType').addEventListener('change',syncProvider);form.addEventListener('submit',async event=>{event.preventDefault();try{await saveMap();}catch(error){document.getElementById('formError').textContent=error.message;}});
window.addEventListener('keydown',event=>{if(event.key==='Escape'&&placing){placing=false;currentController?.setPlacementMode?.(false);placementBanner.hidden=true;}});window.addEventListener('popstate',event=>{const id=event.state?.mapId||new URLSearchParams(location.search).get('map');id?navigateTo(id,{push:false}):showEmpty();});

auth.onAuthStateChanged(user=>{
  if(!user){location.href='index.html';return;}dmControls.hidden=!isDm;
  unsubscribe=mapsRef.onSnapshot(snapshot=>{const previous=currentMap?.id;maps.clear();snapshot.forEach(doc=>{const map=validMap(doc.data(),doc.id);if(map)maps.set(map.id,map);});const requested=new URLSearchParams(location.search).get('map');const root=[...maps.values()].find(map=>map.type==='world'&&!map.parentMapId);const target=(previous&&maps.get(previous))||(requested&&maps.get(requested))||root||null;currentMap=target;if(target){updateUrl(target.id,false);renderCurrent();}else showEmpty();},error=>{console.error(error);showStatus('Could not load universe',error.message||'Check your connection and try again.');});
});
window.addEventListener('beforeunload',()=>{unsubscribe?.();currentController?.destroy?.();});
