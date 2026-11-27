# Pick the best

Ten solutions run. Which one is best depends on what you need it for.

Six questions are here. They work on any codebase. Each one has a folded answer for the ten solutions. The [last section](#so-which-one) names a best solution for five different needs.

## 1. Can you read it in one sitting?

Count the files and the lines. A solution you can read from top to bottom is one you can understand completely.

<details>
<summary>The ten, by size</summary>

| Solution | JS files | Lines |
|---|:-:|:-:|
| DeepSeek | 2 | 168 |
| Qwen | 2 | 192 |
| v1 | 3 | 209 |
| Claude | 4 | 487 |
| OpenAI | 4 | 493 |
| Kimi | 3 | 496 |
| GLM | 4 | 698 |
| v1 with validation | 11 | 703 |
| Grok | 4 | 756 |
| Gemini | 4 | 840 |

Short is not the same as complete. DeepSeek does none of the six bonus challenges and Qwen does one. The other six model solutions do all six.

</details>

## 2. Can you use the functions without running the program?

A file that only defines functions can be imported by another file: a test, a web page, a different program. A file that also runs the program cannot. The file that starts the program is called the entry point, and it works best when it is a different file from the one that holds the functions.

<details>
<summary>The ten</summary>

Eight keep the functions in a file of their own. Importing that file prints nothing.

DeepSeek and Qwen have everything in `src/index.js`: the functions, and the lines that call them. The file exports nothing. Importing it runs the whole program and prints the full report.

</details>

## 3. Is calculating separate from printing?

A function that returns a number can be used anywhere. A function that prints can only print. Keeping the two apart has a name: separation of concerns.

To check, search each file for `console.log`.

<details>
<summary>The ten</summary>

| Solution | Where the calculating is | Lines that print in that file |
|---|---|:-:|
| Claude | `src/finance.js` | 0 |
| Gemini | `src/finance.js` | 0 |
| GLM | `src/finance.js` | 0 |
| Grok | `src/tracker.js` | 0 |
| Kimi | `src/financeTracker.js` | 9 |
| OpenAI | `src/tracker.js` | 9 |
| v1 | `tracker.js` | 2 |
| v1 with validation | `tracker.js` | 2 |
| DeepSeek | `src/index.js` | 14 |
| Qwen | `src/index.js` | 13 |

Claude, Gemini, GLM and Grok each have a second file, `display.js`, that does all the printing.

v1 mixes the two inside one function: `getLargestExpense` returns a string with the colour already in it.

OpenAI prints from the same file, with one difference: a search for `console.log` finds nothing there. It calls `print`, a function that is passed in: `createTracker(initial = sample, print = console.log)`. A test can pass a different function and collect the output.

</details>

## 4. Who owns the data?

The program starts with a list of transactions in a data file. `addTransaction` adds to a list. Is it the same list?

When several parts of a program change the same array, that array is shared state. It makes tests hard: a transaction added in one test is still there in the next.

<details>
<summary>The ten</summary>

Five change the starting data itself. v1, v1 with validation, Claude, DeepSeek and Kimi import the array from the data file and `push` to it. Add a transaction, and the data file's array is one longer.

Four leave it alone. Grok, GLM and Gemini make a copy of the starting data when the file loads, and add to the copy. Qwen builds a new array every time it adds.

OpenAI has one list per tracker. There is no list at the top of the file. `createTracker()` makes a tracker with its own list, every time it is called. Two trackers do not see each other's transactions.

</details>

## 5. How do you know it works?

There are two ways: run it and look, or write tests that check it for you.

<details>
<summary>The ten</summary>

OpenAI has tests: four, in [`test/tracker.test.js`](../generated/openai-astra-62/test/tracker.test.js). Run them with `npm test`. The other nine have none.

Running and looking misses things. The [comparison table](../README.md#comparison-against-the-assignment) lists four problems in solutions that run without an error and print a report that looks right: footnotes 1, 2, 3 and 7.

</details>

## 6. Does it get the money right?

```js
0.1 + 0.2   // 0.30000000000000004
```

JavaScript numbers cannot hold `0.1` exactly. This is called floating point, and every language that uses it has the same result. For amounts in whole euros it never shows. For amounts with cents it can.

<details>
<summary>The ten</summary>

OpenAI converts every amount to cents, a whole number, before it adds. [`src/tracker.js`, lines 17 to 19](../generated/openai-astra-62/src/tracker.js#L17-L19) and [lines 65 to 70](../generated/openai-astra-62/src/tracker.js#L65-L70):

```js
function cents(amount) {
  return Math.round(amount * 100);
}
```

```js
function totalCents(type) {
  let total = 0;
  for (const item of transactions)
    if (item.type === type) total += cents(item.amount);
  return total;
}
```

The other nine add the amounts as they are.

Read more: [Imprecise calculations](https://javascript.info/number#imprecise-calculations) on javascript.info.

</details>

## So which one?

No solution is first on all six questions. Five needs are below, each with the solution that fits it best.

<details>
<summary>You have ten minutes and want to understand a whole solution.</summary>

**DeepSeek.** Two files, 168 lines, the seven required functions and nothing else. v1 is second, at 209 lines.

</details>

<details>
<summary>You want the one that follows the assignment most closely.</summary>

**Claude.** In the comparison table it meets every row the assignment asks for, with no footnote, and it does all six bonus challenges. The one ✗ in its column is validation, which the assignment does not ask for.

</details>

<details>
<summary>You need functions that another program will import.</summary>

**Claude**, or **Gemini** if the input has to be checked.

Both keep the calculating in `src/finance.js` with no `console.log`, and both return data, not text. Claude always sets the id itself. Gemini checks every new transaction and throws on a bad one, and it keeps an id from the caller without checking it.

</details>

<details>
<summary>You need a command-line tool that a person types into.</summary>

**OpenAI.** It is the only one that takes commands: `npm start -- --interactive`. It checks what the person types, and a mistake gets a one-line message, not a stack trace.

</details>

<details>
<summary>You will keep changing it for a year.</summary>

**OpenAI.** It is the only one with tests. Change something, run `npm test`, and you know within a second whether the four checked behaviours still hold. Each tracker owns its data, so a test starts clean. Money is added in cents.

Its weak point is question 3: calculating and printing are in one file.

</details>
