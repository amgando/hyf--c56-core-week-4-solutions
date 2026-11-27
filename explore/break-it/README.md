# Break it

When you test your own code, you try the inputs you thought of. A bug can be in an input you did not think of.

There is a kind of tool that makes up the inputs for you and looks for one that breaks your code. The technique is called property-based testing. Fuzzing is a close relative. This folder uses a library for it: [fast-check](https://fast-check.dev/).

You give it two things:

1. A recipe for the input: "any transaction", "any string".
2. A rule that must hold for every input: "a new transaction never gets an id that is already taken".

It makes up inputs from the recipe, one after another, and checks the rule for each. It stops at the first input that breaks the rule and shows it to you.

## Run

```bash
cd explore/break-it
npm install
npm run ids
npm run category
```

Four of the ten solutions are tested: Claude, Grok, GLM and Gemini. [`solutions.js`](solutions.js) says why these four.

## The inputs

### Which inputs?

Random ones, built from the recipe. The recipe "any string of 0 to 8 characters" gives strings like these:

```
"ref"  "IB^Kb'"  "valueOf"  ""  "5uF"  "name"  "P&eO&ref"  "c"  "`*F@^"  "{ nd"  "\"ENW*9oU"  "k"
```

Each script prints a few of its inputs before the results, so you can see them.

### Are they the same every time?

No. Every run makes up new ones. Run a script twice and the examples differ.

### Are they only random?

Mostly. fast-check also mixes in values that often cause trouble, such as the empty string `""` and words that mean something to JavaScript, like `valueOf`. Both are in the line above.

### Why 100?

It is the number fast-check tries when you do not give one. The scripts set it in one place, `numRuns: 100`. Change it to `1000` and run again.

### Does it try all 100?

Only when the rule holds. It stops at the first input that breaks the rule. The output says which one that was: "broken by string number 5".

## Rule 1: ids are unique

> A new transaction never gets an id that another transaction already has.

The whole test is in [`unique-ids.js`](unique-ids.js). The recipe for "any transaction":

```js
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
```

Read it as: the id is any whole number from 0 to 50, the type is one of these two words, the amount is any whole number from 1 to 5000. `id` is not in `requiredKeys`, so some of the made-up transactions have an id and some do not.

The rule:

```js
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
```

Which of the four do you expect to break?

<details>
<summary>What <code>npm run ids</code> prints</summary>

Your transactions and numbers will differ. The four results will not.

```
Rule
  A new transaction never gets an id that another transaction already has.

Inputs
  Random transactions, made up by fast-check. Some have an id, some do not.
  Up to 100 per solution. They are different every time you run this.
  Four of them, as an example:
  {"id":35,"type":"income","category":"food","amount":2151,"description":"lunch","date":"2025-06-01"}
  {"id":44,"type":"expense","category":"food","amount":11,"description":"lunch","date":"2025-06-01"}
  {"id":29,"type":"income","category":"food","amount":2645,"description":"pay","date":"2025-06-01"}
  {"id":49,"type":"income","category":"food","amount":13,"description":"lunch","date":"2025-06-01"}

Results
  Claude: held for all 100 transactions
  Grok: broken by transaction number 1
      first transaction that broke it
      {"id":4,"type":"expense","category":"salary","amount":2509,"description":"lunch","date":"2025-06-01"}
      smallest transaction that breaks it
      {"id":0,"type":"income","category":"food","amount":1,"description":"lunch","date":"2025-06-01"}
      id 0 was already taken
  GLM: broken by transaction number 1
      first transaction that broke it
      {"id":2,"type":"expense","category":"housing","amount":4918,"description":"rent","date":"2025-06-01"}
      smallest transaction that breaks it
      {"id":1,"type":"income","category":"food","amount":1,"description":"lunch","date":"2025-06-01"}
      id 1 was already taken
  Gemini: broken by transaction number 1
      first transaction that broke it
      {"id":4,"type":"expense","category":"food","amount":4990,"description":"rent","date":"2025-06-01"}
      smallest transaction that breaks it
      {"id":0,"type":"income","category":"food","amount":1,"description":"lunch","date":"2025-06-01"}
      id 0 was already taken
```

Claude always sets the id itself. Grok, GLM and Gemini keep an id that comes in with the transaction and do not check whether it is taken. [One function, ten ways](../one-function-ten-ways.md) shows the lines.

</details>

<details>
<summary>The output has a "first" and a "smallest" transaction. What is the difference?</summary>

The first one is the random transaction that broke the rule: `id: 4`, an expense, `amount: 2509`.

fast-check then makes it smaller, one field at a time, and keeps every change that still breaks the rule. What is left is the smallest transaction that breaks it: `amount: 1`, the first type, the first category. This is called shrinking.

It tells you what matters. The amount, the type and the category went down to their lowest or first value, so they have nothing to do with the bug. The `id` is the field that could not be removed.

</details>

<details>
<summary>No solution starts with a transaction that has id <code>0</code>. How can <code>id: 0</code> be taken in Grok and Gemini?</summary>

An earlier made-up transaction with `id: 0` was stored first: one of the random ones, or one that fast-check tried while shrinking. Grok and Gemini kept that id. The next transaction with `id: 0` found it taken.

</details>

<details>
<summary>GLM breaks at <code>id: 1</code>, not at <code>id: 0</code>. Why?</summary>

GLM sets the id with `newTransaction.id || highestId + 1`. `0` is falsy, so `||` replaces it with a generated id, and a transaction with `id: 0` never collides. `1` is the smallest id that GLM keeps, and its starting data already has a transaction with id `1`.

</details>

## Rule 2: the category filter is exact

> `getTransactionsByCategory(category)` returns only transactions whose category is exactly `category`.

The recipe is "any string of 0 to 8 characters". The rule is a loop. Write it yourself, or read [`category.js`](category.js).

<details>
<summary>The test</summary>

```js
const anyCategory = fc.string({ maxLength: 8 });

const rule = fc.property(anyCategory, (category) => {
  for (const transaction of byCategory(category)) {
    if (transaction.category !== category) {
      return false; // the rule is broken
    }
  }
  return true; // the rule held
});
```

</details>

<details>
<summary>What <code>npm run category</code> prints</summary>

Your strings and numbers will differ. The four results will not.

```
Rule
  getTransactionsByCategory(category) returns only transactions
  whose category is exactly `category`.

Inputs
  Random strings of 0 to 8 characters, made up by fast-check.
  Up to 100 per solution. They are different every time you run this.
  Twelve of them, as an example:
  "ref"  "IB^Kb'"  "valueOf"  ""  "5uF"  "name"  "P&eO&ref"  "c"  "`*F@^"  "{ nd"  "\"ENW*9oU"  "k"

Results
  Claude: held for all 100 strings
  Grok: broken by string number 6
      smallest string that breaks it  ""
      getTransactionsByCategory("") returned 23 of 23 transactions
  GLM: broken by string number 5
      first string that broke it      "c"
      smallest string that breaks it  ""
      getTransactionsByCategory("") returned 8 of 8 transactions
  Gemini: held for all 100 strings
```

</details>

<details>
<summary>Why does <code>"c"</code> break GLM? Why does <code>""</code>?</summary>

GLM and Grok use `includes` on the category. `"c"` is inside `"side-income"`, so asking for the category `"c"` returns transactions whose category is not `"c"`.

fast-check then shrank `"c"` to the empty string. Every string includes the empty string: `'food'.includes('')` is `true`. So asking for the category `""` returns every transaction, 8 of 8.

The comparison table in the root README describes this bug as "`food` also matches `seafood`". That is the example a person thinks of. The tool found a smaller one.

</details>

## What this does and does not show

100 inputs with no failure is not proof that the rule always holds.

One input that breaks the rule is proof that it does not, and you have that input to try again.

Read more: [What is property-based testing?](https://fast-check.dev/docs/introduction/what-is-property-based-testing/) in the fast-check documentation.
