import axios from 'axios'

const apiClient = axios.create({
  baseURL: 'https://min-api.cryptocompare.com/data',
  headers: {
    Authorization: `Apikey ${process.env.API_KEY}`,
  },
})

export async function getSymbolsPrice(symbols: string[], targets = ['USD']) {
  const fsyms = symbols.join(',') || 'BTC'
  const tsyms = targets.join(',')
  const multi = symbols.length > 1

  const { data } = await apiClient.get(
    `/${multi ? 'pricemulti' : 'price'}?${
      multi ? 'fsyms' : 'fsym'
    }=${fsyms}&tsyms=${tsyms}`
  )

  return data
}
