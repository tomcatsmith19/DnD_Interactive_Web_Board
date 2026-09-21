const assert = require('node:assert/strict');
const test = require('node:test');
const fs = require('node:fs');
const vm = require('node:vm');
const {
  cleanLabel, fuzzyScore, gridUnits, containingStickerFolder, hasStickerInteraction, pointInCircularRange,
  collectLinkedStickerTree, createStickerFavorite, instantiateStickerFavorite, hasUpstreamStickerTrigger
} = require('../public/map-stickers');

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

test('interactive sticker detection and circular teleport ranges are deterministic', () => {
  assert.equal(hasStickerInteraction({ interaction: { sound: { src: 'bell.mp3' } } }), true);
  assert.equal(hasStickerInteraction({ interaction: { trap: { text: 'Hidden pit' } } }), true);
  assert.equal(hasStickerInteraction({ interaction: null }), false);
  assert.equal(hasStickerInteraction({ interaction: { linkedStickerIds: ['gate'] } }), true);
  assert.equal(pointInCircularRange({ x: .55, y: .5 }, { x: .5, y: .5 }, 51, 1000, 500), true);
  assert.equal(pointInCircularRange({ x: .6, y: .5 }, { x: .5, y: .5 }, 51, 1000, 500), false);
});

test('stickers with upstream links cannot act as direct interaction triggers', () => {
  const stickers = [
    { id: 'lever', interaction: { linkedStickerIds: ['gate'] } },
    { id: 'gate', interaction: { animation: { rotationDegrees: 90 } } },
    { id: 'chest', interaction: { loot: { type: 'hoard' } } }
  ];
  assert.equal(hasUpstreamStickerTrigger(stickers, 'lever'), false);
  assert.equal(hasUpstreamStickerTrigger(stickers, 'gate'), true);
  assert.equal(hasUpstreamStickerTrigger(stickers, 'chest'), false);
  const browser = fs.readFileSync('public/map-stickers.js', 'utf8');
  assert.match(browser, /const directlyTriggerable = hasStickerInteraction\(sticker\) && !hasUpstreamTrigger/);
  assert.match(browser, /if \(active \|\| dragSession \|\| !directlyTriggerable\) return/);
});

test('favorite stickers preserve and remap the full linked interaction tree', () => {
  const stickers = [
    { id: 'lever', name: 'Lever', storagePath: 'lever.webp', x: .2, y: .3, widthRatio: .05, heightRatio: .1, interaction: { sound: { src: 'click.mp3' }, linkedStickerIds: ['gate'] } },
    { id: 'gate', name: 'Gate', storagePath: 'gate.webp', x: .5, y: .3, widthRatio: .2, heightRatio: .3, interaction: { animation: { rotationDegrees: 90 }, teleport: { toX: .55, toY: .35, radius: 1 }, linkedStickerIds: ['torch'] } },
    { id: 'torch', name: 'Torch', storagePath: 'torch.webp', x: .6, y: .4, widthRatio: .03, heightRatio: .08, interaction: { sound: { src: 'fire.mp3' }, linkedStickerIds: ['lever'] } },
    { id: 'unlinked', name: 'Rock', storagePath: 'rock.webp', x: .9, y: .9 }
  ];
  assert.deepEqual(collectLinkedStickerTree(stickers, 'lever').map(item => item.id), ['lever', 'gate', 'torch']);
  const favorite = createStickerFavorite(stickers, 'lever', 'favorite-test');
  const ids = ['new-lever', 'new-gate', 'new-torch'];
  const placed = instantiateStickerFavorite(favorite, .4, .5, () => ids.shift());
  assert.equal(placed.length, 3);
  assert.deepEqual(placed.map(item => [item.id, item.x, item.y]), [
    ['new-lever', .4, .5], ['new-gate', .7, .5], ['new-torch', .8, .6]
  ]);
  assert.deepEqual(placed[0].interaction.linkedStickerIds, ['new-gate']);
  assert.deepEqual(placed[1].interaction.linkedStickerIds, ['new-torch']);
  assert.deepEqual([placed[1].interaction.teleport.toX, placed[1].interaction.teleport.toY], [.75, .55]);
  assert.deepEqual(placed[2].interaction.linkedStickerIds, ['new-lever']);
  assert.equal(placed[0].interaction.sound.src, 'click.mp3');
});

