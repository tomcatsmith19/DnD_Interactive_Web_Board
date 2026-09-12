const assert = require('node:assert/strict');
const test = require('node:test');
const fs = require('node:fs');
const vm = require('node:vm');
const { createFirestore } = require('./helpers/fake-firestore');
const { create } = require('../public/board-sync');

async function fixture(role = 'player') {
    const token = id => ({ id, name: id, hp: 30, maxHp: 30, init: 10, xRatio: .5, yRatio: .5, isplayer: true });
    const store = createFirestore({ 'shared/monsters': { monsters: [token('a'), token('b')] } });
    const boardSync = create({ ...store, intervalMs: 0 }); await boardSync.ready;
    const elements = new Map(), events = {}, counts = { trackers: 0 };
    function element(id) {
        const node = { id, dataset: {}, style: {}, classList: { toggle() {} },
            querySelector: () => ({ style: {} }), remove: () => elements.delete(id) };
        elements.set(id, node); return node;
    }
    const document = {
        activeElement: null,
        getElementById: id => elements.get(id),
        createElement: () => element('boardSyncStatus'),
        body: { appendChild() {} },
        addEventListener: (name, callback) => { events[name] = callback; }
    };
    const context = vm.createContext({
        document, boardSync, setTimeout, console: { error() {} },
        monsters: [], selectedMapTokenIds: new Set(), currentPlayerId: 'a', currentTokenSize: 100,
        suppressLootTrackingUntil: 0, pendingMonsterAdditions: new Map(), mapWidth: 1000, mapHeight: 1000,
        mapImage: { clientWidth: 1000, clientHeight: 1000 },
        normalizeMonsterState: data => ({ ...data }),
        TokenActions: { renderTokenConditions() {}, tokenSize: () => 100 },
        addMonsterToken: token => element(`token-${token.id}`),
        updateTokenHealthBar() {}, updateTokenDefeatedState() {}, recordCreatureForLoot() {},
        flashToken() {}, showTokenDeathEffect() {}, refreshMapTokenSelection() {},
        updatePlayerTokenInitiativeLabels() {}, showCurrentPlayerStats() {}, scheduleMapLayoutRefresh() {},
        renderPartyTracker: () => counts.trackers++, updateMonsterTable: () => counts.trackers++
    });
    const html = fs.readFileSync(`public/${role}.html`, 'utf8');
    vm.runInContext(html.slice(html.indexOf('function positionTokenElement('), html.indexOf('function refreshMapLayout(')), context);
    vm.runInContext(fs.readFileSync('public/board-ui.js', 'utf8'), context);
    vm.runInContext(`initializeBoardUI('${role}')`, context);
    return { ...store, context, boardSync, document, elements, counts, events, token };
}

for (const role of ['dm', 'player']) {
    test(`${role}: incoming changes preserve the token DOM and an active drag`, async () => {
        const f = await fixture(role);
        const token = f.context.monsters.find(item => item.id === 'a');
        const node = f.elements.get('token-a');
        node.dataset.dragging = 'true'; node.style.left = '600px'; token.xRatio = .65;
        await f.boardSync.patch('b', { xRatio: .9, init: 20 });
        await f.boardSync.patch('a', { hp: 18, xRatio: .1 });
        assert.equal(f.context.monsters.find(item => item.id === 'a'), token);
        assert.equal(f.elements.get('token-a'), node);
        assert.equal(token.hp, 18); assert.equal(token.xRatio, .65);
        assert.equal(node.style.left, '600px');
        assert.equal(f.elements.get('token-b').style.left, '850px');
        node.dataset.dragging = 'false';
        await f.boardSync.reconcile();
        assert.equal(node.style.left, '50px');
    });

    test(`${role}: tracker editing survives updates, but a map switch replaces the old controls`, async () => {
        const f = await fixture(role), before = f.counts.trackers;
        const oldToken = f.context.monsters.find(item => item.id === 'a');
        f.document.activeElement = { closest: () => true };
        await f.boardSync.patch('b', { init: 21 });
        assert.equal(f.counts.trackers, before);
        f.document.activeElement = null;
        f.events.focusout({ target: { closest: () => true } });
        await new Promise(resolve => setTimeout(resolve, 5));
        assert.ok(f.counts.trackers > before);
        f.document.activeElement = { closest: () => true };
        const count = f.counts.trackers;
        const next = await f.boardSync.prepare({ map: { filepath: 'cave.jpg' }, monsters: { monsters: [f.token('a')] } });
        const lease = await f.boardSync.lock(); await f.boardSync.publish(next, lease);
        assert.ok(f.counts.trackers > count);
        assert.notEqual(f.context.monsters[0], oldToken);
        f.context.oldGeneration = oldToken._boardGeneration;
        assert.equal(await vm.runInContext("syncMonsterFieldsToFirebase('a', { hp: 1 }, oldGeneration)", f.context), false);
        assert.equal((await f.boardSync.exportState()).monsters.monsters[0].hp, 30);
    });
}

