(function (root) {
  const clone = value => JSON.parse(JSON.stringify(value));
  function clean(value) {
    return JSON.parse(JSON.stringify(value, (key, item) => key.startsWith('_board') || item === undefined ? undefined : item));
  }
  function mapData(value = {}) {
    const data = { ...value };
    ['tokenSize', 'generation', 'switchLock'].forEach(key => delete data[key]);
    return data;
  }
  function actionPatch(token, action, amount, condition, level) {
    if (action === 'removeCreature') return null;
    if (action === 'damage' || action === 'heal') {
      const hp = Number(token.hp) || 0, maxHp = Math.max(1, Number(token.maxHp) || hp || 1);
      const change = Math.max(0, Number(amount) || 0);
      const nextHp = action === 'heal' ? Math.min(maxHp, hp + change) : token.isplayer ? hp - change : Math.max(0, hp - change);
      return !token.isplayer && nextHp <= 0 ? null : { hp: nextHp };
    }
    const conditions = [...new Set((token.conditions || []).map(name => name.toLowerCase() === 'mark' ? "Hunter's Mark" : name))];
    if (action === 'apply' && condition && condition !== '-- None --' && !conditions.some(name => name.toLowerCase() === condition.toLowerCase())) conditions.push(condition);
    if (action === 'remove') return { conditions: conditions.filter(name => name.toLowerCase() !== condition.toLowerCase()) };
    if (action === 'exhaustion') {
      const next = Math.max(0, Math.min(6, Math.trunc(Number(level) || 0)));
      return { conditions: [...conditions.filter(name => !/^exhaustion(?:\s+\d+)?$/i.test(name)), ...(next ? [`Exhaustion ${next}`] : [])] };
    }
    return { conditions };
  }
  function tokenPatch(token, fields) {
    if (!token) return undefined;
    const patch = { ...fields };
    if (Object.hasOwn(patch, 'hp')) {
      patch.hp = Number(patch.hp) || 0;
      if (!token.isplayer && patch.hp <= 0) return null;
      if (patch.hp > (Number(token.maxHp) || 0)) patch.maxHp = patch.hp;
    }
    return patch;
  }

  function create({ db, firebase, intervalMs = 30000, onError = error => console.error('Board synchronization:', error), autoStart = true }) {
    const pointer = db.collection('shared').doc('map');
    const boards = db.collection('boardStates');
    const layers = ['tokens', 'drawings', 'fogOfWar', 'stickers'];
    const subscribers = Object.fromEntries(layers.map(layer => [layer, new Set()]));
    const caches = Object.fromEntries(layers.map(layer => [layer, new Map()]));
    const versions = Object.fromEntries(layers.map(layer => [layer, 0]));
    let generation = '', currentMap, mapVersion = 0, unlisten = [], stopPointer, timer, ready, refreshInProgress = null, disposed = false;
    const mapSubscribers = new Set();
    const stamp = () => firebase.firestore.FieldValue.serverTimestamp();
    const collection = (layer, id = generation) => boards.doc(id).collection(layer);
    function emit(layer, reset = false) {
      const values = [...caches[layer].values()].map(value => ({ ...clone(value), _boardGeneration: generation }));
      if (layer === 'tokens') values.sort((a, b) => String(a.id).localeCompare(String(b.id)));
      else values.sort((a, b) => (a._order || 0) - (b._order || 0) || a.id.localeCompare(b.id));
      subscribers[layer].forEach(callback => callback(values, { generation, reset }));
    }
    function activate(id) {
      if (!id || id === generation || disposed) return;
      unlisten.forEach(stop => stop()); unlisten = [];
      generation = id;
      layers.forEach(layer => {
        caches[layer].clear(); versions[layer]++;
        emit(layer, true);
        unlisten.push(collection(layer, id).onSnapshot(snapshot => {
          if (id !== generation || disposed) return;
          snapshot.docChanges().forEach(change => {
            if (change.type === 'removed') caches[layer].delete(change.doc.id);
            else caches[layer].set(change.doc.id, { ...change.doc.data(), id: change.doc.id });
          });
          versions[layer]++;
          emit(layer);
        }, onError));
      });
    }
    function receiveMap(data) {
      if (!data?.generation || disposed) return;
      currentMap = data; mapVersion++;
      activate(data.generation);
      mapSubscribers.forEach(callback => callback(clone(data)));
    }
    async function prepare(state) {
      const board = boards.doc();
      const writes = [];
      const records = {
        tokens: state.monsters?.monsters || [],
        drawings: state.drawings?.drawings || [],
        fogOfWar: state.fogOfWar?.drawings || [],
        stickers: state.stickers?.stickers || []
      };
      layers.forEach(layer => records[layer].forEach((record, index) => {
        const id = record.id || `${layer}-${index}`;
        writes.push([collection(layer, board.id).doc(id), { ...clean(record), id, ...(layer === 'tokens' ? {} : { _order: index }) }]);
      }));
      for (let offset = 0; offset < writes.length; offset += 400) {
        const batch = db.batch();
        writes.slice(offset, offset + 400).forEach(([ref, data]) => batch.set(ref, data));
        await batch.commit();
      }
      await board.set({ ready: true, createdAt: stamp() });
      return { generation: board.id, map: { filepath: 'data/maps/blank.jpg', mapScale: 1, ...mapData(state.map) } };
    }
    async function initialize() {
      let snapshot = await pointer.get({ source: 'server' });
      if (!snapshot.data()?.generation) {
        const legacy = await Promise.all(['monsters', 'drawings', 'fogOfWar', 'stickers'].map(key => db.collection('shared').doc(key).get({ source: 'server' })));
        const state = {
          map: snapshot.data() || {},
          monsters: legacy[0].data() || {},
          drawings: legacy[1].data() || {},
          fogOfWar: legacy[2].data() || {},
          stickers: legacy[3].data() || {}
        };
        const prepared = await prepare(state);
        await db.runTransaction(async transaction => {
          const current = await transaction.get(pointer);
          if (current.data()?.generation) return;
          transaction.set(pointer, { ...prepared.map, ...mapData(current.data()), generation: prepared.generation, switchLock: null });
        });
        snapshot = await pointer.get({ source: 'server' });
      }
      receiveMap(snapshot.data());
      stopPointer = pointer.onSnapshot(doc => receiveMap(doc.data()), onError);
      if (intervalMs > 0) timer = setInterval(() => { if (!root.document?.hidden) reconcile().catch(onError); }, intervalMs);
      return generation;
    }
    function start() {
      if (!ready) { ready = initialize(); ready.catch(error => { ready = null; onError(error); }); }
      return ready;
    }
    function recover() { reconcile().catch(onError); }
    function requireCurrent(data, expected, lock) {
      if (data?.generation !== expected) throw new Error('The map changed. Please repeat your action on the current map.');
      if (data.switchLock && data.switchLock.id !== lock && data.switchLock.expiresAt > Date.now()) throw new Error('The DM is switching maps. Please try again in a moment.');
    }
    async function mutate(layer, ids, transform, expected = generation) {
      await start();
      if (!expected) throw new Error('The board is still loading. Please try again.');
      const unique = [...new Set(ids)];
      // All actions in a selected group commit together; no full collection writes.
      for (let offset = 0; offset < unique.length; offset += 200) {
        const refs = unique.slice(offset, offset + 200).map(id => collection(layer, expected).doc(id));
        await db.runTransaction(async transaction => {
          requireCurrent((await transaction.get(pointer)).data(), expected);
          const snapshots = await Promise.all(refs.map(ref => transaction.get(ref)));
          snapshots.forEach((snapshot, index) => {
            const result = transform(snapshot.exists ? snapshot.data() : undefined, refs[index].id);
            if (result === undefined) return;
            if (result === null) { if (snapshot.exists) transaction.delete(refs[index]); }
            else if (snapshot.exists) transaction.update(refs[index], clean(result));
            else transaction.set(refs[index], clean(result));
          });
        });
      }
    }
    async function reconcile(options = {}) {
      const force = options === true || Boolean(options.force);
      await start();
      if (refreshInProgress) {
        await refreshInProgress;
        if (!force) return;
      }
      refreshInProgress = (async () => {
        const beforeMap = mapVersion;
        const latest = await pointer.get({ source: 'server' });
        if (beforeMap === mapVersion) receiveMap(latest.data());
        const id = generation;
        const before = { ...versions };
        const snapshots = await Promise.all(layers.map(layer => collection(layer, id).get({ source: 'server' })));
        if (id !== generation || disposed) return;
        layers.forEach((layer, index) => {
          // A newer live event always wins over a periodic request already in flight.
          if (before[layer] !== versions[layer] || snapshots[index].metadata?.hasPendingWrites) return;
          caches[layer].clear();
          snapshots[index].forEach(doc => caches[layer].set(doc.id, { ...doc.data(), id: doc.id }));
          versions[layer]++;
          emit(layer);
        });
      })().finally(() => { refreshInProgress = null; });
      return refreshInProgress;
    }
    async function exportState(expected = generation) {
      await start();
      const map = await pointer.get({ source: 'server' });
      if (map.data()?.generation !== expected) throw new Error('The active map changed while saving.');
      const snapshots = await Promise.all(layers.map(layer => collection(layer, expected).get({ source: 'server' })));
      const records = snapshots.map((snapshot, index) => {
        const items = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
        return index ? items.sort((a, b) => (a._order || 0) - (b._order || 0) || a.id.localeCompare(b.id)) : items;
      });
      return {
        map: mapData(map.data()),
        monsters: { monsters: records[0] },
        drawings: { drawings: records[1] },
        fogOfWar: { drawings: records[2] },
        stickers: { stickers: records[3] }
      };
    }
    async function lock() {
      await start();
      const expected = generation, id = boards.doc().id;
      await db.runTransaction(async transaction => {
        const current = (await transaction.get(pointer)).data();
        requireCurrent(current, expected);
        transaction.update(pointer, { switchLock: { id, expiresAt: Date.now() + 120000 } });
      });
      return { generation: expected, id };
    }
    async function unlock(lease) {
      await db.runTransaction(async transaction => {
        const data = (await transaction.get(pointer)).data();
        if (data?.generation === lease.generation && data.switchLock?.id === lease.id) transaction.update(pointer, { switchLock: null });
      });
    }
    async function publish(prepared, lease, extraWrites = () => {}) {
      await db.runTransaction(async transaction => {
        const data = (await transaction.get(pointer)).data();
        requireCurrent(data, lease.generation, lease.id);
        if (data.switchLock?.id !== lease.id || data.switchLock.expiresAt <= Date.now()) throw new Error('The map switch expired. Please try again.');
        transaction.set(pointer, { ...prepared.map, generation: prepared.generation, switchLock: null, updatedAt: stamp() });
        extraWrites(transaction);
      });
    }
    const api = {
      start, get ready() { return start(); }, get generation() { return generation; }, prepare, lock, unlock, publish, exportState, reconcile,
      subscribeMap(callback) {
        mapSubscribers.add(callback);
        if (currentMap) callback(clone(currentMap));
        return () => mapSubscribers.delete(callback);
      },
      subscribe(layer, callback) {
        subscribers[layer].add(callback);
        if (generation) emit(layer);
        return () => subscribers[layer].delete(callback);
      },
      patch(id, fields, expected = generation) { return mutate('tokens', [id], token => tokenPatch(token, fields), expected); },
      patchMany(changes, expected = generation) { return mutate('tokens', [...changes.keys()], (token, id) => tokenPatch(token, changes.get(id)), expected); },
      add(tokens, expected = generation) {
        const byId = new Map(tokens.map(token => [token.id, token]));
        return mutate('tokens', [...byId.keys()], (token, id) => token ? undefined : byId.get(id), expected);
      },
      remove(ids, expected = generation) { return mutate('tokens', ids, () => null, expected); },
      action(ids, action, amount = 0, condition = '', level = 0, expected = generation) {
        return mutate('tokens', ids, token => token ? actionPatch(token, action, amount, condition, level) : undefined, expected);
      },
      addDrawing(layer, drawing, expected = generation) { return mutate(layer, [drawing.id], existing => existing ? undefined : { ...drawing, _order: Date.now() }, expected); },
      patchDrawings(layer, changes, expected = generation) { return mutate(layer, [...changes.keys()], (drawing, id) => drawing ? changes.get(id) : undefined, expected); },
      removeDrawings(layer, ids, expected = generation) { return mutate(layer, ids, () => null, expected); },
      addSticker(sticker, expected = generation) { return mutate('stickers', [sticker.id], existing => existing ? undefined : { ...sticker, _order: Date.now() }, expected); },
      patchStickers(changes, expected = generation) { return mutate('stickers', [...changes.keys()], (sticker, id) => sticker ? changes.get(id) : undefined, expected); },
      removeStickers(ids, expected = generation) { return mutate('stickers', ids, () => null, expected); },
      async patchMap(fields, expected = generation) {
        await start();
        return db.runTransaction(async transaction => {
          requireCurrent((await transaction.get(pointer)).data(), expected);
          transaction.update(pointer, mapData(fields));
        });
      },
      dispose() {
        disposed = true; clearInterval(timer); stopPointer?.(); unlisten.forEach(stop => stop());
        root.removeEventListener?.('online', recover); root.removeEventListener?.('focus', recover);
      }
    };
    root.addEventListener?.('online', recover);
    root.addEventListener?.('focus', recover);
    if (autoStart) start();
    return api;
  }
  const api = { create, actionPatch, mapData };
  if (typeof module !== 'undefined') module.exports = api;
  else root.SharedBoardSync = api;
})(typeof window === 'undefined' ? globalThis : window);
