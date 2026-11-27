# Where the assignment was unclear

The assignment left some decisions open. Each solution had to make them, and they explain several differences in the [comparison table](../README.md#comparison-against-the-assignment).

Five of them are here. Each one has what the assignment says, a question, and what the ten solutions did, folded shut.

## 1. The transaction line

The sample object in the assignment:

```js
{
  id: 1,
  type: 'income',
  category: 'salary',
  amount: 3000,
  description: 'Monthly salary',
  date: '2025-01-15'
}
```

The example output in the assignment:

```
1. [INCOME] Salary - €3000 (salary)
```

Which field is printed first, and which goes in the brackets? Is the date printed?

<details>
<summary>What the ten did</summary>

The example cannot be produced from the sample object. `Salary` with a capital is the category. `(salary)` in the brackets is also the category. `Monthly salary`, the description, is not in the line at all.

Two readings came out of that:

```
v1        1. [INCOME] Salary - €3000 (Monthly salary)
Claude    1. [INCOME] Monthly salary - €3000 (salary)
```

v1 and v1 with validation print the category first and the description in the brackets. The eight model solutions print the description first and the category in the brackets.

Three of the eight add things the example does not have:

```
Gemini    1. [INCOME] Monthly salary - €3000 (salary) [2025-01-15]
Kimi      1. [INCOME] January salary - €3,000.00 (salary) 2025-01-15
OpenAI    1. [INCOME] March pay - €2,400.00 (salary) · 2025-03-01
```

</details>

## 2. `getLargestExpense`

Under "Required Functions" the assignment says:

> `getLargestExpense()` - Find highest expense amount

Under "Summary Report" it says:

> Largest expense with description

What does the function return: an amount, a description, or something else?

<details>
<summary>What the ten did</summary>

v1 and v1 with validation return a string that is ready to print, colour included:

```
Bills - €2000 (Some other bill)
```

The eight model solutions return the whole transaction object, and another function prints it.

A string can be printed. An object can be printed, compared, tested, or used in a different report.

</details>

## 3. `getTransactionsByCategory`

The assignment says:

> `getTransactionsByCategory(category)` - Filter transactions (use loop + push or indexOf/includes)

`includes` exists on arrays and on strings. Which one does the hint mean?

<details>
<summary>What the ten did</summary>

Eight compare the two category names with `===`.

Grok and GLM call `includes` on the category string:

```js
if (transactionCategory.toLowerCase().includes(needle)) {
```

On an array, `includes` answers "is this item in the list?". On a string, it answers "is this text inside that text?". `'seafood'.includes('food')` is `true`, so asking for `food` also returns every `seafood` transaction.

</details>

## 4. `addTransaction`

The assignment says:

> `addTransaction(newTransaction)` - Add new transaction to array

Who sets the `id` of the new transaction? Is the transaction checked before it is added?

<details>
<summary>What the ten did</summary>

- Two set no id.
- Three set a new id and replace one the caller gave.
- One sets a new id and rejects a transaction that arrives with one.
- Three keep the caller's id without checking that it is free.
- One keeps the caller's id only when it is free.
- Three check the transaction before adding it.

[One function, ten ways](one-function-ten-ways.md) goes through all ten.

</details>

## 5. "Using a loop"

The assignment says:

> `getTotalIncome()` - Sum all income using a loop

and, under "Code Quality":

> Use appropriate loop types (`for`, `for...of`, `while`)

v1 does it this way ([`handwritten/v1/tracker.js`, lines 33 to 35](../handwritten/v1/tracker.js#L33-L35)):

```js
export function getTotalIncome() {
  return transactions.reduce((income, tx) => tx.type === 'income' ? income + tx.amount : income, 0)
}
```

Gemini does it this way ([`generated/google-gemini-4-neon/src/finance.js`, lines 72 to 82](../generated/google-gemini-4-neon/src/finance.js#L72-L82)):

```js
function getTotalIncome() {
  let totalIncome = 0;

  for (const transaction of transactions) {
    if (transaction.type === 'income') {
      totalIncome += transaction.amount;
    }
  }

  return totalIncome;
}
```

Is `reduce` a loop?

<details>
<summary>One answer</summary>

`reduce` visits every item of the array once, in order, and carries a running value from one item to the next. The `for...of` version does the same thing with `totalIncome`. Both return the same total.

The loop is inside `reduce`, where you do not write it. Whether that is "using a loop" depends on what the assignment wants you to practise. If it is writing the loop yourself, `for...of` is the answer, and the comparison table marks v1 with ✗ on that row for this reason.

Read more: [`reduce`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reduce) on MDN.

</details>

## What to do with an unclear requirement

On a team, each of these five is a question for the person who wrote the assignment, asked before you build.
