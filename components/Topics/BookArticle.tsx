'use client';

import { useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import useSWR from 'swr';
import Navbar from '@components/Navbar/Navbar';
import Footer from '@components/Footer/Footer';
import AutoLinkText from '@components/AutoLinkText/AutoLinkText';
import BlogCodeBlock from '@components/BlogCodeBlock/BlogCodeBlock';
import { fetchTopicBooks } from '@lib/topicBooks';
import { bookArticleHref, bookPageIndex, paginateBookBlocks } from '@lib/bookPages';
import { EXCLUDED_TOPIC_CATEGORIES, STORY_CATEGORY } from '@lib/blogCategories';
import type { BlogsType, BlogBlock } from '@type/blogs';
import styles from './BookArticle.module.scss';

function Block({ block, lang }: { block: BlogBlock; lang: 'zh' | 'en' }) {
  if (block.type === 'image') return <figure><img src={block.url} alt={block.caption || (lang === 'en' ? 'Article illustration' : '文章插圖')} loading='lazy' />{block.caption && <figcaption><AutoLinkText text={block.caption} /></figcaption>}</figure>;
  if (block.type === 'code') return <BlogCodeBlock code={block.content ?? ''} language={block.language} />;
  if (block.type === 'heading') return <h2><AutoLinkText text={block.content ?? ''} links={block.links} /></h2>;
  return <p><AutoLinkText text={block.content ?? ''} links={block.links} /></p>;
}

export default function BookArticle({ blog, lang }: { blog: BlogsType; lang: 'zh' | 'en' }) {
  const params = useSearchParams();
  const router = useRouter();
  const id = String(blog._id ?? blog.id);
  const [turnDirection, setTurnDirection] = useState<'next' | 'previous'>('next');
  const pointerStart = useRef<{ x: number; y: number } | null>(null);
  const requestedTopic = params.get('topic');
  const eligible = (blog.tags ?? []).filter((tag) => ![STORY_CATEGORY, ...EXCLUDED_TOPIC_CATEGORIES].some((excluded) => excluded.toLowerCase() === tag.toLowerCase()));
  const topic =
    eligible.find((tag) => tag.toLowerCase() === requestedTopic?.toLowerCase()) ??
    eligible[0] ??
    (lang === 'en' ? 'Topics' : '主題專欄');
  const { data: books, error, mutate } = useSWR(`/api/blogs?scope=topics&lang=${lang}`, fetchTopicBooks, { revalidateOnFocus: false });
  const book = books?.find((item) => item.title.toLowerCase() === topic.toLowerCase());
  const chapter = book?.articles.findIndex((item) => String(item._id ?? item.id) === id) ?? -1;
  const pages = useMemo(() => paginateBookBlocks(blog.blocks ?? []), [blog.blocks]);
  const page = bookPageIndex(params.get('page'), pages.length);
  const content = pages[page];
  const isPdf = lang === 'en' && !!blog.pdfUrl && blog.tags?.some((tag) => ['dissertation', 'disseration'].includes(tag.toLowerCase()));
  const count = isPdf ? 1 : pages.length;
  const current = isPdf ? 0 : page;
  const previousChapter = chapter > 0 ? book?.articles[chapter - 1] : undefined;
  const nextChapter = chapter >= 0 ? book?.articles[chapter + 1] : undefined;
  const previous = current > 0 ? bookArticleHref(id, lang, topic, current) : previousChapter ? bookArticleHref(String(previousChapter._id ?? previousChapter.id), lang, topic, 'last') : null;
  const next = current + 1 < count ? bookArticleHref(id, lang, topic, current + 2) : nextChapter ? bookArticleHref(String(nextChapter._id ?? nextChapter.id), lang, topic) : null;
  const catalog = `/topics?${new URLSearchParams({ lang, tag: topic, open: '1' })}`;
  const anchor = useRef<HTMLDivElement>(null);
  const lastLocation = useRef('');
  useEffect(() => {
    const location = `${id}:${lang}:${current}`;
    if (lastLocation.current !== location) {
      anchor.current?.scrollIntoView({ block: 'start' });
      anchor.current?.focus({ preventScroll: true });
    }
    lastLocation.current = location;
  }, [id, lang, current]);
  const turnPage = (direction: 'next' | 'previous') => {
    const destination = direction === 'next' ? next : previous;
    if (!destination) return;
    setTurnDirection(direction);
    router.push(destination, { scroll: false });
  };
  const handlePointerDown = (event: ReactPointerEvent<HTMLElement>) => {
    if (!event.isPrimary || event.button !== 0) return;
    if (event.target instanceof Element && event.target.closest('a, button, iframe, input, textarea, select')) return;
    pointerStart.current = { x: event.clientX, y: event.clientY };
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const handlePointerUp = (event: ReactPointerEvent<HTMLElement>) => {
    const start = pointerStart.current;
    pointerStart.current = null;
    if (!start) return;
    const deltaX = event.clientX - start.x;
    const deltaY = event.clientY - start.y;
    if (Math.abs(deltaX) < 56 || Math.abs(deltaX) < Math.abs(deltaY) * 1.25) return;
    turnPage(deltaX < 0 ? 'next' : 'previous');
  };
  return <div className={styles.root}>
    <Navbar path='topics' lang={lang} languageHref={`/blogs/${id}?lang=${lang === 'zh' ? 'en' : 'zh'}`} />
    <main className={styles.main} lang={lang === 'en' ? 'en' : 'zh-Hant'}>
      <nav className={styles.toolbar} aria-label={lang === 'en' ? 'Book navigation' : '書籍導覽'}><Link href={catalog}>{lang === 'en' ? '← Contents' : '← 回到目錄'}</Link><span>{topic}</span><Link href={`/topics?lang=${lang}`}>{lang === 'en' ? 'Topic library ↗' : '主題書架 ↗'}</Link></nav>
      <div ref={anchor} tabIndex={-1} className={styles.readingAnchor}>
        <article
          className={styles.spread}
          aria-label={lang === 'en' ? `${blog.title} reading pages` : `${blog.title}書頁`}
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onPointerCancel={() => { pointerStart.current = null; }}
          onKeyDown={(event) => {
            if (event.key === 'ArrowRight') {
              event.preventDefault();
              turnPage('next');
            } else if (event.key === 'ArrowLeft') {
              event.preventDefault();
              turnPage('previous');
            }
          }}
        >
          <header className={styles.leftPage} tabIndex={0} aria-label={lang === 'en' ? 'Chapter title and author' : '章節標題與作者資訊'}>
            <p className={styles.kicker}>A-CHIAO LIBRARY / {chapter >= 0 ? `CHAPTER ${String(chapter + 1).padStart(2, '0')}` : 'READING'}</p>
            <div className={styles.titleBlock}><span className={styles.topic}>{topic}</span><h1>{blog.title}</h1><p className={styles.byline}><span>{lang === 'en' ? 'By Ho A-Chiao' : '何阿樵'}</span>{blog.date && <time dateTime={blog.date}>{blog.date.slice(0, 10)}</time>}</p>{lang === 'en' && <p className={styles.translationNote}><span aria-hidden='true'>✦</span> This English version was translated with AI.</p>}</div>
            <div className={styles.leftFoot}><span>{lang === 'en' ? 'Reading · Fieldwork · Research' : '閱讀・田野・研究'}</span><span>{chapter >= 0 ? `${chapter + 1} / ${book?.articles.length} ${lang === 'en' ? 'chapters' : '章'}` : lang === 'en' ? 'Topics' : '主題專欄'}</span></div>
          </header>
          <section className={styles.rightPage} aria-label={lang === 'en' ? 'Article content' : '文章內容'}>
            <div className={styles.runningHead}><span>{isPdf ? 'PDF READING' : 'READING NOTES'}</span><span>{String(current + 1).padStart(2, '0')}</span></div>
            <div className={styles.prose} tabIndex={0} role='region' aria-label={lang === 'en' ? 'Scrollable article text. Swipe or use the arrow keys to turn pages.' : '書頁正文，可滑動或使用方向鍵翻頁'} key={`${id}:${lang}:${current}`}>
              <div className={turnDirection === 'next' ? styles.pageContentNext : styles.pageContentPrevious}>
                {isPdf ? <><p><a href={`${blog.pdfUrl}#page=${blog.startPage || 1}`} target='_blank' rel='noopener noreferrer'>{lang === 'en' ? 'Open PDF ↗' : '另開 PDF 閱讀 ↗'}</a></p><iframe title={`${blog.title} PDF`} src={`${blog.pdfUrl}#page=${blog.startPage || 1}`} /></> : content.length ? content.map((block, index) => <Block key={index} block={block} lang={lang} />) : <p>{lang === 'en' ? 'There is no article text available yet.' : '這篇文章目前尚無可顯示的正文。'}</p>}
                {current + 1 === count && !!blog.reference?.length && <aside className={styles.references}><h2>{lang === 'en' ? 'References' : '參考資料'}</h2><ol>{blog.reference.map((reference) => <li key={reference.id}><a href={reference.link} target='_blank' rel='noopener noreferrer'>{reference.title}</a></li>)}</ol></aside>}
              </div>
            </div>
            <div className={styles.folio}>{current + 1 === count ? (lang === 'en' ? 'End of chapter' : '本章完') : (lang === 'en' ? 'Swipe or use arrows to continue' : '滑動或使用方向鍵繼續')} <span>— {current + 1} —</span></div>
          </section>
        </article>
      </div>
      <nav className={styles.controls} aria-label={lang === 'en' ? 'Page navigation' : '書頁翻頁'}>
        {previous ? <Link href={previous} scroll={false} rel='prev' onClick={() => setTurnDirection('previous')}>← {current > 0 ? (lang === 'en' ? 'Previous page' : '上一頁') : (lang === 'en' ? 'Previous chapter' : '上一章')}</Link> : <span aria-disabled='true'>← {lang === 'en' ? 'Previous page' : '上一頁'}</span>}
        <div className={styles.progress}><span aria-live='polite'>{lang === 'en' ? `Chapter ${current + 1} of ${count}` : `本章 ${current + 1} / ${count} 頁`}</span><progress value={current + 1} max={count} aria-label={lang === 'en' ? 'Reading progress' : '本章閱讀進度'} /></div>
        {next ? <Link href={next} scroll={false} rel='next' onClick={() => setTurnDirection('next')}>{current + 1 < count ? (lang === 'en' ? 'Next page' : '下一頁') : (lang === 'en' ? 'Next chapter' : '下一章')} →</Link> : <Link href={catalog}>{lang === 'en' ? 'Back to contents ↗' : '回目錄 ↗'}</Link>}
      </nav>
      {error && <p className={styles.notice} role='status'>{lang === 'en' ? 'Chapter navigation is unavailable; you can still read this article.' : '章節導覽暫時無法載入，仍可閱讀本篇。'}<button onClick={() => mutate()}>{lang === 'en' ? 'Retry' : '重試'}</button></p>}
    </main>
    <Footer lang={lang} />
  </div>;
}
