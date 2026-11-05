import { zValidator } from '@hono/zod-validator'
import {
  and,
  asc,
  desc,
  eq,
  ilike,
  sql,
  type SQL,
} from 'drizzle-orm'
import { Hono } from 'hono'
import { HTTPException } from 'hono/http-exception'
import { z } from 'zod'
import { db } from '../db/client'
import { weapons } from '../db/schema'
import { setCache } from '../lib/cache'

const typeSchema = z.enum([
  'broadblade',
  'sword',
  'pistols',
  'gauntlets',
  'rectifier',
])

const querySchema = z.object({
  type: typeSchema.optional(),
  rarity: z.coerce.number().int().min(1).max(5).optional(),
  q: z.string().trim().max(50).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(24),
})

export const weaponsRoute = new Hono()

weaponsRoute.get(
  '/',
  zValidator('query', querySchema),
  async (c) => {
    const { type, rarity, q, page, pageSize } = c.req.valid('query')

    const filters: SQL[] = []

    if (type) filters.push(eq(weapons.type, type))
    if (rarity) filters.push(eq(weapons.rarity, rarity))
    if (q) filters.push(ilike(weapons.name, `%${q}%`))

    const where = filters.length ? and(...filters) : undefined

    const [{ count }] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(weapons)
      .where(where)

    const items = await db
      .select({
        id: weapons.id,
        name: weapons.name,
        rarity: weapons.rarity,
        type: weapons.type,
        baseAtk: weapons.baseAtk,
        subStat: weapons.subStat,
        iconUrl: weapons.iconUrl,
      })
      .from(weapons)
      .where(where)
      .orderBy(desc(weapons.rarity), asc(weapons.name))
      .limit(pageSize)
      .offset((page - 1) * pageSize)

    setCache(c)

    return c.json({
      items,
      total: count,
      page,
      pageSize,
    })
  },
)

weaponsRoute.get('/:id', async (c) => {
  const id = c.req.param('id')

  const [weapon] = await db
    .select()
    .from(weapons)
    .where(eq(weapons.id, id))
    .limit(1)

  if (!weapon) {
    throw new HTTPException(404, { message: 'Weapon not found' })
  }

  setCache(c)

  return c.json(weapon)
})
