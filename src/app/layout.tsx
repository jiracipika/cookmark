import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Cookmark',
  description: 'Save any recipe from the web in a clean, ad-free format. Plan your week, auto-generate grocery lists, and cook without distraction.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
