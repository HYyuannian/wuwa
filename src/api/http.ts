const FALLBACK_API_BASE = 'https://wuwa-hyyuannian.vercel.app/api'

const runtimeBase =
  typeof window !== 'undefined' && window.location.hostname.endsWith('github.io')
    ? FALLBACK_API_BASE
    : '/api'

export const API_BASE = (
  (import.meta.env.VITE_API_BASE as string | undefined) || runtimeBase
).replace(/\/$/, '')

export class ApiError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

export async function apiGet<T>(
  path: string,
  params?: Record<string, string | number | undefined | null>,
  signal?: AbortSignal,
): Promise<T> {
  const origin =
    typeof window === 'undefined' ? 'http://localhost' : window.location.origin
  const url = new URL(
    API_BASE.startsWith('http') ? `${API_BASE}${path}` : `${origin}${API_BASE}${path}`,
  )

  for (const [key, value] of Object.entries(params ?? {})) {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, String(value))
    }
  }

  const timeoutSignal = AbortSignal.timeout(15_000)
  const requestSignal = signal
    ? AbortSignal.any([signal, timeoutSignal])
    : timeoutSignal

  const response = await fetch(url, {
    headers: { accept: 'application/json' },
    signal: requestSignal,
  })

  if (!response.ok) {
    let message = `请求失败：HTTP ${response.status}`

    try {
      const body = (await response.json()) as { error?: string }
      if (body.error) message = body.error
    } catch {
      // Ignore non-JSON errors.
    }

    throw new ApiError(response.status, message)
  }

  return (await response.json()) as T
}
