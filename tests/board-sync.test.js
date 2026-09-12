const assert = require('node:assert/strict');
const test = require('node:test');
const { createFirestore } = require('./helpers/fake-firestore');
const { create, actionPatch } = require('../public/board-sync');
const token = id => ({ id, name: id, hp: 30, maxHp: 30, isplayer: true, init: 10, ac: 12, conditions: [], xRatio: .5, yRatio: .5 });
async function fixture() {
    const store = createFirestore({
        'shared/map': { filepath: 'forest.jpg', mapScale: 1, tokenSize: 130 },
        'shared/monsters': { monsters: [token('a'), token('b')] },
        'shared/drawings': { drawings: [{ id: 'stroke1', points: [1, 2] }] },
        'shared/fogOfWar': { drawings: [] }
    });
    const first = create({ ...store, intervalMs: 0 }); await first.ready;
    const second = create({ ...store, intervalMs: 0 }); await second.ready;
    return { ...store, first, second, path: id => `boardStates/${first.generation}/tokens/${id}` };
}

test('migrates the live arrays once and sends only changed token fields', async () => {
    const f = await fixture(), start = f.writes.length;
    await f.first.patch('a', { xRatio: .2, yRatio: .3 });
    assert.deepEqual(f.writes.slice(start).map(write => ({ kind: write.kind, data: write.data, path: write.path })), [{ kind: 'update', data: { xRatio: .2, yRatio: .3 }, path: f.path('a') }]);
    assert.equal(f.first.generation, f.second.generation);
    assert.equal(f.documents.get('shared/map').tokenSize, undefined);
    assert.ok(f.documents.has('shared/monsters'), 'legacy backup remains intact');
    assert.equal((await f.first.exportState()).drawings.drawings[0].id, 'stroke1');
});

test('simultaneous moves of different tokens and independent fields never overwrite each other', async () => {
    const f = await fixture();
    await Promise.all([
        f.first.patch('a', { xRatio: .1, yRatio: .2 }),
        f.second.patch('b', { xRatio: .8, yRatio: .9 }),
        f.second.patch('a', { init: 21 }),
        f.first.patch('b', { ac: 19 })
    ]);
    assert.equal(f.documents.get(f.path('a')).xRatio, .1);
    assert.equal(f.documents.get(f.path('a')).init, 21);
    assert.equal(f.documents.get(f.path('b')).xRatio, .8);
    assert.equal(f.documents.get(f.path('b')).ac, 19);
});

test('concurrent damage/healing and condition actions compose against server values', async () => {
    const f = await fixture();
    await Promise.all([f.first.action(['a'], 'damage', 7), f.second.action(['a'], 'damage', 8)]);
    assert.equal(f.documents.get(f.path('a')).hp, 15);
    await Promise.all([f.first.action(['a'], 'heal', 3), f.second.action(['a'], 'heal', 4)]);
    assert.equal(f.documents.get(f.path('a')).hp, 22);
    await Promise.all([f.first.action(['a'], 'apply', 0, 'Prone'), f.second.action(['a'], 'apply', 0, 'Shield')]);
    assert.deepEqual(new Set(f.documents.get(f.path('a')).conditions), new Set(['Prone', 'Shield']));
    await Promise.all([f.first.action(['a'], 'remove', 0, 'Prone'), f.second.action(['a'], 'exhaustion', 0, '', 3)]);
    assert.deepEqual(new Set(f.documents.get(f.path('a')).conditions), new Set(['Shield', 'Exhaustion 3']));
});

test('stale field edits cannot recreate deleted tokens', async () => {
    const f = await fixture();
    await f.first.remove(['a']);
    const start = f.writes.length;
    await f.second.patch('a', { hp: 99 });
    assert.equal(f.documents.has(f.path('a')), false);
    assert.equal(f.writes.length, start);
});

test('drawing and fog operations write individual records and preserve concurrent additions', async () => {
    const f = await fixture();
    await Promise.all([f.first.addDrawing('drawings', { id: 'stroke2' }), f.second.addDrawing('drawings', { id: 'stroke3' }), f.second.addDrawing('fogOfWar', { id: 'fog1' })]);
    await f.first.removeDrawings('drawings', ['stroke1', 'stroke2']);
    const state = await f.first.exportState();
    assert.deepEqual(state.drawings.drawings.map(item => item.id), ['stroke3']);
    assert.deepEqual(state.fogOfWar.drawings.map(item => item.id), ['fog1']);
});

