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

  function distanceBetweenPoints(a, b) {
    return Math.hypot(a.x - b.x, a.y - b.y);
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

    const drawingsRef = db.collection("shared").doc(options.documentId || "drawings");
    const drawings = [];
    const activeButtons = new Map();
    const isFogLayer = options.layerType === "fog";
    const isEditable = options.editable !== false;
    const layerKey = isFogLayer ? "fogOfWar" : "mapDrawing";

    let currentTool = "pan";
    let currentColor = "#ff5252";
    let activePointerId = null;
    let currentDraft = null;
    let isPointerDown = false;
    let triangleClickStage = 0;

    const drawingLayer = createSvgElement("svg", {
      id: `${layerKey}Layer`,
      class: "map-drawing-overlay",
      "aria-hidden": "true"
    });
    drawingLayer.style.pointerEvents = "none";
    drawingLayer.style.zIndex = isFogLayer ? "20" : "2";

    const previewLayer = createSvgElement("svg", {
      id: `${layerKey}PreviewLayer`,
      class: "map-drawing-preview"
    });
    previewLayer.style.pointerEvents = "none";
    previewLayer.style.touchAction = "none";
    previewLayer.style.zIndex = isFogLayer ? "21" : "4";

    if (isFogLayer) mapTransformLayer.appendChild(drawingLayer);
    else mapTransformLayer.insertBefore(drawingLayer, tokenLayer);
    mapTransformLayer.appendChild(previewLayer);

    const toolbar = document.createElement("div");
    toolbar.className = "drawing-toolbar";
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
    toolLabel.textContent = isFogLayer ? "Fog" : "Draw";
    toolbar.appendChild(toolLabel);

    function addToolButton(label, tool) {
      const button = document.createElement("button");
      button.type = "button";
      const compactIcons = { pan: "✥", pen: "✎", rectangle: "▭", circle: "○", triangle: "△", line: "╱" };
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

    addToolButton("Pan", "pan");
    addToolButton("Pen", "pen");
    addToolButton("Rectangle", "rectangle");
    addToolButton("Circle", "circle");
    addToolButton("Triangle", "triangle");
    addToolButton("Line", "line");
    addToolButton("Lasso Fill", "lasso-fill");
    addToolButton("Lasso Erase", "lasso-erase");
    addToolButton("Eraser", "eraser");

    const colorLabel = document.createElement("span");
    colorLabel.className = "drawing-toolbar-label";
    colorLabel.textContent = "Color";
    if (isFogLayer) colorLabel.style.display = "none";
    toolbar.appendChild(colorLabel);

    const colorInput = document.createElement("input");
    colorInput.type = "color";
    colorInput.value = currentColor;
    colorInput.title = "Drawing color";
    colorInput.addEventListener("input", () => {
      currentColor = colorInput.value;
    });
    if (isFogLayer) colorInput.style.display = "none";
    toolbar.appendChild(colorInput);

    const clearButton = document.createElement("button");
    clearButton.type = "button";
    clearButton.className = "drawing-toolbar-danger";
    clearButton.textContent = isFogLayer ? "Clear Fog" : "Erase All";
    clearButton.addEventListener("click", () => {
      if (!confirm(isFogLayer ? "Clear all fog of war?" : "Erase all shared drawings?")) {
        return;
      }

      drawingsRef.set({
        drawings: [],
        updatedAt: Date.now()
      }, { merge: true }).catch(error => {
        console.error("Failed to erase drawings:", error);
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

      return {
        x: roundRatio((event.clientX - bounds.left) / bounds.width),
        y: roundRatio((event.clientY - bounds.top) / bounds.height)
      };
    }

    function ratioPointToPixels(point) {
      const { width, height } = getMapSize();
      return {
        x: point.x * width,
        y: point.y * height
      };
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

        shape.dataset.drawingId = drawing.id;
        drawingLayer.appendChild(shape);
      });
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

    function createBaseDrawing(type, point) {
      const minDimension = Math.min(getMapSize().width, getMapSize().height);

      return {
        id: generateDrawingId(),
        type,
        color: currentColor,
        strokeRatio: roundRatio(4 / Math.max(1, minDimension)),
        start: { x: point.x, y: point.y },
        end: { x: point.x, y: point.y }
      };
    }

    function sanitizeDrawing(drawing) {
      const sanitized = {
        id: drawing.id,
        type: drawing.type,
        color: drawing.color,
        strokeRatio: drawing.strokeRatio
      };

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
      const nextDrawing = sanitizeDrawing(drawing);

      return db.runTransaction(transaction => {
        return transaction.get(drawingsRef).then(doc => {
          const data = doc.exists ? doc.data() : {};
          const nextDrawings = Array.isArray(data.drawings) ? [...data.drawings] : [];

          if (!nextDrawings.some(item => item.id === nextDrawing.id)) {
            nextDrawings.push(nextDrawing);
          }

          transaction.set(drawingsRef, {
            drawings: nextDrawings,
            updatedAt: Date.now()
          }, { merge: true });
        });
      }).catch(error => {
        console.error("Failed to add drawing:", error);
      });
    }

    function removeDrawingFromFirebase(drawingId) {
      if (!drawingId) {
        return;
      }

      return db.runTransaction(transaction => {
        return transaction.get(drawingsRef).then(doc => {
          const data = doc.exists ? doc.data() : {};
          const nextDrawings = Array.isArray(data.drawings)
            ? data.drawings.filter(item => item.id !== drawingId)
            : [];

          transaction.set(drawingsRef, {
            drawings: nextDrawings,
            updatedAt: Date.now()
          }, { merge: true });
        });
      }).catch(error => {
        console.error("Failed to erase drawing:", error);
      });
    }

    function hitTestDrawing(pointRatio) {
      const point = ratioPointToPixels(pointRatio);

      for (let index = drawings.length - 1; index >= 0; index -= 1) {
        const drawing = drawings[index];
        const tolerance = Math.max(10, getStrokePixels(drawing) + 6);

        if (drawing.type === "pen") {
          const points = (drawing.points || []).map(ratioPointToPixels);
          for (let i = 0; i < points.length - 1; i += 1) {
            if (distancePointToSegment(point, points[i], points[i + 1]) <= tolerance) {
              return drawing;
            }
          }
          continue;
        }

        if (drawing.type === "lasso-fill") {
          const vertices = (drawing.points || []).map(ratioPointToPixels);
          if (vertices.length >= 3 && isPointInPolygon(point, vertices)) {
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
          if (distancePointToSegment(point, start, end) <= tolerance) {
            return drawing;
          }
          continue;
        }

        if (drawing.type === "rectangle") {
          const bounds = getRectangleBounds(drawing);
          const withinBounds = point.x >= bounds.left - tolerance
            && point.x <= bounds.right + tolerance
            && point.y >= bounds.top - tolerance
            && point.y <= bounds.bottom + tolerance;

          if (withinBounds) {
            return drawing;
          }
          continue;
        }

        if (drawing.type === "circle") {
          const geometry = getCircleGeometry(drawing);
          if (distanceBetweenPoints(point, geometry.center) <= geometry.radius + tolerance) {
            return drawing;
          }
          continue;
        }

        if (drawing.type === "triangle") {
          const vertices = getTrianglePixels(drawing);
          const nearEdge = vertices.some((vertex, vertexIndex) => {
            const nextVertex = vertices[(vertexIndex + 1) % vertices.length];
            return distancePointToSegment(point, vertex, nextVertex) <= tolerance;
          });

          if (nearEdge || isPointInPolygon(point, vertices)) {
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

    drawingsRef.onSnapshot(doc => {
      const data = doc.exists ? doc.data() : {};
      const nextDrawings = Array.isArray(data.drawings) ? data.drawings : [];

      drawings.length = 0;
      nextDrawings.forEach(drawing => drawings.push(drawing));
      renderDrawings();
    }, error => {
      console.error("Failed to subscribe to drawings:", error);
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
      updateSize: updateSvgSize
    };
  }

  function setupMapDrawingTabs(drawingManager, fogManager) {
    const shell = document.createElement("div");
    shell.className = "map-tool-tabs";
    const buttons = document.createElement("div");
    buttons.className = "map-tool-tab-buttons";
    const panes = document.createElement("div");
    shell.append(panes, buttons);

    const tabs = [
      {
        label: "Drawing",
        title: "Drawing tools",
        icon: '<svg viewBox="0 0 80 20" aria-hidden="true"><path d="M3 14c8-8 14 7 22-1s14 6 23-1" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="m55 14 13-12 7 7-13 12-8 1 1-8Z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="m66 4 7 7" stroke="currentColor" stroke-width="2"/></svg>',
        manager: drawingManager
      },
      {
        label: "Fog of War",
        title: "Fog of war tools",
        icon: '<svg viewBox="0 0 58 22" aria-hidden="true"><path d="M8 18h17a6 6 0 0 0 0-12 8 8 0 0 0-14-2A7 7 0 0 0 8 18Z" fill="currentColor" opacity=".52"/><path d="M23 19h19a6 6 0 0 0 1-12 8 8 0 0 0-15-2 7 7 0 0 0-5 14Z" fill="currentColor" opacity=".72"/><path d="M13 20h30a5 5 0 0 0 1-10 7 7 0 0 0-13-2 6 6 0 0 0-10 3 5 5 0 0 0-8 4 5 5 0 0 0 0 5Z" fill="currentColor"/></svg>',
        manager: fogManager
      }
    ];
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
      updateSize() { tabs.forEach(tab => tab.manager.updateSize()); }
    };
  }

  window.setupSharedMapDrawing = setupSharedMapDrawing;
  window.setupMapDrawingTabs = setupMapDrawingTabs;
})();
