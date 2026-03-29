const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const ui = {
  score: document.getElementById("scoreValue"),
  cash: document.getElementById("cashValue"),
  bank: document.getElementById("bankValue"),
  danger: document.getElementById("dangerValue"),
  status: document.getElementById("statusText"),
  automationBadges: document.getElementById("automationBadges"),
  automationList: document.getElementById("automationList"),
  runShop: document.getElementById("runShop"),
  labShop: document.getElementById("labShop"),
  legend: document.getElementById("appleLegend"),
  overlay: document.getElementById("overlay"),
  restartButton: document.getElementById("restartButton"),
  pauseButton: document.getElementById("pauseButton"),
  offlineModal: document.getElementById("offlineModal"),
  offlineText: document.getElementById("offlineText"),
  offlineDismissButton: document.getElementById("offlineDismissButton"),
  appraisalValue: document.getElementById("appraisalValue"),
  sellHint: document.getElementById("sellHint"),
  sellButton: document.getElementById("sellButton"),
  devSpeedControls: document.getElementById("devSpeedControls"),
  menuTabs: document.getElementById("menuTabs"),
};

const WIDTH = canvas.width;
const HEIGHT = canvas.height;
const BASE_ORCHARD = {
  x: 110,
  y: 150,
  w: 680,
  h: 760,
};

const PHYSICS = {
  stepMs: 1000 / 60,
  gravity: 0.34,
  wallRestitution: 0.42,
  floorRestitution: 0.18,
};

const IS_DEV_HOST = window.location.hostname === "127.0.0.1";
const DEV_SPEED_OPTIONS = [1, 2, 4, 8];
const MENU_PANES = ["automation", "run", "lab", "ladder"];

const BALANCE = {
  version: 2,
  saveKey: "apple-idle-save-v2",
  legacySaveKey: "apple-idle-save-v1",
  sanityLevelCap: 1000000,
  baseDangerLimit: 120,
  seasonFrames: 75 * 60,
  autosaveFrames: 5 * 60,
  offlineCapSeconds: 8 * 60 * 60,
  baseDropInterval: 78,
  minDropInterval: 12,
  maxSpecialTotal: 0.30,
  sellGateFrames: 45 * 60,
  sellGateScore: 2500,
  sellGateApples: 18,
  sellGateTier: 6,
  redLineRatio: 0.068,
  redLineHoldFrames: 2 * 60,
  boxExpandFrames: 39,
  boxExpandStep: 0.06,
  spin: {
    closeFrames: 24,
    rotateFrames: 300,
    openFrames: 24,
  },
  conveyor: {
    width: 72,
    startXOffset: -42,
    startYOffset: -118,
    endXOffset: 236,
    endYOffset: -40,
    minFrames: 8,
    maxFrames: 24,
    slatGap: 22,
    slatSpeed: 4.2,
  },
  audio: {
    maxVoices: 18,
    minGapMs: 22,
    eventCooldownMs: {
      uiHover: 24,
      uiDenied: 110,
      uiConfirm: 36,
      uiPause: 80,
      uiRestart: 120,
      sell: 180,
      offlineDismiss: 120,
      dropRelease: 32,
      merge: 24,
      bomb: 80,
      prism: 70,
      spinnerStart: 260,
      spinnerEnd: 180,
      crateExpand: 130,
      gameOver: 220,
    },
  },
};

const RUN_UPGRADES = {
  dropMotor: {
    label: "Drop Motor",
    tag: "RUN",
    note: "드롭 주기를 줄여 벨트 투입 속도를 높입니다.",
  },
  crateExpansion: {
    label: "Crate Expansion",
    tag: "RUN",
    note: "상자 크기를 키워 버티는 시간을 늘립니다.",
  },
  bombSeeder: {
    label: "Bomb Seeder",
    tag: "RUN",
    note: "폭탄 사과 출현률을 장기적으로 밀어 올립니다.",
  },
  prismSeeder: {
    label: "Prism Seeder",
    tag: "RUN",
    note: "프리즘 사과를 섞어 상위 단계 도달을 앞당깁니다.",
  },
  shockEngine: {
    label: "Shock Engine",
    tag: "RUN",
    note: "폭탄의 흔들기 성능을 강화합니다.",
  },
  autoSpinner: {
    label: "Auto Spinner",
    tag: "RUN",
    note: "위험도가 치솟을 때 자동 회전을 더 빨리 꺼냅니다.",
  },
  valuePress: {
    label: "Value Press",
    tag: "RUN",
    note: "모든 점수와 런 자금 수급을 늘립니다.",
  },
  dropTier: {
    label: "Drop Tier",
    tag: "RUN",
    note: "매우 비싼 대가로 기본 드롭 사과 단계를 끌어올립니다.",
  },
};

const META_UPGRADES = {
  starterFund: {
    label: "Starter Fund",
    tag: "LAB",
    note: "새 런 시작 자금을 장기적으로 늘립니다.",
  },
  durableCrate: {
    label: "Durable Crate",
    tag: "LAB",
    note: "danger limit을 영구적으로 키웁니다.",
  },
  bombOrchard: {
    label: "Bomb Orchard",
    tag: "LAB",
    cap: 6,
    note: "폭탄 사과를 해금하고 기본 확률을 키웁니다.",
  },
  prismOrchard: {
    label: "Prism Orchard",
    tag: "LAB",
    cap: 5,
    note: "프리즘 사과를 해금하고 기본 확률을 키웁니다.",
  },
  expansionEngineering: {
    label: "Expansion Engineering",
    tag: "LAB",
    note: "상자 확장 비용 할인과 카메라 안정화를 제공합니다.",
  },
  offlineOrchard: {
    label: "Offline Orchard",
    tag: "LAB",
    note: "오프라인 은행 보상을 장기적으로 키웁니다.",
  },
  mergeLedger: {
    label: "Merge Ledger",
    tag: "LAB",
    note: "메타 단계의 영구 가치 계수를 올립니다.",
  },
};

const SPECIAL_TYPES = {
  bomb: {
    name: "폭탄사과",
    shortLabel: "BOMB",
    accent: "#ff6b39",
    glow: "rgba(255, 120, 70, 0.9)",
  },
  prism: {
    name: "프리즘사과",
    shortLabel: "PRISM",
    accent: "#7a6bff",
    glow: "rgba(127, 226, 255, 0.95)",
  },
};

const APPLE_STAGE_NAMES = [
  "애기사과",
  "풋사과",
  "아오리",
  "홍로",
  "홍옥",
  "부사",
  "금홍",
  "루비",
  "자수정",
  "사파이어",
  "에메랄드",
  "문글로우",
  "선셋",
  "오로라",
  "네뷸라",
  "크라운",
  "미라지",
  "세라프",
  "천공",
  "월드트리",
];

const APPLE_STAGE_RADII = [
  20, 28, 37, 49, 64,
  82, 104, 130, 160, 195,
  236, 283, 337, 399, 470,
  551, 644, 720, 798, 878,
];

const APPLE_STAGE_HUES = [
  112, 96, 78, 58, 38,
  20, 6, 344, 322, 292,
  262, 236, 210, 188, 170,
  148, 128, 84, 48, 12,
];

const APPLE_TYPES = APPLE_STAGE_NAMES.map((name, index) => {
  const hue = APPLE_STAGE_HUES[index];
  const radius = APPLE_STAGE_RADII[index];
  const lightness = index < 5 ? 54 : index < 10 ? 57 : index < 15 ? 52 : 58;

  return {
    name,
    radius,
    color: `hsl(${hue} 82% ${lightness}%)`,
    highlight: `hsl(${hue} 95% ${Math.min(lightness + 27, 92)}%)`,
    shadow: `hsl(${hue} 72% ${Math.max(lightness - 24, 19)}%)`,
    leaf: `hsl(${(hue + 72) % 360} 44% 48%)`,
    points: 20 * (2 ** index),
  };
});

ctx.imageSmoothingEnabled = true;

const audioManager = createAudioManager();

let nextId = 1;
let state = createFreshState();
loadState();

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function softPow(n, k, p) {
  if (n <= 0) {
    return 0;
  }
  return k * Math.pow(n, p);
}

function sat(n, cap, rate) {
  if (n <= 0) {
    return 0;
  }
  return cap * (1 - Math.exp(-rate * n));
}

function safeRound(value) {
  if (!Number.isFinite(value)) {
    return Number.MAX_SAFE_INTEGER;
  }
  return Math.min(Number.MAX_SAFE_INTEGER, Math.round(value));
}

function costFormula(base, growth, n, softStart, curve) {
  const raw = base * Math.pow(growth, n) * Math.pow(1 + n / softStart, curve);
  return safeRound(raw);
}

function createAudioManager() {
  const manager = {
    context: null,
    master: null,
    limiter: null,
    unlocked: false,
    lastPlayAt: 0,
    lastEventAt: new Map(),
    activeVoices: new Set(),
  };

  function ensureContext() {
    if (manager.context) {
      return manager.context;
    }

    const AudioContextCtor = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextCtor) {
      return null;
    }

    const context = new AudioContextCtor();
    const limiter = context.createDynamicsCompressor();
    limiter.threshold.value = -18;
    limiter.knee.value = 18;
    limiter.ratio.value = 10;
    limiter.attack.value = 0.003;
    limiter.release.value = 0.16;

    const master = context.createGain();
    master.gain.value = 0.19;

    limiter.connect(master);
    master.connect(context.destination);

    manager.context = context;
    manager.master = master;
    manager.limiter = limiter;
    return context;
  }

  function unlock() {
    const context = ensureContext();
    if (!context) {
      return;
    }
    if (context.state === "suspended") {
      context.resume().catch(() => {});
    }
    manager.unlocked = true;
  }

  function cleanupVoice(voice) {
    if (!voice) {
      return;
    }
    manager.activeVoices.delete(voice);
    try {
      voice.oscillator.stop();
    } catch (_error) {
      // no-op
    }
    try {
      voice.oscillator.disconnect();
      voice.gain.disconnect();
      if (voice.filter) {
        voice.filter.disconnect();
      }
      if (voice.panner) {
        voice.panner.disconnect();
      }
    } catch (_error) {
      // no-op
    }
  }

  function trimVoices(now) {
    for (const voice of manager.activeVoices) {
      if (voice.endsAt <= now) {
        cleanupVoice(voice);
      }
    }

    if (manager.activeVoices.size <= BALANCE.audio.maxVoices) {
      return;
    }

    const overflow = Array.from(manager.activeVoices).sort((left, right) => left.endsAt - right.endsAt);
    while (manager.activeVoices.size > BALANCE.audio.maxVoices && overflow.length > 0) {
      cleanupVoice(overflow.shift());
    }
  }

  function canTriggerEvent(eventKey) {
    const cooldownMs = BALANCE.audio.eventCooldownMs[eventKey] || 0;
    const nowMs = performance.now();
    const lastAt = manager.lastEventAt.get(eventKey) || 0;
    if (cooldownMs > 0 && nowMs - lastAt < cooldownMs) {
      return false;
    }
    manager.lastEventAt.set(eventKey, nowMs);
    return true;
  }

  function startVoice(options) {
    const context = ensureContext();
    if (!context || !manager.master) {
      return;
    }

    const nowMs = performance.now();
    trimVoices(context.currentTime);

    if (nowMs - manager.lastPlayAt < BALANCE.audio.minGapMs) {
      return;
    }

    if (context.state === "suspended") {
      context.resume().catch(() => {});
    }

    manager.lastPlayAt = nowMs;

    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const filter = options.filterType ? context.createBiquadFilter() : null;
    const panner = typeof options.pan === "number" ? context.createStereoPanner() : null;

    oscillator.type = options.wave || "sine";
    oscillator.frequency.setValueAtTime(options.startFreq, context.currentTime);
    if (typeof options.endFreq === "number" && options.endFreq !== options.startFreq) {
      oscillator.frequency.exponentialRampToValueAtTime(
        Math.max(24, options.endFreq),
        context.currentTime + options.duration,
      );
    }

    const peak = clamp(typeof options.peak === "number" ? options.peak : 0.11, 0.01, 0.3);
    const attack = Math.max(0.001, typeof options.attack === "number" ? options.attack : 0.01);
    const release = Math.max(0.015, typeof options.release === "number" ? options.release : 0.08);
    const sustainLevel = clamp(typeof options.sustain === "number" ? options.sustain : peak * 0.55, 0.001, peak);
    const duration = Math.max(0.03, typeof options.duration === "number" ? options.duration : 0.12);

    gain.gain.setValueAtTime(0.0001, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(peak, context.currentTime + attack);
    gain.gain.exponentialRampToValueAtTime(sustainLevel, context.currentTime + Math.max(attack + 0.01, duration * 0.45));
    gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + duration + release);

    let node = oscillator;
    if (filter) {
      filter.type = options.filterType;
      filter.frequency.value = options.filterFreq || 1600;
      filter.Q.value = options.filterQ || 1;
      node.connect(filter);
      node = filter;
    }

    if (panner) {
      panner.pan.value = clamp(options.pan, -1, 1);
      node.connect(panner);
      node = panner;
    }

    node.connect(gain);
    gain.connect(manager.limiter);

    const voice = {
      oscillator,
      gain,
      filter,
      panner,
      endsAt: context.currentTime + duration + release + 0.03,
    };
    manager.activeVoices.add(voice);

    oscillator.start(context.currentTime);
    oscillator.stop(voice.endsAt);
    oscillator.onended = () => cleanupVoice(voice);
  }

  function playSequence(sequence, baseDelay) {
    const steps = sequence || [];
    const startDelay = baseDelay || 0;
    steps.forEach((step) => {
      window.setTimeout(() => {
        startVoice(step);
      }, startDelay + (step.delayMs || 0));
    });
  }

  function play(eventKey, data) {
    unlock();
    if (!canTriggerEvent(eventKey)) {
      return;
    }
    const detail = data || {};

    switch (eventKey) {
      case "ui-hover":
        playSequence([
          {
            wave: "triangle",
            startFreq: 780,
            endFreq: 920,
            duration: 0.045,
            release: 0.04,
            peak: 0.045,
            filterType: "highpass",
            filterFreq: 420,
          },
        ]);
        break;
      case "ui-denied":
        playSequence([
          {
            wave: "sawtooth",
            startFreq: 230,
            endFreq: 138,
            duration: 0.09,
            release: 0.07,
            peak: 0.07,
            filterType: "lowpass",
            filterFreq: 900,
          },
        ]);
        break;
      case "ui-confirm":
        playSequence([
          {
            wave: "triangle",
            startFreq: 460,
            endFreq: 620,
            duration: 0.08,
            release: 0.06,
            peak: 0.06,
          },
          {
            wave: "sine",
            startFreq: 690,
            endFreq: 840,
            duration: 0.07,
            release: 0.05,
            peak: 0.035,
            delayMs: 28,
          },
        ]);
        break;
      case "pause":
        playSequence([
          {
            wave: "square",
            startFreq: detail.paused ? 420 : 520,
            endFreq: detail.paused ? 310 : 740,
            duration: 0.08,
            release: 0.08,
            peak: 0.055,
          },
        ]);
        break;
      case "restart":
        playSequence([
          {
            wave: "triangle",
            startFreq: 280,
            endFreq: 520,
            duration: 0.1,
            release: 0.09,
            peak: 0.07,
          },
          {
            wave: "sine",
            startFreq: 630,
            endFreq: 910,
            duration: 0.08,
            release: 0.07,
            peak: 0.045,
            delayMs: 34,
          },
        ]);
        break;
      case "sell":
        playSequence([
          {
            wave: "triangle",
            startFreq: 350,
            endFreq: 640,
            duration: 0.1,
            release: 0.08,
            peak: 0.07,
          },
          {
            wave: "triangle",
            startFreq: 700,
            endFreq: 1040,
            duration: 0.08,
            release: 0.07,
            peak: 0.05,
            delayMs: 58,
          },
          {
            wave: "sine",
            startFreq: 1120,
            endFreq: 1420,
            duration: 0.06,
            release: 0.06,
            peak: 0.03,
            delayMs: 112,
          },
        ]);
        break;
      case "offline-dismiss":
        playSequence([
          {
            wave: "triangle",
            startFreq: 520,
            endFreq: 760,
            duration: 0.07,
            release: 0.05,
            peak: 0.05,
          },
        ]);
        break;
      case "drop-release":
        playSequence([
          {
            wave: "sine",
            startFreq: 240 + (detail.level || 0) * 12,
            endFreq: 170 + (detail.level || 0) * 8,
            duration: 0.05,
            release: 0.05,
            peak: 0.04,
            filterType: "lowpass",
            filterFreq: 880,
          },
        ]);
        break;
      case "merge":
        playSequence([
          {
            wave: "triangle",
            startFreq: 280 + Math.min(18, detail.level || 0) * 26,
            endFreq: 520 + Math.min(18, detail.level || 0) * 38,
            duration: 0.09,
            release: 0.08,
            peak: clamp(0.055 + (detail.level || 0) * 0.002, 0.05, 0.1),
          },
          {
            wave: "sine",
            startFreq: 620 + Math.min(18, detail.level || 0) * 22,
            endFreq: 940 + Math.min(18, detail.level || 0) * 30,
            duration: 0.07,
            release: 0.06,
            peak: 0.028,
            delayMs: 30,
          },
        ]);
        break;
      case "bomb":
        playSequence([
          {
            wave: "sawtooth",
            startFreq: 120,
            endFreq: 62,
            duration: 0.16,
            release: 0.12,
            peak: 0.12,
            filterType: "lowpass",
            filterFreq: 520,
          },
          {
            wave: "triangle",
            startFreq: 220,
            endFreq: 98,
            duration: 0.2,
            release: 0.14,
            peak: 0.08,
            delayMs: 24,
          },
        ]);
        break;
      case "prism":
        playSequence([
          {
            wave: "triangle",
            startFreq: 560,
            endFreq: 1180,
            duration: 0.14,
            release: 0.1,
            peak: 0.065,
            filterType: "highpass",
            filterFreq: 420,
          },
          {
            wave: "sine",
            startFreq: 880,
            endFreq: 1540,
            duration: 0.12,
            release: 0.08,
            peak: 0.038,
            delayMs: 42,
          },
        ]);
        break;
      case "spinner-start":
        playSequence([
          {
            wave: "square",
            startFreq: 210,
            endFreq: 420,
            duration: 0.12,
            release: 0.1,
            peak: 0.06,
          },
          {
            wave: "triangle",
            startFreq: 520,
            endFreq: 760,
            duration: 0.12,
            release: 0.1,
            peak: 0.045,
            delayMs: 80,
          },
        ]);
        break;
      case "spinner-end":
        playSequence([
          {
            wave: "triangle",
            startFreq: 340,
            endFreq: 620,
            duration: 0.08,
            release: 0.08,
            peak: 0.05,
          },
          {
            wave: "sine",
            startFreq: 700,
            endFreq: 980,
            duration: 0.06,
            release: 0.06,
            peak: 0.03,
            delayMs: 28,
          },
        ]);
        break;
      case "crate-expand":
        playSequence([
          {
            wave: "triangle",
            startFreq: 250,
            endFreq: 410,
            duration: 0.11,
            release: 0.11,
            peak: 0.07,
          },
          {
            wave: "sine",
            startFreq: 520,
            endFreq: 760,
            duration: 0.08,
            release: 0.08,
            peak: 0.035,
            delayMs: 48,
          },
        ]);
        break;
      case "game-over":
        playSequence([
          {
            wave: "sawtooth",
            startFreq: 300,
            endFreq: 112,
            duration: 0.24,
            release: 0.16,
            peak: 0.09,
            filterType: "lowpass",
            filterFreq: 760,
          },
          {
            wave: "triangle",
            startFreq: 188,
            endFreq: 84,
            duration: 0.2,
            release: 0.14,
            peak: 0.055,
            delayMs: 52,
          },
        ]);
        break;
      default:
        break;
    }
  }

  return {
    unlock,
    play,
  };
}

