# Board synchronization

`public/board-sync.js` is the shared Firestore adapter used by the DM and player pages. Firebase holds the authoritative live board. The pages keep local copies for rendering and drag previews.

## Live data

```text
shared/map                             active generation, map image, map scale, switch lock
boardStates/{generation}               staged board metadata
boardStates/{generation}/tokens/{id}    one creature, including party/initiative fields
boardStates/{generation}/drawings/{id}  one drawing
boardStates/{generation}/fogOfWar/{id}  one fog stroke or shape
```

A completed drag updates only that token's `xRatio` and `yRatio`. Tracker edits update the field that was edited. Damage, healing, and condition actions calculate their changes in a transaction against the latest server token, allowing concurrent actions to compose. Transactions read the active map pointer and affected token documents; they never upload the client's entire token array. Additions create individual documents and removals delete individual documents. Drawing and fog operations follow the same model.

Edits to different tokens or different fields preserve one another. If two people explicitly assign different values to the same field, the last committed assignment wins. Relative actions such as damage use the current server value on each transaction retry. A stale edit cannot recreate a deleted token. Selected groups commit together up to 200 entities; larger groups are processed in chunks.

Firestore collection listeners apply document changes as they arrive. The UI retains existing token elements and pauses tracker rebuilding while an input is being edited. Tracker edits commit on change, rather than on each keystroke. Local token size and the browser's pan/zoom remain local.

## Reconciliation and failures

Every 30 seconds while the page is visible, and when it regains focus or reconnects, the adapter reads the full active map, tokens, drawings, and fog from the server. It never uploads local state during this refresh. Live events received while a refresh is in flight take precedence over that older read. Reconciliation also updates the map image and scale.

Transactions require a connection. A failed action displays a sync error and triggers a server refresh; the user can retry the action after reconnecting. Failed actions are not silently queued for replay on a different map. Initialization can retry when connectivity returns.

## Campaign map switches

Campaign saves remain complete snapshots at `campaigns/{campaignId}/maps/{mapId}/state/{component}`. Loading a map stages its snapshot in a new board generation. A short transaction then locks outgoing edits while the DM reads the outgoing board from Firebase and saves it. The new active generation and campaign selection are published together in a transaction.

Actions carry the generation on which they began. A delayed drag, queued placement, or tracker edit from the previous map is rejected. The switch lock is released on failure and expires after two minutes if the switching browser disconnects. An expired lock cannot publish a stale snapshot.

## Existing boards and rollout

On first load, if `shared/map` has no generation, the adapter copies the legacy shared token, drawing, and fog arrays into individual documents, then selects the completed generation transactionally. Concurrent initial loads select one completed board. Old shared documents remain as backups and are no longer used for live edits. Existing campaign saves load without a manual conversion. Token size is excluded from the shared map and campaign snapshots.

Refresh every open DM and player page together when adopting this version. Older pages still use the legacy arrays and cannot participate in the new live board. Existing authenticated Firestore rules cover the new paths; no new index is needed.

Old and unsuccessfully staged board generations are retained for recovery. Firestore does not automatically remove their subcollections; any future cleanup must preserve the active generation. Per-entity listeners reduce unrelated data transfer, but full reconciliation reads each entity document on each visible client, so document-read counts depend on board size and the refresh interval.

## Verification

Run `node --test tests/*.test.js` from the repository root. The sync tests use an in-memory Firestore double with optimistic transaction retries, dropped events, delayed reads, and write failures. They cover concurrent moves/actions, deleted tokens, drawing/fog updates, migration, map switching, refresh races, offline recovery, and preservation of active UI interactions. Campaign integration tests execute the DM page's real loot-state declarations so missing initialization cannot be hidden by a mock.

For a manual session check, open one DM page and two player pages. Move different tokens while editing initiative and party fields, apply damage from both players, and switch maps during a drag. After briefly disconnecting one page, reconnect it and verify that it converges to the server state.
