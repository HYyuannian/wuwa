const API = 'https://api.encore.moe/zh-Hans'

const ELEMENT_BY_ID: Record<number, string> = {
  1: 'glacio',
  2: 'fusion',
  3: 'electro',
  4: 'aero',
  5: 'spectro',
  6: 'havoc',
}

const ELEMENT_BY_NAME: Record<string, string> = {
  冷凝: 'glacio',
  热熔: 'fusion',
  导电: 'electro',
  气动: 'aero',
  衍射: 'spectro',
  湮灭: 'havoc',
}

const WEAPON_BY_ID: Record<number, string> = {
  1: 'broadblade',
  2: 'sword',
  3: 'pistols',
  4: 'gauntlets',
  5: 'rectifier',
}

const WEAPON_BY_NAME: Record<string, string> = {
  长刃: 'broadblade',
  迅刀: 'sword',
  佩枪: 'pistols',
  臂铠: 'gauntlets',
  音感仪: 'rectifier',
}

const ELEMENT_ICON_KEYS: Record<string, string> = {
  ice: 'glacio',
  fire: 'fusion',
  thunder: 'electro',
  wind: 'aero',
  light: 'spectro',
  dark: 'havoc',
}

const STAT_LABELS: Record<string, string> = {
  暴击: '暴击率',
  攻击: '攻击力',
  生命: '生命值',
  防御: '防御力',
}

interface RawProperty {
  Name: string
  BaseValue?: number
  GrowthValues?: { Value?: string | number }[]
}

interface RawSkill {
  SkillName?: string
  SkillType?: string
  SkillDescribe?: string
}

interface RawRoleListItem {
  Id: number
  Name: string
  QualityId: number
  Element?: { Id?: number; Name?: string }
  WeaponType?: { Id?: number; Name?: string }
  RoleHeadIcon?: string
}

interface RawRoleDetail {
  Introduction?: { Content?: string } | string
  Tags?: { TagName?: string }[]
  Properties?: RawProperty[]
  Skills?: RawSkill[]
}

interface RawWeaponListItem {
  Id: number
  Name: string
  QualityId: number
  Type: number
  TypeName?: string
  Icon?: string
}

interface RawWeaponDetail {
  Desc?: string
  Properties?: RawProperty[]
}

interface RawFetter {
  Key: number
  EffectDescription: string
}

interface RawFetterGroup {
  Id: number
  Name: string
  Icon?: string
  Fetters?: RawFetter[]
}

interface RawEcho {
  Id: number
  Element?: { Id?: number; Name?: string }
  FetterGroups?: RawFetterGroup[]
}

interface RawEchoDetail {
  FetterDetails?: Record<
    string,
    { EffectDescriptions?: string[]; EffectKeys?: number[] }
  >
}

export interface EncoreCharacterStats {
  level: number
  hp?: number
  atk?: number
  def?: number
  critRate?: number
  critDamage?: number
  energyRegen?: number
}

export interface EncoreSkill {
  name: string
  type: string
  description: string
}

export interface EncoreCharacter {
  id: string
  name: string
  rarity: number
  element: string
  weaponType: string
  avatarUrl?: string
  description?: string
  roles: string[]
  stats?: EncoreCharacterStats
  skills: EncoreSkill[]
}

export interface EncoreWeapon {
  id: string
  name: string
  rarity: number
  type: string
  baseAtk?: number
  subStat?: string
  description?: string
  iconUrl?: string
}

export interface EncoreEchoSet {
  id: string
  name: string
  element?: string
  twoPiece?: string
  fivePiece?: string
  iconUrl?: string
}

export interface EncoreData {
  characters: EncoreCharacter[]
  weapons: EncoreWeapon[]
  echoes: EncoreEchoSet[]
  counts: {
    characters: number
    weapons: number
    echoes: number
  }
}

const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms))

const asArray = <T>(value: T[] | undefined | null): T[] =>
  Array.isArray(value) ? value : []

