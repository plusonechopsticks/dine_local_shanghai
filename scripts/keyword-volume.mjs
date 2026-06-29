#!/usr/bin/env node
/**
 * DataForSEO keyword search volume pull for +1 Chopsticks
 *
 * Usage:
 *   DATAFORSEO_LOGIN=you@example.com DATAFORSEO_PASSWORD=secret node scripts/keyword-volume.mjs
 *
 * Optional env vars:
 *   OUTPUT_FILE   path for the CSV (default: keyword-volume.csv in cwd)
 *   LOCATIONS     comma-separated DataForSEO location codes (default: 2840,2826,2124,2036)
 */

import { writeFileSync } from "fs";
import { createWriteStream } from "fs";

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const LOGIN = process.env.DATAFORSEO_LOGIN;
const PASSWORD = process.env.DATAFORSEO_PASSWORD;

if (!LOGIN || !PASSWORD) {
  console.error(
    "ERROR: Set DATAFORSEO_LOGIN and DATAFORSEO_PASSWORD environment variables."
  );
  process.exit(1);
}

const OUTPUT_FILE = process.env.OUTPUT_FILE || "keyword-volume.csv";

const LOCATION_CODES = (process.env.LOCATIONS ?? "2840,2826,2124,2036")
  .split(",")
  .map((s) => parseInt(s.trim(), 10));

const LOCATION_NAMES = {
  2840: "US",
  2826: "UK",
  2124: "Canada",
  2036: "Australia",
};

// ---------------------------------------------------------------------------
// Keyword list with cluster metadata
// ---------------------------------------------------------------------------

const KEYWORDS = [
  // Tier candidate: Own-now
  { keyword: "home dining shanghai", cluster: "own-now" },
  { keyword: "dinner with a local family shanghai", cluster: "own-now" },
  { keyword: "eat with a local shanghai", cluster: "own-now" },
  { keyword: "eat with a local china", cluster: "own-now" },
  { keyword: "home cooked meal shanghai", cluster: "own-now" },
  { keyword: "meet a local family china", cluster: "own-now" },
  { keyword: "authentic home dining china", cluster: "own-now" },
  { keyword: "local family dinner experience shanghai", cluster: "own-now" },
  { keyword: "private home dinner shanghai", cluster: "own-now" },
  { keyword: "benbang cuisine experience", cluster: "own-now" },
  {
    keyword: "home cooking class with a local family shanghai",
    cluster: "own-now",
  },

  // Tier candidate: High-intent transactional
  { keyword: "shanghai cooking class", cluster: "transactional" },
  { keyword: "private cooking class shanghai", cluster: "transactional" },
  { keyword: "dumpling making class shanghai", cluster: "transactional" },
  { keyword: "xiaolongbao class shanghai", cluster: "transactional" },
  { keyword: "shanghai food tour", cluster: "transactional" },
  { keyword: "evening food tour shanghai", cluster: "transactional" },
  { keyword: "french concession food tour", cluster: "transactional" },
  { keyword: "eat like a local shanghai", cluster: "transactional" },
  { keyword: "chengdu cooking class", cluster: "transactional" },
  { keyword: "sichuan cooking class chengdu", cluster: "transactional" },
  { keyword: "chengdu food tour", cluster: "transactional" },

  // Tier candidate: Informational / GEO
  { keyword: "what is benbang cuisine", cluster: "informational" },
  { keyword: "shanghai local food not touristy", cluster: "informational" },
  { keyword: "how to eat like a local in shanghai", cluster: "informational" },
  {
    keyword: "authentic chinese food experience for travelers",
    cluster: "informational",
  },
  {
    keyword: "things to do in shanghai for foodies",
    cluster: "informational",
  },
  {
    keyword: "real chinese home food vs restaurant",
    cluster: "informational",
  },
  {
    keyword: "best authentic food experience china",
    cluster: "informational",
  },
];

// ---------------------------------------------------------------------------
// Priority tier logic
// ---------------------------------------------------------------------------

function priorityTier(keyword, cluster, volume) {
  if (cluster === "informational") return "GEO PLAY";
  if (cluster === "transactional") return "LONG GAME";
  // own-now cluster
  if (volume >= 100) return "OWN NOW";
  if (volume >= 30) return "OWN NOW"; // differentiator — keep even at lower vol
  return "SKIP";
}

// ---------------------------------------------------------------------------
// DataForSEO API call
// ---------------------------------------------------------------------------

const BASE_URL = "https://api.dataforseo.com";

