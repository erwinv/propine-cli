import { DateTime } from 'luxon'
import { Portfolio } from './entity'
import parse from './parser'
import { aggregate, filter } from './transform'

export default async function (
  path: string,
  token: string[],
  date?: DateTime | null
): Promise<Portfolio> {
  const transactions = parse(path)

  return filter(transactions, token, date)
    .groupBy(
      (trx) => trx.token,
      (tokenTrxs, { token }) => aggregate(tokenTrxs, token)
    )
    .flatMap((trxs) => trxs)
    .scan<Portfolio>({}, (portfolio, { token, balance }) => ({
      ...portfolio,
      [token]: balance,
    }))
    .toPromise()
}
