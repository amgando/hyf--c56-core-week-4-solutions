// util4.js — Check functions instead of type names
//
// In util3 each field held a type name ('string'). Here each field
// holds a function that takes a value and returns true or false.
// Any rule fits that pattern, including the enum rule, so every rule
// now lives in the shape.
// Concept: functions are values; they can be stored in an object
// and called later.
//
// Behaviour changes compared to util3:
// - amount must be a finite number greater than 0
//   (rejects NaN, Infinity and negative amounts).
// - category must be a non-empty string.
// - Error messages are more generic ("invalid value ...") because a
//   true/false function cannot say why it failed. util5 fixes this.

const shape = {
  // Arrow function: takes v, returns the result of the comparison.
  type:        (v) => v === 'income' || v === 'expense',
  category:    (v) => typeof v === 'string' && v.length > 0,
  amount:      (v) => typeof v === 'number' && Number.isFinite(v) && v > 0,
  description: (v) => typeof v === 'string',
  date:        (v) => typeof v === 'string',
};

export function validate(tx) {
  if (tx === null || typeof tx !== 'object') {
    return { success: false, errors: ['not an object'] };
  }

  const errors = [];
  const requiredKeys = Object.keys(shape);

  for (const key of requiredKeys) {
    // shape[key] is a function. shape[key](tx[key]) calls it
    // with the value of that field.
    const check = shape[key];

    if (!(key in tx)) {
      errors.push(`${key}: missing`);
    } else if (!check(tx[key])) {
      // Note: JSON.stringify(NaN) is 'null', so a NaN amount is
      // reported as "invalid value null". util5 avoids this.
      errors.push(`${key}: invalid value ${JSON.stringify(tx[key])}`);
    }
  }

  for (const key of Object.keys(tx)) {
    if (!requiredKeys.includes(key)) {
      errors.push(`${key}: unexpected key`);
    }
  }

  // No separate enum check: the `type` function in the shape covers it.

  return errors.length === 0
    ? { success: true, data: tx }
    : { success: false, errors };
}
