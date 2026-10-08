import styles from './Footer.module.scss';
import Image from 'next/image';
import Link from 'next/link';

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerContent}>
        <Link href='/' className={styles.brand}>
          <Image
            src='/images/a-chiao-logo.png'
            alt=''
            width={40}
            height={40}
          />
          <span>阿樵四界看</span>
        </Link>
        <nav className={styles.socialLinks} aria-label='社群連結'>
          <a
            href='https://www.facebook.com/profile.php?id=61595198842146'
            target='_blank'
            rel='noopener noreferrer'
            aria-label='Facebook'
          >
            <svg viewBox='0 0 24 24' aria-hidden='true'>
              <path d='M13.5 21v-8.2h2.8l.4-3.2h-3.2v-2c0-.9.3-1.5 1.6-1.5h1.7V3.2c-.3 0-1.4-.2-2.6-.2-2.6 0-4.3 1.6-4.3 4.4v2.2H7v3.2h2.9V21h3.6Z' />
            </svg>
          </a>
          <a
            href='https://www.instagram.com/ho_a_chiao'
            target='_blank'
            rel='noopener noreferrer'
            aria-label='Instagram'
          >
            <svg viewBox='0 0 24 24' aria-hidden='true'>
              <rect
                x='3.5'
                y='3.5'
                width='17'
                height='17'
                rx='5'
                fill='none'
                stroke='currentColor'
                strokeWidth='1.8'
              />
              <circle
                cx='12'
                cy='12'
                r='4'
                fill='none'
                stroke='currentColor'
                strokeWidth='1.8'
              />
              <circle cx='17.7' cy='6.5' r='1.1' />
            </svg>
          </a>
        </nav>
      </div>
    </footer>
  );
};

export default Footer;
