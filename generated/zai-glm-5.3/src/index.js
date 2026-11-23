const chalk = require('chalk');

const display = require('./display');
const finance = require('./finance');

// 1. Welcome header
console.log(chalk.bold('💰 PERSONAL FINANCE TRACKER 💰'));
console.log('');

// 2. Show every transaction the tracker starts with
display.printAllTransactions();
console.log('');

// 3. Add a new transaction (uses the spread operator)
console.log(chalk.bold('➕ ADDING A NEW TRANSACTION'));
const newTransaction = {
  type: 'expense',
  category: 'leisure',
  amount: 45,
  description: 'Cinema tickets',
  date: '2025-02-22',
};
const addedTransaction = finance.addTransaction(newTransaction);
display.printTransaction(addedTransaction);
console.log('');

// 4. Bonus: remove a transaction by id
console.log(chalk.bold('🗑 REMOVING A TRANSACTION'));
const wasRemoved = finance.removeTransactionById(addedTransaction.id);

if (wasRemoved) {
  console.log(chalk.green(`Transaction ${addedTransaction.id} removed`));
} else {
  console.log(chalk.red(`Transaction ${addedTransaction.id} not found`));
}
console.log('');

// 5. Filter transactions by category
display.printTransactionsByCategory('food');
console.log('');

// 6. Bonus: search transactions in a date range
display.printTransactionsInDateRange('2025-02-01', '2025-02-28');
console.log('');

// 7. Bonus: group transactions by month
display.printMonthlyReport();
console.log('');

// 8. Bonus: average expense per category
display.printAverageExpensePerCategory();
console.log('');

// 9. Bonus: longest streak of expensive months (uses a while loop)
display.printExpenseStreak(1000);
console.log('');

// 10. The summary report
display.printSummary();
