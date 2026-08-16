import DiceBox from './vendor/dice-box-threejs/dice-box-threejs.es.js?v=3';

const SHARED_START_DELAY = 1800;
const style = document.createElement('style');
style.textContent = `
  #sharedDiceStage { position:fixed; inset:0; z-index:5000; pointer-events:none; visibility:hidden; background:radial-gradient(ellipse at center,rgba(56,42,20,.18),rgba(0,0,0,.08)); }
  #sharedDiceStage.is-rolling { visibility:visible; }
  #sharedDiceStage canvas { width:100% !important; height:100% !important; }
  #sharedDicePopup { position:fixed; z-index:5100; left:50%; top:12%; width:min(520px,calc(100vw - 32px)); transform:translate(-50%,-25px); box-sizing:border-box; padding:16px 20px; color:white; background:rgba(29,16,9,.96); border:2px solid #f4d76d; border-radius:12px; box-shadow:0 10px 40px #000; text-align:center; opacity:0; visibility:hidden; transition:opacity .2s ease,transform .2s ease; pointer-events:none; }
  #sharedDicePopup.is-visible { opacity:1; visibility:visible; transform:translate(-50%,0); }
  #sharedDicePopup h2 { margin:0 0 8px; color:#f4d76d; font-family:'MedievalSharp',serif; }
  #sharedDicePopup .dice-popup-total { color:#f4d76d; font-size:2rem; font-weight:bold; }
  #sharedDicePopup .dice-popup-groups { margin-top:8px; line-height:1.45; }
`;
document.head.appendChild(style);

const stage = document.createElement('div');
stage.id = 'sharedDiceStage';
stage.setAttribute('aria-hidden', 'true');
const popup = document.createElement('section');
popup.id = 'sharedDicePopup';
popup.setAttribute('role', 'status');
popup.setAttribute('aria-live', 'polite');
document.body.append(stage, popup);

const themes = {
  default: { theme_customColorset:{ name:'Campaign Gold', foreground:'#1d1009', background:'#f4d76d', outline:'#f4d76d', texture:'none' }, theme_texture:'none', theme_material:'glass' },
  blueGreenMetal: { theme_colorset:'water', theme_texture:'metal', theme_material:'metal' },
  diceOfRolling: { theme_colorset:'rainbow', theme_texture:'none', theme_material:'glass' },
  gemstone: { theme_colorset:'poison', theme_texture:'stainedglass', theme_material:'glass' },
  gemstoneMarble: { theme_colorset:'breebaby', theme_texture:'marble', theme_material:'glass' },
  rock: { theme_colorset:'black', theme_texture:'stone', theme_material:'none' },
  rust: { theme_colorset:'bronze', theme_texture:'metal', theme_material:'metal' },
  smooth: { theme_colorset:'earth', theme_texture:'none', theme_material:'glass' },
  wooden: { theme_colorset:'earth', theme_texture:'wood', theme_material:'wood' }
};

