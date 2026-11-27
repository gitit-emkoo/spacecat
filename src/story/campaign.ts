/**
 * 캠페인 스토리 데이터
 *
 * 냥스타호 함교에서 수리 구역을 고르면, 그 구역 클리어 시 해당 항로의 조우 기체가 열린다.
 * 조우 기체는 1구역(10레벨)만 수리한 뒤 컬렉션 등록 → 함교 복귀.
 */

export type RepairZoneId = 'tail' | 'leftWing' | 'engine' | 'nose';

export type RouteHeading = 'aft' | 'port' | 'deep' | 'forward';

export interface RepairZone {
  id: RepairZoneId;
  nameKo: string;
  levelsRequired: number;
  intro: string;
  clearLine: string;
}

export interface ShipEncounter {
  id: string;
  nameKo: string;
  kind: 'playerShip' | 'derelict';
  blurb: string;
  accent: string;
  zones: RepairZone[];
}

export interface ZoneRoute {
  zoneId: RepairZoneId;
  heading: RouteHeading;
  headingKo: string;
  encounterId: string;
}

/** 구역당 퍼즐 레벨 수 */
export const LEVELS_PER_ZONE = 10;

const ZONE_ORDER: RepairZoneId[] = ['tail', 'leftWing', 'engine', 'nose'];

function makeHomeZones(
  overrides?: Partial<Record<RepairZoneId, Partial<RepairZone>>>
): RepairZone[] {
  const base: RepairZone[] = [
    {
      id: 'tail',
      nameKo: '꼬리',
      levelsRequired: LEVELS_PER_ZONE,
      intro: '꼬리 쪽 안정 핀이 전부 풀려 있어. 나사를 순서대로 빼내자!',
      clearLine: '꼬리 수리 완료! 후방 항로가 열렸어.',
    },
    {
      id: 'leftWing',
      nameKo: '왼쪽 날개',
      levelsRequired: LEVELS_PER_ZONE,
      intro: '왼쪽 날개 패널이 덜렁거려. 잠긴 볼트 체인부터 풀자.',
      clearLine: '왼쪽 날개 수리 완료! 좌현 항로가 열렸어.',
    },
    {
      id: 'engine',
      nameKo: '엔진룸',
      levelsRequired: LEVELS_PER_ZONE,
      intro: '엔진룸 차폐판이 엉켜 있어. 같은 색 나사 세 개씩 정리하자.',
      clearLine: '엔진룸 수리 완료! 심우주 항로가 열렸어.',
    },
    {
      id: 'nose',
      nameKo: '앞부분',
      levelsRequired: LEVELS_PER_ZONE,
      intro: '선수 센서 하우징이 흔들려. 집중해서 풀자.',
      clearLine: '앞부분 수리 완료! 전방 항로가 열렸어.',
    },
  ];

  if (!overrides) return base;
  return base.map((z) => ({ ...z, ...overrides[z.id] }));
}

/** 조우 기체용 단일 구역 */
function makeSortieZone(
  id: RepairZoneId,
  nameKo: string,
  intro: string,
  clearLine: string
): RepairZone[] {
  return [
    {
      id,
      nameKo,
      levelsRequired: LEVELS_PER_ZONE,
      intro,
      clearLine,
    },
  ];
}

export const PLAYER_SHIP: ShipEncounter = {
  id: 'cat-patrol-ship-01',
  nameKo: '냥스타호',
  kind: 'playerShip',
  accent: '#38bdf8',
  blurb:
    '우주를 순찰하던 고양이 우주비행사. 갑작스러운 고장으로 비행선이 멈춰 섰다. 함교에서 구역을 골라 수리하고, 열린 항로로 조우하자.',
  zones: makeHomeZones({
    nose: { clearLine: '앞부분 수리 완료! 전방 항로가 열렸어. 냥스타호, 출항 준비!' },
  }),
};

export const SCOUT_SHIP: ShipEncounter = {
  id: 'derelict-scout-02',
  nameKo: '표류 정찰선',
  kind: 'derelict',
  accent: '#a78bfa',
  blurb: '후방 항로에서 구조 신호를 포착했다. 무인 정찰선이 반쯤 분해된 채 떠 있다.',
  zones: makeSortieZone(
    'tail',
    '추력기',
    '정찰선 추력기가 통째로 비틀려 있어. 볼트부터 정리하자.',
    '표류 정찰선 수리 완료! 컬렉션에 등록한다.'
  ),
};

export const CARGO_SHIP: ShipEncounter = {
  id: 'cargo-hauler-03',
  nameKo: '화물 수송선',
  kind: 'derelict',
  accent: '#fbbf24',
  blurb: '좌현 항로 밖에서 화물 수송선이 표류 중이다. 선장은 이미 대피했고, 기체만 남았다.',
  zones: makeSortieZone(
    'leftWing',
    '도킹 클램프',
    '화물선 도킹 클램프가 고착됐어. 나사부터 빼자.',
    '화물 수송선 완전 수리! 컬렉션에 추가!'
  ),
};

