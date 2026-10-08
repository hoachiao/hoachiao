import BlogCodeBlock from '@components/BlogCodeBlock/BlogCodeBlock';
import AutoLinkText from '@components/AutoLinkText/AutoLinkText';
import { BlogsType } from 'type/blogs';
import { removeInlineImageDuplicates } from '@lib/blogImages';

interface ReadingBlogProps {
  blog: BlogsType;
  lang: 'zh' | 'en';
}

const ReadingBlog = ({ blog, lang }: ReadingBlogProps) => {
  const isDissertation = blog.tags?.includes('Disseration');
  if (isDissertation && lang === 'en' && blog.pdfUrl && blog.startPage) {
    const pdfSrc = `${blog.pdfUrl}#page=${blog.startPage}`;
    return (
      <iframe
        title='Dissertation PDF'
        src={pdfSrc}
        style={{ width: '100%', height: '80vh', border: 'none' }}
      />
    );
  }
  if (!blog.blocks || blog.blocks.length === 0) return null;
  const blocks = removeInlineImageDuplicates(blog.blocks);

const getPointTitle=(str:string)=>{
    const regex = /^（[一二三四五六七八九十百千]+）/
    const match = str.match(regex);
  return match ? match[0] : null;
};

  return (
    <>
      {blocks.map((block, index) => {
        switch (block.type) {
          case 'heading':
            return (
              <h2 key={`heading-${index}`}>
                <AutoLinkText
                  text={block.content ?? ''}
                  links={block.links}
                />
              </h2>
            );
          case 'code':
            return (
              <BlogCodeBlock
                key={`code-${index}`}
                code={block.content ?? ''}
                language={block.language}
              />
            );
          case 'text':
            return (
              <p
                key={`text-${index}`}
                className={getPointTitle(block.content ?? '') ? 'fw-bold' : ''}
              >
                <AutoLinkText
                  text={block.content ?? ''}
                  links={block.links}
                />
              </p>
            );
          case 'image':
            if (!block.url) return null;
            return (
              <img
                key={`image-${index}`}
                src={block.url}
                alt={block.caption || 'blog image'}
                width={400}
                height={'auto'}
              />
            );
          default:
            return null;
        }
      })}
    </>
  );
};

export default ReadingBlog;
