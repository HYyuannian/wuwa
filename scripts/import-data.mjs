import { mkdir, readFile, stat, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('..', import.meta.url))
const cacheDir = join(root, '.cache', 'wuwa', 'encore')
const outDir = join(root, 'public', 'data')
const refresh = process.argv.includes('--refresh')
const API = 'https://api.encore.moe/zh-Hans'

const ELEMENT_BY_ID = {
  1: 'glacio',
  2: 'fusion',
  3: 'electro',
  4: 'aero',
  5: 'spectro',
  6: 'havoc',
}

const ELEMENT_BY_NAME = {
  冷凝: 'glacio',
  热熔: 'fusion',
  导电: 'electro',
  气动: 'aero',
  衍射: 'spectro',
  湮灭: 'havoc',
}

const WEAPON_BY_ID = {
  1: 'broadblade',
  2: 'sword',
  3: 'pistols',
  4: 'gauntlets',
  5: 'rectifier',
}

const WEAPON_BY_NAME = {
  长刃: 'broadblade',
  迅刀: 'sword',
  佩枪: 'pistols',
  臂铠: 'gauntlets',
  音感仪: 'rectifier',
}

const ELEMENT_ICON_KEYS = {
  ice: 'glacio',
  fire: 'fusion',
  thunder: 'electro',
  wind: 'aero',
  light: 'spectro',
  dark: 'havoc',
}

