// util3.js — Report every problem, not just the first
//
// Instead of returning at the first problem, collect every problem in
// the `errors` array. The result object keeps the same shape (the one
// Zod uses):
//   { success: true,  data }      when valid
//   { success: false, errors }    when invalid
// Concept: keep checking after a failure, so one run reports everything.
//
// Behaviour changes compared to util2:
// - null, undefined and non-objects return a failure instead of throwing.
// - errors lists all problems at once.
// - The error for an extra key names the key.

const shape = {
  type: 'string',
  category: 'string',
  amount: 'number',
  description: 'string',
  date: 'string',
};

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
