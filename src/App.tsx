/**
 * App.tsx - 메인 앱 컴포넌트
 * 
 * 3D Color Chain Bolt Merge 게임의 진입점
 * GameManager를 통해 게임 상태를 관리하고,
 * 3D 씬과 UI를 통합합니다.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { GameScene } from './components/GameScene';
import { MergeSlotsUI } from './components/MergeSlotsUI';
import { GameManager } from './game/GameManager';
import { BoltData, BoltColor, GameState } from './game/types';
import { soundManager } from './game/SoundManager';

function App() {
  const gameManagerRef = useRef<GameManager>(new GameManager(7));
  const [bolts, setBolts] = useState<BoltData[]>([]);
  const [mergeSlots, setMergeSlots] = useState<BoltColor[]>([]);
  const [gameState, setGameState] = useState<GameState>(GameState.Playing);
  const [remainingCount, setRemainingCount] = useState(0);
  const [showMergeEffect, setShowMergeEffect] = useState(false);
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [shakeBoard, setShakeBoard] = useState(false);

  // 상태 업데이트 함수
  const updateState = useCallback(() => {
    const gm = gameManagerRef.current;
    setBolts([...gm.getBoardBolts()]);
    setMergeSlots([...gm.getMergeSlots()]);
    setGameState(gm.getGameState());
    setRemainingCount(gm.getRemainingBoltCount());
  }, []);

  // 게임 초기화
  useEffect(() => {
    const gm = gameManagerRef.current;
    gm.setOnStateChange(updateState);
    gm.generateNewLevel(36, 4);
    updateState();
  }, [updateState]);

  // 머지 효과 감지
  const prevSlotsLength = useRef(mergeSlots.length);
  useEffect(() => {
    if (mergeSlots.length < prevSlotsLength.current) {
      setShowMergeEffect(true);
      setCombo(prev => prev + 1);
      const comboBonus = combo * 50;
      setScore(prev => prev + 100 + comboBonus);
      soundManager.playMerge();
      setTimeout(() => setShowMergeEffect(false), 600);
    } else if (mergeSlots.length > prevSlotsLength.current) {
      // 새 볼트가 추가되면 콤보 리셋
      setCombo(0);
    }
    prevSlotsLength.current = mergeSlots.length;
  }, [mergeSlots, combo]);

  // 게임 상태 변화에 따른 효과음
  useEffect(() => {
    if (gameState === GameState.Win) {
      soundManager.playWin();
    } else if (gameState === GameState.Lose) {
      soundManager.playGameOver();
      setShakeBoard(true);
      setTimeout(() => setShakeBoard(false), 500);
    }
  }, [gameState]);

  // 볼트 클릭 핸들러
  const handleBoltClick = useCallback((boltId: number) => {
    const gm = gameManagerRef.current;
    
    if (gm.isBoltLocked(boltId)) {
      soundManager.playLocked();
      return;
    }
    
    const success = gm.onBoltClicked(boltId);
    if (success) {
      soundManager.playBoltClick();
    }
  }, []);

  // 잠금 확인
  const isBoltLocked = useCallback((boltId: number) => {
    return gameManagerRef.current.isBoltLocked(boltId);
  }, []);

  // 클릭 가능 확인
  const isBoltClickable = useCallback((boltId: number) => {
    return gameManagerRef.current.isBoltClickable(boltId);
  }, []);

  // 새 게임 시작
  const handleNewGame = useCallback(() => {
    const gm = gameManagerRef.current;
    const newLevel = level + 1;
    const boltCount = Math.min(36 + (newLevel - 1) * 6, 60);
    const colorCount = Math.min(4 + Math.floor((newLevel - 1) / 3), 6);
    gm.generateNewLevel(boltCount, colorCount);
    setLevel(newLevel);
    setCombo(0);
    updateState();
  }, [level, updateState]);

  // 리셋
  const handleReset = useCallback(() => {
    const gm = gameManagerRef.current;
    gm.generateNewLevel(36, 4);
    setLevel(1);
    setScore(0);
    setCombo(0);
    updateState();
  }, [updateState]);

  return (
    <div className={`w-screen h-screen bg-gray-950 overflow-hidden relative ${shakeBoard ? 'animate-shake' : ''}`}>
      {/* 3D 게임 씬 */}
      <div className="absolute inset-0">
        <GameScene
          bolts={bolts}
          onBoltClick={handleBoltClick}
          isBoltLocked={isBoltLocked}
          isBoltClickable={isBoltClickable}
        />
      </div>

      {/* 상단 UI */}
      <div className="absolute top-0 left-0 right-0 z-40 p-4">
        <div className="flex items-center justify-between max-w-5xl mx-auto">
          {/* 제목 및 레벨 */}
          <div className="flex items-center gap-3">
            <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <span className="text-2xl">⚙️</span>
              <span className="hidden sm:inline bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Bolt Merge
              </span>
            </h1>
            <div className="bg-gray-800/80 backdrop-blur-sm rounded-lg px-3 py-1.5 border border-gray-700">
              <span className="text-gray-400 text-xs">Lv.</span>
              <span className="text-white font-bold ml-1">{level}</span>
            </div>
          </div>

          {/* 점수 및 정보 */}
          <div className="flex items-center gap-2">
            {combo > 0 && (
              <div className="bg-purple-900/80 backdrop-blur-sm rounded-lg px-3 py-1.5 border border-purple-600 animate-pulse">
                <span className="text-purple-300 text-xs">콤보 </span>
                <span className="text-purple-200 font-bold">x{combo}</span>
              </div>
            )}
            <div className="bg-gray-800/80 backdrop-blur-sm rounded-lg px-3 py-1.5 border border-gray-700">
              <span className="text-gray-400 text-xs">점수 </span>
              <span className="text-yellow-400 font-bold">{score}</span>
            </div>
            <div className="bg-gray-800/80 backdrop-blur-sm rounded-lg px-3 py-1.5 border border-gray-700">
              <span className="text-gray-400 text-xs">남은 </span>
              <span className="text-green-400 font-bold">{remainingCount}</span>
            </div>
            <button
              onClick={handleReset}
              className="bg-gray-800/80 backdrop-blur-sm rounded-lg px-3 py-1.5 border border-gray-700 text-gray-400 hover:text-white hover:border-gray-500 transition-all text-xs"
            >
              🔄 리셋
            </button>
          </div>
        </div>
      </div>

      {/* 머지 이펙트 */}
      {showMergeEffect && (
        <div className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none">
          <div className="relative">
            <div className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-400 animate-bounce">
              MERGE!
            </div>
            {combo > 1 && (
              <div className="text-center text-2xl text-purple-300 font-bold mt-2 animate-pulse">
                x{combo} COMBO!
              </div>
            )}
          </div>
        </div>
      )}

      {/* 하단 머지 슬롯 */}
      <MergeSlotsUI slots={mergeSlots} maxSlots={7} />

      {/* 게임 오버 / 승리 오버레이 */}
      {gameState !== GameState.Playing && (
        <div className="absolute inset-0 flex items-center justify-center z-50 bg-black/70 backdrop-blur-sm">
          <div className="text-center p-8 bg-gray-900/95 rounded-3xl border border-gray-700 shadow-2xl max-w-md mx-4 transform animate-[fadeIn_0.3s_ease-out]">
            {gameState === GameState.Win ? (
              <>
                <div className="text-6xl mb-4 animate-bounce">🎉</div>
                <h2 className="text-3xl font-bold text-green-400 mb-2">클리어!</h2>
                <p className="text-gray-400 mb-4">모든 볼트를 성공적으로 풀었습니다!</p>
                <div className="flex justify-center gap-4 mb-6">
                  <div className="bg-gray-800 rounded-lg px-4 py-2">
                    <div className="text-yellow-400 font-bold text-xl">{score}</div>
                    <div className="text-gray-500 text-xs">점수</div>
                  </div>
                  <div className="bg-gray-800 rounded-lg px-4 py-2">
                    <div className="text-blue-400 font-bold text-xl">{level}</div>
                    <div className="text-gray-500 text-xs">레벨</div>
                  </div>
                </div>
                <button
                  onClick={handleNewGame}
                  className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold rounded-xl transition-all duration-200 hover:scale-105 shadow-lg shadow-blue-500/20"
                >
                  다음 레벨 도전 →
                </button>
              </>
            ) : (
              <>
                <div className="text-6xl mb-4">💥</div>
                <h2 className="text-3xl font-bold text-red-400 mb-2">게임 오버</h2>
                <p className="text-gray-400 mb-4">머지 슬롯이 가득 찼습니다!</p>
                <div className="flex justify-center gap-4 mb-6">
                  <div className="bg-gray-800 rounded-lg px-4 py-2">
                    <div className="text-yellow-400 font-bold text-xl">{score}</div>
                    <div className="text-gray-500 text-xs">점수</div>
                  </div>
                  <div className="bg-gray-800 rounded-lg px-4 py-2">
                    <div className="text-blue-400 font-bold text-xl">{level}</div>
                    <div className="text-gray-500 text-xs">레벨</div>
                  </div>
                </div>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={handleReset}
                    className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-bold rounded-xl transition-all duration-200 hover:scale-105"
                  >
                    처음부터
                  </button>
                  <button
                    onClick={handleNewGame}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold rounded-xl transition-all duration-200 hover:scale-105 shadow-lg shadow-blue-500/20"
                  >
                    계속하기
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* 조작 가이드 */}
      <div className="absolute bottom-28 left-4 z-40 hidden md:block">
        <div className="bg-gray-900/80 backdrop-blur-sm rounded-lg p-3 border border-gray-800 text-xs text-gray-500 space-y-1">
          <p>🖱️ <span className="text-gray-400">클릭</span>: 볼트 선택</p>
          <p>🔄 <span className="text-gray-400">드래그</span>: 카메라 회전</p>
          <p>🔍 <span className="text-gray-400">스크롤</span>: 줌 인/아웃</p>
          <p className="pt-1 border-t border-gray-800">🔒 <span className="text-gray-400">어두운 볼트</span>: 잠김 (먼저 해제 필요)</p>
          <p>✨ <span className="text-gray-400">같은 색 3개</span>: 자동 머지!</p>
        </div>
      </div>
    </div>
  );
}

export default App;
