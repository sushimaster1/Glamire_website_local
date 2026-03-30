# Glamire Fashion (Premium E-commerce)

A complete, production-ready e-commerce platform built with the MERN stack (MongoDB, Express, React, Node.js) and configured with a Premium Fashion aesthetic using Tailwind CSS and Razorpay payment integration.

## Features Built
1. **Frontend**: React + Vite + Tailwind CSS. 
   - Global state management using Zustand.
   - Elegant UI featuring Animations, Micro-interactions, and Glassmorphism.
   - Pages: Home, Shop, Product Details, Cart, Wishlist, Checkout, Profile, Auth (Login/Signup), and Seller Dashboard.
2. **Backend**: Node.js + Express + MongoDB.
   - JWT-based Authentication.
   - Role-based Access Control (User vs Seller).
   - Dynamic Product Engine with compound variants (Color x Size x Stock).
   - Order Management and Sales Analytics per product.
3. **Payments**: Integrated Razorpay API (Test Mode defaults included).

---

## 🚀 Local Deployment Instructions

### Prerequisites
- Node.js (v18 or higher recommended)
- MongoDB running locally (`mongodb://localhost:27017`)
- Razorpay Test Keys (if you wish to simulate real payments)

### 1. Start the Backend Server
```bash
cd server
npm install
npm run dev
```
The backend API should now be running on **http://localhost:3000** and will automatically establish a connection with the local MongoDB database.

### 2. Configure Backend Credentials (Optional)
Create an `.env` file in the `/server` directory:
```
PORT=3000
MONGO_URI=mongodb://localhost:27017/glamire_db
JWT_SECRET=your_super_secret_jwt_key
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_SECRET=your_razorpay_secret
```
*(If no environment variables are provided, the system falls back to test/default values automatically).*

### 3. Start the Frontend Application
In a separate terminal:
```bash
cd frontend
npm install
npm run dev
```
The React frontend should now be running (usually on **http://localhost:5173**).

---

## 👩‍💻 Usage Guide

### As a Customer
1. Create a new account via the **Sign Up** page.
2. Browse products in the **Shop**. Filter by Category, Price, or Size.
3. Save items to your **Wishlist** via the Heart icon.
4. Select desired variants (Colors / Sizes) and Add to Bag.
5. Proceed through the **Checkout**, enter mock details, and complete payment using Razorpay's Test UI.
6. Track your purchase from the **Profile -> My Orders** section.

### As a Seller
1. Sign up/Login via a user account.
2. Access your database directly (via MongoDB Compass or Terminal) and change your user document `role` from `"user"` to `"seller"`.
3. Re-login and navigate to `/seller` in the browser.
4. Manage Inventory (Add/Delete products, manage variants).
5. View Sales Analytics and track **Top Selling Units**.
6. Update Order Statuses from `Pending` -> `Shipped` -> `Delivered`.
