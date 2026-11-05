import { Hono, type Context } from 'hono'
import { HTTPException } from 'hono/http-exception'
import { isAuthorized } from '../lib/auth'
import { runSync } from '../lib/sync'

export const adminRoute = new Hono()

const syncHandler = async (c: Context) => {
  if (!isAuthorized(c.req.header('authorization'))) {
    throw new HTTPException(401, { message: 'Unauthorized' })
  }

  const result = await runSync('cron')

  return c.json({ ok: true, ...result })
}

adminRoute.get('/sync', syncHandler)
adminRoute.post('/sync', syncHandler)