export const MINING_SHIP: ShipEncounter = {
  id: 'mining-drone-04',
  nameKo: '광산 채굴선',
  kind: 'derelict',
  accent: '#34d399',
  blurb: '심우주 항로에서 채굴선의 조난 비콘이 깜빡인다. 드릴 암이 엉킨 채 표류 중이다.',
  zones: makeSortieZone(
    'engine',
    '드릴 암',
    '채굴선 드릴 암 고정 볼트가 가득하다. 차근차근 풀자.',
    '광산 채굴선 수리 완료! 컬렉션에 등록!'
  ),
};

export const RESEARCH_SHIP: ShipEncounter = {
  id: 'research-probe-05',
  nameKo: '연구 탐사선',
  kind: 'derelict',
  accent: '#fb7185',
  blurb: '전방 항로에서 연구 탐사선의 긴급 통신이 들어왔다. 센서 돔이 흔들리고 있다.',
  zones: makeSortieZone(
    'nose',
    '센서 돔',
    '탐사선 센서 돔 하우징이 흔들린다. 마지막 나사들을 정리하자!',
    '연구 탐사선 완전 수리! 컬렉션에 추가!'
  ),
};

/** 컬렉션·목록용 (홈 + 조우 전부) */
export const ENCOUNTERS: ShipEncounter[] = [
  PLAYER_SHIP,
  SCOUT_SHIP,
  CARGO_SHIP,
  MINING_SHIP,
  RESEARCH_SHIP,
];

export const ZONE_ROUTES: ZoneRoute[] = [
  { zoneId: 'tail', heading: 'aft', headingKo: '후방', encounterId: SCOUT_SHIP.id },
  { zoneId: 'leftWing', heading: 'port', headingKo: '좌현', encounterId: CARGO_SHIP.id },
  { zoneId: 'engine', heading: 'deep', headingKo: '심우주', encounterId: MINING_SHIP.id },
  { zoneId: 'nose', heading: 'forward', headingKo: '전방', encounterId: RESEARCH_SHIP.id },
];

/** 구역별 선내 분위기 (3D 씬 + 브리핑 UI) */
export interface ZoneAtmosphere {
  zoneId: RepairZoneId;
  bayNameKo: string;
  tagline: string;
  background: string;
  fog: string;
  ambientIntensity: number;
  keyLightColor: string;
  fillLightColor: string;
  accentLightColor: string;
  platformColor: string;
  rimColor: string;
  gridCell: string;
  gridSection: string;
  ringColor: string;
  uiAccent: string;
  uiGlow: string;
}

export const ZONE_ATMOSPHERES: Record<RepairZoneId, ZoneAtmosphere> = {
  tail: {
    zoneId: 'tail',
    bayNameKo: '후방 추력 베이',
    tagline: '안정 핀과 추력기 고정 볼트가 가득하다',
    background: '#070b16',
    fog: '#0a1224',
    ambientIntensity: 0.28,
    keyLightColor: '#93c5fd',
    fillLightColor: '#38bdf8',
    accentLightColor: '#6366f1',
    platformColor: '#0f172a',
    rimColor: '#38bdf8',
    gridCell: '#1e293b',
    gridSection: '#334155',
    ringColor: '#38bdf8',
    uiAccent: '#38bdf8',
    uiGlow: 'rgba(56,189,248,0.35)',
  },
  leftWing: {
    zoneId: 'leftWing',
    bayNameKo: '좌현 날개 정비고',
    tagline: '패널이 흔들리고 체인 잠금이 엉켜 있다',
    background: '#061412',
    fog: '#0a1f1a',
    ambientIntensity: 0.3,
    keyLightColor: '#5eead4',
    fillLightColor: '#2dd4bf',
    accentLightColor: '#34d399',
    platformColor: '#0f1f1a',
    rimColor: '#2dd4bf',
    gridCell: '#134e4a',
    gridSection: '#0f766e',
    ringColor: '#14b8a6',
    uiAccent: '#2dd4bf',
    uiGlow: 'rgba(45,212,191,0.35)',
  },
  engine: {
    zoneId: 'engine',
    bayNameKo: '엔진룸 차폐 구역',
    tagline: '열기와 차폐판 볼트가 동시에 덤벼든다',
    background: '#140a06',
    fog: '#1c1008',
    ambientIntensity: 0.32,
    keyLightColor: '#fdba74',
    fillLightColor: '#f97316',
    accentLightColor: '#fbbf24',
    platformColor: '#1c120a',
    rimColor: '#f97316',
    gridCell: '#7c2d12',
    gridSection: '#c2410c',
    ringColor: '#f59e0b',
    uiAccent: '#fb923c',
    uiGlow: 'rgba(249,115,22,0.35)',
  },
  nose: {
    zoneId: 'nose',
    bayNameKo: '선수 센서 하우징',
    tagline: '항법 센서가 흔들려 신호가 번쩍인다',
    background: '#120814',
    fog: '#1a0c1c',
    ambientIntensity: 0.3,
    keyLightColor: '#f9a8d4',
    fillLightColor: '#fb7185',
    accentLightColor: '#a855f7',
    platformColor: '#1a1020',
    rimColor: '#fb7185',
    gridCell: '#4c1d3a',
    gridSection: '#9d174d',
    ringColor: '#e879f9',
    uiAccent: '#fb7185',
    uiGlow: 'rgba(251,113,133,0.35)',
  },
};

