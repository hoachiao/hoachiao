'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import useSWR from 'swr';
import { BlogsType } from '@type/blogs';
import AutoLinkText from '@components/AutoLinkText/AutoLinkText';
import styles from '@styles/Home.module.scss';

type BlogsResponse = {
  items: BlogsType[];
};

const ROTATION_INTERVAL = 15_000;
const MOBILE_QUERY = '(max-width: 760px)';

const HomeTopicsFeature = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const { data, error, isLoading } = useSWR<BlogsResponse>(
    '/api/blogs?lang=zh&page=1&limit=100&scope=topics',
    async (url: string) => {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('主題文章載入失敗，請稍後再試。');
      }
      const result = await response.json();
      if (result.error) {
        throw new Error('主題文章載入失敗，請稍後再試。');
      }
      return result as BlogsResponse;
    },
    { revalidateOnFocus: false }
  );

  const articles = (data?.items ?? []).filter(
    (item) =>
      !item.tags?.some((tag) => tag.toLowerCase() === 'dissertation')
  );
  const article = articles[activeIndex] ?? articles[0];
  const hasCarousel = articles.length > 1;
  const articleKey = article ? String(article._id ?? article.id) : 'empty';
  const articleHref = article
    ? `/blogs/${article._id ?? article.id}?lang=zh`
    : '/topics';

  useEffect(() => {
    setActiveIndex(0);
  }, [articles.length]);

  useEffect(() => {
    if (!hasCarousel) return;

    const mediaQuery = window.matchMedia(MOBILE_QUERY);
    let interval: ReturnType<typeof setInterval> | undefined;

    const updateRotation = () => {
      if (interval) clearInterval(interval);
      interval = undefined;

      if (mediaQuery.matches) {
        setActiveIndex(0);
        return;
      }

      interval = setInterval(() => {
        setActiveIndex((index) => (index + 1) % articles.length);
      }, ROTATION_INTERVAL);
    };

    updateRotation();
    mediaQuery.addEventListener('change', updateRotation);

    return () => {
      if (interval) clearInterval(interval);
      mediaQuery.removeEventListener('change', updateRotation);
    };
  }, [articles.length, hasCarousel]);

  const showArticle = (direction: -1 | 1) => {
    setActiveIndex(
      (index) => (index + direction + articles.length) % articles.length
    );
  };

  return (
    <section className={styles.feature} aria-label='主題專欄'>
      <div className={styles.featureVisual}>
        <div
          className={styles.featureImageSlide}
          key={articleKey}
        >
          <Link
            className={styles.featureImage}
            href={articleHref}
            aria-label={article ? `閱讀：${article.title}` : '探索主題專欄'}
            style={
              article?.imageUrl
                ? { backgroundImage: `url("${article.imageUrl}")` }
                : undefined
            }
          />
        </div>
        {hasCarousel && (
          <div className={styles.featureControls}>
            <button
              type='button'
              onClick={() => showArticle(-1)}
              aria-label='上一篇主題專欄'
            >
              <span aria-hidden='true'>←</span>
            </button>
            <button
              type='button'
              onClick={() => showArticle(1)}
              aria-label='下一篇主題專欄'
            >
              <span aria-hidden='true'>→</span>
            </button>
          </div>
        )}
      </div>
      <div className={styles.featureCopy}>
        <span className={styles.eyebrow}>READING &amp; RESEARCH</span>
        <h2 className={styles.featureTitle}>主題專欄</h2>
        <p className={styles.featureDescription}>
          依照閱讀與研究主題，探索不同的文化與歷史脈絡。
        </p>
        {article && (
          <div
            className={`${styles.featureArticle} ${styles.featureArticleSlide}`}
            key={articleKey}
            aria-live='polite'
          >
            <span className={styles.featureArticleCategory}>
              {article.tags?.find(
                (tag) => tag.toLowerCase() !== 'humanity'
              ) ?? '主題專欄'}
            </span>
            <h3 className={styles.featureArticleTitle}>{article.title}</h3>
            {article.summary && (
              <p className={styles.featureArticleSummary}>
                <AutoLinkText
                  text={article.summary}
                  links={article.summaryLinks}
                />
              </p>
            )}
          </div>
        )}
        {error && (
          <p className={styles.featureError} role='alert'>
            {error instanceof Error
              ? error.message
              : '主題文章載入失敗，請稍後再試。'}
          </p>
        )}
        <Link href={articleHref} className={styles.featureAction}>
          {isLoading ? '載入最新文章…' : article ? '閱讀最新文章' : '探索主題'}
          <span aria-hidden='true'>→</span>
        </Link>
      </div>
    </section>
  );
};

export default HomeTopicsFeature;
