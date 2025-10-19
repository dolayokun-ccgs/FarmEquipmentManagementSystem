# Farm Equipment Management System (FMS)

## Project Overview

A web application for managing farm equipment rentals, targeting farmers in Nigeria and Africa. The platform connects farmers who need equipment with platform owners who provide equipment for rent.

### Why Next.js is Perfect for This Project (Android/Mobile-First)

**YES, Next.js is highly recommended!** Here's why it's superior for your Android/mobile users:

1. **Server-Side Rendering (SSR)**
   - Pages render on the server before reaching the user's device
   - **50-70% faster initial page loads** compared to React SPA
   - Critical for slow 3G/4G networks in Nigeria/Africa

2. **Automatic Code Splitting**
   - Only loads JavaScript needed for current page
   - **Reduces bundle size by 40-60%**
   - Less data consumption (important in Africa)

3. **Built-in Image Optimization**
   - Automatic image compression and lazy loading
   - Serves WebP format for modern Android browsers
   - **Reduces image sizes by 30-50%**
   - Uses Next.js `<Image>` component

4. **Static Site Generation (SSG)**
   - Equipment catalog pages can be pre-rendered
   - Ultra-fast loading, works well offline
   - Better performance on low-end Android devices

5. **Better SEO**
   - Important for farmers searching "farm equipment rental Nigeria"
   - Content is indexed properly by search engines

6. **Mobile Performance**
   - Lighthouse scores typically 90+ on mobile
   - Smoother experience on budget Android phones
   - Lower CPU/memory usage

**Recommendation:** Use **Next.js 14+ with App Router + Separate Express Backend**

### Performance Comparison (Mobile on 3G Network)

| Metric | React SPA | Next.js SSR | Improvement |
|--------|-----------|-------------|-------------|
| **First Contentful Paint** | 3.2s | 1.1s | **65% faster** |
| **Time to Interactive** | 5.8s | 2.3s | **60% faster** |
| **Initial Bundle Size** | 350KB | 180KB | **49% smaller** |
| **Images (Total)** | 2.5MB | 1.2MB | **52% smaller** |
| **Data Usage (First Load)** | 3MB | 1.5MB | **50% less** |
| **Works Offline** | Requires setup | Built-in | **Better** |
| **SEO Score** | Poor | Excellent | **Much better** |

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────────────────────────────────────────┐      │
│  │      Next.js Frontend (TypeScript)                    │      │
│  │  - Server-Side Rendering (SSR)                        │      │
│  │  - Static Site Generation (SSG)                       │      │
│  │  - Responsive UI (Mobile & Desktop)                   │      │
│  │  - PWA Support                                        │      │
│  │  - Material-UI / Tailwind CSS                         │      │
│  │  - Automatic Code Splitting                           │      │
│  │  - Image Optimization                                 │      │
│  └──────────────────────────────────────────────────────┘      │
│                          │                                        │
└──────────────────────────┼────────────────────────────────────────┘
                           │ HTTPS/REST API
┌──────────────────────────┼────────────────────────────────────────┐
│                          ▼                                        │
│                   AZURE CDN                                       │
│              (Static Assets & Caching)                            │
└───────────────────────────────────────────────────────────────────┘
                           │
┌──────────────────────────┼────────────────────────────────────────┐
│                          ▼                                        │
│                 API GATEWAY LAYER                                 │
├───────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────────────────────────────────────────┐      │
│  │         Azure API Management                          │      │
│  │  - Rate Limiting                                      │      │
│  │  - Request Throttling                                 │      │
│  │  - API Security                                       │      │
│  └──────────────────────────────────────────────────────┘      │
└───────────────────────────────────────────────────────────────────┘
                           │
┌──────────────────────────┼────────────────────────────────────────┐
│                          ▼                                        │
│                  APPLICATION LAYER                                │
├───────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────────────────────────────────────────┐      │
│  │    Node.js Backend (Express/NestJS + TypeScript)      │      │
│  │                                                        │      │
│  │  ┌────────────────┐  ┌────────────────┐             │      │
│  │  │ Auth Service   │  │ Equipment Svc  │             │      │
│  │  │ - JWT          │  │ - CRUD         │             │      │
│  │  │ - OAuth 2.0    │  │ - Search       │             │      │
│  │  │ - Azure AD B2C │  │ - Categories   │             │      │
│  │  └────────────────┘  └────────────────┘             │      │
│  │                                                        │      │
│  │  ┌────────────────┐  ┌────────────────┐             │      │
│  │  │ Booking Svc    │  │ User Service   │             │      │
│  │  │ - Create       │  │ - Profile      │             │      │
│  │  │ - Update       │  │ - Management   │             │      │
│  │  │ - Cancel       │  │ - Roles/RBAC   │             │      │
│  │  └────────────────┘  └────────────────┘             │      │
│  │                                                        │      │
│  │         Hosted on Azure App Service                   │      │
│  └──────────────────────────────────────────────────────┘      │
└───────────────────────────────────────────────────────────────────┘
                           │
