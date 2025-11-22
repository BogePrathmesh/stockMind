# StockMaster IMS - Setup & Run Guide

## Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **PostgreSQL** (v14 or higher) - [Download](https://www.postgresql.org/download/)
- **npm** or **yarn** (comes with Node.js)

## Step-by-Step Setup

### 1. Database Setup

1. **Create PostgreSQL Database:**
   ```bash
   # Open PostgreSQL command line or pgAdmin
   # Create a new database
   CREATE DATABASE stockmaster_ims;
   ```

2. **Note your database credentials:**
   - Host: `localhost` (usually)
   - Port: `5432` (default)
   - Database: `stockmaster_ims`
   - Username: Your PostgreSQL username
   - Password: Your PostgreSQL password

### 2. Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create `.env` file:**
   Create a file named `.env` in the `backend` directory with the following content:
   ```env
   # Database
   DATABASE_URL="postgresql://YOUR_USERNAME:YOUR_PASSWORD@localhost:5432/stockmaster_ims?schema=public"
   
   # JWT Secrets (Change these to random strings in production!)
   JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
   JWT_REFRESH_SECRET=your_super_secret_refresh_key_change_this_in_production
   JWT_EXPIRE=24h
   JWT_REFRESH_EXPIRE=7d
   
   # Server
   PORT=5000
   NODE_ENV=development
   
   # Email Configuration (for OTP)
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_app_password
   EMAIL_FROM=noreply@stockmaster.com
   
   # File Upload
   UPLOAD_PATH=./uploads
   MAX_FILE_SIZE=5242880
   
   # CORS
   FRONTEND_URL=http://localhost:5173
   ```

   **Important:** Replace `YOUR_USERNAME` and `YOUR_PASSWORD` with your actual PostgreSQL credentials.

4. **Generate Prisma Client:**
   ```bash
   npm run prisma:generate
   ```

5. **Run Database Migrations:**
   ```bash
   npm run prisma:migrate
   ```
   When prompted, enter a migration name (e.g., "init") and press Enter.

6. **Create uploads directory:**
   ```bash
   mkdir uploads
   ```

7. **Start the backend server:**
   ```bash
   npm run dev
   ```

   The backend should now be running on `http://localhost:5000`

### 3. Frontend Setup

1. **Open a new terminal window** and navigate to frontend directory:
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the frontend development server:**
   ```bash
   npm run dev
   ```

   The frontend should now be running on `http://localhost:5173`

### 4. Access the Application

1. Open your browser and navigate to: `http://localhost:5173`

2. **Create your first account:**
   - Click "Sign up"
   - Fill in your details
   - Choose your role (Inventory Manager or Warehouse Staff)
   - Click "Sign up"

3. **You're ready to use StockMaster IMS!**

## Quick Start Commands

### Backend
```bash
cd backend
npm install          # Install dependencies
npm run prisma:generate  # Generate Prisma client
npm run prisma:migrate   # Run migrations
npm run dev          # Start development server
```

### Frontend
```bash
cd frontend
npm install          # Install dependencies
npm run dev          # Start development server
```

## Troubleshooting

### Database Connection Issues

**Error: "Can't reach database server"**
- Ensure PostgreSQL is running
- Check your database credentials in `.env`
- Verify the database `stockmaster_ims` exists

**Error: "Migration failed"**
- Make sure you've run `npm run prisma:generate` first
- Check your DATABASE_URL in `.env` is correct
- Ensure PostgreSQL user has permission to create tables

### Port Already in Use

**Error: "Port 5000 already in use"**
- Change `PORT=5000` to another port (e.g., `PORT=5001`) in backend `.env`
- Update `FRONTEND_URL` if you change the backend port

**Error: "Port 5173 already in use"**
- Vite will automatically try the next available port
- Or specify a different port in `vite.config.js`

### Email Configuration (Optional)

If you don't want to configure email for OTP:
- The forgot password feature won't work
- You can still use the application for all other features
- Leave email fields in `.env` as placeholders

### Missing Dependencies

If you get "module not found" errors:
```bash
# Backend
cd backend
rm -rf node_modules package-lock.json
npm install

# Frontend
cd frontend
rm -rf node_modules package-lock.json
npm install
```

## Production Build

### Build Frontend
```bash
cd frontend
npm run build
```
The built files will be in `frontend/dist/`

### Run Backend in Production
```bash
cd backend
NODE_ENV=production npm start
```

## Database Management

### View Database with Prisma Studio
```bash
cd backend
npm run prisma:studio
```
This opens a visual database browser at `http://localhost:5555`

### Reset Database (WARNING: Deletes all data)
```bash
cd backend
npx prisma migrate reset
```

## Project Structure

```
StockMind/
├── backend/
│   ├── src/
│   │   ├── controllers/    # API controllers
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   ├── middlewares/    # Auth, upload, etc.
│   │   └── utils/          # Helpers
│   ├── prisma/
│   │   └── schema.prisma   # Database schema
│   ├── uploads/            # Uploaded files
│   └── server.js           # Entry point
├── frontend/
│   ├── src/
│   │   ├── pages/          # Page components
│   │   ├── components/     # Reusable components
│   │   ├── store/          # State management
│   │   └── utils/          # Helpers
│   └── dist/               # Production build
└── README.md
```

## Default User Roles

- **INVENTORY_MANAGER**: Full access to all features
- **WAREHOUSE_STAFF**: Standard access (can be customized)

## Need Help?

- Check the console for error messages
- Verify all environment variables are set correctly
- Ensure both backend and frontend servers are running
- Check that PostgreSQL is running and accessible

## Next Steps

1. Create warehouses in Settings → Warehouses
2. Create categories in Settings → Categories
3. Add products in Products
4. Create receipts for incoming stock
5. Create deliveries for outgoing stock
6. Use transfers to move stock between warehouses
7. View stock ledger for complete history

Enjoy using StockMaster IMS! 🚀



