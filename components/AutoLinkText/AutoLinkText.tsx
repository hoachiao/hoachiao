import { ReactNode } from 'react';
import { BlogTextLink } from '@type/blogs';

interface AutoLinkTextProps {
  text: string;
  links?: BlogTextLink[];
}

const markdownLinkPattern = /\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/gi;
const urlPattern = /https?:\/\/[^\s<>"'`()\[\]／]+/gi;
const trailingPunctuation = /[.,!?;:，。！？；：、）】」』》]+$/;

function isSafeHttpUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

export default function AutoLinkText({ text, links = [] }: AutoLinkTextProps) {
  const markdownMatches = Array.from(text.matchAll(markdownLinkPattern)).flatMap(
    (match) => {
      const label = match[1];
      const url = match[2];
      const start = match.index ?? 0;
      return isSafeHttpUrl(url)
        ? [
            {
              start,
              end: start + match[0].length,
              label,
              url,
            },
          ]
        : [];
    }
  );

  let linkCursor = 0;
  const linkMatches = links.flatMap((link) => {
    if (!link.text || !isSafeHttpUrl(link.url)) return [];
    const index = text.indexOf(link.text, linkCursor);
    if (index < 0) return [];
    linkCursor = index + link.text.length;
    return [
      {
        start: index,
        end: linkCursor,
        label: link.text,
        url: link.url,
      },
    ];
  });

  const urlMatches = Array.from(text.matchAll(urlPattern)).flatMap((match) => {
    const rawUrl = match[0];
    const start = match.index ?? 0;
    const url = rawUrl.replace(trailingPunctuation, '');
    return url && isSafeHttpUrl(url)
      ? [{ start, end: start + url.length, label: url, url }]
      : [];
  });
  const matches = [...markdownMatches, ...linkMatches, ...urlMatches]
    .sort((left, right) => left.start - right.start || right.end - left.end)
    .filter((match, index, all) =>
      !all.slice(0, index).some(
        (previous) => match.start < previous.end && match.end > previous.start
      )
    );

  if (matches.length === 0) return <>{text}</>;
  const parts: ReactNode[] = [];
  let cursor = 0;

  matches.forEach((match, index) => {
    parts.push(text.slice(cursor, match.start));
    parts.push(
      <a
        key={`${match.start}-${index}`}
        href={match.url}
        target='_blank'
        rel='noopener noreferrer'
      >
        {match.label}
      </a>
    );
    cursor = match.end;
  });

  parts.push(text.slice(cursor));
  return <>{parts}</>;
}
