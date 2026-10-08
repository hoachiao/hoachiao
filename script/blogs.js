const path = require('path');
const fs = require('fs/promises');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const { Client } = require('@notionhq/client');
const mongoose = require('mongoose');
const translate = require('google-translate-api-next');

// 1. 初始化 Notion 客戶端
const notion = new Client({ auth: process.env.NOTION_INTERNAL_INTEGRATION_TOKEN });
const DATABASE_ID = process.env.NOTION_BLOG_DATABASE_ID;
const REFRESH_LINKS_ONLY = process.argv.includes('--refresh-links');
const REFRESH_ALL = process.argv.includes('--refresh-all');
console.log('當前讀取的 Database ID:', DATABASE_ID);
// 2. 定義 MongoDB Schema (沿用之前的設計)
const blogSchema = new mongoose.Schema({
  title: String,
  titleEn: String,
  tags: [String],
  notionId: { type: String, unique: true },
  date: String,
  pdfUrl: String,
  startPage: Number,
  endPage: Number,
  blocks: [
    {
      type: { type: String }, // 'text', 'code', 'heading'
      content: String,
      language: String,
      url: String,
      caption: String,
      links: [{ text: String, url: String }]
    }
  ],
  blocksEn: [
    {
      type: { type: String },
      content: String,
      language: String,
      url: String,
      caption: String,
      links: [{ text: String, url: String }]
    }
  ],
  updatedAt: Date
});

const Blog = mongoose.model('Blog', blogSchema);


const imagesDir = path.resolve(__dirname, '../public/notion-images');

async function ensureImagesDir() {
  await fs.mkdir(imagesDir, { recursive: true });
}

function getFileExtension(url, contentType) {
  try {
    const pathname = new URL(url).pathname;
    const ext = path.extname(pathname);
    if (ext) return ext;
  } catch (err) {
    // ignore
  }

  if (contentType?.includes('png')) return '.png';
  if (contentType?.includes('webp')) return '.webp';
  if (contentType?.includes('gif')) return '.gif';
  return '.jpg';
}

