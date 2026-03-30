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
  summonButton: document.getElementById("summonButton"),
  controlDock: document.querySelector(".control-dock"),
  devSpeedControls: document.getElementById("devSpeedControls"),
  menuTabs: document.getElementById("menuTabs"),
  bottomSheet: document.getElementById("bottomSheet"),
  sheetTitle: document.getElementById("sheetTitle"),
  guideButton: document.getElementById("guideButton"),
  guideDockButton: document.getElementById("guideDockButton"),
  guideModal: document.getElementById("guideModal"),
  guideTabs: document.getElementById("guideTabs"),
  guideContent: document.getElementById("guideContent"),
  guideCloseButton: document.getElementById("guideCloseButton"),
};

const WIDTH = canvas.width;
const HEIGHT = canvas.height;
const BASE_ORCHARD = {
  x: 92,
  y: 144,
  w: 716,
  h: 776,
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
const GUIDE_PANES = ["basics", "auction", "traits", "specials"];
const UPGRADE_ASSET_PATHS = {
  dropMotor: "assets/belt_accel.png",
  crateExpansion: "assets/box_expand.png",
  bombSeeder: "assets/bomb_drop.png",
  prismSeeder: "assets/prism_culture.png",
  shockEngine: "assets/impact_amplification.png",
  autoSpinner: "assets/auto_flip.png",
  dangerBuffer: "assets/danger_buffer.png",
  valuePress: "assets/value_press.png",
  dropTier: "assets/breed_upgrade.png",
  starterFund: "assets/start_grant.png",
  durableCrate: "assets/durable_wood.png",
  bombOrchard: "assets/bomb_orchard.png",
  prismOrchard: "assets/prism_research.png",
  expansionEngineering: "assets/expansion_engineering.png",
  conveyorWorkshop: "assets/conveyor_belt_icon.png",
  brokerageOffice: "assets/fee_negotiation.png",
  twinConveyor: "assets/twin_belt.png",
  goldenMulch: "assets/gold_fertilizer.png",
  sortingShed: "assets/sorting_warehouse.png",
  offlineOrchard: "assets/offline_harvest.png",
  mergeLedger: "assets/gold_pesticide.png",
};

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
  dangerZoneHeightRatio: 0.12,
  dangerZoneBaseBottomRatio: 0.14,
  dangerZoneMaxBottomRatio: 0.30,
  sellGateFrames: 72 * 60,
  sellGateValue: 1200,
  sellGateApples: 22,
  sellGateTier: 7,
  redLineRatio: 0.068,
  redLineHoldFrames: 2 * 60,
  boxExpandFrames: 39,
  boxExpandStep: 0.06,
  spin: {
    closeFrames: 24,
    rotateFrames: 300,
    openFrames: 24,
  },
  sale: {
    packFrames: 86,
    shipFrames: 148,
    burstGapFrames: 3,
  },
  overlayAutoAdvanceMs: 30 * 1000,
  crateBurstWarnFrames: 5 * 60,
  crateBurstExplodeFrames: 56,
  conveyor: {
    width: 68,
    laneOuterOffset: 150,
    laneEndOffset: 26,
    startYOffset: -192,
    endYOffset: -62,
    minFrames: 8,
    maxFrames: 24,
    slatGap: 22,
    slatSpeed: 4.2,
  },
  audio: {
    maxVoices: 18,
    minGapMs: 22,
    eventCooldownMs: {
      "ui-hover": 24,
      "ui-denied": 110,
      "ui-confirm": 36,
      pause: 80,
      restart: 120,
      sell: 180,
      summon: 70,
      "offline-dismiss": 120,
      "drop-release": 32,
      merge: 24,
      bomb: 80,
      prism: 70,
      "spinner-start": 260,
      "spinner-end": 180,
      "crate-expand": 130,
      "crate-burst": 260,
      gameOver: 220,
    },
  },
};

const RUN_UPGRADES = {
  dropMotor: {
    label: "급송 벨트",
    tag: "런",
    icon: "MTR",
    asset: "belt",
    note: "사과가 벨트에서 더 자주 굴러 나오게 합니다.",
  },
  crateExpansion: {
    label: "넉넉한 상자",
    tag: "런",
    icon: "BOX",
    asset: "crate",
    note: "상자 안 공간을 넓혀 더 오래 버티게 합니다.",
  },
  bombSeeder: {
    label: "폭탄 접목",
    tag: "런",
    icon: "BMB",
    asset: "bomb",
    note: "배치를 흔드는 폭탄 사과가 드물게 섞여 들어옵니다.",
  },
  prismSeeder: {
    label: "무지개 접목",
    tag: "런",
    icon: "PRM",
    asset: "prism",
    note: "등급을 끌어올리는 프리즘 사과를 더 자주 섞습니다.",
  },
  shockEngine: {
    label: "충격 교반기",
    tag: "런",
    icon: "SHK",
    asset: "shock",
    note: "폭탄 사과가 더 넓고 세게 더미를 흔듭니다.",
  },
  autoSpinner: {
    label: "자동 뒤집개",
    tag: "런",
    icon: "SPN",
    asset: "spin",
    note: "위험 구역이 차오르면 상자를 자동으로 돌려 정리합니다.",
  },
  dangerBuffer: {
    label: "안전 여유",
    tag: "런",
    icon: "DNG",
    asset: "zone",
    note: "자동 회전이 반응하는 위험 구역을 더 아래로 늦춥니다.",
  },
  valuePress: {
    label: "프리미엄 선별",
    tag: "런",
    icon: "VAL",
    asset: "value",
    note: "사과를 더 잘 골라 이번 런 점수와 재화가 함께 늘어납니다.",
  },
  dropTier: {
    label: "우량 품종",
    tag: "런",
    icon: "TIR",
    asset: "tier",
    note: "아주 비싼 값으로 더 좋은 품종이 벨트에 실리기 시작합니다.",
  },
};

const META_UPGRADES = {
  starterFund: {
    label: "종잣돈",
    tag: "연구",
    icon: "STA",
    asset: "start",
    note: "다음 런의 초반 투자 속도를 크게 올립니다.",
  },
  durableCrate: {
    label: "단단한 상자틀",
    tag: "연구",
    icon: "DRB",
    asset: "wood",
    note: "자동 판매선에 잠깐 걸친 사과가 내려가면 경고가 더 빨리 가라앉게 합니다.",
  },
  bombOrchard: {
    label: "폭탄 과수원",
    tag: "연구",
    icon: "ORB",
    asset: "bomb",
    cap: 6,
    note: "폭탄 사과를 해금하고 기본 확률을 강화합니다.",
  },
  prismOrchard: {
    label: "무지개 육종실",
    tag: "연구",
    icon: "ORP",
    asset: "prism",
    cap: 5,
    note: "프리즘 사과를 해금하고 기본 출현률을 높입니다.",
  },
  expansionEngineering: {
    label: "상자 개량소",
    tag: "연구",
    icon: "ENG",
    asset: "eng",
    note: "상자 확장 비용을 낮추고 화면 안정화를 제공합니다.",
  },
  conveyorWorkshop: {
    label: "벨트 정비소",
    tag: "연구",
    icon: "CVY",
    asset: "belt",
    note: "모든 벨트의 사과 투입 간격을 줄이고, 일정 단계부터 중앙 급송 벨트를 엽니다.",
  },
  brokerageOffice: {
    label: "경매 중개소",
    tag: "연구",
    icon: "FEE",
    asset: "fee",
    note: "자동 판매 수수료를 줄여 놓친 런의 손실을 줄입니다.",
  },
  twinConveyor: {
    label: "보조 벨트",
    tag: "연구",
    icon: "TWN",
    asset: "dual",
    cap: 1,
    note: "오른쪽 보조 컨베이어를 설치해 양방향 공급을 엽니다.",
  },
  goldenMulch: {
    label: "황금 거름",
    tag: "연구",
    icon: "GLD",
    asset: "gold",
    note: "황금 사과 등장률과 황금 보너스를 조금씩 키웁니다.",
  },
  sortingShed: {
    label: "선별 작업장",
    tag: "연구",
    icon: "ROT",
    asset: "sort",
    note: "썩은 사과 등장률을 줄여 상자 감액을 막습니다.",
  },
  offlineOrchard: {
    label: "부재중 수확",
    tag: "연구",
    icon: "OFF",
    asset: "idle",
    note: "접속하지 않은 동안 쌓이는 연구 자금을 늘립니다.",
  },
  mergeLedger: {
    label: "고급 농약",
    tag: "연구",
    icon: "MED",
    asset: "spray",
    note: "더 좋은 약을 써서 모든 사과의 점수와 런 재화 가치를 바로 끌어올립니다.",
  },
};

const SPECIAL_TYPES = {
  bomb: {
    name: "폭탄사과",
    shortLabel: "폭",
    accent: "#ff6b39",
    glow: "rgba(255, 120, 70, 0.9)",
  },
  prism: {
    name: "프리즘사과",
    shortLabel: "빛",
    accent: "#7a6bff",
    glow: "rgba(127, 226, 255, 0.95)",
  },
};

const TRAIT_TYPES = {
  golden: {
    name: "황금사과",
    shortLabel: "금",
    accent: "#ffd24b",
    glow: "rgba(255, 214, 92, 0.95)",
  },
  rotten: {
    name: "썩은사과",
    shortLabel: "썩",
    accent: "#8bb651",
    glow: "rgba(137, 182, 83, 0.9)",
  },
};

const AUCTION_HOUSES = [
  {
    key: "roadside",
    name: "길가 좌판",
    shortLabel: "좌판",
    multiplier: 0.92,
    color: "#d39d61",
  },
  {
    key: "town",
    name: "동네 경매장",
    shortLabel: "동네",
    multiplier: 1,
    color: "#76b169",
  },
  {
    key: "night",
    name: "야시장 경매",
    shortLabel: "야시장",
    multiplier: 1.12,
    color: "#6d92e8",
  },
  {
    key: "golden",
    name: "황금 사과 경매",
    shortLabel: "황금장",
    multiplier: 1.26,
    color: "#f0be48",
  },
  {
    key: "royal",
    name: "왕실 과수원 경매",
    shortLabel: "왕실",
    multiplier: 1.42,
    color: "#b782ff",
  },
];

