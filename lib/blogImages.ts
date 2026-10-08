import { BlogBlock } from '@type/blogs';

export function removeInlineImageDuplicates(blocks: BlogBlock[]) {
  return blocks.filter((block, index) => {
    if (block.type !== 'image' || !block.url?.startsWith('data:image/')) {
      return true;
    }

    return ![blocks[index - 1], blocks[index + 1]].some(
      (neighbor) =>
        neighbor?.type === 'image' &&
        !neighbor.url?.startsWith('data:image/')
    );
  });
}
