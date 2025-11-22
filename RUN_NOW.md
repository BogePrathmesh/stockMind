# 🚀 Run StockMaster IMS NOW - 3 Simple Steps!

## Step 1: Setup Backend (Terminal 1)

```bash
cd backend

# Install dependencies (first time only)
npm install

# Generate Prisma client (first time only)
npm run prisma:generate

# Create database and tables (first time only)
npm run prisma:migrate
# Enter: "init" when prompted

# Start backend server
npm run dev
```

✅ Backend running on: **http://localhost:5000**

## Step 2: Setup Frontend (Terminal 2)

```bash
cd frontend

# Install dependencies (first time only)
npm install

# Start frontend server
npm run dev
```

✅ Frontend running on: **http://localhost:5173**

## Step 3: Use the App!

1. Open browser: **http://localhost:5173**
2. Click **"Sign up"**
3. Create your account
4. Start managing inventory! 🎉

---

## 🎯 That's It!

**No database installation needed!** The project uses SQLite which works automatically.

The `.env` file is already configured in the backend folder.

## 📋 Quick Commands

### Backend
```bash
cd backend
npm run dev              # Start server
npm run prisma:studio    # View database (optional)
```

### Frontend
```bash
cd frontend
npm run dev              # Start server
```

## 🆘 Troubleshooting

**Error: DATABASE_URL not found**
- Make sure `backend/.env` file exists
- Run `npm run prisma:migrate` to create database

**Error: Port already in use**
- Backend: Change `PORT=5000` in `.env`
- Frontend: Vite will auto-use next port

**Error: Module not found**
```bash
# Delete and reinstall
rm -rf node_modules package-lock.json
npm install
```

---

**Ready to go! 🚀**



