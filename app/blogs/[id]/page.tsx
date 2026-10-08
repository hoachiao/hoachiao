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
import { STORY_CATEGORY } from '@lib/blogCategories';

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
    keepPreviousData: true,
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
  if (error) return <div>failed to load</div>;
  if (isLoading)
    return (
      <div className='d-flex justify-content-center py-5'>
        <div className='spinner-border text-primary' role='status'>
          <span className='visually-hidden'>Loading...</span>
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

  return (
    <div>
      <Navbar path={navbarPath} />
      <div className={styles.container}>
        <div className={styles.blogContainer}>
        {data && Object.keys(data).length > 0 && (
          <>
            <div className={styles.headerRow}>
              <h1>{blog.title}</h1>
              {blog.date && <h6 className={styles.dateTag}>{blog.date}</h6>}
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
        <Footer />
      </footer>
    </div>
  );
}
