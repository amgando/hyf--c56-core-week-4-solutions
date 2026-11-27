# Scavenger hunt

Eight things to find in the ten solutions. Each one has a hint and an answer, folded shut. Go and look first, or open them and read along.

Search across files in your editor is the tool for this.

## 1. The only tests

One of the ten solutions comes with automated tests. Find it and run them.

<details>
<summary>Hint</summary>

Look for a folder that the other nine don't have.

</details>

<details>
<summary>Answer</summary>

[`generated/openai-astra-62/test/tracker.test.js`](../generated/openai-astra-62/test/tracker.test.js). Four tests. Run them with `npm test` inside `generated/openai-astra-62`.

</details>

## 2. Three loops in one file

Find one file that uses a `for` loop, a `for...of` loop and a `while` loop.

<details>
<summary>Hint</summary>

The comparison table in the [root README](../README.md#comparison-against-the-assignment) has a row called "Loop types".

</details>

<details>
<summary>Answer</summary>

Several files do. One of them is `generated/google-gemini-4-neon/src/finance.js`:

- `for...of` on [line 75](../generated/google-gemini-4-neon/src/finance.js#L75)
- `for` on [line 91](../generated/google-gemini-4-neon/src/finance.js#L91)
- `while` on [line 342](../generated/google-gemini-4-neon/src/finance.js#L342)

`getTotalIncome` and `getTotalExpenses` do the same job with two different loops. Compare lines 72 to 98.

</details>

## 3. `for...in`

Only one solution uses `for...in`. It uses it three times. Find all three.

<details>
<summary>Hint</summary>

`for...in` walks over the keys of an object. Look where a solution prints results grouped by month or by category.

</details>

<details>
<summary>Answer</summary>

`generated/claude-opus-5.5`:

- [`src/finance.js` line 141](../generated/claude-opus-5.5/src/finance.js#L141)
- [`src/app.js` line 50](../generated/claude-opus-5.5/src/app.js#L50)
- [`src/app.js` line 59](../generated/claude-opus-5.5/src/app.js#L59)

</details>

## 4. Destructuring in a loop header

Find a `for...of` loop that takes each transaction apart in its first line, before the loop body starts.

<details>
<summary>Hint</summary>

Search for `for (const {`.

</details>

<details>
<summary>Answer</summary>

[`generated/moonshot-kimi-k3.1-pro/src/financeTracker.js` line 21](../generated/moonshot-kimi-k3.1-pro/src/financeTracker.js#L21):

```js
for (const { type, amount } of transactions) {
```

Claude and OpenAI do the same: [`claude-opus-5.5/src/finance.js` line 34](../generated/claude-opus-5.5/src/finance.js#L34), [`openai-astra-62/src/tracker.js` line 163](../generated/openai-astra-62/src/tracker.js#L163).

</details>

## 5. Spread, twice

Find an `addTransaction` that uses the spread operator on an object and on an array.

<details>
<summary>Hint</summary>

Look for three dots, twice, a few lines apart.

</details>

<details>
<summary>Answer</summary>

[`generated/google-gemini-4-neon/src/finance.js` lines 59 to 64](../generated/google-gemini-4-neon/src/finance.js#L59-L64):

```js
const createdTransaction = {
  id: getNextTransactionId(),
  ...newTransaction,
};

transactions = [...transactions, createdTransaction];
```

The first spread copies the properties of an object into a new object. The second copies the items of an array into a new array.

</details>

## 6. The red balance

The assignment asks for the balance in cyan, or in red when it is negative. Find the line that makes that decision in three solutions.

<details>
<summary>Hint</summary>

Search for `chalk.red`.

</details>

<details>
<summary>Answer</summary>

All ten have one. Three of them:

- [`handwritten/v1/tracker.js` line 115](../handwritten/v1/tracker.js#L115)
- [`generated/deepseek-v4-pro/src/index.js` line 96](../generated/deepseek-v4-pro/src/index.js#L96)
- [`generated/claude-opus-5.5/src/display.js` line 46](../generated/claude-opus-5.5/src/display.js#L46)

They are written in two ways. v1 chooses between two results:

```js
output >= 0 ? chalk.cyan(output) : chalk.red(output)
```

DeepSeek and Claude choose between two functions, and call the chosen one later:

```js
const balanceColor = balance < 0 ? chalk.red : chalk.cyan;
```

</details>

## 7. `food` and `seafood`

In two solutions, asking for the category `food` also returns a transaction with the category `seafood`. Find them.

<details>
<summary>Hint</summary>

Read `getTransactionsByCategory` in each solution. Look at how it compares the two strings.

</details>

<details>
<summary>Answer</summary>

- [`generated/x-grok-47/src/tracker.js` line 93](../generated/x-grok-47/src/tracker.js#L93)
- [`generated/zai-glm-5.3/src/finance.js` line 101](../generated/zai-glm-5.3/src/finance.js#L101)

Both use `includes` on a string. `'seafood'.includes('food')` is `true`. The other eight compare with `===`.

</details>

## 8. Written, never run

In three solutions, `addTransaction` exists and `npm start` never calls it. Find them.

<details>
<summary>Hint</summary>

Search for `addTransaction(`. Leave out the line that defines the function, and count what is left.

</details>

<details>
<summary>Answer</summary>

- `handwritten/v1`. The call is there, commented out: [`index.js` line 5](../handwritten/v1/index.js#L5).
- `generated/deepseek-v4-pro`. Defined on [line 5 of `src/index.js`](../generated/deepseek-v4-pro/src/index.js#L5), never called.
- `generated/qwen-3.8-2.4t`. Defined on [line 5 of `src/index.js`](../generated/qwen-3.8-2.4t/src/index.js#L5), never called.

A function that is never called has never been run. To see whether it works, call it once and look at what it prints.

</details>
