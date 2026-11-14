# Adding audio, dialects and phrases

This is the contract between the site and anyone adding content (audio, voices, new
dialects, new phrases). Everything is plain files in the repo. There is no backend.

## Where things live

| What | File |
| --- | --- |
| Dialects, regions, situations, phrases | `src/content/phrases.json` |
| Famous phrases of each dialect, and the meanings they share | `src/content/famous.json` |
| Voices and which voice reads what (optional) | `src/content/voices.json` |
| Dictionary (generated from the authoring files, one JSON per topic) | `src/content/dictionary/*.json` |
| Dictionary authoring files | `scripts/dictionary/data/*.txt` |
| Audio files | `public/audio/<dialectId>/<phraseId>.mp3` |
| Audio index (generated, do not edit, not committed) | `src/generated/audio-index.json` |

## Ids are stable

- A **dialect id** is a short lowercase code, for example `cai` (Cairo), `tun` (Tunis),
  `fs` (Modern Standard Arabic). It is used in audio folder names.
- A **phrase id** is `<situation>.<slug>`, for example `greetings.hello`. It is used in
  audio file names.
- A **famous phrase id** is `famous.<slug>`, for example `famous.awi`. It is unique
  within its dialect and is used in audio file names the same way.
- Never rename an id once audio exists for it. Change the text, not the id.

List all ids:

```bash
node -e "const c=require('./src/content/phrases.json');console.log(c.dialects.map(d=>d.id+' '+d.nameEn).join('\n'))"
node -e "const c=require('./src/content/phrases.json');console.log(c.phrases.map(p=>p.id).join('\n'))"
node -e "const f=require('./src/content/famous.json');console.log(f.dialects.cai.map(p=>p.id).join('\n'))"
```

The site never states a fixed number of dialects or phrases. Add as many as you like;
anything counted on screen is computed from these files.

## Adding audio

1. Save one MP3 per phrase per dialect:

   ```
   public/audio/cai/greetings.hello.mp3
   public/audio/tun/cafe.want_coffee.mp3
   public/audio/cai/famous.awi.mp3      # a famous phrase of Cairo
   ```

   Famous phrases use the same folder as their dialect and their own `famous.*` id.

   Mono, 44.1 or 48 kHz, 64-128 kbps is plenty. Trim silence at both ends.

2. See what is still missing:

   ```bash
   npm run audio:missing           # summary per dialect (everyday + famous phrases + dictionary words)
   npm run audio:missing -- cai    # every missing file path for one dialect
   npm run audio:missing -- --json # machine-readable
   ```

3. Commit the files. `npm run dev`, `npm run build` and `npm test` regenerate
   `src/generated/audio-index.json` automatically. The site shows a play button only
   for phrases that have a file in that index, so a missing file never shows a broken
   button. If a file exists but fails to load in the browser, its button hides itself.

Files in unknown folders or with unknown phrase ids are ignored with a warning when
the index is built.

## Voices (optional)

`src/content/voices.json`:

```json
{
  "voices": [
    { "id": "cai-m1", "name": "Omar", "gender": "male", "dialect": "cai" },
    { "id": "cai-f1", "name": "Mona", "gender": "female", "dialect": "cai" }
  ],
  "defaults": { "cai": "cai-m1" },
  "phrases": { "cai": { "greetings.hello": "cai-f1" } }
}
```

- `voices`: every voice you use. `gender` is `male` or `female`. `dialect` is a dialect id.
- `defaults`: the voice that reads a dialect's phrases.
- `phrases`: per-phrase override of the default. Famous phrase ids work here too.

When a phrase has audio and a voice, the phrase card shows the voice name. All of this
is optional; audio works without it.

## Adding a phrase

Add an object to `phrases` in `src/content/phrases.json`:

```json
{
  "id": "cafe.no_sugar",
  "category": "cafe",
  "english": "No sugar, please.",
  "note": "Said to a man.",
  "noteAr": "بصيغة المخاطَب المذكّر",
  "variants": {
    "fs": { "text": "بدون سكر من فضلك", "translit": "bidūn sukkar min faḍlik" },
    "cai": { "text": "من غير سكر لو سمحت", "translit": "min gheer sukkar law samaḥt" }
  }
}
```

- The id must start with its `category`.
- **Every dialect needs a `text`.** `translit` is optional per dialect; the
  transliteration toggle appears only where it exists.
- `note` / `noteAr` are optional (English and Arabic UI).
- The order in the file is the order on the page.

## Famous phrases

`src/content/famous.json` holds the phrases every local knows, shown in the
"Famous phrases" section of each dialect page and in the home page highlight:

```json
{
  "concepts": [
    { "id": "now", "name": "الآن", "nameEn": "Now",
      "words": { "egypt": "دلوقتي", "levant": "هلّق", "gulf": "الحين", "maghreb": "دابا" } },
    { "id": "how_are_you", "name": "كيف حالك؟", "nameEn": "How are you?", "base": "greetings.how_are_you" }
  ],
  "dialects": {
    "cai": [
      { "id": "famous.awi", "text": "أوي", "english": "Very", "standard": "جدًّا",
        "noteAr": "...", "note": "...", "example": "...", "concept": "very" }
    ]
  }
}
```

