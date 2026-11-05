import { useQuery } from '@tanstack/vue-query'
import { computed, type Ref } from 'vue'
import { apiGet } from '@/api/http'
import { toCharacter, toCharacterDetail } from '@/api/mappers'
import {
  fetchSnapshotCharacter,
  fetchSnapshotCharacters,
  useSnapshotData,
} from '@/api/snapshot'
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
    queryFn: ({ signal }) => {
      const snapshotFilters = {
        q: filters.value.q,
        element: filters.value.element || undefined,
        weapon: filters.value.weapon || undefined,
        rarity: filters.value.rarity || undefined,
        page: filters.value.page,
        pageSize: filters.value.pageSize,
      }

      if (useSnapshotData) {
        return fetchSnapshotCharacters(snapshotFilters)
      }

      return apiGet<PageResponse<CharacterSummaryDto>>(
        '/characters',
        snapshotFilters,
        signal,
      )
        .then((response) => ({
          ...response,
          items: response.items.map(toCharacter),
        }))
        .catch(() => fetchSnapshotCharacters(snapshotFilters))
    },
  })
}

export function useCharacterQuery(id: Ref<string>) {
  return useQuery({
    queryKey: computed(() => ['character', id.value]),
    queryFn: ({ signal }) => {
      if (useSnapshotData) {
        return fetchSnapshotCharacter(id.value)
      }

      return apiGet<CharacterDetailDto>(
        '/character',
        { id: id.value },
        signal,
      )
        .then(toCharacterDetail)
        .catch(() => fetchSnapshotCharacter(id.value))
    },
    enabled: computed(() => Boolean(id.value)),
  })
}
