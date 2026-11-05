import { useQuery } from '@tanstack/vue-query'
import { computed, type Ref } from 'vue'
import { apiGet } from '@/api/http'
import { toWeapon } from '@/api/mappers'
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
    queryFn: ({ signal }) =>
      apiGet<PageResponse<WeaponDto>>(
        '/weapons',
        {
          q: filters.value.q,
          type: filters.value.type || undefined,
          rarity: filters.value.rarity || undefined,
          page: filters.value.page ?? 1,
          pageSize: filters.value.pageSize ?? 24,
        },
        signal,
      ).then((response) => ({
        ...response,
        items: response.items.map(toWeapon),
      })),
  })
}

