import { DateTime } from 'luxon'

export interface Transaction {
  timestamp: DateTime
  transactionType: 'DEPOSIT' | 'WITHDRAWAL'
  token: string
  amount: number
}

export type Portfolio<T> = Record<string, T>

export interface Balance {
  balance: number
}

export interface Price {
  price: string
}
