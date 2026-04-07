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

## Fever API

Syncrofeed exposes a basic Fever-compatible API at:

```text
POST /api/fever
```

Set a password with:

```bash
SYNCROFEED_FEVER_PASSWORD=yourpassword
```

Then use:
- **Username**: `admin`
- **Password**: your `SYNCROFEED_FEVER_PASSWORD`
- **Endpoint**: `http://localhost:3000/api/fever`

This enables compatibility with Fever clients like Reeder or Fiery Feeds.

## Docker

Run Syncrofeed with Docker:

```bash
docker compose up -d
```

Then open:
- `http://localhost:3000` — landing page
- `http://localhost:3000/reader` — RSS reader

Data is stored in the local `./data` folder and mounted into the container.

Container image (planned):

```text
ghcr.io/vellis59/syncrofeed:latest
```

## Project Status

🚧 Early development — foundations being built.

## License

Apache-2.0
