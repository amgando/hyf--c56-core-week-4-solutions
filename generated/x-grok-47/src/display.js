const chalk = require('chalk');
const tracker = require('./tracker');

function formatEuro(amount) {
  const cents = Math.round(amount * 100) / 100;
  const sign = cents < 0 ? '-' : '';
  const absolute = Math.abs(cents);
  const digits = Number.isInteger(absolute)
    ? String(absolute)
    : absolute.toFixed(2);

  return `${sign}€${digits}`;
}

function paintAmount(amount, type, asTotal = false) {
  const text = formatEuro(amount);
  const color = type === 'income' ? chalk.green : chalk.red;
  const painter = asTotal ? color.bold : color;

  return painter(text);
}

// Summaries use cyan. A negative balance is red so a loss stands out.
function paintBalance(amount) {
  const text = formatEuro(amount);
  const color = amount < 0 ? chalk.red : chalk.cyan;

  return color.bold(text);
}

function formatTransactionLine(position, transaction) {
  const { type, description, amount, category } = transaction;
  const label = type === 'income' ? 'INCOME' : 'EXPENSE';
  const paintedAmount = paintAmount(amount, type);
  const paintedCategory = chalk.yellow(category);

  return `${position}. [${label}] ${description} - ${paintedAmount} (${paintedCategory})`;
}

function printHeader() {
  console.log(chalk.bold('💰 PERSONAL FINANCE TRACKER 💰'));
}

function printAllTransactions() {
  const transactions = tracker.getTransactions();

  console.log('All Transactions:');

  for (let index = 0; index < transactions.length; index += 1) {
    console.log(formatTransactionLine(index + 1, transactions[index]));
  }
}

function printTransactionList(transactions) {
  if (transactions.length === 0) {
    console.log('No transactions found.');
    return;
  }

  for (let index = 0; index < transactions.length; index += 1) {
    console.log(formatTransactionLine(index + 1, transactions[index]));
  }
}

function sumCategoryGroup(categoryGroups) {
  let total = 0;
  const categoryNames = Object.keys(categoryGroups);

  for (const categoryName of categoryNames) {
    const categoryTransactions = categoryGroups[categoryName];

    for (const transaction of categoryTransactions) {
      total += transaction.amount;
    }
  }

  return total;
}

function printCategoryLines(categoryGroups, type) {
  const categoryNames = Object.keys(categoryGroups).sort();

  for (const categoryName of categoryNames) {
    const categoryTransactions = categoryGroups[categoryName];
    let total = 0;

    for (const transaction of categoryTransactions) {
      total += transaction.amount;
    }

    const label = chalk.yellow(categoryName);
    const count = categoryTransactions.length;
    console.log(`  ${label}: ${paintAmount(total, type)} (${count})`);
  }
}

function printMonthlyGroups(grouped) {
  const monthKeys = Object.keys(grouped).sort();

  if (monthKeys.length === 0) {
    console.log('No transactions found.');
    return;
  }

  for (let index = 0; index < monthKeys.length; index += 1) {
    const monthKey = monthKeys[index];
    const monthGroup = grouped[monthKey];
    const incomeTotal = sumCategoryGroup(monthGroup.income);
    const expenseTotal = sumCategoryGroup(monthGroup.expense);

    if (index > 0) {
      console.log('');
    }

    console.log(chalk.bold(monthKey));
    console.log(`  Income: ${paintAmount(incomeTotal, 'income', true)}`);
    console.log(`  Expenses: ${paintAmount(expenseTotal, 'expense', true)}`);
    printCategoryLines(monthGroup.income, 'income');
    printCategoryLines(monthGroup.expense, 'expense');
  }
}

function printAverageExpenses(averages) {
  const categories = Object.keys(averages).sort();

  if (categories.length === 0) {
    console.log('No expenses recorded.');
    return;
  }

  for (const category of categories) {
    const label = chalk.yellow(category);
    const average = paintAmount(averages[category], 'expense', true);
    console.log(`${label}: ${average}`);
  }
}

function printExpensiveRuns(runs) {
  if (runs.length === 0) {
    console.log('No consecutive expensive months.');
    return;
  }

  for (let index = 0; index < runs.length; index += 1) {
    const run = runs[index];
    const parts = [];

    for (const month of run) {
      parts.push(
        `${month.month} (${paintAmount(month.total, 'expense', true)})`
      );
    }

    console.log(`${chalk.bold(`Run ${index + 1}:`)} ${parts.join(', ')}`);
  }
}

function printSummary() {
  const totalIncome = tracker.getTotalIncome();
  const totalExpenses = tracker.getTotalExpenses();
  const balance = tracker.getBalance();
  const largestExpense = tracker.getLargestExpense();
  const transactionCount = tracker.getTransactions().length;

  console.log(chalk.bold('📊 FINANCIAL SUMMARY 📊'));
  console.log(
    `${chalk.bold('Total Income:')} ${paintAmount(totalIncome, 'income', true)}`
  );
  console.log(
    `${chalk.bold('Total Expenses:')} ${paintAmount(totalExpenses, 'expense', true)}`
  );
  console.log(`${chalk.bold('Current Balance:')} ${paintBalance(balance)}`);
  console.log('');

  if (largestExpense === null) {
    console.log(`${chalk.bold('Largest Expense:')} none`);
  } else {
    const { description, amount } = largestExpense;
    const paintedAmount = paintAmount(amount, 'expense', true);
    console.log(
      `${chalk.bold('Largest Expense:')} ${description} (${paintedAmount})`
    );
  }

  console.log(
    `${chalk.bold('Total Transactions:')} ${chalk.bold(String(transactionCount))}`
  );
}

module.exports = {
  formatEuro,
  paintAmount,
  paintBalance,
  printHeader,
  printAllTransactions,
  printTransactionList,
  printMonthlyGroups,
  printAverageExpenses,
  printExpensiveRuns,
  printSummary
};
