import { EventStream } from 'baconjs'
import { DateTime } from 'luxon'
import { Transaction } from './entity'

export function filter(
  transactions: EventStream<Transaction>,
  tokens: string[] = [],
  date?: DateTime | null
) {
  if (tokens.length === 0 && !date) return transactions

  return transactions.filter((trx) => {
    const shouldFilterToken = tokens.length > 0
    const shouldFilterDate = date?.isValid ?? false
    const unixDate = Math.floor(date?.toSeconds() ?? 0)

    return (
      (!shouldFilterToken || tokens.includes(trx.token)) &&
      (!shouldFilterDate || trx.timestamp <= unixDate)
    )
  })
}

export function aggregate(tokenTrxs: EventStream<Transaction>, token: string) {
  const deposits = tokenTrxs
    .filter((trx) => trx.transactionType === 'DEPOSIT')
    .map((trx) => trx.amount)

  const withdrawals = tokenTrxs
    .filter((trx) => trx.transactionType === 'WITHDRAWAL')
    .map((trx) => -trx.amount)

  return deposits
    .merge(withdrawals)
    .fold(0, (x, y) => x + y)
    .map((balance) => ({ token, balance }))
}
