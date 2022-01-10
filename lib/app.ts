import { DateTime } from 'luxon'
import { Balance, Portfolio, Price } from './entity'
import { getSymbolsPrices } from './prices-api'
import parse from './parser'
import { aggregate, filter } from './transform'

export default async function (
  path: string,
  token: string[],
  date?: DateTime | null
): Promise<Portfolio<Balance & Price>> {
  const transactions = parse(path)

  return filter(transactions, token, date)
    .groupBy(
      (trx) => trx.token,
      (tokenTrxs, { token }) => aggregate(tokenTrxs, token)
    )
    .flatMap((trxs) => trxs)
    .scan<Portfolio<Balance>>({}, (portfolio, { token, balance }) => ({
      ...portfolio,
      [token]: { balance },
    }))
    .toPromise()
    .then(withPrice)
}

async function withPrice(portfolio: Portfolio<Balance & Price>) {
  const target = 'USD'

  const symbols = Object.keys(portfolio)
  const prices = await getSymbolsPrices(symbols, [target])

  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: target,
  })

  for (const [symbol, { balance }] of Object.entries(portfolio)) {
    portfolio[symbol].price = formatter.format(balance * prices[symbol][target])
  }

  return portfolio
}
