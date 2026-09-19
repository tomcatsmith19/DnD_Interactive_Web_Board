(function (root) {
  const DEFAULT_ROOT = "sticker-library/v1";
  const FAVORITES_PATH = "__sticker_favorites__";
  const FAVORITES_STORAGE_KEY = "dndStickerFavoritesV1";
  const MEDIA_PATTERN = /\.(?:webp|png|jpe?g|gif|webm)$/i;
  const VIDEO_PATTERN = /\.webm$/i;

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function roundRatio(value) {
    return Number(clamp(Number(value) || 0, 0, 1).toFixed(5));
  }

  function cleanLabel(value) {
    return String(value || "")
      .replace(/\.[^.]+$/, "")
      .replace(/^!+/, "")
      .replace(/[\\/_-]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function normalizeSearch(value) {
    return cleanLabel(value)
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
  }

  function subsequenceScore(needle, haystack) {
    let position = -1;
    let score = 0;
    let streak = 0;
    for (const character of needle) {
      const next = haystack.indexOf(character, position + 1);
      if (next < 0) return -Infinity;
      const gap = next - position - 1;
      streak = gap === 0 ? streak + 1 : 0;
      score += 18 + streak * 5 - gap * 1.5;
      if (next === 0 || /\s/.test(haystack[next - 1])) score += 12;
      position = next;
    }
    return score - (haystack.length - needle.length) * 0.12;
  }

  function fuzzyScore(query, candidate) {
    const needle = normalizeSearch(query);
    const haystack = normalizeSearch(candidate);
    if (!needle) return 0;
    const exact = haystack.indexOf(needle);
    if (exact >= 0) return 3000 - exact * 8 - (haystack.length - needle.length) * 0.2;
    const tokens = needle.split(" ").filter(Boolean);
    const words = haystack.split(" ").filter(Boolean);
    let score = 0;
    for (const token of tokens) {
      let tokenScore = -Infinity;
      for (const word of words) {
        const containedAt = word.indexOf(token);
        tokenScore = Math.max(tokenScore, containedAt >= 0
          ? 700 - containedAt * 5 - (word.length - token.length)
          : subsequenceScore(token, word));
      }
      if (!Number.isFinite(tokenScore)) return -Infinity;
      score += tokenScore;
    }
    return score;
  }

  function gridUnits(fileName) {
    const match = String(fileName || "").replace(/\.[^.]+$/, "").match(/(?:^|_)(\d+(?:\.\d+)?)x(\d+(?:\.\d+)?)$/i);
    if (!match) return { width: 1, height: 1, explicit: false };
    return {
      width: clamp(Number(match[1]) || 1, 0.25, 20),
      height: clamp(Number(match[2]) || 1, 0.25, 20),
      explicit: true
    };
  }

  function makeId() {
    return `sticker_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  }

  function containingStickerFolder(path, fallback = DEFAULT_ROOT) {
    const normalized = String(path || "").replace(/^\/+|\/+$/g, "");
    const separator = normalized.lastIndexOf("/");
    return separator > 0 ? normalized.slice(0, separator) : fallback;
  }

  function hasStickerInteraction(sticker) {
    const interaction = sticker?.interaction;
    return Boolean(interaction && (interaction.animation || interaction.sound || interaction.loot || interaction.teleport || interaction.linkedStickerIds?.length));
  }

  function hasUpstreamStickerTrigger(stickers, stickerId) {
    return (stickers || []).some(sticker =>
      sticker.id !== stickerId && sticker.interaction?.linkedStickerIds?.includes(stickerId)
    );
  }

  function cloneStickerValue(value) {
    return value == null ? value : JSON.parse(JSON.stringify(value));
  }

  function collectLinkedStickerTree(stickers, rootId) {
    const byId = new Map((stickers || []).map(sticker => [sticker.id, sticker]));
    const result = [];
    const visited = new Set();
    const visit = id => {
      if (visited.has(id)) return;
      visited.add(id);
      const sticker = byId.get(id);
      if (!sticker) return;
      result.push(sticker);
      (sticker.interaction?.linkedStickerIds || []).forEach(visit);
    };
    visit(rootId);
    return result;
  }

  function createStickerFavorite(stickers, rootId, favoriteId = `favorite_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`) {
    const tree = collectLinkedStickerTree(stickers, rootId);
    const rootSticker = tree[0];
    if (!rootSticker) return null;
    return {
      version: 1,
      id: favoriteId,
      name: cleanLabel(rootSticker.name || "Favorite sticker"),
      rootId,
      createdAt: Date.now(),
      stickers: tree.map(sticker => ({
        ...cloneStickerValue(sticker),
        offsetX: Number(sticker.x || 0) - Number(rootSticker.x || 0),
        offsetY: Number(sticker.y || 0) - Number(rootSticker.y || 0)
      }))
    };
  }

  function instantiateStickerFavorite(favorite, x, y, idFactory = makeId) {
    const source = Array.isArray(favorite?.stickers) ? favorite.stickers : [];
    const rootSticker = source.find(sticker => sticker.id === favorite.rootId) || source[0] || {};
    const deltaX = Number(x) - Number(rootSticker.x || 0);
    const deltaY = Number(y) - Number(rootSticker.y || 0);
    const idMap = new Map(source.map(sticker => [sticker.id, idFactory()]));
    return source.map(sticker => {
      const copy = cloneStickerValue(sticker);
      delete copy.offsetX;
      delete copy.offsetY;
      delete copy._order;
      copy.id = idMap.get(sticker.id);
      copy.x = roundRatio(Number(x) + Number(sticker.offsetX || 0));
      copy.y = roundRatio(Number(y) + Number(sticker.offsetY || 0));
      if (copy.interaction?.linkedStickerIds) {
        copy.interaction.linkedStickerIds = copy.interaction.linkedStickerIds.map(id => idMap.get(id)).filter(Boolean);
      }
      if (copy.interaction?.teleport) {
        copy.interaction.teleport.toX = roundRatio(Number(copy.interaction.teleport.toX) + deltaX);
        copy.interaction.teleport.toY = roundRatio(Number(copy.interaction.teleport.toY) + deltaY);
      }
      if (copy.interaction?.animation?.restoreState) {
        copy.interaction.animation.restoreState.x = roundRatio(Number(copy.interaction.animation.restoreState.x) + deltaX);
        copy.interaction.animation.restoreState.y = roundRatio(Number(copy.interaction.animation.restoreState.y) + deltaY);
      }
      return copy;
    });
  }

  function pointInCircularRange(point, center, radiusPixels, width, height) {
    if (!point || !center || !width || !height || radiusPixels <= 0) return false;
    return Math.hypot((Number(point.x) - Number(center.x)) * width, (Number(point.y) - Number(center.y)) * height) <= radiusPixels;
  }

  function ensureStyles() {
    if (document.getElementById("map-sticker-styles")) return;
    const style = document.createElement("style");
    style.id = "map-sticker-styles";
    style.textContent = `
      .map-sticker-layer,.map-sticker-placement-layer,.map-sticker-rig-layer{position:absolute;inset:0;width:100%;height:100%;}
      .map-sticker-layer{z-index:4;pointer-events:none;overflow:visible;}
      .map-sticker-placement-layer{z-index:8;pointer-events:none;background:transparent;}
      .map-sticker-rig-layer{z-index:36;pointer-events:none;overflow:visible;}
      .map-sticker-placement-layer.is-placing{pointer-events:auto;cursor:copy;}
      .sticker-placement-cursor-preview{position:absolute;z-index:1;display:none;box-sizing:border-box;transform:translate(-50%,-50%);opacity:.68;filter:drop-shadow(0 0 4px #f4d76d);pointer-events:none;}
      .sticker-placement-cursor-preview img,.sticker-placement-cursor-preview video{display:block;width:100%;height:100%;object-fit:fill;pointer-events:none;}
      .map-sticker{position:absolute;display:block;padding:0;border:0;background:transparent;transform-origin:center;pointer-events:none;user-select:none;-webkit-user-select:none;touch-action:none;}
      .map-sticker-layer.is-editing .map-sticker{pointer-events:auto;cursor:grab;}
      .map-sticker-layer:not(.is-editing) .map-sticker.is-interactive{pointer-events:auto;cursor:pointer;}
      .map-sticker.show-interaction-marker::after{content:'';position:absolute;right:-5px;top:-5px;width:10px;height:10px;border:1px solid #1d1009;border-radius:50%;background:#f4d76d;box-shadow:0 1px 4px #000;}
      .map-sticker-layer.is-editing .map-sticker:active{cursor:grabbing;}
      .map-sticker.is-selected{filter:drop-shadow(0 0 5px #10252c);}
      .map-sticker img,.map-sticker video{display:block;width:100%;height:100%;object-fit:fill;pointer-events:none;user-select:none;-webkit-user-drag:none;}
      .map-sticker-transform-rig{position:absolute;box-sizing:border-box;border:2px solid #4fc3ff;transform-origin:center;pointer-events:none;filter:drop-shadow(0 1px 3px #081217);}
      .sticker-rig-handle{position:absolute;display:block;box-sizing:border-box;padding:0;border:2px solid #fff;background:#4fc3ff;color:#10252c;pointer-events:auto;touch-action:none;user-select:none;box-shadow:0 1px 5px #000;}
      .sticker-rig-move{left:50%;top:50%;width:34px;height:34px;border-radius:50%;transform:translate(-50%,-50%);cursor:move;}
      .sticker-rig-move::before{content:'\\2725';display:block;font:700 23px/28px Arial,sans-serif;text-align:center;}
      .sticker-rig-scale{width:18px;height:18px;border-radius:4px;cursor:nwse-resize;}
      .sticker-rig-scale[data-corner="nw"]{left:-10px;top:-10px;}
      .sticker-rig-scale[data-corner="ne"]{right:-10px;top:-10px;cursor:nesw-resize;}
      .sticker-rig-scale[data-corner="se"]{right:-10px;bottom:-10px;}
      .sticker-rig-scale[data-corner="sw"]{left:-10px;bottom:-10px;cursor:nesw-resize;}
      .sticker-rig-rotation-guide{position:absolute;left:calc(50% - 1px);top:-40px;width:2px;height:38px;background:#4fc3ff;pointer-events:none;}
      .sticker-rig-rotate{left:50%;top:-58px;width:24px;height:24px;border-radius:50%;transform:translateX(-50%);cursor:grab;}
      .sticker-rig-rotate::before{content:'\\21BB';display:block;font:700 18px/18px Arial,sans-serif;text-align:center;}
      .sticker-rig-rotate:active{cursor:grabbing;}
      .sticker-rig-origin{width:20px;height:20px;border-radius:50%;transform:translate(-50%,-50%);cursor:crosshair;background:#f4d76d;border-color:#1d1009;box-shadow:0 0 0 2px #f4d76d,0 1px 5px #000;}
      .sticker-rig-origin::before,.sticker-rig-origin::after{content:'';position:absolute;background:#1d1009;pointer-events:none;}
      .sticker-rig-origin::before{left:8px;top:2px;width:2px;height:12px;}
      .sticker-rig-origin::after{left:3px;top:7px;width:12px;height:2px;}
      .sticker-library-toolbar{width:clamp(620px,50vw,980px);max-height:min(280px,calc(100vh - 62px));padding:8px 10px;gap:5px;overflow:hidden;box-sizing:border-box;}
      .sticker-search-row{display:flex;align-items:center;gap:7px;width:100%;}
      .sticker-library-toolbar .sticker-search{flex:0 1 37.5%;min-width:120px;width:37.5%;height:34px;padding:6px 9px;box-sizing:border-box;border:1px solid #8a6643;border-radius:6px;background:#140d08;color:#fff4d6;font:14px Arial,sans-serif;outline:none;}
      .sticker-library-toolbar .sticker-search:focus{border-color:#f4d76d;box-shadow:0 0 0 2px rgba(244,215,109,.18);}
      .sticker-library-toolbar .sticker-interaction-button{flex:0 0 auto;width:auto;height:34px;padding:3px 10px;color:#f4d76d;background:#1d1009;border:1px solid #f4d76d;border-radius:5px;white-space:nowrap;font:13px Arial,sans-serif;cursor:pointer;}
      .sticker-library-toolbar .sticker-interaction-button:disabled{opacity:.45;cursor:default;}
      .sticker-library-toolbar .sticker-favorite-button{flex:0 0 34px;width:34px;height:34px;padding:0;color:#f4d76d;background:#1d1009;border:1px solid #f4d76d;border-radius:5px;font:22px/30px Arial,sans-serif;cursor:pointer;}
      .sticker-library-toolbar .sticker-favorite-button:disabled{opacity:.45;cursor:default;}
      .sticker-breadcrumbs{display:flex;flex:1 1 auto;align-items:center;gap:1px;min-width:0;min-height:18px;padding:0 2px;overflow-x:auto;scrollbar-width:thin;font:12px/1.2 Arial,sans-serif;}
      .sticker-library-toolbar .sticker-breadcrumbs button{flex:0 0 auto;width:auto;height:auto;min-height:0;padding:1px 2px;border:0;border-radius:2px;background:none;color:#d8c7ac;text-decoration:underline;text-underline-offset:2px;font:inherit;white-space:nowrap;box-shadow:none;}
      .sticker-library-toolbar .sticker-breadcrumbs button:hover:not(:disabled),.sticker-library-toolbar .sticker-breadcrumbs button:focus-visible{border:0;background:none;color:#fff4d6;outline:1px solid #8a6643;}
      .sticker-library-toolbar .sticker-breadcrumbs button:disabled{color:#f4d76d;text-decoration:none;opacity:1;cursor:default;}
      .sticker-breadcrumb-separator{color:#806b51;font-family:Arial,sans-serif;}
      .sticker-library-grid{display:flex;align-items:stretch;gap:6px;width:100%;min-height:82px;height:82px;padding:2px;overflow-x:auto;overflow-y:hidden;scrollbar-width:thin;}
      .sticker-library-toolbar .sticker-card{position:relative;display:flex;flex:0 0 81px;flex-direction:column;align-items:center;justify-content:flex-start;gap:3px;width:81px;height:75px;padding:4px;border:1px solid #765133;border-radius:6px;background:rgba(20,13,8,.88);color:#fff4d6;font:12px/1.15 Arial,sans-serif;overflow:hidden;}
      .sticker-library-toolbar .sticker-card:hover,.sticker-library-toolbar .sticker-card:focus-visible{border-color:#f4d76d;background:#3d2718;}
      .sticker-card-media{display:block;width:100%;height:100%;min-height:0;object-fit:contain;background:radial-gradient(circle,rgba(255,255,255,.09),transparent 68%);}
      .sticker-card-label{width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;text-align:center;}
      .sticker-library-toolbar .sticker-folder-card{justify-content:center;height:66px;margin-top:9px;padding:5px;color:#f4d76d;background:linear-gradient(#5b3a20,#382315);border-color:#b4893f;border-radius:3px 6px 6px 6px;overflow:visible;}
      .sticker-library-toolbar .sticker-folder-card::before{content:'';position:absolute;left:5px;top:-8px;width:33px;height:8px;box-sizing:border-box;border:1px solid #b4893f;border-bottom:0;border-radius:5px 5px 0 0;background:#5b3a20;pointer-events:none;}
      .sticker-library-toolbar .sticker-folder-card:hover,.sticker-library-toolbar .sticker-folder-card:focus-visible{background:linear-gradient(#77502d,#4a2d19);}
      .sticker-library-toolbar .sticker-folder-card:hover::before,.sticker-library-toolbar .sticker-folder-card:focus-visible::before{background:#77502d;border-color:#f4d76d;}
      .sticker-folder-card .sticker-card-label{display:-webkit-box;overflow:hidden;white-space:normal;overflow-wrap:anywhere;-webkit-box-orient:vertical;-webkit-line-clamp:3;line-height:1.2;text-overflow:ellipsis;}
      .sticker-library-toolbar .sticker-favorites-folder::after{content:'\\2605';position:absolute;right:7px;top:4px;color:#f4d76d;font-size:17px;text-shadow:0 1px 2px #000;}
      .sticker-favorite-item{position:relative;display:block;flex:0 0 81px;width:81px;height:75px;}
      .sticker-library-toolbar .sticker-favorite-item>.sticker-favorite-card{width:100%;height:75px;}
      .sticker-library-toolbar .sticker-favorite-card::after{content:'\\2605';position:absolute;right:4px;top:2px;color:#f4d76d;font-size:15px;text-shadow:0 1px 2px #000;pointer-events:none;}
      .sticker-library-toolbar .sticker-favorite-manage{position:absolute;z-index:2;bottom:3px;width:23px;height:22px;padding:0;border:1px solid #b4893f;border-radius:4px;background:#1d1009;color:#f4d76d;font:15px/18px Arial,sans-serif;box-shadow:0 1px 3px #000;cursor:pointer;}
      .sticker-library-toolbar .sticker-favorite-edit{left:3px;}
      .sticker-library-toolbar .sticker-favorite-delete{right:3px;color:#ffb0a8;}
      .sticker-status{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0;}
      .sticker-library-toolbar .sticker-load-more{display:flex;flex:0 0 81px;width:81px;height:75px;padding:5px;align-items:center;justify-content:center;font:12px Arial,sans-serif;white-space:normal;}
      .sticker-library-empty{flex:1 0 100%;margin:30px 8px;color:#d8c7ac;text-align:center;font:14px/1.4 Arial,sans-serif;}
      .sticker-portal-layer{position:absolute;inset:0;z-index:5;width:100%;height:100%;overflow:visible;pointer-events:none;}
      .sticker-portal-link{fill:none;stroke:#f4d76d;stroke-width:3;stroke-dasharray:10 7;vector-effect:non-scaling-stroke;filter:drop-shadow(0 1px 2px #000);}
      .sticker-portal-zone{fill:rgba(244,215,109,.12);stroke:#f4d76d;stroke-width:2;stroke-dasharray:6 5;vector-effect:non-scaling-stroke;}
      .sticker-portal-destination{fill:#1d1009;stroke:#f4d76d;stroke-width:4;vector-effect:non-scaling-stroke;filter:drop-shadow(0 1px 3px #000);}
      .sticker-portal-layer.is-editing .sticker-portal-link{pointer-events:stroke;cursor:move;}
      .sticker-portal-layer.is-editing .sticker-portal-destination{pointer-events:all;cursor:move;}
      .sticker-interaction-editor{position:fixed;z-index:3900;right:24px;top:82px;width:min(440px,calc(100vw - 32px));max-height:calc(100vh - 110px);overflow:auto;padding:14px;box-sizing:border-box;color:#fff4d6;background:#1d1009;border:1px solid #f4d76d;border-radius:9px;box-shadow:0 10px 34px #000;font:13px/1.35 Arial,sans-serif;}
      .sticker-interaction-editor[hidden]{display:none;}
      .sticker-interaction-editor h3{margin:0 0 10px;color:#f4d76d;font:20px 'MedievalSharp',Georgia,serif;}
      .sticker-interaction-editor .interaction-editor-status{min-height:18px;margin:0 0 6px;color:#ffb0a8;}
      .sticker-interaction-editor details{margin:8px 0;border:1px solid #765133;border-radius:6px;background:#24150d;}
      .sticker-interaction-editor summary{padding:9px;color:#f4d76d;font-weight:bold;cursor:pointer;user-select:none;}
      .sticker-interaction-editor details>label,.sticker-interaction-editor details>button,.sticker-interaction-editor details>span{margin-left:9px;margin-right:9px;}
      .sticker-interaction-editor label{display:grid;grid-template-columns:145px minmax(0,1fr);align-items:center;gap:8px;margin:6px 0;}
      .sticker-interaction-editor label.sticker-enable{display:flex;grid-template-columns:none;font-weight:bold;}
      .sticker-interaction-editor input,.sticker-interaction-editor select{min-width:0;padding:6px;color:white;background:#2b190f;border:1px solid #8a6643;border-radius:4px;box-sizing:border-box;}
      .sticker-interaction-editor input[type="checkbox"]{width:auto;accent-color:#f4d76d;}
      .sticker-link-list{max-height:180px;margin:0 9px 9px;padding:3px 7px;overflow:auto;border:1px solid #5e402b;border-radius:4px;background:#170d08;}
      .sticker-interaction-editor .sticker-link-list label{display:flex;grid-template-columns:none;align-items:center;margin:3px 0;padding:3px 2px;}
      .sticker-link-empty{display:block;padding:7px;color:#bba98e;}
      .sticker-interaction-editor .interaction-actions{display:flex;justify-content:flex-end;gap:7px;margin-top:10px;}
      .sticker-interaction-editor button{padding:7px 10px;color:#f4d76d;background:#3d2718;border:1px solid #8a6643;border-radius:5px;cursor:pointer;}
      .sticker-interaction-editor .interaction-save{color:#1d1009;background:#f4d76d;border-color:#f4d76d;font-weight:bold;}
      .sticker-favorite-dialog{position:fixed;z-index:4100;inset:0;display:flex;align-items:center;justify-content:center;padding:20px;background:rgba(0,0,0,.68);}
      .sticker-favorite-dialog[hidden]{display:none;}
      .sticker-favorite-dialog-card{width:min(420px,95vw);padding:16px;box-sizing:border-box;color:#fff4d6;background:#1d1009;border:2px solid #f4d76d;border-radius:9px;box-shadow:0 10px 35px #000;font:13px/1.4 Arial,sans-serif;}
      .sticker-favorite-dialog-card h3{margin:0 0 10px;color:#f4d76d;font:20px 'MedievalSharp',Georgia,serif;}
      .sticker-favorite-dialog-card label{display:grid;gap:5px;}
      .sticker-favorite-dialog-card input{width:100%;padding:8px;box-sizing:border-box;color:white;background:#2b190f;border:1px solid #8a6643;border-radius:5px;}
      .sticker-favorite-dialog-actions{display:flex;justify-content:flex-end;gap:7px;margin-top:14px;}
      .sticker-favorite-dialog-actions button{padding:7px 11px;color:#f4d76d;background:#3d2718;border:1px solid #8a6643;border-radius:5px;cursor:pointer;}
      .sticker-favorite-dialog-actions .favorite-dialog-delete{margin-right:auto;color:#ffb0a8;}
      .sticker-favorite-dialog-actions .favorite-dialog-save{color:#1d1009;background:#f4d76d;border-color:#f4d76d;font-weight:bold;}
      .sticker-loot-popup{position:fixed;z-index:4000;inset:0;display:flex;align-items:center;justify-content:center;padding:20px;background:rgba(0,0,0,.68);}
      .sticker-loot-popup[hidden]{display:none;}
      .sticker-loot-card{width:min(560px,95vw);padding:16px;background:#1d1009;border:2px solid #f4d76d;border-radius:9px;box-shadow:0 10px 35px #000;}
      .sticker-loot-card h3{margin:0 0 10px;color:#f4d76d;font-family:'MedievalSharp',Georgia,serif;}
      .sticker-loot-card textarea{width:100%;height:280px;padding:10px;box-sizing:border-box;resize:vertical;color:white;background:#2b190f;border:1px solid #8a6643;border-radius:5px;}
      .sticker-loot-card button{float:right;margin-top:9px;padding:8px 14px;color:#1d1009;background:#f4d76d;border:0;border-radius:5px;font-weight:bold;cursor:pointer;}
      @media(max-width:760px){.sticker-library-toolbar{width:calc(100vw - 12px);min-width:0;}.sticker-library-toolbar .sticker-card,.sticker-library-toolbar .sticker-load-more,.sticker-favorite-item{flex-basis:71px;width:71px}.map-tool-tab-buttons button{min-width:70px;}}
    `;
    document.head.appendChild(style);
  }

  function setupMapStickers(options) {
    ensureStyles();
    const { boardSync, storage, mapImage, mapTransformLayer, tokenLayer } = options;
    if (!boardSync || !storage || !mapImage || !mapTransformLayer || !tokenLayer) {
      throw new Error("setupMapStickers requires boardSync, storage, mapImage, mapTransformLayer, and tokenLayer.");
    }

    const rootPath = String(options.rootPath || DEFAULT_ROOT).replace(/^\/+|\/+$/g, "");
    const stickers = [];
    let favorites = [];
    const urlCache = new Map();
    const mediaDimensions = new Map();
    const stickerElements = new Map();
    const localOverrides = new Map();
    const loopingSounds = new Map();
    const teleportLocks = new Map();
    const canEditInteractions = Boolean(options.canEditInteractions);
    const canRunTeleports = Boolean(options.canRunTeleports);
    let active = false;
    let selectedAsset = null;
    let selectedStickerId = "";
    let navigationVersion = 0;
    let currentPath = rootPath;
    let currentFolders = [];
    let currentItems = [];
    let nextPageToken = null;
    let searchWorker = null;
    let searchWorkerIdleTimer = null;
    let searchRequestId = 0;
    let fallbackCatalogPromise = null;
    const pendingSearches = new Map();
    let searchTimer = null;
    let dragSession = null;
    let teleportDragSession = null;
    let teleportDestinationStickerId = "";
    let teleportPreview = null;
    let replacementPickerStickerId = "";
    let lootDataPromise = null;
    let requestPanelClose = () => {};
    let lastPlacementPointer = { x: root.innerWidth / 2, y: root.innerHeight / 2 };
    let placementPreviewPath = "";
    const MAX_MEDIA_CACHE_ENTRIES = 500;

    const videoVisibilityObserver = typeof root.IntersectionObserver === "function"
      ? new root.IntersectionObserver(entries => entries.forEach(entry => {
          const video = entry.target;
          if (entry.isIntersecting && !document.hidden) video.play().catch(() => {});
          else video.pause();
        }), { rootMargin: "150px" })
      : null;

    function trimCache(cache, limit = MAX_MEDIA_CACHE_ENTRIES) {
      while (cache.size > limit) cache.delete(cache.keys().next().value);
    }

    function syncStickerVideoVisibility() {
      stickerElements.forEach(element => {
        const video = element.querySelector("video");
        if (!video) return;
        if (document.hidden) video.pause();
        else if (videoVisibilityObserver) {
          videoVisibilityObserver.unobserve(video);
          videoVisibilityObserver.observe(video);
        } else video.play().catch(() => {});
      });
    }
    document.addEventListener("visibilitychange", syncStickerVideoVisibility);

    const layer = document.createElement("div");
    layer.id = "mapStickerLayer";
    layer.className = "map-sticker-layer";
    mapTransformLayer.insertBefore(layer, tokenLayer);

    const portalLayer = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    portalLayer.id = "mapStickerPortalLayer";
    portalLayer.classList.add("sticker-portal-layer");
    portalLayer.setAttribute("aria-hidden", "true");
    if (canEditInteractions) mapTransformLayer.insertBefore(portalLayer, tokenLayer);

    const placementLayer = document.createElement("div");
    placementLayer.id = "mapStickerPlacementLayer";
    placementLayer.className = "map-sticker-placement-layer";
    mapTransformLayer.appendChild(placementLayer);

    const rigLayer = document.createElement("div");
    rigLayer.id = "mapStickerRigLayer";
    rigLayer.className = "map-sticker-rig-layer";
    mapTransformLayer.appendChild(rigLayer);

    const placementPreview = document.createElement("div");
    placementPreview.className = "sticker-placement-cursor-preview";
    placementPreview.setAttribute("aria-hidden", "true");
    placementLayer.appendChild(placementPreview);

    const toolbar = document.createElement("section");
    toolbar.className = "drawing-toolbar sticker-library-toolbar";
    toolbar.setAttribute("aria-label", "Map sticker library");

    const interactionButton = document.createElement("button");
    interactionButton.type = "button";
    interactionButton.className = "sticker-interaction-button";
    interactionButton.textContent = "Interactions…";
    interactionButton.title = "Configure the selected sticker interaction";
    interactionButton.disabled = true;

    const favoriteButton = document.createElement("button");
    favoriteButton.type = "button";
    favoriteButton.className = "sticker-favorite-button";
    favoriteButton.textContent = "\u2606";
    favoriteButton.title = "Save the selected sticker and its linked interaction tree to Favorites";
    favoriteButton.setAttribute("aria-label", favoriteButton.title);
    favoriteButton.disabled = true;

    const searchInput = document.createElement("input");
    searchInput.type = "search";
    searchInput.className = "sticker-search";
    searchInput.placeholder = "Fuzzy search every folder…";
    searchInput.autocomplete = "off";
    searchInput.disabled = true;
    searchInput.setAttribute("aria-label", "Search map stickers");

    const searchRow = document.createElement("div");
    searchRow.className = "sticker-search-row";

    const breadcrumbs = document.createElement("nav");
    breadcrumbs.className = "sticker-breadcrumbs";
    breadcrumbs.setAttribute("aria-label", "Sticker folders");
    searchRow.append(searchInput, breadcrumbs);
    searchRow.append(favoriteButton);
    if (canEditInteractions) searchRow.append(interactionButton);

    const grid = document.createElement("div");
    grid.className = "sticker-library-grid";
    grid.setAttribute("role", "list");

    const status = document.createElement("p");
    status.className = "sticker-status";
    status.setAttribute("aria-live", "polite");
    const loadMoreButton = document.createElement("button");
    loadMoreButton.type = "button";
    loadMoreButton.className = "sticker-card sticker-load-more";
    loadMoreButton.textContent = "Load more";

    toolbar.append(searchRow, grid, status);

    const interactionEditor = document.createElement("section");
    interactionEditor.className = "sticker-interaction-editor";
    interactionEditor.hidden = true;
    interactionEditor.setAttribute("aria-label", "Sticker interaction settings");
    interactionEditor.innerHTML = `
      <h3>Sticker Interactions</h3><p class="interaction-editor-status" data-editor-status></p>
      <details open><summary>Animate</summary>
        <label>Rotation degrees <input name="rotationDegrees" type="number" value="0" step="1"></label>
        <input name="rotationOriginX" type="hidden" value="50">
        <input name="rotationOriginY" type="hidden" value="50">
        <label>Move X (grid spaces) <input name="translateX" type="number" value="0" step="0.25"></label>
        <label>Move Y (grid spaces) <input name="translateY" type="number" value="0" step="0.25"></label>
        <label>Scale change (%) <input name="scalePercent" type="number" value="0" min="-90" max="900" step="5"></label>
        <label>Replacement path <input name="replacementPath" type="text" placeholder="sticker-library/v1/..."></label>
        <button type="button" data-action="pick-replacement">Choose replacement from library</button>
        <label>Duration (ms) <input name="durationMs" type="number" value="0" min="0" max="10000" step="50"></label>
      </details>
      <details><summary>Sound</summary>
        <label>Sound path <input name="soundSrc" type="text" list="stickerInteractionSounds" placeholder="data/sounds/..."></label>
        <label class="sticker-enable"><input name="soundLoop" type="checkbox"> Loop until clicked again</label>
      </details>
      <details><summary>Loot</summary>
        <label>Treasure type <select name="lootType"><option value="none">No treasure</option><option value="individual">Individual Treasure</option><option value="hoard">Treasure Hoard</option></select></label>
        <label>Challenge rating <input name="lootCR" type="number" min="0" max="30" step="0.125" value="0"></label>
        <label>Encounter XP <input name="lootXP" type="number" min="0" step="25" value="0"></label>
      </details>
      <details><summary>Teleport</summary>
        <label>Trigger radius (grids) <input name="teleportRadius" type="number" min="0" max="20" step="0.25" value="0"></label>
        <label class="sticker-enable"><input name="teleportBidirectional" type="checkbox"> Bidirectional travel</label>
        <input name="teleportToX" type="hidden"><input name="teleportToY" type="hidden">
        <button type="button" data-action="set-teleport">Set destination on map</button>
        <span data-teleport-status>No destination set.</span>
      </details>
      <details><summary>Linked stickers</summary>
        <span>Trigger these stickers when this sticker is clicked. Linked triggers continue through the full interaction tree.</span>
        <div class="sticker-link-list" data-linked-stickers></div>
      </details>
      <div class="interaction-actions"><button type="button" data-action="clear">Clear all</button><button type="button" data-action="cancel">Cancel</button><button class="interaction-save" type="button" data-action="save">Save</button></div>`;
    const soundList = document.createElement("datalist");
    soundList.id = "stickerInteractionSounds";
    ["angry","bruh","dumb","evillaugh","scream","nooo","suprise","oh_my","awww","laugh","yeet","running","bite","punch","splat","bonk","hammer","sword","tentacle","gunshot","Explosion","failed_spell","spell attack","died","item","sad","senses","slipandfall","sucess","spell_whispers"].forEach(name => {
      const option = document.createElement("option");
      option.value = `data/sounds/${name}.mp3`;
      soundList.appendChild(option);
    });
    interactionEditor.appendChild(soundList);
    if (canEditInteractions) document.body.appendChild(interactionEditor);

    const favoriteDialog = document.createElement("div");
    favoriteDialog.className = "sticker-favorite-dialog";
    favoriteDialog.hidden = true;
    favoriteDialog.innerHTML = `<form class="sticker-favorite-dialog-card">
      <h3 data-favorite-dialog-title>Save Favorite</h3>
      <label>Favorite name <input name="favoriteName" type="text" maxlength="80" required></label>
      <p data-favorite-dialog-summary></p>
      <div class="sticker-favorite-dialog-actions">
        <button class="favorite-dialog-delete" type="button" data-action="delete">Delete</button>
        <button type="button" data-action="cancel">Cancel</button>
        <button class="favorite-dialog-save" type="submit">Save</button>
      </div>
    </form>`;
    document.body.appendChild(favoriteDialog);
    let favoriteDialogContext = null;

    const lootPopup = document.createElement("div");
    lootPopup.className = "sticker-loot-popup";
    lootPopup.hidden = true;
    lootPopup.innerHTML = `<div class="sticker-loot-card"><h3>Loot</h3><textarea readonly aria-label="Rolled loot"></textarea><button type="button">Close</button></div>`;
    lootPopup.querySelector("button").addEventListener("click", () => { lootPopup.hidden = true; });
    document.body.appendChild(lootPopup);

    function reportError(error) {
      console.error("Map stickers:", error);
      status.textContent = error?.message || "The sticker library could not be loaded.";
      if (typeof root.reportBoardSyncError === "function") root.reportBoardSyncError(error);
    }

    function loadFavorites() {
      try {
        const saved = JSON.parse(root.localStorage?.getItem(FAVORITES_STORAGE_KEY) || "[]");
        favorites = Array.isArray(saved) ? saved.filter(item => item?.version === 1 && Array.isArray(item.stickers) && item.stickers.length) : [];
      } catch (error) {
        favorites = [];
        console.warn("Map stickers: favorites could not be read.", error);
      }
    }

    function persistFavorites() {
      try {
        root.localStorage?.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
      } catch (error) {
        throw new Error("Favorites could not be saved in this browser.", { cause: error });
      }
    }

    function closeFavoriteDialog() {
      favoriteDialog.hidden = true;
      favoriteDialogContext = null;
    }

    function openFavoriteDialog({ favorite = null, sourceId = "" } = {}) {
      const source = stickers.find(sticker => sticker.id === sourceId);
      const treeSize = source ? collectLinkedStickerTree(stickers, source.id).length : favorite?.stickers?.length || 1;
      favoriteDialogContext = { favoriteId: favorite?.id || "", sourceId: source?.id || "" };
      favoriteDialog.querySelector("[data-favorite-dialog-title]").textContent = favorite ? "Edit Favorite" : "Save Favorite";
      favoriteDialog.querySelector('[name="favoriteName"]').value = favorite?.name || cleanLabel(source?.name || "Favorite sticker");
      favoriteDialog.querySelector("[data-favorite-dialog-summary]").textContent = source
        ? `This will save ${treeSize} sticker${treeSize === 1 ? "" : "s"} from the linked interaction tree.`
        : `${treeSize} saved sticker${treeSize === 1 ? "" : "s"}.`;
      favoriteDialog.querySelector("[data-action='delete']").hidden = !favorite;
      favoriteDialog.hidden = false;
      const input = favoriteDialog.querySelector('[name="favoriteName"]');
      input.focus();
      input.select();
    }

    function deleteFavorite(favoriteId) {
      const favorite = favorites.find(item => item.id === favoriteId);
      if (!favorite) return;
      if (typeof root.confirm === "function" && !root.confirm(`Delete favorite "${favorite.name}"?`)) return;
      const previous = favorites;
      try {
        favorites = favorites.filter(item => item.id !== favoriteId);
        persistFavorites();
        closeFavoriteDialog();
        if (currentPath === FAVORITES_PATH) renderFavorites();
        renderStickerSelection();
        status.textContent = `${favorite.name} deleted from Favorites.`;
      } catch (error) {
        favorites = previous;
        reportError(error);
      }
    }

    function saveFavoriteDialog() {
      if (!favoriteDialogContext) return;
      const name = favoriteDialog.querySelector('[name="favoriteName"]').value.trim();
      if (!name) return;
      const { favoriteId, sourceId } = favoriteDialogContext;
      const existing = favorites.find(item => item.id === favoriteId);
      const previous = favorites;
      let saved;
      if (sourceId) saved = createStickerFavorite(stickers, sourceId, existing?.id);
      else if (existing) saved = cloneStickerValue(existing);
      if (!saved) return;
      saved.name = name;
      if (existing) saved.createdAt = existing.createdAt;
      try {
        favorites = existing
          ? favorites.map(item => item.id === existing.id ? saved : item)
          : [saved, ...favorites];
        persistFavorites();
        closeFavoriteDialog();
        if (currentPath === FAVORITES_PATH) renderFavorites();
        renderStickerSelection();
        status.textContent = `${saved.name} saved with ${saved.stickers.length} sticker${saved.stickers.length === 1 ? "" : "s"}.`;
      } catch (error) {
        favorites = previous;
        reportError(error);
      }
    }

    favoriteDialog.querySelector("form").addEventListener("submit", event => {
      event.preventDefault();
      saveFavoriteDialog();
    });
    favoriteDialog.querySelector("[data-action='cancel']").addEventListener("click", closeFavoriteDialog);
    favoriteDialog.querySelector("[data-action='delete']").addEventListener("click", () => deleteFavorite(favoriteDialogContext?.favoriteId));
    favoriteDialog.addEventListener("pointerdown", event => {
      if (event.target === favoriteDialog) closeFavoriteDialog();
    });
    favoriteDialog.addEventListener("keydown", event => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      event.stopPropagation();
      closeFavoriteDialog();
    });

    function renderLinkedStickerChoices(selectedId, linkedIds = []) {
      const container = interactionEditor.querySelector("[data-linked-stickers]");
      if (!container) return;
      container.replaceChildren();
      const choices = stickers.filter(sticker => sticker.id !== selectedId);
      if (!choices.length) {
        const empty = document.createElement("span");
        empty.className = "sticker-link-empty";
        empty.textContent = "Place another sticker on the board to link it.";
        container.appendChild(empty);
        return;
      }
      const selected = new Set(linkedIds);
      choices.forEach(sticker => {
        const label = document.createElement("label");
        const input = document.createElement("input");
        input.type = "checkbox";
        input.name = "linkedStickerIds";
        input.value = sticker.id;
        input.checked = selected.has(sticker.id);
        const location = `${(Number(sticker.x || 0) * 100).toFixed(0)}%, ${(Number(sticker.y || 0) * 100).toFixed(0)}%`;
        label.append(input, document.createTextNode(`${cleanLabel(sticker.name || "Sticker")} (${location})`));
        container.appendChild(label);
      });
    }

    const editorField = name => interactionEditor.querySelector(`[name="${name}"]`);
    ["rotationOriginX", "rotationOriginY"].forEach(name => editorField(name)?.addEventListener("input", () => {
      const handle = rigLayer.querySelector(".sticker-rig-origin");
      if (!handle) return;
      handle.style.left = `${clamp(Number(editorField("rotationOriginX").value) || 0, 0, 100)}%`;
      handle.style.top = `${clamp(Number(editorField("rotationOriginY").value) || 0, 0, 100)}%`;
    }));
    function syncTeleportPreviewFromEditor() {
      const hasDestination = editorField("teleportToX").value !== "" && editorField("teleportToY").value !== "";
      const sticker = stickers.find(item => item.id === selectedStickerId);
      if (!sticker || !hasDestination || interactionEditor.hidden) {
        teleportPreview = null;
      } else {
        teleportPreview = {
          stickerId: sticker.id,
          toX: roundRatio(editorField("teleportToX").value),
          toY: roundRatio(editorField("teleportToY").value),
          radius: clamp(Number(editorField("teleportRadius").value) || 0, 0, 20),
          bidirectional: editorField("teleportBidirectional").checked
        };
      }
      renderTeleportOverlays();
    }
    editorField("teleportRadius")?.addEventListener("input", syncTeleportPreviewFromEditor);
    editorField("teleportBidirectional")?.addEventListener("change", syncTeleportPreviewFromEditor);
    function setEditorStatus(message = "") {
      const output = interactionEditor.querySelector("[data-editor-status]");
      if (output) output.textContent = message;
    }
    function updateTeleportEditorStatus() {
      const x = Number(editorField("teleportToX")?.value);
      const y = Number(editorField("teleportToY")?.value);
      const output = interactionEditor.querySelector("[data-teleport-status]");
      if (output) output.textContent = Number.isFinite(x) && Number.isFinite(y) && editorField("teleportToX").value !== ""
        ? `Destination: ${(x * 100).toFixed(1)}%, ${(y * 100).toFixed(1)}%`
        : "No destination set.";
    }

    function openInteractionEditor() {
      const sticker = stickers.find(item => item.id === selectedStickerId);
      if (!sticker || !canEditInteractions) return;
      const interaction = sticker.interaction || {};
      const animation = interaction.animation || {};
      const sound = interaction.sound || {};
      const loot = interaction.loot || {};
      const teleport = interaction.teleport || {};
      const effects = animation.effects || { [animation.kind || "rotate"]: true };
      editorField("rotationDegrees").value = interaction.animation && effects.rotate ? animation.rotationDegrees ?? 0 : 0;
      editorField("rotationOriginX").value = (animation.rotationOriginX ?? .5) * 100;
      editorField("rotationOriginY").value = (animation.rotationOriginY ?? .5) * 100;
      editorField("translateX").value = interaction.animation && effects.translate ? animation.translateX ?? 0 : 0;
      editorField("translateY").value = interaction.animation && effects.translate ? animation.translateY ?? 0 : 0;
      editorField("scalePercent").value = interaction.animation && effects.scale
        ? animation.scalePercent ?? ((Number(animation.scaleFactor) || 1) - 1) * 100
        : 0;
      editorField("replacementPath").value = interaction.animation && effects.replace ? animation.replacementPath || "" : "";
      editorField("durationMs").value = interaction.animation ? animation.durationMs ?? 0 : 0;
      editorField("soundSrc").value = sound.src || "";
      editorField("soundLoop").checked = Boolean(sound.loop);
      editorField("lootType").value = interaction.loot ? loot.type || "individual" : "none";
      editorField("lootCR").value = loot.cr ?? 0;
      editorField("lootXP").value = loot.xp ?? 0;
      editorField("teleportRadius").value = interaction.teleport ? teleport.radius ?? 0 : 0;
      editorField("teleportBidirectional").checked = Boolean(teleport.bidirectional);
      editorField("teleportToX").value = Number.isFinite(Number(teleport.toX)) ? teleport.toX : "";
      editorField("teleportToY").value = Number.isFinite(Number(teleport.toY)) ? teleport.toY : "";
      renderLinkedStickerChoices(sticker.id, interaction.linkedStickerIds || []);
      updateTeleportEditorStatus();
      setEditorStatus();
      interactionEditor.hidden = false;
      syncTeleportPreviewFromEditor();
      renderStickerSelection();
    }

    function closeInteractionEditor() {
      teleportDestinationStickerId = "";
      replacementPickerStickerId = "";
      interactionEditor.hidden = true;
      teleportPreview = null;
      updatePlacementMode();
      renderTeleportOverlays();
      renderStickerSelection();
    }

    async function saveInteractionEditor() {
      const sticker = stickers.find(item => item.id === selectedStickerId);
      if (!sticker) return;
      const interaction = {};
      const rotationDegrees = Number(editorField("rotationDegrees").value) || 0;
      const translateX = Number(editorField("translateX").value) || 0;
      const translateY = Number(editorField("translateY").value) || 0;
      const scalePercent = clamp(Number(editorField("scalePercent").value) || 0, -90, 900);
      const replacementPath = editorField("replacementPath").value.trim();
      const effects = {
        rotate: rotationDegrees !== 0,
        translate: translateX !== 0 || translateY !== 0,
        scale: scalePercent !== 0,
        replace: Boolean(replacementPath)
      };
      if (Object.values(effects).some(Boolean)) {
        interaction.animation = {
          effects,
          rotationDegrees,
          rotationOriginX: clamp(Number(editorField("rotationOriginX").value) || 0, 0, 100) / 100,
          rotationOriginY: clamp(Number(editorField("rotationOriginY").value) || 0, 0, 100) / 100,
          translateX,
          translateY,
          scalePercent,
          replacementPath,
          originalPath: sticker.interaction?.animation?.originalPath || sticker.storagePath,
          durationMs: clamp(Number(editorField("durationMs").value) || 0, 0, 10000),
          active: Boolean(sticker.interaction?.animation?.active),
          restoreState: sticker.interaction?.animation?.restoreState || null
        };
      }
      if (editorField("soundSrc").value.trim()) {
        interaction.sound = { src: editorField("soundSrc").value.trim(), loop: editorField("soundLoop").checked };
      }
      if (editorField("lootType").value !== "none") {
        interaction.loot = {
          type: editorField("lootType").value === "hoard" ? "hoard" : "individual",
          cr: clamp(Number(editorField("lootCR").value) || 0, 0, 30),
          xp: Math.max(0, Number(editorField("lootXP").value) || 0)
        };
      }
      const teleportRadius = clamp(Number(editorField("teleportRadius").value) || 0, 0, 20);
      if (teleportRadius > 0) {
        const hasDestination = editorField("teleportToX").value !== "" && editorField("teleportToY").value !== "";
        const toX = Number(editorField("teleportToX").value);
        const toY = Number(editorField("teleportToY").value);
        if (!hasDestination || !Number.isFinite(toX) || !Number.isFinite(toY)) {
          setEditorStatus("Set a teleport destination before saving.");
          return;
        }
        interaction.teleport = {
          toX: roundRatio(toX), toY: roundRatio(toY),
          radius: teleportRadius,
          bidirectional: editorField("teleportBidirectional").checked
        };
      }
      const linkedStickerIds = [...interactionEditor.querySelectorAll('input[name="linkedStickerIds"]:checked')]
        .map(input => input.value)
        .filter(id => id !== sticker.id && stickers.some(item => item.id === id));
      if (linkedStickerIds.length) interaction.linkedStickerIds = linkedStickerIds;
      const saved = Object.keys(interaction).length ? interaction : null;
      try {
        await boardSync.patchStickers(new Map([[sticker.id, { interaction: saved }]]), boardSync.generation);
        sticker.interaction = saved;
        closeInteractionEditor();
        renderStickers();
        status.textContent = saved ? "Sticker interactions saved." : "Sticker interactions cleared.";
      } catch (error) { setEditorStatus(error?.message || "Could not save interactions."); reportError(error); }
    }

    favoriteButton.addEventListener("click", () => {
      const existing = favorites.find(item => item.rootId === selectedStickerId);
      openFavoriteDialog({ favorite: existing, sourceId: selectedStickerId });
    });
    interactionButton.addEventListener("click", openInteractionEditor);
    interactionEditor.querySelector("[data-action='cancel']")?.addEventListener("click", closeInteractionEditor);
    interactionEditor.querySelector("[data-action='save']")?.addEventListener("click", saveInteractionEditor);
    interactionEditor.querySelector("[data-action='clear']")?.addEventListener("click", async () => {
      const sticker = stickers.find(item => item.id === selectedStickerId);
      if (!sticker) return;
      try {
        await boardSync.patchStickers(new Map([[sticker.id, { interaction: null }]]), boardSync.generation);
        sticker.interaction = null;
        closeInteractionEditor();
        renderStickers();
        status.textContent = "Sticker interactions cleared.";
      } catch (error) { reportError(error); }
    });
    interactionEditor.querySelector("[data-action='set-teleport']")?.addEventListener("click", () => {
      if (!selectedStickerId) return;
      teleportDestinationStickerId = selectedStickerId;
      updatePlacementMode();
      renderStickerSelection();
      status.textContent = "Click the map to set the other teleport endpoint.";
      interactionEditor.querySelector("[data-teleport-status]").textContent = "Click a destination on the map…";
    });
    interactionEditor.querySelector("[data-action='pick-replacement']")?.addEventListener("click", () => {
      if (!selectedStickerId) return;
      replacementPickerStickerId = selectedStickerId;
      updatePlacementMode();
      renderStickerSelection();
      status.textContent = "Choose the alternate sticker from the library.";
    });

    function displayPath(path) {
      return String(path || "").split("/").map(cleanLabel).join(" / ");
    }

    function resolveUrl(itemOrPath) {
      const path = typeof itemOrPath === "string" ? itemOrPath : itemOrPath.fullPath;
      if (urlCache.has(path)) {
        const cached = urlCache.get(path);
        urlCache.delete(path);
        urlCache.set(path, cached);
      } else {
        const ref = typeof itemOrPath === "string" ? storage.ref().child(path) : itemOrPath;
        urlCache.set(path, ref.getDownloadURL().catch(error => {
          urlCache.delete(path);
          throw error;
        }));
        trimCache(urlCache);
      }
      return urlCache.get(path);
    }

    function mediaElement(path, preview = false) {
      const media = document.createElement(VIDEO_PATTERN.test(path) ? "video" : "img");
      media.className = preview ? "sticker-card-media" : "";
      media.setAttribute("aria-hidden", "true");
      if (media.tagName === "VIDEO") {
        media.muted = true;
        media.loop = true;
        media.playsInline = true;
        media.preload = "metadata";
        if (!preview && !videoVisibilityObserver) media.autoplay = true;
      } else {
        media.alt = "";
        media.loading = "lazy";
        media.decoding = "async";
        media.draggable = false;
      }
      const rememberDimensions = () => {
        const width = media.videoWidth || media.naturalWidth;
        const height = media.videoHeight || media.naturalHeight;
        if (width && height) {
          if (mediaDimensions.has(path)) mediaDimensions.delete(path);
          mediaDimensions.set(path, { width, height });
          trimCache(mediaDimensions);
        }
      };
      media.addEventListener(media.tagName === "VIDEO" ? "loadedmetadata" : "load", rememberDimensions, { once: true });
      if (!preview && media.tagName === "VIDEO") videoVisibilityObserver?.observe(media);
      return media;
    }

    function positionPlacementPreview() {
      if (!active || !selectedAsset || replacementPickerStickerId) {
        placementPreview.style.display = "none";
        return;
      }
      const bounds = mapImage.getBoundingClientRect();
      if (!bounds.width || !bounds.height || lastPlacementPointer.x < bounds.left || lastPlacementPointer.x > bounds.right || lastPlacementPointer.y < bounds.top || lastPlacementPointer.y > bounds.bottom) {
        placementPreview.style.display = "none";
        return;
      }
      const gridSize = clamp(Number(options.getGridSize?.()) || 100, 12, 1000);
      const dimensions = mediaDimensions.get(selectedAsset.path);
      let widthRatio;
      let heightRatio;
      if (selectedAsset.favoriteRoot) {
        widthRatio = clamp(Number(selectedAsset.favoriteRoot.widthRatio) || .05, .004, 1);
        heightRatio = clamp(Number(selectedAsset.favoriteRoot.heightRatio) || .05, .004, 1);
      } else {
        let widthPixels = gridSize * selectedAsset.units.width;
        let heightPixels = gridSize * selectedAsset.units.height;
        if (!selectedAsset.units.explicit && dimensions?.width && dimensions?.height) heightPixels = widthPixels * dimensions.height / dimensions.width;
        widthRatio = clamp(widthPixels / Math.max(1, mapImage.clientWidth), .004, 1);
        heightRatio = clamp(heightPixels / Math.max(1, mapImage.clientHeight), .004, 1);
      }
      const pointerX = (lastPlacementPointer.x - bounds.left) / bounds.width;
      const pointerY = (lastPlacementPointer.y - bounds.top) / bounds.height;
      placementPreview.style.left = `${clamp(pointerX, widthRatio / 2, 1 - widthRatio / 2) * 100}%`;
      placementPreview.style.top = `${clamp(pointerY, heightRatio / 2, 1 - heightRatio / 2) * 100}%`;
      placementPreview.style.width = `${widthRatio * 100}%`;
      placementPreview.style.height = `${heightRatio * 100}%`;
      placementPreview.style.display = "block";
    }

    function renderPlacementPreview() {
      if (!active || !selectedAsset || replacementPickerStickerId) {
        placementPreview.style.display = "none";
        return;
      }
      if (placementPreviewPath !== selectedAsset.path) {
        placementPreviewPath = selectedAsset.path;
        const media = mediaElement(selectedAsset.path, true);
        if (media.tagName === "VIDEO") media.autoplay = true;
        media.addEventListener(media.tagName === "VIDEO" ? "loadedmetadata" : "load", positionPlacementPreview, { once: true });
        placementPreview.replaceChildren(media);
        const requestedPath = selectedAsset.path;
        resolveUrl(selectedAsset.ref).then(url => {
          if (placementPreviewPath !== requestedPath) return;
          media.src = url;
          if (media.tagName === "VIDEO") media.play().catch(() => {});
        }).catch(reportError);
      }
      positionPlacementPreview();
    }

    function renderBreadcrumbs() {
      breadcrumbs.replaceChildren();
      const relative = currentPath === rootPath || currentPath === FAVORITES_PATH ? [] : currentPath.slice(rootPath.length + 1).split("/");
      const segments = [{ label: "Stickers", path: rootPath }];
      if (currentPath === FAVORITES_PATH) segments.push({ label: "Favorites", path: FAVORITES_PATH });
      relative.forEach((part, index) => segments.push({
        label: cleanLabel(part),
        path: `${rootPath}/${relative.slice(0, index + 1).join("/")}`
      }));
      segments.forEach((segment, index) => {
        if (index) {
          const separator = document.createElement("span");
          separator.className = "sticker-breadcrumb-separator";
          separator.textContent = "/";
          breadcrumbs.appendChild(separator);
        }
        const button = document.createElement("button");
        button.type = "button";
        button.textContent = segment.label;
        button.title = displayPath(segment.path);
        button.disabled = segment.path === currentPath;
        button.addEventListener("click", () => navigate(segment.path));
        breadcrumbs.appendChild(button);
      });
    }

    function folderCard(folder) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "sticker-card sticker-folder-card";
      button.setAttribute("role", "listitem");
      button.title = `Open ${cleanLabel(folder.name)}`;
      button.setAttribute("aria-label", `Open folder ${cleanLabel(folder.name)}`);
      const label = document.createElement("span");
      label.className = "sticker-card-label";
      label.textContent = cleanLabel(folder.name);
      button.appendChild(label);
      button.addEventListener("click", () => navigate(folder.fullPath));
      return button;
    }

    function favoritesFolderCard() {
      const button = folderCard({ name: "Favorites", fullPath: FAVORITES_PATH });
      button.classList.add("sticker-favorites-folder");
      button.title = `Open Favorites (${favorites.length})`;
      return button;
    }

    function assetCard(item) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "sticker-card";
      button.setAttribute("role", "listitem");
      const labelText = cleanLabel(item.name);
      button.title = `${labelText}\n${displayPath(item.fullPath)}`;
      button.setAttribute("aria-label", `Place sticker ${labelText}`);
      const media = mediaElement(item.fullPath, true);
      button.appendChild(media);
      resolveUrl(item).then(url => { media.src = url; }).catch(() => {
        media.replaceWith(Object.assign(document.createElement("span"), { className: "sticker-card-media", textContent: "Preview unavailable" }));
      });
      button.addEventListener("click", () => selectAsset(item));
      return button;
    }

    function favoriteCard(favorite) {
      const rootSticker = favorite.stickers.find(sticker => sticker.id === favorite.rootId) || favorite.stickers[0];
      const item = storage.ref().child(rootSticker.storagePath);
      const button = assetCard(item);
      button.classList.add("sticker-favorite-card");
      button.removeAttribute("role");
      button.title = `${favorite.name}\n${favorite.stickers.length} linked sticker${favorite.stickers.length === 1 ? "" : "s"}`;
      button.setAttribute("aria-label", `Place favorite ${favorite.name}`);
      button.addEventListener("click", event => {
        event.stopImmediatePropagation();
        selectFavorite(favorite);
      }, true);
      const wrapper = document.createElement("div");
      wrapper.className = "sticker-favorite-item";
      wrapper.setAttribute("role", "listitem");
      const edit = document.createElement("button");
      edit.type = "button";
      edit.className = "sticker-favorite-manage sticker-favorite-edit";
      edit.textContent = "\u270E";
      edit.title = `Edit ${favorite.name}`;
      edit.setAttribute("aria-label", edit.title);
      edit.addEventListener("click", () => openFavoriteDialog({
        favorite,
        sourceId: stickers.some(sticker => sticker.id === favorite.rootId) ? favorite.rootId : ""
      }));
      const remove = document.createElement("button");
      remove.type = "button";
      remove.className = "sticker-favorite-manage sticker-favorite-delete";
      remove.textContent = "\u00D7";
      remove.title = `Delete ${favorite.name}`;
      remove.setAttribute("aria-label", remove.title);
      remove.addEventListener("click", () => deleteFavorite(favorite.id));
      wrapper.append(button, edit, remove);
      return wrapper;
    }

    function renderFavorites() {
      currentPath = FAVORITES_PATH;
      currentFolders = [];
      currentItems = [];
      nextPageToken = null;
      renderBreadcrumbs();
      grid.replaceChildren();
      favorites.forEach(favorite => grid.appendChild(favoriteCard(favorite)));
      if (!favorites.length) renderEmpty("Select a sticker on the board and click the star to save it here.");
      status.textContent = `${favorites.length} favorite${favorites.length === 1 ? "" : "s"}`;
    }

    function renderEmpty(message) {
      const empty = document.createElement("p");
      empty.className = "sticker-library-empty";
      empty.textContent = message;
      grid.appendChild(empty);
    }

    function renderFolder() {
      grid.replaceChildren();
      if (currentPath === rootPath) grid.appendChild(favoritesFolderCard());
      currentFolders.forEach(folder => grid.appendChild(folderCard(folder)));
      currentItems.forEach(item => grid.appendChild(assetCard(item)));
      if (!currentFolders.length && !currentItems.length && currentPath !== rootPath) renderEmpty("This folder has no supported sticker files.");
      if (nextPageToken) grid.appendChild(loadMoreButton);
      const parts = [];
      if (currentFolders.length) parts.push(`${currentFolders.length} folder${currentFolders.length === 1 ? "" : "s"}`);
      if (currentItems.length) parts.push(`${currentItems.length} sticker${currentItems.length === 1 ? "" : "s"}`);
      status.textContent = parts.join(" • ") || "Empty folder";
    }

    async function loadFolder(path, append = false) {
      if (path === FAVORITES_PATH) {
        ++navigationVersion;
        renderFavorites();
        return;
      }
      const version = append ? navigationVersion : ++navigationVersion;
      if (!append) {
        currentPath = path;
        currentFolders = [];
        currentItems = [];
        nextPageToken = null;
        renderBreadcrumbs();
        grid.replaceChildren();
        renderEmpty("Loading folder…");
      }
      loadMoreButton.disabled = true;
      status.textContent = "Loading folder…";
      try {
        const listOptions = { maxResults: 80 };
        if (append && nextPageToken) listOptions.pageToken = nextPageToken;
        const result = await storage.ref().child(path).list(listOptions);
        if (version !== navigationVersion) return;
        const foldersByPath = new Map(currentFolders.map(folder => [folder.fullPath, folder]));
        const itemsByPath = new Map(currentItems.map(item => [item.fullPath, item]));
        result.prefixes.forEach(folder => foldersByPath.set(folder.fullPath, folder));
        result.items.filter(item => MEDIA_PATTERN.test(item.name)).forEach(item => itemsByPath.set(item.fullPath, item));
        currentFolders = [...foldersByPath.values()].sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
        currentItems = [...itemsByPath.values()].sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
        nextPageToken = result.nextPageToken || null;
        renderFolder();
      } catch (error) {
        if (version === navigationVersion) {
          grid.replaceChildren();
          renderEmpty("Could not open this folder.");
          reportError(error);
        }
      } finally {
        loadMoreButton.disabled = false;
      }
    }

    function navigate(path) {
      searchInput.value = "";
      clearTimeout(searchTimer);
      loadFolder(path);
    }

    function stopSearchWorker() {
      clearTimeout(searchWorkerIdleTimer);
      searchWorkerIdleTimer = null;
      if (pendingSearches.size) return;
      searchWorker?.terminate();
      searchWorker = null;
    }

    function scheduleSearchWorkerCleanup() {
      clearTimeout(searchWorkerIdleTimer);
      searchWorkerIdleTimer = setTimeout(stopSearchWorker, 45000);
    }

    function searchWithWorker(query) {
      if (!root.Worker) return searchWithoutWorker(query);
      clearTimeout(searchWorkerIdleTimer);
      if (!searchWorker) {
        searchWorker = new root.Worker("sticker-search-worker.js?v=3");
        searchWorker.addEventListener("message", event => {
          const request = pendingSearches.get(event.data?.requestId);
          if (!request) return;
          pendingSearches.delete(event.data.requestId);
          if (event.data.error) request.reject(new Error(event.data.error));
          else request.resolve(event.data);
          if (!pendingSearches.size) scheduleSearchWorkerCleanup();
        });
        searchWorker.addEventListener("error", event => {
          const error = new Error(event.message || "The sticker search worker failed.");
          pendingSearches.forEach(request => request.reject(error));
          pendingSearches.clear();
          searchWorker?.terminate();
          searchWorker = null;
          clearTimeout(searchWorkerIdleTimer);
        });
      }
      const requestId = ++searchRequestId;
      return new Promise((resolve, reject) => {
        pendingSearches.set(requestId, { resolve, reject });
        searchWorker.postMessage({ requestId, query });
      });
    }

    async function searchWithoutWorker(query) {
      if (!fallbackCatalogPromise) {
        fallbackCatalogPromise = root.fetch("data/sticker-catalog.json?v=1", { cache: "force-cache" })
          .then(response => {
            if (!response.ok) throw new Error(`Sticker catalog request failed (${response.status})`);
            return response.json();
          })
          .then(catalog => {
            const files = catalog.files || [];
            const folders = new Set();
            files.forEach(path => {
              let separator = path.lastIndexOf("/");
              while (separator > 0) {
                folders.add(path.slice(0, separator));
                separator = path.lastIndexOf("/", separator - 1);
              }
            });
            return { files, folders: [...folders] };
          });
      }
      const { files, folders } = await fallbackCatalogPromise;
      const matches = [];
      folders.forEach(path => {
        const score = fuzzyScore(query, path);
        if (Number.isFinite(score)) matches.push({ type: "folder", path, score: score + 250 });
      });
      files.forEach(path => {
        const score = fuzzyScore(query, path);
        if (Number.isFinite(score)) matches.push({ type: "file", path, score });
      });
      return {
        count: files.length,
        folderCount: folders.length,
        results: matches
          .sort((a, b) => b.score - a.score || a.path.localeCompare(b.path, undefined, { numeric: true }))
          .slice(0, 80)
      };
    }

    async function searchLibrary(query) {
      const version = ++navigationVersion;
      grid.replaceChildren();
      renderEmpty("Loading the sticker search catalog…");
      status.textContent = "Searching 148,047 stickers…";
      try {
        const result = await searchWithWorker(query);
        if (version !== navigationVersion || normalizeSearch(searchInput.value) !== normalizeSearch(query)) return;
        grid.replaceChildren();
        result.results.forEach(match => {
          const item = storage.ref().child(`${rootPath}/${match.path}`);
          grid.appendChild(match.type === "folder" ? folderCard(item) : assetCard(item));
        });
        if (!result.results.length) renderEmpty(`No folders or stickers match “${query}”.`);
        status.textContent = result.results.length
          ? `${result.results.length}${result.results.length === 80 ? "+" : ""} best matches from ${result.count.toLocaleString()} stickers and ${result.folderCount.toLocaleString()} folders`
          : `${result.count.toLocaleString()} stickers and ${result.folderCount.toLocaleString()} folders searched`;
      } catch (error) {
        if (version === navigationVersion) {
          grid.replaceChildren();
          renderEmpty("The sticker search catalog could not be loaded.");
          reportError(error);
        }
      }
    }

    function selectAsset(item) {
      if (replacementPickerStickerId) {
        selectedStickerId = replacementPickerStickerId;
        replacementPickerStickerId = "";
        editorField("replacementPath").value = item.fullPath;
        interactionEditor.hidden = false;
        updatePlacementMode();
        renderStickerSelection();
        status.textContent = `${cleanLabel(item.name)} selected as the replacement.`;
        return;
      }
      selectedAsset = { ref: item, path: item.fullPath, name: cleanLabel(item.name), units: gridUnits(item.name) };
      const assetFolder = containingStickerFolder(item.fullPath, rootPath);
      if (assetFolder === rootPath || assetFolder.startsWith(`${rootPath}/`)) {
        currentPath = assetFolder;
        renderBreadcrumbs();
      }
      selectedStickerId = "";
      renderStickerSelection();
      updatePlacementMode();
      status.textContent = "Click anywhere on the map to place it. Click again to stamp another, or press Esc to stop.";
    }

    function selectFavorite(favorite) {
      const rootSticker = favorite.stickers.find(sticker => sticker.id === favorite.rootId) || favorite.stickers[0];
      selectedAsset = {
        favorite,
        favoriteRoot: rootSticker,
        path: rootSticker.storagePath,
        ref: rootSticker.storagePath,
        name: favorite.name,
        units: gridUnits(rootSticker.name)
      };
      selectedStickerId = "";
      renderStickerSelection();
      updatePlacementMode();
      status.textContent = `Click the map to place all ${favorite.stickers.length} sticker${favorite.stickers.length === 1 ? "" : "s"} in this favorite.`;
    }

    function cancelPlacement() {
      if (replacementPickerStickerId) {
        replacementPickerStickerId = "";
        interactionEditor.hidden = false;
        updatePlacementMode();
        renderStickerSelection();
        return;
      }
      selectedAsset = null;
      updatePlacementMode();
      renderStickerSelection();
      status.textContent = selectedStickerId
        ? "Use the on-map handles to move, scale, or rotate the sticker. Press Delete to remove it."
        : "Select a sticker or browse another folder.";
    }

    function updatePlacementMode() {
      placementLayer.classList.toggle("is-placing", Boolean(active && selectedAsset));
      renderPlacementPreview();
    }

    document.addEventListener("pointermove", event => {
      lastPlacementPointer = { x: event.clientX, y: event.clientY };
      positionPlacementPreview();
    });
    root.addEventListener?.("resize", positionPlacementPreview);

    function stickerStyle(element, sticker) {
      element.style.left = `${roundRatio(sticker.x) * 100}%`;
      element.style.top = `${roundRatio(sticker.y) * 100}%`;
      element.style.width = `${clamp(Number(sticker.widthRatio) || 0.05, 0.002, 1) * 100}%`;
      element.style.height = `${clamp(Number(sticker.heightRatio) || 0.05, 0.002, 1) * 100}%`;
      element.style.transform = `translate(-50%, -50%) rotate(${Number(sticker.rotation) || 0}deg)`;
      const duration = clamp(Number(sticker.interaction?.animation?.durationMs) || 0, 0, 10000);
      element.style.transition = duration ? `left ${duration}ms ease,top ${duration}ms ease,width ${duration}ms ease,height ${duration}ms ease,transform ${duration}ms ease` : "";
    }

    function renderTeleportOverlays() {
      if (!canEditInteractions) return;
      portalLayer.replaceChildren();
      const width = mapImage.clientWidth;
      const height = mapImage.clientHeight;
      if (!width || !height) return;
      portalLayer.setAttribute("viewBox", `0 0 ${width} ${height}`);
      const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
      defs.innerHTML = `<marker id="stickerPortalArrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto-start-reverse"><path d="M0 0 8 4 0 8z" fill="#f4d76d"/></marker>`;
      portalLayer.appendChild(defs);
      stickers.filter(sticker => sticker.interaction?.teleport || teleportPreview?.stickerId === sticker.id).forEach(sticker => {
        const teleport = teleportPreview?.stickerId === sticker.id ? teleportPreview : sticker.interaction.teleport;
        const radius = clamp(Number(teleport.radius) || 1, .25, 20) * clamp(Number(options.getGridSize?.()) || 100, 12, 1000);
        const x1 = roundRatio(sticker.x) * width, y1 = roundRatio(sticker.y) * height;
        const x2 = roundRatio(teleport.toX) * width, y2 = roundRatio(teleport.toY) * height;
        const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line.setAttribute("class", "sticker-portal-link");
        line.dataset.stickerId = sticker.id;
        line.dataset.portalPart = "link";
        line.setAttribute("x1", x1); line.setAttribute("y1", y1); line.setAttribute("x2", x2); line.setAttribute("y2", y2);
        line.setAttribute("marker-end", "url(#stickerPortalArrow)");
        if (teleport.bidirectional) line.setAttribute("marker-start", "url(#stickerPortalArrow)");
        line.addEventListener("pointerdown", event => beginTeleportDestinationDrag(event, sticker, line));
        portalLayer.appendChild(line);
        [[x1, y1, "source"], [x2, y2, "destination"]].forEach(([cx, cy, part]) => {
          const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
          circle.setAttribute("class", "sticker-portal-zone");
          circle.dataset.stickerId = sticker.id;
          circle.dataset.portalPart = `${part}-zone`;
          circle.setAttribute("cx", cx); circle.setAttribute("cy", cy); circle.setAttribute("r", radius);
          portalLayer.appendChild(circle);
        });
        const handle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        handle.setAttribute("class", "sticker-portal-destination");
        handle.dataset.stickerId = sticker.id;
        handle.dataset.portalPart = "destination-handle";
        handle.setAttribute("cx", x2); handle.setAttribute("cy", y2); handle.setAttribute("r", 10);
        handle.addEventListener("pointerdown", event => beginTeleportDestinationDrag(event, sticker, handle));
        portalLayer.appendChild(handle);
      });
    }

    function beginTeleportDestinationDrag(event, sticker, pointerTarget) {
      const teleport = teleportPreview?.stickerId === sticker.id ? teleportPreview : sticker.interaction?.teleport;
      if (!active || !canEditInteractions || event.button !== 0 || !teleport) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      teleportDragSession = {
        id: sticker.id,
        generation: boardSync.generation,
        pointerId: event.pointerId,
        pointerTarget,
        preview: teleport === teleportPreview,
        startToX: teleport.toX,
        startToY: teleport.toY,
        moved: false
      };
      pointerTarget.setPointerCapture?.(event.pointerId);
      status.textContent = "Moving teleport destination…";
    }

    function moveTeleportDestination(event) {
      if (!teleportDragSession || event.pointerId !== teleportDragSession.pointerId) return;
      const sticker = stickers.find(item => item.id === teleportDragSession.id);
      const bounds = mapImage.getBoundingClientRect();
      const teleport = teleportDragSession.preview ? teleportPreview : sticker?.interaction?.teleport;
      if (!sticker || !teleport || !bounds.width || !bounds.height) return;
      event.preventDefault();
      const toX = roundRatio((event.clientX - bounds.left) / bounds.width);
      const toY = roundRatio((event.clientY - bounds.top) / bounds.height);
      teleportDragSession.moved ||= toX !== teleportDragSession.startToX || toY !== teleportDragSession.startToY;
      if (teleportDragSession.preview) {
        teleportPreview = { ...teleportPreview, toX, toY };
        editorField("teleportToX").value = toX;
        editorField("teleportToY").value = toY;
        updateTeleportEditorStatus();
      } else {
        sticker.interaction = { ...sticker.interaction, teleport: { ...sticker.interaction.teleport, toX, toY } };
        localOverrides.set(sticker.id, { ...sticker });
      }
      const line = portalLayer.querySelector(`[data-sticker-id="${sticker.id}"][data-portal-part="link"]`);
      const zone = portalLayer.querySelector(`[data-sticker-id="${sticker.id}"][data-portal-part="destination-zone"]`);
      const handle = portalLayer.querySelector(`[data-sticker-id="${sticker.id}"][data-portal-part="destination-handle"]`);
      const x = toX * mapImage.clientWidth;
      const y = toY * mapImage.clientHeight;
      line?.setAttribute("x2", x); line?.setAttribute("y2", y);
      zone?.setAttribute("cx", x); zone?.setAttribute("cy", y);
      handle?.setAttribute("cx", x); handle?.setAttribute("cy", y);
    }

    async function endTeleportDestinationDrag(event) {
      if (!teleportDragSession || event.pointerId !== teleportDragSession.pointerId) return;
      const session = teleportDragSession;
      teleportDragSession = null;
      session.pointerTarget.releasePointerCapture?.(event.pointerId);
      const sticker = stickers.find(item => item.id === session.id);
      if (session.preview) {
        status.textContent = "Teleport destination updated. Save the interaction to apply it.";
        return;
      }
      if (!session.moved || !sticker?.interaction?.teleport || session.generation !== boardSync.generation) {
        localOverrides.delete(session.id);
        return;
      }
      try {
        await boardSync.patchStickers(new Map([[sticker.id, { interaction: sticker.interaction }]]), session.generation);
        localOverrides.delete(sticker.id);
        status.textContent = "Teleport destination updated.";
      } catch (error) {
        sticker.interaction = { ...sticker.interaction, teleport: { ...sticker.interaction.teleport, toX: session.startToX, toY: session.startToY } };
        localOverrides.delete(sticker.id);
        renderTeleportOverlays();
        reportError(error);
        boardSync.reconcile().catch(() => {});
      }
    }

    portalLayer.addEventListener("pointermove", moveTeleportDestination);
    portalLayer.addEventListener("pointerup", endTeleportDestinationDrag);
    portalLayer.addEventListener("pointercancel", endTeleportDestinationDrag);

    function rollLootExpression(expression) {
      const match = String(expression || "").match(/^(\d+)d(\d+)(?:\*(\d+))?$/);
      if (!match) return expression;
      let total = 0;
      for (let index = 0; index < Number(match[1]); index++) total += Math.floor(Math.random() * Number(match[2])) + 1;
      return total * (Number(match[3]) || 1);
    }

    function cleanLootItem(value) {
      return String(value || "").replace(/{@item (.*?)}/g, "$1");
    }

    function rollLootList(tables, type, amount, magic = false) {
      const table = tables.find(item => item.type === type);
      if (!table) return ["Unknown item"];
      const results = [];
      for (let index = 0; index < Number(rollLootExpression(amount)); index++) {
        if (!magic) results.push(cleanLootItem(table.table[Math.floor(Math.random() * table.table.length)]));
        else {
          const roll = Math.floor(Math.random() * 100) + 1;
          const entry = table.table.find(item => roll >= item.min && roll <= item.max);
          const choice = entry?.item || entry?.choose?.fromGeneric?.[Math.floor(Math.random() * (entry?.choose?.fromGeneric?.length || 1))];
          results.push(cleanLootItem(choice || "Unknown item"));
        }
      }
      return results;
    }

    async function rollStickerLoot(settings) {
      lootDataPromise ||= fetch("data/api_data/loot.json").then(response => {
        if (!response.ok) throw new Error("Loot data could not be loaded.");
        return response.json();
      });
      const data = await lootDataPromise;
      const cr = clamp(Number(settings.cr) || 0, 0, 30);
      if (settings.type !== "hoard") {
        const table = data.individual.find(item => cr >= item.crMin && cr <= item.crMax);
        if (!table) return `No individual loot table found for CR ${cr}.`;
        const roll = Math.floor(Math.random() * 100) + 1;
        const entry = table.table.find(item => roll >= item.min && roll <= item.max);
        const coins = Object.entries(entry?.coins || {}).map(([coin, expression]) => `${coin}: ${rollLootExpression(expression)}`);
        return `Individual Treasure (CR ${cr})\nd100 Roll: ${roll}\n${coins.join("\n") || "No coins."}`;
      }
      const table = data.hoard.find(item => cr >= item.crMin && cr <= item.crMax);
      if (!table) return `No hoard table found for CR ${cr}.`;
      let result = `Treasure Hoard (CR ${cr})\n\nCoins:\n${Object.entries(table.coins || {}).map(([coin, expression]) => `${coin}: ${rollLootExpression(expression)}`).join("\n")}`;
      const roll = Math.floor(Math.random() * 100) + 1;
      const entry = table.table.find(item => roll >= item.min && roll <= item.max) || {};
      result += `\n\nHoard d100 Roll: ${roll}`;
      if (entry.gems) result += `\n\nGems (${entry.gems.type} gp):\n- ${rollLootList(data.gems, entry.gems.type, entry.gems.amount).join("\n- ")}`;
      if (entry.artObjects) result += `\n\nArt Objects (${entry.artObjects.type} gp):\n- ${rollLootList(data.artObjects, entry.artObjects.type, entry.artObjects.amount).join("\n- ")}`;
      if (entry.magicItems) {
        result += "\n\nMagic Items:";
        entry.magicItems.forEach(item => { result += `\nTable ${item.type}:\n- ${rollLootList(data.magicItems, item.type, item.amount, true).join("\n- ")}`; });
      }
      return result;
    }

    async function playStickerSound(stickerId, sound) {
      let src = sound.src;
      if (!/^(?:https?:|data:|blob:|\/)/i.test(src) && !src.startsWith("data/")) src = await resolveUrl(src);
      if (typeof options.publishSoundEffect === "function") {
        await options.publishSoundEffect(src, { loop: Boolean(sound.loop), channelId: `sticker:${stickerId}` });
        return;
      }
      const existing = loopingSounds.get(stickerId);
      if (existing) {
        existing.pause(); existing.removeAttribute("src"); loopingSounds.delete(stickerId);
        if (sound.loop) return;
      }
      const audio = new Audio(src);
      audio.loop = Boolean(sound.loop);
      audio.volume = clamp(Number(options.getSoundVolume?.()) || 1, 0, 1);
      if (sound.loop) loopingSounds.set(stickerId, audio);
      audio.addEventListener("ended", () => loopingSounds.delete(stickerId), { once: true });
      await audio.play();
    }

    async function animateSticker(sticker, element, animation) {
      const activeState = Boolean(animation.active);
      const effects = animation.effects || { [animation.kind || "rotate"]: true };
      let fields = {};
      let restoreState = animation.restoreState || null;
      if (activeState && restoreState) {
        fields = {
          x: restoreState.x,
          y: restoreState.y,
          widthRatio: restoreState.widthRatio,
          heightRatio: restoreState.heightRatio,
          rotation: restoreState.rotation,
          storagePath: restoreState.storagePath
        };
        restoreState = null;
      } else {
        const direction = activeState ? -1 : 1;
        if (!activeState) {
          restoreState = {
            x: sticker.x,
            y: sticker.y,
            widthRatio: sticker.widthRatio,
            heightRatio: sticker.heightRatio,
            rotation: sticker.rotation,
            storagePath: sticker.storagePath
          };
        }
        if (effects.rotate) {
          const currentAngle = (Number(sticker.rotation) || 0) * Math.PI / 180;
          const rotationDelta = direction * (Number(animation.rotationDegrees) || 0);
          const nextAngle = currentAngle + rotationDelta * Math.PI / 180;
          const originX = clamp(Number(animation.rotationOriginX ?? .5), 0, 1);
          const originY = clamp(Number(animation.rotationOriginY ?? .5), 0, 1);
          const offsetX = (originX - .5) * (Number(sticker.widthRatio) || .05) * mapImage.clientWidth;
          const offsetY = (originY - .5) * (Number(sticker.heightRatio) || .05) * mapImage.clientHeight;
          const rotateOffset = angle => ({
            x: offsetX * Math.cos(angle) - offsetY * Math.sin(angle),
            y: offsetX * Math.sin(angle) + offsetY * Math.cos(angle)
          });
          const before = rotateOffset(currentAngle);
          const after = rotateOffset(nextAngle);
          fields.x = roundRatio((Number(sticker.x) || 0) + (before.x - after.x) / Math.max(1, mapImage.clientWidth));
          fields.y = roundRatio((Number(sticker.y) || 0) + (before.y - after.y) / Math.max(1, mapImage.clientHeight));
          fields.rotation = Number(((Number(sticker.rotation) || 0) + rotationDelta).toFixed(2));
        }
        if (effects.translate) {
          fields.x = roundRatio((fields.x ?? (Number(sticker.x) || 0)) + direction * (Number(animation.translateX) || 0) * (Number(options.getGridSize?.()) || 100) / Math.max(1, mapImage.clientWidth));
          fields.y = roundRatio((fields.y ?? (Number(sticker.y) || 0)) + direction * (Number(animation.translateY) || 0) * (Number(options.getGridSize?.()) || 100) / Math.max(1, mapImage.clientHeight));
        }
        if (effects.scale) {
          const factor = animation.scalePercent != null
            ? clamp(1 + Number(animation.scalePercent) / 100, .1, 10)
            : clamp(Number(animation.scaleFactor) || 1, .1, 10);
          fields.widthRatio = clamp((Number(sticker.widthRatio) || .05) * (activeState ? 1 / factor : factor), .002, 1);
          fields.heightRatio = clamp((Number(sticker.heightRatio) || .05) * (activeState ? 1 / factor : factor), .002, 1);
        }
        if (effects.replace && animation.replacementPath) fields.storagePath = activeState ? animation.originalPath : animation.replacementPath;
      }
      const interaction = { ...sticker.interaction, animation: { ...animation, effects, active: !activeState, restoreState } };
      Object.assign(sticker, fields, { interaction });
      stickerStyle(element, sticker);
      if (fields.storagePath) {
        const media = mediaElement(fields.storagePath);
        element.replaceChildren(media);
        media.src = await resolveUrl(fields.storagePath);
      }
      await boardSync.patchStickers(new Map([[sticker.id, { ...fields, interaction }]]), boardSync.generation);
      renderTeleportOverlays();
    }

    async function runStickerInteraction(sticker, element) {
      const interaction = sticker.interaction;
      if (!interaction) return;
      if (interaction.animation) animateSticker(sticker, element, interaction.animation).catch(reportError);
      if (interaction.sound) {
        try { await playStickerSound(sticker.id, interaction.sound); }
        catch (error) { reportError(error); }
      }
      if (interaction.loot) rollStickerLoot(interaction.loot).then(result => {
        lootPopup.querySelector("textarea").value = result;
        lootPopup.hidden = false;
      }).catch(reportError);
    }

    async function runStickerInteractionTree(rootSticker) {
      const visited = new Set();
      const visit = async sticker => {
        if (!sticker || visited.has(sticker.id)) return;
        visited.add(sticker.id);
        const linkedIds = [...(sticker.interaction?.linkedStickerIds || [])];
        const element = [...layer.querySelectorAll(".map-sticker")].find(item => item.dataset.stickerId === sticker.id);
        await runStickerInteraction(sticker, element);
        for (const id of linkedIds) await visit(stickers.find(item => item.id === id));
      };
      await visit(rootSticker);
    }

    function renderStickerSelection() {
      layer.querySelectorAll(".map-sticker").forEach(element => {
        element.classList.toggle("is-selected", element.dataset.stickerId === selectedStickerId && active && !selectedAsset);
      });
      rigLayer.replaceChildren();
      const selected = active && !selectedAsset && stickers.find(sticker => sticker.id === selectedStickerId);
      interactionButton.disabled = !selected;
      favoriteButton.disabled = !selected;
      favoriteButton.textContent = selected && favorites.some(favorite => favorite.rootId === selected.id) ? "\u2605" : "\u2606";
      if (!selected) return;

      const rig = document.createElement("div");
      rig.className = "map-sticker-transform-rig";
      rig.dataset.stickerId = selected.id;
      stickerStyle(rig, selected);

      const rotationGuide = document.createElement("span");
      rotationGuide.className = "sticker-rig-rotation-guide";
      rig.appendChild(rotationGuide);

      const addHandle = (className, label, mode, corner = "") => {
        const handle = document.createElement("button");
        handle.type = "button";
        handle.className = `sticker-rig-handle ${className}`;
        handle.setAttribute("aria-label", label);
        handle.title = label;
        if (corner) handle.dataset.corner = corner;
        handle.addEventListener("pointerdown", event => beginStickerTransform(event, selected, handle, mode));
        rig.appendChild(handle);
      };
      addHandle("sticker-rig-rotate", "Rotate sticker", "rotate");
      ["nw", "ne", "se", "sw"].forEach(corner => addHandle("sticker-rig-scale", "Scale sticker", "scale", corner));
      addHandle("sticker-rig-move", "Move sticker", "move");
      if (!interactionEditor.hidden) {
        const origin = document.createElement("button");
        origin.type = "button";
        origin.className = "sticker-rig-handle sticker-rig-origin";
        origin.setAttribute("aria-label", "Move animation rotation point");
        origin.title = "Drag to set the animation rotation point";
        origin.style.left = `${clamp(Number(editorField("rotationOriginX").value) || 0, 0, 100)}%`;
        origin.style.top = `${clamp(Number(editorField("rotationOriginY").value) || 0, 0, 100)}%`;
        origin.addEventListener("pointerdown", event => beginStickerTransform(event, selected, origin, "animation-origin"));
        rig.appendChild(origin);
      }
      rigLayer.appendChild(rig);
    }

    function renderStickers() {
      const liveIds = new Set(stickers.map(sticker => sticker.id));
      const upstreamIds = new Set(stickers.flatMap(sticker => sticker.interaction?.linkedStickerIds || []));
      stickerElements.forEach((element, id) => {
        if (liveIds.has(id)) return;
        const video = element.querySelector("video");
        if (video) { videoVisibilityObserver?.unobserve(video); video.pause(); video.removeAttribute("src"); }
        element.remove();
        stickerElements.delete(id);
      });
      stickers.forEach((sticker, desiredIndex) => {
        const hasUpstreamTrigger = upstreamIds.has(sticker.id);
        const directlyTriggerable = hasStickerInteraction(sticker) && !hasUpstreamTrigger;
        let element = stickerElements.get(sticker.id);
        if (!element) {
          element = document.createElement("div");
          element.className = "map-sticker";
          element.dataset.stickerId = sticker.id;
          element.addEventListener("pointerdown", event => beginStickerDrag(event, element._sticker, element));
          element.addEventListener("click", event => {
            const directlyTriggerable = element.dataset.directlyTriggerable === "true";
            if (active || dragSession || !directlyTriggerable) return;
            event.preventDefault();
            event.stopPropagation();
            runStickerInteractionTree(element._sticker).catch(reportError);
          });
          stickerElements.set(sticker.id, element);
        }
        element._sticker = sticker;
        element.classList.toggle("is-interactive", directlyTriggerable);
        element.classList.toggle("show-interaction-marker", canEditInteractions && hasStickerInteraction(sticker));
        element.classList.toggle("has-upstream-trigger", hasUpstreamTrigger);
        element.dataset.directlyTriggerable = String(directlyTriggerable);
        element.title = `${cleanLabel(sticker.name || "Map sticker")}${hasUpstreamTrigger ? " — triggered by another sticker" : hasStickerInteraction(sticker) ? " — interactive" : ""}`;
        stickerStyle(element, sticker);
        if (element.dataset.storagePath !== sticker.storagePath) {
          const previousVideo = element.querySelector("video");
          if (previousVideo) { videoVisibilityObserver?.unobserve(previousVideo); previousVideo.pause(); }
          const media = mediaElement(sticker.storagePath);
          element.replaceChildren(media);
          element.dataset.storagePath = sticker.storagePath;
          delete element.dataset.loadError;
          resolveUrl(sticker.storagePath).then(url => {
            if (element.isConnected && element.dataset.storagePath === sticker.storagePath) media.src = url;
          }).catch(error => {
            element.dataset.loadError = "true";
            console.warn(`Could not load sticker ${sticker.storagePath}:`, error);
          });
        }
        if (layer.children[desiredIndex] !== element) layer.insertBefore(element, layer.children[desiredIndex] || null);
      });
      renderStickerSelection();
      renderTeleportOverlays();
    }

    function beginStickerDrag(event, sticker, element) {
      beginStickerTransform(event, sticker, element, "move");
    }

    function beginStickerTransform(event, sticker, pointerTarget, mode) {
      if (!active || selectedAsset || event.button !== 0) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      const selectionChanged = selectedStickerId !== sticker.id;
      const editorWasOpen = !interactionEditor.hidden;
      selectedStickerId = sticker.id;
      if (selectionChanged) {
        renderStickerSelection();
        if (editorWasOpen) openInteractionEditor();
      }
      const bounds = layer.getBoundingClientRect();
      if (!bounds.width || !bounds.height) return;
      const centerClientX = bounds.left + (Number(sticker.x) || 0) * bounds.width;
      const centerClientY = bounds.top + (Number(sticker.y) || 0) * bounds.height;
      dragSession = {
        id: sticker.id,
        mode,
        generation: boardSync.generation,
        pointerId: event.pointerId,
        startClientX: event.clientX,
        startClientY: event.clientY,
        startX: Number(sticker.x) || 0,
        startY: Number(sticker.y) || 0,
        startWidth: Number(sticker.widthRatio) || 0.05,
        startHeight: Number(sticker.heightRatio) || 0.05,
        startRotation: Number(sticker.rotation) || 0,
        startDistance: Math.max(1, Math.hypot(event.clientX - centerClientX, event.clientY - centerClientY)),
        startAngle: Math.atan2(event.clientY - centerClientY, event.clientX - centerClientX),
        centerClientX,
        centerClientY,
        bounds,
        moved: false,
        pointerTarget
      };
      pointerTarget.setPointerCapture?.(event.pointerId);
      status.textContent = mode === "move" ? "Moving sticker…" : mode === "scale" ? "Scaling sticker…" : mode === "animation-origin" ? "Moving animation rotation point…" : "Rotating sticker…";
    }

    function moveStickerDrag(event) {
      if (!dragSession || event.pointerId !== dragSession.pointerId || dragSession.generation !== boardSync.generation) return;
      event.preventDefault();
      const sticker = stickers.find(item => item.id === dragSession.id);
      if (!sticker || !dragSession.bounds.width || !dragSession.bounds.height) return;
      const pointerTravel = Math.hypot(event.clientX - dragSession.startClientX, event.clientY - dragSession.startClientY);
      dragSession.moved ||= pointerTravel > 2;
      if (dragSession.mode === "animation-origin") {
        const angle = -(dragSession.startRotation * Math.PI / 180);
        const screenX = event.clientX - dragSession.centerClientX;
        const screenY = event.clientY - dragSession.centerClientY;
        const localX = screenX * Math.cos(angle) - screenY * Math.sin(angle);
        const localY = screenX * Math.sin(angle) + screenY * Math.cos(angle);
        const originX = clamp(.5 + localX / Math.max(1, dragSession.startWidth * dragSession.bounds.width), 0, 1);
        const originY = clamp(.5 + localY / Math.max(1, dragSession.startHeight * dragSession.bounds.height), 0, 1);
        editorField("rotationOriginX").value = (originX * 100).toFixed(1).replace(/\.0$/, "");
        editorField("rotationOriginY").value = (originY * 100).toFixed(1).replace(/\.0$/, "");
        const handle = rigLayer.querySelector(".sticker-rig-origin");
        if (handle) { handle.style.left = `${originX * 100}%`; handle.style.top = `${originY * 100}%`; }
        return;
      } else if (dragSession.mode === "move") {
        const dx = (event.clientX - dragSession.startClientX) / dragSession.bounds.width;
        const dy = (event.clientY - dragSession.startClientY) / dragSession.bounds.height;
        const halfWidth = (Number(sticker.widthRatio) || 0.05) / 2;
        const halfHeight = (Number(sticker.heightRatio) || 0.05) / 2;
        sticker.x = roundRatio(clamp(dragSession.startX + dx, halfWidth, 1 - halfWidth));
        sticker.y = roundRatio(clamp(dragSession.startY + dy, halfHeight, 1 - halfHeight));
      } else if (dragSession.mode === "scale") {
        const distance = Math.hypot(event.clientX - dragSession.centerClientX, event.clientY - dragSession.centerClientY);
        const requestedScale = distance / dragSession.startDistance;
        const minScale = Math.max(0.004 / dragSession.startWidth, 0.004 / dragSession.startHeight);
        const maxScale = Math.max(minScale, Math.min(
          1 / dragSession.startWidth,
          1 / dragSession.startHeight,
          (2 * Math.min(dragSession.startX, 1 - dragSession.startX)) / dragSession.startWidth,
          (2 * Math.min(dragSession.startY, 1 - dragSession.startY)) / dragSession.startHeight
        ));
        const scale = clamp(requestedScale, minScale, maxScale);
        sticker.widthRatio = Number((dragSession.startWidth * scale).toFixed(5));
        sticker.heightRatio = Number((dragSession.startHeight * scale).toFixed(5));
      } else if (dragSession.mode === "rotate") {
        const angle = Math.atan2(event.clientY - dragSession.centerClientY, event.clientX - dragSession.centerClientX);
        sticker.rotation = Number(((dragSession.startRotation + (angle - dragSession.startAngle) * 180 / Math.PI + 360) % 360).toFixed(2));
      }
      localOverrides.set(sticker.id, { ...sticker });
      const stickerElement = [...layer.querySelectorAll(".map-sticker")].find(element => element.dataset.stickerId === sticker.id);
      const rigElement = [...rigLayer.querySelectorAll(".map-sticker-transform-rig")].find(element => element.dataset.stickerId === sticker.id);
      if (stickerElement) stickerStyle(stickerElement, sticker);
      if (rigElement) stickerStyle(rigElement, sticker);
    }

    async function endStickerDrag(event) {
      if (!dragSession || event.pointerId !== dragSession.pointerId) return;
      const session = dragSession;
      dragSession = null;
      session.pointerTarget.releasePointerCapture?.(event.pointerId);
      if (!session.moved || session.generation !== boardSync.generation) {
        localOverrides.delete(session.id);
        return;
      }
      const sticker = stickers.find(item => item.id === session.id);
      if (!sticker) return;
      if (session.mode === "animation-origin") {
        status.textContent = "Rotation point set. Save the interaction to apply it.";
        return;
      }
      const fields = session.mode === "move"
        ? { x: sticker.x, y: sticker.y }
        : session.mode === "scale"
          ? { widthRatio: sticker.widthRatio, heightRatio: sticker.heightRatio }
          : { rotation: sticker.rotation };
      try {
        await boardSync.patchStickers(new Map([[sticker.id, fields]]), session.generation);
        localOverrides.delete(sticker.id);
        status.textContent = "Use the on-map handles to move, scale, or rotate the sticker. Press Delete to remove it.";
      } catch (error) {
        localOverrides.delete(sticker.id);
        reportError(error);
        boardSync.reconcile().catch(() => {});
      }
    }

    layer.addEventListener("pointermove", moveStickerDrag);
    layer.addEventListener("pointerup", endStickerDrag);
    layer.addEventListener("pointercancel", endStickerDrag);
    rigLayer.addEventListener("pointermove", moveStickerDrag);
    rigLayer.addEventListener("pointerup", endStickerDrag);
    rigLayer.addEventListener("pointercancel", endStickerDrag);

    async function placeStickerAtPointer(event) {
      if (!active || !selectedAsset || event.button !== 0) return;
      event.preventDefault();
      event.stopPropagation();
      const asset = selectedAsset;
      const bounds = mapImage.getBoundingClientRect();
      if (!bounds.width || !bounds.height) return;
      if (asset.favorite) {
        const rootSticker = asset.favoriteRoot;
        const rootWidth = clamp(Number(rootSticker.widthRatio) || .05, .004, 1);
        const rootHeight = clamp(Number(rootSticker.heightRatio) || .05, .004, 1);
        const x = roundRatio(clamp((event.clientX - bounds.left) / bounds.width, rootWidth / 2, 1 - rootWidth / 2));
        const y = roundRatio(clamp((event.clientY - bounds.top) / bounds.height, rootHeight / 2, 1 - rootHeight / 2));
        const placed = instantiateStickerFavorite(asset.favorite, x, y);
        status.textContent = `Placing ${asset.name}\u2026`;
        try {
          if (typeof boardSync.addStickers === "function") await boardSync.addStickers(placed, boardSync.generation);
          else for (const sticker of placed) await boardSync.addSticker(sticker, boardSync.generation);
          status.textContent = `${asset.name} placed (${placed.length} sticker${placed.length === 1 ? "" : "s"}).`;
        } catch (error) {
          const ids = placed.map(sticker => sticker.id);
          boardSync.removeStickers(ids, boardSync.generation).catch(() => {});
          reportError(error);
        }
        return;
      }
      const gridSize = clamp(Number(options.getGridSize?.()) || 100, 12, 1000);
      const dimensions = mediaDimensions.get(asset.path);
      let widthPixels = gridSize * asset.units.width;
      let heightPixels = gridSize * asset.units.height;
      if (!asset.units.explicit && dimensions?.width && dimensions?.height) {
        heightPixels = widthPixels * dimensions.height / dimensions.width;
      }
      const widthRatio = clamp(widthPixels / mapImage.clientWidth, 0.004, 1);
      const heightRatio = clamp(heightPixels / mapImage.clientHeight, 0.004, 1);
      const sticker = {
        id: makeId(),
        name: asset.name,
        storagePath: asset.path,
        x: roundRatio(clamp((event.clientX - bounds.left) / bounds.width, widthRatio / 2, 1 - widthRatio / 2)),
        y: roundRatio(clamp((event.clientY - bounds.top) / bounds.height, heightRatio / 2, 1 - heightRatio / 2)),
        widthRatio: Number(widthRatio.toFixed(5)),
        heightRatio: Number(heightRatio.toFixed(5)),
        rotation: 0
      };
      status.textContent = `Placing ${asset.name}…`;
      try {
        await boardSync.addSticker(sticker, boardSync.generation);
        status.textContent = `${asset.name} placed. Click again to add another.`;
      } catch (error) {
        reportError(error);
      }
    }

    function captureTeleportDestination(event) {
      if (!teleportDestinationStickerId || event.button !== 0) return false;
      const sticker = stickers.find(item => item.id === teleportDestinationStickerId);
      if (!sticker) { teleportDestinationStickerId = ""; return false; }
      const bounds = mapImage.getBoundingClientRect();
      if (!bounds.width || !bounds.height) return false;
      event.preventDefault();
      event.stopImmediatePropagation();
      editorField("teleportToX").value = roundRatio((event.clientX - bounds.left) / bounds.width);
      editorField("teleportToY").value = roundRatio((event.clientY - bounds.top) / bounds.height);
      teleportDestinationStickerId = "";
      updateTeleportEditorStatus();
      interactionEditor.hidden = false;
      updatePlacementMode();
      syncTeleportPreviewFromEditor();
      renderStickerSelection();
      status.textContent = "Teleport destination set. Save the interaction to apply it.";
      return true;
    }

    // Capture before map pan/drawing handlers so placement always owns this pointer gesture.
    mapTransformLayer.addEventListener("pointerdown", event => captureTeleportDestination(event), true);
    mapTransformLayer.addEventListener("pointerdown", placeStickerAtPointer, true);
    mapTransformLayer.addEventListener("pointerdown", event => {
      if (!active || selectedAsset || !selectedStickerId) return;
      if (event.target.closest?.(".map-sticker,.map-sticker-transform-rig")) return;
      selectedStickerId = "";
      renderStickerSelection();
    }, true);
    mapTransformLayer.addEventListener("mousedown", event => {
      if (!active || !selectedAsset || event.button !== 0) return;
      event.preventDefault();
      event.stopPropagation();
    }, true);

    async function deleteSelected() {
      const id = selectedStickerId;
      if (!id) return;
      const removed = stickers.find(item => item.id === id);
      selectedStickerId = "";
      closeInteractionEditor();
      const index = stickers.findIndex(item => item.id === id);
      if (index >= 0) stickers.splice(index, 1);
      renderStickers();
      try {
        await boardSync.removeStickers([id], boardSync.generation);
        status.textContent = "Sticker removed.";
      } catch (error) {
        if (removed && !stickers.some(item => item.id === id)) stickers.push(removed);
        renderStickers();
        reportError(error);
      }
    }

    loadMoreButton.addEventListener("click", () => loadFolder(currentPath, true));
    searchInput.addEventListener("input", () => {
      clearTimeout(searchTimer);
      const query = searchInput.value.trim();
      searchTimer = setTimeout(() => {
        if (query) searchLibrary(query);
        else loadFolder(currentPath);
      }, 220);
    });
    document.addEventListener("keydown", event => {
      if (event.key === "Escape" && teleportDestinationStickerId) {
        event.preventDefault();
        event.stopImmediatePropagation();
        teleportDestinationStickerId = "";
        interactionEditor.hidden = false;
        updateTeleportEditorStatus();
        renderStickerSelection();
        status.textContent = "Teleport destination selection canceled.";
        return;
      }
      if (event.key === "Escape" && replacementPickerStickerId) {
        event.preventDefault();
        event.stopImmediatePropagation();
        replacementPickerStickerId = "";
        updatePlacementMode();
        renderStickerSelection();
        status.textContent = "Replacement selection canceled.";
        return;
      }
      if (event.key === "Escape" && selectedAsset) {
        event.preventDefault();
        event.stopImmediatePropagation();
        cancelPlacement();
        return;
      }
      if (event.key === "Escape" && active) {
        event.preventDefault();
        event.stopImmediatePropagation();
        requestPanelClose();
        return;
      }
      const tag = String(event.target?.tagName || "").toLowerCase();
      if (!active || !selectedStickerId || (event.key !== "Delete" && event.key !== "Backspace") || tag === "input" || tag === "textarea" || event.target?.isContentEditable) return;
      event.preventDefault();
      event.stopPropagation();
      deleteSelected();
    });

    boardSync.subscribe("stickers", (nextStickers, { reset }) => {
      if (reset) {
        selectedStickerId = "";
        selectedAsset = null;
        localOverrides.clear();
        loopingSounds.forEach(audio => { audio.pause(); audio.removeAttribute("src"); });
        loopingSounds.clear();
        teleportLocks.clear();
        teleportDragSession = null;
        closeInteractionEditor();
        closeFavoriteDialog();
        updatePlacementMode();
      }
      stickers.length = 0;
      nextStickers.forEach(sticker => stickers.push(localOverrides.get(sticker.id) || sticker));
      loopingSounds.forEach((audio, id) => {
        if (stickers.some(sticker => sticker.id === id)) return;
        audio.pause();
        audio.removeAttribute("src");
        loopingSounds.delete(id);
      });
      if (selectedStickerId && !stickers.some(sticker => sticker.id === selectedStickerId)) selectedStickerId = "";
      if (!selectedStickerId) closeInteractionEditor();
      renderStickers();
    });

    if (canRunTeleports) boardSync.subscribe("tokens", nextTokens => {
      const width = mapImage.clientWidth;
      const height = mapImage.clientHeight;
      if (!width || !height) return;
      const teleported = new Set();
      stickers.filter(sticker => sticker.interaction?.teleport).forEach(sticker => {
        const teleport = sticker.interaction.teleport;
        const radiusPixels = clamp(Number(teleport.radius) || 1, .25, 20) * clamp(Number(options.getGridSize?.()) || 100, 12, 1000);
        const source = { x: sticker.x, y: sticker.y };
        const destination = { x: teleport.toX, y: teleport.toY };
        nextTokens.forEach(token => {
          if (teleported.has(token.id) || token.dragActive) return;
          const key = `${sticker.id}:${token.id}`;
          const point = { x: token.xRatio, y: token.yRatio };
          const atSource = pointInCircularRange(point, source, radiusPixels, width, height);
          const atDestination = pointInCircularRange(point, destination, radiusPixels, width, height);
          if (teleportLocks.has(key)) {
            if (!atSource && !atDestination) teleportLocks.delete(key);
            return;
          }
          const target = atSource ? destination : teleport.bidirectional && atDestination ? source : null;
          if (!target) return;
          teleportLocks.set(key, true);
          teleported.add(token.id);
          boardSync.patch(token.id, { xRatio: roundRatio(target.x), yRatio: roundRatio(target.y) }, boardSync.generation)
            .catch(error => { teleportLocks.delete(key); reportError(error); });
        });
      });
    });

    mapImage.addEventListener("load", renderTeleportOverlays);
    if (typeof ResizeObserver === "function") new ResizeObserver(renderTeleportOverlays).observe(mapImage);

    loadFavorites();
    grid.replaceChildren();
    renderEmpty("Connecting to the sticker library…");
    status.textContent = "Waiting for sign-in…";
    const authReady = !options.auth || options.auth.currentUser
      ? Promise.resolve()
      : new Promise(resolve => {
          let stopListening = () => {};
          stopListening = options.auth.onAuthStateChanged(user => {
            if (!user) return;
            stopListening();
            resolve();
          });
        });
    authReady.then(() => {
      searchInput.disabled = false;
      loadFolder(rootPath);
    }).catch(reportError);

    return {
      toolbar,
      setActive(isActive) {
        active = Boolean(isActive);
        layer.classList.toggle("is-editing", active);
        portalLayer.classList.toggle("is-editing", active);
        if (!active) {
          selectedAsset = null;
          selectedStickerId = "";
          closeInteractionEditor();
          closeFavoriteDialog();
        }
        updatePlacementMode();
        renderStickerSelection();
      },
      setTool(tool) {
        if (tool === "pan") cancelPlacement();
      },
      clearSelection() {
        selectedStickerId = "";
        closeInteractionEditor();
        renderStickerSelection();
      },
      setPanelCloseHandler(handler) {
        requestPanelClose = typeof handler === "function" ? handler : () => {};
      },
      discardLocalState() {
        dragSession = null;
        teleportDragSession = null;
        localOverrides.clear();
        selectedStickerId = "";
        selectedAsset = null;
        closeInteractionEditor();
        closeFavoriteDialog();
        updatePlacementMode();
        renderStickerSelection();
        return Promise.resolve();
      },
      updateSize() { renderStickers(); }
    };
  }

  if (typeof window !== "undefined") window.setupMapStickers = setupMapStickers;
  if (typeof module !== "undefined") module.exports = {
    cleanLabel, normalizeSearch, fuzzyScore, gridUnits, containingStickerFolder, hasStickerInteraction, pointInCircularRange,
    collectLinkedStickerTree, createStickerFavorite, instantiateStickerFavorite, hasUpstreamStickerTrigger
  };
})(typeof window === "undefined" ? globalThis : window);
