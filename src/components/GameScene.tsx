/**
 * GameScene - 3D 게임 씬 컴포넌트
 *
 * 구역 분위기에 따라 배경·조명·플랫폼 색이 달라집니다.
 */

import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, Grid, Float } from '@react-three/drei';
import { Mesh, Group } from 'three';
import { Bolt3D } from './Bolt3D';
import { ChainLink } from './ChainLink';
import { CatAstronaut3D } from './characters/CatAstronaut3D';
import { PatrolFlight } from './characters/PatrolFlight';
import { BoltData } from '../game/types';
import { ZoneAtmosphere, ZONE_ATMOSPHERES } from '../story/campaign';

interface GameSceneProps {
  bolts: BoltData[];
  onBoltClick: (id: number) => void;
  isBoltLocked: (id: number) => boolean;
  isBoltClickable: (id: number) => boolean;
  atmosphere?: ZoneAtmosphere;
}

const DEFAULT_ATMO = ZONE_ATMOSPHERES.tail;

/** 회전하는 장식 링 */
function DecorativeRing({ color }: { color: string }) {
  const ringRef = useRef<Mesh>(null);

  useFrame((state) => {
    if (ringRef.current) {
      ringRef.current.rotation.y = state.clock.elapsedTime * 0.1;
      ringRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.1;
    }
  });

  return (
    <mesh ref={ringRef} position={[0, -0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <torusGeometry args={[7, 0.03, 8, 64]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.5}
        metalness={1}
        roughness={0}
        transparent
        opacity={0.6}
      />
    </mesh>
  );
}

/** 떠다니는 입자 장식 */
function FloatingOrbs({ colors }: { colors: string[] }) {
  const groupRef = useRef<Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.05;
    }
  });

  const orbs = Array.from({ length: 8 }, (_, i) => {
    const angle = (i / 8) * Math.PI * 2;
    const radius = 6 + (i % 3) * 0.7;
    return {
      position: [
        Math.cos(angle) * radius,
        1 + Math.sin(i * 1.5) * 2,
        Math.sin(angle) * radius,
      ] as [number, number, number],
      color: colors[i % colors.length],
      scale: 0.05 + (i % 4) * 0.02,
    };
  });

  return (
    <group ref={groupRef}>
      {orbs.map((orb, i) => (
        <Float key={i} speed={1 + i * 0.3} rotationIntensity={0.5} floatIntensity={1}>
          <mesh position={orb.position}>
            <sphereGeometry args={[orb.scale, 8, 8]} />
            <meshStandardMaterial
              color={orb.color}
              emissive={orb.color}
              emissiveIntensity={2}
              transparent
              opacity={0.7}
            />
          </mesh>
        </Float>
      ))}
    </group>
  );
}

/** 게임 보드 플랫폼 */
function BoardPlatform({
  platformColor,
  rimColor,
}: {
  platformColor: string;
  rimColor: string;
}) {
  return (
    <group>
      <mesh position={[0, -0.35, 0]} receiveShadow>
        <cylinderGeometry args={[6, 6.5, 0.15, 32]} />
        <meshStandardMaterial color={platformColor} metalness={0.5} roughness={0.3} />
      </mesh>

      <mesh position={[0, -0.28, 0]}>
        <torusGeometry args={[6.2, 0.05, 8, 64]} />
        <meshStandardMaterial
          color={rimColor}
          emissive={rimColor}
          emissiveIntensity={0.8}
          metalness={1}
          roughness={0}
        />
      </mesh>
    </group>
  );
}

export function GameScene({
  bolts,
  onBoltClick,
  isBoltLocked,
  isBoltClickable,
  atmosphere = DEFAULT_ATMO,
}: GameSceneProps) {
  const chainPairs = bolts
    .filter((b) => !b.isRemoved && b.lockedByBoltId !== -1)
    .map((bolt) => {
      const locker = bolts.find((b) => b.id === bolt.lockedByBoltId);
      if (locker && !locker.isRemoved) {
        return { fromBolt: bolt, toBolt: locker };
      }
      return null;
    })
    .filter(Boolean) as { fromBolt: BoltData; toBolt: BoltData }[];

  const orbColors = [
    atmosphere.keyLightColor,
    atmosphere.fillLightColor,
    atmosphere.accentLightColor,
    atmosphere.rimColor,
    atmosphere.uiAccent,
  ];

  return (
    <Canvas
      key={atmosphere.zoneId}
      shadows
      camera={{ position: [0, 10, 9], fov: 50 }}
      className="w-full h-full"
      gl={{ antialias: true, alpha: false }}
    >
      <color attach="background" args={[atmosphere.background]} />
      <fog attach="fog" args={[atmosphere.fog, 15, 30]} />

      <ambientLight intensity={atmosphere.ambientIntensity} />
      <directionalLight
        position={[5, 10, 5]}
        intensity={1.15}
        color={atmosphere.keyLightColor}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={30}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />
      <pointLight position={[-5, 5, -5]} intensity={0.55} color={atmosphere.fillLightColor} />
      <pointLight position={[5, 3, 5]} intensity={0.35} color={atmosphere.accentLightColor} />
      <pointLight position={[0, 8, 0]} intensity={0.4} color={atmosphere.rimColor} />

      <BoardPlatform platformColor={atmosphere.platformColor} rimColor={atmosphere.rimColor} />

      <PatrolFlight radiusX={7.4} radiusZ={6.6} altitude={2.2} speed={0.26} scale={0.75} />

      <CatAstronaut3D
        position={[-4.4, 0.08, 3.4]}
        rotation={[0, 0.85, 0]}
        scale={1.35}
        idle
      />

      <DecorativeRing color={atmosphere.ringColor} />
      <FloatingOrbs colors={orbColors} />

      <Grid
        position={[0, -0.42, 0]}
        args={[20, 20]}
        cellSize={1}
        cellThickness={0.3}
        cellColor={atmosphere.gridCell}
        sectionSize={5}
        sectionThickness={0.8}
        sectionColor={atmosphere.gridSection}
        fadeDistance={18}
        fadeStrength={1.5}
      />

      {bolts.map((bolt) => (
        <Bolt3D
          key={bolt.id}
          bolt={bolt}
          isLocked={isBoltLocked(bolt.id)}
          isClickable={isBoltClickable(bolt.id)}
          onClick={onBoltClick}
        />
      ))}

      {chainPairs.map((pair, index) => (
        <ChainLink
          key={`chain-${index}`}
          fromBolt={pair.fromBolt}
          toBolt={pair.toBolt}
        />
      ))}

      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={5}
        maxDistance={20}
        maxPolarAngle={Math.PI / 2.2}
        minPolarAngle={0.3}
        target={[0, 0, 0]}
      />

      <Environment preset="night" />
    </Canvas>
  );
}
