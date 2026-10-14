import type { MetadataRoute } from 'next';
import { getDatabase } from '@lib/mongodb';
import { blogCategoryFilter } from '@lib/blogCategories';
import { BlogsType } from 'type/blogs';

const siteUrl = 'https://hoachiao.com';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    { url: `${siteUrl}/`, changeFrequency: 'weekly', priority: 1 },
    { url: `${siteUrl}/blogs`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${siteUrl}/topics`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${siteUrl}/about`, changeFrequency: 'monthly', priority: 0.6 },
  ];

  const db = await getDatabase();
  const blogs = await db
    .collection<BlogsType>('blogs')
    .find(blogCategoryFilter, {
      projection: { id: 1, notionId: 1, date: 1 },
    })
    .sort({ date: -1, _id: -1 })
    .toArray();

  const blogPages: MetadataRoute.Sitemap = blogs.flatMap((blog) => {
    const id = blog.id ?? blog.notionId ?? blog._id?.toString();
    if (id === undefined || id === null || id === '') return [];

    const lastModified = blog.date ? new Date(blog.date) : undefined;
    return [
      {
        url: `${siteUrl}/blogs/${encodeURIComponent(String(id))}`,
        ...(lastModified && !Number.isNaN(lastModified.getTime())
          ? { lastModified }
          : {}),
        changeFrequency: 'monthly',
        priority: 0.7,
      },
    ];
  });

  return [...staticPages, ...blogPages];
}
