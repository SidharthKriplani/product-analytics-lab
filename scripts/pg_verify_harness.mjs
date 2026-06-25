import { PGlite } from '@electric-sql/pglite';
const { datamarts } = await import('file:///sessions/elegant-eloquent-goodall/mnt/product-analytics-lab/src/data/sqlLabDatamarts.js');
const { sqlLabProblems } = await import('file:///sessions/elegant-eloquent-goodall/mnt/product-analytics-lab/src/data/sqlLabProblems.js');
const lit = v => v===null||v===undefined ? 'NULL' : typeof v==='number' ? String(v) : typeof v==='boolean' ? (v?'TRUE':'FALSE') : "'"+String(v).replace(/'/g,"''")+"'";
const dbs={}, buildErr=[];
for (const [id,dm] of Object.entries(datamarts)) {
  const db = new PGlite();
  try {
    for (const [t,tbl] of Object.entries(dm.tables)) {
      await db.exec(tbl.schema);
      if (tbl.rows.length) {
        const vals = tbl.rows.map(r=>'('+r.map(lit).join(',')+')').join(',');
        await db.exec(`INSERT INTO ${t} VALUES ${vals}`);
      }
    }
    dbs[id]=db;
  } catch(e){ buildErr.push(id+': '+e.message.slice(0,100)); }
}
console.log('=== datamart build errors:', buildErr.length); buildErr.forEach(e=>console.log('  ',e));
let pass=0; const errs=[], mism=[];
for (const p of sqlLabProblems) {
  const db=dbs[p.datamartId]; if(!db||!p.solution) continue;
  try {
    const res=await db.query(p.solution);
    const cols=res.fields.map(f=>f.name), n=res.rows.length;
    if (typeof p.expectedRowCount==='number' && n!==p.expectedRowCount) mism.push(p.id+' ['+p.difficulty+'] rows '+n+'!='+p.expectedRowCount);
    else if (Array.isArray(p.expectedColumns) && JSON.stringify(cols)!==JSON.stringify(p.expectedColumns)) mism.push(p.id+' ['+p.difficulty+'] cols '+JSON.stringify(cols));
    else pass++;
  } catch(e){ errs.push(p.id+' ['+p.difficulty+'] '+e.message.split('\n')[0].slice(0,70)); }
}
console.log('\n=== RESULT: PASS '+pass+' / total '+sqlLabProblems.length);
console.log('\n=== SQL ERRORS (SQLite-isms etc):', errs.length);
errs.forEach(e=>console.log('  ',e));
console.log('\n=== ROW/COL MISMATCHES:', mism.length);
mism.forEach(e=>console.log('  ',e));
