/**
 * Bolt3D - 3D 볼트 컴포넌트
 * 
 * 보드 위에 배치된 볼트를 3D로 렌더링합니다.
 * 잠긴 볼트는 어둡게, 풀 수 있는 볼트는 밝게 + 부유 애니메이션
 */

import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh, Group } from 'three';
import { BoltData, COLOR_MAP, LOCKED_COLOR_MAP } from '../game/types';

interface Bolt3DProps {
  bolt: BoltData;
  isLocked: boolean;
  isClickable: boolean;
  onClick: (id: number) => void;
}

export function Bolt3D({ bolt, isLocked, isClickable, onClick }: Bolt3DProps) {
  const groupRef = useRef<Group>(null);
  const headRef = useRef<Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const baseY = bolt.position[1];
  
  // 부유 애니메이션 (풀 수 있는 볼트만)
  useFrame((state) => {
    if (groupRef.current && !bolt.isRemoved) {
      const time = state.clock.elapsedTime;
      
      if (isClickable) {
        // 풀 수 있는 볼트: 부드럽게 위아래로
        groupRef.current.position.y = baseY + Math.sin(time * 2 + bolt.id * 0.7) * 0.06;
      }
      
      // 호버 시 살짝 확대
      if (headRef.current) {
        const targetScale = hovered && isClickable ? 1.2 : 1.0;
        const currentScale = headRef.current.scale.x;
        const newScale = currentScale + (targetScale - currentScale) * 0.1;
        headRef.current.scale.set(newScale, newScale, newScale);
      }
    }
  });

  if (bolt.isRemoved) return null;

  const color = isLocked ? LOCKED_COLOR_MAP[bolt.color] : COLOR_MAP[bolt.color];
  const emissiveColor = isLocked ? '#111111' : COLOR_MAP[bolt.color];
  const emissiveIntensity = hovered && isClickable ? 0.5 : (isLocked ? 0 : 0.15);

  return (
    <group
      ref={groupRef}
      position={bolt.position}
    >
      {/* 볼트 머리 (육각 너트 형태) */}
      <mesh
        ref={headRef}
        position={[0, 0.35, 0]}
        onClick={(e) => {
          e.stopPropagation();
          if (isClickable) onClick(bolt.id);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          if (isClickable) {
            setHovered(true);
            document.body.style.cursor = 'pointer';
          }
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = 'default';
        }}
        castShadow
        receiveShadow
      >
        <cylinderGeometry args={[0.38, 0.38, 0.22, 6]} />
        <meshStandardMaterial
          color={color}
          emissive={emissiveColor}
          emissiveIntensity={emissiveIntensity}
          metalness={0.85}
          roughness={0.15}
        />
      </mesh>
      
      {/* 머리 위 장식 (十字 홈) */}
      <mesh position={[0, 0.47, 0]} rotation={[0, Math.PI / 4, 0]}>
        <boxGeometry args={[0.35, 0.03, 0.06]} />
        <meshStandardMaterial
          color={isLocked ? '#333' : '#ddd'}
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>
      <mesh position={[0, 0.47, 0]} rotation={[0, -Math.PI / 4, 0]}>
        <boxGeometry args={[0.35, 0.03, 0.06]} />
        <meshStandardMaterial
          color={isLocked ? '#333' : '#ddd'}
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>
      
      {/* 볼트 몸통 (나사산) */}
      <mesh position={[0, 0.05, 0]} castShadow>
        <cylinderGeometry args={[0.18, 0.22, 0.5, 12]} />
        <meshStandardMaterial
          color={color}
          emissive={emissiveColor}
          emissiveIntensity={emissiveIntensity * 0.5}
          metalness={0.9}
          roughness={0.25}
        />
      </mesh>
      
      {/* 나사산 링 장식 */}
      {[0, 0.1, 0.2].map((offset, i) => (
        <mesh key={i} position={[0, -0.1 + offset, 0]}>
          <torusGeometry args={[0.2, 0.02, 6, 12]} />
          <meshStandardMaterial
            color={isLocked ? '#444' : '#999'}
            metalness={0.9}
            roughness={0.2}
          />
        </mesh>
      ))}
      
      {/* 잠금 표시 - 글로우 링 */}
      {isLocked && (
        <group position={[0, 0.6, 0]}>
          <mesh>
            <torusGeometry args={[0.25, 0.03, 8, 16]} />
            <meshStandardMaterial
              color="#ef4444"
              emissive="#ef4444"
              emissiveIntensity={1}
              transparent
              opacity={0.8}
            />
          </mesh>
          {/* 자물쇠 본체 */}
          <mesh position={[0, 0.15, 0]}>
            <boxGeometry args={[0.15, 0.12, 0.08]} />
            <meshStandardMaterial color="#666" metalness={0.9} roughness={0.1} />
          </mesh>
          {/* 자물쇠 고리 */}
          <mesh position={[0, 0.25, 0]}>
            <torusGeometry args={[0.06, 0.02, 6, 12]} />
            <meshStandardMaterial color="#888" metalness={0.9} roughness={0.1} />
          </mesh>
        </group>
      )}
      
      {/* 클릭 가능한 볼트의 글로우 효과 */}
      {isClickable && hovered && (
        <mesh position={[0, 0.35, 0]}>
          <sphereGeometry args={[0.55, 16, 16]} />
          <meshStandardMaterial
            color={COLOR_MAP[bolt.color]}
            emissive={COLOR_MAP[bolt.color]}
            emissiveIntensity={1}
            transparent
            opacity={0.15}
          />
        </mesh>
      )}
    </group>
  );
}
