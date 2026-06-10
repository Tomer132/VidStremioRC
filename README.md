# ⚡ VidSrc Streams — Stremio Addon

A production-ready Stremio addon that provides high-quality streams for **movies** and **TV series** via the VidSrc family of sources.

---

## Features

- 🎬 **Movies & Series** — full support for both content types via IMDb IDs
- 🌐 **4 VidSrc sources** — vidsrc.me, vidsrc.to, vidsrc.xyz, vidsrc.pro
- 💎 **Premium stream presentation** — clean titles, quality labels, and emoji formatting
- 🛡️ **Robust error handling** — never crashes, always returns a valid response
- 🚀 **Deploy-ready** — works on Render, Railway, Heroku, Vercel, or any VPS

---

## Quick Start

```bash
# 1. Clone or download the project
cd stremio-vidsrc-addon

# 2. Install dependencies
npm install

# 3. Copy and configure environment variables
cp .env.example .env

# 4. Start the development server
npm run dev

# 5. Open http://localhost:7000 in your browser
```

Then click **"Install Addon in Stremio"** on the landing page.

---

## Project Structure

```
stremio-vidsrc-addon/
├── src/
│   ├── index.js          # Express server entry point
│   ├── manifest.js       # Addon identity & capabilities
│   ├── streamHandler.js  # /stream/:type/:id.json route
│   ├── vidsrc.js         # URL builders for all VidSrc sources
│   └── test.js           # Self-test (no server required)
├── .env.example          # Environment variable template
├── .gitignore
├── package.json
└── README.md
```

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/` | Landing page with install link |
| `GET` | `/manifest.json` | Addon manifest (Stremio reads this first) |
| `GET` | `/stream/movie/:imdbId.json` | Streams for a movie |
| `GET` | `/stream/series/:imdbId:season:episode.json` | Streams for a series episode |

### Examples

```
# The Shawshank Redemption
GET /stream/movie/tt0111161.json

# Breaking Bad — Season 1, Episode 1
GET /stream/series/tt0903747:1:1.json
```

---

## Deployment

### Render (recommended — free tier available)

1. Push this project to a GitHub repo
2. Create a new **Web Service** on [render.com](https://render.com)
3. Set **Build Command**: `npm install`
4. Set **Start Command**: `npm start`
5. Add environment variable: `ADDON_URL=https://your-app.onrender.com`
6. Deploy — Render injects `PORT` automatically

### Railway

```bash
railway init
railway up
railway domain  # get your public URL, then set ADDON_URL
```

### Heroku

```bash
heroku create my-vidsrc-addon
heroku config:set ADDON_URL=https://my-vidsrc-addon.herokuapp.com
git push heroku main
```

### Vercel (serverless)

Vercel requires a `vercel.json` to route everything to `src/index.js`:

```json
{
  "version": 2,
  "builds": [{ "src": "src/index.js", "use": "@vercel/node" }],
  "routes": [{ "src": "/(.*)", "dest": "src/index.js" }]
}
```

---

## Running Tests

```bash
npm test
```

This runs `src/test.js` — a dependency-free test suite that checks URL generation, stream formatting, and edge cases without needing a server.

---

## Configuration

All configuration is through environment variables (see `.env.example`):

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `7000` | HTTP server port |
| `HOST` | `0.0.0.0` | Bind address |
| `ADDON_URL` | `http://localhost:7000` | Public URL shown in install links |

---

## Adding to Stremio Manually

1. Open Stremio → Settings → Addons → **Community Addons**
2. Paste your manifest URL: `https://your-addon-url.com/manifest.json`
3. Click **Install**

---

## License

MIT
