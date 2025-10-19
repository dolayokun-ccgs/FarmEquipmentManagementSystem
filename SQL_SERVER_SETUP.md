# SQL Server Express Setup for Prisma

## Problem
Prisma has difficulty connecting to SQL Server Express named instances (e.g., `localhost\SQLEXPRESS`) due to the backslash character in the connection string.

## Solution: Enable TCP/IP and Set Static Port

### Step 1: Open SQL Server Configuration Manager

1. Press `Win + R` and type `SQLServerManager16.msc` (or search for "SQL Server Configuration Manager")
2. Click OK

### Step 2: Enable TCP/IP Protocol

1. In the left pane, expand "SQL Server Network Configuration"
2. Click on "Protocols for SQLEXPRESS"
3. Right-click on "TCP/IP" and select "Enable"

### Step 3: Configure TCP/IP Port

1. Right-click on "TCP/IP" again and select "Properties"
2. Go to the "IP Addresses" tab
3. Scroll down to "IPAll" section at the bottom
4. Clear the "TCP Dynamic Ports" field (make it empty)
5. Set "TCP Port" to `1433` (or another port like `1434`, `14330`, etc.)
6. Click OK

### Step 4: Restart SQL Server Service

1. In SQL Server Configuration Manager, click on "SQL Server Services" in the left pane
2. Right-click on "SQL Server (SQLEXPRESS)"
3. Click "Restart"

### Step 5: Update .env File

After setting the static port, update your `backend/.env` file:

```env
# If using port 1433:
DATABASE_URL="sqlserver://localhost:1433;database=FarmEquipmentDB;integratedSecurity=true;trustServerCertificate=true;encrypt=false"

# Or with SQL Authentication:
DATABASE_URL="sqlserver://localhost:1433;database=FarmEquipmentDB;user=sa;password=YourPassword;trustServerCertificate=true;encrypt=false"
```

### Step 6: Test Connection

```bash
cd backend
npx prisma db push
```

## Alternative: Using Named Pipes (Windows Only)

If you prefer not to enable TCP/IP, you can use Named Pipes:

```env
DATABASE_URL="sqlserver://localhost;database=FarmEquipmentDB;integratedSecurity=true;trustServerCertificate=true;encrypt=false;namedPipe=true"
```

## Troubleshooting

### Check if SQL Server is Listening

```powershell
# Check SQL Server service status
Get-Service | Where-Object {$_.Name -like '*SQL*'}

# Check listening ports
netstat -ano | findstr "1433"
```

### Test Connection with sqlcmd

```cmd
# With Windows Authentication
sqlcmd -S localhost,1433 -Q "SELECT @@VERSION"

# With SQL Authentication
sqlcmd -S localhost,1433 -U sa -P YourPassword -Q "SELECT @@VERSION"
```

### Common Issues

1. **Firewall**: Windows Firewall might block port 1433
   - Add an inbound rule for TCP port 1433

2. **SQL Server Browser**: If using dynamic ports, ensure SQL Server Browser service is running
   ```cmd
   net start SQLBrowser
   ```

3. **Mixed Mode Authentication**: To use SQL authentication (sa user), enable Mixed Mode:
   - Open SQL Server Management Studio (SSMS)
   - Right-click the server → Properties → Security
   - Select "SQL Server and Windows Authentication mode"
   - Restart SQL Server service

## Current Database Schema

Once connected, Prisma will create these tables:
- users
- categories
- equipment
- bookings
- reviews

## Running Migrations and Seeds

```bash
cd backend

# Push schema to database (creates tables)
npx prisma db push

# Generate Prisma Client
npx prisma generate

# Run seed script (adds sample data)
npm run prisma:seed
```

## Sample Data

The seed script will add:
- 10 equipment categories
- 18 farm equipment items with images and specifications
- 3 sample users (1 farmer, 2 platform owners)

See [README.md](../README.md#database-seeding) for details.
