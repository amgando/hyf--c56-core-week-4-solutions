const chalk = require('chalk');

const { transactions } = require('./transactions');

function addTransaction(newTransaction) {
  const nextId =
    transactions.length > 0 ? transactions[transactions.length - 1].id + 1 : 1;
  transactions.push({ ...newTransaction, id: nextId });
}

function getTotalIncome() {
  let total = 0;
  for (const transaction of transactions) {
    if (transaction.type === 'income') {
      total += transaction.amount;
    }
  }
  return total;
}

function getTotalExpenses() {
  let total = 0;
  for (let i = 0; i < transactions.length; i++) {
    if (transactions[i].type === 'expense') {
      total += transactions[i].amount;
    }
  }
  return total;
}

function getBalance() {
  return getTotalIncome() - getTotalExpenses();
}

function getTransactionsByCategory(category) {
  const matches = [];
  for (const transaction of transactions) {
    if (transaction.category === category) {
      matches.push(transaction);
    }
  }
  return matches;
}

function getLargestExpense() {
  let largest = null;
  for (const transaction of transactions) {
    if (transaction.type !== 'expense') continue;
    if (largest === null || transaction.amount > largest.amount) {
      largest = transaction;
    }
  }
  return largest;
}

function formatCurrency(amount) {
  return `€${amount}`;
}

function printAllTransactions() {
  console.log(chalk.bold('All Transactions:'));
  console.log('');

  transactions.forEach((transaction, index) => {
    const { type, category, amount, description } = transaction;
    const typeLabel = type === 'income' ? 'INCOME' : 'EXPENSE';
    const amountColor = type === 'income' ? chalk.green : chalk.red;

    console.log(
      `${index + 1}. [${typeLabel}] ${description} - ${amountColor(
        formatCurrency(amount)
      )} (${chalk.yellow(category)})`
    );
  });
}

function printSummary() {
  const totalIncome = getTotalIncome();
  const totalExpenses = getTotalExpenses();
  const balance = getBalance();
  const largestExpense = getLargestExpense();

  console.log(chalk.bold('📊 FINANCIAL SUMMARY 📊'));
  console.log('');
  console.log(
    `${chalk.bold('Total Income:')} ${chalk.green(
      formatCurrency(totalIncome)
    )}`
  );
  console.log(
    `${chalk.bold('Total Expenses:')} ${chalk.red(
      formatCurrency(totalExpenses)
    )}`
  );

  const balanceColor = balance < 0 ? chalk.red : chalk.cyan;
  console.log(
    `${chalk.bold('Current Balance:')} ${balanceColor(
      formatCurrency(balance)
    )}`
  );

  console.log(
    `${chalk.bold('Total Transactions:')} ${transactions.length}`
  );

  if (largestExpense) {
    console.log(
      `${chalk.bold('Largest Expense:')} ${largestExpense.description} (${chalk.red(
        formatCurrency(largestExpense.amount)
      )})`
    );
  } else {
    console.log(`${chalk.bold('Largest Expense:')} None`);
  }
}

console.log(chalk.bold('💰 PERSONAL FINANCE TRACKER 💰'));
console.log('');
printAllTransactions();
console.log('');
printSummary();
