// Campaign folders contain independent board snapshots. The shared documents
// remain the live board so existing player subscriptions receive every switch.
const campaignRegistryRef = db.collection('shared').doc('campaignRegistry');
const campaignsRef = db.collection('campaigns');
const campaignStateKeys = ['monsters', 'map', 'drawings', 'fogOfWar', 'loot'];
let campaignRegistry = { activeId: '', activeMapId: '', campaigns: [] };
let campaignSwitchInProgress = false;
let customMapSaveInProgress = false;
let campaignManagerReady = false;
let addMapCampaignId = '';
let addMapReturnFocus = null;
const expandedCampaigns = new Set();

function setCampaignStatus(message) {
    document.getElementById('campaignStatus').textContent = message || '';
}

function campaignButton(label, title, action, className = '') {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = label;
    button.className = className;
    button.title = title;
    button.setAttribute('aria-label', title);
    button.disabled = campaignSwitchInProgress || !campaignManagerReady;
    button.addEventListener('click', action);
    return button;
}

function renderCampaignList() {
    const host = document.getElementById('campaignList');
    host.replaceChildren();
    document.getElementById('addCampaignButton').disabled = campaignSwitchInProgress || !campaignManagerReady;
    document.getElementById('confirmAddMapButton').disabled = campaignSwitchInProgress || customMapSaveInProgress || !campaignManagerReady;
    if (!campaignRegistry.campaigns.length) {
        const empty = document.createElement('p');
        empty.className = 'campaign-empty';
        empty.textContent = 'Add a campaign to organize your maps.';
        host.appendChild(empty);
    }
    campaignRegistry.campaigns.forEach(campaign => {
        const folder = document.createElement('section');
        folder.className = 'campaign-folder';
        const row = document.createElement('div');
        row.className = 'campaign-list-row';
        const expanded = expandedCampaigns.has(campaign.id);
        const toggle = campaignButton(`${expanded ? '▾' : '▸'} ${campaign.name}`, campaign.name, () => {
            if (expandedCampaigns.has(campaign.id)) expandedCampaigns.delete(campaign.id);
            else expandedCampaigns.add(campaign.id);
            renderCampaignList();
            document.getElementById(`campaign-toggle-${campaign.id}`)?.focus();
        });
        toggle.id = `campaign-toggle-${campaign.id}`;
        toggle.className = 'campaign-select';
        toggle.setAttribute('aria-expanded', String(expanded));
        toggle.setAttribute('aria-controls', `campaign-maps-${campaign.id}`);
        row.append(toggle,
            campaignButton('✎', `Rename ${campaign.name}`, () => renameCampaign(campaign.id), 'campaign-icon-button'),
            campaignButton('×', `Delete ${campaign.name}`, () => deleteCampaign(campaign.id), 'campaign-icon-button campaign-delete-button'));
        const maps = document.createElement('div');
        maps.id = `campaign-maps-${campaign.id}`;
        maps.className = 'campaign-maps';
        maps.hidden = !expanded;
        (campaign.maps || []).forEach(map => {
            const active = campaign.id === campaignRegistry.activeId && map.id === campaignRegistry.activeMapId;
            const mapRow = document.createElement('div');
            mapRow.className = `campaign-map-row${active ? ' is-active' : ''}`;
            const load = campaignButton(map.name, `Load and share ${map.name}`, () => switchCampaignMap(campaign.id, map.id));
            load.className = 'campaign-map-select';
            load.setAttribute('aria-current', active ? 'true' : 'false');
            mapRow.append(load, campaignButton('×', `Remove ${map.name} from ${campaign.name}`, () => removeCampaignMap(campaign.id, map.id), 'campaign-icon-button campaign-delete-button'));
            maps.appendChild(mapRow);
        });
        if (!campaign.maps?.length) {
            const empty = document.createElement('p');
            empty.className = 'campaign-empty';
            empty.textContent = 'No maps yet. Add a map to get started.';
            maps.appendChild(empty);
        }
        maps.appendChild(campaignButton('+ Add Map', `Add map to ${campaign.name}`, () => openAddCampaignMap(campaign.id), 'campaign-add-map-button'));
        folder.append(row, maps);
        host.appendChild(folder);
    });
}

