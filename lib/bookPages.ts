import type { BlogBlock } from '@type/blogs';
import { removeInlineImageDuplicates } from './blogImages';

// These are reading sections, not fixed-height clipping boxes. Keep paragraphs,
// code blocks and image captions intact, even if a section needs to grow taller.
export function paginateBookBlocks(blocks: BlogBlock[], budget = 1100): BlogBlock[][] {
  const visible = removeInlineImageDuplicates(blocks).filter((block) =>
    block.type === 'image' ? !!block.url : ['heading', 'text', 'code'].includes(block.type) && !!block.content?.trim()
  );
  const pages: BlogBlock[][] = [];
  let page: BlogBlock[] = [];
  let size = 0;
  const weight = (block: BlogBlock) => block.type === 'image' ? 650 : Math.max(100, block.content?.length ?? 0);
  for (let index = 0; index < visible.length; index++) {
    const block = visible[index];
    const cost = weight(block);
    const nextCost = block.type === 'heading' && visible[index + 1] ? weight(visible[index + 1]) : 0;
    const followsHeading = page[page.length - 1]?.type === 'heading';
    if (page.length && !followsHeading && size + cost + nextCost > budget) {
      pages.push(page);
      page = [];
      size = 0;
    }
    page.push(block);
    size += cost;
  }
  if (page.length) pages.push(page);
  return pages.length ? pages : [[]];
}

export function bookPageIndex(raw: string | null, count: number) {
  if (raw === 'last') return Math.max(0, count - 1);
  const value = Number(raw ?? '1');
  return Number.isSafeInteger(value) && value > 0 ? Math.min(value - 1, count - 1) : 0;
}

export function bookArticleHref(id: string, lang: string, topic: string, page: number | 'last' = 1) {
  return `/blogs/${encodeURIComponent(id)}?${new URLSearchParams({ lang, topic, page: String(page) })}`;
}
