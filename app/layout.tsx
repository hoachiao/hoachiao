import '../styles/globals.scss';
import type { Metadata } from 'next';
import Script from 'next/script';

export const metadata: Metadata = {
  title: '何阿樵 Ho A Chiao',
  description:
    '從臺灣到東南亞，追查信仰、語言、飲食與遷徙留下的文化線索。何阿樵的故事文章、旅行觀察與攝影筆記。',
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
    <html lang='en'>
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
