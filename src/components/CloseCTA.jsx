import { useEffect, useRef, useState } from 'react';
import './CloseCTA.css';

export default function CloseCTA() {
  const sectionRef = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setInView(true); },
      { threshold: 0.15 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="section-cta"
      className="cta section-dark"
      aria-label="최종 전환 CTA 섹션"
    >
      {/* 배경 앰버 빛 */}
      <div className="cta__bg" aria-hidden="true">
        <div className="cta__bg-glow cta__bg-glow--1" />
        <div className="cta__bg-glow cta__bg-glow--2" />
        <div className="cta__bg-glow cta__bg-glow--3" />
      </div>

      {/* 언박싱 비주얼 (SVG 패키지) */}
      <div
        className={`cta__package fade-in ${inView ? 'visible' : ''}`}
        aria-hidden="true"
        style={{ transitionDelay: '0.3s' }}
      >
        <svg viewBox="0 0 400 300" className="cta__package-svg">
          <defs>
            <linearGradient id="boxLg" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#2A3830"/>
              <stop offset="100%" stopColor="#1B2B22"/>
            </linearGradient>
            <linearGradient id="boxLid" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#3A4840"/>
              <stop offset="100%" stopColor="#2A3830"/>
            </linearGradient>
            <radialGradient id="packageGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#E29543" stopOpacity="0.4"/>
              <stop offset="100%" stopColor="#E29543" stopOpacity="0"/>
            </radialGradient>
          </defs>

          {/* 패키지 박스 본체 */}
          <rect x="80" y="120" width="240" height="160" rx="4" fill="url(#boxLg)"/>

          {/* 박스 뚜껑 (열림) */}
          <path d="M80 120 L200 40 L320 120" fill="none" stroke="rgba(209,220,214,0.1)" strokeWidth="1"/>
          <path d="M80 120 L80 60 L200 0 L320 60 L320 120" fill="url(#boxLid)" opacity="0.9"/>

          {/* 내부 글로우 */}
          <ellipse cx="200" cy="120" rx="100" ry="30" fill="url(#packageGlow)"/>

          {/* 조명 미니어처 */}
          <line x1="200" y1="20" x2="200" y2="90" stroke="#E29543" strokeWidth="2" opacity="0.7"/>
          <path d="M180 90 Q200 86 220 90 L230 140 Q200 148 170 140 Z"
            fill="#E29543" opacity="0.5"/>
          <circle cx="200" cy="108" r="6" fill="#FFE0A0" opacity="0.9"/>

          {/* 박스 측면 */}
          <path d="M80 280 L40 240 L40 100 L80 120 Z" fill="#162220" opacity="0.8"/>
          <path d="M320 280 L360 240 L360 100 L320 120 Z" fill="#1A2820" opacity="0.6"/>

          {/* 브랜드 로고 임프린트 */}
          <text x="200" y="220" textAnchor="middle"
            fill="rgba(209,220,214,0.2)"
            fontSize="11" letterSpacing="6" fontFamily="sans-serif" fontWeight="600">
            LEVITÉ
          </text>

          {/* 세로 리본 */}
          <rect x="196" y="120" width="8" height="160" fill="rgba(226,149,67,0.3)"/>

          {/* 보조 광원 */}
          <circle cx="200" cy="120" r="40" fill="url(#packageGlow)" opacity="0.6"/>
        </svg>

        {/* 패키지 주변 링 */}
        <div className="cta__package-ring cta__package-ring--1" />
        <div className="cta__package-ring cta__package-ring--2" />
      </div>

      {/* 텍스트 & CTA */}
      <div className="cta__content">
        <div
          className={`cta__label fade-in-up ${inView ? 'visible' : ''}`}
          style={{ transitionDelay: '0.2s' }}
        >
          <span className="cta__label-num">06</span>
          <span className="cta__label-divider" />
          <span>CLOSE & CTA</span>
        </div>

        <h2
          className={`cta__headline title-serif dark-serif fade-in-up ${inView ? 'visible' : ''}`}
          style={{ transitionDelay: '0.5s' }}
        >
          오늘 밤, 끝없는 자극의 세계에서<br />
          <em className="cta__headline-em">완벽하게 퇴근하세요.</em>
        </h2>

        <p
          className={`cta__sub fade-in-up ${inView ? 'visible' : ''}`}
          style={{ transitionDelay: '0.8s' }}
        >
          레비테와 함께, 당신의 공간이 영감이 됩니다.
        </p>

        {/* 메인 CTA 버튼 */}
        <div
          className={`cta__actions fade-in-up ${inView ? 'visible' : ''}`}
          style={{ transitionDelay: '1.1s' }}
        >
          <button
            id="cta-main-btn"
            className="cta__btn"
            aria-label="나만의 고요 구하기 — 구매 페이지로 이동"
          >
            <span className="cta__btn-inner">
              <span className="cta__btn-bracket">[ </span>
              나만의 고요 구하기
              <span className="cta__btn-bracket"> ]</span>
            </span>
            <span className="cta__btn-glow" aria-hidden="true" />
          </button>

          <p className="cta__notice">
            한정 수량 · 무료 배송 · 30일 무조건 반품 보장
          </p>
        </div>
      </div>

      {/* 푸터 */}
      <footer className="cta__footer">
        <span className="cta__footer-logo">⊙ LEVITÉ</span>
        <p className="cta__footer-copy">
          © 2024 Levité Co., Ltd. — 하이엔드 키네틱 조명
        </p>
        <nav className="cta__footer-nav" aria-label="푸터 내비게이션">
          <a href="#" id="footer-about">브랜드 스토리</a>
          <a href="#" id="footer-care">제품 관리법</a>
          <a href="#" id="footer-contact">문의</a>
        </nav>
      </footer>
    </section>
  );
}
