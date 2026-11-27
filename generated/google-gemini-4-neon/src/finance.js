const initialTransactions = require('./data/transactions');

// Keep an internal working copy so the seed module remains unmodified.
let transactions = initialTransactions.map((item) => ({ ...item }));

/**
 * Computes the next unique numeric transaction ID.
 * @returns {number}
 */
function getNextTransactionId() {
  let maxId = 0;
  for (const transaction of transactions) {
    if (transaction.id > maxId) {
      maxId = transaction.id;
    }
  }
  return maxId + 1;
}

/**
 * Returns a shallow copy of all current transactions.
 * @returns {Array<object>}
 */
function getTransactions() {
  return transactions.slice();
}

/**
 * Adds a new transaction to the transactions array using the spread operator.
 * Automatically assigns the next available ID if one is not provided.
 * @param {object} newTransaction
 * @returns {object} The created transaction object.
 */
function addTransaction(newTransaction) {
  if (!newTransaction || typeof newTransaction !== 'object') {
    throw new Error('Transaction must be a valid object.');
  }

  const { type, category, amount, description, date } = newTransaction;
  const validTypes = ['income', 'expense'];

  if (!validTypes.includes(type)) {
    throw new Error(
      `Invalid transaction type "${type}". Use "income" or "expense".`
    );
  }

  if (typeof amount !== 'number' || Number.isNaN(amount) || amount <= 0) {
    throw new Error('Transaction amount must be a positive number.');
  }

  if (!category || !description || !date) {
    throw new Error(
      'Transaction must include category, description, and date.'
    );
  }

  // Use object spread to build the new entry and array spread to append it immutably.
  const createdTransaction = {
    id: getNextTransactionId(),
    ...newTransaction,
  };

  transactions = [...transactions, createdTransaction];
  return createdTransaction;
}

/**
 * Sums all income transactions using a for...of loop.
 * @returns {number}
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
 * Sums all expense transactions using a standard for loop.
 * @returns {number}
 */
function getTotalExpenses() {
  let totalExpenses = 0;

  for (let i = 0; i < transactions.length; i++) {
    if (transactions[i].type === 'expense') {
      totalExpenses += transactions[i].amount;
    }
  }

  return totalExpenses;
}

/**
 * Calculates current balance (total income minus total expenses).
 * @returns {number}
 */
function getBalance() {
  return getTotalIncome() - getTotalExpenses();
}

/**
 * Filters transactions matching a given category (case-insensitive)
 * using a loop and Array.prototype.push.
 * @param {string} category
 * @returns {Array<object>}
 */
function getTransactionsByCategory(category) {
  const normalizedTarget = String(category).trim().toLowerCase();
  const matchingTransactions = [];

  for (const transaction of transactions) {
    if (transaction.category.toLowerCase() === normalizedTarget) {
      matchingTransactions.push(transaction);
    }
  }

  return matchingTransactions;
}

/**
 * Finds the expense transaction with the highest amount.
 * @returns {object|null}
 */
function getLargestExpense() {
  let largestExpense = null;

  for (let i = 0; i < transactions.length; i++) {
    const current = transactions[i];
    if (current.type === 'expense') {
      if (largestExpense === null || current.amount > largestExpense.amount) {
        largestExpense = current;
      }
    }
  }

  return largestExpense;
}

/**
 * BONUS: Searches transactions within an inclusive YYYY-MM-DD date range using slice().
 * Copies the array with slice(), sorts chronologically, locates the matching index
 * boundaries, and extracts the range with slice(startIndex, endIndex + 1).
 * @param {string} startDate - Inclusive start date (YYYY-MM-DD)
 * @param {string} endDate - Inclusive end date (YYYY-MM-DD)
 * @returns {Array<object>}
 */
function getTransactionsByDateRange(startDate, endDate) {
  // Clone with slice() so sorting does not mutate the original transactions order.
  const sortedByDate = transactions
    .slice()
    .sort((a, b) => a.date.localeCompare(b.date));

  let startIndex = -1;
  let endIndex = -1;

  for (let i = 0; i < sortedByDate.length; i++) {
    const transactionDate = sortedByDate[i].date.slice(0, 10);

    if (transactionDate >= startDate && transactionDate <= endDate) {
      if (startIndex === -1) {
        startIndex = i;
      }
      endIndex = i;
    }
  }

  if (startIndex === -1) {
    return [];
  }

  return sortedByDate.slice(startIndex, endIndex + 1);
}

/**
 * BONUS: Groups transactions by month (YYYY-MM) using nested objects.
 * Each month entry stores totals and separates transactions by type.
 * @returns {object}
 */
function groupTransactionsByMonth() {
  const groupedByMonth = {};

  for (const transaction of transactions) {
    const { type, amount, date } = transaction;
    const monthKey = date.slice(0, 7);

    if (!groupedByMonth[monthKey]) {
      groupedByMonth[monthKey] = {
        totalIncome: 0,
        totalExpenses: 0,
        balance: 0,
        byType: {
          income: [],
          expense: [],
        },
      };
    }

    const monthBucket = groupedByMonth[monthKey];

    if (type === 'income') {
      monthBucket.totalIncome += amount;
      monthBucket.byType.income.push(transaction);
    } else if (type === 'expense') {
      monthBucket.totalExpenses += amount;
      monthBucket.byType.expense.push(transaction);
    }

    monthBucket.balance = monthBucket.totalIncome - monthBucket.totalExpenses;
  }

  return groupedByMonth;
}

