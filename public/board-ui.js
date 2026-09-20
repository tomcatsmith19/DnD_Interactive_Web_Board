// Shared DM/player adapters. Every write has an explicit target and field set.
let boardPageRole = '';
let displayedBoardGeneration = '';
const TOKEN_DRAG_SYNC_INTERVAL_MS = 50;
const TOKEN_DRAG_STALE_MS = 5000;
const localTokenDragSessions = new Map();
let tokenDistanceExpiryTimer = null;
function installBoardInteractionGuards() {
    const surface = document.getElementById('mapTransformLayer');
    if (!surface || surface.dataset.nativeInteractionGuard === 'true') return;
    surface.dataset.nativeInteractionGuard = 'true';
    surface.style.userSelect = 'none';
    surface.style.webkitUserSelect = 'none';
    if (typeof mapImage !== 'undefined' && mapImage) mapImage.draggable = false;
    surface.addEventListener('dragstart', event => event.preventDefault());
    surface.addEventListener('selectstart', event => {
        if (event.target.closest?.('input, textarea, select, [contenteditable="true"]')) return;
        event.preventDefault();
    });
    surface.addEventListener('pointerdown', event => {
        if (!event.target.closest?.('.monster-token')) return;
        globalThis.getSelection?.()?.removeAllRanges?.();
    }, true);
}
async function discardLocalBoardChanges() {
    const sessions = new Set(localTokenDragSessions.values());
    sessions.forEach(session => {
        if (session.timer) clearTimeout(session.timer);
        session.timer = null;
        session.pending = null;
        session.ids.forEach(id => {
            const element = document.getElementById(`token-${id}`);
            if (element) element.dataset.dragging = 'false';
        });
    });
    await Promise.all([...sessions].map(session => session.inFlightPromise).filter(Boolean));
    localTokenDragSessions.clear();
    clearTimeout(tokenDistanceExpiryTimer);
    tokenDistanceExpiryTimer = null;
    renderTokenDistances();
}
function reportBoardSyncError(error) {
    console.error('Board sync failed:', error);
    let status = document.getElementById('boardSyncStatus');
    if (!status) {
        status = document.createElement('div'); status.id = 'boardSyncStatus'; status.role = 'status';
        status.style.cssText = 'position:fixed;bottom:12px;left:50%;transform:translateX(-50%);z-index:7000;max-width:80vw;padding:10px 16px;background:#651f1f;color:white;border-radius:6px;';
        document.body.appendChild(status);
    }
    status.textContent = `Could not sync. ${error.message || 'Check your connection and try again.'}`;
    status.hidden = false;
}
async function runBoardWrite(operation) {
    try {
        await operation;
        const status = document.getElementById('boardSyncStatus'); if (status) status.hidden = true;
        return true;
    } catch (error) {
        reportBoardSyncError(error);
        boardSync.reconcile().catch(() => {});
        return false;
    }
}
function syncMonsterFieldsToFirebase(id, fields, expected) {
    const token = monsters.find(item => item.id === id);
    return runBoardWrite(boardSync.patch(id, fields, expected ?? token?._boardGeneration ?? boardSync.generation));
}
function syncMonsterPositionsToFirebase(ids) {
    const targets = monsters.filter(token => ids.includes(token.id));
    const changes = new Map(targets.map(token => [token.id, { xRatio: token.xRatio, yRatio: token.yRatio }]));
    return runBoardWrite(boardSync.patchMany(changes, targets[0]?._boardGeneration || boardSync.generation));
}

function dragPatch(session, active) {
    const changes = new Map();
    const dragUpdatedAt = Date.now();
    session.ids.forEach(id => {
        const token = monsters.find(item => item.id === id);
        const origin = session.origins.get(id);
        if (!token || !origin) return;
        token.dragActive = active;
        token.dragStartXRatio = origin.xRatio;
        token.dragStartYRatio = origin.yRatio;
        token.dragPixelsPerFiveFeet = session.mediumDiameter;
        token.dragUpdatedAt = dragUpdatedAt;
        token.dragGroupId = session.groupId;
        token.dragGroupSize = session.ids.length;
        token.dragGroupStartXRatio = session.startCentroid?.x;
        token.dragGroupStartYRatio = session.startCentroid?.y;
        const fields = {
            xRatio: token.xRatio,
            yRatio: token.yRatio,
            dragActive: active,
            dragStartXRatio: origin.xRatio,
            dragStartYRatio: origin.yRatio,
            dragPixelsPerFiveFeet: session.mediumDiameter,
            dragUpdatedAt,
            dragGroupId: session.groupId || null
        };
        if (session.groupId) Object.assign(fields, {
            dragGroupSize: session.ids.length,
            dragGroupStartXRatio: session.startCentroid.x,
            dragGroupStartYRatio: session.startCentroid.y
        });
        changes.set(id, fields);
    });
    return changes;
}

