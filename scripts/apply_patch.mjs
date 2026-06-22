// Single-writer integrator: applies content patches to sqlLabProblems.js by
// exact escaped string replacement (no re-serialization, preserves formatting).
// Patch file = JSON array of { id, field, value } where field is prompt|debrief|...
// Verifies each target string is found exactly once before writing.
// Usage: node scripts/apply_patch.mjs <patches.json>
import fs from 'fs';

const PATH = new URL('../src/data/sqlLabProblems.js', import.meta.url);
const patches = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
let raw = fs.readFileSync(PATH, 'utf8');
const problems = eval(raw.slice(raw.indexOf('['), raw.lastIndexOf('];') + 1));
const esc = s => s.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, '\\n');

let ok = 0, fail = 0;
for (const patch of patches) {
  // Raw literal replacement (for non-string fields like checkValues arrays).
  if (patch.rawOld !== undefined) {
    const n = raw.split(patch.rawOld).length - 1;
    if (n !== 1) { console.log(`SKIP raw: matched ${n}x (need 1): ${patch.rawOld.slice(0, 50)}...`); fail++; continue; }
    raw = raw.replace(patch.rawOld, patch.rawNew); ok++;
    console.log(`OK raw replace`);
    continue;
  }
  // hintStep starterCode replacement by index (prefix-anchored so it can't collide with `solution`).
  if (patch.hintStep !== undefined) {
    const p = problems.find(x => x.id === patch.id);
    if (!p) { console.log(`MISS ${patch.id}: not found`); fail++; continue; }
    const step = p.hintSteps[patch.hintStep];
    const cur = step.starterCode;
    // anchor on the (unique) hint text so identical starterCode in another step/problem can't collide
    const oldStr = "text: '" + esc(step.text) + "', starterCode: '" + esc(cur) + "'";
    const newStr = "text: '" + esc(step.text) + "', starterCode: '" + esc(patch.value) + "'";
    const n = raw.split(oldStr).length - 1;
    if (n !== 1) { console.log(`SKIP ${patch.id}.hintStep[${patch.hintStep}]: matched ${n}x (need 1)`); fail++; continue; }
    raw = raw.replace(oldStr, newStr); ok++;
    console.log(`OK ${patch.id}.hintStep[${patch.hintStep}]`);
    continue;
  }
  const { id, field, value, append } = patch;
  const p = problems.find(x => x.id === id);
  if (!p) { console.log(`MISS ${id}: not found`); fail++; continue; }
  const newVal = append !== undefined ? p[field] + append : value;
  const oldQ = "'" + esc(p[field]) + "'";
  const newQ = "'" + esc(newVal) + "'";
  const n = raw.split(oldQ).length - 1;
  if (n !== 1) { console.log(`SKIP ${id}.${field}: matched ${n}x (need 1)`); fail++; continue; }
  raw = raw.replace(oldQ, newQ); ok++;
  console.log(`OK ${id}.${field}`);
}
if (fail === 0) { fs.writeFileSync(PATH, raw); console.log(`\nApplied ${ok} patch(es).`); }
else { console.log(`\nNOT WRITTEN — ${fail} failures. Fix and rerun.`); process.exit(1); }
