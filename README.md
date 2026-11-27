# Core week 4 assignment: solutions compared

You've just built the Personal Finance Tracker. Here are ten other ways to build it: one I wrote by hand, one where I kept going on validation, and eight written by AI models from the same assignment ([`notion.md`](notion.md), also in [HackYourAssignment/c56-core-week-4](https://github.com/HackYourAssignment/c56-core-week-4)).

Reading other solutions to a problem you've just solved is what a working developer does to see the range of what's possible.

Explore the folders in any order. Each one runs with `npm install` and `npm start`.

If you want something more structured, [`explore/`](explore) has a few activities.

## How this was made

1. [`handwritten/v1`](handwritten/v1) is written by hand.
2. [`generated/v1-with-validation`](generated/v1-with-validation) is v1 plus validation of new transactions. The first check is written by hand. Claude wrote the path from that check to the Zod library in seven steps. It is an example of a thread a trainee can pull on.
3. The other folders in [`generated/`](generated) are written by eight models. Each model wrote its solution from scratch, with the assignment as its only input. Four are frontier models: Claude, OpenAI, Grok and Gemini. Four are open-weight models, run through OpenRouter: GLM, DeepSeek, Kimi and Qwen.

## Solutions

| Folder | Made by |
|---|---|
| [handwritten/v1](handwritten/v1) | Sherif |
| [generated/v1-with-validation](generated/v1-with-validation) | Sherif, validation steps with Claude |
| [generated/claude-opus-5.5](generated/claude-opus-5.5) | Claude Opus 5.5 |
| [generated/openai-astra-62](generated/openai-astra-62) | OpenAI astra-62 |
| [generated/x-grok-47](generated/x-grok-47) | xAI Grok 47 |
| [generated/google-gemini-4-neon](generated/google-gemini-4-neon) | Google Gemini 4 Neon |
| [generated/zai-glm-5.3](generated/zai-glm-5.3) | Z.ai GLM-5.3 |
| [generated/deepseek-v4-pro](generated/deepseek-v4-pro) | DeepSeek V4 Pro |
| [generated/moonshot-kimi-k3.1-pro](generated/moonshot-kimi-k3.1-pro) | Moonshot Kimi K3.1 Pro |
| [generated/qwen-3.8-2.4t](generated/qwen-3.8-2.4t) | Qwen3.8 2.4T |

Each folder has a README that tells how to run it.

## Comparison against the assignment

| | v1 | v1 + validation | Claude | OpenAI | Grok | Gemini | GLM | DeepSeek | Kimi | Qwen |
|---|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|
| Made by | human | human + Claude | frontier | frontier | frontier | frontier | open-weight | open-weight | open-weight | open-weight |
| chalk 4.1.2 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Module system | ESM | ESM | CJS | CJS | CJS | CJS | CJS | CJS | CJS | CJS |
| Transactions (≥ 5) | 7 | 7 | 11 | 6 | 23 | 14 | 8 | 5 | 14 | 5 |
| All 7 required functions | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Totals summed with a loop | ✗ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Category filter: loop + push | ✗ | ✗ | ✓ | ✓ | ~¹ | ✓ | ~¹ | ✓ | ✓ | ✓ |
| Loop types (F O W) | none | none | F O W | O W | F O W | F O W | F O W | F O | F O W | F O W |
| Destructuring | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Spread when adding | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| New transaction gets unique id | ✓ | ✓ | ✓ | ✓ | ~² | ~² | ~² | ~³ | ✗ | ✗ |
| Validates new transaction | ✗ | ✓ | ✗ | ✓ | ✗ | ✓ | ✗ | ✗ | ✗ | ✗ |
| Colour rules | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Summary: all 5 items | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Line format as spec example | ✗⁴ | ✗⁴ | ✓ | ✗⁵ | ✓ | ✗⁸ | ✓ | ✓ | ✗⁵ | ✓ |
| Comments on complex logic | ~ | ✓ | ✓ | ~ | ✓ | ✓ | ✓ | ✗ | ~ | ~ |
| Bonus challenges (of 6) | 0 | 0 | 6 | 6⁶ | 6 | 6 | 6⁷ | 0 | 6 | 1 |
| Beyond the spec | — | 7-step validator | — | CLI, tests, validation | — | validation, full JSDoc | full JSDoc | — | — | — |
| JS files / lines | 3 / 209 | 11 / 703 | 4 / 487 | 4 / 493 | 4 / 756 | 4 / 840 | 4 / 698 | 2 / 168 | 3 / 496 | 2 / 192 |
| Cost / time | — | — | — | — | — | — | $0.08 / 9 m | $0.007 / 6 s | $0.14 / 2 m | $0.19 / 5 m |

✓ meets · ~ partly · ✗ misses · F = `for`, O = `for…of`, W = `while` · ESM = `import` and `export`, CJS = `require` and `module.exports`

1. The filter matches substrings and ignores case. `food` also matches `seafood`.
2. The id is generated, but an id passed in by the caller is kept without a uniqueness check.
3. The new id is the last transaction's id + 1. This is wrong if the array is not sorted by id.
4. Category and description are swapped compared with the example: `Salary - €3000 (Monthly salary)`.
5. Lines are numbered by id, amounts have decimals (`€3,000.00`) and the date is added.
6. The bonuses run only in `--interactive` mode. `npm start` shows the list and the summary.
7. The date-range search does not use `slice`. The expensive-months streak does not check that the months are consecutive.
8. Lines are numbered by id and the date is added.

Prettier is removed from all solutions. Whether to use a formatter is a matter of opinion, and it is not the subject of this comparison. The assignment does ask for it. All ten run. v1 + validation ends with an intentional `Invalid Tx` error, to show a rejected transaction.

## JavaScript here that can be new to you

Some solutions use parts of JavaScript that come after Week 4. Each row has a page with examples.

| What | Where | Read |
|---|---|---|
| `reduce`, `filter`, `map` | `handwritten/v1/tracker.js` | [reduce](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reduce), [filter](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter) and [map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map) on MDN, [Array methods](https://javascript.info/array-methods) on javascript.info |
| `throw` | `generated/v1-with-validation/index.js`, `generated/google-gemini-4-neon/src/finance.js` | [throw](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/throw) on MDN, [Error handling](https://javascript.info/try-catch) on javascript.info |
| `import` and `export` (ESM), `require` and `module.exports` (CJS) | The two v1 folders use ESM. The eight model folders use CJS. Node.js runs both. `"type": "module"` in `package.json` selects ESM. | [Modules, introduction](https://javascript.info/modules-intro) on javascript.info, [CommonJS modules](https://nodejs.org/api/modules.html) in the Node.js documentation |
| Functions that return functions (closures) | `generated/v1-with-validation/util5.js` | [Closure](https://javascript.info/closure) on javascript.info |
| Zod | `generated/v1-with-validation/util6.js` and `util7.js` | [zod.dev](https://zod.dev/) |