function formatNumber(value) {
  return new Intl.NumberFormat("ko-KR").format(Math.round(value));
}

function formatPercent(value) {
  return `${(value * 100).toFixed(value >= 0.1 ? 1 : 2)}%`;
}

function formatSeconds(seconds) {
  return `${seconds.toFixed(seconds < 10 ? 2 : 1)}s`;
}

function formatDuration(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds % 60);
  if (minutes <= 0) {
    return `${seconds}s`;
  }
  return `${minutes}m ${String(seconds).padStart(2, "0")}s`;
}

function emptyUpgradeLevels(definitions) {
  return Object.keys(definitions).reduce((levels, key) => {
    levels[key] = 0;
    return levels;
  }, {});
}

function getDefaultMenuPane() {
  return "run";
}

function sanitizeDevSpeed(speed) {
  if (!IS_DEV_HOST) {
    return 1;
  }
  const parsed = Number(speed) || 1;
  return DEV_SPEED_OPTIONS.includes(parsed) ? parsed : 1;
}

function sanitizeMenuPane(menu) {
  return MENU_PANES.includes(menu) ? menu : getDefaultMenuPane();
}

function createMetaState() {
  return {
    balanceVersion: BALANCE.version,
    bank: 0,
    bestScore: 0,
    upgrades: emptyUpgradeLevels(META_UPGRADES),
    stats: {
      runs: 0,
      soldRuns: 0,
      failedRuns: 0,
      totalBankEarned: 0,
      totalOfflineBank: 0,
      totalAppraisalGain: 0,
      totalScoreEarned: 0,
      lastRunScore: 0,
      lastRunSurvivalFrames: 0,
      lastRunTopTier: -1,
      lastSaleAppraisal: 0,
    },
  };
}

function createRunState(meta) {
  const run = {
    alive: true,
    exitReason: "",
    score: 0,
    cash: getStarterCash(meta),
    upgrades: emptyUpgradeLevels(RUN_UPGRADES),
    drops: 0,
    merges: 0,
    topTier: -1,
    dangerFrames: 0,
    dangerRatio: 0,
    redLineFrames: 0,
    elapsedFrames: 0,
    season: 0,
    boxScale: 1,
    targetBoxScale: 1,
    sellPreview: 0,
    timers: {
      drop: 24,
      autoSpinCooldown: 0,
      autosave: BALANCE.autosaveFrames,
    },
  };

  run.targetBoxScale = getBoxScaleForLevel(run.upgrades.crateExpansion);
  run.boxScale = run.targetBoxScale;
  return run;
}

function createFreshState() {
  const meta = createMetaState();
  return {
    meta,
    run: createRunState(meta),
    apples: [],
    particles: [],
    shockwaves: [],
    floatingTexts: [],
    infeed: null,
    paused: false,
    hiddenAt: null,
    devSpeed: 1,
    activeMenu: getDefaultMenuPane(),
    shake: 0,
    time: 0,
    beltTime: 0,
    accumulator: 0,
    lastTimestamp: 0,
    screenFlash: 0,
    screenFlashColor: "rgba(255, 255, 255, 0.9)",
    spin: {
      phase: "idle",
      frame: 0,
      angle: 0,
      lidProgress: 0,
    },
    boxAnimation: {
      active: false,
      frame: 0,
      from: 1,
      to: 1,
      pulse: 0,
    },
    offlineSummary: null,
    uiSnapshot: "",
    automationSnapshot: "",
    badgeSnapshot: "",
    runShopSnapshot: "",
    labShopSnapshot: "",
    controlSnapshot: "",
    lastSeenAt: Date.now(),
  };
}

function getDefinitionCap(definition) {
  if (typeof definition.cap === "number") {
    return definition.cap;
  }
  return BALANCE.sanityLevelCap;
}

function sanitizeUpgrades(rawLevels, definitions) {
  const levels = emptyUpgradeLevels(definitions);
  if (!rawLevels || typeof rawLevels !== "object") {
    return levels;
  }

  Object.keys(definitions).forEach((key) => {
    const definition = definitions[key];
    levels[key] = clamp(Number(rawLevels[key]) || 0, 0, getDefinitionCap(definition));
  });

  return levels;
}

function createApple(level, x, y, options) {
  const config = options || {};
  const appleType = APPLE_TYPES[level];
  return {
    id: nextId++,
    level,
    special: config.special || null,
    x,
    y,
    r: appleType.radius,
    vx: config.vx || (Math.random() - 0.5) * 0.5,
    vy: typeof config.vy === "number" ? config.vy : (config.fromMerge ? -4.6 : 0),
    spin: typeof config.spin === "number" ? config.spin : Math.random() * Math.PI * 2,
    spinVelocity: typeof config.spinVelocity === "number" ? config.spinVelocity : (Math.random() - 0.5) * 0.03,
    age: config.age || 0,
    dangerHoldFrames: config.dangerHoldFrames || 0,
  };
}

function sanitizeMeta(rawMeta) {
  const meta = createMetaState();
  if (!rawMeta || typeof rawMeta !== "object") {
    return meta;
  }

  meta.balanceVersion = rawMeta.balanceVersion || BALANCE.version;
  meta.bank = Math.max(0, Number(rawMeta.bank) || 0);
  meta.bestScore = Math.max(0, Number(rawMeta.bestScore) || 0);
  meta.upgrades = sanitizeUpgrades(rawMeta.upgrades, META_UPGRADES);

  if (rawMeta.stats && typeof rawMeta.stats === "object") {
    meta.stats.runs = Math.max(0, Number(rawMeta.stats.runs) || 0);
    meta.stats.soldRuns = Math.max(0, Number(rawMeta.stats.soldRuns) || 0);
    meta.stats.failedRuns = Math.max(0, Number(rawMeta.stats.failedRuns) || 0);
    meta.stats.totalBankEarned = Math.max(0, Number(rawMeta.stats.totalBankEarned) || 0);
    meta.stats.totalOfflineBank = Math.max(0, Number(rawMeta.stats.totalOfflineBank) || 0);
    meta.stats.totalAppraisalGain = Math.max(0, Number(rawMeta.stats.totalAppraisalGain) || 0);
    meta.stats.totalScoreEarned = Math.max(0, Number(rawMeta.stats.totalScoreEarned) || 0);
    meta.stats.lastRunScore = Math.max(0, Number(rawMeta.stats.lastRunScore) || 0);
    meta.stats.lastRunSurvivalFrames = Math.max(0, Number(rawMeta.stats.lastRunSurvivalFrames) || 0);
    meta.stats.lastRunTopTier = clamp(Number(rawMeta.stats.lastRunTopTier) || -1, -1, APPLE_TYPES.length - 1);
    meta.stats.lastSaleAppraisal = Math.max(0, Number(rawMeta.stats.lastSaleAppraisal) || 0);
  }

  return meta;
}

function sanitizeRun(rawRun, meta) {
  const run = createRunState(meta);
  if (!rawRun || typeof rawRun !== "object") {
    return run;
  }

  run.alive = rawRun.alive !== false;
  run.exitReason = rawRun.exitReason === "sold" || rawRun.exitReason === "game_over" ? rawRun.exitReason : "";
  run.score = Math.max(0, Number(rawRun.score) || 0);
  run.cash = Math.max(0, Number(rawRun.cash) || 0);
  run.upgrades = sanitizeUpgrades(rawRun.upgrades, RUN_UPGRADES);
  run.drops = Math.max(0, Number(rawRun.drops) || 0);
  run.merges = Math.max(0, Number(rawRun.merges) || 0);
  run.topTier = clamp(Number(rawRun.topTier) || -1, -1, APPLE_TYPES.length - 1);
  run.dangerFrames = Math.max(0, Number(rawRun.dangerFrames) || 0);
  run.dangerRatio = clamp(Number(rawRun.dangerRatio) || 0, 0, 2);
  run.redLineFrames = Math.max(0, Number(rawRun.redLineFrames) || 0);
  run.elapsedFrames = Math.max(0, Number(rawRun.elapsedFrames) || 0);
  run.season = Math.floor(run.elapsedFrames / BALANCE.seasonFrames);
  run.targetBoxScale = getBoxScaleForLevel(run.upgrades.crateExpansion);
  run.boxScale = clamp(Number(rawRun.boxScale) || run.targetBoxScale, 1, Math.max(1, run.targetBoxScale));
  run.sellPreview = Math.max(0, Number(rawRun.sellPreview) || 0);

  if (rawRun.timers && typeof rawRun.timers === "object") {
    run.timers.drop = Math.max(0, Number(rawRun.timers.drop) || 0);
    run.timers.autoSpinCooldown = Math.max(0, Number(rawRun.timers.autoSpinCooldown) || 0);
    run.timers.autosave = BALANCE.autosaveFrames;
  }

  return run;
}

function sanitizeApples(rawApples) {
  if (!Array.isArray(rawApples)) {
    return [];
  }

  return rawApples.map((rawApple) => {
    const level = clamp(Number(rawApple.level) || 0, 0, APPLE_TYPES.length - 1);
    const special = rawApple.special === "bomb" || rawApple.special === "prism" ? rawApple.special : null;
    const apple = createApple(level, Number(rawApple.x) || BASE_ORCHARD.x, Number(rawApple.y) || BASE_ORCHARD.y, {
      special,
      vx: Number(rawApple.vx) || 0,
      vy: Number(rawApple.vy) || 0,
      spin: Number(rawApple.spin) || 0,
      spinVelocity: Number(rawApple.spinVelocity) || 0,
      age: Math.max(0, Number(rawApple.age) || 0),
      dangerHoldFrames: Math.max(0, Number(rawApple.dangerHoldFrames) || 0),
    });
    apple.id = Math.max(1, Number(rawApple.id) || apple.id);
    return apple;
  });
}

function sanitizeInfeed(rawInfeed) {
  if (!rawInfeed || typeof rawInfeed !== "object") {
    return null;
  }

  return {
    level: clamp(Number(rawInfeed.level) || 0, 0, APPLE_TYPES.length - 1),
    special: rawInfeed.special === "bomb" || rawInfeed.special === "prism" ? rawInfeed.special : null,
    frame: Math.max(0, Number(rawInfeed.frame) || 0),
    beltFrames: Math.max(BALANCE.conveyor.minFrames, Number(rawInfeed.beltFrames) || BALANCE.conveyor.minFrames),
  };
}

function serializeApple(apple) {
  return {
    id: apple.id,
    level: apple.level,
    special: apple.special,
    x: apple.x,
    y: apple.y,
    vx: apple.vx,
    vy: apple.vy,
    spin: apple.spin,
    spinVelocity: apple.spinVelocity,
    age: apple.age,
    dangerHoldFrames: apple.dangerHoldFrames,
  };
}

function serializeInfeed() {
  if (!state.infeed) {
    return null;
  }

  return {
    level: state.infeed.level,
    special: state.infeed.special,
    frame: state.infeed.frame,
    beltFrames: state.infeed.beltFrames,
  };
}

function saveState() {
  state.lastSeenAt = Date.now();

  const payload = {
    meta: state.meta,
    run: {
      alive: state.run.alive,
      exitReason: state.run.exitReason,
      score: state.run.score,
      cash: state.run.cash,
      upgrades: state.run.upgrades,
      drops: state.run.drops,
      merges: state.run.merges,
      topTier: state.run.topTier,
      dangerFrames: state.run.dangerFrames,
      dangerRatio: state.run.dangerRatio,
      redLineFrames: state.run.redLineFrames,
      elapsedFrames: state.run.elapsedFrames,
      boxScale: state.run.boxScale,
      sellPreview: state.run.sellPreview,
      timers: state.run.timers,
      apples: state.apples.map(serializeApple),
      infeed: serializeInfeed(),
    },
    lastSeenAt: state.lastSeenAt,
  };

  try {
    localStorage.setItem(BALANCE.saveKey, JSON.stringify(payload));
  } catch (error) {
    // Ignore storage failures.
  }
}

