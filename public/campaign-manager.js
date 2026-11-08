// Campaign folders contain independent board snapshots. The shared documents
// remain the live board so existing player subscriptions receive every switch.
const campaignRegistryRef = db.collection('shared').doc('campaignRegistry');
const campaignsRef = db.collection('campaigns');
const campaignStateKeys = ['monsters', 'map', 'drawings', 'fogOfWar', 'stickers', 'loot'];
let campaignRegistry = { activeId: '', activeMapId: '', campaigns: [] };
let campaignSwitchInProgress = false;
let customMapSaveInProgress = false;
let campaignManagerReady = false;
let addMapCampaignId = '';
let addMapReturnFocus = null;
const expandedCampaigns = new Set();
const mapLocationIcons = { generic:'assets/generic_location.png', town:'assets/town_location.png', wild:'assets/wild_location.png', dungeon:'assets/dungeon_location.png' };
let activeMapLocations = [];
let mapLocationPlacement = null;
let mapLocationRefreshSerial = 0;
let mapLocationSaveInProgress = false;
let mapLocationEditingId = '';
const mapLocationHistory = [];

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

function campaignMapLocationButton(campaign, map) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'campaign-map-location-button';
    button.title = `Add a travel location to ${map.name}`;
    button.setAttribute('aria-label', button.title);
    button.disabled = campaignSwitchInProgress || !campaignManagerReady;
    const icon = document.createElement('img');
    icon.src = mapLocationIcons.generic;
    icon.alt = '';
    button.appendChild(icon);
    button.addEventListener('click', () => beginMapLocationPlacement(campaign.id, map.id));
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
            mapRow.append(load);
            if (active) mapRow.append(campaignMapLocationButton(campaign, map));
            mapRow.append(campaignButton('×', `Remove ${map.name} from ${campaign.name}`, () => removeCampaignMap(campaign.id, map.id), 'campaign-icon-button campaign-delete-button'));
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

function findCampaignMap(campaignId, mapId) {
    const campaign = campaignRegistry.campaigns.find(item => item.id === campaignId);
    return { campaign, map:campaign?.maps.find(item => item.id === mapId) };
}

function mapLocationsWithNames(locations) {
    return (Array.isArray(locations) ? locations : []).map(location => {
        const target = findCampaignMap(location.targetCampaignId, location.targetMapId).map;
        return target?.name && location.targetMapName !== target.name ? { ...location, targetMapName:target.name } : location;
    });
}

function renderMapLocations() {
    const layer = document.getElementById('mapLocationLayer');
    if (!layer) return;
    layer.replaceChildren();
    activeMapLocations.forEach(location => {
        const target = findCampaignMap(location.targetCampaignId, location.targetMapId).map;
        if (!target) return;
        const button = document.createElement('button');
        button.type = 'button';
        const iconName = mapLocationIcons[location.icon] ? location.icon : 'generic';
        const markerSize = Math.max(24, (Number(currentTokenSize) || 100) * .8);
        button.className = `map-location-marker map-location-${iconName}`;
        button.style.width = `${markerSize}px`;
        button.style.height = `${markerSize}px`;
        button.style.left = `${Math.max(0, Math.min(1, Number(location.xRatio) || 0)) * 100}%`;
        button.style.top = `${Math.max(0, Math.min(1, Number(location.yRatio) || 0)) * 100}%`;
        button.title = `Travel to ${target.name} (right-click to edit)`;
        button.setAttribute('data-destination-name', target.name);
        button.setAttribute('aria-label', `Travel to ${target.name}`);
        const image = document.createElement('img');
        image.src = mapLocationIcons[iconName];
        image.alt = '';
        button.appendChild(image);
        button.addEventListener('click', event => { event.stopPropagation(); activateMapLocation(location); });
        button.addEventListener('contextmenu', event => { event.preventDefault(); event.stopPropagation(); openMapLocationEditor(location); });
        layer.appendChild(button);
    });
}

function applySharedMapLocations(locations) {
    activeMapLocations = Array.isArray(locations) ? locations : [];
    renderMapLocations();
}

