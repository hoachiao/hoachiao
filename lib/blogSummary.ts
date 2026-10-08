import { BlogBlock } from '@type/blogs';

export function getBlogSummaryBlock(
  blocks?: BlogBlock[]
): BlogBlock | undefined {
  if (!blocks?.length) return undefined;

  const preferredIndex = blocks[0].type === 'image' ? 3 : 2;
  const preferredBlock = blocks[preferredIndex];
  if (preferredBlock?.type === 'text' && preferredBlock.content?.trim()) {
    return preferredBlock;
  }

  return blocks
    .slice(preferredIndex)
    .find((block) => block.type === 'text' && block.content?.trim());
}
