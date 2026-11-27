# Break it

When you test your own code, you try the inputs you thought of. A bug can be in an input you did not think of.

There is a kind of tool that makes up the inputs for you, hundreds of them, and looks for one that breaks your code. The technique is called property-based testing. Fuzzing is a close relative. This folder uses a library for it: [fast-check](https://fast-check.dev/).

You give it two things:

1. A recipe for the input: "any transaction", "any string".
2. A rule that must hold for every input: "a new transaction never gets an id that is already taken".

It tries 100 inputs. If one breaks the rule, it shows you that input.

## Run

```bash
cd explore/break-it
npm install
npm run ids
npm run category
```

Four of the ten solutions are tested: Claude, Grok, GLM and Gemini. [`solutions.js`](solutions.js) says why these four.

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

`id` is not in `requiredKeys`, so some of the made-up transactions have an id and some do not.

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

```
Claude: held for 100 transactions
Grok: broken by {
  id: 0,
  type: 'income',
  category: 'food',
  amount: 1,
  description: 'lunch',
  date: '2025-06-01'
}
GLM: broken by {
  id: 1,
  type: 'income',
  category: 'food',
  amount: 1,
  description: 'lunch',
  date: '2025-06-01'
}
Gemini: broken by {
  id: 0,
  type: 'income',
  category: 'food',
  amount: 1,
  description: 'lunch',
  date: '2025-06-01'
}
```

Claude always sets the id itself. Grok, GLM and Gemini keep an id that comes in with the transaction and do not check whether it is taken. [One function, ten ways](../one-function-ten-ways.md) shows the lines.

</details>

<details>
<summary>Every broken transaction has <code>amount: 1</code>, <code>'income'</code>, <code>'food'</code> and <code>'lunch'</code>. Why so tidy?</summary>

The first transaction that broke the rule was a random one. fast-check then made it smaller, one field at a time, and kept every change that still broke the rule. What is left is the smallest transaction that breaks it. This is called shrinking.

It tells you what matters. The amount, the type and the category went down to their first or lowest value, so they have nothing to do with the bug. The `id` is the field that could not be removed.

</details>

<details>
<summary>No solution starts with a transaction that has id <code>0</code>. How can <code>id: 0</code> be taken in Grok and Gemini?</summary>

An earlier made-up transaction with `id: 0` was added in the same run. Grok and Gemini stored it with that id. The next one with `id: 0` found it taken.

</details>

<details>
<summary>GLM breaks at <code>id: 1</code>, not at <code>id: 0</code>. Why?</summary>

GLM sets the id with `newTransaction.id || highestId + 1`. `0` is falsy, so `||` replaces it with a generated id, and a transaction with `id: 0` never collides. `1` is the smallest id that GLM keeps, and its starting data already has a transaction with id `1`.

</details>

## Rule 2: the category filter is exact

> `getTransactionsByCategory(category)` returns only transactions whose category is exactly `category`.

The recipe is "any string, up to 8 characters". The rule is a loop. Write it yourself, or read [`category.js`](category.js).

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

```
Claude: held for 100 strings
Grok: broken by ""
GLM: broken by ""
Gemini: held for 100 strings
```

The input that breaks Grok and GLM is the empty string. Both use `includes` on the category, and every string includes the empty string: `'food'.includes('')` is `true`. So asking for the category `''` returns every transaction.

The comparison table in the root README describes this bug as "`food` also matches `seafood`". That is the example a person thinks of. The tool found a smaller one.

</details>

## What this does and does not show

100 inputs with no failure is not proof that the rule always holds.

One input that breaks the rule is proof that it does not, and you have that input to try again.

Read more: [What is property-based testing?](https://fast-check.dev/docs/introduction/what-is-property-based-testing/) in the fast-check documentation.
