import { useEffect, useRef } from 'react';
import './CursorGlow.css';

export default function CursorGlow() {
  const isMobile = window.innerWidth < 768;

  if (isMobile) return null;

  return (
    <>
      {/* 커스텀 커서 도트 (빛 효과 제거됨) */}
      <div className="cursor-dot" aria-hidden="true" id="cursor-dot" />
    </>
  );
}
