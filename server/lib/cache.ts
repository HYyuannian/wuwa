import type { Context } from 'hono'

export function setCache(c: Context, seconds = 300) {
  c.header(
    'Cache-Control',
    `public, s-maxage=${seconds}, stale-while-revalidate=86400`,
  )
}
