const assert = require('node:assert/strict');
const test = require('node:test');
const fs = require('node:fs');
const vm = require('node:vm');
const { cleanLabel, fuzzyScore, gridUnits, containingStickerFolder } = require('../public/map-stickers');

test('sticker labels turn storage filenames into readable names', () => {
  assert.equal(cleanLabel('!Core_Settlements'), 'Core Settlements');
  assert.equal(cleanLabel('Coffin_Black_A_Cloth_Purple_1x2.webp'), 'Coffin Black A Cloth Purple 1x2');
});

test('fuzzy search ranks close names and supports missing characters', () => {
  const exact = fuzzyScore('purple coffin', 'Coffin Black Cloth Purple');
  const fuzzy = fuzzyScore('prpl coffn', 'Coffin Black Cloth Purple');
  const miss = fuzzyScore('purple coffin', 'Volcanic Rock Cluster');
  assert.ok(Number.isFinite(exact));
  assert.ok(Number.isFinite(fuzzy));
  assert.equal(miss, -Infinity);
});

test('grid dimensions are read from sticker filename suffixes', () => {
  assert.deepEqual(gridUnits('Coffin_Black_1x2.webp'), { width: 1, height: 2, explicit: true });
  assert.deepEqual(gridUnits('Fireflies_A1_01.webm'), { width: 1, height: 1, explicit: false });
});

test('both boards load the sticker browser and place its tab before measurement', () => {
  const drawing = fs.readFileSync('public/map-drawing.js', 'utf8');
  for (const role of ['dm', 'player']) {
    const html = fs.readFileSync(`public/${role}.html`, 'utf8');
    assert.ok(html.includes('map-stickers.js?v=8'));
    assert.match(html, /setupMapDrawingTabs\([^\n]+measurementToolbarManager, stickerManager\)/);
  }
  assert.ok(drawing.indexOf('label: "Stickers"') < drawing.indexOf('label: "Measurement"'));
});

test('the generated catalog matches the uploaded sticker tree and search runs off the map thread', () => {
  const catalog = JSON.parse(fs.readFileSync('public/data/sticker-catalog.json', 'utf8'));
  const browser = fs.readFileSync('public/map-stickers.js', 'utf8');
  assert.equal(catalog.fileCount, 148047);
  assert.equal(catalog.files.length, catalog.fileCount);
  assert.ok(catalog.files.some(path => path.endsWith('Coffin_Black_A_Cloth_Purple_1x2.webp')));
  assert.match(browser, /new root\.Worker\("sticker-search-worker\.js\?v=2"\)/);
});

test('sticker placement captures the pointer before map panning', () => {
  const browser = fs.readFileSync('public/map-stickers.js', 'utf8');
  assert.match(browser, /mapTransformLayer\.addEventListener\("pointerdown", placeStickerAtPointer, true\)/);
  assert.match(browser, /mapImage\.getBoundingClientRect\(\)/);
});

test('selected stickers use an on-map transform rig instead of toolbar transform buttons', () => {
  const browser = fs.readFileSync('public/map-stickers.js', 'utf8');
  assert.match(browser, /className = "map-sticker-transform-rig"/);
  assert.match(browser, /"sticker-rig-move", "Move sticker", "move"/);
  assert.match(browser, /"sticker-rig-rotate", "Rotate sticker", "rotate"/);
  assert.match(browser, /\["nw", "ne", "se", "sw"\].*"Scale sticker", "scale"/);
  assert.doesNotMatch(browser, /function resizeSelected|function rotateSelected|sticker-actions/);
});

test('sticker browser is a wide, single-row scrolling tray', () => {
  const browser = fs.readFileSync('public/map-stickers.js', 'utf8');
  assert.match(browser, /width:clamp\(620px,50vw,980px\)/);
  assert.match(browser, /\.sticker-library-grid\{display:flex;/);
  assert.match(browser, /overflow-x:auto;overflow-y:hidden/);
});

test('sticker tray uses a compact search row, text breadcrumbs, and no visible status footer', () => {
  const browser = fs.readFileSync('public/map-stickers.js', 'utf8');
  assert.match(browser, /searchRow\.append\(searchInput, breadcrumbs, modeButton\)/);
  assert.match(browser, /toolbar\.append\(searchRow, grid, status\)/);
  assert.match(browser, /\.sticker-search\{flex:0 1 37\.5%;[^}]*width:37\.5%/);
  assert.match(browser, /\.sticker-status\{position:absolute;width:1px;height:1px/);
  assert.match(browser, /\.sticker-breadcrumbs button\{[^}]*border:0;[^}]*background:none/);
  assert.doesNotMatch(browser, /headingText\.textContent = "Map Stickers"|sticker-library-footer/);
});

test('image tiles are label-free while folder tiles are shaped and wrap their names', () => {
  const browser = fs.readFileSync('public/map-stickers.js', 'utf8');
  const assetCardSource = browser.slice(browser.indexOf('function assetCard'), browser.indexOf('function renderEmpty'));
  assert.doesNotMatch(assetCardSource, /className = "sticker-card-label"|button\.append\(media, label\)/);
  assert.match(assetCardSource, /setAttribute\("aria-label", `Place sticker/);
  assert.doesNotMatch(browser, /folderCard[\s\S]*?innerHTML = '<svg/);
  assert.match(browser, /\.sticker-folder-card::before\{content:''/);
  assert.match(browser, /\.sticker-folder-card \.sticker-card-label\{[^}]*white-space:normal;[^}]*overflow-wrap:anywhere/);
});

test('sticker tiles are 25 percent smaller and selections reveal their containing folder', () => {
  const browser = fs.readFileSync('public/map-stickers.js', 'utf8');
  assert.match(browser, /flex:0 0 81px;[^}]*width:81px;height:75px/);
  assert.match(browser, /currentPath = assetFolder;\s*renderBreadcrumbs\(\)/);
  assert.equal(
    containingStickerFolder('sticker-library/v1/Buildings/Castles/Tower.webp'),
    'sticker-library/v1/Buildings/Castles'
  );
});

test('the search worker returns fuzzy matches from the generated catalog', async () => {
  const catalog = JSON.parse(fs.readFileSync('public/data/sticker-catalog.json', 'utf8'));
  const source = fs.readFileSync('public/sticker-search-worker.js', 'utf8');
  let messageHandler;
  const messages = [];
  const self = {
    addEventListener(type, handler) { if (type === 'message') messageHandler = handler; },
    postMessage(message) { messages.push(message); }
  };
  vm.runInNewContext(source, {
    self,
    fetch: async () => ({ ok: true, json: async () => catalog }),
    Error,
    Infinity,
    Number,
    Promise,
    String,
    setTimeout
  });
  await messageHandler({ data: { requestId: 7, query: 'prpl coffn' } });
  const result = messages.find(message => message.requestId === 7);
  assert.equal(result.requestId, 7);
  assert.equal(result.count, catalog.fileCount);
  assert.ok(result.results.some(item => item.type === 'file' && /Coffin_.*Purple/i.test(item.path)));

  await messageHandler({ data: { requestId: 8, query: 'burial graves' } });
  const folderResult = messages.find(message => message.requestId === 8);
  assert.ok(folderResult.folderCount > 0);
  assert.ok(folderResult.results.some(item => item.type === 'folder' && /Burial_and_Graves/i.test(item.path)));
});
