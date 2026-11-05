import type { IncomingMessage, ServerResponse } from 'node:http'
import { app } from '../server/app'

export const config = {
  maxDuration: 60,
}

function nodeHeaders(req: IncomingMessage): Headers {
  const headers = new Headers()

  for (const [key, value] of Object.entries(req.headers)) {
    if (Array.isArray(value)) {
      for (const item of value) headers.append(key, item)
    } else if (value !== undefined) {
      headers.set(key, value)
    }
  }

  return headers
}

async function handleNodeRequest(
  req: IncomingMessage,
  res: ServerResponse,
) {
  const host = req.headers.host ?? 'localhost'
  const url = new URL(req.url ?? '/', `https://${host}`)
  const response = await app.fetch(
    new Request(url, {
      method: req.method,
      headers: nodeHeaders(req),
    }),
  )

  res.statusCode = response.status
  response.headers.forEach((value, key) => {
    res.setHeader(key, value)
  })
  res.end(Buffer.from(await response.arrayBuffer()))
}

export default async function handler(
  req: IncomingMessage | Request,
  res?: ServerResponse,
) {
  const message = (error: unknown) =>
    error instanceof Error ? error.message : String(error)

  try {
    if (res) {
      await handleNodeRequest(req as IncomingMessage, res)
      return
    }

    return await app.fetch(req as Request)
  } catch (error) {
    console.error('[api] adapter error', error)

    if (res) {
      res.statusCode = 500
      res.setHeader('content-type', 'application/json')
      res.end(JSON.stringify({ error: message(error) }))
      return
    }

    return new Response(JSON.stringify({ error: message(error) }), {
      status: 500,
      headers: { 'content-type': 'application/json' },
    })
  }
}