function migrateLegacySave(parsed) {
  const migrated = {
    meta: parsed.meta || {},
    run: parsed.run || {},
    lastSeenAt: parsed.lastSeenAt || Date.now(),
  };

  if (!migrated.meta.stats) {
    migrated.meta.stats = {};
  }

  if (!migrated.run.upgrades) {
    migrated.run.upgrades = {};
  }

  if (typeof migrated.run.upgrades.dropTier !== "number") {
    migrated.run.upgrades.dropTier = 0;
  }

  migrated.run.exitReason = "";
  migrated.run.sellPreview = 0;
  migrated.run.infeed = null;
  migrated.meta.balanceVersion = BALANCE.version;
  migrated.meta.stats.soldRuns = migrated.meta.stats.soldRuns || 0;
  migrated.meta.stats.failedRuns = migrated.meta.stats.failedRuns || 0;
  migrated.meta.stats.totalAppraisalGain = migrated.meta.stats.totalAppraisalGain || 0;
  migrated.meta.stats.lastSaleAppraisal = migrated.meta.stats.lastSaleAppraisal || 0;

  return migrated;
}

function loadState() {
  let parsed = null;
  let usedLegacy = false;

  try {
    const raw = localStorage.getItem(BALANCE.saveKey);
    if (raw) {
      parsed = JSON.parse(raw);
    } else {
      const legacyRaw = localStorage.getItem(BALANCE.legacySaveKey);
      if (legacyRaw) {
        parsed = migrateLegacySave(JSON.parse(legacyRaw));
        usedLegacy = true;
      }
    }
  } catch (error) {
    parsed = null;
  }

  if (!parsed) {
    buildLegend();
    syncUi(true);
    return;
  }

  const fresh = createFreshState();
  fresh.meta = sanitizeMeta(parsed.meta);
  fresh.run = sanitizeRun(parsed.run, fresh.meta);
  fresh.apples = sanitizeApples(parsed.run && parsed.run.apples);
  fresh.infeed = sanitizeInfeed(parsed.run && parsed.run.infeed);
  fresh.lastSeenAt = Date.now();

  nextId = fresh.apples.reduce((highest, apple) => Math.max(highest, apple.id), 0) + 1;
  state = fresh;
  state.run.sellPreview = getAppraisalValue();

  const savedAt = Number(parsed.lastSeenAt) || 0;
  const elapsedSeconds = clamp((Date.now() - savedAt) / 1000, 0, BALANCE.offlineCapSeconds);
  if (elapsedSeconds > 0.5) {
    const gain = applyOfflineGain(elapsedSeconds);
    if (gain > 0) {
      state.offlineSummary = {
        elapsedSeconds,
        gain,
      };
    }
  }

  if (!state.run.alive) {
    showRunResultOverlay(state.run.exitReason || "game_over", state.run.sellPreview, Math.round(state.run.score + (state.run.exitReason === "sold" ? state.run.sellPreview : 0)));
  }

  if (usedLegacy) {
    saveState();
  }

  buildLegend();
  syncUi(true);
}

function getStarterCash(meta) {
  const level = meta ? meta.upgrades.starterFund : state.meta.upgrades.starterFund;
  if (level <= 0) {
    return 0;
  }
  return safeRound(40 * Math.pow(level, 0.9));
}

function getDangerLimit(meta) {
  const level = meta ? meta.upgrades.durableCrate : state.meta.upgrades.durableCrate;
  if (level <= 0) {
    return BALANCE.baseDangerLimit;
  }
  return BALANCE.baseDangerLimit + safeRound(6 * Math.pow(level, 0.92));
}

function getRedLineRecoveryFrames(meta) {
  const level = meta ? meta.upgrades.durableCrate : state.meta.upgrades.durableCrate;
  return 3 + Math.floor(level * 0.35);
}

function getExpansionDiscount(meta) {
  const level = meta ? meta.upgrades.expansionEngineering : state.meta.upgrades.expansionEngineering;
  return Math.min(0.55, softPow(level, 0.04, 0.78));
}

function getExpansionDiscountFactor(meta) {
  return 1 - getExpansionDiscount(meta);
}

function getCameraExponent(meta) {
  const level = meta ? meta.upgrades.expansionEngineering : state.meta.upgrades.expansionEngineering;
  return Math.max(0.44, 0.72 - softPow(level, 0.02, 0.65));
}

function getOfflineMultiplier(meta) {
  const level = meta ? meta.upgrades.offlineOrchard : state.meta.upgrades.offlineOrchard;
  return 1 + softPow(level, 0.18, 0.82);
}

function getMetaValueMultiplier(meta) {
  const level = meta ? meta.upgrades.mergeLedger : state.meta.upgrades.mergeLedger;
  return 1 + softPow(level, 0.06, 0.9);
}

function getBoxScaleForLevel(level) {
  return 1 + softPow(level, 0.052, 0.88);
}

function getRunValueMultiplier(run) {
  const currentRun = run || state.run;
  return 1 + softPow(currentRun.upgrades.valuePress, 0.14, 0.88);
}

function getCombinedValueMultiplier(meta, run) {
  return getMetaValueMultiplier(meta) * getRunValueMultiplier(run);
}

function getSeasonFactor(season) {
  return Math.max(0.38, Math.pow(0.97, season));
}

function getSeasonHazard(season) {
  return 1 + 0.06 * Math.pow(season, 1.18);
}

function getDropIntervalFrames(run) {
  const currentRun = run || state.run;
  const seasonFactor = getSeasonFactor(currentRun.season);
  const divisor = 1 + softPow(currentRun.upgrades.dropMotor, 0.11, 0.82);
  return Math.max(BALANCE.minDropInterval, safeRound(BALANCE.baseDropInterval * seasonFactor / divisor));
}

function getDropTierReal(run) {
  const currentRun = run || state.run;
  return clamp(1.4 * Math.log(1 + currentRun.upgrades.dropTier), 0, APPLE_TYPES.length - 1.001);
}

function getDropTierInfo(run) {
  const tierReal = getDropTierReal(run);
  const base = Math.floor(tierReal);
  const nextChance = tierReal - base;
  return {
    tierReal,
    base,
    nextChance,
  };
}

function getShockMultiplier(run) {
  const currentRun = run || state.run;
  return 1 + softPow(currentRun.upgrades.shockEngine, 0.2, 0.78);
}

function getRunBombChance(run) {
  const currentRun = run || state.run;
  return sat(currentRun.upgrades.bombSeeder, 0.18, 0.035);
}

function getRunPrismChance(run) {
  const currentRun = run || state.run;
  return sat(currentRun.upgrades.prismSeeder, 0.08, 0.028);
}

function getBaseBombChance(meta) {
  const currentMeta = meta || state.meta;
  const level = currentMeta.upgrades.bombOrchard;
  if (level <= 0) {
    return 0;
  }
  return 0.005 + sat(level - 1, 0.025, 0.32);
}

function getBasePrismChance(meta) {
  const currentMeta = meta || state.meta;
  const level = currentMeta.upgrades.prismOrchard;
  if (level <= 0) {
    return 0;
  }
  return 0.002 + sat(level - 1, 0.012, 0.28);
}

function getSpecialChances(meta, run) {
  let bomb = getBaseBombChance(meta) + getRunBombChance(run);
  let prism = getBasePrismChance(meta) + getRunPrismChance(run);
  const total = bomb + prism;

  if (total > BALANCE.maxSpecialTotal && total > 0) {
    const scale = BALANCE.maxSpecialTotal / total;
    bomb *= scale;
    prism *= scale;
  }

  return {
    bomb,
    prism,
  };
}

function getAutoSpinnerSpec(run) {
  const currentRun = run || state.run;
  const level = currentRun.upgrades.autoSpinner;
  if (level <= 0) {
    return null;
  }

  const threshold = Math.max(0.4, 0.88 - sat(level, 0.48, 0.22));
  const cooldownSeconds = Math.max(9, 48 / (1 + softPow(level, 0.26, 0.72)));
  return {
    threshold,
    cooldownSeconds,
    cooldownFrames: Math.round(cooldownSeconds * 60),
  };
}

function getOfflineRatePerSecond(meta) {
  const currentMeta = meta || state.meta;
  const specialBoost = 1 + getBaseBombChance(currentMeta) * 4 + getBasePrismChance(currentMeta) * 6;
  return 3 * getOfflineMultiplier(currentMeta) * getMetaValueMultiplier(currentMeta) * specialBoost;
}

function getRunUpgradeCost(key, level, meta) {
  const targetLevel = typeof level === "number" ? level : state.run.upgrades[key];
  const currentMeta = meta || state.meta;

  switch (key) {
    case "dropMotor":
      return costFormula(30, 1.18, targetLevel, 8, 1.25);
    case "crateExpansion":
      return safeRound(costFormula(120, 1.22, targetLevel, 7, 1.3) * getExpansionDiscountFactor(currentMeta));
    case "bombSeeder":
      return costFormula(90, 1.2, targetLevel, 8, 1.25);
    case "prismSeeder":
      return costFormula(160, 1.24, targetLevel, 8, 1.3);
    case "shockEngine":
      return costFormula(110, 1.21, targetLevel, 8, 1.25);
    case "autoSpinner":
      return costFormula(220, 1.27, targetLevel, 6, 1.4);
    case "valuePress":
      return costFormula(70, 1.19, targetLevel, 8, 1.25);
    case "dropTier":
      return costFormula(4000, 3.25, targetLevel, 4, 2.4);
    default:
      return Number.MAX_SAFE_INTEGER;
  }
}

function getMetaUpgradeCost(key, level) {
  const targetLevel = typeof level === "number" ? level : state.meta.upgrades[key];

  switch (key) {
    case "starterFund":
      return costFormula(250, 1.2, targetLevel, 10, 1.18);
    case "durableCrate":
      return costFormula(320, 1.23, targetLevel, 10, 1.22);
    case "bombOrchard":
      return safeRound(420 * Math.pow(1.82, targetLevel));
    case "prismOrchard":
      return safeRound(700 * Math.pow(1.95, targetLevel));
    case "expansionEngineering":
      return costFormula(520, 1.24, targetLevel, 8, 1.28);
    case "offlineOrchard":
      return costFormula(380, 1.22, targetLevel, 9, 1.2);
    case "mergeLedger":
      return costFormula(460, 1.23, targetLevel, 9, 1.22);
    default:
      return Number.MAX_SAFE_INTEGER;
  }
}

function getOrchardBounds(scaleValue) {
  const scale = scaleValue || state.run.boxScale;
  const baseCenterX = BASE_ORCHARD.x + BASE_ORCHARD.w / 2;
  const baseBottom = BASE_ORCHARD.y + BASE_ORCHARD.h;
  const w = BASE_ORCHARD.w * scale;
  const h = BASE_ORCHARD.h * scale;
  const x = baseCenterX - w / 2;
  const y = baseBottom - h;

  return {
    x,
    y,
    w,
    h,
    bottom: y + h,
    centerX: x + w / 2,
    centerY: y + h / 2,
    dangerY: y + h * 0.138,
    redLineY: y + h * BALANCE.redLineRatio,
    rimY: y + h * 0.024,
    spawnY: y - h * 0.01,
  };
}

function getViewportAnchor() {
  return {
    centerX: BASE_ORCHARD.x + BASE_ORCHARD.w / 2,
    centerY: BASE_ORCHARD.y + BASE_ORCHARD.h / 2,
  };
}

function getCameraScale() {
  const orchard = getOrchardBounds();
  const formulaScale = Math.min(1, 1 / Math.pow(state.run.boxScale, getCameraExponent()));
  const safeScaleX = (WIDTH - 64) / (orchard.w + 88);
  const safeScaleY = (HEIGHT - 64) / (orchard.h + 132);
  return Math.min(1, formulaScale, safeScaleX, safeScaleY);
}

function getHorizontalBounds(radius) {
  const orchard = getOrchardBounds();
  const minX = orchard.x + radius + 8;
  const maxX = orchard.x + orchard.w - radius - 8;

  if (minX > maxX) {
    return {
      minX: orchard.centerX,
      maxX: orchard.centerX,
    };
  }

  return {
    minX,
    maxX,
  };
}

function getConveyorGeometry() {
  const orchard = getOrchardBounds(1);
  return {
    startX: orchard.x + BALANCE.conveyor.startXOffset,
    startY: orchard.y + BALANCE.conveyor.startYOffset,
    endX: orchard.x + BALANCE.conveyor.endXOffset,
    endY: orchard.y + BALANCE.conveyor.endYOffset,
    width: BALANCE.conveyor.width,
  };
}

function getBeltFrames(interval) {
  return clamp(Math.round(interval * 0.45), BALANCE.conveyor.minFrames, BALANCE.conveyor.maxFrames);
}

function applyOfflineGain(elapsedSeconds) {
  const cappedSeconds = clamp(elapsedSeconds, 0, BALANCE.offlineCapSeconds);
  if (cappedSeconds <= 0) {
    return 0;
  }

  const gain = safeRound(cappedSeconds * getOfflineRatePerSecond());
  if (gain <= 0) {
    return 0;
  }

  state.meta.bank += gain;
  state.meta.stats.totalOfflineBank += gain;
  return gain;
}

function dismissOfflineModal() {
  state.offlineSummary = null;
  ui.offlineModal.classList.add("hidden");
  audioManager.play("offline-dismiss");
  saveState();
}

function resetTransientEffects() {
  state.particles = [];
  state.shockwaves = [];
  state.floatingTexts = [];
  state.shake = 0;
  state.screenFlash = 0;
  state.infeed = null;
  state.spin.phase = "idle";
  state.spin.frame = 0;
  state.spin.angle = 0;
  state.spin.lidProgress = 0;
  state.boxAnimation.active = false;
  state.boxAnimation.frame = 0;
  state.boxAnimation.from = state.run.boxScale;
  state.boxAnimation.to = state.run.boxScale;
  state.boxAnimation.pulse = 0;
}

function startNewRun() {
  state.run = createRunState(state.meta);
  state.apples = [];
  state.paused = false;
  state.run.sellPreview = 0;
  resetTransientEffects();
  hideOverlay();
  audioManager.play("restart");
  syncUi(true);
  saveState();
}

function getAppraisalMultiplier(level) {
  return clamp(0.16 + 0.025 * Math.sqrt(level + 1), 0.16, 0.42);
}

function getAppraisalValue(apples) {
  const source = apples || state.apples;
  return safeRound(source.reduce((total, apple) => {
    return total + APPLE_TYPES[apple.level].points * getAppraisalMultiplier(apple.level);
  }, 0));
}

function canSellCrate() {
  if (!state.run.alive) {
    return false;
  }

  const topTier = state.apples.reduce((highest, apple) => Math.max(highest, apple.level), state.run.topTier);
  if (state.run.elapsedFrames < BALANCE.sellGateFrames) {
    return false;
  }

  return (
    state.run.score >= BALANCE.sellGateScore
    || state.apples.length >= BALANCE.sellGateApples
    || topTier >= BALANCE.sellGateTier
  );
}