async function campaignOperation(message, operation) {
    if (campaignSwitchInProgress || !campaignManagerReady) return false;
    campaignSwitchInProgress = true;
    renderCampaignList();
    setCampaignStatus(message);
    try {
        await operation();
        return true;
    } catch (error) {
        console.error(message, error);
        setCampaignStatus(error.message || 'Could not update campaigns. Please try again.');
        return false;
    } finally {
        campaignSwitchInProgress = false;
        renderCampaignList();
    }
}

function campaignMapRef(campaignId, mapId) {
    return campaignsRef.doc(campaignId).collection('maps').doc(mapId);
}

function sharedCampaignMapData(map) {
    const data = { ...map };
    delete data.tokenSize;
    return data;
}

function stageCampaignMapState(batch, campaignId, mapId, state) {
    const mapDoc = campaignMapRef(campaignId, mapId);
    campaignStateKeys.forEach(key => batch.set(mapDoc.collection('state').doc(key), key === 'map' ? sharedCampaignMapData(state?.map) : state?.[key] || {}));
    batch.set(mapDoc, { savedAt: firebase.firestore.FieldValue.serverTimestamp() }, { merge: true });
}

function stageCampaignRegistry(batch, registry) {
    batch.set(campaignRegistryRef, { ...registry, schemaVersion: 2, updatedAt: firebase.firestore.FieldValue.serverTimestamp() });
}

async function readSharedCampaignState() {
    const refs = [monstersRef, mapRef, db.collection('shared').doc('drawings'), db.collection('shared').doc('fogOfWar')];
    const snapshots = await Promise.all(refs.map(ref => ref.get()));
    return {
        monsters: snapshots[0].exists ? snapshots[0].data() : { monsters: [] },
        map: { filepath: currentSharedMapPath, mapScale: sharedMapScale, ...sharedCampaignMapData(snapshots[1].data()) },
        drawings: snapshots[2].exists ? snapshots[2].data() : { drawings: [] },
        fogOfWar: snapshots[3].exists ? snapshots[3].data() : { drawings: [] },
        loot: { cr: encounterLootCR, xp: encounterLootXP, trackedCreatureIds: Array.from(lootTrackedCreatureIds) }
    };
}

async function readCampaignState(campaignId, mapId) {
    // Without a map ID, read the pre-folder save for migration only.
    const stateRef = (mapId ? campaignMapRef(campaignId, mapId) : campaignsRef.doc(campaignId)).collection('state');
    const snapshots = await Promise.all(campaignStateKeys.map(key => stateRef.doc(key).get()));
    return Object.fromEntries(campaignStateKeys.map((key, index) => [key, snapshots[index].data() || {}]));
}

async function applyCampaignState(state, registry) {
    const batch = db.batch();
    const revision = Math.max(Date.now(), lastSyncedAt + 1);
    batch.set(monstersRef, { ...(state.monsters || {}), monsters: state.monsters?.monsters || [], revision, updatedAt: firebase.firestore.FieldValue.serverTimestamp() });
    batch.set(mapRef, { ...sharedCampaignMapData(state.map), filepath: state.map?.filepath || `${STATIC_MAP_PREFIX}blank.jpg`, mapScale: Number(state.map?.mapScale) || 1, updatedAt: firebase.firestore.FieldValue.serverTimestamp() });
    ['drawings', 'fogOfWar'].forEach(key => batch.set(db.collection('shared').doc(key), { ...(state[key] || {}), drawings: state[key]?.drawings || [], updatedAt: Date.now() }));
    stageCampaignRegistry(batch, registry);
    const pendingAdditions = new Map(pendingMonsterAdditions);
    const previousLootSuppression = suppressLootTrackingUntil;
    // Firestore emits local snapshots before commit resolves. Clear outgoing
    // additions first so they cannot be merged into the newly loaded board.
    pendingMonsterAdditions.clear();
    suppressLootTrackingUntil = Date.now() + 3000;
    try {
        await batch.commit();
    } catch (error) {
        pendingAdditions.forEach((monster, id) => pendingMonsterAdditions.set(id, monster));
        suppressLootTrackingUntil = previousLootSuppression;
        throw error;
    }
    encounterLootCR = Math.max(0, Number(state.loot?.cr) || 0);
    encounterLootXP = Math.max(0, Number(state.loot?.xp) || 0);
    lootTrackedCreatureIds.clear();
    (state.loot?.trackedCreatureIds || []).forEach(id => lootTrackedCreatureIds.add(id));
    updateLootEncounterFields();
}

