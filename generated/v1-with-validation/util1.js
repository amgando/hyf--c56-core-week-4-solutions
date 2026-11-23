// util1.js — Explicit checks, one at a time
//
// The starting point. Every rule is written out by hand.
// Concepts: objects, arrays, `in`, `typeof`, for...of, early return.
//
// Every util exports the same function, validate(tx), which returns:
//   { success: true,  data }      when valid
//   { success: false, errors }    when invalid
//
// Behaviour notes:
// - Stops at the first problem, so `errors` holds one message.
// - Throws a TypeError if `tx` is null or undefined, because
//   Object.keys(null) is not allowed.
// - Accepts NaN and negative amounts: typeof NaN is 'number'.

export function validate(tx) {
  const requiredKeys = ['type', 'category', 'amount', 'description', 'date'];

  // 1. Exactly the right number of keys? (catches extra keys)
  if (Object.keys(tx).length !== requiredKeys.length) {
    return { success: false, errors: ['wrong number of keys'] };
  }

  // 2. Every required key present? (catches missing keys)
  for (const key of requiredKeys) {
    if (!(key in tx)) {
      return { success: false, errors: [`${key}: missing`] };
    }
  }

  // 3. Values of the right type?
  if (typeof tx.amount !== 'number') return { success: false, errors: ['amount: expected number'] };
  if (typeof tx.type !== 'string') return { success: false, errors: ['type: expected string'] };
  if (typeof tx.category !== 'string') return { success: false, errors: ['category: expected string'] };
  if (typeof tx.description !== 'string') return { success: false, errors: ['description: expected string'] };
  if (typeof tx.date !== 'string') return { success: false, errors: ['date: expected string'] };

  // 4. `type` one of the allowed values?
  if (tx.type !== 'income' && tx.type !== 'expense') {
    return { success: false, errors: [`type: must be 'income' or 'expense'`] };
  }

  return { success: true, data: tx };
}
