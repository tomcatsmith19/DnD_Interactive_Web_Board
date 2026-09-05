(function () {
  function setupMapTokenPlacement(options) {
    const { mapImage, mapSurface, getTokenSrc, onPlace } = options;
    if (!mapImage || !mapSurface || typeof getTokenSrc !== "function" || typeof onPlace !== "function") {
      throw new Error("setupMapTokenPlacement requires mapImage, mapSurface, getTokenSrc, and onPlace.");
    }

    const queue = [];
    let lastPointer = { x: window.innerWidth / 2, y: window.innerHeight / 2 };

    const preview = document.createElement("div");
    preview.setAttribute("aria-live", "polite");
    Object.assign(preview.style, {
      position: "fixed",
      display: "none",
      alignItems: "center",
      gap: "7px",
      padding: "5px 8px 5px 5px",
      border: "2px solid #d4af37",
      borderRadius: "999px",
      background: "rgba(29, 16, 9, 0.94)",
      color: "#f4d76d",
      fontFamily: "'MedievalSharp', cursive",
      fontSize: "12px",
      boxShadow: "0 5px 18px rgba(0, 0, 0, 0.55)",
      pointerEvents: "none",
      zIndex: "6000"
    });

    const image = document.createElement("img");
    image.alt = "";
    Object.assign(image.style, {
      width: "42px",
      height: "42px",
      objectFit: "cover",
      borderRadius: "50%",
      border: "1px solid #f4d76d",
      background: "#1d1009"
    });
    const status = document.createElement("span");
    preview.append(image, status);
    document.body.appendChild(preview);

    function positionPreview() {
      if (!queue.length) return;
      const width = preview.offsetWidth || 130;
      const height = preview.offsetHeight || 54;
      preview.style.left = `${Math.min(window.innerWidth - width - 6, lastPointer.x + 16)}px`;
      preview.style.top = `${Math.max(4, Math.min(window.innerHeight - height - 6, lastPointer.y - height - 14))}px`;
    }

    function renderPreview() {
      const next = queue[0];
      if (!next) {
        preview.style.display = "none";
        mapSurface.style.removeProperty("cursor");
        return;
      }
      image.src = getTokenSrc(next);
      status.textContent = queue.length > 1 ? `Place ${next.name} · ${queue.length} queued` : `Place ${next.name}`;
      preview.style.display = "flex";
      mapSurface.style.cursor = "crosshair";
      positionPreview();
    }

    function enqueue(tokens) {
      (Array.isArray(tokens) ? tokens : [tokens]).filter(Boolean).forEach(token => queue.push(token));
      renderPreview();
    }

    document.addEventListener("pointermove", event => {
      lastPointer = { x: event.clientX, y: event.clientY };
      positionPreview();
    });

    mapSurface.addEventListener("pointerdown", event => {
      if (!queue.length || event.button !== 0) return;
      const bounds = mapImage.getBoundingClientRect();
      if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) return;

      event.preventDefault();
      event.stopImmediatePropagation();
      const token = queue.shift();
      token.xRatio = Math.max(0, Math.min(1, (event.clientX - bounds.left) / bounds.width));
      token.yRatio = Math.max(0, Math.min(1, (event.clientY - bounds.top) / bounds.height));
      Promise.resolve(onPlace(token)).catch(error => {
        console.error("Failed to place queued token:", error);
      });
      renderPreview();
    }, true);

    document.addEventListener("keydown", event => {
      if (event.key !== "Escape" || !queue.length) return;
      queue.length = 0;
      renderPreview();
    });

    return { enqueue, getQueueLength: () => queue.length };
  }

  window.setupMapTokenPlacement = setupMapTokenPlacement;
})();
