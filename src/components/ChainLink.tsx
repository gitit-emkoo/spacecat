/**
 * ChainLink - 체인(사슬) 시각화 컴포넌트
 * 
 * 잠긴 볼트와 잠금 볼트 사이의 의존성을 시각적으로 표현합니다.
 */

import { useMemo } from 'react';
import { Line } from '@react-three/drei';
import { BoltData } from '../game/types';

interface ChainLinkProps {
  fromBolt: BoltData;
  toBolt: BoltData;
}

export function ChainLink({ fromBolt, toBolt }: ChainLinkProps) {
  // 곡선 경로 생성 (베지어 곡선)
  const curvePoints = useMemo(() => {
    const start = fromBolt.position;
    const end = toBolt.position;
    
    // 중간 제어점 (위로 살짝 올림)
    const mid: [number, number, number] = [
      (start[0] + end[0]) / 2,
      Math.max(start[1], end[1]) + 1.2,
      (start[2] + end[2]) / 2,
    ];
    
    const pts: [number, number, number][] = [];
    const segments = 20;
    
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      // Quadratic Bezier
      const x = (1-t)*(1-t)*start[0] + 2*(1-t)*t*mid[0] + t*t*end[0];
      const y = (1-t)*(1-t)*start[1] + 2*(1-t)*t*mid[1] + t*t*end[1];
      const z = (1-t)*(1-t)*start[2] + 2*(1-t)*t*mid[2] + t*t*end[2];
      pts.push([x, y + 0.4, z]);
    }
    return pts;
  }, [fromBolt.position, toBolt.position]);

  return (
    <group>
      {/* 연결선 */}
      <Line
        points={curvePoints}
        color="#6366f1"
        lineWidth={2}
        opacity={0.7}
        transparent
      />
      
      {/* 체인 링크 장식 */}
      {curvePoints.filter((_, i) => i % 4 === 0).map((point, index) => (
        <mesh key={index} position={point}>
          <sphereGeometry args={[0.05, 6, 6]} />
          <meshStandardMaterial
            color="#818cf8"
            emissive="#6366f1"
            emissiveIntensity={0.5}
            metalness={0.9}
            roughness={0.1}
          />
        </mesh>
      ))}
    </group>
  );
}
