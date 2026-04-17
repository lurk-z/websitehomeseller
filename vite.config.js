import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { buildContactResponse } from './api/contact-handler.js'

function readRequestBody(req) {
  return new Promise((resolve, reject) => {
    let rawBody = ''

    req.on('data', (chunk) => {
      rawBody += chunk
    })

    req.on('end', () => {
      resolve(rawBody)
    })

    req.on('error', (error) => {
      reject(error)
    })
  })
}

function contactApiDevPlugin() {
  return {
    name: 'contact-api-dev',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url || !req.url.startsWith('/api/contact')) {
          return next()
        }

        try {
          const body = await readRequestBody(req)
          const result = buildContactResponse({
            method: req.method || 'GET',
            body,
          })

          Object.entries(result.headers).forEach(([name, value]) => {
            res.setHeader(name, value)
          })

          if (result.logEntry) {
            console.log(JSON.stringify(result.logEntry))
          }

          res.statusCode = result.status
          res.end(JSON.stringify(result.body))
        } catch (error) {
          console.error(error)
          res.statusCode = 500
          res.setHeader('Content-Type', 'application/json')
          res.setHeader('Cache-Control', 'no-store')
          res.end(
            JSON.stringify({
              ok: false,
              message: 'Internal server error.',
            }),
          )
        }
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), contactApiDevPlugin()],
})
