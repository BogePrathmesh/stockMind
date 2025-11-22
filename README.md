# StockMaster IMS - Inventory Management System

A comprehensive full-stack inventory management system built with React, Node.js, Express, and PostgreSQL.

## Features

- ✅ User Authentication (JWT, OTP-based password reset)
- ✅ Dashboard with KPIs and Charts
- ✅ Product Management
- ✅ Receipts (Incoming Goods)
- ✅ Delivery Orders (Outgoing Goods)
- ✅ Internal Transfers
- ✅ Stock Adjustments
- ✅ Stock Ledger/Move History
- ✅ Warehouse & Category Management
- ✅ PDF Generation
- ✅ Real-time Updates (WebSocket)
- ✅ AI Stock Prediction (Optional)

## Tech Stack

### Backend
- Node.js + Express
- PostgreSQL + Prisma ORM
- JWT Authentication
- Socket.io for real-time updates
- PDFKit for PDF generation
- Nodemailer for OTP emails

### Frontend
- React + Vite
- TailwindCSS
- Zustand for state management
- React Router
- Recharts for charts
- Axios for API calls

## Setup Instructions

### Prerequisites
- Node.js (v18+)
- PostgreSQL (v14+)
- npm or yarn

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the backend directory:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/stockmaster_ims?schema=public"
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_REFRESH_SECRET=your_super_secret_refresh_key_change_this_in_production
JWT_EXPIRE=24h
JWT_REFRESH_EXPIRE=7d
PORT=5000
NODE_ENV=development
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
EMAIL_FROM=noreply@stockmaster.com
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=5242880
FRONTEND_URL=http://localhost:5173
```

4. Generate Prisma client:
```bash
npm run prisma:generate
```

5. Run database migrations:
```bash
npm run prisma:migrate
```

6. Start the backend server:
```bash
npm run dev
```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:5173`

## Project Structure

```
StockMind/
├── backend/
│   ├── src/
│   │   ├── controllers/    # Request handlers
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   ├── middlewares/    # Auth, upload, etc.
│   │   └── utils/          # Helpers
│   ├── prisma/
│   │   └── schema.prisma  # Database schema
│   └── server.js          # Entry point
├── frontend/
│   ├── src/
│   │   ├── pages/         # Page components
│   │   ├── components/    # Reusable components
│   │   ├── store/         # State management
│   │   └── utils/         # Helpers
│   └── package.json
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/forgot-password` - Request OTP
- `POST /api/auth/reset-password` - Reset password with OTP
- `POST /api/auth/refresh-token` - Refresh JWT token

### Products
- `GET /api/products` - List products
- `GET /api/products/:id` - Get product details
- `POST /api/products` - Create product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product
- `GET /api/products/low-stock` - Get low stock products

### Receipts
- `GET /api/receipts` - List receipts
- `GET /api/receipts/:id` - Get receipt details
- `POST /api/receipts` - Create receipt
- `PUT /api/receipts/:id` - Update receipt
- `POST /api/receipts/:id/validate` - Validate receipt
- `GET /api/receipts/:id/pdf` - Generate PDF

### Deliveries
- `GET /api/deliveries` - List deliveries
- `GET /api/deliveries/:id` - Get delivery details
- `POST /api/deliveries` - Create delivery
- `PUT /api/deliveries/:id` - Update delivery
- `POST /api/deliveries/:id/validate` - Validate delivery
- `GET /api/deliveries/:id/pdf` - Generate PDF

### Transfers
- `GET /api/transfers` - List transfers
- `GET /api/transfers/:id` - Get transfer details
- `POST /api/transfers` - Create transfer
- `PUT /api/transfers/:id` - Update transfer
- `POST /api/transfers/:id/validate` - Validate transfer
- `GET /api/transfers/:id/pdf` - Generate PDF

### Adjustments
- `GET /api/adjustments` - List adjustments
- `GET /api/adjustments/:id` - Get adjustment details
- `POST /api/adjustments` - Create adjustment

### Ledger
- `GET /api/ledger` - Get stock movements
- `GET /api/ledger/:id` - Get movement details

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics

### Settings
- `GET /api/warehouses` - List warehouses
- `POST /api/warehouses` - Create warehouse
- `GET /api/categories` - List categories
- `POST /api/categories` - Create category

### Profile
- `GET /api/profile` - Get user profile
- `PUT /api/profile` - Update profile
- `POST /api/profile/change-password` - Change password

## Default Roles

- **INVENTORY_MANAGER** - Full access
- **WAREHOUSE_STAFF** - Limited access

## Development

### Database Migrations
```bash
cd backend
npm run prisma:migrate
```

### View Database
```bash
cd backend
npm run prisma:studio
```

## Production Deployment

1. Set `NODE_ENV=production` in backend `.env`
2. Build frontend: `cd frontend && npm run build`
3. Serve frontend build with a static file server
4. Configure environment variables
5. Set up PostgreSQL database
6. Run migrations
7. Start backend server with PM2 or similar

## License

MIT

## Support

For issues and questions, please open an issue on the repository.






