const readline = require('node:readline');
const chalk = require('chalk');
const { createTracker, money } = require('./tracker');
const tracker = createTracker();
const help = [
  'list | summary | category NAME | range START END | months | averages',
  'streaks EURO_THRESHOLD | remove ID | help | quit',
  'add TYPE DATE AMOUNT CATEGORY DESCRIPTION (one-word category)',
].join('\n');
function execute(line) {
  const [command, ...args] = line.trim().split(/\s+/);
  switch (command) {
    case '':
      break;
    case 'help':
      console.log(help);
      break;
    case 'list':
      tracker.printAllTransactions();
      break;
    case 'summary':
      tracker.printSummary();
      break;
    case 'category':
      tracker.printTransactions(
        tracker.getTransactionsByCategory(args.join(' ')),
      );
      break;
    case 'range':
      tracker.printTransactions(tracker.searchByDateRange(...args));
      break;
    case 'months': {
      const groups = tracker.groupByMonth();
      if (!Object.keys(groups).length) console.log('No transactions.');
      for (const year of Object.keys(groups).sort()) {
        for (const month of Object.keys(groups[year]).sort()) {
          console.log(chalk.bold(year + '-' + month));
          tracker.printTransactions(groups[year][month]);
        }
      }
      break;
    }
    case 'averages': {
      const averages = Object.entries(tracker.averageExpenseByCategory());
      if (!averages.length) console.log('No expenses.');
      for (const [category, amount] of averages)
        console.log(
          chalk.yellow(category) + ' ' + chalk.red(money.format(amount)),
        );
      break;
    }
    case 'streaks': {
      const runs = tracker.consecutiveExpensiveMonths(Number(args[0]));
      console.log(
        runs.length
          ? runs.map((run) => run.join(' → ')).join('\n')
          : 'No consecutive expensive months.',
      );
      break;
    }
    case 'add': {
      const [type, date, amount, category, ...words] = args;
      const id = tracker.addTransaction({
        type,
        date,
        amount: Number(amount),
        category,
        description: words.join(' '),
      });
      console.log('Added transaction ' + id + '.');
      break;
    }
    case 'remove':
      console.log(
        tracker.removeTransaction(Number(args[0]))
          ? 'Transaction removed.'
          : 'ID not found.',
      );
      break;
    default:
      throw new Error('Unknown command. Type help for commands.');
  }
}
async function main() {
  console.log(chalk.bold('Personal Finance Tracker'));
  tracker.printAllTransactions();
  tracker.printSummary();
  if (!process.argv.includes('--interactive')) return;
  console.log('Session changes last until you quit. Type help for commands.');
  const input = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: 'finance> ',
  });
  if (process.stdin.isTTY) input.prompt();
  for await (const line of input) {
    if (line.trim() === 'quit') break;
    try {
      execute(line);
    } catch (error) {
      console.log(error.message);
    }
    if (process.stdin.isTTY) input.prompt();
  }
  input.close();
}
main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
