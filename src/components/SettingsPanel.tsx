/**
 * SettingsPanel - 함교 설정 (효과음)
 */

import { HERO } from '../story/campaign';

interface SettingsPanelProps {
  soundEnabled: boolean;
  onToggleSound: (enabled: boolean) => void;
  onClose: () => void;
}

export function SettingsPanel({ soundEnabled, onToggleSound, onClose }: SettingsPanelProps) {
  return (
    <div className="absolute inset-0 z-[70] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-slate-950 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden animate-[fadeIn_0.25s_ease-out]">
        <div className="flex items-center gap-3 p-5 border-b border-slate-800">
          <img
            src={HERO.portrait}
            alt={HERO.nameKo}
            className="w-12 h-12 rounded-xl object-cover border border-slate-600"
          />
          <div className="flex-1">
            <h2 className="text-lg font-bold text-white">설정</h2>
            <p className="text-xs text-slate-400">함교 시스템</p>
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
          <div className="flex items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-3">
            <div>
              <div className="text-sm font-semibold text-white">효과음</div>
              <div className="text-[11px] text-slate-400 mt-0.5">클릭·머지·클리어 사운드</div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={soundEnabled}
              onClick={() => onToggleSound(!soundEnabled)}
              className={`relative w-14 h-8 rounded-full transition-colors ${
                soundEnabled ? 'bg-sky-400' : 'bg-slate-700'
              }`}
            >
              <span
                className={`absolute top-1 left-1 w-6 h-6 rounded-full bg-white transition-transform ${
                  soundEnabled ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
          <p className="text-[11px] text-slate-500 px-1">
            {soundEnabled ? '효과음이 켜져 있습니다.' : '효과음이 꺼져 있습니다.'}
          </p>
        </div>
      </div>
    </div>
  );
}
