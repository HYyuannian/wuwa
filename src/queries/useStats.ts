import { useQuery } from '@tanstack/vue-query'
import { apiGet } from '@/api/http'
import { fetchSnapshotStats, useSnapshotData } from '@/api/snapshot'
import type { StatsDto } from '@/api/types'

export function useStatsQuery() {
  return useQuery({
    queryKey: ['stats'],
    queryFn: ({ signal }) => {
      if (useSnapshotData) {
        return fetchSnapshotStats()
      }

      return apiGet<StatsDto>('/stats', undefined, signal).catch(() =>
        fetchSnapshotStats(),
      )
    },
  })
}
