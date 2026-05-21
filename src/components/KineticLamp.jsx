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

/* ── 빛 원뿔 페이드 텍스잘: apex(위) → base(아래) 흰→검 alphaMap ── */
function createConeGradientTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  // canvas Y=0 → UV V=1(apex, 래프 위쪽) → 는림한 흩(opaque)
  // canvas Y=127 → UV V=0(base, 아래끝) → 검정(transparent)
  const grad = ctx.createLinearGradient(0, 0, 0, 128);
  grad.addColorStop(0,    '#ffffff'); // apex: visible
  grad.addColorStop(0.55, '#cccccc'); // 중간: 조금 흙해짐
  grad.addColorStop(1,    '#000000'); // base: 완전 투명
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 1, 128);
  return new THREE.CanvasTexture(canvas);
}
/* ── 조명 갓 3D 메시 ── */
function LampShade({ dragged, hovered, onPointerOver, onPointerOut, onPointerDown, onPointerUp }) {
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

  // 빛 투사 원뿔
  const coneGeom = useMemo(() => {
    return new THREE.ConeGeometry(2.2, 3.0, 32, 1, true);
  }, []);

  // 빛 원뿔 그라디언트 alphaMap (apex=낙담 → base=투명)
  const coneTex = useMemo(() => createConeGradientTexture(), []);

  // 호버 시 글로우·라이트·스케일 부드럽게 전환
  useFrame((_, delta) => {
    const speed = delta * 6;

    // 내부 글로우 opacity
    if (innerRef.current) {
      innerRef.current.material.opacity = THREE.MathUtils.lerp(
        innerRef.current.material.opacity,
        hovered ? 0.88 : 0.5,
        speed
      );
    }

    // 원뿔 빛 opacity (alphaMap이 페이드를 담당, 여기서는 전체 밝기 조절)
    if (coneRef.current) {
      coneRef.current.material.opacity = THREE.MathUtils.lerp(
        coneRef.current.material.opacity,
        hovered ? 0.28 : 0.14,
        speed
      );
    }

    // 포인트 라이트 강도
    if (lightRef.current) {
      lightRef.current.intensity = THREE.MathUtils.lerp(
        lightRef.current.intensity,
        hovered ? 16 : 6,
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

      {/* 빛 투사 원뿔 */}
      <mesh ref={coneRef} geometry={coneGeom} position={[0, -1.2, 0]}>
        <meshBasicMaterial
          color="#FFD090"
          transparent
          opacity={0.14}
          alphaMap={coneTex}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      {/* 광원 */}
      <pointLight ref={lightRef} color="#FFD090" intensity={6} distance={8} decay={2} position={[0, -0.3, 0]} />
    </group>
  );
}

/* ── 물리 밴드 + 조명 ── */
function Band({ maxSpeed = 50, minSpeed = 10 }) {
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
          <Band />
        </Physics>

        <Environment preset="city" />
      </Canvas>
    </div>
  );
}
