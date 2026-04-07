# Syncrofeed

A modern, smart RSS reader — self-hosted, AI-enhanced, and Fever API compatible.

## Why Syncrofeed

Existing RSS readers are either paid, outdated, or too heavy. Syncrofeed is built for people who want a clean, fast, self-hosted reading experience with smart features.

## Features (MVP roadmap)

- 📡 RSS 2.0, Atom, and JSON Feed support
- 🧠 Optional AI summaries (LLM-powered)
- 📱 PWA — installable as a native app
- 🔄 Fever API compatibility (works with Reeder, Fiery Feeds, etc.)
- 📥 OPML import/export
- 🏷️ Smart tags and filters
- 📰 Daily digest mode
- 🎨 Clean, readability-first UI with themes
- 🐳 Docker-ready, single binary deploy
- 💾 SQLite — zero-config, lightweight storage

## Stack

- **Framework**: Next.js 16 (App Router)
- **Database**: SQLite via Drizzle ORM
- **Styling**: Tailwind CSS v4
- **Language**: TypeScript
- **RSS Parsing**: planned (rss-parser / feedparser)
- **Auth**: simple password (single-user, like Panelio)

## Quick Start

```bash
git clone https://github.com/Vellis59/syncrofeed.git
cd syncrofeed
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Status

🚧 Early development — foundations being built.

## License

Apache-2.0
