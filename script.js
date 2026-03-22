const lines = [
  "designing calm, useful software",
  "shipping Untired and building Soba",
  "working across product, design, and code",
  "making products feel clear and alive",
];

const output = document.getElementById("status-line");
const year = document.getElementById("year");
const heroCanvas = document.getElementById("signal-canvas");
const heroStage = document.getElementById("signal-stage");
const cursorShell = document.querySelector(".cursor-shell");
const cursorRing = document.getElementById("cursor-ring");
const cursorDot = document.getElementById("cursor-dot");
const cursorLabel = document.getElementById("cursor-label");
const themeToggle = document.getElementById("theme-toggle");
const soundtrack = document.getElementById("soundtrack");
const soundtrackToggle = document.getElementById("soundtrack-toggle");
const soundtrackLabel = document.getElementById("soundtrack-label");
const contactSoundTargets = Array.from(
  document.querySelectorAll('.mobile-contact-cta, .button-ghost[href^="mailto:"], .footer-mail[href^="mailto:"]'),
);
const signalReadoutText = document.getElementById("signal-readout-text");
const transferReadout = document.getElementById("transfer-readout");
const probeFieldLive = document.getElementById("probe-field-live");
const probeFieldNote = document.getElementById("probe-field-note");
const probeSwirlLive = document.getElementById("probe-swirl-live");
const probeSwirlNote = document.getElementById("probe-swirl-note");
const probeSectionLive = document.getElementById("probe-section-live");
const probeSectionNote = document.getElementById("probe-section-note");
const residueDepth = document.getElementById("residue-depth");
const residueLock = document.getElementById("residue-lock");
const residueDensity = document.getElementById("residue-density");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const coarsePointer = window.matchMedia("(pointer: coarse)").matches;
const rootElement = document.documentElement;
const defaultHeroZoomLevel =
  coarsePointer || window.innerWidth < 980 || window.innerHeight < 820 ? "wide" : "close";

const palette = {
  bg: "rgba(7, 8, 9, 0.94)",
  blue: "#4a78ff",
  green: "#7de58d",
  orange: "#ff9447",
  cream: "rgba(243, 241, 231, 0.92)",
  soft: "rgba(255, 255, 255, 0.08)",
};

const chamberFieldMap = {
  bounds: { minX: -6.9, maxX: 6.9, frontZ: 2.8, backZ: -28 },
  gridCutout: { width: 5.6, zStart: -17.2, zEnd: -24.4 },
  waterfall: { x: 0, z: -20.8, width: 2.6, depth: 2.5, poolRadius: 1.85, poolZ: -20.5 },
  forestBanks: [
    { x: -4.35, width: 2.5, zFront: -2.0, zBack: -22.6, tint: "green", count: 7 },
    { x: 4.35, width: 2.5, zFront: -2.0, zBack: -22.6, tint: "orange", count: 7 },
  ],
  undergrowthZones: [
    { x: -2.8, z: 1.7, spreadX: 2.4, spreadZ: 1.6, tint: "green" },
    { x: 2.75, z: 1.55, spreadX: 2.45, spreadZ: 1.7, tint: "deepGreen" },
    { x: -1.7, z: -1.0, spreadX: 2.0, spreadZ: 1.5, tint: "green" },
    { x: 1.8, z: -0.9, spreadX: 2.0, spreadZ: 1.45, tint: "deepGreen" },
    { x: -2.2, z: -10.8, spreadX: 2.2, spreadZ: 1.8, tint: "green" },
    { x: 2.25, z: -10.6, spreadX: 2.25, spreadZ: 1.85, tint: "deepGreen" },
    { x: -1.2, z: -13.8, spreadX: 1.8, spreadZ: 1.5, tint: "blue" },
    { x: 1.35, z: -13.9, spreadX: 1.85, spreadZ: 1.55, tint: "deepGreen" },
  ],
  specimens: [
    { kind: "monstera", x: -2.15, z: -2.2, tint: "cream" },
    { kind: "alocasia", x: -3.35, z: -0.55, tint: "green" },
    { kind: "flamingo", x: -2.55, z: -3.85, tint: "pink" },
    { kind: "queen", x: -1.3, z: -5.6, tint: "blue" },
    { kind: "monstera", x: 2.25, z: -1.85, tint: "deepGreen" },
    { kind: "alocasia", x: 3.6, z: -0.8, tint: "deepGreen" },
    { kind: "flamingo", x: 2.2, z: -3.9, tint: "orange" },
    { kind: "queen", x: 1.45, z: -5.9, tint: "deepGreen" },
    { kind: "monstera", x: -3.55, z: -11.6, tint: "deepGreen" },
    { kind: "alocasia", x: -2.35, z: -12.9, tint: "green" },
    { kind: "flamingo", x: -4.65, z: -14.25, tint: "pink" },
    { kind: "queen", x: -1.55, z: -15.1, tint: "blue" },
    { kind: "monstera", x: 3.6, z: -11.4, tint: "deepGreen" },
    { kind: "alocasia", x: 2.4, z: -12.8, tint: "deepGreen" },
    { kind: "flamingo", x: 4.55, z: -14.05, tint: "orange" },
    { kind: "queen", x: 1.7, z: -15.2, tint: "deepGreen" },
  ],
};

const chamberTelemetry = {
  zoomLevel: defaultHeroZoomLevel,
  zoomDistance: defaultHeroZoomLevel === "wide" ? 20.2 : 9.8,
  focusDepth: chamberFieldMap.waterfall.z,
  lateralOffset: 0,
  azimuth: 0,
  polar: 0,
  waterfallPulse: 0.28,
  specimenDensity: chamberFieldMap.specimens.length,
  lockState: "soft",
  idleBlend: 1,
  sweep: 0,
  hoveredLabel: null,
  actors: {
    gardenerA: { x: -3.2, z: -2.8, kind: "human", tint: "orange" },
    gardenerB: { x: 3.15, z: -12.3, kind: "human", tint: "blue" },
    bulldog: { x: -1.8, z: -4.4, kind: "dog", tint: "cream" },
    terrapin: { x: 0.25, z: chamberFieldMap.waterfall.poolZ + 0.28, kind: "terrapin", tint: "green" },
  },
};

const probePanelDefaults = {
  fieldLive: "depth axis / stable",
  fieldNote: "signal archive / chamber specimen map",
  swirlLive: "waterfall pulse / low",
  swirlNote: "pulse monitor / environmental intake",
  sectionLive: "lock vector / idle",
  sectionNote: "azimuth frame / chamber section cut",
};

const chamberPlantProfiles = {
  "[BIO-SIG: AROID / MONSTERA]": {
    visual: "monstera",
    accent: "green",
    fieldLive: "specimen / monstera deliciosa",
    fieldNote: "Mexico to Panama / climbing split-leaf aroid",
    swirlLive: "light: bright indirect / humidity: medium-high",
    swirlNote: "let the mix breathe / support helps mature fenestration",
    sectionLive: "pets: irritant / growth: aerial-root climber",
    sectionNote: "calcium oxalates / perforations deepen with maturity",
  },
  "[BIO-SIG: AROID / ALOCASIA MACRORRHIZA]": {
    visual: "alocasia",
    accent: "green",
    fieldLive: "specimen / alocasia macrorrhizos",
    fieldNote: "giant elephant ear / tropical Asia-Pacific aroid",
    swirlLive: "light: bright filtered / humidity: high",
    swirlNote: "even moisture / warmth, humidity, and airflow matter",
    sectionLive: "pets: toxic / posture: upright shield leaf",
    sectionNote: "draft-sensitive / leaf drop usually means stress or chill",
  },
  "[BIO-SIG: ANTHURIUM / ANDRAEANUM]": {
    visual: "flamingo",
    accent: "orange",
    fieldLive: "specimen / anthurium andraeanum",
    fieldNote: "flamingo flower / Colombia-Ecuador tropical aroid",
    swirlLive: "light: bright indirect / humidity: high",
    swirlNote: "airy bark-rich mix / let the top layer dry slightly",
    sectionLive: "pets: irritant / signal: spathe + spadix bloom",
    sectionNote: "repeat blooms in steady warmth / avoid hard direct sun",
  },
  "[BIO-SIG: ANTHURIUM / WAROCQUEANUM]": {
    visual: "queen",
    accent: "blue",
    fieldLive: "specimen / anthurium warocqueanum",
    fieldNote: "queen anthurium / Colombian rainforest epiphyte",
    swirlLive: "light: bright indirect / humidity: very high",
    swirlNote: "chunky open mix / airy roots and very stable humidity",
    sectionLive: "pets: toxic / signal: velvety pendant leaf",
    sectionNote: "silver venation sharpens in humidity / dry air curls edges",
  },
  "[BIO-SIG: BASIC FLORA]": {
    visual: "flora",
    accent: "cream",
    fieldLive: "understory / mixed chamber flora",
    fieldNote: "support layer / procedural foliage around the main specimens",
    swirlLive: "light: diffuse / humidity: ambient",
    swirlNote: "non-primary scan target / used as a chamber ground signal",
    sectionLive: "lock vector / soft",
    sectionNote: "move across the chamber to isolate a curated specimen cluster",
  },
};

const syncPaletteFromTheme = () => {
  const styles = window.getComputedStyle(rootElement);
  palette.bg = styles.getPropertyValue("--canvas-bg").trim();
  palette.blue = styles.getPropertyValue("--blue").trim();
  palette.green = styles.getPropertyValue("--green").trim();
  palette.orange = styles.getPropertyValue("--orange").trim();
  palette.cream = styles.getPropertyValue("--cream").trim();
  palette.soft = styles.getPropertyValue("--soft").trim();
};

const updateThemeToggleLabel = () => {
  if (!themeToggle) {
    return;
  }

  const nextTheme = rootElement.dataset.theme === "light" ? "dark" : "light";
  themeToggle.textContent = `theme / ${nextTheme}`;
};

const updateSoundtrackToggleLabel = () => {
  if (!soundtrackToggle || !soundtrackLabel || !soundtrack) {
    return;
  }

  const playing = !soundtrack.paused && !soundtrack.ended;
  soundtrackLabel.textContent = playing ? "pause" : "play";
  soundtrackToggle.classList.toggle("is-playing", playing);
  soundtrackToggle.setAttribute("aria-label", playing ? "Pause soundtrack" : "Play soundtrack");
};

const setupSoundtrack = () => {
  if (!soundtrack || !soundtrackToggle) {
    return;
  }

  soundtrack.autoplay = true;
  soundtrack.volume = 0.42;
  soundtrack.preload = "auto";
  soundtrackToggle.type = "button";

  let resumeBound = false;
  let autoplayBlocked = false;

  const removeResumeListeners = () => {
    if (!resumeBound) {
      return;
    }
    resumeBound = false;
    window.removeEventListener("pointerdown", resumeOnInteraction);
    window.removeEventListener("keydown", resumeOnInteraction);
    window.removeEventListener("touchstart", resumeOnInteraction);
  };

  const tryPlay = async () => {
    try {
      await soundtrack.play();
      autoplayBlocked = false;
      removeResumeListeners();
    } catch (_error) {
      autoplayBlocked = true;
      if (!resumeBound) {
        resumeBound = true;
        window.addEventListener("pointerdown", resumeOnInteraction, { passive: true });
        window.addEventListener("keydown", resumeOnInteraction);
        window.addEventListener("touchstart", resumeOnInteraction, { passive: true });
      }
    } finally {
      updateSoundtrackToggleLabel();
    }
  };

  async function resumeOnInteraction(event) {
    if (event?.target && soundtrackToggle.contains(event.target)) {
      return;
    }
    await tryPlay();
  }

  const onToggleSoundtrack = async () => {
    if (!soundtrack.paused) {
      soundtrack.pause();
      removeResumeListeners();
      updateSoundtrackToggleLabel();
      return;
    }
    await tryPlay();
  };

  soundtrackToggle.addEventListener("click", onToggleSoundtrack);
  soundtrack.addEventListener("play", updateSoundtrackToggleLabel);
  soundtrack.addEventListener("pause", updateSoundtrackToggleLabel);
  soundtrack.addEventListener("ended", updateSoundtrackToggleLabel);

  updateSoundtrackToggleLabel();
  window.addEventListener("load", tryPlay, { once: true });
  if (document.readyState === "complete") {
    tryPlay();
  }

  cleanups.push(() => {
    removeResumeListeners();
    window.removeEventListener("load", tryPlay);
    soundtrackToggle.removeEventListener("click", onToggleSoundtrack);
    soundtrack.removeEventListener("play", updateSoundtrackToggleLabel);
    soundtrack.removeEventListener("pause", updateSoundtrackToggleLabel);
    soundtrack.removeEventListener("ended", updateSoundtrackToggleLabel);
    soundtrack.pause();
  });
};

const setupHoverTone = () => {
  if (!contactSoundTargets.length) {
    return;
  }

  const hoverTone = new Audio("audio/tonal-hover.mp3");
  hoverTone.preload = "auto";
  hoverTone.volume = 0.42;

  let lastPlayAt = 0;
  const playHoverTone = () => {
    const now = performance.now();
    if (now - lastPlayAt < 180) {
      return;
    }
    lastPlayAt = now;
    try {
      hoverTone.currentTime = 0;
    } catch (_error) {
      // Ignore seek errors before metadata is ready.
    }
    hoverTone.play().catch(() => {});
  };

  contactSoundTargets.forEach((target) => {
    target.addEventListener("pointerenter", playHoverTone);
    target.addEventListener("focus", playHoverTone);
    target.addEventListener("touchstart", playHoverTone, { passive: true });
  });

  cleanups.push(() => {
    contactSoundTargets.forEach((target) => {
      target.removeEventListener("pointerenter", playHoverTone);
      target.removeEventListener("focus", playHoverTone);
      target.removeEventListener("touchstart", playHoverTone);
    });
    hoverTone.pause();
    hoverTone.src = "";
  });
};

syncPaletteFromTheme();
updateThemeToggleLabel();

if (year) {
  year.textContent = new Date().getFullYear();
}

const topbarProgress = document.getElementById("topbar-progress");

const updateNavbarExtras = () => {
  if (topbarProgress) {
    const winScroll = window.scrollY || document.documentElement.scrollTop;
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolled = (winScroll / height) * 100;
    topbarProgress.style.width = scrolled + "%";
  }
};

let navScrolled = false;
const updateScrollState = () => {
  const nextY = window.scrollY;
  if (!navScrolled && nextY > 52) {
    navScrolled = true;
    document.body.classList.add("is-scrolled");
  } else if (navScrolled && nextY < 24) {
    navScrolled = false;
    document.body.classList.remove("is-scrolled");
  }
};

updateScrollState();
updateNavbarExtras();
window.addEventListener("scroll", () => {
  updateScrollState();
  updateNavbarExtras();
}, { passive: true });

if (output && !reduceMotion) {
  let lineIndex = 0;
  let charIndex = 0;
  let deleting = false;

  const tick = () => {
    const activeLine = lines[lineIndex];

    if (!deleting) {
      charIndex += 1;
      output.textContent = activeLine.slice(0, charIndex);

      if (charIndex === activeLine.length) {
        deleting = true;
        window.setTimeout(tick, 1400);
        return;
      }

      window.setTimeout(tick, 28);
      return;
    }

    charIndex -= 1;
    output.textContent = activeLine.slice(0, charIndex);

    if (charIndex === 0) {
      deleting = false;
      lineIndex = (lineIndex + 1) % lines.length;
      window.setTimeout(tick, 220);
      return;
    }

    window.setTimeout(tick, 18);
  };

  output.textContent = "";
  tick();
}

const setupCanvas = (canvas, drawFrame) => {
  const context = canvas.getContext("2d");

  if (!context) {
    return () => {};
  }

  let width = 0;
  let height = 0;
  let rafId = 0;
  let visible = true;
  let observer = null;
  const pointer = { hover: false, x: 0, y: 0, hoverBlend: 0 };

  const onPointerEnter = () => { pointer.hover = true; };
  const onPointerLeave = () => { pointer.hover = false; };
  const onPointerMove = (e) => {
    const rect = canvas.getBoundingClientRect();
    pointer.x = e.clientX - rect.left;
    pointer.y = e.clientY - rect.top;
  };

  const trigger = canvas.closest('.work-item, .principle, .about-panel, .visual-card') || canvas;

  trigger.addEventListener("pointerenter", onPointerEnter);
  trigger.addEventListener("pointerleave", onPointerLeave);
  trigger.addEventListener("pointermove", onPointerMove);

  const resize = () => {
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    const bounds = canvas.getBoundingClientRect();
    width = bounds.width;
    height = bounds.height;
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    drawFrame(context, width, height, 0, pointer);
  };

  const render = (time) => {
    pointer.hoverBlend += ((pointer.hover ? 1 : 0) - pointer.hoverBlend) * 0.15;
    drawFrame(context, width, height, time, pointer);

    if (!reduceMotion && visible) {
      rafId = window.requestAnimationFrame(render);
    }
  };

  resize();

  if (!reduceMotion) {
    rafId = window.requestAnimationFrame(render);
  }

  window.addEventListener("resize", resize);

  if ("IntersectionObserver" in window) {
    observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        visible = Boolean(entry?.isIntersecting);

        if (visible && !reduceMotion && !rafId) {
          rafId = window.requestAnimationFrame(render);
        }

        if (!visible && rafId) {
          window.cancelAnimationFrame(rafId);
          rafId = 0;
        }
      },
      { threshold: 0.08 }
    );

    observer.observe(canvas);
  }

  return () => {
    if (rafId) {
      window.cancelAnimationFrame(rafId);
    }
    if (observer) {
      observer.disconnect();
    }
    window.removeEventListener("resize", resize);
    trigger.removeEventListener("pointerenter", onPointerEnter);
    trigger.removeEventListener("pointerleave", onPointerLeave);
    trigger.removeEventListener("pointermove", onPointerMove);
  };
};

const clear = (context, width, height) => {
  context.clearRect(0, 0, width, height);
  context.fillStyle = palette.bg;
  context.fillRect(0, 0, width, height);
};

const getVizTheme = () => {
  const lightMode = rootElement.dataset.theme === "light";
  return {
    lightMode,
    composite: lightMode ? "multiply" : "screen",
    ink: lightMode ? "rgba(18, 20, 23, 0.9)" : "rgba(243, 241, 231, 0.9)",
    blueStrong: lightMode ? "rgba(44, 86, 215, 0.92)" : "rgba(74, 120, 255, 0.88)",
    blueMid: lightMode ? "rgba(44, 86, 215, 0.66)" : "rgba(74, 120, 255, 0.6)",
    blueDim: lightMode ? "rgba(44, 86, 215, 0.34)" : "rgba(74, 120, 255, 0.25)",
    greenStrong: lightMode ? "rgba(36, 143, 83, 0.94)" : "rgba(125, 229, 141, 1)",
    greenMid: lightMode ? "rgba(36, 143, 83, 0.72)" : "rgba(125, 229, 141, 0.6)",
    greenDim: lightMode ? "rgba(36, 143, 83, 0.34)" : "rgba(125, 229, 141, 0.25)",
    orangeStrong: lightMode ? "rgba(204, 100, 31, 0.94)" : "rgba(255, 148, 71, 1)",
    orangeMid: lightMode ? "rgba(204, 100, 31, 0.72)" : "rgba(255, 148, 71, 0.6)",
    orangeDim: lightMode ? "rgba(204, 100, 31, 0.34)" : "rgba(255, 148, 71, 0.25)",
    panelBg: lightMode ? "rgba(243, 239, 232, 0.98)" : "rgba(7, 8, 9, 0.94)",
  };
};

const getSignalNoise = (time) =>
  1 +
  Math.sin(time * 0.00021) * 0.045 +
  Math.sin(time * 0.00057 + 1.6) * 0.028 +
  Math.cos(time * 0.00011 + 0.8) * 0.018;

const formatSigned = (value, digits = 2) => `${value >= 0 ? "+" : ""}${value.toFixed(digits)}`;
const shortestAngleDelta = (from, to) => Math.atan2(Math.sin(to - from), Math.cos(to - from));
const reusableCameraOffset = { x: 0, y: 0, z: 0 };

const getActivePlantProfile = () =>
  chamberTelemetry.hoveredLabel ? chamberPlantProfiles[chamberTelemetry.hoveredLabel] || chamberPlantProfiles["[BIO-SIG: BASIC FLORA]"] : null;

const getProfileColor = (profile) => {
  if (!profile) {
    return palette.cream;
  }
  if (profile.accent === "orange") return palette.orange;
  if (profile.accent === "blue") return palette.blue;
  if (profile.accent === "green") return palette.green;
  return palette.cream;
};

const applyPatchHoverState = (patch, active) => {
  if (!patch?.userData?.pixels) {
    return;
  }

  const hoverScale = patch.userData.hoverScale ?? 1.5;
  patch.userData.pixels.scale.setScalar(active ? hoverScale : 1);

  if (patch.userData.pixelMaterial) {
    patch.userData.pixelMaterial.opacity = active
      ? patch.userData.hoverOpacity ?? 0.96
      : patch.userData.baseOpacity ?? 0.78;
  }

  if (patch.userData.highlightGroup) {
    patch.userData.highlightGroup.visible = active;
  }
};

const drawPlantGlyph = (context, cx, cy, scale, visual, color) => {
  context.strokeStyle = color;
  context.fillStyle = color;
  context.lineWidth = 1.15;

  if (visual === "monstera") {
    context.beginPath();
    context.moveTo(cx, cy + scale * 0.95);
    context.lineTo(cx, cy - scale * 1.2);
    context.moveTo(cx, cy - scale * 0.7);
    context.lineTo(cx - scale * 0.95, cy - scale * 0.18);
    context.moveTo(cx, cy - scale * 0.54);
    context.lineTo(cx + scale * 0.98, cy - scale * 0.08);
    context.stroke();
    context.beginPath();
    context.moveTo(cx - scale * 0.84, cy - scale * 0.22);
    context.quadraticCurveTo(cx - scale * 0.24, cy - scale * 1.12, cx + scale * 0.14, cy - scale * 0.1);
    context.quadraticCurveTo(cx - scale * 0.22, cy + scale * 0.1, cx - scale * 0.84, cy - scale * 0.22);
    context.stroke();
    context.fillRect(cx - 2, cy - scale * 1.26, 4, 4);
    return;
  }

  if (visual === "alocasia") {
    context.beginPath();
    context.moveTo(cx, cy + scale);
    context.lineTo(cx, cy - scale * 1.15);
    context.moveTo(cx, cy - scale * 0.9);
    context.lineTo(cx - scale * 0.72, cy - scale * 0.08);
    context.moveTo(cx, cy - scale * 0.84);
    context.lineTo(cx + scale * 0.78, cy - scale * 0.04);
    context.stroke();
    context.beginPath();
    context.moveTo(cx, cy - scale * 1.18);
    context.lineTo(cx - scale * 0.54, cy - scale * 0.18);
    context.lineTo(cx, cy + scale * 0.08);
    context.lineTo(cx + scale * 0.54, cy - scale * 0.18);
    context.closePath();
    context.stroke();
    context.fillRect(cx - 2, cy - scale * 1.26, 4, 4);
    return;
  }

  if (visual === "flamingo") {
    context.beginPath();
    context.moveTo(cx, cy + scale);
    context.lineTo(cx, cy - scale * 0.72);
    context.stroke();
    context.beginPath();
    context.moveTo(cx, cy - scale * 0.68);
    context.quadraticCurveTo(cx - scale * 0.65, cy - scale * 0.26, cx - scale * 0.18, cy + scale * 0.14);
    context.quadraticCurveTo(cx + scale * 0.48, cy - scale * 0.06, cx, cy - scale * 0.68);
    context.stroke();
    context.beginPath();
    context.moveTo(cx + scale * 0.1, cy - scale * 0.45);
    context.lineTo(cx + scale * 0.32, cy - scale * 0.98);
    context.stroke();
    context.fillRect(cx + scale * 0.28, cy - scale, 3.2, 3.2);
    return;
  }

  if (visual === "queen") {
    context.beginPath();
    context.moveTo(cx, cy + scale * 0.92);
    context.lineTo(cx, cy - scale * 0.36);
    context.stroke();
    context.beginPath();
    context.moveTo(cx, cy - scale * 0.34);
    context.quadraticCurveTo(cx - scale * 0.32, cy + scale * 0.88, cx, cy + scale * 1.54);
    context.quadraticCurveTo(cx + scale * 0.32, cy + scale * 0.88, cx, cy - scale * 0.34);
    context.stroke();
    context.fillRect(cx - 1.8, cy + scale * 1.48, 3.6, 3.6);
    return;
  }

  context.beginPath();
  context.moveTo(cx, cy + scale);
  context.lineTo(cx, cy - scale * 0.9);
  context.moveTo(cx - scale * 0.46, cy - scale * 0.12);
  context.lineTo(cx + scale * 0.46, cy - scale * 0.12);
  context.stroke();
  context.fillRect(cx - 1.6, cy - scale, 3.2, 3.2);
};

const drawScaffold = (context, width, height) => {
  context.strokeStyle = palette.soft;
  context.lineWidth = 1;
  context.strokeRect(12, 12, width - 24, height - 24);
  context.strokeRect(width * 0.1, height * 0.14, width * 0.8, height * 0.72);
};

const drawGridField = (context, width, height, time, options = {}) => {
  const {
    centerX = width * 0.5,
    centerY = height * 0.72,
    cols = 9,
    rows = 7,
    spacingX = 22,
    spacingY = 14,
    amplitude = 6,
    color = "rgba(74, 120, 255, 0.42)",
  } = options;
  const drift = getSignalNoise(time);

  context.save();
  context.translate(centerX, centerY);
  context.strokeStyle = color;
  context.lineWidth = 1;

  for (let row = 0; row < rows; row += 1) {
    context.beginPath();
    for (let col = -cols; col <= cols; col += 1) {
      const x = col * spacingX;
      const y = row * spacingY + Math.sin(time * 0.0014 + col * 0.5 + row * 0.28) * amplitude * drift;
      if (col === -cols) {
        context.moveTo(x, y);
      } else {
        context.lineTo(x, y);
      }
    }
    context.stroke();
  }

  for (let col = -cols; col <= cols; col += 1) {
    context.beginPath();
    for (let row = 0; row < rows; row += 1) {
      const x = col * spacingX + Math.sin(time * 0.001 + row * 0.35 + col) * (2 * drift);
      const y = row * spacingY + Math.sin(time * 0.0014 + col * 0.5 + row * 0.28) * amplitude * drift;
      if (row === 0) {
        context.moveTo(x, y);
      } else {
        context.lineTo(x, y);
      }
    }
    context.stroke();
  }

  context.restore();
};

const drawOrbitSet2D = (context, centerX, centerY, width, height, time, tint = "rgba(255, 148, 71, 0.48)") => {
  const drift = getSignalNoise(time);
  context.strokeStyle = tint;
  context.lineWidth = 1;

  [0.18, 0.29, 0.41].forEach((scale, index) => {
    context.beginPath();
    context.ellipse(
      centerX,
      centerY,
      width * scale * drift,
      height * (0.08 + index * 0.045) * (1 + (drift - 1) * 0.55),
      time * 0.0003 + index * 0.32,
      0,
      Math.PI * 2
    );
    context.stroke();
  });
};

const drawPointCloud = (context, centerX, centerY, count, time, radiusX, radiusY) => {
  for (let index = 0; index < count; index += 1) {
    const angle = index * 0.37 + time * 0.00045;
    const radius = 8 + (index % 36) * 1.85;
    const x = centerX + Math.cos(angle) * Math.min(radius, radiusX);
    const y = centerY + Math.sin(angle * 1.18) * Math.min(radius * 0.78, radiusY);
    context.fillStyle =
      index % 4 === 0
        ? palette.orange
        : index % 4 === 1
          ? palette.blue
          : index % 4 === 2
            ? palette.green
            : palette.cream;
    context.fillRect(x, y, 2, 2);
  }
};

const drawDigitStrip = (context, x, y, width, count, time, color = palette.cream) => {
  const digits = "0123456789";
  context.fillStyle = color;
  context.font = "11px IBM Plex Mono";
  for (let index = 0; index < count; index += 1) {
    const px = x + index * (width / Math.max(count - 1, 1));
    const py = y + Math.sin(time * 0.0018 + index * 0.42) * 7;
    const char = digits[(index + Math.floor(time * 0.0025)) % digits.length];
    context.fillText(char, px, py);
  }
};

const drawPetsciiTerminal = (context, x, y, width, height, options = {}) => {
  const {
    title = "archive / screen",
    accent = palette.green,
    secondary = palette.cream,
    border = "rgba(243, 241, 231, 0.18)",
    rows = [],
    footer = "ready.",
    glow = true,
  } = options;

  context.save();
  context.fillStyle = "rgba(0, 0, 0, 0.66)";
  context.fillRect(x, y, width, height);
  context.strokeStyle = border;
  context.lineWidth = 1;
  context.strokeRect(x, y, width, height);

  context.fillStyle = secondary;
  context.font = "10px IBM Plex Mono";
  context.fillText(title, x + 10, y + 14);

  if (glow) {
    context.fillStyle = "rgba(125, 229, 141, 0.06)";
    context.fillRect(x + 8, y + 24, width - 16, height - 36);
  }

  rows.forEach((row, index) => {
    context.fillStyle = row.tint || (index % 2 === 0 ? accent : secondary);
    context.font = `${row.size || 11}px IBM Plex Mono`;
    context.fillText(row.text, x + 10, y + 34 + index * (row.leading || 13));
  });

  context.fillStyle = accent;
  context.font = "11px IBM Plex Mono";
  context.fillText(footer, x + 10, y + height - 10);
  context.restore();
};

const drawPetsciiLadder = (context, x, y, rows, cols, cellW, cellH, tint) => {
  context.save();
  context.strokeStyle = tint;
  context.lineWidth = 1;
  for (let row = 0; row < rows; row += 1) {
    const yy = y + row * cellH;
    context.beginPath();
    context.moveTo(x, yy);
    context.lineTo(x + cols * cellW, yy);
    context.stroke();
  }
  context.restore();
};

const drawPetsciiSpecimen = (context, x, y, profile, tint) => {
  const glyphMap = {
    monstera: [
      "   /\\   /\\   ",
      " _/  \\_/  \\_ ",
      " \\  /\\ /\\  / ",
      "  \\/  V  \\/  ",
      "     ||      ",
    ],
    alocasia: [
      "     /\\      ",
      "   _/  \\_    ",
      "  /  /\\  \\   ",
      "  \\_/  \\_/   ",
      "     ||      ",
    ],
    flamingo: [
      "    .--.     ",
      "  .(    ).   ",
      "   \\.__./    ",
      "     ||      ",
      "     ||      ",
    ],
    queen: [
      "    /--\\     ",
      "   / || \\    ",
      "  /  ||  \\   ",
      "  \\  ||  /   ",
      "     ||      ",
    ],
    flora: [
      "   .  .  .   ",
      "  /|\\/|\\/|\\  ",
      "   |  |  |   ",
      "   |  |  |   ",
      "             ",
    ],
  };
  const rows = glyphMap[profile.visual] || glyphMap.flora;
  context.save();
  context.fillStyle = tint;
  context.font = "11px IBM Plex Mono";
  rows.forEach((row, index) => {
    context.fillText(row, x, y + index * 12);
  });
  context.restore();
};

const drawPetsciiRoom = (context, options) => {
  const {
    x,
    y,
    width,
    height,
    depthX = 28,
    depthY = 18,
    tint = "rgba(171, 214, 117, 0.94)",
    dim = "rgba(171, 214, 117, 0.24)",
    floorRows = 8,
    floorCols = 12,
  } = options;

  const backX = x + depthX;
  const backY = y - depthY;
  const backW = Math.max(24, width - depthX * 0.6);
  const backH = Math.max(24, height - depthY * 0.3);

  context.save();

  context.fillStyle = dim;
  context.beginPath();
  context.moveTo(x, y + height);
  context.lineTo(x + width, y + height);
  context.lineTo(backX + backW, backY + backH);
  context.lineTo(backX, backY + backH);
  context.closePath();
  context.fill();

  context.fillStyle = tint;
  context.fillRect(x, y, 12, height);
  context.fillRect(x, y + height - 12, width, 12);
  context.fillRect(backX, backY, backW, 6);
  context.fillRect(backX + backW - 6, backY, 6, backH);

  for (let col = 0; col < floorCols; col += 1) {
    const px = x + 12 + col * ((width - 22) / Math.max(floorCols - 1, 1));
    const py = y + height - 26 - Math.max(0, col - floorCols * 0.58) * 1.4;
    context.fillRect(px, py, 6, 2);
  }

  for (let row = 0; row < floorRows; row += 1) {
    const py = y + 16 + row * ((height - 34) / Math.max(floorRows - 1, 1));
    context.fillRect(x + 18, py, 2, 4);
  }

  context.restore();

  return { backX, backY, backW, backH };
};

