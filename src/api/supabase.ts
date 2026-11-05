import type { Character, EchoSet, Weapon } from '@/types'
import { ApiError } from './http'
import { toCharacter, toCharacterDetail, toEchoSet, toWeapon } from './mappers'
import type {
  CharacterDetailDto,
  CharacterStatsDto,
  DistributionItem,
  PageResponse,
  StatsDto,
} from './types'
import type {
  SnapshotCharacterFilters,
  SnapshotWeaponFilters,
} from './snapshot'

const SUPABASE_URL = (
  (import.meta.env.VITE_SUPABASE_URL as string | undefined) ?? ''
).replace(/\/$/, '')
const SUPABASE_ANON_KEY =
  (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined) ?? ''

export const hasSupabaseRest = Boolean(
  SUPABASE_URL && SUPABASE_ANON_KEY,
)

interface CharacterRow {
  id: string
  name: string
  rarity: number
  element: string
  weapon_type: string
  avatar_url: string | null
  description: string | null
}

interface CharacterStatRow {
  character_id: string
  level: number
  hp: number | null
  atk: number | null
  def: number | null
  crit_rate: number | null
  crit_damage: number | null
  energy_regen: number | null
}

interface CharacterSkillRow {
  name: string
  type: string
  description: string
  sort_order: number
}

interface CharacterRoleRow {
  role: string
}

interface WeaponRow {
  id: string
  name: string
  rarity: number
  type: string
  base_atk: number | null
  sub_stat: string | null
  description: string | null
  icon_url: string | null
}

interface EchoSetRow {
  id: string
  name: string
  element: string | null
  two_piece: string | null
  five_piece: string | null
  icon_url: string | null
}

interface SyncRunRow {
  status: string
  started_at: string | null
  finished_at: string | null
  counts: Record<string, number> | null
}

