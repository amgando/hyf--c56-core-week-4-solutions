// Rule under test:
//   getTransactionsByCategory(category) returns only transactions
//   whose category is exactly `category`.
//
// fast-check makes up 100 strings per solution and looks for one
// that breaks the rule.

const fc = require('fast-check');
const { solutions } = require('./solutions');

// Any string, up to 8 characters. That includes the empty string.
const anyCategory = fc.string({ maxLength: 8 });

for (const { name, byCategory } of solutions) {
  const rule = fc.property(anyCategory, (category) => {
    for (const transaction of byCategory(category)) {
      if (transaction.category !== category) {
        return false; // the rule is broken
      }
    }
    return true; // the rule held
  });

  const result = fc.check(rule);

  if (result.failed) {
    console.log(`${name}: broken by`, JSON.stringify(result.counterexample[0]));
  } else {
    console.log(`${name}: held for ${result.numRuns} strings`);
  }
}
