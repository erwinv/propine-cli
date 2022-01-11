import { DateTime } from 'luxon'
import { Balance, Portfolio, Value } from './entity'
import { getSymbolsPrices } from './prices-api'
import parse from './parser'
import { filter, groupAggregate } from './transform'

export default async function (
  path: string,
  token: string[],
  date?: DateTime | null
) {
  const transactions = parse(path)
  const filtered = filter(transactions, token, date)
  const groupAggregated = groupAggregate(filtered)

  return groupAggregated.toPromise().then(withPrice)
}

async function withPrice(portfolio: Portfolio<Balance & Value>) {
  const target = 'USD'

  const symbols = Object.keys(portfolio)
  const { prices, date } = await getSymbolsPrices(symbols, [target])

  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: target,
  })

  for (const [symbol, { balance }] of Object.entries(portfolio)) {
    portfolio[symbol].value = formatter.format(balance * prices[symbol][target])
  }

  return { portfolio, prices, date }
}
