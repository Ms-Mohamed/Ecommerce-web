# 🗄️ PostgreSQL Database Backup & Restore

## 📤 Backup Database (Current PC)

### Method 1: Using pg_dump (Command Line)
```bash
# Backup entire database
pg_dump -h localhost -U postgres -d gocart_db > gocart_backup.sql

# Backup with custom format (recommended)
pg_dump -h localhost -U postgres -d gocart_db -Fc > gocart_backup.dump

# Backup only data (no schema)
pg_dump -h localhost -U postgres -d gocart_db --data-only > gocart_data.sql

# Backup only schema (no data)
pg_dump -h localhost -U postgres -d gocart_db --schema-only > gocart_schema.sql
```

### Method 2: Using pgAdmin
1. Open pgAdmin
2. Right-click on `gocart_db` database
3. Select "Backup..."
4. Choose file location and format
5. Click "Backup"

## 📥 Restore Database (New PC)

### Method 1: Using psql (Command Line)
```bash
# Create database first
createdb -h localhost -U postgres gocart_db

# Restore from SQL file
psql -h localhost -U postgres -d gocart_db < gocart_backup.sql

# Restore from custom format
pg_restore -h localhost -U postgres -d gocart_db gocart_backup.dump
```

### Method 2: Using pgAdmin
1. Open pgAdmin
2. Right-click on "Databases"
3. Select "Create" → "Database"
4. Name it `gocart_db`
5. Right-click on the new database
6. Select "Restore..."
7. Choose your backup file
8. Click "Restore"

## 🔧 Prisma Commands After Restore
```bash
# Generate Prisma client
npx prisma generate

# Verify database connection
npx prisma db push
```

## 📋 Complete Migration Steps

### On Current PC:
1. **Backup database:**
   ```bash
   pg_dump -h localhost -U postgres -d gocart_db > gocart_backup.sql
   ```

2. **Copy files to new PC:**
   - Project folder
   - `gocart_backup.sql`

### On New PC:
1. **Install PostgreSQL**
2. **Create database:**
   ```bash
   createdb -h localhost -U postgres gocart_db
   ```

3. **Restore database:**
   ```bash
   psql -h localhost -U postgres -d gocart_db < gocart_backup.sql
   ```

4. **Setup project:**
   ```bash
   npm install
   npx prisma generate
   npm run dev
   ```

## 🚨 Troubleshooting

### Permission Issues:
```bash
# Grant permissions
GRANT ALL PRIVILEGES ON DATABASE gocart_db TO postgres;
```

### Connection Issues:
- Check PostgreSQL is running
- Verify credentials in `.env`
- Ensure database exists

### Schema Issues:
```bash
# Reset and push schema
npx prisma db push --force-reset
npx prisma generate
```
