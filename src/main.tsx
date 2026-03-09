import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@/styles/globals.css';
import App from '@/app';
import { seedDefaultCategories } from '@/db/seed';

// DB 초기화: 기본 카테고리 시드
seedDefaultCategories().catch(console.error);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
