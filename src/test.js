/**
 * test.js
 * -------
 * Lightweight self-test that exercises the core logic without needing
 * a running server. Run with:  node src/test.js
 */

"use strict";

const { getMovieStreams, getSeriesStreams, SOURCES } = require("./vidsrc");

// ── Simple assertion helper ───────────────────────────────────────────────────

let passed = 0;
let failed = 0;

function assert(label, condition) {
  if (condition) {
    console.log(`  ✅  ${label}`);
    passed++;
  } else {
    console.error(`  ❌  ${label}`);
    failed++;
  }
}

// ── Tests ─────────────────────────────────────────────────────────────────────

console.log("\n── VidSrc URL Builder ───────────────────────────────────────\n");

const movieStreams = getMovieStreams("tt0111161"); // The Shawshank Redemption

assert("getMovieStreams returns an array", Array.isArray(movieStreams));
assert(
  `getMovieStreams returns one stream per source (${SOURCES.length})`,
  movieStreams.length === SOURCES.length
);
assert(
  "Each movie stream has externalUrl",
  movieStreams.every((s) => typeof s.externalUrl === "string" && s.externalUrl.startsWith("http"))
);
assert(
  "Each movie stream has a name",
  movieStreams.every((s) => typeof s.name === "string" && s.name.length > 0)
);
assert(
  "Each movie stream has a description",
  movieStreams.every((s) => typeof s.description === "string")
);
assert(
  "VidSrc.me URL is correctly formed",
  movieStreams[0].externalUrl === "https://vidsrc.me/embed/movie/tt0111161"
);
assert(
  "VidSrc.to URL is correctly formed",
  movieStreams[1].externalUrl === "https://vidsrc.to/embed/movie/tt0111161"
);

console.log("\n── Series Streams ───────────────────────────────────────────\n");

const seriesStreams = getSeriesStreams("tt0903747", 1, 1); // Breaking Bad S01E01

assert("getSeriesStreams returns an array", Array.isArray(seriesStreams));
assert(
  `getSeriesStreams returns one stream per source (${SOURCES.length})`,
  seriesStreams.length === SOURCES.length
);
assert(
  "Series stream URL contains season and episode",
  seriesStreams[0].externalUrl.includes("/1/1")
);
assert(
  "VidSrc.me series URL is correctly formed",
  seriesStreams[0].externalUrl === "https://vidsrc.me/embed/tv/tt0903747/1/1"
);
assert(
  "Series description contains episode info",
  seriesStreams[0].description.includes("S01E01")
);

console.log("\n── Stream Formatting ────────────────────────────────────────\n");

assert(
  "Stream name contains ⚡",
  movieStreams.every((s) => s.name.includes("⚡"))
);
assert(
  "Stream name contains source name",
  movieStreams.every((s) => s.name.includes("VidSrc"))
);
assert(
  "All streams have behaviorHints",
  movieStreams.every((s) => typeof s.behaviorHints === "object")
);

// ── Summary ───────────────────────────────────────────────────────────────────

console.log("\n─────────────────────────────────────────────────────────────");
console.log(`\n  Results: ${passed} passed, ${failed} failed\n`);

if (failed > 0) {
  process.exit(1);
}
