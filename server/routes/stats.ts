import { desc, sql } from 'drizzle-orm'
import { Hono } from 'hono'
import { db } from '../db/client'
import { characters, echoSets, syncRuns, weapons } from '../db/schema'
import { setCache } from '../lib/cache'

export const statsRoute = new Hono()

statsRoute.get('/', async (c) => {
  const [
    characterCountRows,
    weaponCountRows,
    echoCountRows,
    elements,
    rarities,
    weaponTypes,
    latestRows,
  ] = await Promise.all([
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(characters),
    db.select({ count: sql<number>`count(*)::int` }).from(weapons),
    db.select({ count: sql<number>`count(*)::int` }).from(echoSets),
    db
      .select({
        key: characters.element,
        count: sql<number>`count(*)::int`,
      })
      .from(characters)
      .groupBy(characters.element),
    db
      .select({
        key: characters.rarity,
        count: sql<number>`count(*)::int`,
      })
      .from(characters)
      .groupBy(characters.rarity),
    db
      .select({
        key: weapons.type,
        count: sql<number>`count(*)::int`,
      })
      .from(weapons)
      .groupBy(weapons.type),
    db
      .select({
        status: syncRuns.status,
        startedAt: syncRuns.startedAt,
        finishedAt: syncRuns.finishedAt,
        counts: syncRuns.counts,
      })
      .from(syncRuns)
      .orderBy(desc(syncRuns.startedAt))
      .limit(1),
  ])

  setCache(c)

  return c.json({
    counts: {
      characters: characterCountRows[0]?.count ?? 0,
      weapons: weaponCountRows[0]?.count ?? 0,
      echoes: echoCountRows[0]?.count ?? 0,
    },
    elements,
    rarities,
    weaponTypes,
    meta: latestRows[0] ?? null,
  })
})
