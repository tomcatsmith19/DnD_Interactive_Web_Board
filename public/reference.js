const typeSelect = document.getElementById('typeSelect');
const searchInput = document.getElementById('searchInput');
const itemList = document.getElementById('itemList');
const searchBtn = document.getElementById('searchBtn');
const description = document.getElementById('description');

let dndData = {};
let nameToIndex = {};

const CATEGORIES = ['equipment', 'monsters', 'spells', 'magic-items'];

// Load all JSON files
Promise.all(CATEGORIES.map(cat =>
    fetch(`data/api_data/${cat}.json`).then(res => res.json()).then(data => ({ [cat]: data }))
)).then(results => {
    dndData = Object.assign({}, ...results);
    CATEGORIES.forEach(cat => {
        const opt = document.createElement('option');
        opt.value = cat;
        opt.textContent = cat;
        typeSelect.appendChild(opt);
    });
    updateItemList();
});

// Update item list on type change
typeSelect.addEventListener('change', updateItemList);

// Filter list on input
searchInput.addEventListener('input', () => {
    const filter = searchInput.value.toLowerCase();
    const filtered = Object.keys(nameToIndex).filter(name => name.toLowerCase().includes(filter));
    renderItemList(filtered);
});

// Populate list and nameToIndex
function updateItemList() {
    const category = typeSelect.value;
    const items = dndData[category];
    nameToIndex = {};
    items.forEach(item => nameToIndex[item.name] = item.index);
    renderItemList(Object.keys(nameToIndex));
}

// Render item list
function renderItemList(names) {
    itemList.innerHTML = '';
    names.forEach(name => {
        const div = document.createElement('div');
        div.textContent = name;
        div.className = 'item';
        div.onclick = () => searchItem(name);
        itemList.appendChild(div);
    });
}


function searchItem(name) {
    const category = typeSelect.value;
    const index = nameToIndex[name];

    fetch(`https://www.dnd5eapi.co/api/${category}/${index}`)
        .then(res => res.json())
        .then(data => {
            const formatted = formatReadable(category, data);
            description.textContent = formatted;
        });

    Array.from(itemList.children).forEach(c => c.classList.remove('selected'));
    const selected = Array.from(itemList.children).find(c => c.textContent === name);
    if (selected) selected.classList.add('selected');
}

function getSpellStr(spell) {
  if (!spell) return "Spell not found.";

  const lines = [
    `Name: ${spell.name ?? 'N/A'}`,
    `Level: ${spell.level ?? 'N/A'}`,
    `Description: ${(spell.desc || []).join(' ')}`,
    `Range: ${spell.range ?? 'N/A'}`,
    `Components: ${(spell.components || []).join(', ')}`,
    `Material: ${spell.material || 'None'}`,
    `Ritual: ${spell.ritual ? 'Yes' : 'No'}`,
    `Duration: ${spell.duration ?? 'N/A'}`,
    `Concentration: ${spell.concentration ? 'Yes' : 'No'}`,
    `Casting Time: ${spell.casting_time ?? 'N/A'}`,
    `Higher Level: ${(spell.higher_level || ['None']).join(' ')}`
  ];

  if (spell.damage?.damage_type)
    lines.push(`Damage Type: ${spell.damage.damage_type.name}`);
  if (spell.damage?.damage_at_slot_level) {
    lines.push("Damage at Slot Levels:");
    for (const [level, damage] of Object.entries(spell.damage.damage_at_slot_level)) {
      lines.push(`  Level ${level}: ${damage}`);
    }
  }
  if (spell.dc)
    lines.push(`Save DC: ${spell.dc.dc_type.name} - ${spell.dc.dc_success}`);
  if (spell.area_of_effect)
    lines.push(`Area of Effect: ${spell.area_of_effect.type} - ${spell.area_of_effect.size} ft`);

  return lines.join('\n');
}

