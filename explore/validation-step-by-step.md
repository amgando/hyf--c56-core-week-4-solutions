# Validation, step by step

The assignment does not ask you to check a new transaction before you add it. I wanted to know how to check that a new transaction has the same shape as the others, so I wrote a check by hand. Then I asked Claude to draw a path from that first check to [Zod](https://zod.dev/), a library that does this job, in small steps. The result is seven versions of one function. They are in [`generated/v1-with-validation`](../generated/v1-with-validation).

This page walks through the seven. Every version exports the same function with the same result:

```js
validate(tx)

{ success: true, data }      // valid: data is the transaction
{ success: false, errors }   // invalid: errors is an array of messages
```

A transaction looks like this:

```js
{
  type: 'expense',
  category: 'rent',
  amount: 1200,
  description: 'housing',
  date: '2025-03-01'
}
```

1. [Write every check by hand](#1-write-every-check-by-hand)
2. [Describe the shape as data](#2-describe-the-shape-as-data)
3. [Report every problem](#3-report-every-problem)
4. [Store a function for each field](#4-store-a-function-for-each-field)
5. [Build the functions with functions](#5-build-the-functions-with-functions)
6. [Use Zod](#6-use-zod)
7. [Use more of Zod](#7-use-more-of-zod)

The [last section](#the-seven-side-by-side) has all seven in one table.

Steps 1 to 3 stay close to the Week 4 material. Steps 4 to 7 go past it.

## 1. Write every check by hand

[`util1.js`, lines 16 to 44](../generated/v1-with-validation/util1.js#L16-L44)

```js
export function validate(tx) {
  const requiredKeys = ['type', 'category', 'amount', 'description', 'date'];

  // 1. Exactly the right number of keys? (catches extra keys)
  if (Object.keys(tx).length !== requiredKeys.length) {
    return { success: false, errors: ['wrong number of keys'] };
  }

  // 2. Every required key present? (catches missing keys)
  for (const key of requiredKeys) {
    if (!(key in tx)) {
      return { success: false, errors: [`${key}: missing`] };
    }
  }

  // 3. Values of the right type?
  if (typeof tx.amount !== 'number') return { success: false, errors: ['amount: expected number'] };
  if (typeof tx.type !== 'string') return { success: false, errors: ['type: expected string'] };
  if (typeof tx.category !== 'string') return { success: false, errors: ['category: expected string'] };
  if (typeof tx.description !== 'string') return { success: false, errors: ['description: expected string'] };
  if (typeof tx.date !== 'string') return { success: false, errors: ['date: expected string'] };

  // 4. `type` one of the allowed values?
  if (tx.type !== 'income' && tx.type !== 'expense') {
    return { success: false, errors: [`type: must be 'income' or 'expense'`] };
  }

  return { success: true, data: tx };
}
```

Four checks, in order. The function returns at the first one that fails.

<details>
<summary>What happens when you call <code>validate(null)</code>?</summary>

It throws: `TypeError: Cannot convert undefined or null to object`. `Object.keys(null)` is not allowed, and that is the first line that touches `tx`.

</details>

<details>
<summary>Is a transaction with <code>amount: NaN</code> valid here? With <code>amount: -50</code>?</summary>

Both are accepted. The only rule for `amount` is `typeof tx.amount === 'number'`, and `typeof NaN` is `'number'`.

</details>

## 2. Describe the shape as data

In `util1.js` the keys are written twice: once in `requiredKeys`, and once in the five `typeof` lines. Here they are written once, in an object.

[`util2.js`, lines 11 to 37](../generated/v1-with-validation/util2.js#L11-L37)

```js
const shape = {
  type: 'string',
  category: 'string',
  amount: 'number',
  description: 'string',
  date: 'string',
};

export function validate(tx) {
  // The key list is derived from the shape instead of written by hand.
  const requiredKeys = Object.keys(shape);

  // Same key-count check as util1 (catches extra keys).
  if (Object.keys(tx).length !== requiredKeys.length) {
    return { success: false, errors: ['wrong number of keys'] };
  }

  for (const key of requiredKeys) {
    // Missing key?
    if (!(key in tx)) return { success: false, errors: [`${key}: missing`] };

    // Wrong type? shape[key] is the expected type name, e.g. 'number'.
    // This one line replaces the five typeof lines in util1.
    if (typeof tx[key] !== shape[key]) {
      return { success: false, errors: [`${key}: expected ${shape[key]}`] };
    }
  }
```

The rules are the same as in step 1. The function accepts and rejects exactly the same transactions. What changed is where the rules are written down. An object that describes valid input has a name: a schema.

<details>
<summary>A transaction gets a sixth field, <code>currency</code>, a string. How many lines change in <code>util1.js</code>? In <code>util2.js</code>?</summary>

In `util1.js`, two: `'currency'` is added to `requiredKeys`, and a sixth `typeof` line is added.

In `util2.js`, one: `currency: 'string'` in `shape`.

</details>

## 3. Report every problem

Steps 1 and 2 stop at the first problem. You fix it, run again, and find the next one. This version keeps going and collects them.

[`util3.js`, lines 23 to 58](../generated/v1-with-validation/util3.js#L23-L58)

```js
export function validate(tx) {
  // Guard first: Object.keys() and `in` throw on null/undefined.
  if (tx === null || typeof tx !== 'object') {
    return { success: false, errors: ['not an object'] };
  }

  const errors = [];
  const requiredKeys = Object.keys(shape);

  // Missing keys and wrong types.
  for (const key of requiredKeys) {
    if (!(key in tx)) {
      errors.push(`${key}: missing`);
    } else if (typeof tx[key] !== shape[key]) {
      errors.push(`${key}: expected ${shape[key]}, got ${typeof tx[key]}`);
    }
  }

  // Extra keys. This replaces the key-count check from util1/util2,
  // and it also says which key is extra.
  for (const key of Object.keys(tx)) {
    if (!requiredKeys.includes(key)) {
      errors.push(`${key}: unexpected key`);
    }
  }

  // The enum rule still sits outside the shape.
  if (tx.type !== 'income' && tx.type !== 'expense') {
    errors.push(`type: must be 'income' or 'expense'`);
  }

  // Ternary: one result object or the other.
  return errors.length === 0
    ? { success: true, data: tx }
    : { success: false, errors };
}
```

Every `return` in the middle became an `errors.push`. There is one `return` at the end. The first lines handle `null`, so this version no longer throws.

<details>
<summary>A transaction has <code>amount: '1200'</code> and an extra key, <code>note</code>. What does step 2 report? What does step 3 report?</summary>

Step 2 reports one message, and it names neither problem:

```
wrong number of keys
```

Step 3 reports both:

```
amount: expected number, got string
note: unexpected key
```

</details>

<details>
<summary>A transaction has no <code>type</code>. Step 3 reports two messages for that one problem. Why?</summary>

```
type: missing
type: must be 'income' or 'expense'
```

The first comes from the loop over the shape. The second comes from the rule at the bottom, which is written outside the shape and runs whatever the loop found. The shape can only say `'string'` or `'number'`, so "one of these two values" has nowhere to go. Step 4 fixes that.

</details>

## 4. Store a function for each field

`typeof` can say "a string" or "a number". It cannot say "one of these two values" or "greater than zero". A function can say all of them. So each field now holds a function that takes a value and returns `true` or `false`.

[`util4.js`, lines 17 to 24](../generated/v1-with-validation/util4.js#L17-L24)

```js
const shape = {
  // Arrow function: takes v, returns the result of the comparison.
  type:        (v) => v === 'income' || v === 'expense',
  category:    (v) => typeof v === 'string' && v.length > 0,
  amount:      (v) => typeof v === 'number' && Number.isFinite(v) && v > 0,
  description: (v) => typeof v === 'string',
  date:        (v) => typeof v === 'string',
};
```

The loop takes the function out of the shape and calls it, on [lines 34 to 46](../generated/v1-with-validation/util4.js#L34-L46):

```js
    const check = shape[key];

    if (!(key in tx)) {
      errors.push(`${key}: missing`);
    } else if (!check(tx[key])) {
```

Every rule is in the shape now, and the separate rule for `type` is gone. Three transactions that steps 1 to 3 accept are rejected from here on: `amount: NaN`, `amount: -50` and `category: ''`.

A function is a value. It can be stored in an object and called later. Read more: [Arrow functions, the basics](https://javascript.info/arrow-functions-basics) on javascript.info.

<details>
<summary>This version loses something. Compare the message for <code>amount: '1200'</code> in step 3 and step 4.</summary>

```
step 3   amount: expected number, got string
step 4   amount: invalid value "1200"
```

A function that returns `true` or `false` cannot say why. Every failure gets the same message, "invalid value". Step 5 fixes that.

</details>

<details>
<summary>For <code>amount: NaN</code>, step 4 reports <code>amount: invalid value null</code>. Where does <code>null</code> come from?</summary>

The message is built with `JSON.stringify(tx[key])`, and `JSON.stringify(NaN)` is `'null'`. JSON has no way to write `NaN`.

</details>

## 5. Build the functions with functions

Two things are left to fix: the check functions repeat themselves, and they cannot explain a failure. Here each check returns `null` when the value is fine, or a message when it is not. And the checks are not written out in the shape. They are built by helper functions.

[`util5.js`, lines 31 to 39](../generated/v1-with-validation/util5.js#L31-L39)

```js
const positiveNumber = () => (v) =>
  typeof v !== 'number' || !Number.isFinite(v) ? 'expected a finite number'
  : v <= 0                                      ? 'must be greater than 0'
  : null;

// enumOf(options) "remembers" options inside the function it returns.
// That remembered variable is called a closure.
const enumOf = (options) => (v) =>
  options.includes(v) ? null : `expected one of: ${options.join(', ')}`;
```

`positiveNumber` is a function that returns a function. So is `enumOf`. With helpers like these, the schema has no logic in it:

[`util5.js`, lines 76 to 82](../generated/v1-with-validation/util5.js#L76-L82)

```js
export const Transaction = object({
  type:        enumOf(['income', 'expense']),
  category:    nonEmptyString(),
  amount:      positiveNumber(),
  description: string(),
  date:        string(),
});
```

The messages are specific again: `amount: must be greater than 0`, `category: must not be empty`.

<details>
<summary><code>enumOf(['income', 'expense'])</code> runs once, when the file loads. The function it returns runs later, once for every transaction. How does that later call still know the two options?</summary>

The returned function keeps access to `options`, the variable of the function that made it, after that function has finished. That is a closure.

Read more: [Variable scope, closure](https://javascript.info/closure) on javascript.info.

</details>

## 6. Use Zod

Put the schema from step 5 next to this one.

[`util6.js`, lines 21 to 27](../generated/v1-with-validation/util6.js#L21-L27)

```js
export const Transaction = z.strictObject({
  type:        z.enum(['income', 'expense']),
  category:    z.string().min(1),        // non-empty
  amount:      z.number().positive(),    // > 0, finite
  description: z.string(),
  date:        z.string(),
});
```

`enumOf` is `z.enum`. `positiveNumber()` is `z.number().positive()`. `object` is `z.strictObject`. The rules are the same, and this version accepts and rejects exactly the same transactions as step 5.

<details>
<summary>What was deleted between step 5 and step 6?</summary>

Lines 20 to 70 of `util5.js`: the helpers `string`, `nonEmptyString`, `positiveNumber` and `enumOf`, and the function `object` with its `safeParse` method. Zod supplies all of them. `util5.js` has 84 lines and `util6.js` has 40.

Zod is not doing anything magical. It is a carefully built version of step 5.

</details>

One difference to know about: Zod reports each problem as an object, not a string. [Lines 36 to 38](../generated/v1-with-validation/util6.js#L36-L38) turn them into `key: message` strings, so the result looks the same as in the other versions.

## 7. Use more of Zod

[`util7.js`, lines 23 to 29](../generated/v1-with-validation/util7.js#L23-L29)

```js
export const Transaction = z.strictObject({
  type:        z.enum(['income', 'expense']),
  category:    z.string().trim().min(1),
  amount:      z.number().positive(),
  description: z.string().trim().optional(),
  date:        z.iso.date(),
});
```

Three changes from step 6:

- `.trim()` removes spaces at both ends before the check. `category: '   '` is now rejected.
- `.optional()` makes `description` a field that can be left out.
- `z.iso.date()` accepts a real calendar date in the form `YYYY-MM-DD`. `'2025-02-30'` and `'01/03/2025'` are rejected.

<details>
<summary>What would it take to add "a real calendar date" to step 5?</summary>

Another helper in Part A: check that the value is a string, check the form `YYYY-MM-DD`, then check that the date exists, so that 30 February fails. Then another helper for "optional", and another for trimming.

In step 7 each of these is one call. This is the point where a library saves more work than it costs.

</details>

<details>
<summary>With <code>.trim()</code>, what is in <code>result.data</code> for <code>category: '  rent  '</code>?</summary>

`'rent'`. The data that comes out is the cleaned value, and it can differ from what went in. That is why `addTransaction` in `tracker.js` stores `result.data` and not the object it was given.

</details>

## The seven, side by side

The same 13 transactions, given to all seven versions. This is the output of `npm run compare`.

| Input | 1 | 2 | 3 | 4 | 5 | 6 | 7 |
|---|:-:|:-:|:-:|:-:|:-:|:-:|:-:|
| valid | ok | ok | ok | ok | ok | ok | ok |
| `type: 'expnse'` | FAIL | FAIL | FAIL | FAIL | FAIL | FAIL | FAIL |
| `amount: '1200'` | FAIL | FAIL | FAIL | FAIL | FAIL | FAIL | FAIL |
| extra key | FAIL | FAIL | FAIL | FAIL | FAIL | FAIL | FAIL |
| missing `date` | FAIL | FAIL | FAIL | FAIL | FAIL | FAIL | FAIL |
| missing `description` | FAIL | FAIL | FAIL | FAIL | FAIL | FAIL | ok |
| `null` | THROWS | THROWS | FAIL | FAIL | FAIL | FAIL | FAIL |
| `amount: NaN` | ok | ok | ok | FAIL | FAIL | FAIL | FAIL |
| `amount: -50` | ok | ok | ok | FAIL | FAIL | FAIL | FAIL |
| `category: ''` | ok | ok | ok | FAIL | FAIL | FAIL | FAIL |
| `category: '   '` | ok | ok | ok | ok | ok | ok | FAIL |
| `date: '2025-02-30'` | ok | ok | ok | ok | ok | ok | FAIL |
| `date: '01/03/2025'` | ok | ok | ok | ok | ok | ok | FAIL |

Read it from left to right. The results change at step 3, step 4 and step 7. Steps 2, 5 and 6 change how the code is written and leave the results as they were.

To run it:

```bash
cd generated/v1-with-validation
npm install
npm run compare
```

The output also has the messages each version produces for each input.

To use another version in the tracker, change one line, the import on [line 3 of `tracker.js`](../generated/v1-with-validation/tracker.js#L3), and run `npm start`.

<details>
<summary><code>npm start</code> adds a transaction with no <code>type</code>. What does each version say about it?</summary>

```
util1   wrong number of keys
util2   wrong number of keys
util3   type: missing | type: must be 'income' or 'expense'
util4   type: missing
util5   type: missing
util6   type: Invalid option: expected one of "income"|"expense"
util7   type: Invalid option: expected one of "income"|"expense"
```

</details>
