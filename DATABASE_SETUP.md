# Database Setup - SQLite (Recommended)

## ✅ Why SQLite?

I've configured the project to use **SQLite** instead of PostgreSQL because:

- ✅ **No installation needed** - Works out of the box
- ✅ **Zero configuration** - Just works!
- ✅ **Perfect for development** - Fast and reliable
- ✅ **File-based** - Database is a single file (`dev.db`)
- ✅ **Production-ready** - SQLite handles millions of requests/day

## 🚀 Quick Setup

The `.env` file is already configured! Just run:

```bash
cd backend

# Generate Prisma client
npm run prisma:generate

# Create database and tables
npm run prisma:migrate
# When prompted, enter: "init"

# Start server
npm run dev
```

That's it! The database file `dev.db` will be created automatically in the `backend` folder.

## 📁 Database File Location

- **File**: `backend/dev.db`
- **Size**: Grows as you add data
- **Backup**: Just copy the file!

## 🔄 Switching to PostgreSQL (Optional)

If you prefer PostgreSQL for production:

1. **Update `backend/prisma/schema.prisma`:**
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```

2. **Update `backend/.env`:**
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/stockmaster_ims?schema=public"
   ```

3. **Run migrations:**
   ```bash
   npm run prisma:migrate
   ```

## 🗄️ Database Management

### View Database with Prisma Studio
```bash
cd backend
npm run prisma:studio
```
Opens at: http://localhost:5555

### Reset Database (WARNING: Deletes all data)
```bash
cd backend
npx prisma migrate reset
```

### Backup Database
Just copy `backend/dev.db` to a safe location!

## 📊 Database Features

SQLite supports all the features needed:
- ✅ All Prisma features
- ✅ Transactions
- ✅ Foreign keys
- ✅ Indexes
- ✅ Complex queries
- ✅ Full-text search (if needed)

## 🎯 Current Configuration

The project is configured with:
- **Database**: SQLite
- **File**: `backend/dev.db`
- **Auto-created**: Yes, on first migration
- **Backup**: Copy the file

**You're all set! No database server needed!** 🎉






