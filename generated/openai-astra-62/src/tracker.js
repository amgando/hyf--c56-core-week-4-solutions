const chalk = require('chalk');
const sample = require('./data');

const money = new Intl.NumberFormat('en-IE', {
  style: 'currency',
  currency: 'EUR',
});
function checkDate(date) {
  const parsed = new Date(date);
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
    !Number.isFinite(parsed.valueOf()) ||
    parsed.toISOString().slice(0, 10) !== date
  )
    throw new Error('Enter a real date in YYYY-MM-DD format.');
}
function cents(amount) {
  return Math.round(amount * 100);
}
function createTracker(initial = sample, print = console.log) {
  const transactions = [];
  let nextId = 1;
  function addTransaction(newTransaction) {
    const {
      id = nextId,
      type,
      category,
      description,
      amount,
      date,
    } = newTransaction;
    if (
      !Number.isSafeInteger(id) ||
      id < 1 ||
      transactions.some((item) => item.id === id)
    )
      throw new Error('Use a unique positive integer ID.');
    if (!['income', 'expense'].includes(type))
      throw new Error('Type must be income or expense.');
    if (
      ![category, description].every(
        (value) => typeof value === 'string' && value.trim(),
      )
    )
      throw new Error('Enter a category and description.');
    if (
      !Number.isSafeInteger(cents(amount)) ||
      amount <= 0 ||
      cents(amount) / 100 !== amount
    )
      throw new Error(
        'Enter a positive amount with at most two decimal places.',
      );
    checkDate(date);
    transactions.push({
      ...newTransaction,
      id,
      category: category.trim(),
      description: description.trim(),
    });
    nextId = Math.max(nextId, id + 1);
    return id;
  }
  for (const item of initial) addTransaction(item);
  function totalCents(type) {
    let total = 0;
    for (const item of transactions)
      if (item.type === type) total += cents(item.amount);
    return total;
  }
  function getTotalIncome() {
    return totalCents('income') / 100;
  }
  function getTotalExpenses() {
    return totalCents('expense') / 100;
  }
  function getBalance() {
    return (totalCents('income') - totalCents('expense')) / 100;
  }
  function getTransactionsByCategory(category) {
    const matches = [];
    for (const item of transactions)
      if (item.category === category) matches.push(item);
    return matches;
  }
  function getLargestExpense() {
    let largest = null;
    for (const item of transactions)
      if (item.type === 'expense' && (!largest || item.amount > largest.amount))
        largest = item;
    return largest;
  }
  function printTransactions(items) {
    if (!items.length) print('No transactions.');
    for (const { id, type, description, amount, category, date } of items) {
      const color = type === 'income' ? chalk.green : chalk.red;
      print(
        `${id}. [${type.toUpperCase()}] ${description} - ${color(money.format(amount))} (${chalk.yellow(category)}) · ${date}`,
      );
    }
  }
  function printAllTransactions() {
    print('All Transactions:');
    printTransactions(transactions);
  }
  function printSummary() {
    const balance = getBalance();
    const largest = getLargestExpense();
    print(chalk.bold('Financial Summary'));
    print(
      chalk.bold(
        'Total Income: ' + chalk.green(money.format(getTotalIncome())),
      ),
    );
    print(
      chalk.bold(
        'Total Expenses: ' + chalk.red(money.format(getTotalExpenses())),
      ),
    );
    print(
      chalk.bold(
        'Current Balance: ' +
          (balance < 0 ? chalk.red : chalk.cyan)(money.format(balance)),
      ),
    );
    print(chalk.bold('Total Transactions: ' + transactions.length));
    print(
      chalk.bold(
        'Largest Expense: ' +
          (largest
            ? largest.description +
              ' (' +
              chalk.red(money.format(largest.amount)) +
              ')'
            : 'None'),
      ),
    );
  }
  function searchByDateRange(start, end) {
    checkDate(start);
    checkDate(end);
    if (start > end) throw new Error('Start date must come first.');
    const sorted = transactions
      .slice()
      .sort((a, b) => a.date.localeCompare(b.date));
    const first = sorted.findIndex((item) => item.date >= start);
    if (first === -1) return [];
    const after = sorted.findIndex((item) => item.date > end);
    return sorted.slice(first, after === -1 ? sorted.length : after);
  }
  function groupByMonth() {
    const years = {};
    for (const item of transactions) {
      const [year, month] = item.date.split('-');
      years[year] ??= {};
      years[year][month] ??= [];
      years[year][month].push(item);
    }
    return years;
  }
  function averageExpenseByCategory() {
    const groups = new Map();
    for (const { type, category, amount } of transactions) {
      if (type !== 'expense') continue;
      const group = groups.get(category) ?? { sum: 0, count: 0 };
      group.sum += cents(amount);
      group.count++;
      groups.set(category, group);
    }
    return Object.fromEntries(
      Array.from(groups, ([category, { sum, count }]) => [
        category,
        sum / count / 100,
      ]),
    );
  }
  function removeTransaction(id) {
    const index = transactions.findIndex((item) => item.id === id);
    if (index === -1) return false;
    transactions.splice(index, 1);
    return true;
  }
  /*
   * Sort expense-bearing months chronologically, then scan each qualifying run once.
   * A year-based month number makes December and the following January adjacent.
   * A missing month or a total at or below the threshold ends a run.
   */
  function consecutiveExpensiveMonths(threshold) {
    if (!Number.isFinite(threshold) || threshold < 0)
      throw new Error('Enter a nonnegative threshold.');
    const totals = new Map();
    for (const { date, type, amount } of transactions) {
      if (type !== 'expense') continue;
      const month = date.slice(0, 7);
      totals.set(month, (totals.get(month) ?? 0) + cents(amount));
    }
    const months = [...totals.keys()].sort();
    const number = (month) =>
      Number(month.slice(0, 4)) * 12 + Number(month.slice(5));
    const runs = [];
    let index = 0;
    while (index < months.length) {
      const start = index++;
      if (totals.get(months[start]) / 100 <= threshold) continue;
      while (
        index < months.length &&
        number(months[index]) === number(months[index - 1]) + 1 &&
        totals.get(months[index]) / 100 > threshold
      )
        index++;
      if (index - start >= 2) runs.push(months.slice(start, index));
    }
    return runs;
  }
  return {
    addTransaction,
    getTotalIncome,
    getTotalExpenses,
    getBalance,
    getTransactionsByCategory,
    getLargestExpense,
    printTransactions,
    printAllTransactions,
    printSummary,
    searchByDateRange,
    groupByMonth,
    averageExpenseByCategory,
    removeTransaction,
    consecutiveExpensiveMonths,
  };
}
module.exports = { createTracker, money };