function getSellGateText() {
  if (!state.run.alive) {
    return "런이 종료되었습니다.";
  }

  if (canSellCrate()) {
    return `지금 매각 시 은행 +${formatNumber(state.run.score + state.run.sellPreview)}`;
  }

  const secondsLeft = Math.max(0, Math.ceil((BALANCE.sellGateFrames - state.run.elapsedFrames) / 60));
  const remainingScore = Math.max(0, BALANCE.sellGateScore - state.run.score);
  const remainingApples = Math.max(0, BALANCE.sellGateApples - state.apples.length);
  const remainingTier = Math.max(0, BALANCE.sellGateTier - state.run.topTier);

  if (state.run.elapsedFrames < BALANCE.sellGateFrames) {
    return `${secondsLeft}s 뒤에 매각 가능. 이후 점수 ${formatNumber(remainingScore)} 또는 사과 ${remainingApples}개 또는 ${remainingTier}단계 더미를 만들면 됩니다.`;
  }

  return `점수 ${formatNumber(remainingScore)} 또는 사과 ${remainingApples}개 또는 상위 단계 ${remainingTier}레벨이 더 필요합니다.`;
}

function finishRun(reason) {
  if (!state.run.alive) {
    return;
  }

  const exitReason = reason === "sold" ? "sold" : "game_over";
  const appraisal = exitReason === "sold" ? getAppraisalValue() : 0;
  const bankGain = safeRound(state.run.score + appraisal);

  state.run.alive = false;
  state.run.exitReason = exitReason;
  state.run.sellPreview = appraisal;
  state.paused = false;

  state.meta.bank += bankGain;
  state.meta.bestScore = Math.max(state.meta.bestScore, state.run.score);
  state.meta.stats.runs += 1;
  state.meta.stats.totalBankEarned += bankGain;
  state.meta.stats.totalScoreEarned += state.run.score;
  state.meta.stats.lastRunScore = state.run.score;
  state.meta.stats.lastRunSurvivalFrames = state.run.elapsedFrames;
  state.meta.stats.lastRunTopTier = state.run.topTier;

  if (exitReason === "sold") {
    state.meta.stats.soldRuns += 1;
    state.meta.stats.totalAppraisalGain += appraisal;
    state.meta.stats.lastSaleAppraisal = appraisal;
    audioManager.play("sell");
  } else {
    state.meta.stats.failedRuns += 1;
    state.meta.stats.lastSaleAppraisal = 0;
    audioManager.play("game-over");
  }

  showRunResultOverlay(exitReason, appraisal, bankGain);
  syncUi(true);
  saveState();
}

function attemptSellCrate() {
  if (!canSellCrate()) {
    audioManager.play("ui-denied");
    return;
  }
  finishRun("sold");
}

function togglePause(forceValue) {
  if (!state.run.alive) {
    audioManager.play("ui-denied");
    return;
  }

  state.paused = typeof forceValue === "boolean" ? forceValue : !state.paused;
  audioManager.play("pause", { paused: state.paused });
  if (state.paused) {
    showOverlay("Paused", "컨베이어와 물리 업데이트를 잠시 멈췄습니다. 버튼이나 P 키로 다시 이어갈 수 있습니다.");
  } else {
    hideOverlay();
  }
  syncUi(true);
}

function showOverlay(title, text, buttonMarkup) {
  const content = buttonMarkup || "";
  ui.overlay.innerHTML = `
    <div>
      <p class="modal-eyebrow">APPLE DROP IDLE</p>
      <h2>${title}</h2>
      <p>${text}</p>
      ${content}
    </div>
  `;
  ui.overlay.classList.remove("hidden");
}

function showRunResultOverlay(reason, appraisal, bankGain) {
  const title = reason === "sold" ? "Crate Sold" : "Run Lost";
  const buttonLabel = reason === "sold" ? "다음 런" : "재시작";
  const summaryText = [
    `최종 점수 ${formatNumber(state.run.score)}`,
    reason === "sold" ? `감정가 ${formatNumber(appraisal)}` : "감정가 0",
    `은행 유입 ${formatNumber(bankGain)}`,
    `생존 시간 ${formatDuration(state.run.elapsedFrames / 60)}`,
    `최고 단계 ${state.run.topTier >= 0 ? APPLE_TYPES[state.run.topTier].name : "-"}`,
  ].join(" · ");

  showOverlay(
    title,
    summaryText,
    `<button id="overlayRestartButton" class="action-button primary">${buttonLabel}</button>`,
  );
}

function hideOverlay() {
  ui.overlay.classList.add("hidden");
}

function getStatusText() {
  if (!state.run.alive) {
    return state.run.exitReason === "sold"
      ? "상자를 매각했습니다. 연구실 투자 후 다음 런으로 이어갈 수 있습니다."
      : "danger line에 밀려 런을 잃었습니다. 점수만 은행으로 전환되었습니다.";
  }

  if (state.paused) {
    return "컨베이어와 물리가 일시정지 상태입니다.";
  }

  if (state.boxAnimation.active) {
    return "상자 확장 연출 중입니다. 확장 중에는 벨트와 드롭 타이머가 잠시 멈춥니다.";
  }

  if (state.spin.phase === "closing") {
    return "자동 회전 준비 중입니다. 뚜껑을 닫고 있습니다.";
  }

  if (state.spin.phase === "rotating") {
    return "Auto Spinner가 상자를 회전시키며 배치를 다시 흔들고 있습니다.";
  }

  if (state.spin.phase === "opening") {
    return "자동 회전이 끝났고 다시 정상 공급으로 돌아가는 중입니다.";
  }

  if (canSellCrate()) {
    return `상자를 지금 매각할 수 있습니다. 매각 시 은행 +${formatNumber(state.run.score + state.run.sellPreview)}를 즉시 확보합니다.`;
  }

  if (state.run.redLineFrames > 0) {
    return "상단 FAIL LINE에 사과가 걸렸습니다. 두 개 이상이 2초 유지되면 즉시 런이 종료됩니다.";
  }

  if (IS_DEV_HOST && state.devSpeed > 1) {
    return `개발 배속 x${state.devSpeed} 상태입니다. 밸런스 확인용으로만 사용하십시오.`;
  }

  const dangerRatio = clamp(state.run.dangerRatio, 0, 1);
  if (dangerRatio >= 0.72) {
    return "위험도가 높습니다. Auto Spinner, Crate Expansion, Sell Crate 선택을 함께 보십시오.";
  }

  return "사과는 컨베이어 벨트에서 굴러 떨어집니다. 런 업그레이드로 버티고, 적절한 시점에 상자를 매각해 장기적으로 성장하세요.";
}

function getRunUpgradeDetail(key) {
  const tierInfo = getDropTierInfo();

  switch (key) {
    case "dropMotor":
      return `현재 투입 주기 ${formatSeconds(getDropIntervalFrames() / 60)}`;
    case "crateExpansion":
      return `상자 배율 x${state.run.boxScale.toFixed(2)} · 할인 ${Math.round(getExpansionDiscount() * 100)}%`;
    case "bombSeeder":
      return state.meta.upgrades.bombOrchard <= 0
        ? "Bomb Orchard 해금 필요"
        : `현재 폭탄 확률 ${formatPercent(getSpecialChances().bomb)}`;
    case "prismSeeder":
      return state.meta.upgrades.prismOrchard <= 0
        ? "Prism Orchard 해금 필요"
        : `현재 프리즘 확률 ${formatPercent(getSpecialChances().prism)}`;
    case "shockEngine":
      return `충격 배율 x${getShockMultiplier().toFixed(2)}`;
    case "autoSpinner": {
      const spec = getAutoSpinnerSpec();
      if (!spec) {
        return "자동 회전 미해금";
      }
      return `위험도 ${Math.round(spec.threshold * 100)}% / 쿨다운 ${formatSeconds(spec.cooldownSeconds)}`;
    }
    case "valuePress":
      return `런 가치 배율 x${getRunValueMultiplier().toFixed(2)}`;
    case "dropTier": {
      const nextLabel = tierInfo.base < APPLE_TYPES.length - 1
        ? ` · 다음 ${tierInfo.base + 2}단계 ${Math.round(tierInfo.nextChance * 100)}%`
        : "";
      return `보장 ${tierInfo.base + 1}단계${nextLabel}`;
    }
    default:
      return "";
  }
}

function getMetaUpgradeDetail(key) {
  switch (key) {
    case "starterFund":
      return `다음 런 시작 자금 ${formatNumber(getStarterCash())}`;
    case "durableCrate":
      return `fail-line 복구 ${getRedLineRecoveryFrames()}f/tick`;
    case "bombOrchard":
      return `기본 폭탄 확률 ${formatPercent(getBaseBombChance())}`;
    case "prismOrchard":
      return `기본 프리즘 확률 ${formatPercent(getBasePrismChance())}`;
    case "expansionEngineering":
      return `할인 ${Math.round(getExpansionDiscount() * 100)}% · camera exp ${getCameraExponent().toFixed(2)}`;
    case "offlineOrchard":
      return `오프라인 배율 x${getOfflineMultiplier().toFixed(2)}`;
    case "mergeLedger":
      return `메타 가치 배율 x${getMetaValueMultiplier().toFixed(2)}`;
    default:
      return "";
  }
}

function buildUpgradeCardMarkup(shop, key) {
  const definitions = shop === "run" ? RUN_UPGRADES : META_UPGRADES;
  const definition = definitions[key];
  const level = shop === "run" ? state.run.upgrades[key] : state.meta.upgrades[key];
  const cost = shop === "run" ? getRunUpgradeCost(key, level) : getMetaUpgradeCost(key, level);
  const resource = shop === "run" ? state.run.cash : state.meta.bank;
  const finiteCap = typeof definition.cap === "number";
  const capped = finiteCap && level >= definition.cap;
  const locked =
    (key === "bombSeeder" && state.meta.upgrades.bombOrchard <= 0)
    || (key === "prismSeeder" && state.meta.upgrades.prismOrchard <= 0);
  const affordable = resource >= cost && !locked && !capped;
  const detail = shop === "run" ? getRunUpgradeDetail(key) : getMetaUpgradeDetail(key);
  const note = `${definition.note} · ${detail}`;
  const classes = [
    "upgrade-card",
    affordable ? "affordable" : "",
    capped ? "capped" : "",
    locked ? "locked" : "",
  ].filter(Boolean).join(" ");
  const levelText = finiteCap ? `Lv ${level} / ${definition.cap}` : `Lv ${level}`;

  let stateLabel = `₳ ${formatNumber(cost)}`;
  if (locked) {
    stateLabel = "LOCKED";
  } else if (capped) {
    stateLabel = "MAX";
  }

  return `
    <button class="${classes}" data-shop="${shop}" data-key="${key}" ${locked || capped ? "disabled" : ""}>
      <div class="upgrade-head">
        <span class="upgrade-title">${definition.label}</span>
        <span class="upgrade-level">${levelText}</span>
      </div>
      <p class="upgrade-note">${note}</p>
      <div class="upgrade-foot">
        <span class="upgrade-cost">${stateLabel}</span>
        <span class="upgrade-tag">${definition.tag}</span>
      </div>
    </button>
  `;
}

function renderShops(force) {
  const runSnapshot = Object.keys(RUN_UPGRADES).map((key) => {
    return [
      key,
      state.run.upgrades[key],
      getRunUpgradeCost(key, state.run.upgrades[key]),
      state.run.cash,
      state.meta.upgrades.bombOrchard,
      state.meta.upgrades.prismOrchard,
      state.run.alive,
    ].join(":");
  }).join("|");

  if (force || state.runShopSnapshot !== runSnapshot) {
    ui.runShop.innerHTML = Object.keys(RUN_UPGRADES).map((key) => buildUpgradeCardMarkup("run", key)).join("");
    state.runShopSnapshot = runSnapshot;
  }

  const labSnapshot = Object.keys(META_UPGRADES).map((key) => {
    return [
      key,
      state.meta.upgrades[key],
      getMetaUpgradeCost(key, state.meta.upgrades[key]),
      state.meta.bank,
    ].join(":");
  }).join("|");

  if (force || state.labShopSnapshot !== labSnapshot) {
    ui.labShop.innerHTML = Object.keys(META_UPGRADES).map((key) => buildUpgradeCardMarkup("lab", key)).join("");
    state.labShopSnapshot = labSnapshot;
  }
}

function buildAutomationMarkup() {
  const spinnerSpec = getAutoSpinnerSpec();
  const spinnerText = spinnerSpec
    ? `${Math.round(spinnerSpec.threshold * 100)}% / ${formatSeconds(spinnerSpec.cooldownSeconds)}`
    : "Locked";
  const cooldownText = state.run.timers.autoSpinCooldown > 0
    ? formatSeconds(state.run.timers.autoSpinCooldown / 60)
    : "Ready";
  const specialChances = getSpecialChances();
  const tierInfo = getDropTierInfo();
  const topTierName = state.run.topTier >= 0 ? APPLE_TYPES[state.run.topTier].name : "-";
  const devSpeedRow = IS_DEV_HOST ? `
    <div class="stat-row">
      <dt>Dev Speed</dt>
      <dd>x${state.devSpeed}</dd>
    </div>
  ` : "";

  return `
    <div class="stat-row">
      <dt>Auto Drop</dt>
      <dd>${formatSeconds(getDropIntervalFrames() / 60)}</dd>
    </div>
    ${devSpeedRow}
    <div class="stat-row">
      <dt>Drop Tier</dt>
      <dd>${tierInfo.base + 1}<br>${Math.round(tierInfo.nextChance * 100)}%</dd>
    </div>
    <div class="stat-row">
      <dt>Season</dt>
      <dd>${state.run.season + 1}</dd>
    </div>
    <div class="stat-row">
      <dt>Bomb Rate</dt>
      <dd>${formatPercent(specialChances.bomb)}</dd>
    </div>
    <div class="stat-row">
      <dt>Prism Rate</dt>
      <dd>${formatPercent(specialChances.prism)}</dd>
    </div>
    <div class="stat-row">
      <dt>Auto Spinner</dt>
      <dd>${spinnerText}<br>${cooldownText}</dd>
    </div>
    <div class="stat-row">
      <dt>Crate Scale</dt>
      <dd>x${state.run.boxScale.toFixed(2)}</dd>
    </div>
    <div class="stat-row">
      <dt>Sell Appraisal</dt>
      <dd>${formatNumber(state.run.sellPreview)}</dd>
    </div>
    <div class="stat-row">
      <dt>Sell Ready</dt>
      <dd>${canSellCrate() ? "YES" : "NO"}</dd>
    </div>
    <div class="stat-row">
      <dt>Offline / sec</dt>
      <dd>${formatNumber(getOfflineRatePerSecond())}</dd>
    </div>
    <div class="stat-row">
      <dt>Best Score</dt>
      <dd>${formatNumber(state.meta.bestScore)}</dd>
    </div>
    <div class="stat-row">
      <dt>Top Tier</dt>
      <dd>${topTierName}</dd>
    </div>
  `;
}

function buildBadgeMarkup() {
  const spinnerSpec = getAutoSpinnerSpec();
  const spinnerReady = spinnerSpec
    ? (state.run.timers.autoSpinCooldown > 0 ? `COOLDOWN ${formatSeconds(state.run.timers.autoSpinCooldown / 60)}` : "READY")
    : "LOCKED";
  const chances = getSpecialChances();
  const dangerRatio = clamp(state.run.dangerRatio, 0, 1);
  const tierInfo = getDropTierInfo();
  const badges = [
    `<span class="badge"><strong>AUTO DROP</strong>${formatSeconds(getDropIntervalFrames() / 60)}</span>`,
  ];

  if (IS_DEV_HOST) {
    badges.push(`<span class="badge"><strong>SIM</strong>x${state.devSpeed}</span>`);
  }

  return badges.concat([
    `<span class="badge"><strong>DROP TIER</strong>${tierInfo.base + 1}</span>`,
    `<span class="badge"><strong>DANGER</strong>${Math.round(dangerRatio * 100)}%</span>`,
    `<span class="badge"><strong>SPINNER</strong>${spinnerReady}</span>`,
    `<span class="badge"><strong>APPRAISAL</strong>${formatNumber(state.run.sellPreview)}</span>`,
    `<span class="badge"><strong>SELL</strong>${canSellCrate() ? "READY" : "LOCKED"}</span>`,
    `<span class="badge"><strong>BOMB</strong>${formatPercent(chances.bomb)}</span>`,
    `<span class="badge"><strong>PRISM</strong>${formatPercent(chances.prism)}</span>`,
  ]).join("");
}

