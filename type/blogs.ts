import { ObjectId } from 'mongodb';

export interface BlogTextLink {
  text: string;
  url: string;
}

export interface BlogBlock {
  url?: string;
  caption?: string;
  type: string;
  content?: string;
  language?: string;
  links?: BlogTextLink[];
}

export interface BlogsType {
  _id?: ObjectId | string;
  id: number | string;
  title: string;
  titleEn?: string;
  summary?: string;
  imageUrl?: string;
  paragraph?: string;
  content?: string;
  link?: string;
  reference?: { id: number; title: string; link: string }[];
  tags?: string[];
  blocks?: BlogBlock[];
  blocksEn?: BlogBlock[];
  summaryLinks?: BlogTextLink[];
  pdfUrl?: string;
  startPage?: number;
  endPage?: number;
  notionId?: string;
  date?: string | null;
}
