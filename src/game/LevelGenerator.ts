/**
 * LevelGenerator - 레벨 생성 알고리즘
 *
 * 역방향 생성(Reverse Generation)으로 항상 풀 수 있는 DAG 스테이지를 만듭니다.
 * 1) 색상은 각 색마다 3의 배수로 준비 (머지 가능 보장)
 * 2) 풀이 순서(위상 정렬 순서)를 먼저 정한 뒤
 * 3) 나중에 풀릴 볼트만 앞선 볼트에 의해 잠기도록 lockedBy를 할당
 * → 순환 참조 없이, 순서만 지키면 반드시 열립니다.
 */

import { BoltData, BoltColor, LevelConfig, DEFAULT_CONFIG } from './types';

export class LevelGenerator {
  private config: LevelConfig;

  constructor(config: Partial<LevelConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * 레벨 생성
   */
  generateLevel(): BoltData[] {
    const { totalBolts, colorCount, rows, cols } = this.config;

    // 머지(3개) 단위로 맞추기 위해 총 개수를 3의 배수로 보정
    const boltCount = Math.max(3, Math.floor(totalBolts / 3) * 3);

    // 1. 색상 풀 (색상별 정확히 3의 배수)
    const colors = this.generateColorPool(boltCount, colorCount);

    // 2. 풀이 순서: index 0이 가장 먼저 풀림
    const solveOrder = Array.from({ length: boltCount }, (_, i) => i);
    this.shuffle(solveOrder);

    // 3. 풀이 순서 기준으로 의존성 할당 (앞선 볼트만 잠글 수 있음 → DAG)
    const lockedByMap = new Map<number, number>();
    for (let order = 1; order < boltCount; order++) {
      const boltId = solveOrder[order];
      // 후반부로 갈수록 잠금 확률을 조금 높여 체인 느낌을 줌
      const lockChance = 0.45 + (order / boltCount) * 0.25;
      if (Math.random() > lockChance) continue;

      // 바로 앞쪽 lookback개 중에서만 잠금 → 체인이 과도하게 길어지지 않음
      const lookback = Math.min(order, 4);
      const lockerOrder = order - 1 - Math.floor(Math.random() * lookback);
      lockedByMap.set(boltId, solveOrder[lockerOrder]);
    }

    // 4. 보드 좌표 배치
    const positions = this.generateBoardPositions(boltCount, rows, cols);

    // 5. BoltData 조립 (id 순서로 반환하되, 의존성은 solveOrder 기준)
    const bolts: BoltData[] = [];
    for (let id = 0; id < boltCount; id++) {
      bolts.push({
        id,
        color: colors[id],
        position: positions[id],
        lockedByBoltId: lockedByMap.get(id) ?? -1,
        isRemoved: false,
      });
    }

    return bolts;
  }

  /**
   * 색상 풀 생성 — 선택 색상마다 개수가 반드시 3의 배수가 되도록 분배
   */
  private generateColorPool(totalBolts: number, colorCount: number): BoltColor[] {
    const allColors = [
      BoltColor.Red,
      BoltColor.Blue,
      BoltColor.Green,
      BoltColor.Yellow,
      BoltColor.Purple,
      BoltColor.Orange,
    ];

    const selectedColors = allColors.slice(0, Math.max(1, Math.min(colorCount, allColors.length)));
    const groupCount = totalBolts / 3; // totalBolts는 이미 3의 배수
    const baseGroups = Math.floor(groupCount / selectedColors.length);
    let remainder = groupCount % selectedColors.length;

    const pool: BoltColor[] = [];
    for (const color of selectedColors) {
      const groups = baseGroups + (remainder > 0 ? 1 : 0);
      if (remainder > 0) remainder -= 1;
      for (let i = 0; i < groups; i++) {
        pool.push(color, color, color);
      }
    }

    this.shuffle(pool);
    return pool;
  }

  /**
   * 보드 위치 생성 (그리드 + 약간의 랜덤 오프셋)
   */
  private generateBoardPositions(
    totalBolts: number,
    rows: number,
    cols: number
  ): [number, number, number][] {
    const positions: [number, number, number][] = [];
    const { boltSpacing } = this.config;

    // 볼트 수에 맞게 그리드 크기 보정
    const neededCells = totalBolts;
    const gridCols = Math.max(cols, Math.ceil(Math.sqrt(neededCells)));
    const gridRows = Math.max(rows, Math.ceil(neededCells / gridCols));

    const offsetX = -((gridCols - 1) * boltSpacing) / 2;
    const offsetZ = -((gridRows - 1) * boltSpacing) / 2;

    let count = 0;
    for (let row = 0; row < gridRows && count < totalBolts; row++) {
      for (let col = 0; col < gridCols && count < totalBolts; col++) {
        const x = offsetX + col * boltSpacing + (Math.random() - 0.5) * 0.25;
        const z = offsetZ + row * boltSpacing + (Math.random() - 0.5) * 0.25;
        positions.push([x, 0, z]);
        count++;
      }
    }

    return positions;
  }

  /**
   * Fisher-Yates 셔플
   */
  private shuffle<T>(array: T[]): void {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }
}
