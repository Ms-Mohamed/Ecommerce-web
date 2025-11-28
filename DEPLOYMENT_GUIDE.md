# 🚀 GoCart Deployment Guide

## 📋 Prerequisites
- Node.js (v18 or higher)
- PostgreSQL Database
- Git (optional)

## 🔧 Installation Steps

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Setup
Create a `.env` file with the following variables:
```env
# Database
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/gocart_db"
DIRECT_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/gocart_db"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# Stripe (optional)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="your-stripe-publishable-key"
STRIPE_SECRET_KEY="your-stripe-secret-key"

# App Configuration
NEXT_PUBLIC_CURRENCY_SYMBOL="$"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 3. Database Setup
```bash
# Create database schema
npx prisma db push

# Generate Prisma client
npx prisma generate
```

### 4. Run the Application
```bash
# Development mode
npm run dev

# Production build
npm run build
npm start
```

## 🗄️ Database Migration

### Export Data (from source PC)
```bash
pg_dump -h localhost -U postgres gocart_db > gocart_backup.sql
```

### Import Data (to new PC)
```bash
psql -h localhost -U postgres gocart_db < gocart_backup.sql
```

## 📁 Project Structure
```
gocart-main/
├── app/                    # Next.js app directory
├── components/             # React components
├── lib/                    # Utility libraries
├── prisma/                 # Database schema
├── public/                 # Static assets
├── scripts/                # Utility scripts
├── .env                    # Environment variables
├── package.json            # Dependencies
└── README.md              # Project documentation
```

## 🔑 Important Files to Copy
- `.env` (update database credentials)
- `prisma/schema.prisma`
- `public/uploads/` (if you have uploaded images)
- `package.json` and `package-lock.json`

## 🚨 Common Issues

### Port Already in Use
If port 3000 is busy, Next.js will automatically use port 3001.

### Database Connection Issues
- Verify PostgreSQL is running
- Check database credentials in `.env`
- Ensure database `gocart_db` exists

### Missing Dependencies
```bash
npm install
npx prisma generate
```

## 🎯 Quick Start Commands
```bash
# Clone and setup
git clone <repository-url>
cd gocart-main
npm install

# Database setup
npx prisma db push
npx prisma generate

# Run application
npm run dev
```

## 📱 Access Points
- **Application**: http://localhost:3000
- **Prisma Studio**: http://localhost:5555 (run `npx prisma studio`)
- **Admin Panel**: http://localhost:3000/admin (login with admin@example.com)

## 🔐 Default Admin Account
- **Email**: admin@example.com
- **Password**: (set during first setup)

## 📞 Support
If you encounter issues:
1. Check the terminal for error messages
2. Verify all prerequisites are installed
3. Ensure database connection is working
4. Check environment variables are correct