┌──────────────────────────┼────────────────────────────────────────┐
│                          ▼                                        │
│                   DATA LAYER                                      │
├───────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Azure SQL  │  │ Azure Redis  │  │  Azure Blob  │          │
│  │   Database   │  │    Cache     │  │   Storage    │          │
│  │              │  │              │  │              │          │
│  │ - Users      │  │ - Sessions   │  │ - Equipment  │          │
│  │ - Equipment  │  │ - Temp Data  │  │   Images     │          │
│  │ - Bookings   │  │ - API Cache  │  │ - User Pics  │          │
│  │ - Categories │  │              │  │ - Documents  │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└───────────────────────────────────────────────────────────────────┘
                           │
┌──────────────────────────┼────────────────────────────────────────┐
│                          ▼                                        │
│              SUPPORTING SERVICES                                  │
├───────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Azure AD   │  │   SendGrid/  │  │   Azure      │          │
│  │     B2C      │  │    Azure     │  │  Application │          │
│  │              │  │  Comm Svcs   │  │   Insights   │          │
│  │ - Identity   │  │              │  │              │          │
│  │ - OAuth      │  │ - Email      │  │ - Monitoring │          │
│  │ - Social     │  │ - Password   │  │ - Logging    │          │
│  │   Login      │  │   Reset      │  │ - Analytics  │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐                             │
│  │  Azure Key   │  │  Azure       │                             │
│  │    Vault     │  │  Cognitive   │                             │
│  │              │  │   Search     │                             │
│  │ - Secrets    │  │              │                             │
│  │ - API Keys   │  │ - Equipment  │                             │
│  │ - Conn Str   │  │   Search     │                             │
│  └──────────────┘  └──────────────┘                             │
└───────────────────────────────────────────────────────────────────┘
```

---

## Next.js Architecture Options

### **Recommended: Option A - Next.js + Separate Backend**

**Why This is Best for Your Project:**
- Leverages Next.js SSR for fast mobile performance
- Separate backend allows for complex business logic
- Easier to scale backend independently
- Better separation of concerns
- Can use Express/NestJS for advanced features

**Architecture:**
```
Next.js Frontend (SSR/SSG) ──> Express/NestJS Backend ──> Azure SQL Database
       │                              │
       │                              └──> Azure Blob Storage
       │                              └──> Azure Redis Cache
       └──> Azure Static Web Apps
