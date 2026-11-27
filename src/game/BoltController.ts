/**
 * BoltController - 보드 위 볼트 상호작용/잠금 판정
 *
 * 볼트 목록 보관, 잠김(의존성) 여부, 클릭 가능 여부 등
 * 보드 측 로직만 담당합니다. 슬롯/머지는 SlotManager가 처리합니다.
 */

import { BoltData, GameState } from './types';

export class BoltController {
  private bolts: BoltData[] = [];

  /** 새 보드 볼트 세팅 */
  setBolts(bolts: BoltData[]): void {
    this.bolts = bolts;
  }

  getBolts(): BoltData[] {
    return this.bolts;
  }

  getBolt(boltId: number): BoltData | undefined {
    return this.bolts.find((b) => b.id === boltId);
  }

  getRemainingCount(): number {
    return this.bolts.filter((b) => !b.isRemoved).length;
  }

  /**
   * lockedBy 볼트가 아직 보드에 남아 있으면 잠김
   */
  isLocked(boltId: number): boolean {
    const bolt = this.getBolt(boltId);
    if (!bolt || bolt.isRemoved) return false;
    if (bolt.lockedByBoltId === -1) return false;

    const locker = this.getBolt(bolt.lockedByBoltId);
    if (!locker || locker.isRemoved) return false;
    return true;
  }

  /**
   * 클릭 가능: 플레이 중 + 미제거 + 미잠김 + 슬롯 수용 가능
   */
  isClickable(boltId: number, gameState: GameState, canAcceptToSlot: boolean): boolean {
    if (gameState !== GameState.Playing) return false;
    if (!canAcceptToSlot) return false;

    const bolt = this.getBolt(boltId);
    if (!bolt || bolt.isRemoved) return false;
    return !this.isLocked(boltId);
  }

  /**
   * 보드에서 볼트 제거(슬롯으로 이동 성공 시 호출)
   */
  markRemoved(boltId: number): BoltData | null {
    const bolt = this.getBolt(boltId);
    if (!bolt || bolt.isRemoved) return null;
    bolt.isRemoved = true;
    return bolt;
  }

  getClickableCount(gameState: GameState, canAcceptToSlot: boolean): number {
    return this.bolts.filter(
      (b) => !b.isRemoved && this.isClickable(b.id, gameState, canAcceptToSlot)
    ).length;
  }

  isBoardEmpty(): boolean {
    return this.getRemainingCount() === 0;
  }
}
