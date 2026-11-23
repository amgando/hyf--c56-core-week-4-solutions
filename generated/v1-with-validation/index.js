import * as tracker from './tracker.js'
import { validate } from './util1.js';

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
console.dir(validate(tx))

if(newTx2 === -1) throw new Error(`Invalid Tx: ${JSON.stringify(tx)}`)

tracker.printSummary()