async function fetchVolumes(keywords, locationCode) {
  const credentials = Buffer.from(`${LOGIN}:${PASSWORD}`).toString("base64");

  const body = [
    {
      keywords: keywords.map((k) => k.keyword),
      location_code: locationCode,
      language_code: "en",
    },
  ];

  const response = await fetch(
    `${BASE_URL}/v3/keywords_data/google_ads/search_volume/live`,
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${credentials}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    }
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(
      `DataForSEO HTTP ${response.status}: ${text.slice(0, 300)}`
    );
  }

  const json = await response.json();

  // Top-level API error
  if (json.status_code !== 20000) {
    throw new Error(
      `DataForSEO API error ${json.status_code}: ${json.status_message}`
    );
  }

  const task = json.tasks?.[0];
  if (!task) throw new Error("No tasks in response");
  if (task.status_code !== 20000) {
    throw new Error(
      `Task error ${task.status_code}: ${task.status_message}`
    );
  }

  return task.result ?? [];
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log(`Pulling volumes for ${KEYWORDS.length} keywords...`);
  console.log(`Locations: ${LOCATION_CODES.join(", ")}`);
  console.log();

  const rows = [];

  for (const locationCode of LOCATION_CODES) {
    const locationLabel = LOCATION_NAMES[locationCode] ?? String(locationCode);
    process.stdout.write(`  Fetching ${locationLabel}... `);

    try {
      const results = await fetchVolumes(KEYWORDS, locationCode);

      // Build a lookup by keyword text
      const volumeMap = {};
      for (const item of results) {
        if (item?.keyword) {
          volumeMap[item.keyword.toLowerCase()] = item;
        }
      }

      for (const kw of KEYWORDS) {
        const data = volumeMap[kw.keyword.toLowerCase()];
        const volume = data?.search_volume ?? 0;
        const competition = data?.competition ?? null;
        const cpc = data?.cpc ?? null;
        const tier = priorityTier(kw.keyword, kw.cluster, volume);

        rows.push({
          keyword: kw.keyword,
          cluster: kw.cluster,
          location: locationLabel,
          search_volume: volume,
          competition: competition !== null ? competition.toFixed(2) : "",
          cpc: cpc !== null ? cpc.toFixed(2) : "",
          priority_tier: tier,
        });
      }

      console.log(`done (${results.length} results)`);
    } catch (err) {
      console.log(`FAILED: ${err.message}`);
      // Still add empty rows so the CSV structure is complete
      for (const kw of KEYWORDS) {
        rows.push({
          keyword: kw.keyword,
          cluster: kw.cluster,
          location: locationLabel,
          search_volume: "",
          competition: "",
          cpc: "",
          priority_tier: "ERROR",
        });
      }
    }
  }

  // Sort: priority_tier order, then volume desc
  const TIER_ORDER = { "OWN NOW": 0, "GEO PLAY": 1, "LONG GAME": 2, SKIP: 3, ERROR: 4 };
  rows.sort((a, b) => {
    const ta = TIER_ORDER[a.priority_tier] ?? 5;
    const tb = TIER_ORDER[b.priority_tier] ?? 5;
    if (ta !== tb) return ta - tb;
    return (Number(b.search_volume) || 0) - (Number(a.search_volume) || 0);
  });

  // Write CSV
  const header = "keyword,cluster,location,search_volume_US,competition,cpc,priority_tier";
  const csvRows = rows.map((r) =>
    [
      csvEscape(r.keyword),
      csvEscape(r.cluster),
      csvEscape(r.location),
      r.search_volume,
      r.competition,
      r.cpc,
      csvEscape(r.priority_tier),
    ].join(",")
  );

  const csv = [header, ...csvRows].join("\n") + "\n";
  writeFileSync(OUTPUT_FILE, csv, "utf8");

  console.log();
  console.log(`CSV written to: ${OUTPUT_FILE}`);
  console.log(`Total rows: ${rows.length}`);

  // Quick summary
  const tiers = {};
  for (const r of rows) {
    if (!tiers[r.priority_tier]) tiers[r.priority_tier] = 0;
    tiers[r.priority_tier]++;
  }
  console.log("\nTier summary:");
  for (const [tier, count] of Object.entries(tiers)) {
    console.log(`  ${tier}: ${count}`);
  }
}

function csvEscape(str) {
  if (str == null) return "";
  const s = String(str);
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

main().catch((err) => {
  console.error("Fatal:", err.message);
  process.exit(1);
});
