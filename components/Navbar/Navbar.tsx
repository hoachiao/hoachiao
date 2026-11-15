import styles from './Navbar.module.scss';
import Link from 'next/link';
import Image from 'next/image';
interface NavbarProp {
  path: string;
  lang?: 'zh' | 'en';
  languageHref?: string;
}

const Navbar: React.FC<NavbarProp> = ({
  path,
  lang = 'zh',
  languageHref = `/?lang=${lang === 'zh' ? 'en' : 'zh'}`,
}) => {
  const content = [
    {
      path: 'blogs',
      name: lang === 'en' ? 'Stories' : '故事筆記',
      href: `/blogs?lang=${lang}`,
    },
    { path: 'topics', name: lang === 'en' ? 'Topics' : '主題專欄', href: `/topics?lang=${lang}` },
    { path: 'about', name: lang === 'en' ? 'About' : '關於阿樵', href: `/about?lang=${lang}` },
  ];

  return (
    <header className={styles.header} lang={lang === 'en' ? 'en' : 'zh-Hant'}>
      <nav className={styles.container} aria-label={lang === 'en' ? 'Main navigation' : '主要導覽'}>
        <Link href={`/?lang=${lang}`} className={styles.brand}>
          <Image
            src='/images/a-chiao-logo.png'
            alt=''
            width={52}
            height={52}
          />
          <span>{lang === 'en' ? "A-Chiao's Fieldnotes" : '阿樵四界看'}</span>
        </Link>
        <div className={styles.menu}>
          {content.map((item) => (
            <Link
              href={item.href}
              className={path === item.path ? styles.active : styles.inactive}
              key={item.path}
            >
              {item.name}
            </Link>
          ))}
          <Link
            href={languageHref}
            className={styles.languageSwitch}
            lang={lang === 'en' ? 'zh-Hant' : 'en'}
            aria-label={lang === 'en' ? 'Switch language to Traditional Chinese' : 'Switch language to English'}
          >
            <span className={styles.languageCurrent}>{lang === 'en' ? 'EN' : '中'}</span>
            <span>{lang === 'en' ? '繁中' : 'EN'}</span>
            <svg viewBox='0 0 16 16' aria-hidden='true'>
              <path d='M3 5.5h9m0 0L9.5 3m2.5 2.5L9.5 8M13 10.5H4m0 0L6.5 8M4 10.5 6.5 13' />
            </svg>
          </Link>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
