import * as fs from 'fs';
import * as path from 'path';
import { analyzeTeal } from '../backend/src/analysis/static-analysis';
const tealPath = path.join(__dirname, '..', 'test-fixtures', 'teal', 'example-simple.teal');
const tealSource = fs.readFileSync(tealPath, 'utf-8');

console.log('📄 Analyzing:', tealPath);
console.log('---');

const result = analyzeTeal(tealSource, 'example-simple.teal');

console.log('✅ Analysis result:');
console.log(JSON.stringify(result, null, 2));

console.log('---');
console.log('📊 Summary:');
console.log(`Total instructions: ${result.totalInstructions}`);
console.log(`Storage ops: ${result.storageOps.appLocalGet + result.storageOps.appLocalPut + result.storageOps.appGlobalGet + result.storageOps.appGlobalPut}`);
console.log(`Inner transactions: ${result.innerTransactions}`);
console.log(`Functions found: ${result.functions.length}`);
result.functions.forEach(f => {
  console.log(`  - ${f.name} (${f.startLine}-${f.endLine}, ${f.opcodeCount} ops)`);
});