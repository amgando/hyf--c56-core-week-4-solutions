// Rule under test:
//   A new transaction never gets an id that another transaction already has.
//
// fast-check makes up 100 transactions per solution and looks for one
// that breaks the rule.

const fc = require('fast-check');
const { solutions } = require('./solutions');

// A recipe for "any transaction". fast-check builds real objects from it.
// `id` is not in requiredKeys, so some transactions have an id and some do not.
const anyTransaction = fc.record(
  {
    id: fc.integer({ min: 0, max: 50 }),
    type: fc.constantFrom('income', 'expense'),
    category: fc.constantFrom('food', 'housing', 'salary'),
    amount: fc.integer({ min: 1, max: 5000 }),
    description: fc.constantFrom('lunch', 'rent', 'pay'),
    date: fc.constant('2025-06-01'),
  },
  { requiredKeys: ['type', 'category', 'amount', 'description', 'date'] }
);

for (const { name, add, all } of solutions) {
  // The rule, as a function that returns true or false for one transaction.
  const rule = fc.property(anyTransaction, (transaction) => {
    // Collect the ids that are taken before we add anything.
    const idsBefore = [];
    for (const existing of all()) {
      idsBefore.push(existing.id);
    }

    const stored = add(transaction);

    // true = the rule held: the new id was free.
    return !idsBefore.includes(stored.id);
  });

  const result = fc.check(rule);

  if (result.failed) {
    console.log(`${name}: broken by`, result.counterexample[0]);
  } else {
    console.log(`${name}: held for ${result.numRuns} transactions`);
  }
}
