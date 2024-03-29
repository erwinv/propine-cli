import _ from 'lodash'
import { EventStream, fromArray } from 'baconjs'
import { DateTime } from 'luxon'
import { Transaction } from './entity'
import { filter, groupAggregate, aggregate } from './transform'

const { parse: parseCsv } = require('csv-parse/dist/cjs/sync.cjs') // eslint-disable-line @typescript-eslint/no-var-requires

const testData = `timestamp,transaction_type,token,amount
1571967208,DEPOSIT,BTC,0.298660
1571967200,DEPOSIT,ETH,0.683640
1571967189,WITHDRAWAL,ETH,0.493839
1571967150,DEPOSIT,XRP,0.693272
1571967110,DEPOSIT,ETH,0.347595
1571967067,WITHDRAWAL,XRP,0.393786
1571966982,WITHDRAWAL,ETH,0.266166
1571966896,WITHDRAWAL,XRP,0.819840
1571966868,WITHDRAWAL,XRP,0.969999
1571966849,WITHDRAWAL,XRP,0.650535
1571966763,DEPOSIT,XRP,0.588537
1571966749,DEPOSIT,XRP,0.109955
1571966685,DEPOSIT,BTC,0.658794
1571966641,DEPOSIT,ETH,0.899781
1571966568,DEPOSIT,BTC,0.630386
1571966566,DEPOSIT,BTC,0.985879
1571966499,DEPOSIT,BTC,0.162165
1571966421,DEPOSIT,ETH,0.218207
1571966410,DEPOSIT,ETH,0.205472
1571966399,DEPOSIT,XRP,0.537373
1571966329,WITHDRAWAL,BTC,0.063663
1571966250,WITHDRAWAL,ETH,0.761543
1571966194,DEPOSIT,BTC,0.858688
1571966124,DEPOSIT,ETH,0.663150
1571966054,DEPOSIT,XRP,0.709244
1571966049,DEPOSIT,BTC,0.696682
1571966026,DEPOSIT,BTC,0.747093
1571965990,WITHDRAWAL,BTC,0.987358
1571965945,DEPOSIT,XRP,0.157443
1571965892,DEPOSIT,ETH,0.554933
1571965873,DEPOSIT,BTC,0.132038
1571965832,WITHDRAWAL,BTC,0.147965
1571965821,DEPOSIT,ETH,0.605997
1571965722,DEPOSIT,ETH,0.716122
1571965625,DEPOSIT,BTC,0.872733
1571965533,DEPOSIT,BTC,0.886933
1571965530,DEPOSIT,ETH,0.963364
1571965516,DEPOSIT,XRP,0.828934
1571965418,DEPOSIT,BTC,0.765155
1571965377,DEPOSIT,BTC,0.244591
1571965297,WITHDRAWAL,XRP,0.367830
1571965245,WITHDRAWAL,BTC,0.802627
1571965167,DEPOSIT,XRP,0.792316
1571965147,WITHDRAWAL,BTC,0.236674
1571965053,DEPOSIT,ETH,0.038583
1571965049,WITHDRAWAL,XRP,0.177468
1571964989,WITHDRAWAL,BTC,0.495282
1571964987,DEPOSIT,ETH,0.397724
1571964918,WITHDRAWAL,XRP,0.311287
1571964851,DEPOSIT,BTC,0.934521
1571964792,DEPOSIT,BTC,0.477118
1571964779,DEPOSIT,XRP,0.499383
1571964723,WITHDRAWAL,BTC,0.987034
1571964638,WITHDRAWAL,BTC,0.874843
1571964575,DEPOSIT,ETH,0.812558
1571964490,WITHDRAWAL,BTC,0.004961
1571964443,DEPOSIT,XRP,0.097368
1571964421,WITHDRAWAL,ETH,0.186947
1571964374,WITHDRAWAL,ETH,0.650059
1571964323,WITHDRAWAL,ETH,0.227028
1571964260,DEPOSIT,XRP,0.464974
1571964256,WITHDRAWAL,ETH,0.304374
1571964240,DEPOSIT,ETH,0.765674
1571964170,DEPOSIT,XRP,0.402188
1571964095,WITHDRAWAL,ETH,0.009697
1571964076,WITHDRAWAL,BTC,0.401726
1571964019,WITHDRAWAL,XRP,0.240768
1571963951,WITHDRAWAL,ETH,0.342250
1571963940,DEPOSIT,XRP,0.105994
1571963874,DEPOSIT,XRP,0.245242
1571963804,WITHDRAWAL,ETH,0.962430
1571963788,DEPOSIT,XRP,0.005210
1571963729,WITHDRAWAL,XRP,0.368835
1571963696,DEPOSIT,BTC,0.595896
1571963611,WITHDRAWAL,XRP,0.173078
1571963554,WITHDRAWAL,BTC,0.158923
1571963487,DEPOSIT,BTC,0.918003
1571963470,DEPOSIT,BTC,0.794169
1571963374,WITHDRAWAL,XRP,0.787157
1571963276,DEPOSIT,XRP,0.842281
1571963212,DEPOSIT,ETH,0.226513
1571963153,DEPOSIT,BTC,0.683598
1571963133,DEPOSIT,BTC,0.984541
1571963133,DEPOSIT,XRP,0.028055
1571963050,DEPOSIT,BTC,0.226891
1571962959,WITHDRAWAL,XRP,0.890174
1571962883,DEPOSIT,BTC,0.875022
1571962811,DEPOSIT,XRP,0.569361
1571962773,WITHDRAWAL,XRP,0.644261
1571962717,DEPOSIT,ETH,0.848705
1571962653,WITHDRAWAL,XRP,0.091630
1571962647,WITHDRAWAL,ETH,0.466294
1571962614,DEPOSIT,BTC,0.488433
1571962557,WITHDRAWAL,BTC,0.667648
1571962525,DEPOSIT,BTC,0.459287
1571962475,WITHDRAWAL,BTC,0.367034
1571962448,DEPOSIT,BTC,0.644462
1571962354,DEPOSIT,BTC,0.368687
1571962300,DEPOSIT,ETH,0.439298`

