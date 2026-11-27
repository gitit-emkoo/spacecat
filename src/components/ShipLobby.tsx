/**
 * ShipLobby - 냥스타호 함교 대기실
 */

import {
  HERO,
  LEVELS_PER_ZONE,
  PLAYER_SHIP,
  PlayContext,
  getCompletedHomeZones,
  getEncounterById,
  getRouteForZone,
  getZoneById,
  homeShipProgressRatio,
  isHomeShipComplete,
  RepairZoneId,
} from '../story/campaign';

interface ShipLobbyProps {
  homeZoneLevels: Record<RepairZoneId, number>;
  playContext: PlayContext | null;
  collectedIds: string[];
  showHomeCompleteBanner: boolean;
  onContinueRepair: () => void;
  onOpenRepairMap: () => void;
  onOpenCollection: () => void;
  onOpenStatus: () => void;
  onOpenSettings: () => void;
  onOpenTutorial: () => void;
  onDismissHomeComplete: () => void;
}

function contextSummary(ctx: PlayContext | null, homeZoneLevels: Record<RepairZoneId, number>): string {
  if (!ctx) {
    const next = PLAYER_SHIP.zones.find((z) => homeZoneLevels[z.id] < LEVELS_PER_ZONE);
    if (!next) return '냥스타호 수리 완료 · 항로 순찰 대기';
    const route = getRouteForZone(next.id);
    return `다음 추천: ${next.nameKo} (${route.headingKo} 항로)`;
  }
  if (ctx.kind === 'home') {
    const zone = getZoneById(ctx.zoneId);
    const route = getRouteForZone(ctx.zoneId);
    return `진행 중: ${zone.nameKo} ${ctx.levelInZone}/${LEVELS_PER_ZONE} · ${route.headingKo}`;
  }
  const ship = getEncounterById(ctx.encounterId);
  return `조우 수리 중: ${ship?.nameKo ?? '미확인'} ${ctx.levelInZone}/${LEVELS_PER_ZONE}`;
}

export function ShipLobby({
  homeZoneLevels,
  playContext,
  collectedIds,
  showHomeCompleteBanner,
  onContinueRepair,
  onOpenRepairMap,
  onOpenCollection,
  onOpenStatus,
  onOpenSettings,
  onOpenTutorial,
  onDismissHomeComplete,
}: ShipLobbyProps) {
  const pct = Math.round(homeShipProgressRatio(homeZoneLevels) * 100);
  const completed = getCompletedHomeZones(homeZoneLevels);
  const summary = contextSummary(playContext, homeZoneLevels);
  const canResume = playContext !== null;
  const homeDone = isHomeShipComplete(homeZoneLevels);

  return (
    <div className="absolute inset-0 z-[55] overflow-hidden">
      {/* 함교 배경 */}
      <div className="absolute inset-0">
        <img
          src={HERO.fullBody}
          alt=""
          className="absolute inset-0 w-full h-full object-cover scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-950/80 to-slate-950/55" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/70" />
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 30%, rgba(56,189,248,0.25), transparent 40%), radial-gradient(circle at 80% 70%, rgba(167,139,250,0.2), transparent 35%)',
          }}
        />
      </div>

      <div className="relative h-full flex flex-col p-4 md:p-8">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-sky-400/80 mb-1">
              Bridge · {PLAYER_SHIP.nameKo}
            </p>
            <h1 className="text-2xl md:text-4xl font-bold text-white tracking-tight">함교</h1>
            <p className="text-slate-400 text-sm mt-1 max-w-md">
              {HERO.nameKo}의 대기실. 수리를 이어가거나 항로를 확인하세요.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onOpenTutorial}
              className="px-3 py-2 rounded-xl border border-slate-600 bg-slate-900/70 text-slate-200 text-xs hover:border-sky-400 transition"
            >
              조작 안내
            </button>
            <button
              type="button"
              onClick={onOpenSettings}
              className="px-3 py-2 rounded-xl border border-slate-600 bg-slate-900/70 text-slate-200 text-xs hover:border-sky-400 transition"
            >
              설정
            </button>
          </div>
        </div>

        {showHomeCompleteBanner && homeDone && (
          <div className="mt-4 rounded-2xl border border-sky-500/40 bg-sky-950/70 px-4 py-3 flex items-center justify-between gap-3">
            <p className="text-sm text-sky-100">
              냥스타호 완전 수리! 모든 항로가 열렸습니다.
            </p>
            <button
              type="button"
              onClick={onDismissHomeComplete}
              className="text-xs text-sky-300 hover:text-white shrink-0"
            >
              확인
            </button>
          </div>
        )}

        <div className="flex-1 flex flex-col md:flex-row items-stretch md:items-end gap-6 mt-6 md:mt-10">
          <div className="md:w-[420px] space-y-3">
            <div className="rounded-2xl border border-slate-700/80 bg-slate-950/75 backdrop-blur-md p-4">
              <div className="flex justify-between text-xs text-slate-400 mb-2">
                <span>기체 수리도</span>
                <span className="text-sky-300">{pct}%</span>
              </div>
              <div className="h-2 rounded-full bg-slate-800 overflow-hidden mb-2">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-sky-500 to-cyan-200"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <p className="text-[12px] text-slate-300">{summary}</p>
              <p className="text-[11px] text-slate-500 mt-1">
                구역 {completed.length}/4 · 컬렉션 {collectedIds.length}기
              </p>
            </div>

            <button
              type="button"
              onClick={onContinueRepair}
              className="w-full px-5 py-4 rounded-2xl font-bold text-slate-950 bg-sky-400 hover:bg-sky-300 transition hover:scale-[1.01] shadow-lg shadow-sky-500/20"
            >
              {canResume ? '수리 계속하기' : '수리 맵에서 구역 선택'}
            </button>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={onOpenRepairMap}
                className="px-3 py-3 rounded-xl border border-slate-600 bg-slate-900/80 text-slate-100 text-xs font-semibold hover:border-sky-400 transition"
              >
                수리 맵
              </button>
              <button
                type="button"
                onClick={onOpenCollection}
                className="px-3 py-3 rounded-xl border border-slate-600 bg-slate-900/80 text-slate-100 text-xs font-semibold hover:border-sky-400 transition"
              >
                컬렉션
              </button>
              <button
                type="button"
                onClick={onOpenStatus}
                className="px-3 py-3 rounded-xl border border-slate-600 bg-slate-900/80 text-slate-100 text-xs font-semibold hover:border-sky-400 transition"
              >
                선내 상태
              </button>
            </div>
          </div>

          <div className="flex-1 hidden md:flex items-end justify-end pb-2">
            <div className="max-w-xs text-right">
              <p className="text-slate-500 text-xs mb-1">캡틴 로그</p>
              <p className="text-slate-300 text-sm leading-relaxed">
                “구역을 고칠수록 그쪽으로 우주선이 나아갈 수 있어. 어디로 출항할지 네가 정해.”
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
