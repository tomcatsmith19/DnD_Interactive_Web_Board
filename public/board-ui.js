// Shared DM/player adapters. Every write has an explicit target and field set.
let boardPageRole = '';
let displayedBoardGeneration = '';
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
function removeMonstersFromFirebase(ids) { return runBoardWrite(boardSync.remove(ids)); }
function addMonstersToFirebase(tokens) { return runBoardWrite(boardSync.add(tokens, tokens[0]?._boardGeneration || boardSync.generation)); }
function forceReloadMonsters() { return runBoardWrite(boardSync.reconcile()); }
function applyMapTokenAction(action, condition = '', level = 0) {
    const targets = monsters.filter(token => selectedMapTokenIds.has(token.id));
    if (!targets.length) return Promise.resolve(false);
    const amount = Math.max(0, Math.trunc(Number(document.getElementById('mapActionAmount').value) || 0));
    return runBoardWrite(boardSync.action(targets.map(token => token.id), action, amount, condition, level, targets[0]._boardGeneration));
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
function initializeBoardUI(role) {
    boardPageRole = role;
    boardSync.subscribe('tokens', (incoming, { generation, reset }) => {
        const switched = displayedBoardGeneration !== generation;
        displayedBoardGeneration = generation;
        if (switched) {
            selectedMapTokenIds.clear();
            document.getElementById('groupMoveHandle')?.remove();
            if (role === 'dm') { suppressLootTrackingUntil = Date.now() + 3000; pendingMonsterAdditions.clear(); }
        }
        const ids = new Set(incoming.map(token => token.id));
        for (let index = monsters.length - 1; index >= 0; index--) {
            const token = monsters[index];
            if (switched || !ids.has(token.id)) {
                if (!switched && !reset && role === 'dm' && Date.now() >= suppressLootTrackingUntil) recordCreatureForLoot(token);
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
                const position = element?.dataset.dragging === 'true' ? { xRatio: token.xRatio, yRatio: token.yRatio } : {};
                Object.keys(token).forEach(key => { if (!(key in normalized)) delete token[key]; });
                Object.assign(token, normalized, position);
            } else { token = normalized; monsters.push(token); }
            if (!element) addMonsterToken(token);
            else {
                positionTokenElement(token, element);
                updateTokenHealthBar(token); updateTokenDefeatedState(token);
                TokenActions.renderTokenConditions(token, element, currentTokenSize);
            }
            if (!switched && typeof previousHp === 'number' && previousHp !== token.hp) {
                flashToken(token.id, token.hp > previousHp ? 'heal' : 'damage');
                if (previousHp > 0 && token.hp <= 0) showTokenDeathEffect(token.id, false);
            }
        });
        scheduleMapLayoutRefresh();
        refreshBoardTrackers(switched || reset);
    });
    document.addEventListener('focusout', event => {
        if (event.target.closest('#monsterTableBody, #partyTableBody, #currentHP, #initiativeInput')) setTimeout(refreshBoardTrackers, 0);
    });
}
