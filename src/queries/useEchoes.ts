import { useQuery } from '@tanstack/vue-query'
import { apiGet } from '@/api/http'
import { toEchoSet } from '@/api/mappers'
import {
  fetchSnapshotEchoes,
  useSnapshotData,
} from '@/api/snapshot'
import type { EchoSetDto } from '@/api/types'

export function useEchoesQuery() {
  return useQuery({
    queryKey: ['echoes'],
    queryFn: ({ signal }) => {
      if (useSnapshotData) {
        return fetchSnapshotEchoes()
      }

      return apiGet<{ items: EchoSetDto[]; total: number }>(
        '/echoes',
        undefined,
        signal,
      )
        .then((response) => ({
          ...response,
          items: response.items.map(toEchoSet),
        }))
        .catch(() => fetchSnapshotEchoes())
    },
  })
}
