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
