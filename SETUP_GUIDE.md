# Farm Equipment Management System - Setup Guide

## Prerequisites

- **Node.js**: v18+ LTS
- **npm**: v9+
- **PostgreSQL**: v14+ (or Azure SQL Database)
- **Git**: Latest version

---

## Phase 2 Progress: Backend Development ✅

### Completed:
1. ✅ Database schema with Prisma ORM (5 models: User, Category, Equipment, Booking, Review)
2. ✅ Authentication system (JWT + bcrypt)
3. ✅ Auth endpoints (register, login, logout, get profile)
4. ✅ Category endpoints (CRUD operations)
5. ✅ Auth middleware (authenticate + authorize)
6. ✅ Password validation and hashing utilities
7. ✅ Database seeding with categories

### Database Models:
- **User** - Farmers, Platform Owners, Admins
- **Category** - Equipment categories (with subcategories)
- **Equipment** - Farm equipment listings
- **Booking** - Equipment rental bookings
- **Review** - Equipment reviews and ratings

---

## Local Development Setup

### 1. Backend Setup

#### Step 1: Navigate to backend folder
```bash
cd backend
```

#### Step 2: Install dependencies (already done)
```bash
npm install
```

#### Step 3: Set up environment variables
Create a `.env` file in the `backend` folder:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/fms_db"

# JWT Secrets
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
JWT_EXPIRES_IN="7d"
JWT_REFRESH_SECRET="your-refresh-token-secret"
JWT_REFRESH_EXPIRES_IN="30d"

# Server
NODE_ENV="development"
PORT=5000
FRONTEND_URL="http://localhost:3000"
```

#### Step 4: Set up PostgreSQL Database

**Option A: Install PostgreSQL locally**
1. Download and install PostgreSQL: https://www.postgresql.org/download/
2. Create a database:
```sql
CREATE DATABASE fms_db;
```

**Option B: Use Docker (Recommended)**
```bash
docker run --name fms-postgres -e POSTGRES_PASSWORD=password -e POSTGRES_DB=fms_db -p 5432:5432 -d postgres:14
```

**Option C: Use Azure SQL Database**
- Create Azure SQL Database (PostgreSQL)
- Copy connection string
- Update `DATABASE_URL` in `.env`

#### Step 5: Generate Prisma Client
```bash
npm run prisma:generate
```

#### Step 6: Run database migrations
```bash
npm run prisma:migrate
```

When prompted, enter a migration name: `init`

#### Step 7: Seed the database
```bash
npm run db:seed
```

This will create 8 default categories.

#### Step 8: Start the backend server
```bash
npm run dev
```

Server will run on: **http://localhost:5000**

#### Step 9: Test the API
Open your browser or Postman and test:
- Health check: http://localhost:5000/health
- API info: http://localhost:5000/api
- Categories: http://localhost:5000/api/categories

---

### 2. Frontend Setup

#### Step 1: Navigate to frontend folder
```bash
cd ../frontend
```

#### Step 2: Install dependencies (already done)
```bash
npm install
```

#### Step 3: Set up environment variables
Create a `.env.local` file in the `frontend` folder:

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:5000/api

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET="your-nextauth-secret-key-change-in-production"

# Environment
NEXT_PUBLIC_ENV=development
```

#### Step 4: Start the frontend server
```bash
npm run dev
```

Frontend will run on: **http://localhost:3000**

---

## Available API Endpoints

### Authentication
- **POST** `/api/auth/register` - Register new user
- **POST** `/api/auth/login` - Login user
- **GET** `/api/auth/me` - Get current user (protected)
- **POST** `/api/auth/logout` - Logout user (protected)

### Categories
- **GET** `/api/categories` - Get all categories
- **GET** `/api/categories/:id` - Get category by ID
- **POST** `/api/categories` - Create category (Admin only)

### Coming Soon
- Equipment endpoints
- Booking endpoints
- User management endpoints
- Review endpoints

---

## Testing the API

### 1. Register a new user
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "farmer@example.com",
    "password": "SecurePass123!",
    "firstName": "John",
    "lastName": "Farmer",
    "phoneNumber": "+2348012345678",
    "role": "FARMER"
  }'
```

Response:
```json
{
  "status": "success",
  "message": "User registered successfully",
  "data": {
    "user": { ... },
    "accessToken": "eyJhbGci...",
    "refreshToken": "eyJhbGci..."
  }
}
```

### 2. Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "farmer@example.com",
    "password": "SecurePass123!"
  }'
```

### 3. Get Categories
```bash
curl http://localhost:5000/api/categories
```

