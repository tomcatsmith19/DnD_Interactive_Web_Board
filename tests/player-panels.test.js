const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const test = require('node:test');
const playerHtml = fs.readFileSync('public/player.html', 'utf8');

function dom() {
    class Element {
        constructor() {
            this.children = []; this.value = ''; this.textContent = ''; this.listeners = {};
            const classes = new Set();
            this.classList = { add: name => classes.add(name), remove: name => classes.delete(name), contains: name => classes.has(name) };
        }
        appendChild(child) { this.children.push(child); if (this.id === 'typeSelect' && !this.value) this.value = child.value; }
        set innerHTML(value) { this.children = []; }
        setAttribute(key, value) { this[key] = value; }
        addEventListener(event, callback) { this.listeners[event] = callback; }
    }
    const elements = new Map();
    const document = {
        createElement: () => new Element(),
        getElementById(id) {
            if (!elements.has(id)) { const element = new Element(); element.id = id; elements.set(id, element); }
            return elements.get(id);
        },
        querySelectorAll(selector) {
            const ids = selector === '.player-left-panel-content'
                ? ['playerPartyContent', 'playerDiceContent', 'playerBooksContent', 'playerReferenceContent']
                : ['partyCollapseButton', 'playerDiceButton', 'playerBooksButton', 'playerReferenceButton'];
            return ids.map(id => this.getElementById(id));
        }
    };
    return document;
}

test('player can switch between all four panels and close the active panel', () => {
    const document = dom();
    const panel = document.getElementById('partyPanel');
    panel.classList.add('is-collapsed');
    const context = vm.createContext({ document, activePlayerLeftPanel: 'party' });
    const source = playerHtml.slice(playerHtml.indexOf('function togglePlayerLeftPanel('), playerHtml.indexOf('function togglePartyPanel('));
    vm.runInContext(source, context);
    for (const mode of ['books', 'reference', 'party', 'dice']) {
        vm.runInContext(`togglePlayerLeftPanel('${mode}')`, context);
        assert.equal(panel.classList.contains('is-collapsed'), false);
        const active = document.querySelectorAll('.player-left-panel-content').filter(element => element.classList.contains('is-active'));
        assert.equal(active.length, 1);
        assert.equal(active[0].id.toLowerCase(), `player${mode}content`);
        assert.equal(document.querySelectorAll('.player-left-rail button').filter(element => element.classList.contains('is-active')).length, 1);
    }
    vm.runInContext("togglePlayerLeftPanel('dice')", context);
    assert.equal(panel.classList.contains('is-collapsed'), true);
});

test('player book selector opens the bundled PDFs and clears its viewer', () => {
    const document = dom();
    const listener = playerHtml.match(/document\.getElementById\('bookSelect'\)\.addEventListener\('change', event => \{[\s\S]*?\n\s*\}\);/)[0];
    vm.runInNewContext(listener, { document });
    const bookOptions = playerHtml.match(/<select id="bookSelect"[\s\S]*?<\/select>/)[0];
    const files = Array.from(bookOptions.matchAll(/value="([^"]+\.pdf)"/g), match => match[1]);
    assert.ok(files.length >= 2);
    for (const file of files) {
        assert.ok(fs.existsSync(`public/data/books/${file}`));
        document.getElementById('bookSelect').listeners.change({ target: { value: file } });
        assert.equal(document.getElementById('bookViewer').src, `data/books/${file}`);
    }
    document.getElementById('bookSelect').listeners.change({ target: { value: '' } });
    assert.equal(document.getElementById('bookViewer').src, 'about:blank');
});

test('reference searches the bundled catalog and uses its versioned detail URLs', async () => {
    const document = dom(), requests = [];
    let fail = false;
    const context = vm.createContext({
        document,
        fetch: async url => {
            requests.push(url);
            if (url.startsWith('data/')) return { ok: true, json: async () => JSON.parse(fs.readFileSync(`public/${url}`, 'utf8')) };
            return { ok: !fail, json: async () => ({ name: 'Abacus', cost: { quantity: 2, unit: 'gp' } }) };
        }
    });
    vm.runInContext(fs.readFileSync('public/reference.js', 'utf8'), context);
    await new Promise(setImmediate);
    assert.equal(document.getElementById('typeSelect').children.length, 4);
    document.getElementById('searchInput').value = 'abacus';
    document.getElementById('searchInput').listeners.input();
    const entries = document.getElementById('itemList').children;
    assert.equal(entries.length, 1);
    assert.equal(entries[0].textContent, 'Abacus');
    await vm.runInContext("searchItem('Abacus')", context);
    assert.equal(requests.at(-1), 'https://www.dnd5eapi.co/api/2014/equipment/abacus');
    assert.match(document.getElementById('description').textContent, /Abacus/);
    fail = true;
    await vm.runInContext("searchItem('Abacus')", context);
    assert.match(document.getElementById('description').textContent, /retry/);
});

test('reference globals coexist with the DM and player scripts', () => {
    for (const path of ['public/dm.html', 'public/player.html']) {
        const html = fs.readFileSync(path, 'utf8');
        const inline = Array.from(html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi))
            .filter(match => !/\bsrc=|type="module"/.test(match[1])).map(match => match[2]).join('\n');
        new vm.Script(fs.readFileSync('public/reference.js', 'utf8') + '\n' + inline, { filename: path });
    }
});

