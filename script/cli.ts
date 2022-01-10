import { Command } from 'commander'
import { DateTime } from 'luxon'

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
  .argument('<file>', 'Transactions file (.csv.zip)')
  .action((file, options) => {
    const { token = [], date } = options
    console.info({ file, token, date: date?.toString() ?? '' })
  })

async function main() {
  await cli.parseAsync()
}

main()
