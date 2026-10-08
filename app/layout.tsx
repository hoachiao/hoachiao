import '../styles/globals.scss';
import type { Metadata } from 'next';
import Script from 'next/script';

export const metadata: Metadata = {
  title: 'ho-a-chiao',
  description: 'A Frontend Developer based in Taipei',
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
