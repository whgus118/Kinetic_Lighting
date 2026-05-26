# 💡 Levité - Kinetic Lighting (3D 인터랙티브 랜딩 페이지)

> "빛이 형태를 바꾸어 흐를 때, 당신의 지친 공간은 영감이 됩니다."
> 압도적인 시각적 해방감을 선사하는 하이엔드 키네틱 라이팅 브랜드 '레비테'의 공식 프로모션 웹사이트입니다.

## 1. 프로젝트 소개

- **설명:** WebGL과 물리 엔진을 활용하여 '키네틱 라이팅(Kinetic Lighting)' 제품의 철학과 가치를 시각적, 물리적으로 체험할 수 있도록 설계된 하이엔드 3D 인터랙티브 랜딩 페이지입니다. 단순한 정보 전달을 넘어, 마우스 움직임과 스크롤에 동기화되는 3D 오브제와 셰이더를 통해 사용자에게 몰입감 있는 공간 투사 경험을 제공합니다.
- **진행 기간:** 2026.05.19 ~ 2026.05.25 (6일)
- **개발 인원:** 개인 프로젝트 (기여도 100%)

## 2. 배포 및 관련 링크

- **Live Demo:** [배포된 웹사이트 링크 입력](https://whgus118.github.io/Kinetic_Lighting/)
- **GitHub Repository:** [깃허브 링크 입력](https://github.com/whgus118/Kinetic_Lighting)
- **관련 문서:** [docs/PRD.md](./docs/PRD.md) (상세 기획 및 모션 플로우 문서)

---

## 3. 사용 기술 스택

### Frontend

- **React.js & Vite:** 빠른 HMR 및 컴포넌트 기반 아키텍처 구축
- **Vanilla CSS:** CSS Variables(`variables.css`) 기반의 세밀한 디자인 시스템 통제

### 3D & Animation

- **Three.js (@react-three/fiber, @react-three/drei):** WebGL 기반의 3D 조명 오브제 모델링 및 3단계 우주적 셰이더(Galaxy, Orb, Liquid Chrome) 렌더링
- **Rapier (@react-three/rapier):** 3D 조명 오브제에 실제 질량, 관성, 스프링 바운스를 부여하는 실시간 물리 엔진
- **Lenis:** 60fps 감속 미끄러짐을 구현하는 하드웨어 가속 스크롤 스무딩
- **Framer Motion / CountUp:** 유려한 UI 트랜지션 및 동적 타임라인 애니메이션

### 🤖 AI-Assisted Development (Vibe Coding)

- **Google Gemini / Antigravity:** 프론트엔드 페어 프로그래밍 AI 파트너. 기획서(PRD)와 실제 코드 간의 불일치를 분석하고 팩트 체크하여, 최신 WebGL 구현 스펙으로 문서를 역기획 및 완벽 동기화. 아키텍처 분리(디자인 토큰 분리) 제안 및 리팩토링 주도.

---

## 4. 사용자 작업 흐름 (핵심 모션 뷰포트)

1. **Hero Section:** 시네마틱 비디오 렌더링 및 마우스 이동 경로에 반응하는 Image Trail 인터랙션
2. **Timeline Shade (Eclipse):** 특정 뷰포트 진입 시 배경이 완벽히 암전되며, 중앙의 3D 조명이 켜짐. 마우스 드래그로 조명을 물리적으로 흔들 수 있는 피지컬 인터랙션 경험.
3. **Space Projection:** 스크롤 깊이에 따라 우주 파티클(Galaxy) ➔ 빛의 구체(Orb) ➔ 유체(LiquidChrome) 순으로 거대 WebGL 배경이 크로스페이드(Cross-fade) 됨.
4. **Trust & Engineering:** SVG 코드로 정교하게 렌더링된 정밀 기구 단면도와 맞춤형 기하학(⊙) 커서 반응.
5. **Close & CTA:** 앰버 빛이 차오르는 고스트(Ghost) CTA 버튼 글로우 애니메이션.

---

## 5. AI 활용 및 개발 워크플로우 (Vibe Coding)

생성형 AI를 적극적으로 활용하여 3D 인터랙티브 웹 개발의 생산성을 극대화했습니다.

- **초기 보일러플레이트 구성:** 복잡한 WebGL 및 Three.js 렌더링 환경 세팅 시 AI의 코드 제안을 활용하여 초기 구조(Scene, Canvas 등)를 빠르게 구축하여 개발 시간을 단축했습니다.
- **물리 연산 디버깅:** Rapier 물리 엔진을 도입해 3D 조명에 관성 및 바운스 효과를 부여하는 과정에서 발생하는 상태 충돌 문제를 AI와 함께 디버깅하며 로직을 최적화했습니다.
- **모션 최적화 피드백:** 스크롤 스무딩(Lenis)과 WebGL 인터랙션 간의 매끄러운 동기화, 그리고 모바일 환경에서의 렌더링 부하 방지 방안에 대해 AI의 코드 리뷰를 거쳐 완성도를 높였습니다.

---

## 6. 핵심 구현 기능

- **물리 엔진 기반 3D 인터랙션:** 단순 CSS 3D 회전을 뛰어넘어, 사용자가 마우스로 직접 잡고 흔들 때 관성과 중력이 적용되는 `KineticLamp` 오브제 구현.
- **고도화된 WebGL 셰이더 스크롤링:** 브라우저 스크롤 스무딩(Lenis)과 WebGL 렌더링을 1:1로 결합하여 3단계(Galaxy➔Orb➔LiquidChrome)로 전환되는 압도적인 시각적 몰입감 제공.
- **모바일 렌더링 최적화 (Responsive):** 768px 미만 진입 시 연산량이 많은 42px 정밀 커스텀 커서를 차단(`display: none`)하고, 복합 스펙표를 단일 열(Single Column)로 가변 변환하여 모바일 GPU 오버헤드 방지.

---

## 7. 디렉토리 구조

```text
src
├── assets/                 # 시네마틱 비디오(webm) 및 정적 이미지 리소스
├── components/
│   ├── Navigation.jsx      # 상단 GNB 및 로고 컨트롤
│   ├── Hero.jsx            # 첫 진입 타이틀 및 앰버 비디오 트레일 뷰포트
│   ├── ImageTrail.jsx      # 마우스 포인터 궤적을 쫓는 시네마틱 이미지 트레일 로직
│   ├── ScrollBridge.jsx    # WebGL 셰이더(Galaxy ➔ Orb ➔ LiquidChrome) 크로스페이드 관장
│   ├── TimelineShade.jsx   # 스크롤 암전(Eclipse) 제어 및 3D 조명 마운트 뷰
│   ├── KineticLamp.jsx     # Rapier 기반 3D 조명 물리(관성/바운스) 렌더링 컴포넌트
│   ├── TrustSpecs.jsx      # SVG 기반 정밀 기구 단면도 렌더링 영역
│   ├── CloseCTA.jsx        # 하단 앰버 글로우를 뿜는 고스트 CTA 버튼 
│   ├── CursorGlow.jsx      # 맞춤형 기하학(⊙) 마우스 커서 및 트랜지션
│   ├── Galaxy.jsx, Orb.jsx, LiquidChrome.jsx # Three.js 기반 3D 셰이더 에셋
│   └── (기타 마이크로 인터랙션 컴포넌트들...)
├── styles/
│   ├── variables.css       # 폰트, 색상, 레이아웃 등 글로벌 디자인 토큰 분리
│   └── global.css          # CSS 리셋 및 기본 타이포그래피 설정
├── App.jsx                 # Lenis 스크롤 스무딩 래퍼 및 전체 컴포넌트 배치
└── main.jsx                # React 앱 진입점 및 CSS import
```

---

## 8. 회고 및 인사이트

**[CSS 한계를 넘은 완벽한 피지컬 인터랙션]**
초기 기획은 CSS `transform`을 활용한 단순한 조명 조작이었으나, 실제 마찰력과 질감을 표현하기 위해 Three.js와 Rapier 물리 엔진을 과감하게 도입했습니다. 결과적으로 웹 브라우저 안에서도 실제 제품을 만지는 듯한 압도적인 사용자 경험을 창출할 수 있었습니다.

**[AI 파트너와의 완벽한 동기화 협업]**
기획과 구현이 파편화되기 쉬운 실무 환경에서, AI를 활용해 실제 코드 스펙(WebGL, Rapier 등)과 문서(PRD)를 한 치의 오차 없이 팩트 체크하는 작업을 수행했습니다. 더 나아가 CSS 아키텍처 리팩토링까지 주도적으로 논의하며, Vibe Coding이 단순한 코드 자동 생성을 넘어 프로덕트의 '설계적 품질'까지 끌어올릴 수 있음을 깊이 체감했습니다.