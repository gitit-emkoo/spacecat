/**
 * CollectionPanel - 수리 완료한 기체 컬렉션
 */

import { ENCOUNTERS, HERO, ShipEncounter } from '../story/campaign';

interface CollectionPanelProps {
  collectedIds: string[];
  onClose: () => void;
}

function ShipCard({ ship, owned }: { ship: ShipEncounter; owned: boolean }) {
  return (
    <div
      className={`rounded-2xl border p-4 transition ${
        owned
          ? 'border-slate-500 bg-slate-900/90'
          : 'border-slate-800 bg-slate-950/60 opacity-50'
      }`}
    >
      <div
        className="h-20 mb-3 rounded-xl relative overflow-hidden"
        style={{
          background: owned
            ? `linear-gradient(135deg, ${ship.accent}33, #0f172a 60%)`
            : '#0f172a',
        }}
      >
        {/* 심플 실루엣 */}
        <svg viewBox="0 0 160 80" className="absolute inset-0 w-full h-full opacity-90">
          <ellipse cx="80" cy="42" rx="48" ry="14" fill={owned ? ship.accent : '#334155'} opacity="0.85" />
          <polygon points="120,42 148,36 148,48" fill={owned ? ship.accent : '#475569'} />
          <rect x="40" y="28" width="18" height="8" rx="2" fill={owned ? '#e2e8f0' : '#475569'} opacity="0.7" />
          <rect x="40" y="44" width="18" height="8" rx="2" fill={owned ? '#e2e8f0' : '#475569'} opacity="0.7" />
          {!owned && (
            <text x="80" y="46" textAnchor="middle" fill="#64748b" fontSize="12">
              ???
            </text>
          )}
        </svg>
      </div>
      <div className="flex items-center justify-between gap-2">
        <div>
          <div className="text-sm font-bold text-white">
            {owned ? ship.nameKo : '미발견 기체'}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            {owned
              ? ship.kind === 'playerShip'
                ? '내 순찰선'
                : '구조·수리 완료'
              : '순찰 중 조우 대기'}
          </div>
        </div>
        {owned && (
          <span
            className="text-[10px] font-bold px-2 py-1 rounded-full"
            style={{ background: `${ship.accent}33`, color: ship.accent }}
          >
            OWNED
          </span>
        )}
      </div>
    </div>
  );
}

export function CollectionPanel({ collectedIds, onClose }: CollectionPanelProps) {
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
            <h2 className="text-lg font-bold text-white">함선 컬렉션</h2>
            <p className="text-xs text-slate-400">
              {HERO.nameKo}가 수리해 등록한 기체 · {collectedIds.length}/{ENCOUNTERS.length}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white text-sm px-3 py-1.5 rounded-lg border border-slate-700"
          >
            닫기
          </button>
        </div>

        <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto">
          {ENCOUNTERS.map((ship) => (
            <ShipCard
              key={ship.id}
              ship={ship}
              owned={collectedIds.includes(ship.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
