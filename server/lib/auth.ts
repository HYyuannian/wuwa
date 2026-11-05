import { timingSafeEqual } from 'node:crypto'

export function isAuthorized(
  authorization: string | undefined,
): boolean {
  const secret = process.env.CRON_SECRET
  if (!secret || !authorization) return false

  const token = authorization.replace(/^Bearer\s+/i, '')
  const provided = Buffer.from(token)
  const expected = Buffer.from(secret)

  return (
    provided.length === expected.length &&
    timingSafeEqual(provided, expected)
  )
}
