/**
 * manifest.js
 * -----------
 * Stremio addon manifest — defines the addon's identity, capabilities,
 * and the resource/type/idPrefix combinations it responds to.
 */

const manifest = {
  // ── Identity ────────────────────────────────────────────────────────────────
  id: "community.vidsrc.addon",
  version: "1.0.0",
  name: "⚡ VidSrc Streams",
  description:
    "High-quality streams for movies & TV series powered by VidSrc. " +
    "Supports multiple sources including VidSrc.me and VidSrc.to.",

  // ── Branding (replace URLs with your own hosted assets) ───────────────────
  logo: "https://i.imgur.com/placeholder-logo.png",
  background: "https://i.imgur.com/placeholder-bg.jpg",
  contactEmail: "addon@vidsrc.example.com",

  // ── Capabilities ────────────────────────────────────────────────────────────
  resources: ["stream"],

  // Content types this addon handles
  types: ["movie", "series"],

  // Only respond to IMDb-style IDs (tt_________)
  idPrefixes: ["tt"],

  // ── Catalogue (empty — this addon only provides streams, not a catalogue) ──
  catalogs: [],

  // ── Behaviour Hints ─────────────────────────────────────────────────────────
  behaviorHints: {
    // Set to true once deployed behind HTTPS to allow Stremio apps to use it
    adult: false,
    p2p: false,
    configurable: false,
  },
};

module.exports = manifest;
