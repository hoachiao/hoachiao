import BlogsClient from './BlogsClient';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string }>;
}): Promise<Metadata> {
  const { lang } = await searchParams;
  return lang === 'en'
    ? {
        title: 'Stories | Cultural Observations from Taiwan and Southeast Asia',
        description:
          'Read Ho A-Chiao’s stories tracing the cultural connections between Taiwan and Southeast Asia.',
        alternates: { canonical: '/blogs?lang=en' },
      }
    : {
        title: '故事筆記｜臺灣與東南亞的文化觀察',
        description:
          '閱讀何阿樵的故事筆記，從街區、信仰、語言、飲食與遷徙，追尋臺灣與東南亞交會的文化線索。',
        alternates: { canonical: '/blogs' },
      };
}

export default function Blogs() {
  return <BlogsClient mode='stories' />;
}