const drawHero = (context, width, height, time) => {
  clear(context, width, height);
  context.strokeStyle = palette.soft;
  context.lineWidth = 1;
  context.strokeRect(18, 18, width - 36, height - 36);
  context.strokeRect(width * 0.12, height * 0.14, width * 0.76, height * 0.68);

  const centerX = width * 0.5;
  const centerY = height * 0.38;

  context.strokeStyle = "rgba(255, 148, 71, 0.45)";
  [0.14, 0.2, 0.27].forEach((scale, index) => {
    context.beginPath();
    context.ellipse(
      centerX,
      centerY,
      width * scale,
      width * (scale * 0.42),
      time * 0.00012 + index * 0.55,
      0,
      Math.PI * 2
    );
    context.stroke();
  });

  for (let index = 0; index < 54; index += 1) {
    const angle = (Math.PI * 2 * index) / 54 + time * (0.002 + (index % 7) * 0.00045);
    const radius = Math.min(width, height) * (0.19 + ((index * 17) % 11) / 70);
    const x = centerX + Math.cos(angle) * radius;
    const y = centerY + Math.sin(angle) * radius * 0.48;
    context.fillStyle = index % 5 === 0 ? palette.orange : palette.blue;
    context.fillRect(x - 1.6, y - 1.6, 3.2, 3.2);
  }

  const roots = [0.24, 0.42, 0.6, 0.78];

  roots.forEach((ratio, rootIndex) => {
    const startX = width * ratio;
    const startY = height * 0.7;
    context.strokeStyle = rootIndex % 2 === 0 ? palette.orange : palette.green;
    context.lineWidth = 1.35;

    let x = startX;
    let y = startY;

    for (let step = 0; step < 22; step += 1) {
      const nextX =
        startX +
        Math.sin(time * 0.001 + step * 0.55 + rootIndex) * 42 +
        Math.cos(step * 0.7 + rootIndex) * 12;
      const nextY = startY - step * 13 - Math.cos(time * 0.0012 + step) * 3;

      context.beginPath();
      context.moveTo(x, y);
      context.lineTo(nextX, nextY);
      context.stroke();

      if (step > 4 && step % 3 === 0) {
        const branchLength = 18 + ((step + rootIndex) % 4) * 7;
        const side = step % 2 === 0 ? 1 : -1;
        const branchX = nextX + side * branchLength;
        const branchY = nextY - 14;
        context.beginPath();
        context.moveTo(nextX, nextY);
        context.lineTo(branchX, branchY);
        context.stroke();
        context.fillStyle = palette.cream;
        context.fillRect(branchX - 1.5, branchY - 1.5, 3, 3);
      }

      x = nextX;
      y = nextY;
    }
  });

  context.save();
  context.translate(width * 0.5, height * 0.72);
  context.strokeStyle = "rgba(74, 120, 255, 0.45)";
  context.lineWidth = 1;

  for (let row = 0; row < 11; row += 1) {
    const y = row * 18;
    context.beginPath();

    for (let col = -10; col <= 10; col += 1) {
      const x = col * 24;
      const offset = Math.sin(time * 0.0014 + col * 0.6 + row * 0.32) * 9;
      if (col === -10) {
        context.moveTo(x, y + offset);
      } else {
        context.lineTo(x, y + offset);
      }
    }

    context.stroke();
  }

  for (let col = -10; col <= 10; col += 1) {
    context.beginPath();

    for (let row = 0; row <= 10; row += 1) {
      const x = col * 24;
      const y = row * 18;
      const offset = Math.sin(time * 0.0014 + col * 0.6 + row * 0.32) * 9;
      const px = x + Math.sin(time * 0.001 + row * 0.35 + col) * 3;
      if (row === 0) {
        context.moveTo(px, y + offset);
      } else {
        context.lineTo(px, y + offset);
      }
    }

    context.stroke();
  }

  context.restore();

  const digits = "0123456789";
  context.fillStyle = palette.cream;
  context.font = "12px IBM Plex Mono";

  for (let col = 0; col < 18; col += 1) {
    const x = width * 0.15 + col * ((width * 0.7) / 18);
    const y = height * 0.54 + Math.sin(time * 0.0013 + col * 0.55) * 28 + (col % 2) * 10;
    const char = digits[(col + Math.floor(time * 0.002)) % digits.length];
    context.fillText(char, x, y);
  }
};

const drawFieldProbe = (context, width, height, time) => {
  clear(context, width, height);
  const viz = getVizTheme();
  const profile = getActivePlantProfile();
  const accentPrimary = profile ? getProfileColor(profile) : viz.greenStrong;
  const accentSecondary = profile ? (profile.accent === 'orange' ? viz.blueStrong : viz.orangeStrong) : viz.blueMid;

  const padding = 12;
  const innerW = width - padding * 2;
  const innerH = height - padding * 2;
  const { minX, maxX, frontZ, backZ } = chamberFieldMap.bounds;
  const xRange = maxX - minX;
  const zRange = frontZ - backZ;

  const mapX = (x) => padding + ((x - minX) / xRange) * innerW;
  const mapY = (z) => padding + ((frontZ - z) / zRange) * innerH;

  context.globalCompositeOperation = viz.composite;

  // 1. Static Scan lines (Optimized & Less Dramatic)
  context.fillStyle = viz.ink;
  context.globalAlpha = 0.05;
  for (let y = padding; y < padding + innerH; y += 4) {
    context.fillRect(padding, y, innerW, 1);
  }
  context.globalAlpha = 1.0;

  // 2. Technical Border
  context.strokeStyle = viz.blueDim;
  context.lineWidth = 1;
  context.strokeRect(padding, padding, innerW, innerH);
  
  // High-fidelity corner accents
  context.strokeStyle = accentPrimary;
  context.beginPath();
  const clen = 8;
  context.moveTo(padding, padding + clen); context.lineTo(padding, padding); context.lineTo(padding + clen, padding);
  context.moveTo(padding + innerW - clen, padding + innerH); context.lineTo(padding + innerW, padding + innerH); context.lineTo(padding + innerW, padding + innerH - clen);
  context.stroke();

  context.fillStyle = accentPrimary;
  context.font = "500 10px 'IBM Plex Mono'";
  context.fillText("COORDINATE MAP / 01", padding + 4, padding - 5);

  // 3. Grid Crosses (Subtle drift)
  context.strokeStyle = viz.ink;
  context.globalAlpha = 0.2;
  for (let i = 1; i < 5; i++) {
    for (let j = 1; j < 5; j++) {
      const gx = padding + (innerW / 5) * i;
      const gy = padding + (innerH / 5) * j;
      const slowDrift = Math.sin(time * 0.0005 + i + j) * 1;
      context.beginPath(); context.moveTo(gx - 3, gy + slowDrift); context.lineTo(gx + 3, gy + slowDrift); context.stroke();
      context.beginPath(); context.moveTo(gx + slowDrift, gy - 3); context.lineTo(gx + slowDrift, gy + 3); context.stroke();
    }
  }
  context.globalAlpha = 1.0;

  // 4. Slower Glowing Scan Line
  const scanPos = (time * 0.0005) % 1.0;
  const sy = padding + innerH * scanPos;
  
  const scanGrad = context.createLinearGradient(0, sy - 24, 0, sy);
  scanGrad.addColorStop(0, "transparent");
  scanGrad.addColorStop(1, accentSecondary);
  
  context.save();
  context.globalAlpha = 0.15;
  context.fillStyle = scanGrad;
  context.fillRect(padding, sy - 24, innerW, 24);
  context.restore();
  
  context.strokeStyle = accentSecondary;
  context.lineWidth = 1;
  context.shadowBlur = 5;
  context.shadowColor = accentSecondary;
  context.beginPath();
  context.moveTo(padding, sy);
  context.lineTo(padding + innerW, sy);
  context.stroke();
  context.shadowBlur = 0;

  // 5. Specimen Blips
  chamberFieldMap.specimens.forEach((spec, idx) => {
    const px = mapX(spec.x);
    const py = mapY(spec.z);
    const isHoveredKind = profile && profile.visual === spec.kind;

    if (isHoveredKind) {
      context.fillStyle = accentPrimary;
      context.shadowBlur = 8;
      context.shadowColor = accentPrimary;
      
      const bSize = 4 + Math.sin(time * 0.005) * 0.5;
      context.beginPath();
      context.moveTo(px, py - bSize);
      context.lineTo(px + bSize, py);
      context.lineTo(px, py + bSize);
      context.lineTo(px - bSize, py);
      context.closePath();
      context.fill();
      context.shadowBlur = 0;
      
      const pulse = (time * 0.001 + idx) % 1.0;
      context.beginPath();
      context.arc(px, py, 5 + pulse * 12, 0, Math.PI * 2);
      context.strokeStyle = accentPrimary;
      context.globalAlpha = 1 - pulse;
      context.stroke();
      context.globalAlpha = 1.0;
    } else {
      context.fillStyle = viz.ink;
      context.globalAlpha = 0.5;
      context.fillRect(px - 1, py - 1, 2, 2);
      context.globalAlpha = 1.0;
    }
  });

  // 6. Active Target Telemetry
  if (profile) {
    const spec = chamberFieldMap.specimens.find(s => s.kind === profile.visual);
    if (spec) {
      const px = mapX(spec.x);
      const py = mapY(spec.z);
      
      context.strokeStyle = accentPrimary;
      context.globalAlpha = 0.3;
      context.setLineDash([2, 5]);
      context.beginPath();
      context.moveTo(px, padding);
      context.lineTo(px, padding + innerH);
      context.moveTo(padding, py);
      context.lineTo(padding + innerW, py);
      context.stroke();
      context.setLineDash([]);
      context.globalAlpha = 1.0;

      // Coordinate tags
      context.fillStyle = accentPrimary;
      context.font = "500 10px 'IBM Plex Mono'";
      const coordStr = `>LOCK_POS [X:${spec.x.toFixed(2)} Z:${spec.z.toFixed(2)}]`;
      context.fillText(coordStr, px + 8, py - 12);
      
      // Data bytes blip
      if (Math.sin(time * 0.012) > 0) {
        context.fillStyle = accentSecondary;
        const bits = "0x" + Math.floor(time % 0xFFFF).toString(16).toUpperCase().padStart(4, '0');
        context.fillText(`COORD_SEC: ${bits}`, px + 10, py + 16);
      }
    }
  }

  context.globalCompositeOperation = "source-over";
};

const drawField = (context, width, height, time) => {
  clear(context, width, height);
  drawScaffold(context, width, height);
  const viz = getVizTheme();
  context.globalCompositeOperation = viz.composite;

  const marginX = Math.max(18, width * 0.07);
  const marginY = Math.max(16, height * 0.09);
  const plotX = marginX;
  const plotY = marginY;
  const plotW = width - marginX * 2;
  const plotH = height - marginY * 2;
  const { minX, maxX, frontZ, backZ } = chamberFieldMap.bounds;
  const zRange = frontZ - backZ;
  const xRange = maxX - minX;
  const deepGreen = "#244c35";
  const tintMap = {
    green: palette.green,
    blue: palette.blue,
    orange: palette.orange,
    cream: palette.cream,
    pink: "#f28ac8",
    deepGreen,
  };
  const mapDepth = (z) => plotX + ((frontZ - z) / zRange) * plotW;
  const mapLane = (x) => plotY + plotH * (0.16 + ((x - minX) / xRange) * 0.68);
  const telemetryDepth = Math.max(backZ, Math.min(frontZ, chamberTelemetry.focusDepth));
  const scanX = mapDepth(telemetryDepth);
  const sweepX = plotX + chamberTelemetry.sweep * plotW;
  const drift = getSignalNoise(time);
  const tSec = time * 0.001;

  context.strokeStyle = "rgba(243, 241, 231, 0.2)";
  context.lineWidth = 1;
  context.strokeRect(plotX, plotY, plotW, plotH);

  // Depth Grid Lines
  context.strokeStyle = "rgba(255, 148, 71, 0.16)";
  for (let step = 0; step <= 12; step += 1) {
    const z = frontZ - (zRange / 12) * step;
    const x = mapDepth(z);
    context.beginPath();
    context.moveTo(x, plotY);
    context.lineTo(x, plotY + plotH);
    context.stroke();
  }

  // Lane Grid Lines & Crosshairs
  for (let lane = 0; lane <= 6; lane += 1) {
    const y = plotY + plotH * (0.16 + lane * 0.11);
    context.strokeStyle = "rgba(243, 241, 231, 0.08)";
    context.beginPath();
    context.moveTo(plotX, y);
    context.lineTo(plotX + plotW, y);
    context.stroke();
    
    // Crosshairs
    context.strokeStyle = "rgba(243, 241, 231, 0.3)";
    for (let step = 0; step <= 12; step += 1) {
      const z = frontZ - (zRange / 12) * step;
      const x = mapDepth(z);
      context.beginPath(); context.moveTo(x - 2, y); context.lineTo(x + 2, y); context.stroke();
      context.beginPath(); context.moveTo(x, y - 2); context.lineTo(x, y + 2); context.stroke();
    }
  }

  const drawBankCurtain = (bank, side) => {
    const tint = tintMap[bank.tint];
    const direction = side === "left" ? -1 : 1;
    const stemCount = Math.max(3, bank.count || 6);
    for (let i = 0; i < stemCount; i += 1) {
      const t = stemCount === 1 ? 0.5 : i / (stemCount - 1);
      const z = bank.zFront + (bank.zBack - bank.zFront) * t;
      const rootX = mapDepth(z);
      const laneOffset = Math.sin(i * 0.58 + (side === "left" ? 0.25 : 1.2)) * Math.min(0.32, bank.width * 0.12);
      const rootY = mapLane(bank.x + laneOffset);
      const height = 18 + t * 34 + (i % 2) * 3;
      const tipX = rootX - height * 0.15;
      const tipY = rootY + direction * (12 + Math.sin(tSec * 0.8 + i * 0.9) * 2.2);
      context.strokeStyle = `${tint}55`;
      context.beginPath();
      context.moveTo(rootX, rootY);
      context.lineTo(tipX, tipY);
      context.stroke();

      const branchLength = 7 + (i % 4) * 2;
      context.strokeStyle = "rgba(243, 241, 231, 0.22)";
      context.beginPath();
      context.moveTo(tipX, tipY);
      context.lineTo(tipX - 6, tipY + direction * branchLength);
      context.stroke();

      context.fillStyle = i % 3 === 0 ? tint : palette.cream;
      context.fillRect(tipX - 2, tipY - 2, 3.4, 3.4);
    }
  };

  drawBankCurtain(chamberFieldMap.forestBanks[0], "left");
  drawBankCurtain(chamberFieldMap.forestBanks[1], "right");

  // Focus Scan Line
  context.strokeStyle = "rgba(243, 241, 231, 0.25)";
  context.beginPath();
  context.moveTo(scanX, plotY + 4);
  context.lineTo(scanX, plotY + plotH - 4);
  context.stroke();

  // Radar Sweep Echo Trail
  const sweepWidth = plotW * 0.2;
  const sweepGrad = context.createLinearGradient(sweepX - sweepWidth, 0, sweepX, 0);
  const sweepBaseRgb = viz.lightMode ? "30, 80, 200" : "74, 120, 255";
  sweepGrad.addColorStop(0, `rgba(${sweepBaseRgb}, 0)`);
  sweepGrad.addColorStop(1, `rgba(${sweepBaseRgb}, ${0.15 + chamberTelemetry.idleBlend * 0.15})`);
  context.fillStyle = sweepGrad;
  context.fillRect(sweepX - sweepWidth, plotY, sweepWidth, plotH);

  // Radar Sweep Solid Line
  context.shadowBlur = 4;
  context.shadowColor = `rgb(${sweepBaseRgb})`;
  context.strokeStyle = `rgba(${sweepBaseRgb}, ${0.5 + chamberTelemetry.idleBlend * 0.5})`;
  context.lineWidth = 1.5;
  context.beginPath();
  context.moveTo(sweepX, plotY + 2);
  context.lineTo(sweepX, plotY + plotH - 2);
  context.stroke();
  context.shadowBlur = 0;

  const drawZoneCluster = (zone, index) => {
    const centerX = mapDepth(zone.z);
    const centerY = mapLane(zone.x);
    const tint = tintMap[zone.tint];
    const stems = 6 + (index % 4);
    for (let i = 0; i < stems; i += 1) {
      const offsetX = ((i / Math.max(stems - 1, 1)) - 0.5) * zone.spreadZ * 18;
      const offsetY = Math.sin(i * 1.1 + index) * zone.spreadX * 2.4;
      const baseX = centerX + offsetX;
      const baseY = centerY + offsetY;
      const stemHeight = 18 + zone.spreadX * 8 + (i % 3) * 5;
      const tipX = baseX;
      const tipY = baseY - stemHeight;
      context.strokeStyle = "rgba(243, 241, 231, 0.2)";
      context.beginPath();
      context.moveTo(baseX, baseY);
      context.lineTo(tipX, tipY);
      context.stroke();

      context.strokeStyle = `${tint}66`;
      context.beginPath();
      context.moveTo(tipX, tipY);
      context.lineTo(tipX - 8, tipY + 5);
      context.moveTo(tipX, tipY);
      context.lineTo(tipX + 8, tipY + 3);
      context.stroke();
      context.fillStyle = tint;
      context.fillRect(tipX - 1.8, tipY - 1.8, 3.4, 3.4);
    }
  };

  chamberFieldMap.undergrowthZones.forEach(drawZoneCluster);

  const drawRadome = (x, y, tint, phaseOffset) => {
    // Fast fake glow instead of shadowBlur
    const pulseRadius = 8 + Math.sin(tSec * 4 + phaseOffset) * 2;
    context.fillStyle = tint;
    context.globalAlpha = 0.15 + 0.1 * Math.sin(tSec * 2 + phaseOffset);
    context.beginPath(); context.arc(x, y, pulseRadius, 0, Math.PI * 2); context.fill();
    context.globalAlpha = 1.0;
  };

  const drawSpecimen = (specimen) => {
    const x = mapDepth(specimen.z);
    const y = mapLane(specimen.x);
    const tint = tintMap[specimen.tint];
    
    drawRadome(x, y - 8, tint, specimen.x * 0.1);

    // Fast fake glow for active pinging
    const isPinging = Math.abs(Math.sin(tSec * 2 + specimen.z)) > 0.8;
    if (isPinging) {
      context.fillStyle = tint;
      context.globalAlpha = 0.3;
      context.beginPath(); context.arc(x, y - 10, 8, 0, Math.PI * 2); context.fill();
      context.globalAlpha = 1.0;
    }

    context.strokeStyle = tint;
    context.fillStyle = tint;
    context.lineWidth = 1.1;

    if (specimen.kind === "monstera") {
      context.beginPath();
      context.moveTo(x, y + 8);
      context.lineTo(x, y - 15);
      context.moveTo(x, y - 15);
      context.lineTo(x - 10, y - 6);
      context.moveTo(x, y - 15);
      context.lineTo(x + 11, y - 7);
      context.stroke();
      context.fillRect(x - 2, y - 17, 4, 4);
      return;
    }

    if (specimen.kind === "alocasia") {
      context.beginPath();
      context.moveTo(x, y + 8);
      context.lineTo(x, y - 14);
      context.lineTo(x - 6, y - 4);
      context.moveTo(x, y - 14);
      context.lineTo(x + 7, y - 3);
      context.stroke();
      context.fillRect(x - 1.8, y - 16, 3.6, 3.6);
      return;
    }

    if (specimen.kind === "queen") {
      context.beginPath();
      context.moveTo(x, y + 9);
      context.lineTo(x, y - 17);
      context.moveTo(x, y - 17);
      context.lineTo(x - 5, y - 5);
      context.moveTo(x, y - 17);
      context.lineTo(x + 5, y - 5);
      context.stroke();
      context.fillRect(x - 1.4, y - 19, 3, 5);
      return;
    }

    context.beginPath();
    context.moveTo(x, y + 8);
    context.lineTo(x, y - 14);
    context.stroke();
    context.beginPath();
    context.arc(x, y - 16, 3.2, 0, Math.PI * 2);
    context.stroke();
    context.fillRect(x - 1.2, y - 20, 2.4, 2.4);
  };

  chamberFieldMap.specimens.forEach(drawSpecimen);

  const drawActorMarker = (actor, labelTag) => {
    const x = mapDepth(actor.z);
    const y = mapLane(actor.x);
    const tint = tintMap[actor.tint] || palette.cream;
    
    drawRadome(x, y, tint, actor.x * 0.5);

    context.strokeStyle = tint;
    context.fillStyle = tint;
    context.lineWidth = 1.5;

    // Fast fake glow
    context.globalAlpha = 0.25;
    context.beginPath(); context.arc(x, y+2, 10, 0, Math.PI * 2); context.fill();
    context.globalAlpha = 1.0;

    // HUD Label
    context.font = "bold 9px IBM Plex Mono";
    context.fillText(labelTag, x + 8, y - 6);

    if (actor.kind === "dog") {
      context.beginPath();
      context.moveTo(x - 7, y + 3);
      context.lineTo(x + 2, y + 3);
      context.lineTo(x + 6, y - 1);
      context.stroke();
      context.beginPath();
      context.moveTo(x - 4.5, y + 3);
      context.lineTo(x - 4.5, y + 8);
      context.moveTo(x - 0.5, y + 3);
      context.lineTo(x - 0.5, y + 8);
      context.stroke();
      context.fillRect(x + 5.2, y - 2.8, 2.6, 2.6);
      context.beginPath();
      context.moveTo(x - 7, y + 1.5);
      context.lineTo(x - 9.5, y - 1.5);
      context.stroke();
      return;
    }

    if (actor.kind === "terrapin") {
      context.beginPath();
      context.moveTo(x - 6, y + 1);
      context.lineTo(x - 2, y - 4);
      context.lineTo(x + 4, y - 4);
      context.lineTo(x + 7, y);
      context.lineTo(x + 3, y + 4);
      context.lineTo(x - 3, y + 4);
      context.closePath();
      context.stroke();
      context.fillRect(x - 1.4, y - 1.4, 2.8, 2.8);
      context.beginPath();
      context.moveTo(x + 7, y);
      context.lineTo(x + 10.2, y - 1.5);
      context.moveTo(x - 4, y + 3.8);
      context.lineTo(x - 6.6, y + 6.4);
      context.moveTo(x + 1.5, y + 3.8);
      context.lineTo(x + 4.2, y + 6.2);
      context.stroke();
      return;
    }

    context.beginPath();
    context.moveTo(x, y - 12);
    context.lineTo(x, y + 8);
    context.moveTo(x - 6, y - 2);
    context.lineTo(x + 6, y - 2);
    context.moveTo(x, y + 8);
    context.lineTo(x - 4.2, y + 15);
    context.moveTo(x, y + 8);
    context.lineTo(x + 4.2, y + 15);
    context.stroke();
    context.fillRect(x - 1.8, y - 15, 3.6, 3.6);
  };

  drawActorMarker(chamberTelemetry.actors.gardenerA, "[G-A]");
  drawActorMarker(chamberTelemetry.actors.gardenerB, "[G-B]");
  drawActorMarker(chamberTelemetry.actors.bulldog, "[K-9]");
  drawActorMarker(chamberTelemetry.actors.terrapin, "[T-R]");

  const fallsX = mapDepth(chamberFieldMap.waterfall.z);
  const fallsY = mapLane(chamberFieldMap.waterfall.x);
  const fallsHeight = 76;
  const washRgb = viz.lightMode ? "30, 80, 200" : "74, 120, 255";
  
  context.strokeStyle = `rgba(${washRgb}, 0.72)`;
  for (let i = -3; i <= 3; i += 1) {
    const strandX = fallsX + i * 3.8;
    context.beginPath();
    context.moveTo(strandX, fallsY - fallsHeight * 0.54);
    context.lineTo(strandX + Math.sin(tSec * 1.4 + i) * 2, fallsY + fallsHeight * 0.46);
    context.stroke();
  }
  
  context.fillStyle = `rgba(${washRgb}, 0.85)`;
  for (let i = 0; i < 32; i += 1) {
    const splashCycle = ((time * 0.05 + i * 11) % 64);
    const px = fallsX + ((i % 6) - 2.5) * 3 + Math.sin(tSec * 1.0 + i) * 1.5;
    const py = fallsY - 32 + splashCycle;
    context.globalAlpha = 1.0 - (splashCycle / 64); // fade out as falling
    context.fillRect(px, py, 2.5, 2.5);
  }
  context.globalAlpha = 1.0;

  context.strokeStyle = `rgba(${washRgb}, 0.36)`;
  for (let i = 0; i < 3; i += 1) {
    context.beginPath();
    context.moveTo(fallsX - 14 - i * 2, fallsY + 12 + i * 5);
    context.lineTo(fallsX + 14 + i * 2, fallsY + 12 + i * 5);
    context.stroke();
  }

  context.fillStyle = "rgba(243, 241, 231, 1.0)";
  context.font = "bold 10px IBM Plex Mono";
  context.fillText("sys.entry", plotX + 6, plotY + plotH - 8);
  context.fillText("flow.falls", fallsX + 10, fallsY - 38);
  
  // High-tech changing readout
  const focusVariance = Math.floor(Math.abs(Math.sin(tSec * 5) * 4));
  context.fillText(`focus:[${Math.round(Math.abs(telemetryDepth))}.${focusVariance}]`, Math.min(plotX + plotW - 85, scanX + 8), plotY + 14);

  context.globalCompositeOperation = "source-over";
};

const drawSwirl = (context, width, height, time) => {
  clear(context, width, height);
  const viz = getVizTheme();
  const profile = getActivePlantProfile();
  const cx = width * 0.5;
  const cy = height * 0.5;
  const radiusMax = Math.min(width, height) * 0.45;

  const accentPrimary = profile ? getProfileColor(profile) : viz.greenStrong;
  const accentSecondary = profile 
    ? (profile.accent === 'orange' ? viz.blueStrong : viz.orangeStrong) 
    : viz.blueMid;

  // 3D Perspective Projection
  const PERSPECTIVE = 250;
  const project = (x, y, z) => {
    const scale = PERSPECTIVE / (PERSPECTIVE + z);
    return {
      x: cx + x * scale,
      y: cy + y * scale,
      s: scale
    };
  };

  context.globalCompositeOperation = viz.composite;

  // 1. 3D Galactic Dust (Tilted Plane)
  const dustCount = 80;
  context.fillStyle = viz.ink;
  for (let i = 0; i < dustCount; i++) {
    const angle = i * 0.2 + (time + i * 14) * 0.00008;
    const r = (i / dustCount) * radiusMax * 1.35;
    const tilt = 0.45;
    
    // 3D Coordinates (Rotating tilted plane)
    const x = Math.cos(angle) * r;
    const z = Math.sin(angle) * r;
    const y = Math.sin(angle) * r * tilt;
    
    const p = project(x, y, z);
    const size = 1.0 * p.s;
    context.globalAlpha = (0.2 + Math.sin(time * 0.001 + i) * 0.1) * p.s;
    context.fillRect(p.x, p.y, size, size);
  }
  context.globalAlpha = 1.0;

  // 2. Volumetric Central Core (The Elevated Sun)
  const corePulse = Math.sin(time * 0.0022) * 1.2;
  const coreR = 10 + corePulse;
  
  // Outer soft glow (Volumetric layering)
  for (let j = 2; j >= 1; j--) {
    const r = coreR * j * 1.2;
    const grad = context.createRadialGradient(cx, cy, 0, cx, cy, r * 3);
    grad.addColorStop(0, accentPrimary);
    grad.addColorStop(0.35, accentPrimary);
    grad.addColorStop(1, "transparent");
    
    context.save();
    context.globalAlpha = 0.12 + (1 - j / 2) * 0.2;
    context.fillStyle = grad;
    context.beginPath();
    context.arc(cx, cy, r * 3, 0, Math.PI * 2);
    context.fill();
    context.restore();
  }

  // Intense Center
  context.save();
  context.shadowBlur = 18;
  context.shadowColor = accentPrimary;
  context.fillStyle = accentPrimary;
  context.globalAlpha = 0.8 + Math.sin(time * 0.003) * 0.15;
  context.beginPath();
  context.arc(cx, cy, coreR * 0.6, 0, Math.PI * 2);
  context.fill();
  context.restore();
  context.globalAlpha = 1.0;

  // 3. 3D Orbiting Entities (Celestial Bodies)
  const entityCount = profile ? 5 : 4;
  for (let i = 0; i < entityCount; i++) {
    const orbitR = radiusMax * (0.32 + i * 0.23);
    const orbitSpeed = (0.18 + (entityCount - i) * 0.28) * 0.0014 * (i % 2 === 0 ? 1 : -0.7);
    const angle = time * orbitSpeed + i * (Math.PI / 2);
    const tilt = 0.55;
    
    const tx = Math.cos(angle) * orbitR;
    const tz = Math.sin(angle) * orbitR;
    const ty = Math.sin(angle) * orbitR * tilt + Math.cos(angle * 1.5) * orbitR * 0.12; // 3D Tilt + Wobble

    const p = project(tx, ty, tz);

    // Motion Trail (Perspective aware)
    context.beginPath();
    context.lineWidth = 1.4 * p.s;
    context.strokeStyle = accentSecondary;
    context.globalAlpha = 0.3 * p.s;
    const trailSteps = 12;
    for (let j = 0; j < trailSteps; j++) {
      const ta = angle - (j * 0.05 * (orbitSpeed > 0 ? 1 : -1));
      const trayX = Math.cos(ta) * orbitR;
      const trayZ = Math.sin(ta) * orbitR;
      const trayY = Math.sin(ta) * orbitR * tilt + Math.cos(ta * 1.5) * orbitR * 0.12;
      const tp = project(trayX, trayY, trayZ);
      if (j === 0) context.moveTo(tp.x, tp.y);
      else context.lineTo(tp.x, tp.y);
    }
    context.stroke();
    context.globalAlpha = 1.0;

    // Body
    context.fillStyle = accentSecondary;
    context.shadowBlur = 12 * p.s;
    context.shadowColor = accentSecondary;
    context.beginPath();
    context.arc(p.x, p.y, 2.5 * p.s, 0, Math.PI * 2);
    context.fill();
    context.shadowBlur = 0;
  }

  // 4. Target HUD (Static overlay for clarity)
  if (profile) {
    const lockR = radiusMax * 1.12;
    context.strokeStyle = accentPrimary;
    context.lineWidth = 1;

    context.save();
    context.translate(cx, cy);
    context.rotate(time * 0.0006);
    for (let i = 0; i < 4; i++) {
      context.beginPath();
      const aStart = i * Math.PI * 0.5;
      context.arc(0, 0, lockR, aStart, aStart + 0.38);
      context.stroke();
    }
    context.restore();

    context.fillStyle = accentPrimary;
    context.font = "bold 9px 'IBM Plex Mono'";
    const label = `>BIO_LOCK: ${profile.visual.toUpperCase()}`;
    context.fillText(label, cx - 45, cy + lockR + 18);
  }

  context.globalCompositeOperation = "source-over";
};



const drawObliqueBlock = (context, x, y, w, h, d, colorFront, colorTop, colorSide, isWire = false) => {
  const dx = Math.round(d * 0.6);
  const dy = Math.round(d * -0.6);
  if (isWire) {
    context.strokeStyle = colorFront;
    context.strokeRect(x, y - h, w, h);
    context.beginPath(); context.moveTo(x, y - h); context.lineTo(x + dx, y - h + dy); context.lineTo(x + w + dx, y - h + dy); context.lineTo(x + w, y - h); context.stroke();
    context.beginPath(); context.moveTo(x + w, y - h); context.lineTo(x + w + dx, y - h + dy); context.lineTo(x + w + dx, y + dy); context.lineTo(x + w, y); context.stroke();
  } else {
    context.fillStyle = colorTop;
    context.beginPath(); context.moveTo(x, y - h); context.lineTo(x + dx, y - h + dy); context.lineTo(x + w + dx, y - h + dy); context.lineTo(x + w, y - h); context.fill();
    context.fillStyle = colorSide;
    context.beginPath(); context.moveTo(x + w, y - h); context.lineTo(x + w + dx, y - h + dy); context.lineTo(x + w + dx, y + dy); context.lineTo(x + w, y); context.fill();
    context.fillStyle = colorFront;
    context.fillRect(x, y - h, w, h);
  }
};
const plantPatterns = {
  monstera: [
    {x: 0, y: -1, w: 1, h: 5},
    {x: 0, y: 3, w: 5, h: 1},
    {x: 4, y: 0, w: 1, h: 4},
    {x: 6, y: -1, w: 1, h: 4},
    {x: 2, y: 2, w: 2, h: 1},
  ],
  alocasia: [
    {x: 1, y: 0, w: 1, h: 6},
    {x: 5, y: 0, w: 1, h: 6},
    {x: 3, y: -1, w: 1, h: 7},
    {x: 2, y: 2, w: 3, h: 1},
  ],
  flamingo: [
    {x: 0, y: 0, w: 1, h: 4},
    {x: 1, y: 3, w: 3, h: 1},
    {x: 3, y: 0, w: 1, h: 4},
    {x: 4, y: 0, w: 3, h: 1},
    {x: 6, y: 0, w: 1, h: 4},
  ],
  queen: [
    {x: 0, y: -1, w: 7, h: 1},
    {x: 0, y: 0, w: 1, h: 5},
    {x: 6, y: 0, w: 1, h: 5},
    {x: 1, y: 2, w: 5, h: 1},
    {x: 3, y: 3, w: 1, h: 2},
  ],
  flora: [
    {x: 1, y: 1, w: 1, h: 1},
    {x: 5, y: 1, w: 1, h: 1},
    {x: 3, y: 3, w: 1, h: 1},
    {x: 1, y: 5, w: 1, h: 1},
    {x: 5, y: 5, w: 1, h: 1},
    {x: 2, y: -1, w: 3, h: 1},
  ],
  scanning: [
    {x: 3, y: -1, w: 1, h: 7},
    {x: 0, y: 3, w: 7, h: 1},
  ]
};

