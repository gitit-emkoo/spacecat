/**
 * ZoneBriefingPanel - 구역 진입 브리핑
 */

import {
  HERO,
  LEVELS_PER_ZONE,
  RepairZone,
  ZoneAtmosphere,
  ZoneRoute,
} from '../story/campaign';

interface ZoneBriefingPanelProps {
  zone: RepairZone;
  route: ZoneRoute;
  atmosphere: ZoneAtmosphere;
  levelInZone: number;
  shipNameKo: string;
  onStart: () => void;
  onBack: () => void;
}

export function ZoneBriefingPanel({
  zone,
  route,
  atmosphere,
  levelInZone,
  shipNameKo,
  onStart,
  onBack,
}: ZoneBriefingPanelProps) {
  return (
    <div className="absolute inset-0 z-[65] overflow-hidden animate-[fadeIn_0.3s_ease-out]">
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse at 30% 20%, ${atmosphere.uiGlow}, transparent 50%), radial-gradient(ellipse at 80% 80%, ${atmosphere.uiGlow}, transparent 45%), ${atmosphere.background}`,
        }}
      />
      <div
        className="absolute inset-0 opacity-[0.12]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      <div className="relative h-full flex flex-col md:flex-row items-center justify-center gap-8 p-6 md:p-10">
        <div
          className="w-36 h-44 md:w-44 md:h-56 rounded-3xl overflow-hidden border-2 shadow-2xl shrink-0"
          style={{ borderColor: atmosphere.uiAccent, boxShadow: `0 0 40px ${atmosphere.uiGlow}` }}
        >
          <img src={HERO.fullBody} alt={HERO.nameKo} className="w-full h-full object-cover" />
        </div>

        <div className="max-w-lg w-full text-center md:text-left">
          <p
            className="text-[11px] uppercase tracking-[0.25em] font-semibold mb-2"
            style={{ color: atmosphere.uiAccent }}
          >
            Entering · {atmosphere.bayNameKo}
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">{zone.nameKo} 구역</h2>
          <p className="text-slate-300 text-sm mb-4">{atmosphere.tagline}</p>

          <div className="flex flex-wrap gap-2 justify-center md:justify-start mb-5">
            <span
              className="text-[11px] font-bold px-3 py-1.5 rounded-full border"
              style={{
                color: atmosphere.uiAccent,
                borderColor: `${atmosphere.uiAccent}66`,
                background: `${atmosphere.uiAccent}18`,
              }}
            >
              {route.headingKo} 항로
            </span>
            <span className="text-[11px] font-bold px-3 py-1.5 rounded-full border border-slate-600 text-slate-300 bg-slate-900/60">
              {shipNameKo}
            </span>
            <span className="text-[11px] font-bold px-3 py-1.5 rounded-full border border-slate-600 text-slate-300 bg-slate-900/60">
              Lv {levelInZone}/{LEVELS_PER_ZONE}
            </span>
          </div>

          <blockquote
            className="rounded-2xl border px-4 py-3 mb-6 text-sm leading-relaxed"
            style={{
              borderColor: `${atmosphere.uiAccent}44`,
              background: 'rgba(2,6,23,0.75)',
              color: '#e2e8f0',
            }}
          >
            <span className="text-slate-500 text-xs block mb-1">{HERO.nameKo}</span>
            “{zone.intro}”
          </blockquote>

          <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
            <button
              type="button"
              onClick={onStart}
              className="px-8 py-3.5 rounded-xl font-bold text-slate-950 transition hover:scale-[1.02]"
              style={{ background: atmosphere.uiAccent }}
            >
              수리 시작 →
            </button>
            <button
              type="button"
              onClick={onBack}
              className="px-6 py-3.5 rounded-xl font-semibold text-slate-300 border border-slate-600 bg-slate-900/70 hover:border-slate-400 transition"
            >
              맵으로
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