function refreshMapParentButton() {
    while (mapLocationHistory.length && !findCampaignMap(mapLocationHistory.at(-1).campaignId, mapLocationHistory.at(-1).mapId).map) mapLocationHistory.pop();
    const button = document.getElementById('mapParentLocationButton');
    if (!button) return;
    const parent = mapLocationHistory.at(-1);
    const target = parent && findCampaignMap(parent.campaignId, parent.mapId).map;
    button.disabled = !target || campaignSwitchInProgress;
    button.title = target ? `Return to ${target.name}` : 'Return to the previous marker map';
    button.setAttribute('aria-label', button.title);
}

async function returnToParentMap() {
    refreshMapParentButton();
    const parent = mapLocationHistory.at(-1);
    if (!parent || campaignSwitchInProgress) return false;
    const switched = await switchCampaignMap(parent.campaignId, parent.mapId, { preserveLocationHistory:true });
    if (switched) mapLocationHistory.pop();
    refreshMapParentButton();
    return switched;
}

async function refreshMapLocations() {
    const request = ++mapLocationRefreshSerial;
    const campaignId = campaignRegistry.activeId;
    const mapId = campaignRegistry.activeMapId;
    if (!campaignId || !mapId) { activeMapLocations = []; renderMapLocations(); return; }
    try {
        const stateRef = campaignMapRef(campaignId, mapId).collection('state').doc('map');
        const [snapshot, legacySnapshot] = await Promise.all([stateRef.get(), campaignMapRef(campaignId, mapId).get()]);
        if (request !== mapLocationRefreshSerial) return;
        const savedLocations = snapshot.data()?.locations;
        const legacyLocations = legacySnapshot.data()?.locations;
        const sourceLocations = Array.isArray(savedLocations) ? savedLocations : Array.isArray(legacyLocations) ? legacyLocations : [];
        activeMapLocations = mapLocationsWithNames(sourceLocations);
        const needsStateMigration = !Array.isArray(savedLocations) && Array.isArray(legacyLocations);
        const needsNameMigration = activeMapLocations.some((location, index) => location.targetMapName !== sourceLocations[index]?.targetMapName);
        if (needsStateMigration || needsNameMigration) {
            const batch = db.batch();
            batch.set(stateRef, { locations:activeMapLocations }, { merge:true });
            if (campaignId === campaignRegistry.activeId && mapId === campaignRegistry.activeMapId) batch.set(mapRef, { locations:activeMapLocations }, { merge:true });
            await batch.commit();
        }
        renderMapLocations();
    } catch (error) {
        if (request !== mapLocationRefreshSerial) return;
        console.error('Could not load map locations:', error);
        activeMapLocations = [];
        renderMapLocations();
    }
}

function beginMapLocationPlacement(campaignId, mapId) {
    const { campaign, map } = findCampaignMap(campaignId, mapId);
    if (!campaign || !map || campaignId !== campaignRegistry.activeId || mapId !== campaignRegistry.activeMapId || campaignSwitchInProgress) return;
    if ((campaign.maps || []).filter(item => item.id !== mapId).length < 1) {
        setCampaignStatus('Add another map to this campaign before creating a travel location.');
        return;
    }
    mapLocationEditingId = '';
    mapLocationPlacement = { sourceCampaignId:campaignId, sourceMapId:mapId, sourceMapName:map.name };
    document.getElementById('mapLocationPlacementLayer')?.classList.add('is-active');
    setCampaignStatus(`Click ${map.name} where the travel location should appear.`);
}

function populateMapLocationDestinations(sourceCampaignId, sourceMapId, selectedMapId = '') {
    const destination = document.getElementById('mapLocationDestination');
    destination.replaceChildren(new Option('Select a map', ''));
    const campaign = campaignRegistry.campaigns.find(item => item.id === sourceCampaignId);
    (campaign?.maps || []).filter(map => map.id !== sourceMapId).forEach(map => destination.appendChild(new Option(map.name, map.id)));
    destination.value = selectedMapId;
}

