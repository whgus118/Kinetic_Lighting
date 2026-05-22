/* eslint-disable react/no-unknown-property */
import { useEffect, useRef, useState, useMemo } from 'react';
import { Canvas, extend, useFrame } from '@react-three/fiber';
import { Environment } from '@react-three/drei';
import {
  BallCollider,
  CuboidCollider,
  Physics,
  RigidBody,
  useRopeJoint,
  useSphericalJoint,
} from '@react-three/rapier';
import { MeshLineGeometry, MeshLineMaterial } from 'meshline';
import * as THREE from 'three';
import './KineticLamp.css';

extend({ MeshLineGeometry, MeshLineMaterial });

/* ── 랜야드 텍스처: 캔버스로 생성 ── */
function createLanyardTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  // 세로 줄무늬 패턴 (앰버 계열)
  const grad = ctx.createLinearGradient(0, 0, 64, 0);
  grad.addColorStop(0, '#B8762A');
  grad.addColorStop(0.3, '#D1DCD6');
  grad.addColorStop(0.5, '#E8C882');
  grad.addColorStop(0.7, '#D1DCD6');
  grad.addColorStop(1, '#B8762A');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 64, 256);

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  return tex;
}


/* ── 조명 갓 3D 메시 ── */
function LampShade({ isActivated = false, dragged, hovered, onPointerOver, onPointerOut, onPointerDown, onPointerUp }) {
  const groupRef = useRef();
  const innerRef = useRef();
  const lightRef = useRef();
  const coneRef = useRef();

  // 갓 (사다리꼴 실린더)
  const shadeGeom = useMemo(() => {
    const g = new THREE.CylinderGeometry(0.55, 1.0, 1.1, 32, 1, true);
    return g;
  }, []);

  // 갓 내부 발광 메시
  const innerGeom = useMemo(() => {
    return new THREE.CylinderGeometry(0.5, 0.95, 1.09, 32, 1, true);
  }, []);

  // 하단 링
  const ringGeom = useMemo(() => {
    return new THREE.TorusGeometry(1.0, 0.025, 8, 48);
  }, []);

  // 상단 링
  const topRingGeom = useMemo(() => {
    return new THREE.TorusGeometry(0.55, 0.02, 8, 32);
  }, []);

  // 💡 [대체] 빛 투사 원뿔대 (Cylinder) - 상단 반지름을 수축하여 갓 하단 구멍(반지름 1.0) 안쪽에 완벽 밀착
  const coneGeom = useMemo(() => {
    return new THREE.CylinderGeometry(0.4, 2.1, 3.0, 32, 1, true);
  }, []);

  // 💡 [대체] 기존의 정적 텍스처를 걷어내고, 3D 원뿔에 입체적으로 동작하는 커스텀 셰이더 재질 정의
  const rayShaderMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vViewPosition;
        varying vec3 vPosition; // UV 끊김 해결용 3D 로컬 좌표 전달
        void main() {
          vUv = uv;
          vPosition = position;
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          vViewPosition = -mvPosition.xyz;
          vNormal = normalMatrix * normal;
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        precision highp float;
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vViewPosition;
        varying vec3 vPosition; // UV 끊김 해결용 3D 로컬 좌표

        uniform float uTime;
        uniform vec3 uColor;
        uniform float uHovered;
        uniform float uActivated; // 다크모드 활성화 점등 유니폼

        // 의사 난수 2D 노이즈 유틸리티
        float rand(vec2 co) {
          return fract(sin(dot(co.xy, vec2(12.9898,78.233))) * 43758.5453);
        }

        float noise(vec2 st) {
          vec2 i = floor(st);
          vec2 f = fract(st);
          float a = rand(i);
          float b = rand(i + vec2(1.0, 0.0));
          float c = rand(i + vec2(0.0, 1.0));
          float d = rand(i + vec2(1.0, 1.0));
          vec2 u = f*f*(3.0-2.0*f);
          return mix(a, b, u.x) + (c - a)* u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
        }

        void main() {
          // 1. [꼭짓점 및 바닥 양방향 부드러운 감쇠]
          // 원뿔대 상단(Y=1.0)과 바닥(Y=0.0) 양끝을 솜사탕처럼 스무스하게 뭉개어 이음새 경계를 완벽히 지웁니다.
          // 꼭짓점 부근(Y=1.0) 감쇠 범위를 0.65까지 깊게 조절하여 갓 안쪽으로 들어갈수록 은은히 사라지게 합니다.
          float heightFade = smoothstep(0.0, 0.35, vUv.y) * smoothstep(1.0, 0.65, vUv.y);

          // 2. [전체 볼륨 두께 복원 - 프레넬 감쇠 지수 대폭 완화]
          // 빛 실린더 외곽 옆면 테두리가 너무 얇게 쪼그라드는 현상을 완벽히 해결하기 위해
          // 프레넬 감쇠 지수를 1.5로 낮추어, 풍성한 안개 기둥의 전체 3D 덩어리감을 완전히 확보합니다.
          vec3 normal = normalize(vNormal);
          vec3 viewDir = normalize(vViewPosition);
          float edgeFade = pow(abs(dot(normal, viewDir)), 1.5); 

          // 3. [이음새 세로선 해결 - 3D 로컬 공간 회전 왜곡 왜용]
          // UV 경계면 끊김 현상(세로줄)을 해결하기 위해 3D 로컬 좌표에 직접 회전 왜곡을 주어 파동을 연산합니다.
          // Y축 높이에 따라 리드미컬하게 비틀어지는 나선형 왜곡 계산
          float distortionFactor = 0.3 * sin(uTime * 1.2 + vPosition.y * 3.0) * (1.0 - vUv.y);
          float cosD = cos(distortionFactor);
          float sinD = sin(distortionFactor);
          
          vec2 rotPos = vec2(
            vPosition.x * cosD - vPosition.z * sinD,
            vPosition.x * sinD + vPosition.z * cosD
          );

          float speed = uTime * 0.45;
          float wave1 = sin(rotPos.x * 2.8 + speed) * 0.5 + 0.5;
          float wave2 = cos(rotPos.y * 3.2 - speed * 0.6) * 0.5 + 0.5;
          float wave3 = noise(vec2(rotPos.x * 2.0 - speed * 0.2, vPosition.y * 1.5)) * 0.6;
          
          float rawRay = wave1 * 0.36 + wave2 * 0.36 + wave3 * 0.28;
          
          // [노이즈 평탄화] smoothstep의 쨍한 얼룩 대비를 제거하고 전체가 부드러운 안개로 고르게 채워지도록 보완
          float rayStrength = mix(0.35, 0.95, rawRay);

          // 4. [풍성하게 쏟아지는 빛줄기 및 다크모드 페이드 연동]
          // 다크모드 활성화 값(uActivated)을 곱해 부드럽게 점등되게 제어하며,
          // 전등 아래로 확실하게 쏟아지는 무드 연출을 위해 불투명도를 평소 0.28, 호버 시 0.45로 상향 조정합니다.
          float targetOpacity = uHovered > 0.5 ? 0.45 : 0.28;
          float baseOpacity = targetOpacity * uActivated;
          
          // 기저 안개 밀도 오프셋을 0.15로 든든히 부여하여 속이 빈 느낌을 제거하고 풍부하게 전체를 채웁니다.
          float finalAlpha = (0.15 + rayStrength * 0.85) * heightFade * edgeFade * baseOpacity;

          // 노란색 억제 및 고급 백진주 웜화이트 믹싱
          vec3 softPearlWhite = vec3(1.0, 0.96, 0.91);
          vec3 mixedColor = mix(uColor, softPearlWhite, 0.62); // 웜화이트 62%
          
          // 전체 광원의 채도 및 조도를 아날로그 촛불처럼 편안한 감도로 소폭 감압
          vec3 finalColor = mixedColor * (0.85 + rayStrength * 0.25);

          gl_FragColor = vec4(finalColor, finalAlpha);
        }
      `,
      uniforms: {
        uTime: { value: 0 },
        uColor: { value: new THREE.Color('#F3EDE4') }, // 은은하고 차분한 아이보리 웜화이트로 베이스 톤 변경
        uHovered: { value: 0 },
        uActivated: { value: 0 } // 다크모드 점등 제어 유니폼
      },
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide
    });
  }, []);

  // 호버 및 다크모드 활성화 시 글로우·라이트·스케일 및 3D 셰이더 유니폼 부드럽게 전환
  useFrame((state, delta) => {
    const speed = delta * 6;
    const elapsed = state.clock.getElapsedTime();
    const activeTarget = isActivated ? 1.0 : 0.0;

    // 💡 셰이더에 실시간 경과 시간 및 호버링, 다크모드 점등 유니폼 동적 바인딩
    if (rayShaderMaterial) {
      rayShaderMaterial.uniforms.uTime.value = elapsed;
      rayShaderMaterial.uniforms.uHovered.value = THREE.MathUtils.lerp(
        rayShaderMaterial.uniforms.uHovered.value,
        hovered ? 1.0 : 0.0,
        speed
      );
      rayShaderMaterial.uniforms.uActivated.value = THREE.MathUtils.lerp(
        rayShaderMaterial.uniforms.uActivated.value,
        activeTarget,
        delta * 3.5 // 다크모드 전환 시 2~3초에 걸쳐 스르륵 빛이 차오르도록 함
      );
    }

    // 내부 글로우 opacity (다크모드가 켜졌을 때만 은은하게 밝혀짐)
    if (innerRef.current) {
      const targetInnerOpacity = isActivated ? (hovered ? 0.88 : 0.45) : 0.0;
      innerRef.current.material.opacity = THREE.MathUtils.lerp(
        innerRef.current.material.opacity,
        targetInnerOpacity,
        speed
      );
    }

    // 포인트 라이트 강도 (다크모드가 켜졌을 때만 영롱하게 켜짐)
    if (lightRef.current) {
      const targetLightIntensity = isActivated ? (hovered ? 16 : 6) : 0;
      lightRef.current.intensity = THREE.MathUtils.lerp(
        lightRef.current.intensity,
        targetLightIntensity,
        speed
      );
    }

    // 그룹 스케일 (살짝 팽창)
    if (groupRef.current) {
      const target = hovered ? 1.07 : 1.0;
      groupRef.current.scale.setScalar(
        THREE.MathUtils.lerp(groupRef.current.scale.x, target, speed)
      );
    }
  });

  return (
    <group
      ref={groupRef}
      position={[0, 0, 0]}
      onPointerOver={onPointerOver}
      onPointerOut={onPointerOut}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
    >
      {/* 갓 외형 */}
      <mesh geometry={shadeGeom} position={[0, 0, 0]}>
        <meshPhysicalMaterial
          color="#E29543"
          side={THREE.DoubleSide}
          roughness={0.4}
          metalness={0.2}
          transparent
          opacity={0.92}
        />
      </mesh>

      {/* 내부 글로우 */}
      <mesh ref={innerRef} geometry={innerGeom} position={[0, 0, 0]}>
        <meshBasicMaterial
          color="#FFD090"
          side={THREE.BackSide}
          transparent
          opacity={0.5}
        />
      </mesh>

      {/* 하단 링 */}
      <mesh geometry={ringGeom} position={[0, -0.55, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <meshStandardMaterial color="#E29543" roughness={0.3} metalness={0.5} />
      </mesh>

      {/* 상단 링 */}
      <mesh geometry={topRingGeom} position={[0, 0.55, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <meshStandardMaterial color="#C07020" roughness={0.3} metalness={0.5} />
      </mesh>

      {/* 빛 투사 원뿔 - 갓 내부 안쪽 깊은 곳에서부터 스며 나오도록 Y위치 상향 조정 */}
      <mesh ref={coneRef} geometry={coneGeom} position={[0, -1.5, 0]} material={rayShaderMaterial} />

      {/* 광원 */}
      <pointLight ref={lightRef} color="#FFD090" intensity={6} distance={8} decay={2} position={[0, -0.3, 0]} />
    </group>
  );
}

/* ── 물리 밴드 + 조명 ── */
function Band({ isActivated = false, maxSpeed = 50, minSpeed = 10 }) {
  const band = useRef();
  const fixed = useRef();
  const j1 = useRef();
  const j2 = useRef();
  const j3 = useRef();
  const lamp = useRef();

  const vec = new THREE.Vector3();
  const dir = new THREE.Vector3();
  const ang = new THREE.Vector3();
  const rot = new THREE.Vector3();

  const segmentProps = {
    type: 'dynamic',
    canSleep: true,
    colliders: false,
    angularDamping: 5,   // 8 → 5: 너무 뻣뻣하지 않게
    linearDamping: 5,
  };

  const lanyardTex = useMemo(() => createLanyardTexture(), []);

  const [curve] = useState(
    () =>
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(),
        new THREE.Vector3(),
        new THREE.Vector3(),
        new THREE.Vector3(),
        new THREE.Vector3(),
      ])
  );

  const [dragged, drag] = useState(false);
  const [hovered, hover] = useState(false);

  // 조인트: 줄 4마디
  useRopeJoint(fixed, j1, [[0, 0, 0], [0, 0, 0], 1]);
  useRopeJoint(j1, j2, [[0, 0, 0], [0, 0, 0], 1]);
  useRopeJoint(j2, j3, [[0, 0, 0], [0, 0, 0], 1]);
  useSphericalJoint(j3, lamp, [[0, 0, 0], [0, 0.55, 0]]); // 갓 상단면에 맞춤

  useEffect(() => {
    if (hovered) {
      document.body.style.cursor = dragged ? 'grabbing' : 'grab';
      return () => void (document.body.style.cursor = 'auto');
    }
  }, [hovered, dragged]);

  useFrame((state, delta) => {
    if (dragged) {
      // X/Y만 이동 (Z 고정)
      vec.set(state.pointer.x, state.pointer.y, 0.3).unproject(state.camera);
      dir.copy(vec).sub(state.camera.position).normalize();
      // Z를 0으로 고정하는 방향으로 레이캐스트
      const t = -state.camera.position.z / dir.z;
      vec.copy(state.camera.position).addScaledVector(dir, t);

      [lamp, j1, j2, j3, fixed].forEach(ref => ref.current?.wakeUp());
      lamp.current?.setNextKinematicTranslation({
        x: vec.x - dragged.x,
        y: vec.y - dragged.y,
        z: 0,
      });
    }

    // 호버 중 → 사인파 임펄스로 부드러운 진자 흔들림
    if (hovered && !dragged && lamp.current) {
      const t = state.clock.elapsedTime;
      // 주기 ~4초(1.57 rad/s), 진폭은 delta로 프레임 독립적 유지
      const swayX = Math.sin(t * 1.57) * 4.5 * delta;
      lamp.current.wakeUp();
      lamp.current.applyImpulse({ x: swayX, y: 0, z: 0 }, true);
    }

    if (fixed.current) {
      // lerped 스무딩 적용
      [j1, j2, j3].forEach(ref => {
        if (!ref.current) return;
        if (!ref.current.lerped)
          ref.current.lerped = new THREE.Vector3().copy(ref.current.translation());
        const dist = Math.max(0.05, Math.min(1, ref.current.lerped.distanceTo(ref.current.translation())));
        ref.current.lerped.lerp(ref.current.translation(), delta * (minSpeed + dist * (maxSpeed - minSpeed)));
        // Z를 0으로 고정
        ref.current.lerped.z = 0;
      });

      // 커브 포인트 업데이트 (5점 — 실제 물리 위치만 사용, 가공 중간점 없음)
      const lampPos = lamp.current?.translation();
      const j3Pos = j3.current?.lerped;
      const j2Pos = j2.current?.lerped;
      const j1Pos = j1.current?.lerped;
      const fixedPos = fixed.current?.translation();

      if (lampPos && j3Pos && j2Pos && j1Pos && fixedPos) {
        curve.points[0].set(lampPos.x, lampPos.y + 0.55, 0); // 갓 상단면
        curve.points[1].copy(j3Pos).setZ(0);
        curve.points[2].copy(j2Pos).setZ(0);
        curve.points[3].copy(j1Pos).setZ(0);
        curve.points[4].set(fixedPos.x, fixedPos.y, 0);      // 천장 고정점
        band.current.geometry.setPoints(curve.getPoints(64));
      }

      // 각도 안정화
      if (ang && rot && lamp.current) {
        ang.copy(lamp.current.angvel());
        rot.copy(lamp.current.rotation());
        lamp.current.setAngvel({ x: ang.x, y: ang.y - rot.y * 0.25, z: ang.z });
      }
    }
  });

  curve.curveType = 'chordal';

  return (
    <>
      {/* 고정점 (천장) */}
      <group position={[0, 4.5, 0]}>
        <RigidBody ref={fixed} {...segmentProps} type="fixed" />

        {/* 줄 마디 1 */}
        <RigidBody position={[0, -0.8, 0]} ref={j1} {...segmentProps}>
          <BallCollider args={[0.08]} />
        </RigidBody>

        {/* 줄 마디 2 */}
        <RigidBody position={[0, -1.6, 0]} ref={j2} {...segmentProps}>
          <BallCollider args={[0.08]} />
        </RigidBody>

        {/* 줄 마디 3 */}
        <RigidBody position={[0, -2.4, 0]} ref={j3} {...segmentProps}>
          <BallCollider args={[0.08]} />
        </RigidBody>

        {/* 조명 갓 */}
        <RigidBody
          position={[0, -3.5, 0]}
          ref={lamp}
          {...segmentProps}
          type={dragged ? 'kinematicPosition' : 'dynamic'}
          lockTranslations={false}
        >
          <CuboidCollider args={[1.1, 0.7, 0.01]} />
          <LampShade
            isActivated={isActivated}
            dragged={dragged}
            hovered={hovered}
            onPointerOver={() => hover(true)}
            onPointerOut={() => hover(false)}
            onPointerUp={e => {
              e.target.releasePointerCapture(e.pointerId);
              drag(false);
            }}
            onPointerDown={e => {
              e.target.setPointerCapture(e.pointerId);
              const lampTrans = lamp.current?.translation();
              drag(
                new THREE.Vector3(
                  e.point.x - (lampTrans?.x ?? 0),
                  e.point.y - (lampTrans?.y ?? 0),
                  0
                )
              );
            }}
          />
        </RigidBody>
      </group>

      {/* 줄 메시 — 얇은 단색 전선 */}
      <mesh ref={band}>
        <meshLineGeometry />
        <meshLineMaterial
          color="#E8E4DC"
          depthTest={false}
          resolution={[1000, 1000]}
          lineWidth={0.04}
        />
      </mesh>
    </>
  );
}

/* ── 메인 컴포넌트 ── */
export default function KineticLamp({
  isActivated = false,
  position = [0, 0, 20],
  gravity = [0, -30, 0],
  fov = 18,
}) {
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== 'undefined' && window.innerWidth < 768
  );

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="kinetic-lamp-wrapper">
      <Canvas
        camera={{ position, fov }}
        dpr={[1, isMobile ? 1.5 : 2]}
        gl={{ alpha: true }}
        onCreated={({ gl }) => gl.setClearColor(new THREE.Color(0x000000), 0)}
      >
        <ambientLight intensity={1.2} />
        <directionalLight position={[2, 4, 3]} intensity={1.5} color="#fff8e8" />

        <Physics gravity={gravity} timeStep={1 / 60}>
          <Band isActivated={isActivated} />
        </Physics>

        <Environment preset="city" />
      </Canvas>
    </div>
  );
}
