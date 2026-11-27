# One function, ten ways

The assignment says two things about `addTransaction`: "Add new transaction to array" and "Use spread operator when adding transactions". Everything else was a decision, and the ten solutions decided differently.

They are in four groups here. Each group answers one more question than the group before it.

1. [Just add it](#1-just-add-it)
2. [Give it an id](#2-give-it-an-id)
3. [What if it already has an id?](#3-what-if-it-already-has-an-id)
4. [Check it first](#4-check-it-first)

The [last section](#the-ten-side-by-side) has all ten in one table.

## 1. Just add it

### Qwen

[`generated/qwen-3.8-2.4t/src/index.js`, lines 5 to 8](../generated/qwen-3.8-2.4t/src/index.js#L5-L8)

```js
function addTransaction(newTransaction) {
  transactions = [...transactions, newTransaction];
  return newTransaction;
}
```

Spread builds a new array: every item of the old one, then the new transaction. `transactions` now points to the new array.

### Kimi

[`generated/moonshot-kimi-k3.1-pro/src/financeTracker.js`, lines 11 to 16](../generated/moonshot-kimi-k3.1-pro/src/financeTracker.js#L11-L16)

```js
function addTransaction(newTransaction) {
  // Store a new object so the original input object is not inserted directly.
  const transactionToAdd = { ...newTransaction };
  transactions.push(transactionToAdd);
  return transactionToAdd;
}
```

Here spread copies the object, and `push` adds the copy to the same array.

<details>
<summary>What id does a new transaction get from these two?</summary>

The one the caller put on it, or none. Neither function sets an id. Two transactions can have the same id, and a transaction can have no id at all.

</details>

<details>
<summary>After adding a transaction, the caller changes the object it passed in. What happens to the stored transaction?</summary>

In Qwen it changes too. The array is new, and the object in it is the caller's object.

In Kimi nothing happens. The array holds a copy.

</details>

## 2. Give it an id

### DeepSeek

[`generated/deepseek-v4-pro/src/index.js`, lines 5 to 9](../generated/deepseek-v4-pro/src/index.js#L5-L9)

```js
function addTransaction(newTransaction) {
  const nextId =
    transactions.length > 0 ? transactions[transactions.length - 1].id + 1 : 1;
  transactions.push({ ...newTransaction, id: nextId });
}
```

The new id is the id of the last transaction, plus one.

<details>
<summary>When does this give an id that is already taken?</summary>

When the last transaction is not the one with the highest id. With ids `3, 1, 2` in the array, the new id is `2 + 1`, and `3` is taken.

</details>

### v1

[`handwritten/v1/tracker.js`, lines 24 to 27](../handwritten/v1/tracker.js#L24-L27)

```js
export function addTransaction(newTransaction) {
  const newMaxId = Math.max(0, ...transactions.map(tx => tx.id)) + 1
  return transactions.push({ ...newTransaction, id: newMaxId })
}
```

The new id is the highest id in the array, plus one. The order of the array does not matter.

<details>
<summary>What is the <code>0</code> in <code>Math.max(0, ...)</code> for?</summary>

The empty array. `Math.max()` with no arguments returns `-Infinity`. With the `0`, an empty array gives `0`, and the first transaction gets id `1`.

</details>

### Claude

[`generated/claude-opus-5.5/src/finance.js`, lines 6 to 18](../generated/claude-opus-5.5/src/finance.js#L6-L18)

```js
function addTransaction(newTransaction) {
  let highestId = 0;
  for (const transaction of transactions) {
    if (transaction.id > highestId) {
      highestId = transaction.id;
    }
  }

  // Spread copies the caller's object, so later changes to it do not leak in.
  const transactionToAdd = { ...newTransaction, id: highestId + 1 };
  transactions.push(transactionToAdd);
  return transactionToAdd;
}
```

The same rule as v1, highest id plus one, written as a `for...of` loop.

In all three, `id` comes after the spread. If the caller's object already has an id, the generated one replaces it.

## 3. What if it already has an id?

### Grok

[`generated/x-grok-47/src/tracker.js`, lines 21 to 29](../generated/x-grok-47/src/tracker.js#L21-L29). `createNextId` is on [lines 9 to 19](../generated/x-grok-47/src/tracker.js#L9-L19): highest id plus one.

```js
function addTransaction(newTransaction) {
  const storedTransaction = {
    ...newTransaction,
    id: newTransaction.id ?? createNextId()
  };

  transactions.push(storedTransaction);
  return { ...storedTransaction };
}
```

### GLM

[`generated/zai-glm-5.3/src/finance.js`, lines 20 to 39](../generated/zai-glm-5.3/src/finance.js#L20-L39)

```js
function addTransaction(newTransaction) {
  // Find the highest id that is currently in use
  let highestId = 0;
  for (const transaction of transactions) {
    if (transaction.id > highestId) {
      highestId = transaction.id;
    }
  }

  // Copy the new transaction with the spread operator and give it an id
  const transactionToAdd = {
    ...newTransaction,
    id: newTransaction.id || highestId + 1,
  };

  // Copy the whole array as well: the old array is left untouched
  transactions = [...transactions, transactionToAdd];

  return transactionToAdd;
}
```

Both keep the caller's id when there is one, and generate an id when there is none. Neither checks whether the caller's id is already in the array.

<details>
<summary>The caller passes <code>id: 0</code>. What does each one store?</summary>

Grok stores `0`. `??` replaces only `null` and `undefined`.

GLM stores a generated id. `||` replaces every falsy value, and `0` is falsy.

Read more: [Nullish coalescing operator `??`](https://javascript.info/nullish-coalescing-operator) on javascript.info.

</details>

<details>
<summary>The caller passes <code>id: 1</code>, and a transaction with id <code>1</code> exists. What happens?</summary>

In both, the array now has two transactions with id `1`.

</details>

## 4. Check it first

### Gemini

[`generated/google-gemini-4-neon/src/finance.js`, lines 34 to 66](../generated/google-gemini-4-neon/src/finance.js#L34-L66)

```js
function addTransaction(newTransaction) {
  if (!newTransaction || typeof newTransaction !== 'object') {
    throw new Error('Transaction must be a valid object.');
  }

  const { type, category, amount, description, date } = newTransaction;
  const validTypes = ['income', 'expense'];

  if (!validTypes.includes(type)) {
    throw new Error(
      `Invalid transaction type "${type}". Use "income" or "expense".`
    );
  }

  if (typeof amount !== 'number' || Number.isNaN(amount) || amount <= 0) {
    throw new Error('Transaction amount must be a positive number.');
  }

  if (!category || !description || !date) {
    throw new Error(
      'Transaction must include category, description, and date.'
    );
  }

  // Use object spread to build the new entry and array spread to append it immutably.
  const createdTransaction = {
    id: getNextTransactionId(),
    ...newTransaction,
  };

  transactions = [...transactions, createdTransaction];
  return createdTransaction;
}
```

Four checks. Each one stops the function with `throw` when the transaction is not acceptable.

<details>
<summary>Compare the <code>createdTransaction</code> object with Claude's <code>transactionToAdd</code>. The same two parts, in the other order. What changes?</summary>

In an object, a later property replaces an earlier one with the same name.

Claude writes `{ ...newTransaction, id: highestId + 1 }`. The generated id comes last, so it wins.

Gemini writes `{ id: getNextTransactionId(), ...newTransaction }`. The spread comes last, so an id on the caller's object wins. Pass `id: 1` and the array has two transactions with id `1`.

</details>

### OpenAI

[`generated/openai-astra-62/src/tracker.js`, lines 23 to 63](../generated/openai-astra-62/src/tracker.js#L23-L63). The checks for type, category, description, amount and date are on lines 38 to 54 and are left out here.

```js
function addTransaction(newTransaction) {
  const {
    id = nextId,
    type,
    category,
    description,
    amount,
    date,
  } = newTransaction;
  if (
    !Number.isSafeInteger(id) ||
    id < 1 ||
    transactions.some((item) => item.id === id)
  )
    throw new Error('Use a unique positive integer ID.');
  // ... lines 38 to 54: checks for type, category, description, amount, date
  transactions.push({
    ...newTransaction,
    id,
    category: category.trim(),
    description: description.trim(),
  });
  nextId = Math.max(nextId, id + 1);
  return id;
}
```

`id = nextId` is a default value in destructuring: when the caller gives no id, `id` is `nextId`. The caller may give an id, and this is the only solution that checks that it is not taken.

### v1 with validation

[`generated/v1-with-validation/tracker.js`, lines 28 to 36](../generated/v1-with-validation/tracker.js#L28-L36)

```js
export function addTransaction(newTransaction) {
  // validate before adding the id: the schema rejects unexpected keys
  const result = validate(newTransaction)
  if (!result.success) return -1

  // result.data is the transaction to store (util7 also trims its strings)
  const newMaxId = Math.max(0, ...transactions.map(tx => tx.id)) + 1
  return transactions.push({ ...result.data, id: newMaxId })
}
```

The checks are in another function, `validate`. `addTransaction` asks it for a verdict and acts on the answer. A transaction that arrives with an `id` is rejected, because `id` is not one of the five keys a new transaction may have.

<details>
<summary>Gemini and OpenAI <code>throw</code>. This one returns <code>-1</code>. What does the caller have to do in each case?</summary>

With `throw`, the program stops at that line unless the caller catches the error with `try...catch`. The caller cannot miss it.

With `-1`, the program continues. The caller has to look at the return value. If it does not, a rejected transaction looks the same as an added one.

Read more: [Error handling, "try...catch"](https://javascript.info/try-catch) on javascript.info.

</details>

## The ten, side by side

| Solution | New id | An id from the caller | Adds with | Returns | Checks the transaction |
|---|---|---|---|---|---|
| Qwen | none | kept | new array | the caller's object | no |
| Kimi | none | kept | `push` | the stored copy | no |
| DeepSeek | last id + 1 | replaced | `push` | nothing | no |
| v1 | highest id + 1 | replaced | `push` | the new length of the array | no |
| Claude | highest id + 1 | replaced | `push` | the stored object | no |
| Grok | highest id + 1 | kept, not checked | `push` | a copy of the stored object | no |
| GLM | highest id + 1 | kept, not checked | new array | the stored object | no |
| Gemini | highest id + 1 | kept, not checked | new array | the stored object | yes, throws |
| OpenAI | a counter, `nextId` | kept when unique, else throws | `push` | the id | yes, throws |
| v1 with validation | highest id + 1 | rejected | `push` | the new length of the array, or `-1` | yes, returns `-1` |

Every solution uses spread, as the assignment asks. Seven use it on the object and add with `push`. Qwen uses it on the array only. GLM and Gemini use it on both.