function buildLegend() {
  ui.legend.innerHTML = APPLE_TYPES.map((apple, index) => {
    return `
      <article class="legend-row" style="--apple-main:${apple.color}; --apple-highlight:${apple.highlight}; --apple-shadow:${apple.shadow}; --apple-leaf:${apple.leaf};">
        <div class="legend-icon" aria-hidden="true"></div>
        <div class="legend-copy">
          <strong>${apple.name}</strong>
          <span>Tier ${index + 1} · radius ${apple.radius}</span>
        </div>
        <span class="legend-points">${formatNumber(apple.points)}</span>
      </article>
    `;
  }).join("");
}

function syncControlUi(force) {
  const snapshot = `${state.activeMenu}|${state.devSpeed}`;
  if (!force && state.controlSnapshot === snapshot) {
    return;
  }

  const speedButtons = ui.devSpeedControls ? ui.devSpeedControls.querySelectorAll("[data-speed]") : [];
  speedButtons.forEach((button) => {
    const speed = Number(button.dataset.speed) || 1;
    const active = speed === state.devSpeed;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-pressed", active ? "true" : "false");
  });

  const devSpeedCard = ui.devSpeedControls ? ui.devSpeedControls.closest(".dev-speed-card") : null;
  if (devSpeedCard) {
    devSpeedCard.classList.toggle("hidden", !IS_DEV_HOST);
  }

  const menuButtons = ui.menuTabs ? ui.menuTabs.querySelectorAll("[data-menu]") : [];
  menuButtons.forEach((button) => {
    const menu = button.dataset.menu;
    const active = menu === state.activeMenu;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-pressed", active ? "true" : "false");
  });

  document.querySelectorAll("[data-menu-pane]").forEach((pane) => {
    pane.classList.toggle("is-active", pane.dataset.menuPane === state.activeMenu);
  });

  state.controlSnapshot = snapshot;
}

function syncUi(force) {
  state.run.topTier = state.apples.reduce((highest, apple) => Math.max(highest, apple.level), state.run.topTier);
  state.run.sellPreview = getAppraisalValue();
  const dangerPercent = `${Math.round(clamp(state.run.dangerRatio, 0, 1) * 100)}%`;
  const snapshot = [
    state.run.score,
    state.run.cash,
    state.meta.bank,
    state.run.sellPreview,
    dangerPercent,
    state.paused,
    state.run.alive,
    state.run.boxScale.toFixed(3),
    state.run.drops,
    state.run.merges,
    state.run.topTier,
    state.run.elapsedFrames,
    state.run.season,
    state.run.timers.autoSpinCooldown,
    state.run.redLineFrames,
    state.spin.phase,
    state.boxAnimation.active,
    canSellCrate(),
  ].join("|");

  if (force || state.uiSnapshot !== snapshot) {
    ui.score.textContent = formatNumber(state.run.score);
    ui.cash.textContent = formatNumber(state.run.cash);
    ui.bank.textContent = formatNumber(state.meta.bank);
    ui.danger.textContent = dangerPercent;
    ui.status.textContent = getStatusText();
    ui.appraisalValue.textContent = formatNumber(state.run.sellPreview);
    ui.sellHint.textContent = getSellGateText();
    ui.pauseButton.textContent = state.paused ? "재개" : "일시정지";
    ui.pauseButton.disabled = !state.run.alive;
    ui.sellButton.disabled = !canSellCrate();
    ui.sellButton.textContent = state.run.alive ? "Sell Crate" : "Run Closed";
    state.uiSnapshot = snapshot;
  }

  const automationMarkup = buildAutomationMarkup();
  if (force || state.automationSnapshot !== automationMarkup) {
    ui.automationList.innerHTML = automationMarkup;
    state.automationSnapshot = automationMarkup;
  }

  const badgeMarkup = buildBadgeMarkup();
  if (force || state.badgeSnapshot !== badgeMarkup) {
    ui.automationBadges.innerHTML = badgeMarkup;
    state.badgeSnapshot = badgeMarkup;
  }

  syncControlUi(force);
  renderShops(force);

  if (state.offlineSummary) {
    ui.offlineText.textContent = `${formatDuration(state.offlineSummary.elapsedSeconds)} 동안 과수원이 은행 자금 ${formatNumber(state.offlineSummary.gain)}을 모았습니다. 현재 런 상태는 저장 시점 그대로 복구되었습니다.`;
    ui.offlineModal.classList.remove("hidden");
  } else {
    ui.offlineModal.classList.add("hidden");
  }
}

function setDevSpeed(speed) {
  const nextSpeed = sanitizeDevSpeed(speed);
  if (state.devSpeed === nextSpeed) {
    return;
  }
  state.devSpeed = nextSpeed;
  audioManager.play("ui-confirm");
  syncUi(true);
}

function setActiveMenu(menu) {
  const nextMenu = sanitizeMenuPane(menu);
  if (state.activeMenu === nextMenu) {
    return;
  }
  state.activeMenu = nextMenu;
  audioManager.play("ui-confirm");
  syncUi(true);
}

function canBuyRunUpgrade(key) {
  if (!state.run.alive) {
    return false;
  }

  if (key === "bombSeeder" && state.meta.upgrades.bombOrchard <= 0) {
    return false;
  }

  if (key === "prismSeeder" && state.meta.upgrades.prismOrchard <= 0) {
    return false;
  }

  return state.run.cash >= getRunUpgradeCost(key, state.run.upgrades[key]);
}

function canBuyMetaUpgrade(key) {
  const definition = META_UPGRADES[key];
  const level = state.meta.upgrades[key];
  if (typeof definition.cap === "number" && level >= definition.cap) {
    return false;
  }
  return state.meta.bank >= getMetaUpgradeCost(key, level);
}

function purchaseRunUpgrade(key) {
  if (!canBuyRunUpgrade(key)) {
    audioManager.play("ui-denied");
    return;
  }

  const cost = getRunUpgradeCost(key, state.run.upgrades[key]);
  state.run.cash -= cost;
  state.run.upgrades[key] += 1;

  if (key === "crateExpansion") {
    startBoxExpansion();
  } else {
    audioManager.play("ui-confirm");
  }

  if (key === "autoSpinner") {
    spawnFloatingText(getOrchardBounds().centerX, getOrchardBounds().y - 20, "AUTO SPINNER", "#e7f0ff", 52);
  }

  if (key === "dropTier") {
    spawnFloatingText(getOrchardBounds().centerX, getOrchardBounds().y - 20, "DROP TIER UP", "#fff0d5", 52);
  }

  state.run.targetBoxScale = getBoxScaleForLevel(state.run.upgrades.crateExpansion);
  flashScreen("rgba(255, 244, 206, 0.2)", 0.12);
  syncUi(true);
  saveState();
}

function purchaseMetaUpgrade(key) {
  if (!canBuyMetaUpgrade(key)) {
    audioManager.play("ui-denied");
    return;
  }

  const cost = getMetaUpgradeCost(key, state.meta.upgrades[key]);
  state.meta.bank -= cost;
  state.meta.upgrades[key] += 1;

  if (key === "durableCrate") {
    state.run.redLineFrames = Math.max(0, state.run.redLineFrames - 12);
  }

  audioManager.play("ui-confirm");
  flashScreen("rgba(135, 213, 255, 0.18)", 0.12);
  syncUi(true);
  saveState();
}

function awardValue(baseAmount) {
  const amount = Math.max(1, safeRound(baseAmount * getCombinedValueMultiplier()));
  state.run.score += amount;
  state.run.cash += amount;
  state.meta.bestScore = Math.max(state.meta.bestScore, state.run.score);
  return amount;
}

function rollDropLevel() {
  const tierInfo = getDropTierInfo();
  const nextLevel = Math.min(APPLE_TYPES.length - 1, tierInfo.base + 1);
  if (tierInfo.nextChance > 0 && Math.random() < tierInfo.nextChance) {
    return nextLevel;
  }
  return tierInfo.base;
}

function drawSpecialType() {
  const chances = getSpecialChances();
  const roll = Math.random();
  if (roll < chances.bomb) {
    return "bomb";
  }
  if (roll < chances.bomb + chances.prism) {
    return "prism";
  }
  return null;
}

function createInfeedToken() {
  const interval = getDropIntervalFrames();
  state.infeed = {
    level: rollDropLevel(),
    special: drawSpecialType(),
    frame: 0,
    beltFrames: getBeltFrames(interval),
  };
}

function isSpinActive() {
  return state.spin.phase !== "idle";
}

function isAnimationBlockingFeed() {
  return isSpinActive() || state.boxAnimation.active;
}

function getInfeedProgress() {
  if (!state.infeed) {
    return 0;
  }
  return clamp(state.infeed.frame / Math.max(1, state.infeed.beltFrames), 0, 1);
}

function getInfeedVisual() {
  if (!state.infeed) {
    return null;
  }

  const geometry = getConveyorGeometry();
  const progress = getInfeedProgress();
  const x = geometry.startX + (geometry.endX - geometry.startX) * progress;
  const y = geometry.startY + (geometry.endY - geometry.startY) * progress;
  const dx = geometry.endX - geometry.startX;
  const dy = geometry.endY - geometry.startY;
  const length = Math.hypot(dx, dy) || 1;
  const angle = Math.atan2(dy, dx);
  const spin = (length * progress) / Math.max(12, APPLE_TYPES[state.infeed.level].radius);

  return {
    x,
    y,
    angle,
    spin,
  };
}

function releaseInfeedApple() {
  if (!state.infeed) {
    return;
  }

  const geometry = getConveyorGeometry();
  const dropLevel = state.infeed.level;
  const apple = createApple(dropLevel, geometry.endX, geometry.endY, {
    special: state.infeed.special,
    vx: 1.8,
    vy: 0.4,
    spinVelocity: 0.09 + 0.01 * dropLevel,
    spin: 0,
  });

  state.apples.push(apple);
  state.run.drops += 1;
  state.shake = Math.max(state.shake, 4.5);
  audioManager.play("drop-release", { level: dropLevel });
  spawnParticles(apple.x, apple.y + 6, APPLE_TYPES[dropLevel].color, 12, 3.5);
  state.infeed = null;
  state.run.timers.drop = 0;
}

function updateInfeed() {
  if (!state.run.alive || state.paused || isAnimationBlockingFeed()) {
    return;
  }

  state.beltTime += 1;

  if (!state.infeed) {
    const interval = getDropIntervalFrames();
    const beltFrames = getBeltFrames(interval);
    const startAfter = Math.max(1, interval - beltFrames);
    state.run.timers.drop += 1;

    if (state.run.timers.drop >= startAfter) {
      createInfeedToken();
    }
    return;
  }

  state.infeed.frame += 1;
  if (state.infeed.frame >= state.infeed.beltFrames) {
    releaseInfeedApple();
  }
}

function startSpinSkill() {
  if (!state.run.alive || state.paused || isSpinActive() || state.boxAnimation.active) {
    return false;
  }

  const orchard = getOrchardBounds();
  state.spin.phase = "closing";
  state.spin.frame = 0;
  state.spin.angle = 0;
  state.spin.lidProgress = 0;
  audioManager.play("spinner-start");
  flashScreen("rgba(188, 223, 255, 0.38)", 0.15);
  spawnFloatingText(orchard.centerX, orchard.y - 24, "AUTO ROTATE", "#edf7ff", 48);
  return true;
}

function maybeTriggerAutoSpinner() {
  const spec = getAutoSpinnerSpec();
  if (!spec || state.run.timers.autoSpinCooldown > 0) {
    return;
  }

  const dangerRatio = clamp(state.run.dangerRatio, 0, 1.6);
  if (dangerRatio >= spec.threshold && startSpinSkill()) {
    state.run.timers.autoSpinCooldown = spec.cooldownFrames;
  }
}

function startBoxExpansion() {
  const orchard = getOrchardBounds();
  const nextScale = getBoxScaleForLevel(state.run.upgrades.crateExpansion);
  state.boxAnimation.active = true;
  state.boxAnimation.frame = 0;
  state.boxAnimation.from = state.run.boxScale;
  state.boxAnimation.to = nextScale;
  state.boxAnimation.pulse = 1;
  state.run.targetBoxScale = nextScale;
  audioManager.play("crate-expand");
  flashScreen("rgba(159, 255, 220, 0.3)", 0.16);
  spawnFloatingText(orchard.centerX, orchard.y - 24, "ORCHARD EXPANDED", "#e9fff4", 58);
  spawnShockwave(orchard.centerX, orchard.bottom - 12, "#74e0b5", orchard.w * 0.7, 18, 20);
}

function updateBoxAnimation() {
  if (!state.boxAnimation.active) {
    state.boxAnimation.pulse *= 0.92;
    if (state.boxAnimation.pulse < 0.02) {
      state.boxAnimation.pulse = 0;
    }
    return;
  }

  state.boxAnimation.frame += 1;
  const progress = clamp(state.boxAnimation.frame / BALANCE.boxExpandFrames, 0, 1);
  const eased = 1 - Math.pow(1 - progress, 3);
  state.run.boxScale = state.boxAnimation.from + (state.boxAnimation.to - state.boxAnimation.from) * eased;
  state.boxAnimation.pulse = 1 - progress * 0.4;

  if (state.boxAnimation.frame >= BALANCE.boxExpandFrames) {
    state.run.boxScale = state.boxAnimation.to;
    state.boxAnimation.active = false;
    state.boxAnimation.frame = 0;
  }
}

function updateSpinSkill() {
  if (state.spin.phase === "idle") {
    state.spin.angle = 0;
    state.spin.lidProgress = 0;
    return;
  }

  state.spin.frame += 1;

  if (state.spin.phase === "closing") {
    state.spin.lidProgress = clamp(state.spin.frame / BALANCE.spin.closeFrames, 0, 1);
    if (state.spin.frame >= BALANCE.spin.closeFrames) {
      const orchard = getOrchardBounds();
      state.spin.phase = "rotating";
      state.spin.frame = 0;
      state.spin.lidProgress = 1;
      spawnFloatingText(orchard.centerX, orchard.y - 24, "ROTATE", "#d9ebff", 42);
    }
    return;
  }

  if (state.spin.phase === "rotating") {
    const progress = clamp(state.spin.frame / BALANCE.spin.rotateFrames, 0, 1);
    state.spin.angle = Math.PI * 2 * progress;
    state.spin.lidProgress = 1;
    if (state.spin.frame >= BALANCE.spin.rotateFrames) {
      state.spin.phase = "opening";
      state.spin.frame = 0;
      state.spin.angle = 0;
      state.spin.lidProgress = 1;
      audioManager.play("spinner-end");
    }
    return;
  }

  if (state.spin.phase === "opening") {
    state.spin.lidProgress = clamp(1 - state.spin.frame / BALANCE.spin.openFrames, 0, 1);
    state.spin.angle = 0;
    if (state.spin.frame >= BALANCE.spin.openFrames) {
      const orchard = getOrchardBounds();
      state.spin.phase = "idle";
      state.spin.frame = 0;
      state.spin.lidProgress = 0;
      spawnFloatingText(orchard.centerX, orchard.y - 24, "OPEN", "#fff1cf", 36);
    }
  }
}

