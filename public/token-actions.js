const TokenActions = (() => {
  // Blade Ward uses the 2024 wording; other existing summaries retain their current rules.
  const effects = {
    Blinded: 'Cannot see; sight-based checks fail. Your attacks have disadvantage; attacks against you have advantage.',
    Charmed: 'Cannot attack the charmer or target them with harmful effects. The charmer has advantage on social ability checks against you.',
    Deafened: 'Cannot hear; hearing-based ability checks fail.',
    Frightened: 'While the source is visible, ability checks and attacks have disadvantage. Cannot willingly approach the source.',
    Grappled: 'Speed is 0, with no speed bonuses. Ends if the grappler is incapacitated or you are moved beyond their reach.',
    Incapacitated: 'Cannot take actions or reactions; concentration ends.',
    Invisible: 'Cannot be seen without magic or a special sense; noise and tracks can reveal your location. Your attacks have advantage; attacks against you have disadvantage.',
    Paralyzed: 'Incapacitated; cannot move or speak. Strength and Dexterity saves fail. Attacks against you have advantage; hits from within 5 feet are critical hits.',
    Petrified: 'Transformed into solid material with gear; weight increases tenfold and aging stops. Incapacitated, unable to move or speak, and unaware. Attacks against you have advantage; Strength and Dexterity saves fail. Resistance to all damage; immune to poison and disease (existing ones are suspended).',
    Poisoned: 'Disadvantage on attacks and ability checks.',
    Prone: 'Can only crawl unless you stand up. Your attacks have disadvantage. Attacks against you have advantage within 5 feet and disadvantage from farther away.',
    Restrained: 'Speed is 0, with no speed bonuses. Your attacks and Dexterity saves have disadvantage; attacks against you have advantage.',
    Stunned: 'Incapacitated; cannot move and can speak only haltingly. Strength and Dexterity saves fail. Attacks against you have advantage.',
    Unconscious: 'Incapacitated, unaware, and unable to move or speak. Drop held items and fall prone. Strength and Dexterity saves fail. Attacks against you have advantage; hits from within 5 feet are critical hits.',
    Exhaustion: 'Cumulative levels: 1: disadvantage on ability checks. 2: speed halved. 3: disadvantage on attacks and saves. 4: maximum HP halved. 5: speed 0. 6: death. A long rest with food and drink removes one level. 0 clears exhaustion.',
    Dodging: 'Until your next turn, attacks against you have disadvantage if you can see the attacker, and Dexterity saves have advantage. Ends if incapacitated or your speed becomes 0.',
    'Blade Ward': 'Whenever a creature makes an attack roll against you before the spell ends, the attacker subtracts 1d4 from the attack roll.',
    "Hunter's Mark": 'The caster deals an extra 1d6 damage when hitting the marked target with a weapon attack and has advantage on Perception and Survival checks to find it. Requires concentration.',
    Hexed: 'The caster deals an extra 1d6 necrotic damage when hitting you with an attack. Disadvantage on ability checks using the ability chosen by the caster. Requires concentration.',
    Blessed: 'Add 1d4 to attack rolls and saving throws while Bless lasts. Requires caster concentration.',
    Baned: 'Subtract 1d4 from attack rolls and saving throws while Bane lasts. Requires caster concentration.',
    mark1: 'Custom marker 1: effects are defined by your DM.',
    mark2: 'Custom marker 2: effects are defined by your DM.',
    mark3: 'Custom marker 3: effects are defined by your DM.'
  };
  Object.assign(effects, {
    "Advantage": "Roll two d20s and use the higher result. Advantage and disadvantage cancel each other.",
    "Ancestral Protectors": "Targets affected by Ancestral Protectors suffer its attack penalties and protection effects. See the source feature for duration and details.",
    "Armor of Agathys": "Magical armor grants temporary hit points and can deal cold damage to a melee attacker. Use the spell and slot level for amounts and duration.",
    "Blink": "May shift you to the Ethereal Plane between turns. Follow the spell for its roll, return location, and restrictions.",
    "Blur": "Your blurred appearance hinders attacks against you. See the spell for senses that bypass the effect.",
    "Cause of Fear": "Tracks the Cause Fear spell. Apply Frightened as appropriate; use the spell for saves, concentration, and duration.",
    "Compelled Duel": "Tracks a creature challenged by Compelled Duel. Use the spell for attack restrictions, saves, and ending conditions.",
    "Concentration": "Maintaining a spell or effect. Damage can require a Constitution save to maintain it; starting another concentration effect ends the first.",
    "Confused": "Behavior is determined by the effect causing confusion. Refer to that effect for the behavior roll, saves, and duration.",
    "Disadvantage": "Roll two d20s and use the lower result. Advantage and disadvantage cancel each other.",
    "Divine Favor": "Weapon hits deal the additional radiant damage specified by Divine Favor while the spell lasts.",
    "Entangled": "Tracks entangling magic or terrain. Apply Restrained if the source requires it; use that source for escape rules.",
    "Flying": "Tracks flight. Use the source for flying speed, duration, and whether you can hover.",
    "Hasted": "Tracks Haste: increased speed, improved AC and Dexterity saves, and a limited extra action. Apply the spell's ending effects when it expires.",
    "Hexblade's Curse": "Tracks the Hexblade feature. Use the source for bonus damage, critical-hit range, duration, and healing when the target dies.",
    "Mark": "Custom marked target. The effect is defined by the ability or DM that placed the mark.",
    "Mirror Image": "Illusory duplicates protect you from attacks. Use the spell version in play to resolve attacks and remove duplicates.",
    "On Fire": "Burning. Damage, timing, and how to extinguish the flames depend on the source.",
    "Possessed": "Possessed by another entity. Control, protection, and ending conditions depend on the source.",
    "Raging": "Tracks Rage. Use the class feature for damage bonuses, resistances, restrictions, and duration.",
    "Sanctuary": "Magical protection can require an attacker to save before targeting you. Use the spell for affected attacks and ending conditions.",
    "Shell Defense": "Withdrawn into your shell. Use the Shell Defense feature for AC, saves, movement, and action restrictions.",
    "Shield of Faith": "Gain the AC bonus from Shield of Faith while the caster maintains the spell.",
    "Shifted": "Tracks a transformation or shifting feature. Benefits and duration depend on its source.",
    "Slayer's Prey": "Tracks the Monster Slayer feature. Apply its extra damage according to the feature's timing and targeting rules.",
    "Spirit Guardians": "Tracks the Spirit Guardians spell. Use the spell version in play for the area, movement effects, saves, and damage timing.",
    "Stabilized": "At 0 HP but stable: no death saves while stable. Remains unconscious; taking damage ends stability.",
    "Truesight": "Special sight that can reveal invisibility, illusions, and transformations within its range. Use the source for range and full effects.",
    "Warding Bond": "Tracks the protective bond. Apply the spell's defensive bonuses, damage sharing, range, and ending conditions."
});
  const icons = {
    "Advantage": "Advantage.png",
    "Ancestral Protectors": "Ancenstral Protectors.png",
    "Armor of Agathys": "Armor of Agathys.png",
    "Baned": "Baned.png",
    "Blessed": "Blessed.png",
    "Blinded": "Blinded.png",
    "Blink": "Blink.png",
    "Blur": "Blur.png",
    "Cause of Fear": "Cause of Fear.png",
    "Charmed": "Charmed.png",
    "Compelled Duel": "Compelled Duel.png",
    "Concentration": "Concentration.png",
    "Confused": "Confused.png",
    "Deafened": "Deafened.png",
    "Disadvantage": "Disadvantage.png",
    "Divine Favor": "Divine Favor.png",
    "Dodging": "Dodge Action.png",
    "Entangled": "Entangled.png",
    "Exhaustion": "Exhausted.png",
    "Flying": "Flying.png",
    "Frightened": "Frightened.png",
    "Grappled": "Grappled.png",
    "Hasted": "Hasted.png",
    "Hexed": "Hex.png",
    "Hexblade's Curse": "Hexblade's Curse.png",
    "Incapacitated": "Incapacitated.png",
    "Invisible": "Invisible.png",
    "Mark": "Mark.png",
    "Mirror Image": "Mirror Image.png",
    "On Fire": "On Fire.png",
    "Paralyzed": "Paralyzed.png",
    "Petrified": "Petrified.png",
    "Poisoned": "Poisoned.png",
    "Possessed": "Possessed.png",
    "Prone": "Prone.png",
    "Raging": "Raging.png",
    "Restrained": "Restrained.png",
    "Sanctuary": "Sanctuary.png",
    "Shell Defense": "Shell Defense.png",
    "Shield of Faith": "Shield of Faith.png",
    "Shifted": "Shifted.png",
    "Slayer's Prey": "Slayer's Prey.png",
    "Spirit Guardians": "Spirit Guardians.png",
    "Stabilized": "Stabilized.png",
    "Stunned": "Stunned.png",
    "Truesight": "Truesight.png",
    "Unconscious": "Unconcious.png",
    "Warding Bond": "Warding Bond.png",
    "Hunter's Mark": "Mark.png",
    "mark1": "Mark.png",
    "mark2": "Mark.png",
    "mark3": "Mark.png"
};
  effects.Shield = 'Until the start of your next turn, gain +5 AC, including against the triggering attack, and take no damage from Magic Missile.';
  icons['Blade Ward'] = 'Blade Ward.png';
  icons.Shield = 'Shield.png';
  delete effects.Mark;
  const spellNames = new Set(["Armor of Agathys", "Baned", "Blade Ward", "Blessed", "Blink", "Blur", "Cause of Fear", "Compelled Duel", "Divine Favor", "Hasted", "Hexed", "Hunter's Mark", "Mirror Image", "Sanctuary", "Shield", "Shield of Faith", "Spirit Guardians", "Warding Bond"]);
  const classNames = new Set(["Ancestral Protectors", "Hexblade's Curse", "Raging", "Shell Defense", "Shifted", "Slayer's Prey"]);
  const category = name => spellNames.has(name) ? 'Spells' : classNames.has(name) ? 'Class Specific' : 'General';
  const displayName = name => /^mark[123]$/i.test(name) ? `Mark ${name.slice(-1)}` : name;
  function canonical(name) {
    if (name.toLowerCase() === 'mark') return "Hunter's Mark";
    return Object.keys(effects).find(key => key.toLowerCase() === name.toLowerCase()) || name;
  }
  function normalizeConditions(conditions = []) { return [...new Set(conditions.map(canonical))]; }
  const sizeCache = new Map();
  function sizeMultiplier(size) {
    const value = String(Array.isArray(size) ? size[0] : size || 'M').toLowerCase();
    return ({t:.5,tiny:.5,s:.75,small:.75,m:1,medium:1,l:2,large:2,h:3,huge:3,g:4,gargantuan:4})[value] || 1;
  }
  function tokenSize(monster, base) { return base * sizeMultiplier(monster.size || sizeCache.get(monster.name)?.size); }
  function resolveSize(monster, onReady, loader) {
    if (monster.size || monster.isplayer || monster.isNpc) return;
    if (!sizeCache.has(monster.name)) {
      const entry = {};
      entry.promise = Promise.resolve().then(() => loader ? loader(monster.name).then(def => def.monsterData) : fetch(`data/monsters/${encodeURIComponent(monster.name)}.json`).then(res => res.ok ? res.json() : {}))
        .then(data => { entry.size = data.size || 'M'; }).catch(() => { entry.size = 'M'; });
      sizeCache.set(monster.name, entry);
    }
    sizeCache.get(monster.name).promise.then(onReady);
  }
  function renderTokenConditions(monster, token, base) {
    if (!token) return;
    token.querySelector('.condition-label')?.remove();
    token.querySelector('.token-condition-ring')?.remove();
    const conditions = normalizeConditions(monster.conditions);
    if (!conditions.length) return;
    const ring = document.createElement('div'); ring.className = 'token-condition-ring';
    const diameter = tokenSize(monster, base), iconSize = Math.max(12, Math.min(24, base * .22));
    const perRing = 10;
    conditions.forEach((condition, index) => {
      const name = /^exhaustion(?:\s+\d+)?$/i.test(condition) ? 'Exhaustion' : condition;
      const orbit = Math.floor(index / perRing);
      const angle = -Math.PI / 2 - (index % perRing) * Math.PI * 2 / perRing;
      const radius = diameter / 2 + iconSize / 2 + orbit * (iconSize + 3);
      const badge = document.createElement('span'); badge.className = 'token-condition-badge';
      badge.style.cssText = `width:${iconSize}px;height:${iconSize}px;left:calc(50% + ${Math.cos(angle)*radius}px);top:calc(50% + ${Math.sin(angle)*radius}px)`;
      badge.title = `${displayName(condition)}: ${effects[name] || 'Custom condition'}`;
      badge.setAttribute('aria-label', displayName(condition));
      if (icons[name]) { const image = document.createElement('img'); image.src = `data/condition_icons/${encodeURIComponent(icons[name])}`; image.alt = ''; image.draggable = false; badge.append(image); }
      else badge.textContent = name.split(' ').map(word => word[0]).join('').slice(0,2);
      if (name === 'Exhaustion' || /^mark[123]$/.test(name)) { const level = document.createElement('small'); level.textContent = name === 'Exhaustion' ? exhaustion(conditions) : name.slice(-1); badge.append(level); }
      ring.append(badge);
    });
    token.append(ring);
  }
  const exhaustionPattern = /^exhaustion(?:\s+(\d+))?$/i;
  function exhaustion(conditions = []) {
    return conditions.reduce((level, item) => {
      const match = item.match(exhaustionPattern);
      return match ? Math.max(level, Math.min(6, Number(match[1] || 1))) : level;
    }, 0);
  }
  function withExhaustion(conditions, value) {
    const level = Math.min(6, Math.max(0, Math.trunc(Number(value) || 0)));
    return [...conditions.filter(item => !exhaustionPattern.test(item)), ...(level ? [`Exhaustion ${level}`] : [])];
  }
  function refresh(selected) {
    const grid = document.getElementById('mapConditionsGrid');
    if (!grid) return;
    if (!grid.children.length) {
      document.getElementById('mapActionPanel')?.addEventListener('wheel', event => event.stopPropagation(), { passive: true });
      let previousCategory = '', categoryGrid;
      const categories = ['General', 'Spells', 'Class Specific'];
      Object.entries(effects).sort(([a], [b]) => categories.indexOf(category(a)) - categories.indexOf(category(b)) || (a === 'Exhaustion' ? 1 : b === 'Exhaustion' ? -1 : displayName(a).localeCompare(displayName(b)))).forEach(([name, effect], index) => {
        if (previousCategory !== category(name)) {
          previousCategory = category(name);
          const folder = document.createElement('details'); folder.className = 'condition-folder'; folder.open = true;
          const heading = document.createElement('summary'); heading.className = 'condition-category'; heading.textContent = previousCategory;
          categoryGrid = document.createElement('div'); categoryGrid.className = 'condition-folder-grid';
          folder.append(heading, categoryGrid); grid.append(folder);
        }
        const row = document.createElement('div'); row.className = 'map-condition';
        const checkbox = document.createElement('input'); checkbox.type = 'checkbox'; checkbox.className = 'condition-toggle'; checkbox.id = `map-condition-${index}`; checkbox.dataset.condition = name;
        const label = document.createElement('label'); label.htmlFor = checkbox.id; label.textContent = displayName(name); label.tabIndex = 0;
        const tooltip = document.createElement('span'); tooltip.className = 'condition-tooltip'; tooltip.id = `condition-effect-${index}`; tooltip.role = 'tooltip'; tooltip.textContent = effect;
        label.setAttribute('aria-describedby', tooltip.id); checkbox.setAttribute('aria-describedby', tooltip.id);
        label.append(tooltip); row.append(checkbox);
        if (icons[name]) {
          const icon = document.createElement('img');
          icon.src = `data/condition_icons/${encodeURIComponent(icons[name])}`;
          icon.alt = ''; icon.className = 'condition-icon'; icon.width = 22; icon.height = 22;
          row.append(icon);
        }
        if (!icons[name]) {
          const icon = document.createElement('span'); icon.className = 'condition-icon condition-icon-fallback'; icon.textContent = name.split(' ').map(word => word[0]).join(''); icon.setAttribute('aria-hidden', 'true'); row.append(icon);
        }
        row.append(label);
        checkbox.addEventListener('change', () => applyMapTokenAction(name === 'Exhaustion' ? 'exhaustion' : checkbox.checked ? 'apply' : 'remove', name, checkbox.checked ? 1 : 0));
        if (name === 'Exhaustion') {
          const counter = document.createElement('input'); counter.type = 'number'; counter.min = 0; counter.max = 6; counter.step = 1; counter.id = 'mapExhaustionLevel'; counter.setAttribute('aria-label', 'Exhaustion level (0 to 6)');
          counter.addEventListener('change', () => { if (counter.value !== '') applyMapTokenAction('exhaustion', name, counter.value); });
          row.append(counter); row.classList.add('map-exhaustion');
        }
        categoryGrid.append(row);
      });
      // Keep DOM and keyboard order alphabetical while filling columns top to bottom.
      for (const folder of grid.children) {
        const rows = Array.from(folder.children[1].children);
        const conditions = rows.filter(row => row.children[0].dataset.condition !== 'Exhaustion');
        const columnHeight = Math.ceil(conditions.length / 3);
        conditions.forEach((row, index) => {
          row.style.gridColumn = String(Math.floor(index / columnHeight) + 1);
          row.style.gridRow = String(index % columnHeight + 1);
        });
        const exhaustionRow = rows.find(row => row.children[0].dataset.condition === 'Exhaustion');
        if (exhaustionRow) exhaustionRow.style.gridRow = String(columnHeight + 1);
      }
    }
    grid.querySelectorAll('input[type="checkbox"]').forEach(input => {
      const count = selected.filter(monster => input.dataset.condition === 'Exhaustion' ? exhaustion(monster.conditions) > 0 : normalizeConditions(monster.conditions).some(item => item.toLowerCase() === input.dataset.condition.toLowerCase())).length;
      input.checked = selected.length > 0 && count === selected.length;
      input.indeterminate = count > 0 && count < selected.length;
      input.title = input.indeterminate ? 'Mixed: enabled for some selected tokens. Toggle to enable for all.' : input.checked ? 'On' : 'Off';
      input.disabled = !selected.length;
    });
    const levels = selected.map(monster => exhaustion(monster.conditions));
    const counter = document.getElementById('mapExhaustionLevel');
    counter.value = levels.every(level => level === levels[0]) ? levels[0] || 0 : '';
    counter.placeholder = 'Mixed'; counter.disabled = !selected.length;
  }
  return { refresh, exhaustion, withExhaustion, normalizeConditions, tokenSize, sizeMultiplier, resolveSize, renderTokenConditions };
})();
if (typeof module !== 'undefined') module.exports = TokenActions;
