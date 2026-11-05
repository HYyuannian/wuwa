import { useQuery } from '@tanstack/vue-query'
import { apiGet } from '@/api/http'
import type { StatsDto } from '@/api/types'

export function useStatsQuery() {
  return useQuery({
    queryKey: ['stats'],
    queryFn: ({ signal }) => apiGet<StatsDto>('/stats', undefined, signal),
  })
}
