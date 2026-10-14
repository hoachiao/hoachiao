import BlogsClient from './BlogsClient';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: '故事筆記｜臺灣與東南亞的文化觀察',
  description:
    '閱讀何阿樵的故事筆記，從街區、信仰、語言、飲食與遷徙，追尋臺灣與東南亞交會的文化線索。',
  alternates: {
    canonical: '/blogs',
  },
};

export default function Blogs() {
  return <BlogsClient mode='stories' />;
}
