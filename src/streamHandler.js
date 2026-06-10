/**
 * streamHandler.js
 * ----------------
 * Express router that handles the Stremio stream endpoint.
 *
 * Route:  GET /stream/:type/:id.json
 *
 * :type  — "movie" | "series"
 * :id    — IMDb ID for movies        (e.g. tt1234567)
 *          IMDb:season:episode for series  (e.g. tt1234567:1:1)
 */

const express = require("express");
const { getMovieStreams, getSeriesStreams } = require("./vidsrc");

const router = express.Router();

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Validate that a string looks like a real IMDb ID.
 * @param {string} id
 * @returns {boolean}
 */
function isValidImdbId(id) {
  return /^tt\d{7,8}$/.test(id);
}

/**
 * Parse the raw `:id` path parameter from a Stremio stream request.
 *
 * Movies  → "tt1234567"           → { imdbId, season: null, episode: null }
 * Series  → "tt1234567:1:1"       → { imdbId, season: 1,    episode: 1    }
 *
 * Returns null if the ID cannot be parsed cleanly.
 *
 * @param {string} type   - "movie" | "series"
 * @param {string} rawId  - Raw path segment from Stremio
 * @returns {{ imdbId: string, season: number|null, episode: number|null }|null}
 */
function parseId(type, rawId) {
  if (type === "movie") {
    // Movies only contain the IMDb ID
    const imdbId = rawId.trim();
    if (!isValidImdbId(imdbId)) return null;
    return { imdbId, season: null, episode: null };
  }

  if (type === "series") {
    // Series IDs come in as "tt1234567:season:episode"
    const parts = rawId.split(":");
    if (parts.length !== 3) return null;

    const [imdbId, rawSeason, rawEpisode] = parts;
    if (!isValidImdbId(imdbId)) return null;

    const season = parseInt(rawSeason, 10);
    const episode = parseInt(rawEpisode, 10);

    if (isNaN(season) || isNaN(episode) || season < 1 || episode < 1) return null;

    return { imdbId, season, episode };
  }

  return null; // Unknown type
}

// ── Stream Route ──────────────────────────────────────────────────────────────

/**
 * GET /stream/:type/:id.json
 *
 * Stremio calls this route whenever a user selects a piece of content.
 * We must respond with { streams: [...] } — an empty array is valid
 * (it just means "no streams available").
 */
router.get("/:type/:id.json", (req, res) => {
  // Destructure and normalise path params
  const type = req.params.type?.toLowerCase().trim();
  const rawId = req.params.id?.trim();

  // ── Basic validation ───────────────────────────────────────────────────────
  if (!type || !rawId) {
    console.warn(`[stream] Missing type or id — type="${type}" id="${rawId}"`);
    return res.status(400).json({ streams: [] });
  }

  if (!["movie", "series"].includes(type)) {
    console.warn(`[stream] Unsupported type: "${type}"`);
    return res.json({ streams: [] });
  }

  // ── Parse the ID ──────────────────────────────────────────────────────────
  const parsed = parseId(type, rawId);

  if (!parsed) {
    console.warn(`[stream] Could not parse id "${rawId}" for type "${type}"`);
    return res.json({ streams: [] });
  }

  const { imdbId, season, episode } = parsed;

  // ── Build streams ─────────────────────────────────────────────────────────
  try {
    let streams = [];

    if (type === "movie") {
      console.log(`[stream] 🎬 Movie → ${imdbId}`);
      streams = getMovieStreams(imdbId);
    } else {
      console.log(`[stream] 📺 Series → ${imdbId} S${season}E${episode}`);
      streams = getSeriesStreams(imdbId, season, episode);
    }

    console.log(`[stream] ✅ Returning ${streams.length} stream(s) for ${rawId}`);
    return res.json({ streams });

  } catch (err) {
    // Never let an internal error crash the server or break Stremio's UI
    console.error(`[stream] ❌ Error building streams for "${rawId}":`, err.message);
    return res.json({ streams: [] });
  }
});

module.exports = router;
