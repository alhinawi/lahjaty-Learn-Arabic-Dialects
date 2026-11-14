import type { DictTopicFile } from './types'

/**
 * One lazy chunk per dictionary topic, so a page downloads only the topic it shows.
 * Static paths on purpose: the bundler must see each file. When a topic is added under
 * src/content/dictionary/, add its line here (index.json lists it for the content checks).
 */
export const topicLoaders: Record<string, () => Promise<DictTopicFile>> = {
  basics: () => import('../content/dictionary/basics.json').then((m) => m.default as unknown as DictTopicFile),
  questions: () => import('../content/dictionary/questions.json').then((m) => m.default as unknown as DictTopicFile),
  pronouns: () => import('../content/dictionary/pronouns.json').then((m) => m.default as unknown as DictTopicFile),
  time: () => import('../content/dictionary/time.json').then((m) => m.default as unknown as DictTopicFile),
  numbers: () => import('../content/dictionary/numbers.json').then((m) => m.default as unknown as DictTopicFile),
  family: () => import('../content/dictionary/family.json').then((m) => m.default as unknown as DictTopicFile),
  food: () => import('../content/dictionary/food.json').then((m) => m.default as unknown as DictTopicFile),
  home: () => import('../content/dictionary/home.json').then((m) => m.default as unknown as DictTopicFile),
  body: () => import('../content/dictionary/body.json').then((m) => m.default as unknown as DictTopicFile),
  clothes: () => import('../content/dictionary/clothes.json').then((m) => m.default as unknown as DictTopicFile),
  animals: () => import('../content/dictionary/animals.json').then((m) => m.default as unknown as DictTopicFile),
  weather: () => import('../content/dictionary/weather.json').then((m) => m.default as unknown as DictTopicFile),
  nature: () => import('../content/dictionary/nature.json').then((m) => m.default as unknown as DictTopicFile),
  colors: () => import('../content/dictionary/colors.json').then((m) => m.default as unknown as DictTopicFile),
  verbs: () => import('../content/dictionary/verbs.json').then((m) => m.default as unknown as DictTopicFile),
  adjectives: () => import('../content/dictionary/adjectives.json').then((m) => m.default as unknown as DictTopicFile),
  feelings: () => import('../content/dictionary/feelings.json').then((m) => m.default as unknown as DictTopicFile),
  work: () => import('../content/dictionary/work.json').then((m) => m.default as unknown as DictTopicFile),
  market: () => import('../content/dictionary/market.json').then((m) => m.default as unknown as DictTopicFile),
  transport: () => import('../content/dictionary/transport.json').then((m) => m.default as unknown as DictTopicFile),
  health: () => import('../content/dictionary/health.json').then((m) => m.default as unknown as DictTopicFile),
  school: () => import('../content/dictionary/school.json').then((m) => m.default as unknown as DictTopicFile),
  expressions: () => import('../content/dictionary/expressions.json').then((m) => m.default as unknown as DictTopicFile),
  slang: () => import('../content/dictionary/slang.json').then((m) => m.default as unknown as DictTopicFile),
  kitchen: () => import('../content/dictionary/kitchen.json').then((m) => m.default as unknown as DictTopicFile),
  city: () => import('../content/dictionary/city.json').then((m) => m.default as unknown as DictTopicFile),
  sports: () => import('../content/dictionary/sports.json').then((m) => m.default as unknown as DictTopicFile),
  tech: () => import('../content/dictionary/tech.json').then((m) => m.default as unknown as DictTopicFile),
  religion: () => import('../content/dictionary/religion.json').then((m) => m.default as unknown as DictTopicFile),
  occasions: () => import('../content/dictionary/occasions.json').then((m) => m.default as unknown as DictTopicFile),
}