export function getZoneAtmosphere(zoneId: RepairZoneId): ZoneAtmosphere {
  return ZONE_ATMOSPHERES[zoneId];
}

export const HERO = {
  id: 'captain-nyangi',
  nameKo: '캡틴 냥이',
  titleKo: '고양이 우주비행사',
  portrait: '/characters/cat-astronaut-avatar.jpg',
  fullBody: '/characters/cat-astronaut.jpg',
};

export type PlayContext =
  | { kind: 'home'; zoneId: RepairZoneId; levelInZone: number }
  | { kind: 'sortie'; encounterId: string; levelInZone: number };

export interface CampaignProgress {
  homeZoneLevels: Record<RepairZoneId, number>;
  playContext: PlayContext | null;
  globalLevel: number;
  score: number;
  collectedIds: string[];
  soundEnabled: boolean;
  seenTutorial: boolean;
  seenHomeComplete: boolean;
}

export interface ProgressSnapshot {
  encounter: ShipEncounter;
  zone: RepairZone;
  zoneIndex: number;
  levelInZone: number;
  levelsRequired: number;
  levelInShip: number;
  totalInShip: number;
  zoneProgressRatio: number;
  shipProgressRatio: number;
  completedZoneIds: RepairZoneId[];
  route?: ZoneRoute;
}

function emptyHomeLevels(): Record<RepairZoneId, number> {
  return { tail: 0, leftWing: 0, engine: 0, nose: 0 };
}

export function createDefaultProgress(): CampaignProgress {
  return {
    homeZoneLevels: emptyHomeLevels(),
    playContext: null,
    globalLevel: 1,
    score: 0,
    collectedIds: [],
    soundEnabled: true,
    seenTutorial: false,
    seenHomeComplete: false,
  };
}

export function getEncounterById(id: string): ShipEncounter | undefined {
  return ENCOUNTERS.find((e) => e.id === id);
}

export function getZoneById(zoneId: RepairZoneId): RepairZone {
  return PLAYER_SHIP.zones.find((z) => z.id === zoneId)!;
}

export function getRouteForZone(zoneId: RepairZoneId): ZoneRoute {
  return ZONE_ROUTES.find((r) => r.zoneId === zoneId)!;
}

export function getEncounterForZone(zoneId: RepairZoneId): ShipEncounter {
  const route = getRouteForZone(zoneId);
  return getEncounterById(route.encounterId)!;
}

export function totalLevelsInShip(encounter: ShipEncounter): number {
  return encounter.zones.reduce((sum, z) => sum + z.levelsRequired, 0);
}

export function getCompletedHomeZones(
  homeZoneLevels: Record<RepairZoneId, number>
): RepairZoneId[] {
  return ZONE_ORDER.filter((id) => homeZoneLevels[id] >= LEVELS_PER_ZONE);
}

export function isHomeZoneComplete(
  homeZoneLevels: Record<RepairZoneId, number>,
  zoneId: RepairZoneId
): boolean {
  return homeZoneLevels[zoneId] >= LEVELS_PER_ZONE;
}

export function isHomeShipComplete(
  homeZoneLevels: Record<RepairZoneId, number>
): boolean {
  return ZONE_ORDER.every((id) => homeZoneLevels[id] >= LEVELS_PER_ZONE);
}

export function homeShipProgressRatio(
  homeZoneLevels: Record<RepairZoneId, number>
): number {
  const total = ZONE_ORDER.length * LEVELS_PER_ZONE;
  const done = ZONE_ORDER.reduce((sum, id) => sum + Math.min(homeZoneLevels[id], LEVELS_PER_ZONE), 0);
  return done / total;
}

