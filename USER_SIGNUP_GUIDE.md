# 👤 User Signup & Account Creation Guide

## ✅ Configuration Complete!

Your MongoDB Atlas connection is configured:
- **Connection String:** `mongodb+srv://bogeprathmesh:secure12345@cluster0.iwmcgzx.mongodb.net/stockmaster_ims`
- **Database:** `stockmaster_ims`
- **User Signup:** ✅ Ready to use!

## 🚀 How to Create User Accounts

### Method 1: Sign Up via Frontend (Recommended)

1. **Start Backend Server:**
   ```bash
   cd backend
   npm run dev
   ```

2. **Start Frontend Server:**
   ```bash
   cd frontend
   npm run dev
   ```

3. **Create Account:**
   - Open browser: **http://localhost:5173**
   - Click **"Sign up"** button
   - Fill in the form:
     - **Name:** Your full name
     - **Email:** Your email address
     - **Role:** Choose Inventory Manager or Warehouse Staff
     - **Password:** Your password (min 6 characters)
     - **Confirm Password:** Re-enter password
   - Click **"Sign up"**
   - You'll be automatically logged in!

### Method 2: Test Signup via API

You can test the signup API directly:

```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "role": "INVENTORY_MANAGER"
  }'
```

## 📋 Signup Form Fields

- **Name** (required): User's full name
- **Email** (required): Unique email address
- **Password** (required): Minimum 6 characters
- **Role** (required): 
  - `INVENTORY_MANAGER` - Full access
  - `WAREHOUSE_STAFF` - Standard access

## 🔐 What Happens When User Signs Up

1. ✅ Validates all required fields
2. ✅ Checks if email already exists
3. ✅ Hashes password securely (bcrypt)
4. ✅ Creates user in MongoDB Atlas
5. ✅ Generates JWT tokens
6. ✅ Returns user data and tokens
7. ✅ User is automatically logged in

## 📊 Data Stored in MongoDB

When a user signs up, the following data is stored in the `User` collection:

```json
{
  "_id": "ObjectId",
  "name": "John Doe",
  "email": "john@example.com",
  "password": "hashed_password",
  "role": "INVENTORY_MANAGER",
  "profileImage": null,
  "otp": null,
  "otpExpiry": null,
  "createdAt": "2024-11-22T...",
  "updatedAt": "2024-11-22T..."
}
```

## 🎯 Quick Test

1. **Start servers:**
   ```bash
   # Terminal 1
   cd backend && npm run dev
   
   # Terminal 2
   cd frontend && npm run dev
   ```

2. **Create account:**
   - Go to: http://localhost:5173/signup
   - Fill form and submit
   - Check MongoDB Atlas to see the new user!

3. **Verify in MongoDB:**
   - Go to MongoDB Atlas Dashboard
   - Navigate to your cluster
   - Click "Browse Collections"
   - Check `stockmaster_ims` database
   - View `User` collection
   - See your new user!

## 🔧 Troubleshooting

### Issue: "User already exists"
- **Solution:** Use a different email address

### Issue: "All fields are required"
- **Solution:** Make sure all fields are filled

### Issue: Connection error
- **Solution:** 
  - Check MongoDB Atlas IP whitelist (add `0.0.0.0/0`)
  - Verify connection string in `.env`
  - Ensure cluster is running

### Issue: Prisma generate error
- **Solution:** 
  - Stop the backend server
  - Run `npm run prisma:generate`
  - Start server again

## ✅ Signup Features

- ✅ Email uniqueness validation
- ✅ Password hashing (bcrypt)
- ✅ Automatic login after signup
- ✅ JWT token generation
- ✅ Role-based access control
- ✅ Data stored in MongoDB Atlas

## 📝 Example Signup Request

**Frontend automatically handles this, but here's what happens:**

```javascript
POST /api/auth/signup
Content-Type: application/json

{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "password": "secure123",
  "role": "WAREHOUSE_STAFF"
}
```

**Response:**
```json
{
  "message": "User created successfully",
  "user": {
    "id": "...",
    "name": "Jane Smith",
    "email": "jane@example.com",
    "role": "WAREHOUSE_STAFF",
    "createdAt": "..."
  },
  "token": "jwt_token_here",
  "refreshToken": "refresh_token_here"
}
```

## 🎉 Ready to Use!

Your signup functionality is **fully configured** and ready to create user accounts in MongoDB Atlas!

**Just start the servers and go to the signup page!** 🚀