test('custom players persist max HP, AC, and token size', () => {
    for (const id of ['customPlayerMaxHp', 'customPlayerAc', 'customPlayerSize']) assert.match(playerHtml, new RegExp(`id="${id}"`));
    assert.match(playerHtml, /<fieldset class="custom-player-stat-section">\s*<legend>Combat &amp; Token<\/legend>/);
    assert.match(playerHtml, /\.custom-player-stat-grid input,[^{]+\{[^}]*display:block !important;[^}]*visibility:visible !important;/);
    assert.match(playerHtml, /definition=\{id:playerId,name,maxHp,ac,size,tokenUrl/);
    assert.match(playerHtml, /member=\{id:generateID\(\),name:choice\.name,size,hp:maxHp,maxHp,ac/);
    assert.match(playerHtml, /\['T','S','M','L','H','G'\]\.includes\(choice\.size\)\?choice\.size:'M'/);
});

test('custom player library occupies a responsive second column', () => {
    assert.match(playerHtml, /class="custom-player-workspace"/);
    assert.match(playerHtml, /<section class="custom-player-editor"/);
    assert.match(playerHtml, /<aside class="custom-player-library-panel"/);
    assert.match(playerHtml, /\.custom-player-workspace \{[^}]*grid-template-columns:minmax\(320px,1\.15fr\) minmax\(280px,\.85fr\)/);
    assert.match(playerHtml, /@media\(max-width:760px\)\{\.custom-player-workspace\{grid-template-columns:1fr\}/);
});

test('expanded audio docks remain raised above the bottom edge', () => {
    const dmHtml = fs.readFileSync('public/dm.html', 'utf8');
    assert.match(playerHtml, /\.audio-dock \{[^}]*bottom:28px;/);
    assert.match(dmHtml, /\.dm-audio-dock \{[^}]*bottom:28px;/);
    assert.match(playerHtml, /\.audio-dock\.is-collapsed \{[^}]*bottom:0;/);
    assert.match(dmHtml, /\.dm-audio-dock\.is-collapsed \{[^}]*bottom:0;/);
});

test('dice sound checkboxes directly mute the live dice audio pools', () => {
    const dmHtml = fs.readFileSync('public/dm.html', 'utf8');
    const dice = fs.readFileSync('public/dice-roller-3d.js', 'utf8');
    assert.match(playerHtml, /id="playerDiceSounds" type="checkbox" checked/);
    assert.match(dmHtml, /id="dmDiceSounds" type="checkbox" checked/);
    assert.match(dice, /diceSoundCheckbox\(\)\?\.addEventListener\('change', applyDiceSoundPreference\)/);
    assert.match(dice, /diceBox\.sounds = enabled/);
    assert.match(dice, /stopDiceAudioPool\(diceBox\.sounds_table\)/);
    assert.match(dice, /stopDiceAudioPool\(diceBox\.sounds_dice\)/);
    assert.match(dmHtml, /dice-roller-3d\.js\?v=23/);
    assert.match(playerHtml, /dice-roller-3d\.js\?v=23/);
});

test('dice customizer loads the 3D constructor before rendering its d20 preview', () => {
    const dice = fs.readFileSync('public/dice-roller-3d.js', 'utf8');
    assert.match(dice, /const DiceBox = await loadDiceBox\(\);[\s\S]*?const previewBox = new DiceBox\(`/);
    assert.match(dice, /await previewBox\.roll\('1d20'\)/);
});

test('DM initiative table fills the panel without an Add Monster action', () => {
    const dmHtml = fs.readFileSync('public/dm.html', 'utf8');
    assert.match(dmHtml, /\.dm-initiative-content \{[^}]*height:100%;[^}]*max-height:none;[^}]*overflow:hidden;/);
    assert.match(dmHtml, /\.dm-initiative-table-scroll \{[^}]*flex:1;[^}]*min-height:0;[^}]*overflow:auto;/);
    assert.doesNotMatch(dmHtml, /id="initiativeTableTab"[\s\S]*?<button id="addMonsterBtn"/);
});

test('DM initiative tracker has a docked stat-block subtab populated by monster name clicks', () => {
    const dmHtml = fs.readFileSync('public/dm.html', 'utf8');
    assert.match(dmHtml, /id="initiativeTableTabButton"[^>]*onclick="showInitiativeSubtab\('table'\)"/);
    assert.match(dmHtml, /id="initiativeStatblockTabButton"[^>]*onclick="showInitiativeSubtab\('statblock'\)"/);
    assert.match(dmHtml, /id="initiativeStatblockHost" class="dm-initiative-statblock-host">[\s\S]*?id="monsterStatModal"/);
    assert.match(dmHtml, /function setMonsterStatblockPresentation\(floating\)[\s\S]*?initiativeHost\.appendChild\(modal\)/);
    assert.match(dmHtml, /focusMapToken\(m\.id\);\s*if \(!m\.isplayer\) \{\s*showInitiativeSubtab\('statblock'\);\s*openMonsterStatblock\(m\.id\);/);
    assert.match(dmHtml, /\.dm-initiative-statblock-host \.classic-statblock \{[^}]*position:relative;[^}]*width:100%;[^}]*height:100%;/);
    assert.doesNotMatch(dmHtml, /row\.addEventListener\('click', \(\) => openMonsterStatblock\(m\.id\)\)/);
});

test('map token selection does not populate or clear the initiative stat block', () => {
    const dmHtml = fs.readFileSync('public/dm.html', 'utf8');
    const selectMapToken = dmHtml.match(/function selectMapToken\([\s\S]*?\n        \}/)?.[0] || '';
    const clearMapTokenSelection = dmHtml.match(/function clearMapTokenSelection\([\s\S]*?\n        \}/)?.[0] || '';
    assert.doesNotMatch(selectMapToken, /openMonsterStatblock|closeMonsterStatblock/);
    assert.doesNotMatch(clearMapTokenSelection, /openMonsterStatblock|closeMonsterStatblock/);
    assert.match(dmHtml, /focusMapToken\(m\.id\);\s*if \(!m\.isplayer\) \{\s*showInitiativeSubtab\('statblock'\);\s*openMonsterStatblock\(m\.id\);/);
});

test('CPU Advisor opens on the right side of the initiative stat block', () => {
    const dmHtml = fs.readFileSync('public/dm.html', 'utf8');
    assert.match(dmHtml, /availableWidth=window\.innerWidth-rect\.right-gap-10/);
    assert.match(dmHtml, /panel\.style\.left=`\$\{Math\.min\(window\.innerWidth-width-10,rect\.right\+gap\)\}px`/);
    assert.match(dmHtml, /\.cpu-advisor \{[^}]*border-radius:0 8px 8px 0;[^}]*box-shadow:8px 8px 24px #000;/);
});

test('DM initiative and HP inputs use compact digit-based widths', () => {
    const dmHtml = fs.readFileSync('public/dm.html', 'utf8');
    assert.match(dmHtml, /\.dm-initiative-number--init \{ width:2\.5ch; \}/);
    assert.match(dmHtml, /\.dm-initiative-number--hp \{ width:3\.5ch; \}/);
    assert.match(dmHtml, /\.dm-initiative-number::.*spin-button[^}]*appearance:none;[^}]*-webkit-appearance:none;/);
    assert.match(dmHtml, /class="dm-initiative-number dm-initiative-number--init" type="number"/);
    assert.match(dmHtml, /class="dm-initiative-number dm-initiative-number--hp" type="number"/);
});

test('mouse wheel over the DM initiative table scrolls the table rather than the map', () => {
    const dmHtml = fs.readFileSync('public/dm.html', 'utf8');
    assert.match(dmHtml, /const hoveredInitiativeTable = event\.target\.closest\('\.dm-initiative-table-scroll'\)/);
    assert.match(dmHtml, /const scroller = hoveredInitiativeTable \|\| panel\.querySelector/);
    assert.match(dmHtml, /scroller\.scrollTop \+= event\.deltaY;[\s\S]*?event\.preventDefault\(\);[\s\S]*?event\.stopPropagation\(\)/);
});

test('DM initiative scrollbar matches the brown and gold panel theme', () => {
    const dmHtml = fs.readFileSync('public/dm.html', 'utf8');
    assert.match(dmHtml, /\.dm-initiative-table-scroll \{[^}]*scrollbar-color:#8a6643 #21130c;/);
    assert.match(dmHtml, /\.dm-initiative-table-scroll::\-webkit-scrollbar-thumb \{[^}]*background:#8a6643;/);
    assert.match(dmHtml, /\.dm-initiative-table-scroll::\-webkit-scrollbar-thumb:hover \{ background:#f4d76d; \}/);
});

test('sticky initiative header cells cover scrolling table borders', () => {
    const dmHtml = fs.readFileSync('public/dm.html', 'utf8');
    assert.match(dmHtml, /\.dm-initiative-table thead th \{[^}]*position:sticky;[^}]*top:-2px;[^}]*background:#3d2718;[^}]*box-shadow:0 -2px 0 #3d2718;/);
});

test('dice clear controls are soft-red trash buttons in the roller headers', () => {
    const dmHtml = fs.readFileSync('public/dm.html', 'utf8');
    for (const html of [dmHtml, playerHtml]) {
        assert.match(html, /class="dice-roller-header"><h2>Dice Roller<\/h2><button class="dice-clear-button"/);
        assert.match(html, /aria-label="Clear Selected Dice" title="Clear Selected Dice"><svg/);
        assert.match(html, /\.dice-clear-button \{[^}]*color:#ff777f[^}]*background:#351416[^}]*border:1px solid #ff777f/);
    }
    assert.doesNotMatch(dmHtml, />Clear Selected Dice<\/button>/);
    assert.doesNotMatch(playerHtml, />Clear Selected Dice<\/button>/);
});

test('rolled dice appearance output contains only the four option lines', () => {
    const dice = fs.readFileSync('public/dice-roller-3d.js', 'utf8');
    const dmHtml = fs.readFileSync('public/dm.html', 'utf8');
    assert.match(dice, /const summary = String\(payload\.appearanceSummary[^\n]+split\('; '\)\.join\('<br>'\);/);
    assert.match(dice, /appearanceOutput\.innerHTML = safeMarkup\(summary\);/);
    assert.doesNotMatch(`${dice}\n${dmHtml}\n${playerHtml}`, /appearanceMode/);
    assert.doesNotMatch(dice, /<strong>Applied Appearance<\/strong>/);
});

test('clear dice trash buttons also reset the roll modifier', () => {
    const dmHtml = fs.readFileSync('public/dm.html', 'utf8');
    for (const html of [dmHtml, playerHtml]) {
        assert.match(html, /const modifier\s*=\s*document\.getElementById\(`\$\{prefix\}DiceModifier`\)/);
        assert.match(html, /if\s*\(modifier\)\s*modifier\.value\s*=\s*0/);
    }
});

test('Roll Dice buttons use the action panel heal color theme', () => {
    const dmHtml = fs.readFileSync('public/dm.html', 'utf8');
    for (const html of [dmHtml, playerHtml]) {
        assert.match(html, /\.dice-roll-button \{[^}]*color:#72df91[^}]*background:#132d1b[^}]*border:1px solid #72df91/);
        assert.match(html, /\.dice-roll-button:focus-visible \{ outline:2px solid #72df91;/);
    }
});

test('wilderness travel uses a compact survival input and icon generator control', () => {
    const dmHtml = fs.readFileSync('public/dm.html', 'utf8');
    assert.match(dmHtml, /class="travel-survival-control"><span>Survival Check<\/span>\s*<input id="travelSurvivalCheck" type="number" min="1" max="40"/);
    assert.match(dmHtml, /#travelSurvivalCheck[^}]*width:2\.5ch;[^}]*appearance:textfield/);
    assert.match(dmHtml, /#travelSurvivalCheck::.*spin-button[^}]*-webkit-appearance:none/);
    assert.match(dmHtml, /#wildTravelPanel \.wilderness-controls \{[^}]*grid-template-columns:auto auto;[^}]*justify-content:center;/);
    assert.match(dmHtml, /class="wilderness-roll"[^>]*aria-label="Generate Travel Scene"[^>]*><span class="wilderness-roll-icon"[^>]*><img src="data\/images\/gears_icon\.png"[^>]*><svg/);
    assert.doesNotMatch(dmHtml, />Generate Travel Scene<\/button>/);
});

test('travel encounter send control sits left in the red card and uses arrow-swords iconography', () => {
    const dmHtml = fs.readFileSync('public/dm.html', 'utf8');
    assert.match(dmHtml, /\.travel-encounter\.has-send-action \{[^}]*display:grid;[^}]*grid-template-columns:auto minmax\(0,1fr\)/);
    assert.match(dmHtml, /<button class="travel-encounter-send"[^>]*aria-label="Send Encounter to Table"[^>]*><span aria-hidden="true">&larr; &#9876;<\/span><\/button>/);
    assert.match(dmHtml, /<div class="travel-encounter\$\{sendButton \? ' has-send-action' : ''\}">\$\{sendButton\}<div class="travel-encounter-details">/);
    assert.doesNotMatch(dmHtml, />Send Encounter to Table<\/button>/);
});

test('Town NPC panel uses compact accessible icon actions', () => {
    const dmHtml = fs.readFileSync('public/dm.html', 'utf8');
    assert.match(dmHtml, /class="npc-icon-button npc-add-table-button"[^>]*aria-label="Add to Table"[^>]*>[\s\S]*?<select id="npcDropdown"/);
    assert.match(dmHtml, /class="npc-icon-button npc-save-button"[^>]*aria-label="Save NPC"[^>]*><svg/);
    assert.match(dmHtml, /class="npc-icon-button npc-delete-button"[^>]*aria-label="Delete NPC"[^>]*><svg/);
    assert.match(dmHtml, /class="npc-token-preview-wrap">[\s\S]*?class="npc-token-upload-button" aria-label="Upload Token"[^>]*><svg/);
    assert.match(dmHtml, /class="npc-generation-row">[\s\S]*?class="npc-generate-button"[^>]*aria-label="Generate New NPC"[^>]*><img src="data\/images\/gears_icon\.png"[^>]*><svg/);
    assert.doesNotMatch(dmHtml, />Save NPC<\/button>|>Delete NPC<\/button>|>Add to Table<\/button>|>Upload Token<input|>Generate New NPC<\/button>/);
});

test('Town NPC editor and generator have no enclosing visual container', () => {
    const dmHtml = fs.readFileSync('public/dm.html', 'utf8');
    assert.match(dmHtml, /\.npc-generator \{[^}]*padding:0;[^}]*overflow:visible;[^}]*background:transparent;[^}]*border:0;[^}]*border-radius:0;/);
});

test('Wilderness, Town, and Dungeon subtabs fill the generator panel', () => {
    const dmHtml = fs.readFileSync('public/dm.html', 'utf8');
    assert.match(dmHtml, /\.generator-scroll \{[^}]*display:flex;[^}]*flex:1;[^}]*min-height:0;[^}]*overflow:hidden;/);
    assert.match(dmHtml, /\.generator-mode\.is-active \{[^}]*display:flex;[^}]*flex:1;[^}]*flex-direction:column;[^}]*width:100%;[^}]*min-height:0;/);
    assert.match(dmHtml, /#generatorWildHost,#generatorTownHost,#generatorDungeonHost \{[^}]*display:flex;[^}]*flex:1;[^}]*width:100%;[^}]*min-height:0;/);
    assert.match(dmHtml, /\.generator-subcontent\.is-active \{[^}]*display:flex !important;[^}]*flex:1;[^}]*width:100%;[^}]*min-height:0;[^}]*overflow:auto;/);
    assert.match(dmHtml, /\.generator-subtabs \{[^}]*width:100%;[^}]*padding:0;/);
});

test('generator party, season, and environment preferences persist at campaign level', () => {
    const dmHtml = fs.readFileSync('public/dm.html', 'utf8');
    const campaignManager = fs.readFileSync('public/campaign-manager.js', 'utf8');
    assert.match(dmHtml, /function campaignGeneratorSettingsRef\(campaignId = activeGeneratorCampaignId\(\)\) \{\s*return campaignId \? db\.collection\('campaigns'\)\.doc\(campaignId\)\.collection\('settings'\)\.doc\('generators'\) : null;/);
    assert.match(dmHtml, /async function loadCampaignGeneratorSettings\(campaignId = activeGeneratorCampaignId\(\)\)[\s\S]*?const snapshot = await settingsRef\.get\(\)/);
    assert.match(dmHtml, /typeof saved\.partyLevels === 'string'[\s\S]*?saved\.partyLevels\.trim\(\) : '3,3,3,3'/);
    assert.match(dmHtml, /generatorSelectHasValue\(seasonSelect, saved\.season\)[\s\S]*?generatorSelectHasValue\(environmentSelect, saved\.environment\)/);
    assert.match(dmHtml, /settingsRef\.set\(\{[\s\S]*?partyLevels:[\s\S]*?season:[\s\S]*?environment:[\s\S]*?updatedAt:firebase\.firestore\.FieldValue\.serverTimestamp\(\)[\s\S]*?\}, \{ merge:true \}\)/);
    assert.match(dmHtml, /saveGeneratorPreferences\(400\)/);
    assert.match(dmHtml, /generatorSeason'\)\?\.addEventListener\('change',[^\n]+saveGeneratorPreferences\(\)/);
    assert.match(dmHtml, /generatorEnvironment'\)\?\.addEventListener\('change',[^\n]+saveGeneratorPreferences\(\)/);
    assert.match(campaignManager, /campaignRegistry = registry;\s*if \(typeof loadCampaignGeneratorSettings === 'function'\) await loadCampaignGeneratorSettings\(campaignId\)/);
    assert.match(campaignManager, /campaignManagerReady = true;\s*if \(typeof loadCampaignGeneratorSettings === 'function'\) await loadCampaignGeneratorSettings\(campaignRegistry\.activeId\)/);
});

test('generator subtabs use green, blue, and red mode accents', () => {
    const dmHtml = fs.readFileSync('public/dm.html', 'utf8');
    assert.match(dmHtml, /#generatorWild \{ --generator-accent:#55d66b; \}/);
    assert.match(dmHtml, /#generatorTown \{ --generator-accent:#55a8ff; \}/);
    assert.match(dmHtml, /#generatorDungeon \{ --generator-accent:#ff5959; \}/);
    assert.match(dmHtml, /\.generator-subtabs \{[^}]*border-bottom:3px solid var\(--generator-accent\);/);
    assert.match(dmHtml, /\.generator-banner\.is-active \{[^}]*color:var\(--generator-accent\);[^}]*border:2px solid var\(--generator-accent\);[^}]*border-bottom:0;/);
    assert.match(dmHtml, /\.generator-banner\.is-active::after \{[^}]*bottom:-3px;[^}]*background:#1d1009;[^}]*border-left:2px solid var\(--generator-accent\);[^}]*border-right:2px solid var\(--generator-accent\);/);
});

test('generator content uses the panel background with only purposeful child panels', () => {
    const dmHtml = fs.readFileSync('public/dm.html', 'utf8');
    assert.match(dmHtml, /\.generator-panel \.generator-subcontent \{[^}]*background:transparent !important;[^}]*border:0;[^}]*border-radius:0;[^}]*box-shadow:none;/);
    assert.match(dmHtml, /\.npc-editor-card \{[^}]*padding:0;[^}]*background:transparent;[^}]*border:0;/);
    assert.match(dmHtml, /\.travel-result \{[^}]*background: #1d1009;[^}]*border: 1px solid #765133;/);
});

test('Wilderness travel uses green generation and gold encounter actions', () => {
    const dmHtml = fs.readFileSync('public/dm.html', 'utf8');
    assert.match(dmHtml, /\.wilderness-roll \{[^}]*background: #55d66b;[^}]*color: #102d17;/);
    assert.match(dmHtml, /\.travel-result h3 \{[^}]*color: #55d66b;[^}]*font-family:'MedievalSharp'/);
    assert.match(dmHtml, /\.travel-encounter \.travel-encounter-send \{[^}]*border:1px solid #f4d76d;[^}]*background:#4b2915;[^}]*color:#f4d76d;/);
});

test('Town NPC options container and generator action use the blue theme', () => {
    const dmHtml = fs.readFileSync('public/dm.html', 'utf8');
    assert.match(dmHtml, /\.npc-generation-controls \{[^}]*background:#10263d;[^}]*border:1px solid #55a8ff;/);
    assert.match(dmHtml, /\.npc-generator \.npc-generate-button \{[^}]*background:#55a8ff;/);
});

test('Carousing controls share one row with a blue gears-and-tent action', () => {
    const dmHtml = fs.readFileSync('public/dm.html', 'utf8');
    assert.match(dmHtml, /class="carousing-controls">[\s\S]*?class="carousing-level-control"><span>Player Level<\/span><input[^>]*>[\s\S]*?class="carousing-generate-button"/);
    assert.match(dmHtml, /\.carousing-level-control \{[^}]*align-self:stretch;[^}]*align-items:center;/);
    assert.match(dmHtml, /\.carousing-generate-button \{[^}]*background:#55a8ff;/);
    assert.match(dmHtml, /aria-label="Generate Carousing Event"[^>]*><img src="data\/images\/gears_icon\.png"[^>]*><svg/);
    assert.doesNotMatch(dmHtml, />\s*Generate Carousing Event\s*<\/button>/);
});

test('Wilderness and saved-NPC control rows are centered and compact', () => {
    const dmHtml = fs.readFileSync('public/dm.html', 'utf8');
    assert.match(dmHtml, /#wildTravelPanel \.wilderness-controls \{[^}]*grid-template-columns:auto auto;[^}]*justify-content:center;/);
    assert.match(dmHtml, /\.npc-manager-row \{[^}]*display:flex;[^}]*justify-content:center;/);
    assert.match(dmHtml, /\.npc-manager-row select \{[^}]*flex:0 1 50%;[^}]*width:50%;/);
});

test('Magic Shop is a single blue Donjon button', () => {
    const dmHtml = fs.readFileSync('public/dm.html', 'utf8');
    assert.match(dmHtml, /id="magicShopSubTab"[\s\S]*?<a class="magic-shop-button" href="https:\/\/donjon\.bin\.sh\/5e\/magic\/shop\.html"[^>]*>Open Donjon Magic Shop<\/a>/);
    assert.match(dmHtml, /\.magic-shop-button \{[^}]*background:#55a8ff;/);
    assert.doesNotMatch(dmHtml, /<div class="town-label">Magic Shop<\/div>/);
});

test('Carousing output contains only the selected event result', () => {
    const dmHtml = fs.readFileSync('public/dm.html', 'utf8');
    assert.match(dmHtml, /const \{ result \} = rollFromTable\(table, level\);\s*document\.getElementById\("carousingResult"\)\.value = result;/);
    assert.doesNotMatch(dmHtml, /`Base Roll: \$\{baseRoll\}/);
    assert.match(dmHtml, /\.carousing-controls \{[^}]*grid-template-columns:minmax\(170px,230px\) auto auto;[^}]*justify-content:center;/);
});

test('Town NPC fields are horizontal and generator filters have no visible headers', () => {
    const dmHtml = fs.readFileSync('public/dm.html', 'utf8');
    assert.match(dmHtml, /\.npc-identity-grid label \{[^}]*flex-direction:row;[^}]*align-items:center;/);
    assert.match(dmHtml, /<label><span>Name<\/span><input id="npcName"[^>]*><\/label>\s*<label><span>Race<\/span><input id="npcRace"[^>]*><\/label>\s*<label><span>Occupation<\/span><input id="npcOccupation"/);
    assert.match(dmHtml, /<select id="npcGeneratorRace" aria-label="Race">/);
    assert.match(dmHtml, /<select id="npcGeneratorAlignment" aria-label="Alignment">/);
    assert.match(dmHtml, /<select id="npcGeneratorOccupation" aria-label="Occupation">/);
    assert.doesNotMatch(dmHtml, /<label>Race<select id="npcGeneratorRace"|<label>Alignment<select id="npcGeneratorAlignment"|<label>Occupation<select id="npcGeneratorOccupation"/);
});

test('Dungeon encounter controls use icon generators and a two-row layout', () => {
    const dmHtml = fs.readFileSync('public/dm.html', 'utf8');
    assert.match(dmHtml, /class="encounter-primary-row">\s*<select id="encounterDifficulty" aria-label="Encounter difficulty">[\s\S]*?class="encounter-generate-button encounter-generate-button--standard"[\s\S]*?class="encounter-generate-button encounter-generate-button--environment"/);
    assert.doesNotMatch(dmHtml, /<label for="encounterDifficulty"><strong>Difficulty:/);
    assert.match(dmHtml, /\.encounter-generate-button--standard \{[^}]*background:#ff5959;/);
    assert.match(dmHtml, /encounter-generate-button--standard"[^>]*aria-label="Generate Encounter"[^>]*><img src="data\/images\/gears_icon\.png"[^>]*><svg/);
    assert.match(dmHtml, /\.encounter-generate-button--environment \{[^}]*background:#55d66b;/);
    assert.match(dmHtml, /encounter-generate-button--environment"[^>]*aria-label="Generate Environment Encounter"[^>]*><img src="data\/images\/gears_icon\.png"[^>]*><svg[^>]*>[\s\S]*?<\/svg><svg/);
    assert.doesNotMatch(dmHtml, />\s*Generate Encounter\s*<\/button>|>\s*Generate Environment Encounter\s*<\/button>/);
});

test('Dungeon encounter send icon precedes the monster XP heading', () => {
    const dmHtml = fs.readFileSync('public/dm.html', 'utf8');
    assert.match(dmHtml, /class="encounter-summary-row"><button class="encounter-send-button"[^>]*aria-label="Send Encounter to Table"[^>]*><span aria-hidden="true">&larr; &#9876;<\/span><\/button><label id="encounterMonsterHeading">/);
    assert.match(dmHtml, /\.encounter-summary-row \{[^}]*display:flex;[^}]*align-items:center;/);
    assert.match(dmHtml, /\.encounter-send-button \{[^}]*background:#4b2915;[^}]*border:1px solid #f4d76d;/);
    assert.doesNotMatch(dmHtml, /className = 'encounter-generate-row'/);
});

test('Dungeon encounter builder owns the soft-red icon Add Monster action', () => {
    const dmHtml = fs.readFileSync('public/dm.html', 'utf8');
    assert.match(dmHtml, /id="encounterMonsterHeading"[\s\S]*?<button id="addMonsterBtn" class="encounter-add-monster"[^>]*aria-label="Add Monster to Encounter"[^>]*><span class="encounter-add-symbol"[^>]*>\+<\/span><svg/);
    assert.match(dmHtml, /\.encounter-add-monster \{[^}]*margin-left:auto;[^}]*color:#ff777f;[^}]*background:#351416;[^}]*border:1px solid #ff777f;/);
    assert.doesNotMatch(dmHtml, />\s*Add Monster\s*<\/button>/);
});

test('Dungeon loot uses compact labels, icon generation, and an XP advancement tooltip', () => {
    const dmHtml = fs.readFileSync('public/dm.html', 'utf8');
    assert.match(dmHtml, /<label for="lootCR">CR<\/label>/);
    assert.match(dmHtml, /<label for="lootXP" tabindex="0" aria-describedby="lootXpTablePopup">XP<\/label>/);
    assert.doesNotMatch(dmHtml, /Challenge Rating:|Encounter XP:|>\s*Generate Loot\s*<\/button>/);
    assert.match(dmHtml, /class="loot-generate-button"[^>]*aria-label="Generate Loot"[^>]*><img src="data\/images\/gears_icon\.png"[^>]*><svg/);
    assert.match(dmHtml, /\.loot-generate-button \{[^}]*background:#ff5959;[^}]*border:1px solid #ff8a90;/);
    assert.match(dmHtml, /class="loot-controls">[\s\S]*?id="lootXP"[\s\S]*?class="loot-generate-button"[\s\S]*?<\/div>/);
    assert.match(dmHtml, /\.loot-generate-button \{[^}]*margin-left:auto;/);
    assert.match(dmHtml, /id="lootXpTablePopup" class="loot-xp-table-popup" role="tooltip">[\s\S]*?<caption>Player Level Advancement<\/caption>[\s\S]*?<td>20<\/td><td>355,000<\/td>/);
    assert.match(dmHtml, /\.loot-xp-table-popup \{[^}]*position:fixed;[^}]*z-index:5000;/);
    assert.match(dmHtml, /if \(popup\.parentElement !== document\.body\) document\.body\.appendChild\(popup\)/);
    assert.match(dmHtml, /popup\.classList\.add\('is-open'\)/);
});

test('accumulated loot CR and XP persist with campaign generator settings', () => {
    const dmHtml = fs.readFileSync('public/dm.html', 'utf8');
    const campaignManager = fs.readFileSync('public/campaign-manager.js', 'utf8');
    assert.match(dmHtml, /loadCampaignGeneratorSettings[\s\S]*?encounterLootCR = Math\.max\(0, Number\(saved\.lootCr\) \|\| 0\)[\s\S]*?encounterLootXP = Math\.max\(0, Number\(saved\.lootXp\) \|\| 0\)/);
    assert.match(dmHtml, /function saveLootAccumulator[\s\S]*?const settingsRef = campaignGeneratorSettingsRef\(campaignId\)[\s\S]*?settingsRef\.set\(\{\s*lootCr:Math\.max\(0, encounterLootCR\),\s*lootXp:Math\.max\(0, Math\.round\(encounterLootXP\)\)/);
    assert.match(dmHtml, /recordCreatureForLoot\(monster\)[\s\S]*?updateLootEncounterFields\(\);\s*saveLootAccumulator\(\);/);
    assert.match(dmHtml, /getElementById\('lootCR'\)[^\n]+saveLootAccumulator\(400\)/);
    assert.match(dmHtml, /getElementById\('lootXP'\)[^\n]+saveLootAccumulator\(400\)/);
    assert.match(campaignManager, /cleanup\.delete\(campaignsRef\.doc\(campaignId\)\.collection\('settings'\)\.doc\('generators'\)\)/);
    assert.doesNotMatch(dmHtml, /collection\('shared'\)\.doc\('lootAccumulator'\)|collection\('shared'\)\.doc\('generatorPreferences'\)/);
});

test('generated loot output omits internal d100 roll mechanics', () => {
    const dmHtml = fs.readFileSync('public/dm.html', 'utf8');
    assert.match(dmHtml, /return `Individual Treasure — CR \$\{cr\}\\n\\nCoins\\n\$\{formatLootCoins\(coins\)\}`/);
    assert.match(dmHtml, /const sections = \[`Treasure Hoard — CR \$\{cr\}`\]/);
    assert.match(dmHtml, /Gems — \$\{Number\(entry\.gems\.type\)\.toLocaleString\(\)\} GP each \(\$\{items\.length\}\)/);
    assert.match(dmHtml, /Magic Items — Table \$\{type\} \(\$\{items\.length\}\)/);
    assert.doesNotMatch(dmHtml, /`d100 Roll: \$\{roll\}|Hoard d100 Roll:/);
});

test('loot stickers preserve pre-rolled results and use CR-specific native pile assets', () => {
    const dmHtml = fs.readFileSync('public/dm.html', 'utf8');
    const stickers = fs.readFileSync('public/map-stickers.js', 'utf8');
    const catalog = new Set(JSON.parse(fs.readFileSync('public/data/sticker-catalog.json', 'utf8')).files);
    const paths = [...dmHtml.matchAll(/'(Coin_Pile_Gold_A(?:12|40|43)_[^']+|Treasure_Pile_Gold_A(?:10|27|29|30)_[^']+)'/g)].map(match => match[1]);
    assert.equal(paths.length, 7);
    paths.forEach(filename => assert.ok([...catalog].some(path => path.endsWith(filename)), `${filename} must exist in the sticker catalog`));
    assert.match(stickers, /async function placeLootSticker\(settings = \{\}\)[\s\S]*?interaction: \{[\s\S]*?result: lootText,[\s\S]*?preRolled: true/);
    assert.match(stickers, /if \(typeof settings\?\.result === "string" && settings\.result\.trim\(\)\) return settings\.result/);
    assert.match(stickers, /aria-label="Delete loot sticker"[\s\S]*?boardSync\.removeStickers\(\[stickerId\], boardSync\.generation\)/);
    const lootDeleteHandler = stickers.slice(stickers.indexOf(`lootPopup.querySelector("[data-action='delete']").addEventListener`), stickers.indexOf('document.body.appendChild(lootPopup)'));
    assert.doesNotMatch(lootDeleteHandler, /canEditInteractions/);
    assert.match(stickers, /\[data-action='delete'\]"\)\.hidden = !interaction\.loot\.preRolled/);
    assert.match(stickers, /placeLootSticker,/);
});

test('loot auto drop rolls individual treasure at the defeated monster position', () => {
    const dmHtml = fs.readFileSync('public/dm.html', 'utf8');
    const playerHtml = fs.readFileSync('public/player.html', 'utf8');
    const boardUi = fs.readFileSync('public/board-ui.js', 'utf8');
    assert.match(dmHtml, /id="lootAutoDrop" type="checkbox"> Auto drop/);
    assert.match(dmHtml, /if \(!skipAutoDrop && document\.getElementById\('lootAutoDrop'\)\?\.checked\) dropAutomaticLootSticker\(monster\)\.catch\(reportBoardSyncError\)/);
    assert.match(dmHtml, /async function dropAutomaticLootSticker\(monster, stickerId = ''\)[\s\S]*?rollIndividualLootForCr\(cr\)[\s\S]*?x:monster\.xRatio, y:monster\.yRatio/);
    assert.match(dmHtml, /lootAutoDrop:Boolean\(document\.getElementById\('lootAutoDrop'\)\?\.checked\)/);
    assert.match(playerHtml, /function broadcastDefeatedCreatures\(creatures\)[\s\S]*?lootAutoDrop === true[\s\S]*?stickerManager\.placeAutomaticLootSticker\(monster, \{ id:`loot-\$\{request\.id\}` \}\)[\s\S]*?campaignId, monster, autoDropEnabled, lootPlaced/);
    assert.match(dmHtml, /function processLootDropRequest\(requestDoc\)[\s\S]*?request\.autoDropEnabled[\s\S]*?request\.lootPlaced !== true[\s\S]*?dropAutomaticLootSticker\(monster, `loot-\$\{requestDoc\.id\}`\)[\s\S]*?requestDoc\.ref\.delete\(\)/);
    assert.match(dmHtml, /dropAutomaticLootSticker\(monster, `loot-\$\{requestDoc\.id\}`\)/);
    assert.match(fs.readFileSync('public/map-stickers.js', 'utf8'), /async function placeLootSticker\(settings = \{\}\)[\s\S]*?id: String\(settings\.id \|\| makeId\(\)\)/);
    assert.match(fs.readFileSync('public/map-stickers.js', 'utf8'), /async function placeAutomaticLootSticker\(monster, settings = \{\}\)[\s\S]*?rollAutomaticIndividualLoot\(cr\)[\s\S]*?x:monster\?\.xRatio[\s\S]*?y:monster\?\.yRatio/);
    assert.match(boardUi, /recordCreatureForLoot\(token, \{ skipAutoDrop:true \}\)/);
    assert.match(boardUi, /boardPageRole === 'player' && action === 'damage'[\s\S]*?broadcastDefeatedCreatures\(defeatedByPlayer\)/);
});

test('generated Wilderness and Dungeon monsters open token-bearing stat blocks', () => {
    const dmHtml = fs.readFileSync('public/dm.html', 'utf8');
    assert.match(dmHtml, /function renderEncounterMonsterList\(monsterList, list = document\.getElementById\('encounterMonsterList'\)\)/);
    assert.match(dmHtml, /nameButton\.addEventListener\('click', \(\) => openGeneratedMonsterStatblock\(monster\.name\)\)/);
    assert.match(dmHtml, /function openGeneratedMonsterStatblock\(monsterName\) \{\s*hideGeneratedMonsterTokenPreview\(\);\s*monsterStatblockPinned = false;\s*openMonsterStatblock\(monsterName, \{ floating:true \}\);/);
    assert.match(dmHtml, /setCurrentEncounterMonsters\(bestGroup\);/);
    assert.match(dmHtml, /id="travelEncounterMonsterList" class="generated-monster-list"/);
    assert.match(dmHtml, /renderEncounterMonsterList\(travelEncounterMonsters, document\.getElementById\('travelEncounterMonsterList'\)\)/);
    assert.match(dmHtml, /class="classic-statblock-token" src="\$\{escapeStatHtml\(definition\.tokenUrl \|\| DEFAULT_MONSTER_TOKEN\)\}"/);
});

test('generated monster stat blocks are draggable popups with close controls and token hover previews', () => {
    const dmHtml = fs.readFileSync('public/dm.html', 'utf8');
    assert.match(dmHtml, /function setMonsterStatblockPresentation\(floating\)[\s\S]*?document\.body\.appendChild\(modal\)/);
    assert.match(dmHtml, /class="classic-statblock-drag-handle" role="button" aria-label="Drag stat block"/);
    assert.match(dmHtml, /title="Close stat block">×<\/button>/);
    assert.match(dmHtml, /floatingStatblockDrag = \{ pointerId:event\.pointerId, offsetX:/);
    assert.match(dmHtml, /nameButton\.addEventListener\('pointerenter', \(\) => showGeneratedMonsterTokenPreview\(nameButton, monster\.name\)\)/);
    assert.match(dmHtml, /nameButton\.addEventListener\('focus', \(\) => showGeneratedMonsterTokenPreview\(nameButton, monster\.name\)\)/);
    assert.match(dmHtml, /image\.src = definition\.tokenUrl \|\| DEFAULT_MONSTER_TOKEN/);
    assert.match(dmHtml, /\.generated-monster-token-preview\.is-open \{ display:block; \}/);
});

test('encounter Add Monster picker previews stat blocks and filters by CR, type, and environment', () => {
    const dmHtml = fs.readFileSync('public/dm.html', 'utf8');
    const environmentCatalog = JSON.parse(fs.readFileSync('public/data/api_data/monster_filter_catalog.json', 'utf8'));
    assert.match(dmHtml, /id="monsterCrFilter" aria-label="Filter monsters by challenge rating"/);
    assert.match(dmHtml, /id="monsterTypeFilter" aria-label="Filter monsters by type"/);
    assert.match(dmHtml, /id="monsterEnvironmentFilter" aria-label="Filter monsters by environment"/);
    assert.match(dmHtml, /fetch\('data\/api_data\/monster_filter_catalog\.json'\)/);
    assert.match(dmHtml, /selectedCr == null \|\| cr === selectedCr/);
    assert.match(dmHtml, /!selectedType \|\| String\(monster\.type \|\| ''\)\.toLowerCase\(\) === selectedType/);
    assert.match(dmHtml, /!selectedEnvironment \|\| environments\.includes\(selectedEnvironment\)/);
    assert.match(dmHtml, /nameButton\.className = 'monster-picker-name'/);
    assert.match(dmHtml, /nameButton\.addEventListener\('click', \(\) => openGeneratedMonsterStatblock\(monster\.name\)\)/);
    assert.match(dmHtml, /nameButton\.addEventListener\('pointerenter', \(\) => showGeneratedMonsterTokenPreview\(nameButton, monster\.name\)\)/);
    assert.deepEqual(environmentCatalog.find(monster => monster.name === 'Aarakocra')?.environment, ['mountain']);
    assert.equal(environmentCatalog.find(monster => monster.name === 'Aarakocra')?.type, 'humanoid');
    assert.equal(environmentCatalog.find(monster => monster.name === 'Aboleth')?.type, 'aberration');
    assert.ok(environmentCatalog.length > 3400);
});

test('monster picker uses a compact count row and top-right red close action', () => {
    const dmHtml = fs.readFileSync('public/dm.html', 'utf8');
    assert.match(dmHtml, /class="monster-picker-count-row">\s*<label for="monsterCount">#<\/label>\s*<input id="monsterCount"[^>]*aria-label="Number of monsters to add">\s*<button id="confirmMonsterBtn" class="monster-picker-confirm"[^>]*>Enter<\/button>/);
    assert.match(dmHtml, /<h2 id="monsterPickerHeading">Add Monsters<\/h2>\s*<button id="closeMonsterModal" class="monster-picker-close"[^>]*aria-label="Cancel and close monster picker"[^>]*><span aria-hidden="true">×<\/span><\/button>/);
    assert.match(dmHtml, /\.monster-picker-count-row \{[^}]*display:flex;[^}]*align-items:center;[^}]*justify-content:center;/);
    assert.match(dmHtml, /\.monster-picker-count-row input \{[^}]*width:3ch;[^}]*appearance:textfield;/);
    assert.match(dmHtml, /\.monster-picker-close \{[^}]*position:absolute;[^}]*top:10px;[^}]*right:10px;[^}]*color:#ff777f;[^}]*background:#351416;[^}]*border:1px solid #ff777f;/);
    assert.doesNotMatch(dmHtml, /Number of Monsters to Add:/);
    assert.doesNotMatch(dmHtml, /id="closeMonsterModal"[^>]*>Cancel<\/button>/);
});

test('encounter picker additions and red row removals recalculate adjusted XP', () => {
    const dmHtml = fs.readFileSync('public/dm.html', 'utf8');
    assert.match(dmHtml, /const additions = Array\.from\(\{ length: number \}, \(\) => \(\{ name:definition\.name, cr \}\)\);\s*setCurrentEncounterMonsters\(\[\.\.\.currentEncounterMonsters, \.\.\.additions\]\)/);
    assert.doesNotMatch(dmHtml, /confirmMonsterBtn\.addEventListener[\s\S]*?monsterPlacement\.enqueue\(additions\)/);
    assert.match(dmHtml, /removeButton\.className = 'encounter-monster-remove'[\s\S]*?removeButton\.addEventListener\('click', \(\) => removeEncounterMonster\(index\)\)/);
    assert.match(dmHtml, /function removeEncounterMonster\(index\)[\s\S]*?setCurrentEncounterMonsters\(remaining\)/);
    assert.match(dmHtml, /function setCurrentEncounterMonsters\(monsterList\)[\s\S]*?renderEncounterMonsterList\(currentEncounterMonsters\);\s*refreshEncounterXpHeading\(\)/);
    assert.match(dmHtml, /\.encounter-monster-remove \{[^}]*color:#ff777f;[^}]*background:#351416;[^}]*border:1px solid #ff777f;/);
    assert.match(dmHtml, /currentEncounterMonsters\.map\(async monster => \(\{ \.\.\.buildMonsterInstance/);
});
