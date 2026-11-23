const chalk = require('chalk');

let { transactions } = require('./transactions');

function addTransaction(newTransaction) {
  transactions = [...transactions, newTransaction];
  return newTransaction;
}

function getTotalIncome() {
  let totalIncome = 0;

  for (const transaction of transactions) {
    const { type, amount } = transaction;

    if (type === 'income') {
      totalIncome += amount;
    }
  }

  return totalIncome;
}

function getTotalExpenses() {
  let totalExpenses = 0;

  for (let index = 0; index < transactions.length; index += 1) {
    const { type, amount } = transactions[index];

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
  const matchingTransactions = [];
  let index = 0;

  // A while loop keeps the category filtering logic explicit.
  while (index < transactions.length) {
    const transaction = transactions[index];
    const { category: transactionCategory } = transaction;

    if (transactionCategory === category) {
      matchingTransactions.push(transaction);
    }

    index += 1;
  }

  return matchingTransactions;
}

/*
 * Finds the expense transaction with the highest amount by comparing each
 * expense with the current largest expense.
 */
function getLargestExpense() {
  let largestExpense = null;

  for (const transaction of transactions) {
    const { type, amount } = transaction;

    if (
      type === 'expense' &&
      (largestExpense === null || amount > largestExpense.amount)
    ) {
      largestExpense = transaction;
    }
  }

  return largestExpense;
}

function printAllTransactions() {
  console.log(chalk.bold('All Transactions:'));

  for (let index = 0; index < transactions.length; index += 1) {
    const { type, category, amount, description } = transactions[index];

    const typeLabel =
      type === 'income' ? chalk.green('[INCOME]') : chalk.red('[EXPENSE]');
    const amountLabel =
      type === 'income'
        ? chalk.green(`€${amount}`)
        : chalk.red(`€${amount}`);
    const categoryLabel = chalk.yellow(category);

    console.log(
      `${index + 1}. ${typeLabel} ${description} - ${amountLabel} ` +
        `(${categoryLabel})`
    );
  }

  console.log('');
}

function printSummary() {
  const totalIncome = getTotalIncome();
  const totalExpenses = getTotalExpenses();
  const balance = getBalance();
  const largestExpense = getLargestExpense();

  console.log(chalk.bold('📊 FINANCIAL SUMMARY 📊'));
  console.log(`Total Income: ${chalk.bold.green(`€${totalIncome}`)}`);
  console.log(`Total Expenses: ${chalk.bold.red(`€${totalExpenses}`)}`);

  const balanceLabel =
    balance >= 0
      ? chalk.bold.cyan(`€${balance}`)
      : chalk.bold.red(`€${balance}`);

  console.log(`Current Balance: ${balanceLabel}`);
  console.log(
    `Total Transactions: ${chalk.bold(String(transactions.length))}`
  );

  if (largestExpense) {
    const { description, amount } = largestExpense;

    console.log(
      `Largest Expense: ${description} (${chalk.bold.red(`€${amount}`)})`
    );
  } else {
    console.log('Largest Expense: None');
  }

  console.log('');
}

function main() {
  console.log(chalk.bold('💰 PERSONAL FINANCE TRACKER 💰'));
  console.log('');

  printAllTransactions();
  printSummary();
}

main();
