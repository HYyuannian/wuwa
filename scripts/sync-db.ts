import 'dotenv/config'
import { runSync } from '../server/lib/sync'

try {
  const result = await runSync('manual')
  console.log('[sync] success', result)
} catch (error) {
  console.error('[sync] failed', error)
  process.exitCode = 1
}