/**
 * BONUS: Calculates the average expense amount for each expense category.
 * @returns {object} Map of category name to average expense rounded to 2 decimals.
 */
function getAverageExpenseByCategory() {
  const categoryStats = {};

  for (const transaction of transactions) {
    if (transaction.type !== 'expense') {
      continue;
    }

    const { category, amount } = transaction;

    if (!categoryStats[category]) {
      categoryStats[category] = { total: 0, count: 0 };
    }

    categoryStats[category].total += amount;
    categoryStats[category].count += 1;
  }

  const averages = {};
  const categories = Object.keys(categoryStats);

  for (let i = 0; i < categories.length; i++) {
    const category = categories[i];
    const { total, count } = categoryStats[category];
    averages[category] = Number((total / count).toFixed(2));
  }

  return averages;
}

/**
 * BONUS: Removes a transaction by its numeric ID.
 * @param {number} id
 * @returns {object|null} The removed transaction, or null if no match was found.
 */
function removeTransactionById(id) {
  let removedTransaction = null;
  const remainingTransactions = [];

  for (const transaction of transactions) {
    if (transaction.id === id && removedTransaction === null) {
      removedTransaction = transaction;
    } else {
      remainingTransactions.push(transaction);
    }
  }

  if (removedTransaction !== null) {
    transactions = remainingTransactions;
  }

  return removedTransaction;
}

/**
 * Helper to verify whether two YYYY-MM strings are immediately consecutive
 * calendar months (including across a December -> January year boundary).
 * @param {string} previousMonth
 * @param {string} currentMonth
 * @returns {boolean}
 */
function isNextCalendarMonth(previousMonth, currentMonth) {
  const prevYear = Number(previousMonth.slice(0, 4));
  const prevMonthNum = Number(previousMonth.slice(5, 7));
  const currYear = Number(currentMonth.slice(0, 4));
  const currMonthNum = Number(currentMonth.slice(5, 7));

  const expectedYear = prevMonthNum === 12 ? prevYear + 1 : prevYear;
  const expectedMonth = prevMonthNum === 12 ? 1 : prevMonthNum + 1;

  return currYear === expectedYear && currMonthNum === expectedMonth;
}

/*
 * BONUS: findConsecutiveExpensiveMonths(expenseThreshold)
 *
 * This is the most complex function in the tracker. It identifies streaks of
 * back-to-back calendar months where total spending exceeds a given euro threshold.
 *
 * Step-by-step algorithm:
 * 1. Aggregate all transactions by month using groupTransactionsByMonth() and
 *    sort the YYYY-MM keys chronologically so months are inspected in order.
 * 2. Walk through the sorted month keys using a `while` loop, maintaining:
 *      - `currentStreak`: the active run of consecutive expensive months
 *      - `allStreaks`: every completed streak with at least 2 consecutive months
 *      - `longestStreak`: the longest streak seen so far
 * 3. For each month:
 *      - Check if `totalExpenses > expenseThreshold`.
 *      - If true, check whether `currentStreak` is empty OR if this month is
 *        immediately consecutive to the previous month in `currentStreak`
 *        (handling year transitions such as 2025-12 -> 2026-01).
 *      - If consecutive, extend `currentStreak`; if there was a calendar gap,
 *        finalize the previous streak and start a new streak with this month.
 *      - If expenses are at or below the threshold, finalize `currentStreak`
 *        and reset it.
 * 4. After the loop terminates, finalize any trailing streak still in progress
 *    and return a structured summary object with `threshold`, `longestStreak`,
 *    and `allStreaks`.
 */
function findConsecutiveExpensiveMonths(expenseThreshold) {
  const groupedByMonth = groupTransactionsByMonth();
  const sortedMonths = Object.keys(groupedByMonth).sort();

  const allStreaks = [];
  let currentStreak = [];
  let longestStreak = [];

  const recordStreakIfQualified = (streak) => {
    if (streak.length >= 2) {
      allStreaks.push(streak.slice());
      if (streak.length > longestStreak.length) {
        longestStreak = streak.slice();
      }
    }
  };

  let index = 0;
  while (index < sortedMonths.length) {
    const month = sortedMonths[index];
    const { totalExpenses } = groupedByMonth[month];

    if (totalExpenses > expenseThreshold) {
      const monthEntry = { month, totalExpenses };

      if (currentStreak.length === 0) {
        currentStreak.push(monthEntry);
      } else {
        const previousEntry = currentStreak[currentStreak.length - 1];
        if (isNextCalendarMonth(previousEntry.month, month)) {
          currentStreak.push(monthEntry);
        } else {
          recordStreakIfQualified(currentStreak);
          currentStreak = [monthEntry];
        }
      }
    } else {
      recordStreakIfQualified(currentStreak);
      currentStreak = [];
    }

    index += 1;
  }

  // Finalize any active streak at the end of the dataset.
  recordStreakIfQualified(currentStreak);

  return {
    threshold: expenseThreshold,
    longestStreak,
    allStreaks,
  };
}

module.exports = {
  getTransactions,
  addTransaction,
  getTotalIncome,
  getTotalExpenses,
  getBalance,
  getTransactionsByCategory,
  getLargestExpense,
  getTransactionsByDateRange,
  groupTransactionsByMonth,
  getAverageExpenseByCategory,
  removeTransactionById,
  findConsecutiveExpensiveMonths,
};
