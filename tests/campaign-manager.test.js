const assert = require('node:assert/strict');
const test = require('node:test');
const fs = require('node:fs');
const vm = require('node:vm');
const { createFirestore } = require('./helpers/fake-firestore');
const { create: createBoardSync, mapData } = require('../public/board-sync');

const copy = value => value === undefined ? undefined : JSON.parse(JSON.stringify(value));
const keys = ['monsters', 'map', 'drawings', 'fogOfWar', 'stickers', 'loot'];
const board = (filepath, hp = 18) => ({
    monsters: { monsters: [{ id: 'hero', name: 'Hero', hp, init: 17, isplayer: true, xRatio: .2, yRatio: .7, conditions: ['Hidden'] }] },
    map: { filepath, mapScale: 1.7, tokenSize: 130 },
    drawings: { drawings: [{ id: 'line', points: [.1, .2] }] },
    fogOfWar: { drawings: [{ id: 'fog', points: [.4, .5] }] },
    stickers: { stickers: [{ id: 'tree', name: 'Tree', storagePath: 'sticker-library/v1/tree.webp', x: .5, y: .5, widthRatio: .1, heightRatio: .1 }] },
    loot: { cr: 2, xp: 450, trackedCreatureIds: ['goblin'] }
});

async function fixture(seed = {}) {
    const store = createFirestore(seed);
    const { db, documents, batches } = store;
    const boardSync = createBoardSync({ ...store, intervalMs: 0 });
    await boardSync.ready;
    const elements = new Map();
    class Element {
        constructor() { this.children = []; this.listeners = {}; this.value = ''; this.textContent = ''; this.style = {}; this.classList = { contains: () => false, add() {}, remove() {} }; }
        set id(value) { this._id = value; elements.set(value, this); }
        get id() { return this._id; }
        append(...children) { this.children.push(...children); }
        appendChild(child) { this.append(child); }
        replaceChildren() { this.children = []; }
        setAttribute(key, value) { this[key] = value; }
        addEventListener(key, action) { this.listeners[key] = action; }
        focus() { document.activeElement = this; }
        showModal() { this.open = true; }
        close() { this.open = false; }
    }
    const document = {
        activeElement: null,
        createElement: () => new Element(),
        getElementById: id => { if (!elements.has(id)) { const element = new Element(); element.id = id; } return elements.get(id); },
        querySelector: selector => selector === '.map-location-icon-picker' ? document.getElementById('mapLocationIconPicker') : selector === 'input[name="mapLocationIcon"]:checked' ? document.getElementById('mapLocationIconChoice') : null,
        querySelectorAll: () => []
    };
    document.getElementById('mapLocationIconChoice').value = 'town';
    document.getElementById('mapLocationIconChoice').checked = true;
    const select = document.getElementById('mapSelect');
    select.options = [{ value: 'maps/forest.jpg', textContent: 'Forest' }, { value: 'maps/cave.jpg', textContent: 'Cave' }];
    select.value = 'maps/forest.jpg';
    Object.defineProperty(select, 'selectedOptions', { get: () => select.options.filter(option => option.value === select.value) });
    const context = vm.createContext({
        db, boardSync, document, console: { error() {} },
        firebase: store.firebase, mapRef: db.collection('shared').doc('map'),
        currentSharedMapPath: 'maps/forest.jpg', sharedMapScale: 1, currentTokenSize: 100,
        mapSelect: select, STATIC_MAP_PREFIX: 'maps/', lastSyncedAt: Date.now() + 100,
        pendingMonsterAdditions: new Map(), suppressLootTrackingUntil: 0,
        updateLootEncounterFields() {}, refreshCustomMapOptions() {}, closeDistributedCreator() {},
        prompt: () => 'New Campaign', confirm: () => true
    });
    // Execute the actual DM declarations; mocks must not hide missing globals.
    const dm = fs.readFileSync('public/dm.html', 'utf8');
    vm.runInContext(dm.slice(dm.indexOf('// Loot state shared'), dm.indexOf('function getCreatureCR(')), context);
    vm.runInContext("encounterLootCR = 2; encounterLootXP = 450; lootTrackedCreatureIds.add('goblin');", context);
    vm.runInContext(fs.readFileSync('public/campaign-manager.js', 'utf8'), context);
    await vm.runInContext('campaignManagerInitialization', context);
    return {
        context, documents, elements, batches, select, boardSync,
        token: id => documents.get(`boardStates/${boardSync.generation}/tokens/${id}`),
        run: code => vm.runInContext(code, context),
        registry: () => copy(vm.runInContext('campaignRegistry', context)),
        fail: store.fail
    };
}

