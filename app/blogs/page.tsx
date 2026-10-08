import BlogsClient from './BlogsClient';

export const dynamic = 'force-dynamic';

export default function Blogs() {
  return <BlogsClient mode='stories' />;
}
