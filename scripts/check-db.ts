import 'dotenv/config'
import { desc, sql } from 'drizzle-orm'
import { getDb } from '../api/lib/db/client'
import {
  characters,
  echoSets,
  syncRuns,
  weapons,
} from '../api/lib/db/schema'

try {
  const db = getDb()
  const [characterCount] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(characters)
  const [weaponCount] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(weapons)
  const [echoCount] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(echoSets)

  const [latest] = await db
    .select({
      status: syncRuns.status,
      finishedAt: syncRuns.finishedAt,
      counts: syncRuns.counts,
    })
    .from(syncRuns)
    .orderBy(desc(syncRuns.startedAt))
    .limit(1)

  console.log(
    `[db] characters=${characterCount?.count ?? 0} weapons=${weaponCount?.count ?? 0} echoes=${echoCount?.count ?? 0}`,
  )
  console.log(
    `[db] latest sync: ${latest?.status ?? 'none'} ${
      latest?.finishedAt?.toISOString() ?? ''
    }`,
  )
} catch (error) {
  console.error(
    '[db] 检查失败，请确认已运行 npm run db:migrate 和 npm run sync:db',
  )
  console.error(error)
  process.exitCode = 1
}