test('drawing patches move individual shared objects without replacing their shape data', async () => {
    const f = await fixture();
    await f.first.patchDrawings('drawings', new Map([['stroke1', { start: { x: .2, y: .3 }, end: { x: .4, y: .5 }, color: '#3366ff', rotation: 45 }]]));
    const drawing = (await f.first.exportState()).drawings.drawings.find(item => item.id === 'stroke1');
    assert.deepEqual(drawing.start, { x: .2, y: .3 });
    assert.deepEqual(drawing.end, { x: .4, y: .5 });
    assert.deepEqual(drawing.points, [1, 2]);
    assert.equal(drawing.color, '#3366ff');
    assert.equal(drawing.rotation, 45);
});

test('map switches freeze outgoing edits and reject late actions from the previous map', async () => {
    const f = await fixture(), old = f.first.generation;
    const next = await f.first.prepare({ map: { filepath: 'cave.jpg', mapScale: 2 }, monsters: { monsters: [token('a')] } });
    const lease = await f.first.lock();
    await assert.rejects(f.second.patch('b', { init: 99 }), /switching maps/);
    await f.first.publish(next, lease);
    assert.equal(f.second.generation, next.generation);
    await assert.rejects(f.second.patch('a', { hp: 1 }, old), /map changed/);
    assert.equal(f.documents.get(f.path('a')).hp, 30);
    assert.equal(f.documents.get(`boardStates/${old}/tokens/b`).init, 10);
});

test('a failed switch releases its lock and leaves the existing board usable', async () => {
    const f = await fixture(), old = f.first.generation;
    const next = await f.first.prepare({ map: { filepath: 'cave.jpg' } });
    const lease = await f.first.lock();
    f.fail('shared/map');
    await assert.rejects(f.first.publish(next, lease));
    f.fail(''); await f.first.unlock(lease);
    assert.equal(f.first.generation, old);
    await f.second.patch('a', { init: 15 });
    assert.equal(f.documents.get(f.path('a')).init, 15);
});

test('periodic full reconciliation recovers missed updates without uploading local state', async () => {
    const f = await fixture(); let seen;
    f.second.subscribe('tokens', tokens => { seen = tokens; });
    f.dropEvents(true);
    await f.first.patch('a', { init: 99 });
    assert.equal(seen.find(item => item.id === 'a').init, 10);
    const count = f.writes.length;
    await f.second.reconcile();
    assert.equal(seen.find(item => item.id === 'a').init, 99);
    assert.equal(f.writes.length, count);
    f.dropEvents(false);
});

test('a forced reconciliation reruns after an older refresh already in progress', async () => {
    const f = await fixture(); let seen;
    f.second.subscribe('tokens', tokens => { seen = tokens; });
    f.dropEvents(true);
    await f.first.patch('a', { init: 40 });
    const delayed = f.delayNextRead(`boardStates/${f.second.generation}/tokens`);
    const olderRefresh = f.second.reconcile(); await delayed.ready;
    await f.first.patch('a', { init: 50 });
    const forcedRefresh = f.second.reconcile({ force: true });
    delayed.release();
    await Promise.all([olderRefresh, forcedRefresh]);
    assert.equal(seen.find(item => item.id === 'a').init, 50);
    f.dropEvents(false);
});

test('offline actions fail explicitly and can be reconciled after reconnecting', async () => {
    const f = await fixture();
    f.offline(true);
    await assert.rejects(f.first.action(['a'], 'damage', 5), /Offline/);
    assert.equal(f.documents.get(f.path('a')).hp, 30);
    f.offline(false); await f.first.reconcile();
    await f.first.action(['a'], 'damage', 5);
    assert.equal(f.documents.get(f.path('a')).hp, 25);
});

test('health clamping and exhaustion use the latest record', () => {
    assert.equal(actionPatch({ ...token('npc'), isplayer: false }, 'damage', 50), null);
    assert.deepEqual(actionPatch(token('pc'), 'damage', 50), { hp: -20 });
    assert.deepEqual(actionPatch(token('pc'), 'heal', 50), { hp: 30 });
});

