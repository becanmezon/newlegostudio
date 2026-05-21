import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import fs from 'fs'
import path from 'path'

export default defineConfig({
  base: '/',
  plugins: [
    react(),
    tailwindcss(),
    {
      // Return a real 404 (not SPA-fallback HTML) for .dat files that don't exist.
      // Without this, Vite serves index.html with HTTP 200 for every missing path,
      // causing Three.js FileLoader to accept the HTML, and LDrawLoader to choke on
      // "Unknown line type <!doctype" when it tries to parse the HTML as LDraw content.
      name: 'ldraw-dat-404',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          const url = req.url ?? ''
          if (!url.match(/\.dat(\?.*)?$/)) return next()

          const urlPath = url.split('?')[0]
          const filePath = path.join(process.cwd(), 'public', urlPath)
          if (!fs.existsSync(filePath)) {
            res.writeHead(404, { 'Content-Type': 'text/plain' })
            res.end('Not found')
            return
          }
          next()
        })
      },
    },
  ],
})
