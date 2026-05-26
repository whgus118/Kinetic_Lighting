import { useState, useEffect } from 'react';
import Lenis from 'lenis'; // 💡 프리미엄 관성 스크롤 라이브러리 탑재
import 'lenis/dist/lenis.css'; // 💡 Lenis 레이아웃 깨짐 방지용 스타일 탑재

import Navigation     from './components/Navigation';
import Hero           from './components/Hero';
import Problem        from './components/Problem';
import TimelineShade  from './components/TimelineShade';
import ScrollBridge   from './components/ScrollBridge';
import TrustSpecs     from './components/TrustSpecs';
import CloseCTA       from './components/CloseCTA';
import CursorGlow     from './components/CursorGlow';

export default function App() {
  // 다크존(Section 03 이후) 여부
  const [isDarkZone, setIsDarkZone] = useState(false);

  // 💡 [추가] Lenis 관성 스크롤러 구동 및 프레임 루프 바인딩
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.4, // 묵직하고 은은한 미끄러짐을 위해 1.4초 설정
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // 부드럽고 실키한 관성 이싱
      smoothWheel: true,
      smoothTouch: false, // 모바일 네이티브 관성은 있는 그대로 보존
    });

    window.lenis = lenis; // 💡 전역 노출하여 TimelineShade 등에서 제어 가능케 함

    let rafId;
    function raf(time) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
      window.lenis = null; // 💡 언마운트 시 정리
    };
  }, []);

  // 💡 [추가] 브라우저 스크롤 위치 강제 고정 (진입 시 최상단 시작)
  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);
  }, []);

  // 다크존 스크롤 감지
  useEffect(() => {
    const handleScroll = () => {
      const shadeEl = document.getElementById('section-timeline-shade');
      if (shadeEl) {
        const rect = shadeEl.getBoundingClientRect();
        // 타임라인 섹션이 화면의 40% 이상 올라왔을 때 다크존으로 간주
        setIsDarkZone(rect.top < window.innerHeight * 0.4);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 💡 [추가] 다크존 진입 시 html 태그에 dark-mode 클래스 주입 (스크롤바 트랙 등 전역 다크화 통일)
  useEffect(() => {
    if (isDarkZone) {
      document.documentElement.classList.add('dark-mode');
    } else {
      document.documentElement.classList.remove('dark-mode');
    }
  }, [isDarkZone]);

  // 커스텀 커서 도트 위치 동기화
  useEffect(() => {
    const isMobile = window.innerWidth < 768;
    if (isMobile) return;

    const dot = document.getElementById('cursor-dot');
    if (!dot) return;

    let rafId;
    const handleMouseMove = (e) => {
      const target = e.target;
      const clientX = e.clientX;
      const clientY = e.clientY;

      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        dot.style.transform = `translate3d(${clientX}px, ${clientY}px, 0) translate(-50%, -50%)`;
        
        // 동적으로 클래스가 추가되는 요소들을 위해 mousemove에서 호버 상태 감지
        const isInteractive = target && target.closest ? target.closest('a, button, [role="button"], input, select, textarea, [tabindex]:not([tabindex="-1"]), .problem__noise-item, .trust__spec-item, .trust__material-chip') : false;
        if (isInteractive) {
          dot.classList.add('cursor-dot--hover');
        } else {
          dot.classList.remove('cursor-dot--hover');
        }
      });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    
    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <>
      <CursorGlow isDarkZone={isDarkZone} />
      <Navigation />

      <main id="main-content">
        <Hero />
        <Problem />
        <TimelineShade />
        <ScrollBridge />
        <TrustSpecs />
        <CloseCTA />
      </main>
    </>
  );
}