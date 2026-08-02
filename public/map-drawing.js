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
        background: rgba(0, 0, 0, 0.78);
        border: 1px solid rgba(255, 215, 0, 0.45);
        border-radius: 10px;
        z-index: 1100;
        color: white;
        font-family: 'MedievalSharp', cursive;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35);
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
        border: 1px solid #FFD700;
        background: #2d2d2d;
        color: #FFD700;
        font-family: inherit;
        cursor: pointer;
      }

      .drawing-toolbar button:hover {
        background: #3c3c3c;
      }

      .drawing-toolbar button.is-active {
        background: #FFD700;
        color: #111;
      }

      .drawing-toolbar input[type="color"] {
        width: 44px;
        padding: 0;
        border: 1px solid #FFD700;
        background: transparent;
        cursor: pointer;
      }

      .drawing-toolbar .drawing-toolbar-label {
        font-size: 0.95rem;
        color: #FFD700;
        text-align: center;
      }

      .drawing-toolbar .drawing-toolbar-danger {
        border-color: #ff7b7b;
        color: #ffb4b4;
      }

      .drawing-toolbar .drawing-toolbar-danger:hover {
        background: #4b2424;
      }

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

    const drawingsRef = db.collection("shared").doc("drawings");
    const drawings = [];
    const activeButtons = new Map();

    let currentTool = "pan";
    let currentColor = "#ff5252";
    let activePointerId = null;
    let currentDraft = null;
    let isPointerDown = false;
    let triangleClickStage = 0;

    const drawingLayer = createSvgElement("svg", {
      id: "mapDrawingLayer",
      class: "map-drawing-overlay",
      "aria-hidden": "true"
    });
    drawingLayer.style.pointerEvents = "none";
    drawingLayer.style.zIndex = "2";

    const previewLayer = createSvgElement("svg", {
      id: "mapDrawingPreviewLayer",
      class: "map-drawing-preview"
    });
    previewLayer.style.pointerEvents = "none";
    previewLayer.style.touchAction = "none";
    previewLayer.style.zIndex = "4";

    mapTransformLayer.insertBefore(drawingLayer, tokenLayer);
    mapTransformLayer.appendChild(previewLayer);

    const toolbar = document.createElement("div");
    toolbar.className = "drawing-toolbar";
    toolbar.style.left = toolbarPosition?.left || "25px";
    toolbar.style.top = toolbarPosition?.top || "80px";

    const toolLabel = document.createElement("span");
    toolLabel.className = "drawing-toolbar-label";
    toolLabel.textContent = "Draw";
    toolbar.appendChild(toolLabel);

    function addToolButton(label, tool) {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = label;
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
    addToolButton("Eraser", "eraser");

    const colorLabel = document.createElement("span");
    colorLabel.className = "drawing-toolbar-label";
    colorLabel.textContent = "Color";
    toolbar.appendChild(colorLabel);

    const colorInput = document.createElement("input");
    colorInput.type = "color";
    colorInput.value = currentColor;
    colorInput.title = "Drawing color";
    colorInput.addEventListener("input", () => {
      currentColor = colorInput.value;
    });
    toolbar.appendChild(colorInput);

    const clearButton = document.createElement("button");
    clearButton.type = "button";
    clearButton.className = "drawing-toolbar-danger";
    clearButton.textContent = "Erase All";
    clearButton.addEventListener("click", () => {
      if (!confirm("Erase all shared drawings?")) {
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
      const sharedAttributes = {
        fill: "none",
        stroke: drawing.color || currentColor,
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

    function renderDrawings() {
      drawingLayer.innerHTML = "";

      drawings.forEach(drawing => {
        const shape = createShapeElement(drawing, false);
        if (!shape) {
          return;
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

      if (drawing.type === "pen") {
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
      } else if (currentTool === "pen") {
        currentDraft = {
          id: generateDrawingId(),
          type: "pen",
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
      } else if (currentDraft.type === "pen") {
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

  window.setupSharedMapDrawing = setupSharedMapDrawing;
})();
