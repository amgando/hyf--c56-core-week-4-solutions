const chalk = require('chalk');
const tracker = require('./tracker');
const display = require('./display');

function main() {
  display.printHeader();
  console.log('');
  display.printAllTransactions();
  console.log('');
  display.printSummary();

  console.log('');
  console.log(chalk.bold(`Category filter: ${chalk.yellow('housing')}`));
  display.printTransactionList(tracker.getTransactionsByCategory('housing'));

  console.log('');
  console.log(chalk.bold('Date range: 2025-02-01 to 2025-03-31'));
  display.printTransactionList(
    tracker.getTransactionsByDateRange('2025-02-01', '2025-03-31')
  );

  console.log('');
  console.log(chalk.bold('Transactions grouped by month'));
  display.printMonthlyGroups(tracker.groupTransactionsByMonth());

  console.log('');
  console.log(chalk.bold('Average expense per category'));
  display.printAverageExpenses(tracker.getAverageExpenseByCategory());

  console.log('');
  console.log(chalk.bold('Consecutive expensive months over €1000'));
  display.printExpensiveRuns(tracker.findConsecutiveExpensiveMonths(1000));

  console.log('');
  console.log(chalk.bold('Add a transaction'));
  const balanceBeforeAdd = tracker.getBalance();
  const added = tracker.addTransaction({
    type: 'expense',
    category: 'leisure',
    amount: 45,
    description: 'Cinema',
    date: '2025-04-21'
  });
  const addedAmount = display.paintAmount(added.amount, added.type);
  const addedCategory = chalk.yellow(added.category);
  console.log(
    `Added #${added.id} ${added.description} - ${addedAmount} (${addedCategory})`
  );
  console.log(`Balance before: ${display.paintBalance(balanceBeforeAdd)}`);
  console.log(`Balance after: ${display.paintBalance(tracker.getBalance())}`);

  console.log('');
  console.log(chalk.bold('Remove a transaction by id'));
  const removed = tracker.removeTransaction(added.id);

  if (removed === null) {
    console.log(`No transaction with id ${added.id}.`);
  } else {
    console.log(`Removed #${removed.id} ${removed.description}`);
  }

  console.log(
    `Balance after removal: ${display.paintBalance(tracker.getBalance())}`
  );
  console.log('');
  display.printSummary();
}

main();