function getMonsterStr(monster) {
  if (!monster) return "Monster not found.";

  const armorClass = monster.armor_class?.map(ac => `${ac.value} (${ac.type})`).join(', ') || 'N/A';
  const proficiencies = monster.proficiencies?.map(p => `${p.proficiency.name} +${p.value}`).join(', ') || 'None';
  const specials = (monster.special_abilities || []).map(a => `${a.name}: ${a.desc}`).join(', ');

  const lines = [
    `Name: ${monster.name ?? 'N/A'}`,
    `Size: ${monster.size ?? 'N/A'}`,
    `Type: ${monster.type ?? 'N/A'} (${monster.subtype ?? 'N/A'})`,
    `Alignment: ${monster.alignment ?? 'N/A'}`,
    `Armor Class: ${armorClass}`,
    `Hit Points: ${monster.hit_points ?? 'N/A'} (${monster.hit_dice ?? 'N/A'})`,
    `Speed: ${Object.entries(monster.speed || {}).map(([mode, val]) => `${mode}: ${val}`).join(', ')}`,
    `STR: ${monster.strength}, DEX: ${monster.dexterity}, CON: ${monster.constitution}, INT: ${monster.intelligence}, WIS: ${monster.wisdom}, CHA: ${monster.charisma}`,
    `Proficiencies: ${proficiencies}`,
    `Vulnerabilities: ${monster.damage_vulnerabilities?.join(', ') || 'None'}`,
    `Resistances: ${monster.damage_resistances?.join(', ') || 'None'}`,
    `Immunities: ${monster.damage_immunities?.join(', ') || 'None'}`,
    `Condition Immunities: ${monster.condition_immunities?.join(', ') || 'None'}`,
    `Senses: ${Object.entries(monster.senses || {}).map(([sense, val]) => `${sense}: ${val}`).join(', ')}`,
    `Languages: ${monster.languages ?? 'None'}`,
    `Challenge Rating: ${monster.challenge_rating ?? 'N/A'}`,
    `Special Abilities: ${specials}`,
    `Actions: ${(monster.actions || []).map(a => `${a.name}: ${a.desc}`).join(', ')}`,
    `Legendary Actions: ${(monster.legendary_actions || []).map(a => `${a.name}: ${a.desc}`).join(', ')}`
  ];

  return lines.join('\n');
}

function getItemStr(item) {
  if (!item) return "Item not found.";

  const lines = [
    `Name: ${item.name ?? 'N/A'}`,
    `Category: ${item.equipment_category?.name ?? 'N/A'}`,
    `Cost: ${item.cost?.quantity ?? 'N/A'} ${item.cost?.unit ?? ''}`,
    `Weight: ${item.weight ?? 'N/A'} lb`,
    `Description: ${(item.desc || ['No description available.']).join(' ')}`
  ];

  if (item.damage)
    lines.push(`Damage: ${item.damage.damage_dice} ${item.damage.damage_type.name}`);
  if (item.two_handed_damage)
    lines.push(`Two-Handed Damage: ${item.two_handed_damage.damage_dice} ${item.two_handed_damage.damage_type.name}`);
  if (item.range) {
    lines.push(`Range: ${item.range.normal ?? 'N/A'} ft.`);
    if (item.range.long) lines.push(`Long Range: ${item.range.long} ft.`);
  }
  if (item.properties)
    lines.push(`Properties: ${item.properties.map(p => p.name).join(', ')}`);

  return lines.join('\n');
}

function getMagicItemStr(item) {
  if (!item) return "Magic item not found.";

  const lines = [
    `Name: ${item.name}`,
    `Category: ${item.equipment_category.name}`,
    `Rarity: ${item.rarity.name}`,
    `Description: ${(item.desc || []).join(' ')}`
  ];

  if (item.variants?.length) {
    lines.push("Variants:");
    item.variants.forEach(v => lines.push(`  - ${v.name}`));
  }

  return lines.join('\n');
}


function formatReadable(category, data) {
  if (!data) return "No data available.";

  switch (category) {
    case 'spells':
      return getSpellStr(data);
    case 'monsters':
      return getMonsterStr(data);
    case 'equipment':
      return getItemStr(data);
    case 'magic-items':
      return getMagicItemStr(data);
    default:
      return JSON.stringify(data, null, 2);
  }
}