async function downloadImage(url, fileName) {
  await ensureImagesDir();
  const filePath = path.join(imagesDir, fileName);

  try {
    await fs.access(filePath);
    return filePath;
  } catch (err) {
    // file doesn't exist
  }

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download image: ${response.status}`);
  }

  const contentType = response.headers.get('content-type');
  const ext = getFileExtension(url, contentType);
  const finalPath = filePath.endsWith(ext) ? filePath : `${filePath}${ext}`;
  const buffer = Buffer.from(await response.arrayBuffer());
  await fs.writeFile(finalPath, buffer);
  return finalPath;
}

async function translateText(text) {
  if (!text || !text.trim()) return text;
  const result = await translate(text, { from: 'zh-TW', to: 'en' });
  return result.text || text;
}

function capitalizeHeading(text) {
  if (!text) return text;
  return text.replace(/^(\s*[a-z])/, (match) => match.toUpperCase());
}

function getRichText(runs, prefix = '') {
  const links = runs.flatMap((run) => {
    const url = run.href || run.text?.link?.url;
    if (!run.plain_text || !url || !/^https?:\/\//i.test(url)) return [];
    return [{ text: run.plain_text, url }];
  });

  return {
    content: `${prefix}${runs.map((run) => run.plain_text).join('')}`,
    ...(links.length ? { links } : {})
  };
}

async function translateBlocks(blocks) {
  const translated = [...blocks];
  const textIndexes = [];
  const textPayload = [];
  const linkPayload = [];
  const captionIndexes = [];
  const captionPayload = [];

  blocks.forEach((block, index) => {
    if (block.type === 'heading' || block.type === 'text') {
      textIndexes.push(index);
      textPayload.push(block.content || '');
    }
    if (block.type === 'image') {
      captionIndexes.push(index);
      captionPayload.push(block.caption || '');
    }
    if (block.links?.length) {
      linkPayload.push({
        index,
        links: block.links
      });
    }
  });

  const translateArray = async (payload) => {
    if (!payload.length) return [];
    return await Promise.all(payload.map((item) => translateText(item)));
  };

  const translatedTexts = await translateArray(textPayload);
  const translatedCaptions = await translateArray(captionPayload);
  const translatedLinks = await Promise.all(
    linkPayload.map(async ({ links }) =>
      Promise.all(
        links.map(async (link) => ({
          ...link,
          text: (await translateText(link.text)) || link.text
        }))
      )
    )
  );

  textIndexes.forEach((blockIndex, i) => {
    const content = translatedTexts[i];
    if (content !== undefined) {
      const base = translated[blockIndex];
      const finalContent =
        base.type === 'heading' ? capitalizeHeading(content) : content;
      translated[blockIndex] = { ...base, content: finalContent };
    }
  });

  captionIndexes.forEach((blockIndex, i) => {
    const caption = translatedCaptions[i];
    if (caption !== undefined) {
      translated[blockIndex] = { ...translated[blockIndex], caption };
    }
  });

  linkPayload.forEach(({ index }, i) => {
    translated[index] = { ...translated[index], links: translatedLinks[i] };
  });

  return translated;
}

// 3. 轉換 Notion Block 到我們的 JSON 格式
async function fetchAllBlocks(blockId) {
  const allResults = [];
  let cursor = undefined;

  do {
    const response = await notion.blocks.children.list({
      block_id: blockId,
      start_cursor: cursor
    });
    allResults.push(...response.results);
    cursor = response.has_more ? response.next_cursor : undefined;
  } while (cursor);

  return allResults;
}

async function getPageBlocks(pageId) {
  const results = await fetchAllBlocks(pageId);
  const blocks = [];

  for (let index = 0; index < results.length; index += 1) {
    const block = results[index];
    if (
      block.type === 'image' &&
      block.image.type === 'external' &&
      block.image.external.url.startsWith('data:image/') &&
      [results[index - 1], results[index + 1]].some(
        (neighbor) =>
          neighbor?.type === 'image' &&
          neighbor.image.type === 'file' &&
          neighbor.id !== block.id
      )
    ) {
      continue;
    }

    let mapped = null;

    if (block.type === 'paragraph') {
      const richText = getRichText(block.paragraph.rich_text);
      mapped = {
        type: 'text',
        ...richText
      };
    }
    if (block.type === 'bulleted_list_item') {
      const richText = getRichText(block.bulleted_list_item.rich_text, '• ');
      mapped = {
        type: 'text',
        ...richText
      };
    }
    if (block.type === 'numbered_list_item') {
      const richText = getRichText(block.numbered_list_item.rich_text);
      mapped = {
        type: 'text',
        ...richText
      };
    }
    if (block.type === 'quote') {
      const richText = getRichText(block.quote.rich_text);
      mapped = {
        type: 'text',
        ...richText
      };
    }
    if (block.type === 'callout') {
      const richText = getRichText(block.callout.rich_text);
      mapped = {
        type: 'text',
        ...richText
      };
    }
    if (block.type === 'toggle') {
      const richText = getRichText(block.toggle.rich_text);
      mapped = {
        type: 'text',
        ...richText
      };
    }
    if (block.type === 'code') {
      const richText = getRichText(block.code.rich_text);
      mapped = {
        type: 'code',
        language: block.code.language,
        ...richText
      };
    }
    if (block.type.startsWith('heading')) {
      const richText = getRichText(block[block.type].rich_text);
      mapped = {
        type: 'heading',
        ...richText
      };
    }
    if (block.type === 'image') {
      const imageUrl =
        block.image.type === 'file'
          ? block.image.file.url
          : block.image.external.url;
      const caption = block.image.caption
        .map(t => t.plain_text)
        .join('');
      let resolvedUrl = imageUrl;

      if (block.image.type === 'file' && imageUrl) {
        const fileName = block.id.replace(/-/g, '');
        const savedPath = await downloadImage(imageUrl, fileName);
        resolvedUrl = `/notion-images/${path.basename(savedPath)}`;
      }

      mapped = {
        type: 'image',
        url: resolvedUrl,
        caption
      };
    }

    if (mapped) {
      blocks.push(mapped);
    }

    if (block.has_children) {
      const childBlocks = await getPageBlocks(block.id);
      blocks.push(...childBlocks);
    }
  }

  return blocks;
}

function mergeExistingBlockLinks(existingBlocks, latestBlocks) {
  let latestCursor = 0;
  const matchedBlocks = [];
  const blocks = existingBlocks.map((storedBlock, index) => {
    const stored =
      typeof storedBlock.toObject === 'function'
        ? storedBlock.toObject()
        : storedBlock;
    const latestIndex = latestBlocks.findIndex(
      (block, candidateIndex) =>
        candidateIndex >= latestCursor &&
        block.type === stored.type &&
        block.content === stored.content
    );

    if (latestIndex < 0) return stored;
    latestCursor = latestIndex + 1;
    matchedBlocks.push({ storedIndex: index, latestIndex });
    const { links: _previousLinks, ...withoutPreviousLinks } = stored;
    const latestLinks = latestBlocks[latestIndex].links;
    return {
      ...withoutPreviousLinks,
      ...(latestLinks?.length ? { links: latestLinks } : {})
    };
  });

  return { blocks, matchedBlocks };
}

// 4. 主同步邏輯
async function syncNotionToMongo() {
  const searchResponse = await notion.search({
    filter: { property: 'object', value: 'data_source' }
  });

  const normalizeId = (value) => value?.replace(/-/g, '').toLowerCase();
  const configuredId = normalizeId(DATABASE_ID);
  const targetDb = searchResponse.results.find((source) => {
    const sourceUrlId = source.url?.split('/').pop()?.split('?')[0];
    return (
      normalizeId(source.id) === configuredId ||
      normalizeId(sourceUrlId) === configuredId
    );
  });

  if (!targetDb) {
    throw new Error(
      `在 Notion 可存取的資料來源中找不到設定的 ID：${DATABASE_ID || '(未設定)'}`
    );
  }

  console.log(
    '成功定位資料庫！',
    targetDb.title?.map((part) => part.plain_text).join('') || targetDb.id
  );

  const queryPayload = {
    page_size: 100,
    filter: REFRESH_LINKS_ONLY || REFRESH_ALL
      ? { property: 'status', rich_text: { equals: 'Ready' } }
      : {
          and: [
            {
              property: 'status',
              rich_text: { equals: 'Ready' }
            },
            {
              or: [
                {
                  property: 'isNew',
                  rich_text: { equals: 'true' }
                },
                {
                  property: 'isNew',
                  rich_text: { equals: 'yes' }
                },
                {
                  property: 'isNew',
                  rich_text: { equals: 'True' }
                }
              ]
            }
          ]
        }
  };

  const pages = [];
  let cursor;
  do {
    const response = await notion.dataSources.query({
      data_source_id: targetDb.id,
      ...queryPayload,
      start_cursor: cursor
    });
    pages.push(...response.results);
    cursor = response.has_more ? response.next_cursor : undefined;
  } while (cursor);

  console.log(
    REFRESH_ALL
      ? `準備重新同步 ${pages.length} 篇 Ready 文章...`
      : REFRESH_LINKS_ONLY
        ? `準備更新 ${pages.length} 篇 Ready 文章的連結...`
        : `準備同步 ${pages.length} 篇文章...`
  );

  const titleProperty = Object.entries(targetDb.properties).find(
    ([, property]) => property.type === 'title'
  )?.[0];
  if (!titleProperty) {
    throw new Error('Notion 資料庫找不到標題欄位。');
  }

  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  for (const page of pages) {
    const titleParts = page.properties[titleProperty]?.title;
    const date =
      page.properties.date?.date?.start ||
      page.properties.Date?.date?.start ||
      null;
    const title =
      (Array.isArray(titleParts)
        ? titleParts.map((item) => item?.plain_text || '').join('')
        : '') || 'Untitled';
    const tags = page.properties.tags?.rich_text?.[0]?.plain_text?.trim() || '';
    if (!tags) continue;
    const notionId = page.id;

    if (REFRESH_LINKS_ONLY && !REFRESH_ALL) {
      const existing = await Blog.findOne({ notionId });
      if (!existing) continue;

      const latestBlocks = await getPageBlocks(notionId);
      const storedBlog = existing.toObject();
      const { blocks, matchedBlocks } = mergeExistingBlockLinks(
        storedBlog.blocks || [],
        latestBlocks
      );
      const blocksEn = [...(storedBlog.blocksEn || [])];

      for (const { storedIndex, latestIndex } of matchedBlocks) {
        const latestLinks = latestBlocks[latestIndex].links;
        if (!blocksEn[storedIndex] || !latestLinks?.length) continue;
        blocksEn[storedIndex] = {
          ...blocksEn[storedIndex],
          links: await Promise.all(
            latestLinks.map(async (link) => ({
              ...link,
              text: (await translateText(link.text)) || link.text
            }))
          )
        };
      }

      await Blog.updateOne(
        { notionId },
        { $set: { blocks, blocksEn, updatedAt: new Date() } }
      );
      continue;
    }

    console.log(`Syncing: ${title}...`);

    const blocks = await getPageBlocks(notionId);

    const titleEn = await translateText(title);
    const blocksEn = await translateBlocks(blocks);
    const update = {
      title,
      titleEn,
      tags,
      blocks,
      blocksEn,
      date,
      updatedAt: new Date()
    };
    if (REFRESH_ALL) {
      await Blog.updateOne({ notionId }, { $set: update }, { upsert: true });
    } else {
      await Blog.findOneAndUpdate(
        { notionId },
        update,
        { upsert: true }
      );
    }

    if (REFRESH_ALL) continue;
    const updateProperties = {};
    if (targetDb.properties.isNew?.type === 'rich_text') {
      updateProperties.isNew = {
        rich_text: [{ text: { content: 'false' } }]
      };
    }
    if (targetDb.properties.EN?.type === 'rich_text') {
      updateProperties.EN = {
        rich_text: [{ text: { content: 'yes' } }]
      };
    }
    if (Object.keys(updateProperties).length > 0) {
      await notion.pages.update({
        page_id: notionId,
        properties: updateProperties
      });
    }
  }

  console.log('Sync Complete!');
}

syncNotionToMongo()
  .catch((error) => {
    console.error('Notion sync failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  });