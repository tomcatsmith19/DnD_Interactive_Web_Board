(function () {
  function setupMapTokenPlacement(options) {
    const { mapImage, mapSurface, getTokenSrc, onPlace } = options;
    if (!mapImage || !mapSurface || typeof getTokenSrc !== "function" || typeof onPlace !== "function") {
      throw new Error("setupMapTokenPlacement requires mapImage, mapSurface, getTokenSrc, and onPlace.");
    }

    const queue = [];
    let lastPointer = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const preview = document.createElement("div");
    preview.setAttribute("aria-hidden", "true");
    Object.assign(preview.style, {
      position: "fixed", display: "none", width: "58px", height: "58px", padding: "0", border: "0",
      background: "transparent", pointerEvents: "none", zIndex: "6000"
    });

    const imageWrap = document.createElement("span");
    Object.assign(imageWrap.style, { position: "relative", display: "block", width: "58px", height: "58px" });
    const image = document.createElement("img");
    image.alt = "";
    Object.assign(image.style, {
      width: "58px", height: "58px", objectFit: "cover", borderRadius: "50%", boxSizing: "border-box",
      background: "#1d1009", opacity: ".68", filter: "drop-shadow(0 0 4px #f4d76d)"
    });
    const nextImage = document.createElement("img");
    nextImage.alt = "Next token";
    Object.assign(nextImage.style, {
      position: "absolute", display: "none", top: "-8px", right: "-10px", width: "28px", height: "28px",
      objectFit: "cover", borderRadius: "50%", border: "2px solid #f4d76d", boxSizing: "border-box",
      background: "#1d1009", boxShadow: "0 2px 7px rgba(0,0,0,.75)"
    });
    imageWrap.append(image, nextImage);
    preview.append(imageWrap);
    document.body.appendChild(preview);

    function positionPreview() {
      if (!queue.length) return;
      const bounds = mapImage.getBoundingClientRect();
      const overMap = lastPointer.x >= bounds.left && lastPointer.x <= bounds.right && lastPointer.y >= bounds.top && lastPointer.y <= bounds.bottom;
      preview.style.display = overMap ? "block" : "none";
      if (!overMap) return;
      preview.style.left = `${lastPointer.x - 29}px`;
      preview.style.top = `${lastPointer.y - 29}px`;
    }

    function renderPreview() {
      const next = queue[0];
      if (!next) {
        preview.style.display = "none";
        mapSurface.style.removeProperty("cursor");
        return;
      }
      image.src = getTokenSrc(next);
      const following = queue[1];
      nextImage.style.display = following ? "block" : "none";
      if (following) nextImage.src = getTokenSrc(following);
      mapSurface.style.cursor = "crosshair";
      positionPreview();
    }

    function enqueue(tokens) {
      (Array.isArray(tokens) ? tokens : [tokens]).filter(Boolean).forEach(token => queue.push({ ...token, _boardGeneration: options.getGeneration?.() }));
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
      Promise.resolve(onPlace(token)).catch(error => console.error("Failed to place queued token:", error));
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