function getGravityVector() {
  if (!isSpinActive()) {
    return {
      x: 0,
      y: PHYSICS.gravity,
    };
  }

  return {
    x: Math.sin(state.spin.angle) * PHYSICS.gravity,
    y: Math.cos(state.spin.angle) * PHYSICS.gravity,
  };
}

function constrainApple(apple) {
  const orchard = getOrchardBounds();
  const horizontal = getHorizontalBounds(apple.r);
  let minY = state.spin.lidProgress > 0.05 ? orchard.y + apple.r : -Infinity;
  let maxY = orchard.bottom - apple.r;

  if (minY > maxY) {
    minY = orchard.centerY;
    maxY = orchard.centerY;
  }

  if (apple.x < horizontal.minX) {
    apple.x = horizontal.minX;
    if (apple.vx < 0) {
      apple.vx *= -PHYSICS.wallRestitution;
    }
  }

  if (apple.x > horizontal.maxX) {
    apple.x = horizontal.maxX;
    if (apple.vx > 0) {
      apple.vx *= -PHYSICS.wallRestitution;
    }
  }

  if (apple.y > maxY) {
    apple.y = maxY;
    if (apple.vy > 0) {
      apple.vy *= -PHYSICS.floorRestitution;
    }
    if (Math.abs(apple.vy) < 0.35) {
      apple.vy = 0;
    }
    apple.vx *= 0.985;
  }

  if (apple.y < minY) {
    apple.y = minY;
    if (apple.vy < 0) {
      apple.vy *= -PHYSICS.wallRestitution;
    }
    apple.vx *= 0.99;
  }
}

function resolveCollisions(collectEvents) {
  const mergePairs = [];
  const specialEvents = [];

  for (let i = 0; i < state.apples.length; i += 1) {
    const appleA = state.apples[i];

    for (let j = i + 1; j < state.apples.length; j += 1) {
      const appleB = state.apples[j];
      let dx = appleB.x - appleA.x;
      let dy = appleB.y - appleA.y;
      let distance = Math.hypot(dx, dy);
      const minDistance = appleA.r + appleB.r;

      if (distance >= minDistance) {
        continue;
      }

      if (distance === 0) {
        distance = 0.0001;
        dx = 0.0001;
        dy = 0;
      }

      const overlap = minDistance - distance;
      const nx = dx / distance;
      const ny = dy / distance;
      const massA = appleA.r * appleA.r;
      const massB = appleB.r * appleB.r;
      const totalMass = massA + massB;
      const moveA = massB / totalMass;
      const moveB = massA / totalMass;

      appleA.x -= nx * overlap * moveA;
      appleA.y -= ny * overlap * moveA;
      appleB.x += nx * overlap * moveB;
      appleB.y += ny * overlap * moveB;

      constrainApple(appleA);
      constrainApple(appleB);

      const relativeVelocityX = appleB.vx - appleA.vx;
      const relativeVelocityY = appleB.vy - appleA.vy;
      const separatingSpeed = relativeVelocityX * nx + relativeVelocityY * ny;

      if (separatingSpeed < 0) {
        const impulse = -separatingSpeed * 0.32;
        appleA.vx -= nx * impulse * moveA;
        appleA.vy -= ny * impulse * moveA;
        appleB.vx += nx * impulse * moveB;
        appleB.vy += ny * impulse * moveB;
      }

      if (collectEvents && appleA.special && appleA.age > 8) {
        specialEvents.push({
          type: appleA.special,
          source: appleA,
          target: appleB,
          impact: overlap,
        });
      }

      if (collectEvents && appleB.special && appleB.age > 8) {
        specialEvents.push({
          type: appleB.special,
          source: appleB,
          target: appleA,
          impact: overlap,
        });
      }

      if (
        collectEvents
        && !appleA.special
        && !appleB.special
        && appleA.level === appleB.level
        && appleA.level < APPLE_TYPES.length - 1
      ) {
        mergePairs.push({
          first: appleA,
          second: appleB,
          overlap,
        });
      }
    }
  }

  return {
    mergePairs,
    specialEvents,
  };
}

function applyMergePairs(mergePairs) {
  const sortedPairs = mergePairs.sort((left, right) => right.overlap - left.overlap);
  const consumedIds = new Set();
  const spawnedApples = [];
  const activeIds = new Set(state.apples.map((apple) => apple.id));

  for (const pair of sortedPairs) {
    const first = pair.first;
    const second = pair.second;

    if (
      consumedIds.has(first.id)
      || consumedIds.has(second.id)
      || !activeIds.has(first.id)
      || !activeIds.has(second.id)
    ) {
      continue;
    }

    consumedIds.add(first.id);
    consumedIds.add(second.id);

    const nextLevel = first.level + 1;
    const appleType = APPLE_TYPES[nextLevel];
    const orchard = getOrchardBounds();
    const horizontal = getHorizontalBounds(appleType.radius);
    const mergedApple = createApple(
      nextLevel,
      clamp((first.x + second.x) * 0.5, horizontal.minX, horizontal.maxX),
      Math.min((first.y + second.y) * 0.5, orchard.bottom - appleType.radius),
      {
        fromMerge: true,
        vy: Math.min((first.vy + second.vy) * 0.5 - 2.4, 2.2),
        vx: (first.vx + second.vx) * 0.5,
        spinVelocity: (first.spinVelocity + second.spinVelocity) * 0.5 + (Math.random() - 0.5) * 0.03,
      },
    );
    spawnedApples.push(mergedApple);

    state.run.merges += 1;
    state.run.topTier = Math.max(state.run.topTier, nextLevel);

    const gainedValue = awardValue(appleType.points);
    state.shake = Math.min(18, state.shake + 5 + nextLevel);
    audioManager.play("merge", { level: nextLevel });
    flashScreen(nextLevel >= 10 ? "rgba(255, 244, 206, 0.92)" : "rgba(255, 255, 255, 0.85)", nextLevel >= 10 ? 0.26 : 0.18);
    spawnShockwave(mergedApple.x, mergedApple.y, appleType.highlight, Math.max(120, appleType.radius * 2.2), 16 + nextLevel, 20);
    spawnParticles(mergedApple.x, mergedApple.y, appleType.color, 18 + nextLevel * 2, 4.6 + nextLevel * 0.25);
    spawnParticles(mergedApple.x, mergedApple.y, appleType.highlight, 10 + nextLevel, 3.2 + nextLevel * 0.2);
    spawnFloatingText(
      mergedApple.x,
      mergedApple.y,
      `+${formatNumber(gainedValue)} ${appleType.name}`,
      nextLevel >= APPLE_TYPES.length - 2 ? "#fff0b2" : "#fff6ef",
    );
  }

  if (spawnedApples.length > 0) {
    state.apples = state.apples.filter((apple) => !consumedIds.has(apple.id)).concat(spawnedApples);
  }
}

function applySpecialEvents(specialEvents) {
  const consumedIds = new Set();
  const spawnedApples = [];
  const appleMap = new Map(state.apples.map((apple) => [apple.id, apple]));
  const resolvedSourceIds = new Set();
  const priority = {
    bomb: 2,
    prism: 1,
  };

  const sortedEvents = specialEvents.slice().sort((left, right) => {
    return (priority[right.type] - priority[left.type]) || (right.impact - left.impact);
  });

  for (const event of sortedEvents) {
    const source = appleMap.get(event.source.id);
    const target = appleMap.get(event.target.id);

    if (
      !source
      || !target
      || resolvedSourceIds.has(source.id)
      || consumedIds.has(source.id)
      || consumedIds.has(target.id)
    ) {
      continue;
    }

    resolvedSourceIds.add(source.id);

    if (event.type === "bomb") {
      triggerBombExplosion(source, target, appleMap);
      continue;
    }

    if (event.type === "prism") {
      triggerPrismUpgrade(source, target, consumedIds, spawnedApples);
    }
  }

  if (consumedIds.size > 0 || spawnedApples.length > 0) {
    state.apples = state.apples.filter((apple) => !consumedIds.has(apple.id)).concat(spawnedApples);
  }
}

function triggerBombExplosion(source, target, appleMap) {
  const centerX = (source.x + target.x) * 0.5;
  const centerY = (source.y + target.y) * 0.5;
  const shockMultiplier = getShockMultiplier();
  const blastRadius = Math.max(175, source.r * 2.75) * shockMultiplier;
  let affectedCount = 0;

  source.special = null;

  for (const apple of appleMap.values()) {
    let dx = apple.x - centerX;
    let dy = apple.y - centerY;
    let distance = Math.hypot(dx, dy);

    if (distance > blastRadius + apple.r * 0.6) {
      continue;
    }

    if (distance === 0) {
      dx = Math.random() - 0.5;
      dy = Math.random() - 0.5;
      distance = Math.hypot(dx, dy) || 1;
    }

    const nx = dx / distance;
    const ny = dy / distance;
    const falloff = 1 - clamp(distance / (blastRadius + apple.r), 0, 1);
    const impulse = (4 + falloff * 17) * shockMultiplier;

    apple.vx += nx * impulse;
    apple.vy += ny * impulse - 1.4;
    apple.spinVelocity += (Math.random() - 0.5) * 0.18 + nx * 0.04;
    apple.dangerHoldFrames = 0;
    affectedCount += 1;
  }

  const gainedValue = awardValue(90);
  state.run.redLineFrames = Math.max(0, state.run.redLineFrames - 18);
  state.shake = Math.min(30, state.shake + 16);
  audioManager.play("bomb");
  flashScreen("rgba(255, 132, 86, 0.95)", 0.42);
  spawnShockwave(centerX, centerY, SPECIAL_TYPES.bomb.accent, blastRadius * 1.18, 24, 18);
  spawnParticles(centerX, centerY, SPECIAL_TYPES.bomb.accent, 44, 8.5);
  spawnParticles(centerX, centerY, "#ffe2b8", 30, 6.2);
  spawnFloatingText(centerX, centerY - 12, `BOMB +${formatNumber(gainedValue)}`, "#fff1c6", 62);
  spawnFloatingText(centerX, centerY + 24, `${affectedCount} apples displaced`, "#ffd0b8", 52);
}

function triggerPrismUpgrade(source, target, consumedIds, spawnedApples) {
  consumedIds.add(source.id);
  consumedIds.add(target.id);

  const nextLevel = Math.min(target.level + 1, APPLE_TYPES.length - 1);
  const nextType = APPLE_TYPES[nextLevel];
  const orchard = getOrchardBounds();
  const upgradedApple = createApple(
    nextLevel,
    target.x,
    Math.min(target.y, orchard.bottom - nextType.radius),
    {
      fromMerge: true,
      vx: (source.vx + target.vx) * 0.18,
      vy: Math.min(target.vy - 3.6, 1.2),
    },
  );

  spawnedApples.push(upgradedApple);
  state.run.topTier = Math.max(state.run.topTier, nextLevel);

  const gainedValue = awardValue(Math.round(nextType.points * 1.15));
  state.shake = Math.min(24, state.shake + 10);
  audioManager.play("prism");
  flashScreen("rgba(182, 245, 255, 0.92)", 0.34);
  spawnShockwave(target.x, target.y, SPECIAL_TYPES.prism.accent, Math.max(110, nextType.radius * 2.05), 20, 22);
  spawnParticles(target.x, target.y, SPECIAL_TYPES.prism.accent, 26, 6.4);
  spawnParticles(target.x, target.y, nextType.highlight, 22, 5.3);
  spawnFloatingText(target.x, target.y - 8, `PRISM +${formatNumber(gainedValue)}`, "#ebfbff", 60);
}

function getCircleAreaAboveLine(radius, lineOffsetFromCenter) {
  if (lineOffsetFromCenter <= -radius) {
    return Math.PI * radius * radius;
  }

  if (lineOffsetFromCenter >= radius) {
    return 0;
  }

  const chordHalf = Math.sqrt(Math.max(0, radius * radius - lineOffsetFromCenter * lineOffsetFromCenter));
  return radius * radius * Math.acos(lineOffsetFromCenter / radius) - lineOffsetFromCenter * chordHalf;
}

function getCircleAreaInBand(apple, topY, bottomY) {
  if (apple.y + apple.r <= topY || apple.y - apple.r >= bottomY) {
    return 0;
  }

  const areaAboveTop = getCircleAreaAboveLine(apple.r, topY - apple.y);
  const areaAboveBottom = getCircleAreaAboveLine(apple.r, bottomY - apple.y);
  return Math.max(0, areaAboveTop - areaAboveBottom);
}

function getDangerZoneMetrics(orchard) {
  const bandTop = orchard.y;
  const bandBottom = orchard.dangerY;
  const bandArea = Math.max(1, (orchard.w - 16) * (bandBottom - bandTop));
  let occupiedArea = 0;
  let redLineCount = 0;

  for (const apple of state.apples) {
    occupiedArea += getCircleAreaInBand(apple, bandTop, bandBottom);

    if (
      apple.age > 18
      && apple.y - apple.r <= orchard.redLineY
      && apple.y + apple.r >= orchard.redLineY
    ) {
      redLineCount += 1;
    }
  }

  return {
    occupiedArea,
    bandArea,
    fillRatio: clamp(occupiedArea / bandArea, 0, 1.6),
    redLineCount,
  };
}

function updateDangerState() {
  const orchard = getOrchardBounds();
  const metrics = getDangerZoneMetrics(orchard);
  const seasonHazard = getSeasonHazard(state.run.season);
  const recoveryFrames = getRedLineRecoveryFrames();
  state.run.dangerRatio = clamp(metrics.fillRatio * (0.98 + (seasonHazard - 1) * 0.08), 0, 1.6);
  state.run.dangerFrames = safeRound(clamp(state.run.dangerRatio, 0, 1) * 100);

  if (isSpinActive()) {
    state.run.redLineFrames = Math.max(0, state.run.redLineFrames - (recoveryFrames + 3));
    return;
  }

  if (metrics.redLineCount >= 2) {
    state.run.redLineFrames += 1;
  } else {
    state.run.redLineFrames = Math.max(0, state.run.redLineFrames - recoveryFrames);
  }

  if (state.run.redLineFrames >= BALANCE.redLineHoldFrames) {
    finishRun("game_over");
  }
}

function spawnParticles(x, y, color, count, speed) {
  for (let index = 0; index < count; index += 1) {
    const angle = (Math.PI * 2 * index) / count + Math.random() * 0.35;
    state.particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed * (0.35 + Math.random() * 0.65),
      vy: Math.sin(angle) * speed * (0.3 + Math.random() * 0.7) - Math.random() * 1.8,
      size: 2 + Math.random() * 4,
      life: 26 + Math.floor(Math.random() * 16),
      color,
    });
  }
}

function updateParticles() {
  state.particles = state.particles.filter((particle) => {
    particle.x += particle.vx;
    particle.y += particle.vy;
    particle.vy += 0.08;
    particle.vx *= 0.99;
    particle.life -= 1;
    return particle.life > 0;
  });
}

function spawnShockwave(x, y, color, maxRadius, lineWidth, life) {
  state.shockwaves.push({
    x,
    y,
    color,
    radius: 12,
    maxRadius,
    lineWidth,
    life,
    maxLife: life,
  });
}

function updateShockwaves() {
  state.shockwaves = state.shockwaves.filter((ring) => {
    ring.life -= 1;
    ring.radius += (ring.maxRadius - ring.radius) * 0.24;
    ring.lineWidth *= 0.965;
    return ring.life > 0;
  });
}

function flashScreen(color, strength) {
  state.screenFlashColor = color;
  state.screenFlash = Math.max(state.screenFlash, strength);
}

function spawnFloatingText(x, y, text, color, life) {
  state.floatingTexts.push({
    x,
    y,
    text,
    color,
    life: life || 46,
  });
}

