'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import styles from './Info.module.scss';
import Link from 'next/link';

const Info = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    gsap.registerPlugin(ScrollTrigger);
    gsap.fromTo(
      containerRef.current,
      { opacity: 0, y: 40 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top 80%',
          toggleActions: 'play none none reverse',
        },
      }
    );
  }, []);

  return (
    <div ref={containerRef} className={styles.container}>
      <h1>About Me</h1>
      <hr />
      <ul className={styles.timeline}>
        <li className={styles.timelineItem}>
          <div className={`card ${styles.timelineCard}`}>
            <div className="card-body">
              <h3>WORK EXPERIENCE</h3>
              <p>- Frontend Developer since October,2021</p>
              <p>- Github：https://github.com/schiho47</p>
            </div>
          </div>
        </li>
        <li className={styles.timelineItem}>
          <div className={`card ${styles.timelineCard}`}>
            <div className="card-body">
              <h3>EDUCATION</h3>
              <p>
                - Tibame Frontend Developer Training Course Jan 2021 – Aug 2021
              </p>
              <p>
                - MA Postcolonial Culture &amp; Global Policy Goldsmiths,
                University of London Sep 2017 – Aug 2018
              </p>
              <p>
                - BA History National Taiwan University Sep 2014 – Jun 2017
              </p>
            </div>
          </div>
        </li>
      </ul>
  <div className={styles.contactContainer}>
      <div className={`card ${styles.section}`}>
        <h3 className={styles.sectionTitle}>SKILLS</h3>
        <div className={styles.skillGrid}>
          {[
            'HTML',
            'CSS',
            'SASS',
            'JavaScript',
            'RWD',
            'TypeScript',
            'React.js',
            'Next.js',
            'React Native',
            'Tailwind CSS',
            'MongoDB',
            'Node.js',
            'Git',
          ].map((skill) => (
            <span key={skill} className={`${styles.skillTag} card-body`}>
              {skill}
            </span>
          ))}
        </div>
      </div>

      <div className={`card ${styles.contactCard}`}>
        <div className="card-body">
          <h3>CONTACT</h3>
          <p>- s.chiho47@gmail.com</p>
          <p>- <Link href="https://www.linkedin.com/in/ssu-chi-ho-002a3b1b5/" target="_blank">LinkedIn</Link></p>
          <p>- <Link href="https://drive.google.com/drive/folders/1Z1qdYKtggEl1QAEK4UTenwg-cqL2w3Cw?usp=sharing" target="_blank">CV</Link></p>
        </div>
      </div>
    </div>
    </div>
  );
}
 
export default Info;