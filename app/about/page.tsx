import Footer from '@components/Footer/Footer';
import Navbar from '@components/Navbar/Navbar';
import Image from 'next/image';
import styles from '@styles/EditorialPages.module.scss';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '關於阿樵｜何孟樵',
  description:
    '認識何阿樵：來自雲林莿桐，讀歷史也寫程式，關注臺灣與東南亞的信仰、語言、飲食和遷徙故事。',
  alternates: {
    canonical: '/about',
  },
};

export default function AboutPage() {
  return (
    <>
      <Navbar path='about' />
      <main className={styles.page}>
        <section className={styles.aboutIntro}>
          <div className={styles.aboutCopy}>
            <span className={styles.eyebrow}>ABOUT A-CHIAO</span>
            <h1>關於阿樵</h1>
            <h2>何阿樵｜追查日常文化線索的歷史偵探</h2>
            <p>
              我是何孟樵，也叫何阿樵，來自雲林莿桐。讀過歷史與後殖民文化，也做過幾年前端工程師。
            </p>
            <p>
              我喜歡逛廟、走街區、看老房子，也喜歡追問那些看起來理所當然的事：這個習慣從哪裡來？這個詞怎麼抵達這裡？同樣的文化，到了另一個地方，又變成什麼樣子？
            </p>
          </div>
          <Image
            className={styles.aboutImage}
            src='/images/home/about-portrait.webp'
            alt='阿樵'
            width={1108}
            height={1477}
            priority
          />
        </section>
        <section className={styles.aboutSection}>
          <h2>四界看，也採故事</h2>
          <p>
            我的關注從臺灣延伸到東南亞，尤其是信仰、語言、飲食，以及人們遷徙留下的痕跡。旅行時拍下的細節，常常是回來查資料、繼續寫故事的起點。
          </p>
          <p>
            目前正在整理檳城的城市與文化故事，也透過「阿樵採故事」分享短篇內容。這個網站收錄完整文章、主題專欄與參考資料，讓有興趣的讀者可以繼續讀下去。
          </p>
        </section>
        <section className={styles.aboutDetails}>
          <div className={styles.aboutSection}>
            <h2>背景</h2>
            <ul className={styles.backgroundList}>
              <li>國立臺灣大學歷史學系學士</li>
              <li>倫敦大學 Goldsmiths 後殖民文化與全球政策碩士</li>
            </ul>
          </div>
          <div className={styles.aboutSection}>
            <h2>聯絡阿樵</h2>
            <p>
              如果你想聊文章裡的故事，或有採訪、講座、內容合作的邀請，歡迎來信。
            </p>
            <a className={styles.emailLink} href='mailto:ho.a.chiao.ho@gmail.com'>
              ho.a.chiao.ho@gmail.com
            </a>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
