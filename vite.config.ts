import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react(), tailwindcss()],
    resolve: {
        alias: {
            '@client': path.resolve(__dirname, './src/client'),
            '@server': path.resolve(__dirname, './src/server'),
        },
    },
});