async function supabaseFetch<T>(
  table: string,
  params: URLSearchParams,
  signal?: AbortSignal,
  withCount = false,
): Promise<{ data: T[]; total: number }> {
  const headers: Record<string, string> = {
    apikey: SUPABASE_ANON_KEY,
    Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    Accept: 'application/json',
  }

  if (withCount) headers.Prefer = 'count=exact'

  const timeoutSignal = AbortSignal.timeout(15_000)
  const requestSignal = signal
    ? AbortSignal.any([signal, timeoutSignal])
    : timeoutSignal

  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/${table}?${params.toString()}`,
    { headers, signal: requestSignal },
  )

  if (!response.ok) {
    let message = `Supabase 请求失败：HTTP ${response.status}`

    try {
      const body = (await response.json()) as { message?: string }
      if (body.message) message = body.message
    } catch {
      // Ignore non-JSON errors.
    }

    throw new ApiError(response.status, message)
  }

  const data = (await response.json()) as T[]
  const contentRange = response.headers.get('content-range')
  const totalFromRange = contentRange
    ? Number(contentRange.split('/')[1])
    : NaN

  return {
    data,
    total: Number.isFinite(totalFromRange)
      ? totalFromRange
      : data.length,
  }
}

export async function fetchSupabaseCharacters(
  filters: SnapshotCharacterFilters,
  signal?: AbortSignal,
): Promise<PageResponse<Character>> {
  const page = Math.max(1, filters.page ?? 1)
  const pageSize = Math.max(1, filters.pageSize ?? 24)
  const params = new URLSearchParams({
    select: 'id,name,rarity,element,weapon_type,avatar_url',
    order: 'rarity.desc,name.asc',
    limit: String(pageSize),
    offset: String((page - 1) * pageSize),
  })

  if (filters.q) params.set('name', `ilike.*${filters.q}*`)
  if (filters.element) params.set('element', `eq.${filters.element}`)
  if (filters.weapon) params.set('weapon_type', `eq.${filters.weapon}`)
  if (filters.rarity) params.set('rarity', `eq.${filters.rarity}`)

  const { data, total } = await supabaseFetch<CharacterRow>(
    'characters',
    params,
    signal,
    true,
  )

  return {
    items: data.map((row) =>
      toCharacter({
        id: row.id,
        name: row.name,
        rarity: row.rarity,
        element: row.element,
        weaponType: row.weapon_type,
        avatarUrl: row.avatar_url,
      }),
    ),
    total,
    page,
    pageSize,
  }
}

export async function fetchSupabaseCharacter(
  id: string,
  signal?: AbortSignal,
): Promise<Character> {
  const [characterRows, statRows, skillRows, roleRows] = await Promise.all([
    supabaseFetch<CharacterRow>(
      'characters',
      new URLSearchParams({ select: '*', id: `eq.${id}`, limit: '1' }),
      signal,
    ),
    supabaseFetch<CharacterStatRow>(
      'character_stats',
      new URLSearchParams({
        select: '*',
        character_id: `eq.${id}`,
        limit: '1',
      }),
      signal,
    ),
    supabaseFetch<CharacterSkillRow>(
      'character_skills',
      new URLSearchParams({
        select: 'name,type,description,sort_order',
        character_id: `eq.${id}`,
        order: 'sort_order.asc',
      }),
      signal,
    ),
    supabaseFetch<CharacterRoleRow>(
      'character_roles',
      new URLSearchParams({
        select: 'role',
        character_id: `eq.${id}`,
      }),
      signal,
    ),
  ])

  const character = characterRows.data[0]

  if (!character) {
    throw new ApiError(404, 'Character not found')
  }

  const stat = statRows.data[0]
  const stats: CharacterStatsDto | null = stat
    ? {
        level: stat.level,
        hp: stat.hp,
        atk: stat.atk,
        def: stat.def,
        critRate: stat.crit_rate,
        critDamage: stat.crit_damage,
        energyRegen: stat.energy_regen,
      }
    : null

  const detail: CharacterDetailDto = {
    id: character.id,
    name: character.name,
    rarity: character.rarity,
    element: character.element,
    weaponType: character.weapon_type,
    avatarUrl: character.avatar_url,
    description: character.description,
    roles: roleRows.data.map((row) => row.role),
    stats,
    skills: skillRows.data.map((row) => ({
      name: row.name,
      type: row.type,
      description: row.description,
      sortOrder: row.sort_order,
    })),
  }

  return toCharacterDetail(detail)
}

export async function fetchSupabaseWeapons(
  filters: SnapshotWeaponFilters,
  signal?: AbortSignal,
): Promise<PageResponse<Weapon>> {
  const page = Math.max(1, filters.page ?? 1)
  const pageSize = Math.max(1, filters.pageSize ?? 24)
  const params = new URLSearchParams({
    select:
      'id,name,rarity,type,base_atk,sub_stat,description,icon_url',
    order: 'rarity.desc,name.asc',
    limit: String(pageSize),
    offset: String((page - 1) * pageSize),
  })

  if (filters.q) params.set('name', `ilike.*${filters.q}*`)
  if (filters.type) params.set('type', `eq.${filters.type}`)
  if (filters.rarity) params.set('rarity', `eq.${filters.rarity}`)

  const { data, total } = await supabaseFetch<WeaponRow>(
    'weapons',
    params,
    signal,
    true,
  )

  return {
    items: data.map((row) =>
      toWeapon({
        id: row.id,
        name: row.name,
        rarity: row.rarity,
        type: row.type,
        baseAtk: row.base_atk,
        subStat: row.sub_stat,
        description: row.description,
        iconUrl: row.icon_url,
      }),
    ),
    total,
    page,
    pageSize,
  }
}

export async function fetchSupabaseEchoes(
  signal?: AbortSignal,
): Promise<{ items: EchoSet[]; total: number }> {
  const { data, total } = await supabaseFetch<EchoSetRow>(
    'echo_sets',
    new URLSearchParams({ select: '*', order: 'id.asc' }),
    signal,
    true,
  )

  return {
    items: data.map((row) =>
      toEchoSet({
        id: row.id,
        name: row.name,
        element: row.element,
        twoPiece: row.two_piece,
        fivePiece: row.five_piece,
        iconUrl: row.icon_url,
      }),
    ),
    total,
  }
}

function countBy<T, K extends string | number>(
  items: T[],
  getKey: (item: T) => K,
): DistributionItem<K>[] {
  const counts = new Map<K, number>()

  for (const item of items) {
    const key = getKey(item)
    counts.set(key, (counts.get(key) ?? 0) + 1)
  }

  return [...counts.entries()].map(([key, count]) => ({ key, count }))
}

export async function fetchSupabaseStats(
  signal?: AbortSignal,
): Promise<StatsDto> {
  const [characters, weapons, echoes, latestRuns] = await Promise.all([
    supabaseFetch<Pick<CharacterRow, 'id' | 'element' | 'rarity'>>(
      'characters',
      new URLSearchParams({ select: 'id,element,rarity' }),
      signal,
    ),
    supabaseFetch<Pick<WeaponRow, 'id' | 'type'>>(
      'weapons',
      new URLSearchParams({ select: 'id,type' }),
      signal,
    ),
    supabaseFetch<{ id: string }>(
      'echo_sets',
      new URLSearchParams({ select: 'id' }),
      signal,
    ),
    supabaseFetch<SyncRunRow>(
      'sync_runs',
      new URLSearchParams({
        select: 'status,started_at,finished_at,counts',
        order: 'started_at.desc',
        limit: '1',
      }),
      signal,
    ),
  ])

  const latest = latestRuns.data[0]
  const counts = {
    characters: characters.data.length,
    weapons: weapons.data.length,
    echoes: echoes.data.length,
  }

  return {
    counts,
    elements: countBy(characters.data, (row) => row.element),
    rarities: countBy(characters.data, (row) => row.rarity),
    weaponTypes: countBy(weapons.data, (row) => row.type),
    meta: latest
      ? {
          status: latest.status,
          startedAt: latest.started_at,
          finishedAt: latest.finished_at,
          counts: latest.counts,
        }
      : null,
  }
}