function chooseMapLocationPoint(event) {
    if (!mapLocationPlacement) return;
    const layer = document.getElementById('mapLocationPlacementLayer');
    const bounds = layer.getBoundingClientRect();
    mapLocationPlacement.xRatio = Math.max(0, Math.min(1, (event.clientX - bounds.left) / Math.max(1, bounds.width)));
    mapLocationPlacement.yRatio = Math.max(0, Math.min(1, (event.clientY - bounds.top) / Math.max(1, bounds.height)));
    layer.classList.remove('is-active');
    populateMapLocationDestinations(mapLocationPlacement.sourceCampaignId, mapLocationPlacement.sourceMapId);
    document.querySelectorAll('input[name="mapLocationIcon"]').forEach(input => { input.checked = false; });
    document.querySelector('.map-location-icon-picker').disabled = true;
    document.getElementById('saveMapLocationButton').disabled = true;
    document.getElementById('mapLocationDialogTitle').textContent = 'Add map location';
    document.getElementById('saveMapLocationButton').textContent = 'Add Location';
    document.getElementById('removeMapLocationButton').hidden = true;
    document.getElementById('mapLocationDialog').showModal();
}

function openMapLocationEditor(location) {
    const source = findCampaignMap(campaignRegistry.activeId, campaignRegistry.activeMapId).map;
    if (!source || !location || campaignSwitchInProgress) return;
    mapLocationEditingId = location.id;
    mapLocationPlacement = { sourceCampaignId:campaignRegistry.activeId, sourceMapId:campaignRegistry.activeMapId, sourceMapName:source.name, xRatio:location.xRatio, yRatio:location.yRatio };
    populateMapLocationDestinations(mapLocationPlacement.sourceCampaignId, mapLocationPlacement.sourceMapId, location.targetMapId);
    document.querySelectorAll('input[name="mapLocationIcon"]').forEach(input => { input.checked = input.value === location.icon; });
    document.getElementById('mapLocationDialogTitle').textContent = 'Edit map location';
    document.getElementById('saveMapLocationButton').textContent = 'Save Changes';
    document.getElementById('removeMapLocationButton').hidden = false;
    refreshMapLocationDialog();
    document.getElementById('mapLocationDialog').showModal();
}

function refreshMapLocationDialog() {
    const hasDestination = Boolean(document.getElementById('mapLocationDestination')?.value);
    const iconPicker = document.querySelector('.map-location-icon-picker');
    if (iconPicker) iconPicker.disabled = !hasDestination;
    const hasIcon = Boolean(document.querySelector('input[name="mapLocationIcon"]:checked'));
    const save = document.getElementById('saveMapLocationButton');
    if (save) save.disabled = !hasDestination || !hasIcon || mapLocationSaveInProgress;
    const remove = document.getElementById('removeMapLocationButton');
    if (remove) remove.disabled = mapLocationSaveInProgress;
}

function closeMapLocationDialog() {
    document.getElementById('mapLocationDialog')?.close();
    document.getElementById('mapLocationPlacementLayer')?.classList.remove('is-active');
    mapLocationPlacement = null;
    mapLocationEditingId = '';
    setCampaignStatus('');
}

async function saveMapLocation() {
    const destinationMapId = document.getElementById('mapLocationDestination')?.value;
    const icon = document.querySelector('input[name="mapLocationIcon"]:checked')?.value;
    const placement = mapLocationPlacement;
    if (!placement || !destinationMapId || !mapLocationIcons[icon] || mapLocationSaveInProgress) return;
    const target = findCampaignMap(placement.sourceCampaignId, destinationMapId).map;
    if (!target) return;
    mapLocationSaveInProgress = true;
    refreshMapLocationDialog();
    try {
        const stateRef = campaignMapRef(placement.sourceCampaignId, placement.sourceMapId).collection('state').doc('map');
        const snapshot = await stateRef.get();
        const locations = Array.isArray(snapshot.data()?.locations) ? snapshot.data().locations : activeMapLocations;
        const updatedLocation = { xRatio:placement.xRatio, yRatio:placement.yRatio, targetCampaignId:placement.sourceCampaignId, targetMapId:destinationMapId, targetMapName:target.name, icon };
        const next = mapLocationEditingId
            ? locations.map(location => location.id === mapLocationEditingId ? { ...location, ...updatedLocation } : location)
            : [...locations, { id:`location-${Date.now()}-${Math.random().toString(36).slice(2,8)}`, ...updatedLocation }];
        const batch = db.batch();
        batch.set(stateRef, { locations:next }, { merge:true });
        if (placement.sourceCampaignId === campaignRegistry.activeId && placement.sourceMapId === campaignRegistry.activeMapId) batch.set(mapRef, { locations:next }, { merge:true });
        await batch.commit();
        if (placement.sourceCampaignId === campaignRegistry.activeId && placement.sourceMapId === campaignRegistry.activeMapId) {
            activeMapLocations = next;
            renderMapLocations();
        }
        document.getElementById('mapLocationDialog').close();
        mapLocationPlacement = null;
        setCampaignStatus(`${mapLocationEditingId ? 'Updated' : 'Added'} a travel location to ${target.name}.`);
        mapLocationEditingId = '';
    } catch (error) {
        console.error('Could not save map location:', error);
        setCampaignStatus(error.message || 'Could not save this map location.');
    } finally {
        mapLocationSaveInProgress = false;
        refreshMapLocationDialog();
    }
}

