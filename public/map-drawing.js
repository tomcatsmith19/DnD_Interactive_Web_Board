(function () {
  const SVG_NS = "http://www.w3.org/2000/svg";

  function roundRatio(value) {
    return Number(Math.min(1, Math.max(0, value)).toFixed(4));
  }

  function roundPixels(value) {
    return Number(value.toFixed(2));
  }

  function createSvgElement(tagName, attributes) {
    const element = document.createElementNS(SVG_NS, tagName);
    Object.entries(attributes || {}).forEach(([key, value]) => {
      element.setAttribute(key, value);
    });
    return element;
  }

  function generateDrawingId() {
    return `drawing_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  }

  function cloneDrawing(drawing) {
    return JSON.parse(JSON.stringify(drawing));
  }

  function translateDrawing(drawing, dx, dy) {
    const movePoint = point => ({ x: roundRatio(point.x + dx), y: roundRatio(point.y + dy) });
    const moved = cloneDrawing(drawing);
    if (Array.isArray(moved.points)) moved.points = moved.points.map(movePoint);
    if (moved.start) moved.start = movePoint(moved.start);
    if (moved.end) moved.end = movePoint(moved.end);
    if (moved.widthPoint) moved.widthPoint = movePoint(moved.widthPoint);
    return moved;
  }

  function distanceBetweenPoints(a, b) {
    return Math.hypot(a.x - b.x, a.y - b.y);
  }

  function rotatePoint(point, pivot, degrees) {
    const radians = Number(degrees || 0) * Math.PI / 180;
    const cosine = Math.cos(radians), sine = Math.sin(radians);
    const dx = point.x - pivot.x, dy = point.y - pivot.y;
    return { x: pivot.x + dx * cosine - dy * sine, y: pivot.y + dx * sine + dy * cosine };
  }

  function boundsCentroid(points) {
    if (!points.length) return { x: 0, y: 0 };
    return {
      x: (Math.min(...points.map(point => point.x)) + Math.max(...points.map(point => point.x))) / 2,
      y: (Math.min(...points.map(point => point.y)) + Math.max(...points.map(point => point.y))) / 2
    };
  }

  function shouldIgnoreMapDeleteTarget(target) {
    if (!target) return false;
    if (target.isContentEditable) return true;
    const tagName = String(target.tagName || "").toLowerCase();
    if (tagName === "textarea" || tagName === "select") return true;
    return tagName === "input" && String(target.type || "text").toLowerCase() !== "color";
  }

  function distancePointToSegment(point, start, end) {
    const segmentDx = end.x - start.x;
    const segmentDy = end.y - start.y;
    const segmentLengthSquared = segmentDx * segmentDx + segmentDy * segmentDy;

    if (segmentLengthSquared === 0) {
      return distanceBetweenPoints(point, start);
    }

    const projection = ((point.x - start.x) * segmentDx + (point.y - start.y) * segmentDy) / segmentLengthSquared;
    const t = Math.max(0, Math.min(1, projection));
    const projectedPoint = {
      x: start.x + t * segmentDx,
      y: start.y + t * segmentDy
    };

    return distanceBetweenPoints(point, projectedPoint);
  }

  function isPointInPolygon(point, polygon) {
    let isInside = false;

    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const xi = polygon[i].x;
      const yi = polygon[i].y;
      const xj = polygon[j].x;
      const yj = polygon[j].y;
      const intersects = ((yi > point.y) !== (yj > point.y))
        && (point.x < ((xj - xi) * (point.y - yi)) / ((yj - yi) || 0.000001) + xi);

      if (intersects) {
        isInside = !isInside;
      }
    }

    return isInside;
  }

  function fogDrawingContainsPoint(drawing, pointRatio, width, height) {
    const toPixels = point => ({ x: Number(point?.x || 0) * width, y: Number(point?.y || 0) * height });
    const point = toPixels(pointRatio);
    const pivotRatio = Array.isArray(drawing.points) && drawing.points.length ? drawing.points[0] : drawing.start;
    const testPoint = pivotRatio ? rotatePoint(point, toPixels(pivotRatio), -Number(drawing.rotation || 0)) : point;
    const strokeRadius = Math.max(1, (Number(drawing.strokeRatio) || 0.0045) * Math.min(width, height) / 2);
    const points = (drawing.points || []).map(toPixels);
    if (drawing.type === 'pen') {
      if (points.length === 1) return distanceBetweenPoints(testPoint, points[0]) <= strokeRadius;
      return points.some((segmentStart, index) => index < points.length - 1
        && distancePointToSegment(testPoint, segmentStart, points[index + 1]) <= strokeRadius);
    }
    if (drawing.type === 'lasso-fill' || drawing.type === 'lasso-erase') {
      return points.length >= 3 && isPointInPolygon(testPoint, points);
    }
    const start = toPixels(drawing.start), end = toPixels(drawing.end);
    if (drawing.type === 'rectangle') {
      return testPoint.x >= Math.min(start.x, end.x) && testPoint.x <= Math.max(start.x, end.x)
        && testPoint.y >= Math.min(start.y, end.y) && testPoint.y <= Math.max(start.y, end.y);
    }
    if (drawing.type === 'circle') return distanceBetweenPoints(testPoint, start) <= distanceBetweenPoints(start, end);
    if (drawing.type === 'line') return distancePointToSegment(testPoint, start, end) <= strokeRadius;
    if (drawing.type === 'triangle') {
      const widthPoint = drawing.widthPoint ? toPixels(drawing.widthPoint) : end;
      const axis = { x: end.x - start.x, y: end.y - start.y };
      const axisLength = Math.max(0.001, Math.hypot(axis.x, axis.y));
      const perpendicular = { x: -axis.y / axisLength, y: axis.x / axisLength };
      const halfWidth = drawing.widthPoint
        ? Math.abs((widthPoint.x - end.x) * perpendicular.x + (widthPoint.y - end.y) * perpendicular.y)
        : Math.abs(end.x - start.x);
      return isPointInPolygon(testPoint, [start,
        { x: end.x + perpendicular.x * halfWidth, y: end.y + perpendicular.y * halfWidth },
        { x: end.x - perpendicular.x * halfWidth, y: end.y - perpendicular.y * halfWidth }]);
    }
    return false;
  }

  function fogDrawingsCoverPoint(drawings, pointRatio, width, height) {
    let covered = false;
    drawings.forEach(drawing => {
      if (!fogDrawingContainsPoint(drawing, pointRatio, width, height)) return;
      covered = drawing.type !== 'lasso-erase';
    });
    return covered;
  }

  function ensureStyles() {
    if (document.getElementById("shared-map-drawing-styles")) {
      return;
    }

    const style = document.createElement("style");
    style.id = "shared-map-drawing-styles";
    style.textContent = `
      .drawing-toolbar {
        position: fixed;
        display: flex;
        flex-direction: column;
        align-items: stretch;
        gap: 8px;
        padding: 10px 12px;
        width: min(160px, calc(100vw - 50px));
        max-height: calc(100vh - 100px);
        background: rgba(29, 16, 9, 0.92);
        border: 2px ridge #d4af37;
        border-radius: 10px;
        z-index: 1100;
        color: white;
        font-family: 'MedievalSharp', cursive;
        box-shadow: inset 0 0 12px rgba(212, 175, 55, 0.12), 0 8px 24px rgba(0, 0, 0, 0.45);
      }

      .drawing-toolbar button,
      .drawing-toolbar input[type="color"] {
        height: 36px;
        width: 100%;
        border-radius: 6px;
        box-sizing: border-box;
      }

      .drawing-toolbar button {
        padding: 0 12px;
        border: 1px solid #d4af37;
        background: linear-gradient(#4b2915, #2b190f);
        color: #f4d76d;
        font-family: inherit;
        cursor: pointer;
      }

      .drawing-toolbar button:hover {
        background: linear-gradient(#684126, #3d2718);
        border-color: #f4d76d;
      }

      .drawing-toolbar button.is-active {
        background: #f4d76d;
        color: #1d1009;
      }

      .drawing-toolbar input[type="color"] {
        width: 44px;
        padding: 0;
        border: 1px solid #d4af37;
        background: #2b190f;
        cursor: pointer;
      }

      .drawing-toolbar .drawing-toolbar-label {
        font-size: 0.95rem;
        color: #f4d76d;
        text-align: center;
      }

      .drawing-toolbar .drawing-toolbar-danger {
        border-color: #ff7b7b;
        color: #ffb4b4;
      }

      .drawing-toolbar .drawing-toolbar-danger:hover {
        background: #4b2424;
      }

      .drawing-toolbar.is-compact { left: 50% !important; top: 12px !important; transform: translateX(-50%); flex-direction: row; align-items: center; width: auto; max-width: calc(100vw - 220px); padding: 5px; gap: 4px; }
      .drawing-toolbar.is-compact button { width: 32px; min-width: 32px; height: 30px; padding: 3px; font-size: 16px; }
      .drawing-toolbar.is-compact button svg { width: 19px; height: 19px; vertical-align: middle; }
      .drawing-toolbar.is-compact .drawing-toolbar-danger { width: auto; min-width: 74px; padding: 3px 8px; white-space: nowrap; font-size: 12px; }
      .drawing-toolbar.is-compact input[type="color"] { width: 30px; height: 30px; }
      .drawing-toolbar.is-compact .drawing-toolbar-label { display: none; }
      .drawing-toolbar.is-collapsed > :not(.drawing-collapse-toggle) { display: none !important; }
      .drawing-toolbar.is-compact .drawing-collapse-toggle { position: absolute; left: 50%; bottom: -23px; transform: translateX(-50%); width: 92px; min-width: 92px; height: 23px; padding: 0; border-radius: 0 0 7px 7px; background: linear-gradient(#4b2915, #1d1009); color: #f4d76d; border: 1px solid #d4af37; border-top: 0; font-size: 15px; }
      .drawing-toolbar.is-compact .drawing-collapse-toggle svg { width: 64px; height: 16px; }
      .drawing-toolbar.is-compact.is-collapsed { height: 0; min-height: 0; padding: 0; border: 0; box-shadow: none; }
      .drawing-toolbar.is-compact.is-collapsed { top: 0 !important; }
      .drawing-toolbar.is-compact.is-collapsed .drawing-collapse-toggle { top: -1px; bottom: auto; }

      .map-tool-tabs { position: fixed; left: 50%; top: 0; transform: translateX(-50%); z-index: 1100; display: flex; flex-direction: column; align-items: center; }
      .map-tool-tab-buttons { display: flex; justify-content: center; align-items: flex-start; gap: 4px; }
      .map-tool-tab-buttons button { display: inline-flex; align-items: center; justify-content: center; gap: 6px; min-width: 104px; height: 27px; padding: 3px 10px; border: 1px solid #d4af37; border-top: 0; border-radius: 0 0 7px 7px; background: linear-gradient(#4b2915, #1d1009); color: #f4d76d; font-family: 'MedievalSharp', cursive; cursor: pointer; }
      .map-tool-tab-buttons button svg { width: 48px; height: 18px; }
      .map-tool-tab-buttons button.is-active { background: #f4d76d; color: #1d1009; }
      .drawing-toolbar.is-tabbed { position: relative; left: auto !important; top: auto !important; transform: none; }
      .drawing-toolbar.is-tabbed.is-collapsed { top: auto !important; }
      .drawing-toolbar.is-tabbed .drawing-collapse-toggle { display: none !important; }

      .drawing-toolbar.measurement-toolbar { width: auto; min-width: 260px; }
      .map-tool-tabs .drawing-toolbar.measurement-toolbar { max-width:calc(100vw - 24px); }
      .map-drawing-object { pointer-events:all; cursor:move; }
      .map-drawing-object.is-selected { filter:drop-shadow(0 0 4px #4fc3ff); }
      .map-drawing-object.is-selected > .drawing-shape,
      .drawing-shape.is-selected { stroke:#4fc3ff !important; }
      .measurement-shape { stroke-dasharray:8 5; vector-effect:non-scaling-stroke; }
      .measurement-centerline { fill:none; stroke:rgba(255,255,255,.65); stroke-width:1.5; stroke-dasharray:5 5; vector-effect:non-scaling-stroke; pointer-events:none; }
      .measurement-ruler-point { stroke:#10252c; stroke-width:2; vector-effect:non-scaling-stroke; pointer-events:none; }
      .measurement-label-shell { display:flex; align-items:center; justify-content:center; gap:2px; width:82px; height:30px; border:2px solid #d4af37; border-radius:7px; background:rgba(29,16,9,.96); color:#f4d76d; font:700 14px Arial,sans-serif; box-shadow:0 2px 6px rgba(0,0,0,.65),0 0 4px rgba(212,175,55,.35); }
      .measurement-label-shell input { width:48px; padding:2px 1px; border:0; border-bottom:1px solid rgba(244,215,109,.72); outline:0; background:transparent; color:#f4d76d; text-align:right; font:inherit; user-select:text; -webkit-user-select:text; }
      .measurement-label-shell input:focus { border-bottom-color:#fff3b0; }
      .measurement-label-shell span { pointer-events:none; }
      .drawing-rotation-guide { stroke:#d4af37; stroke-width:2; stroke-dasharray:4 4; vector-effect:non-scaling-stroke; pointer-events:none; }
      .drawing-rotation-pivot-hit { fill:transparent; stroke:none; pointer-events:all; cursor:move; }
      .drawing-rotation-pivot-crosshair { stroke:#f4d76d; stroke-width:3; stroke-linecap:round; vector-effect:non-scaling-stroke; pointer-events:none; filter:drop-shadow(0 1px 2px #1d1009); }
      .drawing-rotation-handle { fill:#2b190f; stroke:#f4d76d; stroke-width:3; vector-effect:non-scaling-stroke; pointer-events:all; cursor:crosshair; filter:drop-shadow(0 1px 3px #000); }

      .map-drawing-overlay,
      .map-drawing-preview {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
      }
    `;

    document.head.appendChild(style);
  }

  function setupSharedMapDrawing(options) {
    ensureStyles();

    const {
      db,
      mapImage,
      mapTransformLayer,
      tokenLayer,
      toolbarPosition
    } = options;

    if (!db || !mapImage || !mapTransformLayer || !tokenLayer) {
      throw new Error("setupSharedMapDrawing requires db, mapImage, mapTransformLayer, and tokenLayer.");
    }

    const boardSync = options.boardSync;
    const syncLayer = options.documentId || "drawings";
    const drawings = [];
    const activeButtons = new Map();
    const isFogLayer = options.layerType === "fog";
    const isMeasurementLayer = options.layerType === "measurement";
    const isEditable = options.editable !== false;
    const layerKey = isFogLayer ? "fogOfWar" : (isMeasurementLayer ? "measurement" : "mapDrawing");

    let currentTool = "pan";
    let currentColor = isMeasurementLayer ? "#7ee7ff" : "#ff5252";
    let activePointerId = null;
    let currentDraft = null;
    let isPointerDown = false;
    let triangleClickStage = 0;
    const selectedDrawingIds = new Set();
    let objectDrag = null;
    let rotationDrag = null;
    let pivotDrag = null;
    let moveFlushTimer = null;
    let pendingMoveChanges = null;
    let moveWriteChain = Promise.resolve();
    const localMoveOverrides = new Map();
    const selectionRegistry = mapTransformLayer.__mapObjectSelectionRegistry || [];
    mapTransformLayer.__mapObjectSelectionRegistry = selectionRegistry;
    const rotationPivotState = mapTransformLayer.__mapObjectRotationPivotState || { selectionKey: "", customPoint: null };
    mapTransformLayer.__mapObjectRotationPivotState = rotationPivotState;
    const selectionBridge = {
      layerPriority: isMeasurementLayer ? 2 : 1,
      getSelected: () => drawings.filter(drawing => selectedDrawingIds.has(drawing.id)),
      getSelectionPoints: drawing => selectionPoints(drawing),
      getPivot: drawing => getDrawingPivot(drawing),
      clear: () => selectedDrawingIds.clear(),
      render: () => renderDrawings(),
      queue: final => queueMovedDrawings(final),
      applySelectedColor(color) {
        const selected = drawings.filter(drawing => selectedDrawingIds.has(drawing.id));
        selected.forEach(drawing => { drawing.color = color; });
        return selected;
      },
      takeSelectedForDeletion() {
        const removed = drawings.filter(drawing => selectedDrawingIds.has(drawing.id)).map(cloneDrawing);
        if (!removed.length) return removed;
        const ids = new Set(removed.map(drawing => drawing.id));
        selectedDrawingIds.clear();
        for (let index = drawings.length - 1; index >= 0; index -= 1) {
          if (ids.has(drawings[index].id)) drawings.splice(index, 1);
        }
        ids.forEach(id => localMoveOverrides.delete(id));
        return removed;
      },
      restoreDeleted(items) {
        items.forEach(item => {
          if (!drawings.some(drawing => drawing.id === item.id)) drawings.push(cloneDrawing(item));
          selectedDrawingIds.add(item.id);
        });
        drawings.sort((a, b) => (a._order || 0) - (b._order || 0) || a.id.localeCompare(b.id));
      },
      captureTranslation() {
        return new Map(drawings
          .filter(drawing => selectedDrawingIds.has(drawing.id))
          .map(drawing => [drawing.id, cloneDrawing(drawing)]));
      },
      applyTranslation(originals, dx, dy) {
        originals.forEach((original, id) => {
          const drawing = drawings.find(item => item.id === id);
          if (!drawing) return;
          Object.assign(drawing, translateDrawing(original, dx, dy));
          localMoveOverrides.set(id, cloneDrawing(drawing));
        });
      },
      clearTranslationOverrides() { localMoveOverrides.clear(); },
      applyRotation(original, delta, centroid) {
        const drawing = drawings.find(item => item.id === original.id);
        if (!drawing) return;
        const pivot = getDrawingPivot(original);
        const rotatedPivot = rotatePoint(pivot, centroid, delta);
        const { width, height } = getMapSize();
        const moved = translateDrawing(original, (rotatedPivot.x - pivot.x) / width, (rotatedPivot.y - pivot.y) / height);
        moved.rotation = Number((((Number(original.rotation || 0) + delta) % 360 + 360) % 360).toFixed(2));
        Object.assign(drawing, moved);
        localMoveOverrides.set(drawing.id, cloneDrawing(drawing));
      }
    };
    if (!isFogLayer) selectionRegistry.push(selectionBridge);

    const drawingLayer = createSvgElement("svg", {
      id: `${layerKey}Layer`,
      class: "map-drawing-overlay",
      "aria-hidden": "true"
    });
    drawingLayer.style.pointerEvents = "none";
    drawingLayer.style.zIndex = isFogLayer ? "20" : (isMeasurementLayer ? "3" : "2");

    const previewLayer = createSvgElement("svg", {
      id: `${layerKey}PreviewLayer`,
      class: "map-drawing-preview"
    });
    previewLayer.style.pointerEvents = "none";
    previewLayer.style.touchAction = "none";
    // The active authoring surface must be above tokens so a shape can start at a token's center.
    // It remains pointer-transparent in Pan / Select mode, leaving normal token dragging unchanged.
    previewLayer.style.zIndex = isFogLayer ? "21" : (isMeasurementLayer ? "10" : "9");

    if (isFogLayer) mapTransformLayer.appendChild(drawingLayer);
    else mapTransformLayer.insertBefore(drawingLayer, tokenLayer);
    mapTransformLayer.appendChild(previewLayer);

    const toolbar = document.createElement("div");
    toolbar.className = `drawing-toolbar${isMeasurementLayer ? " measurement-toolbar" : ""}`;
    toolbar.style.left = toolbarPosition?.left || "25px";
    toolbar.style.top = toolbarPosition?.top || "80px";

    if (options.compact) {
      toolbar.classList.add("is-compact");
      const collapseToggle = document.createElement("button");
      collapseToggle.type = "button";
      collapseToggle.className = "drawing-collapse-toggle";
      collapseToggle.innerHTML = '<svg viewBox="0 0 80 20" aria-hidden="true"><path d="M3 14c8-8 14 7 22-1s14 6 23-1" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="m55 14 13-12 7 7-13 12-8 1 1-8Z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="m66 4 7 7" stroke="currentColor" stroke-width="2"/></svg>';
      collapseToggle.title = "Hide drawing tools";
      collapseToggle.addEventListener("click", () => {
        toolbar.classList.toggle("is-collapsed");
        collapseToggle.title = toolbar.classList.contains("is-collapsed") ? "Show drawing tools" : "Hide drawing tools";
      });
      toolbar.appendChild(collapseToggle);
      if (options.startCollapsed) {
        toolbar.classList.add("is-collapsed");
        collapseToggle.title = "Show drawing tools";
      }
    }

    const toolLabel = document.createElement("span");
    toolLabel.className = "drawing-toolbar-label";
    toolLabel.textContent = isFogLayer ? "Fog" : (isMeasurementLayer ? "Measure" : "Draw");
    toolbar.appendChild(toolLabel);

    function addToolButton(label, tool) {
      const button = document.createElement("button");
      button.type = "button";
      const compactIcons = { pan: "✥", pen: "✎", rectangle: "▭", circle: "○", triangle: "△", line: "╱", ruler: "\u2194", cone: "◁", square: "□" };
      if (options.compact && tool === "lasso-fill") {
        button.innerHTML = '<svg viewBox="0 0 28 24" aria-hidden="true"><path d="M3 9c1-5 8-7 14-6 4 .5 5 2 6 4 .5 1.5 3 1 2.5 4.5-.5 3-4 6-9 7-6 1-11-1-11-5 0-2 1-3 3-3" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><circle cx="16.5" cy="18.5" r="2" fill="#1d1009" stroke="currentColor" stroke-width="1.5"/><path d="m20 14 5-5 2 2-5 5-3 .8 1-2.8Z" fill="currentColor"/><path d="M16 21c-1 0-3 1-4 2" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>';
      } else if (options.compact && tool === "lasso-erase") {
        button.innerHTML = '<svg viewBox="0 0 28 24" aria-hidden="true"><path d="M3 9c1-5 8-7 14-6 4 .5 5 2 6 4 .5 1.5 3 1 2.5 4.5-.5 3-4 6-9 7-6 1-11-1-11-5 0-2 1-3 3-3" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><circle cx="16.5" cy="18.5" r="2" fill="#1d1009" stroke="currentColor" stroke-width="1.5"/><path d="m11 9 4-4 5 5-4 4h-3l-3-3 1-2Z" fill="currentColor"/><path d="M16 21c-1 0-3 1-4 2" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>';
      } else if (options.compact && tool === "eraser") {
        button.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M16.24 3.56 21 8.32a2 2 0 0 1 0 2.83l-8.49 8.49a2 2 0 0 1-2.83 0L3 12.96a2 2 0 0 1 0-2.83l8.49-8.49a2 2 0 0 1 2.83 0l1.92 1.92ZM5.12 11.55l5.97 5.97 6.79-6.79-5.97-5.97-6.79 6.79ZM13.93 19H21v2h-9.07l2-2Z"/></svg>';
      } else button.textContent = options.compact ? compactIcons[tool] : label;
      button.title = label;
      button.addEventListener("click", () => setTool(tool));
      toolbar.appendChild(button);
      activeButtons.set(tool, button);
    }

    addToolButton("Pan / Select", "pan");
    if (isMeasurementLayer) {
      addToolButton("Cone", "cone");
      addToolButton("Circle", "circle");
      addToolButton("Square", "square");
      addToolButton("Line", "line");
      addToolButton("Two-point line", "ruler");
      addToolButton("Delete", "eraser");
    } else {
      addToolButton("Pen", "pen");
      addToolButton("Rectangle", "rectangle");
      addToolButton("Circle", "circle");
      addToolButton("Triangle", "triangle");
      addToolButton("Line", "line");
      addToolButton("Lasso Fill", "lasso-fill");
      addToolButton("Lasso Erase", "lasso-erase");
      addToolButton("Eraser", "eraser");
    }

    const colorLabel = document.createElement("span");
    colorLabel.className = "drawing-toolbar-label";
    colorLabel.textContent = "Color";
    if (isFogLayer || isMeasurementLayer) colorLabel.style.display = "none";
    toolbar.appendChild(colorLabel);

    const colorInput = document.createElement("input");
    colorInput.type = "color";
    colorInput.value = currentColor;
    colorInput.title = "Selected drawings and measurements color";
    colorInput.addEventListener("input", () => {
      currentColor = colorInput.value;
      previewCompositeSelectionColor(currentColor);
    });
    colorInput.addEventListener("change", () => updateCompositeSelectionColor(colorInput.value));
    if (isFogLayer) colorInput.style.display = "none";
    toolbar.appendChild(colorInput);

    const clearButton = document.createElement("button");
    clearButton.type = "button";
    clearButton.className = "drawing-toolbar-danger";
    clearButton.textContent = isFogLayer ? "Clear Fog" : (isMeasurementLayer ? "Clear Measurements" : "Erase All");
    clearButton.addEventListener("click", () => {
      if (!confirm(isFogLayer ? "Clear all fog of war?" : (isMeasurementLayer ? "Clear all shared measurements?" : "Erase all shared drawings?"))) {
        return;
      }

      boardSync.removeDrawings(syncLayer, drawings.map(drawing => drawing.id)).catch(error => {
        console.error('Failed to clear map layer:', error);
        if (typeof reportBoardSyncError === 'function') reportBoardSyncError(error);
      });
    });
    toolbar.appendChild(clearButton);

    if (options.showToolbar === false) toolbar.style.display = "none";
    document.body.appendChild(toolbar);

    function getMapSize() {
      return {
        width: Math.max(1, mapImage.clientWidth || 1),
        height: Math.max(1, mapImage.clientHeight || 1)
      };
    }

    function getStrokePixels(drawing) {
      const { width, height } = getMapSize();
      const minDimension = Math.min(width, height);
      return Math.max(2, roundPixels((drawing.strokeRatio || 0.0045) * minDimension));
    }

    function getPointerRatioPoint(event) {
      const bounds = previewLayer.getBoundingClientRect();
      if (!bounds.width || !bounds.height) {
        return null;
      }

      const contact = event.touches?.[0] || event.changedTouches?.[0] || event;
      return {
        x: roundRatio((contact.clientX - bounds.left) / bounds.width),
        y: roundRatio((contact.clientY - bounds.top) / bounds.height)
      };
    }

    function ratioPointToPixels(point) {
      const { width, height } = getMapSize();
      return {
        x: point.x * width,
        y: point.y * height
      };
    }

    if (isFogLayer && options.blockTokenInteraction) {
      const blockConcealedTokenInteraction = event => {
        if (!event.target.closest?.('.monster-token')) return;
        const point = getPointerRatioPoint(event);
        const { width, height } = getMapSize();
        if (!point || !fogDrawingsCoverPoint(drawings, point, width, height)) return;
        event.preventDefault();
        event.stopImmediatePropagation();
      };
      mapTransformLayer.addEventListener('pointerdown', blockConcealedTokenInteraction, true);
      mapTransformLayer.addEventListener('mousedown', blockConcealedTokenInteraction, true);
      mapTransformLayer.addEventListener('touchstart', blockConcealedTokenInteraction, true);
      mapTransformLayer.addEventListener('click', blockConcealedTokenInteraction, true);
    }

    function getDrawingPivot(drawing) {
      return ratioPointToPixels(Array.isArray(drawing.points) && drawing.points.length ? drawing.points[0] : drawing.start);
    }

    function getRectangleBounds(drawing) {
      const start = ratioPointToPixels(drawing.start);
      const end = ratioPointToPixels(drawing.end);

      return {
        left: Math.min(start.x, end.x),
        top: Math.min(start.y, end.y),
        right: Math.max(start.x, end.x),
        bottom: Math.max(start.y, end.y)
      };
    }

    function getCircleGeometry(drawing) {
      const start = ratioPointToPixels(drawing.start);
      const end = ratioPointToPixels(drawing.end);
      const center = start;
      const radius = distanceBetweenPoints(start, end);

      return { center, radius };
    }

    function getTrianglePixels(drawing) {
      const tip = ratioPointToPixels(drawing.start);
      const baseCenter = ratioPointToPixels(drawing.end);
      if (!drawing.widthPoint) {
        const baseCorner = baseCenter;
        return [tip, baseCorner, { x: tip.x - (baseCorner.x - tip.x), y: baseCorner.y }];
      }
      const widthPoint = ratioPointToPixels(drawing.widthPoint);
      const axisX = baseCenter.x - tip.x;
      const axisY = baseCenter.y - tip.y;
      const axisLength = Math.max(0.001, Math.hypot(axisX, axisY));
      const perpendicular = { x: -axisY / axisLength, y: axisX / axisLength };
      const halfWidth = Math.abs((widthPoint.x - baseCenter.x) * perpendicular.x + (widthPoint.y - baseCenter.y) * perpendicular.y);
      return [
        tip,
        { x: baseCenter.x + perpendicular.x * halfWidth, y: baseCenter.y + perpendicular.y * halfWidth },
        { x: baseCenter.x - perpendicular.x * halfWidth, y: baseCenter.y - perpendicular.y * halfWidth }
      ];
    }

    function getMeasurementGeometry(drawing) {
      const start = ratioPointToPixels(drawing.start);
      const rawEnd = ratioPointToPixels(drawing.end || drawing.start);
      const rawLength = Math.hypot(rawEnd.x - start.x, rawEnd.y - start.y);
      const baseDirection = rawLength > 0.01
        ? { x: (rawEnd.x - start.x) / rawLength, y: (rawEnd.y - start.y) / rawLength }
        : { x: 1, y: 0 };
      const rotatedEnd = rotatePoint({ x: start.x + baseDirection.x, y: start.y + baseDirection.y }, start, drawing.rotation);
      const direction = { x: rotatedEnd.x - start.x, y: rotatedEnd.y - start.y };
      const perpendicular = { x: -direction.y, y: direction.x };
      const pixelsPerFiveFeet = Math.max(1, Number(drawing.pixelsPerFiveFeet) || Number(options.getMediumTokenSize?.()) || 100);
      const distanceFeet = Math.max(1, Math.round(Number(drawing.distanceFeet) || 30));
      const length = distanceFeet / 5 * pixelsPerFiveFeet;
      const end = { x: start.x + direction.x * length, y: start.y + direction.y * length };
      return { start, end, direction, perpendicular, length, distanceFeet, pixelsPerFiveFeet };
    }

    function createMeasurementElement(drawing, isPreview) {
      const geometry = getMeasurementGeometry(drawing);
      const group = createSvgElement("g", { class: "map-drawing-object measurement-object" });
      let shape;
      if (drawing.type === "circle") {
        shape = createSvgElement("circle", { cx: geometry.start.x, cy: geometry.start.y, r: geometry.length });
      } else if (drawing.type === "square") {
        const half = geometry.length / 2;
        shape = createSvgElement("polygon", { points: [
          { x: geometry.start.x + geometry.direction.x * half + geometry.perpendicular.x * half, y: geometry.start.y + geometry.direction.y * half + geometry.perpendicular.y * half },
          { x: geometry.start.x + geometry.direction.x * half - geometry.perpendicular.x * half, y: geometry.start.y + geometry.direction.y * half - geometry.perpendicular.y * half },
          { x: geometry.start.x - geometry.direction.x * half - geometry.perpendicular.x * half, y: geometry.start.y - geometry.direction.y * half - geometry.perpendicular.y * half },
          { x: geometry.start.x - geometry.direction.x * half + geometry.perpendicular.x * half, y: geometry.start.y - geometry.direction.y * half + geometry.perpendicular.y * half }
        ].map(point => `${roundPixels(point.x)},${roundPixels(point.y)}`).join(" ") });
      } else if (drawing.type === "cone") {
        const halfWidth = geometry.length / 2;
        shape = createSvgElement("polygon", { points: [
          geometry.start,
          { x: geometry.end.x + geometry.perpendicular.x * halfWidth, y: geometry.end.y + geometry.perpendicular.y * halfWidth },
          { x: geometry.end.x - geometry.perpendicular.x * halfWidth, y: geometry.end.y - geometry.perpendicular.y * halfWidth }
        ].map(point => `${roundPixels(point.x)},${roundPixels(point.y)}`).join(" ") });
      } else if (drawing.type === "ruler") {
        shape = createSvgElement("line", {
          x1: geometry.start.x, y1: geometry.start.y, x2: geometry.end.x, y2: geometry.end.y
        });
      } else {
        const halfWidth = geometry.pixelsPerFiveFeet / 2;
        shape = createSvgElement("polygon", { points: [
          { x: geometry.start.x + geometry.perpendicular.x * halfWidth, y: geometry.start.y + geometry.perpendicular.y * halfWidth },
          { x: geometry.end.x + geometry.perpendicular.x * halfWidth, y: geometry.end.y + geometry.perpendicular.y * halfWidth },
          { x: geometry.end.x - geometry.perpendicular.x * halfWidth, y: geometry.end.y - geometry.perpendicular.y * halfWidth },
          { x: geometry.start.x - geometry.perpendicular.x * halfWidth, y: geometry.start.y - geometry.perpendicular.y * halfWidth }
        ].map(point => `${roundPixels(point.x)},${roundPixels(point.y)}`).join(" ") });
      }
      const measurementColor = drawing.color || currentColor || "#7ee7ff";
      shape.setAttribute("class", "drawing-shape measurement-shape");
      shape.setAttribute("stroke", measurementColor);
      shape.setAttribute("fill", measurementColor);
      shape.setAttribute("fill-opacity", ".16");
      shape.setAttribute("stroke-width", isPreview ? "2" : "3");
      if (isPreview) shape.setAttribute("opacity", ".75");
      group.appendChild(shape);
      if (drawing.type === "ruler") {
        [geometry.start, geometry.end].forEach(point => {
          const marker = createSvgElement("circle", {
            cx: point.x, cy: point.y, r: 4,
            class: "measurement-ruler-point", fill: measurementColor
          });
          if (isPreview) marker.setAttribute("opacity", ".75");
          group.appendChild(marker);
        });
      }
      if (drawing.type === "cone" || drawing.type === "line") {
        group.appendChild(createSvgElement("line", {
          x1: geometry.start.x, y1: geometry.start.y, x2: geometry.end.x, y2: geometry.end.y,
          class: "measurement-centerline"
        }));
      }
      const labelPoint = drawing.type === "ruler"
        ? { x: (geometry.start.x + geometry.end.x) / 2, y: (geometry.start.y + geometry.end.y) / 2 }
        : drawing.type === "cone" || drawing.type === "line"
        ? geometry.end
        : { x: geometry.start.x + geometry.direction.x * geometry.length, y: geometry.start.y + geometry.direction.y * geometry.length };
      if (isPreview) {
        const label = createSvgElement("text", {
          x: labelPoint.x, y: labelPoint.y - 10, class: "token-distance-label"
        });
        label.textContent = `${geometry.distanceFeet} ft`;
        group.appendChild(label);
      } else {
        const foreign = createSvgElement("foreignObject", { x: labelPoint.x - 41, y: labelPoint.y - (drawing.type === "ruler" ? 39 : 15), width: 82, height: 30 });
        const shell = document.createElement("div");
        shell.setAttribute("xmlns", "http://www.w3.org/1999/xhtml");
        shell.className = "measurement-label-shell";
        const input = document.createElement("input");
        input.type = "number"; input.min = "1"; input.step = "1"; input.value = String(geometry.distanceFeet);
        input.dataset.measurementId = drawing.id;
        input.setAttribute("aria-label", `${drawing.type} distance in feet`);
        const suffix = document.createElement("span"); suffix.textContent = "ft";
        shell.append(input, suffix); foreign.appendChild(shell); group.appendChild(foreign);
      }
      return group;
    }

    function createShapeElement(drawing, isPreview) {
      const { width, height } = getMapSize();
      const strokeWidth = getStrokePixels(drawing);
      const fogPaint = options.fogAppearance === "player" ? "url(#fogTexturePattern)" : "rgba(74, 79, 84, 0.52)";
      const sharedAttributes = {
        fill: isFogLayer ? fogPaint : "none",
        stroke: isFogLayer ? fogPaint : (drawing.color || currentColor),
        "stroke-width": String(strokeWidth),
        "stroke-linecap": "round",
        "stroke-linejoin": "round"
      };

      if (drawing.kind === "measurement") return createMeasurementElement(drawing, isPreview);

      if (isPreview) {
        sharedAttributes["stroke-dasharray"] = "10 6";
        sharedAttributes.opacity = "0.9";
      }

      if (drawing.type === "pen") {
        const points = (drawing.points || [])
          .map(point => `${roundPixels(point.x * width)},${roundPixels(point.y * height)}`)
          .join(" ");

        if ((drawing.points || []).length < 2) {
          const center = ratioPointToPixels((drawing.points || [])[0] || { x: 0, y: 0 });
          return createSvgElement("circle", {
            cx: String(roundPixels(center.x)),
            cy: String(roundPixels(center.y)),
            r: String(Math.max(1.5, strokeWidth / 2)),
            fill: drawing.color || currentColor,
            stroke: "none"
          });
        }

        return createSvgElement("polyline", {
          ...sharedAttributes,
          points
        });
      }

      if (drawing.type === "lasso-fill" || drawing.type === "lasso-erase") {
        const points = (drawing.points || [])
          .map(point => `${roundPixels(point.x * width)},${roundPixels(point.y * height)}`)
          .join(" ");
        return createSvgElement("polygon", {
          ...sharedAttributes,
          points,
          fill: drawing.type === "lasso-erase" ? "rgba(255, 82, 82, 0.24)" : (isFogLayer ? fogPaint : (drawing.color || currentColor)),
          stroke: drawing.type === "lasso-erase" ? "#ff5252" : (isFogLayer ? fogPaint : (drawing.color || currentColor)),
          "fill-opacity": isPreview ? "0.38" : "1"
        });
      }

      if (drawing.type === "rectangle") {
        const bounds = getRectangleBounds(drawing);
        return createSvgElement("rect", {
          ...sharedAttributes,
          x: String(roundPixels(bounds.left)),
          y: String(roundPixels(bounds.top)),
          width: String(roundPixels(bounds.right - bounds.left)),
          height: String(roundPixels(bounds.bottom - bounds.top))
        });
      }

      if (drawing.type === "line") {
        const start = ratioPointToPixels(drawing.start);
        const end = ratioPointToPixels(drawing.end);
        return createSvgElement("line", {
          ...sharedAttributes,
          x1: String(roundPixels(start.x)),
          y1: String(roundPixels(start.y)),
          x2: String(roundPixels(end.x)),
          y2: String(roundPixels(end.y))
        });
      }

      if (drawing.type === "circle") {
        const geometry = getCircleGeometry(drawing);
        return createSvgElement("circle", {
          ...sharedAttributes,
          cx: String(roundPixels(geometry.center.x)),
          cy: String(roundPixels(geometry.center.y)),
          r: String(roundPixels(geometry.radius))
        });
      }

      if (drawing.type === "triangle") {
        if (isPreview && !drawing.widthPoint) {
          const tip = ratioPointToPixels(drawing.start);
          const baseCenter = ratioPointToPixels(drawing.end);
          return createSvgElement("line", {
            ...sharedAttributes,
            x1: String(roundPixels(tip.x)),
            y1: String(roundPixels(tip.y)),
            x2: String(roundPixels(baseCenter.x)),
            y2: String(roundPixels(baseCenter.y))
          });
        }
        const points = getTrianglePixels(drawing)
          .map(point => `${roundPixels(point.x)},${roundPixels(point.y)}`)
          .join(" ");

        return createSvgElement("polygon", {
          ...sharedAttributes,
          points
        });
      }

      return null;
    }

    function createFogDefinitions() {
      const definitions = createSvgElement("defs");
      const pattern = createSvgElement("pattern", { id: "fogTexturePattern", width: "1024", height: "1024", patternUnits: "userSpaceOnUse" });
      const textureAttributes = { href: "assets/fog-of-war-texture.png", width: "512", height: "512", preserveAspectRatio: "none" };
      pattern.appendChild(createSvgElement("image", { ...textureAttributes, x: "0", y: "0" }));
      pattern.appendChild(createSvgElement("image", { ...textureAttributes, x: "-1024", y: "0", transform: "scale(-1 1)" }));
      pattern.appendChild(createSvgElement("image", { ...textureAttributes, x: "0", y: "-1024", transform: "scale(1 -1)" }));
      pattern.appendChild(createSvgElement("image", { ...textureAttributes, x: "-1024", y: "-1024", transform: "scale(-1 -1)" }));
      definitions.appendChild(pattern);
      return definitions;
    }

    function selectionPoints(drawing) {
      if (Array.isArray(drawing.points)) {
        const points = drawing.points.map(ratioPointToPixels);
        const pivot = points[0] || { x: 0, y: 0 };
        return points.map(point => rotatePoint(point, pivot, drawing.rotation));
      }
      if (drawing.kind === "measurement") {
        const geometry = getMeasurementGeometry(drawing);
        if (drawing.type === "circle") return [geometry.start, geometry.end,
          { x: geometry.start.x - geometry.direction.x * geometry.length, y: geometry.start.y - geometry.direction.y * geometry.length },
          { x: geometry.start.x + geometry.perpendicular.x * geometry.length, y: geometry.start.y + geometry.perpendicular.y * geometry.length },
          { x: geometry.start.x - geometry.perpendicular.x * geometry.length, y: geometry.start.y - geometry.perpendicular.y * geometry.length }];
        if (drawing.type === "square") {
          const half = geometry.length / 2;
          return [geometry.start,
            { x: geometry.start.x + geometry.direction.x * half + geometry.perpendicular.x * half, y: geometry.start.y + geometry.direction.y * half + geometry.perpendicular.y * half },
            { x: geometry.start.x + geometry.direction.x * half - geometry.perpendicular.x * half, y: geometry.start.y + geometry.direction.y * half - geometry.perpendicular.y * half },
            { x: geometry.start.x - geometry.direction.x * half - geometry.perpendicular.x * half, y: geometry.start.y - geometry.direction.y * half - geometry.perpendicular.y * half },
            { x: geometry.start.x - geometry.direction.x * half + geometry.perpendicular.x * half, y: geometry.start.y - geometry.direction.y * half + geometry.perpendicular.y * half }];
        }
        if (drawing.type === "cone") {
          const half = geometry.length / 2;
          return [geometry.start,
            { x: geometry.end.x + geometry.perpendicular.x * half, y: geometry.end.y + geometry.perpendicular.y * half },
            { x: geometry.end.x - geometry.perpendicular.x * half, y: geometry.end.y - geometry.perpendicular.y * half }];
        }
        if (drawing.type === "line") {
          const half = geometry.pixelsPerFiveFeet / 2;
          return [
            { x: geometry.start.x + geometry.perpendicular.x * half, y: geometry.start.y + geometry.perpendicular.y * half },
            { x: geometry.end.x + geometry.perpendicular.x * half, y: geometry.end.y + geometry.perpendicular.y * half },
            { x: geometry.end.x - geometry.perpendicular.x * half, y: geometry.end.y - geometry.perpendicular.y * half },
            { x: geometry.start.x - geometry.perpendicular.x * half, y: geometry.start.y - geometry.perpendicular.y * half }
          ];
        }
        return [geometry.start, geometry.end];
      }
      const pivot = getDrawingPivot(drawing);
      let points;
      if (drawing.type === "rectangle") {
        const bounds = getRectangleBounds(drawing);
        points = [
          { x: bounds.left, y: bounds.top }, { x: bounds.right, y: bounds.top },
          { x: bounds.right, y: bounds.bottom }, { x: bounds.left, y: bounds.bottom }
        ];
      } else if (drawing.type === "circle") {
        const circle = getCircleGeometry(drawing);
        points = [
          { x: circle.center.x + circle.radius, y: circle.center.y }, { x: circle.center.x - circle.radius, y: circle.center.y },
          { x: circle.center.x, y: circle.center.y + circle.radius }, { x: circle.center.x, y: circle.center.y - circle.radius }
        ];
      } else if (drawing.type === "triangle") points = getTrianglePixels(drawing);
      else points = [ratioPointToPixels(drawing.start), ratioPointToPixels(drawing.end)];
      return points.map(point => rotatePoint(point, pivot, drawing.rotation));
    }

    function queueMovedDrawings(final = false) {
      pendingMoveChanges = new Map(drawings
        .filter(drawing => selectedDrawingIds.has(drawing.id))
        .map(drawing => [drawing.id, sanitizeDrawing(drawing)]));
      if (moveFlushTimer) clearTimeout(moveFlushTimer);
      const flush = () => {
        moveFlushTimer = null;
        const changes = pendingMoveChanges;
        pendingMoveChanges = null;
        if (!changes?.size) return;
        moveWriteChain = moveWriteChain.then(() => boardSync.patchDrawings(syncLayer, changes, boardSync.generation)).catch(error => {
          console.error("Failed to move map objects:", error);
          if (typeof reportBoardSyncError === "function") reportBoardSyncError(error);
          boardSync.reconcile().catch(() => {});
        });
        if (final) moveWriteChain.finally(() => localMoveOverrides.clear());
      };
      if (final) flush();
      else moveFlushTimer = setTimeout(flush, 50);
    }

    function updateMeasurementDistance(drawingId, value) {
      const drawing = drawings.find(item => item.id === drawingId);
      if (!drawing) return;
      drawing.distanceFeet = Math.max(1, Math.round(Number(value) || 1));
      const changes = new Map([[drawing.id, { distanceFeet: drawing.distanceFeet }]]);
      boardSync.patchDrawings(syncLayer, changes, drawing._boardGeneration || boardSync.generation).catch(error => {
        console.error("Failed to resize measurement:", error);
        if (typeof reportBoardSyncError === "function") reportBoardSyncError(error);
        boardSync.reconcile().catch(() => {});
      });
      renderDrawings();
    }

    function previewCompositeSelectionColor(color) {
      currentColor = color;
      selectionRegistry.forEach(bridge => bridge.applySelectedColor(color));
      renderAllSelections();
    }

    function updateCompositeSelectionColor(color) {
      currentColor = color;
      const selected = selectionRegistry.flatMap(bridge => bridge.applySelectedColor(color));
      if (!selected.length) return Promise.resolve(false);
      renderAllSelections();
      const changes = new Map(selected.map(drawing => [drawing.id, { color }]));
      return boardSync.patchDrawings(syncLayer, changes, boardSync.generation).then(() => true).catch(error => {
        console.error("Failed to recolor map objects:", error);
        if (typeof reportBoardSyncError === "function") reportBoardSyncError(error);
        boardSync.reconcile().catch(() => {});
        return false;
      });
    }

    async function deleteCompositeSelection() {
      if (isFogLayer) return false;
      const deletedGroups = selectionRegistry.map(bridge => ({ bridge, items: bridge.takeSelectedForDeletion() }))
        .filter(group => group.items.length);
      const ids = deletedGroups.flatMap(group => group.items.map(item => item.id));
      if (!ids.length) return false;
      renderAllSelections();
      try {
        await boardSync.removeDrawings(syncLayer, ids, boardSync.generation);
        return true;
      } catch (error) {
        deletedGroups.forEach(group => group.bridge.restoreDeleted(group.items));
        renderAllSelections();
        console.error("Failed to delete selected map objects:", error);
        if (typeof reportBoardSyncError === "function") reportBoardSyncError(error);
        boardSync.reconcile().catch(() => {});
        return false;
      }
    }

    function getCompositeSelection() {
      return [...selectionRegistry]
        .sort((a, b) => b.layerPriority - a.layerPriority)
        .flatMap(bridge => bridge.getSelected().map(drawing => ({ bridge, drawing })));
    }

    function getSelectionCentroid(entries) {
      const points = entries.flatMap(entry => entry.bridge.getSelectionPoints(entry.drawing));
      return boundsCentroid(points);
    }

    function getSelectionKey(entries) {
      return entries.map(entry => `${entry.bridge.layerPriority}:${entry.drawing.id}`).sort().join("|");
    }

    function getRotationPivot(entries) {
      const selectionKey = getSelectionKey(entries);
      if (rotationPivotState.selectionKey !== selectionKey) {
        rotationPivotState.selectionKey = selectionKey;
        rotationPivotState.customPoint = null;
      }
      return rotationPivotState.customPoint || (entries.length > 1
        ? getSelectionCentroid(entries)
        : entries[0].bridge.getPivot(entries[0].drawing));
    }

    function renderAllSelections() {
      selectionRegistry.forEach(bridge => bridge.render());
    }

    function beginCompositeTranslation() {
      const groups = selectionRegistry.map(bridge => ({ bridge, originals: bridge.captureTranslation() }))
        .filter(group => group.originals.size);
      const { width, height } = getMapSize();
      const points = groups.flatMap(group => [...group.originals.values()].flatMap(drawing =>
        group.bridge.getSelectionPoints(drawing).map(point => ({ x: point.x / width, y: point.y / height }))));
      const selectionKey = getSelectionKey(getCompositeSelection());
      const pivotOrigin = rotationPivotState.selectionKey === selectionKey && rotationPivotState.customPoint
        ? { ...rotationPivotState.customPoint }
        : null;
      return { groups, points, selectionKey, pivotOrigin };
    }

    function moveCompositeTranslation(session, dx, dy) {
      if (!session) return;
      session.groups.forEach(group => group.bridge.applyTranslation(group.originals, dx, dy));
      if (session.pivotOrigin && rotationPivotState.selectionKey === session.selectionKey) {
        const { width, height } = getMapSize();
        rotationPivotState.customPoint = { x: session.pivotOrigin.x + dx * width, y: session.pivotOrigin.y + dy * height };
      }
      renderAllSelections();
      session.groups.forEach(group => group.bridge.queue(false));
    }

    function endCompositeTranslation(session, moved = true) {
      if (!session) return;
      session.groups.forEach(group => {
        if (moved) group.bridge.queue(true);
        else group.bridge.clearTranslationOverrides();
      });
    }

    function createRotationControls(entries) {
      const pivot = getRotationPivot(entries);
      const points = entries.flatMap(entry => entry.bridge.getSelectionPoints(entry.drawing));
      const farthest = points.reduce((best, point) => distanceBetweenPoints(point, pivot) > distanceBetweenPoints(best, pivot) ? point : best, points[0] || pivot);
      const farthestDistance = distanceBetweenPoints(farthest, pivot);
      const distance = Math.max(24, farthestDistance);
      const rawDirection = farthestDistance > 1
        ? { x: (farthest.x - pivot.x) / farthestDistance, y: (farthest.y - pivot.y) / farthestDistance }
        : { x: 0, y: -1 };
      const handle = { x: pivot.x + rawDirection.x * (distance + 28), y: pivot.y + rawDirection.y * (distance + 28) };
      const group = createSvgElement("g", { class: "drawing-rotation-controls" });
      group.appendChild(createSvgElement("line", { x1: pivot.x, y1: pivot.y, x2: handle.x, y2: handle.y, class: "drawing-rotation-guide" }));
      const pivotControl = createSvgElement("g");
      pivotControl.dataset.drawingId = entries[0].drawing.id;
      pivotControl.dataset.rotationPivotHandle = "true";
      pivotControl.appendChild(createSvgElement("circle", { cx: pivot.x, cy: pivot.y, r: 12, class: "drawing-rotation-pivot-hit" }));
      pivotControl.appendChild(createSvgElement("line", { x1: pivot.x - 7, y1: pivot.y, x2: pivot.x + 7, y2: pivot.y, class: "drawing-rotation-pivot-crosshair" }));
      pivotControl.appendChild(createSvgElement("line", { x1: pivot.x, y1: pivot.y - 7, x2: pivot.x, y2: pivot.y + 7, class: "drawing-rotation-pivot-crosshair" }));
      const pivotTitle = createSvgElement("title");
      pivotTitle.textContent = "Drag to move the rotation origin";
      pivotControl.appendChild(pivotTitle);
      group.appendChild(pivotControl);
      const knob = createSvgElement("circle", { cx: handle.x, cy: handle.y, r: 9, class: "drawing-rotation-handle" });
      knob.dataset.drawingId = entries[0].drawing.id;
      knob.dataset.rotationHandle = "true";
      const title = createSvgElement("title");
      title.textContent = entries.length > 1 ? "Drag to rotate the selection around the crosshair" : "Drag to rotate around the crosshair";
      knob.appendChild(title);
      group.appendChild(knob);
      return group;
    }

    function renderDrawings() {
      drawingLayer.innerHTML = "";
      const { width, height } = getMapSize();
      const definitions = isFogLayer ? createFogDefinitions() : (drawings.some(drawing => drawing.type === "lasso-erase") ? createSvgElement("defs") : null);
      if (definitions) drawingLayer.appendChild(definitions);

      drawings.forEach((drawing, drawingIndex) => {
        if (drawing.type === "lasso-erase") return;
        const shape = createShapeElement(drawing, false);
        if (!shape) {
          return;
        }

        const laterErasers = drawings.slice(drawingIndex + 1)
          .filter(item => item.type === "lasso-erase" && (item.points || []).length >= 3);
        if (laterErasers.length && definitions) {
          const maskId = `${layerKey}-erase-mask-${drawingIndex}`;
          const mask = createSvgElement("mask", { id: maskId, maskUnits: "userSpaceOnUse", x: "0", y: "0", width: String(width), height: String(height) });
          mask.appendChild(createSvgElement("rect", { x: "0", y: "0", width: String(width), height: String(height), fill: "white" }));
          laterErasers.forEach(eraser => mask.appendChild(createSvgElement("polygon", {
            points: eraser.points.map(point => `${roundPixels(point.x * width)},${roundPixels(point.y * height)}`).join(" "),
            fill: "black"
          })));
          definitions.appendChild(mask);
          shape.setAttribute("mask", `url(#${maskId})`);
        }

        if (!isFogLayer) shape.dataset.drawingId = drawing.id;
        if (!drawing.kind && Number(drawing.rotation)) {
          const pivot = getDrawingPivot(drawing);
          shape.setAttribute("transform", `rotate(${Number(drawing.rotation)} ${pivot.x} ${pivot.y})`);
        }
        if (isFogLayer) {
          shape.classList.add("fog-of-war-shape");
          shape.style.pointerEvents = "none";
        } else {
          shape.classList.add("map-drawing-object");
          shape.classList.toggle("is-selected", selectedDrawingIds.has(drawing.id));
          if (!drawing.kind) shape.classList.add("drawing-shape");
        }
        drawingLayer.appendChild(shape);
        const input = shape.querySelector?.("input[data-measurement-id]");
        if (input) {
          input.addEventListener("pointerdown", event => event.stopPropagation());
          input.addEventListener("click", event => event.stopPropagation());
          input.addEventListener("change", () => updateMeasurementDistance(drawing.id, input.value));
          input.addEventListener("keydown", event => {
            if (event.key === "Enter") { event.preventDefault(); input.blur(); }
            if (event.key === "Escape") { input.value = String(drawing.distanceFeet); input.blur(); }
          });
        }
      });
      const compositeSelection = getCompositeSelection();
      if (isEditable && !isFogLayer && compositeSelection.length && compositeSelection[0].bridge === selectionBridge) {
        drawingLayer.appendChild(createRotationControls(compositeSelection));
      } else if (!compositeSelection.length) {
        rotationPivotState.selectionKey = "";
        rotationPivotState.customPoint = null;
      }
      const selectedColors = [...new Set(drawings.filter(drawing => selectedDrawingIds.has(drawing.id)).map(drawing => drawing.color).filter(Boolean))];
      if (selectedColors.length === 1 && /^#[0-9a-f]{6}$/i.test(selectedColors[0])) colorInput.value = selectedColors[0];
    }

    function renderPreview() {
      previewLayer.innerHTML = "";

      if (!currentDraft) {
        return;
      }

      const shape = createShapeElement(currentDraft, true);
      if (shape) {
        if (isFogLayer) previewLayer.appendChild(createFogDefinitions());
        previewLayer.appendChild(shape);
      }
    }

    function updateSvgSize() {
      const { width, height } = getMapSize();
      const viewBox = `0 0 ${width} ${height}`;

      drawingLayer.setAttribute("viewBox", viewBox);
      previewLayer.setAttribute("viewBox", viewBox);
      renderDrawings();
      renderPreview();
    }

    function setTool(tool) {
      if (!isEditable && tool !== "pan") return;
      if (tool !== currentTool) {
        currentDraft = null;
        triangleClickStage = 0;
        activePointerId = null;
        isPointerDown = false;
        renderPreview();
      }
      currentTool = tool;
      activeButtons.forEach((button, name) => {
        button.classList.toggle("is-active", name === tool);
      });

      if (tool === "pan") {
        previewLayer.style.pointerEvents = "none";
        previewLayer.style.cursor = "default";
        activePointerId = null;
        isPointerDown = false;
        currentDraft = null;
        renderPreview();
      } else {
        previewLayer.style.pointerEvents = "auto";
        previewLayer.style.cursor = "crosshair";
      }
    }

    function setVisible(isVisible) {
      toolbar.style.display = isVisible ? "flex" : "none";
    }

    async function discardLocalState() {
      if (moveFlushTimer) clearTimeout(moveFlushTimer);
      moveFlushTimer = null;
      pendingMoveChanges = null;
      await moveWriteChain;
      localMoveOverrides.clear();
      currentDraft = null;
      activePointerId = null;
      isPointerDown = false;
      triangleClickStage = 0;
      objectDrag = null;
      rotationDrag = null;
      pivotDrag = null;
      selectedDrawingIds.clear();
      rotationPivotState.selectionKey = "";
      rotationPivotState.customPoint = null;
      renderPreview();
      if (isFogLayer) renderDrawings();
      else renderAllSelections();
    }

    function createBaseDrawing(type, point) {
      const minDimension = Math.min(getMapSize().width, getMapSize().height);
      const drawing = {
        id: generateDrawingId(),
        _boardGeneration: boardSync.generation,
        type,
        color: currentColor,
        strokeRatio: roundRatio(4 / Math.max(1, minDimension)),
        start: { x: point.x, y: point.y },
        end: { x: point.x, y: point.y }
      };
      if (isMeasurementLayer) {
        drawing.kind = "measurement";
        drawing.distanceFeet = 30;
        drawing.pixelsPerFiveFeet = Math.max(1, Number(options.getMediumTokenSize?.()) || 100);
      }
      return drawing;
    }

    function sanitizeDrawing(drawing) {
      const sanitized = {
        id: drawing.id,
        type: drawing.type,
        color: drawing.color,
        strokeRatio: drawing.strokeRatio,
        rotation: Number(Number(drawing.rotation || 0).toFixed(2))
      };
      if (drawing.kind === "measurement") {
        sanitized.kind = "measurement";
        sanitized.distanceFeet = Math.max(1, Math.round(Number(drawing.distanceFeet) || 1));
        sanitized.pixelsPerFiveFeet = Math.max(1, Number(drawing.pixelsPerFiveFeet) || 100);
      }

      if (drawing.type === "pen" || drawing.type === "lasso-fill" || drawing.type === "lasso-erase") {
        sanitized.points = (drawing.points || []).map(point => ({
          x: roundRatio(point.x),
          y: roundRatio(point.y)
        }));
      } else {
        sanitized.start = {
          x: roundRatio(drawing.start.x),
          y: roundRatio(drawing.start.y)
        };
        sanitized.end = {
          x: roundRatio(drawing.end.x),
          y: roundRatio(drawing.end.y)
        };
        if (drawing.type === "triangle" && drawing.widthPoint) {
          sanitized.widthPoint = {
            x: roundRatio(drawing.widthPoint.x),
            y: roundRatio(drawing.widthPoint.y)
          };
        }
      }

      return sanitized;
    }

    function isMeaningfulDrawing(drawing) {
      if (!drawing) {
        return false;
      }

      if (drawing.kind === "measurement") {
        if (drawing.type === "ruler") {
          const start = ratioPointToPixels(drawing.start);
          const end = ratioPointToPixels(drawing.end);
          return distanceBetweenPoints(start, end) > 6;
        }
        return Number(drawing.distanceFeet) >= 1;
      }

      if (drawing.type === "pen") {
        return (drawing.points || []).length > 1;
      }

      if (drawing.type === "lasso-fill" || drawing.type === "lasso-erase") {
        if ((drawing.points || []).length < 3) return false;
        const pixels = drawing.points.map(ratioPointToPixels);
        const bounds = pixels.reduce((result, point) => ({
          left: Math.min(result.left, point.x),
          right: Math.max(result.right, point.x),
          top: Math.min(result.top, point.y),
          bottom: Math.max(result.bottom, point.y)
        }), { left: Infinity, right: -Infinity, top: Infinity, bottom: -Infinity });
        return bounds.right - bounds.left > 6 && bounds.bottom - bounds.top > 6;
      }

      if (drawing.type === "triangle") {
        if (!drawing.widthPoint) return false;
        const points = getTrianglePixels(drawing);
        return distanceBetweenPoints(points[0], ratioPointToPixels(drawing.end)) > 6 && distanceBetweenPoints(points[1], points[2]) > 6;
      }

      const start = ratioPointToPixels(drawing.start);
      const end = ratioPointToPixels(drawing.end);
      return distanceBetweenPoints(start, end) > 6;
    }

    function addDrawingToFirebase(drawing) {
      return boardSync.addDrawing(syncLayer, sanitizeDrawing(drawing), drawing._boardGeneration).catch(error => {
        console.error('Failed to add drawing:', error);
        if (typeof reportBoardSyncError === 'function') reportBoardSyncError(error);
      });
    }

    function removeDrawingFromFirebase(drawingId) {
      return boardSync.removeDrawings(syncLayer, [drawingId]).catch(error => {
        console.error('Failed to remove drawing:', error);
        if (typeof reportBoardSyncError === 'function') reportBoardSyncError(error);
      });
    }

    function hitTestDrawing(pointRatio) {
      const point = ratioPointToPixels(pointRatio);

      for (let index = drawings.length - 1; index >= 0; index -= 1) {
        const drawing = drawings[index];
        const tolerance = Math.max(10, getStrokePixels(drawing) + 6);

        if (drawing.kind === "measurement") {
          const geometry = getMeasurementGeometry(drawing);
          if (drawing.type === "circle" && distanceBetweenPoints(point, geometry.start) <= geometry.length + tolerance) return drawing;
          if (drawing.type === "square") {
            const half = geometry.length / 2;
            const vertices = [
              { x: geometry.start.x + geometry.direction.x * half + geometry.perpendicular.x * half, y: geometry.start.y + geometry.direction.y * half + geometry.perpendicular.y * half },
              { x: geometry.start.x + geometry.direction.x * half - geometry.perpendicular.x * half, y: geometry.start.y + geometry.direction.y * half - geometry.perpendicular.y * half },
              { x: geometry.start.x - geometry.direction.x * half - geometry.perpendicular.x * half, y: geometry.start.y - geometry.direction.y * half - geometry.perpendicular.y * half },
              { x: geometry.start.x - geometry.direction.x * half + geometry.perpendicular.x * half, y: geometry.start.y - geometry.direction.y * half + geometry.perpendicular.y * half }
            ];
            if (isPointInPolygon(point, vertices)) return drawing;
          }
          if (drawing.type === "line" && distancePointToSegment(point, geometry.start, geometry.end) <= geometry.pixelsPerFiveFeet / 2 + tolerance) return drawing;
          if (drawing.type === "ruler" && distancePointToSegment(point, geometry.start, geometry.end) <= tolerance) return drawing;
          if (drawing.type === "cone") {
            const halfWidth = geometry.length / 2;
            const vertices = [geometry.start,
              { x: geometry.end.x + geometry.perpendicular.x * halfWidth, y: geometry.end.y + geometry.perpendicular.y * halfWidth },
              { x: geometry.end.x - geometry.perpendicular.x * halfWidth, y: geometry.end.y - geometry.perpendicular.y * halfWidth }];
            if (isPointInPolygon(point, vertices)) return drawing;
          }
          continue;
        }

        const testPoint = rotatePoint(point, getDrawingPivot(drawing), -Number(drawing.rotation || 0));

        if (drawing.type === "pen") {
          const points = (drawing.points || []).map(ratioPointToPixels);
          for (let i = 0; i < points.length - 1; i += 1) {
            if (distancePointToSegment(testPoint, points[i], points[i + 1]) <= tolerance) {
              return drawing;
            }
          }
          continue;
        }

        if (drawing.type === "lasso-fill") {
          const vertices = (drawing.points || []).map(ratioPointToPixels);
          if (vertices.length >= 3 && isPointInPolygon(testPoint, vertices)) {
            return drawing;
          }
          continue;
        }

        if (drawing.type === "lasso-erase") {
          continue;
        }

        if (drawing.type === "line") {
          const start = ratioPointToPixels(drawing.start);
          const end = ratioPointToPixels(drawing.end);
          if (distancePointToSegment(testPoint, start, end) <= tolerance) {
            return drawing;
          }
          continue;
        }

        if (drawing.type === "rectangle") {
          const bounds = getRectangleBounds(drawing);
          const withinBounds = testPoint.x >= bounds.left - tolerance
            && testPoint.x <= bounds.right + tolerance
            && testPoint.y >= bounds.top - tolerance
            && testPoint.y <= bounds.bottom + tolerance;

          if (withinBounds) {
            return drawing;
          }
          continue;
        }

        if (drawing.type === "circle") {
          const geometry = getCircleGeometry(drawing);
          if (distanceBetweenPoints(testPoint, geometry.center) <= geometry.radius + tolerance) {
            return drawing;
          }
          continue;
        }

        if (drawing.type === "triangle") {
          const vertices = getTrianglePixels(drawing);
          const nearEdge = vertices.some((vertex, vertexIndex) => {
            const nextVertex = vertices[(vertexIndex + 1) % vertices.length];
            return distancePointToSegment(testPoint, vertex, nextVertex) <= tolerance;
          });

          if (nearEdge || isPointInPolygon(testPoint, vertices)) {
            return drawing;
          }
        }
      }

      return null;
    }

    function finishCurrentDrawing() {
      const draft = currentDraft;
      currentDraft = null;
      renderPreview();

      if (!isMeaningfulDrawing(draft)) {
        return;
      }

      addDrawingToFirebase(draft);
    }

    previewLayer.addEventListener("pointerdown", event => {
      if (currentTool === "pan") {
        return;
      }

      if (activePointerId !== null) {
        return;
      }

      const point = getPointerRatioPoint(event);
      if (!point) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();

      activePointerId = event.pointerId;
      isPointerDown = true;
      previewLayer.setPointerCapture(event.pointerId);

      if (currentTool === "eraser") {
        const hitDrawing = hitTestDrawing(point);
        if (hitDrawing) {
          removeDrawingFromFirebase(hitDrawing.id);
        }
        return;
      }

      if (currentTool === "triangle") {
        if (triangleClickStage === 0) {
          currentDraft = createBaseDrawing("triangle", point);
          triangleClickStage = 1;
        } else if (triangleClickStage === 2) {
          currentDraft.widthPoint = point;
          triangleClickStage = 3;
        }
      } else if (currentTool === "pen" || currentTool === "lasso-fill" || currentTool === "lasso-erase") {
        currentDraft = {
          id: generateDrawingId(),
          _boardGeneration: boardSync.generation,
          type: currentTool,
          color: currentColor,
          strokeRatio: roundRatio(4 / Math.max(1, Math.min(getMapSize().width, getMapSize().height))),
          points: [point]
        };
      } else {
        currentDraft = createBaseDrawing(currentTool, point);
      }

      renderPreview();
    });

    previewLayer.addEventListener("pointermove", event => {
      if (currentTool === "triangle" && triangleClickStage === 2 && !isPointerDown && currentDraft) {
        const previewPoint = getPointerRatioPoint(event);
        if (previewPoint) {
          currentDraft.widthPoint = previewPoint;
          renderPreview();
        }
        return;
      }

      if (!isPointerDown || event.pointerId !== activePointerId) {
        return;
      }

      const point = getPointerRatioPoint(event);
      if (!point) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();

      if (currentTool === "eraser") {
        return;
      }

      if (!currentDraft) {
        return;
      }

      if (currentDraft.type === "triangle") {
        if (triangleClickStage === 1) currentDraft.end = point;
      } else if (currentDraft.type === "pen" || currentDraft.type === "lasso-fill" || currentDraft.type === "lasso-erase") {
        const lastPoint = currentDraft.points[currentDraft.points.length - 1];
        if (!lastPoint || Math.abs(lastPoint.x - point.x) >= 0.002 || Math.abs(lastPoint.y - point.y) >= 0.002) {
          currentDraft.points.push(point);
        }
      } else {
        currentDraft.end = point;
        if (currentDraft.kind === "measurement") {
          const start = ratioPointToPixels(currentDraft.start);
          const end = ratioPointToPixels(currentDraft.end);
          currentDraft.distanceFeet = Math.max(1, Math.round(distanceBetweenPoints(start, end) / currentDraft.pixelsPerFiveFeet * 5));
        }
      }

      renderPreview();
    });

    function releasePointer(event) {
      if (event.pointerId !== activePointerId) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();

      if (previewLayer.hasPointerCapture(event.pointerId)) {
        previewLayer.releasePointerCapture(event.pointerId);
      }

      isPointerDown = false;
      activePointerId = null;

      if (currentTool === "triangle") {
        if (triangleClickStage === 1) {
          const start = ratioPointToPixels(currentDraft.start);
          const end = ratioPointToPixels(currentDraft.end);
          if (distanceBetweenPoints(start, end) <= 6) {
            currentDraft = null;
            triangleClickStage = 0;
          } else {
            currentDraft.widthPoint = { ...currentDraft.end };
            triangleClickStage = 2;
          }
          renderPreview();
        } else if (triangleClickStage >= 3) {
          finishCurrentDrawing();
          triangleClickStage = 0;
        }
      } else if (currentTool !== "eraser") {
        finishCurrentDrawing();
      }
    }

    previewLayer.addEventListener("pointerup", releasePointer);
    previewLayer.addEventListener("pointercancel", releasePointer);

    previewLayer.addEventListener("contextmenu", event => {
      if (currentTool !== "pan") {
        event.preventDefault();
      }
    });

    function clearSelection() {
      if (!selectedDrawingIds.size) return;
      selectedDrawingIds.clear();
      renderAllSelections();
    }

    function selectWithinLasso(polygon, additive = true) {
      if (isFogLayer || !Array.isArray(polygon) || polygon.length < 3) return 0;
      if (!additive) selectedDrawingIds.clear();
      drawings.forEach(drawing => {
        if (selectionPoints(drawing).some(point => isPointInPolygon(point, polygon))) selectedDrawingIds.add(drawing.id);
      });
      renderAllSelections();
      return selectedDrawingIds.size;
    }

    if (!isFogLayer && !mapTransformLayer.__mapObjectKeyboardDeleteInstalled) {
      mapTransformLayer.__mapObjectKeyboardDeleteInstalled = true;
      document.addEventListener("keydown", event => {
        if ((event.key !== "Delete" && event.key !== "Backspace") || shouldIgnoreMapDeleteTarget(event.target)) return;
        if (!selectionRegistry.some(bridge => bridge.getSelected().length)) return;
        event.preventDefault();
        event.stopPropagation();
        deleteCompositeSelection();
      });
    }

    drawingLayer.addEventListener("pointerdown", event => {
      if (!isEditable || isFogLayer || currentTool !== "pan" || event.button !== 0 || event.target.closest?.("input")) return;
      const target = event.target.closest?.("[data-drawing-id]");
      const drawingId = target?.dataset.drawingId;
      if (!drawingId) return;
      event.preventDefault(); event.stopPropagation();
      if (target.dataset.rotationPivotHandle === "true") {
        const point = getPointerRatioPoint(event);
        const entries = getCompositeSelection();
        if (!entries.length || !point) return;
        const pointer = ratioPointToPixels(point);
        const pivot = getRotationPivot(entries);
        pivotDrag = {
          pointerId: event.pointerId,
          selectionKey: getSelectionKey(entries),
          offset: { x: pivot.x - pointer.x, y: pivot.y - pointer.y }
        };
        rotationPivotState.selectionKey = pivotDrag.selectionKey;
        rotationPivotState.customPoint = { ...pivot };
        drawingLayer.setPointerCapture?.(event.pointerId);
        renderAllSelections();
        return;
      }
      if (target.dataset.rotationHandle === "true") {
        const point = getPointerRatioPoint(event);
        const entries = getCompositeSelection();
        if (!entries.length || !point) return;
        const pivot = getRotationPivot(entries);
        const pointer = ratioPointToPixels(point);
        rotationPivotState.selectionKey = getSelectionKey(entries);
        rotationPivotState.customPoint = { ...pivot };
        rotationDrag = {
          pointerId: event.pointerId,
          pivot,
          startAngle: Math.atan2(pointer.y - pivot.y, pointer.x - pivot.x),
          entries: entries.map(entry => ({ bridge: entry.bridge, original: cloneDrawing(entry.drawing) }))
        };
        drawingLayer.setPointerCapture?.(event.pointerId);
        return;
      }
      if (event.ctrlKey || event.metaKey) {
        if (selectedDrawingIds.has(drawingId)) selectedDrawingIds.delete(drawingId);
        else selectedDrawingIds.add(drawingId);
        renderAllSelections();
        return;
      }
      if (!selectedDrawingIds.has(drawingId)) {
        selectionRegistry.forEach(bridge => bridge.clear());
        selectedDrawingIds.add(drawingId);
        renderAllSelections();
      }
      const point = getPointerRatioPoint(event);
      if (!point) return;
      objectDrag = {
        pointerId: event.pointerId,
        start: point,
        moved: false,
        translation: beginCompositeTranslation(),
        tokenTranslation: options.tokenSelectionBridge?.begin?.() || null
      };
      drawingLayer.setPointerCapture?.(event.pointerId);
    });

    drawingLayer.addEventListener("pointermove", event => {
      if (pivotDrag && event.pointerId === pivotDrag.pointerId) {
        const point = getPointerRatioPoint(event);
        if (!point) return;
        event.preventDefault(); event.stopPropagation();
        const { width, height } = getMapSize();
        const pixels = ratioPointToPixels(point);
        rotationPivotState.selectionKey = pivotDrag.selectionKey;
        rotationPivotState.customPoint = {
          x: Math.max(0, Math.min(width, pixels.x + pivotDrag.offset.x)),
          y: Math.max(0, Math.min(height, pixels.y + pivotDrag.offset.y))
        };
        renderAllSelections();
        return;
      }
      if (rotationDrag && event.pointerId === rotationDrag.pointerId) {
        const point = getPointerRatioPoint(event);
        if (!point) return;
        event.preventDefault(); event.stopPropagation();
        const pointer = ratioPointToPixels(point);
        const delta = (Math.atan2(pointer.y - rotationDrag.pivot.y, pointer.x - rotationDrag.pivot.x) - rotationDrag.startAngle) * 180 / Math.PI;
        const bridges = new Set();
        rotationDrag.entries.forEach(entry => {
          entry.bridge.applyRotation(entry.original, delta, rotationDrag.pivot);
          bridges.add(entry.bridge);
        });
        bridges.forEach(bridge => bridge.render());
        bridges.forEach(bridge => bridge.queue(false));
        return;
      }
      if (!objectDrag || event.pointerId !== objectDrag.pointerId) return;
      const point = getPointerRatioPoint(event);
      if (!point) return;
      event.preventDefault(); event.stopPropagation();
      let dx = point.x - objectDrag.start.x, dy = point.y - objectDrag.start.y;
      const points = [...objectDrag.translation.points, ...(options.tokenSelectionBridge?.points?.(objectDrag.tokenTranslation) || [])];
      if (points.length) {
        dx = Math.max(-Math.min(...points.map(item => item.x)), Math.min(1 - Math.max(...points.map(item => item.x)), dx));
        dy = Math.max(-Math.min(...points.map(item => item.y)), Math.min(1 - Math.max(...points.map(item => item.y)), dy));
      }
      objectDrag.moved ||= Math.hypot(dx * getMapSize().width, dy * getMapSize().height) > 2;
      moveCompositeTranslation(objectDrag.translation, dx, dy);
      options.tokenSelectionBridge?.move?.(objectDrag.tokenTranslation, dx, dy);
    });

    function releaseObjectDrag(event) {
      if (!objectDrag || event.pointerId !== objectDrag.pointerId) return;
      event.preventDefault(); event.stopPropagation();
      const moved = objectDrag.moved;
      const translation = objectDrag.translation;
      const tokenTranslation = objectDrag.tokenTranslation;
      objectDrag = null;
      if (drawingLayer.hasPointerCapture?.(event.pointerId)) drawingLayer.releasePointerCapture(event.pointerId);
      endCompositeTranslation(translation, moved);
      options.tokenSelectionBridge?.end?.(tokenTranslation, moved);
    }
    function releaseRotationDrag(event) {
      if (!rotationDrag || event.pointerId !== rotationDrag.pointerId) return;
      event.preventDefault(); event.stopPropagation();
      const bridges = new Set(rotationDrag.entries.map(entry => entry.bridge));
      rotationDrag = null;
      if (drawingLayer.hasPointerCapture?.(event.pointerId)) drawingLayer.releasePointerCapture(event.pointerId);
      bridges.forEach(bridge => bridge.queue(true));
    }
    function releasePivotDrag(event) {
      if (!pivotDrag || event.pointerId !== pivotDrag.pointerId) return;
      event.preventDefault(); event.stopPropagation();
      pivotDrag = null;
      if (drawingLayer.hasPointerCapture?.(event.pointerId)) drawingLayer.releasePointerCapture(event.pointerId);
    }
    drawingLayer.addEventListener("pointerup", releasePivotDrag);
    drawingLayer.addEventListener("pointercancel", releasePivotDrag);
    drawingLayer.addEventListener("pointerup", releaseRotationDrag);
    drawingLayer.addEventListener("pointercancel", releaseRotationDrag);
    drawingLayer.addEventListener("pointerup", releaseObjectDrag);
    drawingLayer.addEventListener("pointercancel", releaseObjectDrag);
    drawingLayer.addEventListener("contextmenu", event => event.preventDefault());

    boardSync.subscribe(syncLayer, (nextDrawings, { reset }) => {
      if (reset) { currentDraft = null; activePointerId = null; renderPreview(); }
      drawings.length = 0;
      nextDrawings
        .filter(drawing => isMeasurementLayer ? drawing.kind === "measurement" : (isFogLayer || drawing.kind !== "measurement"))
        .forEach(drawing => drawings.push(localMoveOverrides.get(drawing.id) || drawing));
      selectedDrawingIds.forEach(id => { if (!drawings.some(drawing => drawing.id === id)) selectedDrawingIds.delete(id); });
      if (isFogLayer) renderDrawings();
      else renderAllSelections();
    });

    mapImage.addEventListener("load", updateSvgSize);
    window.addEventListener("resize", updateSvgSize);

    if (typeof ResizeObserver === "function") {
      const observer = new ResizeObserver(() => updateSvgSize());
      observer.observe(mapImage);
    }

    setTool("pan");
    updateSvgSize();

    return {
      setTool,
      setVisible,
      toolbar,
      clearSelection,
      selectWithinLasso,
      deleteSelection: deleteCompositeSelection,
      discardLocalState,
      beginSelectionTranslation: beginCompositeTranslation,
      moveSelectionTranslation: moveCompositeTranslation,
      endSelectionTranslation: endCompositeTranslation,
      updateSize: updateSvgSize
    };
  }

  function setupMapDrawingTabs(drawingManager, fogManager, measurementManager) {
    const shell = document.createElement("div");
    shell.className = "map-tool-tabs";
    const buttons = document.createElement("div");
    buttons.className = "map-tool-tab-buttons";
    const panes = document.createElement("div");
    shell.append(panes, buttons);

    const tabs = [
      measurementManager && {
        label: "Measurement",
        title: "Area and distance measurement tools",
        icon: '<svg viewBox="0 0 48 24" aria-hidden="true"><path d="M8 20A16 16 0 0 1 40 20H8Z" fill="none" stroke="currentColor" stroke-width="2"/><path d="M24 20 34 8M14 20h20M24 5v4M13 11l3 3M35 11l-3 3" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
        manager: measurementManager
      },
      {
        label: "Drawing",
        title: "Drawing tools",
        icon: '<svg viewBox="0 0 80 20" aria-hidden="true"><path d="M3 14c8-8 14 7 22-1s14 6 23-1" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="m55 14 13-12 7 7-13 12-8 1 1-8Z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="m66 4 7 7" stroke="currentColor" stroke-width="2"/></svg>',
        manager: drawingManager
      },
      fogManager && {
        label: "Fog of War",
        title: "Fog of war tools",
        icon: '<svg viewBox="0 0 58 22" aria-hidden="true"><path d="M8 18h17a6 6 0 0 0 0-12 8 8 0 0 0-14-2A7 7 0 0 0 8 18Z" fill="currentColor" opacity=".52"/><path d="M23 19h19a6 6 0 0 0 1-12 8 8 0 0 0-15-2 7 7 0 0 0-5 14Z" fill="currentColor" opacity=".72"/><path d="M13 20h30a5 5 0 0 0 1-10 7 7 0 0 0-13-2 6 6 0 0 0-10 3 5 5 0 0 0-8 4 5 5 0 0 0 0 5Z" fill="currentColor"/></svg>',
        manager: fogManager
      }
    ].filter(Boolean);
    let activeManager = null;

    tabs.forEach(tab => {
      const button = document.createElement("button");
      button.type = "button";
      button.innerHTML = tab.icon;
      button.title = tab.title;
      button.setAttribute("aria-label", tab.label);
      button.setAttribute("aria-expanded", "false");
      tab.manager.toolbar.classList.add("is-tabbed");
      tab.manager.toolbar.classList.remove("is-collapsed");
      tab.manager.toolbar.style.display = "none";
      panes.appendChild(tab.manager.toolbar);
      button.addEventListener("click", () => {
        const shouldClose = activeManager === tab.manager;
        if (activeManager) activeManager.setTool("pan");
        activeManager = shouldClose ? null : tab.manager;
        tabs.forEach(item => { item.manager.toolbar.style.display = item.manager === activeManager ? "flex" : "none"; });
        Array.from(buttons.children).forEach(item => {
          const isActive = item === button && !shouldClose;
          item.classList.toggle("is-active", isActive);
          item.setAttribute("aria-expanded", String(isActive));
        });
      });
      buttons.appendChild(button);
    });

    document.body.appendChild(shell);
    return {
      toolbar: shell,
      setVisible(isVisible) { shell.style.display = isVisible ? "block" : "none"; },
      setTool(tool) {
        if (tool === "pan") tabs.forEach(tab => tab.manager.setTool("pan"));
        else activeManager.setTool(tool);
      },
      updateSize() { tabs.forEach(tab => tab.manager.updateSize()); },
      clearSelection() { tabs.forEach(tab => tab.manager.clearSelection?.()); },
      discardLocalState() { return Promise.all(tabs.map(tab => tab.manager.discardLocalState?.())); },
      selectWithinLasso(polygon, additive = true) {
        return tabs.reduce((count, tab) => count + (tab.manager.selectWithinLasso?.(polygon, additive) || 0), 0);
      },
      beginSelectionTranslation() { return drawingManager.beginSelectionTranslation?.(); },
      moveSelectionTranslation(session, dx, dy) { drawingManager.moveSelectionTranslation?.(session, dx, dy); },
      endSelectionTranslation(session, moved = true) { drawingManager.endSelectionTranslation?.(session, moved); }
    };
  }

  if (typeof window !== "undefined") {
    window.setupSharedMapDrawing = setupSharedMapDrawing;
    window.setupMapDrawingTabs = setupMapDrawingTabs;
  }
  if (typeof module !== "undefined") module.exports = { translateDrawing, rotatePoint, boundsCentroid, isPointInPolygon, shouldIgnoreMapDeleteTarget, fogDrawingsCoverPoint };
})();
