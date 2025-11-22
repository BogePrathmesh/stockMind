# StockMaster IMS - Quick Start Guide

## 🚀 How to Run the Project

### Prerequisites Check
- ✅ Node.js v18+ installed
- ✅ That's it! No database installation needed (using SQLite)

### Step 1: Setup Backend

```bash
# Navigate to backend folder
cd backend

# Install dependencies
npm install

# .env file is already created with SQLite configuration!
# No database setup needed - SQLite works out of the box

# Generate Prisma client
npm run prisma:generate

# Run database migrations (creates dev.db automatically)
npm run prisma:migrate
# When prompted, enter migration name: "init"

# Create uploads directory (if not exists)
mkdir uploads

# Start backend server
npm run dev
```

Backend will run on: **http://localhost:5000**

### Step 2: Setup Frontend

```bash
# Open a NEW terminal window
# Navigate to frontend folder
cd frontend

# Install dependencies
npm install

# Start frontend development server
npm run dev
```

Frontend will run on: **http://localhost:5173**

### Step 3: Access Application

1. Open browser: **http://localhost:5173**
2. Click "Sign up" to create your first account
3. Choose role: **Inventory Manager** or **Warehouse Staff**
4. Start using StockMaster IMS!

## 📋 Quick Commands Reference

### Backend Commands
```bash
cd backend
npm install              # Install dependencies
npm run prisma:generate  # Generate Prisma client
npm run prisma:migrate   # Run migrations
npm run prisma:studio    # Open database GUI
npm run dev              # Start dev server
npm start                # Start production server
```

### Frontend Commands
```bash
cd frontend
npm install              # Install dependencies
npm run dev              # Start dev server
npm run build            # Build for production
npm run preview          # Preview production build
```

## 🔧 Common Issues & Solutions

### Issue: Database Connection Error
**Solution:** 
- SQLite is file-based, no server needed
- Just run `npm run prisma:migrate` to create the database
- Check that `backend/.env` exists with `DATABASE_URL="file:./dev.db"`

### Issue: Port Already in Use
**Solution:**
- Backend: Change `PORT=5000` to another port in `.env`
- Frontend: Vite will auto-use next available port

### Issue: Module Not Found
**Solution:**
```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Issue: Prisma Client Not Generated
**Solution:**
```bash
cd backend
npm run prisma:generate
```

## 📁 Project Structure

```
StockMind/
├── backend/          # Node.js + Express API
│   ├── src/
│   ├── prisma/
│   └── uploads/      # Product images, PDFs
├── frontend/         # React + Vite app
│   └── src/
└── README.md
```

## 🎯 First Steps After Setup

1. **Create Warehouses**
   - Go to Settings → Warehouses
   - Add your warehouse locations

2. **Create Categories**
   - Go to Settings → Categories
   - Add product categories

3. **Add Products**
   - Go to Products
   - Click "Add Product"
   - Fill in product details

4. **Create Receipt**
   - Go to Receipts
   - Add incoming stock from suppliers

5. **View Dashboard**
   - See KPIs, charts, and recent activity

## 📝 Environment Variables

### Backend (.env) - Already Created!
The `.env` file is already set up with SQLite. No changes needed!
```env
DATABASE_URL="file:./dev.db"  # SQLite - no setup needed!
JWT_SECRET=stockmaster_super_secret_jwt_key_2024_change_in_production
JWT_REFRESH_SECRET=stockmaster_super_secret_refresh_key_2024_change_in_production
PORT=5000
FRONTEND_URL=http://localhost:5173
```

## 🆘 Need Help?

1. Check console for error messages
2. Verify both servers are running
3. Check database connection
4. Review SETUP.md for detailed instructions

## ✅ Verification Checklist

- [ ] Backend `.env` file exists (already created!)
- [ ] Backend dependencies installed
- [ ] Prisma client generated (`npm run prisma:generate`)
- [ ] Database created (`npm run prisma:migrate` - creates `dev.db`)
- [ ] Backend server running on port 5000
- [ ] Frontend dependencies installed
- [ ] Frontend server running on port 5173
- [ ] Can access http://localhost:5173
- [ ] Can create account and login

**You're all set! 🎉**

