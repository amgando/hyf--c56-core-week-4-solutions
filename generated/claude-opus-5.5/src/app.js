const chalk = require('chalk');
const {
  transactions,
  addTransaction,
  getTransactionsByCategory,
  removeTransactionById,
  getTransactionsByDateRange,
  groupTransactionsByMonth,
  getAverageExpensePerCategory,
  findConsecutiveExpensiveMonths,
} = require('./finance');
const {
  formatEuro,
  printTransactionList,
  printAllTransactions,
  printSummary,
} = require('./display');

console.log(chalk.bold('💰 PERSONAL FINANCE TRACKER 💰\n'));

// Core: add a transaction, then show everything.
addTransaction({
  type: 'expense',
  category: 'bills',
  amount: 60,
  description: 'Phone plan',
  date: '2025-03-05',
});

printAllTransactions();
printSummary();

// Core: filter by category.
console.log('');
printTransactionList(
  `Category ${chalk.yellow('food')}:`,
  getTransactionsByCategory('food')
);

// ---------- Bonus ----------
console.log(chalk.bold('\n⭐ BONUS ⭐\n'));

printTransactionList(
  'February 2025 (date range):',
  getTransactionsByDateRange('2025-02-01', '2025-02-28')
);

console.log(chalk.bold('\nTransactions by month:'));
const transactionsByMonth = groupTransactionsByMonth();
for (const month in transactionsByMonth) {
  const { income, expense } = transactionsByMonth[month];
  console.log(
    `${month}: ${chalk.green(income.length + ' income')}, ${chalk.red(expense.length + ' expense')}`
  );
}

console.log(chalk.bold('\nAverage expense per category:'));
const averages = getAverageExpensePerCategory();
for (const category in averages) {
  console.log(
    `${chalk.yellow(category)}: ${chalk.red(formatEuro(averages[category]))}`
  );
}

const threshold = 1500;
const expensiveRun = findConsecutiveExpensiveMonths(threshold);
console.log(
  chalk.bold(
    `\nLongest run of months with expenses above ${formatEuro(threshold)}:`
  )
);
if (expensiveRun.length === 0) {
  console.log('  (none)');
} else {
  for (const { month, total } of expensiveRun) {
    console.log(`${month}: ${chalk.red(formatEuro(total))}`);
  }
}

const removed = removeTransactionById(9);
console.log(
  chalk.bold('\nRemoved transaction: ') +
    (removed ? `${removed.description} (id ${removed.id})` : 'not found')
);
console.log(chalk.bold('Transactions left: ') + transactions.length);
