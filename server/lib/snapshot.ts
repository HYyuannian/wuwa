import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import type {
  EncoreCharacter,
  EncoreCharacterStats,
  EncoreData,
  EncoreEchoSet,
  EncoreSkill,
  EncoreWeapon,
} from './encore'

interface SnapshotCharacter {
  id: string
  name: string
  rarity: number
  element: string
  weapon: string
  avatar?: string
  description?: string
  roles?: string[]
  stats?: EncoreCharacterStats
  skills?: EncoreSkill[]
}

interface SnapshotWeapon {
  id: string
  name: string
  rarity: number
  type: string
  baseAtk?: number
  subStat?: string
  description?: string
  icon?: string
}

interface SnapshotEchoSet {
  id: string
  name: string
  element?: string
  twoPiece?: string
  fivePiece?: string
  icon?: string
}

export async function loadSnapshotData(
  root = process.cwd(),
): Promise<EncoreData> {
  const read = async <T>(file: string): Promise<T> =>
    JSON.parse(
      await readFile(join(root, 'public', 'data', file), 'utf8'),
    ) as T

  const [characters, weapons, echoes] = await Promise.all([
    read<SnapshotCharacter[]>('characters.json'),
    read<SnapshotWeapon[]>('weapons.json'),
    read<SnapshotEchoSet[]>('echoes.json'),
  ])

  const mappedCharacters: EncoreCharacter[] = characters.map(
    (character) => ({
      id: character.id,
      name: character.name,
      rarity: character.rarity,
      element: character.element,
      weaponType: character.weapon,
      avatarUrl: character.avatar,
      description: character.description,
      roles: character.roles ?? [],
      stats: character.stats,
      skills: character.skills ?? [],
    }),
  )

  const mappedWeapons: EncoreWeapon[] = weapons.map((weapon) => ({
    id: weapon.id,
    name: weapon.name,
    rarity: weapon.rarity,
    type: weapon.type,
    baseAtk: weapon.baseAtk,
    subStat: weapon.subStat,
    description: weapon.description,
    iconUrl: weapon.icon,
  }))

  const mappedEchoes: EncoreEchoSet[] = echoes.map((echo) => ({
    id: echo.id,
    name: echo.name,
    element: echo.element,
    twoPiece: echo.twoPiece,
    fivePiece: echo.fivePiece,
    iconUrl: echo.icon,
  }))

  return {
    characters: mappedCharacters,
    weapons: mappedWeapons,
    echoes: mappedEchoes,
    counts: {
      characters: mappedCharacters.length,
      weapons: mappedWeapons.length,
      echoes: mappedEchoes.length,
    },
  }
}
