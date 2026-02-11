# SliceCraft - Online Pizza Ordering System

A full-stack pizza ordering application built as part of my web development internship at **Oasis Infobyte**. The app lets users customize and order pizzas online, with real-time order tracking, secure payments, and a dedicated admin panel for managing orders and inventory.

## Table of Contents

- [About the Project](#about-the-project)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Usage](#usage)
- [Author](#author)

## About the Project

SliceCraft is a pizza ordering platform where customers can build their own pizzas by choosing from various bases, sauces, cheeses, vegetables, and meats. The system handles the full lifecycle from order placement to delivery, with real-time status updates pushed to the user's browser.

The admin panel runs separately and gives shop owners a way to manage incoming orders, update statuses, and keep track of inventory levels. Low stock alerts are sent automatically via email.

## Features

**Customer Side**
- User registration with email verification
- Login / logout with JWT-based authentication
- Forgot password and reset password flow
- 5-step pizza builder (base, sauce, cheese, veggies, meats)
- Shopping cart with quantity management
- Checkout with delivery address form
- Razorpay payment integration
- Order history with real-time status tracking
- Order cancellation (while order is still pending or received)

**Admin Side**
- Separate admin panel on its own port
- Dashboard with key stats (total orders, revenue, pending orders, low stock count)
- Order management with status progression (Pending > Received > In Kitchen > Out for Delivery > Delivered)
- Inventory management across all ingredient categories
- Low stock email alerts to admin
- Paginated and filterable order list

**General**
- Real-time updates via Socket.IO
- Responsive design that works on mobile
- Email notifications for verification, password reset, and order status changes

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Node.js, Express.js |
| Database | PostgreSQL (raw SQL via `pg`) |
| Frontend | React 18, Vite |
| Auth | JWT, bcryptjs |
| Payments | Razorpay |
| Real-time | Socket.IO |
| Email | Nodemailer |

## Project Structure

```
PIZZA/
├── server/                 # Backend API
│   ├── src/
│   │   ├── index.js        # Express + Socket.IO setup
│   │   ├── db.js           # PostgreSQL connection pool
│   │   ├── init-db.js      # Schema creation and seed data
│   │   ├── middleware/
│   │   │   └── auth.js     # JWT auth and role-based access
│   │   ├── routes/
│   │   │   ├── auth.js     # Registration, login, verification
│   │   │   ├── order.js    # Order CRUD + cancellation
│   │   │   ├── payment.js  # Razorpay create/verify
│   │   │   ├── inventory.js# Public inventory endpoints
│   │   │   └── admin.js    # Admin orders, inventory, stats
│   │   └── services/
│   │       ├── email.js    # Nodemailer templates
│   │       └── inventory.js# Stock management + alerts
│   └── package.json
│
├── client/                 # Customer-facing React app
│   ├── src/
│   │   ├── components/     # Navbar, AdminSidebar
│   │   ├── context/        # AuthContext, CartContext
│   │   ├── pages/          # All page components
│   │   ├── services/       # Axios API config
│   │   ├── utils/          # Shared constants
│   │   └── index.css       # Design system
│   └── package.json
│
├── admin-client/           # Admin panel React app
│   ├── src/
│   │   ├── components/     # Sidebar
│   │   ├── context/        # AuthContext
│   │   ├── pages/          # Dashboard, Orders, Inventory, Login
│   │   └── services/       # Axios API config
│   └── package.json
│
└── .env                    # Environment configuration
```

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- PostgreSQL database
- Razorpay account (for payment integration)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/MrCrow-creator/OIBSIP.git
   cd OIBSIP
   ```

2. Install dependencies for each part:
   ```bash
   cd server && npm install
   cd ../client && npm install
   cd ../admin-client && npm install
   ```

3. Set up your `.env` file in the project root (see below).

4. Initialize the database:
   ```bash
   cd server
   node src/init-db.js
   ```

5. Start all three services:
   ```bash
   # Terminal 1 - Backend
   cd server && npm run dev

   # Terminal 2 - Customer app
   cd client && npm run dev

   # Terminal 3 - Admin panel
   cd admin-client && npm run dev
   ```

The customer app runs on `http://localhost:5173`, the admin panel on `http://localhost:5174`, and the API server on `http://localhost:5000`.

## Environment Variables

Create a `.env` file in the `server/` directory:

```env
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/pizza_db

# Authentication
JWT_SECRET=your_jwt_secret_here

# Razorpay
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# Email (Gmail example)
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# App
PORT=5000
CLIENT_URL=http://localhost:5173
ADMIN_EMAIL=admin@example.com
```

## Usage

1. Register a new account on the customer app and verify your email.
2. Log in and use the pizza builder to customize your order.
3. Add pizzas to your cart, fill in a delivery address, and pay via Razorpay.
4. Track your order status in real-time on the Orders page.
5. Admins can log in to the admin panel to manage orders and inventory.

A default admin account is created during database initialization — check `init-db.js` for the credentials.

## Author

**Kawal** - Built during my internship at Oasis Infobyte (OIBSIP).

---

This project was developed as part of the Oasis Infobyte Student Internship Program (OIBSIP) to demonstrate full-stack web development skills including authentication, payment integration, real-time communication, and admin panel design.
