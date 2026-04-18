import { buildRegisterResponse } from './register-handler.js'

export default function handler(req, res) {
  const result = buildRegisterResponse({
    method: req.method,
    body: req.body,
  })

  Object.entries(result.headers).forEach(([name, value]) => {
    res.setHeader(name, value)
  })

  if (result.logEntry) {
    console.log(JSON.stringify(result.logEntry))
  }

  return res.status(result.status).json(result.body)
}
