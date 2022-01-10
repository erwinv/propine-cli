import axios from 'axios'

const apiClient = axios.create({
  baseURL: 'https://min-api.cryptocompare.com/data',
  headers: {
    Authorization: `Apikey ${process.env.CRYPTO_COMPARE_API_KEY}`,
  },
})

interface Prices {
  [symbol: string]: {
    [currency: string]: number
  }
}

export async function getSymbolsPrices(
  symbols: string[],
  targets = ['USD']
): Promise<Prices> {
  const fsyms = symbols.join(',') || 'BTC'
  const tsyms = targets.join(',')
  const multi = symbols.length > 1

  const { data } = await apiClient.get(
    `/${multi ? 'pricemulti' : 'price'}?${
      multi ? 'fsyms' : 'fsym'
    }=${fsyms}&tsyms=${tsyms}&extraParams=propineCli`
  )

  return multi ? data : { [fsyms]: data }
}
