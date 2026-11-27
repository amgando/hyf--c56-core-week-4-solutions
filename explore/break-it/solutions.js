// The four solutions tested here.
//
// These four keep their functions in a file that needs nothing installed,
// so `npm install` in this folder is enough.
//
// Each solution names its functions a little differently. This file gives
// them the same three names, so the tests can treat them the same way:
//   add(transaction)      adds a transaction and returns the stored one
//   all()                 returns every transaction
//   byCategory(category)  returns the transactions in one category

const claude = require('../../generated/claude-opus-5.5/src/finance');
const grok = require('../../generated/x-grok-47/src/tracker');
const glm = require('../../generated/zai-glm-5.3/src/finance');
const gemini = require('../../generated/google-gemini-4-neon/src/finance');

const solutions = [
  {
    name: 'Claude',
    add: claude.addTransaction,
    all: () => claude.transactions,
    byCategory: claude.getTransactionsByCategory,
  },
  {
    name: 'Grok',
    add: grok.addTransaction,
    all: grok.getTransactions,
    byCategory: grok.getTransactionsByCategory,
  },
  {
    name: 'GLM',
    add: glm.addTransaction,
    all: glm.getAllTransactions,
    byCategory: glm.getTransactionsByCategory,
  },
  {
    name: 'Gemini',
    add: gemini.addTransaction,
    all: gemini.getTransactions,
    byCategory: gemini.getTransactionsByCategory,
  },
];

module.exports = { solutions };
