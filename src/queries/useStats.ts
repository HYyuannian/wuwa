import { useQuery } from '@tanstack/vue-query'
import { apiGet } from '@/api/http'
import { fetchSnapshotStats, useSnapshotData } from '@/api/snapshot'
import { fetchSupabaseStats, hasSupabaseRest } from '@/api/supabase'
import type { StatsDto } from '@/api/types'

export function useStatsQuery() {
  return useQuery({
    queryKey: ['stats'],
    queryFn: ({ signal }) => {
      if (hasSupabaseRest) {
        return fetchSupabaseStats(signal).catch(() =>
          fetchSnapshotStats(),
        )
      }

      if (useSnapshotData) {
        return fetchSnapshotStats()
      }

      return apiGet<StatsDto>('/stats', undefined, signal).catch(() =>
        fetchSnapshotStats(),
      )
    },
  })
}
