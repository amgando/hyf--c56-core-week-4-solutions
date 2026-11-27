const chalk = require('chalk');
const {
  getTransactions,
  getTotalIncome,
  getTotalExpenses,
  getBalance,
  getLargestExpense,
} = require('./finance');

/**
 * Formats a numeric euro amount cleanly without trailing .00 for integers.
 * @param {number} amount
 * @returns {string}
 */
function formatCurrency(amount) {
  const isNegative = amount < 0;
  const absValue = Math.abs(amount);
  const formattedNumber = Number.isInteger(absValue)
    ? String(absValue)
    : absValue.toFixed(2);
  return `${isNegative ? '-' : ''}€${formattedNumber}`;
}

/**
 * Prints the main application banner.
 */
function printHeader() {
  console.log(chalk.bold.cyan('\n💰 PERSONAL FINANCE TRACKER 💰\n'));
}

/**
 * Prints a formatted list of transactions using Chalk colour-coding
 * and object destructuring.
 * @param {Array<object>} [transactionList]
 */
function printAllTransactions(transactionList = getTransactions()) {
  console.log(chalk.bold('All Transactions:'));

  if (transactionList.length === 0) {
    console.log(chalk.gray('  No transactions recorded.'));
    return;
  }

  for (let i = 0; i < transactionList.length; i++) {
    // Demonstrate object destructuring
    const { id, type, category, amount, description, date } =
      transactionList[i];
    const isIncome = type === 'income';
    const typeLabel = isIncome
      ? chalk.green('[INCOME]')
      : chalk.red('[EXPENSE]');
    const formattedAmount = isIncome
      ? chalk.green(formatCurrency(amount))
      : chalk.red(formatCurrency(amount));
    const formattedCategory = chalk.yellow(`(${category})`);

    console.log(
      `${id}. ${typeLabel} ${description} - ${formattedAmount} ${formattedCategory} ${chalk.gray(`[${date}]`)}`
    );
  }
}

/**
 * Prints the financial summary report with Chalk colour-coding:
 * - Income in green
 * - Expenses in red
 * - Balance in cyan (or red if negative)
 * - Category names in yellow
 * - Totals/summaries in bold
 */
function printSummary() {
  const totalIncome = getTotalIncome();
  const totalExpenses = getTotalExpenses();
  const balance = getBalance();
  const largestExpense = getLargestExpense();
  const totalCount = getTransactions().length;

  const balanceDisplay =
    balance >= 0
      ? chalk.bold.cyan(formatCurrency(balance))
      : chalk.bold.red(formatCurrency(balance));

  console.log(chalk.bold('\n📊 FINANCIAL SUMMARY 📊'));
  console.log(
    `${chalk.bold('Total Income:')} ${chalk.bold.green(formatCurrency(totalIncome))}`
  );
  console.log(
    `${chalk.bold('Total Expenses:')} ${chalk.bold.red(formatCurrency(totalExpenses))}`
  );
  console.log(`${chalk.bold('Current Balance:')} ${balanceDisplay}`);

  if (largestExpense) {
    const { description, amount, category } = largestExpense;
    console.log(
      `\n${chalk.bold('Largest Expense:')} ${description} (${chalk.red(formatCurrency(amount))}) ${chalk.yellow(`[${category}]`)}`
    );
  } else {
    console.log(`\n${chalk.bold('Largest Expense:')} None`);
  }

  console.log(`${chalk.bold('Total Transactions:')} ${chalk.bold(totalCount)}`);
}

/**
 * Prints transactions filtered by a specific category.
 * @param {string} category
 * @param {Array<object>} matchingTransactions
 */
