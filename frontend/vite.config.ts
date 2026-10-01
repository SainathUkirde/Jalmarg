import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiTarget = env.VITE_API_URL || 'http://localhost:8000'

  return {
    plugins: [react()],
    server: {
      proxy: {
        '/predict': apiTarget,
        '/optimize': apiTarget,
        '/benchmark': apiTarget,
        '/risk': apiTarget,
        '/whatif': apiTarget,
        '/report': apiTarget,
        '/health': apiTarget,
      },
    },
  }
})
