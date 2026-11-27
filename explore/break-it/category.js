// Rule under test:
//   getTransactionsByCategory(category) returns only transactions
//   whose category is exactly `category`.
//
// fast-check makes up random strings and looks for one that breaks the rule.

const fc = require('fast-check');
const { solutions } = require('./solutions');

// The recipe for the input: any string of 0 to 8 characters.
// 0 characters is the empty string, ''.
const anyCategory = fc.string({ maxLength: 8 });

// JSON.stringify puts quotes around a string, so '' is printed as "".
const show = (value) => JSON.stringify(value);

console.log(`
Rule
  getTransactionsByCategory(category) returns only transactions
  whose category is exactly \`category\`.

Inputs
  Random strings of 0 to 8 characters, made up by fast-check.
  Up to 100 per solution. They are different every time you run this.
  Twelve of them, as an example:
  ${fc.sample(anyCategory, 12).map(show).join('  ')}

Results`);

for (const { name, all, byCategory } of solutions) {
  // The rule, as a function that returns true or false for one string.
  const rule = fc.property(anyCategory, (category) => {
    for (const transaction of byCategory(category)) {
      if (transaction.category !== category) {
        return false; // the rule is broken
      }
    }
    return true; // the rule held
  });

  // Try up to 100 strings. Stop at the first one that breaks the rule.
  // verbose: 1 makes fast-check remember every string that broke it.
  const result = fc.check(rule, { numRuns: 100, verbose: 1 });

  if (!result.failed) {
    console.log(`  ${name}: held for all ${result.numRuns} strings`);
    continue;
  }

  const first = result.failures[0][0];
  const smallest = result.counterexample[0];
  const returned = byCategory(smallest).length;

  console.log(`  ${name}: broken by string number ${result.numRuns}`);
  if (first !== smallest) {
    console.log(`      first string that broke it      ${show(first)}`);
  }
  console.log(`      smallest string that breaks it  ${show(smallest)}`);
  console.log(`      getTransactionsByCategory(${show(smallest)}) returned ${returned} of ${all().length} transactions`);
}

console.log('');
