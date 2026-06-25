import { PGlite } from '@electric-sql/pglite';
const LAB='file:///sessions/elegant-eloquent-goodall/mnt/product-analytics-lab/src/data';
const { datamarts } = await import(LAB+'/sqlLabDatamarts.js');
const { sqlLabProblems } = await import(LAB+'/sqlLabProblems.js');
const lit=v=>v===null||v===undefined?'NULL':typeof v==='number'?String(v):typeof v==='boolean'?(v?'TRUE':'FALSE'):"'"+String(v).replace(/'/g,"''")+"'";
const dbs={};
for(const [id,dm] of Object.entries(datamarts)){const db=new PGlite();try{for(const[t,tb]of Object.entries(dm.tables)){await db.exec(tb.schema);if(tb.rows.length)await db.exec(`INSERT INTO ${t} VALUES `+tb.rows.map(r=>'('+r.map(lit).join(',')+')').join(','));}dbs[id]=db;}catch(e){console.log('BUILD ERR',id,e.message.slice(0,80));}}
function mv(rv,cv){if(cv===null||cv==='')return rv===null||rv==='';const n=Number(cv);if(!isNaN(n)&&cv!==''){const r=typeof rv==='number'?rv:Number(rv);if(!isNaN(r))return Math.abs(r-n)<0.011;}const rs=rv instanceof Date?rv.toISOString().slice(0,10):String(rv);return rs===String(cv);}
function cvCheck(rows,cvs){for(const cv of cvs){if(!rows.some(r=>Object.entries(cv).every(([k,v])=>mv(r[k],v))))return 'checkVal miss '+JSON.stringify(cv);}return null;}
let pass=0;const errs=[],val=[];
for(const p of sqlLabProblems){const db=dbs[p.datamartId];if(!db||!p.solution)continue;try{const res=await db.query(p.solution);const cols=res.fields.map(f=>f.name),n=res.rows.length;if(typeof p.expectedRowCount==='number'&&n!==p.expectedRowCount){errs.push(p.id+' ['+p.difficulty+'] rows '+n+'!='+p.expectedRowCount);continue;}if(Array.isArray(p.expectedColumns)&&JSON.stringify(cols)!==JSON.stringify(p.expectedColumns)){errs.push(p.id+' ['+p.difficulty+'] cols '+JSON.stringify(cols));continue;}if(Array.isArray(p.checkValues)&&p.checkValues.length){const r=cvCheck(res.rows,p.checkValues);if(r){val.push(p.id+' ['+p.difficulty+'] '+r);continue;}}pass++;}catch(e){errs.push(p.id+' ['+p.difficulty+'] ERR '+e.message.split('\n')[0].slice(0,75));}}
console.log('PASS (rows+cols+checkValues):',pass,'/',sqlLabProblems.length);
console.log('\nERRORS/ROWCOL ('+errs.length+'):');errs.forEach(e=>console.log('  ',e));
console.log('\nVALUE MISMATCHES ('+val.length+'):');val.forEach(e=>console.log('  ',e));
