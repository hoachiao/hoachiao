import BlogCodeBlock from '@components/BlogCodeBlock/BlogCodeBlock';
import AutoLinkText from '@components/AutoLinkText/AutoLinkText';
import { BlogsType } from 'type/blogs';
import { STORY_CATEGORY } from '@lib/blogCategories';

interface CodeBlogProps {
  blog: BlogsType;
}
const blockContentColor = {
  Easy: 'success',
  Medium: 'warning',
  Hard: 'danger',
};

const CodeBlog = ({ blog }: CodeBlogProps) => {
  if (!blog.blocks || blog.blocks.length === 0) return null;

  return (
    <>
      {blog.blocks.map((block, index) => {
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
                language={block.language ?? ''}
              />
            );
            case 'image':
            if (!block.url) return null;
            return (
              <img
                key={`image-${index}`}
                src={block.url}
                alt={block.caption || 'blog image'}
                width={700}
                height={'auto'}
              />
            );
          case 'text':
            if (index === 0) {
              return (
                <div  key={`image-${index}`} className="mb-4">
                <span key={`text-${index}-tag`} className={`badge text-bg-dark me-2`}>{blog?.tags?.length && blog?.tags?.length > 0 ? blog.tags[0] === STORY_CATEGORY ? '故事筆記' : blog.tags[0] : 'NeetCode'}</span>
                <span
                  key={`text-${index}-badge`}
                  className={`badge text-bg-${blockContentColor[block.content as keyof typeof blockContentColor]}`}
                >
                  {block.content}
                </span>
                </div>
              );
            }
            if (index === 1) {
              return null;
            }
            return (
              <p key={`text-${index}`}>
                <AutoLinkText
                  text={block.content ?? ''}
                  links={block.links}
                />
              </p>
            );
          default:
            return null;
        }
      })}
    </>
  );
};

export default CodeBlog;
