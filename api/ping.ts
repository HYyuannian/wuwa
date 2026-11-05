export default function handler(_req: unknown, res?: any) {
  const body = JSON.stringify({ ok: true, ping: true })

  if (res) {
    res.statusCode = 200
    res.setHeader('content-type', 'application/json')
    res.end(body)
    return
  }

  return new Response(body, {
    status: 200,
    headers: { 'content-type': 'application/json' },
  })
}
