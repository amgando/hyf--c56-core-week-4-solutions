# Week 4 Assignment - Personal Finance Tracker

Build a command-line personal finance tracker that manages income and expenses with proper tooling.

## Project Requirements

### Setup & Configuration

- Initialise npm project with proper `package.json`
- Install dependency: `chalk@4.1.2`
- Create `.gitignore` for `node_modules/`
- Set up Prettier with `.prettierrc`
- Use proper project structure

### Core Functionality

**1. Data Structure (Objects & Arrays)**

Create a transactions array containing at least 5 transaction objects:

```js
const transactions = [
  {
    id: 1,
    type: 'income',
    category: 'salary',
    amount: 3000,
    description: 'Monthly salary',
    date: '2025-01-15'
  },
  // ... more transactions
];

```

Each transaction must have: `id`, `type` (income/expense), `category`, `amount`, `description`, `date`.

**2. Required Functions**

Implement these functions using appropriate loops and array methods:

- `addTransaction(newTransaction)` - Add new transaction to array
- `getTotalIncome()` - Sum all income using a loop
- `getTotalExpenses()` - Sum all expenses using a loop
- `getBalance()` - Calculate total income minus expenses
- `getTransactionsByCategory(category)` - Filter transactions (use loop + push or indexOf/includes)
- `getLargestExpense()` - Find highest expense amount
- `printAllTransactions()` - Display all transactions with formatting

**3. Display Requirements (Chalk)**

Use chalk to colour-code output:

- Income amounts in **green**
- Expense amounts in **red**
- Balance in **cyan** (or red if negative)
- Category names in **yellow**
- Totals/summaries in **bold**

**4. Summary Report**

Create a `printSummary()` function that displays:

- Total income
- Total expenses
- Current balance
- Number of transactions
- Largest expense with description

**5. Code Quality**

- Use descriptive variable names
- Add comments for complex logic
- Use appropriate loop types (`for`, `for...of`, `while`)
- Demonstrate object destructuring in at least one function
- Use spread operator when adding transactions
- Format entire codebase with Prettier before submission

## Example Output

```
💰 PERSONAL FINANCE TRACKER 💰

All Transactions:
1. [INCOME] Salary - €3000 (salary)
2. [EXPENSE] Rent - €1200 (housing)
3. [EXPENSE] Groceries - €300 (food)
4. [INCOME] Freelance - €500 (side-income)
5. [EXPENSE] Utilities - €150 (bills)

📊 FINANCIAL SUMMARY 📊
Total Income: €3500
Total Expenses: €1650
Current Balance: €1850

Largest Expense: Rent (€1200)
Total Transactions: 5
```

## Bonus Challenges

- Search transactions by date range using slice
- Group transactions by month using nested objects
- Calculate average expense per category
- Add ability to remove transactions by id
- Create a function that finds consecutive expensive months (use while loop)
- Use multi-line commenting to explain your most complex function

---

## Submission

Follow the [Assignment submission guide](https://hub.hackyourfuture.nl/p/Assignment-submission-guide-2e750f64ffc980e39d1ff91135a5a9c3?pvs=24) to learn how to submit the assignment
