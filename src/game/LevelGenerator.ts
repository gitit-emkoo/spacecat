/**
 * LevelGenerator - 레벨 생성 알고리즘
 * 
 * 역방향 생성 알고리즘(Reverse Generation)을 사용하여
 * 항상 풀 수 있는 스테이지를 생성합니다.
 * DAG(유향 비순환 그래프) 구조를 유지하여 순환 참조를 방지합니다.
 * 
 * 핵심 원리:
 * - 먼저 풀어야 할 볼트(리프 노드)를 먼저 결정
 * - 나중에 풀릴 볼트는 이미 풀린 볼트에 의해서만 잠김
 * - 이렇게 하면 순환 참조 없이 항상 풀 수 있는 레벨이 생성됨
 */

import { BoltData, BoltColor, LevelConfig, DEFAULT_CONFIG } from './types';

export class LevelGenerator {
  private config: LevelConfig;

  constructor(config: Partial<LevelConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * 레벨을 생성합니다.
   * 1. 색상 풀 생성 (각 색상 3의 배수)
   * 2. 풀이 순서 결정 (DAG 위상정렬 호환)
   * 3. 역방향으로 의존성 그래프 구축
   * 4. 보드 위치에 배치
   */
  generateLevel(): BoltData[] {
    const { totalBolts, colorCount, rows, cols } = this.config;
    
    // 1. 색상 풀 생성 (각 색상이 3의 배수가 되도록)
    const colors = this.generateColorPool(totalBolts, colorCount);
    
    // 2. 보드 위치 생성
    const positions = this.generateBoardPositions(totalBolts, rows, cols);
    
    // 3. 풀이 순서 생성 (0번이 가장 먼저 풀림, totalBolts-1번이 가장 나중)
    // 이 순서가 곧 위상정렬 순서이며, 순환 참조가 발생하지 않음
    const solveOrder = Array.from({ length: totalBolts }, (_, i) => i);
    
    // 4. 볼트 생성 및 의존성 할당
    const bolts: BoltData[] = [];
    
    for (let i = 0; i < totalBolts; i++) {
      const boltId = i;
      const color = colors[i];
      const position = positions[i];
      
      let lockedByBoltId = -1;
      
      // i > 0 인 볼트만 잠글 수 있음 (0번은 항상 처음에 풀림)
      // i번째 볼트는 0 ~ i-1 중 하나의 볼트에 의해 잠길 수 있음
      // 이렇게 하면 순환 참조가 절대 발생하지 않음 (DAG 보장)
      if (i > 0 && Math.random() < 0.55) { // 55% 확률로 잠금
        // 0 ~ i-1 중에서 랜덤 선택 (이 볼트보다 먼저 풀리는 볼트들)
        const possibleLockers = Math.min(i, 3); // 최대 3개 이전 볼트 중에서만
        const lockerIndex = Math.floor(Math.random() * possibleLockers);
        lockedByBoltId = lockerIndex;
      }
      
      bolts.push({
        id: boltId,
        color,
        position,
        lockedByBoltId,
        isRemoved: false,
      });
    }
    
    return bolts;
  }

  /**
   * 색상 풀 생성
   * 각 색상이 3의 배수 개수가 되도록 분배
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
    
    const selectedColors = allColors.slice(0, colorCount);
    const pool: BoltColor[] = [];
    
    // 각 색상을 3개씩 묶어서 분배
    const groupsNeeded = Math.ceil(totalBolts / (3 * colorCount));
    
    for (let g = 0; g < groupsNeeded; g++) {
      for (const color of selectedColors) {
        pool.push(color, color, color); // 3개씩 추가
      }
    }
    
    // 필요한 수만큼 자르고 셔플
    const result = pool.slice(0, totalBolts);
    this.shuffle(result);
    
    return result;
  }

  /**
   * 보드 위치 생성 (그리드 기반 + 약간의 랜덤성)
   */
  private generateBoardPositions(totalBolts: number, rows: number, cols: number): [number, number, number][] {
    const positions: [number, number, number][] = [];
    const { boltSpacing } = this.config;
    
    const offsetX = -(cols - 1) * boltSpacing / 2;
    const offsetZ = -(rows - 1) * boltSpacing / 2;
    
    let count = 0;
    for (let row = 0; row < rows && count < totalBolts; row++) {
      for (let col = 0; col < cols && count < totalBolts; col++) {
        const x = offsetX + col * boltSpacing + (Math.random() - 0.5) * 0.3;
        const z = offsetZ + row * boltSpacing + (Math.random() - 0.5) * 0.3;
        const y = 0;
        positions.push([x, y, z]);
        count++;
      }
    }
    
    return positions;
  }

  /**
   * Fisher-Yates 셔플 알고리즘
   */
  private shuffle<T>(array: T[]): void {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }
}
