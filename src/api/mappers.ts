import type {
  Character,
  EchoSet,
  ElementKey,
  Weapon,
  WeaponType,
} from '@/types'
import type {
  CharacterDetailDto,
  CharacterSummaryDto,
  EchoSetDto,
  WeaponDto,
} from './types'

export function toCharacter(dto: CharacterSummaryDto): Character {
  return {
    id: dto.id,
    name: dto.name,
    rarity: dto.rarity as Character['rarity'],
    element: dto.element as ElementKey,
    weapon: dto.weaponType as WeaponType,
    avatar: dto.avatarUrl ?? undefined,
  }
}

export function toCharacterDetail(dto: CharacterDetailDto): Character {
  return {
    ...toCharacter(dto),
    description: dto.description ?? undefined,
    roles: dto.roles,
    stats: dto.stats
      ? {
          level: dto.stats.level,
          hp: dto.stats.hp ?? undefined,
          atk: dto.stats.atk ?? undefined,
          def: dto.stats.def ?? undefined,
          critRate: dto.stats.critRate ?? undefined,
          critDamage: dto.stats.critDamage ?? undefined,
          energyRegen: dto.stats.energyRegen ?? undefined,
        }
      : undefined,
    skills: dto.skills.map((skill) => ({
      name: skill.name,
      type: skill.type,
      description: skill.description,
    })),
  }
}

export function toWeapon(dto: WeaponDto): Weapon {
  return {
    id: dto.id,
    name: dto.name,
    rarity: dto.rarity as Weapon['rarity'],
    type: dto.type as WeaponType,
    baseAtk: dto.baseAtk ?? undefined,
    subStat: dto.subStat ?? undefined,
    description: dto.description ?? undefined,
    icon: dto.iconUrl ?? undefined,
  }
}

export function toEchoSet(dto: EchoSetDto): EchoSet {
  return {
    id: dto.id,
    name: dto.name,
    element: (dto.element as ElementKey | null) ?? undefined,
    twoPiece: dto.twoPiece ?? undefined,
    fivePiece: dto.fivePiece ?? undefined,
    icon: dto.iconUrl ?? undefined,
  }
}
