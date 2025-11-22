# MongoDB Setup Fix

## The Issue
Your project was originally using SQLite but now uses MongoDB. The old migration files are causing conflicts.

## Solution: Use Prisma DB Push (Recommended for MongoDB)

MongoDB doesn't use traditional migrations like SQL databases. Instead, use `prisma db push`:

### Step 1: Generate Prisma Client
```bash
cd backend
npm run prisma:generate
```

### Step 2: Push Schema to Database
```bash
npx prisma db push
```

This will:
- ✅ Create all new models (Portfolio, StockHolding, PriceAlert, etc.)
- ✅ Update existing models if needed
- ✅ Work directly with MongoDB

### Step 3: Restart Backend
```bash
npm run dev
```

## Alternative: If You Want Migrations

If you prefer to use migrations (for version control), you can:

```bash
# Remove old migrations (already done)
# Then create a new migration
npx prisma migrate dev --name add_portfolio_features
```

But for MongoDB, `db push` is simpler and recommended.

## Verify It Worked

After running `prisma db push`, check your MongoDB database. You should see these new collections:
- Portfolio
- StockHolding
- PortfolioHistory
- PriceAlert
- NewsSentiment
- BacktestStrategy

## Test the Features

1. Go to `/portfolio` - should load without errors
2. Try adding a stock - should work now!
3. Go to `/alerts` - should show empty state
4. Go to `/backtest` - should show empty state

## If You Get Errors

Make sure your `DATABASE_URL` in `backend/.env` is correct:
```
DATABASE_URL="mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/stockmaster_ims?retryWrites=true&w=majority"
```