const drawGridSlice = (context, width, height, time) => {
  clear(context, width, height);
  const viz = getVizTheme();
  
  // Use the established viz colors:
  const accentPrimary = viz.greenStrong;
  const accentSecondary = viz.greenMid;
  const accentDim = viz.greenDim;

  const stackHud = width < 220 || width / height < 1.45;
  const compactHud = width < 240;
  const padding = compactHud ? 8 : 10;
  
  const hudW = stackHud
    ? width - padding * 2
    : compactHud
      ? Math.max(56, Math.min(72, width * 0.24))
      : Math.max(92, width * 0.18);
  const hudH = stackHud ? Math.max(50, Math.min(64, height * 0.32)) : height - padding * 2;

  const gx = padding;
  const gy = padding;
  const gw = stackHud ? width - padding * 2 : width - hudW - padding * 3;
  const gh = stackHud ? height - hudH - padding * 3 : height - padding * 2;
  const hx = stackHud ? padding : width - hudW - padding;
  const hy = stackHud ? gy + gh + padding : padding;

  // Draw Main Stage Container
  context.fillStyle = viz.panelBg;
  context.fillRect(gx, gy, gw, gh);
  
  // High-fidelity border with corner accents
  context.strokeStyle = accentDim;
  context.lineWidth = 1;
  context.strokeRect(gx, gy, gw, gh);
  
  context.strokeStyle = accentPrimary;
  context.beginPath();
  const clen = 6;
  // Top Left
  context.moveTo(gx, gy + clen); context.lineTo(gx, gy); context.lineTo(gx + clen, gy);
  // Top Right
  context.moveTo(gx + gw - clen, gy); context.lineTo(gx + gw, gy); context.lineTo(gx + gw, gy + clen);
  // Bottom Right
  context.moveTo(gx + gw, gy + gh - clen); context.lineTo(gx + gw, gy + gh); context.lineTo(gx + gw - clen, gy + gh);
  // Bottom Left
  context.moveTo(gx + clen, gy + gh); context.lineTo(gx, gy + gh); context.lineTo(gx, gy + gh - clen);
  context.stroke();

  // Background Grid (Retro PETSCII style with crosses and dots)
  context.fillStyle = accentDim;
  for (let i = 8; i < gw - 8; i += 16) {
    for (let j = 8; j < gh - 8; j += 16) {
      if ((i + j) % 64 === 0) {
        context.fillText("+", gx + i - 3, gy + j + 3);
      } else {
        context.fillRect(gx + i, gy + j, 1, 1);
      }
    }
  }

  const profile = getActivePlantProfile();
  const mapWalls = (profile && plantPatterns[profile.visual]) 
                 ? plantPatterns[profile.visual] 
                 : null;

  if (mapWalls) {
    // Max visual footprint: roughly 7.6 blocks wide and 6.6 blocks high
    const logicalW = 7.6;
    const logicalH = 6.6;
    
    // Apply a safety scalar to ensure it fits safely inside container
    const safeW = gw * 0.8;
    const safeH = gh * 0.75;
    
    const blockSize = Math.min(safeW / logicalW, safeH / logicalH, 36); 
    const depth = blockSize * 0.6;
    const structureWidth = blockSize * 7 + depth;
    const structureHeight = blockSize * 7; 
    
    // Center it safely in the container
    const offsetX = gx + (gw - structureWidth) * 0.5;
    const offsetY = gy + gh - (gh - structureHeight) * 0.35 - blockSize * 1.5; 

    // Draw an animated scanning plane beneath
    const scanY = offsetY + blockSize * 1.5;
    context.fillStyle = "rgba(125, 229, 141, 0.05)";
    context.fillRect(gx + 12, scanY - Math.sin(time*0.002)*20, gw - 24, 2);

    // Draw isometric blocks
    mapWalls.forEach(w => {
      drawObliqueBlock(context, offsetX + w.x * blockSize, offsetY - w.y * blockSize, w.w * blockSize, blockSize * w.h, depth, accentPrimary, accentSecondary, accentDim);
    });

    // Active target overlay
    const glyphX = offsetX + 2.5 * blockSize;
    const glyphY = offsetY - 1.5 * blockSize;
    
    context.fillStyle = accentPrimary;
    const mapGlyphFont = compactHud ? "bold 11px IBM Plex Mono" : "bold 13px IBM Plex Mono";
    context.font = mapGlyphFont;
    
    // Pulse hover
    const px = glyphX + Math.sin(time*0.003)*5;
    const py = glyphY + Math.cos(time*0.003)*5;
    
    context.shadowBlur = 8;
    context.shadowColor = accentPrimary;
    context.fillText("@", px, py);
    context.shadowBlur = 0;

    // Connect line from @ to label
    context.beginPath();
    context.moveTo(px + 10, py - 4);
    context.lineTo(px + 24, py - 18);
    context.lineTo(px + 50, py - 18);
    context.strokeStyle = accentSecondary;
    context.stroke();

    context.font = "bold 8px IBM Plex Mono";
    context.fillText(`[${profile.visual.toUpperCase()}]`, px + 26, py - 22);
  } else {
    // NO PROFILE: Draw Placeholder
    const centerX = gx + gw * 0.5;
    const centerY = gy + gh * 0.5;

    context.fillStyle = accentDim;
    context.font = "bold 10px IBM Plex Mono";
    const msg = "SCAN PLANT";
    const msgW = context.measureText(msg).width;
    context.fillText(msg, centerX - msgW * 0.5, centerY + 4);
    
    // Subtle pulsing scanner ring
    context.strokeStyle = accentDim;
    context.globalAlpha = Math.sin(time * 0.003) * 0.2 + 0.2;
    context.lineWidth = 1;
    const r = 24 + Math.sin(time * 0.002) * 5;
    context.beginPath();
    context.arc(centerX, centerY, r, 0, Math.PI * 2);
    context.stroke();
    context.globalAlpha = 1.0;
  }

  // Draw HUD side panel
  context.fillStyle = viz.panelBg;
  context.fillRect(hx, hy, hudW, hudH);
  
  context.strokeStyle = accentSecondary;
  context.lineWidth = 1;
  context.strokeRect(hx, hy, hudW, hudH);
  
  const hudInset = compactHud ? 6 : 8;
  const hudTitleFont = compactHud ? "bold 9px IBM Plex Mono" : "bold 10px IBM Plex Mono";
  const hudValueFont = compactHud ? "8px IBM Plex Mono" : "9px IBM Plex Mono";
  
  context.fillStyle = accentPrimary;
  context.font = hudTitleFont;
  context.fillText("TARGET INFO", hx + hudInset, hy + (compactHud ? 16 : 18));
  
  // Separator
  context.beginPath();
  context.moveTo(hx + hudInset, hy + (compactHud ? 22 : 24));
  context.lineTo(hx + hudW - hudInset, hy + (compactHud ? 22 : 24));
  context.strokeStyle = accentDim;
  context.stroke();

  context.font = hudValueFont;
  if (profile) {
    let lockLabel = chamberTelemetry.lockState;
    if (lockLabel === "locked") lockLabel = "HARD";
    else if (lockLabel === "tracking") lockLabel = "TRACK";
    else lockLabel = "SOFT";
    
    const nameStr = `>${profile.visual.toUpperCase()}`;
    const lkStr = "LK: " + lockLabel;
    const dpStr = "DP: +" + Math.round(Math.abs(chamberTelemetry.focusDepth));

    if (stackHud) {
      const yOffset = hy + (compactHud ? 38 : 42);
      context.fillStyle = accentPrimary;
      context.fillText(nameStr, hx + hudInset, yOffset);
      context.fillStyle = accentSecondary;
      context.fillText(lkStr, hx + hudInset + Math.max(54, hudW * 0.28), yOffset);
      context.fillText(dpStr, hx + hudInset + Math.max(104, hudW * 0.54), yOffset);
    } else {
      context.fillStyle = accentPrimary;
      context.fillText(nameStr, hx + hudInset, hy + (compactHud ? 36 : 42));
      context.fillStyle = accentSecondary;
      context.fillText(lkStr, hx + hudInset, hy + (compactHud ? 48 : 56));
      context.fillText(dpStr, hx + hudInset, hy + (compactHud ? 58 : 68));
      // Mini visual bar
      context.fillRect(hx + hudInset, hy + (compactHud ? 66 : 78), (hudW - hudInset*2) * 0.7, 4);
    }
  } else {
    if (stackHud) {
      const yOffset = hy + (compactHud ? 38 : 42);
      context.fillStyle = accentSecondary;
      context.fillText(">IDLE", hx + hudInset, yOffset);
      context.fillStyle = accentDim;
      context.fillText("AWAITING CONTACT", hx + hudInset + Math.max(54, hudW * 0.28), yOffset);
    } else {
      context.fillStyle = accentSecondary;
      context.fillText(">IDLE", hx + hudInset, hy + (compactHud ? 36 : 42));
      context.fillStyle = accentDim;
      context.fillText("AWAITING", hx + hudInset, hy + (compactHud ? 48 : 56));
      context.fillText("CONTACT", hx + hudInset, hy + (compactHud ? 58 : 68));
    }
  }

  // Animated scanner block in corner of HUD
  const radarS = stackHud
    ? Math.min(32, hudH - hudInset * 2, hudW * 0.2)
    : Math.min(hudW - hudInset * 2, hudH - (compactHud ? 80 : 96));
  const rx = stackHud ? hx + hudW - radarS - hudInset : hx + hudW - radarS - hudInset;
  const ry = hy + hudH - radarS - hudInset;
  
  context.strokeStyle = accentDim;
  context.strokeRect(rx, ry, radarS, radarS);
  
  context.fillStyle = accentPrimary;
  const radarTravel = radarS * 0.3;
  context.fillRect(
    rx + radarS * 0.5 + Math.sin(time * 0.002) * radarTravel - 2,
    ry + radarS * 0.5 + Math.cos(time * 0.0026) * radarTravel - 2,
    4,
    4
  );
};

const drawUntired = (context, width, height, time, pointer = {}) => {
  clear(context, width, height);
  const hoverBlend = pointer.hoverBlend || 0;
  const viz = getVizTheme();
  context.globalCompositeOperation = viz.composite;
  
  const cx = width * 0.5;
  const cy = height * 0.55;
  const rows = 12;
  const cols = 20;
  const spacing = 16;
  
  context.lineWidth = 1;
  
  const project = (x, y, z) => {
    const px = cx + (x - z) * 0.866;
    const py = cy + (x + z) * 0.5 - y;
    return {x: px, y: py};
  };

  const getHeight = (r, c) => {
    return Math.sin(r * 0.5 + time * 0.002) * (12 + hoverBlend * 6) + Math.cos(c * 0.4 + time * 0.0015) * (8 + hoverBlend * 4);
  };

  context.beginPath();
  for (let r = 0; r <= rows; r++) {
    for (let c = 0; c <= cols; c++) {
      const x = (c - cols/2) * spacing;
      const z = (r - rows/2) * spacing;
      const y = getHeight(r, c);
      const p = project(x, y, z);
      if (c === 0) context.moveTo(p.x, p.y);
      else context.lineTo(p.x, p.y);
    }
  }
  for (let c = 0; c <= cols; c++) {
    for (let r = 0; r <= rows; r++) {
      const x = (c - cols/2) * spacing;
      const z = (r - rows/2) * spacing;
      const y = getHeight(r, c);
      const p = project(x, y, z);
      if (r === 0) context.moveTo(p.x, p.y);
      else context.lineTo(p.x, p.y);
    }
  }
  context.strokeStyle = viz.blueMid;
  context.stroke();

  context.fillStyle = viz.orangeStrong;
  context.shadowBlur = 8;
  context.shadowColor = viz.orangeStrong;
  
  for (let i = 0; i < 30; i++) {
    const t = time * (0.0005 + hoverBlend * 0.0005) + i * 0.7;
    const px = cx + Math.sin(t * 1.3) * width * 0.35 + (i%2?-1:1)*20;
    const py = cy - 20 - Math.abs(Math.sin(t)) * height * 0.5;
    
    if (Math.sin(t * 5 + i) > 0) {
      context.fillRect(px, py, 2, 2);
      if (i % 3 === 0) {
        context.font = "8px IBM Plex Mono";
        context.fillText(Math.floor(Math.abs(Math.sin(t*10)*9)), px + 5, py + 3);
      }
    }
  }

  context.shadowBlur = 0;
  context.globalCompositeOperation = "source-over";
};

const drawSoba = (context, width, height, time, pointer = {}) => {
  clear(context, width, height);
  const hoverBlend = pointer.hoverBlend || 0;
  const viz = getVizTheme();
  const cx = width * 0.5;
  const cy = height * 0.5;
  context.globalCompositeOperation = viz.composite;

  const points = 70;
  const radius = Math.min(width, height) * 0.38;
  const innerRadius = radius * 0.45;
  
  const nodes = [];
  
  for (let i = 0; i < points; i++) {
    const phi = Math.acos(1 - 2 * ((i + (time*(0.0005 + hoverBlend * 0.0005))) % points) / points);
    const theta = Math.PI * (1 + Math.sqrt(5)) * i;
    
    // Core hollow calculation
    const dist = innerRadius + (radius - innerRadius) * Math.abs(Math.sin(i * 123.45 + time*0.001));
    
    const x = dist * Math.sin(phi) * Math.cos(theta);
    const y = dist * Math.sin(phi) * Math.sin(theta);
    const z = dist * Math.cos(phi);
    
    const ry = time * (0.0008 + hoverBlend * 0.001);
    const rx = time * (0.0004 + hoverBlend * 0.0005);
    
    const x1 = x * Math.cos(ry) - z * Math.sin(ry);
    const z1 = z * Math.cos(ry) + x * Math.sin(ry);
    const y1 = y * Math.cos(rx) - z1 * Math.sin(rx);
    const z2 = z1 * Math.cos(rx) + y * Math.sin(rx);
    
    const scale = 200 / (200 + z2);
    nodes.push({x: cx + x1 * scale, y: cy + y1 * scale, z: z2, oX: x, oY: y, oZ: z});
  }

  context.strokeStyle = viz.greenDim;
  context.lineWidth = 0.5;
  context.beginPath();
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const dx = nodes[i].oX - nodes[j].oX;
      const dy = nodes[i].oY - nodes[j].oY;
      const dz = nodes[i].oZ - nodes[j].oZ;
      const distSq = dx*dx + dy*dy + dz*dz;
      if (distSq < (radius * 0.7) * (radius * 0.7) && distSq > (radius * 0.3) * (radius * 0.3)) {
         if ((i+j) % 6 === 0) {
           context.moveTo(nodes[i].x, nodes[i].y);
           context.lineTo(nodes[j].x, nodes[j].y);
         }
      }
    }
  }
  context.stroke();

  nodes.sort((a,b) => b.z - a.z);
  for (let i = 0; i < nodes.length; i++) {
    const n = nodes[i];
    const isCore = Math.abs(n.oX) < innerRadius * 1.6 && Math.abs(n.oY) < innerRadius * 1.6 && Math.abs(n.oZ) < innerRadius * 1.6;
    
    context.fillStyle = isCore ? viz.orangeMid : (i % 4 === 0 ? viz.greenStrong : viz.greenMid);
    context.shadowBlur = isCore ? 10 : (i % 4 === 0 ? 6 : 0);
    context.shadowColor = context.fillStyle;
    
    const size = (isCore ? 3 : 1.5) * (200 / (200 + n.z));
    context.beginPath();
    context.arc(n.x, n.y, Math.max(0.5, size), 0, Math.PI*2);
    context.fill();
  }

  context.shadowBlur = 0;
  context.globalCompositeOperation = "source-over";
};

const drawMonkey = (context, width, height, time, pointer = {}) => {
  clear(context, width, height);
  const hoverBlend = pointer.hoverBlend || 0;
  const viz = getVizTheme();
  const cx = width * 0.5;
  const cy = height * 0.5;
  context.globalCompositeOperation = viz.composite;
  
  const numNodes = 18;
  const nodes = [];
  const radius = Math.min(width, height) * 0.38;
  
  for (let i = 0; i < numNodes; i++) {
    const a1 = i * 2.4;
    const a2 = i * 3.7;
    const r = radius * (0.4 + (0.6 + hoverBlend * 0.3) * Math.abs(Math.sin(i * 11.1)));
    
    const x = r * Math.sin(a1) * Math.cos(a2);
    const y = r * Math.sin(a1) * Math.sin(a2);
    const z = r * Math.cos(a1);
    
    const ry = time * (0.0006 + hoverBlend * 0.0012);
    const rx = time * (0.0009 + hoverBlend * 0.0015);
    
    const x1 = x * Math.cos(ry) - z * Math.sin(ry);
    const z1 = z * Math.cos(ry) + x * Math.sin(ry);
    const y1 = y * Math.cos(rx) - z1 * Math.sin(rx);
    const z2 = z1 * Math.cos(rx) + y * Math.sin(rx);
    
    const scale = 200 / (200 + z2);
    nodes.push({ id: i, x: cx + x1 * scale, y: cy + y1 * scale, z: z2, origZ: z });
  }
  
  nodes.sort((a,b) => b.z - a.z);
  
  context.lineWidth = 1;
  const orangeRgb = viz.lightMode ? "204, 100, 31" : "255, 148, 71";
  
  for (let i = 0; i < numNodes; i++) {
    for (let j = i + 1; j < numNodes; j++) {
      if ((nodes[i].id + nodes[j].id) % 3 === 0) {
        context.beginPath();
        const mx = (nodes[i].x + nodes[j].x) * 0.5 + Math.sin(time*0.002 + i)*(15 + hoverBlend * 10);
        const my = (nodes[i].y + nodes[j].y) * 0.5 + Math.cos(time*0.002 + j)*(15 + hoverBlend * 10);
        
        context.moveTo(nodes[i].x, nodes[i].y);
        context.quadraticCurveTo(mx, my, nodes[j].x, nodes[j].y);
        
        const depthAvg = (nodes[i].z + nodes[j].z) * 0.5;
        const alpha = Math.max(0.1, 1 - (depthAvg + 80) / 160);
        context.strokeStyle = `rgba(${orangeRgb}, ${alpha})`;
        context.stroke();
      }
    }
  }

  context.font = "10px IBM Plex Mono";
  nodes.forEach(n => {
    const alpha = Math.max(0.2, 1 - (n.z + 80) / 160);
    context.fillStyle = `rgba(${orangeRgb}, ${alpha})`;
    context.shadowBlur = 8;
    context.shadowColor = context.fillStyle;
    
    context.beginPath(); 
    context.arc(n.x, n.y, 2, 0, Math.PI*2); 
    context.fill();
    
    if (Math.sin(time * 0.01 + n.id * 10) > 0) {
      const chars = "01ABCDEFあえおきる";
      const char = chars[Math.floor(Math.abs(Math.sin(time*0.005 + n.id))*chars.length)];
      context.fillText(char, n.x + 5, n.y - 2);
    }
  });

  context.shadowBlur = 0;
  context.globalCompositeOperation = "source-over";
};

const drawBone = (context, width, height, time, pointer = {}) => {
  clear(context, width, height);
  const hoverBlend = pointer.hoverBlend || 0;
  const viz = getVizTheme();
  const cx = width * 0.5;
  const cy = height * 0.5;
  context.globalCompositeOperation = viz.composite;
  
  const blueRgb = viz.lightMode ? "30, 80, 200" : "74, 120, 255";
  const cyanRgb = viz.lightMode ? "0, 150, 150" : "40, 210, 210";
  
  // Magnetic Field Lines
  context.lineWidth = 1;
  const numLines = 14;
  for (let i = 0; i < numLines; i++) {
    const angleOffset = ( i / numLines ) * Math.PI * 2 + time * (0.0005 + hoverBlend * 0.0015);
    
    context.beginPath();
    for (let t = -Math.PI; t <= Math.PI; t += 0.1) {
      const r = 45 * Math.sin(t) * Math.sin(t);
      if (r < 0.1) continue;
      
      const baseX = r * Math.sin(t);
      const baseY = r * Math.cos(t);
      
      const rotatedX = baseX * Math.cos(angleOffset);
      const z = baseX * Math.sin(angleOffset);
      
      const scale = 200 / (200 + z);
      const px = cx + rotatedX * scale;
      const py = cy + baseY * scale;
      
      if (t === -Math.PI) context.moveTo(px, py);
      else context.lineTo(px, py);
    }
    
    const zFar = 50 * Math.sin(angleOffset);
    const alpha = Math.max(0.05, 1 - (zFar + 50) / 100);
    context.strokeStyle = `rgba(${blueRgb}, ${alpha})`;
    context.stroke();
  }

  // Core coil rings
  const coilRadius = 16;
  const coilHeight = 24;
  context.strokeStyle = `rgba(${cyanRgb}, 0.9)`;
  context.lineWidth = 1.5;
  context.shadowBlur = 10;
  context.shadowColor = context.strokeStyle;
  
  context.beginPath();
  for (let i = 0; i <= 50; i++) {
    const t = i / 50;
    const a = t * Math.PI * 12 + time * 0.008;
    const y = cy - coilHeight/2 + t * coilHeight;
    const x = cx + Math.cos(a) * coilRadius;
    const z = Math.sin(a) * coilRadius;
    
    const scale = 200 / (200 + z);
    const px = cx + (x - cx) * scale;
    const py = y;
    
    if (i === 0) context.moveTo(px, py);
    else context.lineTo(px, py);
  }
  context.stroke();

  // Energy particles flowing along field
  context.fillStyle = viz.greenStrong;
  context.shadowBlur = 6;
  context.shadowColor = viz.greenStrong;
  for (let i = 0; i < 20; i++) {
    const pt = (time * (0.003 + hoverBlend * 0.005) + i * 0.4) % (Math.PI * 2);
    const t = pt - Math.PI;
    const r = 45 * Math.sin(t) * Math.sin(t);
    if (r < 0.1) continue;
    
    const baseX = r * Math.sin(t);
    const baseY = r * Math.cos(t);
    const angleOffset = ( i / 20 ) * Math.PI * 2 + time * 0.001;
    
    const rotatedX = baseX * Math.cos(angleOffset);
    const z = baseX * Math.sin(angleOffset);
    const scale = 200 / (200 + z);
    const px = cx + rotatedX * scale;
    const py = cy + baseY * scale;
    
    const alpha = Math.max(0.1, 1 - (z + 50) / 100);
    context.globalAlpha = alpha;
    context.fillRect(px - 1.5, py - 1.5, 3, 3);
  }
  
  context.globalAlpha = 1;
  context.shadowBlur = 0;
  context.globalCompositeOperation = "source-over";
};

const drawOrbitMini = (context, width, height, time, pointer = {}) => {
  clear(context, width, height);
  const hoverBlend = pointer.hoverBlend || 0;
  const viz = getVizTheme();
  const cx = width * 0.5;
  const cy = height * 0.5;
  context.globalCompositeOperation = viz.composite;
  
  const drawGyro = (r, rotX, rotY, rotZ, colorRgb, particleCount, reverse) => {
    const points = [];
    for (let i = 0; i <= 30; i++) { // reduce geometry density slightly
      const angle = (i / 30) * Math.PI * 2 + hoverBlend * 0.5 * (reverse ? -1 : 1);
      let x = Math.cos(angle) * r;
      let y = Math.sin(angle) * r;
      let z = 0;
      
      let x1 = x * Math.cos(rotZ) - y * Math.sin(rotZ);
      let y1 = y * Math.cos(rotZ) + x * Math.sin(rotZ);
      let z1 = z;

      let x2 = x1 * Math.cos(rotY) - z1 * Math.sin(rotY);
      let z2 = z1 * Math.cos(rotY) + x1 * Math.sin(rotY);
      let y2 = y1;

      let y3 = y2 * Math.cos(rotX) - z2 * Math.sin(rotX);
      let z3 = z2 * Math.cos(rotX) + y2 * Math.sin(rotX);
      let x3 = x2;

      const scale = 200 / (200 + z3);
      points.push({x: cx + x3*scale, y: cy + y3*scale, z: z3});
    }
    
    context.beginPath();
    points.forEach((p, i) => {
      if (i === 0) context.moveTo(p.x, p.y);
      else context.lineTo(p.x, p.y);
    });
    
    context.strokeStyle = `rgba(${colorRgb}, 0.5)`;
    context.lineWidth = 1;
    context.stroke();

    for (let i = 0; i < particleCount; i++) {
        const idxOffset = Math.floor(i * 30 / particleCount);
        const cycle = reverse ? (30 - Math.floor(time * 0.05 + idxOffset) % 30) : (Math.floor(time * 0.05 + idxOffset) % 30);
        const p = points[cycle];
        if (p) {
            const size = 1.5 * (200 / (200 + p.z));
            context.fillStyle = `rgba(${colorRgb}, 1)`;
            context.beginPath(); context.arc(p.x, p.y, Math.max(0.5, size), 0, Math.PI*2); context.fill();
            
            // Fast fake glow
            context.fillStyle = `rgba(${colorRgb}, 0.3)`;
            context.beginPath(); context.arc(p.x, p.y, Math.max(0.5, size)*3, 0, Math.PI*2); context.fill();
        }
    }
  };

  const t = time * (0.001 + hoverBlend * 0.002);
  const blueRgb = viz.lightMode ? "30, 80, 200" : "74, 120, 255";
  const purpleRgb = viz.lightMode ? "140, 40, 200" : "180, 100, 255";
  const pinkRgb = viz.lightMode ? "200, 40, 100" : "255, 100, 150";

  drawGyro(height*0.4, t, t*0.8, 0, blueRgb, 6, false);
  drawGyro(height*0.32, -t*1.2, t*0.5, Math.PI/4, purpleRgb, 8, true);
  drawGyro(height*0.25, t*0.5, -t*1.5, Math.PI/2, pinkRgb, 4, false);
  drawGyro(height*0.18, 0, Math.PI/3, t*2, blueRgb, 3, true);
  
  context.fillStyle = `rgba(${pinkRgb}, 1)`;
  context.beginPath(); context.arc(cx, cy, 2 + Math.sin(t*8)*1, 0, Math.PI*2); context.fill();
  
  context.globalCompositeOperation = "source-over";
};

const drawGridMini = (context, width, height, time, pointer = {}) => {
  clear(context, width, height);
  const hoverBlend = pointer.hoverBlend || 0;
  const viz = getVizTheme();
  context.globalCompositeOperation = viz.composite;
  
  const cx = width * 0.5;
  const cy = height * 0.75;
  const spacing = 16;
  const rows = 10;
  const cols = 10;

  const project = (x, y, z) => {
    const isoX = cx + (x - z) * 0.866;
    const isoY = cy + (x + z) * 0.5 - y;
    return {x: isoX, y: isoY};
  };

  // Optimize: distinctive amber/orange theme
  const amberRgb = viz.lightMode ? "220, 100, 0" : "255, 160, 40";
  const orangeRgb = viz.lightMode ? "204, 60, 0" : "255, 100, 20";

  // Batch base grid lines
  context.beginPath();
  for (let r = 0; r <= rows; r++) {
    for (let c = 0; c <= cols; c++) {
      const x = (c - cols/2) * spacing;
      const z = (r - rows/2) * spacing;
      const p = project(x, 0, z);
      
      if (c < cols) {
        const pNextC = project(x + spacing, 0, z);
        context.moveTo(p.x, p.y); context.lineTo(pNextC.x, pNextC.y);
      }
      if (r < rows) {
        const pNextR = project(x, 0, z + spacing);
        context.moveTo(p.x, p.y); context.lineTo(pNextR.x, pNextR.y);
      }
    }
  }
  context.strokeStyle = `rgba(${amberRgb}, 0.2)`;
  context.lineWidth = 1;
  context.stroke();

  // Batch pillars
  context.strokeStyle = `rgba(${amberRgb}, 0.8)`;
  context.beginPath();
  for (let r = 0; r <= rows; r++) {
    for (let c = 0; c <= cols; c++) {
      const x = (c - cols/2) * spacing;
      const z = (r - rows/2) * spacing;
      const p = project(x, 0, z);
      
      const id = r * cols + c;
      const waveOffset = Math.sin(id * 1.7 + time * (0.003 + hoverBlend * 0.005)) * Math.cos(time * 0.002 + r);
      const pHeight = Math.max(0, waveOffset * (40 + hoverBlend * 20));
      
      if (pHeight > 3) {
        const topP = project(x, pHeight, z);
        context.moveTo(p.x, p.y); context.lineTo(topP.x, topP.y);
      }
    }
  }
  context.stroke();

  // Nodes and glowing spots
  for (let r = 0; r <= rows; r++) {
    for (let c = 0; c <= cols; c++) {
      const x = (c - cols/2) * spacing;
      const z = (r - rows/2) * spacing;
      const id = r * cols + c;
      const waveOffset = Math.sin(id * 1.7 + time * (0.003 + hoverBlend * 0.005)) * Math.cos(time * 0.002 + r);
      const pHeight = Math.max(0, waveOffset * (40 + hoverBlend * 20));
      const topP = project(x, pHeight, z);
      const p = project(x, 0, z);

      if (pHeight > 3) {
        context.fillStyle = `rgba(${orangeRgb}, 1)`;
        context.beginPath(); context.arc(topP.x, topP.y, 1.5, 0, Math.PI*2); context.fill();
        // Fast fake glow instead of shadowBlur
        context.fillStyle = `rgba(${orangeRgb}, 0.3)`;
        context.beginPath(); context.arc(topP.x, topP.y, 4, 0, Math.PI*2); context.fill();
      } else {
        context.fillStyle = `rgba(${amberRgb}, 0.4)`;
        context.fillRect(p.x - 1, p.y - 1, 2, 2);
      }
      
      if (waveOffset > 0.8 && id % 3 === 0) {
        context.fillStyle = `rgba(${orangeRgb}, 1)`;
        context.font = "bold 8px IBM Plex Mono";
        context.fillText((id % 16).toString(16).toUpperCase(), p.x-2, p.y - pHeight - 5);
      }
    }
  }
  
  context.globalCompositeOperation = "source-over";
};

const drawBranchMini = (context, width, height, time, pointer = {}) => {
  clear(context, width, height);
  const hoverBlend = pointer.hoverBlend || 0;
  const viz = getVizTheme();
  context.globalCompositeOperation = viz.composite;
  
  const cx = width * 0.5;
  const cy = height * 0.5;
  
  // Dense structural green & cyan aesthetic
  const greenRgb = viz.lightMode ? "20, 140, 60" : "80, 220, 120";
  const cyanRgb = viz.lightMode ? "0, 120, 140" : "40, 200, 220";
  
  const drawFractal = (x, y, size, rotation, depth) => {
    if (depth === 0) return;
    
    const points = [];
    for(let i=0; i<6; i++) {
        const angle = rotation + (i/6) * Math.PI * 2;
        const r = i%2 === 0 ? size : size * 0.4;
        points.push({x: x + Math.cos(angle)*r, y: y + Math.sin(angle)*r});
    }

    const alpha = depth / 4;
    context.strokeStyle = depth >= 3 ? `rgba(${cyanRgb},${alpha})` : `rgba(${greenRgb},${alpha})`;
    context.lineWidth = depth * 0.5;
    
    // Path rendering without shadowBlur
    context.beginPath();
    points.forEach((p, i) => {
        if(i===0) context.moveTo(p.x, p.y);
        else context.lineTo(p.x, p.y);
    });
    context.closePath();
    context.stroke();
    
    if (depth < 3 && depth > 1) {
      context.fillStyle = `rgba(${cyanRgb}, 1)`;
      context.fillRect(x - 1.5, y - 1.5, 3, 3);
    }

    const t = time * (0.0008 + hoverBlend * 0.0015);
    drawFractal(points[0].x, points[0].y, size * 0.5, rotation + t + depth*(0.2 + hoverBlend * 0.1), depth - 1);
    drawFractal(points[2].x, points[2].y, size * 0.5, rotation - t - depth*(0.2 + hoverBlend * 0.1), depth - 1);
    drawFractal(points[4].x, points[4].y, size * 0.5, rotation + t*(2 + hoverBlend), depth - 1);
  };
  
  drawFractal(cx, cy, Math.min(width,height)*0.3, time * (0.0003 + hoverBlend * 0.0005), 4);
  
  context.globalCompositeOperation = "source-over";
};

