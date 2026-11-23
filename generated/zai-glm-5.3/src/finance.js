// All finance logic of the tracker lives in this file.
// The transactions array is module state: the functions below read
// and update it.

const { initialTransactions } = require('./transactions');

// Start with a copy of the initial data set
let transactions = [...initialTransactions];

/**
 * Add a new transaction to the tracker.
 *
 * The spread operator copies the given object and the whole array,
 * so nothing that is passed in gets mutated. An id is generated
 * automatically when the new transaction does not have one yet.
 *
 * @param {object} newTransaction - the transaction to add
 * @returns {object} the stored transaction, including its id
 */
function addTransaction(newTransaction) {
  // Find the highest id that is currently in use
  let highestId = 0;
  for (const transaction of transactions) {
    if (transaction.id > highestId) {
      highestId = transaction.id;
    }
  }

  // Copy the new transaction with the spread operator and give it an id
  const transactionToAdd = {
    ...newTransaction,
    id: newTransaction.id || highestId + 1,
  };

  // Copy the whole array as well: the old array is left untouched
  transactions = [...transactions, transactionToAdd];

  return transactionToAdd;
}

/**
 * Total of all income transactions, added up with a for...of loop.
 *
 * @returns {number} total income in euros
 */
function getTotalIncome() {
  let totalIncome = 0;

  for (const transaction of transactions) {
    if (transaction.type === 'income') {
      totalIncome += transaction.amount;
    }
  }

  return totalIncome;
}

/**
 * Total of all expense transactions, added up with a classic for
 * loop that walks over the indexes of the array.
 *
 * @returns {number} total expenses in euros
 */
function getTotalExpenses() {
  let totalExpenses = 0;

  for (let index = 0; index < transactions.length; index += 1) {
    const transaction = transactions[index];
    if (transaction.type === 'expense') {
      totalExpenses += transaction.amount;
    }
  }

  return totalExpenses;
}

/**
 * Current balance: total income minus total expenses.
 *
 * @returns {number} balance in euros
 */
function getBalance() {
  return getTotalIncome() - getTotalExpenses();
}

/**
 * All transactions that match a category.
 *
 * The match is case-insensitive and partial: searching for 'food'
 * also matches a category called 'seafood'.
 *
 * @param {string} category - category name (or part of it) to search
 * @returns {Array<object>} the matching transactions
 */
function getTransactionsByCategory(category) {
  const matchingTransactions = [];
  const searchValue = category.toLowerCase();

  for (const transaction of transactions) {
    // includes() returns true when the category contains the search text
    if (transaction.category.toLowerCase().includes(searchValue)) {
      matchingTransactions.push(transaction);
    }
  }

  return matchingTransactions;
}

/**
 * The single most expensive transaction of the tracker.
 *
 * Object destructuring is used to pull the type and amount of every
 * transaction out of its object.
 *
 * @returns {object|null} the largest expense, or null when there
 *   are no expenses
 */
function getLargestExpense() {
  let largestExpense = null;

  for (const transaction of transactions) {
    // Object destructuring: pull type and amount out of the object
    const { type, amount } = transaction;

    const isAnExpense = type === 'expense';
    const isBiggerThanCurrent =
      largestExpense === null || amount > largestExpense.amount;

    if (isAnExpense && isBiggerThanCurrent) {
      largestExpense = transaction;
    }
  }

  return largestExpense;
}

/**
 * Remove a transaction by its id (bonus).
 *
 * @param {number} id - id of the transaction to remove
 * @returns {boolean} true when a transaction was removed
 */
function removeTransactionById(id) {
  const remainingTransactions = [];
  let transactionWasRemoved = false;

  for (const transaction of transactions) {
    if (transaction.id === id) {
      // Skip this transaction: this is how it gets removed
      transactionWasRemoved = true;
    } else {
      remainingTransactions.push(transaction);
    }
  }

  // Only replace the list when something was actually removed
  if (transactionWasRemoved) {
    transactions = remainingTransactions;
  }

  return transactionWasRemoved;
}

/**
 * All transactions between two dates (bonus).
 *
 * Dates are ISO strings like '2025-02-01'. slice(0, 10) cuts a
 * possible time part off the stored date, and ISO date strings can
 * simply be compared with >= and <= as text.
 *
 * @param {string} startDate - first day of the range (inclusive)
 * @param {string} endDate - last day of the range (inclusive)
 * @returns {Array<object>} the transactions inside the range
 */
function getTransactionsInDateRange(startDate, endDate) {
  const transactionsInRange = [];

  for (const transaction of transactions) {
    const transactionDate = transaction.date.slice(0, 10);

    if (transactionDate >= startDate && transactionDate <= endDate) {
      transactionsInRange.push(transaction);
    }
  }

  return transactionsInRange;
}

