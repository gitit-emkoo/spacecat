/**
 * GameManager - 핵심 게임 흐름 조율
 *
 * BoltController(보드) + SlotManager(머지 슬롯) + LevelGenerator를 연결하고
 * 클릭 → 이동 → 머지 → 승/패 판정 순서를 관리합니다.
 */

import { BoltData, BoltColor, GameState } from './types';
import { LevelGenerator } from './LevelGenerator';
import { SlotManager } from './SlotManager';
import { BoltController } from './BoltController';

export class GameManager {
  private readonly bolts: BoltController;
  private readonly slots: SlotManager;
  private gameState: GameState = GameState.Playing;
  private onStateChange: (() => void) | null = null;

  constructor(maxSlots: number = 7) {
    this.bolts = new BoltController();
    this.slots = new SlotManager(maxSlots);
  }

  setOnStateChange(callback: () => void): void {
    this.onStateChange = callback;
  }

  /**
   * 새 레벨 생성
   */
  generateNewLevel(totalBolts: number = 36, colorCount: number = 4): void {
    const generator = new LevelGenerator({
      totalBolts,
      colorCount,
      maxSlots: this.slots.getMaxSlots(),
    });
    this.bolts.setBolts(generator.generateLevel());
    this.slots.reset();
    this.gameState = GameState.Playing;
    this.notifyStateChange();
  }

  /**
   * 볼트 클릭 처리
   * @returns 처리 성공 여부
   */
  onBoltClicked(boltId: number): boolean {
    if (this.gameState !== GameState.Playing) return false;

    // 슬롯이 꽉 차면 추가 입력 차단 (방어 코드)
    if (!this.slots.canAccept()) return false;

    if (this.bolts.isLocked(boltId)) return false;

    const bolt = this.bolts.getBolt(boltId);
    if (!bolt || bolt.isRemoved) return false;

    // 슬롯 추가 성공 시에만 보드에서 제거
    const accepted = this.slots.addColor(bolt.color);
    if (!accepted) return false;

    this.bolts.markRemoved(boltId);
    this.checkGameState();
    this.notifyStateChange();
    return true;
  }

  /**
   * 승/패 판정
   * Win: 보드·슬롯 모두 비움
   * Lose: 슬롯 가득 참 + 즉시 머지 불가(데드락)
   */
  private checkGameState(): void {
    if (this.bolts.isBoardEmpty() && this.slots.isEmpty()) {
      this.gameState = GameState.Win;
      return;
    }

    if (this.slots.isDeadlocked()) {
      this.gameState = GameState.Lose;
    }
  }

  private notifyStateChange(): void {
    this.onStateChange?.();
  }

  // --- Getters (UI 호환) ---

  getBoardBolts(): BoltData[] {
    return this.bolts.getBolts();
  }

  getMergeSlots(): BoltColor[] {
    return this.slots.getSlots();
  }

  getGameState(): GameState {
    return this.gameState;
  }

  getMaxSlots(): number {
    return this.slots.getMaxSlots();
  }

  getLastMergeCount(): number {
    return this.slots.getLastMergeCount();
  }

  isBoltLocked(boltId: number): boolean {
    return this.bolts.isLocked(boltId);
  }

  isBoltClickable(boltId: number): boolean {
    return this.bolts.isClickable(boltId, this.gameState, this.slots.canAccept());
  }

  getRemainingBoltCount(): number {
    return this.bolts.getRemainingCount();
  }

  getClickableBoltCount(): number {
    return this.bolts.getClickableCount(this.gameState, this.slots.canAccept());
  }
}
