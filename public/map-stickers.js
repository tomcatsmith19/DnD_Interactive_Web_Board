(function (root) {
  const DEFAULT_ROOT = "sticker-library/v1";
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
      .map-sticker{position:absolute;display:block;padding:0;border:0;background:transparent;transform-origin:center;pointer-events:none;user-select:none;-webkit-user-select:none;touch-action:none;}
      .map-sticker-layer.is-editing .map-sticker{pointer-events:auto;cursor:grab;}
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
      .sticker-library-toolbar{width:clamp(620px,50vw,980px);max-height:min(280px,calc(100vh - 62px));padding:8px 10px;gap:5px;overflow:hidden;box-sizing:border-box;}
      .sticker-search-row{display:flex;align-items:center;gap:7px;width:100%;}
      .sticker-library-toolbar .sticker-search{flex:0 1 37.5%;min-width:120px;width:37.5%;height:34px;padding:6px 9px;box-sizing:border-box;border:1px solid #8a6643;border-radius:6px;background:#140d08;color:#fff4d6;font:14px Arial,sans-serif;outline:none;}
      .sticker-library-toolbar .sticker-search:focus{border-color:#f4d76d;box-shadow:0 0 0 2px rgba(244,215,109,.18);}
      .sticker-library-toolbar .sticker-mode-button{flex:0 0 auto;width:auto;height:34px;padding:3px 10px;white-space:nowrap;font:13px Arial,sans-serif;}
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
      .sticker-status{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0;}
      .sticker-library-toolbar .sticker-load-more{display:flex;flex:0 0 81px;width:81px;height:75px;padding:5px;align-items:center;justify-content:center;font:12px Arial,sans-serif;white-space:normal;}
      .sticker-library-empty{flex:1 0 100%;margin:30px 8px;color:#d8c7ac;text-align:center;font:14px/1.4 Arial,sans-serif;}
      @media(max-width:760px){.sticker-library-toolbar{width:calc(100vw - 12px);min-width:0;}.sticker-library-toolbar .sticker-card,.sticker-library-toolbar .sticker-load-more{flex-basis:71px;width:71px}.map-tool-tab-buttons button{min-width:70px;}}
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
    const urlCache = new Map();
    const mediaDimensions = new Map();
    const localOverrides = new Map();
    let active = false;
    let selectedAsset = null;
    let selectedStickerId = "";
    let navigationVersion = 0;
    let currentPath = rootPath;
    let currentFolders = [];
    let currentItems = [];
    let nextPageToken = null;
    let searchWorker = null;
    let searchRequestId = 0;
    let fallbackCatalogPromise = null;
    const pendingSearches = new Map();
    let searchTimer = null;
    let dragSession = null;

    const layer = document.createElement("div");
    layer.id = "mapStickerLayer";
    layer.className = "map-sticker-layer";
    mapTransformLayer.insertBefore(layer, tokenLayer);

    const placementLayer = document.createElement("div");
    placementLayer.id = "mapStickerPlacementLayer";
    placementLayer.className = "map-sticker-placement-layer";
    mapTransformLayer.appendChild(placementLayer);

    const rigLayer = document.createElement("div");
    rigLayer.id = "mapStickerRigLayer";
    rigLayer.className = "map-sticker-rig-layer";
    mapTransformLayer.appendChild(rigLayer);

    const toolbar = document.createElement("section");
    toolbar.className = "drawing-toolbar sticker-library-toolbar";
    toolbar.setAttribute("aria-label", "Map sticker library");

    const modeButton = document.createElement("button");
    modeButton.type = "button";
    modeButton.className = "sticker-mode-button";
    modeButton.textContent = "Move existing";
    modeButton.title = "Cancel placement and move stickers already on the map";

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
    searchRow.append(searchInput, breadcrumbs, modeButton);

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

    function reportError(error) {
      console.error("Map stickers:", error);
      status.textContent = error?.message || "The sticker library could not be loaded.";
      if (typeof root.reportBoardSyncError === "function") root.reportBoardSyncError(error);
    }

    function displayPath(path) {
      return String(path || "").split("/").map(cleanLabel).join(" / ");
    }

    function resolveUrl(itemOrPath) {
      const path = typeof itemOrPath === "string" ? itemOrPath : itemOrPath.fullPath;
      if (!urlCache.has(path)) {
        const ref = typeof itemOrPath === "string" ? storage.ref().child(path) : itemOrPath;
        urlCache.set(path, ref.getDownloadURL().catch(error => {
          urlCache.delete(path);
          throw error;
        }));
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
        media.preload = preview ? "metadata" : "auto";
        if (!preview) media.autoplay = true;
      } else {
        media.alt = "";
        media.loading = "lazy";
        media.decoding = "async";
        media.draggable = false;
      }
      const rememberDimensions = () => {
        const width = media.videoWidth || media.naturalWidth;
        const height = media.videoHeight || media.naturalHeight;
        if (width && height) mediaDimensions.set(path, { width, height });
      };
      media.addEventListener(media.tagName === "VIDEO" ? "loadedmetadata" : "load", rememberDimensions, { once: true });
      return media;
    }

    function renderBreadcrumbs() {
      breadcrumbs.replaceChildren();
      const relative = currentPath === rootPath ? [] : currentPath.slice(rootPath.length + 1).split("/");
      const segments = [{ label: "Stickers", path: rootPath }];
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

    function renderEmpty(message) {
      const empty = document.createElement("p");
      empty.className = "sticker-library-empty";
      empty.textContent = message;
      grid.appendChild(empty);
    }

    function renderFolder() {
      grid.replaceChildren();
      currentFolders.forEach(folder => grid.appendChild(folderCard(folder)));
      currentItems.forEach(item => grid.appendChild(assetCard(item)));
      if (!currentFolders.length && !currentItems.length) renderEmpty("This folder has no supported sticker files.");
      if (nextPageToken) grid.appendChild(loadMoreButton);
      const parts = [];
      if (currentFolders.length) parts.push(`${currentFolders.length} folder${currentFolders.length === 1 ? "" : "s"}`);
      if (currentItems.length) parts.push(`${currentItems.length} sticker${currentItems.length === 1 ? "" : "s"}`);
      status.textContent = parts.join(" • ") || "Empty folder";
    }

    async function loadFolder(path, append = false) {
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

    function searchWithWorker(query) {
      if (!root.Worker) return searchWithoutWorker(query);
      if (!searchWorker) {
        searchWorker = new root.Worker("sticker-search-worker.js?v=2");
        searchWorker.addEventListener("message", event => {
          const request = pendingSearches.get(event.data?.requestId);
          if (!request) return;
          pendingSearches.delete(event.data.requestId);
          if (event.data.error) request.reject(new Error(event.data.error));
          else request.resolve(event.data);
        });
        searchWorker.addEventListener("error", event => {
          const error = new Error(event.message || "The sticker search worker failed.");
          pendingSearches.forEach(request => request.reject(error));
          pendingSearches.clear();
          searchWorker?.terminate();
          searchWorker = null;
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

    function cancelPlacement() {
      selectedAsset = null;
      updatePlacementMode();
      renderStickerSelection();
      status.textContent = selectedStickerId
        ? "Use the on-map handles to move, scale, or rotate the sticker. Press Delete to remove it."
        : "Select a sticker or browse another folder.";
    }

    function updatePlacementMode() {
      placementLayer.classList.toggle("is-placing", Boolean(active && selectedAsset));
      modeButton.textContent = selectedAsset ? "Stop placing" : "Move existing";
    }

    function stickerStyle(element, sticker) {
      element.style.left = `${roundRatio(sticker.x) * 100}%`;
      element.style.top = `${roundRatio(sticker.y) * 100}%`;
      element.style.width = `${clamp(Number(sticker.widthRatio) || 0.05, 0.002, 1) * 100}%`;
      element.style.height = `${clamp(Number(sticker.heightRatio) || 0.05, 0.002, 1) * 100}%`;
      element.style.transform = `translate(-50%, -50%) rotate(${Number(sticker.rotation) || 0}deg)`;
    }

    function renderStickerSelection() {
      layer.querySelectorAll(".map-sticker").forEach(element => {
        element.classList.toggle("is-selected", element.dataset.stickerId === selectedStickerId && active && !selectedAsset);
      });
      rigLayer.replaceChildren();
      const selected = active && !selectedAsset && stickers.find(sticker => sticker.id === selectedStickerId);
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
      rigLayer.appendChild(rig);
    }

    function renderStickers() {
      layer.replaceChildren();
      stickers.forEach(sticker => {
        const element = document.createElement("div");
        element.className = "map-sticker";
        element.dataset.stickerId = sticker.id;
        element.title = cleanLabel(sticker.name || "Map sticker");
        stickerStyle(element, sticker);
        const media = mediaElement(sticker.storagePath);
        element.appendChild(media);
        resolveUrl(sticker.storagePath).then(url => {
          if (element.isConnected) media.src = url;
        }).catch(error => {
          element.dataset.loadError = "true";
          console.warn(`Could not load sticker ${sticker.storagePath}:`, error);
        });
        element.addEventListener("pointerdown", event => beginStickerDrag(event, sticker, element));
        layer.appendChild(element);
      });
      renderStickerSelection();
    }

    function beginStickerDrag(event, sticker, element) {
      beginStickerTransform(event, sticker, element, "move");
    }

    function beginStickerTransform(event, sticker, pointerTarget, mode) {
      if (!active || selectedAsset || event.button !== 0) return;
      event.preventDefault();
      event.stopPropagation();
      const selectionChanged = selectedStickerId !== sticker.id;
      selectedStickerId = sticker.id;
      if (selectionChanged) renderStickerSelection();
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
      status.textContent = mode === "move" ? "Moving sticker…" : mode === "scale" ? "Scaling sticker…" : "Rotating sticker…";
    }

    function moveStickerDrag(event) {
      if (!dragSession || event.pointerId !== dragSession.pointerId || dragSession.generation !== boardSync.generation) return;
      event.preventDefault();
      const sticker = stickers.find(item => item.id === dragSession.id);
      if (!sticker || !dragSession.bounds.width || !dragSession.bounds.height) return;
      const pointerTravel = Math.hypot(event.clientX - dragSession.startClientX, event.clientY - dragSession.startClientY);
      dragSession.moved ||= pointerTravel > 2;
      if (dragSession.mode === "move") {
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

    // Capture before map pan/drawing handlers so placement always owns this pointer gesture.
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

    modeButton.addEventListener("click", cancelPlacement);
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
      if (event.key === "Escape" && selectedAsset) {
        cancelPlacement();
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
        updatePlacementMode();
      }
      stickers.length = 0;
      nextStickers.forEach(sticker => stickers.push(localOverrides.get(sticker.id) || sticker));
      if (selectedStickerId && !stickers.some(sticker => sticker.id === selectedStickerId)) selectedStickerId = "";
      renderStickers();
    });

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
        if (!active) {
          selectedAsset = null;
          selectedStickerId = "";
        }
        updatePlacementMode();
        renderStickerSelection();
      },
      setTool(tool) {
        if (tool === "pan") cancelPlacement();
      },
      clearSelection() {
        selectedStickerId = "";
        renderStickerSelection();
      },
      discardLocalState() {
        dragSession = null;
        localOverrides.clear();
        selectedStickerId = "";
        selectedAsset = null;
        updatePlacementMode();
        renderStickerSelection();
        return Promise.resolve();
      },
      updateSize() { renderStickers(); }
    };
  }

  if (typeof window !== "undefined") window.setupMapStickers = setupMapStickers;
  if (typeof module !== "undefined") module.exports = { cleanLabel, normalizeSearch, fuzzyScore, gridUnits, containingStickerFolder };
})(typeof window === "undefined" ? globalThis : window);
