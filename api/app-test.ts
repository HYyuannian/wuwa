export default async function handler(_req: unknown, res?: any) {
  let payload: string

  try {
    const { app } = await import('../server/app')
    const response = await app.fetch(
      new Request('https://localhost/api/health'),
    )
    payload = JSON.stringify({
      imported: true,
      status: response.status,
      body: await response.text(),
    })
  } catch (error) {
    payload = JSON.stringify({
      imported: false,
      name: error instanceof Error ? error.name : typeof error,
      message: error instanceof Error ? error.message : String(error),
      code:
        typeof error === 'object' && error && 'code' in error
          ? (error as { code?: string }).code
          : undefined,
    })
  }

  if (res) {
    res.statusCode = 200
    res.setHeader('content-type', 'application/json')
    res.end(payload)
    return
  }

  return new Response(payload, {
    status: 200,
    headers: { 'content-type': 'application/json' },
  })
}
