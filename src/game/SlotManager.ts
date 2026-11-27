/**
 * SlotManager - 머지 슬롯 전담 매니저
 *
 * 하단 머지 슬롯(최대 N칸)에 색상을 넣고,
 * 같은 색 3개가 모이면 제거하며, 승/패 판정에 필요한 슬롯 상태를 제공합니다.
 */

import { BoltColor } from './types';

export class SlotManager {
  private slots: BoltColor[] = [];
  private readonly maxSlots: number;
  private lastMergeCount = 0;

  constructor(maxSlots: number = 7) {
    this.maxSlots = maxSlots;
  }

  /** 슬롯 초기화 */
  reset(): void {
    this.slots = [];
    this.lastMergeCount = 0;
  }

  getMaxSlots(): number {
    return this.maxSlots;
  }

  getSlots(): BoltColor[] {
    return [...this.slots];
  }

  getLength(): number {
    return this.slots.length;
  }

  isFull(): boolean {
    return this.slots.length >= this.maxSlots;
  }

  isEmpty(): boolean {
    return this.slots.length === 0;
  }

  getLastMergeCount(): number {
    return this.lastMergeCount;
  }

  /**
   * 슬롯에 새 볼트 색상 추가가 가능한지 (꽉 찬 경우 입력 차단)
   */
  canAccept(): boolean {
    return this.slots.length < this.maxSlots;
  }

  /**
   * 색상을 슬롯에 추가하고, 가능하면 머지 체인 반응을 수행합니다.
   * @returns 성공 여부
   */
  addColor(color: BoltColor): boolean {
    if (!this.canAccept()) {
      return false;
    }

    const insertIndex = this.findInsertIndex(color);
    this.slots.splice(insertIndex, 0, color);
    this.checkMergeChain();
    return true;
  }

  /**
   * 같은 색끼리 모이도록 삽입 위치 탐색
   */
  private findInsertIndex(color: BoltColor): number {
    let lastIndex = -1;
    for (let i = this.slots.length - 1; i >= 0; i--) {
      if (this.slots[i] === color) {
        lastIndex = i;
        break;
      }
    }
    return lastIndex !== -1 ? lastIndex + 1 : this.slots.length;
  }

  /**
   * 같은 색 3개 이상이면 반복 제거 (체인 머지)
   */
  private checkMergeChain(): void {
    this.lastMergeCount = 0;
    while (this.checkMerge()) {
      // 연쇄 머지
    }
  }

  /**
   * 단일 머지: 개수가 3 이상인 색을 3개 제거
   */
  private checkMerge(): boolean {
    const colorCounts = new Map<BoltColor, number>();
    for (const color of this.slots) {
      colorCounts.set(color, (colorCounts.get(color) || 0) + 1);
    }

    let merged = false;
    for (const [color, count] of colorCounts) {
      if (count >= 3) {
        let removed = 0;
        this.slots = this.slots.filter((c) => {
          if (c === color && removed < 3) {
            removed += 1;
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
   * 슬롯이 가득 찬 상태에서, 현재 구성으로 즉시 머지가 불가능한지
   * (패배 조건: 가득 참 + 동일 색 3개 미만)
   */
  isDeadlocked(): boolean {
    if (!this.isFull()) return false;

    const colorCounts = new Map<BoltColor, number>();
    for (const color of this.slots) {
      colorCounts.set(color, (colorCounts.get(color) || 0) + 1);
    }
    for (const count of colorCounts.values()) {
      if (count >= 3) return false;
    }
    return true;
  }
}
