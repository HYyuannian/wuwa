export interface PageResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
}

export interface CharacterStatsDto {
  level: number
  hp?: number | null
  atk?: number | null
  def?: number | null
  critRate?: number | null
  critDamage?: number | null
  energyRegen?: number | null
}

export interface CharacterSkillDto {
  name: string
  type: string
  description: string
  sortOrder?: number
}

export interface CharacterSummaryDto {
  id: string
  name: string
  rarity: number
  element: string
  weaponType: string
  avatarUrl?: string | null
}

export interface CharacterDetailDto extends CharacterSummaryDto {
  description?: string | null
  roles: string[]
  stats?: CharacterStatsDto | null
  skills: CharacterSkillDto[]
}

export interface WeaponDto {
  id: string
  name: string
  rarity: number
  type: string
  baseAtk?: number | null
  subStat?: string | null
  description?: string | null
  iconUrl?: string | null
}

export interface EchoSetDto {
  id: string
  name: string
  element?: string | null
  twoPiece?: string | null
  fivePiece?: string | null
  iconUrl?: string | null
}

export interface DistributionItem<T = string> {
  key: T
  count: number
}

export interface StatsMeta {
  status: string
  startedAt?: string | null
  finishedAt?: string | null
  counts?: Record<string, number> | null
}

export interface StatsDto {
  counts: {
    characters: number
    weapons: number
    echoes: number
  }
  elements: DistributionItem[]
  rarities: DistributionItem<number>[]
  weaponTypes: DistributionItem[]
  meta: StatsMeta | null
}