const drawPulseMini = (context, width, height, time, pointer = {}) => {
  clear(context, width, height);
  const hoverBlend = pointer.hoverBlend || 0;
  const viz = getVizTheme();
  context.globalCompositeOperation = viz.composite;
  
  const cy = height * 0.5;
  const numWaves = 4;
  const wInt = Math.max(1, Math.ceil(width));
  const heights = new Array(wInt).fill(0);
  
  // Unique Cyan / Deep Blue aesthetic for Motion
  const blueRgb = viz.lightMode ? "20, 60, 200" : "60, 100, 255";
  const cyanRgb = viz.lightMode ? "0, 140, 160" : "40, 220, 255";
  const whiteRgb = viz.lightMode ? "0, 0, 0" : "255, 255, 255";
  
  for (let w = 0; w < numWaves; w++) {
    const freq = 0.02 + w * (0.035 + hoverBlend * 0.015);
    const speed = 0.003 + w * (0.0015 + hoverBlend * 0.001);
    const amp = 15 + w * (8 + hoverBlend * 8);
    
    context.strokeStyle = w === 0 ? `rgba(${cyanRgb}, 0.8)` : `rgba(${blueRgb}, 0.5)`;
    context.lineWidth = w === 0 ? 1.5 : 0.8;
    
    context.beginPath();
    for (let x = 0; x < width; x += 2) {
      const env = Math.exp(-Math.pow((x - width*0.5)/(width*0.35), 2));
      const val = Math.sin(x * freq + time * speed) * amp * env;
      const y = cy + val;
      if (x < wInt) heights[x] += val; // safely accumulate
      
      if (x === 0) context.moveTo(x, y);
      else context.lineTo(x, y);
    }
    context.stroke();
  }
  
  context.font = "bold 9px IBM Plex Mono";
  
  for (let x = 0; x < wInt; x += 6) {
    if (heights[x] && Math.abs(heights[x]) > 40) {
        const peakY = cy + heights[x];
        
        // Fast fake glow
        context.fillStyle = `rgba(${cyanRgb}, 0.3)`;
        context.beginPath(); context.arc(x, peakY, 5, 0, Math.PI*2); context.fill();
        
        // Core node
        context.fillStyle = `rgba(${whiteRgb}, 1)`;
        context.fillRect(x - 1, peakY - 1, 2, 2);
        
        if (Math.sin(x * 0.1 + time * 0.01) > 0.5) {
            context.fillStyle = `rgba(${whiteRgb}, 0.8)`;
            const chars = "■▤▥▦▧▨▩ABCDEF01239";
            context.fillText(chars[x % chars.length], x - 3, peakY + (heights[x] > 0 ? 12 : -6));
        }
    }
  }
  
  context.globalCompositeOperation = "source-over";
};

const drawStudio = (context, width, height, time) => {
  clear(context, width, height);
  const viz = getVizTheme();
  const orangeSolid = viz.orangeStrong;
  const orangeMid = viz.orangeMid;
  const orangeDim = viz.orangeDim;

  const pad = 20;
  context.fillStyle = viz.panelBg;
  context.fillRect(pad, pad, width - pad * 2, height - pad * 2);
  
  context.strokeStyle = orangeMid;
  context.lineWidth = 2;
  context.strokeRect(pad, pad, width - pad * 2, height - pad * 2);

  context.fillStyle = orangeDim;
  for(let i = 0; i < width - pad * 2; i += 20) {
    for(let j = 0; j < height - pad * 2; j += 20) {
      if ((i + j) % 40 === 0) {
        context.font = "10px IBM Plex Mono";
        context.fillText("~", pad + i, pad + j);
      }
    }
  }

  const blockW = Math.min(60, width * 0.15);
  const blockH = Math.min(40, height * 0.15);
  const depth = blockW * 0.4;
  const blockLabels = [
    ["PLAY", "CODE", "FLOW", "CARE"],
    ["LOOP", "SHIP", "TEST", "TUNE"],
    ["GAME", "WEB", "AI", "TOOL"],
  ];
  
  for(let row = 0; row < 3; row++) {
    for(let col = 0; col < 4; col++) {
      const bx = pad + blockW + col * (blockW * 2);
      const by = pad + blockH * 3 + row * (blockH * 2.5);
      if (bx + blockW + depth > width - pad || by > height - pad) continue;
      
      const hPulse = blockH + Math.sin(time * 0.002 + row + col) * 10;
      drawObliqueBlock(context, bx, by, blockW, hPulse, depth, orangeSolid, orangeMid, orangeDim);
      
      context.fillStyle = "black";
      context.font = "bold 10px IBM Plex Mono";
      context.fillText(blockLabels[row][col], bx + 5, by - hPulse + 15);
    }
  }

  const scale = 3; 
  const t = time * 0.001;
  const walkSpeed = 9 * scale; // pixels per second
  const travelDist = width - pad * 2 - blockW * 1.5;
  const cycleDist = travelDist + 80; // Dwell for a bit at the end
  const rawX = (t * walkSpeed) % cycleDist; 
  const isWalking = rawX < travelDist;
  
  // Snap position to a grid of `scale` to prevent anti-aliasing blur
  const dx = Math.min(rawX, travelDist);
  const px = pad + blockW * 0.5 + Math.floor(dx / scale) * scale;
  
  const py = pad + height - pad * 2 - blockH + 20; 

  // Sideways walking (Profile view)
  const walkFrames = [
    [ // Stride
      "   xxx  ",
      "  xxxx  ",
      "  xxxx  ",
      "   xx   ",
      "  xxxx  ",
      " xx xx  ",
      " x  x x ",
      "xx   xx "
    ],
    [ // Passing (up)
      "   xxx  ",
      "  xxxx  ",
      "  xxxx  ",
      "   xx   ",
      "  xxxx  ",
      "   xx   ",
      "  xxxx  ",
      "    xx  "
    ],
    [ // Stride 2
      "   xxx  ",
      "  xxxx  ",
      "  xxxx  ",
      "   xx   ",
      "  xxxx  ",
      "  xx xx ",
      " x x  x ",
      " xx   xx"
    ],
    [ // Passing (up)
      "   xxx  ",
      "  xxxx  ",
      "  xxxx  ",
      "   xx   ",
      "  xxxx  ",
      "   xx   ",
      "  xxxx  ",
      "   xx   "
    ]
  ];

  let frameIndex = 0;
  if (isWalking) {
    frameIndex = Math.floor(t * 6) % 4; // Ping-pong timing
  } else {
    frameIndex = 1; // Stand still when dwelling
  }
  
  const activeFrame = walkFrames[frameIndex];
  
  context.fillStyle = orangeSolid;
  
  // Plunge 1 pixel strictly when mid-stride to emphasize the classic 8-bit walk
  const bob = (frameIndex === 0 || frameIndex === 2) ? scale : 0;
  const sx = px - Math.floor((activeFrame[0].length * scale) / 2);
  const sy = Math.floor(py - (activeFrame.length * scale)) + bob;

  for (let y = 0; y < activeFrame.length; y++) {
    for (let x = 0; x < activeFrame[y].length; x++) {
      if (activeFrame[y][x] === "x") {
        context.fillRect(sx + x * scale, sy + y * scale, scale, scale);
      }
    }
  }

  context.font = "12px IBM Plex Mono";
  context.fillText("FROM GAMES // TO PRODUCT SYSTEMS", pad + 20, pad + 30);
};

const drawFooter = (context, width, height, time) => {
  clear(context, width, height);
  const viz = getVizTheme();
  const blueSolid = viz.blueStrong;
  const blueMid = viz.blueMid;
  const blueDim = viz.blueDim;
  const compact = width < 480 || height < 220;
  const pad = compact ? 14 : 20;
  const titleFont = compact ? 11 : 14;
  const bodyFont = compact ? 9 : 12;
  const infoFont = compact ? 10 : 14;
  const slotSize = compact ? 24 : 30;
  const statusHeight = compact ? 14 : 20;

  context.fillStyle = viz.panelBg;
  context.fillRect(pad, pad, width - pad * 2, height - pad * 2);
  
  context.strokeStyle = blueMid;
  context.lineWidth = 2;
  context.strokeRect(pad, pad, width - pad * 2, height - pad * 2);

  const hudW = compact ? Math.max(132, width * 0.28) : Math.max(200, width * 0.3);
  const infoH = compact ? 58 : 80;
  
  context.beginPath();
  context.moveTo(width - pad - hudW, pad);
  context.lineTo(width - pad - hudW, height - pad);
  context.moveTo(pad, height - pad - infoH);
  context.lineTo(width - pad, height - pad - infoH);
  context.stroke();

  const viewW = width - pad * 2 - hudW;
  const viewH = height - pad * 2 - infoH;

  context.fillStyle = blueDim;
  for(let i = 0; i < viewW; i += 12) {
    for(let j = 0; j < viewH; j += 12) {
      if ((i + j) % 24 === 0) context.fillRect(pad + i, pad + j, 2, 2);
    }
  }

  const bw = Math.min(compact ? 42 : 60, viewW * (compact ? 0.16 : 0.2));
  drawObliqueBlock(context, pad + bw * 0.45, pad + viewH - (compact ? 26 : 40), bw, bw * 1.5, bw * 0.45, blueSolid, blueMid, blueDim);
  drawObliqueBlock(context, pad + bw * 2.1, pad + viewH - (compact ? 44 : 70), bw * 1.15, bw, bw * 0.45, blueSolid, blueMid, blueDim);
  drawObliqueBlock(context, pad + bw * 3.8, pad + viewH - (compact ? 14 : 20), bw * 0.8, bw * 2, bw * 0.45, blueSolid, blueMid, blueDim);

  context.fillStyle = blueSolid;
  context.font = `${bodyFont}px IBM Plex Mono`;
  context.fillText("BACKEND", pad + bw * 0.45, pad + viewH - (compact ? 26 : 40) - bw * 1.5 - 8);
  context.fillText("DATABASE", pad + bw * 2.1 + 3, pad + viewH - (compact ? 44 : 70) - bw - 8);
  context.fillText("3D", pad + bw * 3.8, pad + viewH - (compact ? 14 : 20) - bw * 2 - 8);

  const hx = width - pad - hudW;
  const hy = pad;
  
  context.fillStyle = blueSolid;
  context.font = `${titleFont}px IBM Plex Mono`;
  context.fillText("EQUIPPED", hx + 12, hy + (compact ? 18 : 25));
  context.font = `${bodyFont}px IBM Plex Mono`;
  context.fillText("-> WEB INTERFACE", hx + 12, hy + (compact ? 38 : 50));
  context.fillText("-> MOBILE NATIVE", hx + 12, hy + (compact ? 52 : 70));

  const splitA = hy + (compact ? 68 : 90);
  context.beginPath();
  context.moveTo(hx, splitA);
  context.lineTo(width - pad, splitA);
  context.stroke();

  context.font = `${titleFont}px IBM Plex Mono`;
  context.fillText("INVENTORY", hx + 12, hy + (compact ? 86 : 115));
  
  context.fillStyle = blueMid;
  context.fillRect(hx + 12, hy + (compact ? 98 : 130), slotSize, slotSize);
  context.fillStyle = "black";
  context.fillText("DB", hx + 16, hy + (compact ? 114 : 150));

  context.fillStyle = blueMid;
  context.fillRect(hx + 18 + slotSize, hy + (compact ? 98 : 130), slotSize, slotSize);
  context.fillStyle = "black";
  context.fillText("3D", hx + 22 + slotSize, hy + (compact ? 114 : 150));

  context.fillStyle = blueMid;
  context.fillRect(hx + 24 + slotSize * 2, hy + (compact ? 98 : 130), slotSize, slotSize);
  context.fillStyle = "black";
  context.fillText("HW", hx + 28 + slotSize * 2, hy + (compact ? 114 : 150));

  const splitB = hy + (compact ? 132 : 180);
  context.beginPath();
  context.moveTo(hx, splitB);
  context.lineTo(width - pad, splitB);
  context.stroke();
  
  context.fillStyle = blueSolid;
  context.font = `${titleFont}px IBM Plex Mono`;
  context.fillText("STATUS", hx + 12, hy + (compact ? 150 : 205));
  
  const pulse = Math.abs(Math.sin(time * 0.002));
  for(let i = 0; i < 10; i++) {
    if (i < 8 + pulse * 2) {
      context.fillStyle = blueSolid;
    } else {
      context.fillStyle = blueDim;
    }
    context.fillRect(
      hx + 12 + i * ((hudW - 32) / 10),
      hy + (compact ? 162 : 220),
      Math.max(compact ? 6 : 8, hudW * 0.05),
      statusHeight
    );
  }

  const ix = pad;
  const iy = height - pad - infoH;
  context.fillStyle = blueSolid;
  context.font = `${infoFont}px IBM Plex Mono`;
  context.fillText("+ INFORMATION LOG +", ix + 12, iy + (compact ? 18 : 25));
  context.fillStyle = blueMid;
  context.font = `${bodyFont}px IBM Plex Mono`;
  context.fillText("> SCANNING STACK PATTERNS...", ix + 12, iy + (compact ? 34 : 45));
  context.fillText("> SYSTEM INTEGRATION COMPLETE.", ix + 12, iy + (compact ? 48 : 60));
};

const drawSignalPortal = (context, width, height, time) => {
  clear(context, width, height);
  const viz = getVizTheme();
  context.globalCompositeOperation = viz.composite;
  
  const cx = width * 0.5;
  const cy = height * 0.45;
  
  const blueRgb = viz.lightMode ? "30, 80, 200" : "74, 120, 255";
  const greenRgb = viz.lightMode ? "40, 160, 60" : "125, 229, 141";
  const orangeRgb = viz.lightMode ? "204, 100, 31" : "255, 148, 71";
  const cream = viz.ink;
  
  // Tunnel properties
  const numRings = 24;
  const speed = time * 0.08;
  const maxZ = 200;
  const globalRot = Math.sin(time * 0.0003) * 0.5;
  
  // Center glow
  const grad = context.createRadialGradient(cx, cy, 0, cx, cy, 100);
  grad.addColorStop(0, `rgba(${blueRgb}, 0.2)`);
  grad.addColorStop(1, "transparent");
  context.fillStyle = grad;
  context.fillRect(cx - 100, cy - 100, 200, 200);

  // Depth lines
  context.beginPath();
  for (let a = 0; a < 6; a++) {
    const angle = globalRot + (a / 6) * Math.PI * 2;
    for (let z = 0; z < maxZ; z += 10) {
      // Perspective scale: x / z. A constant like 400 makes the far end vanish nicely.
      const scale = 400 / (10 + z);
      const px = cx + Math.cos(angle) * 40 * scale;
      const py = cy + Math.sin(angle) * 40 * scale;
      if (z === 0) context.moveTo(px, py);
      else context.lineTo(px, py);
    }
  }
  context.strokeStyle = `rgba(${blueRgb}, 0.25)`;
  context.lineWidth = 1;
  context.stroke();

  // Hex Rings
  for (let i = 0; i < numRings; i++) {
    // Generate z from back to front, seamlessly looping
    const zBase = ((i * maxZ / numRings) - speed) % maxZ;
    const z = zBase < 0 ? zBase + maxZ : zBase;
    
    // Sort rendering visually isn't needed since screen/multiply blend handles it, 
    // but larger rings draw over smaller ones organically if we iterate like this.
    // Wait, physically, front (small z, huge scale) should be drawn LAST so it covers the back.
    // Since z wraps around, it's not perfectly sorted, but for pure wireframe it's totally fine.
    
    const scale = 400 / (10 + z);
    const radius = 40 * scale;
    
    context.beginPath();
    for (let a = 0; a <= 6; a++) {
      const angle = globalRot + (a % 6) / 6 * Math.PI * 2;
      const px = cx + Math.cos(angle) * radius;
      const py = cy + Math.sin(angle) * radius;
      if (a === 0) context.moveTo(px, py);
      else context.lineTo(px, py);
    }
    
    const alpha = Math.max(0, 1 - Math.pow(z / maxZ, 1.5));
    // Pulse rings
    const isMajor = Math.floor(zBase + speed) % 80 < 5;
    
    context.strokeStyle = isMajor ? `rgba(${orangeRgb}, ${alpha * 0.9})` : `rgba(${blueRgb}, ${alpha * 0.6})`;
    context.lineWidth = 1 + (maxZ - z) * 0.005;
    context.stroke();
    
    // Nodes & Data Packets
    context.fillStyle = `rgba(${isMajor ? orangeRgb : greenRgb}, ${alpha})`;
    context.shadowBlur = isMajor ? 10 : 0;
    context.shadowColor = context.fillStyle;
    
    for (let a = 0; a < 6; a++) {
      if ((i + a) % 4 === 0 || isMajor) {
        const angle = globalRot + (a / 6) * Math.PI * 2;
        const px = cx + Math.cos(angle) * radius;
        const py = cy + Math.sin(angle) * radius;
        const size = Math.max(0.5, 3 * scale * 0.05);
        context.beginPath(); context.arc(px, py, size, 0, Math.PI*2); context.fill();
        
        // Random Hex Text on nodes
        if (z < 100 && Math.sin(time*0.01 + i*3.1) > 0.8) {
            context.font = `${Math.max(6, 12 * scale * 0.03)}px IBM Plex Mono`;
            const textAlpha = Math.max(0, 1 - z/100);
            context.fillStyle = `rgba(${cream.replace(/rgba?\(([^)]+)\)/, "$1")}, ${textAlpha})`;
            context.shadowBlur = 0;
            const chars = "0189ABCDEF>";
            context.fillText(chars[a % chars.length], px + 4, py - 4);
        }
      }
    }
    context.shadowBlur = 0;
  }

  // Tech labels HUD
  context.fillStyle = cream;
  context.font = "bold 10px IBM Plex Mono";
  context.fillText("SYSTEM 07 // OPEN CHANNEL", width * 0.08, height * 0.12);
  context.font = "10px IBM Plex Mono";
  context.fillText("secure channel routing...", width * 0.08, height * 0.16);
  
  const statusX = width * 0.65;
  const ping = Math.floor(12 + Math.sin(time*0.005)*5);
  context.fillText(`LATENCY: ${ping}ms`, statusX, height * 0.12);
  context.fillText(Math.sin(time*0.001) > 0 ? "BUFFER: STABLE" : "BUFFER: FLUSHING", statusX, height * 0.16);

  // Floating Data Streams on the left
  const streamY = height * 0.3;
  context.fillStyle = `rgba(${blueRgb}, 1)`;
  for(let i=0; i<4; i++) {
    const tx = width * 0.08 + (time * 0.03 + i * 50) % (width * 0.25);
    const alpha = 1 - (tx / (width * 0.25));
    context.globalAlpha = alpha;
    context.fillText(">[HANDSHAKE_OK]", tx, streamY + i * 14);
  }
  context.globalAlpha = 1.0;

  // Activity strips (bottom)
  const strips = [
    { x: width * 0.1, y: height * 0.85, w: width * 0.15, tint: `rgba(${greenRgb}, 1)`, label: "MODEM" },
    { x: width * 0.3, y: height * 0.85, w: width * 0.15, tint: `rgba(${orangeRgb}, 1)`, label: "SYNC" },
    { x: width * 0.5, y: height * 0.85, w: width * 0.15, tint: `rgba(${blueRgb}, 1)`, label: "PEER" },
    { x: width * 0.7, y: height * 0.85, w: width * 0.15, tint: viz.lightMode ? "rgba(200,50,150,1)" : "rgba(242,138,200,1)", label: "LINK" },
  ];
  
  strips.forEach((strip, index) => {
    const fill = 0.5 + Math.sin(time * 0.003 + index * 1.5) * 0.4;
    context.strokeStyle = viz.blueDim;
    context.lineWidth = 1;
    context.strokeRect(strip.x, strip.y, strip.w, 12);
    context.fillStyle = strip.tint;
    context.fillRect(strip.x + 1, strip.y + 1, (strip.w - 2) * Math.max(0, fill), 10);
    context.fillStyle = cream;
    context.font = "8px IBM Plex Mono";
    context.fillText(strip.label, strip.x, strip.y - 4);
    
    // Mini activity blip above the bar
    if (Math.sin(time*0.01 + index) > 0.8) {
      context.fillStyle = strip.tint;
      context.fillRect(strip.x + strip.w - 4, strip.y - 12, 4, 4);
    }
  });

  context.globalCompositeOperation = "source-over";
};

const drawers = {
  hero: drawHero,
  field: drawField,
  fieldprobe: drawFieldProbe,
  swirl: drawSwirl,
  gridslice: drawGridSlice,
  untired: drawUntired,
  soba: drawSoba,
  monkey: drawMonkey,
  bone: drawBone,
  orbit: drawOrbitMini,
  grid: drawGridMini,
  branch: drawBranchMini,
  pulse: drawPulseMini,
  studio: drawStudio,
  footer: drawFooter,
};

const cleanups = [];
let heroCleanup = () => {};
setupSoundtrack();
setupHoverTone();

const mountPetsciiSignals = () => {
  const targets = Array.from(
    document.querySelectorAll(".section-label, .metric-label, .probe-head p:first-child, .footer-kicker")
  );
  if (!targets.length) {
    return;
  }

  const laneWidth = 14;
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/.-+* ";
  const patterns = [
    "SIGNAL // LIVE",
    "CONTACT // OPEN",
    "BUFFER // READY",
    "TRACK // ACTIVE",
    "SCAN // FIELD",
    "ARCHIVE // MAP",
    "BUILD // STEADY",
    "NOTE // CURRENT",
    "SYNC // CLEAR",
    "MODE // LIVE",
  ];

  const signalStates = targets.map((target, index) => {
    const span = document.createElement("span");
    span.className = "petscii-inline";
    span.setAttribute("aria-hidden", "true");
    target.appendChild(span);

    const initialPattern = patterns[index % patterns.length];
    return {
      span,
      targetText: initialPattern,
      flipProgress: new Array(laneWidth).fill(0).map(() => Math.floor(Math.random() * 12)),
      nextUpdate: 60 + Math.random() * 100,
    };
  });

  let tick = 0;
  const intervalId = window.setInterval(() => {
    tick += 1;

    signalStates.forEach((state) => {
      // Periodic update to a new random pattern
      if (tick % Math.floor(state.nextUpdate) === 0) {
        state.targetText = patterns[Math.floor(Math.random() * patterns.length)];
        // Trigger flip for all characters with staggered start
        state.flipProgress = state.flipProgress.map(() => Math.floor(8 + Math.random() * 14));
        // Calculate next update time
        state.nextUpdate = tick + 140 + Math.random() * 200;
      }

      let frame = "";
      let isFlipping = false;

      for (let i = 0; i < laneWidth; i++) {
        const targetChar = state.targetText[i] || " ";
        if (state.flipProgress[i] > 0) {
          // Flip through random mechanical characters
          frame += chars[Math.floor(Math.random() * chars.length)];
          state.flipProgress[i]--;
          isFlipping = true;
        } else {
          frame += targetChar;
        }
      }

      state.span.textContent = frame;
      state.span.classList.toggle("is-active", isFlipping);
    });
  }, 68);

  cleanups.push(() => window.clearInterval(intervalId));
};

cleanups.push(() => window.removeEventListener("scroll", updateScrollState));
mountPetsciiSignals();

if (cursorShell && cursorRing && cursorDot && cursorLabel && window.matchMedia("(pointer: fine)").matches) {
  const ring = { x: 0, y: 0 };
  const dot = { x: 0, y: 0 };
  const target = { x: window.innerWidth * 0.5, y: window.innerHeight * 0.5 };
  let rafId = 0;
  let visible = false;
  let interactiveActive = false;
  let telemetryActive = false;

  const setTelemetryLabel = () => {
    if (!heroStage || !telemetryActive || interactiveActive || cursorShell.classList.contains("is-scanning")) {
      cursorShell.classList.remove("has-label");
      return;
    }

    const bounds = heroStage.getBoundingClientRect();
    const x = Math.max(-1, Math.min(1, ((target.x - bounds.left) / bounds.width - 0.5) * 2));
    const y = Math.max(-1, Math.min(1, ((target.y - bounds.top) / bounds.height - 0.5) * 2));
    const format = (value) => `${value >= 0 ? "+" : ""}${value.toFixed(2)}`;
    cursorLabel.textContent = `x:${format(x)} y:${format(-y)}`;
    cursorShell.classList.add("has-label");
  };

  const animateCursor = () => {
    ring.x += (target.x - ring.x) * 0.18;
    ring.y += (target.y - ring.y) * 0.18;
    dot.x += (target.x - dot.x) * 0.42;
    dot.y += (target.y - dot.y) * 0.42;

    cursorRing.style.transform = `translate3d(${ring.x}px, ${ring.y}px, 0)`;
    cursorDot.style.transform = `translate3d(${dot.x}px, ${dot.y}px, 0)`;
    cursorLabel.style.transform = `translate3d(${ring.x}px, ${ring.y}px, 0)`;

    rafId = window.requestAnimationFrame(animateCursor);
  };

  const onMove = (event) => {
    target.x = event.clientX;
    target.y = event.clientY;

    if (!visible) {
      visible = true;
      cursorShell.classList.add("is-visible");
    }

    setTelemetryLabel();
  };

  const onLeave = () => {
    visible = false;
    cursorShell.classList.remove("is-visible");
    cursorShell.classList.remove("is-link");
    cursorShell.classList.remove("has-label");
  };

  const setInteractive = (active, label = "open") => {
    interactiveActive = active;
    cursorShell.classList.toggle("is-link", active);
    cursorLabel.textContent = label;
    cursorShell.classList.toggle("has-label", active);
    cursorRing.style.width = active ? "42px" : "28px";
    cursorRing.style.height = active ? "42px" : "28px";
    cursorRing.style.marginLeft = active ? "-21px" : "-14px";
    cursorRing.style.marginTop = active ? "-21px" : "-14px";

    if (!active && telemetryActive) {
      cursorShell.classList.add("is-telemetry");
      setTelemetryLabel();
    } else if (active) {
      cursorShell.classList.remove("is-telemetry");
    }
  };

  document.addEventListener("pointermove", onMove);
  document.addEventListener("pointerleave", onLeave);

  document.querySelectorAll("a, button").forEach((element) => {
    const label = element.matches(".work-link") ? "visit" : element.matches(".button") ? "enter" : "open";
    element.addEventListener("pointerenter", () => setInteractive(true, label));
    element.addEventListener("pointerleave", () => setInteractive(false));
  });

  if (heroStage) {
    heroStage.addEventListener("pointerenter", () => {
      telemetryActive = true;
      if (!interactiveActive) {
        cursorShell.classList.add("is-telemetry");
        setTelemetryLabel();
      }
    });

    heroStage.addEventListener("pointerleave", () => {
      telemetryActive = false;
      if (!interactiveActive) {
        cursorShell.classList.remove("is-telemetry");
      }
      cursorShell.classList.remove("has-label");
    });
  }

  rafId = window.requestAnimationFrame(animateCursor);

  cleanups.push(() => {
    if (rafId) {
      window.cancelAnimationFrame(rafId);
    }
    document.removeEventListener("pointermove", onMove);
    document.removeEventListener("pointerleave", onLeave);
  });
}

