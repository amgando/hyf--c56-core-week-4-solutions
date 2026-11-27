import { transactions } from "./transactions.js"
import chalk from "chalk"
import { validate } from "./util1.js"

// export validate again, so that index.js prints errors from the same version
export { validate }

export function printSummary() {
  console.log(`
💰 PERSONAL FINANCE TRACKER 💰

All Transactions:
${renderAllTransactions(transactions)}

📊 FINANCIAL SUMMARY 📊
Total Income: €${colorize(getTotalIncome(), 'total')}
Total Expenses: €${colorize(getTotalExpenses(), 'total')}
Current Balance: €${colorize(getBalance(), 'balance')}

Largest Expense: ${getLargestExpense()}
Total Transactions: ${transactions.length}
`)
}

/**
 * Add new transaction to array
 */
export function addTransaction(newTransaction) {
  // validate before adding the id: the schema rejects unexpected keys
  const result = validate(newTransaction)
  if (!result.success) return -1

  // result.data is the transaction to store (util7 also trims its strings)
  const newMaxId = Math.max(0, ...transactions.map(tx => tx.id)) + 1
  return transactions.push({ ...result.data, id: newMaxId })
}

/**
 * Sum all income
 * using a loop
 */
export function getTotalIncome() {
  return transactions.reduce((income, tx) => tx.type === 'income' ? income + tx.amount : income, 0)
}

/**
 * Sum all expenses
 * using a loop
 */
export function getTotalExpenses() {
  return transactions.reduce((expense, tx) => tx.type === 'expense' ? expense + tx.amount : expense, 0)
}

/**
 * Calculate total income minus expenses
 */
export function getBalance() {
  return transactions.reduce((total, tx) => {
    switch (tx.type) {
      case 'income':
        return total + tx.amount

      case 'expense':
        return total - tx.amount

      default:
        return total
    }
  }, 0)
}
/**
 * Filter transactions
 * (use loop + push or indexOf/includes)
 */
export function getTransactionsByCategory(category) {
  return transactions.filter(tx => tx.category === category)
}

/**
 * Find highest expense amount
 */
export function getLargestExpense() {
  const expenses = transactions.filter(tx => tx.type === 'expense')
  if (expenses.length === 0) return 'none'

  const { category, amount, description } = expenses.reduce((max, tx) => tx.amount > max.amount ? tx : max)

  return colorize(`${capitalize(category)} - €${amount}${renderDescription(description)}`, 'expense')
}

/**
 * Display all transactions with formatting
 */
export function printAllTransactions() {
  console.log(renderAllTransactions(transactions))
}

/**
 * helper function to render all transactions as string
 */
function renderAllTransactions(transactions) {
  const txLine = ({ type, category, amount, description }, idx) => `${idx + 1}. [${type.toUpperCase()}] ${colorize(capitalize(category), 'category')} - €${colorize(amount, type)}${renderDescription(description)}`
  return transactions.map(txLine).join('\n')
}

/**
 * helper function to render the description in brackets
 * description is optional in util7, so print nothing when it is missing
 */
function renderDescription(description) {
  return description ? ` (${description})` : ''
}


/**
 * colorized output helper
 Income amounts in green
 Expense amounts in red
 Balance in cyan (or red if negative)
 Category names in yellow
 Totals/summaries in bold
 */
function colorize(output, type) {
  switch (type) {
    case 'income':
      return chalk.green(output)

    case 'expense':
      return chalk.red(output)

    case 'balance':
      return chalk.bold(output >= 0 ? chalk.cyan(output) : chalk.red(output))

    case 'category':
      return chalk.yellow(output)

    case 'total':
    case 'summary':
      return chalk.bold(output)

    default:
      throw new Error(`invalid type: [${type}]`)
  }
}

/**
 * helper function to capitalize a word
 */
function capitalize(str) {
  return str[0].toUpperCase() + str.slice(1, str.length)
}
