import { useState, useEffect } from 'react';
import './Navigation.css';

export default function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 60);

      // 다크 섹션 감지 (이클립스 활성화 타이밍 동기화)
      const darkStart = document.getElementById('section-eclipse');
      if (darkStart) {
        setIsDark(darkStart.classList.contains('active'));
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleCTAClick = () => {
    document.getElementById('section-cta')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <nav
      className={`nav ${scrolled ? 'nav--scrolled' : ''} ${isDark ? 'nav--dark' : ''}`}
      role="navigation"
      aria-label="주 내비게이션"
    >
      <div className="nav__inner">
        {/* 로고 */}
        <a href="/" className="nav__logo" aria-label="레비테 홈">
          <span className="nav__logo-symbol">⊙</span>
          <span className="nav__logo-text">LEVITÉ</span>
        </a>

        {/* 데스크톱 메뉴 */}
        <ul className="nav__menu" role="list">
          <li><a href="#section-problem" className="nav__link">철학</a></li>
          <li><a href="#section-eclipse" className="nav__link">제품</a></li>
          <li><a href="#section-specs" className="nav__link">사양</a></li>
        </ul>

        {/* CTA */}
        <button
          id="nav-cta-btn"
          className="nav__cta"
          onClick={handleCTAClick}
          aria-label="고요 구하기 — 구매 페이지로 이동"
        >
          고요 구하기
        </button>
      </div>
    </nav>
  );
}
