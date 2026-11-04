import { mkdir, readFile, stat, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('..', import.meta.url))
const cacheDir = join(root, '.cache', 'wuwa')
const outDir = join(root, 'public', 'data')
const refresh = process.argv.includes('--refresh')

const SOURCES = {
  roleInfo:
    'https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/HEAD/BinData/role/roleinfo.json',
  weaponConf:
    'https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/HEAD/BinData/weapon/weaponconf.json',
  text: 'https://raw.githubusercontent.com/Dimbreath/WutheringData/master/TextMap/zh-Hans/MultiText.json',
  propertyIndex:
    'https://raw.githubusercontent.com/Dimbreath/WutheringData/master/ConfigDB/PropertyIndex.json',
  baseProperty:
    'https://raw.githubusercontent.com/Dimbreath/WutheringData/master/ConfigDB/BaseProperty.json',
  fetterGroup:
    'https://raw.githubusercontent.com/Dimbreath/WutheringData/master/ConfigDB/PhantomFetterGroup.json',
  fetter:
    'https://raw.githubusercontent.com/Dimbreath/WutheringData/master/ConfigDB/PhantomFetter.json',
}

const ELEMENTS = {
  1: 'glacio',
  2: 'fusion',
  3: 'electro',
  4: 'aero',
  5: 'spectro',
  6: 'havoc',
}

const WEAPONS = {
  1: 'broadblade',
  2: 'sword',
  3: 'pistols',
  4: 'gauntlets',
  5: 'rectifier',
}

const ELEMENT_PATHS = {
  ice: 'glacio',
  fire: 'fusion',
  thunder: 'electro',
  wind: 'aero',
  light: 'spectro',
  dark: 'havoc',
}

const asArray = (value) => (Array.isArray(value) ? value : Object.values(value))

const cleanText = (value) => {
  if (typeof value !== 'string') return ''
  return value
    .replace(/<[^>]+>/g, '')
    .replace(/\\n/g, '\n')
    .replace(/\r/g, '')
    .trim()
}

const applyParams = (template, params = []) =>
  cleanText(template).replace(/\{(\d+)\}/g, (_, index) => {
    const param = params[Number(index)]
    const value =
      typeof param === 'string' ? param : param?.ArrayString?.[0]
    return value ?? `{${index}}`
  })

const cacheFile = (name) => join(cacheDir, `${name}.json`)

async function hasCache(name) {
  try {
    const info = await stat(cacheFile(name))
    return info.size > 0
  } catch {
    return false
  }
}

async function ensureSource(name) {
  if (!refresh && (await hasCache(name))) {
    console.log(`[cache] ${name}`)
    return
  }

  const url = SOURCES[name]
  console.log(`[fetch] ${url}`)
  const response = await fetch(url, {
    signal: AbortSignal.timeout(300_000),
  })

  if (!response.ok) {
    throw new Error(`${name} 下载失败：HTTP ${response.status}`)
  }

  const text = await response.text()
  JSON.parse(text)
  await writeFile(cacheFile(name), text, 'utf8')
  console.log(`[save ] ${name} (${(text.length / 1024 / 1024).toFixed(1)} MB)`)
}

function elementFromPath(path) {
  if (!path) return undefined
  const lower = path.toLowerCase()
  for (const [key, element] of Object.entries(ELEMENT_PATHS)) {
    if (lower.includes(key)) return element
  }
  return undefined
}

