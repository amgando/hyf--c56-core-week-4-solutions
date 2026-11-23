// util5.js — A small homemade Zod
//
// The check functions in util4 repeated themselves and could not
// explain a failure. Here, helper functions *build* check functions.
// Each check returns null when the value is fine, or an error message
// when it is not.
// Concept: functions that return functions (factories / closures).
//
// The file has two parts:
//   Part A: the reusable machinery (would normally be its own file)
//   Part B: the transaction schema, which contains no logic at all
//
// Behaviour: same rules as util4, with specific error messages.
// Compare Part B with util6.js: it is almost line-for-line the same.

// ---------------------------------------------------------------
// Part A: machinery
// ---------------------------------------------------------------

// string() returns a check function. Calling string() twice gives
// two separate but identical checks.
const string = () => (v) =>
  typeof v === 'string' ? null : `expected a string, got ${typeof v}`;

// nonEmptyString() adds one rule on top of string().
const nonEmptyString = () => (v) =>
  typeof v !== 'string' ? `expected a string, got ${typeof v}`
  : v.length === 0       ? 'must not be empty'
  : null;

const positiveNumber = () => (v) =>
  typeof v !== 'number' || !Number.isFinite(v) ? 'expected a finite number'
  : v <= 0                                      ? 'must be greater than 0'
  : null;

// enumOf(options) "remembers" options inside the function it returns.
// That remembered variable is called a closure.
const enumOf = (options) => (v) =>
  options.includes(v) ? null : `expected one of: ${options.join(', ')}`;

// object(shape) returns an object with a safeParse method,
// the same method name Zod uses.
function object(shape) {
  return {
    safeParse(input) {
      if (input === null || typeof input !== 'object') {
        return { success: false, errors: ['not an object'] };
      }

      const errors = [];

      for (const key of Object.keys(shape)) {
        if (!(key in input)) {
          errors.push(`${key}: missing`);
          continue; // skip the value check for a missing key
        }
        const problem = shape[key](input[key]); // null or a message
        if (problem) errors.push(`${key}: ${problem}`);
      }

      for (const key of Object.keys(input)) {
        if (!(key in shape)) errors.push(`${key}: unexpected key`);
      }

      return errors.length === 0
        ? { success: true, data: input }
        : { success: false, errors };
    },
  };
}

// ---------------------------------------------------------------
// Part B: the schema. Pure description, no logic.
// ---------------------------------------------------------------

export const Transaction = object({
  type:        enumOf(['income', 'expense']),
  category:    nonEmptyString(),
  amount:      positiveNumber(),
  description: string(),
  date:        string(),
});

export const validate = (tx) => Transaction.safeParse(tx);
