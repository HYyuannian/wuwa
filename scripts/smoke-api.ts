import 'dotenv/config'
import { app } from '../server/app'

const checks: Array<{
  path: string
  label: string
  inspect?: (data: unknown) => string
}> = [
  { path: '/api/health', label: 'health' },
  {
    path: '/api/characters?page=1&pageSize=3',
    label: 'characters',
    inspect: (data) => {
      const value = data as { total?: number; items?: unknown[] }
      return `total=${value.total} items=${value.items?.length ?? 0}`
    },
  },
  {
    path: '/api/characters/1304',
    label: 'character detail',
    inspect: (data) => {
      const value = data as { name?: string; skills?: unknown[] }
      return `name=${value.name} skills=${value.skills?.length ?? 0}`
    },
  },
  {
    path: '/api/weapons?page=1&pageSize=3',
    label: 'weapons',
    inspect: (data) => {
      const value = data as { total?: number; items?: unknown[] }
      return `total=${value.total} items=${value.items?.length ?? 0}`
    },
  },
  {
    path: '/api/echoes',
    label: 'echoes',
    inspect: (data) => {
      const value = data as { total?: number }
      return `total=${value.total}`
    },
  },
  {
    path: '/api/stats',
    label: 'stats',
    inspect: (data) => {
      const value = data as {
        counts?: { characters?: number; weapons?: number; echoes?: number }
      }
      return `counts=${JSON.stringify(value.counts)}`
    },
  },
  {
    path: '/api/meta',
    label: 'meta',
    inspect: (data) => {
      const value = data as { status?: string }
      return `status=${value.status}`
    },
  },
]

let failed = false

for (const check of checks) {
  const response = await app.request(`http://localhost${check.path}`)
  const text = await response.text()

  if (!response.ok) {
    console.error(`[smoke] ${check.label} HTTP ${response.status} ${text}`)
    failed = true
    continue
  }

  let summary = ''
  try {
    summary = check.inspect?.(JSON.parse(text)) ?? ''
  } catch {
    summary = text.slice(0, 120)
  }

  console.log(`[smoke] ${check.label} ${response.status} ${summary}`)
}

process.exit(failed ? 1 : 0)
