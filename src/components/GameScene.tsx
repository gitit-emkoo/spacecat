/**
 * GameScene - 3D 게임 씬 컴포넌트
 * 
 * Three.js 기반 3D 씬을 렌더링합니다.
 * 볼트, 체인, 조명, 카메라 등을 포함합니다.
 */

import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, Grid, Float } from '@react-three/drei';
import { Mesh, Group } from 'three';
import { Bolt3D } from './Bolt3D';
import { ChainLink } from './ChainLink';
import { BoltData } from '../game/types';

interface GameSceneProps {
  bolts: BoltData[];
  onBoltClick: (id: number) => void;
  isBoltLocked: (id: number) => boolean;
  isBoltClickable: (id: number) => boolean;
}

/** 회전하는 장식 링 */
function DecorativeRing() {
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
        color="#4f46e5"
        emissive="#4f46e5"
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
function FloatingOrbs() {
  const groupRef = useRef<Group>(null);
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.05;
    }
  });
  
  const orbs = Array.from({ length: 8 }, (_, i) => {
    const angle = (i / 8) * Math.PI * 2;
    const radius = 6 + Math.random() * 2;
    return {
      position: [
        Math.cos(angle) * radius,
        1 + Math.sin(i * 1.5) * 2,
        Math.sin(angle) * radius,
      ] as [number, number, number],
      color: ['#ef4444', '#3b82f6', '#22c55e', '#eab308', '#a855f7', '#f97316', '#06b6d4', '#ec4899'][i],
      scale: 0.05 + Math.random() * 0.08,
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
function BoardPlatform() {
  return (
    <group>
      {/* 메인 플랫폼 */}
      <mesh position={[0, -0.35, 0]} receiveShadow>
        <cylinderGeometry args={[6, 6.5, 0.15, 32]} />
        <meshStandardMaterial
          color="#1e1b4b"
          metalness={0.5}
          roughness={0.3}
        />
      </mesh>
      
      {/* 플랫폼 테두리 */}
      <mesh position={[0, -0.28, 0]}>
        <torusGeometry args={[6.2, 0.05, 8, 64]} />
        <meshStandardMaterial
          color="#6366f1"
          emissive="#6366f1"
          emissiveIntensity={0.8}
          metalness={1}
          roughness={0}
        />
      </mesh>
    </group>
  );
}

export function GameScene({ bolts, onBoltClick, isBoltLocked, isBoltClickable }: GameSceneProps) {
  // 체인 연결이 필요한 볼트 쌍
  const chainPairs = bolts
    .filter(b => !b.isRemoved && b.lockedByBoltId !== -1)
    .map(bolt => {
      const locker = bolts.find(b => b.id === bolt.lockedByBoltId);
      if (locker && !locker.isRemoved) {
        return { fromBolt: bolt, toBolt: locker };
      }
      return null;
    })
    .filter(Boolean) as { fromBolt: BoltData; toBolt: BoltData }[];

  return (
    <Canvas
      shadows
      camera={{ position: [0, 10, 9], fov: 50 }}
      className="w-full h-full"
      gl={{ antialias: true, alpha: false }}
    >
      {/* 배경 색상 */}
      <color attach="background" args={['#0a0a1a']} />
      <fog attach="fog" args={['#0a0a1a', 15, 30]} />
      
      {/* 조명 설정 */}
      <ambientLight intensity={0.3} />
      <directionalLight
        position={[5, 10, 5]}
        intensity={1.2}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={30}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />
      <pointLight position={[-5, 5, -5]} intensity={0.5} color="#4488ff" />
      <pointLight position={[5, 3, 5]} intensity={0.3} color="#ff8844" />
      <pointLight position={[0, 8, 0]} intensity={0.4} color="#a855f7" />
      
      {/* 보드 플랫폼 */}
      <BoardPlatform />
      
      {/* 장식 링 */}
      <DecorativeRing />
      
      {/* 떠다니는 오브 */}
      <FloatingOrbs />
      
      {/* 그리드 */}
      <Grid
        position={[0, -0.42, 0]}
        args={[20, 20]}
        cellSize={1}
        cellThickness={0.3}
        cellColor="#1e1b4b"
        sectionSize={5}
        sectionThickness={0.8}
        sectionColor="#312e81"
        fadeDistance={18}
        fadeStrength={1.5}
      />
      
      {/* 볼트 렌더링 */}
      {bolts.map(bolt => (
        <Bolt3D
          key={bolt.id}
          bolt={bolt}
          isLocked={isBoltLocked(bolt.id)}
          isClickable={isBoltClickable(bolt.id)}
          onClick={onBoltClick}
        />
      ))}
      
      {/* 체인 연결 렌더링 */}
      {chainPairs.map((pair, index) => (
        <ChainLink
          key={`chain-${index}`}
          fromBolt={pair.fromBolt}
          toBolt={pair.toBolt}
        />
      ))}
      
      {/* 카메라 컨트롤 */}
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
      
      {/* 환경 */}
      <Environment preset="night" />
    </Canvas>
  );
}
