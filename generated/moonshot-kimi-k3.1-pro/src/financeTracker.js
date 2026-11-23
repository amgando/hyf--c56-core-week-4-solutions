const chalk = require('chalk');
const transactions = require('./transactions');

function formatCurrency(amount) {
  return `€${amount.toLocaleString('en-IE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function addTransaction(newTransaction) {
  // Store a new object so the original input object is not inserted directly.
  const transactionToAdd = { ...newTransaction };
  transactions.push(transactionToAdd);
  return transactionToAdd;
}

function getTotalIncome() {
  let totalIncome = 0;

  for (const { type, amount } of transactions) {
    if (type === 'income') {
      totalIncome += amount;
    }
  }

  return totalIncome;
}

function getTotalExpenses() {
  let totalExpenses = 0;

  for (const transaction of transactions) {
    if (transaction.type === 'expense') {
      totalExpenses += transaction.amount;
    }
  }

  return totalExpenses;
}

function getBalance() {
  return getTotalIncome() - getTotalExpenses();
}

function getTransactionsByCategory(category) {
  const matchingTransactions = [];

  for (const transaction of transactions) {
    if (transaction.category === category) {
      matchingTransactions.push(transaction);
    }
  }

  return matchingTransactions;
}

function getLargestExpense() {
  let largestExpense = null;

  for (const transaction of transactions) {
    if (transaction.type !== 'expense') {
      continue;
    }

    if (!largestExpense || transaction.amount > largestExpense.amount) {
      largestExpense = transaction;
    }
  }

  return largestExpense;
}

function printAllTransactions() {
  console.log(chalk.bold('\nAll Transactions:'));

  if (transactions.length === 0) {
    console.log('No transactions recorded.');
    return;
  }

  transactions.forEach((transaction) => {
    const { id, type, category, amount, description, date } = transaction;
    const isIncome = type === 'income';
    const entryColour = isIncome ? chalk.green : chalk.red;
    const typeLabel = isIncome ? '[INCOME]' : '[EXPENSE]';
    const colouredType = entryColour(typeLabel);
    const colouredAmount = entryColour(formatCurrency(amount));
    const colouredCategory = chalk.yellow(category);

    console.log(
      `${id}. ${colouredType} ${description} - ${colouredAmount}`,
      `(${colouredCategory})`,
      chalk.gray(date),
    );
  });
}

function printSummary() {
  const totalIncome = getTotalIncome();
  const totalExpenses = getTotalExpenses();
  const balance = getBalance();
  const largestExpense = getLargestExpense();
  const balanceColour = balance < 0 ? chalk.red : chalk.cyan;
  const largestExpenseDetails = largestExpense
    ? `${largestExpense.description} (${formatCurrency(largestExpense.amount)})`
    : 'No expenses recorded';

  console.log(chalk.bold('\n📊 FINANCIAL SUMMARY 📊'));
  console.log(
    chalk.bold('Total Income: ') +
      chalk.green.bold(formatCurrency(totalIncome)),
  );
  console.log(
    chalk.bold('Total Expenses: ') +
      chalk.red.bold(formatCurrency(totalExpenses)),
  );
  console.log(
    chalk.bold('Current Balance: ') +
      balanceColour.bold(formatCurrency(balance)),
  );
  console.log(chalk.bold(`Largest Expense: ${largestExpenseDetails}`));
  console.log(chalk.bold(`Total Transactions: ${transactions.length}`));
}

function getTransactionsByDateRange(startDate, endDate) {
  if (startDate > endDate) {
    return [];
  }

  const sortedTransactions = [...transactions].sort((first, second) =>
    first.date.localeCompare(second.date),
  );
  const startIndex = sortedTransactions.findIndex(
    ({ date }) => date >= startDate,
  );

  if (startIndex === -1) {
    return [];
  }

  let endIndex = sortedTransactions.length;

  // Find the first transaction beyond the range, then slice inclusively.
  for (let index = startIndex; index < sortedTransactions.length; index += 1) {
    if (sortedTransactions[index].date > endDate) {
      endIndex = index;
      break;
    }
  }

  return sortedTransactions.slice(startIndex, endIndex);
}

function groupTransactionsByMonth() {
  const transactionsByMonth = {};

  for (const transaction of transactions) {
    const month = transaction.date.slice(0, 7);

    if (!transactionsByMonth[month]) {
      transactionsByMonth[month] = { income: [], expense: [] };
    }

    transactionsByMonth[month][transaction.type].push(transaction);
  }

  return transactionsByMonth;
}

function getAverageExpensePerCategory() {
  const categoryTotals = {};

  for (const { type, category, amount } of transactions) {
    if (type !== 'expense') {
      continue;
    }

    if (!categoryTotals[category]) {
      categoryTotals[category] = { total: 0, count: 0 };
    }

    categoryTotals[category].total += amount;
    categoryTotals[category].count += 1;
  }

  const averageExpenses = {};

  for (const [category, { total, count }] of Object.entries(categoryTotals)) {
    averageExpenses[category] = total / count;
  }

  return averageExpenses;
}

function removeTransactionById(id) {
  const transactionIndex = transactions.findIndex(
    (transaction) => transaction.id === id,
  );

  if (transactionIndex === -1) {
    return null;
  }

  const [removedTransaction] = transactions.splice(transactionIndex, 1);
  return removedTransaction;
}

function getMonthlyExpenseTotals() {
  const monthlyExpenseTotals = {};

  for (const { date, type, amount } of transactions) {
    if (type !== 'expense') {
      continue;
    }

    const month = date.slice(0, 7);
    monthlyExpenseTotals[month] =
      (monthlyExpenseTotals[month] || 0) + amount;
  }

  return monthlyExpenseTotals;
}

function getFollowingMonth(month) {
  const [year, monthNumber] = month.split('-').map(Number);

  if (monthNumber === 12) {
    return `${year + 1}-01`;
  }

  return `${year}-${String(monthNumber + 1).padStart(2, '0')}`;
}

function findConsecutiveExpensiveMonths(
  expenseThreshold = 1500,
  minimumStreakLength = 2,
) {
  const monthlyExpenseTotals = getMonthlyExpenseTotals();
  const sortedMonths = Object.keys(monthlyExpenseTotals).sort();
  const expensiveStreaks = [];
  let currentStreak = [];
  let monthIndex = 0;

  /*
   * A streak continues only when the current month is expensive and directly
   * follows the previous month in the streak. Otherwise, the old streak is
   * saved if it is long enough, and a new streak may begin. Checking calendar
   * adjacency prevents January and March from counting as consecutive when
   * February has no recorded expenses. The final streak is saved after the
   * while loop because it may still be active when the months are exhausted.
   */
  while (monthIndex < sortedMonths.length) {
    const month = sortedMonths[monthIndex];
    const isExpensive = monthlyExpenseTotals[month] >= expenseThreshold;
    const previousMonth = currentStreak[currentStreak.length - 1];
    const continuesStreak =
      currentStreak.length > 0 && getFollowingMonth(previousMonth) === month;

    if (isExpensive && (currentStreak.length === 0 || continuesStreak)) {
      currentStreak.push(month);
    } else {
      if (currentStreak.length >= minimumStreakLength) {
        expensiveStreaks.push([...currentStreak]);
      }

      currentStreak = isExpensive ? [month] : [];
    }

    monthIndex += 1;
  }

  if (currentStreak.length >= minimumStreakLength) {
    expensiveStreaks.push([...currentStreak]);
  }

  return expensiveStreaks;
}

module.exports = {
  transactions,
  addTransaction,
  getTotalIncome,
  getTotalExpenses,
  getBalance,
  getTransactionsByCategory,
  getLargestExpense,
  printAllTransactions,
  printSummary,
  getTransactionsByDateRange,
  groupTransactionsByMonth,
  getAverageExpensePerCategory,
  removeTransactionById,
  findConsecutiveExpensiveMonths,
  formatCurrency,
};
