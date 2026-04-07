export default function Home() {
  return (
    <main className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🔄</span>
            <span className="text-xl font-bold tracking-tight">Syncrofeed</span>
          </div>
          <nav className="flex items-center gap-6 text-sm text-zinc-500">
            <a href="#features" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition">Features</a>
            <a href="#self-hosted" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition">Self-hosted</a>
            <a
              href="https://github.com/Vellis59/syncrofeed"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 px-4 py-2 rounded-lg font-medium hover:opacity-90 transition"
            >
              GitHub
            </a>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="flex-1 flex items-center justify-center px-6 py-24">
        <div className="max-w-2xl text-center space-y-6">
          <h1 className="text-5xl font-bold tracking-tight leading-tight">
            Read your feeds.
            <br />
            <span className="text-zinc-400">Smarter.</span>
          </h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-lg mx-auto">
            A modern, self-hosted RSS reader with AI summaries, Fever API
            compatibility, and a clean reading experience.
          </p>
          <div className="flex items-center justify-center gap-4 pt-4">
            <a
              href="https://github.com/Vellis59/syncrofeed"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 px-6 py-3 rounded-xl font-semibold text-lg hover:opacity-90 transition"
            >
              Get started
            </a>
            <span className="text-sm text-zinc-400">Self-hosted · Free · Open source</span>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="border-t border-zinc-200 dark:border-zinc-800 px-6 py-20">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Everything you need</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: "📡",
                title: "All the feeds",
                desc: "RSS 2.0, Atom, JSON Feed. Import via OPML or add URLs one by one.",
              },
              {
                icon: "🧠",
                title: "AI summaries",
                desc: "Optional LLM-powered summaries. Get the gist without reading everything.",
              },
              {
                icon: "📱",
                title: "Mobile sync",
                desc: "Fever API compatible. Use your favorite mobile reader app.",
              },
              {
                icon: "📰",
                title: "Daily digest",
                desc: "A curated summary of your top articles, ready every morning.",
              },
              {
                icon: "🏷️",
                title: "Smart tags",
                desc: "Auto-categorize and filter articles with intelligent tagging.",
              },
              {
                icon: "🎨",
                title: "Beautiful reader",
                desc: "Clean, distraction-free reading. Dark mode included.",
              },
            ].map((f) => (
              <div key={f.title} className="space-y-3">
                <span className="text-3xl">{f.icon}</span>
                <h3 className="text-lg font-semibold">{f.title}</h3>
                <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Self-hosted */}
      <section id="self-hosted" className="border-t border-zinc-200 dark:border-zinc-800 px-6 py-20 bg-zinc-50 dark:bg-zinc-900">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <h2 className="text-3xl font-bold">Self-hosted by design</h2>
          <p className="text-zinc-600 dark:text-zinc-400">
            Docker-ready. SQLite under the hood. No cloud dependency. Your feeds, your data, your server.
          </p>
          <div className="bg-zinc-900 dark:bg-zinc-800 text-green-400 rounded-xl p-6 text-left font-mono text-sm overflow-x-auto">
            <p className="text-zinc-500"># Run with Docker</p>
            <p>docker pull ghcr.io/vellis59/syncrofeed:latest</p>
            <p>docker compose up -d</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-200 dark:border-zinc-800 px-6 py-8">
        <div className="max-w-5xl mx-auto flex items-center justify-between text-sm text-zinc-400">
          <span>© 2026 Syncrofeed</span>
          <a
            href="https://github.com/Vellis59/syncrofeed"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-zinc-600 dark:hover:text-zinc-300 transition"
          >
            GitHub
          </a>
        </div>
      </footer>
    </main>
  );
}
