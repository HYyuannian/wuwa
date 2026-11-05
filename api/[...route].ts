import type { IncomingMessage, ServerResponse } from 'node:http'
import { app } from '../server/app'

export const config = {
  maxDuration: 60,
}

export default async function handler(
  req: IncomingMessage,
  res: ServerResponse,
) {
  try {
    const host = req.headers.host ?? 'localhost'
    const url = new URL(req.url ?? '/', `https://${host}`)

    const headers = new Headers()
    for (const [key, value] of Object.entries(req.headers)) {
      if (Array.isArray(value)) {
        for (const item of value) headers.append(key, item)
      } else if (value !== undefined) {
        headers.set(key, value)
      }
    }

    const request = new Request(url, {
      method: req.method,
      headers,
    })

    const response = await app.fetch(request)

    res.statusCode = response.status
    response.headers.forEach((value, key) => {
      res.setHeader(key, value)
    })
    res.end(Buffer.from(await response.arrayBuffer()))
  } catch (error) {
    console.error('[api] adapter error', error)
    res.statusCode = 500
    res.setHeader('content-type', 'application/json')
    res.end(JSON.stringify({ error: 'Internal Server Error' }))
  }
}
