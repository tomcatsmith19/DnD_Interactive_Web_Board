const assert = require('node:assert/strict');
const test = require('node:test');
const fs = require('node:fs');
const vm = require('node:vm');

const copy = value => value === undefined ? undefined : JSON.parse(JSON.stringify(value));
const keys = ['monsters', 'map', 'drawings', 'fogOfWar', 'loot'];
const board = (filepath, hp = 18) => ({
    monsters: { monsters: [{ id: 'hero', name: 'Hero', hp, init: 17, isplayer: true, xRatio: .2, yRatio: .7, conditions: ['Hidden'] }] },
    map: { filepath, mapScale: 1.7, tokenSize: 130 },
    drawings: { drawings: [{ id: 'line', points: [.1, .2] }] },
    fogOfWar: { drawings: [{ id: 'fog', points: [.4, .5] }] },
    loot: { cr: 2, xp: 450, trackedCreatureIds: ['goblin'] }
});

async function fixture(seed = {}) {
    const documents = new Map(Object.entries(copy(seed)));
    const listeners = new Map();
    const batches = [];
    let nextId = 0, failPath = '';
    const snapshot = path => ({ exists: documents.has(path), data: () => copy(documents.get(path)) });
    const ref = path => ({
        path, id: path.split('/').pop(),
        collection: name => collection(`${path}/${name}`),
        get: async () => snapshot(path),
        onSnapshot: callback => { listeners.set(path, callback); callback(snapshot(path)); }
    });
    const collection = path => ({ doc: id => ref(`${path}/${id || `id-${++nextId}`}`) });
    const db = {
        collection,
        batch() {
            const writes = [];
            return {
                set: (target, data, options) => writes.push({ path: target.path, data: copy(data), merge: options?.merge }),
                delete: target => writes.push({ path: target.path, remove: true }),
                async commit() {
                    if (failPath && writes.some(write => write.path === failPath)) throw new Error('Simulated write failure');
                    assert.ok(writes.length <= 500, 'Firestore batch limit respected');
                    writes.forEach(write => {
                        if (write.remove) documents.delete(write.path);
                        else {
                            const data = write.merge ? { ...documents.get(write.path), ...write.data } : write.data;
                            Object.keys(data).forEach(key => { if (data[key]?.__deleteField) delete data[key]; });
                            documents.set(write.path, data);
                        }
                    });
                    batches.push(writes);
                    writes.forEach(write => listeners.get(write.path)?.(snapshot(write.path)));
                }
            };
        }
    };
    const elements = new Map();
    class Element {
        constructor() { this.children = []; this.listeners = {}; this.value = ''; this.textContent = ''; this.classList = { contains: () => false }; }
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
        getElementById: id => { if (!elements.has(id)) { const element = new Element(); element.id = id; } return elements.get(id); }
    };
    const select = document.getElementById('mapSelect');
    select.options = [{ value: 'maps/forest.jpg', textContent: 'Forest' }, { value: 'maps/cave.jpg', textContent: 'Cave' }];
    select.value = 'maps/forest.jpg';
    Object.defineProperty(select, 'selectedOptions', { get: () => select.options.filter(option => option.value === select.value) });
    const context = vm.createContext({
        db, document, console: { error() {} },
        firebase: { firestore: { FieldValue: { serverTimestamp: () => 123, delete: () => ({ __deleteField: true }) } } },
        monstersRef: ref('shared/monsters'), mapRef: ref('shared/map'),
        currentSharedMapPath: 'maps/forest.jpg', sharedMapScale: 1, currentTokenSize: 100,
        mapSelect: select, STATIC_MAP_PREFIX: 'maps/', lastSyncedAt: Date.now() + 100,
        encounterLootCR: 2, encounterLootXP: 450, lootTrackedCreatureIds: new Set(['goblin']),
        pendingMonsterAdditions: new Map(), suppressLootTrackingUntil: 0,
        updateLootEncounterFields() {}, refreshCustomMapOptions() {}, closeDistributedCreator() {},
        prompt: () => 'New Campaign', confirm: () => true
    });
    vm.runInContext(fs.readFileSync('public/campaign-manager.js', 'utf8'), context);
    await vm.runInContext('campaignManagerInitialization', context);
    return {
        context, documents, elements, batches, select,
        run: code => vm.runInContext(code, context),
        registry: () => copy(vm.runInContext('campaignRegistry', context)),
        fail: path => { failPath = path; }
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
    assert.deepEqual(app.documents.get('shared/map'), expectedMap);
    assert.equal(app.documents.get('campaigns/a/maps/initial-map/state/map').tokenSize, undefined);
    assert.equal(app.documents.get('campaigns/b/maps/initial-map/state/map').tokenSize, undefined);
    const reload = await fixture(Object.fromEntries(app.documents));
    assert.equal(reload.batches.length, 0);
    assert.deepEqual(reload.registry(), app.registry());
});

test('switching saves outgoing edits and publishes every incoming state component together', async () => {
    const app = await fixture(seedLegacy());
    await app.run("switchCampaignMap('b', 'initial-map')");
    assert.equal(app.documents.get('shared/monsters').monsters[0].hp, 30);
    assert.equal(app.documents.get('shared/map').tokenSize, undefined);
    assert.equal(app.documents.get('shared/map').mapScale, 1.7);
    assert.deepEqual(app.documents.get('shared/drawings').drawings, board('').drawings.drawings);
    assert.deepEqual(app.documents.get('shared/fogOfWar').drawings, board('').fogOfWar.drawings);
    const published = app.batches.at(-1).map(write => write.path);
    for (const path of ['shared/monsters', 'shared/map', 'shared/drawings', 'shared/fogOfWar', 'shared/campaignRegistry']) assert.ok(published.includes(path));
    app.documents.get('shared/monsters').monsters[0].hp = 25;
    app.documents.get('shared/map').tokenSize = 160;
    await app.run("switchCampaignMap('a', 'initial-map')");
    assert.equal(app.documents.get('shared/monsters').monsters[0].hp, 9);
    await app.run("switchCampaignMap('b', 'initial-map')");
    assert.equal(app.documents.get('shared/monsters').monsters[0].hp, 25);
    assert.equal(app.documents.get('shared/map').tokenSize, undefined);
    assert.equal(app.documents.get('campaigns/b/maps/initial-map/state/map').tokenSize, undefined);
    assert.equal(app.context.currentTokenSize, 100);
    assert.equal(app.context.encounterLootXP, 450);
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
    assert.deepEqual(app.documents.get('shared/monsters').monsters, []);
    assert.equal(app.documents.get('shared/map').tokenSize, undefined);
    assert.deepEqual(app.documents.get('shared/fogOfWar').drawings, []);
    await app.run("switchCampaignMap('a', 'initial-map')");
    assert.equal(app.documents.get('shared/monsters').monsters[0].hp, 9);
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
    assert.equal(app.context.pendingMonsterAdditions.size, 0);
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
    assert.equal(app.documents.get('shared/monsters').monsters[0].hp, 30);
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
        const callback = html.match(/mapRef\.onSnapshot\(doc => \{([\s\S]*?)\n\s*\}\);/)[1];
        const context = {
            doc: { exists: true, data: () => ({ filepath: 'maps/cave.jpg', tokenSize: 170, mapScale: 2 }) },
            currentTokenSize: 100, sharedMapScale: 1, mapImage: {}, currentSharedMapPath: '',
            mapSelect: { options: [] }, document: { getElementById: () => ({ open: false }) },
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