### 4. Get Current User (with token)
```bash
curl http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## Database Management

### View database in browser
```bash
npm run prisma:studio
```

This opens Prisma Studio at http://localhost:5555

### Create a new migration
```bash
npm run prisma:migrate
```

### Reset database (WARNING: Deletes all data)
```bash
npx prisma migrate reset
```

### Re-seed database
```bash
npm run db:seed
```

---

## Project Structure

```
fms/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma          ✅ Database schema
│   │   └── seed.ts                ✅ Seed data
│   ├── src/
│   │   ├── config/
│   │   │   └── database.ts        ✅ Prisma client
│   │   ├── controllers/
│   │   │   ├── auth.controller.ts ✅ Auth logic
│   │   │   └── category.controller.ts ✅ Category logic
│   │   ├── middleware/
│   │   │   └── auth.ts            ✅ JWT middleware
│   │   ├── routes/
│   │   │   ├── auth.routes.ts     ✅ Auth routes
│   │   │   └── category.routes.ts ✅ Category routes
│   │   ├── utils/
│   │   │   ├── jwt.ts             ✅ JWT utilities
│   │   │   └── password.ts        ✅ Password utilities
│   │   └── app.ts                 ✅ Express app
│   ├── .env                       📝 Create this
│   ├── package.json               ✅
│   └── tsconfig.json              ✅
├── frontend/
│   ├── app/
│   ├── components/
│   ├── lib/
│   ├── .env.local                 📝 Create this
│   ├── next.config.ts             ✅
│   └── package.json               ✅
└── README.md                      ✅
```

---

## Common Issues & Solutions

### Issue 1: Database connection failed
**Solution:**
- Check PostgreSQL is running
- Verify `DATABASE_URL` in `.env`
- Ensure database exists

### Issue 2: Prisma client not generated
**Solution:**
```bash
npm run prisma:generate
```

### Issue 3: Port already in use
**Solution:**
```bash
# Change PORT in .env file
PORT=5001
```

### Issue 4: CORS errors
**Solution:**
- Ensure `FRONTEND_URL` in backend `.env` matches your frontend URL
- Check CORS configuration in `app.ts`

---

## Next Steps

### Phase 2 Continued:
1. Create Equipment CRUD endpoints
2. Create Booking CRUD endpoints
3. Implement Azure Blob Storage for images
4. Add input validation middleware
5. Implement OAuth (Google, Facebook, Microsoft)

### Phase 3: Frontend Development
1. Create authentication pages (login, register)
2. Build equipment catalog page
3. Create equipment detail page
4. Implement booking system
5. Build user dashboards

---

## Useful Commands

### Backend
```bash
# Development
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Database commands
npm run prisma:generate
npm run prisma:migrate
npm run db:seed
npm run prisma:studio

# View logs
npm run dev | grep -i error
```

### Frontend
```bash
# Development
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

---

## Environment Variables Reference

### Backend (.env)
```env
# Required
DATABASE_URL="postgresql://..."
JWT_SECRET="change-this-secret"
NODE_ENV="development"
PORT=5000
FRONTEND_URL="http://localhost:3000"

# Optional (for production)
JWT_EXPIRES_IN="7d"
JWT_REFRESH_SECRET="change-this-secret"
JWT_REFRESH_EXPIRES_IN="30d"
AZURE_STORAGE_ACCOUNT_NAME=""
AZURE_STORAGE_ACCOUNT_KEY=""
SENDGRID_API_KEY=""
```

### Frontend (.env.local)
```env
# Required
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET="change-this-secret"

# Optional
NEXT_PUBLIC_AZURE_STORAGE_URL=""
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=""
```

---

## Database Schema Summary

### Users
- Email/password or OAuth authentication
- Roles: FARMER, PLATFORM_OWNER, ADMIN
- Profile information and images

### Categories
- Hierarchical (parent-child relationships)
- Equipment count
- Icon URLs

### Equipment
- Owner relationship
- Category classification
- Location (with lat/lng)
- Pricing in NGN
- Images (Azure Blob URLs)
- Availability status

### Bookings
- Equipment rental periods
- Status tracking (PENDING, CONFIRMED, ACTIVE, COMPLETED, CANCELLED)
- Payment status
- Cancellation handling

### Reviews
- 1-5 star ratings
- Comments
- One review per booking

---

## Ready to Continue Development! 🚀

The backend foundation is complete with:
- ✅ Authentication system
- ✅ Database models
- ✅ Category management
- ✅ JWT middleware
- ✅ Seed data

**Next:** Build Equipment and Booking APIs, then move to Frontend development.
