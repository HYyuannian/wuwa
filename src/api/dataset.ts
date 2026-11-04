import type {
  Character,
  Dataset,
  DatasetMeta,
  EchoSet,
  Team,
  Weapon,
} from '@/types'

const EMPTY_META: DatasetMeta = {
  source: 'local snapshot',
  generatedAt: '',
  mock: true,
}

async function loadJson<T>(file: string, fallback: T): Promise<T> {
  try {
    const response = await fetch(
      `${import.meta.env.BASE_URL}data/${file}`,
      { cache: 'no-cache' },
    )
    if (!response.ok) {
      throw new Error(`${file}: HTTP ${response.status}`)
    }
    return (await response.json()) as T
  } catch (error) {
    console.warn(`[dataset] 读取 ${file} 失败，已回退到空数据`, error)
    return fallback
  }
}

export async function loadDataset(): Promise<Dataset> {
  const [meta, characters, weapons, echoes, teams] = await Promise.all([
    loadJson<DatasetMeta>('meta.json', EMPTY_META),
    loadJson<Character[]>('characters.json', []),
    loadJson<Weapon[]>('weapons.json', []),
    loadJson<EchoSet[]>('echoes.json', []),
    loadJson<Team[]>('teams.json', []),
  ])

  return { meta, characters, weapons, echoes, teams }
}
