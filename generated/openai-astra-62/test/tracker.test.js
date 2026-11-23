const test = require('node:test');
const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const { createTracker } = require('../src/tracker');
test('sample ledger, inclusive dates, category averages and monthly groups', () => {
  const t = createTracker();
  assert.equal(t.getTotalIncome(), 2775);
  assert.equal(t.getTotalExpenses(), 1792.6);
  assert.equal(t.getBalance(), 982.4);
  assert.equal(t.getLargestExpense().id, 2);
  assert.deepEqual(
    t.getTransactionsByCategory('food').map((x) => x.id),
    [3, 6],
  );
  assert.deepEqual(
    t.searchByDateRange('2025-03-08', '2025-04-01').map((x) => x.id),
    [3, 4],
  );
  assert.deepEqual(t.searchByDateRange('2025-04-03', '2025-04-04'), []);
  assert.throws(() => t.searchByDateRange('2025-02-30', '2025-03-01'));
  assert.deepEqual(t.averageExpenseByCategory(), { housing: 850, food: 46.3 });
  assert.deepEqual(
    t.groupByMonth()['2025']['04'].map((x) => x.id),
    [4, 5, 6],
  );
});
test('streaks handle year boundaries, missing months and exact threshold', () => {
  const t = createTracker([]);
  for (const [month, amount] of [
    ['2025-01', 12],
    ['2024-12', 11],
    ['2025-02', 10],
    ['2025-03', 11],
    ['2025-05', 11],
    ['2025-06', 11],
  ]) {
    t.addTransaction({
      date: month + '-01',
      type: 'expense',
      category: 'food',
      amount,
      description: 'Lunch',
    });
  }
  assert.deepEqual(t.consecutiveExpensiveMonths(10), [
    ['2024-12', '2025-01'],
    ['2025-05', '2025-06'],
  ]);
  assert.deepEqual(
    t.searchByDateRange('2024-12-01', '2025-01-01').map((x) => x.id),
    [2, 1],
  );
});
test('addition copies input, rejects duplicate ids, and removal updates the summary', () => {
  const lines = [];
  const t = createTracker([], (line) => lines.push(line));
  const item = {
    id: 7,
    date: '2024-02-29',
    type: 'expense',
    category: 'books',
    description: 'Atlas',
    amount: 15,
  };
  t.addTransaction(item);
  assert.throws(() => t.addTransaction(item));
  item.amount = 1;
  assert.equal(t.getBalance(), -15);
  assert.equal(t.removeTransaction(99), false);
  assert.equal(t.removeTransaction(7), true);
  assert.equal(t.getLargestExpense(), null);
  t.printSummary();
  assert.match(lines.join('\n'), /Largest Expense: None/);
});
test('CLI supports every command and colors amounts, categories and summaries', () => {
  const result = spawnSync(process.execPath, ['src/cli.js', '--interactive'], {
    input:
      'add expense 2025-04-06 1200 gear New laptop\nsummary\ncategory gear\nrange 2025-04-06 2025-04-06\nmonths\naverages\nstreaks 800\nremove 7\nsummary\nlist\nquit\n',
    encoding: 'utf8',
    env: { ...process.env, FORCE_COLOR: '1' },
  });
  assert.equal(result.status, 0, result.stderr);
  for (const fragment of [
    '\x1b[32m€2,400.00',
    '\x1b[31m€850.00',
    '\x1b[33mgear',
    '\x1b[36m€982.40',
    '\x1b[31m-€217.60',
    '\x1b[1mFinancial Summary',
    'Added transaction 7',
    'Largest Expense: New laptop',
    '2025-03 → 2025-04',
    'Transaction removed.',
  ]) {
    assert.ok(result.stdout.includes(fragment), fragment);
  }
});
