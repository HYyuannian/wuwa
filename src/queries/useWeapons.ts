import { useQuery } from '@tanstack/vue-query'
import { computed, type Ref } from 'vue'
import { apiGet } from '@/api/http'
import { toWeapon } from '@/api/mappers'
import {
  fetchSnapshotWeapons,
  useSnapshotData,
} from '@/api/snapshot'
import {
  fetchSupabaseWeapons,
  hasSupabaseRest,
} from '@/api/supabase'
import type { PageResponse, WeaponDto } from '@/api/types'
import type { WeaponType } from '@/types'

export interface WeaponFilters {
  q?: string
  type?: WeaponType | ''
  rarity?: number | ''
  page?: number
  pageSize?: number
}

export function useWeaponsQuery(filters: Ref<WeaponFilters>) {
  return useQuery({
    queryKey: computed(() => ['weapons', filters.value]),
    queryFn: ({ signal }) => {
      const snapshotFilters = {
        q: filters.value.q,
        type: filters.value.type || undefined,
        rarity: filters.value.rarity || undefined,
        page: filters.value.page,
        pageSize: filters.value.pageSize,
      }

      if (hasSupabaseRest) {
        return fetchSupabaseWeapons(snapshotFilters, signal).catch(() =>
          fetchSnapshotWeapons(snapshotFilters),
        )
      }

      if (useSnapshotData) {
        return fetchSnapshotWeapons(snapshotFilters)
      }

      return apiGet<PageResponse<WeaponDto>>(
        '/weapons',
        snapshotFilters,
        signal,
      )
        .then((response) => ({
          ...response,
          items: response.items.map(toWeapon),
        }))
        .catch(() => fetchSnapshotWeapons(snapshotFilters))
    },
  })
}
