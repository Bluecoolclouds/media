import './globals.css';
import { Inter } from "next/font/google";
import HtmlLangSync from '../components/HtmlLangSync';

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata = {
  title: 'apinet.cloud — AI Image & Video Studio',
  description: 'Generate AI images and videos using 200+ models — Flux, Midjourney, Kling, Veo, Seedance and more.',
};

export default function RootLayout({ children }) {
  // lang="en" is the SSR default; HtmlLangSync corrects it on the client.
  return (
    <html lang="en">
      <body className={inter.variable}>
        <HtmlLangSync />
        {children}
      </body>
    </html>
  );
}
