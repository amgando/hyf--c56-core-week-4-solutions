// Rule under test:
//   A new transaction never gets an id that another transaction already has.
//
// fast-check makes up random transactions and looks for one that breaks the rule.

const fc = require('fast-check');
const { solutions } = require('./solutions');

// The recipe for the input: any transaction.
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

// JSON.stringify prints an object on one line.
const show = (value) => JSON.stringify(value);

console.log(`
Rule
  A new transaction never gets an id that another transaction already has.

Inputs
  Random transactions, made up by fast-check. Some have an id, some do not.
  Up to 100 per solution. They are different every time you run this.
  Four of them, as an example:
  ${fc.sample(anyTransaction, 4).map(show).join('\n  ')}

Results`);

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

  // Try up to 100 transactions. Stop at the first one that breaks the rule.
  // verbose: 1 makes fast-check remember every transaction that broke it.
  const result = fc.check(rule, { numRuns: 100, verbose: 1 });

  if (!result.failed) {
    console.log(`  ${name}: held for all ${result.numRuns} transactions`);
    continue;
  }

  const first = result.failures[0][0];
  const smallest = result.counterexample[0];

  console.log(`  ${name}: broken by transaction number ${result.numRuns}`);
  console.log(`      first transaction that broke it`);
  console.log(`      ${show(first)}`);
  console.log(`      smallest transaction that breaks it`);
  console.log(`      ${show(smallest)}`);
  console.log(`      id ${smallest.id} was already taken`);
}

console.log('');