async function switchCampaignMap(campaignId, mapId) {
    if (campaignId === campaignRegistry.activeId && mapId === campaignRegistry.activeMapId) return;
    const target = campaignRegistry.campaigns.find(item => item.id === campaignId)?.maps.find(item => item.id === mapId);
    if (!target) return;
    return campaignOperation('Saving and switching maps…', async () => {
        if (!(await campaignMapRef(campaignId, mapId).get()).exists) throw new Error('That map no longer exists.');
        const state = await readCampaignState(campaignId, mapId);
        if (!state.map?.filepath) throw new Error('This map has no saved board state.');
        if (campaignRegistry.activeId && campaignRegistry.activeMapId) {
            const batch = db.batch();
            stageCampaignMapState(batch, campaignRegistry.activeId, campaignRegistry.activeMapId, await readSharedCampaignState());
            await batch.commit();
        }
        const registry = { ...campaignRegistry, activeId: campaignId, activeMapId: mapId };
        await applyCampaignState(state, registry);
        campaignRegistry = registry;
        expandedCampaigns.add(campaignId);
        setCampaignStatus(`Loaded ${target.name} and shared it with all players.`);
    });
}

async function createCampaign() {
    if (!campaignManagerReady || campaignSwitchInProgress) return;
    const name = prompt('Campaign name:')?.trim();
    if (!name) return;
    await campaignOperation('Adding campaign…', async () => {
        const ref = campaignsRef.doc();
        const registry = { ...campaignRegistry, campaigns: [...campaignRegistry.campaigns, { id: ref.id, name, maps: [] }] };
        const batch = db.batch();
        batch.set(ref, { name, createdAt: firebase.firestore.FieldValue.serverTimestamp() });
        stageCampaignRegistry(batch, registry);
        await batch.commit();
        campaignRegistry = registry;
        expandedCampaigns.add(ref.id);
        setCampaignStatus(`Added ${name}. Add a map to this campaign.`);
    });
}

async function renameCampaign(campaignId) {
    const campaign = campaignRegistry.campaigns.find(item => item.id === campaignId);
    if (!campaign || campaignSwitchInProgress) return;
    const name = prompt('Rename campaign:', campaign.name)?.trim();
    if (!name || name === campaign.name) return;
    await campaignOperation('Renaming campaign…', async () => {
        const registry = { ...campaignRegistry, campaigns: campaignRegistry.campaigns.map(item => item.id === campaignId ? { ...item, name } : item) };
        const batch = db.batch();
        batch.set(campaignsRef.doc(campaignId), { name }, { merge: true });
        stageCampaignRegistry(batch, registry);
        await batch.commit();
        campaignRegistry = registry;
        setCampaignStatus(`Renamed campaign to ${name}.`);
    });
}

function openAddCampaignMap(campaignId) {
    const campaign = campaignRegistry.campaigns.find(item => item.id === campaignId);
    if (!campaign || campaignSwitchInProgress || !campaignManagerReady) return;
    addMapCampaignId = campaignId;
    addMapReturnFocus = document.activeElement;
    document.getElementById('addCampaignMapTitle').textContent = `Add Map to ${campaign.name}`;
    document.getElementById('campaignMapName').value = '';
    document.getElementById('addCampaignMapStatus').textContent = '';
    refreshCustomMapOptions();
    document.getElementById('addCampaignMapModal').showModal();
    mapSelect.focus();
}

function closeAddCampaignMap() {
    if (campaignSwitchInProgress || customMapSaveInProgress) return;
    document.getElementById('addCampaignMapModal').close();
    const campaignId = addMapCampaignId;
    addMapCampaignId = '';
    if (addMapReturnFocus?.isConnected) addMapReturnFocus.focus();
    else document.getElementById(`campaign-toggle-${campaignId}`)?.focus();
}

