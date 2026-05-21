import { useEffect, useRef, useState } from "react";
import "./TrustSpecs.css";

const SPECS = [
  { label: "소음 수준", value: "0dB", sub: "무소음 직류 모터 탑재" },
  { label: "마감 소재", value: "AL7075", sub: "항공우주급 알루미늄 합금" },
  { label: "구동 각도", value: "±90°", sub: "정밀 스텝 모터 제어" },
  { label: "색온도", value: "2700K", sub: "캔들라이트 웜화이트 필라멘트" },
  { label: "수명", value: "50,000h", sub: "장기 사용 설계 보장" },
  { label: "무게", value: "1.8kg", sub: "천연석 베이스 중심 설계" },
];

export default function TrustSpecs() {
  const sectionRef = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setInView(true);
      },
      { threshold: 0.2 },
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);
  // ㅇ
  return (
    <section
      ref={sectionRef}
      id="section-specs"
      className="trust section-dark"
      aria-label="정밀 사양 및 빌드 퀄리티 섹션"
    >
      <div className="trust__inner">
        {/* 헤더 */}
        <div className="trust__header">
          <div className={`trust__label fade-in-up ${inView ? "visible" : ""}`}>
            <span className="trust__label-num">05</span>
            <span className="trust__label-divider" />
            <span>TRUST & ENGINEERING</span>
          </div>

          <h2
            className={`trust__headline title-serif dark-serif fade-in-up ${inView ? "visible" : ""}`}
            style={{ transitionDelay: "0.3s" }}
          >
            숨겨진 태엽의 움직임까지
            <br />
            완벽하도록,
            <br />
            <em className="trust__headline-em">
              오직 아날로그 정밀함으로
              <br />
              조각했습니다.
            </em>
          </h2>
        </div>

        {/* 단면 다이어그램 + 스펙 그리드 */}
        <div className="trust__body">
          {/* 좌: 폭발도 다이어그램 */}
          <div
            className={`trust__diagram fade-in-up ${inView ? "visible" : ""}`}
            style={{ transitionDelay: "0.5s" }}
            aria-hidden="true"
          >
            <svg viewBox="0 0 300 480" className="trust__diagram-svg">
              <defs>
                <linearGradient
                  id="metalLg"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="100%"
                >
                  <stop offset="0%" stopColor="#D1DCD6" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#6B7F76" stopOpacity="0.6" />
                </linearGradient>
                <linearGradient id="ambLg" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#E29543" />
                  <stop offset="100%" stopColor="#C07020" />
                </linearGradient>
              </defs>

              {/* 전선 + 캐노피 */}
              <line
                x1="150"
                y1="0"
                x2="150"
                y2="40"
                stroke="#D1DCD6"
                strokeWidth="2"
                opacity="0.6"
              />
              <ellipse
                cx="150"
                cy="48"
                rx="30"
                ry="10"
                fill="url(#metalLg)"
                opacity="0.8"
              />

              {/* 갓 레이어 1 (상단) */}
              <path
                d="M120 48 L90 120 L210 120 L180 48 Z"
                fill="url(#metalLg)"
                opacity="0.7"
              />
              <text
                x="220"
                y="85"
                fill="#D1DCD6"
                fontSize="9"
                opacity="0.7"
                fontFamily="sans-serif"
              >
                AL7075 쉘
              </text>
              <line
                x1="210"
                y1="84"
                x2="215"
                y2="84"
                stroke="#E29543"
                strokeWidth="0.8"
              />

              {/* 갓 레이어 2 (중단) */}
              <path
                d="M90 128 L55 220 L245 220 L210 128 Z"
                fill="url(#metalLg)"
                opacity="0.5"
              />
              <text
                x="250"
                y="174"
                fill="#D1DCD6"
                fontSize="9"
                opacity="0.7"
                fontFamily="sans-serif"
              >
                반사 코팅
              </text>
              <line
                x1="245"
                y1="174"
                x2="249"
                y2="174"
                stroke="#E29543"
                strokeWidth="0.8"
              />

              {/* 필라멘트 구체 */}
              <circle
                cx="150"
                cy="140"
                r="16"
                fill="url(#ambLg)"
                opacity="0.9"
              />
              <circle cx="150" cy="140" r="8" fill="#FFE0A0" opacity="0.95" />
              <text
                x="35"
                y="145"
                fill="#E29543"
                fontSize="9"
                fontFamily="sans-serif"
                opacity="0.8"
              >
                필라멘트
              </text>
              <line
                x1="76"
                y1="144"
                x2="134"
                y2="140"
                stroke="#E29543"
                strokeWidth="0.8"
              />

              {/* 갓 하단 링 */}
              <ellipse
                cx="150"
                cy="220"
                rx="95"
                ry="16"
                fill="none"
                stroke="#E29543"
                strokeWidth="1.5"
                opacity="0.6"
              />

              {/* 암 */}
              <rect
                x="145"
                y="220"
                width="10"
                height="100"
                rx="3"
                fill="url(#metalLg)"
                opacity="0.8"
              />
              <text
                x="165"
                y="278"
                fill="#D1DCD6"
                fontSize="9"
                opacity="0.7"
                fontFamily="sans-serif"
              >
                암 (무소음)
              </text>
              <line
                x1="155"
                y1="270"
                x2="163"
                y2="270"
                stroke="#E29543"
                strokeWidth="0.8"
              />

              {/* 베이스 */}
              <ellipse
                cx="150"
                cy="340"
                rx="70"
                ry="22"
                fill="url(#metalLg)"
                opacity="0.6"
              />
              <rect
                x="100"
                y="340"
                width="100"
                height="30"
                rx="4"
                fill="url(#metalLg)"
                opacity="0.7"
              />
              <ellipse
                cx="150"
                cy="370"
                rx="70"
                ry="16"
                fill="#1B2B22"
                opacity="0.4"
              />
              <text
                x="165"
                y="358"
                fill="#D1DCD6"
                fontSize="9"
                opacity="0.7"
                fontFamily="sans-serif"
              >
                천연석 베이스
              </text>
              <line
                x1="150"
                y1="355"
                x2="163"
                y2="355"
                stroke="#E29543"
                strokeWidth="0.8"
              />

              {/* 레이블 수직선 */}
              {[85, 174, 140, 270, 355].map((y, i) => (
                <line
                  key={i}
                  x1="210"
                  y1={y}
                  x2="216"
                  y2={y}
                  stroke="#E29543"
                  strokeWidth="0.8"
                  opacity="0.4"
                />
              ))}
            </svg>
          </div>

          {/* 우: 스펙 그리드 */}
          <div className="trust__specs">
            {SPECS.map((spec, i) => (
              <div
                key={i}
                id={`spec-item-${i}`}
                className={`trust__spec-item fade-in-up ${inView ? "visible" : ""}`}
                style={{ transitionDelay: `${0.4 + i * 0.1}s` }}
              >
                <span className="trust__spec-value">{spec.value}</span>
                <span className="trust__spec-label">{spec.label}</span>
                <span className="trust__spec-sub">{spec.sub}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 마감 소재 배너 */}
        <div
          className={`trust__materials fade-in-up ${inView ? "visible" : ""}`}
          style={{ transitionDelay: "1.2s" }}
        >
          {[
            "항공우주급 알루미늄",
            "무소음 직류 모터",
            "천연 오닉스 베이스",
            "캔들라이트 필라멘트",
            "정밀 각도 제어",
          ].map((mat, i) => (
            <span key={i} className="trust__material-chip">
              {mat}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
