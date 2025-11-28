# 🗄️ Database Setup Guide

## Step 1: Complete PostgreSQL Installation
1. Finish the PostgreSQL installation wizard
2. **Remember the password** you set for the `postgres` user
3. Note the port (should be 5432)

## Step 2: Create Environment File
1. Copy `env.example` to `.env`:
   ```bash
   copy env.example .env
   ```

2. Edit `.env` file and replace:
   - `YOUR_PASSWORD` with your PostgreSQL password
   - `your-secret-key-here` with a random secret key

## Step 3: Create Database
1. Open pgAdmin or use command line
2. Create a new database called `gocart_db`

## Step 4: Run Database Setup
```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma db push

# Test database connection
node scripts/setup-database.js
```

## Step 5: Verify Setup
```bash
# Open Prisma Studio to view your database
npx prisma studio
```

## 🎯 Next Steps
Once database is set up, we'll:
1. Create API routes
2. Implement authentication
3. Connect frontend to backend
4. Add real data operations

## 🔧 Troubleshooting
- **Connection refused**: Check if PostgreSQL service is running
- **Authentication failed**: Verify password in .env file
- **Database doesn't exist**: Create `gocart_db` database manually
