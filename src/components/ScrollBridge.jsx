import { useEffect, useRef, useState } from 'react';
import './ScrollBridge.css';
import Galaxy from './Galaxy';
import ScrollReveal from './ScrollReveal';
import Magnet from './Magnet';
import Orb from './Orb';
import LiquidChrome from './LiquidChrome';

export default function ScrollBridge() {
  const containerRef = useRef(null);
  
  const [isActivated, setIsActivated] = useState(false);
  const [isAnimationFinished, setIsAnimationFinished] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);

  const HEADLINE_LINES = [
    "어둠이 가라앉은 깊은 침묵 속에서,",
    <em key="em" className="ripple__headline-em">일렁이는 조형 예술이 깨어납니다.</em>,
  ];

  const isActivatedRef = useRef(false);
  const isAnimationFinishedRef = useRef(false);
  const stepIndexRef = useRef(0);
  const isCooldown = useRef(false);

  const pinnedScrollY = useRef(null);
  const animationTimeoutRef = useRef(null);
  const touchStartY = useRef(0);
  const prevScrollY = useRef(window.scrollY);

  // 리스너가 리액트 상태값을 실시간으로 인지할 수 있도록 ref 동기화
  useEffect(() => {
    isActivatedRef.current = isActivated;
  }, [isActivated]);

  useEffect(() => {
    isAnimationFinishedRef.current = isAnimationFinished;
  }, [isAnimationFinished]);

  useEffect(() => {
    stepIndexRef.current = stepIndex;
  }, [stepIndex]);

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const currentScrollY = window.scrollY;
      
      const isScrollingDown = currentScrollY > prevScrollY.current;
      prevScrollY.current = currentScrollY;

      const active = isActivatedRef.current;
      const finished = isAnimationFinishedRef.current;

      // 1. 이미 고정 연출 및 탈출이 완료된 상태인 경우
      if (finished) {
        if (rect.top > window.innerHeight) {
          // 위로 역스크롤 시 화면을 완전히 벗어났을 때만 초기 상태 복원
          isActivatedRef.current = false;
          isAnimationFinishedRef.current = false;
          setIsActivated(false);
          setIsAnimationFinished(false);
          setStepIndex(1);
          stepIndexRef.current = 1;
          pinnedScrollY.current = null;
          if (window.lenis) window.lenis.start();
        } else if (rect.bottom < 0) {
          // 아래로 스크롤하며 영역을 완전히 벗어날 때 페이드아웃
          if (isActivatedRef.current) {
            isActivatedRef.current = false;
            setIsActivated(false);
          }
        } else {
          // 역스크롤로 화면에 다시 진입했을 때(rect.top <= window.innerHeight && rect.bottom >= 0)
          // 빈 화면이 보이지 않도록 마지막 스텝(3) 상태를 활성화
          if (!isActivatedRef.current) {
            isActivatedRef.current = true;
            setIsActivated(true);
            setStepIndex(3);
            stepIndexRef.current = 3;
          }
        }
        return;
      }

      // 2. 자석 고정 진입 판정
      const triggerPoint = 400;
      
      if (rect.top <= triggerPoint && rect.top > -100 && !active && isScrollingDown) {
        isActivatedRef.current = true;
        setIsActivated(true);
        // 이동이 진행되는 1.2초 동안은 0단계로 두어 효과 노출을 방지
        setStepIndex(0);
        stepIndexRef.current = 0;

        const targetY = currentScrollY + rect.top;
        pinnedScrollY.current = targetY;

        if (window.lenis) {
          window.lenis.stop();
        }

        // 텍스트 애니메이션(최대 1.5s 딜레이 + 트랜지션)이 거의 끝날 무렵인 2.2초 시점에 배경 효과를 시작합니다.
        isCooldown.current = true;
        if (animationTimeoutRef.current) clearTimeout(animationTimeoutRef.current);
        animationTimeoutRef.current = setTimeout(() => {
          isCooldown.current = false;
          setStepIndex(1);
          stepIndexRef.current = 1;
        }, 2200);

        // 자석형 부드러운 위치 수렴
        if (window.lenis) {
          window.lenis.scrollTo(targetY, {
            duration: 1.2,
            easing: (t) => {
              // easeOutBack 함수: 목표 지점을 살짝 넘었다가(overshoot) 돌아오는 바운스 효과
              const c1 = 2.0; // 텐션 조절 (값이 클수록 더 많이 튀어오름)
              const c3 = c1 + 1;
              return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
            },
          });
        }
      }

      // 3. 물리 스크롤 강제 고정 보정
      if (isActivatedRef.current && !isAnimationFinishedRef.current && pinnedScrollY.current !== null) {
        if (Math.abs(currentScrollY - pinnedScrollY.current) > 2) {
          window.scrollTo(0, pinnedScrollY.current);
        }
      }
    };

    const handleWheel = (e) => {
      const active = isActivatedRef.current;
      const finished = isAnimationFinishedRef.current;

      if (active && !finished) {
        e.preventDefault(); // 고정 중 스크롤 기본 동작 차단
        
        if (isCooldown.current) return;

        if (e.deltaY > 15) {
          // 아래로 스크롤 시 스텝 증가
          if (stepIndexRef.current < 3) {
            isCooldown.current = true;
            const nextStep = stepIndexRef.current + 1;
            setStepIndex(nextStep);
            stepIndexRef.current = nextStep;
            setTimeout(() => { isCooldown.current = false; }, 900); // 0.9초 쿨다운
          } else {
            // 마지막 스텝에서 스크롤 시 탈출
            isActivatedRef.current = false;
            isAnimationFinishedRef.current = true;
            setIsAnimationFinished(true);
            if (window.lenis) window.lenis.start();
          }
        } else if (e.deltaY < -15) {
          // 위로 역스크롤 시 스텝 감소 및 역탈출
          if (stepIndexRef.current > 1) {
            isCooldown.current = true;
            const prevStep = stepIndexRef.current - 1;
            setStepIndex(prevStep);
            stepIndexRef.current = prevStep;
            setTimeout(() => { isCooldown.current = false; }, 900);
          } else {
            // 첫 스텝에서 위로 스크롤 시 역방향 완전 탈출
            isActivatedRef.current = false;
            isAnimationFinishedRef.current = false;
            setIsActivated(false);
            setIsAnimationFinished(false);
            setStepIndex(0);
            stepIndexRef.current = 0;
            pinnedScrollY.current = null;
            if (animationTimeoutRef.current) clearTimeout(animationTimeoutRef.current);
            if (window.lenis) window.lenis.start();
          }
        }
      }
    };

    const handleTouchStart = (e) => {
      touchStartY.current = e.touches[0].clientY;
    };

    const handleTouchMove = (e) => {
      const active = isActivatedRef.current;
      const finished = isAnimationFinishedRef.current;

      if (active && !finished) {
        e.preventDefault();
        
        if (isCooldown.current) return;

        const touchCurrentY = e.touches[0].clientY;
        const diffY = touchStartY.current - touchCurrentY;

        if (diffY > 15) {
          // 아래로 터치 스크롤
          if (stepIndexRef.current < 3) {
            isCooldown.current = true;
            const nextStep = stepIndexRef.current + 1;
            setStepIndex(nextStep);
            stepIndexRef.current = nextStep;
            setTimeout(() => { isCooldown.current = false; }, 900);
          } else {
            isActivatedRef.current = false;
            isAnimationFinishedRef.current = true;
            setIsAnimationFinished(true);
            if (window.lenis) window.lenis.start();
          }
        } else if (diffY < -15) {
          // 위로 터치 역스크롤
          if (stepIndexRef.current > 1) {
            isCooldown.current = true;
            const prevStep = stepIndexRef.current - 1;
            setStepIndex(prevStep);
            stepIndexRef.current = prevStep;
            setTimeout(() => { isCooldown.current = false; }, 900);
          } else {
            isActivatedRef.current = false;
            isAnimationFinishedRef.current = false;
            setIsActivated(false);
            setIsAnimationFinished(false);
            setStepIndex(0);
            stepIndexRef.current = 0;
            pinnedScrollY.current = null;
            if (animationTimeoutRef.current) clearTimeout(animationTimeoutRef.current);
            if (window.lenis) window.lenis.start();
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: false });
    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      if (animationTimeoutRef.current) clearTimeout(animationTimeoutRef.current);
      if (window.lenis) window.lenis.start();
    };
  }, []);

  return (
      <section
        ref={containerRef}
        id="section-scroll-bridge"
        className={`scroll-bridge ${isActivated ? 'active' : ''} ${isAnimationFinished ? 'finished' : ''}`}
        data-step={stepIndex}
        aria-label="인터랙티브 스크롤 브릿지"
      >
        <div className="scroll-bridge__sticky-wrapper">
        
        {/* ── 💡 [개발자 커스텀 배경 효과 전용 공간] ── */}
        <div className="scroll-bridge__custom-effects" aria-hidden="true">
          <div className="scroll-bridge__guide-glow" />
          <div className={`scroll-bridge__galaxy-layer ${isActivated && stepIndex === 1 ? 'active' : ''}`}>
            <Galaxy 
              disableAnimation={!(isActivated && stepIndex === 1)}
              mouseRepulsion={true}
              mouseInteraction={true}
              density={1.5}
              glowIntensity={0.5}
              saturation={0.8}
              hueShift={240}
            />
          </div>
          <div className={`scroll-bridge__orb-layer ${isActivated && stepIndex === 2 ? 'active' : ''}`}>
            <Orb
              disableAnimation={!(isActivated && stepIndex === 2)}
              hoverIntensity={0.5}
              rotateOnHover={true}
              hue={0}
              forceHoverState={false}
              backgroundColor="transparent"
            />
          </div>
          <div className={`scroll-bridge__liquid-chrome-layer ${isActivated && stepIndex === 3 ? 'active' : ''}`}>
            <LiquidChrome
              disableAnimation={!(isActivated && stepIndex === 3)}
              baseColor={[0.1, 0.1, 0.1]}
              speed={0.35}
              amplitude={0.35}
              frequencyX={2.0}
              frequencyY={2.0}
              interactive={true}
            />
          </div>
        </div>

        <div className="scroll-bridge__intro-wrap">
            <div className="ripple__content">
              <div className={`ripple__label fade-in-up ${isActivated ? 'visible' : ''}`} style={{ transitionDelay: '0.1s' }}>
                <span className="ripple__label-num">04</span>
                <span className="ripple__label-divider" />
                <span>PRODUCT VALUE 02</span>
              </div>

              <h2 className="ripple__headline title-serif dark-serif">
                {HEADLINE_LINES.map((line, i) => (
                  <span
                    key={i}
                    className={`ripple__line fade-smudge ${isActivated ? 'visible' : ''}`}
                    style={{ transitionDelay: `${0.2 + i * 0.2}s` }}
                  >
                    {line}
                  </span>
                ))}
              </h2>

              <p className={`ripple__sub fade-in-up ${isActivated ? 'visible' : ''}`} style={{ transitionDelay: '1.0s' }}>
                앰버 필라멘트에서 발생한 빛이 조명 갓의 기하학적 패턴을 통과하여<br />
                천장과 벽에 살아 움직이는 빛의 윤슬을 투사합니다.
              </p>

              {/* 스펙 배지 */}
              <div className="ripple__specs">
                {[
                  { value: '2700K', label: '색온도' },
                  { value: '360°', label: '투사 각도' },
                  { value: '∞', label: '패턴 변주' },
                ].map((spec, i) => (
                  <div key={i} className={`ripple__spec-item fade-in-up ${isActivated ? 'visible' : ''}`} style={{ transitionDelay: `${1.2 + i * 0.15}s` }} id={`ripple-spec-${i}`}>
                    <span className="ripple__spec-value">{spec.value}</span>
                    <span className="ripple__spec-label">{spec.label}</span>
                  </div>
                ))}
              </div>
            </div>
        </div>

        {/* ── 3단계 스크롤 인디케이터 ── */}
        <div className="scroll-bridge__indicators" aria-hidden="true">
          <div className={`indicator-dot ${stepIndex === 1 ? 'active' : ''}`} />
          <div className={`indicator-dot ${stepIndex === 2 ? 'active' : ''}`} />
          <div className={`indicator-dot ${stepIndex === 3 ? 'active' : ''}`} />
        </div>
      </div>
    </section>
  );
}


