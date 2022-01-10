import { DateTime } from 'luxon'

export interface Transaction {
  timestamp: DateTime
  transactionType: 'DEPOSIT' | 'WITHDRAWAL'
  token: string
  amount: number
}

export type Portfolio = Record<string, number>
