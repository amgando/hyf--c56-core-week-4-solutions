const chalk = require('chalk');
const {
  addTransaction,
  getTransactionsByCategory,
  getTransactionsByDateRange,
  groupTransactionsByMonth,
  getAverageExpenseByCategory,
  removeTransactionById,
  findConsecutiveExpensiveMonths,
} = require('./src/finance');
const {
  formatCurrency,
  printHeader,
  printAllTransactions,
  printSummary,
  printCategoryTransactions,
  printDateRangeTransactions,
  printMonthlyBreakdown,
  printAverageExpensesByCategory,
  printConsecutiveExpensiveMonths,
} = require('./src/display');

function runFinanceTracker() {
  // 1. Display initial transactions and financial summary
  printHeader();
  printAllTransactions();
  printSummary();

  // 2. Demonstrate adding a new transaction (using spread operator)
  const addedTransaction = addTransaction({
    type: 'income',
    category: 'side-income',
    amount: 750,
    description: 'Weekend mentoring workshop',
    date: '2025-04-12',
  });
  console.log(
    chalk.bold('\n➕ Added Transaction: ') +
      `#${addedTransaction.id} ${addedTransaction.description} (${chalk.green(formatCurrency(addedTransaction.amount))}) ${chalk.yellow(`(${addedTransaction.category})`)}`
  );

  // 3. Demonstrate filtering transactions by category
  const foodTransactions = getTransactionsByCategory('food');
  printCategoryTransactions('food', foodTransactions);

  // 4. BONUS: Search transactions by date range using slice()
  const rangeStart = '2025-01-15';
  const rangeEnd = '2025-02-15';
  const dateRangeTransactions = getTransactionsByDateRange(
    rangeStart,
    rangeEnd
  );
  printDateRangeTransactions(rangeStart, rangeEnd, dateRangeTransactions);

  // 5. BONUS: Group transactions by month using nested objects
  const groupedByMonth = groupTransactionsByMonth();
  printMonthlyBreakdown(groupedByMonth);

  // 6. BONUS: Calculate average expense per category
  const averageExpenses = getAverageExpenseByCategory();
  printAverageExpensesByCategory(averageExpenses);

  // 7. BONUS: Find consecutive expensive months using a while loop
  const expensiveMonthsAnalysis = findConsecutiveExpensiveMonths(1500);
  printConsecutiveExpensiveMonths(expensiveMonthsAnalysis);

  // 8. BONUS: Remove a transaction by ID and display updated summary
  const removedTransaction = removeTransactionById(13);
  if (removedTransaction) {
    console.log(
      chalk.bold('\n🗑️  Removed Transaction: ') +
        `#${removedTransaction.id} ${removedTransaction.description} (${chalk.red(formatCurrency(removedTransaction.amount))})`
    );
  }

  console.log(chalk.bold('\n🔄 Updated Summary After Add & Remove:'));
  printSummary();
}

runFinanceTracker();
