/**
 * App.tsx - 3D Color Chain Bolt Merge + 함교 허브 / 구역별 항로 조우
 */

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { GameScene } from './components/GameScene';
import { MergeSlotsUI } from './components/MergeSlotsUI';
import { StoryHud } from './components/StoryHud';
import { StoryModal } from './components/StoryModal';
import { CollectionPanel } from './components/CollectionPanel';
import { ShipLobby } from './components/ShipLobby';
import { RepairMapPanel } from './components/RepairMapPanel';
import { ShipStatusPanel } from './components/ShipStatusPanel';
import { SettingsPanel } from './components/SettingsPanel';
import { TutorialPanel } from './components/TutorialPanel';
import { ZoneBriefingPanel } from './components/ZoneBriefingPanel';
import { GameManager } from './game/GameManager';
import { BoltData, BoltColor, GameState, DEFAULT_CONFIG } from './game/types';
import { soundManager } from './game/SoundManager';
import {
  PLAYER_SHIP,
  LEVELS_PER_ZONE,
  PlayContext,
  RepairZone,
  RepairZoneId,
  ShipEncounter,
  CampaignProgress,
  clearCampaignProgress,
  createDefaultProgress,
  getEncounterForZone,
  getRouteForZone,
  getZoneAtmosphere,
  getZoneById,
  isHomeShipComplete,
  loadCampaignProgress,
  resolveLobbySnapshot,
  resolveProgressFromContext,
  saveCampaignProgress,
} from './story/campaign';

type StoryPhase =
  | 'intro'
  | 'lobby'
  | 'repairMap'
  | 'status'
  | 'settings'
  | 'tutorial'
  | 'zoneBriefing'
  | 'playing'
  | 'zoneClear'
  | 'shipClear'
  | 'sortieIntro'
  | 'homeComplete'
  | 'collection';

function difficultyForLevel(level: number) {
  const boltCount = Math.min(DEFAULT_CONFIG.totalBolts + (level - 1) * 6, 60);
  const colorCount = Math.min(DEFAULT_CONFIG.colorCount + Math.floor((level - 1) / 3), 6);
  return { boltCount, colorCount };
}