- **Every dialect needs at least one famous phrase.** The check fails otherwise.
- `text`, `english` and `standard` (the meaning in Standard Arabic) are required;
  `noteAr`, `note` and `example` are optional. Order in the list is order on the page.
- `concept` is optional. Famous phrases with the same concept appear side by side in
  Compare → Famous phrases, and drive "meaning in your dialect" (below).
- A concept can name a `base` everyday phrase with the same meaning, and/or the everyday
  `words` for it per group: `egypt`, `sudan`, `levant`, `iraq`, `gulf`, `yemen`, `maghreb`.

## Meaning in the visitor's dialect

On the first visit a short welcome flow (`src/components/Onboarding.tsx`, both interfaces) asks
three things, each skippable: the visitor's own dialect (or "I don't speak Arabic yet"), why they
are learning (a goal), and the dialect to learn. Settings can change the dialect and run the
flow again. It is all saved in the browser.

Goals live in `src/lib/goals.ts`: each goal lists the situation ids the home page suggests
first. A goal needs `goal_<id>` and `goal_<id>Body` messages in `src/lib/i18n.ts`; a test
checks both, and that every listed situation exists.

Cards then show the meaning in the visitor's dialect first: Cards then show the meaning in that dialect first:

- everyday phrase: the same phrase's text in the visitor's dialect;
- famous phrase: the visitor's own famous phrase with the same `concept`, else the
  concept's `base` phrase in their dialect, else the concept's `words` for their group,
  else nothing extra (the Standard Arabic meaning is always on the card).

English meaning stays under it. On the English interface cards show the English meaning.

## Dictionary

The dictionary («القاموس») is a list of meanings ("entries") grouped by topic. Every entry
has one id shared by all dialects, so the topic pages, the «الكلمة في كل لهجة» page
(`/word/<entryId>`) and the global search all read the same data. The site downloads one
topic file at a time.

Edit the authoring files in `scripts/dictionary/data/*.txt`, never the generated JSON:

```
@topic <topicId> | <Arabic name> | <English name> | <icon>
<slug> | <Standard Arabic> | <English> | <pos> | KEY=word; KEY=word / other word | cai: example || dam: example
```

- `KEY` is a dialect id (`cai`, `dam`, `has`…) or a group defined at the top of
  `scripts/dictionary/build.py` (`EGS` = Egypt incl. Upper Egypt, `LEVP`, `IQM`, `KHL`, `MAGT`, `LY`…).
  Later keys override earlier ones; `KEY=-` removes a word set by a group.
- Several words for one dialect are separated by ` / `.
- Leave a dialect out when you do not know its word: the card shows a dash and nothing else.
- `pos` is one of `n v adj adv pron q int num phr conj prep`.
- `icon` is a key of `src/components/TopicIcon.tsx`. A new icon needs one import and one key there;
  an unknown key falls back to the sparkles icon.
- One file can hold several topics (each starts with its own `@topic` line). Files are read in name
  order, and that order is the order of the topic tiles on `/dictionary`. Add a new file with the next
  number rather than reordering old ones.
- The entry id is `<topicId>.<slug>`. **Never rename it** once published: it is in links and audio file names.

Then run:

```
npm run dict:build      # writes src/content/dictionary/*.json
npm run content:check   # validates it with everything else
```

Commit both the `.txt` and the generated `.json` files.

### Dictionary audio

Same folder as the dialect's phrases, with the entry id prefixed by `dict.`:

```
public/audio/<dialectId>/dict.<entryId>.mp3     e.g. public/audio/cai/dict.family.father.mp3
public/audio/fs/dict.<entryId>.mp3              the Standard Arabic word
```

The play button appears only when the file exists. `npm run audio:missing` lists missing
dictionary words too (only words that are written for that dialect).

## Adding a dialect

1. Add it to `dialects`:

   ```json
   { "id": "irb", "name": "أربيل", "nameEn": "Erbil", "country": "العراق", "countryEn": "Iraq", "region": "iraq" }
   ```

   `region` is one of the ids in `regions` (`standard`, `nile`, `levant`, `iraq`, `gulf`,
   `yemen`, `maghreb`). You can add a region too.

2. Add `"irb": { "text": "..." }` to the `variants` of **every** phrase.
3. Add `"irb": [ ... ]` with its famous phrases to `dialects` in `src/content/famous.json`.
4. Create `public/audio/irb/` when you have audio.

## Adding a situation

