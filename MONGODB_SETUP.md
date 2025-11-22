# 🗄️ MongoDB Setup & Login Instructions

## ✅ Configuration Complete!

Your project is now configured to use **MongoDB Atlas** with your connection string.

## 🔐 Default Login Credentials

After running the seed script, use these credentials:

**Email:** `admin@stockmaster.com`  
**Password:** `admin123`  
**Role:** Inventory Manager (Full Access)

## 🚀 Setup Steps

### 1. Verify MongoDB Connection

The `.env` file is configured with:
```
DATABASE_URL="mongodb+srv://aimhighpa_db_user:UEe6SFvcB5ZGYIov@cluster0.nu9jnih.mongodb.net/stockmaster_ims?retryWrites=true&w=majority&appName=Cluster0"
```

### 2. Generate Prisma Client

```bash
cd backend
npm run prisma:generate
```

### 3. Create Admin User (Seed Database)

```bash
npm run prisma:seed
```

**Note:** If you get connection errors:
- Check your MongoDB Atlas IP whitelist (add `0.0.0.0/0` for all IPs)
- Verify the connection string is correct
- Ensure MongoDB Atlas cluster is running

### 4. Start Backend Server

```bash
npm run dev
```

### 5. Start Frontend Server

```bash
cd frontend
npm run dev
```

### 6. Login to Application

1. Open browser: **http://localhost:5173**
2. Click **"Sign in"**
3. Enter credentials:
   - **Email:** `admin@stockmaster.com`
   - **Password:** `admin123`
4. Click **"Sign in"**

## 📝 Alternative: Create User via Sign Up

If seed script doesn't work, you can create a user manually:

1. Go to: **http://localhost:5173/signup**
2. Fill in:
   - Name: Admin User
   - Email: admin@stockmaster.com
   - Password: admin123
   - Role: Inventory Manager
3. Click **"Sign up"**
4. Login with these credentials

## 🔧 Troubleshooting MongoDB Connection

### Issue: Connection Timeout

**Solution 1: Check IP Whitelist**
1. Go to MongoDB Atlas Dashboard
2. Click "Network Access"
3. Add IP Address: `0.0.0.0/0` (allows all IPs)
4. Or add your specific IP address

**Solution 2: Verify Connection String**
- Make sure the password is correct
- Check that the cluster is running
- Verify database name in connection string

**Solution 3: Test Connection**
```bash
# Test MongoDB connection
node -e "const { PrismaClient } = require('@prisma/client'); const prisma = new PrismaClient(); prisma.$connect().then(() => console.log('Connected!')).catch(e => console.error(e))"
```

## 📋 What the Seed Script Creates

- ✅ **Admin User**
  - Email: admin@stockmaster.com
  - Password: admin123
  - Role: INVENTORY_MANAGER

- ✅ **Default Warehouse**
  - Name: Main Warehouse
  - Address: 123 Main Street, City, Country

- ✅ **Default Categories**
  - Electronics
  - Clothing
  - Food & Beverages
  - Office Supplies
  - Tools & Hardware

## 🎯 Quick Start Commands

```bash
# Backend
cd backend
npm run prisma:generate    # Generate Prisma client
npm run prisma:seed        # Create admin user
npm run dev                # Start server

# Frontend (new terminal)
cd frontend
npm run dev                # Start server
```

## 🔑 Login Summary

**URL:** http://localhost:5173  
**Email:** admin@stockmaster.com  
**Password:** admin123

---

**Ready to use!** 🎉