function updateFloatingTexts() {
  state.floatingTexts = state.floatingTexts.filter((label) => {
    label.y -= 1.1;
    label.life -= 1;
    return label.life > 0;
  });
}

function worldStep() {
  state.time += 1;
  state.run.elapsedFrames += 1;
  state.run.season = Math.floor(state.run.elapsedFrames / BALANCE.seasonFrames);

  if (state.run.timers.autoSpinCooldown > 0) {
    state.run.timers.autoSpinCooldown -= 1;
  }

  if (state.run.timers.autosave > 0) {
    state.run.timers.autosave -= 1;
  } else {
    state.run.timers.autosave = BALANCE.autosaveFrames;
    saveState();
  }

  updateBoxAnimation();
  updateSpinSkill();
  updateInfeed();

  const gravity = getGravityVector();

  for (const apple of state.apples) {
    apple.age += 1;
    apple.vx += gravity.x;
    apple.vy += gravity.y;
    apple.x += apple.vx;
    apple.y += apple.vy;
    apple.vx *= 0.998;
    apple.vy *= 0.998;
    apple.spin += apple.spinVelocity;
    apple.spinVelocity *= 0.994;
    constrainApple(apple);
  }

  for (let iteration = 0; iteration < 2; iteration += 1) {
    resolveCollisions(false);
  }

  const collisionResult = resolveCollisions(true);
  let mergePairs = collisionResult.mergePairs;

  if (collisionResult.specialEvents.length > 0) {
    applySpecialEvents(collisionResult.specialEvents);
    mergePairs = resolveCollisions(true).mergePairs;
  }

  if (mergePairs.length > 0) {
    applyMergePairs(mergePairs);
  }

  updateParticles();
  updateShockwaves();
  updateFloatingTexts();
  updateDangerState();
  maybeTriggerAutoSpinner();

  state.shake *= 0.9;
  if (state.shake < 0.2) {
    state.shake = 0;
  }

  state.screenFlash *= 0.88;
  if (state.screenFlash < 0.02) {
    state.screenFlash = 0;
  }

  syncUi(false);
}

function drawCloud(x, y, scale) {
  const size = 26 * scale;
  ctx.fillStyle = "rgba(255, 255, 255, 0.74)";
  ctx.beginPath();
  ctx.arc(x, y, size, 0, Math.PI * 2);
  ctx.arc(x + size * 0.88, y - 8, size * 0.72, 0, Math.PI * 2);
  ctx.arc(x + size * 1.7, y, size * 0.98, 0, Math.PI * 2);
  ctx.arc(x + size, y + 10, size * 0.86, 0, Math.PI * 2);
  ctx.fill();
}