const setupHeroThree = async () => {
  if (!heroCanvas || !heroStage) {
    return;
  }

  heroCleanup();

  try {
    const THREE = await import("three");
    const { OrbitControls } = await import("three/addons/controls/OrbitControls.js");
    const hardwareThreads = navigator.hardwareConcurrency || 8;
    const deviceMemory = navigator.deviceMemory || 8;
    const viewportLoad = window.innerWidth * window.innerHeight * Math.min(window.devicePixelRatio || 1, 2);
    const mobileMode = coarsePointer || window.innerWidth < 980 || window.innerHeight < 820;
    const lowPowerMode =
      mobileMode || hardwareThreads <= 6 || deviceMemory <= 8 || viewportLoad > 1800000 || window.innerWidth > 1680;
    const quality = mobileMode
      ? {
          mobile: true,
          pixelRatio: 0.78,
          antialias: false,
          powerPreference: "low-power",
          gridX: 9,
          gridZ: 12,
          ceilingZ: 8,
          bankTrees: 3,
          bankLeaves: 84,
          signalCloud: 24,
          plantDensity: 0.4,
          waterfallStreams: 8,
          waterfallLayers: 2,
          mistCount: 18,
          sprayCount: 12,
          vineCount: 1,
          canopySignals: 28,
          birdCount: 2,
          secondaryStep: 1 / 12,
          atmosphereStep: 1 / 8,
          raycastStep: 1 / 6,
          readoutStep: 1 / 6,
          rippleChance: 0.035,
          animatePlantPulse: false,
          allowHoverScan: false,
          parallaxStrength: 0.2,
        }
      : lowPowerMode
        ? {
            mobile: false,
            pixelRatio: 0.9,
            antialias: false,
            powerPreference: "high-performance",
            gridX: 15,
            gridZ: 18,
            ceilingZ: 13,
            bankTrees: 6,
            bankLeaves: 260,
            signalCloud: 72,
            plantDensity: 0.72,
            waterfallStreams: 18,
            waterfallLayers: 2,
            mistCount: 64,
            sprayCount: 52,
            vineCount: 4,
            canopySignals: 110,
            birdCount: 3,
            secondaryStep: 1 / 24,
            atmosphereStep: 1 / 14,
            raycastStep: 1 / 10,
            readoutStep: 1 / 10,
            rippleChance: 0.09,
            animatePlantPulse: true,
            allowHoverScan: !coarsePointer,
            parallaxStrength: 1.0,
          }
        : {
            mobile: false,
            pixelRatio: 1.05,
            antialias: true,
            powerPreference: "high-performance",
            gridX: 18,
            gridZ: 22,
            ceilingZ: 16,
            bankTrees: 7,
            bankLeaves: 360,
            signalCloud: 96,
            plantDensity: 0.9,
            waterfallStreams: 24,
            waterfallLayers: 3,
            mistCount: 92,
            sprayCount: 72,
            vineCount: 5,
            canopySignals: 150,
            birdCount: 4,
            secondaryStep: 1 / 32,
            atmosphereStep: 1 / 18,
            raycastStep: 1 / 14,
            readoutStep: 1 / 12,
            rippleChance: 0.12,
            animatePlantPulse: true,
            allowHoverScan: true,
            parallaxStrength: 1.45,
          };
    const blueColor = new THREE.Color(palette.blue || "#4a78ff");
    const orangeColor = new THREE.Color(palette.orange || "#ff9447");
    const greenColor = new THREE.Color(palette.green || "#7de58d");
    const creamColor = new THREE.Color(palette.cream || "#f3f1e7");
    const pinkColor = new THREE.Color("#f28ac8");
    const deepGreenColor = new THREE.Color("#244c35");
    const fogColor = new THREE.Color(rootElement.dataset.theme === "light" ? "#dcd6cc" : "#050607");

    const renderer = new THREE.WebGLRenderer({
      canvas: heroCanvas,
      antialias: quality.antialias,
      alpha: true,
      powerPreference: quality.powerPreference,
    });

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, quality.pixelRatio));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.18;
    renderer.setClearColor(0x000000, 0);
    renderer.sortObjects = false;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(fogColor, rootElement.dataset.theme === "light" ? 0.014 : 0.018);

    const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
    camera.position.set(5.2, 7.1, 10.8);
    
    // Allow user to rotate and pan the chamber
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.target.set(0, 0.6, -10.5); // Center focus point deeply on the waterfall cluster
    controls.maxPolarAngle = Math.PI / 2 + 0.1; // Restrict looking under the floor
    controls.minDistance = 2;
    controls.maxDistance = 35;
    controls.enableZoom = false;
    controls.enablePan = !mobileMode;
    controls.panSpeed = mobileMode ? 0.45 : 0.8;
    controls.rotateSpeed = mobileMode ? 0.68 : 1;
    controls.update();

    const zoomButtons = Array.from(heroStage.querySelectorAll("[data-zoom-level]"));
    const zoomPresets = {
      wide: 20.2,
      field: 14.4,
      close: 9.8,
    };
    let activeZoomLevel = defaultHeroZoomLevel;
    let desiredZoomDistance = zoomPresets[activeZoomLevel];

    const setActiveZoomButton = (level) => {
      zoomButtons.forEach((button) => {
        button.classList.toggle("is-active", button.dataset.zoomLevel === level);
      });
    };

    const applyZoomDistance = (distance) => {
      const offset = camera.position.clone().sub(controls.target);
      if (offset.lengthSq() < 0.0001) {
        offset.set(0, 1, 1);
      }
      offset.setLength(distance);
      camera.position.copy(controls.target).add(offset);
    };

    const setZoomLevel = (level, immediate = false) => {
      if (!(level in zoomPresets)) {
        return;
      }
      activeZoomLevel = level;
      desiredZoomDistance = zoomPresets[level];
      chamberTelemetry.zoomLevel = level;
      chamberTelemetry.zoomDistance = desiredZoomDistance;
      setActiveZoomButton(level);
      if (immediate) {
        applyZoomDistance(desiredZoomDistance);
        controls.update();
      }
    };

    const onZoomButtonClick = (event) => {
      const button = event.currentTarget;
      setZoomLevel(button.dataset.zoomLevel);
    };

    zoomButtons.forEach((button) => {
      button.addEventListener("click", onZoomButtonClick);
    });
    setZoomLevel(activeZoomLevel, true);

    const formatSigned = (value, digits = 2) => `${value >= 0 ? "+" : ""}${value.toFixed(digits)}`;
    const toPercent = (value) => `${Math.round(Math.max(0, Math.min(1, value)) * 100)}%`;
    const updateInstrumentReadouts = () => {
      const scanState =
        chamberTelemetry.lockState === "locked"
          ? "lock:hard"
          : chamberTelemetry.lockState === "acquire"
            ? "lock:acquire"
          : chamberTelemetry.lockState === "tracking"
            ? "lock:track"
            : "lock:soft";
      const hoveredProfile = hoveredHitbox ? chamberPlantProfiles[hoveredHitbox.label] || chamberPlantProfiles["[BIO-SIG: BASIC FLORA]"] : null;
      if (signalReadoutText) {
        signalReadoutText.textContent = `focus:${formatSigned(Math.abs(chamberTelemetry.focusDepth), 0)} / ${scanState} / chamber:${chamberTelemetry.idleBlend > 0.7 ? "idle" : "live"}`;
      }
      if (transferReadout) {
        transferReadout.textContent = `handoff / zoom:${chamberTelemetry.zoomLevel} / pulse:${toPercent(chamberTelemetry.waterfallPulse)} / sweep:${formatSigned(chamberTelemetry.sweep * 2 - 1)}`;
      }
      if (probeFieldLive) {
        probeFieldLive.textContent = hoveredProfile
          ? hoveredProfile.fieldLive
          : `map:${scanState} / zoom:${chamberTelemetry.zoomLevel} / archive:${toPercent(chamberTelemetry.idleBlend)}`;
      }
      if (probeFieldNote) {
        probeFieldNote.textContent = hoveredProfile ? hoveredProfile.fieldNote : probePanelDefaults.fieldNote;
      }
      if (probeSwirlLive) {
        probeSwirlLive.textContent = hoveredProfile
          ? hoveredProfile.swirlLive
          : `falls:${toPercent(chamberTelemetry.waterfallPulse)} / density:${chamberTelemetry.specimenDensity}`;
      }
      if (probeSwirlNote) {
        probeSwirlNote.textContent = hoveredProfile ? hoveredProfile.swirlNote : probePanelDefaults.swirlNote;
      }
      if (probeSectionLive) {
        probeSectionLive.textContent = hoveredProfile
          ? hoveredProfile.sectionLive
          : `az:${formatSigned(chamberTelemetry.azimuth, 2)} / el:${formatSigned(chamberTelemetry.polar, 2)} / depth:${formatSigned(Math.abs(chamberTelemetry.focusDepth), 0)}`;
      }
      if (probeSectionNote) {
        probeSectionNote.textContent = hoveredProfile ? hoveredProfile.sectionNote : probePanelDefaults.sectionNote;
      }
    };

    let targetParallaxX = 0;
    let targetParallaxY = 0;
    let parallaxX = 0;
    let parallaxY = 0;

    if (!coarsePointer) {
      heroStage.addEventListener("mousemove", (e) => {
        const rect = heroStage.getBoundingClientRect();
        targetParallaxX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        targetParallaxY = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      });
    }

    const world = new THREE.Group();
    scene.add(world);

    // Removed unused ambient and point lights to vastly reduce draw-call and uniform overhead on unlit materials.

    const disposableGeometries = [];
    const hitboxes = [];

    const disposableMaterials = [];
    const forestBanks = [];
    const groundPlants = [];
    const canopyVines = [];
    const birdPerches = { tree: [], plant: [] };
    const chamberBirds = [];
    const chamberAttendants = [];
    const waterfallUniforms = { uTime: { value: 0 } };
    const poolRings = [];
    let chamberDog = null;
    let chamberTerrapin = null;

    const useGeometry = (geometry) => {
      disposableGeometries.push(geometry);
      return geometry;
    };

    const useMaterial = (material) => {
      disposableMaterials.push(material);
      return material;
    };

    const freezeHierarchy = (object) => {
      object.traverse((child) => {
        if (child === object) {
          return;
        }
        if (child.userData?.keepLiveMatrix) {
          return;
        }
        child.matrixAutoUpdate = false;
        child.updateMatrix();
      });
    };

    const sharedMaterials = {
      pixel: useMaterial(
        new THREE.MeshBasicMaterial({
          color: 0xffffff,
          transparent: true,
          opacity: 0.96,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        }),
      ),
      hitbox: useMaterial(new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false })),
      greenLine: useMaterial(new THREE.LineBasicMaterial({ color: greenColor, transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending, depthWrite: false })),
      deepGreenLine: useMaterial(new THREE.LineBasicMaterial({ color: deepGreenColor, transparent: true, opacity: 0.72, blending: THREE.AdditiveBlending, depthWrite: false })),
      creamLine: useMaterial(new THREE.LineBasicMaterial({ color: creamColor, transparent: true, opacity: 0.76, blending: THREE.AdditiveBlending, depthWrite: false })),
      blueLine: useMaterial(new THREE.LineBasicMaterial({ color: blueColor, transparent: true, opacity: 0.82, blending: THREE.AdditiveBlending, depthWrite: false })),
      orangeLine: useMaterial(new THREE.LineBasicMaterial({ color: orangeColor, transparent: true, opacity: 0.78, blending: THREE.AdditiveBlending, depthWrite: false })),
      pinkLine: useMaterial(new THREE.LineBasicMaterial({ color: pinkColor, transparent: true, opacity: 0.84, blending: THREE.AdditiveBlending, depthWrite: false }))
    };

    const createPixelMaterial = (opacity = 0.82) =>
      useMaterial(
        new THREE.MeshBasicMaterial({
          color: 0xffffff,
          transparent: true,
          opacity,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        }),
      );

    const getLineMaterial = (color) => {
      if (color.equals(greenColor)) return sharedMaterials.greenLine;
      if (color.equals(deepGreenColor)) return sharedMaterials.deepGreenLine;
      if (color.equals(creamColor)) return sharedMaterials.creamLine;
      if (color.equals(blueColor)) return sharedMaterials.blueLine;
      if (color.equals(orangeColor)) return sharedMaterials.orangeLine;
      if (color.equals(pinkColor)) return sharedMaterials.pinkLine;
      return useMaterial(new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.72, blending: THREE.AdditiveBlending, depthWrite: false }));
    };

    const addHitbox = (patch, w, h, d, typeLabel) => {
      const box = new THREE.Mesh(useGeometry(new THREE.BoxGeometry(w, h, d)), sharedMaterials.hitbox);
      box.position.y = h / 2 - 1.8;
      box.layers.set(1); // Isolate to interaction layer to aggressively cull from the rendering pipeline
      patch.add(box);
      hitboxes.push({ mesh: box, patch, label: typeLabel });
    };

    const registerBirdPerches = (
      host,
      anchors,
      {
        type,
        limit = 1,
        yOffset = 0.08,
        xOffset = 0,
        zOffset = 0,
        facingY = 0,
      } = {},
    ) => {
      if (!host || !anchors?.length || !birdPerches[type]) {
        return;
      }

      const selected = anchors
        .slice()
        .sort((a, b) => b.y - a.y)
        .filter(
          (anchor, index, list) =>
            list.findIndex(
              (candidate) =>
                Math.abs(candidate.x - anchor.x) < 0.18 &&
                Math.abs(candidate.y - anchor.y) < 0.16 &&
                Math.abs(candidate.z - anchor.z) < 0.18,
            ) === index,
        )
        .slice(0, limit);

      selected.forEach((anchor, index) => {
        birdPerches[type].push({
          host,
          type,
          occupiedBy: null,
          localPosition: new THREE.Vector3(
            anchor.x + xOffset * (index % 2 === 0 ? 1 : -1),
            anchor.y + yOffset + index * 0.015,
            anchor.z + zOffset,
          ),
          facingY:
            typeof facingY === "function"
              ? facingY(anchor, index)
              : facingY + (index % 2 === 0 ? 0.18 : -0.18),
        });
      });
    };

    const creamLineMaterial = useMaterial(
      new THREE.LineBasicMaterial({
        color: creamColor,
        transparent: true,
        opacity: 0.36,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    );

    const attachPatchHighlight = (patch, color = creamColor) => {
      const highlightGroup = new THREE.Group();
      patch.children.forEach((child) => {
        if (!(child?.isLine || child?.isLineSegments || child?.isLineLoop)) {
          return;
        }
        const ctor = child.isLineLoop ? THREE.LineLoop : child.isLineSegments ? THREE.LineSegments : THREE.Line;
        const material = useMaterial(
          new THREE.LineBasicMaterial({
            color: child.material?.color?.clone?.() || color,
            transparent: true,
            opacity: 0.98,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
          }),
        );
        const overlay = new ctor(child.geometry, material);
        overlay.position.copy(child.position);
        overlay.rotation.copy(child.rotation);
        overlay.scale.copy(child.scale);
        overlay.renderOrder = 5;
        highlightGroup.add(overlay);
      });
      highlightGroup.visible = false;
      patch.add(highlightGroup);
      patch.userData.highlightGroup = highlightGroup;
    };

    const leafGeometry = useGeometry(new THREE.BufferGeometry());
    leafGeometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(
        [
          0,
          0.62,
          0,
          -0.34,
          0.18,
          0,
          -0.22,
          -0.34,
          0,
          0,
          -0.62,
          0,
          0.22,
          -0.34,
          0,
          0.34,
          0.18,
          0,
          0,
          0.62,
          0,
        ],
        3,
      ),
    );
    leafGeometry.setIndex([0, 1, 2, 0, 2, 3, 0, 3, 4, 0, 4, 5]);
    leafGeometry.computeVertexNormals();
    const pixelGeometry = useGeometry(new THREE.BoxGeometry(0.045, 0.045, 0.045));
    const bankLeafGeometry = useGeometry(new THREE.BoxGeometry(0.08, 0.08, 0.08));
    const mistGeometry = useGeometry(new THREE.BoxGeometry(0.06, 0.06, 0.06));
    const canopySignalGeometry = useGeometry(new THREE.BoxGeometry(0.06, 0.06, 0.06));
    const birdBodyGeometry = useGeometry(new THREE.OctahedronGeometry(0.12, 0));
    const birdHeadGeometry = useGeometry(new THREE.OctahedronGeometry(0.08, 0));
    const birdWingGeometry = useGeometry(new THREE.CylinderGeometry(0.08, 0.02, 0.22, 3));
    const birdTailGeometry = useGeometry(new THREE.CylinderGeometry(0.06, 0.01, 0.16, 3));
    const birdBeakGeometry = useGeometry(new THREE.ConeGeometry(0.018, 0.08, 3));
    birdBeakGeometry.rotateX(Math.PI * 0.5);
    const birdSpecies = [
      {
        name: "sunbird",
        preferredPerch: "plant",
        scale: 0.82,
        bodyColor: greenColor,
        wingColor: deepGreenColor,
        accentColor: creamColor,
        flapSpeed: 12.8,
        perchMin: 3.8,
        perchMax: 7.1,
        flightMin: 2.8,
        flightMax: 4.4,
      },
      {
        name: "kingfisher",
        preferredPerch: "tree",
        scale: 0.94,
        bodyColor: blueColor,
        wingColor: creamColor,
        accentColor: orangeColor,
        flapSpeed: 10.2,
        perchMin: 4.6,
        perchMax: 8.2,
        flightMin: 3.2,
        flightMax: 4.8,
      },
      {
        name: "oriole",
        preferredPerch: "tree",
        scale: 1.02,
        bodyColor: orangeColor,
        wingColor: deepGreenColor,
        accentColor: creamColor,
        flapSpeed: 9.3,
        perchMin: 5.2,
        perchMax: 8.8,
        flightMin: 3.4,
        flightMax: 5.2,
      },
    ];
    const birdTempA = new THREE.Vector3();
    const birdTempB = new THREE.Vector3();
    const birdTempC = new THREE.Vector3();

    const createBirdMaterial = (color, opacity = 0.65) =>
      useMaterial(
        new THREE.LineBasicMaterial({
          color,
          transparent: true,
          opacity,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        }),
      );
    birdSpecies.forEach((species) => {
      species.materials = {
        body: createBirdMaterial(species.bodyColor, 0.62),
        wing: createBirdMaterial(species.wingColor, 0.52),
        accent: createBirdMaterial(species.accentColor, 0.72),
        tail: createBirdMaterial(species.wingColor, 0.55),
      };
    });

    const createGridPlane = ({
      width,
      depth,
      xSegments,
      zSegments,
      y,
      opacity = 0.7,
      color = orangeColor,
      cutoutWidth = 0,
      cutoutZStart = null,
      cutoutZEnd = null,
    }) => {
      const positions = [];
      const colors = [];
      const halfWidth = width * 0.5;
      const hasCutout =
        cutoutWidth > 0 &&
        typeof cutoutZStart === "number" &&
        typeof cutoutZEnd === "number" &&
        cutoutZEnd > cutoutZStart;
      const cutoutHalf = cutoutWidth * 0.5;

      const originColor = new THREE.Color(color);
      const edgeColor = new THREE.Color(0x000000); // perfectly fades to transparent in AdditiveBlending

      const pushSegment = (x1, y1, z1, x2, y2, z2) => {
        positions.push(x1, y1, z1, x2, y2, z2);
        
        // Calculate non-linear depth and radial fade to simulate infinite horizon
        const ratio1 = Math.pow(Math.min(1, Math.abs(z1) / depth + Math.abs(x1) / halfWidth * 0.7), 1.4);
        const ratio2 = Math.pow(Math.min(1, Math.abs(z2) / depth + Math.abs(x2) / halfWidth * 0.7), 1.4);
        
        const c1 = new THREE.Color(originColor).lerp(edgeColor, ratio1);
        const c2 = new THREE.Color(originColor).lerp(edgeColor, ratio2);
        
        colors.push(c1.r, c1.g, c1.b, c2.r, c2.g, c2.b);
      };

      for (let x = 0; x <= xSegments; x += 1) {
        const px = -halfWidth + (x / xSegments) * width;
        if (hasCutout && Math.abs(px) < cutoutHalf) {
          pushSegment(px, y, 0, px, y, -cutoutZStart);
          pushSegment(px, y, -cutoutZEnd, px, y, -depth);
        } else {
          pushSegment(px, y, 0, px, y, -depth);
        }
      }

      for (let z = 0; z <= zSegments; z += 1) {
        const pz = -(z / zSegments) * depth;
        const depthFromFront = -pz;
        if (hasCutout && depthFromFront >= cutoutZStart && depthFromFront <= cutoutZEnd) {
          pushSegment(-halfWidth, y, pz, -cutoutHalf, y, pz);
          pushSegment(cutoutHalf, y, pz, halfWidth, y, pz);
        } else {
          pushSegment(-halfWidth, y, pz, halfWidth, y, pz);
        }
      }

      const geometry = useGeometry(new THREE.BufferGeometry());
      geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
      geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
      return new THREE.LineSegments(
        geometry,
        useMaterial(
          new THREE.LineBasicMaterial({
            vertexColors: true,
            transparent: true,
            opacity,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
          }),
        ),
      );
    };

    const floorGrid = createGridPlane({
      width: 12.8,
      depth: 28,
      xSegments: quality.gridX * 2, // Double density for more immersive floor
      zSegments: quality.gridZ * 2,
      y: -1.82,
      opacity: 0.82, // Higher peak opacity since grid gracefully fades
      color: orangeColor,
      cutoutWidth: chamberFieldMap.gridCutout.width,
      cutoutZStart: Math.abs(chamberFieldMap.gridCutout.zStart),
      cutoutZEnd: Math.abs(chamberFieldMap.gridCutout.zEnd),
    });
    world.add(floorGrid);

    const ceilingGrid = createGridPlane({
      width: 12.8,
      depth: 28,
      xSegments: quality.gridX * 2,
      zSegments: quality.ceilingZ * 2,
      y: 3.92,
      opacity: 0.52, // Soft but present blue hue
      color: blueColor, // Dual-tone contrast ceiling vs floor
      cutoutWidth: chamberFieldMap.gridCutout.width * 1.02,
      cutoutZStart: Math.abs(chamberFieldMap.gridCutout.zStart),
      cutoutZEnd: Math.abs(chamberFieldMap.gridCutout.zEnd),
    });
    world.add(ceilingGrid);

    const sweepFrameGeometry = useGeometry(
      new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(-6.1, -1.76, 0),
        new THREE.Vector3(6.1, -1.76, 0),
        new THREE.Vector3(6.1, -1.76, 0),
        new THREE.Vector3(6.1, 3.76, 0),
        new THREE.Vector3(6.1, 3.76, 0),
        new THREE.Vector3(-6.1, 3.76, 0),
        new THREE.Vector3(-6.1, 3.76, 0),
        new THREE.Vector3(-6.1, -1.76, 0),
      ]),
    );
    const sweepFrameMaterial = useMaterial(
      new THREE.LineBasicMaterial({
        color: blueColor,
        transparent: true,
        opacity: 0.04,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    );
    const sweepFrame = new THREE.LineSegments(sweepFrameGeometry, sweepFrameMaterial);
    sweepFrame.position.z = 0;
    world.add(sweepFrame);

    const createForestBank = (side) => {
      const bank = new THREE.Group();
      const anchorPoints = [];
      const trunkSegments = [];
      const branchSegments = [];
      const trunkMaterial = useMaterial(
        new THREE.LineBasicMaterial({
          color: side < 0 ? greenColor : orangeColor,
          transparent: true,
          opacity: 0.32,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        }),
      );
      const branchMaterial = useMaterial(
        new THREE.LineBasicMaterial({
          color: side < 0 ? blueColor : creamColor,
          transparent: true,
          opacity: 0.15,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        }),
      );

      for (let treeIndex = 0; treeIndex < quality.bankTrees; treeIndex += 1) {
        const baseX = -0.9 + treeIndex * 0.28 + Math.sin(treeIndex * 0.8) * 0.18;
        const baseZ = -2.4 - treeIndex * 3.3 + Math.cos(treeIndex * 0.5) * 0.4;
        const height = 2.4 + (treeIndex % 3) * 0.55;
        const trunkPoints = [];
        trunkPoints.push(new THREE.Vector3(baseX, -1.82, baseZ));
        let px = baseX;
        let py = -1.82;

        for (let step = 0; step < 8; step += 1) {
          px += Math.sin(treeIndex * 0.9 + step * 0.6) * 0.08;
          py += height / 8;
          trunkPoints.push(new THREE.Vector3(px, py, baseZ + Math.cos(step * 0.5 + treeIndex) * 0.08));
        }
        for (let segmentIndex = 0; segmentIndex < trunkPoints.length - 1; segmentIndex += 1) {
          const start = trunkPoints[segmentIndex];
          const end = trunkPoints[segmentIndex + 1];
          trunkSegments.push(start.x, start.y, start.z, end.x, end.y, end.z);
        }

        for (let branchIndex = 2; branchIndex < trunkPoints.length - 1; branchIndex += 2) {
          const point = trunkPoints[branchIndex];
          const direction = branchIndex % 4 === 0 ? 1 : -1;
          branchSegments.push(
            point.x,
            point.y,
            point.z,
            point.x + direction * (0.28 + treeIndex * 0.015),
            point.y + 0.16,
            point.z + Math.sin(branchIndex + treeIndex) * 0.12,
          );
        }

        anchorPoints.push({
          x: px,
          y: py - 0.2,
          z: baseZ,
          spread: 0.45 + (treeIndex % 3) * 0.1,
        });
      }

      const trunkGeometry = useGeometry(new THREE.BufferGeometry());
      trunkGeometry.setAttribute("position", new THREE.Float32BufferAttribute(trunkSegments, 3));
      bank.add(new THREE.LineSegments(trunkGeometry, trunkMaterial));

      const branchGeometry = useGeometry(new THREE.BufferGeometry());
      branchGeometry.setAttribute("position", new THREE.Float32BufferAttribute(branchSegments, 3));
      bank.add(new THREE.LineSegments(branchGeometry, branchMaterial));

      const leaves = new THREE.InstancedMesh(
        bankLeafGeometry,
        useMaterial(
          new THREE.MeshBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.68,
          }),
        ),
        quality.bankLeaves,
      );
      const dummy = new THREE.Object3D();
      const instanceColor = new THREE.Color();

      leaves.instanceMatrix.setUsage(THREE.StaticDrawUsage);
      for (let i = 0; i < quality.bankLeaves; i += 1) {
        const anchor = anchorPoints[i % anchorPoints.length];
        const angle = i * 0.37;
        const radius = anchor.spread * (0.35 + ((i * 17) % 100) / 100);
        dummy.position.set(
          anchor.x + Math.cos(angle) * radius,
          anchor.y + Math.sin(angle * 1.4) * 0.45 + ((i % 6) - 3) * 0.04,
          anchor.z + Math.sin(angle) * radius * 0.7,
        );
        const scale = 0.5 + (i % 5) * 0.18;
        dummy.scale.setScalar(scale);
        dummy.rotation.set((i % 7) * 0.2, (i % 11) * 0.12, (i % 5) * 0.18);
        dummy.updateMatrix();
        leaves.setMatrixAt(i, dummy.matrix);
        instanceColor
          .copy(i % 5 === 0 ? creamColor : i % 3 === 0 ? blueColor : greenColor)
          .lerp(side < 0 ? blueColor : orangeColor, (Math.sin(i * 0.2) + 1) * 0.18);
        leaves.setColorAt(i, instanceColor);
      }

      leaves.instanceMatrix.needsUpdate = true;
      if (leaves.instanceColor) {
        leaves.instanceColor.needsUpdate = true;
      }
      bank.add(leaves);
      registerBirdPerches(anchorPoints.length ? bank : null, anchorPoints, {
        type: "tree",
        limit: Math.min(2, anchorPoints.length),
        yOffset: 0.24,
        xOffset: side * 0.08,
        zOffset: side * 0.04,
        facingY: side < 0 ? 0.52 : -0.52,
      });

      bank.position.x = side * 4.35;
      bank.rotation.y = side < 0 ? 0.22 : -0.22;
      bank.position.z = 0.2;
      freezeHierarchy(bank);
      forestBanks.push({ group: bank, drift: Math.random() * Math.PI * 2, side });
      world.add(bank);
    };

    createForestBank(-1);
    createForestBank(1);

    const createSignalTree = ({ x, z, scale = 1, canopy = greenColor, branch = creamColor }) => {
      const tree = new THREE.Group();
      const trunkPoints = [];
      let tx = 0;
      let ty = -1.78;
      trunkPoints.push(new THREE.Vector3(tx, ty, 0.02));
      for (let step = 0; step < 9; step += 1) {
        tx += Math.sin(step * 0.6 + x) * 0.05 * scale;
        ty += 0.28 * scale;
        trunkPoints.push(new THREE.Vector3(tx, ty, 0.02));
      }

      tree.add(
        new THREE.Line(
          useGeometry(new THREE.BufferGeometry().setFromPoints(trunkPoints)),
          useMaterial(
            new THREE.LineBasicMaterial({
              color: canopy,
              transparent: true,
              opacity: 0.64,
            }),
          ),
        ),
      );

      for (let branchIndex = 2; branchIndex < trunkPoints.length - 1; branchIndex += 2) {
        const point = trunkPoints[branchIndex];
        const side = branchIndex % 4 === 0 ? 1 : -1;
        tree.add(
          new THREE.Line(
            useGeometry(
              new THREE.BufferGeometry().setFromPoints([
                point,
                new THREE.Vector3(point.x + side * 0.24 * scale, point.y + 0.16 * scale, 0.08),
              ]),
            ),
            useMaterial(
              new THREE.LineBasicMaterial({
                color: branch,
                transparent: true,
                opacity: 0.34,
              }),
            ),
          ),
        );
      }

      const cloud = new THREE.InstancedMesh(
        leafGeometry,
        useMaterial(
          new THREE.MeshBasicMaterial({
            color: 0xffffff,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.58,
          }),
        ),
        quality.signalCloud,
      );
      const dummy = new THREE.Object3D();
      const color = new THREE.Color();
      cloud.instanceMatrix.setUsage(THREE.StaticDrawUsage);
      for (let i = 0; i < quality.signalCloud; i += 1) {
        const angle = i * 0.31;
        const radius = 0.22 + (i % 14) * 0.022;
        dummy.position.set(
          Math.cos(angle) * radius,
          0.86 * scale + Math.sin(angle * 1.2) * 0.46 * scale + (i % 5) * 0.04,
          Math.sin(angle) * radius * 0.8,
        );
        dummy.rotation.set((i % 6) * 0.18, angle, (i % 4) * 0.1);
        dummy.scale.set(0.22 * scale, (0.34 + (i % 4) * 0.06) * scale, 0.22 * scale);
        dummy.updateMatrix();
        cloud.setMatrixAt(i, dummy.matrix);
        color.copy(i % 4 === 0 ? creamColor : i % 3 === 0 ? blueColor : canopy);
        cloud.setColorAt(i, color);
      }
      cloud.instanceMatrix.needsUpdate = true;
      if (cloud.instanceColor) {
        cloud.instanceColor.needsUpdate = true;
      }
      tree.add(cloud);
      tree.position.set(x, 0, z);
      return tree;
    };

    const createPlantPatch = ({ x, z, spreadX, spreadZ, leaves, primary, accent, pinkRate = 0 }) => {
      const patch = new THREE.Group();
      const stemPositions = [];
      const frondPositions = [];
      const pixelAnchors = [];
      const resolvedLeaves = Math.max(18, Math.round(leaves * quality.plantDensity));
      const stems = Math.max(10, Math.floor(resolvedLeaves * 0.4));

      for (let stemIndex = 0; stemIndex < stems; stemIndex += 1) {
        const baseX = (Math.random() - 0.5) * spreadX;
        const baseZ = (Math.random() - 0.5) * spreadZ;
        const stemHeight = 0.38 + Math.random() * 0.58;
        const topX = baseX + Math.sin(stemIndex * 0.6) * 0.05;
        const topY = -1.82 + stemHeight;
        const topZ = baseZ + Math.cos(stemIndex * 0.5) * 0.04;
        stemPositions.push(
          baseX,
          -1.82,
          baseZ,
          topX,
          topY,
          topZ,
        );

        const fronds = 2 + (stemIndex % 3);
        for (let frondIndex = 0; frondIndex < fronds; frondIndex += 1) {
          const yaw =
            stemIndex * 0.64 +
            frondIndex * (Math.PI * 0.72) +
            Math.sin(stemIndex * 0.28 + frondIndex) * 0.35;
          const length = 0.24 + Math.random() * 0.28;
          const lift = 0.12 + Math.random() * 0.22;
          const rootX = topX + Math.cos(yaw) * 0.02;
          const rootY = topY - 0.08 - frondIndex * 0.035;
          const rootZ = topZ + Math.sin(yaw) * 0.02;
          const tipX = rootX + Math.cos(yaw) * length;
          const tipY = rootY + lift;
          const tipZ = rootZ + Math.sin(yaw) * length;
          const sideSpan = length * (0.28 + Math.random() * 0.2);
          const sideX = Math.cos(yaw + Math.PI * 0.5) * sideSpan;
          const sideZ = Math.sin(yaw + Math.PI * 0.5) * sideSpan;
          const leftX = tipX + sideX;
          const leftY = tipY - 0.05 - Math.random() * 0.06;
          const leftZ = tipZ + sideZ;
          const rightX = tipX - sideX;
          const rightY = tipY - 0.05 - Math.random() * 0.06;
          const rightZ = tipZ - sideZ;
          const veinX = rootX + Math.cos(yaw) * (length * 0.46);
          const veinY = rootY + lift * 0.55;
          const veinZ = rootZ + Math.sin(yaw) * (length * 0.46);

          frondPositions.push(
            rootX,
            rootY,
            rootZ,
            tipX,
            tipY,
            tipZ,
            tipX,
            tipY,
            tipZ,
            leftX,
            leftY,
            leftZ,
            tipX,
            tipY,
            tipZ,
            rightX,
            rightY,
            rightZ,
            veinX,
            veinY,
            veinZ,
            leftX,
            leftY,
            leftZ,
            veinX,
            veinY,
            veinZ,
            rightX,
            rightY,
            rightZ,
          );

          pixelAnchors.push(
            { x: tipX, y: tipY, z: tipZ },
            { x: leftX, y: leftY, z: leftZ },
            { x: rightX, y: rightY, z: rightZ },
            { x: veinX, y: veinY, z: veinZ },
          );
        }
      }

      const stemGeometry = useGeometry(new THREE.BufferGeometry());
      stemGeometry.setAttribute("position", new THREE.Float32BufferAttribute(stemPositions, 3));
      patch.add(
        new THREE.LineSegments(
          stemGeometry,
          useMaterial(
            new THREE.LineBasicMaterial({
              color: primary.clone().lerp(deepGreenColor, 0.35),
              transparent: true,
              opacity: 0.46,
              blending: THREE.AdditiveBlending,
              depthWrite: false,
            }),
          ),
        ),
      );

      const frondGeometry = useGeometry(new THREE.BufferGeometry());
      frondGeometry.setAttribute("position", new THREE.Float32BufferAttribute(frondPositions, 3));
      patch.add(
        new THREE.LineSegments(
          frondGeometry,
          useMaterial(
            new THREE.LineBasicMaterial({
              color: accent.clone().lerp(primary, 0.52),
              transparent: true,
              opacity: 0.7,
              blending: THREE.AdditiveBlending,
              depthWrite: false,
            }),
          ),
        ),
      );

      const mesh = new THREE.InstancedMesh(
        pixelGeometry,
        createPixelMaterial(0.84),
        pixelAnchors.length,
      );
      const dummy = new THREE.Object3D();
      const tint = new THREE.Color();
      mesh.instanceMatrix.setUsage(THREE.StaticDrawUsage);
      for (let leafIndex = 0; leafIndex < pixelAnchors.length; leafIndex += 1) {
        const anchor = pixelAnchors[leafIndex];
        dummy.position.set(anchor.x, anchor.y, anchor.z);
        dummy.rotation.set((leafIndex % 7) * 0.12, (leafIndex % 11) * 0.08, (leafIndex % 5) * 0.15);
        dummy.scale.setScalar(0.65 + (leafIndex % 4) * 0.22);
        dummy.updateMatrix();
        mesh.setMatrixAt(leafIndex, dummy.matrix);

        if (Math.random() < pinkRate) {
          tint.copy(Math.random() < 0.52 ? pinkColor : creamColor);
        } else {
          tint.copy(Math.random() < 0.34 ? accent : primary).lerp(deepGreenColor, Math.random() * 0.22);
        }
        mesh.setColorAt(leafIndex, tint);
      }
      mesh.instanceMatrix.needsUpdate = true;
      if (mesh.instanceColor) {
        mesh.instanceColor.needsUpdate = true;
      }
      patch.add(mesh);
      mesh.userData.keepLiveMatrix = true;
      patch.userData.pixels = mesh;
      patch.userData.pixelMaterial = mesh.material;
      patch.userData.baseOpacity = 0.84;
      patch.userData.hoverOpacity = 1;
      patch.userData.hoverScale = 1;
      attachPatchHighlight(patch, accent);
      registerBirdPerches(patch, pixelAnchors, {
        type: "plant",
        limit: 1,
        yOffset: 0.08,
        facingY: () => (Math.random() - 0.5) * 1.4,
      });
      patch.position.set(x, 0, z);
      freezeHierarchy(patch);
      groundPlants.push({ group: patch, drift: Math.random() * Math.PI * 2 });
      world.add(patch);
      addHitbox(patch, spreadX || 1.5, 2.0, spreadZ || 1.5, "[BIO-SIG: BASIC FLORA]");
      return patch;
    };

    const createMountainRange = (zRadius, scale, color, offset) => {
      const radius = Math.abs(zRadius);
      const segments = Math.floor(radius * 14); // Segment count scales directly with orbit radius
      const points = [];
      const colors = [];
      const estimatedMaxH = 16 * scale; // Estimated max height to normalize gradient

      for (let i = 0; i <= segments; i++) {
        const theta = (i / segments) * Math.PI * 2;
        // Integer sine frequencies ensure deterministic 360-degree topological tessellation
        let h = Math.sin(theta * 5 + offset) * 12 
              + Math.sin(theta * 18 + offset) * 5 
              + Math.sin(theta * 43 + offset) * 2;
        h = Math.max(0, h - 3) * scale;
        
        const x = Math.cos(theta) * radius;
        const z = Math.sin(theta) * radius;
        points.push(new THREE.Vector3(x, h, z));

        // Create a subtle gradient from black (transparent in AdditiveBlending) at the base to the full color at the peaks
        const ratio = Math.pow(Math.min(1, Math.max(0, h / estimatedMaxH)), 0.65);
        const vColor = new THREE.Color(0x000000).lerp(color, ratio * 0.95 + 0.05);
        colors.push(vColor.r, vColor.g, vColor.b);
      }
      
      const geom = useGeometry(new THREE.BufferGeometry().setFromPoints(points));
      geom.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
      
      const mesh = new THREE.Line(
        geom,
        useMaterial(
          new THREE.LineBasicMaterial({
            vertexColors: true,
            transparent: true,
            opacity: 0.52, // Slightly increased base opacity to make them more obvious
            blending: THREE.AdditiveBlending,
            depthWrite: false,
          }),
        ),
      );
      mesh.position.y = -1.82;
      
      const peaks = [];
      for (let i = 1; i < points.length - 1; i++) {
        if (points[i].y > 0 && points[i].y > points[i-1].y && points[i].y > points[i+1].y) {
           peaks.push(points[i]);
        }
      }
      
      if (peaks.length > 0) {
        const pMesh = new THREE.InstancedMesh(pixelGeometry, sharedMaterials.pixel, peaks.length);
        const dummy = new THREE.Object3D();
        pMesh.instanceMatrix.setUsage(THREE.StaticDrawUsage);
        for (let i = 0; i < peaks.length; i++) {
          dummy.position.copy(peaks[i]);
          dummy.scale.setScalar(1.5);
          dummy.updateMatrix();
          pMesh.setMatrixAt(i, dummy.matrix);
          pMesh.setColorAt(i, color);
        }
        pMesh.material.opacity = 0.56;

        mesh.add(pMesh);
      }
      
      world.add(mesh);
      return mesh;
    };

    const createMonsteraPatch = ({ x, z, scale = 1, primary = creamColor, accent = orangeColor }) => {
      const patch = new THREE.Group();
      const stemCount = 3 + Math.floor(Math.random() * 2);
      const leafGeometry = useGeometry(new THREE.BufferGeometry());
      const stemGeometry = useGeometry(new THREE.BufferGeometry());
      const leafPositions = [];
      const stemPositions = [];
      const pixelAnchors = [];

      for (let i = 0; i < stemCount; i += 1) {
        const angle = (i / stemCount) * Math.PI * 2 + Math.random() * 0.4;
        const arch = 0.8 + Math.random() * 0.6;
        const height = (0.6 + Math.random() * 0.4) * scale;
        let sx = 0, sy = -1.82, sz = 0;
        
        for (let step = 0; step < 8; step += 1) {
          const t1 = step / 8;
          const t2 = (step + 1) / 8;
          const lx1 = Math.cos(angle) * arch * t1;
          const ly1 = -1.82 + Math.sin(t1 * Math.PI * 0.7) * height;
          const lz1 = Math.sin(angle) * arch * t1;
          const lx2 = Math.cos(angle) * arch * t2;
          const ly2 = -1.82 + Math.sin(t2 * Math.PI * 0.7) * height;
          const lz2 = Math.sin(angle) * arch * t2;
          stemPositions.push(lx1, ly1, lz1, lx2, ly2, lz2);
          if (step === 7) { sx = lx2; sy = ly2; sz = lz2; }
        }

        const leafSize = 0.4 + Math.random() * 0.2;
        const leafPitch = Math.random() * 0.4 + 0.1;
        const leafDir = new THREE.Vector3(Math.cos(angle), -Math.sin(leafPitch), Math.sin(angle)).normalize();
        const up = new THREE.Vector3(0, 1, 0);
        let right = new THREE.Vector3().crossVectors(leafDir, up).normalize();
        if (right.lengthSq() < 0.01) right = new THREE.Vector3(1, 0, 0);
        
        const base = new THREE.Vector3(sx, sy, sz);
        const tip = new THREE.Vector3().copy(leafDir).multiplyScalar(leafSize).add(base);
        
        leafPositions.push(base.x, base.y, base.z, tip.x, tip.y, tip.z);
        pixelAnchors.push({ x: tip.x, y: tip.y, z: tip.z });
        
        const rt = 0.6;
        const ribBase = new THREE.Vector3().copy(base).lerp(tip, rt);
        const width = Math.sin(rt * Math.PI) * leafSize * 0.8; 
        
        const leftCurv = new THREE.Vector3().copy(right).multiplyScalar(width).add(leafDir.clone().multiplyScalar(0.1));
        const leftTip = new THREE.Vector3().copy(ribBase).add(leftCurv);
        
        const rightCurv = new THREE.Vector3().copy(right).multiplyScalar(-width).add(leafDir.clone().multiplyScalar(0.1));
        const rightTip = new THREE.Vector3().copy(ribBase).add(rightCurv);
        
        leafPositions.push(ribBase.x, ribBase.y, ribBase.z, leftTip.x, leftTip.y, leftTip.z);
        leafPositions.push(ribBase.x, ribBase.y, ribBase.z, rightTip.x, rightTip.y, rightTip.z);
        
        pixelAnchors.push({ x: leftTip.x, y: leftTip.y, z: leftTip.z });
        pixelAnchors.push({ x: rightTip.x, y: rightTip.y, z: rightTip.z });
      }
      
      stemGeometry.setAttribute("position", new THREE.Float32BufferAttribute(stemPositions, 3));
      patch.add(new THREE.LineSegments(stemGeometry, getLineMaterial(primary)));
      
      leafGeometry.setAttribute("position", new THREE.Float32BufferAttribute(leafPositions, 3));
      patch.add(new THREE.LineSegments(leafGeometry, getLineMaterial(primary)));
      
      const mesh = new THREE.InstancedMesh(pixelGeometry, createPixelMaterial(0.84), pixelAnchors.length);
      const dummy = new THREE.Object3D();
      mesh.instanceMatrix.setUsage(THREE.StaticDrawUsage);
      for (let i = 0; i < pixelAnchors.length; i += 1) {
        dummy.position.copy(pixelAnchors[i]);
        dummy.rotation.set(Math.random(), Math.random(), Math.random());
        dummy.scale.setScalar(1.2);
        dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix);
        mesh.setColorAt(i, Math.random() > 0.5 ? primary : accent);
      }
      mesh.instanceMatrix.needsUpdate = true;
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
      patch.add(mesh);
      mesh.userData.keepLiveMatrix = true;
      patch.userData.pixels = mesh;
      patch.userData.pixelMaterial = mesh.material;
      patch.userData.baseOpacity = 0.84;
      patch.userData.hoverOpacity = 1;
      patch.userData.hoverScale = 1;
      attachPatchHighlight(patch, primary);
      registerBirdPerches(patch, pixelAnchors, {
        type: "plant",
        limit: 1,
        yOffset: 0.09,
        facingY: () => (Math.random() - 0.5) * 1.1,
      });
      patch.position.set(x, 0, z);
      freezeHierarchy(patch);
      groundPlants.push({ group: patch, drift: Math.random() * Math.PI * 2 });
      world.add(patch);
      addHitbox(patch, 1.8, 2.0, 1.8, "[BIO-SIG: AROID / MONSTERA]");
      return patch;
    };

    const createAlocasiaPatch = ({ x, z, scale = 1, primary = blueColor, accent = creamColor }) => {
      const patch = new THREE.Group();
      const count = 2 + Math.floor(Math.random() * 2);
      const geom = useGeometry(new THREE.BufferGeometry());
      const pos = [];
      const anchors = [];

      for (let i = 0; i < count; i += 1) {
        const angle = (i / count) * Math.PI * 2 + Math.random() * 0.4;
        const radius = 0.4 + Math.random() * 0.2;
        const height = (0.9 + Math.random() * 0.4) * scale;
        let sx = 0, sy = -1.82, sz = 0;
        
        for (let step = 0; step < 6; step += 1) {
          const t1 = step / 6;
          const t2 = (step + 1) / 6;
          pos.push(Math.cos(angle) * radius * t1, -1.82 + t1 * height, Math.sin(angle) * radius * t1);
          pos.push(Math.cos(angle) * radius * t2, -1.82 + t2 * height, Math.sin(angle) * radius * t2);
          if (step === 5) { sx = Math.cos(angle) * radius * t2; sy = -1.82 + t2 * height; sz = Math.sin(angle) * radius * t2; }
        }

        const leafSize = 0.55 * scale;
        const leafDir = new THREE.Vector3(Math.cos(angle)*0.5, 0.8, Math.sin(angle)*0.5).normalize();
        let right = new THREE.Vector3().crossVectors(leafDir, new THREE.Vector3(0, 1, 0)).normalize();
        if (right.lengthSq() < 0.01) right = new THREE.Vector3(1, 0, 0);
        
        const base = new THREE.Vector3(sx, sy, sz);
        const tip = new THREE.Vector3().copy(leafDir).multiplyScalar(leafSize).add(base);
        const leftLobe = new THREE.Vector3().copy(right).multiplyScalar(leafSize * 0.4).add(base).add(leafDir.clone().multiplyScalar(-leafSize * 0.2));
        const rightLobe = new THREE.Vector3().copy(right).multiplyScalar(-leafSize * 0.4).add(base).add(leafDir.clone().multiplyScalar(-leafSize * 0.2));
        
        pos.push(base.x, base.y, base.z, leftLobe.x, leftLobe.y, leftLobe.z);
        pos.push(base.x, base.y, base.z, rightLobe.x, rightLobe.y, rightLobe.z);
        pos.push(leftLobe.x, leftLobe.y, leftLobe.z, tip.x, tip.y, tip.z);
        pos.push(rightLobe.x, rightLobe.y, rightLobe.z, tip.x, tip.y, tip.z);
        pos.push(base.x, base.y, base.z, tip.x, tip.y, tip.z);
        
        anchors.push({ x: tip.x, y: tip.y, z: tip.z });
        anchors.push({ x: leftLobe.x, y: leftLobe.y, z: leftLobe.z });
        anchors.push({ x: rightLobe.x, y: rightLobe.y, z: rightLobe.z });
      }
      
      geom.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
      patch.add(new THREE.LineSegments(geom, getLineMaterial(primary)));
      
      const mesh = new THREE.InstancedMesh(pixelGeometry, createPixelMaterial(0.84), anchors.length);
      const dummy = new THREE.Object3D();
      mesh.instanceMatrix.setUsage(THREE.StaticDrawUsage);
      for (let i = 0; i < anchors.length; i += 1) {
        dummy.position.copy(anchors[i]);
        dummy.scale.setScalar(1.4);
        dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix);
        mesh.setColorAt(i, Math.random() > 0.5 ? primary : accent);
      }
      mesh.instanceMatrix.needsUpdate = true;
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
      patch.add(mesh);
      mesh.userData.keepLiveMatrix = true;
      patch.userData.pixels = mesh;
      patch.userData.pixelMaterial = mesh.material;
      patch.userData.baseOpacity = 0.84;
      patch.userData.hoverOpacity = 1;
      patch.userData.hoverScale = 1;
      attachPatchHighlight(patch, primary);
      registerBirdPerches(patch, anchors, {
        type: "plant",
        limit: 1,
        yOffset: 0.08,
        facingY: () => (Math.random() - 0.5) * 1.2,
      });
      patch.position.set(x, 0, z);
      freezeHierarchy(patch);
      groundPlants.push({ group: patch, drift: Math.random() * Math.PI * 2 });
      world.add(patch);
      addHitbox(patch, 1.4, 2.2, 1.4, "[BIO-SIG: AROID / ALOCASIA MACRORRHIZA]");
      return patch;
    };

    const createFlamingoAnthuriumPatch = ({ x, z, scale = 1, accent = orangeColor }) => {
      const patch = new THREE.Group();
      const count = 2 + Math.floor(Math.random() * 2);
      const geom = useGeometry(new THREE.BufferGeometry());
      const pos = [];
      const anchors = [];

      for (let i = 0; i < count; i += 1) {
        const angle = (i / count) * Math.PI * 2 + Math.random() * 0.4;
        const radius = 0.5 + Math.random() * 0.3;
        const height = (0.7 + Math.random() * 0.3) * scale;
        let sx = 0, sy = -1.82, sz = 0;
        
        for (let step = 0; step < 6; step += 1) {
          const t1 = step / 6;
          const t2 = (step + 1) / 6;
          pos.push(Math.cos(angle) * radius * t1, -1.82 + t1 * height, Math.sin(angle) * radius * t1);
          pos.push(Math.cos(angle) * radius * t2, -1.82 + t2 * height, Math.sin(angle) * radius * t2);
          if (step === 5) { sx = Math.cos(angle) * radius * t2; sy = -1.82 + t2 * height; sz = Math.sin(angle) * radius * t2; }
        }

        const leafSize = 0.4;
        const leafDir = new THREE.Vector3(Math.cos(angle), Math.random() * 0.2 + 0.1, Math.sin(angle)).normalize();
        let right = new THREE.Vector3().crossVectors(leafDir, new THREE.Vector3(0, 1, 0)).normalize();
        if (right.lengthSq() < 0.01) right = new THREE.Vector3(1, 0, 0);
        
        const base = new THREE.Vector3(sx, sy, sz);
        const tip = new THREE.Vector3().copy(leafDir).multiplyScalar(leafSize).add(base);
        const cleft = new THREE.Vector3().copy(leafDir).multiplyScalar(-leafSize * 0.2).add(base);
        const leftLobe = new THREE.Vector3().copy(right).multiplyScalar(leafSize * 0.4).add(base).add(leafDir.clone().multiplyScalar(-leafSize * 0.1));
        const rightLobe = new THREE.Vector3().copy(right).multiplyScalar(-leafSize * 0.4).add(base).add(leafDir.clone().multiplyScalar(-leafSize * 0.1));
        
        pos.push(base.x, base.y, base.z, cleft.x, cleft.y, cleft.z);
        pos.push(cleft.x, cleft.y, cleft.z, leftLobe.x, leftLobe.y, leftLobe.z);
        pos.push(leftLobe.x, leftLobe.y, leftLobe.z, tip.x, tip.y, tip.z);
        pos.push(cleft.x, cleft.y, cleft.z, rightLobe.x, rightLobe.y, rightLobe.z);
        pos.push(rightLobe.x, rightLobe.y, rightLobe.z, tip.x, tip.y, tip.z);

        const spadixTip = new THREE.Vector3(0, leafSize * 0.8, 0).add(cleft).add(leafDir.clone().multiplyScalar(0.05));
        pos.push(cleft.x, cleft.y, cleft.z, spadixTip.x, spadixTip.y, spadixTip.z);
        
        anchors.push({ x: spadixTip.x, y: spadixTip.y, z: spadixTip.z });
        anchors.push({ x: tip.x, y: tip.y, z: tip.z });
      }
      
      geom.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
      patch.add(new THREE.LineSegments(geom, getLineMaterial(creamColor)));
      
      const mesh = new THREE.InstancedMesh(pixelGeometry, createPixelMaterial(0.84), anchors.length);
      const dummy = new THREE.Object3D();
      mesh.instanceMatrix.setUsage(THREE.StaticDrawUsage);
      for (let i = 0; i < anchors.length; i += 1) {
        dummy.position.copy(anchors[i]);
        dummy.scale.setScalar(1.2);
        dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix);
        mesh.setColorAt(i, i % 2 === 0 ? creamColor : accent);
      }
      mesh.instanceMatrix.needsUpdate = true;
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
      patch.add(mesh);
      mesh.userData.keepLiveMatrix = true;
      patch.userData.pixels = mesh;
      patch.userData.pixelMaterial = mesh.material;
      patch.userData.baseOpacity = 0.84;
      patch.userData.hoverOpacity = 1;
      patch.userData.hoverScale = 1;
      attachPatchHighlight(patch, accent);
      registerBirdPerches(patch, anchors, {
        type: "plant",
        limit: 1,
        yOffset: 0.08,
        facingY: () => (Math.random() - 0.5) * 1.3,
      });
      patch.position.set(x, 0, z);
      freezeHierarchy(patch);
      groundPlants.push({ group: patch, drift: Math.random() * Math.PI * 2 });
      world.add(patch);
      addHitbox(patch, 1.5, 1.8, 1.5, "[BIO-SIG: ANTHURIUM / ANDRAEANUM]");
      return patch;
    };

    const createQueenAnthuriumPatch = ({ x, z, scale = 1, primary = blueColor, accent = creamColor }) => {
      const patch = new THREE.Group();
      const count = 3 + Math.floor(Math.random() * 2);
      const geom = useGeometry(new THREE.BufferGeometry());
      const pos = [];
      const anchors = [];

      for (let i = 0; i < count; i += 1) {
        const angle = (i / count) * Math.PI * 2 + Math.random() * 0.4;
        const arch = 0.5 + Math.random() * 0.3;
        const height = (0.7 + Math.random() * 0.4) * scale;
        let sx = 0, sy = -1.82, sz = 0;
        
        for (let step = 0; step < 6; step += 1) {
          const t1 = step / 6;
          const t2 = (step + 1) / 6;
          pos.push(Math.cos(angle) * arch * t1, -1.82 + Math.sin(t1 * Math.PI * 0.5) * height, Math.sin(angle) * arch * t1);
          pos.push(Math.cos(angle) * arch * t2, -1.82 + Math.sin(t2 * Math.PI * 0.5) * height, Math.sin(angle) * arch * t2);
          if (step === 5) { sx = Math.cos(angle) * arch * t2; sy = -1.82 + Math.sin(t2 * Math.PI * 0.5) * height; sz = Math.sin(angle) * arch * t2; }
        }

        const leafLength = 0.7 * scale;
        const leafWidth = 0.15 * scale;
        const leafDir = new THREE.Vector3((Math.random()-0.5)*0.1, -1, (Math.random()-0.5)*0.1).normalize();
        let right = new THREE.Vector3().crossVectors(leafDir, new THREE.Vector3(0, 0, 1)).normalize();
        if (right.lengthSq() < 0.01) right = new THREE.Vector3(1, 0, 0);
        
        const base = new THREE.Vector3(sx, sy, sz);
        const tip = new THREE.Vector3().copy(leafDir).multiplyScalar(leafLength).add(base);
        
        const leftTop = new THREE.Vector3().copy(right).multiplyScalar(leafWidth).add(base);
        const rightTop = new THREE.Vector3().copy(right).multiplyScalar(-leafWidth).add(base);
        const leftBot = new THREE.Vector3().copy(right).multiplyScalar(leafWidth).add(tip);
        const rightBot = new THREE.Vector3().copy(right).multiplyScalar(-leafWidth).add(tip);
        
        pos.push(leftTop.x, leftTop.y, leftTop.z, rightTop.x, rightTop.y, rightTop.z);
        pos.push(leftTop.x, leftTop.y, leftTop.z, leftBot.x, leftBot.y, leftBot.z);
        pos.push(rightTop.x, rightTop.y, rightTop.z, rightBot.x, rightBot.y, rightBot.z);
        pos.push(leftBot.x, leftBot.y, leftBot.z, tip.x, tip.y, tip.z);
        pos.push(rightBot.x, rightBot.y, rightBot.z, tip.x, tip.y, tip.z);
        pos.push(base.x, base.y, base.z, tip.x, tip.y, tip.z);
        
        anchors.push({ x: tip.x, y: tip.y, z: tip.z });
      }
      
      geom.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
      patch.add(new THREE.LineSegments(geom, getLineMaterial(primary)));
      
      const mesh = new THREE.InstancedMesh(pixelGeometry, createPixelMaterial(0.84), anchors.length);
      const dummy = new THREE.Object3D();
      mesh.instanceMatrix.setUsage(THREE.StaticDrawUsage);
      for (let i = 0; i < anchors.length; i += 1) {
        dummy.position.copy(anchors[i]);
        dummy.scale.setScalar(1.4);
        dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix);
        mesh.setColorAt(i, accent);
      }
      mesh.instanceMatrix.needsUpdate = true;
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
      patch.add(mesh);
      mesh.userData.keepLiveMatrix = true;
      patch.userData.pixels = mesh;
      patch.userData.pixelMaterial = mesh.material;
      patch.userData.baseOpacity = 0.84;
      patch.userData.hoverOpacity = 1;
      patch.userData.hoverScale = 1;
      attachPatchHighlight(patch, primary);
      registerBirdPerches(patch, anchors, {
        type: "plant",
        limit: 1,
        yOffset: 0.06,
        facingY: () => (Math.random() - 0.5) * 1.25,
      });
      patch.position.set(x, 0, z);
      freezeHierarchy(patch);
      groundPlants.push({ group: patch, drift: Math.random() * Math.PI * 2 });
      world.add(patch);
      addHitbox(patch, 1.2, 2.0, 1.2, "[BIO-SIG: ANTHURIUM / WAROCQUEANUM]");
      return patch;
    };

    const createHumanoidCaretaker = ({ x, z, scale = 1, primary = creamColor, accent = orangeColor, task = "water", tint = greenColor, route = [] }) => {
      const actor = new THREE.Group();
      actor.position.set(x, -1.82, z);

      const makeLimb = (r, len, color, opacity=0.85) => {
        // 3-sided prism tapering towards the end
        const geom = useGeometry(new THREE.CylinderGeometry(r, r * 0.2, len, 3));
        const edges = new THREE.LineSegments(useGeometry(new THREE.EdgesGeometry(geom)), useMaterial(new THREE.LineBasicMaterial({ color: color, transparent: true, opacity: opacity, blending: THREE.AdditiveBlending, depthWrite: false })));
        return edges;
      };

      const makeDiamond = (r, color, opacity=0.85) => {
        // Sharp 8-sided crystal
        const geom = useGeometry(new THREE.OctahedronGeometry(r, 0));
        const edges = new THREE.LineSegments(useGeometry(new THREE.EdgesGeometry(geom)), useMaterial(new THREE.LineBasicMaterial({ color: color, transparent: true, opacity: opacity, blending: THREE.AdditiveBlending, depthWrite: false })));
        return edges;
      };

      const makeTorsoGeom = (r, h, color, opacity=0.85) => {
        // 3-sided pyramid
        const geom = useGeometry(new THREE.ConeGeometry(r, h, 3));
        const edges = new THREE.LineSegments(useGeometry(new THREE.EdgesGeometry(geom)), useMaterial(new THREE.LineBasicMaterial({ color: color, transparent: true, opacity: opacity, blending: THREE.AdditiveBlending, depthWrite: false })));
        return edges;
      };

      const body = new THREE.Group();
      actor.add(body);
      
      const pelvis = makeDiamond(0.12*scale, tint, 0.7);
      pelvis.position.y = 0.45*scale; // Float below torso
      body.add(pelvis);

      const torso = makeTorsoGeom(0.2*scale, 0.35*scale, primary, 0.8);
      torso.rotation.x = Math.PI; // Inverted pyramid
      torso.position.y = 0.8*scale;
      body.add(torso);

      const headPivot = new THREE.Group();
      headPivot.position.y = 1.15*scale;
      body.add(headPivot);
      const head = makeDiamond(0.14*scale, primary, 0.85);
      head.position.y = 0.15*scale; // Floating head
      headPivot.add(head);

      const leftArm = new THREE.Group();
      leftArm.position.set(-0.28*scale, 0.95*scale, 0); // Disconnected floating shoulder
      const lArmMesh = makeLimb(0.06*scale, 0.35*scale, accent, 0.8);
      lArmMesh.position.y = -0.15*scale;
      leftArm.add(lArmMesh);
      body.add(leftArm);

      const rightArm = new THREE.Group();
      rightArm.position.set(0.28*scale, 0.95*scale, 0);
      const rArmMesh = makeLimb(0.06*scale, 0.35*scale, accent, 0.8);
      rArmMesh.position.y = -0.15*scale;
      rightArm.add(rArmMesh);
      body.add(rightArm);

      const leftLeg = new THREE.Group();
      leftLeg.position.set(-0.14*scale, 0.4*scale, 0); // Disconnected floating hip
      const lLegMesh = makeLimb(0.05*scale, 0.35*scale, tint, 0.75);
      lLegMesh.position.y = -0.15*scale;
      leftLeg.add(lLegMesh);
      body.add(leftLeg);

      const rightLeg = new THREE.Group();
      rightLeg.position.set(0.14*scale, 0.4*scale, 0);
      const rLegMesh = makeLimb(0.05*scale, 0.35*scale, tint, 0.75);
      rLegMesh.position.y = -0.15*scale;
      rightLeg.add(rLegMesh);
      body.add(rightLeg);

      let tool = new THREE.Group(), toolStream;
      if (task === "water") {
        const can = makeDiamond(0.1*scale, orangeColor, 0.8);
        const spout = makeLimb(0.03*scale, 0.15*scale, orangeColor, 0.8);
        spout.rotation.x = Math.PI / 2;
        spout.position.set(0, 0, 0.12*scale);
        can.add(spout);
        can.position.set(0, -0.35*scale, 0.08*scale);
        tool.add(can);
        rightArm.add(tool);
        
        const streamGeom = useGeometry(new THREE.CylinderGeometry(0.01*scale, 0.05*scale, 0.6*scale, 3));
        toolStream = new THREE.LineSegments(useGeometry(new THREE.EdgesGeometry(streamGeom)), useMaterial(new THREE.LineBasicMaterial({ color: blueColor, transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending, depthWrite: false })));
        toolStream.position.set(0, -0.25*scale, 0.25*scale);
        toolStream.rotation.x = -0.3;
        tool.add(toolStream);
      } else {
        const handle = makeLimb(0.03*scale, 0.4*scale, orangeColor, 0.8);
        const blade = makeDiamond(0.08*scale, orangeColor, 0.8);
        blade.position.set(0, -0.25*scale, 0.03*scale);
        handle.add(blade);
        handle.position.set(0, -0.3*scale, 0.04*scale);
        tool.add(handle);
        rightArm.add(tool);
      }

      if (task === "water") {
        body.rotation.y = -0.25;
        leftArm.rotation.x = -0.2;
        rightArm.rotation.x = -0.6;
        leftLeg.rotation.x = -0.1;
        rightLeg.rotation.x = 0.1;
      } else {
        body.rotation.y = 0.2;
        leftArm.rotation.x = 0.2;
        rightArm.rotation.x = -0.3;
        leftLeg.rotation.x = 0.2;
        rightLeg.rotation.x = -0.1;
      }

      world.add(actor);
      chamberAttendants.push({
        actor, body, head: headPivot, leftArm, rightArm, leftLeg, rightLeg, tool, toolStream, task,
        phase: Math.random() * Math.PI * 2, baseX: x, baseZ: z, route: route.length ? route : [{ x, z }],
      });
      return actor;
    };

    const createFrenchBulldog = ({ x, z, scale = 1, primary = creamColor, accent = orangeColor }) => {
      const dog = new THREE.Group();
      dog.position.set(x, -1.82, z);
      
      const makeBlock = (w, h, d, color, opacity=0.85) => {
        const geom = useGeometry(new THREE.BoxGeometry(w, h, d));
        const edges = new THREE.LineSegments(useGeometry(new THREE.EdgesGeometry(geom)), useMaterial(new THREE.LineBasicMaterial({ color: color, transparent: true, opacity: opacity, blending: THREE.AdditiveBlending, depthWrite: false })));
        return edges;
      };

      const makeCone = (r, h, color, opacity=0.85) => {
        const geom = useGeometry(new THREE.ConeGeometry(r, h, 4));
        const edges = new THREE.LineSegments(useGeometry(new THREE.EdgesGeometry(geom)), useMaterial(new THREE.LineBasicMaterial({ color: color, transparent: true, opacity: opacity, blending: THREE.AdditiveBlending, depthWrite: false })));
        return edges;
      };

      const body = new THREE.Group();
      dog.add(body);
      
      const torso = makeBlock(0.24*scale, 0.22*scale, 0.38*scale, primary, 0.9);
      torso.position.set(0, 0.2*scale, 0);
      body.add(torso);

      const headPivot = new THREE.Group();
      headPivot.position.set(0, 0.35*scale, 0.2*scale);
      body.add(headPivot);

      const head = makeBlock(0.22*scale, 0.2*scale, 0.22*scale, primary, 0.9);
      headPivot.add(head);

      const snout = makeBlock(0.12*scale, 0.1*scale, 0.1*scale, accent, 0.9);
      snout.position.set(0, -0.05*scale, 0.14*scale);
      headPivot.add(snout);

      const lEar = makeCone(0.06*scale, 0.18*scale, primary, 0.9);
      lEar.position.set(-0.08*scale, 0.16*scale, -0.02*scale);
      lEar.rotation.x = 0.2;
      headPivot.add(lEar);

      const rEar = makeCone(0.06*scale, 0.18*scale, primary, 0.9);
      rEar.position.set(0.08*scale, 0.16*scale, -0.02*scale);
      rEar.rotation.x = -0.2;
      headPivot.add(rEar);

      const tail = makeCone(0.03*scale, 0.08*scale, primary, 0.9);
      tail.position.set(0, 0.3*scale, -0.18*scale);
      tail.rotation.x = -0.5;
      body.add(tail);

      const legW = 0.08*scale;
      const legH = 0.15*scale;
      
      const flLeg = new THREE.Group();
      flLeg.position.set(-0.08*scale, 0.15*scale, 0.12*scale);
      const flMesh = makeBlock(legW, legH, legW, primary, 0.9);
      flMesh.position.y = -0.075*scale;
      flLeg.add(flMesh);
      body.add(flLeg);

      const frLeg = new THREE.Group();
      frLeg.position.set(0.08*scale, 0.15*scale, 0.12*scale);
      const frMesh = makeBlock(legW, legH, legW, primary, 0.9);
      frMesh.position.y = -0.075*scale;
      frLeg.add(frMesh);
      body.add(frLeg);

      const blLeg = new THREE.Group();
      blLeg.position.set(-0.08*scale, 0.15*scale, -0.12*scale);
      const blMesh = makeBlock(legW, legH, legW, primary, 0.9);
      blMesh.position.y = -0.075*scale;
      blLeg.add(blMesh);
      body.add(blLeg);

      const brLeg = new THREE.Group();
      brLeg.position.set(0.08*scale, 0.15*scale, -0.12*scale);
      const brMesh = makeBlock(legW, legH, legW, primary, 0.9);
      brMesh.position.y = -0.075*scale;
      brLeg.add(brMesh);
      body.add(brLeg);

      world.add(dog);
      chamberDog = {
        group: dog, body, head: headPivot, tail,
        legs: [flLeg, frLeg, blLeg, brLeg],
        phase: Math.random() * Math.PI * 2, baseX: x, baseZ: z,
      };
      return dog;
    };

    const createVoxelTerrapin = ({ parent = world, x, y, z, scale = 1, primary = greenColor, accent = creamColor, shellTint = blueColor }) => {
      const terrapin = new THREE.Group();
      terrapin.position.set(x, y, z);

      const makeBlock = (w, h, d, color, opacity = 0.88) => {
        const geom = useGeometry(new THREE.BoxGeometry(w, h, d));
        return new THREE.LineSegments(
          useGeometry(new THREE.EdgesGeometry(geom)),
          useMaterial(
            new THREE.LineBasicMaterial({
              color,
              transparent: true,
              opacity,
              blending: THREE.AdditiveBlending,
              depthWrite: false,
            }),
          ),
        );
      };

      const makeVoxel = (color, opacity = 0.82) =>
        new THREE.Mesh(
          pixelGeometry,
          useMaterial(
            new THREE.MeshBasicMaterial({
              color,
              transparent: true,
              opacity,
            }),
          ),
        );

      const body = new THREE.Group();
      terrapin.add(body);

      const shellBase = makeBlock(0.28 * scale, 0.1 * scale, 0.34 * scale, primary, 0.92);
      shellBase.position.set(0, 0.06 * scale, 0);
      body.add(shellBase);

      const shellTop = makeBlock(0.22 * scale, 0.08 * scale, 0.24 * scale, shellTint, 0.86);
      shellTop.position.set(0, 0.12 * scale, -0.01 * scale);
      body.add(shellTop);

      const shellVoxels = [
        [-0.06, 0.14, -0.04],
        [0.06, 0.14, -0.02],
        [0.0, 0.16, 0.04],
        [-0.02, 0.18, -0.1],
      ];
      shellVoxels.forEach(([vx, vy, vz], index) => {
        const voxel = makeVoxel(index % 2 === 0 ? accent : primary, 0.78);
        voxel.position.set(vx * scale, vy * scale, vz * scale);
        voxel.scale.setScalar(0.33 * scale);
        body.add(voxel);
      });

      const headPivot = new THREE.Group();
      headPivot.position.set(0, 0.06 * scale, 0.21 * scale);
      body.add(headPivot);

      const head = makeBlock(0.11 * scale, 0.07 * scale, 0.12 * scale, accent, 0.9);
      headPivot.add(head);

      const beak = makeBlock(0.04 * scale, 0.03 * scale, 0.05 * scale, primary, 0.78);
      beak.position.set(0, -0.01 * scale, 0.08 * scale);
      headPivot.add(beak);

      const tail = makeBlock(0.05 * scale, 0.03 * scale, 0.08 * scale, primary, 0.76);
      tail.position.set(0, 0.04 * scale, -0.21 * scale);
      body.add(tail);

      const flipperGeo = useGeometry(new THREE.BoxGeometry(0.12 * scale, 0.02 * scale, 0.1 * scale));
      const flipperEdges = useGeometry(new THREE.EdgesGeometry(flipperGeo));
      const flipperMaterial = useMaterial(
        new THREE.LineBasicMaterial({
          color: accent,
          transparent: true,
          opacity: 0.88,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        }),
      );

      const makeFlipper = (xPos, zPos, yaw) => {
        const pivot = new THREE.Group();
        pivot.position.set(xPos * scale, 0.03 * scale, zPos * scale);
        const flipper = new THREE.LineSegments(flipperEdges, flipperMaterial);
        flipper.rotation.y = yaw;
        pivot.add(flipper);
        body.add(pivot);
        return pivot;
      };

      const frontLeft = makeFlipper(-0.16, 0.1, -0.4);
      const frontRight = makeFlipper(0.16, 0.1, 0.4);
      const rearLeft = makeFlipper(-0.13, -0.13, -0.24);
      const rearRight = makeFlipper(0.13, -0.13, 0.24);

      parent.add(terrapin);
      chamberTerrapin = {
        group: terrapin,
        body,
        head: headPivot,
        tail,
        flippers: [frontLeft, frontRight, rearLeft, rearRight],
        phase: Math.random() * Math.PI * 2,
        baseX: x,
        baseY: y,
        baseZ: z,
        parent,
      };
      return terrapin;
    };

    const gladeGroup = new THREE.Group();
    gladeGroup.position.set(chamberFieldMap.waterfall.x, 0.05, chamberFieldMap.waterfall.z);
    world.add(gladeGroup);

    const waterfallHeight = 5.7;
    const waterfallBottomY = -1.76;
    const waterfallCenterY = waterfallBottomY + waterfallHeight * 0.5;

    const focusFrame = new THREE.LineSegments(
      useGeometry(
        new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(-(chamberFieldMap.waterfall.width * 0.72), waterfallBottomY, -0.42),
          new THREE.Vector3(chamberFieldMap.waterfall.width * 0.72, waterfallBottomY, -0.42),
          new THREE.Vector3(chamberFieldMap.waterfall.width * 0.72, waterfallBottomY, -0.42),
          new THREE.Vector3(chamberFieldMap.waterfall.width * 0.72, 3.98, -0.42),
          new THREE.Vector3(chamberFieldMap.waterfall.width * 0.72, 3.98, -0.42),
          new THREE.Vector3(-(chamberFieldMap.waterfall.width * 0.72), 3.98, -0.42),
          new THREE.Vector3(-(chamberFieldMap.waterfall.width * 0.72), 3.98, -0.42),
          new THREE.Vector3(-(chamberFieldMap.waterfall.width * 0.72), waterfallBottomY, -0.42),
        ]),
      ),
      useMaterial(
        new THREE.LineBasicMaterial({
          color: creamColor,
          transparent: true,
          opacity: 0.24,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        }),
      ),
    );
    gladeGroup.add(focusFrame);

    const waterfallBaseGeometry = useGeometry(
      new THREE.PlaneGeometry(
        chamberFieldMap.waterfall.width,
        waterfallHeight,
        quality.mobile ? 6 : lowPowerMode ? 8 : 10,
        quality.mobile ? 18 : lowPowerMode ? 22 : 28,
      ),
    );
    const waterfallGeometry = useGeometry(new THREE.WireframeGeometry(waterfallBaseGeometry));
    const waterfallMaterial = useMaterial(
      new THREE.LineBasicMaterial({
        color: blueColor,
        transparent: true,
        opacity: 0.48,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })
    );
    
    waterfallMaterial.onBeforeCompile = (shader) => {
      shader.uniforms.uTime = waterfallUniforms.uTime;
      shader.vertexShader = `
        uniform float uTime;
        
        float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
        float noise(vec2 p) {
            vec2 i = floor(p); vec2 f = fract(p);
            vec2 u = f*f*(3.0-2.0*f);
            return mix(mix(hash(i + vec2(0.0,0.0)), hash(i + vec2(1.0,0.0)), u.x),
                       mix(hash(i + vec2(0.0,1.0)), hash(i + vec2(1.0,1.0)), u.x), u.y);
        }

        ${shader.vertexShader}
      `.replace(
        `#include <begin_vertex>`,
        `
        #include <begin_vertex>
        float speed = uTime * 4.2;
        float yPhase = position.y * 3.0 - speed;
        float xPhase = position.x * 6.0;
        
        // Complex fluid distortion combining sine math and noise
        float wave = sin(yPhase + noise(vec2(position.x * 4.0, position.y * 2.0 - speed)) * 3.5) * 0.18;
        wave += cos(yPhase * 0.4 + xPhase) * 0.1;
        wave += sin(yPhase * 1.5 - xPhase * 2.0) * 0.05;
        
        // Dampen at the very top so it seamlessly emerges from the wall
        float intensity = smoothstep(2.0, -1.0, position.y);
        transformed.z += wave * intensity;
        `
      );
    };

    const waterfallSheet = new THREE.LineSegments(waterfallGeometry, waterfallMaterial);
    waterfallSheet.position.set(0, waterfallCenterY, -0.28);
    gladeGroup.add(waterfallSheet);

    const spray = new THREE.InstancedMesh(
      pixelGeometry,
      useMaterial(
        new THREE.MeshBasicMaterial({
          color: 0xffffff,
          transparent: true,
          opacity: 0.88,
        }),
      ),
      quality.sprayCount,
    );
    const sprayDummy = new THREE.Object3D();
    const sprayColor = new THREE.Color();
    const sprayParticles = [];
    spray.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    for (let i = 0; i < quality.sprayCount; i += 1) {
      sprayParticles.push({
        x: (Math.random() - 0.5) * (chamberFieldMap.waterfall.width * 1.18),
        y: waterfallBottomY + 0.18 + Math.random() * 3.5,
        z: 0.25 + Math.random() * 4.2,
        speed: 0.015 + Math.random() * 0.035,
        drift: Math.random() * Math.PI * 2,
        scale: 0.55 + Math.random() * 0.8,
      });
      sprayColor.copy(i % 5 === 0 ? creamColor : i % 2 === 0 ? blueColor : greenColor);
      sprayDummy.position.set(sprayParticles[i].x, sprayParticles[i].y, sprayParticles[i].z);
      sprayDummy.scale.setScalar(sprayParticles[i].scale);
      sprayDummy.updateMatrix();
      spray.setMatrixAt(i, sprayDummy.matrix);
      spray.setColorAt(i, sprayColor);
    }
    spray.instanceMatrix.needsUpdate = true;
    if (spray.instanceColor) {
      spray.instanceColor.needsUpdate = true;
    }
    gladeGroup.add(spray);

    const poolGroup = new THREE.Group();
    poolGroup.position.set(0, -1.76, 0.18);
    poolGroup.rotation.x = -Math.PI * 0.5;
    poolGroup.scale.set(chamberFieldMap.waterfall.poolRadius * 0.92, 0.62, 1);
    gladeGroup.add(poolGroup);
    
    const ringGeo = useGeometry(new THREE.EdgesGeometry(new THREE.CircleGeometry(1.6, 48)));
    for(let i = 0; i < 7; i += 1) {
        const ring = new THREE.LineSegments(
            ringGeo, 
            useMaterial(new THREE.LineBasicMaterial({ color: blueColor, transparent: true, blending: THREE.AdditiveBlending }))
        );
        poolRings.push({ mesh: ring, offset: i / 7 });
        poolGroup.add(ring);
    }
    const ripples = [];
    const rippleGeometry = useGeometry(new THREE.BufferGeometry());
    const ripplePoints = [];
    for (let i = 0; i <= 32; i += 1) {
      const theta = (i / 32) * Math.PI * 2;
      ripplePoints.push(Math.cos(theta), 0, Math.sin(theta));
    }
    rippleGeometry.setAttribute("position", new THREE.Float32BufferAttribute(ripplePoints, 3));
    for (let i = 0; i < 4; i += 1) {
      const rippleMesh = new THREE.Line(
        rippleGeometry,
        useMaterial(new THREE.LineBasicMaterial({ color: creamColor, transparent: true, opacity: 0 }))
      );
      gladeGroup.add(rippleMesh);
      ripples.push({ mesh: rippleMesh, active: false, age: 0, x: 0, z: 0 });
    }

    const spores = new THREE.InstancedMesh(
      mistGeometry,
      useMaterial(
        new THREE.MeshBasicMaterial({
          color: 0xffffff,
          transparent: true,
          opacity: 0.82,
        }),
      ),
      quality.mistCount,
    );
    const sporeDummy = new THREE.Object3D();
    const sporeColor = new THREE.Color();
    const sporeParticles = [];
    spores.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    for (let i = 0; i < quality.mistCount; i += 1) {
      const angle = i * 0.31;
      const radius = 0.25 + ((i * 11) % 100) / 100 * (chamberFieldMap.waterfall.poolRadius * 0.88);
      sporeParticles.push({
        baseX: Math.cos(angle) * radius,
        baseY: waterfallBottomY + Math.random() * 2.5,
        baseZ: 0.08 + Math.sin(angle) * radius * 0.22,
        phaseX: Math.random() * 100,
        phaseY: Math.random() * 100,
        phaseZ: Math.random() * 100,
        scale: 0.55 + (i % 4) * 0.18,
      });
      sporeDummy.position.set(sporeParticles[i].baseX, sporeParticles[i].baseY, sporeParticles[i].baseZ);
      sporeDummy.scale.setScalar(sporeParticles[i].scale);
      sporeDummy.updateMatrix();
      spores.setMatrixAt(i, sporeDummy.matrix);
      sporeColor.copy(i % 3 === 0 ? creamColor : i % 2 === 0 ? orangeColor : greenColor);
      spores.setColorAt(i, sporeColor);
    }
    spores.instanceMatrix.needsUpdate = true;
    if (spores.instanceColor) {
      spores.instanceColor.needsUpdate = true;
    }
    gladeGroup.add(spores);

    const undergrowthZones = [
      { x: -2.8, z: 1.7, spreadX: 2.4, spreadZ: 1.6, leaves: 92, primary: greenColor, accent: blueColor },
      { x: 2.75, z: 1.55, spreadX: 2.45, spreadZ: 1.7, leaves: 96, primary: deepGreenColor, accent: creamColor, pinkRate: 0.18 },
      { x: -1.7, z: -1.0, spreadX: 2.0, spreadZ: 1.5, leaves: 58, primary: greenColor, accent: orangeColor },
      { x: 1.8, z: -0.9, spreadX: 2.0, spreadZ: 1.45, leaves: 56, primary: deepGreenColor, accent: pinkColor, pinkRate: 0.14 },
      { x: -2.2, z: -10.8, spreadX: 2.2, spreadZ: 1.8, leaves: 60, primary: greenColor, accent: creamColor },
      { x: 2.25, z: -10.6, spreadX: 2.25, spreadZ: 1.85, leaves: 62, primary: deepGreenColor, accent: orangeColor, pinkRate: 0.1 },
      { x: -1.2, z: -13.8, spreadX: 1.8, spreadZ: 1.5, leaves: 46, primary: blueColor, accent: creamColor },
      { x: 1.35, z: -13.9, spreadX: 1.85, spreadZ: 1.55, leaves: 48, primary: deepGreenColor, accent: pinkColor, pinkRate: 0.12 },
    ];
    undergrowthZones.forEach(createPlantPatch);

    for (let vineIndex = 0; vineIndex < quality.vineCount; vineIndex += 1) {
      const startX = -4.6 + vineIndex * 1.8;
      const points = [];
      for (let step = 0; step < 9; step += 1) {
        const t = step / 8;
        points.push(
          new THREE.Vector3(
            startX + Math.sin(vineIndex * 0.7 + t * 2.2) * 0.22,
            3.9 - t * (1.2 + (vineIndex % 3) * 0.18),
            -1.2 - vineIndex * 2.8 + Math.cos(t * 3.1 + vineIndex) * 0.18,
          ),
        );
      }
      const vine = new THREE.Line(
        useGeometry(new THREE.BufferGeometry().setFromPoints(points)),
        useMaterial(
          new THREE.LineBasicMaterial({
            color: vineIndex % 2 === 0 ? creamColor : greenColor,
            transparent: true,
            opacity: 0.22,
          }),
        ),
      );
      canopyVines.push({ line: vine, drift: Math.random() * Math.PI * 2 });
      world.add(vine);
    }

    const canopySignals = new THREE.InstancedMesh(
      canopySignalGeometry,
      useMaterial(
        new THREE.MeshBasicMaterial({
          color: 0xffffff,
          transparent: true,
          opacity: 0.42,
        }),
      ),
      quality.canopySignals,
    );
    const canopyDummy = new THREE.Object3D();
    const canopyColor = new THREE.Color();
    canopySignals.instanceMatrix.setUsage(THREE.StaticDrawUsage);
    for (let i = 0; i < quality.canopySignals; i += 1) {
      canopyDummy.position.set(
        -5.8 + (i % 15) * 0.78,
        3.5 + ((i * 7) % 10) * 0.06,
        -1.2 - Math.floor(i / 15) * 1.42,
      );
      canopyDummy.scale.setScalar(0.7 + (i % 4) * 0.12);
      canopyDummy.updateMatrix();
      canopySignals.setMatrixAt(i, canopyDummy.matrix);
      canopyColor.copy(i % 4 === 0 ? creamColor : i % 3 === 0 ? blueColor : greenColor);
      canopySignals.setColorAt(i, canopyColor);
    }
    canopySignals.instanceMatrix.needsUpdate = true;
    if (canopySignals.instanceColor) {
      canopySignals.instanceColor.needsUpdate = true;
    }
    world.add(canopySignals);

    createMonsteraPatch({ x: -2.15, z: -2.2, scale: 1.45 });
    createAlocasiaPatch({ x: -3.35, z: -0.55, scale: 1.35 });
    createFlamingoAnthuriumPatch({ x: -2.55, z: -3.85, scale: 1.3, accent: pinkColor });
    createQueenAnthuriumPatch({ x: -1.3, z: -5.6, scale: 1.18 });

    createMonsteraPatch({ x: 2.25, z: -1.85, scale: 1.35, primary: deepGreenColor });
    createAlocasiaPatch({ x: 3.6, z: -0.8, scale: 1.2, primary: deepGreenColor });
    createFlamingoAnthuriumPatch({ x: 2.2, z: -3.9, scale: 1.28, accent: orangeColor });
    createQueenAnthuriumPatch({ x: 1.45, z: -5.9, scale: 1.2, primary: deepGreenColor });

    createMonsteraPatch({ x: -3.55, z: -11.6, scale: 1.35, primary: deepGreenColor });
    createAlocasiaPatch({ x: -2.35, z: -12.9, scale: 1.22 });
    createFlamingoAnthuriumPatch({ x: -4.65, z: -14.25, scale: 1.15, accent: pinkColor });
    createQueenAnthuriumPatch({ x: -1.55, z: -15.1, scale: 1.28 });

    createMonsteraPatch({ x: 3.6, z: -11.4, scale: 1.42, primary: deepGreenColor });
    createAlocasiaPatch({ x: 2.4, z: -12.8, scale: 1.24, primary: deepGreenColor });
    createFlamingoAnthuriumPatch({ x: 4.55, z: -14.05, scale: 1.18, accent: orangeColor });
    createQueenAnthuriumPatch({ x: 1.7, z: -15.2, scale: 1.3, primary: deepGreenColor });

    const getPerchWorldPosition = (perch, target) => {
      perch.host.updateWorldMatrix(true, false);
      target.copy(perch.localPosition);
      return perch.host.localToWorld(target);
    };

    const pickBirdPerch = (bird, preferredType = bird.species.preferredPerch) => {
      const typeOrder = preferredType
        ? [preferredType, preferredType === "tree" ? "plant" : "tree"]
        : ["plant", "tree"];

      for (let typeIndex = 0; typeIndex < typeOrder.length; typeIndex += 1) {
        const pool = birdPerches[typeOrder[typeIndex]] || [];
        const available = pool.filter(
          (perch) => perch !== bird.perch && perch !== bird.targetPerch && (!perch.occupiedBy || perch.occupiedBy === bird),
        );
        if (available.length) {
          return available[Math.floor(Math.random() * available.length)];
        }
      }

      return null;
    };

    const createChamberBird = ({ species, initialPerch, phase = 0 }) => {
      const group = new THREE.Group();
      
      const body = new THREE.LineSegments(useGeometry(new THREE.EdgesGeometry(birdBodyGeometry)), species.materials.body);
      body.scale.set(1, 1, 1.2);
      group.add(body);

      const headPivot = new THREE.Group();
      headPivot.position.set(0, 0.06, 0.22); // Floating disconnected head
      group.add(headPivot);
      
      const head = new THREE.LineSegments(useGeometry(new THREE.EdgesGeometry(birdHeadGeometry)), species.materials.accent);
      headPivot.add(head);

      const beak = new THREE.LineSegments(useGeometry(new THREE.EdgesGeometry(birdBeakGeometry)), species.materials.accent);
      beak.position.set(0, 0, 0.12);
      headPivot.add(beak);

      const leftWingPivot = new THREE.Group();
      leftWingPivot.position.set(-0.16, 0.02, 0.05); // Floating disconnected shoulder
      group.add(leftWingPivot);
      const leftWing = new THREE.LineSegments(useGeometry(new THREE.EdgesGeometry(birdWingGeometry)), species.materials.wing);
      leftWing.rotation.x = Math.PI * 0.5;
      leftWing.position.y = -0.05;
      leftWingPivot.add(leftWing);

      const rightWingPivot = new THREE.Group();
      rightWingPivot.position.set(0.16, 0.02, 0.05);
      group.add(rightWingPivot);
      const rightWing = new THREE.LineSegments(useGeometry(new THREE.EdgesGeometry(birdWingGeometry)), species.materials.wing);
      rightWing.rotation.x = Math.PI * 0.5;
      rightWing.position.y = -0.05;
      rightWingPivot.add(rightWing);

      const tail = new THREE.LineSegments(useGeometry(new THREE.EdgesGeometry(birdTailGeometry)), species.materials.tail);
      tail.position.set(0, -0.02, -0.22); // Floating disconnected tail
      tail.rotation.x = -0.15;
      group.add(tail);

      group.scale.setScalar(species.scale);
      world.add(group);

      const bird = {
        species,
        phase,
        group,
        wings: [leftWingPivot, rightWingPivot],
        tail,
        head: headPivot,
        perch: null,
        targetPerch: null,
        state: "perched",
        actionAt: 0,
        flightStart: 0,
        flightDuration: species.flightMin,
        flightArc: 0.8,
        flightBank: 0.12 + Math.random() * 0.16,
        startPosition: new THREE.Vector3(),
        endPosition: new THREE.Vector3(),
      };

      if (initialPerch) {
        initialPerch.occupiedBy = bird;
        bird.perch = initialPerch;
        getPerchWorldPosition(initialPerch, bird.startPosition);
        bird.group.position.copy(bird.startPosition);
        bird.group.rotation.y = initialPerch.facingY;
      }

      bird.actionAt =
        species.perchMin + Math.random() * (species.perchMax - species.perchMin) + phase * 0.12;
      chamberBirds.push(bird);
      return bird;
    };

    const launchBird = (bird, elapsed) => {
      const nextType =
        bird.perch?.type === "tree"
          ? Math.random() < 0.72
            ? "plant"
            : bird.species.preferredPerch
          : Math.random() < 0.72
            ? "tree"
            : bird.species.preferredPerch;
      const nextPerch = pickBirdPerch(bird, nextType);
      if (!nextPerch) {
        bird.actionAt = elapsed + 1.4;
        return;
      }

      if (bird.perch) {
        bird.perch.occupiedBy = null;
      }

      bird.state = "flying";
      bird.targetPerch = nextPerch;
      bird.flightStart = elapsed;
      bird.flightDuration =
        bird.species.flightMin + Math.random() * (bird.species.flightMax - bird.species.flightMin);
      bird.flightArc =
        (bird.targetPerch.type === "tree" ? 1.2 : 0.82) + Math.random() * (quality.mobile ? 0.2 : 0.42);
      bird.flightBank = 0.12 + Math.random() * 0.18;
      bird.startPosition.copy(bird.group.position);
      getPerchWorldPosition(nextPerch, bird.endPosition);
      bird.endPosition.y += 0.04;
    };

    const settleBird = (bird, elapsed) => {
      bird.state = "perched";
      bird.perch = bird.targetPerch;
      bird.targetPerch = null;
      if (bird.perch) {
        bird.perch.occupiedBy = bird;
        getPerchWorldPosition(bird.perch, bird.startPosition);
        bird.group.position.copy(bird.startPosition);
      }
      bird.actionAt =
        elapsed + bird.species.perchMin + Math.random() * (bird.species.perchMax - bird.species.perchMin);
    };

    if (birdPerches.tree.length || birdPerches.plant.length) {
      for (let birdIndex = 0; birdIndex < quality.birdCount; birdIndex += 1) {
        const species = birdSpecies[birdIndex % birdSpecies.length];
        const initialPerch = pickBirdPerch({ species, perch: null, targetPerch: null }, species.preferredPerch);
        if (!initialPerch) {
          break;
        }
        createChamberBird({
          species,
          initialPerch,
          phase: birdIndex * 1.37 + Math.random() * 0.8,
        });
      }
    }

    createHumanoidCaretaker({
      x: -3.2,
      z: -2.8,
      scale: 1.88,
      primary: creamColor,
      accent: orangeColor,
      tint: greenColor,
      task: "water",
      route: [
        { x: -3.25, z: -0.95 },
        { x: -2.55, z: -3.9 },
        { x: -3.65, z: -11.7 },
        { x: -2.15, z: -13.25 },
      ],
    });
    createHumanoidCaretaker({
      x: 3.15,
      z: -12.3,
      scale: 1.8,
      primary: creamColor,
      accent: blueColor,
      tint: deepGreenColor,
      task: "prune",
      route: [
        { x: 3.4, z: -1.05 },
        { x: 2.2, z: -3.95 },
        { x: 3.8, z: -11.45 },
        { x: 2.05, z: -13.9 },
      ],
    });
    createFrenchBulldog({
      x: -1.8,
      z: -4.4,
      scale: 0.9,
      primary: creamColor,
      accent: orangeColor,
    });
    createVoxelTerrapin({
      parent: gladeGroup,
      x: 0.24,
      y: -1.66,
      z: 0.28,
      scale: 0.6,
      primary: greenColor,
      accent: creamColor,
      shellTint: blueColor,
    });

    const mountains = [];
    mountains.push(createMountainRange(-25, 0.8, deepGreenColor, 0));
    mountains.push(createMountainRange(-35, 1.2, blueColor, 100));
    mountains.push(createMountainRange(-48, 1.8, orangeColor, 250));
    mountains.push(createMountainRange(-65, 2.5, creamColor, 400));

    const reticleGeo = useGeometry(new THREE.EdgesGeometry(new THREE.BoxGeometry(1, 1, 1)));
    const reticleMat = useMaterial(new THREE.LineBasicMaterial({ color: creamColor, transparent: true, opacity: 0.9 }));
    const reticle = new THREE.LineSegments(reticleGeo, reticleMat);
    reticle.visible = false;
    world.add(reticle);

    const raycaster = new THREE.Raycaster();
    raycaster.layers.set(1); // Set to exclusive interaction layer
    const raycastPointer = new THREE.Vector2();
    let hoveredHitbox = null;

    const _hitboxMeshes = hitboxes.map((h) => h.mesh);
    const _tempBox = new THREE.Box3();
    const pointer = { x: 0, y: 0 };
    const targetPointer = { x: 0, y: 0 };
    const clock = new THREE.Clock();
    let secondaryAccumulator = 0;
    let atmosphereAccumulator = 0;
    let raycastAccumulator = 0;
    let readoutAccumulator = quality.readoutStep;
    let rafId = 0;
    let disposed = false;
    let lastInteractionTime = performance.now();
    let controlsActive = false;
    let pointerInsideHero = false;
    let hoverCandidate = null;
    let hoverCandidateSince = 0;
    const hoverAcquireDelay = 120;

    const resize = () => {
      const bounds = heroStage.getBoundingClientRect();
      camera.aspect = bounds.width / bounds.height;
      camera.updateProjectionMatrix();
      renderer.setSize(bounds.width, bounds.height, false);
    };

    const onPointerMove = (event) => {
      pointerInsideHero = true;
      const bounds = heroStage.getBoundingClientRect();
      const localX = (event.clientX - bounds.left) / bounds.width;
      const localY = (event.clientY - bounds.top) / bounds.height;
      targetPointer.x = (localX - 0.5) * 2;
      targetPointer.y = (localY - 0.5) * 2;
      heroStage.style.setProperty("--torch-x", `${(localX * 100).toFixed(2)}%`);
      heroStage.style.setProperty("--torch-y", `${(localY * 100).toFixed(2)}%`);
      heroStage.style.setProperty("--torch-active", "1");
      lastInteractionTime = performance.now();
    };

    const onPointerLeave = () => {
      pointerInsideHero = false;
      targetPointer.x = 0;
      targetPointer.y = 0;
      heroStage.style.setProperty("--torch-x", "50%");
      heroStage.style.setProperty("--torch-y", "44%");
      heroStage.style.setProperty("--torch-active", "0");
    };

    const onControlStart = () => {
      controlsActive = true;
      lastInteractionTime = performance.now();
    };

    const onControlEnd = () => {
      controlsActive = false;
      lastInteractionTime = performance.now();
    };

    heroStage.addEventListener("pointermove", onPointerMove);
    heroStage.addEventListener("pointerleave", onPointerLeave);
    heroStage.style.setProperty("--torch-x", "50%");
    heroStage.style.setProperty("--torch-y", "44%");
    heroStage.style.setProperty("--torch-active", "0");
    controls.addEventListener("start", onControlStart);
    controls.addEventListener("end", onControlEnd);
    window.addEventListener("resize", resize);
    resize();
    updateInstrumentReadouts();

    const animate = () => {
      if (disposed) {
        return;
      }

      const delta = Math.min(clock.getDelta(), 0.05);
      const elapsed = clock.elapsedTime;
      secondaryAccumulator += delta;
      atmosphereAccumulator += delta;
      raycastAccumulator += delta;
      readoutAccumulator += delta;
      pointer.x += (targetPointer.x - pointer.x) * 0.028;
      pointer.y += (targetPointer.y - pointer.y) * 0.028;

      const now = performance.now();
      const idleTime = Math.max(0, now - lastInteractionTime);
      const idleBlend = THREE.MathUtils.smoothstep(idleTime, 600, 2400);
      const activityBlend = controlsActive ? 0.22 : 1 - idleBlend * 0.55;

      const travel = Math.sin(elapsed * 0.055 - Math.PI * 0.5) * 0.5 + 0.5;

      const currentDistance = camera.position.distanceTo(controls.target);
      if (Math.abs(currentDistance - desiredZoomDistance) > 0.01) {
        const nextDistance = THREE.MathUtils.lerp(currentDistance, desiredZoomDistance, 0.09);
        applyZoomDistance(nextDistance);
      }

      controls.update();

      reusableCameraOffset.x = camera.position.x - controls.target.x;
      reusableCameraOffset.y = camera.position.y - controls.target.y;
      reusableCameraOffset.z = camera.position.z - controls.target.z;
      chamberTelemetry.zoomDistance = currentDistance;
      chamberTelemetry.focusDepth = controls.target.z;
      chamberTelemetry.lateralOffset = controls.target.x;
      chamberTelemetry.azimuth = Math.atan2(reusableCameraOffset.x, reusableCameraOffset.z);
      chamberTelemetry.polar = Math.atan2(
        reusableCameraOffset.y,
        Math.max(0.0001, Math.hypot(reusableCameraOffset.x, reusableCameraOffset.z))
      );
      chamberTelemetry.idleBlend = idleBlend;
      chamberTelemetry.sweep = ((elapsed * 0.045) + idleBlend * 0.25) % 1;
      chamberTelemetry.waterfallPulse = 0.28 + Math.sin(elapsed * 0.72 + travel * Math.PI) * 0.08 + idleBlend * 0.12;
      chamberTelemetry.lockState = hoveredHitbox
        ? "locked"
        : hoverCandidate
          ? "acquire"
          : controlsActive
            ? "tracking"
            : idleBlend > 0.6
              ? "idle"
              : "soft";
      chamberTelemetry.specimenDensity = hitboxes.length;

      scene.fog.density = rootElement.dataset.theme === "light" ? 0.012 + idleBlend * 0.002 : 0.015 + idleBlend * 0.003;
      sweepFrame.position.z = THREE.MathUtils.lerp(1.5, -25, chamberTelemetry.sweep);
      sweepFrameMaterial.opacity = 0.016 + idleBlend * 0.06;
      focusFrame.material.opacity = 0.18 + chamberTelemetry.waterfallPulse * 0.2;
      waterfallMaterial.opacity = 0.38 + chamberTelemetry.waterfallPulse * 0.2 + idleBlend * 0.05;
      if (readoutAccumulator >= quality.readoutStep) {
        readoutAccumulator = 0;
        updateInstrumentReadouts();
      }

      world.position.x = Math.sin(elapsed * 0.038) * 0.045 * activityBlend;
      world.position.y = Math.cos(elapsed * 0.05) * 0.038 * activityBlend;

      chamberAttendants.forEach((attendant, index) => {
        const motionWeight = 0.36 + idleBlend * 0.64;
        const phase = elapsed * 0.62 + attendant.phase + index * 0.35;
        const route = attendant.route;
        
        // Speed controls stride mapping
        const speed = attendant.task === "water" ? 0.052 : 0.046;
        const routeTime = (elapsed * speed + attendant.phase * 0.08) % route.length;
        const segmentIndex = Math.floor(routeTime);
        const local = routeTime - segmentIndex;
        
        const from = route[segmentIndex];
        const to = route[(segmentIndex + 1) % route.length];
        
        // Dwell state = acting at a waypoint. 
        // We give them ~30% of the segment to stay in place and "work", 70% to walk.
        const dwellRatio = 0.30;
        const dwell = local < dwellRatio;
        const moveT = dwell ? 0 : (local - dwellRatio) / (1 - dwellRatio);
        const eased = moveT * moveT * (3 - 2 * moveT);

        // Core positioning
        const px = from.x + (to.x - from.x) * eased;
        const pz = from.z + (to.z - from.z) * eased;
        const facing = Math.atan2(to.x - from.x, to.z - from.z);
        
        // Calculate true euclidean translation distance this frame to bind foot stride
        const dx = px - attendant.actor.position.x;
        const dz = pz - attendant.actor.position.z;
        const distThisFrame = dwell ? 0 : Math.hypot(dx, dz);
        attendant.distanceWalked = (attendant.distanceWalked || 0) + distThisFrame;
        
        const positionBlend = dwell ? 1 - Math.exp(-delta * 8.5) : 1; 
        
        if (dwell) {
            attendant.actor.position.x += (px - attendant.actor.position.x) * positionBlend;
            attendant.actor.position.z += (pz - attendant.actor.position.z) * positionBlend;
        } else {
            // Unblended translation during motion prevents any sliding artifacts
            attendant.actor.position.x = px;
            attendant.actor.position.z = pz;
        }
        
        // --- Walk Cycle & Posture (Distance Bound) ---
        // Stride phase = distanceWalked * constant frequency
        const strideFrequency = 8.5; // Adjusted for leg-length geometry
        const stride = attendant.distanceWalked * strideFrequency + attendant.phase;
        
        // Vertical hip bounce (2 bounces per cycle)
        const bounce = dwell ? 0 : Math.abs(Math.sin(stride)) * 0.06;
        // Idle breathing applies slightly when dwelling
        const breathe = dwell ? Math.sin(phase * 1.5) * 0.015 : 0;
        
        attendant.actor.position.y = -1.82 + bounce + breathe;
        
        // Yaw / Rotation (Turn smoothly towards target)
        const targetYaw = dwell ? facing + Math.sin(phase * 0.42) * 0.1 : facing;
        attendant.actor.rotation.y += shortestAngleDelta(attendant.actor.rotation.y, targetYaw) * (1 - Math.exp(-delta * 7.2));
        
        // --- Inverse Kinematics / Procedural Rigging ---
        const torsoSway = dwell ? Math.sin(phase * 1.2) * 0.02 : Math.sin(stride) * 0.06;
        const torsoPitch = dwell ? 0.05 : 0.15;
        
        const targetHeadRotX = dwell ? -0.1 + Math.sin(phase * 0.9) * 0.04 : -0.05 + Math.sin(phase * 2) * 0.02;
        attendant.head.rotation.x += (targetHeadRotX - attendant.head.rotation.x) * 0.1;
        attendant.head.rotation.y = -torsoSway * 0.5;

        if (attendant.task === "water") {
          // Waterer Posture
          attendant.body.rotation.z = torsoSway;
          attendant.body.rotation.x = -torsoPitch;
          
          if (dwell) {
            // Task: Deliberately tip watering can and hold
            const dip = Math.sin(elapsed * 2.5 + attendant.phase);
            const holding = dip > 0; // The active "pour" phase
            
            attendant.rightArm.rotation.x += (-0.8 - attendant.rightArm.rotation.x) * 0.1; // Extend forward
            attendant.rightArm.rotation.z = 0.1; // Flare out slightly
            
            // Can specifically tilts sharply down
            if (attendant.tool) {
              const targetTilt = holding ? 0.6 : 0.0;
              attendant.tool.rotation.x += (targetTilt - attendant.tool.rotation.x) * 0.2;
            }
            
            // Left arm idles naturally
            attendant.leftArm.rotation.x += (0.1 + Math.sin(phase * 2) * 0.05 - attendant.leftArm.rotation.x) * 0.1;
            
            // Stream opacity fades in/out sharply with the tilt
            if (attendant.toolStream) {
               attendant.toolStream.material.opacity = holding ? 0.6 + Math.random() * 0.2 : 0.0;
            }
          } else {
            // Walk cycle 
            attendant.rightArm.rotation.x = -0.1 + Math.cos(stride) * 0.25; // Hold can while walking
            attendant.rightArm.rotation.z = 0.05;
            attendant.leftArm.rotation.x = Math.sin(stride) * 0.4; // Opposite swing
            
            if (attendant.tool) attendant.tool.rotation.x = 0; // Neutral can
            if (attendant.toolStream) attendant.toolStream.material.opacity = 0;
          }
          
          // Legs (Pseudo-IK Walk)
          attendant.leftLeg.rotation.x = dwell ? 0 : -Math.sin(stride) * 0.45;
          attendant.rightLeg.rotation.x = dwell ? 0 : Math.sin(stride) * 0.45;
          
        } else {
           // Cutter Posture
          attendant.body.rotation.z = torsoSway;
          attendant.body.rotation.x = torsoPitch * 0.8;
          
          if (dwell) {
            // Task: Deliberate pruning/snipping
            // We use modulo to create rhythmic "pauses"
            const snipCycle = (elapsed * 3 + attendant.phase) % (Math.PI * 2);
            const snipActive = snipCycle < Math.PI; // Active half
            // Sharp cosine creates a jarring "snip snip snip"
            const snipMotion = snipActive ? Math.abs(Math.cos(snipCycle * 4)) * 0.4 : 0;
            
            attendant.rightArm.rotation.x += (0.3 - snipMotion - attendant.rightArm.rotation.x) * 0.2;
            if (attendant.tool) attendant.tool.rotation.x = snipMotion * 0.5; // Tool clicks

            attendant.leftArm.rotation.x += (0.2 + Math.sin(phase * 1.5) * 0.05 - attendant.leftArm.rotation.x) * 0.1;
          } else {
             // Walk cycle
            attendant.rightArm.rotation.x = -Math.sin(stride) * 0.35;
            attendant.leftArm.rotation.x = Math.sin(stride) * 0.35;
            if (attendant.tool) attendant.tool.rotation.x = 0;
          }

          // Legs (Pseudo-IK Walk)
          attendant.leftLeg.rotation.x = dwell ? 0 : -Math.sin(stride) * 0.45;
          attendant.rightLeg.rotation.x = dwell ? 0 : Math.sin(stride) * 0.45;
        }

        const telemetryKey = index === 0 ? "gardenerA" : "gardenerB";
        chamberTelemetry.actors[telemetryKey].x = attendant.actor.position.x;
        chamberTelemetry.actors[telemetryKey].z = attendant.actor.position.z;
      });

      if (chamberDog) {
        const t = elapsed * 0.18;
        const nextX = Math.sin(t) * 3.25 + Math.sin(t * 2.3) * 0.22;
        const nextZ = -7.6 + Math.cos(t * 0.82) * 6.1 + Math.sin(t * 1.45) * 0.34;
        const lookAheadT = t + 0.22;
        const leadX = Math.sin(lookAheadT) * 3.25 + Math.sin(lookAheadT * 2.3) * 0.22;
        const leadZ = -7.6 + Math.cos(lookAheadT * 0.82) * 6.1 + Math.sin(lookAheadT * 1.45) * 0.34;
        const dx = leadX - nextX;
        const dz = leadZ - nextZ;
        const gait = Math.sin(elapsed * 7.2);
        const joy = Math.sin(elapsed * 0.9) * 0.5 + 0.5;
        const sniff = Math.max(0, Math.sin(elapsed * 1.2 + 1.1));
        chamberDog.group.position.set(nextX, -1.82 + Math.abs(gait) * 0.03, nextZ);
        chamberDog.group.rotation.y = Math.atan2(dx, dz);
        chamberDog.body.rotation.z = gait * 0.045;
        chamberDog.head.rotation.y = Math.sin(elapsed * 0.42) * 0.08 + Math.sin(elapsed * 0.18) * 0.04;
        chamberDog.head.rotation.z = -0.14 - sniff * 0.28 + joy * 0.03;
        chamberDog.tail.rotation.z = 0.22 + Math.sin(elapsed * 9.2) * 0.42;
        chamberDog.legs.forEach((leg, index) => {
          const stride = Math.sin(elapsed * 7.2 + (index % 2 === 0 ? 0 : Math.PI));
          leg.rotation.x = stride * 0.22;
        });
        chamberDog.lastX = nextX;
        chamberDog.lastZ = nextZ;
        chamberTelemetry.actors.bulldog.x = nextX;
        chamberTelemetry.actors.bulldog.z = nextZ;
      }

      if (chamberTerrapin) {
        const t = elapsed * 0.34 + chamberTerrapin.phase;
        const radiusX = chamberFieldMap.waterfall.poolRadius * 0.42;
        const radiusZ = chamberFieldMap.waterfall.poolRadius * 0.16;
        const nextX = Math.sin(t) * radiusX + Math.sin(t * 1.9) * 0.05;
        const nextZ = 0.18 + Math.cos(t * 0.84) * radiusZ + Math.sin(t * 1.6) * 0.03;
        const lookAheadT = t + 0.24;
        const leadX = Math.sin(lookAheadT) * radiusX + Math.sin(lookAheadT * 1.9) * 0.05;
        const leadZ = 0.18 + Math.cos(lookAheadT * 0.84) * radiusZ + Math.sin(lookAheadT * 1.6) * 0.03;
        const dx = leadX - nextX;
        const dz = leadZ - nextZ;
        const swim = Math.sin(elapsed * 4.6 + chamberTerrapin.phase);
        const glide = Math.sin(elapsed * 1.25 + chamberTerrapin.phase) * 0.5 + 0.5;
        chamberTerrapin.group.position.set(
          nextX,
          chamberTerrapin.baseY + Math.sin(elapsed * 2.1 + chamberTerrapin.phase) * 0.035,
          nextZ,
        );
        chamberTerrapin.group.rotation.y = Math.atan2(dx, dz);
        chamberTerrapin.body.rotation.z = swim * 0.06;
        chamberTerrapin.head.rotation.x = -0.12 + glide * 0.08;
        chamberTerrapin.head.rotation.y = Math.sin(elapsed * 0.8 + chamberTerrapin.phase) * 0.12;
        chamberTerrapin.tail.rotation.y = Math.sin(elapsed * 6.2 + chamberTerrapin.phase) * 0.22;
        chamberTerrapin.flippers.forEach((flipper, index) => {
          const stroke = Math.sin(elapsed * 5.2 + chamberTerrapin.phase + index * 0.9);
          flipper.rotation.x = -0.28 + stroke * (index < 2 ? 0.38 : 0.18);
        });
        chamberTelemetry.actors.terrapin.x = chamberFieldMap.waterfall.x + nextX;
        chamberTelemetry.actors.terrapin.z = chamberFieldMap.waterfall.z + nextZ;
      }

      waterfallUniforms.uTime.value = elapsed;
      
      if (secondaryAccumulator >= quality.secondaryStep) {
        secondaryAccumulator = 0;

        const windBase = elapsed * 0.8;

        forestBanks.forEach(({ group, drift, side }) => {
          const wind = Math.sin(windBase - group.position.x * 0.5 - group.position.z * 0.5) * 0.5 + 0.5;
          group.rotation.z = (Math.sin(elapsed * 0.14 + drift) * 0.012 + wind * 0.024) * (0.35 + idleBlend * 0.65);
          group.rotation.y = (side < 0 ? 0.22 : -0.22) + Math.sin(elapsed * 0.12 + drift) * 0.012 * (0.35 + idleBlend * 0.65);
        });

        groundPlants.forEach(({ group, drift }, index) => {
          const wind = Math.sin(windBase - group.position.x * 0.8 - group.position.z * 0.8) * 0.5 + 0.5;
          const motionWeight = 0.28 + idleBlend * 0.72;
          group.rotation.z = (Math.sin(elapsed * 0.18 + drift + index * 0.1) * 0.018 + wind * 0.05) * motionWeight;
          group.position.y = Math.sin(elapsed * 0.12 + drift) * 0.016 * motionWeight;
          
          // Spruce: Bioluminescent pulse
          if (quality.animatePlantPulse && group.userData.pixelMaterial) {
            const pulse = 0.85 + Math.sin(elapsed * 0.8 + drift) * 0.15;
            group.userData.pixelMaterial.opacity = group.userData.baseOpacity * pulse;
            group.scale.setScalar(1 + Math.sin(elapsed * 0.4 + drift) * 0.02);
          }
        });

        mountains.forEach((m, i) => {
          m.rotation.y = elapsed * (0.008 - i * 0.003); // Orchestrated orbital parallax with counter-revolutions
        });

        canopyVines.forEach(({ line, drift }, index) => {
          const wind = Math.sin(windBase - index * 0.5) * 0.5 + 0.5;
          line.rotation.z = Math.sin(elapsed * 0.14 + drift + index * 0.08) * 0.06 + wind * 0.05;
        });

        if (Math.random() < quality.rippleChance) {
          const inactive = ripples.find(r => !r.active);
          if (inactive) {
            inactive.active = true;
            inactive.age = 0;
            inactive.x = (Math.random() - 0.5) * 0.6;
            inactive.z = 0.12 + (Math.random() - 0.5) * 0.3;
            inactive.mesh.position.set(inactive.x, -1.75, inactive.z);
          }
        }
        ripples.forEach(r => {
          if (r.active) {
            r.age += quality.secondaryStep;
            r.mesh.scale.set(0.1 + r.age * 0.8, 1, 0.1 + r.age * 0.4);
            r.mesh.material.opacity = Math.max(0, 0.35 - r.age * 0.18);
            if (r.age > 2.5) r.active = false;
          } else {
            r.mesh.material.opacity = 0;
          }
        });

        poolRings.forEach(ring => {
          const progress = (elapsed * 0.15 + ring.offset) % 1.0;
          ring.mesh.scale.setScalar(0.2 + progress * 3.5);
          const opacity = progress < 0.2 ? progress / 0.2 : (1.0 - progress) / 0.8;
          ring.mesh.material.opacity = opacity * 0.95;
        });

      }

      if (atmosphereAccumulator >= quality.atmosphereStep) {
        atmosphereAccumulator = 0;

        for (let i = 0; i < sprayParticles.length; i += 1) {
          const particle = sprayParticles[i];
          particle.z += particle.speed;
          particle.y += 0.002 + particle.speed * 0.16;
          particle.x += Math.sin(elapsed * 1.2 + particle.drift + i * 0.07) * 0.0028;
          if (particle.z > 4.5 || particle.y > 1.1) {
            particle.x = (Math.random() - 0.5) * (chamberFieldMap.waterfall.width * 0.98);
            particle.y = waterfallBottomY + 0.2 + Math.random() * 3.1;
            particle.z = 0.15 + Math.random() * 0.65;
            particle.speed = 0.015 + Math.random() * 0.028;
            particle.scale = 0.55 + Math.random() * 0.8;
          }
          sprayDummy.position.set(particle.x, particle.y, particle.z);
          sprayDummy.scale.setScalar(particle.scale);
          sprayDummy.rotation.set(0, 0, elapsed * 0.4 + particle.drift);
          sprayDummy.updateMatrix();
          spray.setMatrixAt(i, sprayDummy.matrix);
        }
        spray.instanceMatrix.needsUpdate = true;

        for (let i = 0; i < quality.mistCount; i += 1) {
          const p = sporeParticles[i];
          p.baseY += 0.006 + Math.sin(elapsed * 0.4 + p.phaseY) * 0.003;
          if (p.baseY > waterfallBottomY + 3.0) p.baseY = waterfallBottomY;
          const driftX = Math.sin(p.baseY * 1.8 + p.phaseX) * 0.35;
          const driftZ = Math.cos(p.baseY * 1.8 + p.phaseZ) * 0.35;
          const pulse = Math.sin(elapsed * 1.1 + p.phaseY) * 0.5 + 0.5;
          sporeDummy.position.set(p.baseX + driftX, p.baseY, p.baseZ + driftZ);
          sporeDummy.scale.setScalar(p.scale * (0.7 + pulse * 0.5));
          sporeDummy.updateMatrix();
          spores.setMatrixAt(i, sporeDummy.matrix);
        }
        spores.instanceMatrix.needsUpdate = true;
      }

      chamberBirds.forEach((bird) => {
        const species = bird.species;
        const phase = elapsed * species.flapSpeed + bird.phase;
        
        if (bird.state === "flying") {
          const t = (elapsed - bird.flightStart) / bird.flightDuration;
          const e = t * t * (3 - 2 * t);
          
          if (t >= 1) {
            settleBird(bird, elapsed);
            return;
          }

          bird.group.position.lerpVectors(bird.startPosition, bird.endPosition, e);
          const arch = Math.sin(t * Math.PI) * bird.flightArc;
          bird.group.position.y += arch;
          
          const dx = bird.endPosition.x - bird.startPosition.x;
          const dz = bird.endPosition.z - bird.startPosition.z;
          const targetYaw = Math.atan2(dx, dz);
          bird.group.rotation.y += shortestAngleDelta(bird.group.rotation.y, targetYaw) * 0.08;
          bird.group.rotation.z = Math.sin(t * Math.PI) * bird.flightBank * (dx > 0 ? 1 : -1);
          bird.group.rotation.x = -0.12 + Math.cos(t * Math.PI) * 0.18;

          const rawFlap = Math.sin(phase);
          const steppedFlap = Math.floor(rawFlap * 4) / 4;
          bird.wings[0].rotation.z = steppedFlap * 1.35;
          bird.wings[1].rotation.z = -steppedFlap * 1.35;
          
          const jitter = Math.sin(elapsed * 22 + bird.phase) * 0.01;
          bird.head.position.y = 0.06 + jitter;
          bird.tail.position.z = -0.22 - jitter * 0.5;

        } else if (bird.state === "perched") {
          const scan = Math.sin(elapsed * 1.1 + bird.phase * 0.5);
          const look = Math.floor(scan * 6) / 6;
          
          bird.head.rotation.y = look * 0.35;
          bird.head.rotation.x = Math.sin(elapsed * 2.8 + bird.phase) * 0.08;
          
          if (Math.sin(elapsed * 0.8 + bird.phase) > 0.94) {
            const shiver = Math.sin(elapsed * 45) * 0.12;
            bird.wings[0].rotation.z = shiver;
            bird.wings[1].rotation.z = -shiver;
          } else {
            bird.wings[0].rotation.z += (0.18 - bird.wings[0].rotation.z) * 0.1;
            bird.wings[1].rotation.z += (-0.18 - bird.wings[1].rotation.z) * 0.1;
          }

          if (elapsed >= bird.actionAt) {
            launchBird(bird, elapsed);
          }
        }
      });

      gladeGroup.position.y = Math.sin(elapsed * 0.18) * 0.04;
      // deleted lookat from waterfallSheet, GLSL handles dynamics
      if (quality.allowHoverScan && pointerInsideHero) {
        if (raycastAccumulator >= quality.raycastStep) {
          raycastAccumulator = 0;
          raycastPointer.set(targetPointer.x, -targetPointer.y);
          raycaster.setFromCamera(raycastPointer, camera);
          const intersects = raycaster.intersectObjects(_hitboxMeshes);
          if (intersects.length > 0) {
            const hit = intersects[0].object;
            let hb = null;
            for (let h = 0; h < hitboxes.length; h++) {
              if (hitboxes[h].mesh === hit) { hb = hitboxes[h]; break; }
            }
            if (hb) {
              if (hoverCandidate !== hb) {
                hoverCandidate = hb;
                hoverCandidateSince = now;
              }

              if (hoveredHitbox !== hb && now - hoverCandidateSince >= hoverAcquireDelay) {
                applyPatchHoverState(hoveredHitbox?.patch, false);
                hoveredHitbox = hb;
                chamberTelemetry.hoveredLabel = hb.label;
                document.body.classList.add("is-bio-scanning");
                cursorShell.classList.add("is-scanning");
                cursorLabel.textContent = hb.label;
                cursorShell.classList.add("has-label");
                cursorRing.style.borderColor = palette.orange;
                applyPatchHoverState(hb.patch, true);
                updateInstrumentReadouts();
              }
            }
            _tempBox.setFromObject(hit);
            _tempBox.getCenter(reticle.position);
            _tempBox.getSize(reticle.scale);
            reticle.visible = true;
            reticle.scale.addScalar(0.16 + Math.sin(elapsed * 10) * 0.03);
            reticle.material.opacity = hoveredHitbox === hb ? 0.9 : 0.36;
          } else {
            hoverCandidate = null;
            if (hoveredHitbox) {
              applyPatchHoverState(hoveredHitbox.patch, false);
              hoveredHitbox = null;
              chamberTelemetry.hoveredLabel = null;
              reticle.visible = false;
              document.body.classList.remove("is-bio-scanning");
              cursorShell.classList.remove("is-scanning");
              cursorLabel.textContent = "";
              cursorShell.classList.remove("has-label");
              cursorRing.style.borderColor = "";
              updateInstrumentReadouts();
            } else {
              reticle.visible = false;
              updateInstrumentReadouts();
            }
          }
        }
      } else {
        hoverCandidate = null;
        if (hoveredHitbox) {
          applyPatchHoverState(hoveredHitbox.patch, false);
          hoveredHitbox = null;
          chamberTelemetry.hoveredLabel = null;
          reticle.visible = false;
          document.body.classList.remove("is-bio-scanning");
          cursorShell.classList.remove("is-scanning");
          cursorLabel.textContent = "";
          cursorShell.classList.remove("has-label");
          cursorRing.style.borderColor = "";
          updateInstrumentReadouts();
        }
      }

      // Cinematic Parallax Drift
      parallaxX += (targetParallaxX * quality.parallaxStrength - parallaxX) * 0.025;
      parallaxY += (targetParallaxY * quality.parallaxStrength - parallaxY) * 0.025;

      const px = camera.position.x;
      const py = camera.position.y;
      
      camera.position.x += parallaxX;
      camera.position.y += parallaxY;
      camera.lookAt(controls.target);

      renderer.render(scene, camera);

      // Restore positions for OrbitalControls
      camera.position.x = px;
      camera.position.y = py;
      rafId = window.requestAnimationFrame(animate);
    };

    animate();

    heroCleanup = () => {
      disposed = true;
      heroStage.removeEventListener("pointermove", onPointerMove);
      heroStage.removeEventListener("pointerleave", onPointerLeave);
      controls.removeEventListener("start", onControlStart);
      controls.removeEventListener("end", onControlEnd);
      window.removeEventListener("resize", resize);
      zoomButtons.forEach((button) => {
        button.removeEventListener("click", onZoomButtonClick);
      });
      if (rafId) {
        window.cancelAnimationFrame(rafId);
      }
      controls.dispose();
      renderer.dispose();
      disposableGeometries.forEach((geometry) => geometry.dispose());
      disposableMaterials.forEach((material) => material.dispose());
    };
  } catch (error) {
    console.error("Three.js hero failed; falling back to 2D scene.", error);
    heroCleanup = setupCanvas(heroCanvas, drawers.hero);
  }
};

