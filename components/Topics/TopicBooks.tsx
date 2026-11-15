'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import useSWR from 'swr';
import Navbar from '@components/Navbar/Navbar';
import Footer from '@components/Footer/Footer';
import AutoLinkText from '@components/AutoLinkText/AutoLinkText';
import { fetchTopicBooks, TopicBook } from '@lib/topicBooks';
import styles from './TopicBooks.module.scss';
import { bookArticleHref } from '@lib/bookPages';

const number = (value: number) => String(value).padStart(2, '0');
const topicHref = (lang: string, tag?: string) => `/topics?${new URLSearchParams({ lang, ...(tag ? { tag } : {}) })}`;

function Cover({ book, index, large = false, lang }: { book: TopicBook; index: number; large?: boolean; lang: string }) {
  return (
    <div className={`${styles.cover} ${large ? styles.largeCover : ''}`} data-tone={index % 4}>
      {book.cover && <img src={book.cover} alt='' className={styles.coverImage} loading={large ? 'eager' : 'lazy'} onError={(event) => { event.currentTarget.style.visibility = 'hidden'; }} />}
      <div className={styles.coverShade} />
      <div className={styles.coverText}>
        <span className={styles.coverLabel}>A-CHIAO LIBRARY / VOL. {number(index + 1)}</span>
        <div className={styles.coverTitle}>{book.title}</div>
        <span className={styles.coverSubtitle}>{lang === 'en' ? 'Reading · Fieldwork · Research' : '閱讀・田野・研究'}</span>
        <span className={styles.coverAuthor}>{lang === 'en' ? 'By Ho A-Chiao' : '何阿樵 著'} <span>{lang === 'en' ? `${number(book.articles.length)} ARTICLES` : `${number(book.articles.length)} 篇收錄`}</span></span>
      </div>
    </div>
  );
}

function BookReader({ book, index, lang }: { book: TopicBook; index: number; lang: string }) {
  const searchParams = useSearchParams();
  const [opened, setOpened] = useState(searchParams.get('open') === '1');
  const [page, setPage] = useState(0);
  const heading = useRef<HTMLHeadingElement>(null);
  const openButton = useRef<HTMLButtonElement>(null);
  const pageSize = 6;
  const pages = Math.ceil(book.articles.length / pageSize);
  const chapters = book.articles.slice(page * pageSize, (page + 1) * pageSize);
  const lead = book.articles.find((article) => article.summary);
  const openBook = () => setOpened(true);
  useEffect(() => {
    if (opened) heading.current?.focus();
  }, [opened]);
  return (
    <>
      <div className={styles.readerBar}>
        <Link href={topicHref(lang)}>{lang === 'en' ? '← Back to topics' : '← 返回主題書架'}</Link>
        <span>VOL. {number(index + 1)} / {book.title}</span>
      </div>
      <section className={`${styles.spread} ${opened ? styles.opened : styles.closed}`} aria-label={lang === 'en' ? `${book.title} topic book` : `${book.title}主題書籍`}>
        <div className={styles.front}>
          <Cover book={book} index={index} large lang={lang} />
          {!opened && <button ref={openButton} type='button' className={styles.openButton} onClick={openBook} aria-expanded={false} aria-controls='book-catalog'>{lang === 'en' ? 'Open this book' : '翻開這本書'} <span aria-hidden='true'>↗</span></button>}
        </div>
        <div id='book-catalog' hidden={!opened} className={styles.paper}>
          <div className={styles.paperHeading}>
          <div><p className={styles.eyebrow}>CONTENTS</p><h2 ref={heading} tabIndex={-1}>{lang === 'en' ? 'Contents' : '目錄'}</h2></div>
          <button type='button' className={styles.textButton} onClick={() => { setOpened(false); requestAnimationFrame(() => openButton.current?.focus()); }}>{lang === 'en' ? 'Close book' : '闔上書本'} ↙</button>
          </div>
          <p className={styles.catalogNote}>{lang === 'en' ? `${book.articles.length} articles · Newest first` : `共 ${book.articles.length} 篇文章 · 依發表日期由新至舊`}</p>
          <ol className={styles.toc} start={page * pageSize + 1}>
            {chapters.map((article, position) => (
              <li key={String(article._id ?? article.id)}>
                <Link href={bookArticleHref(String(article._id ?? article.id), lang, book.title)}>
                  <span className={styles.chapterNumber}>{number(page * pageSize + position + 1)}</span>
                  <span><strong>{article.title}</strong>{article.date && <small>{article.date.slice(0, 10)}</small>}</span>
                  <span aria-hidden='true'>↗</span>
                </Link>
              </li>
            ))}
          </ol>
          <div className={styles.pageNav}>
            <button disabled={page === 0} onClick={() => setPage(page - 1)} aria-label={lang === 'en' ? 'Previous contents page' : '上一頁目錄'}>←</button>
            <span aria-live='polite'>{number(page + 1)} / {number(pages)}</span>
            <button disabled={page + 1 >= pages} onClick={() => setPage(page + 1)} aria-label={lang === 'en' ? 'Next contents page' : '下一頁目錄'}>→</button>
          </div>
        </div>
      </section>
      <section className={styles.introduction}>
        <div><p className={styles.eyebrow}>BETWEEN THE PAGES</p><h2>{lang === 'en' ? <>Follow the words,<br />explore a theme.</> : <>沿著文字，<br />走進一個主題。</>}</h2></div>
        <div><p>{lang === 'en' ? `${book.articles.length} articles in “${book.title}.” Explore their cultural and historical context, one reading note and question at a time.` : `這裡收錄「${book.title}」的 ${book.articles.length} 篇文章。從一段閱讀筆記、一個提問，逐步探索文化與歷史的脈絡。`}</p>
          {lead?.summary && <div className={styles.excerpt}><span>{lang === 'en' ? 'A selection / ' : '篇章選讀 / '}{lead.title}</span><p><AutoLinkText text={lead.summary} links={lead.summaryLinks} /></p></div>}
        </div>
      </section>
    </>
  );
}

