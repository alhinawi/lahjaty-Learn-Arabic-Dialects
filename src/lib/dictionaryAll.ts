import t_basics from '../content/dictionary/basics.json'
import t_questions from '../content/dictionary/questions.json'
import t_pronouns from '../content/dictionary/pronouns.json'
import t_time from '../content/dictionary/time.json'
import t_numbers from '../content/dictionary/numbers.json'
import t_family from '../content/dictionary/family.json'
import t_food from '../content/dictionary/food.json'
import t_home from '../content/dictionary/home.json'
import t_body from '../content/dictionary/body.json'
import t_clothes from '../content/dictionary/clothes.json'
import t_animals from '../content/dictionary/animals.json'
import t_weather from '../content/dictionary/weather.json'
import t_nature from '../content/dictionary/nature.json'
import t_colors from '../content/dictionary/colors.json'
import t_verbs from '../content/dictionary/verbs.json'
import t_adjectives from '../content/dictionary/adjectives.json'
import t_feelings from '../content/dictionary/feelings.json'
import t_work from '../content/dictionary/work.json'
import t_market from '../content/dictionary/market.json'
import t_transport from '../content/dictionary/transport.json'
import t_health from '../content/dictionary/health.json'
import t_school from '../content/dictionary/school.json'
import t_expressions from '../content/dictionary/expressions.json'
import t_slang from '../content/dictionary/slang.json'
import t_kitchen from '../content/dictionary/kitchen.json'
import t_city from '../content/dictionary/city.json'
import t_sports from '../content/dictionary/sports.json'
import t_tech from '../content/dictionary/tech.json'
import t_religion from '../content/dictionary/religion.json'
import t_occasions from '../content/dictionary/occasions.json'

import rawIndex from '../content/dictionary/index.json'
import type { DictEntry, DictIndex, DictTopicFile } from './types'

/**
 * Every dictionary topic, eagerly: for build-time page generation (route files, sitemap, og cards).
 * The running app lazy-loads the same files through dictionaryLoaders.ts.
 */
const index = rawIndex as DictIndex
const files: DictTopicFile[] = [
  t_basics as unknown as DictTopicFile,
  t_questions as unknown as DictTopicFile,
  t_pronouns as unknown as DictTopicFile,
  t_time as unknown as DictTopicFile,
  t_numbers as unknown as DictTopicFile,
  t_family as unknown as DictTopicFile,
  t_food as unknown as DictTopicFile,
  t_home as unknown as DictTopicFile,
  t_body as unknown as DictTopicFile,
  t_clothes as unknown as DictTopicFile,
  t_animals as unknown as DictTopicFile,
  t_weather as unknown as DictTopicFile,
  t_nature as unknown as DictTopicFile,
  t_colors as unknown as DictTopicFile,
  t_verbs as unknown as DictTopicFile,
  t_adjectives as unknown as DictTopicFile,
  t_feelings as unknown as DictTopicFile,
  t_work as unknown as DictTopicFile,
  t_market as unknown as DictTopicFile,
  t_transport as unknown as DictTopicFile,
  t_health as unknown as DictTopicFile,
  t_school as unknown as DictTopicFile,
  t_expressions as unknown as DictTopicFile,
  t_slang as unknown as DictTopicFile,
  t_kitchen as unknown as DictTopicFile,
  t_city as unknown as DictTopicFile,
  t_sports as unknown as DictTopicFile,
  t_tech as unknown as DictTopicFile,
  t_religion as unknown as DictTopicFile,
  t_occasions as unknown as DictTopicFile,
]

export const allDictEntries: DictEntry[] = files.flatMap((f) => f.entries)
export const topicEntries = new Map(index.topics.map((t, i) => [t.id, files[i].entries] as const))