const customizationOptions = {
  colorset: [
    ['campaignGold','Campaign Gold'],['coin_default','Gold Coin'],['coin_silver','Silver Coin'],['radiant','Radiant'],['fire','Fire'],['ice','Ice'],['poison','Poison'],['acid','Acid'],['thunder','Thunder'],['lightning','Lightning'],['air','Air'],['water','Water'],['earth','Earth'],['force','Force'],['psychic','Psychic'],['necrotic','Necrotic'],['breebaby','Pastel Sunset'],['pinkdreams','Pink Dreams'],['inspired','Inspired'],['bloodmoon','Blood Moon'],['starynight','Starry Night'],['glitterparty','Glitter Party'],['astralsea','Astral Sea'],['bronze','Bronze'],['dragons','Dragons'],['birdup','Bird Up'],['tigerking','Tiger King'],['covid','Covid'],['acleaf','Animal Crossing'],['isabelle','Isabelle'],['thecage','Nicholas Cage'],['test','Test'],['rainbow','Rainbow'],['black','Black'],['white','White'],['swrpg_abi','SW RPG Ability'],['swrpg_pro','SW RPG Proficiency'],['swrpg_dif','SW RPG Difficulty'],['swrpg_cha','SW RPG Challenge'],['swrpg_boo','SW RPG Boost'],['swrpg_set','SW RPG Setback'],['swrpg_for','SW RPG Force'],['swa_red','Armada Red'],['swa_blue','Armada Blue'],['swa_black','Armada Black'],['xwing_red','X-Wing Red'],['xwing_green','X-Wing Green'],['swl_atkred','Legion Attack Red'],['swl_atkblack','Legion Attack Black'],['swl_atkwhite','Legion Attack White'],['swl_defred','Legion Defense Red'],['swl_defwhite','Legion Defense White']
  ],
  texture: [['preset','Colorset Default'],['none','None'],['cloudy','Clouds (Transparent)'],['cloudy_2','Clouds'],['fire','Fire'],['marble','Marble'],['water','Water'],['ice','Ice'],['paper','Paper'],['speckles','Speckles'],['glitter','Glitter'],['glitter_2','Glitter (Transparent)'],['stars','Stars'],['stainedglass','Stained Glass'],['wood','Wood'],['metal','Stainless Steel'],['skulls','Skulls'],['leopard','Leopard'],['tiger','Tiger'],['cheetah','Cheetah'],['dragon','Dragon'],['lizard','Lizard'],['bird','Feathers'],['astral','Astral Sea'],['acleaf','Animal Crossing Leaf'],['thecage','Nicholas Cage'],['isabelle','Isabelle'],['bronze01','Bronze 1'],['bronze02','Bronze 2'],['bronze03','Bronze 3'],['bronze03a','Bronze 3A'],['bronze03b','Bronze 3B'],['bronze04','Bronze 4']],
  material: [['glass','Glass'],['metal','Metal'],['wood','Wood'],['none','Standard']],
  surface: [['default','Default'],['blue-felt','Blue Felt'],['red-felt','Red Felt'],['green-felt','Green Felt'],['taverntable','Tavern Table'],['mahogany','Mahogany'],['stainless','Stainless Steel'],['cyberpunk','Cyberpunk'],['cagetown','Cage Town']]
};

const previewColors = { campaignGold:'#f4d76d', coin_default:'#d8a900', coin_silver:'#c8c8c8', radiant:'#fff3a3', fire:'#b62916', ice:'#3c6ac1', poison:'#66409e', acid:'#83b625', thunder:'#777', lightning:'#f3ca40', air:'#b4d9e2', water:'#5b8691', earth:'#527f22', force:'#c651c6', psychic:'#934fc3', necrotic:'#6f0000', black:'#111', white:'#fff', rainbow:'#ff5959', bronze:'#7a4e06' };

let diceBox;
let diceReady;
let popupTimer;
let clearTimer;
let activeRoll = Promise.resolve();
let appliedSurface = '';
let lastCompletedPayload = null;
const seenRollIds = new Set();
const listenerStartedAt = Date.now();
const previewStates = new Map();
const previewSoundBuffers = new Map();
let previewAudioContext;

function initializeDiceBox(surface = 'green-felt') {
  if (diceReady && appliedSurface === surface) return diceReady;
  if (diceBox && appliedSurface !== surface) {
    diceBox.clearDice?.();
    stage.replaceChildren();
    diceBox = null;
    diceReady = null;
  }
  appliedSurface = surface;
  diceBox = new DiceBox('#sharedDiceStage', {
    assetPath:'/assets/dice-box-threejs/', sounds:true, volume:100, shadows:true,
    theme_surface:surface, theme_colorset:'white', theme_texture:'none', theme_material:'glass'
  });
  diceReady = diceBox.initialize().catch(error => {
    console.error('Could not initialize 3D dice:', error);
    diceReady = null;
    throw error;
  });
  return diceReady;
}

function safeMarkup(markup) {
  const template = document.createElement('template');
  template.innerHTML = markup || '';
  template.content.querySelectorAll('script,style,iframe,object,embed').forEach(node => node.remove());
  template.content.querySelectorAll('*').forEach(node => [...node.attributes].forEach(attribute => {
    if (attribute.name.startsWith('on')) node.removeAttribute(attribute.name);
  }));
  return template.innerHTML;
}