const clean = (value: unknown): string => {
  if (typeof value !== 'string') return ''
  return value
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/?[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\r/g, '')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

const textOf = (value: { Content?: string } | string | undefined): string =>
  clean(typeof value === 'string' ? value : value?.Content)

const imageUrl = (value: string | undefined): string | undefined => {
  if (!value) return undefined
  return value
    .replace(
      'https://api-v2.encore.moe/api/resource/',
      'https://api.encore.moe/resource/',
    )
    .replace(
      'https://api-v2.encore.moe/resource/',
      'https://api.encore.moe/resource/',
    )
}

const elementOf = (element?: {
  Id?: number
  Name?: string
}): string | undefined =>
  element?.Id !== undefined
    ? ELEMENT_BY_ID[element.Id]
    : element?.Name
      ? ELEMENT_BY_NAME[element.Name]
      : undefined

const weaponOf = (weapon?: {
  Id?: number
  Name?: string
}): string | undefined =>
  weapon?.Id !== undefined
    ? WEAPON_BY_ID[weapon.Id]
    : weapon?.Name
      ? WEAPON_BY_NAME[weapon.Name]
      : undefined

const elementFromIcon = (icon: string | undefined): string | undefined => {
  if (!icon) return undefined
  const lower = icon.toLowerCase()
  for (const [key, element] of Object.entries(ELEMENT_ICON_KEYS)) {
    if (lower.includes(key)) return element
  }
  return undefined
}

const elementFromText = (text: string): string | undefined => {
  for (const [key, element] of Object.entries(ELEMENT_BY_NAME)) {
    if (text.includes(key)) return element
  }
  return undefined
}

function buildStats(properties: RawProperty[]): EncoreCharacterStats | undefined {
  const get = (name: string) =>
    properties.find((property) => property.Name === name)?.BaseValue

  const hp = get('生命')
  const atk = get('攻击')
  const def = get('防御')
  const crit = get('暴击')
  const critDamage = get('暴击伤害')

  if (![hp, atk, def].some((value) => typeof value === 'number')) {
    return undefined
  }

  return {
    level: 1,
    hp,
    atk,
    def,
    critRate: typeof crit === 'number' ? crit / 100 : undefined,
    critDamage:
      typeof critDamage === 'number' ? critDamage / 100 : undefined,
    energyRegen: 100,
  }
}

function formatWeaponStat(property: RawProperty | undefined): string {
  if (!property) return ''

  const finalValue = property.GrowthValues?.at(-1)?.Value
  const isPercent =
    typeof finalValue === 'string' && finalValue.includes('%')
  const baseValue = property.BaseValue ?? 0
  const value = isPercent ? baseValue / 100 : baseValue
  const label = STAT_LABELS[property.Name] ?? property.Name

  return `${label} ${isPercent ? `${value.toFixed(1)}%` : value}`
}

async function fetchJson<T>(url: string, attempts = 2): Promise<T> {
  let lastError: unknown

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const response = await fetch(url, {
        headers: { accept: 'application/json' },
        signal: AbortSignal.timeout(30_000),
      })

      if (!response.ok) {
        throw new Error(`${url} -> HTTP ${response.status}`)
      }

      return (await response.json()) as T
    } catch (error) {
      lastError = error
      if (attempt < attempts) await sleep(attempt * 500)
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error(String(lastError))
}

async function mapLimit<T, R>(
  items: T[],
  limit: number,
  mapper: (item: T, index: number) => Promise<R>,
  label: string,
): Promise<R[]> {
  const results = new Array<R>(items.length)
  let cursor = 0
  let completed = 0

  async function worker() {
    while (true) {
      const index = cursor
      cursor += 1
      if (index >= items.length) return
      results[index] = await mapper(items[index], index)
      completed += 1
      if (completed % 20 === 0 || completed === items.length) {
        console.info(
          `[encore] ${label} ${completed}/${items.length}`,
        )
      }
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, () => worker()),
  )

  return results
}

export async function fetchEncoreData(): Promise<EncoreData> {
  const [characterList, weaponList, echoList] = await Promise.all([
    fetchJson<{ roleList?: RawRoleListItem[] }>(`${API}/character`),
    fetchJson<{ weapons?: RawWeaponListItem[] }>(`${API}/weapon`),
    fetchJson<{ Echo?: RawEcho[] }>(`${API}/echo`),
  ])

  const roleList = asArray(characterList.roleList)
  const weaponRows = asArray(weaponList.weapons)
  const echoRows = asArray(echoList.Echo)

  const seenCharacterNames = new Set<string>()
  const baseCharacters = roleList.filter((item) => {
    const name = clean(item.Name)
    if (!name || seenCharacterNames.has(name)) return false
    seenCharacterNames.add(name)
    return true
  })

  const characters = await mapLimit(baseCharacters, 6, async (item) => {
    let detail: RawRoleDetail | null = null

    try {
      detail = await fetchJson<RawRoleDetail>(
        `${API}/character/${item.Id}`,
      )
    } catch (error) {
      console.warn(
        `[encore] character ${item.Id} detail failed: ${
          error instanceof Error ? error.message : String(error)
        }`,
      )
    }

    const skills = asArray(detail?.Skills)
      .map((skill) => ({
        name: clean(skill.SkillName),
        type: clean(skill.SkillType),
        description: clean(skill.SkillDescribe),
      }))
      .filter((skill) => skill.name && skill.description)

    return {
      id: String(item.Id),
      name: clean(item.Name),
      rarity: item.QualityId,
      element: elementOf(item.Element) ?? '',
      weaponType: weaponOf(item.WeaponType) ?? '',
      avatarUrl: imageUrl(item.RoleHeadIcon),
      description: textOf(detail?.Introduction) || undefined,
      roles: asArray(detail?.Tags)
        .map((tag) => clean(tag.TagName))
        .filter(Boolean),
      stats: buildStats(asArray(detail?.Properties)),
      skills,
    } satisfies EncoreCharacter
  }, 'characters')

  const seenWeaponNames = new Set<string>()
  const baseWeapons = weaponRows.filter((item) => {
    const name = clean(item.Name)
    if (!name || seenWeaponNames.has(name)) return false
    seenWeaponNames.add(name)
    return true
  })

  const weapons = await mapLimit(baseWeapons, 8, async (item) => {
    let detail: RawWeaponDetail | null = null

    try {
      detail = await fetchJson<RawWeaponDetail>(`${API}/weapon/${item.Id}`)
    } catch (error) {
      console.warn(
        `[encore] weapon ${item.Id} detail failed: ${
          error instanceof Error ? error.message : String(error)
        }`,
      )
    }

    const properties = asArray(detail?.Properties)
    const baseAtk = properties.find(
      (property) => property.Name === '攻击',
    )
    const subStat = properties.find(
      (property) => property.Name !== '攻击',
    )

    return {
      id: String(item.Id),
      name: clean(item.Name),
      rarity: item.QualityId,
      type:
        weaponOf({ Id: item.Type, Name: item.TypeName }) ?? '',
      baseAtk: baseAtk?.BaseValue,
      subStat: subStat ? formatWeaponStat(subStat) : undefined,
      description: clean(detail?.Desc) || undefined,
      iconUrl: imageUrl(item.Icon),
    } satisfies EncoreWeapon
  }, 'weapons')

  const echoGroups = new Map<
    number,
    {
      id: string
      name: string
      iconUrl?: string
      sampleEchoId: number
      elements: Set<string>
      fetters: Map<number, string>
    }
  >()

  for (const echo of echoRows) {
    for (const group of asArray(echo.FetterGroups)) {
      if (!echoGroups.has(group.Id)) {
        echoGroups.set(group.Id, {
          id: String(group.Id),
          name: clean(group.Name),
          iconUrl: imageUrl(group.Icon),
          sampleEchoId: echo.Id,
          elements: new Set(),
          fetters: new Map(),
        })
      }

      const entry = echoGroups.get(group.Id)
      if (!entry) continue

      const element = elementOf(echo.Element)
      if (element) entry.elements.add(element)

      for (const fetter of asArray(group.Fetters)) {
        entry.fetters.set(fetter.Key, clean(fetter.EffectDescription))
      }
    }
  }

  const echoDetails = await mapLimit(
    [...echoGroups.values()],
    8,
    async (group) => {
      let detail: RawEchoDetail | null = null

      try {
        detail = await fetchJson<RawEchoDetail>(
          `${API}/echo/${group.sampleEchoId}`,
        )
      } catch (error) {
        console.warn(
          `[encore] echo ${group.sampleEchoId} detail failed: ${
            error instanceof Error ? error.message : String(error)
          }`,
        )
      }

      return { group, detail }
    },
    'echoes',
  )

  const echoes = echoDetails
    .map(({ group, detail }) => {
      const fetterDetails = detail?.FetterDetails?.[group.name]
      const descriptions = asArray(fetterDetails?.EffectDescriptions)
      const keys = asArray(fetterDetails?.EffectKeys)
      const indexOf = (key: number) => keys.indexOf(key)
      const twoIndex = indexOf(2)
      const fiveIndex = indexOf(5)
      const twoPiece = clean(
        descriptions[twoIndex >= 0 ? twoIndex : 0] ||
          group.fetters.get(2) ||
          '',
      )
      const fivePiece = clean(
        descriptions[fiveIndex >= 0 ? fiveIndex : 1] ||
          group.fetters.get(5) ||
          '',
      )

      return {
        id: group.id,
        name: group.name,
        element:
          elementFromIcon(group.iconUrl) ||
          elementFromText(`${twoPiece} ${fivePiece}`) ||
          (group.elements.size === 1
            ? [...group.elements][0]
            : undefined),
        twoPiece: twoPiece || undefined,
        fivePiece: fivePiece || undefined,
        iconUrl: group.iconUrl,
      } satisfies EncoreEchoSet
    })
    .filter((echo) => echo.name && (echo.twoPiece || echo.fivePiece))
    .sort((a, b) => a.id.localeCompare(b.id, 'zh-Hans', { numeric: true }))

  const cleanCharacters = characters
    .filter(
      (character) =>
        character.name &&
        character.element &&
        character.weaponType,
    )
    .sort(
      (a, b) =>
        b.rarity - a.rarity || a.name.localeCompare(b.name, 'zh-Hans'),
    )

  const cleanWeapons = weapons
    .filter((weapon) => weapon.name && weapon.type)
    .sort(
      (a, b) =>
        b.rarity - a.rarity || a.name.localeCompare(b.name, 'zh-Hans'),
    )

  console.info(
    `[encore] characters=${cleanCharacters.length} weapons=${cleanWeapons.length} echoes=${echoes.length}`,
  )

  return {
    characters: cleanCharacters,
    weapons: cleanWeapons,
    echoes,
    counts: {
      characters: cleanCharacters.length,
      weapons: cleanWeapons.length,
      echoes: echoes.length,
    },
  }
}