async function toArray<T>(stream: EventStream<T>) {
  return stream.scan<T[]>([], (acc, value) => [...acc, value]).toPromise()
}

const transactionsArray = parseCsv(testData, { columns: true }).map(
  (record) => ({
    timestamp: Number(record.timestamp),
    transactionType: record.transaction_type,
    token: record.token,
    amount: Number(record.amount),
  })
) as Transaction[]

const transactions = () => fromArray<Transaction>(transactionsArray)

describe('transform#filter', () => {
  test('token=[], date=null', async () => {
    const actual = await toArray(filter(transactions()))
    const expected = transactionsArray

    expect(_.sortBy(actual, 'timestamp')).toEqual(
      _.sortBy(expected, 'timestamp')
    )
  })

  test.each([
    [['BTC']],
    [['ETH']],
    [['XPR']],
    [['BTC', 'ETH']],
    [['BTC', 'XPR']],
    [['ETH', 'XPR']],
    [['BTC', 'ETH', 'XPR']],
  ])('token=%j, date=null', async (tokens) => {
    const actual = await toArray(filter(transactions(), tokens))
    const expected = transactionsArray.filter(({ token }) =>
      tokens.includes(token)
    )

    expect(_.sortBy(actual, 'timestamp')).toEqual(
      _.sortBy(expected, 'timestamp')
    )
  })

  test('token=[], date=1571964851', async () => {
    const date = 1571964851

    const actual = await toArray(
      filter(transactions(), [], DateTime.fromSeconds(date))
    )
    const expected = transactionsArray.filter(
      ({ timestamp }) => timestamp <= date
    )

    expect(_.sortBy(actual, 'timestamp')).toEqual(
      _.sortBy(expected, 'timestamp')
    )
  })

  test.each([
    [['BTC']],
    [['ETH']],
    [['XPR']],
    [['BTC', 'ETH']],
    [['BTC', 'XPR']],
    [['ETH', 'XPR']],
    [['BTC', 'ETH', 'XPR']],
  ])('token=%j, date=1571964851', async (tokens) => {
    const date = 1571964851

    const actual = await toArray(
      filter(transactions(), tokens, DateTime.fromSeconds(date))
    )
    const expected = transactionsArray.filter(
      ({ token, timestamp }) => tokens.includes(token) && timestamp <= date
    )

    expect(_.sortBy(actual, 'timestamp')).toEqual(
      _.sortBy(expected, 'timestamp')
    )
  })
})

test('transform#groupAggregate', async () => {
  const actual = await groupAggregate(transactions()).toPromise()
  const expected = _.chain(transactionsArray)
    .groupBy('token')
    .mapValues((tokenTrxs) => {
      const balance = tokenTrxs.reduce(
        (balance, { amount, transactionType }) => {
          switch (transactionType) {
            case 'DEPOSIT':
              return balance + amount
            case 'WITHDRAWAL':
              return balance - amount
          }
        },
        0
      )
      return { balance }
    })
    .value()

  expect(actual).toEqual(expected)
})

test.each(['BTC', 'ETH', 'XPR'])(
  'transform#aggregate token=%s',
  async (token) => {
    const actual = await aggregate(
      filter(transactions(), [token]),
      token
    ).toPromise()

    const expected = {
      token,
      balance: transactionsArray
        .filter((trx) => trx.token === token)
        .reduce((balance, { amount, transactionType }) => {
          switch (transactionType) {
            case 'DEPOSIT':
              return balance + amount
            case 'WITHDRAWAL':
              return balance - amount
          }
        }, 0),
    }

    expect(actual).toEqual(expected)
  }
)