const GUIDE_DATA = {
  basics: {
    label: "기본",
    items: [
      { icon: "RUN", asset: "assets/conveyor_belt_icon.png", title: "이번 런 목표", body: "사과는 자동으로 떨어집니다. 상자 안 사과의 경매 가치를 키우고, 적절한 타이밍에 경매장에 넘기는 것이 핵심입니다." },
      { icon: "BOX", asset: "assets/auto_sell_warning.png", title: "상자 상태", body: "위험 구역이 차오르면 자동 뒤집기가 작동하고, 빨간 자동 판매선에 오래 걸리면 수수료를 떼고 강제 경매됩니다." },
      { icon: "R$", asset: "assets/run_coin.png", title: "런 재화", body: "점수와 함께 쌓이며 이번 런 상점에서만 사용합니다. 런이 끝나면 사라집니다." },
      { icon: "L$", asset: "assets/research_liquid.png", title: "과수원 자금", body: "경매가 끝날 때 들어오는 영구 자금입니다. 연구소 업그레이드를 사서 다음 런을 더 강하게 만듭니다." },
    ],
  },
  auction: {
    label: "경매",
    items: [
      { icon: "BID", asset: "assets/auction_house.png", title: "경매 등급", body: "박스를 팔 때마다 좌판, 동네, 야시장, 황금장, 왕실 경매 중 하나가 랜덤으로 붙습니다. 등급이 높을수록 배수가 커집니다." },
      { icon: "GAV", asset: "assets/settlement_ledger.png", title: "상자 예상가", body: "화면에 보이는 값은 경매 전 예상가입니다. 실제 판매 순간 경매 등급, 황금 보너스, 썩은 감액이 합산됩니다." },
      { icon: "FEE", asset: "assets/auto_sell_warning.png", title: "자동 판매", body: "상자가 너무 넘치면 자동으로 경매장에 끌려가며 수수료를 뗍니다. 수수료 협상 연구로 손해를 줄일 수 있습니다." },
      { icon: "PRE", asset: "assets/manual_sell_btn.png", title: "도파민 정산", body: "판매할 때 고급 사과 보너스가 하나씩 빠르게 튀어나오고, 마지막에 경매장이 총액을 확정합니다." },
    ],
  },
  traits: {
    label: "속성",
    items: [
      { icon: "GLD", asset: "assets/gold_apple.png", title: "황금 사과", body: "경매에서 따로 큰 보너스를 줍니다. 황금 사과끼리 합치거나 일반 사과와 합치면 계속 황금 속성이 유지됩니다." },
      { icon: "ROT", asset: "assets/rotten_apple.png", title: "썩은 사과", body: "박스 전체 경매가를 퍼센트로 깎아먹습니다. 썩은 사과끼리 합치거나 일반 사과와 합치면 계속 썩은 속성이 남습니다." },
      { icon: "CLR", asset: "assets/apple_box_icon.png", title: "속성 해제", body: "황금 사과와 썩은 사과가 서로 합쳐지면 두 속성이 상쇄되어 일반 사과로 돌아옵니다." },
      { icon: "SEL", asset: "assets/sorting_warehouse.png", title: "선별 창고", body: "연구소의 선별 창고를 키우면 썩은 사과 등장률을 계속 낮출 수 있습니다." },
    ],
  },
  specials: {
    label: "특수",
    items: [
      { icon: "BMB", asset: "assets/bomb_apple.png", title: "폭탄 사과", body: "주변 사과를 흔들어 배치를 다시 섞습니다. 없애는 용도가 아니라 꼬인 더미를 푸는 용도입니다." },
      { icon: "PRM", asset: "assets/prism_apple.png", title: "프리즘 사과", body: "닿은 사과를 한 단계 올려 줍니다. 고등급 박스를 빠르게 만드는 핵심 장치입니다." },
      { icon: "SPN", asset: "assets/auto_flip_btn.png", title: "자동 뒤집기", body: "위험 구역이 많이 차면 뚜껑을 덮고 상자를 회전시켜 더미를 재배치합니다." },
      { icon: "MED", asset: "assets/gold_pesticide.png", title: "황금 농약", body: "연구소에서 더 좋은 약을 쓰면 모든 사과의 점수와 런 재화 가치가 바로 올라갑니다." },
    ],
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
      case "summon":
        playSequence([
          {
            wave: "triangle",
            startFreq: 520 + (detail.level || 0) * 10,
            endFreq: 720 + (detail.level || 0) * 14,
            duration: 0.06,
            release: 0.05,
            peak: 0.05,
          },
          {
            wave: "sine",
            startFreq: 860,
            endFreq: 1080,
            duration: 0.05,
            release: 0.05,
            peak: 0.03,
            delayMs: 24,
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
      case "crate-burst":
        playSequence([
          {
            wave: "sawtooth",
            startFreq: 180,
            endFreq: 72,
            duration: 0.16,
            release: 0.1,
            peak: 0.12,
            filterType: "lowpass",
            filterFreq: 720,
          },
          {
            wave: "triangle",
            startFreq: 340,
            endFreq: 120,
            duration: 0.12,
            release: 0.08,
            peak: 0.08,
            delayMs: 34,
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

function formatRunCurrency(value) {
  return `R$ ${formatNumber(value)}`;
}

function formatLabCurrency(value) {
  return `L$ ${formatNumber(value)}`;
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
  return "automation";
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

function sanitizeGuidePane(pane) {
  return GUIDE_PANES.includes(pane) ? pane : "basics";
}

function createLaneDropTimers() {
  const baseInterval = BALANCE.baseDropInterval;
  const startAfter = Math.max(1, baseInterval - getBeltFrames(baseInterval));
  return {
    left: safeRound(startAfter * 0.56),
    center: safeRound(startAfter * 0.18),
    right: 0,
  };
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
      autoSoldRuns: 0,
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
      drop: createLaneDropTimers(),
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
    infeeds: [],
    paused: false,
    hiddenAt: null,
    devSpeed: 1,
    activeMenu: getDefaultMenuPane(),
    sheetOpen: false,
    guidePane: "basics",
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
    sale: {
      active: false,
      reason: "",
      phase: "idle",
      frame: 0,
      appraisal: 0,
      baseAppraisal: 0,
      premiumValue: 0,
      goldenValue: 0,
      rottenPenaltyRate: 0,
      rottenPenaltyValue: 0,
      premium: 0,
      feeRate: 0,
      feeAmount: 0,
      bankGain: 0,
      auctionName: "",
      auctionShortLabel: "",
      auctionMultiplier: 1,
      shippedX: 0,
      premiumBurstsDone: false,
      premiumBursts: [],
      burstIndex: 0,
      burstTicker: 0,
      displayedBonus: 0,
      bonusTrails: [],
      labelPulse: 0,
    },
    overlayMode: "none",
    confirmAction: "",
    nextSideLane: "left",
    summonHistory: [],
    crateBurst: {
      appleId: 0,
      warningFrames: 0,
      exploding: false,
      explodeFrames: 0,
    },
    offlineSummary: null,
    uiSnapshot: "",
    automationSnapshot: "",
    badgeSnapshot: "",
    runShopSnapshot: "",
    labShopSnapshot: "",
    controlSnapshot: "",
    overlayAutoAdvanceTimer: 0,
    overlayAutoAdvanceEndsAt: 0,
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
    trait: config.trait || null,
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
    meta.stats.autoSoldRuns = Math.max(0, Number(rawMeta.stats.autoSoldRuns) || 0);
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
  run.exitReason = ["sold", "auto_sold", "burst"].includes(rawRun.exitReason) ? rawRun.exitReason : "";
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
    if (rawRun.timers.drop && typeof rawRun.timers.drop === "object") {
      run.timers.drop.left = Math.max(0, Number(rawRun.timers.drop.left) || 0);
      run.timers.drop.center = Math.max(0, Number(rawRun.timers.drop.center) || 0);
      run.timers.drop.right = Math.max(0, Number(rawRun.timers.drop.right) || 0);
    } else {
      const legacyDropTimer = Math.max(0, Number(rawRun.timers.drop) || 0);
      run.timers.drop.left = legacyDropTimer;
      run.timers.drop.center = legacyDropTimer;
      run.timers.drop.right = legacyDropTimer;
    }
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
    const trait = rawApple.trait === "golden" || rawApple.trait === "rotten" ? rawApple.trait : null;
    const apple = createApple(level, Number(rawApple.x) || BASE_ORCHARD.x, Number(rawApple.y) || BASE_ORCHARD.y, {
      special,
      trait,
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

  const lane = rawInfeed.lane === "right" || rawInfeed.lane === "center" ? rawInfeed.lane : "left";
  return {
    lane,
    level: clamp(Number(rawInfeed.level) || 0, 0, APPLE_TYPES.length - 1),
    special: rawInfeed.special === "bomb" || rawInfeed.special === "prism" ? rawInfeed.special : null,
    trait: rawInfeed.trait === "golden" || rawInfeed.trait === "rotten" ? rawInfeed.trait : null,
    frame: Math.max(0, Number(rawInfeed.frame) || 0),
    beltFrames: Math.max(BALANCE.conveyor.minFrames, Number(rawInfeed.beltFrames) || BALANCE.conveyor.minFrames),
  };
}

function sanitizeInfeeds(rawInfeeds, legacyInfeed) {
  const source = Array.isArray(rawInfeeds)
    ? rawInfeeds
    : (legacyInfeed ? [legacyInfeed] : []);
  const seen = new Set();
  const infeeds = [];

  for (const rawInfeed of source) {
    const infeed = sanitizeInfeed(rawInfeed);
    if (!infeed || seen.has(infeed.lane)) {
      continue;
    }
    seen.add(infeed.lane);
    infeeds.push(infeed);
  }

  return infeeds;
}

function serializeApple(apple) {
  return {
    id: apple.id,
    level: apple.level,
    special: apple.special,
    trait: apple.trait,
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

function serializeInfeeds() {
  return state.infeeds.map((infeed) => ({
    lane: infeed.lane,
    level: infeed.level,
    special: infeed.special,
    trait: infeed.trait,
    frame: infeed.frame,
    beltFrames: infeed.beltFrames,
  }));
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
      infeeds: serializeInfeeds(),
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
  migrated.run.infeeds = [];
  migrated.meta.balanceVersion = BALANCE.version;
  migrated.meta.stats.soldRuns = migrated.meta.stats.soldRuns || 0;
  migrated.meta.stats.autoSoldRuns = migrated.meta.stats.autoSoldRuns || 0;
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
  fresh.infeeds = sanitizeInfeeds(parsed.run && parsed.run.infeeds, parsed.run && parsed.run.infeed);
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
    const reason = state.run.exitReason || "sold";
    const resultData = reason === "burst" ? getBurstLossData() : getPendingSaleData(reason, state.apples);
    showRunResultOverlay(reason, resultData);
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
  return safeRound(80 * Math.pow(level, 1));
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

function getAutoSaleFeeRate(meta) {
  const level = meta ? meta.upgrades.brokerageOffice : state.meta.upgrades.brokerageOffice;
  return Math.max(0.08, 0.5 - softPow(level, 0.055, 0.92));
}

function getConveyorWorkshopLevel(meta) {
  const currentMeta = meta || state.meta;
  return currentMeta.upgrades.conveyorWorkshop;
}

function getConveyorWorkshopMultiplier(meta) {
  const level = getConveyorWorkshopLevel(meta);
  return 1 + softPow(level, 0.12, 0.82);
}

function hasTwinConveyor(meta) {
  const currentMeta = meta || state.meta;
  return currentMeta.upgrades.twinConveyor > 0;
}

function hasCenterConveyor(meta) {
  return getConveyorWorkshopLevel(meta) >= 4;
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
  return 1 + softPow(level, 0.18, 0.97);
}

function getBoxScaleForLevel(level) {
  return 1 + softPow(level, 0.052, 0.88);
}

function getRunValueMultiplier(run) {
  const currentRun = run || state.run;
  return 1 + softPow(currentRun.upgrades.valuePress, 0.12, 0.86);
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
  const divisor = (1 + softPow(currentRun.upgrades.dropMotor, 0.11, 0.82)) * getConveyorWorkshopMultiplier();
  return Math.max(BALANCE.minDropInterval, safeRound(BALANCE.baseDropInterval * seasonFactor / divisor));
}

function getDropTierReal(run) {
  const currentRun = run || state.run;
  return clamp(1.4 * Math.log(1 + currentRun.upgrades.dropTier), 0, APPLE_TYPES.length - 1.001);
}

function getDropTierInfo(run) {
  const currentRun = run || state.run;
  const tierReal = getDropTierReal(run);
  const lastLevel = APPLE_TYPES.length - 1;
  const upperLevel = currentRun.upgrades.dropTier <= 0 ? 0 : Math.min(lastLevel, Math.floor(tierReal) + 1);
  const exponent = 0.58 + tierReal * 0.3;
  const distribution = [];
  let totalWeight = 0;

  for (let level = 0; level <= upperLevel; level += 1) {
    const distancePenalty = 1 / Math.pow(1 + Math.max(0, level - tierReal) * 1.4, 2.2);
    const weight = Math.pow(level + 1, exponent) * distancePenalty;
    distribution.push({
      level,
      weight,
    });
    totalWeight += weight;
  }

  let dominantLevel = 0;
  let dominantChance = 1;
  distribution.forEach((entry, index) => {
    entry.chance = totalWeight > 0 ? entry.weight / totalWeight : (index === 0 ? 1 : 0);
    delete entry.weight;
    if (entry.chance >= dominantChance) {
      dominantLevel = entry.level;
      dominantChance = entry.chance;
    }
  });

  return {
    tierReal,
    dominantLevel,
    dominantChance,
    upperLevel,
    distribution,
  };
}

function sampleFromDistribution(distribution) {
  let roll = Math.random();
  for (const entry of distribution) {
    roll -= entry.chance;
    if (roll <= 0) {
      return entry.level;
    }
  }
  return distribution.length > 0 ? distribution[distribution.length - 1].level : 0;
}

function getDropDistributionText(run, limit) {
  const tierInfo = getDropTierInfo(run);
  const maxItems = limit || 4;
  const highlighted = tierInfo.distribution.filter((entry) => {
    return entry.chance >= 0.09 || entry.level === tierInfo.dominantLevel || entry.level === tierInfo.upperLevel;
  });
  const visible = (highlighted.length > 0 ? highlighted : tierInfo.distribution).slice(-maxItems);
  return visible.map((entry) => `${entry.level + 1}단계 ${Math.round(entry.chance * 100)}%`).join(" · ");
}

function getExpectedDropPointValue(run) {
  return getDropTierInfo(run).distribution.reduce((sum, entry) => {
    return sum + APPLE_TYPES[entry.level].points * entry.chance;
  }, 0);
}

function getDangerZoneBottomRatio(run) {
  const currentRun = run || state.run;
  const shift = sat(currentRun.upgrades.dangerBuffer, 0.16, 0.08);
  return clamp(BALANCE.dangerZoneBaseBottomRatio + shift, BALANCE.dangerZoneHeightRatio, BALANCE.dangerZoneMaxBottomRatio);
}

function getDangerZoneTopRatio(run) {
  return Math.max(0, getDangerZoneBottomRatio(run) - BALANCE.dangerZoneHeightRatio);
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
  return 0.01 + sat(level - 1, 0.04, 0.34);
}

function getBasePrismChance(meta) {
  const currentMeta = meta || state.meta;
  const level = currentMeta.upgrades.prismOrchard;
  if (level <= 0) {
    return 0;
  }
  return 0.004 + sat(level - 1, 0.016, 0.3);
}

function getGoldenAppleChance(meta) {
  const currentMeta = meta || state.meta;
  return 0.0085 + sat(currentMeta.upgrades.goldenMulch, 0.015, 0.15);
}

function getGoldenBonusScale(meta) {
  const currentMeta = meta || state.meta;
  return 1 + softPow(currentMeta.upgrades.goldenMulch, 0.08, 0.92);
}

function getRottenAppleChance(meta) {
  const currentMeta = meta || state.meta;
  return Math.max(0.005, 0.0095 - sat(currentMeta.upgrades.sortingShed, 0.0045, 0.17));
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
      return costFormula(36, 1.21, targetLevel, 8, 1.28);
    case "crateExpansion":
      return safeRound(costFormula(132, 1.25, targetLevel, 7, 1.34) * getExpansionDiscountFactor(currentMeta));
    case "bombSeeder":
      return costFormula(108, 1.22, targetLevel, 8, 1.28);
    case "prismSeeder":
      return costFormula(190, 1.26, targetLevel, 8, 1.34);
    case "shockEngine":
      return costFormula(128, 1.23, targetLevel, 8, 1.28);
    case "autoSpinner":
      return costFormula(240, 1.28, targetLevel, 6, 1.44);
    case "dangerBuffer":
      return costFormula(150, 1.27, targetLevel, 7, 1.32);
    case "valuePress":
      return costFormula(82, 1.23, targetLevel, 8, 1.28);
    case "dropTier":
      return costFormula(4800, 3.4, targetLevel, 4, 2.46);
    default:
      return Number.MAX_SAFE_INTEGER;
  }
}

function getMetaUpgradeCost(key, level) {
  const targetLevel = typeof level === "number" ? level : state.meta.upgrades[key];

  switch (key) {
    case "starterFund":
      return costFormula(180, 1.16, targetLevel, 10, 1.14);
    case "durableCrate":
      return costFormula(240, 1.18, targetLevel, 10, 1.16);
    case "bombOrchard":
      return safeRound(360 * Math.pow(1.72, targetLevel));
    case "prismOrchard":
      return safeRound(580 * Math.pow(1.84, targetLevel));
    case "expansionEngineering":
      return costFormula(360, 1.19, targetLevel, 8, 1.2);
    case "conveyorWorkshop":
      return costFormula(420, 1.2, targetLevel, 8, 1.18);
    case "brokerageOffice":
      return costFormula(420, 1.2, targetLevel, 8, 1.18);
    case "twinConveyor":
      return safeRound(1200 * Math.pow(1.68, targetLevel));
    case "goldenMulch":
      return costFormula(520, 1.21, targetLevel, 8, 1.18);
    case "sortingShed":
      return costFormula(360, 1.17, targetLevel, 9, 1.12);
    case "offlineOrchard":
      return costFormula(300, 1.18, targetLevel, 9, 1.14);
    case "mergeLedger":
      return costFormula(320, 1.18, targetLevel, 9, 1.16);
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
  const dangerBottomY = y + h * getDangerZoneBottomRatio();
  const dangerTopY = y + h * getDangerZoneTopRatio();

  return {
    x,
    y,
    w,
    h,
    bottom: y + h,
    centerX: x + w / 2,
    centerY: y + h / 2,
    dangerTopY,
    dangerY: dangerBottomY,
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
  let minX = orchard.x - 22;
  let maxX = orchard.x + orchard.w + 22;
  let minY = orchard.y - 76;
  let maxY = orchard.bottom + 44;

  for (const lane of getActiveConveyorLanes()) {
    const geometry = getConveyorGeometry(lane);
    minX = Math.min(minX, geometry.startX - geometry.width, geometry.endX - geometry.width);
    maxX = Math.max(maxX, geometry.startX + geometry.width, geometry.endX + geometry.width);
    minY = Math.min(minY, geometry.startY - geometry.width, geometry.endY - geometry.width);
  }

  const formulaScale = Math.min(1, 1 / Math.pow(state.run.boxScale, getCameraExponent()));
  const safeScaleX = (WIDTH - 24) / Math.max(1, maxX - minX);
  const safeScaleY = (HEIGHT - 34) / Math.max(1, maxY - minY);
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

function getActiveConveyorLanes(meta) {
  const lanes = ["left"];
  if (hasCenterConveyor(meta)) {
    lanes.push("center");
  }
  if (hasTwinConveyor(meta)) {
    lanes.push("right");
  }
  return lanes;
}

function getConveyorGeometry(lane) {
  const orchard = getOrchardBounds();
  const gapScale = Math.min(2.2, 1 + Math.max(0, state.run.boxScale - 1) * 0.9);
  const outerOffset = BALANCE.conveyor.laneOuterOffset * gapScale;
  const endOffset = BALANCE.conveyor.laneEndOffset * gapScale;
  if (lane === "center") {
    return {
      lane: "center",
      startX: orchard.centerX,
      startY: orchard.y + BALANCE.conveyor.startYOffset - 16,
      endX: orchard.centerX,
      endY: orchard.y + BALANCE.conveyor.endYOffset - 10,
      width: BALANCE.conveyor.width - 8,
    };
  }

  if (lane === "right") {
    return {
      lane: "right",
      startX: orchard.x + orchard.w + outerOffset,
      startY: orchard.y + BALANCE.conveyor.startYOffset,
      endX: orchard.x + orchard.w + endOffset,
      endY: orchard.y + BALANCE.conveyor.endYOffset,
      width: BALANCE.conveyor.width,
    };
  }

  return {
    lane: "left",
    startX: orchard.x - outerOffset,
    startY: orchard.y + BALANCE.conveyor.startYOffset,
    endX: orchard.x - endOffset,
    endY: orchard.y + BALANCE.conveyor.endYOffset,
    width: BALANCE.conveyor.width,
  };
}

function getConveyorSpinDirection(lane) {
  return lane === "right" ? -1 : 1;
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
  state.infeeds = [];
  state.spin.phase = "idle";
  state.spin.frame = 0;
  state.spin.angle = 0;
  state.spin.lidProgress = 0;
  state.boxAnimation.active = false;
  state.boxAnimation.frame = 0;
  state.boxAnimation.from = state.run.boxScale;
  state.boxAnimation.to = state.run.boxScale;
  state.boxAnimation.pulse = 0;
  state.sale.active = false;
  state.sale.reason = "";
  state.sale.phase = "idle";
  state.sale.frame = 0;
  state.sale.baseAppraisal = 0;
  state.sale.goldenValue = 0;
  state.sale.rottenPenaltyRate = 0;
  state.sale.rottenPenaltyValue = 0;
  state.sale.auctionName = "";
  state.sale.auctionShortLabel = "";
  state.sale.auctionMultiplier = 1;
  state.sale.shippedX = 0;
  state.sale.premiumBurstsDone = false;
  state.sale.premiumBursts = [];
  state.sale.burstIndex = 0;
  state.sale.burstTicker = 0;
  state.sale.displayedBonus = 0;
  state.sale.bonusTrails = [];
  state.sale.labelPulse = 0;
  state.overlayMode = "none";
  state.confirmAction = "";
  state.nextSideLane = "left";
  state.summonHistory = [];
  state.crateBurst.appleId = 0;
  state.crateBurst.warningFrames = 0;
  state.crateBurst.exploding = false;
  state.crateBurst.explodeFrames = 0;
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

function getSalePremiumMultiplier(level) {
  if (level < 4) {
    return 0;
  }
  return 0.045 * Math.pow(level - 3, 1.14);
}

function chooseAuctionHouse(apples, breakdown) {
  const source = apples || state.apples;
  const topTier = source.reduce((highest, apple) => Math.max(highest, apple.level), 0);
  const goldenBias = breakdown.goldenCount * 1.15;
  const rottenBias = breakdown.rottenCount * 0.85;
  const qualityScore = topTier * 0.75 + breakdown.qualityMultiplier * 2.8 + goldenBias - rottenBias;
  const weights = AUCTION_HOUSES.map((house) => {
    switch (house.key) {
      case "roadside":
        return Math.max(0.05, 0.34 - qualityScore * 0.018);
      case "town":
        return Math.max(0.08, 0.32 - Math.max(0, qualityScore - 5) * 0.01);
      case "night":
        return 0.2 + Math.max(0, qualityScore - 3) * 0.012;
      case "golden":
        return 0.08 + Math.max(0, qualityScore - 6) * 0.016 + breakdown.goldenCount * 0.04;
      case "royal":
        return 0.03 + Math.max(0, qualityScore - 10) * 0.014 + breakdown.goldenCount * 0.02;
      default:
        return 0.1;
    }
  });

  const total = weights.reduce((sum, weight) => sum + weight, 0);
  let roll = Math.random() * Math.max(0.001, total);

  for (let index = 0; index < AUCTION_HOUSES.length; index += 1) {
    roll -= weights[index];
    if (roll <= 0) {
      return AUCTION_HOUSES[index];
    }
  }

  return AUCTION_HOUSES[1];
}

function getCrateSaleBreakdown(apples) {
  const source = apples || state.apples;
  const valueMultiplier = getCombinedValueMultiplier();
  if (source.length === 0) {
    return {
      baseValue: 0,
      premiumValue: 0,
      goldenValue: 0,
      rottenPenaltyRate: 0,
      rottenPenaltyValue: 0,
      qualityMultiplier: 1,
      totalValue: 0,
      premiumBursts: [],
      goldenCount: 0,
      rottenCount: 0,
    };
  }

  let baseValue = 0;
  let premiumValue = 0;
  let goldenValue = 0;
  let qualityMass = 0;
  let premiumDensity = 0;
  let rottenPenaltyWeight = 0;
  let goldenCount = 0;
  let rottenCount = 0;
  const premiumBursts = [];

  for (const apple of source) {
    const points = APPLE_TYPES[apple.level].points * valueMultiplier;
    baseValue += points * (0.082 + 0.019 * Math.sqrt(apple.level + 1));
    qualityMass += Math.pow(apple.level + 1, 1.34);
    premiumDensity += Math.max(0, apple.level - 3) * 0.1;

    const premium = points * getSalePremiumMultiplier(apple.level);
    if (premium > 0) {
      premiumValue += premium;
      premiumBursts.push({
        x: apple.x,
        y: apple.y - apple.r * 0.2,
        value: safeRound(premium),
        name: APPLE_TYPES[apple.level].name,
      });
    }

    if (apple.trait === "golden") {
      goldenCount += 1;
      const goldenBonus = points * (0.28 + 0.04 * Math.sqrt(apple.level + 1)) * getGoldenBonusScale();
      goldenValue += goldenBonus;
      premiumBursts.push({
        x: apple.x,
        y: apple.y - apple.r * 0.45,
        value: safeRound(goldenBonus),
        name: `황금 ${APPLE_TYPES[apple.level].name}`,
      });
    } else if (apple.trait === "rotten") {
      rottenCount += 1;
      rottenPenaltyWeight += 0.08 + apple.level * 0.018;
    }
  }

  premiumBursts.sort((left, right) => right.value - left.value);
  const qualityMultiplier = 1
    + clamp(Math.log1p(qualityMass) / 4.6, 0, 1.18)
    + clamp(premiumDensity / Math.max(6, source.length * 1.5), 0, 0.34);
  const subtotal = baseValue * qualityMultiplier + premiumValue + goldenValue;
  const rottenPenaltyRate = clamp(rottenPenaltyWeight / Math.max(5, source.length * 1.26), 0, 0.62);
  const rottenPenaltyValue = safeRound(subtotal * rottenPenaltyRate);
  const totalValue = safeRound(subtotal - rottenPenaltyValue);

  return {
    baseValue: safeRound(baseValue),
    premiumValue: safeRound(premiumValue),
    goldenValue: safeRound(goldenValue),
    rottenPenaltyRate,
    rottenPenaltyValue,
    qualityMultiplier,
    totalValue,
    premiumBursts: premiumBursts.slice(0, 14),
    goldenCount,
    rottenCount,
  };
}

function getAppraisalValue(apples) {
  return getCrateSaleBreakdown(apples).totalValue;
}

function isSaleActive() {
  return state.sale.active;
}

function getPendingSaleData(reason, apples) {
  const breakdown = getCrateSaleBreakdown(apples);
  const auctionHouse = chooseAuctionHouse(apples, breakdown);
  const auctionValue = safeRound(breakdown.totalValue * auctionHouse.multiplier);
  const feeRate = reason === "auto_sold" ? getAutoSaleFeeRate() : 0;
  const feeAmount = safeRound(auctionValue * feeRate);
  return {
    reason,
    appraisal: auctionValue,
    baseAppraisal: breakdown.totalValue,
    baseValue: breakdown.baseValue,
    premiumValue: breakdown.premiumValue,
    goldenValue: breakdown.goldenValue,
    rottenPenaltyRate: breakdown.rottenPenaltyRate,
    rottenPenaltyValue: breakdown.rottenPenaltyValue,
    qualityMultiplier: breakdown.qualityMultiplier,
    premiumBursts: breakdown.premiumBursts,
    auctionName: auctionHouse.name,
    auctionShortLabel: auctionHouse.shortLabel,
    auctionMultiplier: auctionHouse.multiplier,
    feeRate,
    feeAmount,
    bankGain: Math.max(0, auctionValue - feeAmount),
  };
}

function getBurstLossData() {
  return {
    reason: "burst",
    appraisal: 0,
    baseAppraisal: 0,
    baseValue: 0,
    premiumValue: 0,
    goldenValue: 0,
    rottenPenaltyRate: 0,
    rottenPenaltyValue: 0,
    qualityMultiplier: 0,
    premiumBursts: [],
    auctionName: "경매 취소",
    auctionShortLabel: "취소",
    auctionMultiplier: 0,
    feeRate: 0,
    feeAmount: 0,
    bankGain: 0,
  };
}

function canSellCrate() {
  if (!state.run.alive || isSaleActive() || state.crateBurst.exploding) {
    return false;
  }

  const topTier = state.apples.reduce((highest, apple) => Math.max(highest, apple.level), state.run.topTier);
  const appraisal = getAppraisalValue();
  if (state.run.elapsedFrames < BALANCE.sellGateFrames) {
    return false;
  }

  return (
    appraisal >= BALANCE.sellGateValue
    || state.apples.length >= BALANCE.sellGateApples
    || topTier >= BALANCE.sellGateTier
  );
}

function getSellGateText() {
  const appraisal = getAppraisalValue();

  if (!state.run.alive) {
    return "런이 종료되었습니다.";
  }

  if (state.crateBurst.exploding) {
    return "상자 폭발 사고가 발생했습니다. 이번 런 보상은 0으로 고정됩니다.";
  }

  if (state.crateBurst.warningFrames > 0) {
    const secondsLeft = Math.max(0, Math.ceil((BALANCE.crateBurstWarnFrames - state.crateBurst.warningFrames) / 60));
    return `너무 큰 사과가 상자를 가로막고 있습니다. ${secondsLeft}s 안에 정리하지 못하면 상자가 폭발합니다.`;
  }

  if (isSaleActive()) {
    return state.sale.reason === "auto_sold"
      ? `상자가 자동 경매 중입니다. 수수료 ${Math.round(state.sale.feeRate * 100)}% 적용`
      : "상자를 포장하고 경매장으로 보내는 중입니다.";
  }

  if (canSellCrate()) {
    return `지금 경매에 올리면 현재 예상가 ${formatLabCurrency(appraisal)}부터 시작합니다. 황금 사과가 많을수록 더 비싸집니다.`;
  }

  const secondsLeft = Math.max(0, Math.ceil((BALANCE.sellGateFrames - state.run.elapsedFrames) / 60));
  const remainingValue = Math.max(0, BALANCE.sellGateValue - appraisal);
  const remainingApples = Math.max(0, BALANCE.sellGateApples - state.apples.length);
  const remainingTier = Math.max(0, BALANCE.sellGateTier - state.run.topTier);

  if (state.run.elapsedFrames < BALANCE.sellGateFrames) {
    return `${secondsLeft}s 뒤에 경매 가능. 이후 예상가 ${formatLabCurrency(remainingValue)} 또는 사과 ${remainingApples}개 또는 ${remainingTier}단계 더미가 더 필요합니다.`;
  }

  return `예상가 ${formatLabCurrency(remainingValue)} 또는 사과 ${remainingApples}개 또는 상위 단계 ${remainingTier}레벨이 더 필요합니다.`;
}

function startSaleSequence(reason) {
  if (!state.run.alive || isSaleActive() || state.crateBurst.exploding) {
    return false;
  }

  const saleData = getPendingSaleData(reason);
  state.sale.active = true;
  state.sale.reason = saleData.reason;
  state.sale.phase = "packing";
  state.sale.frame = 0;
  state.sale.appraisal = saleData.appraisal;
  state.sale.baseAppraisal = saleData.baseAppraisal;
  state.sale.baseValue = saleData.baseValue;
  state.sale.premiumValue = saleData.premiumValue;
  state.sale.goldenValue = saleData.goldenValue;
  state.sale.rottenPenaltyRate = saleData.rottenPenaltyRate;
  state.sale.rottenPenaltyValue = saleData.rottenPenaltyValue;
  state.sale.premium = saleData.premiumValue;
  state.sale.qualityMultiplier = saleData.qualityMultiplier;
  state.sale.auctionName = saleData.auctionName;
  state.sale.auctionShortLabel = saleData.auctionShortLabel;
  state.sale.auctionMultiplier = saleData.auctionMultiplier;
  state.sale.feeRate = saleData.feeRate;
  state.sale.feeAmount = saleData.feeAmount;
  state.sale.bankGain = saleData.bankGain;
  state.sale.shippedX = 0;
  state.sale.premiumBursts = saleData.premiumBursts;
  state.sale.premiumBurstsDone = false;
  state.sale.burstIndex = 0;
  state.sale.burstTicker = 0;
  state.sale.displayedBonus = 0;
  state.sale.bonusTrails = [];
  state.sale.labelPulse = 0;
  state.paused = false;
  state.run.sellPreview = saleData.appraisal;
  state.run.timers.drop = createLaneDropTimers();
  state.infeeds = [];
  flashScreen(reason === "auto_sold" ? "rgba(255, 176, 136, 0.24)" : "rgba(255, 230, 178, 0.22)", 0.16);
  spawnFloatingText(
    getOrchardBounds().centerX,
    getOrchardBounds().y - 22,
    reason === "auto_sold" ? "자동 경매" : "경매 출발",
    "#fff2d6",
    48,
  );
  audioManager.play("sell");
  syncUi(true);
  return true;
}

function getSaleShiftX() {
  if (!isSaleActive() || state.sale.phase !== "shipping") {
    return 0;
  }
  const progress = clamp(state.sale.frame / BALANCE.sale.shipFrames, 0, 1);
  return Math.pow(progress, 1.1) * 460;
}

function pushSaleBonusTrail(burst) {
  const orchard = getOrchardBounds();
  const targetX = orchard.centerX;
  const targetY = orchard.centerY + 2;
  state.sale.bonusTrails.push({
    x: burst.x,
    y: burst.y,
    fromX: burst.x,
    fromY: burst.y,
    targetX,
    targetY,
    life: 20,
    maxLife: 20,
    color: burst.name.includes("황금") ? "#ffe08b" : "#ffd3a1",
  });
}

function updateSaleBonusTrails() {
  state.sale.bonusTrails = state.sale.bonusTrails.filter((trail) => {
    trail.life -= 1;
    const progress = 1 - trail.life / Math.max(1, trail.maxLife);
    const eased = 1 - Math.pow(1 - progress, 2.4);
    trail.x = trail.fromX + (trail.targetX - trail.fromX) * eased;
    trail.y = trail.fromY + (trail.targetY - trail.fromY) * eased - Math.sin(progress * Math.PI) * 22;
    if (trail.life <= 0) {
      spawnParticles(trail.targetX, trail.targetY, trail.color, 6, 2.8);
      return false;
    }
    return true;
  });
  state.sale.labelPulse *= 0.9;
  if (state.sale.labelPulse < 0.03) {
    state.sale.labelPulse = 0;
  }
}

function updateSaleSequence() {
  if (!isSaleActive()) {
    return false;
  }

  state.sale.frame += 1;

  if (state.sale.phase === "packing") {
    state.sale.burstTicker += 1;

    if (state.sale.frame === 10) {
      spawnFloatingText(getOrchardBounds().centerX, getOrchardBounds().y - 12, "포장 시작", "#fff4d2", 48);
    }

    if (state.sale.frame === 18) {
      spawnFloatingText(getOrchardBounds().centerX, getOrchardBounds().centerY - 30, `${state.sale.auctionName} 입장`, "#fff0cf", 50);
    }

    while (
      state.sale.burstIndex < state.sale.premiumBursts.length
      && state.sale.burstTicker >= BALANCE.sale.burstGapFrames
    ) {
      const burst = state.sale.premiumBursts[state.sale.burstIndex];
      state.sale.burstTicker -= BALANCE.sale.burstGapFrames;
      state.sale.burstIndex += 1;
      state.sale.displayedBonus += burst.value;
      state.sale.labelPulse = 1;
      pushSaleBonusTrail(burst);
      spawnFloatingText(
        burst.x + (Math.random() - 0.5) * 18,
        burst.y - state.sale.burstIndex * 4,
        `${burst.name} +${formatLabCurrency(burst.value)}`,
        "#ffe59b",
        44,
      );
      spawnFloatingText(
        getOrchardBounds().centerX + (Math.random() - 0.5) * 30,
        getOrchardBounds().centerY + 18 + (Math.random() - 0.5) * 8,
        `보너스 +${formatLabCurrency(burst.value)}`,
        burst.name.includes("황금") ? "#fff0aa" : "#ffe0bd",
        34,
      );
      spawnShockwave(burst.x, burst.y, burst.name.includes("황금") ? "#ffe6a0" : "#ffd3a1", 42, 6, 14);
      spawnParticles(burst.x, burst.y, "#ffd87c", 8, 3.8);
    }

    state.sale.premiumBurstsDone = state.sale.burstIndex >= state.sale.premiumBursts.length;
  }

  updateSaleBonusTrails();

  if (state.sale.phase === "packing" && state.sale.frame >= BALANCE.sale.packFrames) {
    state.sale.phase = "shipping";
    state.sale.frame = 0;
    spawnFloatingText(
      getOrchardBounds().centerX,
      getOrchardBounds().centerY,
      `${state.sale.auctionName} x${state.sale.auctionMultiplier.toFixed(2)}`,
      "#fff6dc",
      46,
    );
    if (state.sale.rottenPenaltyRate > 0) {
      spawnFloatingText(
        getOrchardBounds().centerX,
        getOrchardBounds().centerY + 34,
        `썩은 감액 -${Math.round(state.sale.rottenPenaltyRate * 100)}%`,
        "#d8f0af",
        44,
      );
    }
    return true;
  }

  if (state.sale.phase === "shipping") {
    state.sale.shippedX = getSaleShiftX();
    if (state.sale.frame >= BALANCE.sale.shipFrames) {
      finishRun(state.sale.reason);
    }
  }

  return true;
}

function finishRun(reason) {
  if (!state.run.alive && !isSaleActive()) {
    return;
  }

  const exitReason = reason === "auto_sold" ? "auto_sold" : (reason === "burst" ? "burst" : "sold");
  const saleData = exitReason === "burst"
    ? getBurstLossData()
    : (isSaleActive() ? state.sale : getPendingSaleData(exitReason));
  const appraisal = saleData.appraisal;
  const bankGain = saleData.bankGain;

  state.run.alive = false;
  state.run.exitReason = exitReason;
  state.run.sellPreview = appraisal;
  state.paused = false;
  state.sale.active = false;
  state.sale.phase = "idle";
  state.sale.shippedX = 0;
  state.sale.frame = 0;
  state.crateBurst.exploding = false;
  state.crateBurst.explodeFrames = 0;
  state.crateBurst.warningFrames = 0;
  state.crateBurst.appleId = 0;

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
  } else if (exitReason === "auto_sold") {
    state.meta.stats.autoSoldRuns += 1;
    state.meta.stats.totalAppraisalGain += appraisal;
    state.meta.stats.lastSaleAppraisal = bankGain;
    audioManager.play("sell");
  } else {
    state.meta.stats.lastSaleAppraisal = 0;
  }

  showRunResultOverlay(exitReason, saleData);
  syncUi(true);
  saveState();
}

function attemptSellCrate() {
  if (!canSellCrate()) {
    audioManager.play("ui-denied");
    return;
  }
  startSaleSequence("sold");
}

function requestSellCrate() {
  if (!canSellCrate()) {
    audioManager.play("ui-denied");
    return;
  }
  showConfirmOverlay("sell");
  audioManager.play("ui-confirm");
}

function requestRestartRun() {
  if (!state.run.alive) {
    startNewRun();
    return;
  }
  if (isSaleActive() || state.crateBurst.exploding) {
    audioManager.play("ui-denied");
    return;
  }
  showConfirmOverlay("restart");
  audioManager.play("ui-confirm");
}

function togglePause(forceValue) {
  if (!state.run.alive || isSaleActive() || state.crateBurst.exploding) {
    audioManager.play("ui-denied");
    return;
  }

  state.paused = typeof forceValue === "boolean" ? forceValue : !state.paused;
  audioManager.play("pause", { paused: state.paused });
  if (state.paused) {
    showOverlay(
      "잠시 멈춤",
      `<p class="overlay-lead">컨베이어와 상자 물리를 잠시 멈췄습니다. 버튼이나 P 키로 다시 이어갈 수 있습니다.</p>`,
      "",
      { mode: "pause", eyebrow: "과수원 알림" },
    );
  } else {
    hideOverlay();
  }
  syncUi(true);
}

function showOverlay(title, contentHtml, buttonMarkup, options) {
  clearOverlayAutoAdvance();
  const config = options || {};
  const content = buttonMarkup || "";
  state.overlayMode = config.mode || "info";
  state.confirmAction = config.action || "";
  ui.overlay.dataset.mode = state.overlayMode;
  ui.overlay.dataset.action = state.confirmAction;
  ui.overlay.innerHTML = `
    <div class="overlay-card">
      <p class="modal-eyebrow">${config.eyebrow || "과수원 알림"}</p>
      <h2>${title}</h2>
      ${contentHtml}
      ${content}
    </div>
  `;
  ui.overlay.classList.remove("hidden");
}

function showRunResultOverlay(reason, saleData) {
  const title = reason === "auto_sold"
    ? "자동 경매 정산"
    : (reason === "burst" ? "상자 폭발" : "박스 경매 정산");
  const buttonLabel = "다음 런";
  const rows = reason === "burst"
    ? [
      ["최종 점수", formatNumber(state.run.score)],
      ["이번 보상", formatLabCurrency(0)],
      ["생존 시간", formatDuration(state.run.elapsedFrames / 60)],
      ["최고 단계", state.run.topTier >= 0 ? APPLE_TYPES[state.run.topTier].name : "-"],
    ]
    : [
      ["최종 점수", formatNumber(state.run.score)],
      ["경매장", `${saleData.auctionName} x${saleData.auctionMultiplier.toFixed(2)}`],
      ["정산 금액", formatLabCurrency(saleData.appraisal)],
      ["보너스", `${formatLabCurrency(saleData.premiumValue + saleData.goldenValue)} / 감액 ${Math.round(saleData.rottenPenaltyRate * 100)}%`],
      ...(reason === "auto_sold" ? [["자동판매 수수료", `${Math.round(saleData.feeRate * 100)}%`]] : []),
      ["실수령 연구 자금", formatLabCurrency(saleData.bankGain)],
      ["생존 시간", formatDuration(state.run.elapsedFrames / 60)],
      ["최고 단계", state.run.topTier >= 0 ? APPLE_TYPES[state.run.topTier].name : "-"],
    ];
  const summaryHtml = `
    <div class="overlay-actions">
      <button id="overlayRestartButton" class="action-button primary">${buttonLabel}</button>
    </div>
    <div class="overlay-results">
      ${rows.map((row) => `<div class="overlay-stat-row"><strong>${row[0]}</strong><span>${row[1]}</span></div>`).join("")}
    </div>
    <p class="overlay-note" id="overlayCountdownText">30초 뒤 자동으로 다음 런이 시작됩니다.</p>
  `;

  showOverlay(
    title,
    summaryHtml,
    "",
    {
      mode: "result",
      eyebrow: reason === "burst" ? "과수원 사고" : "경매 정산",
    },
  );
  scheduleOverlayAutoAdvance();
}

function hideOverlay() {
  clearOverlayAutoAdvance();
  state.overlayMode = "none";
  state.confirmAction = "";
  delete ui.overlay.dataset.mode;
  delete ui.overlay.dataset.action;
  ui.overlay.classList.add("hidden");
}

function clearOverlayAutoAdvance() {
  if (state.overlayAutoAdvanceTimer) {
    window.clearInterval(state.overlayAutoAdvanceTimer);
    state.overlayAutoAdvanceTimer = 0;
  }
  state.overlayAutoAdvanceEndsAt = 0;
}

function scheduleOverlayAutoAdvance() {
  clearOverlayAutoAdvance();
  state.overlayAutoAdvanceEndsAt = Date.now() + BALANCE.overlayAutoAdvanceMs;
  state.overlayAutoAdvanceTimer = window.setInterval(() => {
    const button = document.getElementById("overlayRestartButton");
    const countdownText = document.getElementById("overlayCountdownText");
    if (!button) {
      clearOverlayAutoAdvance();
      return;
    }

    const secondsLeft = Math.max(0, Math.ceil((state.overlayAutoAdvanceEndsAt - Date.now()) / 1000));
    button.textContent = "다음 런";
    if (countdownText) {
      countdownText.textContent = secondsLeft > 0
        ? `${secondsLeft}초 뒤 자동으로 다음 런이 시작됩니다.`
        : "지금 다음 런을 시작합니다.";
    }
    if (secondsLeft <= 0) {
      clearOverlayAutoAdvance();
      startNewRun();
    }
  }, 150);
}

function showConfirmOverlay(action) {
  const config = action === "sell"
    ? {
      title: "이 상자를 경매에 올릴까요?",
      eyebrow: "확인 필요",
      body: `<p class="overlay-lead">지금 경매를 시작하면 포장과 배송 연출이 진행되고 이번 런이 끝납니다. 예상 상자 가치는 ${formatLabCurrency(state.run.sellPreview)}입니다.</p>`,
      confirm: "경매 진행",
    }
    : {
      title: "정말 새 런으로 넘어갈까요?",
      eyebrow: "확인 필요",
      body: `<p class="overlay-lead">현재 런 진행 상황과 이번 런 상점 구매가 모두 초기화됩니다. 지금 점수와 런 재화는 정산되지 않습니다.</p>`,
      confirm: "새 런 시작",
    };

  showOverlay(
    config.title,
    `${config.body}<p class="overlay-note">취소하면 현재 상태로 계속 진행됩니다.</p>`,
    `
      <div class="overlay-actions">
        <button id="overlayCancelButton" class="tool-button" type="button">취소</button>
        <button id="overlayConfirmButton" class="action-button primary" type="button">${config.confirm}</button>
      </div>
    `,
    {
      mode: "confirm",
      action,
      eyebrow: config.eyebrow,
    },
  );
}

function getStatusText() {
  if (!state.run.alive) {
    return state.run.exitReason === "burst"
      ? "상자가 폭발해 이번 런 보상이 0이 되었습니다."
      : state.run.exitReason === "auto_sold"
      ? "상자가 꽉 차 자동 판매되었습니다. 수수료가 적용된 연구 자금만 회수했습니다."
      : "박스를 수동 판매했습니다. 연구소를 강화하고 다음 런으로 이어가십시오.";
  }

  if (state.paused) {
    return "컨베이어와 물리가 일시정지 상태입니다.";
  }

  if (state.crateBurst.exploding) {
    return "상자가 폭발하는 중입니다. 이번 런 정산은 0으로 고정됩니다.";
  }

  if (state.crateBurst.warningFrames > 0) {
    return `상자 폭발 경고. 너무 큰 사과가 양쪽 벽을 동시에 밀고 있습니다. ${Math.max(0, Math.ceil((BALANCE.crateBurstWarnFrames - state.crateBurst.warningFrames) / 60))}초 안에 정리해야 합니다.`;
  }

  if (isSaleActive()) {
    return state.sale.reason === "auto_sold"
      ? `상자를 자동 포장해 경매장으로 보내는 중입니다. 수수료 ${Math.round(state.sale.feeRate * 100)}% 적용`
      : `상자를 ${state.sale.auctionName || "경매장"}에 올리고 정산 중입니다.`;
  }

  if (state.boxAnimation.active) {
    return "상자 확장 연출 중입니다. 확장 중에는 벨트와 드롭 타이머가 잠시 멈춥니다.";
  }

  if (state.spin.phase === "closing") {
    return "자동 회전 준비 중입니다. 뚜껑을 닫고 있습니다.";
  }

  if (state.spin.phase === "rotating") {
    return "자동 뒤집기가 상자를 회전시키며 배치를 다시 흔드는 중입니다.";
  }

  if (state.spin.phase === "opening") {
    return "자동 회전이 끝났고 다시 정상 공급으로 돌아가는 중입니다.";
  }

  if (canSellCrate()) {
    return `지금 경매 가능. 현재 예상가는 ${formatLabCurrency(state.run.sellPreview)}이며, 실제 경매 등급에 따라 더 높게 받을 수 있습니다.`;
  }

  if (state.run.redLineFrames > 0) {
    return `자동 경매선 경고입니다. 2초 더 걸리면 강제 경매되고 ${Math.round(getAutoSaleFeeRate() * 100)}% 수수료가 붙습니다.`;
  }

  if (IS_DEV_HOST && state.devSpeed > 1) {
    return `개발 배속 x${state.devSpeed} 상태입니다. 밸런스 확인용으로만 사용하십시오.`;
  }

  const dangerRatio = clamp(state.run.dangerRatio, 0, 1);
  if (dangerRatio >= 0.72) {
    return "위험도가 높습니다. 상자 확장과 자동 회전, 수동 경매 타이밍을 함께 보십시오.";
  }

  return "사과는 컨베이어에서 자동 공급됩니다. 상자 장비로 버티고, 과수원 연구로 다음 경매 수입을 점점 키우세요.";
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
        ? "폭탄 과수원 해금 필요"
        : `현재 폭탄 확률 ${formatPercent(getSpecialChances().bomb)}`;
    case "prismSeeder":
      return state.meta.upgrades.prismOrchard <= 0
        ? "무지개 육종실 해금 필요"
        : `현재 프리즘 확률 ${formatPercent(getSpecialChances().prism)}`;
    case "shockEngine":
      return `충격 배율 x${getShockMultiplier().toFixed(2)}`;
    case "autoSpinner": {
      const spec = getAutoSpinnerSpec();
      if (!spec) {
        return "자동 뒤집기 미해금";
      }
      return `위험도 ${Math.round(spec.threshold * 100)}% / 쿨다운 ${formatSeconds(spec.cooldownSeconds)}`;
    }
    case "dangerBuffer":
      return `위험 구역 하단 ${Math.round(getDangerZoneBottomRatio() * 100)}%`;
    case "valuePress":
      return `이번 런 점수/재화 x${getRunValueMultiplier().toFixed(2)}`;
    case "dropTier": {
      const rangeText = `${tierInfo.distribution[0].level + 1}~${tierInfo.upperLevel + 1}단계`;
      return `투입 범위 ${rangeText} · 주력 ${tierInfo.dominantLevel + 1}단계 ${Math.round(tierInfo.dominantChance * 100)}%`;
    }
    default:
      return "";
  }
}

function getMetaUpgradeDetail(key) {
  switch (key) {
    case "starterFund":
      return `다음 런 시작 자금 ${formatRunCurrency(getStarterCash())}`;
    case "durableCrate":
      return `자동 판매선 경고가 초당 ${getRedLineRecoveryFrames()}프레임씩 더 빨리 사라짐`;
    case "bombOrchard":
      return `기본 폭탄 확률 ${formatPercent(getBaseBombChance())}`;
    case "prismOrchard":
      return `기본 프리즘 확률 ${formatPercent(getBasePrismChance())}`;
    case "expansionEngineering":
      return `할인 ${Math.round(getExpansionDiscount() * 100)}% · 화면 안정 ${getCameraExponent().toFixed(2)}`;
    case "conveyorWorkshop":
      return `벨트 속도 x${getConveyorWorkshopMultiplier().toFixed(2)} · 중앙 벨트 ${hasCenterConveyor() ? "개방" : "잠김"}`;
    case "brokerageOffice":
      return `자동판매 수수료 ${Math.round(getAutoSaleFeeRate() * 100)}%`;
    case "twinConveyor":
      return hasTwinConveyor() ? "오른쪽 벨트 활성" : "오른쪽 벨트 미설치";
    case "goldenMulch":
      return `황금 사과 ${formatPercent(getGoldenAppleChance())} · 황금 보너스 x${getGoldenBonusScale().toFixed(2)}`;
    case "sortingShed":
      return `썩은 사과 ${formatPercent(getRottenAppleChance())}`;
    case "offlineOrchard":
      return `오프라인 배율 x${getOfflineMultiplier().toFixed(2)}`;
    case "mergeLedger":
      return `점수/런 재화 x${getMetaValueMultiplier().toFixed(2)}`;
    default:
      return "";
  }
}

function getUpgradeAssetPath(key) {
  return UPGRADE_ASSET_PATHS[key] || "";
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
  const levelText = finiteCap ? `${level}단계 / ${definition.cap}` : `${level}단계`;

  let stateLabel = shop === "run" ? formatRunCurrency(cost) : formatLabCurrency(cost);
  if (locked) {
    stateLabel = "잠김";
  } else if (capped) {
    stateLabel = "최대";
  }

  const assetPath = getUpgradeAssetPath(key);
  const artClasses = ["upgrade-art", assetPath ? "has-image" : ""].filter(Boolean).join(" ");
  const artStyle = assetPath ? ` style="--asset-image:url('${assetPath}');"` : "";

  return `
    <button class="${classes}" data-shop="${shop}" data-key="${key}" ${locked || capped ? "disabled" : ""}>
      <div class="${artClasses}" data-icon="${definition.icon || "ART"}" data-asset="${definition.asset || "slot"}"${artStyle}></div>
      <div class="upgrade-copy">
        <div class="upgrade-head">
          <span class="upgrade-title">${definition.label}</span>
          <span class="upgrade-level">${levelText}</span>
        </div>
        <p class="upgrade-note">${note}</p>
        <div class="upgrade-foot">
          <span class="upgrade-cost">${stateLabel}</span>
          <span class="upgrade-tag">${definition.tag}</span>
        </div>
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
    : "잠김";
  const cooldownText = state.run.timers.autoSpinCooldown > 0
    ? formatSeconds(state.run.timers.autoSpinCooldown / 60)
    : "준비";
  const specialChances = getSpecialChances();
  const tierInfo = getDropTierInfo();
  const topTierName = state.run.topTier >= 0 ? APPLE_TYPES[state.run.topTier].name : "-";
  const goldenChance = getGoldenAppleChance();
  const rottenChance = getRottenAppleChance();
  const conveyorLanes = getActiveConveyorLanes();
  const feedLabel = hasCenterConveyor()
    ? (hasTwinConveyor() ? "좌우 묶음 + 중앙" : "왼쪽 + 중앙")
    : (hasTwinConveyor() ? "좌우 묶음" : "왼쪽");
  const devSpeedRow = IS_DEV_HOST ? `
    <div class="stat-row">
      <dt>개발 배속</dt>
      <dd>x${state.devSpeed}</dd>
    </div>
  ` : "";

  return `
    <div class="stat-row">
      <dt>자동 투입</dt>
      <dd>${formatSeconds(getDropIntervalFrames() / 60)}</dd>
    </div>
    ${devSpeedRow}
    <div class="stat-row">
      <dt>주력 품종</dt>
      <dd>${tierInfo.dominantLevel + 1}단계<br>${Math.round(tierInfo.dominantChance * 100)}%</dd>
    </div>
    <div class="stat-row">
      <dt>투입 분포</dt>
      <dd>${getDropDistributionText(undefined, 3)}</dd>
    </div>
    <div class="stat-row">
      <dt>위험 구역</dt>
      <dd>${Math.round(getDangerZoneTopRatio() * 100)}% - ${Math.round(getDangerZoneBottomRatio() * 100)}%</dd>
    </div>
    <div class="stat-row">
      <dt>시즌</dt>
      <dd>${state.run.season + 1}</dd>
    </div>
    <div class="stat-row">
      <dt>폭탄 확률</dt>
      <dd>${formatPercent(specialChances.bomb)}</dd>
    </div>
    <div class="stat-row">
      <dt>프리즘 확률</dt>
      <dd>${formatPercent(specialChances.prism)}</dd>
    </div>
    <div class="stat-row">
      <dt>자동 뒤집기</dt>
      <dd>${spinnerText}<br>${cooldownText}</dd>
    </div>
    <div class="stat-row">
      <dt>상자 크기</dt>
      <dd>x${state.run.boxScale.toFixed(2)}</dd>
    </div>
    <div class="stat-row">
      <dt>예상 감정가</dt>
      <dd>${formatLabCurrency(state.run.sellPreview)}</dd>
    </div>
    <div class="stat-row">
      <dt>황금 사과</dt>
      <dd>${formatPercent(goldenChance)}</dd>
    </div>
    <div class="stat-row">
      <dt>썩은 사과</dt>
      <dd>${formatPercent(rottenChance)}</dd>
    </div>
    <div class="stat-row">
      <dt>자동 수수료</dt>
      <dd>${Math.round(getAutoSaleFeeRate() * 100)}%</dd>
    </div>
    <div class="stat-row">
      <dt>판매 가능</dt>
      <dd>${canSellCrate() ? "가능" : "잠김"}</dd>
    </div>
    <div class="stat-row">
      <dt>이번 경매</dt>
      <dd>판매 순간 랜덤</dd>
    </div>
    <div class="stat-row">
      <dt>오프라인 /초</dt>
      <dd>${formatLabCurrency(getOfflineRatePerSecond())}</dd>
    </div>
    <div class="stat-row">
      <dt>컨베이어</dt>
      <dd>${feedLabel}<br>표시 벨트 ${conveyorLanes.length}줄</dd>
    </div>
    <div class="stat-row">
      <dt>최고 점수</dt>
      <dd>${formatNumber(state.meta.bestScore)}</dd>
    </div>
    <div class="stat-row">
      <dt>최고 등급</dt>
      <dd>${topTierName}</dd>
    </div>
  `;
}

function buildBadgeMarkup() {
  const spinnerSpec = getAutoSpinnerSpec();
  const spinnerReady = spinnerSpec
    ? (state.run.timers.autoSpinCooldown > 0 ? `대기 ${formatSeconds(state.run.timers.autoSpinCooldown / 60)}` : "준비")
    : "잠김";
  const chances = getSpecialChances();
  const dangerRatio = clamp(state.run.dangerRatio, 0, 1);
  const tierInfo = getDropTierInfo();
  const goldenChance = getGoldenAppleChance();
  const rottenChance = getRottenAppleChance();
  const badges = [
    `<span class="badge"><strong>자동투입</strong>${formatSeconds(getDropIntervalFrames() / 60)}</span>`,
  ];

  if (IS_DEV_HOST) {
    badges.push(`<span class="badge"><strong>배속</strong>x${state.devSpeed}</span>`);
  }

  return badges.concat([
    `<span class="badge"><strong>주력 품종</strong>${tierInfo.dominantLevel + 1}단계</span>`,
    `<span class="badge"><strong>투입 범위</strong>1~${tierInfo.upperLevel + 1}단계</span>`,
    `<span class="badge"><strong>위험도</strong>${Math.round(dangerRatio * 100)}%</span>`,
    `<span class="badge"><strong>뒤집기</strong>${spinnerReady}</span>`,
    `<span class="badge"><strong>감정가</strong>${formatLabCurrency(state.run.sellPreview)}</span>`,
    `<span class="badge"><strong>판매</strong>${canSellCrate() ? "가능" : "잠김"}</span>`,
    `<span class="badge"><strong>황금</strong>${formatPercent(goldenChance)}</span>`,
    `<span class="badge"><strong>썩음</strong>${formatPercent(rottenChance)}</span>`,
    `<span class="badge"><strong>폭탄</strong>${formatPercent(chances.bomb)}</span>`,
    `<span class="badge"><strong>프리즘</strong>${formatPercent(chances.prism)}</span>`,
  ]).join("");
}

function buildLegend() {
  ui.legend.innerHTML = APPLE_TYPES.map((apple, index) => {
    return `
      <article class="legend-row" style="--apple-main:${apple.color}; --apple-highlight:${apple.highlight}; --apple-shadow:${apple.shadow}; --apple-leaf:${apple.leaf};">
        <div class="legend-icon" aria-hidden="true"><div class="legend-apple"></div></div>
        <div class="legend-copy">
          <strong>${apple.name}</strong>
          <span>${index + 1}단계 · 반지름 ${apple.radius}</span>
        </div>
        <span class="legend-points">${formatNumber(apple.points)}</span>
      </article>
    `;
  }).join("");
}

function renderGuideModal() {
  const activePane = sanitizeGuidePane(state.guidePane);
  ui.guideTabs.innerHTML = GUIDE_PANES.map((pane) => {
    const data = GUIDE_DATA[pane];
    const active = pane === activePane;
    return `<button class="guide-tab ${active ? "is-active" : ""}" data-guide-pane="${pane}" type="button">${data.label}</button>`;
  }).join("");

  const pane = GUIDE_DATA[activePane];
  ui.guideContent.innerHTML = `
    <section class="guide-section">
      <div class="guide-grid">
        ${pane.items.map((item) => {
          const iconClasses = ["guide-icon", item.asset ? "has-image" : ""].filter(Boolean).join(" ");
          const iconStyle = item.asset ? ` style="--asset-image:url(${item.asset});"` : "";
          return `
          <article class="guide-tile">
            <div class="${iconClasses}" data-icon="${item.icon}"${iconStyle}></div>
            <div class="guide-copy">
              <strong>${item.title}</strong>
              <p>${item.body}</p>
            </div>
          </article>
        `;
        }).join("")}
      </div>
    </section>
  `;
}

function setButtonLabel(button, label) {
  if (!button) {
    return;
  }
  const labelNode = button.querySelector(".button-label");
  if (labelNode) {
    labelNode.textContent = label;
  } else {
    button.textContent = label;
  }
  button.setAttribute("aria-label", label);
}

function syncControlUi(force) {
  const snapshot = `${state.activeMenu}|${state.sheetOpen}|${state.devSpeed}|${state.guidePane}`;
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
    const active = menu === state.activeMenu && state.sheetOpen;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-pressed", active ? "true" : "false");
  });

  document.querySelectorAll("[data-menu-pane]").forEach((pane) => {
    pane.classList.toggle("is-active", pane.dataset.menuPane === state.activeMenu);
  });

  if (ui.bottomSheet) {
    ui.bottomSheet.classList.toggle("is-open", state.sheetOpen);
  }
  if (ui.controlDock) {
    ui.controlDock.classList.toggle("is-sheet-open", state.sheetOpen);
  }

  if (ui.sheetTitle) {
    const sheetTitles = {
      automation: "경매 현황",
      run: "상점",
      lab: "연구실",
      ladder: "사과 도감",
    };
    ui.sheetTitle.textContent = sheetTitles[state.activeMenu] || "경매 현황";
  }

  if (ui.guideModal) {
    renderGuideModal();
  }

  state.controlSnapshot = snapshot;
}

function syncUi(force) {
  state.run.topTier = state.apples.reduce((highest, apple) => Math.max(highest, apple.level), state.run.topTier);
  state.run.sellPreview = isSaleActive() ? state.sale.appraisal : getAppraisalValue();
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
    state.sale.active,
    state.sale.reason,
    state.run.timers.autoSpinCooldown,
    state.run.redLineFrames,
    state.crateBurst.warningFrames,
    state.crateBurst.exploding,
    state.spin.phase,
    state.boxAnimation.active,
    canSellCrate(),
  ].join("|");

  if (force || state.uiSnapshot !== snapshot) {
    ui.score.textContent = formatNumber(state.run.score);
    ui.cash.textContent = formatRunCurrency(state.run.cash);
    ui.bank.textContent = formatLabCurrency(state.meta.bank);
    ui.danger.textContent = dangerPercent;
    ui.status.textContent = getStatusText();
    ui.appraisalValue.textContent = formatLabCurrency(state.run.sellPreview);
    ui.sellHint.textContent = getSellGateText();
    setButtonLabel(ui.pauseButton, state.paused ? "재개" : "멈춤");
    ui.pauseButton.disabled = !state.run.alive || state.crateBurst.exploding;
    ui.restartButton.disabled = isSaleActive() || state.crateBurst.exploding;
    ui.sellButton.disabled = !canSellCrate() || isSaleActive() || state.crateBurst.exploding;
    setButtonLabel(ui.sellButton, state.crateBurst.exploding ? "사고 처리 중" : (isSaleActive() ? "포장 중..." : (state.run.alive ? "경매 올리기" : "종료됨")));
    if (ui.summonButton) {
      ui.summonButton.disabled = !state.run.alive || state.paused || isSaleActive() || state.crateBurst.exploding;
    }
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
    ui.offlineText.textContent = `${formatDuration(state.offlineSummary.elapsedSeconds)} 동안 과수원이 ${formatLabCurrency(state.offlineSummary.gain)}을 모았습니다. 현재 런 상태는 저장 시점 그대로 복구되었습니다.`;
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
    state.sheetOpen = !state.sheetOpen;
    audioManager.play("ui-confirm");
    syncUi(true);
    return;
  }
  state.activeMenu = nextMenu;
  state.sheetOpen = true;
  audioManager.play("ui-confirm");
  syncUi(true);
}

function openGuide() {
  state.guidePane = sanitizeGuidePane(state.guidePane);
  state.sheetOpen = false;
  renderGuideModal();
  ui.guideModal.classList.remove("hidden");
  audioManager.play("ui-confirm");
  syncUi(true);
}

function closeGuide() {
  ui.guideModal.classList.add("hidden");
  audioManager.play("ui-confirm");
}

function setGuidePane(pane) {
  const nextPane = sanitizeGuidePane(pane);
  if (nextPane === state.guidePane) {
    return;
  }
  state.guidePane = nextPane;
  renderGuideModal();
  audioManager.play("ui-confirm");
}

function canBuyRunUpgrade(key) {
  if (!state.run.alive || isSaleActive() || state.crateBurst.exploding) {
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
  if (isSaleActive() || state.crateBurst.exploding) {
    return false;
  }
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
    spawnFloatingText(getOrchardBounds().centerX, getOrchardBounds().y - 20, "자동 뒤집개", "#e7f0ff", 52);
  }

  if (key === "dangerBuffer") {
    spawnFloatingText(getOrchardBounds().centerX, getOrchardBounds().y - 20, "위험 구역 하강", "#ffd7a8", 52);
  }

  if (key === "dropTier") {
    spawnFloatingText(getOrchardBounds().centerX, getOrchardBounds().y - 20, "우량 품종", "#fff0d5", 52);
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

  const previousLevel = state.meta.upgrades[key];
  const cost = getMetaUpgradeCost(key, state.meta.upgrades[key]);
  state.meta.bank -= cost;
  state.meta.upgrades[key] += 1;

  if (key === "durableCrate") {
    state.run.redLineFrames = Math.max(0, state.run.redLineFrames - 12);
  }

  if (key === "brokerageOffice") {
    spawnFloatingText(getOrchardBounds().centerX, getOrchardBounds().y - 20, "수수료 인하", "#cfe9ff", 48);
  }

  if (key === "conveyorWorkshop") {
    const seededTimers = createLaneDropTimers();
    if (hasCenterConveyor() && previousLevel < 4) {
      state.run.timers.drop.center = Math.max(state.run.timers.drop.center, seededTimers.center);
      spawnFloatingText(getOrchardBounds().centerX, getOrchardBounds().y - 20, "중앙 벨트 개방", "#d8f6ff", 56);
    } else {
      spawnFloatingText(getOrchardBounds().centerX, getOrchardBounds().y - 20, "벨트 정비", "#dff4ff", 48);
    }
  }

  if (key === "twinConveyor") {
    const seededTimers = createLaneDropTimers();
    state.nextSideLane = "right";
    state.run.timers.drop.left = Math.max(state.run.timers.drop.left, seededTimers.left);
    spawnFloatingText(getOrchardBounds().centerX, getOrchardBounds().y - 20, "보조 벨트", "#e6f4ff", 56);
  }

  if (key === "goldenMulch") {
    spawnFloatingText(getOrchardBounds().centerX, getOrchardBounds().y - 20, "황금 거름", "#fff0a8", 52);
  }

  if (key === "sortingShed") {
    spawnFloatingText(getOrchardBounds().centerX, getOrchardBounds().y - 20, "선별 강화", "#d8f0af", 52);
  }

  if (key === "mergeLedger") {
    spawnFloatingText(getOrchardBounds().centerX, getOrchardBounds().y - 20, "고급 농약", "#ffd7a8", 52);
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
  return sampleFromDistribution(tierInfo.distribution);
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

function drawTraitType() {
  const goldenChance = getGoldenAppleChance();
  const rottenChance = getRottenAppleChance();
  const roll = Math.random();
  if (roll < goldenChance) {
    return "golden";
  }
  if (roll < goldenChance + rottenChance) {
    return "rotten";
  }
  return null;
}

function getInfeedByLane(lane) {
  return state.infeeds.find((infeed) => infeed.lane === lane) || null;
}

function getActiveSideLanes() {
  const lanes = ["left"];
  if (hasTwinConveyor()) {
    lanes.push("right");
  }
  return lanes;
}

function getNextSideSpawnLane() {
  const sideLanes = getActiveSideLanes();
  if (sideLanes.length === 1) {
    state.nextSideLane = "left";
    return "left";
  }

  const preferred = sideLanes.includes(state.nextSideLane) ? state.nextSideLane : "left";
  const available = sideLanes.filter((lane) => !getInfeedByLane(lane));
  if (available.length === 0) {
    return null;
  }
  if (available.includes(preferred)) {
    return preferred;
  }
  return available[0];
}

function createInfeedToken(lane) {
  const interval = getDropIntervalFrames();
  const token = {
    lane,
    level: rollDropLevel(),
    special: drawSpecialType(),
    trait: drawTraitType(),
    frame: 0,
    beltFrames: getBeltFrames(interval),
  };
  state.infeeds.push(token);
  if (lane === "left" || lane === "right") {
    state.nextSideLane = lane === "left" ? "right" : "left";
  }
  return token;
}

function canSummonAppleNow() {
  const now = performance.now();
  state.summonHistory = state.summonHistory.filter((timestamp) => now - timestamp < 1000);
  if (state.summonHistory.length >= 10) {
    return false;
  }
  state.summonHistory.push(now);
  return true;
}

function summonAppleFromSky() {
  if (!state.run.alive || state.paused || isSaleActive() || state.crateBurst.exploding) {
    audioManager.play("ui-denied");
    return;
  }

  if (!canSummonAppleNow()) {
    audioManager.play("ui-denied");
    return;
  }

  const level = rollDropLevel();
  const orchard = getOrchardBounds();
  const radius = APPLE_TYPES[level].radius;
  const bounds = getHorizontalBounds(radius);
  const spread = Math.min(orchard.w * 0.18, 110);
  const spawnX = clamp(
    orchard.centerX + (Math.random() - 0.5) * spread * 2,
    bounds.minX,
    bounds.maxX,
  );
  const apple = createApple(level, spawnX, orchard.y - radius - 26, {
    vx: (Math.random() - 0.5) * 0.8,
    vy: 0.6,
    spinVelocity: (Math.random() - 0.5) * 0.08,
  });

  state.apples.push(apple);
  state.run.drops += 1;
  state.shake = Math.max(state.shake, 3.2);
  audioManager.play("summon", { level });
  spawnParticles(spawnX, orchard.y - radius + 12, APPLE_TYPES[level].highlight, 10, 2.6);
  spawnFloatingText(spawnX, orchard.y - radius - 24, `사과 소환 ${level + 1}단계`, "#fff4db", 34);
  syncUi(true);
}

function isSpinActive() {
  return state.spin.phase !== "idle";
}

function isAnimationBlockingFeed() {
  return isSpinActive() || state.boxAnimation.active || isSaleActive() || state.crateBurst.exploding;
}

function getInfeedProgress(infeed) {
  if (!infeed) {
    return 0;
  }
  return clamp(infeed.frame / Math.max(1, infeed.beltFrames), 0, 1);
}

function getInfeedVisual(infeed) {
  if (!infeed) {
    return null;
  }

  const geometry = getConveyorGeometry(infeed.lane);
  const progress = getInfeedProgress(infeed);
  const x = geometry.startX + (geometry.endX - geometry.startX) * progress;
  const y = geometry.startY + (geometry.endY - geometry.startY) * progress;
  const dx = geometry.endX - geometry.startX;
  const dy = geometry.endY - geometry.startY;
  const length = Math.hypot(dx, dy) || 1;
  const angle = Math.atan2(dy, dx);
  const spinDirection = getConveyorSpinDirection(infeed.lane);
  const spin = spinDirection * (length * progress) / Math.max(12, APPLE_TYPES[infeed.level].radius);

  return {
    x,
    y,
    angle,
    spin,
    unitX: dx / length,
    unitY: dy / length,
  };
}

function releaseInfeedApple(infeed) {
  if (!infeed) {
    return;
  }

  const visual = getInfeedVisual(infeed);
  const dropLevel = infeed.level;
  const tangentSpeed = 2.05;
  const apple = createApple(dropLevel, visual.x, visual.y, {
    special: infeed.special,
    trait: infeed.trait,
    vx: visual.unitX * tangentSpeed,
    vy: visual.unitY * tangentSpeed,
    spinVelocity: getConveyorSpinDirection(infeed.lane) * (0.07 + 0.008 * dropLevel),
    spin: visual.spin,
  });

  state.apples.push(apple);
  state.run.drops += 1;
  state.shake = Math.max(state.shake, 4.5);
  audioManager.play("drop-release", { level: dropLevel });
  spawnParticles(apple.x, apple.y + 6, APPLE_TYPES[dropLevel].color, 12, 3.5);
  state.infeeds = state.infeeds.filter((token) => token !== infeed);
  if (infeed.lane === "center") {
    state.run.timers.drop.center = 0;
  } else {
    state.run.timers.drop.left = 0;
    state.run.timers.drop.right = 0;
  }
}

function updateInfeeds() {
  if (!state.run.alive || state.paused || isAnimationBlockingFeed()) {
    return;
  }

  state.beltTime += 1;
  const interval = getDropIntervalFrames();
  const beltFrames = getBeltFrames(interval);
  const startAfter = Math.max(1, interval - beltFrames);
  let releasedSideLane = false;
  let releasedCenterLane = false;

  for (const infeed of state.infeeds.slice()) {
    infeed.frame += 1;
    if (infeed.frame >= infeed.beltFrames) {
      releaseInfeedApple(infeed);
      if (infeed.lane === "center") {
        releasedCenterLane = true;
      } else {
        releasedSideLane = true;
      }
    }
  }

  const sideLanes = getActiveSideLanes();
  const hasActiveSideToken = sideLanes.some((lane) => getInfeedByLane(lane));
  if (!releasedSideLane && !hasActiveSideToken) {
    state.run.timers.drop.left = Math.max(0, Number(state.run.timers.drop.left) || 0) + 1;
    if (state.run.timers.drop.left >= startAfter) {
      const lane = getNextSideSpawnLane();
      if (lane) {
        createInfeedToken(lane);
      }
    }
  }

  if (hasCenterConveyor() && !releasedCenterLane && !getInfeedByLane("center")) {
    state.run.timers.drop.center = Math.max(0, Number(state.run.timers.drop.center) || 0) + 1;
    if (state.run.timers.drop.center >= startAfter) {
      createInfeedToken("center");
    }
  }
}

function startSpinSkill() {
  if (!state.run.alive || state.paused || isSpinActive() || state.boxAnimation.active || state.crateBurst.exploding) {
    return false;
  }

  const orchard = getOrchardBounds();
  state.spin.phase = "closing";
  state.spin.frame = 0;
  state.spin.angle = 0;
  state.spin.lidProgress = 0;
  audioManager.play("spinner-start");
  flashScreen("rgba(188, 223, 255, 0.38)", 0.15);
  spawnFloatingText(orchard.centerX, orchard.y - 24, "자동 회전", "#edf7ff", 48);
  return true;
}

function maybeTriggerAutoSpinner() {
  if (state.crateBurst.warningFrames > 0 || state.crateBurst.exploding) {
    return;
  }
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
  spawnFloatingText(orchard.centerX, orchard.y - 24, "상자 증축", "#e9fff4", 58);
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
      spawnFloatingText(orchard.centerX, orchard.y - 24, "회전 시작", "#d9ebff", 42);
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
      spawnFloatingText(orchard.centerX, orchard.y - 24, "뚜껑 개방", "#fff1cf", 36);
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
    const mergedTrait = resolveMergedTrait(first.trait, second.trait);
    const mergedApple = createApple(
      nextLevel,
      clamp((first.x + second.x) * 0.5, horizontal.minX, horizontal.maxX),
      Math.min((first.y + second.y) * 0.5, orchard.bottom - appleType.radius),
      {
        fromMerge: true,
        trait: mergedTrait,
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

function resolveMergedTrait(firstTrait, secondTrait) {
  if (firstTrait && secondTrait) {
    return firstTrait === secondTrait ? firstTrait : null;
  }
  return firstTrait || secondTrait || null;
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
  spawnFloatingText(centerX, centerY - 12, `폭탄 +${formatNumber(gainedValue)}`, "#fff1c6", 62);
  spawnFloatingText(centerX, centerY + 24, `${affectedCount}개 흔들림`, "#ffd0b8", 52);
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
      trait: resolveMergedTrait(source.trait, target.trait),
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
  spawnFloatingText(target.x, target.y - 8, `프리즘 +${formatNumber(gainedValue)}`, "#ebfbff", 60);
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
  const bandTop = orchard.dangerTopY;
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
  const recoveryFrames = getRedLineRecoveryFrames();
  state.run.dangerRatio = clamp(metrics.fillRatio, 0, 1.6);
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
    startSaleSequence("auto_sold");
  }
}

function findCrateBurstApple(orchard) {
  for (const apple of state.apples) {
    if (
      apple.age > 24
      && apple.x - apple.r <= orchard.x - 6
      && apple.x + apple.r >= orchard.x + orchard.w + 6
    ) {
      return apple;
    }
  }
  return null;
}

function triggerCrateBurst(apple) {
  const orchard = getOrchardBounds();
  state.crateBurst.exploding = true;
  state.crateBurst.explodeFrames = 0;
  state.run.sellPreview = 0;
  state.sale.active = false;
  state.infeeds = [];
  state.run.timers.drop = createLaneDropTimers();
  flashScreen("rgba(255, 86, 86, 0.95)", 0.46);
  state.shake = Math.max(state.shake, 22);
  audioManager.play("crate-burst");
  spawnShockwave(orchard.centerX, orchard.centerY, "#ff6f59", orchard.w * 0.92, 24, 28);
  spawnShockwave(orchard.centerX, orchard.centerY, "#ffd7b8", orchard.w * 0.68, 18, 24);
  spawnParticles(orchard.centerX, orchard.centerY, "#ff7359", 72, 10.5);
  spawnParticles(orchard.centerX, orchard.centerY, "#ffd0a6", 48, 8.2);
  spawnFloatingText(orchard.centerX, orchard.centerY - 28, "상자 폭발", "#fff1e2", 64);
  spawnFloatingText(orchard.centerX, orchard.centerY + 16, "이번 보상 0", "#ffd1cc", 60);
  if (apple) {
    spawnFloatingText(apple.x, apple.y - apple.r - 12, `${APPLE_TYPES[apple.level].name} 과대 적재`, "#ffd7c2", 48);
  }
}

function updateCrateBurstState() {
  if (!state.run.alive || isSaleActive()) {
    return false;
  }

  if (state.crateBurst.exploding) {
    state.crateBurst.explodeFrames += 1;
    if (state.crateBurst.explodeFrames >= BALANCE.crateBurstExplodeFrames) {
      finishRun("burst");
    }
    return true;
  }

  const orchard = getOrchardBounds();
  const offender = findCrateBurstApple(orchard);
  if (offender) {
    if (state.crateBurst.appleId === offender.id) {
      state.crateBurst.warningFrames += 1;
    } else {
      state.crateBurst.appleId = offender.id;
      state.crateBurst.warningFrames = 1;
    }

    if (state.crateBurst.warningFrames >= BALANCE.crateBurstWarnFrames) {
      triggerCrateBurst(offender);
      return true;
    }
  } else if (state.crateBurst.warningFrames > 0) {
    state.crateBurst.warningFrames = Math.max(0, state.crateBurst.warningFrames - 3);
    if (state.crateBurst.warningFrames === 0) {
      state.crateBurst.appleId = 0;
    }
  }

  return false;
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

  if (isSaleActive()) {
    updateSaleSequence();
    updateParticles();
    updateShockwaves();
    updateFloatingTexts();
    state.screenFlash *= 0.92;
    return;
  }

  if (state.crateBurst.exploding) {
    updateCrateBurstState();
    updateParticles();
    updateShockwaves();
    updateFloatingTexts();
    state.shake *= 0.92;
    state.screenFlash *= 0.9;
    return;
  }

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
  updateInfeeds();

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
  updateCrateBurstState();
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

  const sky = ctx.createLinearGradient(0, -HEIGHT, 0, HEIGHT * 2);
  sky.addColorStop(0, "#cfeeff");
  sky.addColorStop(0.42, "#eff8ff");
  sky.addColorStop(0.62, "#f7f0dc");
  sky.addColorStop(1, "#ead6ad");
  ctx.fillStyle = sky;
  ctx.fillRect(-WIDTH, -HEIGHT, WIDTH * 3, HEIGHT * 3);

  const sunX = 708 - shakeX * 0.12;
  const sun = ctx.createRadialGradient(sunX, 126, 10, sunX, 126, 92);
  sun.addColorStop(0, "rgba(255, 249, 228, 0.96)");
  sun.addColorStop(1, "rgba(255, 247, 216, 0)");
  ctx.fillStyle = sun;
  ctx.beginPath();
  ctx.arc(sunX, 126, 92, 0, Math.PI * 2);
  ctx.fill();

  const horizon = 520;
  const farHill = ctx.createLinearGradient(0, 350, 0, 620);
  farHill.addColorStop(0, "#bad9a9");
  farHill.addColorStop(1, "#93bd7d");
  ctx.fillStyle = farHill;
  for (let index = -4; index < 8; index += 1) {
    const baseX = -240 + index * 260 - ((((shakeX * 0.08) % 260) + 260) % 260);
    ctx.beginPath();
    ctx.moveTo(baseX, horizon + 30);
    ctx.quadraticCurveTo(baseX + 110, 400, baseX + 260, horizon + 30);
    ctx.lineTo(baseX + 260, HEIGHT + 180);
    ctx.lineTo(baseX, HEIGHT + 180);
    ctx.closePath();
    ctx.fill();
  }

  const nearHill = ctx.createLinearGradient(0, 470, 0, HEIGHT);
  nearHill.addColorStop(0, "#8fbe70");
  nearHill.addColorStop(1, "#6f9d56");
  ctx.fillStyle = nearHill;
  for (let index = -4; index < 8; index += 1) {
    const baseX = -260 + index * 240 - ((((shakeX * 0.16) % 240) + 240) % 240);
    ctx.beginPath();
    ctx.moveTo(baseX, horizon + 100);
    ctx.quadraticCurveTo(baseX + 100, 470 + (index % 2) * 18, baseX + 240, horizon + 100);
    ctx.lineTo(baseX + 240, HEIGHT + 180);
    ctx.lineTo(baseX, HEIGHT + 180);
    ctx.closePath();
    ctx.fill();
  }

  ctx.fillStyle = "rgba(255, 255, 255, 0.72)";
  const cloudOffset = ((shakeX * 0.22) % 150 + 150) % 150;
  for (let row = 0; row < 4; row += 1) {
    for (let index = -3; index < 10; index += 1) {
      const x = -180 + index * 150 - cloudOffset + (row % 2) * 40;
      const y = 78 + row * 48;
      drawCloud(x, y, 0.6 + ((index + row + 10) % 2) * 0.12);
    }
  }

  ctx.fillStyle = "rgba(120, 164, 85, 0.16)";
  for (let row = 0; row < 8; row += 1) {
    const stripeY = 620 + row * 46;
    ctx.fillRect(-WIDTH, stripeY, WIDTH * 3, 10);
  }

  ctx.restore();
}

function getConveyorPalette(lane) {
  if (lane === "center") {
    return {
      shadow: "rgba(24, 40, 56, 0.34)",
      base: "#1f4257",
      mid: "#2f6583",
      highlight: "rgba(229, 248, 255, 0.16)",
      roller: "#5ea7c7",
      hub: "#103347",
      slat: "rgba(224, 246, 255, 0.16)",
    };
  }

  return {
    shadow: "rgba(27, 15, 9, 0.34)",
    base: "#2c251f",
    mid: "#50463e",
    highlight: "rgba(255, 238, 207, 0.12)",
    roller: "#5d3f27",
    hub: "#27170d",
    slat: "rgba(235, 221, 197, 0.12)",
  };
}

function drawConveyor() {
  const lanes = getActiveConveyorLanes();
  const offset = (state.beltTime * BALANCE.conveyor.slatSpeed) % BALANCE.conveyor.slatGap;

  for (const lane of lanes) {
    const geometry = getConveyorGeometry(lane);
    const palette = getConveyorPalette(lane);
    const dx = geometry.endX - geometry.startX;
    const dy = geometry.endY - geometry.startY;
    const angle = Math.atan2(dy, dx);
    const length = Math.hypot(dx, dy);

    ctx.save();
    ctx.translate(geometry.startX, geometry.startY);
    ctx.rotate(angle);

    ctx.strokeStyle = palette.shadow;
    ctx.lineWidth = geometry.width + 10;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(length, 0);
    ctx.stroke();

    ctx.strokeStyle = palette.base;
    ctx.lineWidth = geometry.width;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(length, 0);
    ctx.stroke();

    ctx.strokeStyle = palette.mid;
    ctx.lineWidth = geometry.width - 18;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(length, 0);
    ctx.stroke();

    ctx.strokeStyle = palette.highlight;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, -(geometry.width * 0.28));
    ctx.lineTo(length, -(geometry.width * 0.28));
    ctx.stroke();

    for (let position = -offset; position <= length + BALANCE.conveyor.slatGap; position += BALANCE.conveyor.slatGap) {
      ctx.fillStyle = palette.slat;
      ctx.fillRect(position, -(geometry.width * 0.33), 7, geometry.width * 0.66);
    }

    ctx.fillStyle = palette.roller;
    ctx.beginPath();
    ctx.arc(0, 0, geometry.width * 0.33, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(length, 0, geometry.width * 0.33, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = palette.hub;
    ctx.beginPath();
    ctx.arc(0, 0, geometry.width * 0.14, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(length, 0, geometry.width * 0.14, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}

function drawInfeedApple() {
  for (const lane of ["left", "center", "right"]) {
    const infeed = getInfeedByLane(lane);
    if (!infeed) {
      continue;
    }
    const visual = getInfeedVisual(infeed);
    drawApple({
      level: infeed.level,
      special: infeed.special,
      trait: infeed.trait,
      x: visual.x,
      y: visual.y,
      r: APPLE_TYPES[infeed.level].radius,
      spin: visual.spin,
    }, 1);
  }
}

function drawOrchardBack() {
  const orchard = getOrchardBounds();
  const dangerRatio = clamp(state.run.dangerRatio, 0, 1);
  const redLineRatio = clamp(state.run.redLineFrames / BALANCE.redLineHoldFrames, 0, 1);
  const burstWarningRatio = clamp(state.crateBurst.warningFrames / BALANCE.crateBurstWarnFrames, 0, 1);
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
  ctx.moveTo(orchard.x + 12, orchard.dangerTopY);
  ctx.lineTo(orchard.x + orchard.w - 12, orchard.dangerTopY);
  ctx.moveTo(orchard.x + 12, orchard.dangerY);
  ctx.lineTo(orchard.x + orchard.w - 12, orchard.dangerY);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.fillStyle = `rgba(255, 120, 84, ${0.06 + dangerRatio * 0.18})`;
  ctx.fillRect(orchard.x, orchard.dangerTopY, orchard.w, orchard.dangerY - orchard.dangerTopY);

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

  if (burstWarningRatio > 0) {
    const pulse = 0.4 + Math.sin(state.time * 0.55) * 0.18 + burstWarningRatio * 0.28;
    ctx.strokeStyle = `rgba(255, 74, 74, ${pulse})`;
    ctx.lineWidth = 8 + burstWarningRatio * 6;
    ctx.strokeRect(orchard.x - 18, orchard.y - 18, orchard.w + 36, orchard.h + 36);
    ctx.fillStyle = `rgba(255, 88, 88, ${0.06 + burstWarningRatio * 0.1})`;
    ctx.fillRect(orchard.x - 8, orchard.y - 8, orchard.w + 16, orchard.h + 16);
  }

  ctx.font = '700 18px "Avenir Next Condensed", "Arial Narrow", sans-serif';
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = `rgba(255, 245, 228, ${0.5 + dangerRatio * 0.4})`;
  ctx.fillText("위험 구역", orchard.x + 18, orchard.dangerTopY - 12);
  ctx.fillStyle = `rgba(255, 198, 198, ${0.55 + redLineRatio * 0.35})`;
  ctx.fillText(`자동 판매선 · 수수료 ${Math.round(getAutoSaleFeeRate() * 100)}%`, orchard.x + 18, orchard.redLineY - 12);
  if (burstWarningRatio > 0) {
    ctx.fillStyle = `rgba(255, 223, 223, ${0.72 + burstWarningRatio * 0.2})`;
    ctx.fillText(`상자 폭발 경고 · ${Math.max(0, Math.ceil((BALANCE.crateBurstWarnFrames - state.crateBurst.warningFrames) / 60))}초`, orchard.x + 18, orchard.y + 28);
  }

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
  const trait = apple.trait ? TRAIT_TYPES[apple.trait] : null;
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

  if (trait) {
    ctx.save();
    ctx.globalAlpha = alpha * 0.78;
    ctx.strokeStyle = trait.glow;
    ctx.lineWidth = Math.max(5, apple.r * 0.08);
    ctx.shadowColor = trait.glow;
    ctx.shadowBlur = Math.max(20, apple.r * 0.45);
    ctx.beginPath();
    ctx.arc(0, 0, apple.r * 1.1, 0, Math.PI * 2);
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

  if (apple.trait === "golden") {
    ctx.strokeStyle = "rgba(255, 228, 122, 0.88)";
    ctx.lineWidth = Math.max(3, apple.r * 0.05);
    ctx.beginPath();
    ctx.arc(0, 0, apple.r * 0.86, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = "#fff4b0";
    ctx.beginPath();
    ctx.moveTo(0, -apple.r * 0.72);
    ctx.lineTo(apple.r * 0.1, -apple.r * 0.5);
    ctx.lineTo(apple.r * 0.32, -apple.r * 0.48);
    ctx.lineTo(apple.r * 0.16, -apple.r * 0.3);
    ctx.lineTo(apple.r * 0.24, -apple.r * 0.06);
    ctx.lineTo(0, -apple.r * 0.2);
    ctx.lineTo(-apple.r * 0.24, -apple.r * 0.06);
    ctx.lineTo(-apple.r * 0.16, -apple.r * 0.3);
    ctx.lineTo(-apple.r * 0.32, -apple.r * 0.48);
    ctx.lineTo(-apple.r * 0.1, -apple.r * 0.5);
    ctx.closePath();
    ctx.fill();
  }

  if (apple.trait === "rotten") {
    ctx.strokeStyle = "rgba(155, 204, 89, 0.82)";
    ctx.lineWidth = Math.max(3, apple.r * 0.05);
    ctx.setLineDash([apple.r * 0.14, apple.r * 0.1]);
    ctx.beginPath();
    ctx.arc(0, 0, apple.r * 0.86, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = "rgba(133, 173, 71, 0.85)";
    ctx.beginPath();
    ctx.arc(-apple.r * 0.18, apple.r * 0.18, apple.r * 0.16, 0, Math.PI * 2);
    ctx.arc(apple.r * 0.16, apple.r * 0.02, apple.r * 0.13, 0, Math.PI * 2);
    ctx.fill();
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

  if (trait) {
    ctx.fillStyle = trait.accent;
    ctx.font = `900 ${Math.max(10, apple.r * 0.16)}px "Avenir Next Condensed", "Arial Narrow", sans-serif`;
    ctx.fillText(trait.shortLabel, 0, apple.r * 0.68);
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
  const burstRatio = state.crateBurst.exploding
    ? 1
    : clamp(state.crateBurst.warningFrames / BALANCE.crateBurstWarnFrames, 0, 1);
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

  if (burstRatio > 0) {
    ctx.strokeStyle = `rgba(255, 128, 128, ${0.46 + burstRatio * 0.32})`;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(orchard.x + orchard.w * 0.1, orchard.bottom - 10);
    ctx.lineTo(orchard.x + orchard.w * 0.22, orchard.bottom - 26);
    ctx.lineTo(orchard.x + orchard.w * 0.34, orchard.bottom - 8);
    ctx.moveTo(orchard.x + orchard.w * 0.62, orchard.bottom - 12);
    ctx.lineTo(orchard.x + orchard.w * 0.75, orchard.bottom - 30);
    ctx.lineTo(orchard.x + orchard.w * 0.88, orchard.bottom - 14);
    ctx.stroke();
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

function drawSalePackaging() {
  if (!isSaleActive()) {
    return;
  }

  const orchard = getOrchardBounds();
  const packingProgress = state.sale.phase === "packing"
    ? clamp(state.sale.frame / BALANCE.sale.packFrames, 0, 1)
    : 1;
  const shippingProgress = state.sale.phase === "shipping"
    ? clamp(state.sale.frame / BALANCE.sale.shipFrames, 0, 1)
    : 0;
  const wobble = Math.sin(state.time * 12) * (1 - shippingProgress) * 6;
  const squash = 1 - packingProgress * 0.02;
  const lidY = orchard.y - 16 - packingProgress * 4;
  const lidHeight = 34;
  const lidX = orchard.x - 26;
  const lidWidth = orchard.w + 52;

  ctx.save();
  ctx.translate(orchard.centerX, orchard.centerY);
  ctx.rotate(wobble * 0.008);
  ctx.scale(1, squash);
  ctx.translate(-orchard.centerX, -orchard.centerY);

  const lidGradient = ctx.createLinearGradient(0, lidY, 0, lidY + lidHeight);
  lidGradient.addColorStop(0, "#d9ab73");
  lidGradient.addColorStop(1, "#8d572d");
  ctx.fillStyle = lidGradient;
  ctx.fillRect(lidX, lidY, lidWidth, lidHeight);
  ctx.fillStyle = "rgba(255, 241, 219, 0.22)";
  ctx.fillRect(lidX, lidY, lidWidth, 5);

  const strapAlpha = 0.32 + packingProgress * 0.42;
  ctx.fillStyle = `rgba(236, 216, 183, ${strapAlpha})`;
  ctx.fillRect(orchard.x + orchard.w * 0.22, orchard.y - 16, 14, orchard.h + 34);
  ctx.fillRect(orchard.x + orchard.w * 0.68, orchard.y - 16, 14, orchard.h + 34);
  ctx.fillRect(orchard.x - 16, orchard.y + orchard.h * 0.34, orchard.w + 32, 12);

  if (packingProgress > 0.28) {
    ctx.fillStyle = `rgba(255, 243, 214, ${0.16 + packingProgress * 0.16})`;
    ctx.fillRect(orchard.x - 10, orchard.y + orchard.h * 0.18, orchard.w + 20, 10);
  }

  ctx.strokeStyle = `rgba(255, 255, 255, ${0.14 + packingProgress * 0.22})`;
  ctx.lineWidth = 5;
  for (let streak = 0; streak < 5; streak += 1) {
    const y = orchard.y + 64 + streak * 126;
    ctx.beginPath();
    ctx.moveTo(orchard.x + 26, y);
    ctx.lineTo(orchard.x + orchard.w - 26, y - 10);
    ctx.stroke();
  }

  const labelWidth = Math.max(148, orchard.w * 0.22);
  const labelHeight = 70;
  const labelX = orchard.centerX - labelWidth / 2;
  const labelY = orchard.centerY - labelHeight / 2;
  const labelPulse = state.sale.labelPulse;
  if (labelPulse > 0) {
    ctx.save();
    ctx.translate(orchard.centerX, orchard.centerY);
    ctx.scale(1 + labelPulse * 0.045, 1 + labelPulse * 0.045);
    ctx.translate(-orchard.centerX, -orchard.centerY);
  }
  ctx.fillStyle = "rgba(255, 250, 238, 0.95)";
  ctx.fillRect(labelX, labelY, labelWidth, labelHeight);
  ctx.strokeStyle = "rgba(120, 81, 44, 0.24)";
  ctx.lineWidth = 2;
  ctx.strokeRect(labelX, labelY, labelWidth, labelHeight);
  ctx.fillStyle = "#6c401b";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = '900 20px "Avenir Next Condensed", "Arial Narrow", sans-serif';
  ctx.fillText(state.sale.reason === "auto_sold" ? "자동 경매" : "수동 경매", orchard.centerX, orchard.centerY - 18);
  ctx.font = '700 14px "Avenir Next Condensed", "Arial Narrow", sans-serif';
  ctx.fillText(`${state.sale.auctionShortLabel || "경매"} x${state.sale.auctionMultiplier.toFixed(2)}`, orchard.centerX, orchard.centerY + 4);
  ctx.fillText(`보너스 ${formatLabCurrency(state.sale.displayedBonus)} · 감액 ${Math.round(state.sale.rottenPenaltyRate * 100)}%`, orchard.centerX, orchard.centerY + 24);
  if (labelPulse > 0) {
    ctx.restore();
  }

  for (const trail of state.sale.bonusTrails) {
    ctx.save();
    ctx.fillStyle = trail.color;
    ctx.globalAlpha = trail.life / trail.maxLife;
    ctx.beginPath();
    ctx.arc(trail.x, trail.y, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.4)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(trail.x - 6, trail.y);
    ctx.lineTo(trail.x + 6, trail.y);
    ctx.stroke();
    ctx.restore();
  }

  if (state.sale.phase === "shipping") {
    ctx.strokeStyle = "rgba(255, 233, 188, 0.46)";
    ctx.lineWidth = 5;
    for (let line = 0; line < 4; line += 1) {
      const x = orchard.x - 180 + line * 34 - shippingProgress * 190;
      const y = orchard.y + 90 + line * 92;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + 120, y + 8);
      ctx.stroke();
    }
  }

  ctx.restore();
}

function formatCompactNumber(value) {
  const absolute = Math.abs(value);
  if (absolute >= 1e9) {
    return `${(value / 1e9).toFixed(absolute >= 1e10 ? 0 : 1)}B`;
  }
  if (absolute >= 1e6) {
    return `${(value / 1e6).toFixed(absolute >= 1e7 ? 0 : 1)}M`;
  }
  if (absolute >= 1e4) {
    return `${(value / 1e3).toFixed(absolute >= 1e5 ? 0 : 1)}K`;
  }
  return formatNumber(value);
}

function traceRoundedRect(x, y, width, height, radius) {
  const safeRadius = Math.min(radius, width * 0.5, height * 0.5);
  ctx.beginPath();
  ctx.moveTo(x + safeRadius, y);
  ctx.lineTo(x + width - safeRadius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + safeRadius);
  ctx.lineTo(x + width, y + height - safeRadius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - safeRadius, y + height);
  ctx.lineTo(x + safeRadius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - safeRadius);
  ctx.lineTo(x, y + safeRadius);
  ctx.quadraticCurveTo(x, y, x + safeRadius, y);
  ctx.closePath();
}

function getCanvasHudStatus() {
  if (!state.run.alive) {
    if (state.run.exitReason === "burst") {
      return "상자 폭발 · 보상 0";
    }
    return state.run.exitReason === "auto_sold" ? "상자 자동 경매 완료" : "상자 경매 완료";
  }
  if (isSaleActive()) {
    return state.sale.reason === "auto_sold" ? "상자 자동 포장 중" : "상자 경매 포장 중";
  }
  if (state.crateBurst.exploding) {
    return "상자 폭발 중";
  }
  if (state.crateBurst.warningFrames > 0) {
    return `상자 폭발 경고 ${Math.max(0, Math.ceil((BALANCE.crateBurstWarnFrames - state.crateBurst.warningFrames) / 60))}s`;
  }
  if (state.paused) {
    return "일시 정지";
  }
  if (state.spin.phase === "rotating") {
    return "상자 자동 회전 중";
  }
  if (state.run.redLineFrames > 0) {
    return `자동 판매선 경고 ${Math.max(0, Math.ceil((BALANCE.redLineHoldFrames - state.run.redLineFrames) / 60))}s`;
  }
  if (canSellCrate()) {
    return `경매 가능 · 예상 ${formatLabCurrency(state.run.sellPreview)}`;
  }
  return `${state.run.season + 1}철 · ${hasTwinConveyor() ? "쌍벨트" : "단일벨트"} · ${formatSeconds(getDropIntervalFrames() / 60)}`;
}

function drawHudChip(x, y, width, label, value, accent, fill) {
  const height = 48;
  const radius = 20;
  ctx.save();
  ctx.fillStyle = fill;
  ctx.strokeStyle = "rgba(255, 255, 255, 0.24)";
  ctx.lineWidth = 1.5;
  traceRoundedRect(x, y, width, height, radius);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "rgba(255, 246, 230, 0.74)";
  ctx.font = '700 12px "Pretendard", "Apple SD Gothic Neo", sans-serif';
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  ctx.fillText(label, x + 14, y + 16);

  ctx.fillStyle = "#fffdfa";
  ctx.font = '900 17px "Pretendard", "Apple SD Gothic Neo", sans-serif';
  ctx.fillText(value, x + 14, y + 36);

  ctx.fillStyle = accent;
  ctx.beginPath();
  ctx.arc(x + width - 16, y + 16, 4.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawCanvasHud() {
  const paddingX = 18;
  const topY = 18;
  const gap = 8;
  const chipWidth = (WIDTH - paddingX * 2 - gap * 3) / 4;
  const dangerRatio = clamp(state.run.dangerRatio, 0, 1);
  const chips = [
    ["점수", formatCompactNumber(state.run.score), "#ffce71", "rgba(80, 46, 24, 0.68)"],
    ["런 재화", formatCompactNumber(state.run.cash), "#f79d56", "rgba(116, 55, 28, 0.68)"],
    ["연구 자금", formatCompactNumber(state.meta.bank), "#71b8ff", "rgba(44, 71, 104, 0.68)"],
    ["상자 가치", formatCompactNumber(state.run.sellPreview), "#ffe59b", "rgba(94, 68, 39, 0.7)"],
  ];

  chips.forEach((chip, index) => {
    drawHudChip(paddingX + index * (chipWidth + gap), topY, chipWidth, chip[0], chip[1], chip[2], chip[3]);
  });

  const dangerY = topY + 58;
  const dangerWidth = WIDTH - paddingX * 2;
  ctx.save();
  ctx.fillStyle = "rgba(59, 37, 21, 0.7)";
  traceRoundedRect(paddingX, dangerY, dangerWidth, 24, 12);
  ctx.fill();
  ctx.fillStyle = dangerRatio >= 0.72 ? "#ff7869" : "#f1bb62";
  traceRoundedRect(paddingX, dangerY, Math.max(34, dangerWidth * Math.max(0.04, dangerRatio)), 24, 12);
  ctx.fill();
  ctx.fillStyle = "#fffaf2";
  ctx.font = '800 13px "Pretendard", "Apple SD Gothic Neo", sans-serif';
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText(`위험 수치 ${Math.round(dangerRatio * 100)}%`, paddingX + 12, dangerY + 12);
  ctx.restore();

  const statusText = getCanvasHudStatus();
  const statusWidth = Math.min(WIDTH - 36, 520);
  const statusX = (WIDTH - statusWidth) / 2;
  const statusY = HEIGHT - 46;
  ctx.save();
  ctx.fillStyle = "rgba(56, 35, 19, 0.72)";
  ctx.strokeStyle = "rgba(255, 255, 255, 0.18)";
  ctx.lineWidth = 1.5;
  traceRoundedRect(statusX, statusY, statusWidth, 32, 16);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#fffaf2";
  ctx.font = '800 15px "Pretendard", "Apple SD Gothic Neo", sans-serif';
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(statusText, WIDTH / 2, statusY + 17);
  ctx.restore();
}

function drawScene() {
  const shakeX = state.shake === 0 ? 0 : Math.sin(state.time * 1.7) * state.shake;
  const shakeY = state.shake === 0 ? 0 : Math.cos(state.time * 1.35) * state.shake * 0.45;
  const orchard = getOrchardBounds();
  const viewportAnchor = getViewportAnchor();
  const cameraScale = getCameraScale();
  const saleShiftX = getSaleShiftX();

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
  ctx.translate(saleShiftX, 0);
  ctx.translate(orchard.centerX, orchard.centerY);
  ctx.rotate(state.spin.angle);
  ctx.translate(-orchard.centerX, -orchard.centerY);
  drawOrchardBack();
  drawApples();
  drawParticlesOnCanvas();
  drawShockwavesOnCanvas();
  drawFloatingTextOnCanvas();
  drawSkillLid();
  drawSalePackaging();
  drawOrchardFront();
  ctx.restore();

  if (state.screenFlash > 0) {
    ctx.save();
    ctx.globalAlpha = state.screenFlash;
    ctx.fillStyle = state.screenFlashColor;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    ctx.restore();
  }

  drawCanvasHud();
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

function handleGuideTabClick(event) {
  const button = event.target.closest("[data-guide-pane]");
  if (!button) {
    return;
  }
  setGuidePane(button.dataset.guidePane);
}

function handleGuideButtonClick() {
  openGuide();
}

function handleGuideModalClick(event) {
  if (event.target === ui.guideModal) {
    closeGuide();
  }
}

function handleOverlayClick(event) {
  const confirmButton = event.target.closest("#overlayConfirmButton");
  if (confirmButton) {
    const action = ui.overlay.dataset.action;
    hideOverlay();
    if (action === "sell") {
      attemptSellCrate();
    } else if (action === "restart") {
      startNewRun();
    }
    return;
  }

  const cancelButton = event.target.closest("#overlayCancelButton");
  if (cancelButton) {
    hideOverlay();
    if (state.paused) {
      showOverlay(
        "잠시 멈춤",
        `<p class="overlay-lead">컨베이어와 상자 물리를 잠시 멈췄습니다. 버튼이나 P 키로 다시 이어갈 수 있습니다.</p>`,
        "",
        { mode: "pause", eyebrow: "과수원 알림" },
      );
    }
    return;
  }

  const restartButton = event.target.closest("#overlayRestartButton");
  if (restartButton) {
    startNewRun();
  }
}

function registerScrollIntentGuard(element) {
  if (!element) {
    return;
  }

  const gesture = {
    pointerId: null,
    startX: 0,
    startY: 0,
    suppressUntil: 0,
  };

  function clearGesture(pointerId) {
    if (gesture.pointerId === pointerId) {
      gesture.pointerId = null;
    }
  }

  element.addEventListener("pointerdown", (event) => {
    if (event.pointerType === "mouse" && event.button !== 0) {
      return;
    }
    gesture.pointerId = event.pointerId;
    gesture.startX = event.clientX;
    gesture.startY = event.clientY;
  }, { passive: true });

  element.addEventListener("pointermove", (event) => {
    if (gesture.pointerId !== event.pointerId) {
      return;
    }

    const deltaX = Math.abs(event.clientX - gesture.startX);
    const deltaY = Math.abs(event.clientY - gesture.startY);
    if (deltaY > 10 || deltaX > 10) {
      gesture.suppressUntil = Date.now() + 260;
    }
  }, { passive: true });

  element.addEventListener("pointerup", (event) => {
    clearGesture(event.pointerId);
  }, { passive: true });

  element.addEventListener("pointercancel", (event) => {
    clearGesture(event.pointerId);
  }, { passive: true });

  element.addEventListener("click", (event) => {
    if (Date.now() >= gesture.suppressUntil) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
  }, true);
}

function handleKeyDown(event) {
  if (event.code === "KeyP") {
    togglePause();
    event.preventDefault();
  }

  if (event.code === "KeyR") {
    requestRestartRun();
    event.preventDefault();
  }

  if (event.code === "KeyS") {
    requestSellCrate();
    event.preventDefault();
  }

  if (event.code === "Escape" && state.offlineSummary) {
    dismissOfflineModal();
    event.preventDefault();
  }

  if (event.code === "Escape" && !ui.guideModal.classList.contains("hidden")) {
    closeGuide();
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
  const info = getDropTierInfo({
    upgrades: {
      dropTier: tierReal > 0 ? Math.max(1, Math.round(Math.exp(tierReal / 1.4) - 1)) : 0,
    },
  });
  return info.distribution.reduce((sum, entry) => sum + APPLE_TYPES[entry.level].points * entry.chance, 0);
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
          conveyorWorkshop: 5,
          brokerageOffice: 4,
          twinConveyor: 1,
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
          conveyorWorkshop: 12,
          brokerageOffice: 8,
          twinConveyor: 1,
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
    priorities.push("dangerBuffer", "crateExpansion", "autoSpinner", "shockEngine", "valuePress", "dropMotor");
  } else {
    priorities.push("dropMotor", "valuePress", "crateExpansion", "dangerBuffer", "dropTier", "autoSpinner", "shockEngine");
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
    const feedStreams = 1 + (hasCenterConveyor(meta) ? 1 : 0);
    const dropsPerSecond = (60 / interval) * feedStreams;
    const tierReal = getDropTierReal(fakeRun);
    const pointValue = getExpectedDropPointValue(fakeRun);
    const special = getSpecialChances(meta, fakeRun);
    const shock = getShockMultiplier(fakeRun);
    const boxScale = getBoxScaleForLevel(runLevels.crateExpansion);
    const dangerBottom = getDangerZoneBottomRatio(fakeRun);
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
    const relief = 0.06 * shock + (spinner ? (0.18 + (0.88 - spinner.threshold) * 0.7) : 0) + Math.max(0, dangerBottom - BALANCE.dangerZoneBaseBottomRatio) * 1.8;
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

    const estimatedAppraisal = score * clamp(0.08 + 0.07 * Math.log1p(topTier + 1) + 0.04 * Math.log1p(applesApprox + 1), 0.12, 1.35);

    if (
      timeSeconds >= BALANCE.sellGateFrames / 60
      && (estimatedAppraisal >= BALANCE.sellGateValue || applesApprox >= BALANCE.sellGateApples || topTier >= BALANCE.sellGateTier)
      && danger >= 0.68
    ) {
      sold = true;
      appraisal = estimatedAppraisal;
      break;
    }

    if (danger >= 1) {
      sold = true;
      appraisal = estimatedAppraisal;
      break;
    }

    timeSeconds += 1;
  }

  if (sold) {
    const feeRate = danger >= 1 ? getAutoSaleFeeRate(meta) : 0;
    appraisal *= 1 - feeRate;
  }

  return {
    runtime: timeSeconds,
    sold,
    sellBonusRatio: sold ? appraisal / Math.max(1, score) : 0,
    bankGain: appraisal,
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

if (ui.runShop) {
  ui.runShop.addEventListener("click", handleShopClick);
}
if (ui.labShop) {
  ui.labShop.addEventListener("click", handleShopClick);
}
if (ui.devSpeedControls) {
  ui.devSpeedControls.addEventListener("click", handleDevSpeedClick);
}
if (ui.menuTabs) {
  ui.menuTabs.addEventListener("click", handleMenuTabClick);
}
if (ui.restartButton) {
  ui.restartButton.addEventListener("click", requestRestartRun);
}
if (ui.pauseButton) {
  ui.pauseButton.addEventListener("click", () => togglePause());
}
if (ui.sellButton) {
  ui.sellButton.addEventListener("click", requestSellCrate);
}
if (ui.summonButton) {
  ui.summonButton.addEventListener("click", summonAppleFromSky);
}
if (ui.overlay) {
  ui.overlay.addEventListener("click", handleOverlayClick);
}
if (ui.guideButton) {
  ui.guideButton.addEventListener("click", handleGuideButtonClick);
}
if (ui.guideDockButton) {
  ui.guideDockButton.addEventListener("click", handleGuideButtonClick);
}
if (ui.guideTabs) {
  ui.guideTabs.addEventListener("click", handleGuideTabClick);
}
if (ui.guideModal) {
  ui.guideModal.addEventListener("click", handleGuideModalClick);
}
if (ui.guideCloseButton) {
  ui.guideCloseButton.addEventListener("click", closeGuide);
}
if (ui.offlineDismissButton) {
  ui.offlineDismissButton.addEventListener("click", dismissOfflineModal);
}
registerScrollIntentGuard(ui.automationList);
registerScrollIntentGuard(ui.runShop);
registerScrollIntentGuard(ui.labShop);
registerScrollIntentGuard(ui.legend);
registerScrollIntentGuard(ui.guideContent);
window.addEventListener("keydown", handleKeyDown, { passive: false });
window.addEventListener("beforeunload", saveState);
document.addEventListener("visibilitychange", handleVisibilityChange);
window.addEventListener("pointerdown", primeAudio, { once: true, passive: true });
window.addEventListener("keydown", primeAudio, { once: true });

buildLegend();
syncUi(true);
requestAnimationFrame(frame);
