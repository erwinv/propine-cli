import { Command } from 'commander'
import { DateTime } from 'luxon'
import app from '../lib/app'

const cli = new Command()

cli
  .description('An application to query transactions history')
  .option(
    '-t, --token [tokens...]',
    'Cryptocurrenty Token/Symbol https://www.pcmag.com/encyclopedia/term/crypto-symbol'
  )
  .option(
    '-d, --date [date]',
    'Date in ISO format https://en.wikipedia.org/wiki/ISO_8601',
    (d) => {
      const date = DateTime.fromISO(d)
      return date.isValid ? date : null
    }
  )
  .argument('<file>', 'Transactions file (.csv, .csv.gz, or .csv.zip)')
  .action(async (file, options) => {
    const { token = [], date } = options
    console.info({ file, token, date: date?.toString() ?? '' })

    const portfolio = await app(file, token, date)
    console.info({ portfolio })
  })

async function main() {
  await cli.parseAsync()
}

main()
