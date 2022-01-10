import { EventStream } from 'baconjs'
import { DateTime } from 'luxon'
import { Portfolio, Transaction } from './entity'
import parse from './parser'

export default async function (
  path: string,
  token: string[],
  date?: DateTime | null
): Promise<Portfolio> {
  const transactions = parse(path)

  let maybeFilteredTransactions = transactions
  if (token.length > 0) {
    maybeFilteredTransactions = maybeFilteredTransactions.filter((trx) =>
      token.includes(trx.token)
    )
  }
  if (date?.isValid ?? false) {
    maybeFilteredTransactions = maybeFilteredTransactions.filter(
      (trx) => trx.timestamp <= date
    )
  }

  return maybeFilteredTransactions
    .groupBy(
      (trx) => trx.token,
      (tokenTrxs, { token }) => accumulate(tokenTrxs, token)
    )
    .flatMap((trxs) => trxs)
    .scan<Portfolio>({}, (portfolio, { token, balance }) => ({
      ...portfolio,
      [token]: balance,
    }))
    .toPromise()
}

function accumulate(tokenTrxs: EventStream<Transaction>, token: string) {
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
