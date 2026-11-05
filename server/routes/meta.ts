import { desc } from 'drizzle-orm'
import { Hono } from 'hono'
import { getDb } from '../db/client'
import { syncRuns } from '../db/schema'
import { setCache } from '../lib/cache'

export const metaRoute = new Hono()

metaRoute.get('/', async (c) => {
  const db = getDb()
  const [latest] = await db
    .select({
      status: syncRuns.status,
      startedAt: syncRuns.startedAt,
      finishedAt: syncRuns.finishedAt,
      counts: syncRuns.counts,
      error: syncRuns.error,
    })
    .from(syncRuns)
    .orderBy(desc(syncRuns.startedAt))
    .limit(1)

  setCache(c, 60)

  return c.json({
    source: 'encore.moe',
    ...(latest ?? {
      status: 'unknown',
      startedAt: null,
      finishedAt: null,
      counts: null,
      error: null,
    }),
  })
})
