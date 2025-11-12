(function () {
  const global = window;
  const WeldUtil = global.WeldUtil || {
    escapeHtml(value) {
      if (value === null || value === undefined) return "";
      return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
    }
  };
  const STATE_KEY = "guidedTour";
  const LAYER_CLASS = "guided-tour-layer";
  const HIGHLIGHT_ATTR = "data-guided-tour-highlighted";
  const DEFAULT_GAP = 18;
  const VIEWPORT_MARGIN = 16;

  let layerElement = null;
  let activeScenario = null;
  let rafHandle = null;
  let viewportListenersAttached = false;
  let layerInteractionBound = false;
  const highlightedElements = new Set();
  const scenarioRegistry = new Map();

  function getState() {
    if (global.state && typeof global.state === "object") return global.state;
    if (global.Weld && typeof global.Weld.state === "object") return global.Weld.state;
    return null;
  }

  function ensureLayer() {
    if (layerElement && document.body.contains(layerElement)) {
      return layerElement;
    }
    layerElement = document.createElement("div");
    layerElement.className = LAYER_CLASS;
    layerElement.hidden = true;
    document.body.appendChild(layerElement);
    if (!layerInteractionBound) {
      layerElement.addEventListener("click", handleLayerClick);
      layerInteractionBound = true;
    }
    return layerElement;
  }

  function clearHighlights() {
    highlightedElements.forEach(element => {
      if (element && typeof element.removeAttribute === "function") {
        element.removeAttribute(HIGHLIGHT_ATTR);
      }
    });
    highlightedElements.clear();
  }

  function highlightTarget(element) {
    if (!element || typeof element.setAttribute !== "function") return;
    element.setAttribute(HIGHLIGHT_ATTR, "true");
    highlightedElements.add(element);
  }

  function resolveTarget(step, root) {
    if (!step) return null;
    const candidate = step.element || step.target;
    if (candidate && candidate.nodeType === 1) {
      return candidate;
    }
    if (typeof step.getTarget === "function") {
      try {
        const resolved = step.getTarget(root || document);
        if (resolved && resolved.nodeType === 1) {
          return resolved;
        }
      } catch {
        // ignore resolution errors
      }
    }
    const selector =
      typeof candidate === "string" && candidate.trim().length > 0
        ? candidate.trim()
        : typeof step.selector === "string"
        ? step.selector.trim()
        : null;
    if (selector) {
      const scope = root && typeof root.querySelector === "function" ? root : document;
      return scope.querySelector(selector);
    }
    return null;
  }

  function computePosition(rect, placement = "top", gap = DEFAULT_GAP, offsetX = 0, offsetY = 0) {
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    let top = centerY;
    let left = centerX;

    switch (placement) {
      case "right":
        top = centerY;
        left = rect.right + gap;
        break;
      case "left":
        top = centerY;
        left = rect.left - gap;
        break;
      case "bottom":
        top = rect.bottom + gap;
        left = centerX;
        break;
      case "top":
        top = rect.top - gap;
        left = centerX;
        break;
      case "center":
        top = centerY;
        left = centerX;
        break;
      default:
        top = rect.top - gap;
        left = centerX;
        break;
    }

    return {
      top: top + offsetY,
      left: left + offsetX
    };
  }

  function getViewportSize() {
    const width = Math.max(document.documentElement?.clientWidth || 0, window.innerWidth || 0);
    const height = Math.max(document.documentElement?.clientHeight || 0, window.innerHeight || 0);
    return { width, height };
  }

  function calculateOverflow(stepElement, margin = VIEWPORT_MARGIN) {
    if (!stepElement) {
      return { fits: true, deltaX: 0, deltaY: 0, totalOverflow: 0 };
    }
    const rect = stepElement.getBoundingClientRect();
    const viewport = getViewportSize();
    const excessLeft = Math.max(0, margin - rect.left);
    const excessRight = Math.max(0, rect.right - (viewport.width - margin));
    const excessTop = Math.max(0, margin - rect.top);
    const excessBottom = Math.max(0, rect.bottom - (viewport.height - margin));
    const deltaX = excessLeft > 0 ? excessLeft : excessRight > 0 ? -excessRight : 0;
    const deltaY = excessTop > 0 ? excessTop : excessBottom > 0 ? -excessBottom : 0;
    const totalOverflow = excessLeft + excessRight + excessTop + excessBottom;
    return { fits: totalOverflow === 0, deltaX, deltaY, totalOverflow };
  }

  function applyStepPosition(stepElement, placement, position) {
    if (!stepElement || !position) return;
    stepElement.dataset.placement = placement;
    stepElement.style.setProperty("--tour-top", `${position.top}px`);
    stepElement.style.setProperty("--tour-left", `${position.left}px`);
    stepElement.style.setProperty("--tour-nudge-x", "0px");
    stepElement.style.setProperty("--tour-nudge-y", "0px");
  }

  function applyNudge(stepElement, deltaX, deltaY) {
    if (!stepElement) return;
    stepElement.style.setProperty("--tour-nudge-x", `${deltaX}px`);
    stepElement.style.setProperty("--tour-nudge-y", `${deltaY}px`);
  }

  function buildPlacementQueue(primary, extras) {
    const order = [];
    const fallback = ["bottom", "top", "right", "left", "center"];
    const pushPlacement = value => {
      if (typeof value !== "string") return;
      const normalized = value.trim();
      if (!normalized || order.includes(normalized)) return;
      order.push(normalized);
    };
    pushPlacement(primary);
    if (Array.isArray(extras)) {
      extras.forEach(pushPlacement);
    }
    fallback.forEach(pushPlacement);
    return order.length > 0 ? order : ["top"];
  }

  function selectPlacementWithinViewport(stepElement, rect, options) {
    if (!stepElement || !rect) return;
    const { placement, gap, offsetX, offsetY, altPlacements } = options;
    const candidates = buildPlacementQueue(placement, altPlacements);
    let best = null;

    for (const candidate of candidates) {
      const nextPosition = computePosition(rect, candidate, gap, offsetX, offsetY);
      applyStepPosition(stepElement, candidate, nextPosition);
      const overflow = calculateOverflow(stepElement);
      if (overflow.fits) {
        applyNudge(stepElement, 0, 0);
        return;
      }
      if (!best || overflow.totalOverflow < best.overflow.totalOverflow) {
        best = { placement: candidate, position: nextPosition, overflow };
      }
    }

    if (best) {
      applyStepPosition(stepElement, best.placement, best.position);
      applyNudge(stepElement, best.overflow.deltaX, best.overflow.deltaY);
    }
  }

  function normalizeNumber(value, fallback = 0) {
    const numeric = Number(value);
    return Number.isFinite(numeric) ? numeric : fallback;
  }

  function clampIndex(index, length) {
    if (!Number.isFinite(length) || length <= 0) return 0;
    if (!Number.isFinite(index)) return 0;
    if (length === 1) return 0;
    return Math.min(Math.max(Math.floor(index), 0), length - 1);
  }

  function getStepCount() {
    return activeScenario && Array.isArray(activeScenario.steps) ? activeScenario.steps.length : 0;
  }

  function setActiveStep(index) {
    if (!activeScenario) return;
    const total = getStepCount();
    if (total === 0) return;
    const clamped = clampIndex(index, total);
    if (activeScenario.index === clamped) return;
    activeScenario.index = clamped;
    scheduleRender();
  }

  function nextStep() {
    if (!activeScenario) return;
    const total = getStepCount();
    if (total === 0) return;
    const current = clampIndex(activeScenario.index ?? 0, total);
    if (current >= total - 1) {
      completeScenario();
      return;
    }
    activeScenario.index = current + 1;
    scheduleRender();
  }

  function previousStep() {
    if (!activeScenario) return;
    const total = getStepCount();
    if (total === 0) return;
    const current = clampIndex(activeScenario.index ?? 0, total);
    if (current <= 0) return;
    activeScenario.index = current - 1;
    scheduleRender();
  }

  function completeScenario() {
    if (!activeScenario) return;
    clear(activeScenario.id);
  }

  function handleLayerClick(event) {
    if (!layerElement || layerElement.hidden) return;
    const nextTrigger = event.target.closest("[data-guided-tour-next]");
    if (nextTrigger) {
      event.preventDefault();
      event.stopPropagation();
      if (nextTrigger.dataset.complete === "true") {
        completeScenario();
      } else {
        nextStep();
      }
      return;
    }
    const prevTrigger = event.target.closest("[data-guided-tour-prev]");
    if (prevTrigger) {
      event.preventDefault();
      event.stopPropagation();
      if (!prevTrigger.disabled) {
        previousStep();
      }
      return;
    }
  }

  function resolveRenderableStep(startIndex, root) {
    if (!activeScenario || !Array.isArray(activeScenario.steps)) return null;
    const steps = activeScenario.steps;
    const total = steps.length;
    if (total === 0) return null;
    const safeStart = clampIndex(startIndex ?? 0, total);
    for (let index = safeStart; index < total; index++) {
      const step = steps[index];
      const target = resolveTarget(step, root);
      if (!target) continue;
      const rect = target.getBoundingClientRect();
      if (rect.width === 0 && rect.height === 0) continue;
      return { index, step, target, rect };
    }
    return null;
  }

  function scheduleRender() {
    if (rafHandle) {
      cancelAnimationFrame(rafHandle);
    }
    rafHandle = requestAnimationFrame(renderScenario);
  }

  function renderScenario() {
    const layer = ensureLayer();
    layer.innerHTML = "";
    clearHighlights();

    if (
      !isEnabled() ||
      !activeScenario ||
      !Array.isArray(activeScenario.steps) ||
      activeScenario.steps.length === 0
    ) {
      layer.hidden = true;
      toggleViewportListeners(false);
      return;
    }

    const root = activeScenario.root && activeScenario.root.isConnected ? activeScenario.root : document;
    const totalSteps = activeScenario.steps.length;
    const currentIndex = clampIndex(activeScenario.index ?? 0, totalSteps);
    activeScenario.index = currentIndex;

    let resolution = resolveRenderableStep(currentIndex, root);
    if (!resolution) {
      resolution = resolveRenderableStep(0, root);
    }
    if (!resolution) {
      layer.hidden = true;
      toggleViewportListeners(false);
      return;
    }

    if (resolution.index !== activeScenario.index) {
      activeScenario.index = resolution.index;
    }

    const { step, target, rect, index } = resolution;
    const placement = typeof step.placement === "string" ? step.placement : "top";
    const gap = normalizeNumber(step.gap, DEFAULT_GAP);
    const offsetX = normalizeNumber(step.offsetX);
    const offsetY = normalizeNumber(step.offsetY);
    const altPlacements = []
      .concat(Array.isArray(step.preferredPlacements) ? step.preferredPlacements : [])
      .concat(Array.isArray(step.altPlacements) ? step.altPlacements : [])
      .concat(Array.isArray(step.placements) ? step.placements : []);
    const label = step.indexLabel || step.index || index + 1;
    const title = step.title || "Guided tip";
    const description = step.description || "";
    const isFirstStep = index <= 0;
    const isLastStep = index >= totalSteps - 1;
    const progressLabel = `${index + 1}/${totalSteps}`;

    const stepElement = document.createElement("article");
    stepElement.className = "guided-tour-step";
    stepElement.style.visibility = "hidden";
    stepElement.style.pointerEvents = "none";
    stepElement.innerHTML = `
      <span class="guided-tour-step__index">${WeldUtil.escapeHtml(String(label))}</span>
      <div class="guided-tour-step__body">
        <div class="guided-tour-step__title-row">
          <span class="guided-tour-step__title">${WeldUtil.escapeHtml(title)}</span>
          <span class="guided-tour-step__progress">${WeldUtil.escapeHtml(progressLabel)}</span>
        </div>
        <span class="guided-tour-step__description">${WeldUtil.escapeHtml(description)}</span>
        <div class="guided-tour-step__nav">
          <button type="button" class="guided-tour-step__button" data-guided-tour-prev ${isFirstStep ? "disabled" : ""}>Back</button>
          <button
            type="button"
            class="guided-tour-step__button guided-tour-step__button--primary"
            data-guided-tour-next
            data-complete="${isLastStep}"
          >
            ${isLastStep ? "Done" : "Next"}
          </button>
        </div>
      </div>
    `;

    highlightTarget(target);
    layer.appendChild(stepElement);
    layer.hidden = false;
    selectPlacementWithinViewport(stepElement, rect, {
      placement,
      gap,
      offsetX,
      offsetY,
      altPlacements
    });
    stepElement.style.visibility = "";
    stepElement.style.pointerEvents = "";
    toggleViewportListeners(true);
  }

  function toggleViewportListeners(shouldListen) {
    if (shouldListen && !viewportListenersAttached) {
      window.addEventListener("resize", scheduleRender, true);
      window.addEventListener("scroll", scheduleRender, true);
      viewportListenersAttached = true;
      return;
    }
    if (!shouldListen && viewportListenersAttached) {
      window.removeEventListener("resize", scheduleRender, true);
      window.removeEventListener("scroll", scheduleRender, true);
      viewportListenersAttached = false;
    }
  }

  function isEnabled() {
    const state = getState();
    if (!state || !state.meta) return true;
    const guidedMeta = state.meta[STATE_KEY];
    if (!guidedMeta || typeof guidedMeta !== "object") {
      return true;
    }
    return guidedMeta.enabled !== false;
  }

  function setEnabled(enabled) {
    const next = enabled !== false;
    const services = global.WeldServices;
    if (services && typeof services.setGuidedTourEnabled === "function") {
      services.setGuidedTourEnabled(next, getState());
    } else {
      const state = getState();
      if (state && state.meta) {
        if (!state.meta[STATE_KEY] || typeof state.meta[STATE_KEY] !== "object") {
          state.meta[STATE_KEY] = { enabled: true, dismissedRoutes: {} };
        }
        state.meta[STATE_KEY].enabled = next;
        if (typeof global.WeldState?.saveState === "function") {
          global.WeldState.saveState(state);
        }
      }
    }
    if (!next) {
      clear();
    } else {
      scheduleRender();
    }
    return next;
  }

  function toggleEnabled() {
    return setEnabled(!isEnabled());
  }

  function mount(payload = {}) {
    const steps = Array.isArray(payload.steps) ? payload.steps.filter(Boolean) : [];
    const id = typeof payload.id === "string" && payload.id.trim().length > 0 ? payload.id.trim() : null;
    if (steps.length === 0) {
      activeScenario = null;
    } else {
      const initialIndexRaw = Number(payload.startIndex);
      const initialIndex = Number.isFinite(initialIndexRaw)
        ? clampIndex(initialIndexRaw, steps.length)
        : 0;
      activeScenario = { id, steps, root: payload.root || document, index: initialIndex };
    }
    scheduleRender();
  }

  function clear(id) {
    if (!activeScenario) {
      scheduleRender();
      return;
    }
    if (id && activeScenario.id && id !== activeScenario.id) {
      return;
    }
    activeScenario = null;
    scheduleRender();
  }

  function refresh() {
    scheduleRender();
  }

  function registerScenario(id, resolver) {
    if (typeof id !== "string" || id.trim().length === 0) return;
    if (typeof resolver !== "function") return;
    scenarioRegistry.set(id.trim(), resolver);
  }

  function runScenario(id, context = {}) {
    if (typeof id !== "string" || id.trim().length === 0) return;
    const key = id.trim();
    const resolver = scenarioRegistry.get(key);
    if (!resolver) return;
    const result = resolver(context);
    if (!result) {
      clear(key);
      return;
    }
    if (Array.isArray(result)) {
      mount({ id: key, steps: result, root: context.root || context.container || document });
      return;
    }
    const steps = Array.isArray(result.steps) ? result.steps : [];
    const root = result.root || context.root || context.container || document;
    mount({ id: result.id || key, steps, root });
  }

  const guidedTourApi = {
    mount,
    clear,
    refresh,
    isEnabled,
    setEnabled,
    toggle: toggleEnabled,
    register: registerScenario,
    run: runScenario
  };

  global.WeldGuidedTour = guidedTourApi;
})();
