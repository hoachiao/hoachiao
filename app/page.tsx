import Navbar from '@components/Navbar/Navbar';
import Footer from '@components/Footer/Footer';
import Image from 'next/image';
import Link from 'next/link';
import HomeStories from '@components/Home/HomeStories';
import HomeTopicsFeature from '@components/Home/HomeTopicsFeature';
import styles from '../styles/Home.module.scss';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '阿樵四界看｜臺灣與東南亞的歷史文化故事',
  description:
    '我是何阿樵，讀歷史，也寫程式。從臺灣到東南亞，記錄街區、信仰、語言與人的故事，追查日常裡的歷史線索。',
  alternates: {
    canonical: '/',
  },
};

export default function Home() {
  return (
    <>
      <Navbar path='home' />
      <main className={styles.page}>
        <section className={styles.hero} aria-label='首頁主視覺'>
          <div className={styles.heroCopy}>
            <span className={styles.eyebrow}>HO-A-CHIAO</span>
            <h1 className={styles.heroTitle}>阿樵四界看</h1>
            <span className={`${styles.brushStroke} ${styles.heroBrush}`} />
            <h2 className={styles.heroSubtitle}>
              四界走走，追查日常裡的歷史線索。
            </h2>
            <p className={styles.heroDescription}>
              我是何阿樵，讀歷史，也寫程式。從臺灣到東南亞，記錄街區、信仰、語言與人的故事。
            </p>
            <div className={styles.heroActions}>
              <Link href='/blogs' className={styles.primaryAction}>
                開始閱讀 <span aria-hidden='true'>→</span>
              </Link>
              <Link href='/about' className={styles.secondaryAction}>
                關於阿樵
              </Link>
            </div>
          </div>

          <div className={styles.photoCollage}>
            <div className={`${styles.photoCard} ${styles.mainPhoto}`}>
              <Image
                src='/images/home/ho-a-chiao.png'
                alt='阿樵四界看'
                fill
                priority
                sizes='(max-width: 760px) 80vw, 40vw'
              />
            </div>
            <div className={`${styles.photoCard} ${styles.sidePhoto}`}>
              <Image
                src='/images/home/ho-a-chiao_vietnam.png'
                alt='越南旅途紀錄'
                fill
                sizes='(max-width: 760px) 45vw, 25vw'
              />
            </div>
            <div className={`${styles.photoCard} ${styles.bottomPhoto}`}>
              <Image
                src='/images/home/ho-a-chiao_temple.png'
                alt='廟宇建築紀錄'
                fill
                sizes='(max-width: 760px) 45vw, 25vw'
              />
            </div>
            <span className={styles.postmark} />
            <span className={styles.locationPin} />
          </div>
        </section>

        <section className={styles.stories} aria-label='文章列表'>
          <div className={styles.sectionHeading}>
            <div className={styles.headingPlaceholders}>
              <h2 className={styles.sectionTitle}>最近的故事</h2>
              <span className={`${styles.brushStroke} ${styles.headingBrush}`} />
            </div>
            <Link href='/blogs' className={styles.viewAll}>
              查看全部文章 <span aria-hidden='true'>→</span>
            </Link>
          </div>
          <HomeStories />
        </section>

        <HomeTopicsFeature />
      </main>
      <Footer />
    </>
  );
}
