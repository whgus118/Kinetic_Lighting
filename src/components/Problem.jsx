import { useEffect, useRef, useState } from "react";
import "./Problem.css";
import CountUp from "./CountUp";
import DecryptedText from "./DecryptedText";

const LINES = [
  "오늘 하루, 당신의 눈이",
  "견뎌낸 타임라인은",
  "몇 번의 깜빡임이었나요?",
];

const NOISE_ITEMS = [
  { label: "EMAILS", count: 247, suffix: "", unit: "통" },
  { label: "SLACK", count: 1.2, suffix: "K", unit: "알림" },
  { label: "MEETINGS", count: 6.5, suffix: "", unit: "시간" },
  { label: "SCREENS", count: 11.4, suffix: "", unit: "인치" },
  { label: "REFRESH", count: "∞", suffix: "", unit: "회" },
];

export default function Problem() {
  const [finishedCount, setFinishedCount] = useState(0);
  const [noiseItemsTransitionFinished, setNoiseItemsTransitionFinished] =
    useState(false);
  const sectionRef = useRef(null);
  const linesRef = useRef([]);

  const allCountsFinished = finishedCount >= 4;

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // 문장 줄 단위 페이드인
            linesRef.current.forEach((el, i) => {
              if (el) {
                setTimeout(() => el.classList.add("visible"), i * 220);
              }
            });
            // 노이즈 아이템 순차 진입
            const noiseItems = document.querySelectorAll(
              ".problem__noise-item",
            );
            noiseItems.forEach((el, i) => {
              setTimeout(
                () => {
                  if (el) el.classList.add("visible");
                },
                600 + i * 120,
              );
            });

            // 마지막 노이즈 아이템이 완전히 올라왔을 때(트랜지션 완료 시) 하단 질문 실행 상태 활성화
            const lastItem = noiseItems[noiseItems.length - 1];
            if (lastItem) {
              const handleTransitionEnd = (e) => {
                if (e.propertyName === "transform") {
                  setNoiseItemsTransitionFinished(true);
                  lastItem.removeEventListener(
                    "transitionend",
                    handleTransitionEnd,
                  );
                }
              };
              lastItem.addEventListener("transitionend", handleTransitionEnd);
            }
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.25 },
    );

    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="section-problem"
      className="problem section-light"
      aria-label="일상의 디지털 자극 섹션"
    >
      <div className="problem__inner">
        {/* 좌측: 서사 텍스트 */}
        <div className="problem__text">
          <div className="problem__label">
            <span className="problem__label-num">02</span>
            <span className="problem__label-divider" />
            <span>PROBLEM & SYMPATHY</span>
          </div>

          <h2 className="problem__headline title-serif">
            {LINES.map((line, i) => (
              <span
                key={i}
                ref={(el) => (linesRef.current[i] = el)}
                className="problem__line fade-smudge"
              >
                {line}
              </span>
            ))}
          </h2>

          <p className="problem__body fade-in-up">
            마감 시간, 메시지 알림, 눈부신 모니터 빛.
            <br />
            <br />
            우리는 매일 수천 가지 디지털 자극 속에서 자신도 모르게 무감각해져
            갑니다.
          </p>
        </div>

        {/* 우측: 디지털 소음 인포그래픽 */}
        <div className="problem__noise">
          <div className="problem__noise-grid">
            {NOISE_ITEMS.map((item, i) => (
              <div
                key={i}
                className="problem__noise-item"
                style={{ "--delay": `${i * 0.12}s` }}
              >
                <span className="problem__noise-count">
                  {typeof item.count === "number" ? (
                    <>
                      <CountUp
                        from={0}
                        to={item.count}
                        duration={1.5}
                        delay={0.6 + i * 0.12}
                        className="count-up-text"
                        onEnd={() => setFinishedCount((prev) => prev + 1)}
                      />
                      {item.suffix}
                    </>
                  ) : (
                    item.count
                  )}
                </span>
                <span className="problem__noise-unit">{item.unit}</span>
                <span className="problem__noise-label">{item.label}</span>
              </div>
            ))}
          </div>

          {/* 픽셀 노이즈 장식 */}
          <div className="problem__pixel-noise" aria-hidden="true">
            {Array.from({ length: 60 }).map((_, i) => (
              <span
                key={i}
                className="problem__pixel"
                style={{
                  "--px": `${Math.random() * 100}%`,
                  "--py": `${Math.random() * 100}%`,
                  "--pd": `${Math.random() * 3}s`,
                  "--ps": `${0.4 + Math.random() * 0.6}`,
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* 하단 전환 텍스트 */}
      <div className="problem__transition">
        <div className="problem__transition-line" />
        <p>
          <DecryptedText
            text="레비테는 묻습니다."
            animateOn="custom"
            trigger={noiseItemsTransitionFinished}
            forceReveal={allCountsFinished}
            speed={40}
            sequential
            revealDirection="start"
          />
          <br />
          <strong>
            <DecryptedText
              text="당신에게 진짜 퇴근이 있었나요?"
              animateOn="custom"
              trigger={noiseItemsTransitionFinished}
              forceReveal={allCountsFinished}
              speed={50}
              sequential
              revealDirection="start"
            />
          </strong>
        </p>
        <div className="problem__transition-line" />
      </div>
    </section>
  );
}
