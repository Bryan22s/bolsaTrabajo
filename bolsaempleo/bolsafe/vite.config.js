import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
    plugins: [react()],

    server: {
        port: 5173,
        // En desarrollo, redirige las llamadas a /api al backend Spring (puerto 8080)
        // Así no hay problemas de CORS en desarrollo
        proxy: {
            '/api': 'http://localhost:8081',
            '/curriculos': 'http://localhost:8081'
        }
    },

    build: {
        // El build se genera DENTRO del proyecto Spring Boot,
        // en la carpeta de recursos estáticos que Spring sirve
        outDir: '../bolsabe/src/main/resources/static',
        emptyOutDir: true
    }
})