async function addCampaignMap() {
    if (customMapSaveInProgress) return;
    const campaign = campaignRegistry.campaigns.find(item => item.id === addMapCampaignId);
    const filepath = mapSelect.value;
    if (!campaign || !filepath) return;
    const name = document.getElementById('campaignMapName').value.trim() || mapSelect.selectedOptions[0]?.textContent || 'Map';
    const success = await campaignOperation('Adding map…', async () => {
        const ref = campaignsRef.doc(campaign.id).collection('maps').doc();
        const map = { id: ref.id, name };
        const registry = { ...campaignRegistry, campaigns: campaignRegistry.campaigns.map(item => item.id === campaign.id ? { ...item, maps: [...item.maps, map] } : item) };
        const batch = db.batch();
        stageCampaignMapState(batch, campaign.id, ref.id, {
            monsters: { monsters: [] }, map: { filepath, mapScale: 1 },
            drawings: { drawings: [] }, fogOfWar: { drawings: [] },
            loot: { cr: 0, xp: 0, trackedCreatureIds: [] }
        });
        batch.set(ref, { name }, { merge: true });
        stageCampaignRegistry(batch, registry);
        await batch.commit();
        campaignRegistry = registry;
        expandedCampaigns.add(campaign.id);
        setCampaignStatus(`Added ${name}. Click the map to load and share it.`);
    });
    if (success) closeAddCampaignMap();
    else document.getElementById('addCampaignMapStatus').textContent = document.getElementById('campaignStatus').textContent;
}

function stageRemoveCampaignMap(batch, campaignId, mapId) {
    const ref = campaignMapRef(campaignId, mapId);
    campaignStateKeys.forEach(key => batch.delete(ref.collection('state').doc(key)));
    batch.delete(ref);
}

async function removeCampaignMap(campaignId, mapId) {
    const campaign = campaignRegistry.campaigns.find(item => item.id === campaignId);
    const map = campaign?.maps.find(item => item.id === mapId);
    if (!map || campaignSwitchInProgress || !confirm(`Remove map “${map.name}” and its saved state from “${campaign.name}”? The map image stays in the library.`)) return;
    await campaignOperation('Removing map…', async () => {
        const active = campaignRegistry.activeId === campaignId && campaignRegistry.activeMapId === mapId;
        const registry = { ...campaignRegistry, campaigns: campaignRegistry.campaigns.map(item => item.id === campaignId ? { ...item, maps: item.maps.filter(savedMap => savedMap.id !== mapId) } : item) };
        if (active) { registry.activeId = ''; registry.activeMapId = ''; }
        const batch = db.batch();
        stageRemoveCampaignMap(batch, campaignId, mapId);
        stageCampaignRegistry(batch, registry);
        await batch.commit();
        campaignRegistry = registry;
        setCampaignStatus(`Removed ${map.name}.${active ? ' The current board stays shared until you load another map.' : ''}`);
    });
}

async function deleteCampaign(campaignId) {
    const campaign = campaignRegistry.campaigns.find(item => item.id === campaignId);
    if (!campaign || campaignSwitchInProgress || !confirm(`Delete campaign “${campaign.name}” and all ${campaign.maps.length} saved maps?`)) return;
    await campaignOperation('Deleting campaign…', async () => {
        const active = campaignRegistry.activeId === campaignId;
        // Keep remaining maps registered if a large deletion is interrupted.
        // Each chunk and its registry update commit together.
        for (let index = 0; index < campaign.maps.length; index += 60) {
            const removed = campaign.maps.slice(index, index + 60);
            const registry = { ...campaignRegistry, campaigns: campaignRegistry.campaigns.map(item => item.id === campaignId ? { ...item, maps: item.maps.filter(map => !removed.some(entry => entry.id === map.id)) } : item) };
            if (active && removed.some(map => map.id === registry.activeMapId)) { registry.activeId = ''; registry.activeMapId = ''; }
            const cleanup = db.batch();
            removed.forEach(map => stageRemoveCampaignMap(cleanup, campaignId, map.id));
            stageCampaignRegistry(cleanup, registry);
            await cleanup.commit();
            campaignRegistry = registry;
        }
        const registry = { ...campaignRegistry, campaigns: campaignRegistry.campaigns.filter(item => item.id !== campaignId) };
        if (active) { registry.activeId = ''; registry.activeMapId = ''; }
        const cleanup = db.batch();
        campaignStateKeys.forEach(key => cleanup.delete(campaignsRef.doc(campaignId).collection('state').doc(key)));
        cleanup.delete(campaignsRef.doc(campaignId));
        stageCampaignRegistry(cleanup, registry);
        await cleanup.commit();
        campaignRegistry = registry;
        expandedCampaigns.delete(campaignId);
        setCampaignStatus(`Deleted ${campaign.name}.${active ? ' The current board stays shared until you load another map.' : ''}`);
    });
}

