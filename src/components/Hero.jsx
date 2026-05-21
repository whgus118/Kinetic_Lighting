import { useEffect, useRef, useState } from "react";
import ImageTrail from "./ImageTrail";
import "./Hero.css";

import img1 from "../assets/1.jpg";
import img2 from "../assets/2.jpg";
import img3 from "../assets/3.jpg";
import img4 from "../assets/4.jpg";
import img5 from "../assets/5.jpg";
import img6 from "../assets/6.jpg";
import img7 from "../assets/7.jpg";
import img8 from "../assets/8.jpg";

/* 조명 분위기에 어울리는 8개의 로컬 이미지 에셋 목록 */
const TRAIL_IMAGES = [img1, img2, img3, img4, img5, img6, img7, img8];

export default function Hero() {
  const [loaded, setLoaded] = useState(false);
  const [trailKey, setTrailKey] = useState(0);
  const heroRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 150);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section
      ref={heroRef}
      className="hero"
      id="hero"
      aria-label="레비테 히어로 섹션"
    >
      {/* ImageTrail — hero 전체 영역을 커버하며 스크롤 시 이미지 트레일 애니메이션 작동 */}
      <div
        className="hero__trail-layer"
        aria-hidden="true"
      >
        <ImageTrail
          key={trailKey}
          items={TRAIL_IMAGES}
          variant="scroll"
          boundaryRef={heroRef}
        />
      </div>

      <div
        className={`hero__video-frame ${loaded ? "is-playing" : ""}`}
        aria-hidden="true"
      >
        <video className="hero__video-core" autoPlay muted loop playsInline>
          <source src="/videos/Warm_lighting.mp4" type="video/mp4" />
        </video>
        <div className="hero__video-tint" />
      </div>

      <div className="hero__content-wrap">
        <div
          className={`hero__brand-tag cinematic-fade-in ${loaded ? "visible" : ""}`}
          style={{ "--delay": "1" }}
        >
          <span>LEVITÉ — KINETIC LIGHTING</span>
        </div>

        <h1
          className={`hero__main-title title-serif cinematic-fade-in ${loaded ? "visible" : ""}`}
          style={{ "--delay": "2" }}
        >
          빛이 형태를
          <br />
          바꾸어 흐를 때,
          <br />
          <span className="hero__main-title--accent">
            당신의 지친 공간은
            <br />
            영감이 됩니다.
          </span>
        </h1>

        <div
          className={`hero__bottom-group cinematic-fade-up ${loaded ? "visible" : ""}`}
          style={{ "--delay": "3" }}
        >
          <p className="hero__pitch-text">
            물리적으로 움직이는 빛으로 공간을 조각합니다.
            <br />
            정지된 일상에, 살아 숨 쉬는 빛을 더합니다.
          </p>
          <div className="hero__action-row">
            <a
              href="#section-eclipse"
              className="btn-levite btn-levite--primary"
            >
              나만의 고요 구하기
            </a>
            <a href="#section-cta" className="btn-levite btn-levite--ghost">
              스토리 탐색하기
            </a>
          </div>
        </div>
      </div>

      <div
        className={`hero__scroll-indicator cinematic-fade-in ${loaded ? "visible" : ""}`}
        style={{ "--delay": "4" }}
      >
        <span className="hero__scroll-text">SCROLL</span>
        <span className="hero__scroll-line" />
      </div>
    </section>
  );
}