const asArray = (value) => (Array.isArray(value) ? value : [])

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const clean = (value) => {
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

const textOf = (value) =>
  clean(typeof value === 'string' ? value : value?.Content)

const imageUrl = (value) => {
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

const elementOf = (element) =>
  ELEMENT_BY_ID[element?.Id] || ELEMENT_BY_NAME[element?.Name]

const weaponOf = (weapon) =>
  WEAPON_BY_ID[weapon?.Id] || WEAPON_BY_NAME[weapon?.Name]

async function fileExists(path) {
  try {
    const info = await stat(path)
    return info.size > 0
  } catch {
    return false
  }
}

async function fetchJson(url, attempts = 3) {
  let lastError

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const response = await fetch(url, {
        headers: { accept: 'application/json' },
        signal: AbortSignal.timeout(90_000),
      })

      if (!response.ok) {
        throw new Error(`${url} -> HTTP ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      lastError = error
      if (attempt < attempts) await sleep(attempt * 1000)
    }
  }

  throw lastError
}

async function cachedJson(relativePath, url) {
  const path = join(cacheDir, relativePath)

  if (!refresh && (await fileExists(path))) {
    return JSON.parse(await readFile(path, 'utf8'))
  }

  const data = await fetchJson(url)
  await mkdir(dirname(path), { recursive: true })
  await writeFile(path, JSON.stringify(data), 'utf8')
  return data
}

async function mapLimit(items, limit, mapper, label) {
  const results = new Array(items.length)
  let cursor = 0
  let completed = 0

  async function worker() {
    while (true) {
      const index = cursor
      cursor += 1
      if (index >= items.length) return

      results[index] = await mapper(items[index], index)
      completed += 1

      if (completed % 10 === 0 || completed === items.length) {
        console.log(`[detail] ${label} ${completed}/${items.length}`)
      }
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, () => worker()),
  )

  return results
}

function buildStats(properties = []) {
  const get = (name) =>
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
    critDamage: typeof critDamage === 'number' ? critDamage / 100 : undefined,
    energyRegen: 100,
  }
}

const STAT_LABELS = {
  暴击: '暴击率',
  攻击: '攻击力',
  生命: '生命值',
  防御: '防御力',
}

function formatWeaponStat(property) {
  if (!property) return ''

  const finalValue = property.GrowthValues?.at(-1)?.Value
  const isPercent =
    typeof finalValue === 'string' && finalValue.includes('%')
  const value = isPercent ? property.BaseValue / 100 : property.BaseValue
  const label = STAT_LABELS[property.Name] || property.Name

  return `${label} ${isPercent ? `${value.toFixed(1)}%` : value}`
}

function elementFromIcon(icon) {
  if (!icon) return undefined
  const lower = icon.toLowerCase()
  for (const [key, element] of Object.entries(ELEMENT_ICON_KEYS)) {
    if (lower.includes(key)) return element
  }
  return undefined
}

function elementFromText(text) {
  if (!text) return undefined
  for (const [key, element] of Object.entries(ELEMENT_BY_NAME)) {
    if (text.includes(key)) return element
  }
  return undefined
}

async function main() {
  await mkdir(cacheDir, { recursive: true })
  await mkdir(outDir, { recursive: true })

  console.log('[fetch] 角色 / 武器 / 声骸列表')
  const [characterList, weaponList, echoList] = await Promise.all([
    cachedJson('characters.json', `${API}/character`),
    cachedJson('weapons.json', `${API}/weapon`),
    cachedJson('echoes.json', `${API}/echo`),
  ])

  const roleList = asArray(characterList.roleList)
  const weaponRows = asArray(weaponList.weapons)
  const echoRows = asArray(echoList.Echo)

  console.log(
    `[list ] 角色 ${roleList.length} / 武器 ${weaponRows.length} / 声骸 ${echoRows.length}`,
  )

  const seenCharacterNames = new Set()
  const baseCharacters = roleList.filter((item) => {
    const name = clean(item.Name)
    if (!name || seenCharacterNames.has(name)) return false
    seenCharacterNames.add(name)
    return true
  })

  let characterDetailFailures = 0

  const characters = await mapLimit(
    baseCharacters,
    4,
    async (item) => {
      let detail = null

      try {
        detail = await cachedJson(
          `characters/${item.Id}.json`,
          `${API}/character/${item.Id}`,
        )
      } catch (error) {
        characterDetailFailures += 1
        console.warn(`[warn ] 角色 ${item.Id} 详情失败：${error.message}`)
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
        element: elementOf(item.Element),
        weapon: weaponOf(item.WeaponType),
        roles: asArray(detail?.Tags)
          .map((tag) => clean(tag.TagName))
          .filter(Boolean),
        description: textOf(detail?.Introduction) || undefined,
        avatar: imageUrl(item.RoleHeadIcon),
        stats: buildStats(asArray(detail?.Properties)),
        skills: skills.length ? skills : undefined,
      }
    },
    '角色',
  )

  const seenWeaponNames = new Set()
  const baseWeapons = weaponRows.filter((item) => {
    const name = clean(item.Name)
    if (!name || seenWeaponNames.has(name)) return false
    seenWeaponNames.add(name)
    return true
  })

  let weaponDetailFailures = 0

  const weapons = await mapLimit(
    baseWeapons,
    6,
    async (item) => {
      let detail = null

      try {
        detail = await cachedJson(
          `weapons/${item.Id}.json`,
          `${API}/weapon/${item.Id}`,
        )
      } catch (error) {
        weaponDetailFailures += 1
        console.warn(`[warn ] 武器 ${item.Id} 详情失败：${error.message}`)
      }

      const properties = asArray(detail?.Properties)
      const baseAtk = properties.find((property) => property.Name === '攻击')
      const subStat = properties.find((property) => property.Name !== '攻击')

      return {
        id: String(item.Id),
        name: clean(item.Name),
        rarity: item.QualityId,
        type: weaponOf({ Id: item.Type, Name: item.TypeName }),
        baseAtk: baseAtk?.BaseValue,
        subStat: subStat ? formatWeaponStat(subStat) : undefined,
        description: clean(detail?.Desc) || undefined,
        icon: imageUrl(item.Icon),
      }
    },
    '武器',
  )

  const echoGroups = new Map()

  for (const echo of echoRows) {
    for (const group of asArray(echo.FetterGroups)) {
      if (!echoGroups.has(group.Id)) {
        echoGroups.set(group.Id, {
          id: String(group.Id),
          name: clean(group.Name),
          icon: imageUrl(group.Icon),
          sampleEchoId: echo.Id,
          elements: new Set(),
          fetters: new Map(),
        })
      }

      const entry = echoGroups.get(group.Id)
      const element = elementOf(echo.Element)
      if (element) entry.elements.add(element)

      for (const fetter of asArray(group.Fetters)) {
        entry.fetters.set(fetter.Key, clean(fetter.EffectDescription))
      }
    }
  }

  let echoDetailFailures = 0

  const echoDetails = await mapLimit(
    [...echoGroups.values()],
    6,
    async (group) => {
      let detail = null

      try {
        detail = await cachedJson(
          `echoes/${group.sampleEchoId}.json`,
          `${API}/echo/${group.sampleEchoId}`,
        )
      } catch (error) {
        echoDetailFailures += 1
        console.warn(
          `[warn ] 声骸 ${group.sampleEchoId} 详情失败：${error.message}`,
        )
      }

      return { group, detail }
    },
    '声骸',
  )

  const echoes = echoDetails
    .map(({ group, detail }) => {
      const fetterDetails = detail?.FetterDetails?.[group.name]
      const descriptions = asArray(fetterDetails?.EffectDescriptions)
      const keys = asArray(fetterDetails?.EffectKeys)
      const indexOf = (key) => keys.indexOf(key)
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
          elementFromIcon(group.icon) ||
          elementFromText(`${twoPiece} ${fivePiece}`) ||
          (group.elements.size === 1
            ? [...group.elements][0]
            : undefined),
        twoPiece: twoPiece || undefined,
        fivePiece: fivePiece || undefined,
        icon: group.icon,
      }
    })
    .filter((echo) => echo.name && (echo.twoPiece || echo.fivePiece))
    .sort((a, b) => a.id.localeCompare(b.id, 'zh-Hans', { numeric: true }))

  const cleanCharacters = characters
    .filter((item) => item.name && item.element && item.weapon)
    .sort(
      (a, b) =>
        b.rarity - a.rarity || a.name.localeCompare(b.name, 'zh-Hans'),
    )

  const cleanWeapons = weapons
    .filter((item) => item.name && item.type)
    .sort(
      (a, b) =>
        b.rarity - a.rarity || a.name.localeCompare(b.name, 'zh-Hans'),
    )

  let teams = []
  try {
    teams = JSON.parse(await readFile(join(outDir, 'teams.json'), 'utf8'))
  } catch {
    teams = []
  }

  const meta = {
    source: 'encore.moe 公开 API（zh-Hans）',
    generatedAt: new Date().toISOString().slice(0, 10),
    mock: false,
  }

  await Promise.all([
    writeFile(
      join(outDir, 'characters.json'),
      `${JSON.stringify(cleanCharacters, null, 2)}\n`,
      'utf8',
    ),
    writeFile(
      join(outDir, 'weapons.json'),
      `${JSON.stringify(cleanWeapons, null, 2)}\n`,
      'utf8',
    ),
    writeFile(
      join(outDir, 'echoes.json'),
      `${JSON.stringify(echoes, null, 2)}\n`,
      'utf8',
    ),
    writeFile(
      join(outDir, 'teams.json'),
      `${JSON.stringify(teams, null, 2)}\n`,
      'utf8',
    ),
    writeFile(
      join(outDir, 'meta.json'),
      `${JSON.stringify(meta, null, 2)}\n`,
      'utf8',
    ),
  ])

  console.log(
    `\n完成：角色 ${cleanCharacters.length} / 武器 ${cleanWeapons.length} / 声骸套装 ${echoes.length}`,
  )
  console.log(
    `详情失败：角色 ${characterDetailFailures} / 武器 ${weaponDetailFailures} / 声骸 ${echoDetailFailures}`,
  )
  console.log(`快照已写入 ${outDir}`)
  console.log('来源：encore.moe 公开 API')
  console.log('声明：数据为社区整理内容，版权归库洛游戏所有，仅用于学习交流。')
}

main().catch((error) => {
  console.error('\n导入失败：', error)
  process.exitCode = 1
})
