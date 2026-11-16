import type { MessageKey } from './i18n'
import type { WordGroup } from './types'

/** i18n keys for the macro-region names; shared by server and client components. */
export const GROUP_KEY: Record<WordGroup, MessageKey> = {
  egypt: 'groupEgypt',
  sudan: 'groupSudan',
  levant: 'groupLevant',
  iraq: 'groupIraq',
  gulf: 'groupGulf',
  yemen: 'groupYemen',
  maghreb: 'groupMaghreb',
}

/** App regions that map to macro-region hubs; the Nile valley spans two. */
export const REGION_HUBS: Partial<Record<string, WordGroup[]>> = {
  nile: ['egypt', 'sudan'],
  levant: ['levant'],
  iraq: ['iraq'],
  gulf: ['gulf'],
  yemen: ['yemen'],
  maghreb: ['maghreb'],
}