function seedLegacy() {
    const seed = { 'shared/campaignRegistry': { activeId: 'a', campaigns: [{ id: 'a', name: 'First' }, { id: 'b', name: 'Second' }] } };
    for (const [prefix, state] of [['shared', board('maps/forest.jpg', 9)], ['campaigns/a/state', board('maps/forest.jpg', 18)], ['campaigns/b/state', board('maps/cave.jpg', 30)]]) {
        keys.forEach(key => { seed[`${prefix}/${key}`] = state[key]; });
    }
    return seed;
}

test('migrates old campaigns without losing the live board or inactive saves; reload is idempotent', async () => {
    const seed = seedLegacy();
    const app = await fixture(seed);
    assert.equal(app.registry().activeMapId, 'initial-map');
    assert.equal(app.registry().campaigns[0].maps[0].name, 'Forest');
    assert.equal(app.documents.get('campaigns/a/maps/initial-map/state/monsters').monsters[0].hp, 9);
    assert.equal(app.documents.get('campaigns/b/maps/initial-map/state/monsters').monsters[0].hp, 30);
    assert.deepEqual(app.documents.get('campaigns/a/state/monsters'), seed['campaigns/a/state/monsters']);
    const expectedMap = copy(seed['shared/map']);
    delete expectedMap.tokenSize;
    assert.deepEqual(mapData(app.documents.get('shared/map')), expectedMap);
    assert.equal(app.documents.get('campaigns/a/maps/initial-map/state/map').tokenSize, undefined);
    assert.equal(app.documents.get('campaigns/b/maps/initial-map/state/map').tokenSize, undefined);
    const reload = await fixture(Object.fromEntries(app.documents));
    assert.equal(reload.batches.length, 0);
    assert.deepEqual(reload.registry(), app.registry());
});

test('switching saves outgoing edits and publishes every incoming state component together', async () => {
    const app = await fixture(seedLegacy());
    await app.run("switchCampaignMap('b', 'initial-map')");
    assert.equal(app.token('hero').hp, 30);
    assert.equal(app.documents.get('shared/map').tokenSize, undefined);
    assert.equal(app.documents.get('shared/map').mapScale, 1.7);
    const incoming = await app.boardSync.exportState();
    assert.deepEqual(incoming.drawings.drawings.map(({ _order, ...drawing }) => drawing), board('').drawings.drawings);
    assert.deepEqual(incoming.fogOfWar.drawings.map(({ _order, ...drawing }) => drawing), board('').fogOfWar.drawings);
    const published = app.batches.at(-1).map(write => write.path);
    assert.deepEqual(published, ['shared/map', 'shared/campaignRegistry']);
    await app.boardSync.patch('hero', { hp: 25 });
    app.documents.get('shared/map').tokenSize = 160;
    await app.run("switchCampaignMap('a', 'initial-map')");
    assert.equal(app.token('hero').hp, 9);
    await app.run("switchCampaignMap('b', 'initial-map')");
    assert.equal(app.token('hero').hp, 25);
    assert.equal(app.documents.get('shared/map').tokenSize, undefined);
    assert.equal(app.documents.get('campaigns/b/maps/initial-map/state/map').tokenSize, undefined);
    assert.equal(app.context.currentTokenSize, 100);
    assert.equal(app.run('encounterLootXP'), 450);
});

test('folder toggling and adding maps never changes the shared board; duplicate images have independent states', async () => {
    const app = await fixture(seedLegacy());
    const before = copy(app.documents.get('shared/map'));
    const writes = app.batches.length;
    app.elements.get('campaign-toggle-a').listeners.click();
    assert.equal(app.batches.length, writes);
    app.run("openAddCampaignMap('a')");
    app.elements.get('campaignMapName').value = 'Forest Ambush';
    await app.run('addCampaignMap()');
    assert.deepEqual(app.documents.get('shared/map'), before);
    assert.equal(app.registry().campaigns[0].maps.length, 2);
    const added = app.registry().campaigns[0].maps[1];
    assert.equal(added.name, 'Forest Ambush');
    await app.run(`switchCampaignMap('a', '${added.id}')`);
    assert.deepEqual((await app.boardSync.exportState()).monsters.monsters, []);
    assert.equal(app.documents.get('shared/map').tokenSize, undefined);
    assert.deepEqual((await app.boardSync.exportState()).fogOfWar.drawings, []);
    await app.run("switchCampaignMap('a', 'initial-map')");
    assert.equal(app.token('hero').hp, 9);
});

