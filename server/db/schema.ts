import {
  doublePrecision,
  index,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  serial,
  text,
  timestamp,
} from 'drizzle-orm/pg-core'

export const characters = pgTable(
  'characters',
  {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    rarity: integer('rarity').notNull(),
    element: text('element').notNull(),
    weaponType: text('weapon_type').notNull(),
    avatarUrl: text('avatar_url'),
    description: text('description'),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index('characters_element_idx').on(table.element),
    index('characters_weapon_type_idx').on(table.weaponType),
    index('characters_rarity_idx').on(table.rarity),
    index('characters_name_idx').on(table.name),
  ],
)

export const characterStats = pgTable(
  'character_stats',
  {
    characterId: text('character_id')
      .notNull()
      .references(() => characters.id, { onDelete: 'cascade' }),
    level: integer('level').notNull().default(1),
    hp: integer('hp'),
    atk: doublePrecision('atk'),
    def: doublePrecision('def'),
    critRate: doublePrecision('crit_rate'),
    critDamage: doublePrecision('crit_damage'),
    energyRegen: doublePrecision('energy_regen'),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [primaryKey({ columns: [table.characterId, table.level] })],
)

export const characterSkills = pgTable(
  'character_skills',
  {
    id: serial('id').primaryKey(),
    characterId: text('character_id')
      .notNull()
      .references(() => characters.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    type: text('type').notNull(),
    description: text('description').notNull(),
    sortOrder: integer('sort_order').notNull().default(0),
  },
  (table) => [index('character_skills_character_idx').on(table.characterId)],
)

export const characterRoles = pgTable(
  'character_roles',
  {
    characterId: text('character_id')
      .notNull()
      .references(() => characters.id, { onDelete: 'cascade' }),
    role: text('role').notNull(),
  },
  (table) => [primaryKey({ columns: [table.characterId, table.role] })],
)

export const weapons = pgTable(
  'weapons',
  {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    rarity: integer('rarity').notNull(),
    type: text('type').notNull(),
    baseAtk: integer('base_atk'),
    subStat: text('sub_stat'),
    description: text('description'),
    iconUrl: text('icon_url'),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index('weapons_type_idx').on(table.type),
    index('weapons_rarity_idx').on(table.rarity),
    index('weapons_name_idx').on(table.name),
  ],
)

export const echoSets = pgTable(
  'echo_sets',
  {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    element: text('element'),
    twoPiece: text('two_piece'),
    fivePiece: text('five_piece'),
    iconUrl: text('icon_url'),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [index('echo_sets_element_idx').on(table.element)],
)

export const syncRuns = pgTable('sync_runs', {
  id: serial('id').primaryKey(),
  trigger: text('trigger').notNull().default('manual'),
  status: text('status').notNull().default('running'),
  startedAt: timestamp('started_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  finishedAt: timestamp('finished_at', { withTimezone: true }),
  counts: jsonb('counts').$type<Record<string, number>>(),
  error: text('error'),
})

export type Character = typeof characters.$inferSelect
export type CharacterStat = typeof characterStats.$inferSelect
export type CharacterSkill = typeof characterSkills.$inferSelect
export type CharacterRole = typeof characterRoles.$inferSelect
export type Weapon = typeof weapons.$inferSelect
export type EchoSet = typeof echoSets.$inferSelect
export type SyncRun = typeof syncRuns.$inferSelect