test('DM configures all sticker interaction types while players receive interactive runtime support', () => {
  const browser = fs.readFileSync('public/map-stickers.js', 'utf8');
  const dm = fs.readFileSync('public/dm.html', 'utf8');
  const player = fs.readFileSync('public/player.html', 'utf8');
  for (const type of ['animation', 'sound', 'loot', 'teleport']) assert.match(browser, new RegExp(`interaction\\.${type}`));
  assert.match(browser, /Choose replacement from library/);
  for (const field of ['rotationDegrees', 'translateX', 'translateY', 'scalePercent', 'replacementPath']) assert.match(browser, new RegExp(`name="${field}"`));
  assert.doesNotMatch(browser, /animationEnabled|animationRotate|animationTranslate|animationScale|animationReplace/);
  assert.match(browser, /<details open><summary>Animate<\/summary>/);
  assert.match(browser, /<option value="none">No treasure<\/option>/);
  assert.match(browser, /className = "sticker-rig-handle sticker-rig-origin"/);
  assert.match(browser, /event\.key === "Escape" && active/);
  assert.match(browser, /setPanelCloseHandler\(handler\)/);
  const replacementPicker = browser.slice(browser.indexOf("[data-action='pick-replacement']"), browser.indexOf('function displayPath'));
  assert.doesNotMatch(replacementPicker, /interactionEditor\.hidden = true/);
  const teleportPicker = browser.slice(browser.indexOf("[data-action='set-teleport']"), browser.indexOf("[data-action='pick-replacement']"));
  assert.doesNotMatch(teleportPicker, /interactionEditor\.hidden = true/);
  assert.match(browser, /rotationOriginX/);
  assert.match(browser, /rotationOriginY/);
  assert.doesNotMatch(browser, /Rotation point X \(%\)|Rotation point Y \(%\)/);
  assert.match(browser, /beginTeleportDestinationDrag/);
  assert.match(browser, /Teleport destination updated/);
  assert.match(browser, /syncTeleportPreviewFromEditor/);
  assert.match(browser, /teleportPreview\?\.stickerId === sticker\.id/);
  assert.match(browser, /classList\.toggle\("show-interaction-marker", canEditInteractions && hasStickerInteraction\(sticker\)\)/);
  assert.match(browser, /\.map-sticker\.show-interaction-marker::after/);
  assert.match(browser, /boardSync\.subscribe\("tokens"/);
  assert.match(dm, /canEditInteractions: true/);
  assert.match(dm, /canRunTeleports: true/);
  assert.match(player, /canRunTeleports: true/);
  assert.match(player, /getSoundVolume: \(\) => sfxVolume/);
  assert.match(dm, /publishSoundEffect: \(src, settings\) => playDmSoundEffect\(src, settings\)/);
  assert.match(player, /publishSoundEffect: \(src, settings\) => publishSharedSfx\(src, settings\)/);
  for (const page of [dm, player]) {
    assert.match(page, /sfxChannelId: channelId/);
    assert.match(page, /sfxLoop: loop/);
    assert.match(page, /sfxAction: action/);
    assert.match(page, /sharedLoopingSfx/);
  }
  assert.match(browser, /options\.publishSoundEffect\(src, \{ loop: Boolean\(sound\.loop\), channelId: `sticker:\$\{stickerId\}` \}\)/);
  assert.doesNotMatch(player, /sharedSfxVolume/);
});

test('favorites use a naming dialog with edit and delete controls', () => {
  const browser = fs.readFileSync('public/map-stickers.js', 'utf8');
  assert.match(browser, /class="sticker-favorite-dialog-card"/);
  assert.match(browser, /name="favoriteName"/);
  assert.match(browser, /function openFavoriteDialog/);
  assert.match(browser, /function saveFavoriteDialog/);
  assert.match(browser, /function deleteFavorite/);
  assert.match(browser, /sticker-favorite-edit/);
  assert.match(browser, /sticker-favorite-delete/);
});

test('both boards load the sticker browser and place its tab before measurement', () => {
  const drawing = fs.readFileSync('public/map-drawing.js', 'utf8');
  for (const role of ['dm', 'player']) {
    const html = fs.readFileSync(`public/${role}.html`, 'utf8');
    assert.ok(html.includes('map-stickers.js?v=34'));
    assert.ok(html.includes('token-placement.js?v=4'));
    assert.ok(html.includes('map-drawing.js?v=24'));
    assert.match(html, /setupMapDrawingTabs\([^\n]+measurementToolbarManager, stickerManager\)/);
  }
  assert.ok(drawing.indexOf('label: "Stickers"') < drawing.indexOf('label: "Measurement"'));
  assert.match(drawing, /getTool: \(\) => currentTool/);
  assert.match(drawing, /const activeTool = activeManager\?\.getTool\?\.\(\)/);
  assert.match(drawing, /if \(activeTool !== "pan"\)/);
  assert.match(drawing, /activeButton\.click\(\)/);
});

test('Escape collapses the auxiliary board panels on DM and player pages', () => {
  const dm = fs.readFileSync('public/dm.html', 'utf8');
  const player = fs.readFileSync('public/player.html', 'utf8');
  for (const id of ['dmInitiativePanel', 'generatorPanel', 'dmAudioDock', 'dmSessionControls']) assert.match(dm, new RegExp(`['"]${id}['"]`));
  for (const id of ['partyPanel', 'mapContextDock', 'audioDock', 'playerSessionControls']) assert.match(player, new RegExp(`['"]${id}['"]`));
  assert.match(dm, /event\.key !== 'Escape'/);
  assert.match(player, /event\.key !== 'Escape'/);
  assert.match(dm, /closedPanel/);
  assert.match(player, /closedPanel/);
});

test('the generated catalog matches the uploaded sticker tree and search runs off the map thread', () => {
  const catalog = JSON.parse(fs.readFileSync('public/data/sticker-catalog.json', 'utf8'));
  const browser = fs.readFileSync('public/map-stickers.js', 'utf8');
  assert.equal(catalog.fileCount, 148047);
  assert.equal(catalog.files.length, catalog.fileCount);
  assert.ok(catalog.files.some(path => path.endsWith('Coffin_Black_A_Cloth_Purple_1x2.webp')));
  assert.match(browser, /new root\.Worker\("sticker-search-worker\.js\?v=3"\)/);
});

test('sticker placement captures the pointer before map panning', () => {
  const browser = fs.readFileSync('public/map-stickers.js', 'utf8');
  assert.match(browser, /mapTransformLayer\.addEventListener\("pointerdown", placeStickerAtPointer, true\)/);
  assert.match(browser, /mapImage\.getBoundingClientRect\(\)/);
  assert.match(browser, /className = "sticker-placement-cursor-preview"/);
  assert.match(browser, /placementLayer\.appendChild\(placementPreview\)/);
  assert.match(browser, /clamp\(pointerX, widthRatio \/ 2, 1 - widthRatio \/ 2\)/);
  assert.match(browser, /placementPreview\.style\.width = `\$\{widthRatio \* 100\}%`/);
});

test('manual loot placement waits for a map click and renders a cursor preview', () => {
  const browser = fs.readFileSync('public/map-stickers.js', 'utf8');
  const dm = fs.readFileSync('public/dm.html', 'utf8');
  assert.match(dm, /stickerManager\.queueLootSticker\(lootStickerSettings\(lastGeneratedLoot\.type, lastGeneratedLoot\.cr, lastGeneratedLoot\.text\)\)/);
  assert.match(browser, /function queueLootSticker\(settings = \{\}\)[\s\S]*?pendingLootPlacement = \{ \.\.\.settings, storagePath, lootText \}[\s\S]*?updatePlacementMode\(\)/);
  assert.match(browser, /if \(pendingLootPlacement\)[\s\S]*?x:\(event\.clientX - bounds\.left\) \/ bounds\.width,[\s\S]*?y:\(event\.clientY - bounds\.top\) \/ bounds\.height/);
  assert.match(browser, /function currentPlacementAsset\(\)[\s\S]*?storage\.ref\(\)\.child\(path\)/);
  assert.match(browser, /if \(!previewAsset\.units\.explicit && dimensions\?\.width && dimensions\?\.height\)/);
  assert.match(browser, /\.sticker-placement-cursor-preview\{[^}]*opacity:\.68/);
});

test('generated traps use preview placement and DM-controlled player visibility', () => {
  const browser = fs.readFileSync('public/map-stickers.js', 'utf8');
  const dm = fs.readFileSync('public/dm.html', 'utf8');
  assert.match(dm, /Hunting_Trap_Metal_Gray_A1_1x1\.webp/);
  assert.match(dm, /class="trap-generate-button"/);
  assert.match(dm, /id="placeTrapStickerBtn"[\s\S]*?placeGeneratedTrapSticker/);
  assert.match(dm, /placeTrapStickerBtn[\s\S]*?class="trap-place-icon"/);
  assert.match(dm, /\.trap-place-icon \{[^}]*background:#f4d76d;[^}]*trap_icon\.png/);
  assert.match(dm, /\.trap-generate-button \{[^}]*background:#ff5959 !important;[^}]*border:1px solid #ff8a90 !important;/);
  assert.match(dm, /trap-generate-button[\s\S]*?data\/images\/gears_icon\.png[\s\S]*?data\/images\/trap_icon\.png/);
  assert.match(dm, /const hoveredTrapOutput = event\.target\.closest\('\.trap-result'\)/);
  assert.match(dm, /\.trap-result::\-webkit-scrollbar-thumb/);
  assert.match(dm, /stickerManager\.queueTrapSticker/);
  assert.match(dm, /lastGeneratedTrap = \{ name:selected\.name, text, html:result\.innerHTML \}/);
  assert.match(dm, /trapHtml:lastGeneratedTrap\.html/);
  assert.match(browser, /function queueTrapSticker\(settings = \{\}\)[\s\S]*?placementType:"trap"/);
  assert.match(browser, /settings\.placementType === "trap" \? placeTrapSticker : placeLootSticker/);
  assert.match(browser, /interaction: \{ trap: \{ name:String\(settings\.name \|\| "Trap or Hazard"\), text:trapText, \.\.\.\(trapHtml \? \{ html:trapHtml \} : \{\}\) \} \}/);
  assert.match(browser, /stickers\.filter\(sticker => sticker\.hiddenFromPlayers !== true\)/);
  assert.match(browser, /class="sticker-trap-visibility"/);
  assert.match(browser, /boardSync\.patchStickers\(new Map\(\[\[sticker\.id, \{ hiddenFromPlayers \}\]\]\)/);
  assert.match(browser, /class="sticker-trap-delete"/);
  assert.match(browser, /class="sticker-trap-content"/);
  assert.match(browser, /function sanitizeTrapHtml/);
  assert.match(browser, /\.sticker-trap-content table/);
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
  const drawing = fs.readFileSync('public/map-drawing.js', 'utf8');
  assert.match(browser, /width:clamp\(620px,50vw,980px\)/);
  assert.match(browser, /\.sticker-library-grid\{display:flex;/);
  assert.match(browser, /overflow-x:auto;overflow-y:hidden/);
  assert.match(drawing, /shell\.classList\.toggle\("has-expanded-sticker", activeManager === stickerManager\)/);
  assert.match(browser, /\.map-tool-tabs\.has-expanded-sticker\{left:max\(454px,calc\(50% - 490px\)\);right:max\(12px,calc\(50% - 490px\)\);/);
  assert.match(browser, /@media\(max-width:760px\)\{\.map-tool-tabs\.has-expanded-sticker\{left:6px;right:6px;top:88px;/);
});

test('sticker tray uses a compact search row, text breadcrumbs, and no visible status footer', () => {
  const browser = fs.readFileSync('public/map-stickers.js', 'utf8');
  assert.match(browser, /searchRow\.append\(searchInput, breadcrumbs\)/);
  assert.match(browser, /searchRow\.append\(interactionButton\)/);
  assert.match(browser, /toolbar\.append\(searchRow, grid, status\)/);
  assert.match(browser, /\.sticker-search\{flex:0 1 37\.5%;[^}]*width:37\.5%/);
  assert.match(browser, /\.sticker-status\{position:absolute;width:1px;height:1px/);
  assert.match(browser, /\.sticker-breadcrumbs button\{[^}]*border:0;[^}]*background:none/);
  assert.doesNotMatch(browser, /headingText\.textContent = "Map Stickers"|sticker-library-footer/);
  assert.doesNotMatch(browser, /sticker-mode-button|Move existing|Stop placing/);
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
