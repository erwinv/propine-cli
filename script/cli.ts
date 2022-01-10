import 'dotenv-safe/config'
import { Command } from 'commander'
import { DateTime } from 'luxon'
import app from '../lib/app'
import { getSymbolsPrice } from '../lib/exchange-rates-api'

const cli = new Command('propine')

cli
  .command('portfolio')
  .argument('<file>', 'Transactions file (.csv, .csv.gz, or .csv.zip)')
  .description('Query transactions history to output portfolio')
  .option(
    '-t, --token [tokens...]',
    'Cryptocurrency Token/Symbol: https://www.pcmag.com/encyclopedia/term/crypto-symbol'
  )
  .option(
    '-d, --date [date]',
    'Date in ISO format: https://en.wikipedia.org/wiki/ISO_8601',
    (d) => {
      const date = DateTime.fromISO(d)
      return date.isValid ? date : null
    }
  )
  .action(async (file, options) => {
    const { token = [], date } = options
    console.info({ file, token, date: date?.toString() ?? '' })

    const portfolio = await app(file, token, date)
    console.info({ portfolio })
  })

cli
  .command('prices')
  .description('Get current prices of tokens/symbols')
  .option(
    '-t, --token [tokens...]',
    'Cryptocurrency Token/Symbol: https://www.pcmag.com/encyclopedia/term/crypto-symbol'
  )
  .option('-T, --target [targets...]', 'Target currencies')
  .action(async (options) => {
    const { token = ['BTC'], target = ['USD'] } = options
    console.info({ token, target })

    const prices = await getSymbolsPrice(token, target)
    console.info({ prices })
  })

async function main() {
  await cli.parseAsync()
}

main()