function scheduleTokenDragFlush(session, immediate = false) {
    if (session.inFlight || session.timer || !session.pending) return;
    const elapsed = Date.now() - session.lastSentAt;
    const delay = immediate ? 0 : Math.max(0, TOKEN_DRAG_SYNC_INTERVAL_MS - elapsed);
    session.timer = setTimeout(async () => {
        session.timer = null;
        if (session.inFlight || !session.pending) return;
        const queued = session.pending;
        session.pending = null;
        session.inFlight = true;
        session.lastSentAt = Date.now();
        const write = runBoardWrite(boardSync.patchMany(queued.changes, session.generation));
        session.inFlightPromise = write;
        const succeeded = await write;
        if (session.inFlightPromise === write) session.inFlightPromise = null;
        session.inFlight = false;
        if (!succeeded && queued.final && queued.attempt < 2) {
            session.pending = { ...queued, attempt: queued.attempt + 1 };
            session.timer = setTimeout(() => {
                session.timer = null;
                scheduleTokenDragFlush(session, true);
            }, 250 * (queued.attempt + 1));
            return;
        }
        if (queued.final && !session.pending) session.ids.forEach(id => localTokenDragSessions.delete(id));
        if (session.pending) scheduleTokenDragFlush(session, session.pending.final);
    }, delay);
}

function queueTokenDragPatch(session, active, final = false) {
    if (!session || session.generation !== boardSync.generation) return;
    session.pending = { changes: dragPatch(session, active), final, attempt: 0 };
    renderTokenDistances();
    scheduleTokenDragFlush(session, final || !session.lastSentAt);
}

function beginMonsterDrag(ids) {
    const targets = monsters.filter(token => ids.includes(token.id));
    const origins = new Map(targets.map(token => [token.id, { xRatio: token.xRatio, yRatio: token.yRatio }]));
    const startCentroid = targets.length ? {
        x: targets.reduce((sum, token) => sum + Number(token.xRatio), 0) / targets.length,
        y: targets.reduce((sum, token) => sum + Number(token.yRatio), 0) / targets.length
    } : null;
    const session = {
        ids: targets.map(token => token.id),
        generation: boardSync.generation,
        origins,
        groupId: targets.length > 1 ? `token-group-${Date.now()}-${Math.random().toString(36).slice(2, 9)}` : null,
        startCentroid,
        mediumDiameter: Math.max(1, Number(currentTokenSize) || 1),
        pending: null, timer: null, inFlight: false, lastSentAt: 0
    };
    session.ids.forEach(id => localTokenDragSessions.set(id, session));
    queueTokenDragPatch(session, true);
    return session;
}

function updateMonsterDrag(session) { queueTokenDragPatch(session, true); }
function endMonsterDrag(session) { if (session) queueTokenDragPatch(session, false, true); }

function tokenDragDistanceFeet(token, width, height) {
    const dx = (Number(token.xRatio) - Number(token.dragStartXRatio)) * width;
    const dy = (Number(token.yRatio) - Number(token.dragStartYRatio)) * height;
    return Math.round(Math.hypot(dx, dy) / Math.max(1, Number(token.dragPixelsPerFiveFeet) || 1) * 5);
}