/**
 * All transactions grouped by month (bonus).
 *
 * The result is a nested object with one entry per month, for example:
 * {
 *   '2025-01': { income: 3500, expenses: 1650, transactions: [...] },
 *   '2025-02': { income: 3000, expenses: 1450, transactions: [...] }
 * }
 *
 * @returns {object} month key -> { income, expenses, transactions }
 */
function groupTransactionsByMonth() {
  const transactionsByMonth = {};

  for (const transaction of transactions) {
    // slice(0, 7) turns a date like '2025-01-15' into '2025-01'
    const monthKey = transaction.date.slice(0, 7);

    // Create the nested month object when it does not exist yet
    if (!transactionsByMonth[monthKey]) {
      transactionsByMonth[monthKey] = {
        income: 0,
        expenses: 0,
        transactions: [],
      };
    }

    const month = transactionsByMonth[monthKey];
    month.transactions.push(transaction);

    if (transaction.type === 'income') {
      month.income += transaction.amount;
    } else {
      month.expenses += transaction.amount;
    }
  }

  return transactionsByMonth;
}

/**
 * Average expense amount per category (bonus).
 *
 * @returns {object} category -> average expense amount
 */
function getAverageExpensePerCategory() {
  const expenseTotals = {};
  const expenseCounts = {};

  for (const transaction of transactions) {
    // Skip everything that is not an expense
    if (transaction.type !== 'expense') {
      continue;
    }

    // Object destructuring: pull category and amount out of the object
    const { category, amount } = transaction;

    if (expenseTotals[category] === undefined) {
      expenseTotals[category] = 0;
      expenseCounts[category] = 0;
    }

    expenseTotals[category] += amount;
    expenseCounts[category] += 1;
  }

  const averagesByCategory = {};

  for (const category of Object.keys(expenseTotals)) {
    const average = expenseTotals[category] / expenseCounts[category];

    // Round to two decimals to avoid long decimal numbers in the output
    averagesByCategory[category] = Math.round(average * 100) / 100;
  }

  return averagesByCategory;
}

/**
 * The longest run of consecutive months in which the expenses were
 * higher than the given threshold (bonus).
 *
 * Example: when January and February both cost more than the
 * threshold but March does not, the longest streak is 2.
 *
 * This is the most complex function of the project, so it is
 * explained step by step:
 *
 * 1. groupTransactionsByMonth() gives the expense total per month
 * 2. Object.keys() and sort() put those months in chronological order
 * 3. a while loop walks over the sorted months and keeps two counters:
 *    - currentStreak counts the months in the current run
 *    - longestStreak remembers the best run seen so far
 * 4. a cheap month resets the current streak back to 0
 *
 * @param {number} threshold - monthly expense total that counts as
 *   expensive
 * @returns {number} length of the longest expensive month streak
 */
function getLongestExpensiveMonthStreak(threshold) {
  const transactionsByMonth = groupTransactionsByMonth();
  const sortedMonths = Object.keys(transactionsByMonth).sort();

  // Step 1: collect the expense total of every month, oldest first
  const monthlyExpenseTotals = [];
  for (const month of sortedMonths) {
    monthlyExpenseTotals.push(transactionsByMonth[month].expenses);
  }

  // Step 2: walk over the months with a while loop
  let longestStreak = 0;
  let currentStreak = 0;
  let monthIndex = 0;

  while (monthIndex < monthlyExpenseTotals.length) {
    const monthExpenseTotal = monthlyExpenseTotals[monthIndex];

    if (monthExpenseTotal > threshold) {
      // Expensive month: extend the current streak
      currentStreak += 1;
      longestStreak = Math.max(longestStreak, currentStreak);
    } else {
      // Cheap month: start over from zero
      currentStreak = 0;
    }

    monthIndex += 1;
  }

  return longestStreak;
}

/**
 * A copy of every transaction in the tracker.
 *
 * @returns {Array<object>} all transactions
 */
function getAllTransactions() {
  return [...transactions];
}

/**
 * Number of transactions in the tracker.
 *
 * @returns {number} amount of transactions
 */
function getTransactionCount() {
  return transactions.length;
}

module.exports = {
  addTransaction,
  removeTransactionById,
  getTotalIncome,
  getTotalExpenses,
  getBalance,
  getTransactionsByCategory,
  getTransactionsInDateRange,
  getLargestExpense,
  groupTransactionsByMonth,
  getAverageExpensePerCategory,
  getLongestExpensiveMonthStreak,
  getAllTransactions,
  getTransactionCount,
};
