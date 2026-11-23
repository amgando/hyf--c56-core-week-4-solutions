// util2.js — The shape as data
//
// The keys and their types were listed twice in util1 (once in
// requiredKeys, once in the typeof lines). Here they live in a single
// object, `shape`, and the code reads everything from it.
// Concept: a schema is data that describes what valid input looks like.
//
// Behaviour: same rules as util1, still stopping at the first problem.
// Adding a field is now a one-line change to `shape`.

const shape = {
  type: 'string',
  category: 'string',
  amount: 'number',
  description: 'string',
  date: 'string',
};

export function validate(tx) {
  // The key list is derived from the shape instead of written by hand.
  const requiredKeys = Object.keys(shape);

  // Same key-count check as util1 (catches extra keys).
  if (Object.keys(tx).length !== requiredKeys.length) {
    return { success: false, errors: ['wrong number of keys'] };
  }

  for (const key of requiredKeys) {
    // Missing key?
    if (!(key in tx)) return { success: false, errors: [`${key}: missing`] };

    // Wrong type? shape[key] is the expected type name, e.g. 'number'.
    // This one line replaces the five typeof lines in util1.
    if (typeof tx[key] !== shape[key]) {
      return { success: false, errors: [`${key}: expected ${shape[key]}`] };
    }
  }

  // typeof cannot express "one of these values", so this rule
  // still lives outside the shape.
  if (tx.type !== 'income' && tx.type !== 'expense') {
    return { success: false, errors: [`type: must be 'income' or 'expense'`] };
  }

  return { success: true, data: tx };
}
