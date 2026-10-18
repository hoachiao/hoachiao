import type { BlogsType } from '@type/blogs';
import { EXCLUDED_TOPIC_CATEGORIES, STORY_CATEGORY } from './blogCategories';

export interface TopicBook {
  title: string;
  articles: BlogsType[];
  cover?: string;
}

const excluded = [STORY_CATEGORY, ...EXCLUDED_TOPIC_CATEGORIES].map((tag) => tag.toLowerCase());

export function groupTopicBooks(articles: BlogsType[]): TopicBook[] {
  const books = new Map<string, TopicBook>();
  for (const article of articles) {
    const tags = (article.tags ?? []).map((tag) => tag.trim()).filter(Boolean);
    if (tags.some((tag) => excluded.includes(tag.toLowerCase()))) continue;
    for (const key of Array.from(new Set(tags.map((tag) => tag.toLowerCase())))) {
      const book = books.get(key) ?? { title: tags.find((tag) => tag.toLowerCase() === key)!, articles: [] };
      const id = String(article._id ?? article.id);
      if (!book.articles.some((item) => String(item._id ?? item.id) === id)) book.articles.push(article);
      if (!book.cover && article.imageUrl) book.cover = article.imageUrl;
      books.set(key, book);
    }
  }
  return Array.from(books.values()).sort((a, b) => a.title.localeCompare(b.title));
}

// Read every page so books and chapter counts are not limited to the first batch.
export async function fetchTopicBooks(url: string): Promise<TopicBook[]> {
  const articles: BlogsType[] = [];
  let page = 1;
  let total = Infinity;
  while (articles.length < total) {
    const response = await fetch(`${url}&page=${page}&limit=100`);
    if (!response.ok) throw new Error('主題書籍載入失敗，請稍後再試。');
    const data = await response.json();
    if (data.error || !Array.isArray(data.items) || (!Number.isFinite(data.total) || data.total < 0)) {
      throw new Error('主題書籍載入失敗，請稍後再試。');
    }
    total = data.total;
    articles.push(...data.items);
    if (data.items.length === 0 && articles.length < total) {
      throw new Error('主題資料正在更新，請重新載入。');
    }
    page += 1;
  }
  return groupTopicBooks(articles);
}