async function removeMapLocation(locationId, requireConfirmation = true) {
    const location = activeMapLocations.find(item => item.id === locationId);
    const target = location && findCampaignMap(location.targetCampaignId, location.targetMapId).map;
    if (!location || (requireConfirmation && !confirm(`Remove the location for ${target?.name || 'this map'}?`))) return false;
    const next = activeMapLocations.filter(item => item.id !== locationId);
    try {
        const batch = db.batch();
        batch.set(campaignMapRef(campaignRegistry.activeId, campaignRegistry.activeMapId).collection('state').doc('map'), { locations:next }, { merge:true });
        batch.set(mapRef, { locations:next }, { merge:true });
        await batch.commit();
        activeMapLocations = next;
        renderMapLocations();
        return true;
    } catch (error) {
        console.error('Could not remove map location:', error);
        setCampaignStatus(error.message || 'Could not remove this map location.');
        return false;
    }
}

async function removeEditedMapLocation() {
    if (!mapLocationEditingId || mapLocationSaveInProgress) return;
    mapLocationSaveInProgress = true;
    refreshMapLocationDialog();
    const removed = await removeMapLocation(mapLocationEditingId, false);
    mapLocationSaveInProgress = false;
    if (removed) closeMapLocationDialog();
    else refreshMapLocationDialog();
}

async function activateMapLocation(location) {
    const target = findCampaignMap(location.targetCampaignId, location.targetMapId).map;
    if (!target || !confirm(`Are you sure you want to change maps to ${target.name}?`)) return;
    const parent = { campaignId:campaignRegistry.activeId, mapId:campaignRegistry.activeMapId };
    const switched = await switchCampaignMap(location.targetCampaignId, location.targetMapId, { preserveLocationHistory:true });
    if (switched) mapLocationHistory.push(parent);
    refreshMapParentButton();
}

async function campaignOperation(message, operation) {
    if (campaignSwitchInProgress || !campaignManagerReady) return false;
    campaignSwitchInProgress = true;
    renderCampaignList();
    refreshMapParentButton();
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
        refreshMapParentButton();
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
    await boardSync.ready;
    return { ...await boardSync.exportState(), loot: { cr: encounterLootCR, xp: encounterLootXP, trackedCreatureIds: Array.from(lootTrackedCreatureIds) } };
}

async function readCampaignState(campaignId, mapId) {
    // Without a map ID, read the pre-folder save for migration only.
    const stateRef = (mapId ? campaignMapRef(campaignId, mapId) : campaignsRef.doc(campaignId)).collection('state');
    const snapshots = await Promise.all(campaignStateKeys.map(key => stateRef.doc(key).get()));
    return Object.fromEntries(campaignStateKeys.map((key, index) => [key, snapshots[index].data() || {}]));
}

async function applyCampaignState(state, registry, prepared, lease) {
    suppressLootTrackingUntil = Date.now() + 3000;
    await boardSync.publish(prepared, lease, transaction => stageCampaignRegistry(transaction, registry));
    encounterLootCR = Math.max(0, Number(state.loot?.cr) || 0);
    encounterLootXP = Math.max(0, Number(state.loot?.xp) || 0);
    lootTrackedCreatureIds.clear();
    (state.loot?.trackedCreatureIds || []).forEach(id => lootTrackedCreatureIds.add(id));
    updateLootEncounterFields();
}

