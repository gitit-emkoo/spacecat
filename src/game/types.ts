// 볼트 색상 Enum
export enum BoltColor {
  Red = 'Red',
  Blue = 'Blue',
  Green = 'Green',
  Yellow = 'Yellow',
  Purple = 'Purple',
  Orange = 'Orange',
}

// 볼트 데이터 클래스
export interface BoltData {
  id: number;
  color: BoltColor;
  position: [number, number, number]; // 3D 좌표
  lockedByBoltId: number; // -1이면 잠기지 않은 상태
  isRemoved: boolean; // 보드에서 제거되었는지 여부
}

// 게임 상태
export enum GameState {
  Playing = 'Playing',
  Win = 'Win',
  Lose = 'Lose',
}

// 레벨 설정
export interface LevelConfig {
  totalBolts: number; // 총 볼트 수
  colorCount: number; // 색상 종류 수
  maxSlots: number; // 머지 슬롯 최대 개수
  boltSpacing: number; // 볼트 간 간격
  rows: number; // 보드 행 수
  cols: number; // 보드 열 수
}

// 기본 레벨 설정
export const DEFAULT_CONFIG: LevelConfig = {
  totalBolts: 36,
  colorCount: 4,
  maxSlots: 7,
  boltSpacing: 1.5,
  rows: 6,
  cols: 6,
};

// 색상 매핑 (3D 렌더링용)
export const COLOR_MAP: Record<BoltColor, string> = {
  [BoltColor.Red]: '#ef4444',
  [BoltColor.Blue]: '#3b82f6',
  [BoltColor.Green]: '#22c55e',
  [BoltColor.Yellow]: '#eab308',
  [BoltColor.Purple]: '#a855f7',
  [BoltColor.Orange]: '#f97316',
};

// 어두운 색상 (잠긴 볼트용)
export const LOCKED_COLOR_MAP: Record<BoltColor, string> = {
  [BoltColor.Red]: '#7f1d1d',
  [BoltColor.Blue]: '#1e3a5f',
  [BoltColor.Green]: '#14532d',
  [BoltColor.Yellow]: '#713f12',
  [BoltColor.Purple]: '#581c87',
  [BoltColor.Orange]: '#7c2d12',
};
