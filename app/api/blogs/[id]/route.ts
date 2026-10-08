import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { Client } from '@notionhq/client';
import { getDatabase } from '@lib/mongodb';
import { removeInlineImageDuplicates } from '@lib/blogImages';
import { blogCategoryFilter } from '@lib/blogCategories';
import { BlogsType } from 'type/blogs';

type Data = BlogsType[] | { error: string };

const notion = new Client({
  auth: process.env.NOTION_INTERNAL_INTEGRATION_TOKEN,
});

async function fetchAllBlocks(blockId: string) {
  const allResults = [];
  let cursor: string | undefined;

  do {
    const response = await notion.blocks.children.list({
      block_id: blockId,
      start_cursor: cursor,
    });
    allResults.push(...response.results);
    cursor = response.has_more ? response.next_cursor ?? undefined : undefined;
  } while (cursor);

  return allResults;
}

async function getPageBlocks(pageId: string) {
  const results = await fetchAllBlocks(pageId);
  const blocks: any[] = [];

  const getRichText = (runs: any[], prefix = '') => {
    const links = runs.flatMap((run) => {
      const url = run.href || run.text?.link?.url;
      if (!run.plain_text || !url || !/^https?:\/\//i.test(url)) return [];
      return [{ text: run.plain_text, url }];
    });

    return {
      content: `${prefix}${runs.map((run) => run.plain_text).join('')}`,
      ...(links.length ? { links } : {}),
    };
  };

  for (const block of results) {
    const blockAny = block as any;
    let mapped: any = null;

    if (blockAny.type === 'paragraph') {
      mapped = {
        type: 'text',
        ...getRichText(blockAny.paragraph.rich_text),
      };
    }
    if (blockAny.type === 'bulleted_list_item') {
      mapped = {
        type: 'text',
        ...getRichText(blockAny.bulleted_list_item.rich_text, '• '),
      };
    }
    if (blockAny.type === 'numbered_list_item') {
      mapped = {
        type: 'text',
        ...getRichText(blockAny.numbered_list_item.rich_text),
      };
    }
    if (blockAny.type === 'quote') {
      mapped = {
        type: 'text',
        ...getRichText(blockAny.quote.rich_text),
      };
    }
    if (blockAny.type === 'callout') {
      mapped = {
        type: 'text',
        ...getRichText(blockAny.callout.rich_text),
      };
    }
    if (blockAny.type === 'toggle') {
      mapped = {
        type: 'text',
        ...getRichText(blockAny.toggle.rich_text),
      };
    }
    if (blockAny.type === 'code') {
      mapped = {
        type: 'code',
        language: blockAny.code.language,
        ...getRichText(blockAny.code.rich_text),
      };
    }
    if (blockAny.type?.startsWith('heading')) {
      mapped = {
        type: 'heading',
        ...getRichText(blockAny[blockAny.type].rich_text),
      };
    }
    if (blockAny.type === 'image') {
      const imageUrl =
        blockAny.image.type === 'file'
          ? blockAny.image.file.url
          : blockAny.image.external.url;
      const caption = blockAny.image.caption
        .map((t: any) => t.plain_text)
        .join('');
      mapped = {
        type: 'image',
        url: imageUrl,
        caption,
      };
    }

    if (mapped) {
      blocks.push(mapped);
    }

    if (blockAny.has_children) {
      const childBlocks = await getPageBlocks(blockAny.id);
      blocks.push(...childBlocks);
    }
  }

  return blocks;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const lang = request.nextUrl.searchParams.get('lang') || 'zh';
    const live = request.nextUrl.searchParams.get('live') === '1';
    const db = await getDatabase();
    const collection = db.collection<BlogsType>('blogs');
    const blogId = /^\d+$/.test(id) ? Number(id) : NaN;
    const hasNumericId = !Number.isNaN(blogId);
    const hasObjectId = ObjectId.isValid(id);

    let blog: BlogsType | null = null;

    if (hasNumericId) {
      blog = await collection.findOne({ ...blogCategoryFilter, id: blogId });
    }

    if (!blog) {
      blog = await collection.findOne({ ...blogCategoryFilter, notionId: id });
    }

    if (!blog && hasObjectId) {
      blog = await collection.findOne({ ...blogCategoryFilter, _id: new ObjectId(id) });
    }

    const selectedBlocks = blog
      ? lang === 'en'
        ? blog.blocksEn || blog.blocks || []
        : live && blog.notionId
          ? await getPageBlocks(blog.notionId)
          : blog.blocks || []
      : [];
    const result = blog
      ? [
          {
            ...blog,
            _id: blog._id?.toString(),
            title: lang === 'en' ? blog.titleEn || blog.title : blog.title,
            blocks: removeInlineImageDuplicates(selectedBlocks),
          },
        ]
      : [];

    return NextResponse.json(result);
  } catch (err) {
    console.error('Error fetching blog:', err);
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
