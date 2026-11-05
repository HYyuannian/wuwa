import 'dotenv/config'
import {
  runSync,
  runSyncFromSnapshot,
} from '../api/lib/lib/sync'

const useSnapshot = process.argv.includes('--snapshot')

try {
  const result = useSnapshot
    ? await runSyncFromSnapshot('manual')
    : await runSync('manual')

  console.log(
    `[sync] success (${useSnapshot ? 'snapshot' : 'encore'})`,
    result,
  )
} catch (error) {
  console.error('[sync] failed', error)
  process.exitCode = 1
}
