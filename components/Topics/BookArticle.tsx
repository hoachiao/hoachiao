'use client';

import { useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
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

function Block({ block }: { block: BlogBlock }) {
  if (block.type === 'image') return <figure><img src={block.url} alt={block.caption || '文章插圖'} loading='lazy' />{block.caption && <figcaption><AutoLinkText text={block.caption} /></figcaption>}</figure>;
  if (block.type === 'code') return <BlogCodeBlock code={block.content ?? ''} language={block.language} />;
  if (block.type === 'heading') return <h2><AutoLinkText text={block.content ?? ''} links={block.links} /></h2>;
  return <p><AutoLinkText text={block.content ?? ''} links={block.links} /></p>;
}

export default function BookArticle({ blog, lang }: { blog: BlogsType; lang: 'zh' | 'en' }) {
  const params = useSearchParams();
  const id = String(blog._id ?? blog.id);
  const requestedTopic = params.get('topic');
  const eligible = (blog.tags ?? []).filter((tag) => ![STORY_CATEGORY, ...EXCLUDED_TOPIC_CATEGORIES].some((excluded) => excluded.toLowerCase() === tag.toLowerCase()));
  const topic = eligible.find((tag) => tag.toLowerCase() === requestedTopic?.toLowerCase()) ?? eligible[0] ?? '主題專欄';
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
  return <div className={styles.root}>
    <Navbar path='topics' />
    <main className={styles.main}>
      <nav className={styles.toolbar} aria-label='書籍導覽'><Link href={catalog}>← 回到目錄</Link><span>{topic}</span><Link href={`/topics?lang=${lang}`}>主題書架 ↗</Link></nav>
      <div ref={anchor} tabIndex={-1} className={styles.readingAnchor}>
        <article className={styles.spread} aria-label={`${blog.title}書頁`}>
          <header className={styles.leftPage} tabIndex={0} aria-label='章節標題與作者資訊'>
            <p className={styles.kicker}>A-CHIAO LIBRARY / {chapter >= 0 ? `CHAPTER ${String(chapter + 1).padStart(2, '0')}` : 'READING'}</p>
            <div className={styles.titleBlock}><span className={styles.topic}>{topic}</span><h1>{blog.title}</h1><p className={styles.byline}>何阿樵{blog.date ? ` · ${blog.date.slice(0, 10)}` : ''}</p></div>
            <div className={styles.leftFoot}><span>閱讀・田野・研究</span><span>{chapter >= 0 ? `${chapter + 1} / ${book?.articles.length} 章` : '主題專欄'}</span></div>
          </header>
          <section className={styles.rightPage} aria-label='文章內容'>
            <div className={styles.runningHead}><span>{isPdf ? 'PDF READING' : 'READING NOTES'}</span><span>{String(current + 1).padStart(2, '0')}</span></div>
            <div className={styles.prose} tabIndex={0} role='region' aria-label='書頁正文，內容較長時可在此捲動' key={`${id}:${lang}:${current}`}>
              {isPdf ? <><p><a href={`${blog.pdfUrl}#page=${blog.startPage || 1}`} target='_blank' rel='noopener noreferrer'>另開 PDF 閱讀 ↗</a></p><iframe title={`${blog.title} PDF`} src={`${blog.pdfUrl}#page=${blog.startPage || 1}`} /></> : content.length ? content.map((block, index) => <Block key={index} block={block} />) : <p>這篇文章目前尚無可顯示的正文。</p>}
              {current + 1 === count && !!blog.reference?.length && <aside className={styles.references}><h2>參考資料</h2><ol>{blog.reference.map((reference) => <li key={reference.id}><a href={reference.link} target='_blank' rel='noopener noreferrer'>{reference.title}</a></li>)}</ol></aside>}
            </div>
            <div className={styles.folio}>{current + 1 === count ? '本章完' : '翻頁，繼續閱讀'} <span>— {current + 1} —</span></div>
          </section>
        </article>
      </div>
      <nav className={styles.controls} aria-label='書頁翻頁'>
        {previous ? <Link href={previous} scroll={false} rel='prev'>← {current > 0 ? '上一頁' : '上一章'}</Link> : <span aria-disabled='true'>← 上一頁</span>}
        <div className={styles.progress}><span aria-live='polite'>本章 {current + 1} / {count} 頁</span><progress value={current + 1} max={count} aria-label='本章閱讀進度' /></div>
        {next ? <Link href={next} scroll={false} rel='next'>{current + 1 < count ? '下一頁' : '下一章'} →</Link> : <Link href={catalog}>回目錄 ↗</Link>}
      </nav>
      {error && <p className={styles.notice} role='status'>章節導覽暫時無法載入，仍可閱讀本篇。<button onClick={() => mutate()}>重試</button></p>}
    </main>
    <Footer />
  </div>;
}