async function switchCampaignMap(campaignId, mapId, options = {}) {
    if (campaignId === campaignRegistry.activeId && mapId === campaignRegistry.activeMapId) return;
    const target = campaignRegistry.campaigns.find(item => item.id === campaignId)?.maps.find(item => item.id === mapId);
    if (!target) return;
    return campaignOperation('Saving and switching maps…', async () => {
        if (!(await campaignMapRef(campaignId, mapId).get()).exists) throw new Error('That map no longer exists.');
        const state = await readCampaignState(campaignId, mapId);
        if (!state.map?.filepath) throw new Error('This map has no saved board state.');
        // Stage the next board before pausing edits. Publishing its pointer is atomic.
        const prepared = await boardSync.prepare(state);
        const lease = await boardSync.lock();
        try {
            const currentRegistry = (await campaignRegistryRef.get({ source: 'server' })).data() || campaignRegistry;
            if (currentRegistry.activeId && currentRegistry.activeMapId) {
                const batch = db.batch();
                stageCampaignMapState(batch, currentRegistry.activeId, currentRegistry.activeMapId, await readSharedCampaignState());
                await batch.commit();
            }
            const registry = { ...currentRegistry, activeId: campaignId, activeMapId: mapId };
            await applyCampaignState(state, registry, prepared, lease);
            if (!options.preserveLocationHistory) mapLocationHistory.length = 0;
            campaignRegistry = registry;
            if (typeof loadCampaignGeneratorSettings === 'function') await loadCampaignGeneratorSettings(campaignId);
            expandedCampaigns.add(campaignId);
            await refreshMapLocations();
            refreshMapParentButton();
            setCampaignStatus(`Loaded ${target.name} and shared it with all players.`);
        } finally {
            await boardSync.unlock(lease);
        }
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
            drawings: { drawings: [] }, fogOfWar: { drawings: [] }, stickers: { stickers: [] },
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
        if (active) await refreshMapLocations();
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
        cleanup.delete(campaignsRef.doc(campaignId).collection('settings').doc('generators'));
        cleanup.delete(campaignsRef.doc(campaignId));
        stageCampaignRegistry(cleanup, registry);
        await cleanup.commit();
        campaignRegistry = registry;
        expandedCampaigns.delete(campaignId);
        if (active) await refreshMapLocations();
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
    await boardSync.ready;
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
    if (typeof loadCampaignGeneratorSettings === 'function') await loadCampaignGeneratorSettings(campaignRegistry.activeId);
    renderCampaignList();
    await refreshMapLocations();
    refreshMapParentButton();
    setCampaignStatus('Click a map to load and share it. Changes are saved when switching maps.');
    campaignRegistryRef.onSnapshot(doc => {
        if (!doc.exists || campaignSwitchInProgress) return;
        const registry = doc.data();
        if (registry.schemaVersion !== 2) return;
        const previousActiveId = campaignRegistry.activeId;
        const previousActiveMapId = campaignRegistry.activeMapId;
        campaignRegistry = registry;
        if (registry.activeId && registry.activeId !== previousActiveId && typeof loadCampaignGeneratorSettings === 'function') loadCampaignGeneratorSettings(registry.activeId);
        renderCampaignList();
        if (registry.activeId !== previousActiveId || registry.activeMapId !== previousActiveMapId) {
            mapLocationHistory.length = 0;
            refreshMapLocations();
            refreshMapParentButton();
        }
    }, error => setCampaignStatus(`Could not sync campaigns: ${error.message}`));
}

document.getElementById('addCampaignMapModal').addEventListener('cancel', event => {
    event.preventDefault();
    closeAddCampaignMap();
});
document.getElementById('addCampaignMapModal').addEventListener('click', event => {
    if (event.target === event.currentTarget) closeAddCampaignMap();
});
document.getElementById('mapLocationPlacementLayer').addEventListener('click', chooseMapLocationPoint);
document.getElementById('mapParentLocationButton').addEventListener('click', () => returnToParentMap());
document.getElementById('mapLocationDestination').addEventListener('change', refreshMapLocationDialog);
document.getElementById('mapLocationDialog').addEventListener('change', refreshMapLocationDialog);
document.getElementById('mapLocationDialog').addEventListener('cancel', event => {
    event.preventDefault();
    closeMapLocationDialog();
});
document.getElementById('mapLocationDialog').addEventListener('click', event => {
    if (event.target === event.currentTarget) closeMapLocationDialog();
});

const campaignManagerInitialization = initializeCampaignManager().catch(error => {
    console.error('Failed to initialize campaigns:', error);
    setCampaignStatus('Could not load campaigns. Reload the page to try again.');
});