function showResult(payload, shared) {
  clearTimeout(popupTimer);
  popup.innerHTML = `<h2>${shared ? 'Shared roll' : 'Dice roll'} — ${payload.roller || 'Adventurer'}</h2><div class="dice-popup-total">${Number(payload.total) || 0}</div><div class="dice-popup-groups">${safeMarkup(payload.markup)}</div>`;
  popup.classList.add('is-visible');
  popupTimer = setTimeout(() => popup.classList.remove('is-visible'), 5000);
}

function secureDie(sides) {
  const range = 0x100000000;
  const limit = range - (range % sides);
  const value = new Uint32Array(1);
  do crypto.getRandomValues(value); while (value[0] >= limit);
  return (value[0] % sides) + 1;
}

function completeRequest(request) {
  const dice = request.dice.map(die => {
    const sides = Number(die.sides);
    const count = Math.min(100, Math.max(0, Number(die.count) || 0));
    return { sides, count, rolls:Array.from({length:count}, () => secureDie(sides)) };
  }).filter(group => group.count);
  const subtotal = dice.reduce((sum, group) => sum + group.rolls.reduce((groupSum, value) => groupSum + value, 0), 0);
  const modifier = Math.trunc(Number(request.modifier) || 0);
  const total = subtotal + modifier;
  const groups = dice.map(group => `<div><b>${group.count}d${group.sides}:</b> ${group.rolls.join(', ')}</div>`).join('');
  const markup = `<div><strong>${total}</strong> total</div>${groups}<div>${subtotal} ${modifier < 0 ? '−' : '+'} ${Math.abs(modifier)} = ${total}</div>`;
  return { ...request, dice, modifier, subtotal, total, markup, createdAt:Date.now() };
}

function forcedNotation(payload) {
  const expressions = [];
  const outcomes = [];
  payload.dice.forEach(group => {
    if (group.sides === 100) {
      expressions.push(`${group.count}d100`, `${group.count}d10`);
      outcomes.push(...group.rolls.map(value => {
        const percentile = value % 100;
        return percentile < 10 ? 100 : Math.floor(percentile / 10) * 10;
      }));
      outcomes.push(...group.rolls.map(value => value % 10 || 10));
      return;
    }
    expressions.push(`${group.count}d${group.sides}`);
    outcomes.push(...group.rolls);
  });
  return `${expressions.join('+')}@${outcomes.join(',')}`;
}

function updateLocalOutput(payload) {
  if (!payload.sourcePrefix) return;
  const output = document.getElementById(`${payload.sourcePrefix}DiceResult`);
  if (output) output.innerHTML = safeMarkup(payload.markup);
  const appearanceOutput = document.getElementById(`${payload.sourcePrefix}DiceAppearanceResult`);
  if (appearanceOutput) {
    const summary = String(payload.appearanceSummary || 'Default appearance').split('; ').join('<br>');
    appearanceOutput.innerHTML = `<strong>${payload.appearanceMode || 'Custom'} Appearance</strong><br>${safeMarkup(summary)}`;
  }
}

async function animate(payload) {
  clearTimeout(clearTimer);
  const config = payload.themeConfig || themes[payload.theme] || themes.default;
  const soundCheckbox = document.getElementById('dmDiceSounds') || document.getElementById('playerDiceSounds');
  const volumeSlider = document.getElementById('dmSfxVolume') || document.getElementById('sfxVolume');
  const sounds = soundCheckbox?.checked !== false;
  const volume = Math.round(Math.min(1, Math.max(0, Number(volumeSlider?.value) || 0)) * 100);
  await initializeDiceBox(config.theme_surface || 'green-felt');
  stage.classList.add('is-rolling');
  const appliedConfig = { ...config, sounds, volume };
  if (appliedConfig.theme_texture === 'preset') {
    diceBox.theme_texture = '';
    delete appliedConfig.theme_texture;
  }
  await diceBox.updateConfig(appliedConfig);
  await diceBox.roll(forcedNotation(payload));
}