export function resolveProgressFromContext(
  ctx: PlayContext,
  homeZoneLevels: Record<RepairZoneId, number>
): ProgressSnapshot {
  if (ctx.kind === 'home') {
    const zone = getZoneById(ctx.zoneId);
    const zoneIndex = PLAYER_SHIP.zones.findIndex((z) => z.id === ctx.zoneId);
    const completedZoneIds = getCompletedHomeZones(homeZoneLevels);
    const levelInZone = Math.min(Math.max(1, ctx.levelInZone), zone.levelsRequired);
    const completedLevels = ZONE_ORDER.reduce(
      (sum, id) => sum + Math.min(homeZoneLevels[id], LEVELS_PER_ZONE),
      0
    );
    // 현재 구역 진행 중이면 완료 카운트에 현재 레벨은 아직 미반영 → 표시용
    const levelInShip = completedLevels - Math.min(homeZoneLevels[ctx.zoneId], LEVELS_PER_ZONE) + levelInZone;
    const totalInShip = totalLevelsInShip(PLAYER_SHIP);
    return {
      encounter: PLAYER_SHIP,
      zone,
      zoneIndex,
      levelInZone,
      levelsRequired: zone.levelsRequired,
      levelInShip,
      totalInShip,
      zoneProgressRatio: levelInZone / zone.levelsRequired,
      shipProgressRatio: levelInShip / totalInShip,
      completedZoneIds,
      route: getRouteForZone(ctx.zoneId),
    };
  }

  const encounter = getEncounterById(ctx.encounterId) ?? SCOUT_SHIP;
  const zone = encounter.zones[0];
  const levelInZone = Math.min(Math.max(1, ctx.levelInZone), zone.levelsRequired);
  return {
    encounter,
    zone,
    zoneIndex: 0,
    levelInZone,
    levelsRequired: zone.levelsRequired,
    levelInShip: levelInZone,
    totalInShip: zone.levelsRequired,
    zoneProgressRatio: levelInZone / zone.levelsRequired,
    shipProgressRatio: levelInZone / zone.levelsRequired,
    completedZoneIds: [],
  };
}

/** HUD용: 컨텍스트 없을 때 홈 요약 */
export function resolveLobbySnapshot(
  homeZoneLevels: Record<RepairZoneId, number>
): ProgressSnapshot {
  const completedZoneIds = getCompletedHomeZones(homeZoneLevels);
  const nextZone =
    PLAYER_SHIP.zones.find((z) => homeZoneLevels[z.id] < LEVELS_PER_ZONE) ??
    PLAYER_SHIP.zones[PLAYER_SHIP.zones.length - 1];
  const levelInZone = Math.min(
    Math.max(1, homeZoneLevels[nextZone.id] + 1),
    nextZone.levelsRequired
  );
  const totalInShip = totalLevelsInShip(PLAYER_SHIP);
  const completedLevels = ZONE_ORDER.reduce(
    (sum, id) => sum + Math.min(homeZoneLevels[id], LEVELS_PER_ZONE),
    0
  );
  return {
    encounter: PLAYER_SHIP,
    zone: nextZone,
    zoneIndex: PLAYER_SHIP.zones.findIndex((z) => z.id === nextZone.id),
    levelInZone: isHomeShipComplete(homeZoneLevels) ? nextZone.levelsRequired : levelInZone,
    levelsRequired: nextZone.levelsRequired,
    levelInShip: Math.max(1, completedLevels),
    totalInShip,
    zoneProgressRatio: homeZoneLevels[nextZone.id] / nextZone.levelsRequired,
    shipProgressRatio: homeShipProgressRatio(homeZoneLevels),
    completedZoneIds,
    route: getRouteForZone(nextZone.id),
  };
}

const COLLECTION_KEY = 'bolt-merge-ship-collection';
const PROGRESS_KEY = 'bolt-merge-campaign-progress';

export function loadCollection(): string[] {
  try {
    const raw = localStorage.getItem(COLLECTION_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

export function saveCollection(ids: string[]): void {
  localStorage.setItem(COLLECTION_KEY, JSON.stringify(ids));
}

export function loadCampaignProgress(): CampaignProgress {
  const defaults = createDefaultProgress();
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    if (!raw) {
      return { ...defaults, collectedIds: loadCollection() };
    }
    const parsed = JSON.parse(raw) as Partial<CampaignProgress>;
    const homeZoneLevels = { ...emptyHomeLevels(), ...parsed.homeZoneLevels };
    return {
      ...defaults,
      ...parsed,
      homeZoneLevels,
      collectedIds:
        Array.isArray(parsed.collectedIds) && parsed.collectedIds.length > 0
          ? parsed.collectedIds
          : loadCollection(),
      playContext: parsed.playContext ?? null,
      soundEnabled: parsed.soundEnabled !== false,
    };
  } catch {
    return { ...defaults, collectedIds: loadCollection() };
  }
}

export function saveCampaignProgress(progress: CampaignProgress): void {
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
  saveCollection(progress.collectedIds);
}

export function clearCampaignProgress(): void {
  localStorage.removeItem(PROGRESS_KEY);
  localStorage.removeItem(COLLECTION_KEY);
}
