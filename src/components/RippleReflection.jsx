import { useEffect, useRef, useState } from 'react';
import './RippleReflection.css';

export default function RippleReflection() {
  const sectionRef = useRef(null);
  const [inView, setInView] = useState(false);
  const [scrollRatio, setScrollRatio] = useState(0);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { 
        threshold: 0,
        rootMargin: '0px 0px 80px 0px' 
      }
    );

    const handleScroll = () => {
      if (!sectionRef.current) return;
      const rect = sectionRef.current.getBoundingClientRect();
      const ratio = Math.max(0, Math.min(1,
        (window.innerHeight - rect.top) / (window.innerHeight + rect.height * 0.5)
      ));
      setScrollRatio(ratio);
    };

    if (sectionRef.current) observer.observe(sectionRef.current);
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="section-ripple"
      className={`ripple section-dark ${inView ? 'ripple--active' : ''}`}
      aria-label="빛의 윤슬 투사 섹션"
    >
      {/* 윤슬 레이어들 (CSS Gradient 중첩 + mix-blend-mode: screen) */}
      <div className="ripple__layers" aria-hidden="true">
        <div className="ripple__layer ripple__layer--1" />
        <div className="ripple__layer ripple__layer--2" />
        <div className="ripple__layer ripple__layer--3" />
        <div className="ripple__layer ripple__layer--4" />
        <div className="ripple__layer ripple__layer--5" />
      </div>

      {/* 파동 링 */}
      <div className="ripple__rings" aria-hidden="true">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="ripple__ring"
            style={{ '--ring-delay': `${i * 0.8}s`, '--ring-size': `${100 + i * 80}px` }}
          />
        ))}
      </div>

      {/* 텍스트 콘텐츠 */}
      <div className="ripple__content">
        <div className={`ripple__label fade-in-up ${inView ? 'visible' : ''}`}
          style={{ transitionDelay: '0.05s' }}>
          <span className="ripple__label-num">04</span>
          <span className="ripple__label-divider" />
          <span>PRODUCT VALUE 02</span>
        </div>

        <h2
          className={`ripple__headline title-serif dark-serif fade-in-up ${inView ? 'visible' : ''}`}
          style={{ transitionDelay: '0.2s' }}
        >
          단조롭던 천장에<br />
          <em className="ripple__headline-em">일렁이는 바다를 띄워,</em><br />
          방의 경계를<br />영원히 허뭅니다.
        </h2>

        <p
          className={`ripple__sub fade-in-up ${inView ? 'visible' : ''}`}
          style={{ transitionDelay: '0.35s' }}
        >
          앰버 필라멘트에서 발생한 빛이 조명 갓의 기하학적 패턴을 통과하여<br />
          천장과 벽에 살아 움직이는 빛의 윤슬을 투사합니다.
        </p>

        {/* 스펙 배지 */}
        <div
          className={`ripple__specs fade-in-up ${inView ? 'visible' : ''}`}
          style={{ transitionDelay: '0.5s' }}
        >
          {[
            { value: '2700K', label: '색온도' },
            { value: '360°', label: '투사 각도' },
            { value: '∞', label: '패턴 변주' },
          ].map((spec, i) => (
            <div key={i} className="ripple__spec-item" id={`ripple-spec-${i}`}>
              <span className="ripple__spec-value">{spec.value}</span>
              <span className="ripple__spec-label">{spec.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 하단 전환 마커 */}
      <div className="ripple__fade-out" aria-hidden="true" />
    </section>
  );
}
