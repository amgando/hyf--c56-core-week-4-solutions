# Core week 4 assignment: solutions compared

Solutions to the HackYourFuture Core program week 4 assignment, the Personal Finance Tracker. The assignment is in [`notion.md`](notion.md) and in [HackYourAssignment/c56-core-week-4](https://github.com/HackYourAssignment/c56-core-week-4).

## How this was made

1. [`handwritten/v1`](handwritten/v1) is written by hand.
2. [`generated/v1-with-validation`](generated/v1-with-validation) is v1 plus validation of new transactions. The first check is written by hand. Claude wrote the path from that check to the Zod library in seven steps. It is an example of a thread a student can pull on.
3. The other folders in [`generated/`](generated) are written by seven models. Each model wrote its solution from scratch, with the assignment as its only input. Three are frontier models: Claude, OpenAI and Grok. Four are open-weight models, run through OpenRouter: GLM, DeepSeek, Kimi and Qwen.

## Solutions

| Folder | Made by |
|---|---|
| [handwritten/v1](handwritten/v1) | Sherif |
| [generated/v1-with-validation](generated/v1-with-validation) | Sherif, validation steps with Claude |
| [generated/claude-opus-5.5](generated/claude-opus-5.5) | Claude Opus 5.5 |
| [generated/openai-astra-62](generated/openai-astra-62) | OpenAI astra-62 |
| [generated/x-grok-47](generated/x-grok-47) | xAI Grok 47 |
| [generated/zai-glm-5.3](generated/zai-glm-5.3) | Z.ai GLM-5.3 |
| [generated/deepseek-v4-pro](generated/deepseek-v4-pro) | DeepSeek V4 Pro |
| [generated/moonshot-kimi-k3.1-pro](generated/moonshot-kimi-k3.1-pro) | Moonshot Kimi K3.1 Pro |
| [generated/qwen-3.8-2.4t](generated/qwen-3.8-2.4t) | Qwen3.8 2.4T |

Each folder has a README that tells how to run it.

## Comparison against the assignment

| | v1 | v1 + validation | Claude | OpenAI | Grok | GLM | DeepSeek | Kimi | Qwen |
|---|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|
| Made by | human | human + Claude | frontier | frontier | frontier | open-weight | open-weight | open-weight | open-weight |
| chalk 4.1.2 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Transactions (≥ 5) | 7 | 7 | 11 | 6 | 23 | 8 | 5 | 14 | 5 |
| All 7 required functions | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Totals summed with a loop | ✗ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Category filter: loop + push | ✗ | ✗ | ✓ | ✓ | ~¹ | ~¹ | ✓ | ✓ | ✓ |
| Loop types (F O W) | none | none | F O W | O W | F O W | F O W | F O | F O W | F O W |
| Destructuring | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Spread when adding | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| New transaction gets unique id | ✓ | ✓ | ✓ | ✓ | ~² | ~² | ~³ | ✗ | ✗ |
| Validates new transaction | ✗ | ✓ | ✗ | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ |
| Colour rules | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Summary: all 5 items | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Line format as spec example | ✗⁴ | ✗⁴ | ✓ | ✗⁵ | ✓ | ✓ | ✓ | ✗⁵ | ✓ |
| Comments on complex logic | ~ | ✓ | ✓ | ~ | ✓ | ✓ | ✗ | ~ | ~ |
| Bonus challenges (of 6) | 0 | 0 | 6 | 6⁶ | 6 | 6⁷ | 0 | 6 | 1 |
| Beyond the spec | — | 7-step validator | — | CLI, tests, validation | — | full JSDoc | — | — | — |
| JS files / lines | 3 / 209 | 11 / 703 | 4 / 487 | 4 / 493 | 4 / 756 | 4 / 698 | 2 / 168 | 3 / 496 | 2 / 192 |
| Cost / time | — | — | — | — | — | $0.08 / 9 m | $0.007 / 6 s | $0.14 / 2 m | $0.19 / 5 m |

✓ meets · ~ partly · ✗ misses · F = `for`, O = `for…of`, W = `while`

1. The filter matches substrings and ignores case. `food` also matches `seafood`.
2. The id is generated, but an id passed in by the caller is kept without a uniqueness check.
3. The new id is the last transaction's id + 1. This is wrong if the array is not sorted by id.
4. Category and description are swapped compared with the example: `Salary - €3000 (Monthly salary)`.
5. Lines are numbered by id, amounts have decimals (`€3,000.00`) and the date is added.
6. The bonuses run only in `--interactive` mode. `npm start` shows the list and the summary.
7. The date-range search does not use `slice`. The expensive-months streak does not check that the months are consecutive.

Prettier is removed from all solutions. All nine run. v1 + validation ends with an intentional `Invalid Tx` error, to show a rejected transaction.