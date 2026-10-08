import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@lib/mongodb';
import {
  EXCLUDED_TOPIC_CATEGORIES,
  STORY_CATEGORY,
  blogCategoryFilter,
} from '@lib/blogCategories';
import { getBlogSummaryBlock } from '@lib/blogSummary';
import { BlogsType } from 'type/blogs';

type Data =
  | {
      items: BlogsType[];
      tags: string[];
      total: number;
      page: number;
      limit: number;
    }
  | { error: string };

export const revalidate = 300;
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const lang = request.nextUrl.searchParams.get('lang') || 'zh';
    const tag = request.nextUrl.searchParams.get('tag') || '';
    const scope = request.nextUrl.searchParams.get('scope');
    const pageParam = Number(request.nextUrl.searchParams.get('page') || '1');
    const limitParam = Number(request.nextUrl.searchParams.get('limit') || '5');
    const page = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1;
    const limit =
      Number.isFinite(limitParam) && limitParam > 0 ? limitParam : 5;
    const skip = (page - 1) * limit;
    const db = await getDatabase();
    const collection = db.collection<BlogsType>('blogs');
    const humanityPattern = new RegExp(`^${STORY_CATEGORY}$`, 'i');
    const excludedTopicPatterns = EXCLUDED_TOPIC_CATEGORIES.map(
      (category) =>
        new RegExp(`^${category.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i')
    );
    const scopedFilter =
      scope === 'stories'
        ? { tags: humanityPattern }
        : scope === 'topics'
          ? {
              $and: [
                { tags: { $exists: true, $ne: [] } },
                { tags: { $not: humanityPattern } },
                { tags: { $nin: excludedTopicPatterns } },
              ],
            }
          : blogCategoryFilter;
    const tagFilter =
      tag && scope === 'stories'
        ? tag.toLowerCase() === STORY_CATEGORY.toLowerCase()
          ? { tags: humanityPattern }
          : { tags: { $in: [] } }
        : tag && scope === 'topics'
          ? tag.toLowerCase() !== STORY_CATEGORY.toLowerCase()
            ? { tags: new RegExp(`^${tag.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') }
            : { tags: { $in: [] } }
          : tag
            ? { tags: new RegExp(`^${tag.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') }
            : scopedFilter;
    const filter = tag
      ? { $and: [scopedFilter, tagFilter] }
      : scopedFilter;

    const [blogs, total, tagDocs] = await Promise.all([
      collection
        .find(
          filter,
          {
            projection: {
              id: 1,
              tags: 1,
              title: 1,
              titleEn: 1,
              blocks: 1,
              blocksEn: 1,
              date: 1,
            },
          }
        )
        .sort({ date: -1, _id: -1 })
        .skip(skip)
        .limit(limit)
        .toArray(),
      collection.countDocuments(filter),
      collection
        .aggregate<{ tag: string }>([
          { $match: scopedFilter },
          { $unwind: { path: '$tags', preserveNullAndEmptyArrays: false } },
          { $group: { _id: '$tags' } },
          { $project: { _id: 0, tag: '$_id' } },
        ])
        .toArray(),
    ]);

    const blogsWithStringId = blogs.map((blog) => {
      const localizedBlocks =
        lang === 'en' && Array.isArray(blog.blocksEn)
          ? blog.blocksEn
          : blog.blocks ?? [];
      const summaryBlock = getBlogSummaryBlock(localizedBlocks);

      return {
        _id: blog._id?.toString(),
        id: blog.id ?? blog.notionId ?? blog._id?.toString(),
        tags: blog.tags,
        title: lang === 'en' ? blog.titleEn || blog.title : blog.title,
        summary: summaryBlock?.content?.trim() ?? '',
        summaryLinks: summaryBlock?.links ?? [],
        imageUrl: localizedBlocks.find(
          (block) => block.type === 'image' && block.url
        )?.url,
        blocks: localizedBlocks.slice(0, 3),
        notionId: blog.notionId,
        date: blog.date ?? null,
      };
    });

    return NextResponse.json({
      items: blogsWithStringId,
      tags: tagDocs
        .map((doc) => doc.tag)
        .filter(
          (value): value is string =>
            typeof value === 'string' &&
            (scope !== 'stories' ||
              value.toLowerCase() === STORY_CATEGORY.toLowerCase()) &&
            (scope !== 'topics' ||
              (value.toLowerCase() !== STORY_CATEGORY.toLowerCase() &&
                !EXCLUDED_TOPIC_CATEGORIES.some(
                  (category) => category.toLowerCase() === value.toLowerCase()
                )))
        )
        .sort((a, b) => a.localeCompare(b)),
      total,
      page,
      limit,
    });
  } catch (err) {
    console.error('Error fetching blogs:', err);
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json(
      {
        error: 'failed to fetch data',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
      },
      { status: 500 }
    );
  }
}
