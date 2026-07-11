// contentStatus.js — PAL machine-readable module pipeline status (companion to
// moduleTiers.js). Same convention as GSL/MSL contentStatus.js — keep all three in
// sync. Seeded 2026-07-11 programmatically from the four foundation data files
// (statsFoundationsModules / expFoundationModules / metricsFoundationModules /
// rcaFoundationModules) with tiers from moduleTiers.js (B = default, per that
// file's own convention). ALL entries seeded 'unclassified' — PAL has had no
// writer + Pass-2 adversarial audit passes yet; do NOT flip any entry to 'clean'
// without one (see the HARD RULE + 3-part verifiedBy receipt spec in GSL's
// contentStatus.js header and CLAUDE.md's Recordkeeping section).
//
// Status values: 'unclassified' | 'pending' | 'in_progress' | 'clean'.
// Any 'clean' entry MUST carry a real verifiedBy receipt + sourceFile/verifiedFileHash.
// Gate rule (QNA-INTERVIEW-STANDARD.md): QnA answers are only written for 'clean' modules.

export const CONTENT_STATUS = {
  // --- stats ---
  "sf01": { tier: "B", status: "unclassified" },
  "sf02": { tier: "B", status: "unclassified" },
  "sf03": { tier: "A", status: "unclassified" },
  "sf04": { tier: "A", status: "unclassified" },
  "sf05": { tier: "A", status: "unclassified" },
  "sf06": { tier: "A", status: "unclassified" },
  "sf07": { tier: "A", status: "unclassified" },
  "sf08": { tier: "A", status: "unclassified" },
  "sf09": { tier: "S", status: "unclassified" },
  "sf10": { tier: "S", status: "unclassified" },
  "sf11": { tier: "S", status: "unclassified" },
  "sf12": { tier: "S", status: "unclassified" },
  "sf13": { tier: "S", status: "unclassified" },
  "sf14": { tier: "A", status: "unclassified" },
  "sf15": { tier: "S", status: "unclassified" },
  "sf16": { tier: "A", status: "unclassified" },
  "sf17": { tier: "S", status: "unclassified" },
  "sf18": { tier: "S", status: "unclassified" },
  "sf19": { tier: "S", status: "unclassified" },
  "sf20": { tier: "S", status: "unclassified" },
  "sf21": { tier: "B", status: "unclassified" },
  "sf22": { tier: "B", status: "unclassified" },
  "sf23": { tier: "B", status: "unclassified" },
  "sf24": { tier: "B", status: "unclassified" },
  "sf25": { tier: "B", status: "unclassified" },
  "sf26": { tier: "B", status: "unclassified" },
  "sf27": { tier: "B", status: "unclassified" },
  "sf28": { tier: "B", status: "unclassified" },
  "sf29": { tier: "B", status: "unclassified" },
  "sf30": { tier: "B", status: "unclassified" },
  "sf31": { tier: "B", status: "unclassified" },
  "sf32": { tier: "B", status: "unclassified" },
  // --- exp ---
  "ef01": { tier: "S", status: "unclassified" },
  "ef02": { tier: "S", status: "unclassified" },
  "ef03": { tier: "S", status: "unclassified" },
  "ef04": { tier: "S", status: "unclassified" },
  "ef05": { tier: "S", status: "unclassified" },
  "ef06": { tier: "S", status: "unclassified" },
  "ef07": { tier: "S", status: "unclassified" },
  "ef08": { tier: "A", status: "unclassified" },
  "ef09": { tier: "A", status: "unclassified" },
  "ef10": { tier: "A", status: "unclassified" },
  "ef11": { tier: "B", status: "unclassified" },
  "ef12": { tier: "A", status: "unclassified" },
  "ef13": { tier: "B", status: "unclassified" },
  "ef14": { tier: "B", status: "unclassified" },
  "ef15": { tier: "B", status: "unclassified" },
  // --- metrics ---
  "mf01": { tier: "S", status: "unclassified" },
  "mf02": { tier: "S", status: "unclassified" },
  "mf03": { tier: "A", status: "unclassified" },
  "mf04": { tier: "S", status: "unclassified" },
  "mf05": { tier: "S", status: "unclassified" },
  "mf06": { tier: "A", status: "unclassified" },
  "mf07": { tier: "S", status: "unclassified" },
  "mf08": { tier: "A", status: "unclassified" },
  "mf09": { tier: "S", status: "unclassified" },
  "mf10": { tier: "A", status: "unclassified" },
  "mf11": { tier: "A", status: "unclassified" },
  "mf12": { tier: "A", status: "unclassified" },
  "mf13": { tier: "B", status: "unclassified" },
  "mf14": { tier: "A", status: "unclassified" },
  "mf15": { tier: "A", status: "unclassified" },
  "mf16": { tier: "A", status: "unclassified" },
  "mf17": { tier: "A", status: "unclassified" },
  // --- rca ---
  "rf01": { tier: "S", status: "unclassified" },
  "rf02": { tier: "S", status: "unclassified" },
  "rf03": { tier: "S", status: "unclassified" },
  "rf04": { tier: "A", status: "unclassified" },
  "rf05": { tier: "S", status: "unclassified" },
  "rf06": { tier: "S", status: "unclassified" },
  "rf07": { tier: "A", status: "unclassified" },
  "rf08": { tier: "A", status: "unclassified" },
  "rf09": { tier: "A", status: "unclassified" },
  "rf10": { tier: "A", status: "unclassified" },
  "rf11": { tier: "A", status: "unclassified" },
  "rf12": { tier: "A", status: "unclassified" },
  "rf13": { tier: "A", status: "unclassified" },
  "rf14": { tier: "A", status: "unclassified" },
  "rf15": { tier: "A", status: "unclassified" },
}

export function statusOf(moduleId) {
  return CONTENT_STATUS[moduleId]?.status ?? 'unclassified'
}
