// compare.js — Run every util against the same inputs
//
// Usage:   node compare.js
// Every util exports validate(tx). This prints a table of results
// (one column per util), then the error messages each util produces.
// util6/util7 are skipped with a note if Zod is not installed.

const files = ['util1', 'util2', 'util3', 'util4', 'util5', 'util6', 'util7'];

const good = {
  type: 'expense',
  category: 'rent',
  amount: 1200,
  description: 'housing',
  date: '2025-03-01',
};
const { date, ...noDate } = good;
const { description, ...noDescription } = good;

// Each case: a label and an input. Spread (...good) copies the valid
// object, and the key after it overrides one field.
const cases = [
  ['valid',                good],
  ['bad enum value',       { ...good, type: 'expnse' }],
  ['amount as string',     { ...good, amount: '1200' }],
  ['extra key',            { ...good, note: 'x' }],
  ['missing date',         noDate],
  ['missing description',  noDescription],
  ['null',                 null],
  ['amount NaN',           { ...good, amount: NaN }],
  ['negative amount',      { ...good, amount: -50 }],
  ['empty category',       { ...good, category: '' }],
  ['whitespace category',  { ...good, category: '   ' }],
  ['impossible date',      { ...good, date: '2025-02-30' }],
  ['date wrong format',    { ...good, date: '01/03/2025' }],
];

// Load each util. A failed import (e.g. Zod missing) is recorded, not fatal.
const utils = [];
for (const name of files) {
  try {
    utils.push({ name, mod: await import(`./${name}.js`) });
  } catch (err) {
    console.log(`${name}: not loaded (${err.code ?? err.message})`);
  }
}

// Run validate; record a thrown error instead of crashing.
function run(validate, input) {
  try {
    return validate(input);
  } catch (err) {
    return { threw: true, errors: [`throws ${err.name}`] };
  }
}

// Run every util against every input once.
const results = {};
for (const [label, input] of cases) {
  results[label] = {};
  for (const { name, mod } of utils) {
    results[label][name] = run(mod.validate, input);
  }
}

// --- Table: accepted or rejected ---
const table = {};
for (const [label] of cases) {
  table[label] = {};
  for (const { name } of utils) {
    const result = results[label][name];
    table[label][name] = result.threw ? 'THROWS' : result.success ? 'ok' : 'FAIL';
  }
}
console.log('\nvalidate() per util (ok = accepted, FAIL = rejected)');
console.table(table);

// --- Error messages per util ---
for (const { name } of utils) {
  console.log(`\n=== ${name} errors ===`);
  for (const [label] of cases) {
    const result = results[label][name];
    const text = result.success ? 'ok' : result.errors.join(' | ');
    console.log(`${label.padEnd(20)} ${text}`);
  }
}
