/**
 * NyangstaShip3D - 냥스타호 3D 모델
 */

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Group } from 'three';
import { CatAstronaut3D } from './CatAstronaut3D';

export interface NyangstaShip3DProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
  /** 호버 idle (비행 중이면 false) */
  idle?: boolean;
  /** idle이 꺼져도 엔진 펄스만 유지 */
  enginePulse?: boolean;
  withPilot?: boolean;
  accent?: string;
}

const HULL = '#d7e0ea';
const HULL_DARK = '#1e293b';
const GLASS = '#9fdcff';

export function NyangstaShip3D({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  idle = true,
  enginePulse = false,
  withPilot = true,
  accent = '#38bdf8',
}: NyangstaShip3DProps) {
  const root = useRef<Group>(null);
  const engineL = useRef<Group>(null);
  const engineR = useRef<Group>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;

    if (idle && root.current) {
      root.current.position.y = position[1] + Math.sin(t * 1.2) * 0.08;
      root.current.rotation.z = Math.sin(t * 0.7) * 0.03;
      root.current.rotation.x = Math.sin(t * 0.5) * 0.02;
    }

    if ((idle || enginePulse) && (engineL.current || engineR.current)) {
      const pulse = 0.65 + Math.sin(t * 8) * 0.35;
      engineL.current?.scale.set(1, 1, pulse);
      engineR.current?.scale.set(1, 1, pulse);
    }
  });

  return (
    <group ref={root} position={position} rotation={rotation} scale={scale}>
      <mesh castShadow receiveShadow>
        <capsuleGeometry args={[0.42, 1.35, 8, 20]} />
        <meshStandardMaterial color={HULL} metalness={0.7} roughness={0.28} />
      </mesh>
      <mesh position={[0, -0.26, 0]} castShadow>
        <capsuleGeometry args={[0.3, 0.95, 6, 14]} />
        <meshStandardMaterial color={HULL_DARK} metalness={0.55} roughness={0.4} />
      </mesh>

      <mesh position={[0, 0.04, 1.0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <coneGeometry args={[0.4, 0.65, 14]} />
        <meshStandardMaterial color={HULL} metalness={0.75} roughness={0.22} />
      </mesh>
      <mesh position={[0, 0.1, 1.28]}>
        <sphereGeometry args={[0.09, 14, 14]} />
        <meshStandardMaterial
          color={accent}
          emissive={accent}
          emissiveIntensity={1.5}
          toneMapped={false}
        />
      </mesh>

      {/* 캐노피: 파일럿 얼굴이 잘 보이도록 옅게 */}
      <mesh position={[0, 0.4, 0.22]}>
        <sphereGeometry args={[0.48, 24, 18, 0, Math.PI * 2, 0, Math.PI * 0.58]} />
        <meshPhysicalMaterial
          color={GLASS}
          transparent
          opacity={0.2}
          roughness={0.05}
          metalness={0.05}
          transmission={0.65}
          thickness={0.35}
        />
      </mesh>
      <mesh position={[0, 0.2, 0.22]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.42, 0.028, 8, 28]} />
        <meshStandardMaterial color={HULL_DARK} metalness={0.85} roughness={0.2} />
      </mesh>

      {withPilot && (
        <CatAstronaut3D position={[0, -0.02, 0.18]} scale={0.62} seated idle />
      )}

      <mesh position={[-0.82, 0, 0]} rotation={[0, 0, -0.12]} castShadow>
        <boxGeometry args={[1.05, 0.055, 0.5]} />
        <meshStandardMaterial color={HULL} metalness={0.65} roughness={0.3} />
      </mesh>
      <mesh position={[-1.15, 0.02, 0]} rotation={[0, 0, -0.18]}>
        <boxGeometry args={[0.32, 0.04, 0.32]} />
        <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.45} />
      </mesh>

      <mesh position={[0.82, 0, 0]} rotation={[0, 0, 0.12]} castShadow>
        <boxGeometry args={[1.05, 0.055, 0.5]} />
        <meshStandardMaterial color={HULL} metalness={0.65} roughness={0.3} />
      </mesh>
      <mesh position={[1.15, 0.02, 0]} rotation={[0, 0, 0.18]}>
        <boxGeometry args={[0.32, 0.04, 0.32]} />
        <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.45} />
      </mesh>

      <mesh position={[0, 0.32, -0.92]} castShadow>
        <boxGeometry args={[0.07, 0.5, 0.32]} />
        <meshStandardMaterial color={HULL} metalness={0.65} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.5, -0.92]}>
        <boxGeometry args={[0.4, 0.05, 0.18]} />
        <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.4} />
      </mesh>

      <group ref={engineL} position={[-0.32, -0.04, -1.0]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.13, 0.17, 0.32, 12]} />
          <meshStandardMaterial color={HULL_DARK} metalness={0.8} roughness={0.25} />
        </mesh>
        <mesh position={[0, 0, -0.2]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.09, 0.11, 0.1, 12]} />
          <meshStandardMaterial
            color={accent}
            emissive={accent}
            emissiveIntensity={2.2}
            toneMapped={false}
          />
        </mesh>
        <pointLight position={[0, 0, -0.35]} color={accent} intensity={1.4} distance={3.5} />
      </group>

      <group ref={engineR} position={[0.32, -0.04, -1.0]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.13, 0.17, 0.32, 12]} />
          <meshStandardMaterial color={HULL_DARK} metalness={0.8} roughness={0.25} />
        </mesh>
        <mesh position={[0, 0, -0.2]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.09, 0.11, 0.1, 12]} />
          <meshStandardMaterial
            color={accent}
            emissive={accent}
            emissiveIntensity={2.2}
            toneMapped={false}
          />
        </mesh>
        <pointLight position={[0, 0, -0.35]} color={accent} intensity={1.4} distance={3.5} />
      </group>
    </group>
  );
}
