export type ElementKey =
  | 'glacio'
  | 'fusion'
  | 'electro'
  | 'aero'
  | 'spectro'
  | 'havoc'

export type WeaponType =
  | 'broadblade'
  | 'sword'
  | 'pistols'
  | 'gauntlets'
  | 'rectifier'

export interface CharacterSkill {
  name: string
  type: string
  description: string
}

export interface CharacterStats {
  level?: number
  hp?: number
  atk?: number
  def?: number
  critRate?: number
  critDamage?: number
  energyRegen?: number
}

export interface Character {
  id: string
  name: string
  rarity: 4 | 5
  element: ElementKey
  weapon: WeaponType
  roles?: string[]
  birthday?: string
  description?: string
  avatar?: string
  splash?: string
  stats?: CharacterStats
  skills?: CharacterSkill[]
}

export interface Weapon {
  id: string
  name: string
  rarity: 1 | 2 | 3 | 4 | 5
  type: WeaponType
  baseAtk?: number
  subStat?: string
  description?: string
  icon?: string
}

export interface EchoSet {
  id: string
  name: string
  element?: ElementKey
  twoPiece?: string
  fivePiece?: string
  icon?: string
}

export interface Team {
  id: string
  name: string
  members: string[]
  note?: string
}

export interface DatasetMeta {
  source: string
  generatedAt: string
  mock: boolean
}

export interface Dataset {
  meta: DatasetMeta
  characters: Character[]
  weapons: Weapon[]
  echoes: EchoSet[]
  teams: Team[]
}
