import * as tracker from './tracker.js'

let newTx = tracker.addTransaction({
  type: 'income',
  category: 'loan',
  amount: 100,
  description: 'friends and family',
  date: '2026-01-01'
})

tracker.printSummary()


const tx = {
  // type: 'income',
  category: 'loan',
  amount: 100,
  description: 'friends and family',
  date: '2026-01-01'
};

let newTx2 = tracker.addTransaction(tx)
console.dir(tracker.validate(tx))

// tx has no `type`, so addTransaction returned -1.
// The throw stops the program here on purpose. Node prints the error and a stack trace.
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/throw
if(newTx2 === -1) throw new Error(`Invalid Tx: ${JSON.stringify(tx)}`)

tracker.printSummary()

