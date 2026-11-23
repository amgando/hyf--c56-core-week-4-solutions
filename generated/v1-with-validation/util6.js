// util6.js — Zod
//
// The machinery from util5 Part A is replaced by the Zod library.
// The schema reads almost the same as util5 Part B.
// Requires: npm install zod   (written for Zod 4)
//
// Behaviour: same rules as util5.
// Differences to notice:
// - Errors are objects, not strings: result.error.issues is an array
//   of { path, message, code, ... }. validate() below converts them
//   to "key: message" strings so the output matches util1-util5.
// - z.number() already rejects NaN and Infinity.
// - z.strictObject rejects extra keys. Plain z.object would accept
//   the input and silently drop the extra keys from result.data.
//
// Zod 3 spelling, for older tutorials:
//   z.object({...}).strict()   instead of   z.strictObject({...})

import { z } from 'zod';

export const Transaction = z.strictObject({
  type:        z.enum(['income', 'expense']),
  category:    z.string().min(1),        // non-empty
  amount:      z.number().positive(),    // > 0, finite
  description: z.string(),
  date:        z.string(),
});

export function validate(tx) {
  // safeParse never throws. (parse() would throw on invalid input.)
  const result = Transaction.safeParse(tx);

  if (result.success) return result; // { success: true, data }

  // Flatten Zod's issue objects into the same string format as util5.
  const errors = result.error.issues.map(
    (issue) => `${issue.path.join('.') || '(root)'}: ${issue.message}`
  );
  return { success: false, errors };
}
