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
import { getDb } from '../db/client'
import {
  characterRoles,
  characterSkills,
  characterStats,
  characters,
} from '../db/schema'
import { setCache } from '../lib/cache'

const elementSchema = z.enum([
  'glacio',
  'fusion',
  'electro',
  'aero',
  'spectro',
  'havoc',
])

const weaponSchema = z.enum([
  'broadblade',
  'sword',
  'pistols',
  'gauntlets',
  'rectifier',
])

const querySchema = z.object({
  element: elementSchema.optional(),
  weapon: weaponSchema.optional(),
  rarity: z.coerce.number().int().min(1).max(5).optional(),
  q: z.string().trim().max(50).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(24),
})

export const charactersRoute = new Hono()

charactersRoute.get(
  '/',
  zValidator('query', querySchema),
  async (c) => {
    const db = getDb()
    const { element, weapon, rarity, q, page, pageSize } =
      c.req.valid('query')

    const filters: SQL[] = []

    if (element) filters.push(eq(characters.element, element))
    if (weapon) filters.push(eq(characters.weaponType, weapon))
    if (rarity) filters.push(eq(characters.rarity, rarity))
    if (q) filters.push(ilike(characters.name, `%${q}%`))

    const where = filters.length ? and(...filters) : undefined

    const [{ count }] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(characters)
      .where(where)

    const items = await db
      .select({
        id: characters.id,
        name: characters.name,
        rarity: characters.rarity,
        element: characters.element,
        weaponType: characters.weaponType,
        avatarUrl: characters.avatarUrl,
      })
      .from(characters)
      .where(where)
      .orderBy(desc(characters.rarity), asc(characters.name))
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

charactersRoute.get('/:id', async (c) => {
  const db = getDb()
  const id = c.req.param('id')

  const [character] = await db
    .select()
    .from(characters)
    .where(eq(characters.id, id))
    .limit(1)

  if (!character) {
    throw new HTTPException(404, { message: 'Character not found' })
  }

  const statsRows = await db
    .select()
    .from(characterStats)
    .where(eq(characterStats.characterId, id))
    .limit(1)

  const skills = await db
    .select({
      name: characterSkills.name,
      type: characterSkills.type,
      description: characterSkills.description,
      sortOrder: characterSkills.sortOrder,
    })
    .from(characterSkills)
    .where(eq(characterSkills.characterId, id))
    .orderBy(asc(characterSkills.sortOrder))

  const roles = await db
    .select({ role: characterRoles.role })
    .from(characterRoles)
    .where(eq(characterRoles.characterId, id))

  setCache(c)

  return c.json({
    ...character,
    stats: statsRows[0] ?? null,
    skills,
    roles: roles.map((item) => item.role),
  })
})
