const copy = value => value === undefined ? undefined : JSON.parse(JSON.stringify(value));
function createFirestore(seed = {}) {
    const documents = new Map(Object.entries(copy(seed))), versions = new Map(), listeners = new Set(), writes = [], batches = [];
    const delayedReads = new Map();
    let nextId = 0, failPath = '', offline = false, dropped = false;
    const metadata = { fromCache: false, hasPendingWrites: false };
    const snapshot = path => {
        const data = copy(documents.get(path));
        return { id: path.split('/').at(-1), exists: data !== undefined, data: () => copy(data), metadata };
    };
    const inCollection = (path, collection) => path.startsWith(collection + '/') && path.split('/').length === collection.split('/').length + 1;
    function querySnapshot(path, old = new Map()) {
        const docs = [...documents.keys()].filter(key => inCollection(key, path)).sort().map(snapshot);
        const changes = docs.filter(doc => JSON.stringify(old.get(doc.id)) !== JSON.stringify(doc.data())).map(doc => ({ type: old.has(doc.id) ? 'modified' : 'added', doc }));
        old.forEach((data, id) => { if (!documents.has(`${path}/${id}`)) changes.push({ type: 'removed', doc: { id, data: () => data } }); });
        return { docs, forEach: callback => docs.forEach(callback), docChanges: () => changes, metadata };
    }
    function notify(changed) {
        if (dropped) return;
        listeners.forEach(listener => {
            if (listener.collection && changed.some(path => inCollection(path, listener.path))) {
                const snap = querySnapshot(listener.path, listener.old);
                listener.old = new Map(snap.docs.map(doc => [doc.id, doc.data()]));
                listener.callback(snap);
            } else if (!listener.collection && changed.includes(listener.path)) listener.callback(snapshot(listener.path));
        });
    }
    function apply(operations) {
        if (offline || (failPath && operations.some(operation => operation.path === failPath))) throw new Error('Simulated write failure');
        if (operations.length > 500) throw new Error('Firestore batch limit exceeded');
        for (const operation of operations) {
            if (operation.kind === 'update' && !documents.has(operation.path)) throw new Error('Document does not exist');
        }
        operations.forEach(operation => {
            writes.push(copy(operation));
            if (operation.kind === 'delete') documents.delete(operation.path);
            else {
                const data = operation.merge || operation.kind === 'update' ? copy(documents.get(operation.path) || {}) : {};
                Object.entries(operation.data).forEach(([key, value]) => {
                    const keys = operation.kind === 'update' ? key.split('.') : [key];
                    let target = data;
                    keys.slice(0, -1).forEach(part => { target[part] ||= {}; target = target[part]; });
                    if (value?.__deleteField) delete target[keys.at(-1)];
                    else target[keys.at(-1)] = copy(value);
                });
                documents.set(operation.path, data);
            }
            versions.set(operation.path, (versions.get(operation.path) || 0) + 1);
        });
        if (operations.length) batches.push(copy(operations));
        notify(operations.map(operation => operation.path));
    }
    function writer(operations) {
        return {
            set: (ref, data, options) => operations.push({ kind: 'set', path: ref.path, data: copy(data), merge: options?.merge }),
            update: (ref, data) => operations.push({ kind: 'update', path: ref.path, data: copy(data) }),
            delete: ref => operations.push({ kind: 'delete', path: ref.path })
        };
    }
    function ref(path, isCollection = false) {
        return {
            path, id: path.split('/').at(-1),
            collection: name => ref(`${path}/${name}`, true),
            doc(id) {
                if (!id) { do { id = `id-${++nextId}`; } while (documents.has(`${path}/${id}`)); }
                return ref(`${path}/${id}`);
            },
            async get() {
                if (offline) throw new Error('Offline');
                const result = isCollection ? querySnapshot(path) : snapshot(path);
                const delayed = delayedReads.get(path);
                if (delayed) { delayedReads.delete(path); delayed.started(); await delayed.wait; }
                return result;
            },
            async set(data, options) { apply([{ kind: 'set', path, data, merge: options?.merge }]); },
            onSnapshot(callback) {
                const listener = { path, callback, collection: isCollection, old: new Map() }; listeners.add(listener);
                const snap = isCollection ? querySnapshot(path) : snapshot(path);
                if (isCollection) listener.old = new Map(snap.docs.map(doc => [doc.id, doc.data()]));
                callback(snap);
                return () => listeners.delete(listener);
            }
        };
    }
    const db = {
        collection: name => ref(name, true),
        batch() { const operations = []; return { ...writer(operations), commit: async () => apply(operations) }; },
        async runTransaction(callback) {
            for (let attempt = 0; attempt < 30; attempt++) {
                const readVersions = new Map(), operations = [];
                const result = await callback({
                    ...writer(operations),
                    async get(target) {
                        if (operations.length) throw new Error('Transaction reads must precede writes');
                        if (offline) throw new Error('Offline');
                        readVersions.set(target.path, versions.get(target.path) || 0);
                        return snapshot(target.path);
                    }
                });
                if ([...readVersions].some(([path, version]) => version !== (versions.get(path) || 0))) continue;
                apply(operations); return result;
            }
            throw new Error('Too much contention');
        }
    };
    return { db, documents, writes, batches,
        delayNextRead(path) {
            let release, started;
            const wait = new Promise(resolve => { release = resolve; });
            const ready = new Promise(resolve => { started = resolve; });
            delayedReads.set(path, { wait, started });
            return { ready, release };
        },
        fail: path => { failPath = path; }, offline: value => { offline = value; }, dropEvents: value => { dropped = value; },
        firebase: { firestore: { FieldValue: { serverTimestamp: () => 123, delete: () => ({ __deleteField: true }) } } } };
}
module.exports = { createFirestore };
