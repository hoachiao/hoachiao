import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import styles from './BlogCodeBlock.module.scss';

interface BlogCodeBlockProps {
  code: string;
  language?: string;
}

const BlogCodeBlock = ({ code, language }: BlogCodeBlockProps) => {
  const normalizedLanguage = language?.toLowerCase() || 'text';
  const label = language ? language.toUpperCase() : 'CODE';

  return (
    <div className={`card mb-3 ${styles.codeCard}`}>
      <div className={`card-header ${styles.codeHeader}`}>{label}</div>
      <SyntaxHighlighter
        language={normalizedLanguage}
        style={oneLight}
        className={styles.codeBlock}
        wrapLongLines
        customStyle={{ margin: 0, background: 'transparent' }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
};

export default BlogCodeBlock;
