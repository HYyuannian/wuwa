import { useQuery } from '@tanstack/vue-query'
import { computed, type Ref } from 'vue'
import { apiGet } from '@/api/http'
import { toCharacter, toCharacterDetail } from '@/api/mappers'
import type {
  CharacterDetailDto,
  CharacterSummaryDto,
  PageResponse,
} from '@/api/types'
import type { ElementKey, WeaponType } from '@/types'

export interface CharacterFilters {
  q?: string
  element?: ElementKey | ''
  weapon?: WeaponType | ''
  rarity?: number | ''
  page?: number
  pageSize?: number
}

export function useCharactersQuery(filters: Ref<CharacterFilters>) {
  return useQuery({
    queryKey: computed(() => ['characters', filters.value]),
    queryFn: ({ signal }) =>
      apiGet<PageResponse<CharacterSummaryDto>>(
        '/characters',
        {
          q: filters.value.q,
          element: filters.value.element || undefined,
          weapon: filters.value.weapon || undefined,
          rarity: filters.value.rarity || undefined,
          page: filters.value.page ?? 1,
          pageSize: filters.value.pageSize ?? 24,
        },
        signal,
      ).then((response) => ({
        ...response,
        items: response.items.map(toCharacter),
      })),
  })
}

export function useCharacterQuery(id: Ref<string>) {
  return useQuery({
    queryKey: computed(() => ['character', id.value]),
    queryFn: ({ signal }) =>
      apiGet<CharacterDetailDto>(
        '/character',
        { id: id.value },
        signal,
      ).then(toCharacterDetail),
    enabled: computed(() => Boolean(id.value)),
  })
}

