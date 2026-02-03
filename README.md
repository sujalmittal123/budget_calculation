# 💰 Budget Tracker - Personal Finance Management Application

A full-stack web application to help users track personal expenses, business expenses, and day-to-day bank transactions with beautiful charts and comprehensive reporting.

![Budget Tracker](https://img.shields.io/badge/Status-Ready%20to%20Use-success)
![React](https://img.shields.io/badge/React-18.2-blue)
![Node.js](https://img.shields.io/badge/Node.js-18+-green)
![MongoDB](https://img.shields.io/badge/MongoDB-8.0-brightgreen)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.4-38B2AC)

## ✨ Features

### 🔐 Authentication
- User registration and login
- JWT-based authentication
- Secure password hashing with bcrypt

### 💸 Transaction Management
- Add, edit, and delete transactions
- Transaction types: Income and Expense
- Categories: Personal and Business
- Multiple payment methods support (Card, Cash, UPI, Bank Transfer, Cheque)

### 🏦 Bank Account Tracking
- Add multiple bank accounts per user
- Track balance for each bank account
- Link transactions to bank accounts
- Automatic balance updates on each transaction

### 📊 Budget Calculations
- Monthly total income and expenses
- Remaining balance (income – expenses)
- Category-wise expense calculation
- Bank-wise balance calculation
- Monthly budget limit alerts

### 📈 Dashboard
- Summary cards (Income, Expense, Balance)
- Interactive charts for:
  - Income vs Expense trends (12 months)
  - Category-wise expense breakdown
  - Monthly spending comparison
  - Payment method analysis

### 🔍 Filters
- Filter transactions by date range
- Filter by category (personal/business)
- Filter by bank account
- Filter by transaction type (income/expense)
- Search by description

### 📁 Import/Export
- CSV import for bank statements
- Export transactions as CSV
- Export reports as PDF

### 🌙 Dark Mode
- Full dark mode support
- System preference detection

## 🧱 Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React.js 18, Tailwind CSS 3.4, Vite |
| Charts | Recharts |
| Backend | Node.js, Express.js |
| Database | MongoDB with Mongoose |
| Auth | JWT, bcryptjs |
| PDF | PDFKit |
| CSV | csv-parse |

## 📁 Project Structure

```
Budget_calulation/
├── backend/
│   ├── middleware/
│   │   ├── auth.js           # JWT authentication middleware
│   │   └── validate.js       # Request validation middleware
│   ├── models/
│   │   ├── User.js           # User schema
│   │   ├── BankAccount.js    # Bank account schema
│   │   └── Transaction.js    # Transaction schema
│   ├── routes/
│   │   ├── auth.js           # Authentication routes
│   │   ├── bankAccounts.js   # Bank account CRUD
│   │   ├── transactions.js   # Transaction CRUD + CSV import
│   │   ├── dashboard.js      # Dashboard analytics
│   │   └── export.js         # CSV/PDF export
│   ├── server.js             # Express server entry
│   ├── package.json
│   └── .env
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Layout.jsx        # Main layout with sidebar
    │   │   ├── Modal.jsx         # Reusable modal component
    │   │   ├── PrivateRoute.jsx  # Auth route protection
    │   │   └── Spinner.jsx       # Loading spinner
    │   ├── context/
    │   │   ├── AuthContext.jsx   # Authentication state
    │   │   └── ThemeContext.jsx  # Dark mode state
    │   ├── pages/
    │   │   ├── Dashboard.jsx     # Main dashboard with charts
    │   │   ├── Transactions.jsx  # Transaction management
    │   │   ├── BankAccounts.jsx  # Bank account management
    │   │   ├── Reports.jsx       # Detailed reports
    │   │   ├── Settings.jsx      # User settings
    │   │   ├── Login.jsx         # Login page
    │   │   └── Register.jsx      # Registration page
    │   ├── services/
    │   │   └── api.js            # Axios API configuration
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── index.html
    ├── package.json
    ├── tailwind.config.js
    ├── postcss.config.js
    └── vite.config.js
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18 or higher
- MongoDB (local or cloud - MongoDB Atlas)
- npm or yarn

### 1. Clone the Repository

```bash
cd Budget_calulation
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file (already created, but update if needed)
# Edit .env with your MongoDB connection string
PORT=5000
MONGODB_URI=mongodb://localhost:27017/budget_tracker
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRE=7d
NODE_ENV=development

# Start the backend server
npm run dev
```

### 3. Frontend Setup

```bash
# Open a new terminal
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

### 4. Access the Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## 📖 API Documentation

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/auth/me` | Get current user |
| PUT | `/api/auth/profile` | Update user profile |
| PUT | `/api/auth/password` | Change password |

### Bank Account Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/bank-accounts` | Get all bank accounts |
| GET | `/api/bank-accounts/:id` | Get single bank account |
| POST | `/api/bank-accounts` | Create bank account |
| PUT | `/api/bank-accounts/:id` | Update bank account |
| DELETE | `/api/bank-accounts/:id` | Delete bank account |

### Transaction Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/transactions` | Get transactions (with filters) |
| GET | `/api/transactions/:id` | Get single transaction |
| POST | `/api/transactions` | Create transaction |
| PUT | `/api/transactions/:id` | Update transaction |
| DELETE | `/api/transactions/:id` | Delete transaction |
| POST | `/api/transactions/import-csv` | Import from CSV |
| DELETE | `/api/transactions/bulk` | Bulk delete |

### Dashboard Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard/summary` | Get monthly summary |
| GET | `/api/dashboard/category-breakdown` | Get category breakdown |
| GET | `/api/dashboard/monthly-trend` | Get 12-month trend |
| GET | `/api/dashboard/bank-summary` | Get bank-wise summary |
| GET | `/api/dashboard/recent-transactions` | Get recent transactions |
| GET | `/api/dashboard/payment-method-breakdown` | Get payment method breakdown |

### Export Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/export/transactions/csv` | Export transactions as CSV |
| GET | `/api/export/report/pdf` | Export monthly report as PDF |

## 📊 Database Models

### User Model
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  monthlyBudgetLimit: Number,
  preferences: {
    darkMode: Boolean,
    currency: String
  },
  createdAt: Date
}
```

### BankAccount Model
```javascript
{
  userId: ObjectId,
  bankName: String,
  accountNumber: String (masked for display),
  accountType: 'savings' | 'checking' | 'credit' | 'business',
  balance: Number,
  initialBalance: Number,
  currency: String,
  color: String,
  isActive: Boolean
}
```

### Transaction Model
```javascript
{
  userId: ObjectId,
  bankId: ObjectId,
  type: 'income' | 'expense',
  category: 'personal' | 'business',
  amount: Number,
  paymentMethod: 'cash' | 'card' | 'upi' | 'bank_transfer' | 'cheque' | 'other',
  description: String,
  date: Date,
  tags: [String],
  isRecurring: Boolean,
  recurringPeriod: 'daily' | 'weekly' | 'monthly' | 'yearly'
}
```

## 📝 CSV Import Format

When importing transactions via CSV, use the following columns:

```csv
date,type,category,amount,description,paymentMethod
2024-01-15,expense,personal,50.00,Groceries,card
2024-01-16,income,business,1000.00,Freelance payment,bank_transfer
```

## 🔧 Environment Variables

### Backend (.env)

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 5000 |
| `MONGODB_URI` | MongoDB connection string | - |
| `JWT_SECRET` | JWT signing secret | - |
| `JWT_EXPIRE` | JWT expiration time | 7d |
| `NODE_ENV` | Environment | development |

## 🎨 Screenshots

### Dashboard
- Clean summary cards showing income, expense, and balance
- Interactive area charts for trends
- Pie charts for category breakdown
- Bar charts for monthly comparison

### Transactions
- Paginated transaction list
- Easy filtering and search
- Quick add/edit modal
- Bulk operations support

### Bank Accounts
- Card-style account display
- Color-coded accounts
- Quick balance overview
- Transaction count per account

### Reports
- Month/year selector
- PDF export functionality
- Multiple chart types
- Detailed category breakdown

### Settings
- Profile management
- Budget limit configuration
- Dark mode toggle
- Password change

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- [React](https://reactjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Recharts](https://recharts.org/)
- [Express.js](https://expressjs.com/)
- [MongoDB](https://www.mongodb.com/)
- [React Icons](https://react-icons.github.io/react-icons/)

---

Built with ❤️ for better personal finance management
