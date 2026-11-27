/**
 * RepairMapPanel - 구역 선택 + 항로/조우 상태
 */

import {
  HERO,
  LEVELS_PER_ZONE,
  PLAYER_SHIP,
  getEncounterById,
  getRouteForZone,
  RepairZoneId,
} from '../story/campaign';

interface RepairMapPanelProps {
  homeZoneLevels: Record<RepairZoneId, number>;
  collectedIds: string[];
  onSelectZone: (zoneId: RepairZoneId) => void;
  onLaunchSortie: (zoneId: RepairZoneId) => void;
  onClose: () => void;
}

export function RepairMapPanel({
  homeZoneLevels,
  collectedIds,
  onSelectZone,
  onLaunchSortie,
  onClose,
}: RepairMapPanelProps) {
  return (
    <div className="absolute inset-0 z-[70] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl bg-slate-950 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden animate-[fadeIn_0.25s_ease-out]">
        <div className="flex items-center gap-3 p-5 border-b border-slate-800">
          <img
            src={HERO.portrait}
            alt={HERO.nameKo}
            className="w-12 h-12 rounded-xl object-cover border border-slate-600"
          />
          <div className="flex-1">
            <h2 className="text-lg font-bold text-white">수리 맵</h2>
            <p className="text-xs text-slate-400">구역을 고르면 그 방향 항로가 열립니다</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white text-sm px-3 py-1.5 rounded-lg border border-slate-700"
          >
            닫기
          </button>
        </div>

        <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[65vh] overflow-y-auto">
          {PLAYER_SHIP.zones.map((zone) => {
            const levels = Math.min(homeZoneLevels[zone.id], LEVELS_PER_ZONE);
            const done = levels >= LEVELS_PER_ZONE;
            const route = getRouteForZone(zone.id);
            const encounter = getEncounterById(route.encounterId);
            const collected = collectedIds.includes(route.encounterId);
            const pct = Math.round((levels / LEVELS_PER_ZONE) * 100);
            const inProgress = levels > 0 && !done;
            const canLaunch = done && !collected;
            const locked = done && collected;

            return (
              <button
                key={zone.id}
                type="button"
                disabled={locked}
                onClick={() => (canLaunch ? onLaunchSortie(zone.id) : onSelectZone(zone.id))}
                className={`text-left rounded-2xl border p-4 transition ${
                  locked
                    ? 'border-emerald-800/60 bg-emerald-950/30 cursor-default'
                    : canLaunch
                      ? 'border-amber-600/50 bg-amber-950/20 hover:border-amber-400'
                      : 'border-slate-700 bg-slate-900/80 hover:border-sky-400 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <div className="text-sm font-bold text-white">{zone.nameKo}</div>
                    <div className="text-[11px] text-sky-300/90 mt-0.5">
                      {route.headingKo} 항로 → {encounter?.nameKo}
                    </div>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-1 rounded-full shrink-0 ${
                      collected
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : done
                          ? 'bg-amber-500/20 text-amber-300'
                          : inProgress
                            ? 'bg-sky-500/20 text-sky-300'
                            : 'bg-slate-700 text-slate-400'
                    }`}
                  >
                    {collected
                      ? '조우 완료'
                      : done
                        ? '출항 가능'
                        : inProgress
                          ? '수리 중'
                          : '대기'}
                  </span>
                </div>

                <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden mb-2">
                  <div
                    className={`h-full rounded-full transition-all ${
                      done ? 'bg-emerald-400' : 'bg-sky-400'
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-slate-500">
                  <span>
                    {levels}/{LEVELS_PER_ZONE} 레벨
                  </span>
                  <span>
                    {locked ? '구역 완료' : canLaunch ? '탭하여 출항' : '탭하여 수리'}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        <div className="px-5 pb-5">
          <p className="text-[11px] text-slate-500 text-center">
            구역을 클리어하면 해당 항로 조우가 열립니다. 미수집 조우는 맵에서 다시 출항할 수 있습니다.
          </p>
        </div>
      </div>
    </div>
  );
}