function savedMapName(state) {
    const filepath = state.map?.filepath;
    const option = Array.from(mapSelect.options).find(item => item.value === filepath);
    if (option) return option.textContent;
    try { return decodeURIComponent((filepath || '').split('?')[0].split('/').pop()).replace(/\.[^.]+$/, '') || 'Saved Map'; }
    catch { return 'Saved Map'; }
}

async function initializeCampaignManager() {
    const sharedMap = await mapRef.get();
    if (sharedMap.exists && Object.hasOwn(sharedMap.data(), 'tokenSize')) {
        const cleanup = db.batch();
        cleanup.set(mapRef, { tokenSize: firebase.firestore.FieldValue.delete() }, { merge: true });
        await cleanup.commit();
    }
    const snapshot = await campaignRegistryRef.get();
    if (snapshot.exists && Array.isArray(snapshot.data().campaigns)) {
        campaignRegistry = { activeId: snapshot.data().activeId || '', activeMapId: snapshot.data().activeMapId || '', campaigns: snapshot.data().campaigns };
    } else {
        const ref = campaignsRef.doc();
        const state = await readSharedCampaignState();
        campaignRegistry = { activeId: ref.id, activeMapId: 'initial-map', campaigns: [{ id: ref.id, name: 'Main Campaign', maps: [{ id: 'initial-map', name: savedMapName(state) }] }] };
        const batch = db.batch();
        batch.set(ref, { name: 'Main Campaign', createdAt: firebase.firestore.FieldValue.serverTimestamp() });
        stageCampaignMapState(batch, ref.id, 'initial-map', state);
        stageCampaignRegistry(batch, campaignRegistry);
        await batch.commit();
    }
    // Migrate one folder at a time, atomically marking it complete. Retain old
    // state documents as a backup; the active campaign uses its latest live state.
    for (const campaign of campaignRegistry.campaigns) {
        if (Array.isArray(campaign.maps)) continue;
        const active = campaign.id === campaignRegistry.activeId;
        const state = active ? await readSharedCampaignState() : await readCampaignState(campaign.id);
        const registry = { ...campaignRegistry, campaigns: campaignRegistry.campaigns.map(item => item.id === campaign.id ? { ...item, maps: [{ id: 'initial-map', name: savedMapName(state) }] } : item) };
        if (active) registry.activeMapId = 'initial-map';
        const batch = db.batch();
        stageCampaignMapState(batch, campaign.id, 'initial-map', state);
        stageCampaignRegistry(batch, registry);
        await batch.commit();
        campaignRegistry = registry;
    }
    expandedCampaigns.add(campaignRegistry.activeId || campaignRegistry.campaigns[0]?.id);
    campaignManagerReady = true;
    renderCampaignList();
    setCampaignStatus('Click a map to load and share it. Changes are saved when switching maps.');
    campaignRegistryRef.onSnapshot(doc => {
        if (!doc.exists || campaignSwitchInProgress) return;
        const registry = doc.data();
        if (registry.schemaVersion !== 2) return;
        campaignRegistry = registry;
        renderCampaignList();
    }, error => setCampaignStatus(`Could not sync campaigns: ${error.message}`));
}

document.getElementById('addCampaignMapModal').addEventListener('cancel', event => {
    event.preventDefault();
    closeAddCampaignMap();
});
document.getElementById('addCampaignMapModal').addEventListener('click', event => {
    if (event.target === event.currentTarget) closeAddCampaignMap();
});

const campaignManagerInitialization = initializeCampaignManager().catch(error => {
    console.error('Failed to initialize campaigns:', error);
    setCampaignStatus('Could not load campaigns. Reload the page to try again.');
});