function App() {
  const gameManagerRef = useRef<GameManager>(new GameManager(DEFAULT_CONFIG.maxSlots));
  const [bolts, setBolts] = useState<BoltData[]>([]);
  const [mergeSlots, setMergeSlots] = useState<BoltColor[]>([]);
  const [gameState, setGameState] = useState<GameState>(GameState.Playing);
  const [remainingCount, setRemainingCount] = useState(0);
  const [maxSlots, setMaxSlots] = useState(DEFAULT_CONFIG.maxSlots);
  const [showMergeEffect, setShowMergeEffect] = useState(false);
  const [combo, setCombo] = useState(0);
  const [shakeBoard, setShakeBoard] = useState(false);

  const [storyPhase, setStoryPhase] = useState<StoryPhase>('intro');
  const [progressState, setProgressState] = useState<CampaignProgress>(() => loadCampaignProgress());
  const [clearedZone, setClearedZone] = useState<RepairZone | null>(null);
  const [clearedEncounter, setClearedEncounter] = useState<ShipEncounter | null>(null);
  const [pendingSortie, setPendingSortie] = useState<ShipEncounter | null>(null);
  const [pendingSortieZoneId, setPendingSortieZoneId] = useState<RepairZoneId | null>(null);
  const [returnPhase, setReturnPhase] = useState<StoryPhase>('lobby');

  const {
    homeZoneLevels,
    playContext,
    globalLevel,
    score,
    collectedIds,
    soundEnabled,
    seenTutorial,
    seenHomeComplete,
  } = progressState;

  const patchProgress = useCallback((partial: Partial<CampaignProgress>) => {
    setProgressState((prev) => {
      const next = { ...prev, ...partial };
      saveCampaignProgress(next);
      return next;
    });
  }, []);

  const progress = useMemo(() => {
    if (playContext) {
      return resolveProgressFromContext(playContext, homeZoneLevels);
    }
    return resolveLobbySnapshot(homeZoneLevels);
  }, [playContext, homeZoneLevels]);

  const encounter = progress.encounter;

  const updateState = useCallback(() => {
    const gm = gameManagerRef.current;
    setBolts([...gm.getBoardBolts()]);
    setMergeSlots([...gm.getMergeSlots()]);
    setGameState(gm.getGameState());
    setRemainingCount(gm.getRemainingBoltCount());
    setMaxSlots(gm.getMaxSlots());
  }, []);

  const startPuzzleLevel = useCallback(
    (level: number) => {
      const { boltCount, colorCount } = difficultyForLevel(level);
      const gm = gameManagerRef.current;
      gm.generateNewLevel(boltCount, colorCount);
      setCombo(0);
      updateState();
    },
    [updateState]
  );

  useEffect(() => {
    const gm = gameManagerRef.current;
    gm.setOnStateChange(updateState);
    soundManager.setMuted(!progressState.soundEnabled);
  }, [updateState, progressState.soundEnabled]);

  // 머지 이펙트
  const prevSlotsLength = useRef(mergeSlots.length);
  useEffect(() => {
    if (mergeSlots.length < prevSlotsLength.current) {
      setShowMergeEffect(true);
      setCombo((prev) => prev + 1);
      setProgressState((prev) => {
        const next = {
          ...prev,
          score: prev.score + 100 + combo * 50,
        };
        saveCampaignProgress(next);
        return next;
      });
      soundManager.playMerge();
      confetti({
        particleCount: 60 + combo * 20,
        spread: 70,
        origin: { y: 0.75 },
        colors: ['#ef4444', '#3b82f6', '#22c55e', '#eab308', '#a855f7'],
      });
      setTimeout(() => setShowMergeEffect(false), 600);
    } else if (mergeSlots.length > prevSlotsLength.current) {
      setCombo(0);
    }
    prevSlotsLength.current = mergeSlots.length;
  }, [mergeSlots, combo]);

  useEffect(() => {
    if (gameState === GameState.Win && storyPhase === 'playing') {
      soundManager.playWin();
    } else if (gameState === GameState.Lose && storyPhase === 'playing') {
      soundManager.playGameOver();
      setShakeBoard(true);
      setTimeout(() => setShakeBoard(false), 500);
    }
  }, [gameState, storyPhase]);

  const enterLobby = useCallback(() => {
    if (!seenTutorial) {
      setStoryPhase('tutorial');
    } else if (isHomeShipComplete(homeZoneLevels) && !seenHomeComplete) {
      setStoryPhase('homeComplete');
    } else {
      setStoryPhase('lobby');
    }
  }, [seenTutorial, seenHomeComplete, homeZoneLevels]);

  const beginPlay = useCallback(
    (ctx: PlayContext, opts?: { skipBriefing?: boolean }) => {
      patchProgress({ playContext: ctx });
      if (!opts?.skipBriefing && ctx.kind === 'home') {
        setStoryPhase('zoneBriefing');
        return;
      }
      startPuzzleLevel(globalLevel);
      setStoryPhase('playing');
    },
    [patchProgress, startPuzzleLevel, globalLevel]
  );

  const confirmZoneBriefing = useCallback(() => {
    startPuzzleLevel(globalLevel);
    setStoryPhase('playing');
  }, [startPuzzleLevel, globalLevel]);

  const handleSelectZone = useCallback(
    (zoneId: RepairZoneId) => {
      const completed = homeZoneLevels[zoneId];
      if (completed >= LEVELS_PER_ZONE) return;
      const levelInZone = Math.min(completed + 1, LEVELS_PER_ZONE);
      beginPlay({ kind: 'home', zoneId, levelInZone });
    },
    [homeZoneLevels, beginPlay]
  );

  const openSortieIntro = useCallback((zoneId: RepairZoneId) => {
    const ship = getEncounterForZone(zoneId);
    setPendingSortie(ship);
    setPendingSortieZoneId(zoneId);
    setClearedZone(getZoneById(zoneId));
    setStoryPhase('sortieIntro');
  }, []);

  const handleLaunchSortie = useCallback(
    (zoneId: RepairZoneId) => {
      openSortieIntro(zoneId);
    },
    [openSortieIntro]
  );

  const handleContinueRepair = useCallback(() => {
    if (playContext) {
      beginPlay(playContext, { skipBriefing: true });
      return;
    }
    setStoryPhase('repairMap');
  }, [playContext, beginPlay]);

  const startSortiePlay = useCallback(() => {
    if (!pendingSortie) return;
    const ctx: PlayContext = {
      kind: 'sortie',
      encounterId: pendingSortie.id,
      levelInZone: 1,
    };
    setPendingSortie(null);
    beginPlay(ctx, { skipBriefing: true });
  }, [pendingSortie, beginPlay]);

  const handleBoltClick = useCallback(
    (boltId: number) => {
      if (storyPhase !== 'playing') return;
      const gm = gameManagerRef.current;
      if (gm.isBoltLocked(boltId)) {
        soundManager.playLocked();
        return;
      }
      if (gm.onBoltClicked(boltId)) {
        soundManager.playBoltClick();
      }
    },
    [storyPhase]
  );

  const isBoltLocked = useCallback((boltId: number) => {
    return gameManagerRef.current.isBoltLocked(boltId);
  }, []);

  const isBoltClickable = useCallback(
    (boltId: number) => {
      if (storyPhase !== 'playing') return false;
      return gameManagerRef.current.isBoltClickable(boltId);
    },
    [storyPhase]
  );

  /** 퍼즐 클리어 후 캠페인 진행 */
  const advanceCampaign = useCallback(() => {
    if (!playContext) {
      setStoryPhase('lobby');
      return;
    }

    const nextGlobal = globalLevel + 1;

    if (playContext.kind === 'home') {
      const { zoneId, levelInZone } = playContext;
      const nextHomeLevels = {
        ...homeZoneLevels,
        [zoneId]: Math.max(homeZoneLevels[zoneId], levelInZone),
      };

      if (levelInZone >= LEVELS_PER_ZONE) {
        patchProgress({
          homeZoneLevels: nextHomeLevels,
          globalLevel: nextGlobal,
          playContext: null,
        });
        setClearedZone(getZoneById(zoneId));
        setPendingSortie(getEncounterForZone(zoneId));
        setPendingSortieZoneId(zoneId);
        setStoryPhase('zoneClear');
        confetti({ particleCount: 80, spread: 80, origin: { y: 0.55 } });
        return;
      }

      const nextCtx: PlayContext = {
        kind: 'home',
        zoneId,
        levelInZone: levelInZone + 1,
      };
      patchProgress({
        homeZoneLevels: nextHomeLevels,
        globalLevel: nextGlobal,
        playContext: nextCtx,
      });
      startPuzzleLevel(nextGlobal);
      setStoryPhase('playing');
      return;
    }

    // sortie
    const { encounterId, levelInZone } = playContext;
    if (levelInZone >= LEVELS_PER_ZONE) {
      const nextIds = collectedIds.includes(encounterId)
        ? collectedIds
        : [...collectedIds, encounterId];
      let withHome = nextIds;
      if (isHomeShipComplete(homeZoneLevels) && !nextIds.includes(PLAYER_SHIP.id)) {
        withHome = [...nextIds, PLAYER_SHIP.id];
      }
      const finishedShip = progress.encounter;
      patchProgress({
        globalLevel: nextGlobal,
        playContext: null,
        collectedIds: withHome,
      });
      setClearedEncounter(finishedShip);
      setClearedZone(null);
      setStoryPhase('shipClear');
      confetti({ particleCount: 120, spread: 100, origin: { y: 0.55 } });
      return;
    }

    const nextCtx: PlayContext = {
      kind: 'sortie',
      encounterId,
      levelInZone: levelInZone + 1,
    };
    patchProgress({
      globalLevel: nextGlobal,
      playContext: nextCtx,
    });
    startPuzzleLevel(nextGlobal);
    setStoryPhase('playing');
  }, [
    playContext,
    progress.encounter,
    globalLevel,
    homeZoneLevels,
    collectedIds,
    patchProgress,
    startPuzzleLevel,
  ]);

  const continueAfterZoneClear = useCallback(() => {
    if (pendingSortieZoneId) {
      setStoryPhase('sortieIntro');
      return;
    }
    setClearedZone(null);
    setStoryPhase('lobby');
  }, [pendingSortieZoneId]);

  const continueAfterShipClear = useCallback(() => {
    setPendingSortie(null);
    setPendingSortieZoneId(null);
    setClearedZone(null);
    if (isHomeShipComplete(homeZoneLevels) && !seenHomeComplete) {
      setStoryPhase('homeComplete');
      return;
    }
    setStoryPhase('lobby');
  }, [homeZoneLevels, seenHomeComplete]);

  const handleRetryLevel = useCallback(() => {
    startPuzzleLevel(globalLevel);
    setStoryPhase('playing');
  }, [globalLevel, startPuzzleLevel]);

  const handleReturnToLobby = useCallback(() => {
    setStoryPhase('lobby');
  }, []);

  const handleReset = useCallback(() => {
    clearCampaignProgress();
    const fresh = createDefaultProgress();
    setProgressState(fresh);
    soundManager.setMuted(false);
    setClearedZone(null);
    setPendingSortie(null);
    setPendingSortieZoneId(null);
    setCombo(0);
    setStoryPhase('intro');
  }, []);

  const handleToggleSound = useCallback(
    (enabled: boolean) => {
      soundManager.setMuted(!enabled);
      patchProgress({ soundEnabled: enabled });
    },
    [patchProgress]
  );

  const handleCloseTutorial = useCallback(() => {
    patchProgress({ seenTutorial: true });
    if (isHomeShipComplete(homeZoneLevels) && !seenHomeComplete) {
      setStoryPhase('homeComplete');
    } else {
      setStoryPhase('lobby');
    }
  }, [patchProgress, homeZoneLevels, seenHomeComplete]);

  const handleDismissHomeComplete = useCallback(() => {
    const ids = collectedIds.includes(PLAYER_SHIP.id)
      ? collectedIds
      : [...collectedIds, PLAYER_SHIP.id];
    patchProgress({ seenHomeComplete: true, collectedIds: ids });
    setStoryPhase('lobby');
  }, [patchProgress, collectedIds]);

  const openCollection = useCallback(() => {
    setReturnPhase(storyPhase === 'playing' ? 'playing' : 'lobby');
    setStoryPhase('collection');
  }, [storyPhase]);

  const inLobbyHub =
    storyPhase === 'lobby' ||
    storyPhase === 'repairMap' ||
    storyPhase === 'status' ||
    storyPhase === 'settings' ||
    storyPhase === 'tutorial' ||
    storyPhase === 'homeComplete';

  const showPuzzleChrome =
    storyPhase === 'playing' ||
    storyPhase === 'zoneClear' ||
    storyPhase === 'shipClear' ||
    storyPhase === 'sortieIntro';

  const overlayBlocksTips =
    storyPhase !== 'playing' || gameState !== GameState.Playing;

  const activeAtmosphere = getZoneAtmosphere(progress.zone.id);

  return (
    <div
      className={`w-screen h-screen bg-gray-950 overflow-hidden relative ${
        shakeBoard ? 'animate-shake' : ''
      }`}
    >
      {/* 퍼즐 씬: 플레이/관련 오버레이에서만 표시, 함교·브리핑에서는 숨김 */}
      {!inLobbyHub &&
        storyPhase !== 'intro' &&
        storyPhase !== 'collection' &&
        storyPhase !== 'zoneBriefing' && (
        <div className="absolute inset-0">
          <GameScene
            bolts={bolts}
            onBoltClick={handleBoltClick}
            isBoltLocked={isBoltLocked}
            isBoltClickable={isBoltClickable}
            atmosphere={activeAtmosphere}
          />
        </div>
      )}

      {/* intro / collection 배경용 은은한 씬 */}
      {(storyPhase === 'intro' || storyPhase === 'collection') && (
        <div className="absolute inset-0 bg-slate-950">
          <div
            className="absolute inset-0 opacity-40"
            style={{
              backgroundImage:
                'radial-gradient(circle at 30% 40%, rgba(56,189,248,0.3), transparent 45%), radial-gradient(circle at 70% 60%, rgba(167,139,250,0.25), transparent 40%)',
            }}
          />
        </div>
      )}

      {showPuzzleChrome && (
        <StoryHud
          progress={progress}
          score={score}
          remainingCount={remainingCount}
          combo={combo}
          onOpenCollection={openCollection}
          onReturnToLobby={handleReturnToLobby}
          onReset={handleReset}
        />
      )}

      {showMergeEffect && storyPhase === 'playing' && (
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

      {storyPhase === 'playing' && <MergeSlotsUI slots={mergeSlots} maxSlots={maxSlots} />}

      {storyPhase === 'playing' && gameState !== GameState.Playing && (
        <div className="absolute inset-0 flex items-center justify-center z-50 bg-black/70 backdrop-blur-sm">
          <div className="text-center p-8 bg-gray-900/95 rounded-3xl border border-gray-700 shadow-2xl max-w-md mx-4 animate-[fadeIn_0.3s_ease-out]">
            {gameState === GameState.Win ? (
              <>
                <img
                  src="/characters/cat-astronaut-avatar.jpg"
                  alt="캡틴 냥이"
                  className="w-20 h-20 rounded-2xl object-cover mx-auto mb-4 border border-sky-400"
                />
                <h2 className="text-3xl font-bold text-green-400 mb-2">나사 정리 완료!</h2>
                <p className="text-gray-400 mb-2">
                  {encounter.nameKo} · {progress.zone.nameKo} {progress.levelInZone}/
                  {progress.levelsRequired}
                </p>
                <p className="text-sky-300/90 text-sm mb-6">“좋아, 한 칸 더 고쳤어!”</p>
                <button
                  type="button"
                  onClick={advanceCampaign}
                  className="px-8 py-3 bg-sky-400 hover:bg-sky-300 text-slate-950 font-bold rounded-xl transition hover:scale-105"
                >
                  계속 수리 →
                </button>
              </>
            ) : (
              <>
                <div className="text-6xl mb-4">💥</div>
                <h2 className="text-3xl font-bold text-red-400 mb-2">수리 중단</h2>
                <p className="text-gray-400 mb-6">머지 슬롯이 가득 찼습니다!</p>
                <div className="flex gap-3 justify-center">
                  <button
                    type="button"
                    onClick={handleReturnToLobby}
                    className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-bold rounded-xl"
                  >
                    함교로
                  </button>
                  <button
                    type="button"
                    onClick={handleRetryLevel}
                    className="px-6 py-3 bg-sky-400 hover:bg-sky-300 text-slate-950 font-bold rounded-xl"
                  >
                    재시도
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {storyPhase === 'intro' && (
        <StoryModal
          kind="intro"
          encounter={PLAYER_SHIP}
          onContinue={enterLobby}
        />
      )}

      {(storyPhase === 'lobby' ||
        storyPhase === 'repairMap' ||
        storyPhase === 'status' ||
        storyPhase === 'settings' ||
        storyPhase === 'tutorial' ||
        storyPhase === 'homeComplete') && (
        <ShipLobby
          homeZoneLevels={homeZoneLevels}
          playContext={playContext}
          collectedIds={collectedIds}
          showHomeCompleteBanner={false}
          onContinueRepair={handleContinueRepair}
          onOpenRepairMap={() => setStoryPhase('repairMap')}
          onOpenCollection={openCollection}
          onOpenStatus={() => setStoryPhase('status')}
          onOpenSettings={() => setStoryPhase('settings')}
          onOpenTutorial={() => setStoryPhase('tutorial')}
          onDismissHomeComplete={handleDismissHomeComplete}
        />
      )}

      {storyPhase === 'zoneBriefing' && playContext?.kind === 'home' && (
        <ZoneBriefingPanel
          zone={getZoneById(playContext.zoneId)}
          route={getRouteForZone(playContext.zoneId)}
          atmosphere={getZoneAtmosphere(playContext.zoneId)}
          levelInZone={playContext.levelInZone}
          shipNameKo={PLAYER_SHIP.nameKo}
          onStart={confirmZoneBriefing}
          onBack={() => {
            patchProgress({ playContext: null });
            setStoryPhase('repairMap');
          }}
        />
      )}

      {storyPhase === 'repairMap' && (
        <RepairMapPanel
          homeZoneLevels={homeZoneLevels}
          collectedIds={collectedIds}
          onSelectZone={handleSelectZone}
          onLaunchSortie={handleLaunchSortie}
          onClose={() => setStoryPhase('lobby')}
        />
      )}

      {storyPhase === 'status' && (
        <ShipStatusPanel
          homeZoneLevels={homeZoneLevels}
          collectedIds={collectedIds}
          onClose={() => setStoryPhase('lobby')}
        />
      )}

      {storyPhase === 'settings' && (
        <SettingsPanel
          soundEnabled={soundEnabled}
          onToggleSound={handleToggleSound}
          onClose={() => setStoryPhase('lobby')}
        />
      )}

      {storyPhase === 'tutorial' && <TutorialPanel onClose={handleCloseTutorial} />}

      {storyPhase === 'zoneClear' && clearedZone && (
        <StoryModal
          kind="zoneClear"
          encounter={PLAYER_SHIP}
          zone={clearedZone}
          route={getRouteForZone(clearedZone.id)}
          nextEncounter={pendingSortie ?? undefined}
          isHomeZoneClear
          onContinue={continueAfterZoneClear}
        />
      )}

      {storyPhase === 'sortieIntro' && pendingSortie && pendingSortieZoneId && (
        <StoryModal
          kind="sortieIntro"
          encounter={PLAYER_SHIP}
          zone={getZoneById(pendingSortieZoneId)}
          nextEncounter={pendingSortie}
          route={getRouteForZone(pendingSortieZoneId)}
          onContinue={startSortiePlay}
        />
      )}

      {storyPhase === 'shipClear' && (
        <StoryModal
          kind="shipClear"
          encounter={clearedEncounter ?? encounter}
          onContinue={continueAfterShipClear}
        />
      )}

      {storyPhase === 'homeComplete' && (
        <StoryModal
          kind="homeComplete"
          encounter={PLAYER_SHIP}
          onContinue={handleDismissHomeComplete}
        />
      )}

      {storyPhase === 'collection' && (
        <CollectionPanel
          collectedIds={collectedIds}
          onClose={() => setStoryPhase(returnPhase === 'playing' && playContext ? 'playing' : 'lobby')}
        />
      )}

      {storyPhase === 'playing' && !overlayBlocksTips && (
        <div className="absolute bottom-28 left-4 z-40 hidden md:block">
          <div className="bg-gray-900/80 backdrop-blur-sm rounded-lg p-3 border border-gray-800 text-xs text-gray-500 space-y-1 max-w-[220px]">
            <p className="text-slate-300 font-medium mb-1">캡틴 냥이의 팁</p>
            <p>
              클릭: <span className="text-gray-400">풀린 나사 선택</span>
            </p>
            <p>
              같은 색 3개: <span className="text-gray-400">자동 머지</span>
            </p>
            <p>
              구역 {LEVELS_PER_ZONE}레벨: <span className="text-gray-400">항로 개방</span>
            </p>
            {progress.route && (
              <p className="pt-1 border-t border-gray-800 text-slate-500">
                {progress.route.headingKo} 항로 → 조우 대기
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
