/**
 * StoryHud - 캡틴 냥이 아바타 + 현재 수리 구역 진행도
 */

import { HERO, ProgressSnapshot } from '../story/campaign';

interface StoryHudProps {
  progress: ProgressSnapshot;
  score: number;
  remainingCount: number;
  combo: number;
  onOpenCollection: () => void;
  onReturnToLobby: () => void;
  onReset: () => void;
}

export function StoryHud({
  progress,
  score,
  remainingCount,
  combo,
  onOpenCollection,
  onReturnToLobby,
  onReset,
}: StoryHudProps) {
  const { encounter, zone, levelInZone, levelsRequired, completedZoneIds, route } = progress;
  const zonePct = Math.round((levelInZone / levelsRequired) * 100);

  return (
    <div className="absolute top-0 left-0 right-0 z-40 p-3 md:p-4 pointer-events-none">
      <div className="max-w-5xl mx-auto flex items-start justify-between gap-3">
        <div className="pointer-events-auto flex items-start gap-3 min-w-0">
          <div
            className="relative w-14 h-14 md:w-16 md:h-16 rounded-2xl overflow-hidden border-2 shrink-0 shadow-lg"
            style={{ borderColor: encounter.accent, boxShadow: `0 0 18px ${encounter.accent}55` }}
          >
            <img
              src={HERO.portrait}
              alt={HERO.nameKo}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-white font-bold text-sm md:text-base">{HERO.nameKo}</span>
              <span className="text-[10px] md:text-xs text-slate-400">{HERO.titleKo}</span>
            </div>
            <div className="text-xs md:text-sm mt-0.5 truncate" style={{ color: encounter.accent }}>
              {encounter.nameKo} · {zone.nameKo} 수리 중
              {route ? ` · ${route.headingKo}` : ''}
            </div>
            <div className="mt-1.5 w-40 md:w-56">
              <div className="flex justify-between text-[10px] text-slate-400 mb-0.5">
                <span>
                  {zone.nameKo} {levelInZone}/{levelsRequired}
                </span>
                <span>{zonePct}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${zonePct}%`,
                    background: `linear-gradient(90deg, ${encounter.accent}, #e2e8f0)`,
                  }}
                />
              </div>
              {encounter.kind === 'playerShip' && (
                <div className="flex gap-1 mt-1.5">
                  {encounter.zones.map((z) => {
                    const done = completedZoneIds.includes(z.id);
                    const current = z.id === zone.id;
                    return (
                      <div
                        key={z.id}
                        title={z.nameKo}
                        className={`h-1.5 flex-1 rounded-full ${
                          done ? 'bg-emerald-400' : current ? 'bg-sky-400/80' : 'bg-slate-700'
                        }`}
                      />
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="pointer-events-auto flex items-center gap-1.5 md:gap-2 flex-wrap justify-end">
          {combo > 0 && (
            <div className="bg-violet-950/80 backdrop-blur-sm rounded-lg px-2.5 py-1 border border-violet-500/50 animate-pulse">
              <span className="text-violet-200 text-[10px]">콤보 </span>
              <span className="text-violet-100 font-bold text-sm">x{combo}</span>
            </div>
          )}
          <div className="bg-slate-900/80 backdrop-blur-sm rounded-lg px-2.5 py-1 border border-slate-700">
            <span className="text-slate-400 text-[10px]">점수 </span>
            <span className="text-amber-300 font-bold text-sm">{score}</span>
          </div>
          <div className="bg-slate-900/80 backdrop-blur-sm rounded-lg px-2.5 py-1 border border-slate-700">
            <span className="text-slate-400 text-[10px]">나사 </span>
            <span className="text-emerald-300 font-bold text-sm">{remainingCount}</span>
          </div>
          <button
            type="button"
            onClick={onReturnToLobby}
            className="bg-slate-900/80 backdrop-blur-sm rounded-lg px-2.5 py-1 border border-sky-700/60 text-sky-200 hover:border-sky-400 hover:text-white text-[11px] transition-colors"
          >
            함교로
          </button>
          <button
            type="button"
            onClick={onOpenCollection}
            className="bg-slate-900/80 backdrop-blur-sm rounded-lg px-2.5 py-1 border border-slate-600 text-slate-200 hover:border-sky-400 hover:text-white text-[11px] transition-colors"
          >
            컬렉션
          </button>
          <button
            type="button"
            onClick={onReset}
            className="bg-slate-900/80 backdrop-blur-sm rounded-lg px-2.5 py-1 border border-slate-700 text-slate-400 hover:text-white text-[11px] transition-colors"
          >
            리셋
          </button>
        </div>
      </div>
    </div>
  );
}