async function main() {
  await mkdir(cacheDir, { recursive: true })
  await mkdir(outDir, { recursive: true })

  for (const name of Object.keys(SOURCES)) {
    await ensureSource(name)
  }

  const [roleInfo, weaponConf, text, propertyIndex, baseProperty, fetterGroup, fetter] =
    await Promise.all(
      Object.keys(SOURCES).map(async (name) =>
        JSON.parse(await readFile(cacheFile(name), 'utf8')),
      ),
    )

  const texts = text
  const propertyById = new Map(asArray(propertyIndex).map((item) => [item.Id, item]))
  const baseById = new Map(asArray(baseProperty).map((item) => [item.Id, item]))
  const fetterById = new Map(asArray(fetter).map((item) => [item.Id, item]))

  const PROPERTY_LABELS = {
    Crit: '暴击率',
    CritDamage: '暴击伤害',
    EnergyEfficiency: '共鸣效率',
    Atk: '攻击力',
    GreenAtk: '攻击力',
    LifeMax: '生命值',
    Def_: '防御力',
  }

  const propertyName = (id) => {
    const property = propertyById.get(id)
    if (!property) return ''
    return (
      PROPERTY_LABELS[property.Key] ||
      cleanText(texts[property.Name] || property.Key || '')
    )
  }

  const formatPropertyValue = (property, value, isRatio) => {
    if (isRatio) return `${(value * 100).toFixed(1)}%`
    if (property?.IsPercent) return `${(value / 100).toFixed(1)}%`
    return String(value)
  }

  const seenNames = new Set()
  const characters = asArray(roleInfo)
    .filter(
      (item) =>
        (item.QualityId === 4 || item.QualityId === 5) &&
        item.RoleType === 1 &&
        !item.IsTrial &&
        !item.ParentId,
    )
    .map((item) => {
      const name = cleanText(texts[item.Name] || '')
      const element = ELEMENTS[item.ElementId]
      const weapon = WEAPONS[item.WeaponType]
      const description = cleanText(texts[item.Introduction] || '')
      const base = baseById.get(item.PropertyId)

      const stats = base
        ? {
            level: base.Lv ?? 1,
            hp: base.LifeMax,
            atk: base.Atk,
            def: base.Def_,
            critRate: base.Crit / 100,
            critDamage: base.CritDamage / 100,
            energyRegen: base.EnergyEfficiency / 100,
          }
        : undefined

      return {
        id: String(item.Id),
        name,
        rarity: item.QualityId,
        element,
        weapon,
        description:
          description && description !== '敬请期待' ? description : undefined,
        stats,
      }
    })
    .filter(
      (item) =>
        item.name &&
        item.element &&
        item.weapon &&
        !/^(test|测试)/i.test(item.name) &&
        !/处决用|声骸角色/.test(item.name),
    )
    .filter((item) => {
      if (seenNames.has(item.name)) return false
      seenNames.add(item.name)
      return true
    })
    .sort(
      (a, b) =>
        b.rarity - a.rarity || a.name.localeCompare(b.name, 'zh-Hans'),
    )

  const seenWeaponNames = new Set()
  const weapons = asArray(weaponConf)
    .filter((item) => item.QualityId === 4 || item.QualityId === 5)
    .map((item) => {
      const name = cleanText(texts[item.WeaponName] || '')
      const type = WEAPONS[item.WeaponType]
      const subProperty = item.SecondPropId
        ? propertyById.get(item.SecondPropId.Id)
        : undefined
      const subName = propertyName(item.SecondPropId?.Id)
      const subValue = item.SecondPropId
        ? formatPropertyValue(
            subProperty,
            item.SecondPropId.Value,
            item.SecondPropId.IsRatio,
          )
        : ''
      const baseAtk = item.FirstPropId?.Value

      return {
        id: String(item.ItemId),
        name,
        rarity: item.QualityId,
        type,
        baseAtk,
        subStat: subName ? `${subName} ${subValue}`.trim() : undefined,
        description:
          applyParams(texts[item.Desc] || '', item.DescParams) || undefined,
        _sort: subProperty?.Priority ?? 0,
      }
    })
    .filter((item) => item.name && item.type && !/^(test|测试)/i.test(item.name))
    .filter((item) => {
      if (seenWeaponNames.has(item.name)) return false
      seenWeaponNames.add(item.name)
      return true
    })
    .sort(
      (a, b) =>
        b.rarity - a.rarity || a.name.localeCompare(b.name, 'zh-Hans'),
    )
    .map(({ _sort, ...item }) => item)

  const echoes = asArray(fetterGroup)
    .map((group) => {
      const name = cleanText(texts[group.FetterGroupName] || '')
      const map = new Map(
        (group.FetterMap || []).map((entry) => [entry.Key, entry.Value]),
      )
      const two = fetterById.get(map.get(2))
      const five = fetterById.get(map.get(5))

      return {
        id: String(group.Id),
        name,
        element: elementFromPath(group.FetterElementPath),
        twoPiece:
          applyParams(
            texts[two?.EffectDescription] || '',
            two?.EffectDescriptionParam,
          ) || undefined,
        fivePiece:
          applyParams(
            texts[five?.EffectDescription] || '',
            five?.EffectDescriptionParam,
          ) || undefined,
      }
    })
    .filter((item) => item.name && (item.twoPiece || item.fivePiece))
    .sort((a, b) => a.id.localeCompare(b.id, 'zh-Hans', { numeric: true }))

  let teams = []
  try {
    teams = JSON.parse(
      await readFile(join(outDir, 'teams.json'), 'utf8'),
    )
  } catch {
    teams = []
  }

  const meta = {
    source:
      'GitHub 数据快照：Arikatsu/WutheringWaves_Data + Dimbreath/WutheringData',
    generatedAt: new Date().toISOString().slice(0, 10),
    mock: false,
  }

  await Promise.all([
    writeFile(
      join(outDir, 'characters.json'),
      `${JSON.stringify(characters, null, 2)}\n`,
      'utf8',
    ),
    writeFile(
      join(outDir, 'weapons.json'),
      `${JSON.stringify(weapons, null, 2)}\n`,
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
    `\n完成：角色 ${characters.length} / 武器 ${weapons.length} / 声骸套装 ${echoes.length}`,
  )
  console.log(`快照已写入 ${outDir}`)
  console.log('来源：Arikatsu/WutheringWaves_Data + Dimbreath/WutheringData')
  console.log('声明：数据为社区挖掘内容，版权归库洛游戏所有，仅用于学习交流。')
}

main().catch((error) => {
  console.error('\n导入失败：', error)
  process.exitCode = 1
})
