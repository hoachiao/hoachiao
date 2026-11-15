import Footer from '@components/Footer/Footer';
import Navbar from '@components/Navbar/Navbar';
import Image from 'next/image';
import styles from '@styles/EditorialPages.module.scss';
import type { Metadata } from 'next';

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string }>;
}): Promise<Metadata> {
  const { lang } = await searchParams;
  return lang === 'en'
    ? {
        title: 'About A-Chiao | Ho Meng-Chiao',
        description:
          'Meet Ho A-Chiao, a historian tracing the everyday cultural connections between Taiwan and Southeast Asia.',
        alternates: { canonical: '/about?lang=en' },
      }
    : {
        title: '關於阿樵｜何孟樵',
        description:
          '認識何阿樵：來自雲林莿桐，讀歷史也寫程式，關注臺灣與東南亞的信仰、語言、飲食和遷徙故事。',
        alternates: { canonical: '/about' },
      };
}

const mediaArticles = [
  {
    title:
      '臺灣人為什麼要關心「以巴衝突」？——我在倫敦「停止殺戮」聲援活動現場看到的事',
    url: 'https://crossing.cw.com.tw/article/9730',
    date: '2018-04-09',
  },
  {
    title: '同為白人眼裡的「有色人種」，你有發現自己正在「歧視黑人」嗎？',
    url: 'https://crossing.cw.com.tw/article/9459',
    date: '2018-02-21',
  },
  {
    title: '誰有資格說出「都過去了，忘記吧」？──慰安婦不只是歷史議題，聽聽外國人怎麼說',
    url: 'https://crossing.cw.com.tw/article/9355',
    date: '2018-01-26',
  },
  {
    title:'從殖民帝國到棕櫚油種植園：瀰漫在東南亞煙霾背後的全球資本與權力',
    url:'https://www.thenewslens.com/article/270642',
    date:'2026-10-20'
  }
];

export default async function AboutPage({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string }>;
}) {
  const { lang: requestedLang } = await searchParams;
  const lang = requestedLang === 'en' ? 'en' : 'zh';
  return (
    <>
      <Navbar path='about' lang={lang} languageHref={`/about?lang=${lang === 'zh' ? 'en' : 'zh'}`} />
      <main className={styles.page} lang={lang === 'en' ? 'en' : 'zh-Hant'}>
        <section className={styles.aboutIntro}>
          <div className={styles.aboutCopy}>
            <span className={styles.eyebrow}>ABOUT A-CHIAO</span>
            <h1>{lang === 'en' ? 'About A-Chiao' : '關於阿樵'}</h1>
            <h2>{lang === 'en' ? 'Ho A-Chiao | A history detective tracing the clues hidden in everyday culture' : '何阿樵｜追查日常文化線索的歷史偵探'}</h2>
            <p>
              {lang === 'en' ? 'I’m Ho Meng-Chiao, also known as Ho A-Chiao, from Citong, Yunlin, Taiwan. I studied history and postcolonial studies, and previously worked as a frontend engineer.' : '我是何孟樵，也叫何阿樵，來自雲林莿桐。讀過歷史與後殖民文化，也做過幾年前端工程師。'}
            </p>
            <p>
              {lang === 'en' ? 'I enjoy visiting temples, walking through neighborhoods, and looking at old houses. I’m also drawn to questions about things we take for granted: Where did this custom come from? How did this word arrive here? What happens to a culture when it travels somewhere else?' : '我喜歡逛廟、走街區、看老房子，也喜歡追問那些看起來理所當然的事：這個習慣從哪裡來？這個詞怎麼抵達這裡？同樣的文化，到了另一個地方，又變成什麼樣子？'}
            </p>
          </div>
          <Image
            className={styles.aboutImage}
            src='/images/home/about-portrait.webp'
            alt={lang === 'en' ? 'A-Chiao' : '阿樵'}
            width={1108}
            height={1477}
            priority
          />
        </section>
        <section className={styles.aboutSection}>
          <h2>{lang === 'en' ? 'Looking around and gathering stories' : '四界看，也採故事'}</h2>
          <p>
            {lang === 'en' ? 'My interests stretch from Taiwan to Southeast Asia, especially beliefs, languages, food, and the traces left by migration. Details I photograph while traveling often become the starting point for further research and stories.' : '我的關注從臺灣延伸到東南亞，尤其是信仰、語言、飲食，以及人們遷徙留下的痕跡。旅行時拍下的細節，常常是回來查資料、繼續寫故事的起點。'}
          </p>
          <p>
            {lang === 'en' ? 'I’m currently documenting the urban and cultural stories of Penang, and sharing short pieces through “A-Chiao Gathers Stories.” This site brings together full-length articles, thematic collections, and references for readers who want to explore further.' : '目前正在整理檳城的城市與文化故事，也透過「阿樵採故事」分享短篇內容。這個網站收錄完整文章、主題專欄與參考資料，讓有興趣的讀者可以繼續讀下去。'}
          </p>
        </section>
        <section className={styles.mediaSection} aria-labelledby='media-title'>
          <h2 id='media-title'>{lang === 'en' ? 'Selected publications' : '媒體刊登'}</h2>
          <p>{lang === 'en' ? 'Articles published by The News Lens and Crossing.' : '刊登於《換日線》與 The News Lens 的文章。'}</p>
          <div className={styles.mediaGrid}>
            {mediaArticles.map((article) => (
              <a
                className={styles.mediaCard}
                href={article.url}
                key={article.url}
                target='_blank'
                rel='noopener noreferrer'
              >
                <span className={styles.mediaPublication}>{article.url.includes('thenewslens') ? 'The News Lens' : lang === 'en' ? 'Crossing' : '換日線'}</span>
                <time className={styles.mediaDate} dateTime={article.date}>
                  {new Date(`${article.date}T00:00:00`).toLocaleDateString(
                    lang === 'en' ? 'en-US' : 'zh-TW',
                    {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      timeZone: 'UTC',
                    }
                  )}
                </time>
                <span className={styles.mediaTitle}>{article.title}</span>
                <span className={styles.mediaArrow} aria-hidden='true'>
                  ↗
                </span>
              </a>
            ))}
          </div>
        </section>
        <section className={styles.aboutDetails}>
          <div className={styles.aboutSection}>
            <h2>{lang === 'en' ? 'Education' : '背景'}</h2>
            <ul className={styles.backgroundList}>
                <li>{lang === 'en' ? 'B.A. in History, National Taiwan University' : '國立臺灣大學歷史學系學士'}</li>
                <li>{lang === 'en' ? 'M.A. in Postcolonial Culture and Global Policy, Goldsmiths, University of London' : '倫敦大學 Goldsmiths 後殖民文化與全球政策碩士'}</li>
            </ul>
          </div>
          <div className={styles.aboutSection}>
            <h2>{lang === 'en' ? 'Contact' : '聯絡阿樵'}</h2>
            <p>
                {lang === 'en' ? 'For conversations about these stories, interview requests, speaking engagements, or collaborations, please get in touch.' : '如果你想聊文章裡的故事，或有採訪、講座、內容合作的邀請，歡迎來信。'}
            </p>
            <a className={styles.emailLink} href='mailto:ho.a.chiao.ho@gmail.com'>
              ho.a.chiao.ho@gmail.com
            </a>
          </div>
        </section>
      </main>
      <Footer lang={lang} />
    </>
  );
}
