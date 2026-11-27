/**
 * ShipStatusPanel - 선내 상태 요약
 */

import {
  HERO,
  LEVELS_PER_ZONE,
  PLAYER_SHIP,
  ZONE_ROUTES,
  getCompletedHomeZones,
  getEncounterById,
  homeShipProgressRatio,
  isHomeShipComplete,
  RepairZoneId,
} from '../story/campaign';

interface ShipStatusPanelProps {
  homeZoneLevels: Record<RepairZoneId, number>;
  collectedIds: string[];
  onClose: () => void;
}

export function ShipStatusPanel({
  homeZoneLevels,
  collectedIds,
  onClose,
}: ShipStatusPanelProps) {
  const pct = Math.round(homeShipProgressRatio(homeZoneLevels) * 100);
  const completed = getCompletedHomeZones(homeZoneLevels);
  const homeDone = isHomeShipComplete(homeZoneLevels);
  const nextZone = PLAYER_SHIP.zones.find((z) => homeZoneLevels[z.id] < LEVELS_PER_ZONE);

  return (
    <div className="absolute inset-0 z-[70] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg bg-slate-950 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden animate-[fadeIn_0.25s_ease-out]">
        <div className="flex items-center gap-3 p-5 border-b border-slate-800">
          <img
            src={HERO.portrait}
            alt={HERO.nameKo}
            className="w-12 h-12 rounded-xl object-cover border border-slate-600"
          />
          <div className="flex-1">
            <h2 className="text-lg font-bold text-white">선내 상태</h2>
            <p className="text-xs text-slate-400">{PLAYER_SHIP.nameKo} 진단 리포트</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white text-sm px-3 py-1.5 rounded-lg border border-slate-700"
          >
            닫기
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
            <div className="flex justify-between text-xs text-slate-400 mb-2">
              <span>기체 전체 수리</span>
              <span className="text-sky-300 font-semibold">{pct}%</span>
            </div>
            <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-sky-500 to-cyan-200 transition-all"
                style={{ width: `${pct}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-2">
              {homeDone
                ? '냥스타호 완전 수리 완료!'
                : `완료 구역 ${completed.length}/4 · 다음 목표: ${nextZone?.nameKo ?? '-'}`}
            </p>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">
              열린 항로
            </h3>
            <div className="space-y-2">
              {ZONE_ROUTES.map((route) => {
                const zoneDone = homeZoneLevels[route.zoneId] >= LEVELS_PER_ZONE;
                const ship = getEncounterById(route.encounterId);
                const collected = collectedIds.includes(route.encounterId);
                return (
                  <div
                    key={route.zoneId}
                    className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/50 px-3 py-2.5"
                  >
                    <div>
                      <div className="text-sm text-white font-medium">
                        {route.headingKo} · {PLAYER_SHIP.zones.find((z) => z.id === route.zoneId)?.nameKo}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {!zoneDone
                          ? '항로 잠김 — 구역 수리 필요'
                          : collected
                            ? `${ship?.nameKo} 구조 완료`
                            : `${ship?.nameKo} 조우 가능`}
                      </div>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-1 rounded-full ${
                        collected
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : zoneDone
                            ? 'bg-sky-500/20 text-sky-300'
                            : 'bg-slate-700 text-slate-400'
                      }`}
                    >
                      {collected ? 'CLEAR' : zoneDone ? 'OPEN' : 'LOCK'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