test('failed token writes display an error and do not upload stale local state', async () => {
    const f = await fixture();
    f.fail(`boardStates/${f.boardSync.generation}/tokens/a`);
    const before = f.writes.length;
    assert.equal(await vm.runInContext("syncMonsterFieldsToFirebase('a', { hp: 1 })", f.context), false);
    assert.match(f.elements.get('boardSyncStatus').textContent, /Could not sync/);
    assert.equal(f.writes.length, before);
    assert.equal((await f.boardSync.exportState()).monsters.monsters[0].hp, 30);
});

test('token drags stream intermediate positions and clear the shared measurement on release', async () => {
    const f = await fixture('player');
    vm.runInContext("dragSession = beginMonsterDrag(['a']); monsters[0].xRatio = .6; updateMonsterDrag(dragSession)", f.context);
    await new Promise(resolve => setTimeout(resolve, 70));
    vm.runInContext("monsters[0].xRatio = .7; updateMonsterDrag(dragSession)", f.context);
    await new Promise(resolve => setTimeout(resolve, 70));
    vm.runInContext('endMonsterDrag(dragSession)', f.context);
    await new Promise(resolve => setTimeout(resolve, 70));

    const tokenWrites = f.writes.filter(write => write.path === `boardStates/${f.boardSync.generation}/tokens/a` && write.kind === 'update');
    assert.ok(tokenWrites.some(write => write.data.dragActive === true && write.data.xRatio < .7));
    assert.ok(tokenWrites.some(write => write.data.dragActive === true && write.data.xRatio === .7));
    const saved = (await f.boardSync.exportState()).monsters.monsters.find(token => token.id === 'a');
    assert.equal(saved.xRatio, .7);
    assert.equal(saved.dragStartXRatio, .5);
    assert.equal(saved.dragPixelsPerFiveFeet, 100);
    assert.equal(saved.dragActive, false);
});

test('drag distance uses a medium token as five feet and rounds to integer feet', async () => {
    const f = await fixture('dm');
    assert.equal(vm.runInContext("tokenDragDistanceFeet({xRatio:.6,yRatio:.5,dragStartXRatio:.5,dragStartYRatio:.5,dragPixelsPerFiveFeet:100},1000,1000)", f.context), 5);
    assert.equal(vm.runInContext("tokenDragDistanceFeet({xRatio:.55,yRatio:.55,dragStartXRatio:.5,dragStartYRatio:.5,dragPixelsPerFiveFeet:100},1000,1000)", f.context), 4);
});

test('tokens remain above interactive drawing and measurement overlays', () => {
    for (const role of ['dm', 'player']) {
        const html = fs.readFileSync(`public/${role}.html`, 'utf8');
        assert.match(html, /id="mapTokenLayer"[\s\S]{0,200}z-index:\s*6/);
    }
});

test('board token gestures disable native selection, image dragging, and non-primary movement', () => {
    const boardUI = fs.readFileSync('public/board-ui.js', 'utf8');
    const tokenCSS = fs.readFileSync('public/token-actions.css', 'utf8');
    assert.match(boardUI, /addEventListener\('selectstart',[\s\S]*?event\.preventDefault\(\)/);
    assert.match(boardUI, /addEventListener\('dragstart', event => event\.preventDefault\(\)\)/);
    assert.match(tokenCSS, /\.monster-token\s*\{[^}]*user-select:none/);
    for (const role of ['dm', 'player']) {
        const html = fs.readFileSync(`public/${role}.html`, 'utf8');
        assert.match(html, /el\.addEventListener\('mousedown',[\s\S]{0,100}if \(e\.button !== 0\) return;/);
    }
});

test('token hit testing uses the visible circle rather than an overlapping square container', () => {
    const tokenCSS = fs.readFileSync('public/token-actions.css', 'utf8');
    assert.match(tokenCSS, /\.monster-token\s*\{[^}]*pointer-events:none/);
    assert.match(tokenCSS, /\.monster-token > img\s*\{[^}]*pointer-events:auto[^}]*clip-path:circle\(50%\)/);
    for (const role of ['dm', 'player']) {
        const html = fs.readFileSync(`public/${role}.html`, 'utf8');
        assert.match(html, /container\.style\.pointerEvents = 'none'/);
        assert.match(html, /img\.style\.pointerEvents = 'auto'/);
    }
});