window.contactCleanup = () => {};

const setupContactThree = async () => {
  const canvas = document.querySelector('[data-viz="contact"]');
  if (!canvas) return;

  window.contactCleanup();

  try {
    const THREE = await import("three");
    const viz = getVizTheme();
    const hardwareThreads = navigator.hardwareConcurrency || 8;
    const deviceMemory = navigator.deviceMemory || 8;
    let disposed = false;
    let rafId;
    const localCleanups = [];
    let inView = true;
    let pageVisible = !document.hidden;
    let loopRunning = false;
    const width = canvas.clientWidth || canvas.offsetWidth || 1;
    const height = canvas.clientHeight || canvas.offsetHeight || 1;
    const mobileMode = coarsePointer || width < 680 || window.innerWidth < 780;
    const lowPowerMode = mobileMode || hardwareThreads <= 6 || deviceMemory <= 8;
    const quality = mobileMode
      ? {
          pixelRatio: 0.76,
          antialias: false,
          powerPreference: "low-power",
          petalCount: 1400,
          dustCount: 360,
          layers: 2,
          lobes: 8,
          renderStep: 1 / 30,
          petalStep: 1 / 12,
          fogDensity: viz.lightMode ? 0.021 : 0.024,
          interaction: false,
          sceneEase: 0.038,
          petalSize: 0.16,
          dustSize: 0.11,
          dustOpacity: 0.26,
          bloomHeight: 2.2,
        }
      : lowPowerMode
        ? {
            pixelRatio: 0.92,
            antialias: false,
            powerPreference: "high-performance",
            petalCount: 2600,
            dustCount: 900,
            layers: 3,
            lobes: 10,
            renderStep: 1 / 48,
            petalStep: 1 / 18,
            fogDensity: viz.lightMode ? 0.018 : 0.021,
            interaction: true,
            sceneEase: 0.044,
            petalSize: 0.15,
            dustSize: 0.1,
            dustOpacity: 0.32,
            bloomHeight: 2.8,
          }
        : {
            pixelRatio: 1.05,
            antialias: true,
            powerPreference: "high-performance",
            petalCount: 4200,
            dustCount: 1400,
            layers: 3,
            lobes: 12,
            renderStep: 1 / 60,
            petalStep: 1 / 24,
            fogDensity: viz.lightMode ? 0.015 : 0.018,
            interaction: true,
            sceneEase: 0.05,
            petalSize: 0.145,
            dustSize: 0.1,
            dustOpacity: 0.36,
            bloomHeight: 3.2,
          };

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(viz.lightMode ? viz.cream : viz.panelBg, quality.fogDensity);
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, 30);

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: quality.antialias,
      alpha: true,
      powerPreference: quality.powerPreference,
    });
    renderer.setSize(width, height, false);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, quality.pixelRatio));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setClearColor(0x000000, 0);

    const coreGeo = new THREE.IcosahedronGeometry(2, mobileMode ? 0 : 1);
    const coreMat = new THREE.MeshBasicMaterial({
      color: viz.lightMode ? new THREE.Color(0xef6024) : new THREE.Color(0xff9447),
      wireframe: true,
      transparent: true,
      opacity: 0.8,
    });
    const core = new THREE.Mesh(coreGeo, coreMat);
    scene.add(core);

    const petalCount = quality.petalCount;
    const petalGeo = new THREE.BufferGeometry();
    const petalPos = new Float32Array(petalCount * 3);
    const petalBaseInfo = new Float32Array(petalCount * 4);

    for (let i = 0; i < petalCount; i++) {
      const layer = Math.floor(Math.random() * quality.layers);
      const petalIdx = Math.floor(Math.random() * quality.lobes);
      const baseAngle = (petalIdx / quality.lobes) * Math.PI * 2 + layer * 0.2;
      const spread = (Math.random() - 0.5) * 0.7;
      const finalAngle = baseAngle + spread;
      const r = 2 + Math.pow(Math.random(), 1.3) * (14 + layer * 6);
      const jitter = (Math.random() - 0.5) * 0.5;

      petalBaseInfo[i * 4] = finalAngle;
      petalBaseInfo[i * 4 + 1] = r;
      petalBaseInfo[i * 4 + 2] = layer;
      petalBaseInfo[i * 4 + 3] = jitter;

      petalPos[i * 3] = Math.cos(finalAngle) * r;
      petalPos[i * 3 + 1] = jitter;
      petalPos[i * 3 + 2] = Math.sin(finalAngle) * r;
    }

    petalGeo.setAttribute("position", new THREE.BufferAttribute(petalPos, 3));
    petalGeo.setAttribute("baseInfo", new THREE.BufferAttribute(petalBaseInfo, 4));

    const petalMat = new THREE.PointsMaterial({
      size: quality.petalSize,
      color: viz.lightMode ? new THREE.Color(0x2c56d7) : new THREE.Color(0x4a78ff),
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const petals = new THREE.Points(petalGeo, petalMat);
    scene.add(petals);

    const dustGeo = new THREE.BufferGeometry();
    const dustPos = new Float32Array(quality.dustCount * 3);
    for (let i = 0; i < quality.dustCount; i++) {
      dustPos[i * 3] = (Math.random() - 0.5) * 110;
      dustPos[i * 3 + 1] = (Math.random() - 0.5) * 80;
      dustPos[i * 3 + 2] = (Math.random() - 0.5) * 40;
    }
    dustGeo.setAttribute("position", new THREE.BufferAttribute(dustPos, 3));
    const dustMat = new THREE.PointsMaterial({
      size: quality.dustSize,
      color: viz.lightMode ? new THREE.Color(0x248f53) : new THREE.Color(0x7de58d),
      transparent: true,
      opacity: quality.dustOpacity,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const dust = new THREE.Points(dustGeo, dustMat);
    scene.add(dust);

    let targetRotX = 0;
    let targetRotY = 0;

    const onPointerMove = (e) => {
      if (!quality.interaction) return;
      const rect = canvas.getBoundingClientRect();
      if (rect.top > window.innerHeight) return;
      
      const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const ny = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      targetRotY = nx * 0.5;
      targetRotX = ny * 0.5;
    };
    const onPointerLeave = () => {
      targetRotX = 0;
      targetRotY = 0;
    };

    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerleave", onPointerLeave);
    localCleanups.push(() => {
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerleave", onPointerLeave);
    });

    const resize = () => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      if (!w || !h) return;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, quality.pixelRatio));
      renderer.setSize(w, h, false);
    };

    window.addEventListener("resize", resize);
    localCleanups.push(() => window.removeEventListener("resize", resize));

    const visibilityObserver = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        inView = !!entry?.isIntersecting;
        if (inView && pageVisible && !loopRunning && !disposed) {
          loopRunning = true;
          rafId = requestAnimationFrame(animate);
        }
      },
      { threshold: 0.08 },
    );
    visibilityObserver.observe(canvas);
    localCleanups.push(() => visibilityObserver.disconnect());

    const onVisibilityChange = () => {
      pageVisible = !document.hidden;
      if (pageVisible && inView && !loopRunning && !disposed) {
        loopRunning = true;
        rafId = requestAnimationFrame(animate);
      }
    };
    document.addEventListener("visibilitychange", onVisibilityChange);
    localCleanups.push(() => document.removeEventListener("visibilitychange", onVisibilityChange));

    const clock = new THREE.Clock();
    let time = 0;
    let renderAccumulator = 0;
    let petalAccumulator = 0;

    const updatePetals = () => {
      const positions = petals.geometry.attributes.position.array;
      const baseInfo = petals.geometry.attributes.baseInfo.array;
      const bloom = Math.sin(time * 0.5) * 0.5 + 0.5;

      for (let i = 0; i < petalCount; i++) {
        const angle = baseInfo[i * 4];
        const r = baseInfo[i * 4 + 1];
        const layer = baseInfo[i * 4 + 2];
        const jitter = baseInfo[i * 4 + 3];
        const swirl = time * (0.2 - layer * 0.05);
        const curAngle = angle + swirl;
        const yOffset = Math.sin(r * 0.5 - time * 2) * quality.bloomHeight + layer * 2 * bloom;

        positions[i * 3] = Math.cos(curAngle) * r;
        positions[i * 3 + 1] = yOffset + jitter;
        positions[i * 3 + 2] = Math.sin(curAngle) * r;
      }

      petals.geometry.attributes.position.needsUpdate = true;
    };

    const animate = () => {
      if (disposed) return;
      if (!inView || !pageVisible) {
        loopRunning = false;
        return;
      }
      rafId = requestAnimationFrame(animate);

      const delta = Math.min(clock.getDelta(), 0.1);
      renderAccumulator += delta;
      if (renderAccumulator < quality.renderStep) {
        return;
      }
      const frameDelta = renderAccumulator;
      renderAccumulator = 0;
      time += frameDelta;
      petalAccumulator += frameDelta;

      const pulse = 1 + Math.sin(time * 2) * 0.2;
      core.scale.setScalar(pulse);
      core.rotation.y += frameDelta * 0.5;
      core.rotation.x += frameDelta * 0.3;

      if (petalAccumulator >= quality.petalStep) {
        petalAccumulator = 0;
        updatePetals();
      }

      scene.rotation.x += (targetRotX + 0.2 - scene.rotation.x) * quality.sceneEase;
      scene.rotation.y += (targetRotY - scene.rotation.y) * quality.sceneEase;

      dust.rotation.y += frameDelta * 0.05;
      dust.position.y = Math.sin(time * 0.2) * 2;

      renderer.render(scene, camera);
    };

    updatePetals();
    loopRunning = true;
    animate();

    window.contactCleanup = () => {
      disposed = true;
      localCleanups.forEach((c) => c());
      loopRunning = false;
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
      renderer.dispose();
      coreGeo.dispose();
      coreMat.dispose();
      petalGeo.dispose();
      petalMat.dispose();
      dustGeo.dispose();
      dustMat.dispose();
    };
  } catch (error) {
    console.error("Three.js contact failed; falling back.", error);
    window.contactCleanup = () => {};
  }
};

cleanups.push(() => heroCleanup());
cleanups.push(() => { if (window.contactCleanup) window.contactCleanup(); });

if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    const nextTheme = rootElement.dataset.theme === "light" ? "dark" : "light";
    rootElement.dataset.theme = nextTheme;
    window.localStorage.setItem("theme", nextTheme);
    syncPaletteFromTheme();
    updateThemeToggleLabel();
    setupHeroThree();
    setupContactThree();
  });
}

setupHeroThree();
setupContactThree();

document.querySelectorAll("[data-viz]").forEach((canvas) => {
  if (canvas === heroCanvas || canvas.dataset.viz === "contact") {
    return;
  }

  const key = canvas.dataset.viz;
  const drawer = drawers[key];

  if (drawer) {
    cleanups.push(setupCanvas(canvas, drawer));
  }
});

window.addEventListener("pagehide", () => {
  cleanups.forEach((cleanup) => cleanup());
});
