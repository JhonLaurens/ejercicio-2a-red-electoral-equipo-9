import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  // Vite's loadEnv merges process.env with higher priority than the .env
  // files, which means a shell-level GEMINI_API_KEY silently overrides the
  // project's .env. We parse the project .env directly and prefer its value
  // so the repository's configuration is the source of truth.
  const envFilePath = path.resolve(__dirname, '.env');
  const fileEnv = fs.existsSync(envFilePath)
    ? dotenv.parse(fs.readFileSync(envFilePath))
    : {};
  const geminiApiKey = fileEnv.GEMINI_API_KEY ?? env.GEMINI_API_KEY ?? '';
  return {
    plugins: [react(), tailwindcss()],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(geminiApiKey),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
