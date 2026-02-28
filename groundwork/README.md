# DeepSearch AI

DeepSearch AI is a research-focused chat agent built on Cloudflare Workers and the
[Agents SDK](https://developers.cloudflare.com/agents/). It decomposes questions into sub-topics,
searches the web, and returns structured briefs with sources.

It uses Workers AI for generation and Tavily for web search (requires `TAVILY_API_KEY`).

## Quick start

```bash
cd groundwork
npm install
npm run dev
```

Open the local URL shown by Vite (usually `http://localhost:5173`).

Try these prompts to see the research workflow:

- **"What are the latest AI trends for 2026?"**
- **"Research the future of electric vehicles."**
- **"Compare CRMs for a 5-person startup."**
- **"Summarize the key risks in the EU AI Act."**

## Configuration

### Tavily API key

For local development, create a `.dev.vars` file in `groundwork/`:

```
TAVILY_API_KEY=your-key-here
```

For deployment, set the secret with Wrangler (run from repo root or `groundwork/`):

```bash
npx wrangler secret put TAVILY_API_KEY
```

## Setup

1. Clone the repo
2. Install dependencies: `npm install`
3. Add your Tavily API key:
   ```bash
   npx wrangler secret put TAVILY_API_KEY
   ```
   Get a free API key at [app.tavily.com](https://app.tavily.com)
4. Run locally: `npm run dev`
5. Deploy: `npm run deploy`

## Features

- **Research agent** — decomposes questions, runs web search, synthesizes answers with sources
- **Web search tool** — Tavily-powered `webSearch` tool in the agent
- **Live prompt bubbles** — rotating suggestion bubbles every 10 seconds (pulls live topics)
- **Clickable sources** — links rendered in responses
- **Midnight & Purple UI** — custom theme across bubbles, prompts, buttons, and inputs
- **Debug mode** — toggle in the header to inspect raw message JSON
- **Realtime** — WebSocket connection with message persistence

## Project structure

```
src/
  server.ts    # Chat agent, tools, and suggestion endpoint
  app.tsx      # Chat UI + prompt bubbles
  client.tsx   # React entry point
  styles.css   # Tailwind + theme styles
```

## Deploy

### Workers deploy (recommended)

From repo root:

```bash
npx wrangler deploy
```

### If your build runs from `groundwork/`

```bash
npx wrangler deploy --config groundwork/wrangler.jsonc
```

## Notes

- The root `wrangler.jsonc` lets you deploy from repo root.
- `groundwork/wrangler.jsonc` is used when deploying from the subdirectory.

## Learn more

- [Agents SDK documentation](https://developers.cloudflare.com/agents/)
- [Build a chat agent tutorial](https://developers.cloudflare.com/agents/getting-started/build-a-chat-agent/)
- [Chat agents API reference](https://developers.cloudflare.com/agents/api-reference/chat-agents/)
- [Workers AI models](https://developers.cloudflare.com/workers-ai/models/)

## License

MIT
