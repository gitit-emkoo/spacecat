/**
 * CatAstronaut3D - 캡틴 냥이 (치비/귀여운 스타일)
 *
 * 큰 머리 · 큰 눈 · 둥근 볼 · 은빛 수트
 */

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Group, MathUtils } from 'three';

export interface CatAstronaut3DProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
  idle?: boolean;
  seated?: boolean;
}

const FUR = '#f0a45a';
const FUR_SHADOW = '#d4783a';
const FUR_CREAM = '#ffe4c4';
const SUIT = '#e8eef5';
const SUIT_NAVY = '#243b55';
const ACCENT = '#38bdf8';
const BOOT = '#152033';
const NOSE = '#ff8fab';
const BLUSH = '#ffb4c4';

function Eye({ side }: { side: 'L' | 'R' }) {
  const x = side === 'L' ? -0.085 : 0.085;
  return (
    <group position={[x, 0.02, 0.2]}>
      {/* 흰자 */}
      <mesh scale={[1.05, 1.25, 0.55]}>
        <sphereGeometry args={[0.07, 20, 20]} />
        <meshStandardMaterial color="#fffdf8" roughness={0.35} />
      </mesh>
      {/* 홍채 */}
      <mesh position={[0.008 * (side === 'L' ? 1 : -1), -0.005, 0.045]} scale={[0.9, 1.05, 0.7]}>
        <sphereGeometry args={[0.042, 16, 16]} />
        <meshStandardMaterial color="#2b1a0e" roughness={0.25} />
      </mesh>
      {/* 큰 하이라이트 */}
      <mesh position={[-0.018, 0.022, 0.072]}>
        <sphereGeometry args={[0.018, 12, 12]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.4} />
      </mesh>
      {/* 작은 하이라이트 */}
      <mesh position={[0.016, -0.012, 0.07]}>
        <sphereGeometry args={[0.008, 10, 10]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      {/* 아랫속눈썹 느낌 */}
      <mesh position={[0, -0.055, 0.04]} rotation={[0.2, 0, 0]} scale={[1.1, 0.25, 0.4]}>
        <sphereGeometry args={[0.04, 12, 12]} />
        <meshStandardMaterial color={FUR} roughness={0.85} />
      </mesh>
    </group>
  );
}

export function CatAstronaut3D({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  idle = true,
  seated = false,
}: CatAstronaut3DProps) {
  const root = useRef<Group>(null);
  const head = useRef<Group>(null);
  const tail = useRef<Group>(null);
  const earL = useRef<Group>(null);
  const earR = useRef<Group>(null);
  const baseY = position[1];

  useFrame((state) => {
    if (!idle) return;
    const t = state.clock.elapsedTime;

    if (root.current) {
      root.current.position.y = baseY + Math.sin(t * 1.8) * 0.025;
    }
    if (head.current) {
      head.current.rotation.y = Math.sin(t * 0.7) * 0.1;
      head.current.rotation.z = Math.sin(t * 0.9) * 0.04;
      head.current.rotation.x = MathUtils.lerp(head.current.rotation.x, Math.sin(t * 1.3) * 0.04, 0.1);
    }
    if (tail.current) {
      tail.current.rotation.x = 0.55 + Math.sin(t * 2.2) * 0.25;
      tail.current.rotation.z = 0.35 + Math.sin(t * 1.7) * 0.35;
    }
    if (earL.current) earL.current.rotation.z = -0.4 + Math.sin(t * 2.5) * 0.06;
    if (earR.current) earR.current.rotation.z = 0.4 + Math.sin(t * 2.5 + 1) * 0.06;
  });

  const hipY = seated ? 0.42 : 0.48;
  const legRot: [number, number, number] = seated ? [-1.25, 0, 0] : [0.05, 0, 0];
  const armL: [number, number, number] = seated ? [-0.85, 0.35, 0.55] : [0.2, 0.1, 0.45];
  const armR: [number, number, number] = seated ? [-0.75, -0.25, -0.65] : [0.2, -0.1, -0.45];

  return (
    <group ref={root} position={position} rotation={rotation} scale={scale}>
      {/* ===== 몸통 (작고 둥글게) ===== */}
      <mesh position={[0, hipY + 0.12, 0]} castShadow>
        <sphereGeometry args={[0.28, 24, 24]} />
        <meshStandardMaterial color={SUIT} metalness={0.45} roughness={0.4} />
      </mesh>
      <mesh position={[0, hipY + 0.02, 0]} scale={[0.92, 0.75, 0.85]} castShadow>
        <sphereGeometry args={[0.26, 20, 20]} />
        <meshStandardMaterial color={SUIT} metalness={0.45} roughness={0.4} />
      </mesh>

      {/* 네이비 배지/패널 */}
      <mesh position={[0, hipY + 0.14, 0.22]} scale={[1, 1.1, 0.35]}>
        <sphereGeometry args={[0.14, 16, 16]} />
        <meshStandardMaterial color={SUIT_NAVY} metalness={0.55} roughness={0.35} />
      </mesh>
      <mesh position={[0, hipY + 0.2, 0.26]}>
        <sphereGeometry args={[0.045, 12, 12]} />
        <meshStandardMaterial
          color={ACCENT}
          emissive={ACCENT}
          emissiveIntensity={1.5}
          toneMapped={false}
        />
      </mesh>

      {/* 목 칼라 */}
      <mesh position={[0, hipY + 0.34, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.16, 0.035, 10, 24]} />
        <meshStandardMaterial color={SUIT_NAVY} metalness={0.7} roughness={0.3} />
      </mesh>

      {/* 벨트 */}
      <mesh position={[0, hipY - 0.02, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.22, 0.03, 8, 24]} />
        <meshStandardMaterial color="#334155" metalness={0.75} roughness={0.3} />
      </mesh>
      <mesh position={[0.2, hipY - 0.02, 0.12]} rotation={[0.5, 0.4, 0]}>
        <cylinderGeometry args={[0.035, 0.035, 0.07, 6]} />
        <meshStandardMaterial color="#f87171" metalness={0.6} roughness={0.35} />
      </mesh>

      {/* ===== 머리 (치비: 큼) ===== */}
      <group ref={head} position={[0, hipY + 0.52, 0.02]}>
        {/* 헬멧 유리 (얼굴이 잘 보이도록 옅게) */}
        <mesh>
          <sphereGeometry args={[0.42, 32, 32]} />
          <meshPhysicalMaterial
            color="#b8e6ff"
            transparent
            opacity={0.18}
            roughness={0.05}
            metalness={0.05}
            transmission={0.55}
            thickness={0.4}
          />
        </mesh>
        {/* 헬멧 베이스 링 */}
        <mesh position={[0, -0.28, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.26, 0.04, 10, 28]} />
          <meshStandardMaterial color={SUIT} metalness={0.85} roughness={0.2} />
        </mesh>

        {/* 두개골 */}
        <mesh position={[0, 0.02, 0]} castShadow scale={[1, 0.95, 0.92]}>
          <sphereGeometry args={[0.3, 28, 28]} />
          <meshStandardMaterial color={FUR} roughness={0.85} />
        </mesh>

        {/* 볼살 */}
        <mesh position={[-0.16, -0.04, 0.12]} scale={[1, 0.9, 0.85]}>
          <sphereGeometry args={[0.1, 16, 16]} />
          <meshStandardMaterial color={FUR} roughness={0.85} />
        </mesh>
        <mesh position={[0.16, -0.04, 0.12]} scale={[1, 0.9, 0.85]}>
          <sphereGeometry args={[0.1, 16, 16]} />
          <meshStandardMaterial color={FUR} roughness={0.85} />
        </mesh>

        {/* 이마 태비 */}
        <mesh position={[0, 0.12, 0.22]} scale={[0.35, 0.7, 0.2]}>
          <sphereGeometry args={[0.12, 12, 12]} />
          <meshStandardMaterial color={FUR_SHADOW} roughness={0.9} />
        </mesh>
        <mesh position={[-0.08, 0.14, 0.2]} scale={[0.22, 0.55, 0.15]} rotation={[0, 0, 0.4]}>
          <sphereGeometry args={[0.1, 10, 10]} />
          <meshStandardMaterial color={FUR_SHADOW} roughness={0.9} />
        </mesh>
        <mesh position={[0.08, 0.14, 0.2]} scale={[0.22, 0.55, 0.15]} rotation={[0, 0, -0.4]}>
          <sphereGeometry args={[0.1, 10, 10]} />
          <meshStandardMaterial color={FUR_SHADOW} roughness={0.9} />
        </mesh>

        {/* 귀 */}
        <group ref={earL} position={[-0.16, 0.22, -0.02]} rotation={[0.2, 0.15, -0.4]}>
          <mesh castShadow>
            <coneGeometry args={[0.09, 0.18, 5]} />
            <meshStandardMaterial color={FUR} roughness={0.85} />
          </mesh>
          <mesh position={[0, 0.01, 0.01]} scale={[0.55, 0.7, 0.5]}>
            <coneGeometry args={[0.09, 0.18, 5]} />
            <meshStandardMaterial color="#ffc1d5" roughness={0.7} />
          </mesh>
        </group>
        <group ref={earR} position={[0.16, 0.22, -0.02]} rotation={[0.2, -0.15, 0.4]}>
          <mesh castShadow>
            <coneGeometry args={[0.09, 0.18, 5]} />
            <meshStandardMaterial color={FUR} roughness={0.85} />
          </mesh>
          <mesh position={[0, 0.01, 0.01]} scale={[0.55, 0.7, 0.5]}>
            <coneGeometry args={[0.09, 0.18, 5]} />
            <meshStandardMaterial color="#ffc1d5" roughness={0.7} />
          </mesh>
        </group>

        <Eye side="L" />
        <Eye side="R" />

        {/* 코 */}
        <mesh position={[0, -0.04, 0.27]} rotation={[0.3, 0, 0]} scale={[1, 0.7, 0.7]}>
          <sphereGeometry args={[0.028, 12, 12]} />
          <meshStandardMaterial color={NOSE} roughness={0.45} />
        </mesh>

        {/* 입 (작은 W / 하트 느낌) */}
        <mesh position={[-0.025, -0.08, 0.255]} rotation={[0.2, 0, 0.5]} scale={[1, 0.35, 0.5]}>
          <torusGeometry args={[0.02, 0.006, 6, 12, Math.PI]} />
          <meshStandardMaterial color="#c45c6a" roughness={0.5} />
        </mesh>
        <mesh position={[0.025, -0.08, 0.255]} rotation={[0.2, 0, -0.5]} scale={[1, 0.35, 0.5]}>
          <torusGeometry args={[0.02, 0.006, 6, 12, Math.PI]} />
          <meshStandardMaterial color="#c45c6a" roughness={0.5} />
        </mesh>

        {/* 블러시 */}
        <mesh position={[-0.15, -0.05, 0.2]} scale={[1.2, 0.7, 0.4]}>
          <sphereGeometry args={[0.05, 12, 12]} />
          <meshStandardMaterial color={BLUSH} transparent opacity={0.55} roughness={1} />
        </mesh>
        <mesh position={[0.15, -0.05, 0.2]} scale={[1.2, 0.7, 0.4]}>
          <sphereGeometry args={[0.05, 12, 12]} />
          <meshStandardMaterial color={BLUSH} transparent opacity={0.55} roughness={1} />
        </mesh>

        {/* 수염 */}
        {(
          [
            [-0.14, -0.05, 0.22, 0.15, -0.2],
            [-0.15, -0.09, 0.2, -0.05, -0.05],
            [0.14, -0.05, 0.22, -0.15, 0.2],
            [0.15, -0.09, 0.2, 0.05, 0.05],
          ] as [number, number, number, number, number][]
        ).map(([px, py, pz, ry, rz], i) => (
          <mesh key={i} position={[px, py, pz]} rotation={[0, ry, Math.PI / 2 + rz]}>
            <capsuleGeometry args={[0.0035, 0.11, 2, 6]} />
            <meshStandardMaterial color={FUR_CREAM} roughness={0.55} />
          </mesh>
        ))}

        {/* 턱 크림색 */}
        <mesh position={[0, -0.12, 0.14]} scale={[1.1, 0.7, 0.9]}>
          <sphereGeometry args={[0.12, 16, 16]} />
          <meshStandardMaterial color={FUR_CREAM} roughness={0.85} />
        </mesh>
      </group>

      {/* ===== 팔 ===== */}
      <group position={[-0.26, hipY + 0.2, 0]} rotation={armL}>
        <mesh position={[0, -0.14, 0]} castShadow>
          <capsuleGeometry args={[0.07, 0.16, 6, 10]} />
          <meshStandardMaterial color={SUIT} metalness={0.45} roughness={0.4} />
        </mesh>
        <mesh position={[0, -0.3, 0]} castShadow>
          <sphereGeometry args={[0.085, 14, 14]} />
          <meshStandardMaterial color={FUR} roughness={0.85} />
        </mesh>
      </group>
      <group position={[0.26, hipY + 0.2, 0]} rotation={armR}>
        <mesh position={[0, -0.14, 0]} castShadow>
          <capsuleGeometry args={[0.07, 0.16, 6, 10]} />
          <meshStandardMaterial color={SUIT} metalness={0.45} roughness={0.4} />
        </mesh>
        <mesh position={[0, -0.3, 0]} castShadow>
          <sphereGeometry args={[0.085, 14, 14]} />
          <meshStandardMaterial color={FUR} roughness={0.85} />
        </mesh>
      </group>

      {/* ===== 다리 ===== */}
      <group position={[-0.1, hipY - 0.08, 0.02]} rotation={legRot}>
        <mesh position={[0, -0.14, 0]} castShadow>
          <capsuleGeometry args={[0.075, 0.14, 6, 10]} />
          <meshStandardMaterial color={SUIT_NAVY} metalness={0.5} roughness={0.4} />
        </mesh>
        <mesh position={[0, -0.3, 0.03]} castShadow>
          <sphereGeometry args={[0.09, 12, 12]} />
          <meshStandardMaterial color={BOOT} metalness={0.65} roughness={0.35} />
        </mesh>
      </group>
      <group position={[0.1, hipY - 0.08, 0.02]} rotation={legRot}>
        <mesh position={[0, -0.14, 0]} castShadow>
          <capsuleGeometry args={[0.075, 0.14, 6, 10]} />
          <meshStandardMaterial color={SUIT_NAVY} metalness={0.5} roughness={0.4} />
        </mesh>
        <mesh position={[0, -0.3, 0.03]} castShadow>
          <sphereGeometry args={[0.09, 12, 12]} />
          <meshStandardMaterial color={BOOT} metalness={0.65} roughness={0.35} />
        </mesh>
      </group>

      {/* ===== 꼬리 (흔들림) ===== */}
      <group ref={tail} position={[0, hipY - 0.02, -0.22]} rotation={[0.6, 0, 0.3]}>
        <mesh position={[0, 0.12, 0]} castShadow>
          <capsuleGeometry args={[0.045, 0.22, 4, 8]} />
          <meshStandardMaterial color={FUR} roughness={0.85} />
        </mesh>
        <mesh position={[0.02, 0.3, -0.02]} rotation={[0.4, 0, 0.3]} castShadow>
          <capsuleGeometry args={[0.038, 0.16, 4, 8]} />
          <meshStandardMaterial color={FUR} roughness={0.85} />
        </mesh>
        <mesh position={[0.06, 0.42, -0.04]}>
          <sphereGeometry args={[0.05, 10, 10]} />
          <meshStandardMaterial color={FUR_SHADOW} roughness={0.85} />
        </mesh>
      </group>
    </group>
  );
}