Add `{ "id": "...", "name": "...", "nameEn": "..." }` to `categories`, then add an icon
for it in `src/components/CategoryIcon.tsx` (any [lucide](https://lucide.dev) icon;
unknown ids get a default icon). To suggest it for a learning goal, add its id to that goal in
`src/lib/goals.ts`.

## Check before you push

```bash
npm run content:check   # validates phrases.json, famous.json and voices.json
npm test                # unit tests, includes the same validation
npm run build           # also runs the content check
```

The check reports missing dialect texts, unknown categories or dialects, duplicate ids,
dialects without famous phrases, unknown concepts, and voice entries that point to
unknown voices, dialects or phrases.

---

## ملخّص بالعربية

- **المحتوى كلّه** في الملف `src/content/phrases.json`: اللهجات والمناطق والمواقف والجمل.
- **أشهر الجمل** في الملف `src/content/famous.json`: لكل لهجة قائمة جمل مشهورة،
  معرّف كل جملة يبدأ بـ `famous.`، ولا بدّ أن يكون لكل لهجة جملة واحدة على الأقل.
- **صوت الجملة المشهورة** في نفس مجلّد اللهجة، مثلًا `public/audio/cai/famous.awi.mp3`.
- **لهجتك**: الزائر العربي يختار لهجته أوّل مرة أو من الإعدادات، فيظهر معنى كل جملة بلهجته أولًا.
- **الأرقام**: الموقع لا يكتب عددًا ثابتًا للهجات أو الجمل، وأي عدد يظهر محسوب من الملفات.
- **الأصوات**: ملف MP3 واحد لكل جملة في كل لهجة، في المسار
  `public/audio/<dialectId>/<phraseId>.mp3`، مثلًا `public/audio/cai/greetings.hello.mp3`.
- **زر التشغيل** يظهر وحده عندما يوجد الملف، ولا يظهر إذا كان الملف غير موجود.
- **الملفات الناقصة**: الأمر `npm run audio:missing` يعرض ما ينقص كل لهجة،
  و`npm run audio:missing -- cai` يعرض مسارات الملفات الناقصة للهجة واحدة.
- **الأصوات وأسماء المتحدّثين** (اختياري): في `src/content/voices.json`، لكل صوت معرّف
  واسم وجنس ولهجة، مع صوت افتراضي لكل لهجة وإمكانية تحديد صوت لجملة بعينها.
- **جملة جديدة**: أضفها إلى `phrases`، ومعرّفها يبدأ باسم الموقف، ولا بدّ من نصّ لكل اللهجات.
- **لهجة جديدة**: أضفها إلى `dialects` مع منطقتها، ثم أضف نصّها في كل جملة، وأضف جملها المشهورة في `famous.json`.
- **لا تغيّر المعرّفات** بعد إضافة الأصوات، لأن أسماء الملفات مربوطة بها.
- **القاموس**: الكلمات في ملفات `scripts/dictionary/data/*.txt`، كل موضوع يبدأ بسطر `@topic`،
  وكل كلمة سطر واحد فيه الفصحى والإنجليزي ونوع الكلمة وكلمة كل لهجة. بعد التعديل شغّل `npm run dict:build`.
- **معرّف الكلمة** يكون `<الموضوع>.<الاسم>`، مثل `family.father`، ولا يتغيّر بعد النشر.
- **صوت كلمة القاموس** في مجلّد اللهجة باسم `dict.<معرّف الكلمة>.mp3`، مثلًا `public/audio/cai/dict.family.father.mp3`.
- **قبل الرفع** شغّل `npm run content:check` ثم `npm test` ثم `npm run build`.

## Social cards and page tags

`npm run build` ends with `npm run og` (`scripts/og/build.ts`). It draws a 1200×630 card for the home page,
each section, each lesson, each dialect, the Egypt section and every Egypt page, and every famous phrase,
into `dist/og/` as JPEG, and writes one HTML file per page with its own title, description, `og:*` and
`twitter:*` tags (`summary_large_image`), plus `sitemap.xml` and `robots.txt`. Nothing is stored in the repo:
add a dialect, a phrase or an Egypt page to the content and its card and page appear on the next build.

- Which card a page uses: `ogImageFor()` in `src/lib/og.ts` (the app also updates the tags as you move around).
- A phrase link to share: `/share/<dialectId>/<phraseId>`. Famous phrases get their own card; everyday
  phrases use their dialect's card.
- To look at a few cards without a full build:
  `npx tsx scripts/og/build.ts --only home,dialects/cai,egypt --out /tmp/og`

### بالعربي

الصور اللي بتظهر لما حد يشارك لينك من الموقع بتتعمل وقت البناء لوحدها، لكل صفحة ولكل لهجة ولكل جملة مشهورة.
أي محتوى جديد بياخد صورته في البناء اللي بعده.

## Dialect intros (dialects outside the Egypt section)

`src/content/dialect-intros.json` holds a short "about this dialect" card for each dialect that has no
Egypt-section page. Keys are dialect ids from `phrases.json`. Each entry has `where`, `summary` and a
list of `features`, every one as `{ "ar": "...", "en": "..." }`. The card shows on `/dialect/<id>`
under the header. Write only well-documented features; a test checks that every key is a real
dialect and that no text is empty.
