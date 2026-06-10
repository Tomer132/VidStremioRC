/**
 * vidsrc.js
 * ---------
 * Builds streaming URLs for the VidSrc family of sources.
 *
 * Sources supported:
 *  • vidsrc.me   — embed endpoint
 *  • vidsrc.to   — embed endpoint
 *  • vidsrc.xyz  — embed endpoint (fallback)
 *  • vidsrc.pro  — embed endpoint (fallback)
 *
 * URL patterns follow the official VidSrc embed documentation.
 */

// ── Source Definitions ────────────────────────────────────────────────────────

/**
 * Each source entry describes one VidSrc provider.
 * @typedef {Object} SourceDef
 * @property {string} id       - Short unique key used internally
 * @property {string} name     - Human-readable name shown in Stremio
 * @property {string} baseUrl  - Root domain (no trailing slash)
 * @property {string} quality  - Quality label shown in stream title
 * @property {number} priority - Lower = shown first
 */
const SOURCES = [
  {
    id: "vidsrc_me",
    name: "VidSrc.me",
    baseUrl: "https://vidsrc.me/embed",
    quality: "4K / 1080p",
    priority: 1,
  },
  {
    id: "vidsrc_to",
    name: "VidSrc.to",
    baseUrl: "https://vidsrc.to/embed",
    quality: "1080p",
    priority: 2,
  },
  {
    id: "vidsrc_xyz",
    name: "VidSrc.xyz",
    baseUrl: "https://vidsrc.xyz/embed",
    quality: "1080p",
    priority: 3,
  },
  {
    id: "vidsrc_pro",
    name: "VidSrc.pro",
    baseUrl: "https://vidsrc.pro/embed",
    quality: "HD",
    priority: 4,
  },
];

// ── URL Builders ──────────────────────────────────────────────────────────────

/**
 * Build a movie embed URL for a given source.
 * Pattern: {baseUrl}/movie/{imdbId}
 *
 * @param {SourceDef} source
 * @param {string} imdbId  - e.g. "tt1234567"
 * @returns {string}
 */
function buildMovieUrl(source, imdbId) {
  return `${source.baseUrl}/movie/${imdbId}`;
}

/**
 * Build a series embed URL for a given source.
 * Pattern: {baseUrl}/tv/{imdbId}/{season}/{episode}
 *
 * @param {SourceDef} source
 * @param {string} imdbId   - e.g. "tt1234567"
 * @param {number} season
 * @param {number} episode
 * @returns {string}
 */
function buildSeriesUrl(source, imdbId, season, episode) {
  return `${source.baseUrl}/tv/${imdbId}/${season}/${episode}`;
}

// ── Stream Object Builders ────────────────────────────────────────────────────

/**
 * Build a Stremio-compatible stream object for a movie.
 *
 * @param {SourceDef} source
 * @param {string} imdbId
 * @returns {Object} Stremio stream object
 */
function buildMovieStream(source, imdbId) {
  return {
    // The URL Stremio will open (embed player)
    externalUrl: buildMovieUrl(source, imdbId),

    // Title displayed in Stremio's source picker — keep it concise
    name: `⚡ ${source.name}`,

    // Subtitle / description line below the title
    description: [
      `🎬 Movie  •  🌐 ${source.name}`,
      `📺 Quality: ${source.quality}`,
      `🔗 Stream via VidSrc`,
    ].join("\n"),

    // Optional: tell Stremio this is a web embed, not a direct video file
    behaviorHints: {
      notWebReady: false,
    },
  };
}

/**
 * Build a Stremio-compatible stream object for a series episode.
 *
 * @param {SourceDef} source
 * @param {string} imdbId
 * @param {number} season
 * @param {number} episode
 * @returns {Object} Stremio stream object
 */
function buildSeriesStream(source, imdbId, season, episode) {
  return {
    externalUrl: buildSeriesUrl(source, imdbId, season, episode),

    name: `⚡ ${source.name}`,

    description: [
      `📺 S${String(season).padStart(2, "0")}E${String(episode).padStart(2, "0")}  •  🌐 ${source.name}`,
      `🎞️ Quality: ${source.quality}`,
      `🔗 Stream via VidSrc`,
    ].join("\n"),

    behaviorHints: {
      notWebReady: false,
    },
  };
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Return all VidSrc stream objects for a movie, sorted by priority.
 *
 * @param {string} imdbId
 * @returns {Object[]}
 */
function getMovieStreams(imdbId) {
  return [...SOURCES]
    .sort((a, b) => a.priority - b.priority)
    .map((source) => buildMovieStream(source, imdbId));
}

/**
 * Return all VidSrc stream objects for a series episode, sorted by priority.
 *
 * @param {string} imdbId
 * @param {number|string} season
 * @param {number|string} episode
 * @returns {Object[]}
 */
function getSeriesStreams(imdbId, season, episode) {
  return [...SOURCES]
    .sort((a, b) => a.priority - b.priority)
    .map((source) => buildSeriesStream(source, imdbId, Number(season), Number(episode)));
}

module.exports = {
  getMovieStreams,
  getSeriesStreams,
  SOURCES, // exported for testing / introspection
};
