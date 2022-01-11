# Optimizations

## Portfolio Query Memoization

If the query specifies a date (to filter/include only transactions before the provided date), the result can be memoized given that:

1. The transactions log is append-only (this is a fair assumption, considering the nature of the blockchain)
   - inserting new transactions with timestamps in the past is not allowed
   - deleting past (or already logged) transactions is also not allowed
   - modifying past transactions is not allowed
1. The query date is a date in the past

If all the above preconditions are met, then the query is pure/idempotent and can be memoized.
