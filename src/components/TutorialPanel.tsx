/**
 * TutorialPanel - 조작 안내
 */

import { HERO, LEVELS_PER_ZONE } from '../story/campaign';

interface TutorialPanelProps {
  onClose: () => void;
}

export function TutorialPanel({ onClose }: TutorialPanelProps) {
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
            <h2 className="text-lg font-bold text-white">조작 안내</h2>
            <p className="text-xs text-slate-400">{HERO.nameKo}의 수리 매뉴얼</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white text-sm px-3 py-1.5 rounded-lg border border-slate-700"
          >
            닫기
          </button>
        </div>

        <div className="p-5 space-y-3 text-sm text-slate-300">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
            <div className="text-sky-300 font-semibold mb-1">잠금 체인</div>
            <p className="text-slate-400 text-xs leading-relaxed">
              어두운 나사는 다른 나사에 잠겨 있습니다. 잠근 나사를 먼저 슬롯으로 보내야 풀립니다.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
            <div className="text-amber-300 font-semibold mb-1">3개 머지</div>
            <p className="text-slate-400 text-xs leading-relaxed">
              하단 슬롯에 같은 색 나사 3개가 모이면 즉시 제거됩니다. 콤보로 점수가 올라갑니다.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
            <div className="text-rose-300 font-semibold mb-1">슬롯 7칸</div>
            <p className="text-slate-400 text-xs leading-relaxed">
              머지 슬롯이 가득 찬 상태에서 머지가 안 나면 수리 중단입니다. 색을 잘 모아 비우세요.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
            <div className="text-emerald-300 font-semibold mb-1">구역과 항로</div>
            <p className="text-slate-400 text-xs leading-relaxed">
              구역 {LEVELS_PER_ZONE}레벨을 클리어하면 그 방향 항로가 열리고, 조우한 기체를 짧게 수리할 수
              있습니다.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-full mt-2 px-6 py-3 rounded-xl font-bold text-slate-950 bg-sky-400 hover:bg-sky-300 transition"
          >
            알겠어요
          </button>
        </div>
      </div>
    </div>
  );
}
