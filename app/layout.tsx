import '../styles/globals.scss';
import type { Metadata } from 'next';
import Script from 'next/script';

export const metadata: Metadata = {
  metadataBase: new URL('https://hoachiao.com'),
  title: {
    default: '阿樵四界看｜何阿樵 Ho A Chiao',
    template: '%s｜阿樵四界看',
  },
  description:
    '從臺灣到東南亞，追查信仰、語言、飲食與遷徙留下的文化線索。何阿樵的故事文章、旅行觀察與攝影筆記。',
  applicationName: '阿樵四界看',
  openGraph: {
    type: 'website',
    locale: 'zh_TW',
    siteName: '阿樵四界看',
    title: '阿樵四界看｜何阿樵 Ho A Chiao',
    description:
      '從臺灣到東南亞，追查信仰、語言、飲食與遷徙留下的文化線索。何阿樵的故事文章、旅行觀察與攝影筆記。',
    url: 'https://hoachiao.com/',
  },
  twitter: {
    card: 'summary',
    title: '阿樵四界看｜何阿樵 Ho A Chiao',
    description:
      '從臺灣到東南亞，追查信仰、語言、飲食與遷徙留下的文化線索。何阿樵的故事文章、旅行觀察與攝影筆記。',
  },
  icons: {
    icon: '/images/a-chiao-logo.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='zh-Hant'>
      <body>
        <Script
          src='https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js'
          strategy='afterInteractive'
        />
        {children}
      </body>
    </html>
  );
}
