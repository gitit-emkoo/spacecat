/**
 * MergeSlotsUI - 하단 머지 슬롯 UI
 * 
 * 화면 하단에 위치한 머지 슬롯을 렌더링합니다.
 * 같은 색 3개가 모이면 머지되는 시각적 피드백 제공
 */

import { BoltColor, COLOR_MAP } from '../game/types';

interface MergeSlotsUIProps {
  slots: BoltColor[];
  maxSlots: number;
}

export function MergeSlotsUI({ slots, maxSlots }: MergeSlotsUIProps) {
  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50">
      <div className="bg-gray-900/90 backdrop-blur-sm rounded-2xl p-3 border border-gray-700 shadow-2xl">
        <div className="flex gap-2 items-center">
          {Array.from({ length: maxSlots }).map((_, index) => {
            const color = slots[index];
            return (
              <div
                key={index}
                className={`w-12 h-12 rounded-xl border-2 flex items-center justify-center transition-all duration-300 ${
                  color
                    ? 'border-gray-500 scale-100'
                    : 'border-gray-700 border-dashed'
                }`}
                style={{
                  backgroundColor: color ? COLOR_MAP[color] : 'rgba(31, 41, 55, 0.5)',
                  boxShadow: color ? `0 0 15px ${COLOR_MAP[color]}40` : 'none',
                }}
              >
                {color && (
                  <div className="w-8 h-8 rounded-full border-2 border-white/30 flex items-center justify-center">
                    <div className="w-4 h-4 rounded-full bg-white/20" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <div className="text-center text-xs text-gray-400 mt-2">
          {slots.length} / {maxSlots}
        </div>
      </div>
    </div>
  );
}
