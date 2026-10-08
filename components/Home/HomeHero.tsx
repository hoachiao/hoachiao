'use client';

import Image from 'next/image';
import gsap from 'gsap';
import { useEffect, useRef, useState } from 'react';
import homeContent from '@data/home.json';
import styles from './HomeHero.module.scss';

type TextContent = {
  h1: string;
  h3: string;
  h5: string;
};

const textMap: Record<string, TextContent> = {
  developer: homeContent.developer,
  muayThai: homeContent.muayThai,
  heritage: homeContent.heritage,
  architecture: homeContent.architecture,
  devotion: homeContent.devotion,
};

const HomeHero = () => {
  const [expanded, setExpanded] = useState(false);
  const [hoverText, setHoverText] = useState<TextContent | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileShowDefault, setMobileShowDefault] = useState(true);
  const [stackReady, setStackReady] = useState(false);
  const stackRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const loadedIdsRef = useRef(new Set<string>());
  const stackAnimatedRef = useRef(false);
  const h1Ref = useRef<HTMLHeadingElement>(null);
  const h3Ref = useRef<HTMLHeadingElement>(null);
  const h5Ref = useRef<HTMLHeadingElement>(null);
  const vietnamRef = useRef<HTMLDivElement>(null);
  const templeRef = useRef<HTMLDivElement>(null);
  const meRef = useRef<HTMLDivElement>(null);
  const muayThaiRef = useRef<HTMLDivElement>(null);
  const buddhaRef = useRef<HTMLDivElement>(null);
  const totalImages = 6;

  useEffect(() => {
    if (!textRef.current) return;
    gsap.fromTo(
      textRef.current,
      { opacity: 0, y: 12 },
      { opacity: 1, y: 0, duration: 0.25, ease: 'power2.out' }
    );
  }, [expanded, hoverText, mobileShowDefault]);

  useEffect(() => {
    if (!textRef.current) return;
    gsap.fromTo(
      textRef.current,
      { opacity: 0, y: 24, scale: 0.98 },
      { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: 'power3.out' }
    );
  }, []);

  useEffect(() => {
    if (!stackReady || !stackRef.current || stackAnimatedRef.current) return;
    stackAnimatedRef.current = true;
    gsap.fromTo(
      stackRef.current,
      { opacity: 0, y: 16 },
      { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }
    );
  }, [stackReady]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const media = window.matchMedia('(max-width: 1024px)');
    const handleChange = () => setIsMobile(media.matches);
    handleChange();
    media.addEventListener('change', handleChange);
    return () => media.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    if (!isMobile || !contentRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const isVisible = entries[0]?.isIntersecting;
        setMobileShowDefault(!isVisible);
      },
      { threshold: 0.4 }
    );
    observer.observe(contentRef.current);
    return () => observer.disconnect();
  }, [isMobile]);

  const handleToggle = () => {
    if (isMobile) return;
    const targets = [
      buddhaRef.current,
      vietnamRef.current,
      templeRef.current,
      meRef.current,
      muayThaiRef.current,
    ].filter(Boolean);

    const nextExpanded = !expanded;
    setExpanded(nextExpanded);
    if (!nextExpanded) {
      setHoverText(null);
    }

    if (nextExpanded) {
      gsap.to(stackRef.current, {
        marginBottom: 420,
        duration: 0.4,
        ease: 'power2.out',
      });
      const positions = [
        { x: 900, y: 260 },
        { x: 100, y: 330 },
        { x: 550, y: 260 },
        { x: 30, y: 350 },
        { x: 500, y: 430 },
      ];
      targets.forEach((target, index) => {
        gsap.to(target, {
          x: positions[index]?.x ?? 0,
          y: positions[index]?.y ?? 0,
          duration: 0.45,
          ease: 'power2.out',
          delay: index * 0.05,
        });
      });
    } else {
      gsap.to(stackRef.current, {
        marginBottom: 0,
        duration: 0.3,
        ease: 'power2.inOut',
      });
      gsap.to(targets, {
        x: 0,
        y: 0,
        duration: 0.3,
        ease: 'power2.inOut',
        clearProps: 'transform',
      });
    }
  };

  const content = isMobile
    ? mobileShowDefault
      ? homeContent.defaultText
      : homeContent.photoOpenedText
    : expanded
    ? hoverText ?? homeContent.photoOpenedText
    : homeContent.defaultText;
  const isDefault = !isMobile && content === homeContent.defaultText;

  const renderAnimatedText = (
    text: string,
    Tag: 'h1' | 'h3' | 'h5',
    ref: React.RefObject<HTMLHeadingElement>
  ) => (
    <Tag ref={ref} aria-label={text}>
      {text.split(' ').map((word, index, arr) => (
        <span
          key={`${Tag}-${index}`}
          style={{ display: 'inline-block', whiteSpace: 'nowrap' }}
        >
          {word}
          {index < arr.length - 1 ? '\u00A0' : ''}
        </span>
      ))}
    </Tag>
  );

  const handleMouseEnter = (id: string) => {
    if (!expanded) return;
    setHoverText(textMap[id] ?? homeContent.photoOpenedText);
  };

  const handleMouseLeave = () => {
    if (!expanded) return;
    setHoverText(null);
  };

  const handleImageLoaded = (id: string) => {
    if (loadedIdsRef.current.has(id)) return;
    loadedIdsRef.current.add(id);
    if (loadedIdsRef.current.size >= totalImages) {
      setStackReady(true);
    }
  };

  useEffect(() => {
    if (!isDefault) return;
    const groups = [h1Ref.current, h3Ref.current, h5Ref.current].filter(
      Boolean
    ) as HTMLHeadingElement[];
    groups.forEach((el, idx) => {
      const spans = el.querySelectorAll('span');
      if (!spans.length) return;
      gsap.fromTo(
        spans,
        { opacity: 0, y: 14 },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          ease: 'power2.out',
          stagger: 0.02,
          delay: idx * 0.05,
        }
      );
    });
  }, [isDefault]);

  return (
    <div ref={contentRef} className={styles.container}>
      <div
        ref={stackRef}
        className={`${styles.imageStack} ${
          stackReady ? styles.imageStackReady : styles.imageStackLoading
        }`}
        onClick={handleToggle}
      >
        
      <div
        ref={muayThaiRef}
        onMouseEnter={() => handleMouseEnter('muayThai')}
        onMouseLeave={handleMouseLeave}
      >
        <Image
          src={'/images/home/muayThai.jpg'}
          width={360}
          height={480}
          className={styles.muayThai}
          loading='eager'
          alt={'ho-a-chiao Muay Thai'}
          onLoad={() => handleImageLoaded('muayThai')}
        />
      </div>
      <div
        ref={buddhaRef}
        onMouseEnter={() => handleMouseEnter('devotion')}
        onMouseLeave={handleMouseLeave}
      >
        <Image
          src={'/images/home/buddha.jpg'}
          width={220}
          height={320}
          className={styles.buddha}
          loading='eager'
          alt={'Buddha'}
          onLoad={() => handleImageLoaded('buddha')}
        />
      </div>
        <div
          ref={vietnamRef}
          onMouseEnter={() => handleMouseEnter('heritage')}
          onMouseLeave={handleMouseLeave}
        >
          <Image
            src={'/images/home/ho-a-chiao_vietnam.png'}
            width={300}
            height={400}
            className={styles.vietnam}
            loading='eager'
            alt={'ho-a-chiao Vietnam'}
            onLoad={() => handleImageLoaded('vietnam')}
          />
        </div>
        <div
          ref={templeRef}
          onMouseEnter={() => handleMouseEnter('architecture')}
          onMouseLeave={handleMouseLeave}
        >
          <Image
            src={'/images/home/ho-a-chiao_temple.png'}
            width={260}
            height={320}
            className={styles.temple}
            loading='eager'
            alt={'ho-a-chiao Temple'}
            onLoad={() => handleImageLoaded('temple')}
          />
        </div>
        <div
          ref={meRef}
          onMouseEnter={() => handleMouseEnter('developer')}
          onMouseLeave={handleMouseLeave}
        >
          <Image
            src={'/images/home/me.png'}
            width={230}
            height={380}
            className={styles.me}
            loading='eager'
            alt={'ho-a-chiao Developer'}
            onLoad={() => handleImageLoaded('me')}
          />
        </div>
        <div
          onMouseEnter={() => handleMouseEnter('')}
          onMouseLeave={handleMouseLeave}
          className={styles.imageDiv}
        >
          <Image
            id="ho-a-chiao"
            src={'/images/home/ho-a-chiao.png'}
            width={550}
            height={550}
            className={styles.image}
            loading='eager'
            alt={'ho-a-chiao'}
            priority={true}
            onLoad={() => handleImageLoaded('ho-a-chiao')}
          />
        </div>
      </div>
      <div ref={textRef} className={styles.helloBox}>
        {isMobile ? (
          <>
            <div className={styles.mobileCarousel}>
              {[
                homeContent.defaultText,
                homeContent.photoOpenedText,
                homeContent.developer,
                homeContent.muayThai,
                homeContent.heritage,
                homeContent.architecture,
                homeContent.devotion,
              ].map((item, index) => (
                <div key={index} className={styles.mobileSlide}>
                  <h1>{item.h1}</h1>
                  <h3>{item.h3}</h3>
                  <h5>{item.h5}</h5>
                </div>
              ))}
            </div>
            <div className={styles.swipeHint}>
              <span className={styles.swipeText}>Swipe to explore</span>
              <div className={styles.swipeBar}>
                <span className={styles.swipeBarActive} />
              </div>
            </div>
          </>
        ) : (
          <>
            <div className={styles.helloContent}>
              <div>
                {isDefault ? (
                  <>
                    {renderAnimatedText(content.h1, 'h1', h1Ref)}
                    {renderAnimatedText(content.h3, 'h3', h3Ref)}
                    {renderAnimatedText(content.h5, 'h5', h5Ref)}
                  </>
                ) : (
                  <>
                    <h1>{content.h1}</h1>
                    <h3>{content.h3}</h3>
                    <h5>{content.h5}</h5>
                  </>
                )}
              </div>
              {!expanded && !isMobile && (
                <Image
                  src='/images/a-chiao-logo.png'
                  className={styles.helloLogo}
                  alt='A-Chiao 阿樵四界看'
                  width={250}
                  height={250}
                />
              )}
            </div>
          </>
        )}
        {isMobile && <div className={styles.mobileLogo} />}
      </div>
    </div>
  );
};

export default HomeHero;
