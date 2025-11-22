# 🚀 Quick Start - MongoDB Atlas Setup

## ✅ Your MongoDB Connection

**Connection String:** `mongodb+srv://bogeprathmesh:secure12345@cluster0.iwmcgzx.mongodb.net/stockmaster_ims`

**Database:** `stockmaster_ims`

## 📋 Setup Steps

### 1. Verify .env File

The `.env` file in `backend/` folder should have:
```env
DATABASE_URL="mongodb+srv://bogeprathmesh:secure12345@cluster0.iwmcgzx.mongodb.net/stockmaster_ims?retryWrites=true&w=majority&appName=Cluster0"
```

### 2. Generate Prisma Client

```bash
cd backend

# If you get file lock error, stop the server first, then:
npm run prisma:generate
```

### 3. Start Backend

```bash
cd backend
npm run dev
```

Backend runs on: **http://localhost:5000**

### 4. Start Frontend

```bash
cd frontend
npm run dev
```

Frontend runs on: **http://localhost:5173**

### 5. Create Your First Account!

1. Open: **http://localhost:5173**
2. Click **"Sign up"**
3. Fill in:
   - Name: Your name
   - Email: Your email
   - Password: Your password
   - Role: Choose your role
4. Click **"Sign up"**
5. ✅ Account created in MongoDB Atlas!
6. ✅ Automatically logged in!

## 🔍 Verify in MongoDB Atlas

1. Go to [MongoDB Atlas Dashboard](https://cloud.mongodb.com)
2. Click on your cluster
3. Click **"Browse Collections"**
4. Select database: `stockmaster_ims`
5. Select collection: `User`
6. See your new user! 🎉

## 🎯 What's Working

- ✅ User signup stores data in MongoDB Atlas
- ✅ Password is securely hashed
- ✅ Email uniqueness is enforced
- ✅ Automatic login after signup
- ✅ JWT tokens generated
- ✅ User data saved to `User` collection

## 🔧 If Prisma Generate Fails

**Error:** `EPERM: operation not permitted`

**Solution:**
1. Stop the backend server (Ctrl+C)
2. Wait a few seconds
3. Run: `npm run prisma:generate`
4. Start server again: `npm run dev`

## 📝 Test Signup

**Via Browser:**
- Go to: http://localhost:5173/signup
- Fill form and submit

**Via API (for testing):**
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "test123",
    "role": "INVENTORY_MANAGER"
  }'
```

## ✅ Everything is Ready!

Your signup functionality is **fully configured** to store user accounts in MongoDB Atlas!

**Just start the servers and create accounts!** 🎉





