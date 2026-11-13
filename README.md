# Lahjaty · لهجتي

Learn the Arabic dialects, for Arabs who want to understand other dialects and for
learners of Arabic. 36 varieties (Modern Standard Arabic + 35 dialects), 60 everyday
phrases in 9 situations.

- Dialect picker grouped by region, with search
- Lessons by situation, phrase cards with English meaning, Standard Arabic equivalent,
  transliteration (where available) and audio (where available)
- Compare view: one sentence in Standard Arabic and every dialect side by side
- Practice: pick the meaning, and guess the dialect of a sentence
- Favorites and progress saved in the browser (localStorage); no accounts, no backend
- Arabic UI (RTL) with an English UI toggle (LTR), mobile first

Stack: React, Vite, TypeScript, Tailwind CSS, Zustand, React Router. Deploys to Vercel
as a static site (`vercel.json` handles client-side routes).

## Run

```bash
npm install
npm run dev       # http://localhost:5173
npm test
npm run build     # output in dist/
```

## Content and audio

See **[docs/CONTENT.md](docs/CONTENT.md)** for how to add audio, voices, phrases and
dialects (English, with an Arabic summary).

Quick version: drop MP3s in `public/audio/<dialectId>/<phraseId>.mp3` and run
`npm run audio:missing` to see what is left.

## Layout

```
src/content/phrases.json    all dialects, regions, situations and phrases
src/content/voices.json     optional voice manifest
public/audio/               audio files
scripts/                    audio index, missing-audio report, content check
src/lib/                    data access, quiz logic, store, i18n
src/pages/, src/components/ UI
```
