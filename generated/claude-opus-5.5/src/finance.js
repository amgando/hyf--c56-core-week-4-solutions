const { transactions } = require('./data');

// ---------- Core functions ----------

// Add a new transaction. The id is generated here so callers cannot clash.
function addTransaction(newTransaction) {
  let highestId = 0;
  for (const transaction of transactions) {
    if (transaction.id > highestId) {
      highestId = transaction.id;
    }
  }

  // Spread copies the caller's object, so later changes to it do not leak in.
  const transactionToAdd = { ...newTransaction, id: highestId + 1 };
  transactions.push(transactionToAdd);
  return transactionToAdd;
}

// Sum all income with a classic for loop.
function getTotalIncome() {
  let totalIncome = 0;
  for (let i = 0; i < transactions.length; i++) {
    if (transactions[i].type === 'income') {
      totalIncome += transactions[i].amount;
    }
  }
  return totalIncome;
}

// Sum all expenses with a for...of loop and destructuring.
function getTotalExpenses() {
  let totalExpenses = 0;
  for (const { type, amount } of transactions) {
    if (type === 'expense') {
      totalExpenses += amount;
    }
  }
  return totalExpenses;
}

function getBalance() {
  return getTotalIncome() - getTotalExpenses();
}

// Filter by category with a loop + push.
function getTransactionsByCategory(category) {
  const matchingTransactions = [];
  for (const transaction of transactions) {
    if (transaction.category === category) {
      matchingTransactions.push(transaction);
    }
  }
  return matchingTransactions;
}

// Returns the whole expense object (not just the amount), so the summary
// can show its description. Returns null when there are no expenses.
function getLargestExpense() {
  let largestExpense = null;
  for (const transaction of transactions) {
    if (transaction.type !== 'expense') {
      continue;
    }
    if (largestExpense === null || transaction.amount > largestExpense.amount) {
      largestExpense = transaction;
    }
  }
  return largestExpense;
}

// ---------- Bonus functions ----------

// Remove a transaction by id. Returns the removed transaction, or null.
function removeTransactionById(id) {
  const index = transactions.findIndex((transaction) => transaction.id === id);
  if (index === -1) {
    return null;
  }
  const [removedTransaction] = transactions.splice(index, 1);
  return removedTransaction;
}

// Transactions between two dates (inclusive), found with slice.
// Dates in 'YYYY-MM-DD' format sort correctly as plain strings.
function getTransactionsByDateRange(startDate, endDate) {
  const sortedByDate = [...transactions].sort((a, b) =>
    a.date.localeCompare(b.date)
  );

  // Find the first index on or after startDate.
  let startIndex = 0;
  while (
    startIndex < sortedByDate.length &&
    sortedByDate[startIndex].date < startDate
  ) {
    startIndex++;
  }

  // Find the first index after endDate. slice() stops just before it.
  let endIndex = startIndex;
  while (
    endIndex < sortedByDate.length &&
    sortedByDate[endIndex].date <= endDate
  ) {
    endIndex++;
  }

  return sortedByDate.slice(startIndex, endIndex);
}

// Group by month into a nested object:
// { '2025-01': { income: [...], expense: [...] }, ... }
function groupTransactionsByMonth() {
  const transactionsByMonth = {};
  for (const transaction of transactions) {
    const month = transaction.date.slice(0, 7); // 'YYYY-MM'
    if (!transactionsByMonth[month]) {
      transactionsByMonth[month] = { income: [], expense: [] };
    }
    transactionsByMonth[month][transaction.type].push(transaction);
  }
  return transactionsByMonth;
}

// Average expense per category: { housing: 1200, food: 333.33, ... }
function getAverageExpensePerCategory() {
  const totals = {}; // { category: { sum, count } }
  for (const { type, category, amount } of transactions) {
    if (type !== 'expense') {
      continue;
    }
    if (!totals[category]) {
      totals[category] = { sum: 0, count: 0 };
    }
    totals[category].sum += amount;
    totals[category].count++;
  }

  const averages = {};
  for (const category in totals) {
    const { sum, count } = totals[category];
    averages[category] = Math.round((sum / count) * 100) / 100;
  }
  return averages;
}

/*
 * findConsecutiveExpensiveMonths(threshold)
 *
 * Goal: find the longest run of calendar months, back to back, where total
 * expenses in each month are above `threshold`.
 *
 * Steps:
 * 1. Total the expenses per month ('YYYY-MM' -> amount).
 * 2. Sort the months so they are in time order.
 * 3. Walk the sorted months with a while loop, keeping a "current run".
 *    A month extends the run only if:
 *      - its total is above the threshold, AND
 *      - it is exactly one calendar month after the previous month in the
 *        run (so January -> March does not count as consecutive).
 *    Otherwise the run restarts (or is emptied if the month is cheap).
 * 4. Every time the current run grows past the best run so far, save it.
 *
 * Returns an array like [{ month: '2025-01', total: 1650 }, ...],
 * or an empty array when no month is above the threshold.
 */
function findConsecutiveExpensiveMonths(threshold) {
  const expensesByMonth = {};
  for (const { type, amount, date } of transactions) {
    if (type === 'expense') {
      const month = date.slice(0, 7);
      expensesByMonth[month] = (expensesByMonth[month] || 0) + amount;
    }
  }

  const sortedMonths = Object.keys(expensesByMonth).sort();

  let bestRun = [];
  let currentRun = [];
  let index = 0;

  while (index < sortedMonths.length) {
    const month = sortedMonths[index];
    const total = expensesByMonth[month];

    if (total > threshold) {
      const previous = currentRun[currentRun.length - 1];
      if (previous && isNextMonth(previous.month, month)) {
        currentRun.push({ month, total });
      } else {
        currentRun = [{ month, total }];
      }
      if (currentRun.length > bestRun.length) {
        bestRun = [...currentRun];
      }
    } else {
      currentRun = [];
    }

    index++;
  }

  return bestRun;
}

// True when `month` is the calendar month right after `previousMonth`.
// Both are 'YYYY-MM' strings.
function isNextMonth(previousMonth, month) {
  const [prevYear, prevMonthNumber] = previousMonth.split('-').map(Number);
  const [year, monthNumber] = month.split('-').map(Number);
  return year * 12 + monthNumber === prevYear * 12 + prevMonthNumber + 1;
}

module.exports = {
  transactions,
  addTransaction,
  getTotalIncome,
  getTotalExpenses,
  getBalance,
  getTransactionsByCategory,
  getLargestExpense,
  removeTransactionById,
  getTransactionsByDateRange,
  groupTransactionsByMonth,
  getAverageExpensePerCategory,
  findConsecutiveExpensiveMonths,
};