test('two clients migrating simultaneously choose one complete board', async () => {
    const store = createFirestore({ 'shared/monsters': { monsters: [token('a')] } });
    const first = create({ ...store, intervalMs: 0 }), second = create({ ...store, intervalMs: 0 });
    await Promise.all([first.ready, second.ready]);
    assert.equal(first.generation, second.generation);
    assert.equal((await second.exportState()).monsters.monsters[0].hp, 30);
    assert.equal((await first.exportState()).map.filepath, 'data/maps/blank.jpg');
});

test('live updates win over an older full-state request still in flight', async () => {
    const f = await fixture(); let seen;
    f.second.subscribe('tokens', tokens => { seen = tokens; });
    const delayed = f.delayNextRead(`boardStates/${f.second.generation}/tokens`);
    const refresh = f.second.reconcile(); await delayed.ready;
    await f.first.patch('a', { init: 24 });
    delayed.release(); await refresh;
    assert.equal(seen.find(item => item.id === 'a').init, 24);
});

test('a delayed pointer refresh cannot switch back to an older map', async () => {
    const f = await fixture(); let map;
    f.second.subscribeMap(value => { map = value; });
    const delayed = f.delayNextRead('shared/map');
    const refresh = f.second.reconcile(); await delayed.ready;
    const prepared = await f.first.prepare({ map: { filepath: 'new.jpg', mapScale: 2 } });
    const lease = await f.first.lock(); await f.first.publish(prepared, lease);
    delayed.release(); await refresh;
    assert.equal(f.second.generation, prepared.generation);
    assert.equal(map.filepath, 'new.jpg');
});

test('full refresh restores missed map image, scale, token, and drawing changes', async () => {
    const f = await fixture(); let map, seen;
    f.second.subscribeMap(value => { map = value; });
    f.second.subscribe('tokens', value => { seen = value; });
    f.dropEvents(true);
    const prepared = await f.first.prepare({ map: { filepath: 'new.jpg', mapScale: 2 }, monsters: { monsters: [token('c')] } });
    const lease = await f.first.lock(); await f.first.publish(prepared, lease);
    const count = f.writes.length;
    await f.second.reconcile();
    assert.equal(map.filepath, 'new.jpg'); assert.equal(map.mapScale, 2);
    assert.deepEqual(seen.map(item => item.id), ['c']);
    assert.equal(f.writes.length, count);
    f.dropEvents(false);
});

test('initial connection failure can recover without recreating the sync client', async () => {
    const store = createFirestore(); store.offline(true);
    const sync = create({ ...store, intervalMs: 0, onError() {} });
    await assert.rejects(sync.ready, /Offline/);
    store.offline(false); await sync.reconcile();
    await sync.add([token('a')]);
    assert.equal((await sync.exportState()).monsters.monsters[0].id, 'a');
});

test('the scheduled refresh runs automatically and stops on disposal', async t => {
    const f = await fixture();
    const sync = create({ ...f, intervalMs: 10 });
    t.after(() => sync.dispose()); await sync.ready;
    let finish;
    const recovered = new Promise(resolve => { finish = resolve; });
    sync.subscribe('tokens', tokens => { if (tokens.find(item => item.id === 'a')?.init === 99) finish(); });
    f.dropEvents(true); await f.first.patch('a', { init: 99 });
    const timeout = setTimeout(() => finish(Promise.reject(new Error('Scheduled refresh did not run'))), 2000);
    t.after(() => clearTimeout(timeout));
    await recovered; sync.dispose();
});

test('expired map-switch leases cannot publish a stale saved state', async () => {
    const f = await fixture(), generation = f.first.generation;
    const prepared = await f.first.prepare({ map: { filepath: 'new.jpg' } });
    const lease = await f.first.lock();
    f.documents.get('shared/map').switchLock.expiresAt = 0;
    await f.second.patch('a', { hp: 12 });
    await assert.rejects(f.first.publish(prepared, lease), /expired/);
    assert.equal(f.first.generation, generation);
    assert.equal(f.documents.get(f.path('a')).hp, 12);
});
