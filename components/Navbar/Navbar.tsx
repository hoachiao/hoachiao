import styles from './Navbar.module.scss';
import Link from 'next/link';
import Image from 'next/image';
interface NavbarProp {
  path: string;
}

const Navbar: React.FC<NavbarProp> = ({ path }) => {
  const content = [
    {
      path: 'blogs',
      name: '故事筆記',
      href: '/blogs',
    },
    { path: 'topics', name: '主題專欄', href: '/topics' },
    { path: 'about', name: '關於阿樵', href: '/about' },
  ];

  return (
    <header className={styles.header}>
      <nav className={styles.container} aria-label='主要導覽'>
        <Link href='/' className={styles.brand}>
          <Image
            src='/images/a-chiao-logo.png'
            alt=''
            width={52}
            height={52}
          />
          <span>阿樵四界看</span>
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
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