function finishAnimation(payload, shared) {
  updateLocalOutput(payload);
  showResult(payload, shared);
  lastCompletedPayload = JSON.parse(JSON.stringify(payload));
  const replayButton = document.getElementById('dmReplayDiceRoll') || document.getElementById('playerReplayDiceRoll');
  if (replayButton) replayButton.disabled = false;
  const applyButton = document.getElementById('dmApplyDiceAppearance') || document.getElementById('playerApplyDiceAppearance');
  if (applyButton) applyButton.disabled = !payload.appearanceSelection;
  clearTimer = setTimeout(() => { diceBox?.clearDice(); stage.classList.remove('is-rolling'); }, 3000);
}

function reportFailure(payload, error) {
  stage.classList.remove('is-rolling');
  const output = document.getElementById(`${payload.sourcePrefix}DiceResult`);
  if (output) output.textContent = 'The 3D dice could not be rolled. Please try again.';
  console.error('3D dice roll failed:', error);
}

function runAnimation(payload, shared) {
  activeRoll = activeRoll.catch(() => {}).then(async () => {
    try { await animate(payload); finishAnimation(payload, shared); }
    catch (error) { reportFailure(payload, error); }
  });
  return activeRoll;
}

function scheduleSharedRoll(payload) {
  setTimeout(() => runAnimation(payload, true), Math.max(0, Number(payload.startAt) - Date.now()));
}

const sharedRollRef = window.firebase?.firestore?.().collection('shared').doc('diceRoll');
if (sharedRollRef) {
  sharedRollRef.onSnapshot(snapshot => {
    if (!snapshot.exists) return;
    const payload = snapshot.data() || {};
    if (!payload.id || seenRollIds.has(payload.id) || Number(payload.createdAt) < listenerStartedAt - 1000) return;
    seenRollIds.add(payload.id);
    scheduleSharedRoll(payload);
  }, error => console.error('Could not receive shared dice rolls:', error));
}

function optionName(category, value) {
  return customizationOptions[category].find(option => option[0] === value)?.[1] || value;
}

function buildCustomization(colorset, texture, material, surface) {
  const theme = { theme_texture:texture, theme_material:material, theme_surface:surface };
  if (colorset === 'campaignGold') {
    theme.theme_texture = texture === 'preset' ? 'none' : texture;
    theme.theme_customColorset = { name:'Campaign Gold', foreground:'#1d1009', background:'#f4d76d', outline:'#f4d76d', texture:theme.theme_texture };
  }
  else theme.theme_colorset = colorset;
  return theme;
}

function getCustomization(prefix) {
  const values = getCustomizationValues(prefix);
  return buildCustomization(values.colorset, values.texture, values.material, values.surface);
}

function getCustomizationValues(prefix) {
  return {
    colorset:document.getElementById(`${prefix}DiceColorset`)?.value || 'campaignGold',
    texture:document.getElementById(`${prefix}DiceTexture`)?.value || 'none',
    material:document.getElementById(`${prefix}DiceMaterial`)?.value || 'glass',
    surface:document.getElementById(`${prefix}DiceSurface`)?.value || 'green-felt'
  };
}

function getCustomizationDetails(prefix) {
  const values = getCustomizationValues(prefix);
  return {
    themeConfig:buildCustomization(values.colorset, values.texture, values.material, values.surface),
    summary:`${optionName('colorset', values.colorset)}; ${optionName('texture', values.texture)}; ${optionName('material', values.material)}; ${optionName('surface', values.surface)}`,
    selection:values
  };
}

function randomOption(category) {
  const options = customizationOptions[category];
  return options[secureDie(options.length) - 1];
}

function getRandomCustomization() {
  const [colorset, colorsetName] = randomOption('colorset');
  const [texture, textureName] = randomOption('texture');
  const [material, materialName] = randomOption('material');
  const [surface, surfaceName] = randomOption('surface');
  return {
    themeConfig:buildCustomization(colorset, texture, material, surface),
    summary:`${colorsetName}; ${textureName}; ${materialName}; ${surfaceName}`,
    selection:{ colorset, texture, material, surface }
  };
}

