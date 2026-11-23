const chalk = require('chalk');
const {
  transactions,
  getTotalIncome,
  getTotalExpenses,
  getBalance,
  getLargestExpense,
} = require('./finance');

function formatEuro(amount) {
  return `€${amount}`;
}

// Green for income, red for expenses.
function colourAmount(type, amount) {
  const text = formatEuro(amount);
  return type === 'income' ? chalk.green(text) : chalk.red(text);
}

// One line per transaction, e.g. "1. [INCOME] Monthly salary - €3000 (salary)"
function formatTransaction(transaction, position) {
  const { type, category, amount, description } = transaction;
  const label = `[${type.toUpperCase()}]`;
  return `${position}. ${label} ${description} - ${colourAmount(type, amount)} (${chalk.yellow(category)})`;
}

function printTransactionList(title, list) {
  console.log(chalk.bold(title));
  if (list.length === 0) {
    console.log('  (none)');
    return;
  }
  list.forEach((transaction, index) => {
    console.log(formatTransaction(transaction, index + 1));
  });
}

function printAllTransactions() {
  printTransactionList('All Transactions:', transactions);
}

function printSummary() {
  const balance = getBalance();
  const largestExpense = getLargestExpense();
  // Cyan when positive or zero, red when negative.
  const balanceColour = balance < 0 ? chalk.red : chalk.cyan;

  console.log(chalk.bold('\n📊 FINANCIAL SUMMARY 📊'));
  console.log(
    chalk.bold('Total Income: ') + chalk.green(formatEuro(getTotalIncome()))
  );
  console.log(
    chalk.bold('Total Expenses: ') + chalk.red(formatEuro(getTotalExpenses()))
  );
  console.log(
    chalk.bold('Current Balance: ') + balanceColour(formatEuro(balance))
  );

  console.log('');
  if (largestExpense) {
    console.log(
      chalk.bold('Largest Expense: ') +
        `${largestExpense.description} (${chalk.red(formatEuro(largestExpense.amount))})`
    );
  } else {
    console.log(chalk.bold('Largest Expense: ') + 'none');
  }
  console.log(chalk.bold('Total Transactions: ') + transactions.length);
}

module.exports = {
  formatEuro,
  printTransactionList,
  printAllTransactions,
  printSummary,
};