```

### **Alternative: Option B - Next.js Full-Stack (All-in-One)**

**When to Use:**
- Simpler project requirements
- Smaller team
- Faster initial development
- Lower infrastructure costs

**Architecture:**
```
Next.js App
├── Frontend (React Components)
├── API Routes (Backend Logic)
└── Direct database connection via Prisma
```

---

## Technology Stack

### Frontend (Two Options)

#### **Option A: Next.js Full-Stack (Recommended for Mobile-First)**
- **Framework:** Next.js 14+ with App Router (TypeScript)
- **Rendering:** Server-Side Rendering (SSR) + Static Site Generation (SSG)
- **UI Library:** Material-UI (MUI) or Tailwind CSS
- **State Management:** React Context API + Zustand (lighter than Redux)
- **Forms:** React Hook Form + Zod validation
- **Authentication:** NextAuth.js (supports OAuth + Azure AD B2C)
- **Image Optimization:** Next.js Image component
- **API:** Next.js API Routes (optional - can replace separate backend)
- **Database Client:** Prisma ORM
- **PWA:** next-pwa plugin
- **Benefits for Mobile:**
  - Faster initial page loads (critical for slow networks)
  - Automatic code splitting (smaller bundles)
  - Built-in image optimization (reduces data usage)
  - Better SEO (important for discoverability)

#### **Option B: React.js SPA (Alternative)**
- **Framework:** React.js 18+ with TypeScript
- **UI Library:** Material-UI (MUI) or Tailwind CSS
- **State Management:** Redux Toolkit or Zustand
- **Routing:** React Router v6
- **HTTP Client:** Axios
- **Forms:** React Hook Form + Yup validation
- **PWA:** Workbox for service workers
- **Build Tool:** Vite

### Backend
- **Runtime:** Node.js 18+ LTS
- **Framework:** Express.js or NestJS
- **Language:** TypeScript
- **Authentication:** Passport.js, JWT
- **Validation:** Joi or Class-Validator
- **ORM:** TypeORM or Prisma
- **API Documentation:** Swagger/OpenAPI

### Database
- **Primary:** Azure SQL Database (PostgreSQL flavor)
- **Caching:** Azure Redis Cache
- **Storage:** Azure Blob Storage
- **Search:** Azure Cognitive Search

### Cloud Platform (Azure)
- **Hosting:** Azure App Service
- **Static Hosting:** Azure Static Web Apps
- **CDN:** Azure CDN
- **Authentication:** Azure AD B2C
- **API Gateway:** Azure API Management
- **Monitoring:** Azure Application Insights
- **Secrets:** Azure Key Vault
- **Email:** SendGrid or Azure Communication Services
- **CI/CD:** Azure DevOps or GitHub Actions

### DevOps
- **Version Control:** Git & GitHub
- **CI/CD:** GitHub Actions / Azure Pipelines
- **Containerization:** Docker (optional)
- **Testing:** Jest, React Testing Library, Supertest

---

## Database Schema

### Users Table
```sql
CREATE TABLE Users (
    user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone_number VARCHAR(20),
    role ENUM('farmer', 'platform_owner', 'admin') NOT NULL,
    provider VARCHAR(50), -- 'local', 'google', 'facebook', 'microsoft'
    provider_id VARCHAR(255),
    is_verified BOOLEAN DEFAULT FALSE,
    profile_image_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP
);
```

### Equipment Table
```sql
CREATE TABLE Equipment (
    equipment_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID REFERENCES Users(user_id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category_id UUID REFERENCES Categories(category_id),
    price_per_day DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'NGN',
    condition ENUM('excellent', 'good', 'fair', 'poor'),
    location_address TEXT,
    location_city VARCHAR(100),
    location_state VARCHAR(100),
    location_country VARCHAR(100) DEFAULT 'Nigeria',
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    is_available BOOLEAN DEFAULT TRUE,
    images JSON, -- Array of image URLs
    specifications JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Categories Table
```sql
CREATE TABLE Categories (
    category_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    icon_url TEXT,
    parent_category_id UUID REFERENCES Categories(category_id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Bookings Table
```sql
CREATE TABLE Bookings (
    booking_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    equipment_id UUID REFERENCES Equipment(equipment_id),
    farmer_id UUID REFERENCES Users(user_id),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_days INT NOT NULL,
    price_per_day DECIMAL(10, 2) NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    status ENUM('pending', 'confirmed', 'active', 'completed', 'cancelled') DEFAULT 'pending',
    payment_status ENUM('pending', 'paid', 'refunded') DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    confirmed_at TIMESTAMP,
    cancelled_at TIMESTAMP,
    cancellation_reason TEXT
);
```

### Reviews Table (Future Enhancement)
```sql
CREATE TABLE Reviews (
    review_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID REFERENCES Bookings(booking_id),
    reviewer_id UUID REFERENCES Users(user_id),
    rating INT CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## Step-by-Step Implementation Tasks

### Phase 1: Project Setup & Configuration

#### Task 1.1: Initialize Project Structure
- [ ] Create project root directory
- [ ] Initialize Git repository
- [ ] Create `.gitignore` file
- [ ] Create `frontend` folder
- [ ] Create `backend` folder
- [ ] Create `docs` folder for documentation
- [ ] Create `deploy` folder for deployment scripts

#### Task 1.2: Backend Setup
- [ ] Navigate to `backend` folder
- [ ] Run `npm init -y`
- [ ] Install dependencies:
  ```bash
  npm install express typescript ts-node @types/node @types/express
  npm install dotenv cors helmet morgan
  npm install jsonwebtoken bcryptjs @types/jsonwebtoken @types/bcryptjs
  npm install passport passport-jwt passport-google-oauth20 passport-facebook
  npm install pg typeorm reflect-metadata
  npm install joi express-validator
  npm install @azure/storage-blob @azure/identity
  npm install --save-dev nodemon @types/cors @types/morgan
  ```
- [ ] Create `tsconfig.json` for TypeScript configuration
- [ ] Create folder structure:
  ```
  backend/
  ├── src/
  │   ├── config/
  │   ├── controllers/
  │   ├── middleware/
  │   ├── models/
  │   ├── routes/
  │   ├── services/
  │   ├── utils/
  │   └── app.ts
  ├── .env.example
  └── package.json
  ```
- [ ] Set up environment variables file (`.env`)

#### Task 1.3: Frontend Setup (Next.js Option - Recommended)
- [ ] Navigate to `frontend` folder
- [ ] Run `npx create-next-app@latest . --typescript --tailwind --app --no-src-dir`
  - Or manually: `npm create next-app@latest`
  - Choose: TypeScript, App Router, Tailwind CSS
- [ ] Install dependencies:
  ```bash
  npm install @mui/material @emotion/react @emotion/styled
  npm install axios
  npm install react-hook-form zod @hookform/resolvers
  npm install zustand
  npm install next-auth
  npm install next-pwa
  npm install @azure/msal-browser @azure/msal-react
  npm install sharp # for Next.js image optimization
  ```
- [ ] Create folder structure:
  ```
  frontend/
  ├── app/
  │   ├── (auth)/
  │   │   ├── login/
  │   │   ├── register/
  │   │   └── reset-password/
  │   ├── (dashboard)/
  │   │   ├── farmer/
  │   │   └── owner/
  │   ├── equipment/
  │   ├── bookings/
  │   ├── api/ (optional - if using Next.js API routes)
  │   ├── layout.tsx
  │   └── page.tsx
  ├── components/
  │   ├── shared/
  │   ├── equipment/
  │   ├── booking/
  │   └── layout/
  ├── lib/
  │   ├── services/
  │   ├── hooks/
  │   ├── utils/
  │   └── types/
  ├── public/
  └── next.config.js
  ```
- [ ] Configure environment variables (`.env.local`)
- [ ] Set up next.config.js for PWA and image optimization

#### Task 1.3 Alternative: Frontend Setup (React SPA Option)
- [ ] Navigate to `frontend` folder
- [ ] Run `npm create vite@latest . -- --template react-ts`
- [ ] Install dependencies:
  ```bash
  npm install @mui/material @emotion/react @emotion/styled
  npm install react-router-dom
  npm install axios
  npm install react-hook-form yup @hookform/resolvers
  npm install zustand
  npm install @azure/msal-browser @azure/msal-react
  ```
- [ ] Create folder structure:
  ```
  frontend/
  ├── src/
  │   ├── components/
  │   ├── pages/
  │   ├── services/
  │   ├── store/
  │   ├── hooks/
  │   ├── utils/
  │   ├── types/
  │   └── App.tsx
  └── package.json
  ```
- [ ] Configure environment variables (`.env`)

#### Task 1.4: Azure Resource Setup
- [ ] Create Azure account
- [ ] Set up Azure subscription
- [ ] Create Resource Group for FMS project
- [ ] Provision Azure SQL Database
- [ ] Set up Azure Blob Storage account
- [ ] Configure Azure Redis Cache
- [ ] Set up Azure AD B2C tenant
- [ ] Create Azure App Service for backend
- [ ] Create Azure Static Web App for frontend
- [ ] Set up Azure Key Vault for secrets

---

### Phase 2: Backend Development

#### Task 2.1: Database Configuration
- [ ] Set up TypeORM configuration
- [ ] Create database connection module
- [ ] Define User entity/model
- [ ] Define Equipment entity/model
- [ ] Define Category entity/model
- [ ] Define Booking entity/model
- [ ] Create database migrations
- [ ] Run initial migrations
- [ ] Seed initial data (categories)

#### Task 2.2: Authentication System
- [ ] Create auth controller
- [ ] Implement user registration endpoint
  - [ ] Email validation
  - [ ] Password hashing with bcrypt
  - [ ] Create user record
- [ ] Implement login endpoint
  - [ ] Validate credentials
  - [ ] Generate JWT token
  - [ ] Return user data + token
- [ ] Implement password reset flow
  - [ ] Request reset endpoint (send email)
  - [ ] Verify reset token endpoint
  - [ ] Reset password endpoint
- [ ] Implement JWT middleware for protected routes
- [ ] Set up Passport.js strategies
  - [ ] Local strategy
  - [ ] Google OAuth strategy
  - [ ] Facebook OAuth strategy
  - [ ] Microsoft OAuth strategy
- [ ] Integrate Azure AD B2C
- [ ] Create logout endpoint (token invalidation)
- [ ] Implement refresh token mechanism

#### Task 2.3: User Management
- [ ] Create user controller
- [ ] Implement get user profile endpoint
- [ ] Implement update user profile endpoint
- [ ] Implement upload profile image endpoint (Azure Blob)
- [ ] Implement role-based access control middleware
- [ ] Create user service layer

#### Task 2.4: Equipment Management
- [ ] Create equipment controller
- [ ] Implement create equipment endpoint (platform owner only)
  - [ ] Validate input data
  - [ ] Upload images to Azure Blob Storage
  - [ ] Save equipment record
- [ ] Implement get all equipment endpoint (with filters)
  - [ ] Filter by category
  - [ ] Filter by location
  - [ ] Filter by availability
  - [ ] Filter by price range
  - [ ] Pagination support
- [ ] Implement get equipment by ID endpoint
- [ ] Implement update equipment endpoint (owner only)
- [ ] Implement delete equipment endpoint (owner only)
- [ ] Implement search equipment endpoint (Azure Cognitive Search)
- [ ] Create equipment service layer

#### Task 2.5: Category Management
- [ ] Create category controller
- [ ] Implement get all categories endpoint
- [ ] Implement create category endpoint (admin only)
- [ ] Implement update category endpoint (admin only)
- [ ] Implement delete category endpoint (admin only)

#### Task 2.6: Booking Management
- [ ] Create booking controller
- [ ] Implement create booking endpoint
  - [ ] Check equipment availability
  - [ ] Validate date ranges
  - [ ] Calculate total price
  - [ ] Create booking record
- [ ] Implement get user bookings endpoint
- [ ] Implement get booking by ID endpoint
- [ ] Implement update booking status endpoint (owner)
  - [ ] Confirm booking
  - [ ] Reject booking
- [ ] Implement cancel booking endpoint (farmer)
- [ ] Implement get equipment bookings endpoint (owner)
- [ ] Create booking service layer with business logic
- [ ] Add booking conflict detection

#### Task 2.7: Middleware & Error Handling
- [ ] Create authentication middleware
- [ ] Create authorization middleware (role-based)
- [ ] Create validation middleware
- [ ] Create error handling middleware
- [ ] Create request logging middleware
- [ ] Create rate limiting middleware

#### Task 2.8: File Upload Service
- [ ] Create Azure Blob Storage service
- [ ] Implement image upload function
- [ ] Implement image delete function
- [ ] Implement image URL generation
- [ ] Add file type validation
- [ ] Add file size validation

#### Task 2.9: Email Service
- [ ] Set up SendGrid or Azure Communication Services
- [ ] Create email service module
- [ ] Implement welcome email template
- [ ] Implement password reset email template
- [ ] Implement booking confirmation email template
- [ ] Implement booking status update email template

#### Task 2.10: API Documentation
- [ ] Set up Swagger/OpenAPI
- [ ] Document all API endpoints
- [ ] Add request/response examples
- [ ] Add authentication requirements

---

### Phase 3: Frontend Development

#### Task 3.1: Project Configuration
- [ ] Configure React Router
- [ ] Set up Redux store (or Zustand)
- [ ] Configure Axios with interceptors
- [ ] Set up authentication context
- [ ] Configure Material-UI theme
- [ ] Set up protected routes
- [ ] Configure environment variables

#### Task 3.2: Authentication Pages
- [ ] Create Login page
  - [ ] Email/password form
  - [ ] Form validation
  - [ ] OAuth buttons (Google, Facebook, Microsoft)
  - [ ] "Forgot password" link
  - [ ] Redirect to registration
  - [ ] Mobile-responsive design
- [ ] Create Registration page
  - [ ] User type selection (Farmer/Platform Owner)
  - [ ] Registration form
  - [ ] Form validation
  - [ ] OAuth registration options
  - [ ] Terms & conditions
  - [ ] Mobile-responsive design
- [ ] Create Password Reset page
  - [ ] Request reset form
  - [ ] Reset confirmation page
  - [ ] New password form
- [ ] Implement Azure AD B2C integration
- [ ] Create authentication service layer
- [ ] Implement token storage (localStorage/cookies)
- [ ] Implement auto-logout on token expiration

#### Task 3.3: Layout Components
- [ ] Create Header/Navigation component
  - [ ] Logo
  - [ ] Navigation menu (responsive)
  - [ ] User profile dropdown
  - [ ] Login/Logout buttons
- [ ] Create Footer component
- [ ] Create Sidebar component (for dashboard)
- [ ] Create mobile navigation drawer
- [ ] Create loading spinner component
- [ ] Create error boundary component

#### Task 3.4: Equipment Pages
- [ ] Create Equipment Catalog page
  - [ ] Equipment grid/list view toggle
  - [ ] Equipment cards with images
  - [ ] Filter sidebar (category, location, price)
  - [ ] Search bar
  - [ ] Pagination
  - [ ] Sort options (price, date, availability)
  - [ ] Mobile-responsive design
- [ ] Create Equipment Detail page
  - [ ] Image gallery/carousel
  - [ ] Equipment information
  - [ ] Pricing details
  - [ ] Location map
  - [ ] Availability calendar
  - [ ] Booking form
  - [ ] Owner information
  - [ ] Mobile-responsive design
- [ ] Create Add/Edit Equipment page (Platform Owner)
  - [ ] Multi-step form
  - [ ] Image upload with preview
  - [ ] Category selection
  - [ ] Location input
  - [ ] Pricing input
  - [ ] Form validation
  - [ ] Mobile-responsive design

#### Task 3.5: Booking System
- [ ] Create Booking Form component
  - [ ] Date range picker
  - [ ] Price calculation
  - [ ] Booking summary
  - [ ] Submit booking
- [ ] Create Booking Confirmation page
- [ ] Create My Bookings page (Farmer)
  - [ ] List of user bookings
  - [ ] Filter by status
  - [ ] Cancel booking option
  - [ ] Booking details view
  - [ ] Mobile-responsive design
- [ ] Create Booking Requests page (Platform Owner)
  - [ ] List of received bookings
  - [ ] Accept/Reject actions
  - [ ] Booking details view
  - [ ] Mobile-responsive design

#### Task 3.6: User Dashboard
- [ ] Create Farmer Dashboard
  - [ ] Overview statistics
  - [ ] Recent bookings
  - [ ] Upcoming rentals
  - [ ] Quick actions
- [ ] Create Platform Owner Dashboard
  - [ ] Overview statistics
  - [ ] Recent booking requests
  - [ ] Equipment performance
  - [ ] Quick actions
- [ ] Create User Profile page
  - [ ] View profile information
  - [ ] Edit profile form
  - [ ] Upload profile picture
  - [ ] Change password option

#### Task 3.7: Shared Components
- [ ] Create EquipmentCard component
- [ ] Create SearchBar component
- [ ] Create FilterPanel component
- [ ] Create DateRangePicker component
- [ ] Create ImageUpload component
- [ ] Create ImageGallery component
- [ ] Create ConfirmDialog component
- [ ] Create Notification/Toast component
- [ ] Create EmptyState component
- [ ] Create ErrorPage component (404, 500)

#### Task 3.8: State Management
- [ ] Create auth slice/store
- [ ] Create equipment slice/store
- [ ] Create booking slice/store
- [ ] Create user slice/store
- [ ] Create UI slice/store (loading, errors, notifications)

#### Task 3.9: Services/API Integration
- [ ] Create auth service (login, register, logout)
- [ ] Create equipment service (CRUD operations)
- [ ] Create booking service (CRUD operations)
- [ ] Create user service (profile management)
- [ ] Create file upload service
- [ ] Add error handling for API calls
- [ ] Add request/response interceptors

#### Task 3.10: PWA Configuration
- [ ] Configure service worker
- [ ] Create manifest.json
- [ ] Add app icons (various sizes)
- [ ] Configure offline fallback page
- [ ] Test PWA installation on Android
- [ ] Add "Add to Home Screen" prompt

#### Task 3.11: Responsive Design & Mobile Optimization
- [ ] Test all pages on mobile devices
- [ ] Optimize touch targets for mobile
- [ ] Ensure readable font sizes
- [ ] Test on various screen sizes
- [ ] Optimize images for mobile
- [ ] Test performance on mobile networks

---

### Phase 4: Testing

#### Task 4.1: Backend Testing
- [ ] Set up Jest and Supertest
- [ ] Write unit tests for auth service
- [ ] Write unit tests for equipment service
- [ ] Write unit tests for booking service
- [ ] Write integration tests for auth endpoints
- [ ] Write integration tests for equipment endpoints
- [ ] Write integration tests for booking endpoints
- [ ] Test error handling scenarios
- [ ] Test validation logic
- [ ] Test authentication middleware
- [ ] Achieve 80%+ code coverage

#### Task 4.2: Frontend Testing
- [ ] Set up Jest and React Testing Library
- [ ] Write unit tests for components
- [ ] Write unit tests for services
- [ ] Write unit tests for Redux slices
- [ ] Write integration tests for user flows
- [ ] Test form validations
- [ ] Test error states
- [ ] Test loading states
- [ ] Achieve 70%+ code coverage

#### Task 4.3: End-to-End Testing
- [ ] Set up Cypress or Playwright
- [ ] Write E2E test for registration flow
- [ ] Write E2E test for login flow
- [ ] Write E2E test for equipment browsing
- [ ] Write E2E test for booking flow
- [ ] Write E2E test for equipment management (owner)
- [ ] Test on different browsers
- [ ] Test on mobile devices

#### Task 4.4: Performance Testing
- [ ] Run Lighthouse audit
- [ ] Optimize bundle size
- [ ] Implement code splitting
- [ ] Optimize images
- [ ] Test API response times
- [ ] Test database query performance
- [ ] Load testing with tools like Artillery

---

### Phase 5: Azure Deployment

#### Task 5.1: Backend Deployment
- [ ] Create Dockerfile for backend (optional)
- [ ] Configure Azure App Service
- [ ] Set up environment variables in App Service
- [ ] Connect to Azure SQL Database
- [ ] Configure Azure Blob Storage connection
- [ ] Configure Azure Redis Cache connection
- [ ] Deploy backend to Azure App Service
- [ ] Configure custom domain (optional)
- [ ] Set up SSL certificate
- [ ] Test backend endpoints in production

#### Task 5.2: Frontend Deployment
- [ ] Build production frontend (`npm run build`)
- [ ] Create Azure Static Web App
- [ ] Configure routing rules
- [ ] Set up environment variables
- [ ] Deploy frontend to Azure Static Web Apps
- [ ] Configure CDN
- [ ] Configure custom domain (optional)
- [ ] Test frontend in production

#### Task 5.3: Database Migration
- [ ] Run database migrations on Azure SQL
- [ ] Seed production database with initial data
- [ ] Set up database backups
- [ ] Configure database connection pooling

#### Task 5.4: Azure AD B2C Configuration
- [ ] Create user flows (sign-up, sign-in, password reset)
- [ ] Configure identity providers (Google, Facebook, Microsoft)
- [ ] Set up custom branding
- [ ] Configure redirect URIs
- [ ] Test OAuth flows in production

#### Task 5.5: CI/CD Pipeline
- [ ] Create GitHub repository
- [ ] Set up GitHub Actions workflow for backend
  - [ ] Run tests
  - [ ] Build application
  - [ ] Deploy to Azure App Service
- [ ] Set up GitHub Actions workflow for frontend
  - [ ] Run tests
  - [ ] Build application
  - [ ] Deploy to Azure Static Web Apps
- [ ] Configure deployment environments (dev, staging, production)
- [ ] Set up automated testing in pipeline

#### Task 5.6: Monitoring & Logging
- [ ] Set up Azure Application Insights
- [ ] Configure logging for backend
- [ ] Configure error tracking
- [ ] Set up alerts for errors and performance issues
- [ ] Create monitoring dashboard
- [ ] Set up availability tests

#### Task 5.7: Security Configuration
- [ ] Store secrets in Azure Key Vault
- [ ] Configure CORS properly
- [ ] Enable HTTPS only
- [ ] Set up rate limiting
- [ ] Configure security headers
- [ ] Enable SQL injection protection
- [ ] Run security audit

---

### Phase 6: Final Testing & Launch

#### Task 6.1: User Acceptance Testing
- [ ] Create test user accounts
- [ ] Test complete farmer journey
- [ ] Test complete platform owner journey
- [ ] Test on multiple devices
- [ ] Test on multiple browsers
- [ ] Collect feedback from beta users

#### Task 6.2: Documentation
- [ ] Write user documentation
- [ ] Create admin guide
- [ ] Document API endpoints
- [ ] Create deployment guide
- [ ] Write troubleshooting guide
- [ ] Create video tutorials (optional)

#### Task 6.3: Performance Optimization
- [ ] Optimize database queries
- [ ] Implement caching strategies
- [ ] Optimize API response times
- [ ] Compress assets
- [ ] Implement lazy loading
- [ ] Monitor and fix memory leaks

#### Task 6.4: Launch Preparation
- [ ] Set up customer support email
- [ ] Prepare marketing materials
- [ ] Create social media presence
- [ ] Set up analytics (Google Analytics)
- [ ] Prepare terms of service
- [ ] Prepare privacy policy
- [ ] Plan launch communication

#### Task 6.5: Post-Launch
- [ ] Monitor application performance
- [ ] Monitor error rates
- [ ] Collect user feedback
- [ ] Plan feature enhancements
- [ ] Address bugs and issues
- [ ] Regular security updates

---

## User Flows

### Farmer Journey
1. Register/Login (with email or OAuth)
2. Browse equipment catalog
3. Filter by category, location, price
4. View equipment details
5. Check availability
6. Book equipment for specific dates
7. View booking confirmation
8. Manage bookings (view, cancel)
9. View booking history

### Platform Owner Journey
1. Register/Login as platform owner
2. Add new equipment
   - Upload images
   - Set pricing
   - Add description
3. Manage equipment (edit, delete)
4. View booking requests
5. Accept/reject booking requests
6. View active bookings
7. View booking history
8. View analytics (optional)

---

## Mobile Optimization Considerations

- **Responsive Breakpoints:** 320px (mobile), 768px (tablet), 1024px (desktop)
- **Touch-Friendly:** Minimum 44x44px touch targets
- **Performance:** Lazy loading images, code splitting
- **Offline Support:** PWA with service workers
- **Fast Loading:** Optimize assets, use CDN
- **Data Efficiency:** Compress images, minimize API calls
- **Testing:** Test on real Android devices (low-end and high-end)

---

## Africa/Nigeria Specific Considerations

- **Currency:** Nigerian Naira (NGN) as default
- **Payment Integration:** Paystack (popular in Nigeria)
- **Localization:** Support for local languages (future)
- **Offline Mode:** Service workers for areas with poor connectivity
- **Low-End Device Support:** Optimize for devices with limited resources
- **Data Usage:** Minimize data consumption
- **SMS Notifications:** Alternative to email (future)
- **USSD Integration:** For basic feature phones (future)

---

## Estimated Timeline

- **Phase 1 (Setup):** 1 week
- **Phase 2 (Backend):** 3-4 weeks
- **Phase 3 (Frontend):** 4-5 weeks
- **Phase 4 (Testing):** 2 weeks
- **Phase 5 (Deployment):** 1-2 weeks
- **Phase 6 (Launch):** 1 week

**Total:** 12-15 weeks (3-4 months)

---

## Next Steps

1. Review and approve this architecture and plan
2. Set up Azure account and provision resources
3. Initialize project repositories
4. Begin Phase 1: Project setup
5. Start backend development (Phase 2)
6. Parallel frontend development (Phase 3)
7. Continuous testing throughout
8. Deploy to Azure and launch

---

## Resources & References

- [Azure Documentation](https://docs.microsoft.com/azure/)
- [React Documentation](https://react.dev/)
- [TypeScript Documentation](https://www.typescriptlang.org/)
- [Express.js Documentation](https://expressjs.com/)
- [Material-UI Documentation](https://mui.com/)
- [Azure AD B2C Documentation](https://docs.microsoft.com/azure/active-directory-b2c/)
- [Paystack API](https://paystack.com/docs/api/)

---

**Version:** 1.0
**Last Updated:** 2025-10-16
**Author:** Development Team

---

## Database Seeding

The project includes comprehensive seed data for quick development and testing.

### Equipment Categories

The system includes 10 main categories:
1. **Tractors** - Compact and utility tractors for various farm operations
2. **Tillers & Cultivators** - Soil preparation and cultivation equipment
3. **Planting Equipment** - Seeders, planters, and transplanting machines
4. **Harvesting Equipment** - Harvesters, reapers, and threshers
5. **Irrigation Systems** - Water pumps, sprinklers, and drip irrigation
6. **Sprayers** - Pesticide and fertilizer application equipment
7. **Mowers & Cutters** - Grass cutters, brush cutters, and hay mowers
8. **Post Harvest Equipment** - Threshers, winnowers, and grain cleaners
9. **Transport & Handling** - Farm trailers, carts, and material handlers
10. **Power Tools** - Generators, water pumps, and power equipment

### Sample Equipment (18 items)

The seed data includes realistic farm equipment with:
- **Detailed specifications** (HP, capacity, dimensions, etc.)
- **Competitive pricing** (NGN 2,500 - 45,000 per day)
- **Real locations** (Ibadan, Oyo State & Abeokuta, Ogun State)
- **High-quality images** (via Unsplash)
- **Equipment conditions** (Excellent, Good, Fair)

### Sample Users (3 users)

| Role | Name | Email | Password | Location |
|------|------|-------|----------|----------|
| Farmer | Adebayo Oladele | farmer1@example.com | Password123 | Lagos |
| Platform Owner | Oluwaseun Bakare | owner1@example.com | Password123 | Oyo |
| Platform Owner | Chidinma Nwosu | owner2@example.com | Password123 | Ogun |

### Running the Seed Script

```bash
# Navigate to backend directory
cd backend

# Install dependencies (if not already done)
npm install

# Set up your database connection in .env
# DATABASE_URL="sqlserver://localhost:1433;database=fms_db;user=sa;password=YourPassword;trustServerCertificate=true"

# Run Prisma migrations to create tables
npx prisma migrate dev --name init

# Run the seed script
npm run prisma:seed
# or
npm run db:seed

# Expected output:
# 🌱 Starting database seeding...
# ✅ Created category: Tractors
# ✅ Created category: Tillers & Cultivators
# ...
# ✅ Created farmer: Adebayo Oladele
# ✅ Created platform owner: Oluwaseun Bakare
# ...
# ✅ Created equipment: John Deere 5055E Utility Tractor
# ...
# ✨ Database seeding completed successfully!
```

### Equipment Pricing Guide

| Equipment Type | Price Range (NGN/day) | Target Farmer |
|----------------|----------------------|---------------|
| Walk-Behind Tiller | 5,000 - 8,000 | Small-scale |
| Brush Cutter | 2,500 - 3,500 | Small-scale |
| Water Pump | 4,000 - 7,000 | Medium-scale |
| Knapsack Sprayer | 3,500 - 5,000 | Medium-scale |
| Compact Tractor | 25,000 - 35,000 | Medium-scale |
| Seed Planter | 12,000 - 15,000 | Medium-scale |
| Combine Harvester | 45,000+ | Large-scale |

### Image Sources

All equipment images are sourced from Unsplash (free, commercial-use allowed):
- Tractors: High-quality farm tractor images
- Implements: Agricultural equipment photography
- Tools: Professional equipment shots

For production, replace with actual equipment photos from your inventory.

---

## Getting Started (Quick Setup)

```bash
# 1. Clone the repository
git clone <repository-url>
cd fms

# 2. Backend Setup
cd backend
npm install
cp .env.example .env
# Edit .env with your database credentials

# 3. Database Setup
npx prisma migrate dev --name init
npm run prisma:seed

# 4. Start Backend
npm run dev
# Backend runs on http://localhost:5000

# 5. Frontend Setup (in new terminal)
cd ../frontend
npm install
# Edit .env.local with backend URL

# 6. Start Frontend
npm run dev
# Frontend runs on http://localhost:3000

# 7. Login with test credentials
# Email: farmer1@example.com
# Password: Password123
```

---

