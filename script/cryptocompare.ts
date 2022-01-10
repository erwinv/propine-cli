import 'dotenv-safe/config'
import { getSymbolsPrice } from '../lib/exchange-rates-api'

async function main() {
  const [, , ...symbols] = process.argv
  const prices = await getSymbolsPrice(symbols)
  console.info({ prices })
}

main()
