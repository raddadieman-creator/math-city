import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base: './' يجعل مسارات الأصول نسبية، فيعمل الموقع على Vercel أو أي استضافة ثابتة.
export default defineConfig({
  base: './',
  plugins: [react()],
  build: { outDir: 'dist', sourcemap: false },
});