function tokenMovementIndicators(tokens, width, height, now = Date.now()) {
    const visible = tokens.filter(token => token.dragActive
        && Number.isFinite(Number(token.dragStartXRatio))
        && Number.isFinite(Number(token.dragStartYRatio))
        && now - Number(token.dragUpdatedAt || 0) < TOKEN_DRAG_STALE_MS);
    const indicators = [], groups = new Map();
    visible.forEach(token => {
        if (token.dragGroupId && Number(token.dragGroupSize) > 1) {
            if (!groups.has(token.dragGroupId)) groups.set(token.dragGroupId, []);
            groups.get(token.dragGroupId).push(token);
            return;
        }
        indicators.push({
            startX: Number(token.dragStartXRatio) * width,
            startY: Number(token.dragStartYRatio) * height,
            endX: Number(token.xRatio) * width,
            endY: Number(token.yRatio) * height,
            pixelsPerFiveFeet: Math.max(1, Number(token.dragPixelsPerFiveFeet) || 1)
        });
    });
    groups.forEach(group => {
        const first = group[0];
        indicators.push({
            groupId: first.dragGroupId,
            startX: Number(first.dragGroupStartXRatio) * width,
            startY: Number(first.dragGroupStartYRatio) * height,
            endX: group.reduce((sum, token) => sum + Number(token.xRatio) * width, 0) / group.length,
            endY: group.reduce((sum, token) => sum + Number(token.yRatio) * height, 0) / group.length,
            pixelsPerFiveFeet: Math.max(1, Number(first.dragPixelsPerFiveFeet) || 1)
        });
    });
    return indicators;
}

