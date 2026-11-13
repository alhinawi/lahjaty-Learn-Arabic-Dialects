# Adding audio, dialects and phrases

This is the contract between the site and anyone adding content (audio, voices, new
dialects, new phrases). Everything is plain files in the repo. There is no backend.

## Where things live

| What | File |
| --- | --- |
| Dialects, regions, situations, phrases | `src/content/phrases.json` |
| Voices and which voice reads what (optional) | `src/content/voices.json` |
| Audio files | `public/audio/<dialectId>/<phraseId>.mp3` |
| Audio index (generated, do not edit, not committed) | `src/generated/audio-index.json` |

## Ids are stable

- A **dialect id** is a short lowercase code, for example `cai` (Cairo), `tun` (Tunis),
  `fs` (Modern Standard Arabic). It is used in audio folder names.
- A **phrase id** is `<situation>.<slug>`, for example `greetings.hello`. It is used in
  audio file names.
- Never rename an id once audio exists for it. Change the text, not the id.

List all ids:

```bash
node -e "const c=require('./src/content/phrases.json');console.log(c.dialects.map(d=>d.id+' '+d.nameEn).join('\n'))"
node -e "const c=require('./src/content/phrases.json');console.log(c.phrases.map(p=>p.id).join('\n'))"
```

## Adding audio

1. Save one MP3 per phrase per dialect:

   ```
   public/audio/cai/greetings.hello.mp3
   public/audio/tun/cafe.want_coffee.mp3
   ```

   Mono, 44.1 or 48 kHz, 64-128 kbps is plenty. Trim silence at both ends.

2. See what is still missing:

   ```bash
   npm run audio:missing           # summary per dialect
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
- `phrases`: per-phrase override of the default.

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

## Adding a dialect

1. Add it to `dialects`:

   ```json
   { "id": "irb", "name": "أربيل", "nameEn": "Erbil", "country": "العراق", "countryEn": "Iraq", "region": "iraq" }
   ```

   `region` is one of the ids in `regions` (`standard`, `nile`, `levant`, `iraq`, `gulf`,
   `yemen`, `maghreb`). You can add a region too.

2. Add `"irb": { "text": "..." }` to the `variants` of **every** phrase.
3. Create `public/audio/irb/` when you have audio.

## Adding a situation

Add `{ "id": "...", "name": "...", "nameEn": "..." }` to `categories`, then add an icon
for it in `src/components/CategoryIcon.tsx` (any [lucide](https://lucide.dev) icon;
unknown ids get a default icon).

## Check before you push

```bash
npm run content:check   # validates phrases.json and voices.json
npm test                # unit tests, includes the same validation
npm run build           # also runs the content check
```

The check reports missing dialect texts, unknown categories or dialects, duplicate ids,
and voice entries that point to unknown voices, dialects or phrases.

---

## ملخّص بالعربية

- **المحتوى كلّه** في الملف `src/content/phrases.json`: اللهجات والمناطق والمواقف والجمل.
- **الأصوات**: ملف MP3 واحد لكل جملة في كل لهجة، في المسار
  `public/audio/<dialectId>/<phraseId>.mp3`، مثلًا `public/audio/cai/greetings.hello.mp3`.
- **زر التشغيل** يظهر وحده عندما يوجد الملف، ولا يظهر إذا كان الملف غير موجود.
- **الملفات الناقصة**: الأمر `npm run audio:missing` يعرض ما ينقص كل لهجة،
  و`npm run audio:missing -- cai` يعرض مسارات الملفات الناقصة للهجة واحدة.
- **الأصوات وأسماء المتحدّثين** (اختياري): في `src/content/voices.json`، لكل صوت معرّف
  واسم وجنس ولهجة، مع صوت افتراضي لكل لهجة وإمكانية تحديد صوت لجملة بعينها.
- **جملة جديدة**: أضفها إلى `phrases`، ومعرّفها يبدأ باسم الموقف، ولا بدّ من نصّ لكل اللهجات.
- **لهجة جديدة**: أضفها إلى `dialects` مع منطقتها، ثم أضف نصّها في كل جملة.
- **لا تغيّر المعرّفات** بعد إضافة الأصوات، لأن أسماء الملفات مربوطة بها.
- **قبل الرفع** شغّل `npm run content:check` ثم `npm test` ثم `npm run build`.
