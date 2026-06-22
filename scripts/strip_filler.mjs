// Strip trailing "Write a SQL query to..." filler from prompts.
// SAFE: only strips when the filler sentence carries no unique spec
// (no column name or ordering/rounding word that's absent from the rest).
// Dry-run by default; pass --apply to write. Escape-safe (only removes a
// clause with no apostrophes; remaining text keeps its existing escapes).
import fs from 'fs';

const PATH = new URL('../src/data/sqlLabProblems.js', import.meta.url);
let raw = fs.readFileSync(PATH, 'utf8');
const problems = eval(raw.slice(raw.indexOf('['), raw.lastIndexOf('];') + 1));

const FILLER = /\s+Write an? (the )?(sql )?quer[ys]\b/i;
const SPECWORDS = /\b(order(ed)? by|sorted|descending|ascending|rounded|round to|decimal|per |group)\b/i;

const safe = [], loadBearing = [], noApos = [];
for (const p of problems) {
  const prompt = p.prompt || '';
  const m = prompt.search(FILLER);
  if (m < 0) continue;
  const filler = prompt.slice(m);                 // leading-space + filler sentence to end
  const stripped = prompt.slice(0, m).replace(/\s+$/, '');
  // load-bearing check: does the filler mention a column or spec word missing from the kept text?
  const cols = (p.expectedColumns || []);
  const lostCol = cols.find(c => filler.toLowerCase().includes(c.toLowerCase()) && !stripped.toLowerCase().includes(c.toLowerCase()));
  const lostSpec = SPECWORDS.test(filler) && !SPECWORDS.test(stripped);
  const endsClean = /[.?!]$/.test(stripped);
  if (lostCol || lostSpec || !endsClean) {
    loadBearing.push({ id: p.id, why: lostCol ? 'lost col:' + lostCol : (lostSpec ? 'lost spec word' : 'no clean end'), filler: filler.trim() });
    continue;
  }
  if (filler.includes("'") || filler.includes('\\')) { noApos.push(p.id); continue; } // hand-handle escaped
  safe.push({ id: p.id, filler: filler.trim(), stripped });
}

console.log(`Filler found: ${safe.length + loadBearing.length + noApos.length}`);
console.log(`  SAFE to auto-strip: ${safe.length}`);
console.log(`  LOAD-BEARING (hand-fix): ${loadBearing.length}`);
console.log(`  has apostrophe/escape (hand-fix): ${noApos.length} -> ${noApos.join(', ')}`);
console.log('\nLOAD-BEARING detail:');
loadBearing.forEach(x => console.log(`  ${x.id}: [${x.why}] "${x.filler}"`));

if (process.argv.includes('--apply')) {
  let applied = 0;
  for (const s of safe) {
    if (raw.includes(s.filler)) { raw = raw.replace(s.filler, ''); applied++; }
    else console.log('  WARN not found verbatim:', s.id);
  }
  fs.writeFileSync(PATH, raw);
  console.log(`\nAPPLIED ${applied} strips.`);
} else {
  console.log('\n(dry run — pass --apply to write)');
}
