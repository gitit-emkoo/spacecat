/**
 * PatrolFlight - 냥스타호가 보드 주위를 순찰 비행
 *
 * 타원 궤도 + 뱅킹 + 고도 웨이브
 */

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Group } from 'three';
import { NyangstaShip3D } from './NyangstaShip3D';

export interface PatrolFlightProps {
  /** 궤도 반지름 X */
  radiusX?: number;
  /** 궤도 반지름 Z */
  radiusZ?: number;
  /** 기본 고도 */
  altitude?: number;
  /** 한 바퀴 속도 (라디안/초) */
  speed?: number;
  scale?: number;
  accent?: string;
}

export function PatrolFlight({
  radiusX = 7.2,
  radiusZ = 6.4,
  altitude = 2.1,
  speed = 0.28,
  scale = 0.72,
  accent = '#38bdf8',
}: PatrolFlightProps) {
  const pivot = useRef<Group>(null);

  useFrame((state) => {
    if (!pivot.current) return;
    const t = state.clock.elapsedTime * speed;

    const x = Math.cos(t) * radiusX;
    const z = Math.sin(t) * radiusZ;
    const y = altitude + Math.sin(t * 2.2) * 0.35 + Math.sin(t * 0.7) * 0.15;

    pivot.current.position.set(x, y, z);

    // 진행 방향(접선)을 바라보고, 선회 시 살짝 기울기
    const tx = -Math.sin(t) * radiusX;
    const tz = Math.cos(t) * radiusZ;
    const yaw = Math.atan2(tx, tz);
    const bank = -Math.sin(t) * 0.28;
    const pitch = Math.sin(t * 2.2) * 0.08;

    pivot.current.rotation.set(pitch, yaw, bank);
  });

  return (
    <group ref={pivot}>
      {/* 함선 local forward = +Z 기준으로 맞춤 */}
      <NyangstaShip3D
        position={[0, 0, 0]}
        rotation={[0, 0, 0]}
        scale={scale}
        withPilot
        idle={false}
        accent={accent}
        enginePulse
      />
      {/* 비행 궤적 느낌의 잔광 */}
      <mesh position={[0, -0.05, -1.3]}>
        <sphereGeometry args={[0.12, 10, 10]} />
        <meshStandardMaterial
          color={accent}
          emissive={accent}
          emissiveIntensity={1.5}
          transparent
          opacity={0.35}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}
