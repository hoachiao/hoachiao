'use client';

import { useParams, useSearchParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import Navbar from '@components/Navbar/Navbar';
import styles from '@styles/BlogPage.module.scss';
import { BlogsType } from 'type/blogs';
import Footer from '@components/Footer/Footer';
import { apiFetcher } from '@lib/apiFetcher';
import useSWR, { useSWRConfig } from 'swr';
import NotFound from '../../not-found';
import CodeBlog from '@components/BlogDetail/CodeBlog';
import ReadingBlog from '@components/BlogDetail/ReadingBlog';
import BookArticle from '@components/Topics/BookArticle';
import { EXCLUDED_TOPIC_CATEGORIES, STORY_CATEGORY } from '@lib/blogCategories';

export default function BlogPage() {
  const params = useParams();
  const id = params.id as string;
  const [lang, setLang] = useState<'zh' | 'en' | null>(null);
  const searchParams = useSearchParams();
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const qp = searchParams.get('lang');
    const saved = window.localStorage.getItem('lang');
    const nextLang =
      qp === 'en' || qp === 'zh'
        ? qp
        : saved === 'en' || saved === 'zh'
          ? saved
          : 'zh';
    setLang(nextLang);
  }, [searchParams]);
  useEffect(() => {
    if (typeof window === 'undefined' || !lang) return;
    window.localStorage.setItem('lang', lang);
  }, [lang]);
  const currentLang = lang ?? 'zh';
  const { cache } = useSWRConfig();
  const key = lang ? `/api/blogs/${id}?lang=${lang}` : null;
  const fallbackData = key ? cache.get(key) : undefined;
  const { data, error, isLoading, mutate } = useSWR(key, apiFetcher, {
    keepPreviousData: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    fallbackData,
  });
  useSWR(
    lang === 'en' || !lang ? null : `/api/blogs/${id}?lang=${lang}&live=1`,
    apiFetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      onSuccess: (liveData) => {
        if (Array.isArray(liveData)) {
          mutate(liveData, false);
        }
      },
    }
  );
  useEffect(() => {
    if (!data || !Array.isArray(data) || data.length === 0) return;
    const rawTitle = (data[0] as BlogsType)?.title || 'Blog';
    const maxLength = 40;
    const truncatedTitle =
      rawTitle.length > maxLength
        ? `${rawTitle.slice(0, maxLength)}...`
        : rawTitle;
    document.title = truncatedTitle;
  }, [data]);
  if (!lang)
    return (
      <div className='d-flex justify-content-center py-5'>
        <div className='spinner-border text-primary' role='status'>
          <span className='visually-hidden'>Loading...</span>
        </div>
      </div>
    );
  if (error) return <div>{currentLang === 'en' ? 'Failed to load article.' : '文章載入失敗。'}</div>;
  if (isLoading)
    return (
      <div className='d-flex justify-content-center py-5'>
        <div className='spinner-border text-primary' role='status'>
          <span className='visually-hidden'>{currentLang === 'en' ? 'Loading article…' : '正在載入文章…'}</span>
        </div>
      </div>
    );
  if (!data || !Array.isArray(data) || data.length === 0) {
    return <NotFound />;
  }

  const blog = data[0] as BlogsType;
  const isCodeBlog = blog.tags?.includes('NeetCode');
  const navbarPath = blog.tags?.some(
    (tag) => tag.toLowerCase() === STORY_CATEGORY.toLowerCase()
  )
    ? 'blogs'
    : 'topics';

  if (navbarPath === 'topics' && !isCodeBlog && blog.tags?.length && !blog.tags.some((tag) => EXCLUDED_TOPIC_CATEGORIES.some((excluded) => excluded.toLowerCase() === tag.toLowerCase()))) {
    return <BookArticle blog={blog} lang={currentLang} />;
  }

  return (
    <div>
      <Navbar
        path={navbarPath}
        lang={currentLang}
        languageHref={`/blogs/${id}?lang=${currentLang === 'zh' ? 'en' : 'zh'}`}
      />
      <div
        className={`${styles.container} ${currentLang === 'en' ? styles.englishArticle : ''}`}
        lang={currentLang === 'en' ? 'en' : 'zh-Hant'}
      >
        <div className={styles.blogContainer}>
        {data && Object.keys(data).length > 0 && (
          <>
            <div className={styles.headerRow}>
              <h1>{blog.title}</h1>
              <div className={styles.articleMeta}>
                {currentLang === 'en' && (
                  <span className={styles.translationNote}>
                    <span aria-hidden='true'>✦</span>
                    This English version was translated with AI.
                  </span>
                )}
                {blog.date && <h6 className={styles.dateTag}>{blog.date}</h6>}
              </div>
            </div>
            <div className={styles.content}>
              {isCodeBlog ? (
                <CodeBlog blog={blog} />
              ) : (
                <ReadingBlog blog={blog} lang={currentLang} />
              )}
            </div>
            </>
          )}
        </div>
      </div>
      <footer>
        <Footer lang={currentLang} />
      </footer>
    </div>
  );
}
