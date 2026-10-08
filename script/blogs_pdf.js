const path = require('path');
const fs = require('fs/promises');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const { Client } = require('@notionhq/client');
const mongoose = require('mongoose');
const translate = require('google-translate-api-next');

const notion = new Client({ auth: process.env.NOTION_INTERNAL_INTEGRATION_TOKEN });

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
      type: { type: String },
      content: String,
      language: String,
      url: String,
      caption: String
    }
  ],
  blocksEn: [
    {
      type: { type: String },
      content: String,
      language: String,
      url: String,
      caption: String
    }
  ],
  updatedAt: Date
});

const Blog = mongoose.model('Blog', blogSchema);

const imagesDir = path.resolve(__dirname, '../public/notion-images');
const DISSERTATION_PDF_URL = process.env.DISSERTATION_PDF_URL || '';
const pageMap = {
  // '<notion_page_id_or_title>': { startPage: 1, endPage: 5 },
  '302b50079d2580cab480c1c5ff1192cd': { startPage: 2, endPage: 6 },
};

function resolvePdfInfo({ notionId, title }) {
  const byId = pageMap[notionId];
  if (byId) return byId;
  return pageMap[title];
}

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

  for (const block of results) {
    let mapped = null;

    if (block.type === 'paragraph') {
      mapped = {
        type: 'text',
        content: block.paragraph.rich_text.map((t) => t.plain_text).join('')
      };
    }
    if (block.type === 'bulleted_list_item') {
      mapped = {
        type: 'text',
        content: `• ${block.bulleted_list_item.rich_text
          .map((t) => t.plain_text)
          .join('')}`
      };
    }
    if (block.type === 'numbered_list_item') {
      mapped = {
        type: 'text',
        content: block.numbered_list_item.rich_text
          .map((t) => t.plain_text)
          .join('')
      };
    }
    if (block.type === 'quote') {
      mapped = {
        type: 'text',
        content: block.quote.rich_text.map((t) => t.plain_text).join('')
      };
    }
    if (block.type === 'callout') {
      mapped = {
        type: 'text',
        content: block.callout.rich_text.map((t) => t.plain_text).join('')
      };
    }
    if (block.type === 'toggle') {
      mapped = {
        type: 'text',
        content: block.toggle.rich_text.map((t) => t.plain_text).join('')
      };
    }
    if (block.type === 'code') {
      mapped = {
        type: 'code',
        language: block.code.language,
        content: block.code.rich_text.map((t) => t.plain_text).join('')
      };
    }
    if (block.type.startsWith('heading')) {
      mapped = {
        type: 'heading',
        content: block[block.type].rich_text.map((t) => t.plain_text).join('')
      };
    }
    if (block.type === 'image') {
      const imageUrl =
        block.image.type === 'file'
          ? block.image.file.url
          : block.image.external.url;
      const caption = block.image.caption
        .map((t) => t.plain_text)
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

async function syncNotionToMongo() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  const searchResponse = await notion.search({
    filter: { property: 'object', value: 'data_source' }
  });

  const targetDb = searchResponse.results.find(
    (db) => db.title[0]?.plain_text === 'Blogs'
  );

  if (!targetDb) {
    console.error('在 Notion 中找不到名為 Blogs 的資料庫！');
    return;
  }

  const queryPayload = {
    filter: {
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
        },
        {
          property: 'EN',
          rich_text: { equals: 'PDF' }
        }
      ]
    }
  };

  const response = notion.databases?.query
    ? await notion.databases.query({ database_id: targetDb.id, ...queryPayload })
    : await notion.dataSources.query({
        data_source_id: targetDb.id,
        ...queryPayload
      });

  console.log(`準備同步 ${response.results.length} 篇文章...`);

  for (const page of response.results) {
    const titleParts = page.properties.title.title;
    const date =
      page.properties.date?.date?.start ||
      page.properties.Date?.date?.start ||
      null;
    const title =
      (Array.isArray(titleParts)
        ? titleParts.map((item) => item?.plain_text || '').join('')
        : '') || 'Untitled';
    const tags = page.properties.tags.rich_text[0].plain_text;
    if (!tags?.trim()) continue;
    const notionId = page.id;

    const blocks = await getPageBlocks(notionId);
    const titleEn = await translateText(title);
    const pdfInfo = resolvePdfInfo({ notionId, title }) || {};
    const pdfUrl = pdfInfo.pdfUrl || DISSERTATION_PDF_URL;
    const startPage = Number.isFinite(pdfInfo.startPage)
      ? pdfInfo.startPage
      : undefined;
    const endPage = Number.isFinite(pdfInfo.endPage)
      ? pdfInfo.endPage
      : undefined;

    await Blog.findOneAndUpdate(
      { notionId },
      {
        title,
        titleEn,
        tags,
        blocks,
        date,
        pdfUrl,
        startPage,
        endPage,
        updatedAt: new Date()
      },
      { upsert: true }
    );

    try {
      await notion.pages.update({
        page_id: notionId,
        properties: {
          EN: {
            rich_text: [{ text: { content: 'yes' } }]
          }
        }
      });
    } catch (err) {
      console.error(`Failed to update EN flag for ${title}:`, err);
    }
  }

  console.log('Sync Complete!');
  process.exit();
}

syncNotionToMongo().catch(console.error);