function renderTokenDistances() {
    const layer = document.getElementById('tokenDistanceLayer');
    if (!layer || !mapImage?.clientWidth || !mapImage?.clientHeight) return;
    const width = mapImage.clientWidth, height = mapImage.clientHeight;
    const tokens = boardPageRole === 'player' ? monsters.filter(token => token.hiddenFromPlayers !== true) : monsters;
    const indicators = tokenMovementIndicators(tokens, width, height);
    layer.setAttribute('viewBox', `0 0 ${width} ${height}`);
    layer.replaceChildren();
    indicators.forEach(indicator => {
        const { startX, startY, endX, endY } = indicator;
        const feet = Math.round(Math.hypot(endX - startX, endY - startY) / indicator.pixelsPerFiveFeet * 5);
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', startX); line.setAttribute('y1', startY); line.setAttribute('x2', endX); line.setAttribute('y2', endY);
        line.setAttribute('class', 'token-distance-line');
        const start = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        start.setAttribute('cx', startX); start.setAttribute('cy', startY); start.setAttribute('r', 4); start.setAttribute('class', 'token-distance-start');
        const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        label.setAttribute('x', (startX + endX) / 2); label.setAttribute('y', (startY + endY) / 2 - 9);
        label.setAttribute('class', 'token-distance-label'); label.textContent = `${feet} ft`;
        layer.append(line, start, label);
    });
    clearTimeout(tokenDistanceExpiryTimer);
    if (indicators.length) tokenDistanceExpiryTimer = setTimeout(renderTokenDistances, TOKEN_DRAG_STALE_MS + 50);
}
function removeMonstersFromFirebase(ids) { return runBoardWrite(boardSync.remove(ids)); }
function addMonstersToFirebase(tokens) { return runBoardWrite(boardSync.add(tokens, tokens[0]?._boardGeneration || boardSync.generation)); }
function forceReloadMonsters() { return runBoardWrite(boardSync.reconcile()); }
function applyMapTokenAction(action, condition = '', level = 0) {
    const targets = monsters.filter(token => selectedMapTokenIds.has(token.id));
    if (!targets.length) return Promise.resolve(false);
    const amount = Math.max(0, Math.trunc(Number(document.getElementById('mapActionAmount').value) || 0));
    const defeatedByPlayer = boardPageRole === 'player' && action === 'damage'
        ? targets.filter(token => !token.isplayer && Number(token.hp) > 0 && amount >= Number(token.hp)).map(token => ({ ...token }))
        : [];
    return runBoardWrite(boardSync.action(targets.map(token => token.id), action, amount, condition, level, targets[0]._boardGeneration)).then(async succeeded => {
        if (succeeded && defeatedByPlayer.length && typeof broadcastDefeatedCreatures === 'function') {
            try { await broadcastDefeatedCreatures(defeatedByPlayer); }
            catch (error) { reportBoardSyncError(error); }
        }
        return succeeded;
    });
}
function refreshBoardTrackers(force = false) {
    const editing = !force && document.activeElement?.closest('#monsterTableBody, #partyTableBody');
    if (boardPageRole === 'dm') {
        if (!editing) updateMonsterTable();
    } else {
        updatePlayerTokenInitiativeLabels();
        if (!editing) renderPartyTracker();
        const player = monsters.find(token => token.id === currentPlayerId);
        if (player && (force || !document.activeElement?.closest('#currentHP, #initiativeInput'))) showCurrentPlayerStats(player);
    }
    refreshMapTokenSelection();
}
function updateTokenPlayerVisibility(token, element = document.getElementById(`token-${token.id}`)) {
    if (!element) return;
    const hidden = boardPageRole === 'player' && token.hiddenFromPlayers === true;
    element.style.display = hidden ? 'none' : 'flex';
    element.classList.toggle('is-hidden-from-players', boardPageRole === 'dm' && token.hiddenFromPlayers === true);
    element.setAttribute?.('aria-hidden', String(hidden));
    if (hidden) selectedMapTokenIds.delete(token.id);
}
function initializeBoardUI(role) {
    boardPageRole = role;
    installBoardInteractionGuards();
    boardSync.subscribe('tokens', (incoming, { generation, reset }) => {
        const switched = displayedBoardGeneration !== generation;
        displayedBoardGeneration = generation;
        if (switched) {
            localTokenDragSessions.forEach(session => { clearTimeout(session.timer); session.pending = null; });
            localTokenDragSessions.clear();
            selectedMapTokenIds.clear();
            document.getElementById('groupMoveHandle')?.remove();
            if (role === 'dm') { suppressLootTrackingUntil = Date.now() + 3000; pendingMonsterAdditions.clear(); }
        }
        const ids = new Set(incoming.map(token => token.id));
        for (let index = monsters.length - 1; index >= 0; index--) {
            const token = monsters[index];
            if (switched || !ids.has(token.id)) {
                if (!switched && !reset && role === 'dm') recordCreatureForLoot(token, { skipAutoDrop:true });
                document.getElementById(`token-${token.id}`)?.remove();
                selectedMapTokenIds.delete(token.id);
                monsters.splice(index, 1);
            }
        }
        incoming.forEach(data => {
            const normalized = normalizeMonsterState(data);
            if (normalized.hp <= 0 && !normalized.isplayer) return;
            let token = monsters.find(item => item.id === data.id);
            const element = document.getElementById(`token-${data.id}`);
            const previousHp = token?.hp;
            if (token) {
                const position = element?.dataset.dragging === 'true' || localTokenDragSessions.has(token.id) ? {
                    xRatio: token.xRatio, yRatio: token.yRatio, dragActive: token.dragActive,
                    dragStartXRatio: token.dragStartXRatio, dragStartYRatio: token.dragStartYRatio,
                    dragPixelsPerFiveFeet: token.dragPixelsPerFiveFeet, dragUpdatedAt: token.dragUpdatedAt,
                    dragGroupId: token.dragGroupId, dragGroupSize: token.dragGroupSize,
                    dragGroupStartXRatio: token.dragGroupStartXRatio, dragGroupStartYRatio: token.dragGroupStartYRatio
                } : {};
                Object.keys(token).forEach(key => { if (!(key in normalized)) delete token[key]; });
                Object.assign(token, normalized, position);
            } else { token = normalized; monsters.push(token); }
            if (!element) addMonsterToken(token);
            else {
                positionTokenElement(token, element);
                updateTokenHealthBar(token); updateTokenDefeatedState(token);
                TokenActions.renderTokenConditions(token, element, currentTokenSize);
            }
            updateTokenPlayerVisibility(token);
            if (!switched && typeof previousHp === 'number' && previousHp !== token.hp) {
                flashToken(token.id, token.hp > previousHp ? 'heal' : 'damage');
                if (previousHp > 0 && token.hp <= 0) showTokenDeathEffect(token.id, false);
            }
        });
        renderTokenDistances();
        scheduleMapLayoutRefresh();
        refreshBoardTrackers(switched || reset);
    });
    document.addEventListener('focusout', event => {
        if (event.target.closest('#monsterTableBody, #partyTableBody, #currentHP, #initiativeInput')) setTimeout(refreshBoardTrackers, 0);
    });
}
