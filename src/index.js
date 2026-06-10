/**
 * index.js
 * --------
 * Entry point for the Stremio VidSrc Addon.
 *
 * Starts an Express server that exposes the two endpoints Stremio requires:
 *   GET /manifest.json   — addon identity & capabilities
 *   GET /stream/:type/:id.json  — stream list for a given piece of content
 *
 * Deploy on any Node.js host (Render, Railway, Heroku, Vercel, VPS, etc.)
 * Environment variables:
 *   PORT          — HTTP port (default: 7000)
 *   HOST          — Bind address (default: 0.0.0.0)
 *   ADDON_URL     — Public HTTPS URL used to build the install link (optional)
 */

"use strict";

const express = require("express");
const cors = require("cors");
const manifest = require("./manifest");
const streamHandler = require("./streamHandler");

// ── App Setup ─────────────────────────────────────────────────────────────────

const app = express();

// Parse environment configuration
const PORT = parseInt(process.env.PORT || "7000", 10);
const HOST = process.env.HOST || "0.0.0.0";
const ADDON_URL = process.env.ADDON_URL || `http://localhost:${PORT}`;

// ── Middleware ────────────────────────────────────────────────────────────────

// CORS — Stremio desktop and web apps both need this
app.use(
  cors({
    origin: "*",
    methods: ["GET", "HEAD", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Accept"],
  })
);

// Parse JSON bodies (not strictly needed for a stream addon, but good practice)
app.use(express.json());

// Structured request logging
app.use((req, _res, next) => {
  const ts = new Date().toISOString();
  console.log(`[${ts}] ${req.method} ${req.originalUrl}`);
  next();
});

// ── Routes ────────────────────────────────────────────────────────────────────

/**
 * GET /
 * Landing page — shows a human-readable summary and the install link.
 */
app.get("/", (_req, res) => {
  const installUrl = `${ADDON_URL}/manifest.json`;
  const stremioInstallUrl = `stremio://${ADDON_URL.replace(/^https?:\/\//, "")}/manifest.json`;

  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>${manifest.name} — Stremio Addon</title>
      <style>
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          background: #0f0f13;
          color: #e2e2e2;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
        }
        .card {
          background: #1a1a24;
          border: 1px solid #2e2e42;
          border-radius: 16px;
          max-width: 540px;
          width: 100%;
          padding: 2.5rem;
          box-shadow: 0 8px 40px rgba(0,0,0,0.5);
        }
        .badge {
          display: inline-block;
          background: #7c3aed;
          color: #fff;
          font-size: 0.7rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          padding: 3px 10px;
          border-radius: 999px;
          margin-bottom: 1rem;
        }
        h1 { font-size: 1.8rem; font-weight: 800; color: #fff; margin-bottom: 0.4rem; }
        .desc { color: #9090a8; font-size: 0.95rem; line-height: 1.6; margin-bottom: 2rem; }
        .btn {
          display: block;
          width: 100%;
          padding: 0.85rem 1.5rem;
          border-radius: 10px;
          font-size: 0.95rem;
          font-weight: 700;
          text-align: center;
          text-decoration: none;
          cursor: pointer;
          border: none;
          transition: filter 0.15s;
          margin-bottom: 0.75rem;
        }
        .btn:hover { filter: brightness(1.12); }
        .btn-primary { background: #7c3aed; color: #fff; }
        .btn-secondary { background: #23233a; color: #c4c4d8; border: 1px solid #2e2e42; }
        .url-box {
          background: #0d0d14;
          border: 1px solid #2e2e42;
          border-radius: 8px;
          padding: 0.7rem 1rem;
          font-family: "Courier New", monospace;
          font-size: 0.8rem;
          color: #7c7c99;
          word-break: break-all;
          margin-top: 1.5rem;
        }
        .url-box span { color: #a78bfa; }
        .meta { margin-top: 1.5rem; display: flex; gap: 1.5rem; font-size: 0.82rem; color: #6b6b88; }
        .meta strong { color: #9090a8; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="badge">Stremio Addon</div>
        <h1>${manifest.name}</h1>
        <p class="desc">${manifest.description}</p>

        <a class="btn btn-primary" href="${stremioInstallUrl}">
          ⚡ Install Addon in Stremio
        </a>
        <a class="btn btn-secondary" href="${installUrl}" target="_blank">
          📄 View manifest.json
        </a>

        <div class="url-box">
          Manual install URL:<br />
          <span>${installUrl}</span>
        </div>

        <div class="meta">
          <div><strong>Version</strong><br />${manifest.version}</div>
          <div><strong>Types</strong><br />Movies · Series</div>
          <div><strong>Sources</strong><br />VidSrc (×4)</div>
        </div>
      </div>
    </body>
    </html>
  `);
});

/**
 * GET /manifest.json
 * Stremio fetches this first to learn what the addon can do.
 */
app.get("/manifest.json", (_req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.json(manifest);
});

/**
 * /stream/* — delegate to the dedicated stream handler router
 */
app.use("/stream", streamHandler);

// ── 404 Catch-all ─────────────────────────────────────────────────────────────

app.use((_req, res) => {
  res.status(404).json({ error: "Not found" });
});

// ── Global Error Handler ──────────────────────────────────────────────────────

// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error("[server] Unhandled error:", err);
  res.status(500).json({ error: "Internal server error", streams: [] });
});

// ── Start ─────────────────────────────────────────────────────────────────────

app.listen(PORT, HOST, () => {
  console.log("╔══════════════════════════════════════════════════╗");
  console.log(`║    ${manifest.name.padEnd(42)}║`);
  console.log("╠══════════════════════════════════════════════════╣");
  console.log(`║    Server : http://${HOST}:${PORT}`.padEnd(51) + "║");
  console.log(`║    Manifest: ${ADDON_URL}/manifest.json`.padEnd(51) + "║");
  console.log(`║    Streams : ${ADDON_URL}/stream/movie/tt0111161.json`.padEnd(51) + "║");
  console.log("╚══════════════════════════════════════════════════╝");
});

module.exports = app; // Export for testing
