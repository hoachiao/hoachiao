import Navbar from '@components/Navbar/Navbar';
import Footer from '@components/Footer/Footer';
import Image from 'next/image';
import Link from 'next/link';
import HomeStories from '@components/Home/HomeStories';
import HomeTopicsFeature from '@components/Home/HomeTopicsFeature';
import styles from '../styles/Home.module.scss';
import type { Metadata } from 'next';

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string }>;
}): Promise<Metadata> {
  const { lang } = await searchParams;
  return lang === 'en'
    ? {
        title: "A-Chiao's Fieldnotes | Stories from Taiwan and Southeast Asia",
        description:
          'Ho A-Chiao documents the neighborhoods, beliefs, languages, and lives that connect Taiwan and Southeast Asia.',
        alternates: { canonical: '/?lang=en' },
      }
    : {
        title: '阿樵四界看｜臺灣與東南亞的歷史文化故事',
        description:
          '我是何阿樵，讀歷史，也寫程式。從臺灣到東南亞，記錄街區、信仰、語言與人的故事，追查日常裡的歷史線索。',
        alternates: { canonical: '/' },
      };
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string }>;
}) {
  const { lang: requestedLang } = await searchParams;
  const lang = requestedLang === 'en' ? 'en' : 'zh';
  return (
    <>
      <Navbar path='home' lang={lang} languageHref={`/?lang=${lang === 'zh' ? 'en' : 'zh'}`} />
      <main className={styles.page} lang={lang === 'en' ? 'en' : 'zh-Hant'}>
        <section className={styles.hero} aria-label={lang === 'en' ? 'Home' : '首頁主視覺'}>
          <div className={styles.heroCopy}>
            <span className={styles.eyebrow}>HO-A-CHIAO</span>
            <h1 className={`${styles.heroTitle} ${lang === 'en' ? styles.heroTitleEnglish : ''}`}>{lang === 'en' ? "A-Chiao's Fieldnotes" : '阿樵四界看'}</h1>
            <span className={`${styles.brushStroke} ${styles.heroBrush}`} />
            <h2 className={styles.heroSubtitle}>
              {lang === 'en' ? 'Exploring everyday life through its hidden histories.' : '四界走走，追查日常裡的歷史線索。'}
            </h2>
            <p className={styles.heroDescription}>
              {lang === 'en' ? 'I’m Ho A-Chiao, a historian and former software engineer. I document the neighborhoods, beliefs, languages, and lives that connect Taiwan and Southeast Asia.' : '我是何阿樵，讀歷史，也寫程式。從臺灣到東南亞，記錄街區、信仰、語言與人的故事。'}
            </p>
            <div className={styles.heroActions}>
              <Link href={`/blogs?lang=${lang}`} className={styles.primaryAction}>
                  {lang === 'en' ? 'Start reading' : '開始閱讀'} <span aria-hidden='true'>→</span>
              </Link>
              <Link href={`/about?lang=${lang}`} className={styles.secondaryAction}>
                {lang === 'en' ? 'About A-Chiao' : '關於阿樵'}
              </Link>
            </div>
          </div>

          <div className={styles.photoCollage}>
            <div className={`${styles.photoCard} ${styles.mainPhoto}`}>
              <Image
                src='/images/home/ho-a-chiao.png'
                alt={lang === 'en' ? "A-Chiao's Fieldnotes" : '阿樵四界看'}
                fill
                priority
                sizes='(max-width: 760px) 80vw, 40vw'
              />
            </div>
            <div className={`${styles.photoCard} ${styles.sidePhoto}`}>
              <Image
                src='/images/home/ho-a-chiao_vietnam.png'
                alt={lang === 'en' ? 'Travel notes from Vietnam' : '越南旅途紀錄'}
                fill
                sizes='(max-width: 760px) 45vw, 25vw'
              />
            </div>
            <div className={`${styles.photoCard} ${styles.bottomPhoto}`}>
              <Image
                src='/images/home/ho-a-chiao_temple.png'
                alt={lang === 'en' ? 'Temple architecture' : '廟宇建築紀錄'}
                fill
                sizes='(max-width: 760px) 45vw, 25vw'
              />
            </div>
            <span className={styles.postmark} />
            <span className={styles.locationPin} />
          </div>
        </section>

        <section className={styles.stories} aria-label={lang === 'en' ? 'Stories' : '文章列表'}>
          <div className={styles.sectionHeading}>
            <div className={styles.headingPlaceholders}>
              <h2 className={styles.sectionTitle}>{lang === 'en' ? 'Latest Stories' : '最近的故事'}</h2>
              <span className={`${styles.brushStroke} ${styles.headingBrush}`} />
            </div>
            <Link href={`/blogs?lang=${lang}`} className={styles.viewAll}>
            {lang === 'en' ? 'View all stories' : '查看全部文章'} <span aria-hidden='true'>→</span>
            </Link>
          </div>
          <HomeStories lang={lang} />
        </section>

        <HomeTopicsFeature lang={lang} />
      </main>
      <Footer lang={lang} />
    </>
  );
}
