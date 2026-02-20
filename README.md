# AI Literacy Workshop — Storytelling Board

A shared bulletin board for Phase 2 of the AI Literacy Workshop. Participants fill out a short questionnaire and their AI use case story appears as a sticky note on the board. Others can read the full story and leave comments.

## Features

- **4-step questionnaire** — journalist-style questions covering use case, personal story, AI type, and feelings
- **Live bulletin board** — corkboard aesthetic with color-coded sticky notes (color = sentiment)
- **Comments** — tap any sticky note to read the full story and leave a comment
- **Filters** — filter by industry, AI type, feeling, or realness (in practice / possible / imagined)
- **Auto-refresh** — board updates every 5 seconds as new stories come in
- **Persistent** — stories survive server restarts (stored in `data/stickies.json`)

## Sticky Note Colors

| Color | Sentiment |
|-------|-----------|
| 🟡 Amber | Very optimistic |
| 🟡 Yellow | Optimistic |
| 🟢 Mint | Neutral |
| 🟣 Lavender | Pessimistic |
| 🔵 Blue | Very pessimistic |

## Setup

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in a browser.

**To share with workshop participants on the same network:**
Find your local IP (e.g. `192.168.1.42`) and share `http://192.168.1.42:3000`

## Reset the board

Delete `data/stickies.json` to start fresh for a new session.

## Tech stack

- [Next.js 15](https://nextjs.org/) (App Router)
- TypeScript + Tailwind CSS
- JSON file database (zero setup, no external services)
