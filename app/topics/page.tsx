import TopicBooks from '@components/Topics/TopicBooks';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: '主題專欄｜閱讀與研究',
  description:
    '依照閱讀與研究主題，探索歷史、文化與社會脈絡。收錄何阿樵的主題文章與閱讀筆記。',
  alternates: {
    canonical: '/topics',
  },
};

export default function TopicsPage() {
  return <TopicBooks />;
}
