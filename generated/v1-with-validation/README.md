# Validating a transaction, seven ways

I wrote this income and expense tracker by hand, as my solution to the Week 4 assignment in [`../../notion.md`](../../notion.md). The tracker is the same as [`handwritten/v1`](../../handwritten/v1), with one addition: `addTransaction` validates each new transaction.

That addition started with a simple question: how do I check that a new transaction has the same shape as the examples in `transactions.js`? I wrote a simple validation by hand. Then I asked Claude to draw a path from that first draft to the Zod schema library, in several sensible steps, so that someone can follow the logic of how a library like Zod comes to exist. Over two or three more passes with Claude, we cleaned up the versions so that they all share one interface and report errors the same way. The result is seven versions of the same validator, from hand-written checks to Zod.

Each version is a small step from the one before it. The goal is to show where the concepts behind a validation library come from, and the point at which using a library becomes worth it.

## The problem

A transaction looks like this:

```javascript
{
  type: 'expense',
  category: 'rent',
  amount: 1200,
  description: 'housing',
  date: '2025-03-01'
}
```

A new transaction is valid when it:

- has exactly these five keys, with none missing and none extra
- has values of the right type
- has a `type` of either `'income'` or `'expense'`

Later versions add stricter rules, such as a positive amount and a real calendar date.

## The files

Every `utilN.js` file exports the same function, `validate(tx)`, with the same result:

```javascript
{ success: true, data }      // valid: data is the transaction
{ success: false, errors }   // invalid: errors is an array of messages
```

Because the interface never changes, switching versions is a one-line change to the import in `tracker.js` (and in `index.js`, which prints the errors):

```javascript
import { validate } from './util1.js';   // change to util2.js, util3.js, ...
```

`addTransaction` in `tracker.js` calls `validate`, returns `-1` when `success` is `false`, and otherwise stores `data` with a new `id`. Because `util7` makes `description` optional, the tracker prints the description in brackets only when there is one.

| File | Concept introduced | What changes |
|---|---|---|
| `util1.js` | Explicit checks with `in`, `typeof` and early `return` | Starting point. Stops at the first problem, so `errors` has one message. Throws on `null`. |
| `util2.js` | The shape described as data in one object | Same rules as util1, with less repetition. Still stops at the first problem. |
| `util3.js` | Collecting every problem instead of returning early | Reports every problem at once. Names the extra key. Handles `null`. |
| `util4.js` | Functions stored as values (check functions) | All rules live in the shape. Rejects `NaN`, negative amounts and an empty category. |
| `util5.js` | Functions that return functions (closures) | A small homemade version of Zod with specific error messages. |
| `util6.js` | Zod | Same rules as util5. The schema reads almost line for line the same. |
| `util7.js` | Zod's built-in rules | Real date checking, an optional description and trimmed strings. |

Each file begins with a comment header describing what it introduces and how its behaviour differs from the previous version.

## Running the tracker

```bash
npm install
npm start
```

`npm start` runs `index.js`. It adds a valid transaction and prints the summary. It then adds an invalid transaction (the `type` key is missing), prints the errors from `validate`, and throws `Invalid Tx`. The error at the end is expected: it shows an invalid transaction being rejected.

## Comparing the versions

`compare.js` runs every version against the same set of inputs: valid data, a misspelled type, wrong types, extra and missing keys, `null`, `NaN`, negative amounts, empty or blank strings and impossible dates.

```bash
npm install
npm run compare
```

The output has two parts: a table showing which inputs each version accepts or rejects, followed by the error messages each version produces. Reading the table from left to right shows the rules tightening step by step.

## What the progression shows

- **util1 to util2:** describing the rules as data removes repetition and makes new fields cheap to add.
- **util2 to util3:** stopping at the first problem means fixing one thing per run. Collecting every problem reports everything at once.
- **util3 to util4:** `typeof` cannot express rules like "one of these values" or "greater than zero". Storing a function per field can.
- **util4 to util5:** functions that build check functions remove repetition and give each rule its own error message. The schema itself now contains no logic.
- **util5 to util6:** the homemade machinery and Zod have nearly the same shape. Zod is not doing anything magical. It is a carefully built version of util5.
- **util6 to util7:** every new rule (date formats, optional fields, trimming) would need another helper in util5. This is the point where a library saves more work than it costs.

## Requirements

- Node.js 22 or later
- `chalk` (version 4) for the coloured output in `tracker.js`.
- `zod` (version 4) for `util6.js` and `util7.js`. The other versions have no dependencies.
