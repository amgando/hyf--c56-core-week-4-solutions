const chalk = require('chalk');
const {
  addTransaction,
  findConsecutiveExpensiveMonths,
  formatCurrency,
  getAverageExpensePerCategory,
  getTransactionsByDateRange,
  groupTransactionsByMonth,
  printAllTransactions,
  printSummary,
  removeTransactionById,
} = require('./financeTracker');

function printBonusReports() {
  const februaryTransactions = getTransactionsByDateRange(
    '2025-02-01',
    '2025-02-28',
  );
  const transactionsByMonth = groupTransactionsByMonth();
  const averageExpenses = getAverageExpensePerCategory();
  const expensiveStreaks = findConsecutiveExpensiveMonths(1500, 2);

  console.log(chalk.bold('\n🔎 BONUS REPORTS 🔎'));
  console.log(
    chalk.bold('Transactions in February 2025: ') +
      chalk.yellow(februaryTransactions.length),
  );

  console.log(chalk.bold('\nTransactions grouped by month:'));
  for (const [month, groups] of Object.entries(transactionsByMonth)) {
    const incomeCount = groups.income.length;
    const expenseCount = groups.expense.length;
    console.log(
      `${chalk.yellow(month)}: ${incomeCount} income, ${expenseCount} expenses`,
    );
  }

  console.log(chalk.bold('\nAverage expense per category:'));
  for (const [category, average] of Object.entries(averageExpenses)) {
    console.log(
      `${chalk.yellow(category)}: ${chalk.red(formatCurrency(average))}`,
    );
  }

  console.log(chalk.bold('\nConsecutive expensive months (€1,500+):'));
  if (expensiveStreaks.length === 0) {
    console.log('No consecutive expensive months found.');
  } else {
    for (const streak of expensiveStreaks) {
      console.log(chalk.yellow(streak.join(' -> ')));
    }
  }
}

function demonstrateAddAndRemove() {
  const temporaryTransaction = addTransaction({
    id: 15,
    type: 'expense',
    category: 'entertainment',
    amount: 60,
    description: 'Cinema night',
    date: '2025-03-29',
  });
  const removedTransaction = removeTransactionById(temporaryTransaction.id);

  console.log(chalk.bold('\nAdd/remove demonstration:'));
  console.log(
    `Added and removed transaction ${removedTransaction.id}: ${removedTransaction.description}`,
  );
}

function main() {
  console.log(chalk.bold.magenta('\n💰 PERSONAL FINANCE TRACKER 💰'));
  printAllTransactions();
  printSummary();
  printBonusReports();
  demonstrateAddAndRemove();
}

main();
