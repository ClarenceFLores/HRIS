import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
    server: {
        port: 5173,
    },
    build: {
        sourcemap: false,
        rollupOptions: {
            onwarn: function (warning, warn) {
                // Suppress source map warnings
                if (warning.code === 'SOURCEMAP_ERROR')
                    return;
                warn(warning);
            },
        },
    },
    optimizeDeps: {
        exclude: ['lucide-react'],
    },
});
