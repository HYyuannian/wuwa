import { zValidator } from '@hono/zod-validator'
import { asc, eq, type SQL } from 'drizzle-orm'
import { Hono } from 'hono'
import { HTTPException } from 'hono/http-exception'
import { z } from 'zod'
import { db } from '../db/client'
import { echoSets } from '../db/schema'
import { setCache } from '../lib/cache'

const querySchema = z.object({
  element: z
    .enum([
      'glacio',
      'fusion',
      'electro',
      'aero',
      'spectro',
      'havoc',
    ])
    .optional(),
})

export const echoesRoute = new Hono()

echoesRoute.get(
  '/',
  zValidator('query', querySchema),
  async (c) => {
    const { element } = c.req.valid('query')
    const filters: SQL[] = []

    if (element) filters.push(eq(echoSets.element, element))

    const items = await db
      .select()
      .from(echoSets)
      .where(filters.length ? filters[0] : undefined)
      .orderBy(asc(echoSets.id))

    setCache(c)

    return c.json({ items, total: items.length })
  },
)

echoesRoute.get('/:id', async (c) => {
  const id = c.req.param('id')

  const [echo] = await db
    .select()
    .from(echoSets)
    .where(eq(echoSets.id, id))
    .limit(1)

  if (!echo) {
    throw new HTTPException(404, { message: 'Echo set not found' })
  }

  setCache(c)

  return c.json(echo)
})
