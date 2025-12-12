// Generador de Texto Realista (c) 2025 Juan José de Haro - Licencia AGPL v3: https://www.gnu.org/licenses/agpl-3.0.html
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: '/generador_texto/',
  plugins: [react()],
})
