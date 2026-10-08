'use client';

import Link from 'next/link';
import useSWR from 'swr';
import { BlogsType } from '@type/blogs';
import { STORY_CATEGORY } from '@lib/blogCategories';
import AutoLinkText from '@components/AutoLinkText/AutoLinkText';
import styles from '@styles/Home.module.scss';

type BlogsResponse = {
  items: BlogsType[];
};

const HomeStories = () => {
  const { data, error, isLoading } = useSWR<BlogsResponse>(
    `/api/blogs?lang=zh&page=1&limit=3&tag=${STORY_CATEGORY}`,
    async (url: string) => {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('文章載入失敗，請稍後再試。');
      }
      const result = await response.json();
      if (result.error) {
        throw new Error('文章載入失敗，請稍後再試。');
      }
      return result as BlogsResponse;
    },
    { revalidateOnFocus: false }
  );

  if (error) {
    return (
      <p className={styles.storyMessage} role='alert'>
        {error instanceof Error ? error.message : '文章載入失敗，請稍後再試。'}
      </p>
    );
  }

  if (isLoading) {
    return <p className={styles.storyMessage}>正在載入文章…</p>;
  }

  const stories = data?.items ?? [];

  if (stories.length === 0) {
    return <p className={styles.storyMessage}>目前還沒有文章。</p>;
  }

  return (
    <div className={styles.storyGrid}>
      {stories.map((story) => {
        const image = story.blocks?.find(
          (block) => block.type === 'image' && block.url
        );
        const description = story.summary;
        const href = `/blogs/${story._id ?? story.id}?lang=zh`;
        const visibleTags = story.tags?.filter(
          (tag) => tag.toLowerCase() !== 'humanity'
        );

        return (
          <article className={styles.storyCard} key={story.id}>
            <Link
              className={styles.storyImage}
              href={href}
              aria-label={`閱讀：${story.title}`}
              style={
                image?.url
                  ? { backgroundImage: `url("${image.url}")` }
                  : undefined
              }
            />
            <div className={styles.storyContent}>
              <span className={styles.storyCategory}>
                {visibleTags?.length ? visibleTags.slice(0, 2).join(' · ') : '故事筆記'}
              </span>
              <h3 className={styles.storyTitle}>
                <Link href={href}>{story.title}</Link>
              </h3>
              {description && (
                <p className={styles.storySummary}>
                  <AutoLinkText text={description} links={story.summaryLinks} />
                </p>
              )}
              {story.date && (
                <time className={styles.storyDate} dateTime={story.date}>
                  {new Date(story.date).toLocaleDateString('zh-TW')}
                </time>
              )}
            </div>
          </article>
        );
      })}
    </div>
  );
};

export default HomeStories;
