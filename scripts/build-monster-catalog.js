const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const monsterDirectory = path.join(root, 'public', 'data', 'monsters');
const filterOutputPath = path.join(root, 'public', 'data', 'api_data', 'monster_filter_catalog.json');

function parseCrValue(value) {
    if (typeof value === 'number') return value;
    const cleaned = String(value || '0').split(' ')[0];
    if (cleaned.includes('/')) {
        const [numerator, denominator] = cleaned.split('/').map(Number);
        return denominator ? numerator / denominator : 0;
    }
    return Number(cleaned) || 0;
}

const definitions = fs.readdirSync(monsterDirectory, { withFileTypes:true })
    .filter(entry => entry.isFile() && entry.name.toLowerCase().endsWith('.json'))
    .map(entry => {
        const data = JSON.parse(fs.readFileSync(path.join(monsterDirectory, entry.name), 'utf8'));
        const rawType = typeof data.type === 'string' ? data.type : data.type?.type || '';
        const type = String(rawType).trim().toLowerCase().replace(/^aberition$/, 'aberration');
        return { name:data.name, cr:parseCrValue(data.cr), environment:Array.isArray(data.environment) ? data.environment : [], type };
    })
    .filter(monster => monster.name)
    .sort((a, b) => a.name < b.name ? -1 : a.name > b.name ? 1 : 0);

const filterCatalog = definitions.map(monster => ({ name:monster.name, environment:monster.environment, type:monster.type }));
fs.writeFileSync(filterOutputPath, `${JSON.stringify(filterCatalog)}\n`);
console.log(`Wrote ${filterCatalog.length} monster filter records.`);
