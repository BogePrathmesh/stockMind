# Fix Database Migration - Quick Guide

## The Issue
You're seeing "Server error" messages because the new database models (Portfolio, PriceAlert, BacktestStrategy, etc.) haven't been created yet.

## Quick Fix - Run Database Migration

### Step 1: Navigate to Backend Directory
```bash
cd backend
```

### Step 2: Generate Prisma Client
```bash
npm run prisma:generate
```

### Step 3: Run Migration
```bash
npm run prisma:migrate
```

When prompted, give it a name like: `add_portfolio_features`

### Step 4: Restart Backend Server
```bash
npm run dev
```

## Alternative: If Migration Fails

If you get errors, you can reset and migrate:

```bash
# Reset database (WARNING: This deletes all data)
npm run prisma:migrate reset

# Or create migration manually
npx prisma migrate dev --name add_portfolio_features
```

## Verify Migration Worked

After migration, you should see these new models in your database:
- ✅ Portfolio
- ✅ StockHolding
- ✅ PortfolioHistory
- ✅ PriceAlert
- ✅ NewsSentiment
- ✅ BacktestStrategy

## Test the Features

1. **Portfolio**: Go to `/portfolio` - should load without errors
2. **Alerts**: Go to `/alerts` - should show empty state (no errors)
3. **Backtest**: Go to `/backtest` - should show empty state (no errors)

## If Still Getting Errors

The code now handles missing models gracefully and returns empty arrays/objects instead of errors. But for full functionality, you need to run the migration.

## Need Help?

Check the Prisma schema at: `backend/prisma/schema.prisma`

Make sure your `DATABASE_URL` in `backend/.env` is correct!

