import { useEffect, useRef } from 'react';
import './CursorGlow.css';

export default function CursorGlow({ isDarkZone }) {
  const glowRef = useRef(null);
  const posRef = useRef({ x: 0, y: 0 });
  const targetRef = useRef({ x: 0, y: 0 });
  const rafRef = useRef(null);
  const isMobile = window.innerWidth < 768;

  useEffect(() => {
    if (isMobile) return;

    const handleMouseMove = (e) => {
      targetRef.current = { x: e.clientX, y: e.clientY };
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    // 지연 추적 애니메이션 루프
    const animate = () => {
      const dx = targetRef.current.x - posRef.current.x;
      const dy = targetRef.current.y - posRef.current.y;
      posRef.current.x += dx * 0.08;
      posRef.current.y += dy * 0.08;

      if (glowRef.current) {
        glowRef.current.style.transform =
          `translate(${posRef.current.x - 200}px, ${posRef.current.y - 200}px)`;
      }
      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isMobile]);

  if (isMobile) return null;

  return (
    <>
      {/* 앰버 글로우 — 다크 구역에서만 활성 */}
      <div
        ref={glowRef}
        className={`cursor-glow ${isDarkZone ? 'cursor-glow--active' : ''}`}
        aria-hidden="true"
      />
      {/* 커스텀 커서 도트 */}
      <div className="cursor-dot" aria-hidden="true" id="cursor-dot" />
    </>
  );
}