test('map locations persist an icon and switch through the existing confirmed campaign path', async () => {
    const app = await fixture(seedLegacy());
    app.run("openAddCampaignMap('a')");
    app.select.value = 'maps/cave.jpg';
    app.elements.get('campaignMapName').value = 'Cave Entrance';
    await app.run('addCampaignMap()');
    const destination = app.registry().campaigns.find(campaign => campaign.id === 'a').maps.at(-1);
    app.elements.get('mapLocationDestination').value = destination.id;
    app.run("mapLocationPlacement={sourceCampaignId:'a',sourceMapId:'initial-map',sourceMapName:'Forest',xRatio:.35,yRatio:.6}");
    await app.run('saveMapLocation()');
    const locations = app.documents.get('campaigns/a/maps/initial-map/state/map').locations;
    assert.equal(locations.length, 1);
    assert.deepEqual({ targetMapId:locations[0].targetMapId, icon:locations[0].icon, xRatio:locations[0].xRatio, yRatio:locations[0].yRatio }, { targetMapId:destination.id, icon:'town', xRatio:.35, yRatio:.6 });
    assert.equal(locations[0].targetMapName, 'Cave Entrance');
    assert.deepEqual(app.documents.get('shared/map').locations, locations);
    let marker = app.elements.get('mapLocationLayer').children[0];
    assert.equal(marker.className, 'map-location-marker map-location-town');
    assert.equal(marker.style.width, '80px');
    app.context.currentTokenSize = 150;
    app.run('renderMapLocations()');
    marker = app.elements.get('mapLocationLayer').children[0];
    assert.equal(marker.style.width, '120px');
    assert.equal(marker['data-destination-name'], 'Cave Entrance');
    let confirmation = '';
    app.context.confirm = message => { confirmation = message; return true; };
    await app.run('activateMapLocation(activeMapLocations[0])');
    assert.equal(confirmation, 'Are you sure you want to change maps to Cave Entrance?');
    assert.equal(app.registry().activeMapId, destination.id);
    assert.deepEqual(app.documents.get('shared/map').locations || [], []);
    assert.equal(app.documents.get('campaigns/a/maps/initial-map/state/map').locations.length, 1);
    assert.equal(app.elements.get('mapParentLocationButton').disabled, false);
    assert.equal(app.elements.get('mapParentLocationButton').title, 'Return to Forest');
    assert.equal(await app.run('returnToParentMap()'), true);
    assert.equal(app.registry().activeMapId, 'initial-map');
    assert.equal(app.elements.get('mapParentLocationButton').disabled, true);
});

test('older map locations gain their full destination name for player sharing', async () => {
    const seed = seedLegacy();
    seed['campaigns/a/maps/initial-map'] = { locations:[{ id:'old-location', xRatio:.2, yRatio:.3, targetCampaignId:'b', targetMapId:'initial-map', icon:'dungeon' }] };
    const app = await fixture(seed);
    const saved = app.documents.get('campaigns/a/maps/initial-map/state/map').locations;
    assert.equal(saved[0].targetMapName, 'Cave');
    assert.equal(app.documents.get('shared/map').locations[0].targetMapName, 'Cave');
});

test('DM can edit a marker destination icon or remove it from the map state', async () => {
    const app = await fixture(seedLegacy());
    app.run("openAddCampaignMap('a')");
    app.select.value = 'maps/cave.jpg';
    app.elements.get('campaignMapName').value = 'Cave Entrance';
    await app.run('addCampaignMap()');
    const destination = app.registry().campaigns[0].maps.at(-1);
    app.elements.get('mapLocationDestination').value = destination.id;
    app.run("mapLocationPlacement={sourceCampaignId:'a',sourceMapId:'initial-map',sourceMapName:'Forest',xRatio:.4,yRatio:.5}");
    await app.run('saveMapLocation()');
    const id = app.documents.get('shared/map').locations[0].id;
    app.elements.get('mapLocationIconChoice').value = 'dungeon';
    app.run(`mapLocationEditingId='${id}';mapLocationPlacement={sourceCampaignId:'a',sourceMapId:'initial-map',sourceMapName:'Forest',xRatio:.4,yRatio:.5}`);
    await app.run('saveMapLocation()');
    assert.equal(app.documents.get('shared/map').locations.length, 1);
    assert.equal(app.documents.get('shared/map').locations[0].icon, 'dungeon');
    app.run(`mapLocationEditingId='${id}'`);
    await app.run('removeEditedMapLocation()');
    assert.deepEqual(app.documents.get('shared/map').locations, []);
    assert.deepEqual(app.documents.get('campaigns/a/maps/initial-map/state/map').locations, []);
});

