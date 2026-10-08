'use client';

import Card from '@components/Card/Card';
import Footer from '@components/Footer/Footer';
import Navbar from '@components/Navbar/Navbar';
import styles from '@styles/Blogs.module.scss';
import { BlogsType } from '@type/blogs';
import useSWR, { useSWRConfig } from 'swr';
import { apiFetcher } from '@lib/apiFetcher';
import { useEffect, useMemo, useRef, useState } from 'react';
import { STORY_CATEGORY } from '@lib/blogCategories';
import { useSearchParams } from 'next/navigation';
import AutoLinkText from '@components/AutoLinkText/AutoLinkText';
const pageSize = 5;

interface BlogsClientProps {
  mode: 'stories' | 'topics';
}

export default function BlogsClient({ mode }: BlogsClientProps) {
  const [lang, setLang] = useState<'zh' | 'en' | null>(null);
  const searchParams = useSearchParams();
  const initialTag = searchParams.get('tag');
  const [activeTag, setActiveTag] = useState<string>(
    mode === 'stories' ? STORY_CATEGORY : 'All'
  );
  const [page, setPage] = useState(1);
  const appliedInitialTag = useRef<string | null>(null);
  const currentLang = lang ?? 'zh';
  const { cache } = useSWRConfig();
  const tagParam =
    mode === 'topics' && activeTag !== 'All'
      ? `&tag=${encodeURIComponent(activeTag)}`
      : '';
  const key = lang
    ? `/api/blogs?lang=${lang}&page=${page}&limit=${pageSize}&scope=${mode}${tagParam}`
    : null;
  const fallbackData = key ? cache.get(key) : undefined;
  const {
    data,
    error,
    isLoading,
  } = useSWR(key, apiFetcher, {
    keepPreviousData: true,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    fallbackData,
  });
  

  const items = Array.isArray(data?.items) ? data.items : [];
  const allTags = Array.isArray(data?.tags) ? data.tags : [];
  const total = typeof data?.total === 'number' ? data.total : 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const tags = useMemo(() => {
    if (mode === 'stories') return [];
    if (!Array.isArray(allTags) || allTags.length === 0) return ['All'];

    return ['All', ...allTags];
  }, [allTags, mode]);
  

  const filteredBlogs = useMemo(() => {
    if (!Array.isArray(items)) return [];
    if (mode === 'stories' || activeTag === 'All') return items;
    return items.filter((blog: BlogsType) =>
      Array.isArray(blog.tags) ? blog.tags.some((tag) => tag.toLowerCase() === activeTag.toLowerCase()) : false
    );
  }, [activeTag, items, mode]);

  const renderDescription = (blog: BlogsType) => {
    return blog.summary ? (
      <p className='mt-3'>
        <AutoLinkText text={blog.summary} links={blog.summaryLinks} />
      </p>
    ) : null;
  };

  useEffect(() => {
    if (mode === 'stories') return;
    if (appliedInitialTag.current === initialTag) return;
    if (!initialTag) {
      appliedInitialTag.current = null;
      setActiveTag('All');
      return;
    }
    const lower = initialTag.toLowerCase();
    const matched = tags.find((tag) => tag.toLowerCase() === lower);
    if (matched) {
      appliedInitialTag.current = initialTag;
      setActiveTag(matched);
      setPage(1);
    }
  }, [initialTag, tags, mode]);

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
  
  return (
    <div>
      <Navbar path={mode} />
      <main className={`${styles.container} ${styles[mode]}`}>
        <div className={styles.headerRow}>
          <h1>{mode === 'stories' ? '故事筆記' : '主題專欄'}</h1>
        </div>
        {!lang && (
          <div className='d-flex justify-content-center py-5'>
            <div className='spinner-border text-primary' role='status'>
              <span className='visually-hidden'>Loading...</span>
            </div>
          </div>
        )}
        {lang && error && <div role='alert'>文章載入失敗，請稍後再試。</div>}
        {lang && isLoading && (
          <div className='d-flex justify-content-center py-5'>
            <div className='spinner-border text-primary' role='status'>
              <span className='visually-hidden'>Loading...</span>
            </div>
          </div>
        )}
        {lang && Array.isArray(items) && (
          <>
            {mode === 'topics' && (
              <ul className={`nav nav-tabs mb-4 ${styles.tagsRow}`}>
                {tags.map((tag) => (
                  <li key={tag} className='nav-item'>
                    <button
                      type='button'
                      className={`nav-link ${activeTag === tag ? 'active' : ''}`}
                      onClick={() => {
                        setActiveTag(tag);
                        setPage(1);
                      }}
                    >
                      {tag}
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <hr />
            <div className={styles.blogsContainer}>
              {filteredBlogs.length > 0 ? (
                filteredBlogs.map((blog: BlogsType) => {
                  return (
                    <Card
                      key={blog.id}
                      title={blog.title}
                      description={renderDescription(blog)}
                      date={blog.date}
                      img={blog.imageUrl}
                      category={
                        mode === 'topics'
                          ? blog.tags?.find(
                              (tag) =>
                                tag.toLowerCase() !==
                                STORY_CATEGORY.toLowerCase()
                            )
                          : undefined
                      }
                      variant={mode === 'topics' ? 'editorial' : 'stories'}
                      link={`/blogs/${blog._id ?? blog.id}?lang=${currentLang}`}
                      linkDescription={
                        currentLang === 'zh' ? '看更多' : 'Read More'
                      }
                      size={{}}
                    />
                  );
                })
              ) : (
                <p>{mode === 'stories' ? '目前還沒有故事筆記。' : '目前還沒有主題文章。'}</p>
              )}
            </div>
            {totalPages > 1 && (
              <nav
                className='d-flex justify-content-center my-4'
                aria-label='Blog pagination'
              >
                <ul className='pagination'>
                  <li className={`page-item ${page === 1 ? 'disabled' : ''}`}>
                    <button
                      type='button'
                      className='page-link border-0'
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      aria-label='Previous'
                    >
                      <span aria-hidden='true'>&laquo;</span>
                    </button>
                  </li>
                  {Array.from({ length: totalPages }, (_, idx) => idx + 1).map(
                    (pageNum) => (
                      <li
                        key={pageNum}
                        className={`page-item ${
                          pageNum === page ? 'active' : ''
                        }`}
                      >
                        <button
                          type='button'
                          className='page-link'
                          onClick={() => setPage(pageNum)}
                        >
                          {pageNum}
                        </button>
                      </li>
                    )
                  )}
                  <li
                    className={`page-item ${
                      page === totalPages ? 'disabled' : ''
                    }`}
                  >
                    <button
                      type='button'
                      className='page-link border-0'
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      aria-label='Next'
                    >
                      <span aria-hidden='true'>&raquo;</span>
                    </button>
                  </li>
                </ul>
              </nav>
            )}
          </>
        )}
      </main>
      <div>
        <Footer />
      </div>
    </div>
  );
}
