/**
 * GameManager - 핵심 게임 로직 매니저
 * 
 * 볼트 클릭, 머지, 게임 상태 체크 등의 핵심 로직을 담당합니다.
 */

import { BoltData, BoltColor, GameState } from './types';
import { LevelGenerator } from './LevelGenerator';

export class GameManager {
  private boardBolts: BoltData[] = [];
  private mergeSlots: BoltColor[] = [];
  private gameState: GameState = GameState.Playing;
  private maxSlots: number;
  private onStateChange: (() => void) | null = null;
  private lastMergeCount: number = 0; // 마지막 머지에서 제거된 개수

  constructor(maxSlots: number = 7) {
    this.maxSlots = maxSlots;
  }

  /**
   * 상태 변경 콜백 등록
   */
  setOnStateChange(callback: () => void): void {
    this.onStateChange = callback;
  }

  /**
   * 새 레벨 생성
   */
  generateNewLevel(totalBolts: number = 36, colorCount: number = 4): void {
    const generator = new LevelGenerator({ totalBolts, colorCount, maxSlots: this.maxSlots });
    this.boardBolts = generator.generateLevel();
    this.mergeSlots = [];
    this.gameState = GameState.Playing;
    this.lastMergeCount = 0;
    this.notifyStateChange();
  }

  /**
   * 볼트 클릭 처리
   * @returns 클릭이 성공적으로 처리되었는지 여부
   */
  onBoltClicked(boltId: number): boolean {
    if (this.gameState !== GameState.Playing) return false;
    
    const bolt = this.boardBolts.find(b => b.id === boltId);
    if (!bolt || bolt.isRemoved) return false;
    
    // 잠김 체크
    if (this.isBoltLocked(boltId)) {
      return false; // 아직 잠겨있음
    }
    
    // 머지 슬롯이 꽉 찼는지 체크
    if (this.mergeSlots.length >= this.maxSlots) {
      return false;
    }
    
    // 볼트를 슬롯으로 이동
    bolt.isRemoved = true;
    
    // 같은 색 볼트 근처에 삽입 (시각적 일관성)
    const insertIndex = this.findInsertIndex(bolt.color);
    this.mergeSlots.splice(insertIndex, 0, bolt.color);
    
    // 머지 체크 (체인 반응 지원)
    this.checkMergeChain();
    
    // 게임 상태 체크
    this.checkGameState();
    
    this.notifyStateChange();
    return true;
  }

  /**
   * 같은 색 볼트 근처에 삽입할 인덱스 찾기
   */
  private findInsertIndex(color: BoltColor): number {
    // 마지막 같은 색 볼트의 다음 위치
    let lastIndex = -1;
    for (let i = this.mergeSlots.length - 1; i >= 0; i--) {
      if (this.mergeSlots[i] === color) {
        lastIndex = i;
        break;
      }
    }
    
    if (lastIndex !== -1) {
      return lastIndex + 1; // 같은 색 마지막 바로 다음
    }
    
    return this.mergeSlots.length; // 같은 색이 없으면 맨 뒤에
  }

  /**
   * 머지 체크 (체인 반응) - 같은 색 3개가 모이면 제거, 반복
   */
  private checkMergeChain(): void {
    this.lastMergeCount = 0;
    let merged = true;
    
    while (merged) {
      merged = this.checkMerge();
    }
  }

  /**
   * 단일 머지 체크 - 같은 색 3개가 있으면 제거
   * @returns 머지가 발생했는지 여부
   */
  private checkMerge(): boolean {
    const colorCounts: Map<BoltColor, number> = new Map();
    
    // 각 색상 개수 세기
    for (const color of this.mergeSlots) {
      colorCounts.set(color, (colorCounts.get(color) || 0) + 1);
    }
    
    let merged = false;
    
    // 3개 이상인 색상이 있으면 제거
    for (const [color, count] of colorCounts) {
      if (count >= 3) {
        // 3개 제거
        let removed = 0;
        this.mergeSlots = this.mergeSlots.filter(c => {
          if (c === color && removed < 3) {
            removed++;
            return false;
          }
          return true;
        });
        this.lastMergeCount += 3;
        merged = true;
      }
    }
    
    return merged;
  }

  /**
   * 게임 상태 체크 (승/패)
   */
  private checkGameState(): void {
    // 보드에 남은 볼트가 없고 슬롯도 비어있으면 승리
    const remainingBolts = this.boardBolts.filter(b => !b.isRemoved);
    if (remainingBolts.length === 0 && this.mergeSlots.length === 0) {
      this.gameState = GameState.Win;
      return;
    }
    
    // 슬롯이 꽉 찼으면 패배
    if (this.mergeSlots.length >= this.maxSlots) {
      this.gameState = GameState.Lose;
      return;
    }
  }

  /**
   * 상태 변경 알림
   */
  private notifyStateChange(): void {
    if (this.onStateChange) {
      this.onStateChange();
    }
  }

  // Getters
  getBoardBolts(): BoltData[] {
    return this.boardBolts;
  }

  getMergeSlots(): BoltColor[] {
    return [...this.mergeSlots];
  }

  getGameState(): GameState {
    return this.gameState;
  }

  getMaxSlots(): number {
    return this.maxSlots;
  }

  getLastMergeCount(): number {
    return this.lastMergeCount;
  }

  /**
   * 볼트가 잠겨있는지 확인
   */
  isBoltLocked(boltId: number): boolean {
    const bolt = this.boardBolts.find(b => b.id === boltId);
    if (!bolt || bolt.isRemoved) return false;
    
    if (bolt.lockedByBoltId === -1) return false;
    
    const locker = this.boardBolts.find(b => b.id === bolt.lockedByBoltId);
    if (!locker || locker.isRemoved) return false;
    
    return true;
  }

  /**
   * 볼트가 클릭 가능한지 확인
   */
  isBoltClickable(boltId: number): boolean {
    if (this.gameState !== GameState.Playing) return false;
    
    const bolt = this.boardBolts.find(b => b.id === boltId);
    if (!bolt || bolt.isRemoved) return false;
    if (this.mergeSlots.length >= this.maxSlots) return false;
    
    return !this.isBoltLocked(boltId);
  }

  /**
   * 남은 볼트 수
   */
  getRemainingBoltCount(): number {
    return this.boardBolts.filter(b => !b.isRemoved).length;
  }

  /**
   * 클릭 가능한 볼트 수
   */
  getClickableBoltCount(): number {
    return this.boardBolts.filter(b => !b.isRemoved && !this.isBoltLocked(b.id)).length;
  }
}