test('failed saves and failed publication leave the active map and live board intact', async () => {
    const app = await fixture(seedLegacy());
    const before = copy(app.documents.get('shared/map'));
    app.fail('campaigns/a/maps/initial-map/state/monsters');
    assert.equal(await app.run("switchCampaignMap('b', 'initial-map')"), false);
    assert.equal(app.registry().activeId, 'a');
    assert.deepEqual(app.documents.get('shared/map'), before);
    app.fail('shared/campaignRegistry');
    app.context.pendingMonsterAdditions.set('pending', { id: 'pending' });
    assert.equal(await app.run("switchCampaignMap('b', 'initial-map')"), false);
    assert.ok(app.context.pendingMonsterAdditions.has('pending'));
    assert.equal(app.registry().activeId, 'a');
    assert.deepEqual(app.documents.get('shared/map'), before);
    app.fail('');
    assert.equal(await app.run("switchCampaignMap('b', 'initial-map')"), true);
});

test('removing the active map keeps players on the current board and deletes only that saved map', async () => {
    const app = await fixture(seedLegacy());
    const before = copy(app.documents.get('shared/map'));
    await app.run("removeCampaignMap('a', 'initial-map')");
    assert.deepEqual(app.registry().campaigns[0].maps, []);
    assert.equal(app.registry().activeMapId, '');
    assert.deepEqual(app.documents.get('shared/map'), before);
    assert.ok(!Array.from(app.documents.keys()).some(path => path.startsWith('campaigns/a/maps/initial-map')));
    assert.ok(app.documents.has('campaigns/b/maps/initial-map'));
    await app.run("switchCampaignMap('b', 'initial-map')");
    assert.equal(app.registry().activeId, 'b');
    assert.equal(app.token('hero').hp, 30);
});

test('create, rename, delete, and reload empty folders', async () => {
    const app = await fixture(seedLegacy());
    await app.run('createCampaign()');
    const id = app.registry().campaigns.at(-1).id;
    assert.deepEqual(app.registry().campaigns.at(-1).maps, []);
    app.context.prompt = () => 'Renamed';
    await app.run(`renameCampaign('${id}')`);
    assert.equal(app.registry().campaigns.at(-1).name, 'Renamed');
    for (const campaign of app.registry().campaigns) await app.run(`deleteCampaign('${campaign.id}')`);
    assert.deepEqual(app.registry().campaigns, []);
    assert.ok(!Array.from(app.documents.keys()).some(path => path.startsWith('campaigns/')));
    const reload = await fixture(Object.fromEntries(app.documents));
    assert.deepEqual(reload.registry().campaigns, []);
});

test('rapid map clicks cannot overlap a switch', async () => {
    const app = await fixture(seedLegacy());
    const results = await Promise.all([app.run("switchCampaignMap('b', 'initial-map')"), app.run("switchCampaignMap('b', 'initial-map')")]);
    assert.deepEqual(results, [true, false]);
    assert.equal(app.registry().activeId, 'b');
});

test('large campaign deletion stays within batch limits and can resume after an interrupted cleanup', async () => {
    const seed = { 'shared/campaignRegistry': { schemaVersion: 2, activeId: 'large', activeMapId: 'map-70', campaigns: [{ id: 'large', name: 'Large', maps: Array.from({ length: 90 }, (_, index) => ({ id: `map-${index}`, name: `Map ${index}` })) }] } };
    for (let index = 0; index < 90; index++) {
        seed[`campaigns/large/maps/map-${index}`] = { name: `Map ${index}` };
        keys.forEach(key => { seed[`campaigns/large/maps/map-${index}/state/${key}`] = board('maps/forest.jpg')[key]; });
    }
    const app = await fixture(seed);
    app.fail('campaigns/large/maps/map-70');
    await app.run("deleteCampaign('large')");
    assert.equal(app.registry().campaigns[0].maps.length, 30);
    assert.equal(app.registry().activeMapId, 'map-70');
    assert.ok(app.documents.has('campaigns/large/maps/map-70'));
    app.fail('');
    await app.run("deleteCampaign('large')");
    assert.deepEqual(app.registry().campaigns, []);
    assert.ok(!Array.from(app.documents.keys()).some(path => path.startsWith('campaigns/')));
});

