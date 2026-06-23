
import { datamarts } from '/sessions/relaxed-nice-davinci/mnt/product-analytics-lab/src/data/sqlLabDatamarts.js';
import { sqlLabProblems } from '/sessions/relaxed-nice-davinci/mnt/product-analytics-lab/src/data/sqlLabProblems.js';
process.stdout.write(JSON.stringify({ datamarts, problems: sqlLabProblems }));
