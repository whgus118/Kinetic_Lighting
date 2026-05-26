import { useEffect, useRef, useState } from "react";
import KineticLamp from "./KineticLamp";

import "./TimelineShade.css";

export default function TimelineShade() {
  const sectionRef = useRef(null);

  const [isActivated, setIsActivated] = useState(false);
  const [inView, setInView] = useState(false);
  const [isAnimationFinished, setIsAnimationFinished] = useState(false);

  const isActivatedRef = useRef(false);
  const isAnimationFinishedRef = useRef(false);
  const pinnedScrollY = useRef(null);
  const animationTimeoutRef = useRef(null);
  const touchStartY = useRef(0);
  const prevScrollY = useRef(window.scrollY); // 💡 스크롤 방향 감지용 레프 추가

  // 이벤트 핸들러가 최신 리액트 상태값을 지연 없이 참조할 수 있도록 useRef 동기화
  useEffect(() => {
    isActivatedRef.current = isActivated;
  }, [isActivated]);

  useEffect(() => {
    isAnimationFinishedRef.current = isAnimationFinished;
  }, [isAnimationFinished]);

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return;

      const rect = sectionRef.current.getBoundingClientRect();
      const viewportH = window.innerHeight;
      const currentScrollY = window.scrollY;
      
      // 스크롤 방향 판단 (아래로 내려가는 중인지 체크)
      const isScrollingDown = currentScrollY > prevScrollY.current;
      prevScrollY.current = currentScrollY;

      const visible = rect.top < viewportH && rect.bottom > 0;
      setInView(visible);

      const active = isActivatedRef.current;
      const finished = isAnimationFinishedRef.current;

      // 1. 이미 애니메이션이 다 끝난 상태인 경우
      if (finished) {
        if (rect.top > viewportH) {
          isActivatedRef.current = false;
          isAnimationFinishedRef.current = false;
          setIsActivated(false);
          setIsAnimationFinished(false);
          pinnedScrollY.current = null;
          if (window.lenis) window.lenis.start(); // 위로 올려 탈출 시 스크롤 재개 보장
        } else if (rect.bottom > 0) {
          isActivatedRef.current = true;
          setIsActivated(true);
        }
        return;
      }

      // 2. 고정 진입 판정 (상단 뷰포트 자석 밀착 범위 120px 이내로 아래 하향 이동 시)
      if (rect.top <= 120 && rect.top > -30 && !isActivatedRef.current && isScrollingDown) {
        // 💡 [개선] 다중 스크롤 이벤트 진입 방지를 위해 Ref를 즉각 선행 업데이트
        isActivatedRef.current = true;
        setIsActivated(true);
        
        const targetY = currentScrollY + rect.top;
        pinnedScrollY.current = targetY;

        // 💡 [개선] 자석 견인이 시작되는 즉시 스크롤을 막아, 견인 도중 마우스 휠 입력을 완전 봉쇄
        if (window.lenis) {
          window.lenis.stop();
        }

        // 1.6초 딜레이 + 1.2초 트랜지션 = 2.8초 후 완벽하게 끝났을 때 고정 탈출 허용
        if (animationTimeoutRef.current) clearTimeout(animationTimeoutRef.current);
        animationTimeoutRef.current = setTimeout(() => {
          isAnimationFinishedRef.current = true; // 💡 Ref 즉각 동기화
          setIsAnimationFinished(true);
          if (window.lenis) {
            window.lenis.start(); // 락 해제 후 관성 스크롤 부드럽게 재개
          }
        }, 2800);

        // Lenis 엔진을 사용해 고정 좌표로 부드러운 자석형 밀착 흡수
        if (window.lenis) {
          window.lenis.scrollTo(targetY, {
            duration: 0.9,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // 부드럽고 묵직한 이싱
          });
        }
      }

      // 3. 브라우저 물리 스크롤 강제 보정 백업 (드래그 탈출 방지용)
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
        // 애니메이션 진행 중일 때 아래 방향 휠 스크롤은 완전히 차단
        if (e.deltaY > 0) {
          e.preventDefault();
        } else if (e.deltaY < -8) {
          // 사용자가 적극적으로 위로 올리는 상향 탈출 동작 감지 시 즉시 모든 상태를 동기적으로 롤백
          isActivatedRef.current = false;
          isAnimationFinishedRef.current = false;
          setIsActivated(false);
          setIsAnimationFinished(false);
          pinnedScrollY.current = null;
          if (animationTimeoutRef.current) clearTimeout(animationTimeoutRef.current);
          if (window.lenis) {
            window.lenis.start(); // 상방 역탈출 즉시 스크롤러 복원
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
        const touchCurrentY = e.touches[0].clientY;
        const diffY = touchStartY.current - touchCurrentY; // 양수이면 화면을 위로 올리는 스크롤 동작
        if (diffY > 0) {
          e.preventDefault();
        } else if (diffY < -8) {
          // 적극적인 위 쓸어내리기(상방 이동) 감지 시 즉시 역탈출 동기식 복원
          isActivatedRef.current = false;
          isAnimationFinishedRef.current = false;
          setIsActivated(false);
          setIsAnimationFinished(false);
          pinnedScrollY.current = null;
          if (animationTimeoutRef.current) clearTimeout(animationTimeoutRef.current);
          if (window.lenis) {
            window.lenis.start(); // 스크롤러 즉각 복원
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: false });
    window.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: false });

    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      if (animationTimeoutRef.current) clearTimeout(animationTimeoutRef.current);
      if (window.lenis) {
        window.lenis.start(); // 컴포넌트 언마운트 시 스크롤 안전 복원
      }
    };
  }, []);

  // 스크롤 활성화 여부에 따른 고정 비율 (0 또는 1)

  const scrollRatio = isActivated ? 1 : 0;
  
  // 글로벌 테마 연동을 위해 0~1 값을 CSS 변수로 주입 (Scroll text 색상 동기화용)
  useEffect(() => {
    document.documentElement.style.setProperty('--global-timeline-ratio', scrollRatio);
    return () => {
      document.documentElement.style.removeProperty('--global-timeline-ratio');
    };
  }, [scrollRatio]);

  // 비율에 따른 파생 스타일 (텍스트, 배경 등에 적용)
  const clipRadius = 8 + scrollRatio * 92; // 8% ~ 100%

  const bgOpacity = scrollRatio; // 0 ~ 1

  const textOpacity = Math.min(1, scrollRatio * 2.5);

  // 이클립스 오버레이: 섹션이 뷰포트에 있을 때만 표시

  const eclipseOpacity = inView ? bgOpacity : 0;

  return (
    <section
      ref={sectionRef}
      id="section-timeline-shade"
      className={`timeline section-light ${isActivated ? "active" : ""}`}
      aria-label="이클립스 명도 반전 섹션"
      style={{ "--scroll-ratio": scrollRatio }}
    >
      {/* 이클립스 오버레이 — 아이보리에서 어비스로 */}

      <div
        className="timeline__eclipse"
        style={{
          clipPath: `circle(${clipRadius}% at 50% 40%)`,

          opacity: eclipseOpacity,
        }}
        aria-hidden="true"
      />

      <div className="timeline__inner">
        {/* 좌측: 고정 텍스트 */}

        <div className={`timeline__text ${inView ? "visible" : ""}`}>
          <div className="timeline__label">
            <span className="timeline__label-num">03</span>

            <span className="timeline__label-divider" />

            <span>PRODUCT VALUE 01</span>
          </div>

          <h2
            className="timeline__headline title-serif"
            style={{
              color: `rgb(${Math.round(27 + (209 - 27) * scrollRatio)}, ${Math.round(43 + (220 - 43) * scrollRatio)}, ${Math.round(34 + (214 - 34) * scrollRatio)})`,
            }}
          >
            빛을 물리적으로
            <br />
            닫는 순간,
            <br />
            <em className="timeline__headline-em">
              비로소 당신만의
              <br />
              안전한 시간이
              <br />
              시작됩니다.
            </em>
          </h2>

          <div className="timeline__features">
            {[
              {
                icon: "◎",
                label: "키네틱 갓 폴딩",
                desc: "물리적으로 닫히는 조명 갓",
              },

              {
                icon: "◑",
                label: "이클립스 반전",
                desc: "공간을 완전히 차단하는 암전",
              },

              {
                icon: "◐",
                label: "아날로그 의식",
                desc: "스크롤로 경험하는 전환 의식",
              },
            ].map((feat, i) => (
              <div key={i} className="timeline__feature-item">
                <span className="timeline__feature-icon">{feat.icon}</span>

                <div>
                  <strong>{feat.label}</strong>

                  <span>{feat.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 우측: 물리 기반 3D 조명 오브제 */}

        <div className="timeline__lamp-wrap">

          <KineticLamp
            isActivated={isActivated}
            position={[0, 0, 20]}
            gravity={[0, -30, 0]}
            fov={18}
          />
        </div>
      </div>


    </section>
  );
}