function updateCustomizerPreview(menu) {
  const prefix = menu.dataset.diceCustomizer;
  const colorset = document.getElementById(`${prefix}DiceColorset`)?.value || 'campaignGold';
  const texture = document.getElementById(`${prefix}DiceTexture`)?.value || 'none';
  const material = document.getElementById(`${prefix}DiceMaterial`)?.value || 'glass';
  const surface = document.getElementById(`${prefix}DiceSurface`)?.value || 'green-felt';
  const details = menu.querySelector('.dice-preview-details');
  if (details) details.innerHTML = `<b>${optionName('colorset', colorset)}</b><br>${optionName('texture', texture)} · ${optionName('material', material)}<br>${optionName('surface', surface)}`;
}

function schedulePreviewRoll(menu) {
  const prefix = menu.dataset.diceCustomizer;
  const details = menu.closest('details');
  if (!details?.open) return;
  const state = previewStates.get(prefix) || { box:null, surface:'', ready:null, timer:null, generation:0 };
  clearTimeout(state.timer);
  state.timer = setTimeout(async () => {
    const generation = ++state.generation;
    try {
      const config = getCustomization(prefix);
      const surface = config.theme_surface || 'green-felt';
      const previewStage = document.getElementById(`${prefix}DicePreviewStage`);
      if (!previewStage) return;
      state.box?.clearDice?.();
      previewStage.replaceChildren();
      state.surface = surface;
      const previewConfig = { ...config };
      if (previewConfig.theme_texture === 'preset') {
        previewConfig.theme_texture = '';
      }
      const previewBox = new DiceBox(`#${prefix}DicePreviewStage`, {
        assetPath:'/assets/dice-box-threejs/', sounds:false, volume:0, shadows:true,
        theme_surface:surface, theme_colorset:'white', theme_texture:'none', theme_material:'glass',
        ...previewConfig
      });
      state.box = previewBox;
      state.ready = previewBox.initialize();
      await state.ready;
      if (generation !== state.generation) return;
      await previewBox.roll('1d20');
    } catch (error) { console.error('Dice preview failed:', error); }
  }, 120);
  previewStates.set(prefix, state);
}

async function playDiceSoundPreview(prefix) {
  const soundCheckbox = document.getElementById('dmDiceSounds') || document.getElementById('playerDiceSounds');
  if (soundCheckbox?.checked === false) return;
  const volumeSlider = document.getElementById('dmSfxVolume') || document.getElementById('sfxVolume');
  const volume = Math.min(1, Math.max(0, Number(volumeSlider?.value) || 0));
  const material = document.getElementById(`${prefix}DiceMaterial`)?.value || 'glass';
  const soundMaterial = material === 'metal' ? 'metal' : material === 'wood' ? 'wood' : 'plastic';
  try {
    previewAudioContext ||= new (window.AudioContext || window.webkitAudioContext)();
    if (previewAudioContext.state === 'suspended') await previewAudioContext.resume();
    const impacts = [
      { sample:3, delay:0, gain:.7, rate:1.08 },
      { sample:7, delay:.13, gain:1, rate:.94 },
      { sample:5, delay:.28, gain:.72, rate:1.03 },
      { sample:9, delay:.46, gain:.48, rate:.9 },
      { sample:2, delay:.68, gain:.3, rate:1.12 },
      { sample:6, delay:.92, gain:.18, rate:.98 }
    ];
    const buffers = await Promise.all(impacts.map(async impact => {
      const soundUrl = `/assets/dice-box-threejs/sounds/dicehit/dicehit_${soundMaterial}${impact.sample}.mp3`;
      let buffer = previewSoundBuffers.get(soundUrl);
      if (!buffer) {
        const response = await fetch(soundUrl);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        buffer = await previewAudioContext.decodeAudioData(await response.arrayBuffer());
        previewSoundBuffers.set(soundUrl, buffer);
      }
      return buffer;
    }));
    const startAt = previewAudioContext.currentTime;
    impacts.forEach((impact, index) => {
      const source = previewAudioContext.createBufferSource();
      const gain = previewAudioContext.createGain();
      source.buffer = buffers[index];
      source.playbackRate.value = impact.rate;
      gain.gain.value = volume * 14 * impact.gain;
      source.connect(gain).connect(previewAudioContext.destination);
      source.start(startAt + impact.delay);
    });
  } catch (error) { console.warn('Dice sound preview was blocked:', error); }
}

