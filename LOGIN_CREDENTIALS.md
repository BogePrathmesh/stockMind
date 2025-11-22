# 🔐 Login Credentials for StockMaster IMS

## Default Admin Account

After running the seed script, you can login with:

**Email:** `admin@stockmaster.com`  
**Password:** `admin123`  
**Role:** Inventory Manager (Full Access)

## 🚀 Setup Steps

### 1. Update Database Connection

The `.env` file has been updated with your MongoDB connection string:
```
DATABASE_URL="mongodb+srv://aimhighpa_db_user:UEe6SFvcB5ZGYIov@cluster0.nu9jnih.mongodb.net/stockmaster_ims?retryWrites=true&w=majority&appName=Cluster0"
```

### 2. Generate Prisma Client

```bash
cd backend
npm run prisma:generate
```

### 3. Seed Database (Create Admin User)

```bash
npm run prisma:seed
```

This will create:
- ✅ Admin user: `admin@stockmaster.com` / `admin123`
- ✅ Default warehouse: "Main Warehouse"
- ✅ Default categories: Electronics, Clothing, Food & Beverages, etc.

### 4. Start Backend

```bash
npm run dev
```

### 5. Start Frontend

```bash
cd frontend
npm run dev
```

### 6. Login

1. Open: **http://localhost:5173**
2. Click **"Sign in"**
3. Enter:
   - **Email:** `admin@stockmaster.com`
   - **Password:** `admin123`
4. Click **"Sign in"**

## 👤 User Roles

### Inventory Manager
- Full access to all features
- Can manage users, warehouses, categories
- Can validate receipts, deliveries, transfers

### Warehouse Staff
- Standard access
- Can create receipts, deliveries, transfers
- Limited settings access

## 🔄 Create New Users

You can create new users through the Sign Up page:
1. Go to **http://localhost:5173/signup**
2. Fill in the form
3. Choose role
4. Click "Sign up"

## 🔑 Change Admin Password

To change the admin password:
1. Login as admin
2. Go to **Profile** (sidebar)
3. Click **"Change Password"** tab
4. Enter current and new password

## 📝 Notes

- The seed script is safe to run multiple times (uses `upsert`)
- Default admin user will be created/updated each time you run seed
- You can modify the seed script to create additional users

## 🆘 Troubleshooting

**Can't login?**
- Make sure you ran `npm run prisma:seed`
- Check that backend server is running
- Verify MongoDB connection in `.env`

**Forgot password?**
- Use "Forgot Password" on login page
- Or run seed script again to reset admin password

---

**Ready to use! Login with admin@stockmaster.com / admin123** 🎉


