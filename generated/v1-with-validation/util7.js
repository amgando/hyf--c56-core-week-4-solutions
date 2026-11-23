// util7.js — Zod with stricter rules
//
// Rules that would each need another helper in util5, here one call
// each. This is the point where a library pays for itself.
// Requires: npm install zod   (written for Zod 4)
//
// Behaviour changes compared to util6:
// - date must be a real calendar date in YYYY-MM-DD format
//   ('2025-02-30' and '01/03/2025' fail).
// - description is optional: it may be missing, but if present it
//   must be a string.
// - Strings are trimmed before checking, so '   ' fails as a category.
// - result.data is the cleaned value (trimmed strings), which can
//   differ from the input. Use result.data, not the original object.
//
// Bonus for TypeScript users:
//   type Transaction = z.infer<typeof Transaction>;
//
// Zod 3 spelling: z.string().date() instead of z.iso.date()

import { z } from 'zod';

export const Transaction = z.strictObject({
  type:        z.enum(['income', 'expense']),
  category:    z.string().trim().min(1),
  amount:      z.number().positive(),
  description: z.string().trim().optional(),
  date:        z.iso.date(),
});

export function validate(tx) {
  const result = Transaction.safeParse(tx);
  if (result.success) return result;

  const errors = result.error.issues.map(
    (issue) => `${issue.path.join('.') || '(root)'}: ${issue.message}`
  );
  return { success: false, errors };
}
