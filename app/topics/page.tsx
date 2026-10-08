import BlogsClient from '../blogs/BlogsClient';

export const dynamic = 'force-dynamic';

export default function TopicsPage() {
  return <BlogsClient mode='topics' />;
}
