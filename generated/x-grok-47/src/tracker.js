const { initialTransactions } = require('./data');

const transactions = [];

for (const transaction of initialTransactions) {
  transactions.push({ ...transaction });
}

function createNextId() {
  let maxId = 0;

  for (const transaction of transactions) {
    if (transaction.id > maxId) {
      maxId = transaction.id;
    }
  }

  return maxId + 1;
}

function addTransaction(newTransaction) {
  const storedTransaction = {
    ...newTransaction,
    id: newTransaction.id ?? createNextId()
  };

  transactions.push(storedTransaction);
  return { ...storedTransaction };
}

function removeTransaction(id) {
  let foundIndex = -1;

  for (let index = 0; index < transactions.length; index += 1) {
    if (transactions[index].id === id) {
      foundIndex = index;
      break;
    }
  }

  if (foundIndex === -1) {
    return null;
  }

  const [removedTransaction] = transactions.splice(foundIndex, 1);
  return removedTransaction;
}

function getTransactions() {
  return [...transactions];
}

function getTotalIncome() {
  let totalIncome = 0;

  for (let index = 0; index < transactions.length; index += 1) {
    const { type, amount } = transactions[index];

    if (type === 'income') {
      totalIncome += amount;
    }
  }

  return totalIncome;
}

function getTotalExpenses() {
  let totalExpenses = 0;

  for (const transaction of transactions) {
    const { type, amount } = transaction;

    if (type === 'expense') {
      totalExpenses += amount;
    }
  }

  return totalExpenses;
}

function getBalance() {
  return getTotalIncome() - getTotalExpenses();
}

function getTransactionsByCategory(category) {
  const matches = [];
  const needle = String(category).toLowerCase();

  for (let index = 0; index < transactions.length; index += 1) {
    const transaction = transactions[index];
    const { category: transactionCategory } = transaction;

    if (transactionCategory.toLowerCase().includes(needle)) {
      matches.push(transaction);
    }
  }

  return matches;
}

// The copy is ordered by date, so slice returns one inclusive window.
function getTransactionsByDateRange(startDate, endDate) {
  const chronological = [...transactions].sort((left, right) =>
    left.date.localeCompare(right.date)
  );

  let rangeStart = 0;

  while (
    rangeStart < chronological.length &&
    chronological[rangeStart].date < startDate
  ) {
    rangeStart += 1;
  }

  let rangeEnd = rangeStart;

  while (
    rangeEnd < chronological.length &&
    chronological[rangeEnd].date <= endDate
  ) {
    rangeEnd += 1;
  }

  return chronological.slice(rangeStart, rangeEnd);
}

function getLargestExpense() {
  let largestExpense = null;

  for (const transaction of transactions) {
    const { type, amount } = transaction;

    if (type !== 'expense') {
      continue;
    }

    if (largestExpense === null || amount > largestExpense.amount) {
      largestExpense = transaction;
    }
  }

  return largestExpense;
}

function groupTransactionsByMonth() {
  const grouped = {};

  for (const transaction of transactions) {
    const { date, type, category } = transaction;
    const monthKey = date.slice(0, 7);

    if (!grouped[monthKey]) {
      grouped[monthKey] = {
        income: {},
        expense: {}
      };
    }

    const categoryGroups = grouped[monthKey][type];

    if (!categoryGroups[category]) {
      categoryGroups[category] = [];
    }

    categoryGroups[category].push(transaction);
  }

  return grouped;
}

function getAverageExpenseByCategory() {
  const totalsByCategory = {};
  const countsByCategory = {};

  for (const transaction of transactions) {
    const { type, category, amount } = transaction;

    if (type !== 'expense') {
      continue;
    }

    if (totalsByCategory[category] === undefined) {
      totalsByCategory[category] = 0;
      countsByCategory[category] = 0;
    }

    totalsByCategory[category] += amount;
    countsByCategory[category] += 1;
  }

  const averages = {};
  const categories = Object.keys(totalsByCategory);

  for (let index = 0; index < categories.length; index += 1) {
    const category = categories[index];
    averages[category] =
      totalsByCategory[category] / countsByCategory[category];
  }

  return averages;
}

function isNextCalendarMonth(currentKey, nextKey) {
  const [currentYear, currentMonth] = currentKey.split('-').map(Number);
  const [nextYear, nextMonth] = nextKey.split('-').map(Number);
  const currentIndex = currentYear * 12 + (currentMonth - 1);
  const nextIndex = nextYear * 12 + (nextMonth - 1);

  return nextIndex - currentIndex === 1;
}

/*
 * Finds runs of consecutive calendar months whose expenses exceed a threshold.
 *
 * Expense totals are collected per month, then the month keys are sorted from
 * earliest to latest. A month is expensive when its total is above `threshold`.
 * The outer while loop walks that ordered list. When it finds an expensive
 * month it opens a run. The inner while loop extends the run only while the
 * next entry is both expensive and exactly one calendar month later. A cheaper
 * month, or a gap in the calendar, closes the run. Runs shorter than
 * `minimumRunLength` are left out, because a single month is not consecutive.
 *
 * Each returned run is an array of { month, total } objects in calendar order.
 */
function findConsecutiveExpensiveMonths(threshold, minimumRunLength = 2) {
  const expensesByMonth = {};

  for (const transaction of transactions) {
    if (transaction.type !== 'expense') {
      continue;
    }

    const monthKey = transaction.date.slice(0, 7);
    const previousTotal = expensesByMonth[monthKey] ?? 0;
    expensesByMonth[monthKey] = previousTotal + transaction.amount;
  }

  const monthKeys = Object.keys(expensesByMonth).sort();
  const runs = [];
  let index = 0;

  while (index < monthKeys.length) {
    const monthKey = monthKeys[index];
    const monthTotal = expensesByMonth[monthKey];

    if (monthTotal <= threshold) {
      index += 1;
      continue;
    }

    const run = [{ month: monthKey, total: monthTotal }];
    let cursor = index;

    while (cursor + 1 < monthKeys.length) {
      const currentKey = monthKeys[cursor];
      const nextKey = monthKeys[cursor + 1];
      const nextTotal = expensesByMonth[nextKey];
      const followsImmediately = isNextCalendarMonth(currentKey, nextKey);

      if (!followsImmediately || nextTotal <= threshold) {
        break;
      }

      run.push({ month: nextKey, total: nextTotal });
      cursor += 1;
    }

    if (run.length >= minimumRunLength) {
      runs.push(run);
    }

    index = cursor + 1;
  }

  return runs;
}

module.exports = {
  addTransaction,
  removeTransaction,
  getTransactions,
  getTotalIncome,
  getTotalExpenses,
  getBalance,
  getTransactionsByCategory,
  getTransactionsByDateRange,
  getLargestExpense,
  groupTransactionsByMonth,
  getAverageExpenseByCategory,
  findConsecutiveExpensiveMonths
};