function drawBackdrop(shakeX) {
  const bgScale = 1 / (1 + Math.max(0, state.run.boxScale - 1) * 0.22);
  ctx.save();
  ctx.translate(WIDTH / 2, HEIGHT / 2);
  ctx.scale(bgScale, bgScale);
  ctx.translate(-WIDTH / 2, -HEIGHT / 2);

  const sky = ctx.createLinearGradient(0, 0, 0, HEIGHT);
  sky.addColorStop(0, "#c5ecff");
  sky.addColorStop(0.34, "#f6e7c3");
  sky.addColorStop(1, "#c89e63");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  const sunX = 720 - shakeX * 0.2;
  const sun = ctx.createRadialGradient(sunX, 114, 8, sunX, 114, 110);
  sun.addColorStop(0, "rgba(255, 247, 216, 0.96)");
  sun.addColorStop(1, "rgba(255, 247, 216, 0)");
  ctx.fillStyle = sun;
  ctx.beginPath();
  ctx.arc(sunX, 114, 110, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#7eaf5b";
  for (let index = 0; index < 6; index += 1) {
    const baseX = 30 + index * 160 - shakeX * 0.15;
    ctx.beginPath();
    ctx.moveTo(baseX, 520);
    ctx.quadraticCurveTo(baseX + 90, 380 - (index % 2) * 30, baseX + 190, 520);
    ctx.closePath();
    ctx.fill();
  }

  for (let index = 0; index < 10; index += 1) {
    const x = 40 + index * 90 - shakeX * 0.3;
    const y = 80 + (index % 4) * 32;
    drawCloud(x, y, 0.75 + (index % 3) * 0.16);
  }

  ctx.restore();
}

function drawConveyor() {
  const geometry = getConveyorGeometry();
  const dx = geometry.endX - geometry.startX;
  const dy = geometry.endY - geometry.startY;
  const angle = Math.atan2(dy, dx);
  const length = Math.hypot(dx, dy);
  const offset = (state.beltTime * BALANCE.conveyor.slatSpeed) % BALANCE.conveyor.slatGap;

  ctx.save();
  ctx.translate(geometry.startX, geometry.startY);
  ctx.rotate(angle);

  ctx.strokeStyle = "rgba(27, 15, 9, 0.34)";
  ctx.lineWidth = geometry.width + 10;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(length, 0);
  ctx.stroke();

  ctx.strokeStyle = "#2c251f";
  ctx.lineWidth = geometry.width;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(length, 0);
  ctx.stroke();

  ctx.strokeStyle = "#50463e";
  ctx.lineWidth = geometry.width - 18;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(length, 0);
  ctx.stroke();

  ctx.strokeStyle = "rgba(255, 238, 207, 0.12)";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(0, -(geometry.width * 0.28));
  ctx.lineTo(length, -(geometry.width * 0.28));
  ctx.stroke();

  for (let position = -offset; position <= length + BALANCE.conveyor.slatGap; position += BALANCE.conveyor.slatGap) {
    ctx.fillStyle = "rgba(235, 221, 197, 0.12)";
    ctx.fillRect(position, -(geometry.width * 0.33), 7, geometry.width * 0.66);
  }

  ctx.fillStyle = "#5d3f27";
  ctx.beginPath();
  ctx.arc(0, 0, geometry.width * 0.33, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(length, 0, geometry.width * 0.33, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#27170d";
  ctx.beginPath();
  ctx.arc(0, 0, geometry.width * 0.14, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(length, 0, geometry.width * 0.14, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function drawInfeedApple() {
  if (!state.infeed) {
    return;
  }

  const visual = getInfeedVisual();
  drawApple({
    level: state.infeed.level,
    special: state.infeed.special,
    x: visual.x,
    y: visual.y,
    r: APPLE_TYPES[state.infeed.level].radius,
    spin: visual.spin,
  }, 1);
}

function drawOrchardBack() {
  const orchard = getOrchardBounds();
  const dangerRatio = clamp(state.run.dangerRatio, 0, 1);
  const redLineRatio = clamp(state.run.redLineFrames / BALANCE.redLineHoldFrames, 0, 1);
  ctx.save();

  const wood = ctx.createLinearGradient(0, orchard.y, 0, orchard.bottom);
  wood.addColorStop(0, "#71411d");
  wood.addColorStop(1, "#4b2c16");

  ctx.fillStyle = wood;
  ctx.fillRect(orchard.x - 18, orchard.y + 16, 18, orchard.h + 18);
  ctx.fillRect(orchard.x + orchard.w, orchard.y + 16, 18, orchard.h + 18);
  ctx.fillRect(orchard.x - 18, orchard.bottom, orchard.w + 36, 34);

  const binGradient = ctx.createLinearGradient(0, orchard.y, 0, orchard.bottom);
  binGradient.addColorStop(0, "rgba(255, 246, 225, 0.26)");
  binGradient.addColorStop(1, "rgba(70, 46, 28, 0.44)");
  ctx.fillStyle = binGradient;
  ctx.fillRect(orchard.x, orchard.y, orchard.w, orchard.h);

  ctx.fillStyle = "rgba(255, 255, 255, 0.045)";
  const gridStepX = 68;
  const gridStepY = 46;
  const gridOffsetX = ((orchard.x - BASE_ORCHARD.x) % gridStepX + gridStepX) % gridStepX;
  const gridOffsetY = ((orchard.y - BASE_ORCHARD.y) % gridStepY + gridStepY) % gridStepY;
  for (let x = orchard.x + (gridStepX - gridOffsetX); x < orchard.x + orchard.w; x += gridStepX) {
    ctx.fillRect(x, orchard.y, 1, orchard.h);
  }
  for (let y = orchard.y + (gridStepY - gridOffsetY); y < orchard.bottom; y += gridStepY) {
    ctx.fillRect(orchard.x, y, orchard.w, 1);
  }

  ctx.strokeStyle = `rgba(255, ${Math.round(208 - dangerRatio * 60)}, ${Math.round(118 - dangerRatio * 40)}, ${0.25 + dangerRatio * 0.65})`;
  ctx.lineWidth = 4;
  ctx.setLineDash([14, 12]);
  ctx.beginPath();
  ctx.moveTo(orchard.x + 12, orchard.dangerY);
  ctx.lineTo(orchard.x + orchard.w - 12, orchard.dangerY);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.fillStyle = `rgba(255, 120, 84, ${0.06 + dangerRatio * 0.18})`;
  ctx.fillRect(orchard.x, orchard.y, orchard.w, orchard.dangerY - orchard.y);

  ctx.strokeStyle = `rgba(255, 68, 68, ${0.45 + redLineRatio * 0.5})`;
  ctx.lineWidth = 3 + redLineRatio * 2;
  ctx.beginPath();
  ctx.moveTo(orchard.x + 10, orchard.redLineY);
  ctx.lineTo(orchard.x + orchard.w - 10, orchard.redLineY);
  ctx.stroke();

  ctx.fillStyle = `rgba(255, 88, 88, ${0.08 + redLineRatio * 0.12})`;
  ctx.fillRect(orchard.x, orchard.y, orchard.w, orchard.redLineY - orchard.y);

  const pulseAlpha = Math.max(0, state.boxAnimation.pulse * 0.42);
  if (pulseAlpha > 0) {
    ctx.strokeStyle = `rgba(144, 238, 185, ${pulseAlpha})`;
    ctx.lineWidth = 10;
    ctx.strokeRect(orchard.x - 14, orchard.y - 14, orchard.w + 28, orchard.h + 28);
  }

  ctx.font = '700 18px "Avenir Next Condensed", "Arial Narrow", sans-serif';
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = `rgba(255, 245, 228, ${0.5 + dangerRatio * 0.4})`;
  ctx.fillText("DANGER LINE", orchard.x + 18, orchard.dangerY - 12);
  ctx.fillStyle = `rgba(255, 198, 198, ${0.55 + redLineRatio * 0.35})`;
  ctx.fillText("FAIL LINE · 2 APPLES / 2.0s", orchard.x + 18, orchard.redLineY - 12);

  ctx.restore();
}

function drawApples() {
  const apples = state.apples.slice().sort((left, right) => left.y - right.y);
  for (const apple of apples) {
    drawAppleShadow(apple);
  }
  for (const apple of apples) {
    drawApple(apple, 1);
  }
}

function drawAppleShadow(apple) {
  ctx.save();
  ctx.globalAlpha = 0.14;
  ctx.fillStyle = "#1a0f0a";
  ctx.beginPath();
  ctx.ellipse(apple.x, apple.y + apple.r * 0.92, apple.r * 0.78, apple.r * 0.28, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawApple(apple, alpha) {
  const appleType = APPLE_TYPES[apple.level];
  const special = apple.special ? SPECIAL_TYPES[apple.special] : null;
  const badgeRadius = Math.max(11, apple.r * 0.33);
  const badgeFontSize = Math.max(12, apple.r * 0.48);

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(apple.x, apple.y);
  ctx.rotate(apple.spin || 0);

  if (special) {
    ctx.save();
    ctx.globalAlpha = alpha * 0.72;
    ctx.strokeStyle = special.glow;
    ctx.lineWidth = Math.max(5, apple.r * 0.09);
    ctx.shadowColor = special.glow;
    ctx.shadowBlur = Math.max(22, apple.r * 0.5);
    ctx.beginPath();
    ctx.arc(0, 0, apple.r * 1.04, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  const gradient = ctx.createRadialGradient(-apple.r * 0.32, -apple.r * 0.36, apple.r * 0.14, 0, 0, apple.r);
  gradient.addColorStop(0, appleType.highlight);
  gradient.addColorStop(0.65, appleType.color);
  gradient.addColorStop(1, appleType.shadow);

  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(0, 0, apple.r, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "rgba(255, 255, 255, 0.18)";
  ctx.beginPath();
  ctx.ellipse(-apple.r * 0.3, -apple.r * 0.28, apple.r * 0.26, apple.r * 0.14, -0.4, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "rgba(45, 19, 10, 0.18)";
  ctx.beginPath();
  ctx.arc(0, apple.r * 0.3, apple.r * 0.62, 0.15, Math.PI - 0.15);
  ctx.fill();

  ctx.fillStyle = "#744b30";
  ctx.fillRect(-apple.r * 0.06, -apple.r - 9, apple.r * 0.12, apple.r * 0.42);

  ctx.fillStyle = appleType.leaf;
  ctx.beginPath();
  ctx.ellipse(apple.r * 0.34, -apple.r * 0.66, apple.r * 0.34, apple.r * 0.14, 0.55, 0, Math.PI * 2);
  ctx.fill();

  if (apple.special === "bomb") {
    ctx.strokeStyle = "#f7d0a8";
    ctx.lineWidth = Math.max(2, apple.r * 0.05);
    ctx.beginPath();
    ctx.moveTo(apple.r * 0.06, -apple.r - 10);
    ctx.quadraticCurveTo(apple.r * 0.26, -apple.r - 28, apple.r * 0.38, -apple.r - 18);
    ctx.stroke();
    ctx.fillStyle = "#ffcc6e";
    ctx.beginPath();
    ctx.arc(apple.r * 0.4, -apple.r - 20, Math.max(4, apple.r * 0.08), 0, Math.PI * 2);
    ctx.fill();
  }

  if (apple.special === "prism") {
    ctx.strokeStyle = "rgba(210, 255, 255, 0.78)";
    ctx.lineWidth = Math.max(3, apple.r * 0.05);
    ctx.beginPath();
    ctx.arc(0, 0, apple.r * 0.9, state.time * 0.07, state.time * 0.07 + Math.PI * 1.35);
    ctx.stroke();
  }

  if (apple.level >= 5) {
    ctx.strokeStyle = "rgba(255, 241, 188, 0.5)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, apple.r * 0.78, 0, Math.PI * 2);
    ctx.stroke();
  }

  if (apple.level === APPLE_TYPES.length - 1) {
    ctx.strokeStyle = "rgba(255, 255, 255, 0.65)";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(0, 0, apple.r * 0.92, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.fillStyle = "rgba(255, 248, 238, 0.9)";
  ctx.beginPath();
  ctx.arc(0, apple.r * 0.08, badgeRadius, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "rgba(70, 38, 21, 0.16)";
  ctx.lineWidth = Math.max(1.5, apple.r * 0.05);
  ctx.stroke();

  ctx.fillStyle = "rgba(63, 35, 17, 0.9)";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = `700 ${badgeFontSize}px "Avenir Next Condensed", "Arial Narrow", sans-serif`;
  ctx.fillText(String(apple.level + 1), 0, apple.r * 0.12);

  if (special) {
    ctx.fillStyle = special.accent;
    ctx.font = `800 ${Math.max(10, apple.r * 0.18)}px "Avenir Next Condensed", "Arial Narrow", sans-serif`;
    ctx.fillText(special.shortLabel, 0, apple.r * 0.48);
  }

  ctx.restore();
}

function drawParticlesOnCanvas() {
  for (const particle of state.particles) {
    ctx.save();
    ctx.globalAlpha = particle.life / 42;
    ctx.fillStyle = particle.color;
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

function drawShockwavesOnCanvas() {
  for (const ring of state.shockwaves) {
    ctx.save();
    ctx.globalAlpha = ring.life / ring.maxLife;
    ctx.strokeStyle = ring.color;
    ctx.lineWidth = ring.lineWidth;
    ctx.beginPath();
    ctx.arc(ring.x, ring.y, ring.radius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }
}

function drawFloatingTextOnCanvas() {
  ctx.save();
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  for (const label of state.floatingTexts) {
    ctx.save();
    ctx.globalAlpha = label.life / 58;
    ctx.fillStyle = label.color;
    ctx.font = '700 28px "Avenir Next Condensed", "Arial Narrow", sans-serif';
    ctx.fillText(label.text, label.x, label.y);
    ctx.restore();
  }

  ctx.restore();
}

function drawOrchardFront() {
  const orchard = getOrchardBounds();
  const lipGradient = ctx.createLinearGradient(0, orchard.bottom - 8, 0, orchard.bottom + 42);
  lipGradient.addColorStop(0, "#98602f");
  lipGradient.addColorStop(1, "#5e391d");
  ctx.fillStyle = lipGradient;
  ctx.fillRect(orchard.x - 26, orchard.bottom - 4, orchard.w + 52, 40);

  ctx.fillStyle = "rgba(255, 243, 219, 0.12)";
  ctx.fillRect(orchard.x - 26, orchard.bottom - 4, orchard.w + 52, 6);

  ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
  for (let x = orchard.x - 12; x < orchard.x + orchard.w + 12; x += 88) {
    ctx.fillRect(x, orchard.bottom + 10, 40, 5);
  }
}

function drawSkillLid() {
  if (state.spin.lidProgress <= 0) {
    return;
  }

  const orchard = getOrchardBounds();
  const lidTravel = 56;
  const lidY = orchard.y - lidTravel + lidTravel * state.spin.lidProgress;
  const lidWidth = orchard.w + 52;
  const lidX = orchard.x - 26;
  const lidHeight = 34;

  const lidGradient = ctx.createLinearGradient(0, lidY, 0, lidY + lidHeight);
  lidGradient.addColorStop(0, "#c08a54");
  lidGradient.addColorStop(1, "#7c4d28");
  ctx.fillStyle = lidGradient;
  ctx.fillRect(lidX, lidY, lidWidth, lidHeight);

  ctx.fillStyle = "rgba(255, 241, 219, 0.18)";
  ctx.fillRect(lidX, lidY, lidWidth, 5);
  ctx.fillStyle = "rgba(67, 38, 18, 0.2)";
  for (let x = lidX + 24; x < lidX + lidWidth - 24; x += 92) {
    ctx.fillRect(x, lidY + 10, 48, 6);
  }
}

function drawScene() {
  const shakeX = state.shake === 0 ? 0 : Math.sin(state.time * 1.7) * state.shake;
  const shakeY = state.shake === 0 ? 0 : Math.cos(state.time * 1.35) * state.shake * 0.45;
  const orchard = getOrchardBounds();
  const viewportAnchor = getViewportAnchor();
  const cameraScale = getCameraScale();

  ctx.clearRect(0, 0, WIDTH, HEIGHT);
  drawBackdrop(shakeX);

  ctx.save();
  ctx.translate(shakeX, shakeY);
  ctx.translate(viewportAnchor.centerX, viewportAnchor.centerY);
  ctx.scale(cameraScale, cameraScale);
  ctx.translate(-viewportAnchor.centerX, -viewportAnchor.centerY);
  drawConveyor();
  drawInfeedApple();
  ctx.restore();

  ctx.save();
  ctx.translate(shakeX, shakeY);
  ctx.translate(viewportAnchor.centerX, viewportAnchor.centerY);
  ctx.scale(cameraScale, cameraScale);
  ctx.translate(-viewportAnchor.centerX, -viewportAnchor.centerY);
  ctx.translate(orchard.centerX, orchard.centerY);
  ctx.rotate(state.spin.angle);
  ctx.translate(-orchard.centerX, -orchard.centerY);
  drawOrchardBack();
  drawApples();
  drawParticlesOnCanvas();
  drawShockwavesOnCanvas();
  drawFloatingTextOnCanvas();
  drawSkillLid();
  drawOrchardFront();
  ctx.restore();

  if (state.screenFlash > 0) {
    ctx.save();
    ctx.globalAlpha = state.screenFlash;
    ctx.fillStyle = state.screenFlashColor;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    ctx.restore();
  }
}

function handleShopClick(event) {
  const button = event.target.closest("[data-shop][data-key]");
  if (!button) {
    return;
  }

  const shop = button.dataset.shop;
  const key = button.dataset.key;
  if (shop === "run") {
    purchaseRunUpgrade(key);
  } else if (shop === "lab") {
    purchaseMetaUpgrade(key);
  }
}

function handleDevSpeedClick(event) {
  const button = event.target.closest("[data-speed]");
  if (!button) {
    return;
  }
  setDevSpeed(button.dataset.speed);
}

function handleMenuTabClick(event) {
  const button = event.target.closest("[data-menu]");
  if (!button) {
    return;
  }
  setActiveMenu(button.dataset.menu);
}

function handleOverlayClick(event) {
  const restartButton = event.target.closest("#overlayRestartButton");
  if (restartButton) {
    startNewRun();
  }
}

function handleKeyDown(event) {
  if (event.code === "KeyP") {
    togglePause();
    event.preventDefault();
  }

  if (event.code === "KeyR") {
    startNewRun();
    event.preventDefault();
  }

  if (event.code === "KeyS") {
    attemptSellCrate();
    event.preventDefault();
  }

  if (event.code === "Escape" && state.offlineSummary) {
    dismissOfflineModal();
    event.preventDefault();
  }
}

function handleVisibilityChange() {
  if (document.hidden) {
    state.hiddenAt = Date.now();
    saveState();
    return;
  }

  if (state.hiddenAt) {
    const elapsedSeconds = clamp((Date.now() - state.hiddenAt) / 1000, 0, BALANCE.offlineCapSeconds);
    const gain = applyOfflineGain(elapsedSeconds);
    if (gain > 0) {
      state.offlineSummary = {
        elapsedSeconds,
        gain,
      };
    }
    state.hiddenAt = null;
    syncUi(true);
    saveState();
  }
}

function primeAudio() {
  audioManager.unlock();
}

function frame(timestamp) {
  if (state.lastTimestamp === 0) {
    state.lastTimestamp = timestamp;
  }

  const delta = Math.min(32, timestamp - state.lastTimestamp);
  state.lastTimestamp = timestamp;
  state.accumulator = Math.min(state.accumulator + delta * state.devSpeed, PHYSICS.stepMs * 32);

  while (state.accumulator >= PHYSICS.stepMs) {
    if (!state.paused && state.run.alive) {
      worldStep();
    } else {
      updateParticles();
      updateShockwaves();
      updateFloatingTexts();
      state.screenFlash *= 0.9;
      if (state.screenFlash < 0.02) {
        state.screenFlash = 0;
      }
    }
    state.accumulator -= PHYSICS.stepMs;
  }

  drawScene();
  requestAnimationFrame(frame);
}

function getPointValueAtRealTier(tierReal) {
  const clamped = clamp(tierReal, 0, APPLE_TYPES.length - 1);
  const lower = Math.floor(clamped);
  const upper = Math.min(APPLE_TYPES.length - 1, lower + 1);
  const mix = clamped - lower;
  return APPLE_TYPES[lower].points * (1 - mix) + APPLE_TYPES[upper].points * mix;
}

function getSampleProfile(profile) {
  if (typeof profile === "string") {
    if (profile === "mid") {
      return {
        meta: {
          starterFund: 10,
          durableCrate: 9,
          bombOrchard: 3,
          prismOrchard: 2,
          expansionEngineering: 8,
          offlineOrchard: 8,
          mergeLedger: 7,
        },
      };
    }

    if (profile === "late") {
      return {
        meta: {
          starterFund: 25,
          durableCrate: 20,
          bombOrchard: 6,
          prismOrchard: 5,
          expansionEngineering: 18,
          offlineOrchard: 22,
          mergeLedger: 18,
        },
      };
    }

    return {
      meta: {},
    };
  }

  return profile || {
    meta: {},
  };
}

function normalizeProfileMeta(profile) {
  const meta = createMetaState();
  const custom = (profile && profile.meta) || {};

  Object.keys(meta.upgrades).forEach((key) => {
    const definition = META_UPGRADES[key];
    const limit = typeof definition.cap === "number" ? definition.cap : BALANCE.sanityLevelCap;
    meta.upgrades[key] = clamp(Number(custom[key]) || 0, 0, limit);
  });

  return meta;
}

function chooseSamplePurchase(meta, runLevels, cash, danger) {
  const priorities = [];

  if (danger > 0.58) {
    priorities.push("crateExpansion", "autoSpinner", "shockEngine", "valuePress", "dropMotor");
  } else {
    priorities.push("dropMotor", "valuePress", "crateExpansion", "dropTier", "autoSpinner", "shockEngine");
  }

  if (meta.upgrades.bombOrchard > 0) {
    priorities.push("bombSeeder");
  }
  if (meta.upgrades.prismOrchard > 0) {
    priorities.push("prismSeeder");
  }

  priorities.push("dropTier");

  for (const key of priorities) {
    const cost = getRunUpgradeCost(key, runLevels[key], meta);
    if (cash >= cost) {
      return key;
    }
  }

  return null;
}

function sampleSingleRun(profileMeta) {
  const meta = normalizeProfileMeta(profileMeta);
  const runLevels = emptyUpgradeLevels(RUN_UPGRADES);
  let score = 0;
  let cash = getStarterCash(meta);
  let timeSeconds = 0;
  let danger = 0;
  let applesApprox = 0;
  let topTier = 0;
  let totalSpend = 0;
  let sold = false;
  let appraisal = 0;

  while (timeSeconds < 3600) {
    const season = Math.floor(timeSeconds / 75);
    const fakeRun = {
      upgrades: runLevels,
      season,
    };
    const interval = getDropIntervalFrames(fakeRun);
    const dropsPerSecond = 60 / interval;
    const tierReal = getDropTierReal(fakeRun);
    const pointValue = getPointValueAtRealTier(tierReal);
    const special = getSpecialChances(meta, fakeRun);
    const shock = getShockMultiplier(fakeRun);
    const boxScale = getBoxScaleForLevel(runLevels.crateExpansion);
    const dangerLimit = getDangerLimit(meta);
    const valueMult = getCombinedValueMultiplier(meta, fakeRun);
    const spinner = getAutoSpinnerSpec(fakeRun);
    const seasonHazard = getSeasonHazard(season);

    const mergeEfficiency = 0.42 + 0.09 * Math.log1p(boxScale * 3) + 0.04 * Math.log1p(shock);
    const specialValueBoost = 1 + special.bomb * 0.55 + special.prism * 0.95;
    const gainPerSecond = dropsPerSecond * pointValue * mergeEfficiency * valueMult * specialValueBoost * (0.88 + Math.random() * 0.24);

    score += gainPerSecond;
    cash += gainPerSecond;
    topTier = Math.max(topTier, Math.floor(tierReal + Math.random() * 2));

    applesApprox += dropsPerSecond * (0.38 + tierReal * 0.12) - (0.18 + Math.log1p(boxScale) * 0.24);
    applesApprox = Math.max(0, applesApprox);

    const pressure = dropsPerSecond * (0.36 + tierReal * 0.18) / Math.max(1.1, 1 + boxScale * 0.9 + dangerLimit / 180);
    const relief = 0.06 * shock + (spinner ? (0.18 + (0.88 - spinner.threshold) * 0.7) : 0);
    danger += Math.max(0, pressure * seasonHazard - relief) * (0.85 + Math.random() * 0.3);
    danger -= 0.03 + Math.log1p(boxScale) * 0.02;
    danger = clamp(danger, 0, 1.4);

    for (let purchases = 0; purchases < 6; purchases += 1) {
      const next = chooseSamplePurchase(meta, runLevels, cash, danger);
      if (!next) {
        break;
      }
      const purchaseCost = getRunUpgradeCost(next, runLevels[next], meta);
      if (cash < purchaseCost) {
        break;
      }
      cash -= purchaseCost;
      totalSpend += purchaseCost;
      runLevels[next] += 1;
    }

    if (
      timeSeconds >= BALANCE.sellGateFrames / 60
      && (score >= BALANCE.sellGateScore || applesApprox >= BALANCE.sellGateApples || topTier >= BALANCE.sellGateTier)
      && danger >= 0.62
    ) {
      sold = true;
      break;
    }

    if (danger >= 1) {
      sold = false;
      break;
    }

    timeSeconds += 1;
  }

  if (sold) {
    appraisal = score * clamp(0.18 + 0.04 * Math.log1p(getBoxScaleForLevel(runLevels.crateExpansion)) + 0.02 * Math.log1p(topTier + 1), 0.18, 0.30);
  }

  return {
    runtime: timeSeconds,
    sold,
    sellBonusRatio: sold ? appraisal / Math.max(1, score) : 0,
    bankGain: score + appraisal,
    spend: totalSpend,
  };
}

function summarizeRuns(results) {
  const runtimes = results.map((item) => item.runtime).sort((a, b) => a - b);
  const bonuses = results.map((item) => item.sellBonusRatio).sort((a, b) => a - b);
  const gains = results.map((item) => item.bankGain).sort((a, b) => a - b);
  const spends = results.map((item) => item.spend).sort((a, b) => a - b);
  const soldRuns = results.filter((item) => item.sold).length;

  function quantile(values, q) {
    if (values.length === 0) {
      return 0;
    }
    const index = clamp(Math.floor(q * (values.length - 1)), 0, values.length - 1);
    return values[index];
  }

  const medianGain = quantile(gains, 0.5);
  const medianSpend = quantile(spends, 0.5);

  return {
    runs: results.length,
    sellRate: Number((soldRuns / Math.max(1, results.length)).toFixed(3)),
    medianRuntimeSec: Number(quantile(runtimes, 0.5).toFixed(1)),
    p90RuntimeSec: Number(quantile(runtimes, 0.9).toFixed(1)),
    medianSellBonus: Number((quantile(bonuses, 0.5) * 100).toFixed(2)),
    medianBankGain: safeRound(medianGain),
    marginalRoiSlope: Number((medianGain / Math.max(1, medianSpend)).toFixed(4)),
  };
}

window.__appleBalance = {
  sample(profile, runs) {
    const resolvedProfile = getSampleProfile(profile);
    const iterations = clamp(Number(runs) || 200, 10, 500);
    const results = [];

    for (let index = 0; index < iterations; index += 1) {
      results.push(sampleSingleRun(resolvedProfile));
    }

    const summary = summarizeRuns(results);
    console.table(summary);
    return summary;
  },
};

ui.runShop.addEventListener("click", handleShopClick);
ui.labShop.addEventListener("click", handleShopClick);
ui.devSpeedControls.addEventListener("click", handleDevSpeedClick);
ui.menuTabs.addEventListener("click", handleMenuTabClick);
ui.restartButton.addEventListener("click", startNewRun);
ui.pauseButton.addEventListener("click", () => togglePause());
ui.sellButton.addEventListener("click", attemptSellCrate);
ui.overlay.addEventListener("click", handleOverlayClick);
ui.offlineDismissButton.addEventListener("click", dismissOfflineModal);
window.addEventListener("keydown", handleKeyDown, { passive: false });
window.addEventListener("beforeunload", saveState);
document.addEventListener("visibilitychange", handleVisibilityChange);
window.addEventListener("pointerdown", primeAudio, { once: true, passive: true });
window.addEventListener("keydown", primeAudio, { once: true });

buildLegend();
syncUi(true);
requestAnimationFrame(frame);
