// The starting data set of the finance tracker.
// Every transaction has the same object shape:
// { id, type: 'income' | 'expense', category, amount, description, date }

const initialTransactions = [
  {
    id: 1,
    type: 'income',
    category: 'salary',
    amount: 3000,
    description: 'Monthly salary',
    date: '2025-01-15',
  },
  {
    id: 2,
    type: 'expense',
    category: 'housing',
    amount: 1200,
    description: 'Rent',
    date: '2025-01-02',
  },
  {
    id: 3,
    type: 'expense',
    category: 'food',
    amount: 300,
    description: 'Groceries',
    date: '2025-01-10',
  },
  {
    id: 4,
    type: 'income',
    category: 'side-income',
    amount: 500,
    description: 'Freelance project',
    date: '2025-01-20',
  },
  {
    id: 5,
    type: 'expense',
    category: 'bills',
    amount: 150,
    description: 'Utilities',
    date: '2025-01-18',
  },
  {
    id: 6,
    type: 'income',
    category: 'salary',
    amount: 3000,
    description: 'Monthly salary',
    date: '2025-02-15',
  },
  {
    id: 7,
    type: 'expense',
    category: 'housing',
    amount: 1200,
    description: 'Rent',
    date: '2025-02-03',
  },
  {
    id: 8,
    type: 'expense',
    category: 'food',
    amount: 250,
    description: 'Groceries',
    date: '2025-02-11',
  },
];

module.exports = { initialTransactions };