function printCategoryTransactions(category, matchingTransactions) {
  console.log(
    chalk.bold(`\n🔍 Transactions in Category: ${chalk.yellow(category)}`)
  );

  if (matchingTransactions.length === 0) {
    console.log(chalk.gray('  No matching transactions found.'));
    return;
  }

  for (const transaction of matchingTransactions) {
    const { id, type, amount, description, date } = transaction;
    const styledAmount =
      type === 'income'
        ? chalk.green(formatCurrency(amount))
        : chalk.red(formatCurrency(amount));

    console.log(
      `  #${id} ${description} - ${styledAmount} ${chalk.gray(`[${date}]`)}`
    );
  }
}

/**
 * Prints transactions matching a date range search.
 * @param {string} startDate
 * @param {string} endDate
 * @param {Array<object>} matchingTransactions
 */
function printDateRangeTransactions(startDate, endDate, matchingTransactions) {
  console.log(
    chalk.bold(
      `\n📅 Transactions from ${chalk.cyan(startDate)} to ${chalk.cyan(endDate)}:`
    )
  );

  if (matchingTransactions.length === 0) {
    console.log(chalk.gray('  No transactions found in this date range.'));
    return;
  }

  for (const transaction of matchingTransactions) {
    const { id, type, category, amount, description, date } = transaction;
    const styledAmount =
      type === 'income'
        ? chalk.green(formatCurrency(amount))
        : chalk.red(formatCurrency(amount));

    console.log(
      `  ${chalk.gray(date)} | #${id} ${description} - ${styledAmount} ${chalk.yellow(`(${category})`)}`
    );
  }
}

/**
 * Prints transactions grouped by month from nested month objects.
 * @param {object} groupedByMonth
 */
function printMonthlyBreakdown(groupedByMonth) {
  console.log(chalk.bold('\n🗓️  Monthly Breakdown:'));
  const sortedMonths = Object.keys(groupedByMonth).sort();

  for (const month of sortedMonths) {
    const { totalIncome, totalExpenses, balance, byType } =
      groupedByMonth[month];
    const transactionCount = byType.income.length + byType.expense.length;
    const balanceText =
      balance >= 0
        ? chalk.cyan(formatCurrency(balance))
        : chalk.red(formatCurrency(balance));

    console.log(
      `  ${chalk.bold(month)} (${transactionCount} txns) | Income: ${chalk.green(formatCurrency(totalIncome))} | Expenses: ${chalk.red(formatCurrency(totalExpenses))} | Net: ${balanceText}`
    );
  }
}

/**
 * Prints average expense per category.
 * @param {object} averagesByCategory
 */
function printAverageExpensesByCategory(averagesByCategory) {
  console.log(chalk.bold('\n📈 Average Expense per Category:'));
  const categories = Object.keys(averagesByCategory).sort();

  for (const category of categories) {
    console.log(
      `  ${chalk.yellow(category)}: ${chalk.red(formatCurrency(averagesByCategory[category]))}`
    );
  }
}

/**
 * Prints consecutive expensive months analysis results.
 * @param {object} analysisResult
 */
function printConsecutiveExpensiveMonths(analysisResult) {
  const { threshold, longestStreak } = analysisResult;

  console.log(
    chalk.bold(
      `\n🔥 Consecutive Expensive Months (Expenses > ${chalk.red(formatCurrency(threshold))}):`
    )
  );

  if (longestStreak.length === 0) {
    console.log(
      chalk.gray('  No consecutive expensive months above this threshold.')
    );
    return;
  }

  const formattedMonths = longestStreak
    .map(
      ({ month, totalExpenses }) =>
        `${chalk.bold(month)} (${chalk.red(formatCurrency(totalExpenses))})`
    )
    .join(' -> ');

  console.log(
    `  Longest streak (${chalk.bold(`${longestStreak.length} months`)}): ${formattedMonths}`
  );
}

module.exports = {
  formatCurrency,
  printHeader,
  printAllTransactions,
  printSummary,
  printCategoryTransactions,
  printDateRangeTransactions,
  printMonthlyBreakdown,
  printAverageExpensesByCategory,
  printConsecutiveExpensiveMonths,
};
