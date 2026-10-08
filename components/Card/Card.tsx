import Link from 'next/link';
import styles from './Card.module.scss';
interface CardProps {
  title: string;
  description: React.ReactNode;
  link: string;
  linkDescription: string;
  size: object;
  img?: string;
  category?: string;
  variant?: 'default' | 'editorial' | 'stories';
  date?: string | null;
  linkTarget?: '_blank' | '_self';
  secondaryLink?: string;
  secondaryLinkDescription?: string;
  secondaryLinkTarget?: '_blank' | '_self';
}
const Card: React.FC<CardProps> = ({
  title,
  description,
  img,
  category,
  variant = 'default',
  link,
  linkDescription,
  size,
  date,
  linkTarget = '_blank',
  secondaryLink,
  secondaryLinkDescription,
  secondaryLinkTarget = '_self',
}) => {
  const linkBlockClassName = `${styles.linkBlock} ${
    img ? styles.linkBlockWithImage : styles.linkBlockNoImage
  }`;
  const categoryTone =
    category?.toLowerCase() === 'reading'
      ? styles.reading
      : category?.toLowerCase() === 'dissertation'
        ? styles.dissertation
        : styles.categoryDefault;
  const variantClass =
    variant === 'editorial'
      ? styles.editorial
      : variant === 'stories'
        ? styles.stories
        : '';

  return (
    <article
      className={`card ${styles.card} ${variantClass} ${
        variant === 'stories' && !img ? styles.storiesNoImage : ''
      }`}
      style={size}
    >
      {img && (
        <Link
          href={link}
          target={linkTarget}
          className={styles.imageLink}
          style={{ backgroundImage: `url("${img}")` }}
          aria-label={`閱讀：${title}`}
        />
      )}
      <div className={styles.cardContent}>
        {category && (
          <span className={`${styles.category} ${categoryTone}`}>
            {category}
          </span>
        )}
        <div className={styles.headerRow}>
          <h3 className={styles.cardTitle}>{title}</h3>
          {date && (
            <time className={styles.dateText} dateTime={date}>
              {new Date(date).toLocaleDateString('zh-TW')}
            </time>
          )}
        </div>
        {description && (
          <div className={styles.cardText}>
            {description}
          </div>
        )}
        <div className={linkBlockClassName}>
          {secondaryLink && secondaryLinkDescription && (
            <Link href={secondaryLink} target={secondaryLinkTarget}>
              {secondaryLinkDescription} »
            </Link>
          )}
          {secondaryLink && secondaryLinkDescription && (
            <span className={styles.linkSeparator}>｜</span>
          )}
          <Link href={link} target={linkTarget}>
            {linkDescription} »
          </Link>
        </div>
      </div>
    </article>
  );
};

export default Card;
