# Propine CLI

## Usage

Install dependencies, then run the tests once to validate correctness. The test script also runs compile script which is needed by the CLI wrapper:

```sh
npm install
npm run test
bin/propine help
```

The repo's `bin` path can be added to the shell `PATH` in order to remove the `bin/` prefix when running on the repo's root and to use the script on any directory.

Query portfolio:

```sh
bin/propine portfolio transactions.csv.gz
bin/propine portfolio transactions.csv.gz -t BTC
bin/propine portfolio transactions.csv.gz -t BTC -t ETH
bin/propine portfolio transactions.csv.gz -d '2021-02-21'
```

Get current prices (exchange rates):

```sh
bin/propine prices
bin/propine prices -t BTC -t ETH -T USD -T EUR
```

## Portfolio Query

The transactions CSV input file to the portfolio query is a large file. To avoid loading all of it to memory, the CLI app uses stream processing and [Functional Reactive Programming (FRP)](https://en.wikipedia.org/wiki/Functional_reactive_programming):

```
file stream -> (unzip transform stream) -> CSV parser stream -> Observable -> Functional Reactive processing
```

1. The file is opened via `fs#createReadStream` to get an input/readable stream.
1. If the input file is still compressed (.csv.gz or .csv.zip), the file stream is piped to `zlib#createUnzip`. Note: The provided .csv.zip file is malformed according to Node.js (it throws a `Z_DATA_ERROR` during header check). It may be caused by cross-platform idiosyncrasies or the Node.js parser is just finicky. When this happens, the zip file can be manually decompressed using a separate archiver application and the already decompressed file can be provided to the CLI app instead.
1. The CSV file stream is passed to [Bacon.js](https://baconjs.github.io/api3/index.html) `fromBinder` factory method to turn it into an Observable.
1. The transactions observable is processed via Functional Reactive Programming patterns/constructs to execute the query.

## Portfolio Values derivation

The end-result of the Portfolio query consists of tokens/symbols and their corresponding balances (amount after deposits and withdrawals are aggregated). In order to derive the values in the target currency (USD), the Crypto Compare API is called to get the symbols' current prices, then the balances are multiplied with the corresponding prices.
