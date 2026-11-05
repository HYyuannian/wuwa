import type { Character, EchoSet, Weapon } from '@/types'
import { ApiError } from './http'
import type { PageResponse, StatsDto, StatsMeta } from './types'

interface SnapshotMeta {
  source: string
  generatedAt: string
  mock: boolean
}

interface SnapshotDataset {
  characters: Character[]
  weapons: Weapon[]
  echoes: EchoSet[]
  meta: SnapshotMeta
}

export interface SnapshotCharacterFilters {
  q?: string
  element?: string
  weapon?: string
  rarity?: number
  page?: number
  pageSize?: number
}

export interface SnapshotWeaponFilters {
  q?: string
  type?: string
  rarity?: number
  page?: number
  pageSize?: number
}

export const useSnapshotData =
  typeof window !== 'undefined' &&
  (window.location.hostname.endsWith('github.io') ||
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1')

let cache: Promise<SnapshotDataset> | null = null

async function readJson<T>(file: string): Promise<T> {
  const response = await fetch(
    `${import.meta.env.BASE_URL}data/${file}`,
    { cache: 'no-cache' },
  )

  if (!response.ok) {
    throw new Error(`${file}: HTTP ${response.status}`)
  }

  return (await response.json()) as T
}

export function loadSnapshotDataset(): Promise<SnapshotDataset> {
  if (!cache) {
    cache = Promise.all([
      readJson<Character[]>('characters.json'),
      readJson<Weapon[]>('weapons.json'),
      readJson<EchoSet[]>('echoes.json'),
      readJson<SnapshotMeta>('meta.json'),
    ])
      .then(([characters, weapons, echoes, meta]) => ({
        characters,
        weapons,
        echoes,
        meta,
      }))
      .catch((error) => {
        cache = null
        throw error
      })
  }

  return cache
}

function paginate<T>(
  items: T[],
  page = 1,
  pageSize = 24,
): PageResponse<T> {
  const safePage = Math.max(1, page)
  const safeSize = Math.max(1, pageSize)
  const start = (safePage - 1) * safeSize

  return {
    items: items.slice(start, start + safeSize),
    total: items.length,
    page: safePage,
    pageSize: safeSize,
  }
}

export async function fetchSnapshotCharacters(
  filters: SnapshotCharacterFilters,
): Promise<PageResponse<Character>> {
  const data = await loadSnapshotDataset()
  const keyword = (filters.q ?? '').trim().toLowerCase()

  const items = data.characters
    .filter((character) => {
      if (keyword && !character.name.toLowerCase().includes(keyword)) return false
      if (filters.element && character.element !== filters.element) return false
      if (filters.weapon && character.weapon !== filters.weapon) return false
      if (filters.rarity && character.rarity !== filters.rarity) return false
      return true
    })
    .sort(
      (a, b) =>
        b.rarity - a.rarity || a.name.localeCompare(b.name, 'zh-Hans'),
    )

  return paginate(items, filters.page, filters.pageSize)
}

export async function fetchSnapshotCharacter(
  id: string,
): Promise<Character> {
  const data = await loadSnapshotDataset()
  const character = data.characters.find((item) => item.id === id)

  if (!character) {
    throw new ApiError(404, 'Character not found')
  }

  return character
}

export async function fetchSnapshotWeapons(
  filters: SnapshotWeaponFilters,
): Promise<PageResponse<Weapon>> {
  const data = await loadSnapshotDataset()
  const keyword = (filters.q ?? '').trim().toLowerCase()

  const items = data.weapons
    .filter((weapon) => {
      if (keyword && !weapon.name.toLowerCase().includes(keyword)) return false
      if (filters.type && weapon.type !== filters.type) return false
      if (filters.rarity && weapon.rarity !== filters.rarity) return false
      return true
    })
    .sort(
      (a, b) =>
        b.rarity - a.rarity || a.name.localeCompare(b.name, 'zh-Hans'),
    )

  return paginate(items, filters.page, filters.pageSize)
}

export async function fetchSnapshotEchoes() {
  const data = await loadSnapshotDataset()
  return {
    items: data.echoes,
    total: data.echoes.length,
  }
}

function countBy<T, K extends string | number>(
  items: T[],
  getKey: (item: T) => K,
) {
  const counts = new Map<K, number>()

  for (const item of items) {
    const key = getKey(item)
    counts.set(key, (counts.get(key) ?? 0) + 1)
  }

  return [...counts.entries()].map(([key, count]) => ({ key, count }))
}

export async function fetchSnapshotStats(): Promise<StatsDto> {
  const data = await loadSnapshotDataset()
  const counts = {
    characters: data.characters.length,
    weapons: data.weapons.length,
    echoes: data.echoes.length,
  }
  const finishedAt = data.meta.generatedAt
    ? new Date(`${data.meta.generatedAt}T00:00:00Z`).toISOString()
    : null
  const meta: StatsMeta = {
    status: 'snapshot',
    finishedAt,
    counts,
  }

  return {
    counts,
    elements: countBy(data.characters, (character) => character.element),
    rarities: countBy(data.characters, (character) => character.rarity),
    weaponTypes: countBy(data.weapons, (weapon) => weapon.type),
    meta,
  }
}
