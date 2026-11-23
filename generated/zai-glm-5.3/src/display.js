const chalk = require('chalk');

const finance = require('./finance');

/**
 * Format an amount as a euro string, for example 1200 -> '€1200'.
 *
 * @param {number} amount - amount in euros
 * @returns {string} the amount with a euro sign
 */
function formatAmount(amount) {
  return `€${amount}`;
}

/**
 * Colour an amount green for income or red for expenses.
 *
 * @param {string} type - 'income' or 'expense'
 * @param {number} amount - amount in euros
 * @returns {string} the coloured amount
 */
function colorAmount(type, amount) {
  if (type === 'income') {
    return chalk.green(formatAmount(amount));
  }
  return chalk.red(formatAmount(amount));
}

/**
 * Print one transaction line, for example:
 * 1. [INCOME] Monthly salary - €3000 (salary)
 *
 * @param {object} transaction - a single transaction object
 */
function printTransaction(transaction) {
  // Object destructuring pulls the fields out of the transaction object
  const { id, type, description, amount, category } = transaction;

  const typeLabel = type === 'income' ? 'INCOME' : 'EXPENSE';
  const amountText = colorAmount(type, amount);
  const categoryText = chalk.yellow(`(${category})`);

  console.log(
    `${id}. [${typeLabel}] ${description} - ${amountText} ${categoryText}`,
  );
}

/**
 * Print a list of transactions, one line per transaction.
 *
 * @param {Array<object>} transactions - the transactions to print
 */
function printTransactionList(transactions) {
  for (const transaction of transactions) {
    printTransaction(transaction);
  }
}

/**
 * Print every transaction in the tracker.
 */
function printAllTransactions() {
  console.log(chalk.bold('All Transactions:'));
  printTransactionList(finance.getAllTransactions());
}

/**
 * Print the summary report: totals, balance, number of transactions
 * and the largest expense with its description.
 */
function printSummary() {
  const totalIncome = finance.getTotalIncome();
  const totalExpenses = finance.getTotalExpenses();
  const balance = finance.getBalance();
  const largestExpense = finance.getLargestExpense();
  const transactionCount = finance.getTransactionCount();

  console.log(chalk.bold('📊 FINANCIAL SUMMARY 📊'));

  const incomeText = chalk.green.bold(formatAmount(totalIncome));
  const expensesText = chalk.red.bold(formatAmount(totalExpenses));

  // The balance is cyan, unless it is negative: then it turns red
  let balanceText = chalk.cyan.bold(formatAmount(balance));
  if (balance < 0) {
    balanceText = chalk.red.bold(formatAmount(balance));
  }

  console.log(`${chalk.bold('Total Income:')} ${incomeText}`);
  console.log(`${chalk.bold('Total Expenses:')} ${expensesText}`);
  console.log(`${chalk.bold('Current Balance:')} ${balanceText}`);
  console.log('');

  if (largestExpense === null) {
    console.log(chalk.bold('Largest Expense: none'));
  } else {
    // Object destructuring of the largest expense transaction
    const { description, amount } = largestExpense;
    const largestAmountText = chalk.red.bold(formatAmount(amount));

    console.log(
      `${chalk.bold('Largest Expense:')} ${description} (${largestAmountText})`,
    );
  }

  console.log(`${chalk.bold('Total Transactions:')} ${transactionCount}`);
}

/**
 * Print all transactions that match a category.
 *
 * @param {string} category - category name to search for
 */
function printTransactionsByCategory(category) {
  const categoryText = chalk.yellow(category);
  const matchingTransactions = finance.getTransactionsByCategory(category);

  console.log(`${chalk.bold('Category:')} ${categoryText}`);
  printTransactionList(matchingTransactions);
}

/**
 * Print all transactions between two dates.
 *
 * @param {string} startDate - first day of the range (inclusive)
 * @param {string} endDate - last day of the range (inclusive)
 */
function printTransactionsInDateRange(startDate, endDate) {
  const transactionsInRange = finance.getTransactionsInDateRange(
    startDate,
    endDate,
  );

  console.log(
    `${chalk.bold('Transactions between')} ${startDate} and ${endDate}:`,
  );
  printTransactionList(transactionsInRange);
}

/**
 * Print the income, expenses and balance of every month (bonus).
 */
function printMonthlyReport() {
  const transactionsByMonth = finance.groupTransactionsByMonth();
  const sortedMonths = Object.keys(transactionsByMonth).sort();

  console.log(chalk.bold('📅 MONTHLY OVERVIEW 📅'));

  for (const month of sortedMonths) {
    // Object destructuring pulls the month totals out of the month group
    const { income, expenses } = transactionsByMonth[month];
    const monthBalance = income - expenses;

    const incomeText = chalk.green(formatAmount(income));
    const expensesText = chalk.red(formatAmount(expenses));

    // Balance in cyan, or red when the month ended negative
    let balance = chalk.cyan(formatAmount(monthBalance));
    if (monthBalance < 0) {
      balance = chalk.red(formatAmount(monthBalance));
    }

    console.log(
      `${month}: in ${incomeText}, out ${expensesText}, balance ${balance}`,
    );
  }
}

/**
 * Print the average expense amount of every category (bonus).
 */
function printAverageExpensePerCategory() {
  const averagesByCategory = finance.getAverageExpensePerCategory();
  const categories = Object.keys(averagesByCategory).sort();

  console.log(chalk.bold('🧮 AVERAGE EXPENSE PER CATEGORY 🧮'));

  for (const category of categories) {
    const categoryText = chalk.yellow(category);
    const averageText = formatAmount(averagesByCategory[category]);

    console.log(`${categoryText}: ${averageText}`);
  }
}

/**
 * Print the longest streak of expensive months (bonus).
 *
 * @param {number} threshold - monthly expense total that counts
 *   as expensive
 */
function printExpenseStreak(threshold) {
  const streak = finance.getLongestExpensiveMonthStreak(threshold);
  const label = chalk.bold(`Expensive months in a row (over €${threshold}):`);

  console.log(`${label} ${streak}`);
}

module.exports = {
  printTransaction,
  printTransactionList,
  printAllTransactions,
  printSummary,
  printTransactionsByCategory,
  printTransactionsInDateRange,
  printMonthlyReport,
  printAverageExpensePerCategory,
  printExpenseStreak,
};
