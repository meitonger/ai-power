// apps/web/pages/_app.tsx
import { AppProps } from 'next/app';
import ChatWidget from '../components/ChatWidget';
import '../styles/globals.css';

export default function MyApp({ Component, pageProps }: AppProps) {
  // 临时移除 auth 检查，直接渲染页面
  return (
    <>
      <Component {...pageProps} />
      <ChatWidget />
    </>
  );
}