document.querySelectorAll('[data-dice-customizer]').forEach(menu => {
  const prefix = menu.dataset.diceCustomizer;
  for (const category of ['colorset','texture','material','surface']) {
    const select = document.getElementById(`${prefix}Dice${category[0].toUpperCase()}${category.slice(1)}`);
    if (!select) continue;
    select.replaceChildren(...customizationOptions[category].map(([value, label]) => new Option(label, value)));
    select.addEventListener('change', () => { updateCustomizerPreview(menu); schedulePreviewRoll(menu); });
  }
  document.getElementById(`${prefix}DiceColorset`).value = 'campaignGold';
  document.getElementById(`${prefix}DiceTexture`).value = 'none';
  document.getElementById(`${prefix}DiceMaterial`).value = 'glass';
  document.getElementById(`${prefix}DiceSurface`).value = 'green-felt';
  updateCustomizerPreview(menu);
  menu.querySelector('.dice-sound-preview-button')?.addEventListener('click', () => {
    playDiceSoundPreview(prefix);
    schedulePreviewRoll(menu);
  });
  menu.closest('details')?.addEventListener('toggle', event => {
    if (event.currentTarget.open) schedulePreviewRoll(menu);
  });
});

window.diceRoller3d = {
  getCustomization,
  getCustomizationDetails,
  getRandomCustomization,
  applyAppearance(prefix) {
    const selection = lastCompletedPayload?.appearanceSelection;
    const output = document.getElementById(`${prefix}DiceAppearanceResult`);
    if (!selection) {
      if (output) output.innerHTML = '<strong>Appearance</strong><br>No roll appearance is available to apply.';
      return;
    }
    for (const category of ['colorset','texture','material','surface']) {
      const select = document.getElementById(`${prefix}Dice${category[0].toUpperCase()}${category.slice(1)}`);
      if (select && [...select.options].some(option => option.value === selection[category])) select.value = selection[category];
    }
    const randomCheckbox = document.getElementById(`${prefix}RandomDiceColor`);
    if (randomCheckbox) randomCheckbox.checked = false;
    const menu = document.querySelector(`[data-dice-customizer="${prefix}"]`);
    if (menu) {
      updateCustomizerPreview(menu);
      schedulePreviewRoll(menu);
    }
    if (output) output.innerHTML = `<strong>Applied Appearance</strong><br>${safeMarkup(String(lastCompletedPayload.appearanceSummary || '').split('; ').join('<br>'))}`;
  },
  async replayAndShare(prefix) {
    const output = document.getElementById(`${prefix}DiceResult`);
    if (!lastCompletedPayload) {
      if (output) output.textContent = 'Roll the dice once before replaying a result.';
      return;
    }
    if (!sharedRollRef) {
      if (output) output.textContent = 'Shared rolls are unavailable right now.';
      return;
    }
    const replay = JSON.parse(JSON.stringify(lastCompletedPayload));
    replay.replayedFrom = replay.id;
    replay.id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    replay.createdAt = Date.now();
    replay.startAt = Date.now() + SHARED_START_DELAY;
    replay.sourcePrefix = prefix;
    if (output) output.textContent = 'Replaying shared roll…';
    try { await sharedRollRef.set(replay); }
    catch (error) { reportFailure(replay, error); }
  },
  async roll(request, share = false) {
    const payload = completeRequest(request);
    if (share && sharedRollRef) {
      payload.startAt = Date.now() + SHARED_START_DELAY;
      try { await sharedRollRef.set(payload); }
      catch (error) { reportFailure(payload, error); }
      return;
    }
    return runAnimation(payload, false);
  }
};