test('DM and player scripts preserve local token size while applying shared maps and map scale', () => {
    for (const file of ['public/dm.html', 'public/player.html']) {
        const html = fs.readFileSync(file, 'utf8');
        const inlineScripts = Array.from(html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi))
            .filter(match => !/\bsrc=|type="module"/.test(match[1])).map(match => match[2]);
        new vm.Script(inlineScripts.join('\n'), { filename: file });
        if (file.endsWith('dm.html')) new vm.Script(inlineScripts.join('\n') + '\n' + fs.readFileSync('public/campaign-manager.js', 'utf8'));
        const callback = html.match(/boardSync\.subscribeMap\(sharedMap => \{([\s\S]*?)\n\s*\}\);/)[1];
        const context = {
            sharedMap: { filepath: 'maps/cave.jpg', tokenSize: 170, mapScale: 2 },
            currentTokenSize: 100, sharedMapScale: 1, mapImage: { getAttribute() { return this.src; } }, currentSharedMapPath: '',
            mapSelect: { options: [] }, document: { getElementById: () => ({ open: false }) },
            setMapMediaSource(source) { context.mapImage.src = source; },
            applySharedMapScale() {}, scheduleMapLayoutRefresh() {}
        };
        vm.runInNewContext(`(function () {${callback}})()`, context);
        assert.equal(context.currentTokenSize, 100);
        assert.equal(context.sharedMapScale, 2);
        assert.equal(context.mapImage.src, 'maps/cave.jpg');
        const resizeBody = html.match(/function updateAllTokenSizes\(\) \{([\s\S]*?)\n\s*\}/)[1];
        let refreshes = 0;
        vm.runInNewContext(`(function () {${resizeBody}})()`, { refreshMapLayout: () => refreshes++ });
        assert.equal(refreshes, 1);
    }
});

test('custom maps support WebM media and foldered dropdown groups', () => {
    const dm = fs.readFileSync('public/dm.html', 'utf8');
    const player = fs.readFileSync('public/player.html', 'utf8');
    assert.match(dm, /accept="image\/\*,video\/webm,\.webm"/);
    assert.match(dm, /id="customMapFolder"/);
    assert.match(dm, /Custom — \$\{folder\}/);
    assert.match(dm, /id="mapVideo"[^>]*autoplay loop muted playsinline/);
    assert.match(player, /id="mapVideo"[^>]*autoplay loop muted playsinline/);
    assert.match(dm, /setMapMediaSource\(currentSharedMapPath\)/);
    assert.match(player, /setMapMediaSource\(sharedMap\.filepath\)/);
});

test('DM campaign maps expose the four location marker assets and placement UI', () => {
    const dm = fs.readFileSync('public/dm.html', 'utf8');
    const player = fs.readFileSync('public/player.html', 'utf8');
    const manager = fs.readFileSync('public/campaign-manager.js', 'utf8');
    for (const name of ['generic','town','wild','dungeon']) {
        assert.ok(fs.existsSync(`public/assets/${name}_location.png`));
        assert.match(dm, new RegExp(`assets/${name}_location\\.png`));
        assert.match(player, new RegExp(`assets/${name}_location\\.png`));
    }
    assert.match(dm, /id="mapLocationLayer"[\s\S]*?id="mapLocationPlacementLayer"/);
    assert.match(dm, /id="mapLocationDialog"[\s\S]*?id="mapLocationDestination"[\s\S]*?id="saveMapLocationButton"/);
    assert.match(dm, /id="refreshBoardState"[\s\S]*?Token Size/);
    assert.match(dm, /id="mapParentLocationButton"[\s\S]*?Map Scale/);
    assert.match(dm, /mapLocationThemeFilter[\s\S]*?mapLocationTownFilter[\s\S]*?mapLocationWildFilter[\s\S]*?mapLocationDungeonFilter/);
    assert.match(manager, /campaignMapLocationButton\(campaign, map\)/);
    assert.match(manager, /contextmenu[\s\S]*?openMapLocationEditor\(location\)/);
    assert.match(dm, /id="removeMapLocationButton"[\s\S]*?Remove Location/);
    assert.match(manager, /markerSize = Math\.max\(24, \(Number\(currentTokenSize\) \|\| 100\) \* \.8\)/);
    assert.match(manager, /returnToParentMap\(\)/);
    assert.match(manager, /collection\('state'\)\.doc\('map'\)/);
    assert.match(manager, /confirm\(`Are you sure you want to change maps to \$\{target\.name\}\?`\)/);
    assert.match(player, /id="playerMapLocationLayer"/);
    assert.match(player, /playerMapLocations = Array\.isArray\(sharedMap\.locations\)/);
    assert.match(player, /const destinationName = playerMapLocationName\(location\)/);
    assert.match(player, /playerCampaignMapNames\.get\(`\$\{location\.targetCampaignId\}\/\$\{location\.targetMapId\}`\)/);
    assert.doesNotMatch(player, /location\.targetMapName \|\| location\.targetMapId/);
    assert.match(dm, /\.map-location-marker:hover::after/);
    assert.match(player, /\.map-location-marker:hover::after/);
});
