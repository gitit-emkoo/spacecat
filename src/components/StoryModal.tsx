/**
 * StoryModal - 인트로 / 구역 클리어 / 기체 클리어 / 조우 출항
 */

import { HERO, RepairZone, ShipEncounter, ZoneRoute } from '../story/campaign';

type ModalKind = 'intro' | 'zoneClear' | 'shipClear' | 'sortieIntro' | 'homeComplete';

interface StoryModalProps {
  kind: ModalKind;
  encounter: ShipEncounter;
  zone?: RepairZone;
  nextEncounter?: ShipEncounter;
  route?: ZoneRoute;
  /** zoneClear가 홈 구역인지 (항로 출항 CTA) */
  isHomeZoneClear?: boolean;
  onContinue: () => void;
}

export function StoryModal({
  kind,
  encounter,
  zone,
  nextEncounter,
  route,
  isHomeZoneClear = false,
  onContinue,
}: StoryModalProps) {
  const title =
    kind === 'intro'
      ? `${HERO.nameKo}의 순찰`
      : kind === 'zoneClear'
        ? `${zone?.nameKo} 수리 완료!`
        : kind === 'shipClear'
          ? `${encounter.nameKo} 완전 수리!`
          : kind === 'homeComplete'
            ? `${encounter.nameKo} 완전 수리!`
            : `항로 개방: ${route?.headingKo ?? ''} · ${nextEncounter?.nameKo ?? ''}`;

  const body =
    kind === 'intro'
      ? encounter.blurb
      : kind === 'zoneClear'
        ? zone?.clearLine
        : kind === 'shipClear'
          ? `${encounter.nameKo}가 컬렉션에 등록되었습니다. 함교로 복귀합니다.`
          : kind === 'homeComplete'
            ? '모든 구역 수리 완료! 네 방향 항로가 전부 열렸습니다.'
            : nextEncounter?.blurb;

  const cta =
    kind === 'intro'
      ? '함교로 들어가기'
      : kind === 'zoneClear'
        ? isHomeZoneClear
          ? '항로 출항 →'
          : '함교로 복귀'
        : kind === 'shipClear'
          ? '함교로 복귀'
          : kind === 'homeComplete'
            ? '함교로'
            : '구조 시작';

  const badge =
    kind === 'zoneClear'
      ? 'ZONE CLEAR'
      : kind === 'shipClear'
        ? 'SHIP COLLECTED'
        : kind === 'sortieIntro'
          ? 'ROUTE OPEN'
          : kind === 'homeComplete'
            ? 'SHIP READY'
            : 'MISSION';

  return (
    <div className="absolute inset-0 z-[60] flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg bg-slate-950/95 border border-slate-700 rounded-3xl overflow-hidden shadow-2xl animate-[fadeIn_0.3s_ease-out]">
        <div
          className="h-1.5 w-full"
          style={{
            background: `linear-gradient(90deg, ${
              nextEncounter?.accent ?? encounter.accent
            }, transparent)`,
          }}
        />

        <div className="p-6 md:p-8 flex flex-col md:flex-row gap-5 items-center md:items-start">
          <div className="shrink-0 w-28 h-36 md:w-32 md:h-40 rounded-2xl overflow-hidden border border-slate-600 shadow-lg">
            <img
              src={kind === 'shipClear' || kind === 'homeComplete' ? HERO.fullBody : HERO.portrait}
              alt={HERO.nameKo}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex-1 text-center md:text-left min-w-0">
            <p className="text-[11px] uppercase tracking-widest text-slate-500 mb-1">{badge}</p>
            <h2 className="text-2xl font-bold text-white mb-2">{title}</h2>
            <p className="text-slate-300 text-sm leading-relaxed mb-3">{body}</p>

            {kind === 'intro' ? (
              <p className="text-sky-300/90 text-sm mb-5">
                “먼저 함교로 들어가자. 어디서부터 고칠지 고르면 돼.”
              </p>
            ) : null}

            {kind === 'sortieIntro' && nextEncounter ? (
              <p className="text-sky-300/90 text-sm mb-5">
                “{nextEncounter.zones[0]?.intro}”
              </p>
            ) : null}

            {kind === 'zoneClear' && zone && isHomeZoneClear && route ? (
              <p className="text-slate-400 text-xs mb-5">
                {route.headingKo} 항로가 열렸습니다. 조우 기체를 수리하러 출항할까요?
              </p>
            ) : null}

            {kind === 'zoneClear' && !isHomeZoneClear ? (
              <p className="text-slate-400 text-xs mb-5">구조 완료. 함교로 돌아가 다음 구역을 고르세요.</p>
            ) : null}

            <button
              type="button"
              onClick={onContinue}
              className="px-6 py-3 rounded-xl font-bold text-slate-950 transition hover:scale-[1.02]"
              style={{ background: nextEncounter?.accent ?? encounter.accent }}
            >
              {cta}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
