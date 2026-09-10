import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';
import basicSsl from '@vitejs/plugin-basic-ssl';
import { resolve } from 'node:path';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [vue(), basicSsl()],
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
      },
    },
    define: {
      __POWERUP_NAME__: JSON.stringify(env.VITE_POWERUP_NAME || 'Calculadora de Tempo de Task'),
      __POWERUP_APP_KEY__: JSON.stringify(env.VITE_POWERUP_APP_KEY || ''),
    },
    server: {
      port: 5173,
      strictPort: true,
      cors: true,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
    },
    preview: {
      port: 5173,
      cors: true,
    },
    build: {
      rollupOptions: {
        input: {
          main: resolve(__dirname, 'index.html'),
          'card-back-section': resolve(__dirname, 'card-back-section.html'),
        },
      },
    },
  };
});
