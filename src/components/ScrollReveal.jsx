import { useEffect, useRef, useMemo } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import './ScrollReveal.css';

gsap.registerPlugin(ScrollTrigger);

const ScrollReveal = ({
  children,
  scrollContainerRef,
  enableBlur = true,
  baseOpacity = 0.1,
  baseRotation = 3,
  blurStrength = 4,
  containerClassName = '',
  textClassName = '',
  rotationEnd = 'bottom bottom',
  wordAnimationEnd = 'bottom bottom',
  forcePlay = false // 강제 재생 프롭스 지원
}) => {
  const containerRef = useRef(null);
  const animationContextRef = useRef(null);
  const animationsRef = useRef([]);

  const splitText = useMemo(() => {
    const text = typeof children === 'string' ? children : '';
    return text.split(/(\s+)/).map((word, index) => {
      if (word.match(/^\s+$/)) return word;
      return (
        <span className="word" key={index}>
          {word}
        </span>
      );
    });
  }, [children]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const scroller = scrollContainerRef && scrollContainerRef.current ? scrollContainerRef.current : window;
    const wordElements = el.querySelectorAll('.word');

    animationsRef.current = [];

    // React 18 Strict Mode 대응 및 글로벌 ScrollTrigger 삭제 버그 방지를 위한 context 사용
    animationContextRef.current = gsap.context(() => {
      const rotAnim = gsap.fromTo(
        el,
        { transformOrigin: '0% 50%', rotate: baseRotation },
        {
          ease: 'power2.out',
          duration: 0.6,
          rotate: 0,
          scrollTrigger: {
            trigger: el,
            scroller,
            start: 'top bottom', // 뷰포트에 닿자마자 바로 시작
            toggleActions: 'play none none reverse'
          }
        }
      );
      animationsRef.current.push(rotAnim);

      const opacityAnim = gsap.fromTo(
        wordElements,
        { opacity: baseOpacity, willChange: 'opacity' },
        {
          ease: 'power2.out',
          duration: 0.6,
          opacity: 1,
          stagger: 0.02,
          scrollTrigger: {
            trigger: el,
            scroller,
            start: 'top bottom',
            toggleActions: 'play none none reverse'
          }
        }
      );
      animationsRef.current.push(opacityAnim);

      if (enableBlur) {
        const blurAnim = gsap.fromTo(
          wordElements,
          { filter: `blur(${blurStrength}px)` },
          {
            ease: 'power2.out',
            duration: 0.6,
            filter: 'blur(0px)',
            stagger: 0.02,
            scrollTrigger: {
              trigger: el,
              scroller,
              start: 'top bottom',
              toggleActions: 'play none none reverse'
            }
          }
        );
        animationsRef.current.push(blurAnim);
      }
    }, el);

    return () => {
      animationContextRef.current.revert();
    };
  }, [scrollContainerRef, enableBlur, baseRotation, baseOpacity, rotationEnd, wordAnimationEnd, blurStrength]);

  // 강제 재생(forcePlay) 로직
  useEffect(() => {
    if (forcePlay && animationsRef.current.length > 0) {
      animationsRef.current.forEach(anim => anim.play());
    }
  }, [forcePlay]);

  return (
    <h2 ref={containerRef} className={`scroll-reveal ${containerClassName}`}>
      <p className={`scroll-reveal-text ${textClassName}`}>{splitText}</p>
    </h2>
  );
};

export default ScrollReveal;