export default function TopicBooks() {
  const params = useSearchParams();
  const [lang, setLang] = useState<'zh' | 'en' | null>(null);
  const tag = params.get('tag');
  useEffect(() => {
    const query = params.get('lang');
    let saved: string | null = null;
    try { saved = localStorage.getItem('lang'); } catch {}
    const next = query === 'en' || query === 'zh' ? query : saved === 'en' ? 'en' : 'zh';
    setLang(next);
    try { localStorage.setItem('lang', next); } catch {}
  }, [params]);
  const { data: books, error, isLoading, mutate } = useSWR(lang ? `/api/blogs?scope=topics&lang=${lang}` : null, fetchTopicBooks, { revalidateOnFocus: false });
  const selectedIndex = books?.findIndex((book) => book.title.toLowerCase() === tag?.toLowerCase()) ?? -1;
  const selected = books?.[selectedIndex];
  const loading = !lang || isLoading;
  return (
    <div className={styles.root}>
      <Navbar
        path='topics'
        lang={lang ?? 'zh'}
        languageHref={`/topics?${new URLSearchParams({
          lang: lang === 'en' ? 'zh' : 'en',
          ...(tag ? { tag } : {}),
        })}`}
      />
      <main className={styles.main} lang={lang === 'en' ? 'en' : 'zh-Hant'}>
        <header className={styles.heading}>
          <p className={styles.eyebrow}>{lang === 'en' ? 'THEMATIC COLLECTION / A-CHIAO LIBRARY' : 'THEMATIC COLLECTION / 阿樵的主題書架'}</p>
          <div><h1>{selected ? selected.title : lang === 'en' ? 'Every topic is a book.' : '每個主題，都是一本書。'}</h1><p>{lang === 'en' ? <>Collected readings and reflections,<br />arranged for a slower journey.</> : <>把散落的閱讀與思考，<br />編成可以慢慢翻閱的風景。</>}</p></div>
        </header>
        {loading && <div className={styles.status} role='status'>{lang === 'en' ? 'Preparing the library…' : '正在整理書架…'}</div>}
        {error && <div className={styles.status} role='alert'><p>{lang === 'en' ? 'Unable to load the library. Please try again later.' : '主題書籍載入失敗，請稍後再試。'}</p><button onClick={() => mutate()}>{lang === 'en' ? 'Retry' : '重新載入'}</button></div>}
        {!loading && !error && books && (tag && tag.toLowerCase() !== 'all' ? (
          selected ? <BookReader key={`${lang}:${selected.title}`} book={selected} index={selectedIndex} lang={lang!} /> : <div className={styles.status}><p>{lang === 'en' ? 'This topic could not be found.' : '找不到這本主題書籍。'}</p><Link href={topicHref(lang!)}>{lang === 'en' ? 'Back to topics →' : '返回主題書架 →'}</Link></div>
        ) : (
          <>
            <div className={styles.shelfHeading}><h2>{lang === 'en' ? 'The collection' : '主題藏書'}</h2><span>{number(books.length)} BOOKS / {lang === 'en' ? 'Choose a book to begin' : '選一本，開始閱讀'}</span></div>
            {books.length === 0 ? <p className={styles.status}>{lang === 'en' ? 'The library is being prepared. Topic articles will appear here when available.' : '書架正在準備中，主題文章發布後會在這裡與你見面。'}</p> : <div className={styles.shelf}>
              {books.map((book, index) => <article className={styles.book} key={book.title}>
                <Link href={topicHref(lang!, book.title)} className={styles.bookLink} aria-label={lang === 'en' ? `Browse ${book.title}, ${book.articles.length} articles` : `翻閱${book.title}，共${book.articles.length}篇文章`}>
                  <Cover book={book} index={index} lang={lang ?? 'zh'} />
                  <div className={styles.bookCaption}><h3>{book.title}</h3><span aria-hidden='true'>↗</span></div>
                  <p className={styles.bookMeta}>{lang === 'en' ? `${book.articles.length} articles` : `${book.articles.length} 篇文章`} <span>{lang === 'en' ? 'Browse this book' : '翻閱這本書'}</span></p>
                </Link>
              </article>)}
            </div>}
            <div className={styles.shelfFooter}><span>READ SLOWLY. LOOK CLOSER.</span><p>{lang === 'en' ? 'One book at a time, discover another side of the world.' : '一本一本，讀見世界的不同側面。'}</p></div>
          </>
        ))}
      </main>
      <Footer lang={lang ?? 'zh'} />
    </div>
  );
}
