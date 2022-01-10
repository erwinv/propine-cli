import { createReadStream } from 'fs'
import { extname } from 'path'
import { pipeline } from 'stream/promises'
import { createUnzip } from 'zlib'
import { parse as parseCsv } from 'csv-parse'
import { fromBinder, Next, End, Error, EventStream } from 'baconjs'
import { Transaction } from './entity'

export default function parse(path: string): EventStream<Transaction> {
  return fromBinder<Transaction>((sink) => {
    const emitValue = (v: Transaction) => sink(new Next(v))
    const emitEnd = () => sink(new End())
    const emitError = <E extends Error>(e: E) => sink(new Error(e))

    const file = createReadStream(path)
    const csvParser = parseCsv({ columns: true })

    csvParser
      .on('readable', () => {
        let record

        while ((record = csvParser.read()) !== null) {
          try {
            const transaction = {
              timestamp: Number(record.timestamp),
              transactionType: record.transaction_type,
              token: record.token,
              amount: Number(record.amount),
            }

            emitValue(transaction)
          } catch (e) {
            emitError(e)
          }
        }
      })
      .on('close', emitEnd)
      .on('error', emitError)

    if (['.zip', '.gz'].includes(extname(path))) {
      pipeline(file, createUnzip(), csvParser).catch(emitError)
    } else {
      pipeline(file, csvParser).catch(emitError)
    }

    return () => file.close()
  })
}
