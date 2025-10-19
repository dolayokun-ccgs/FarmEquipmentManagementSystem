# Admin Features Documentation

## Overview
The Farm Equipment Management System now includes comprehensive admin/government entity management features for platform owners to manage equipment and bookings.

## Admin Dashboard Access

### Login Credentials
**Government Entity Accounts:**
- **Ibadan North LGA:** ibadan-north@oyo.gov.ng / Password123
- **Abeokuta North LGA:** abeokuta-north@ogun.gov.ng / Password123

### Admin Routes
All admin features are accessible from the main dashboard at `/dashboard`

## Features

### 1. Equipment Management

#### **View All Equipment** - `/dashboard/equipment`
- Lists all equipment owned by the logged-in government entity
- Features:
  - Equipment cards with images, details, and status
  - Quick view of booking count and review count
  - Price per day display
  - Location information
  - Availability status indicator
  - Condition badge (EXCELLENT, GOOD, FAIR)

**Actions Available:**
- **View:** Open equipment detail page
- **Edit:** Update equipment information
- **Delete:** Remove equipment from platform (with confirmation)

#### **Add New Equipment** - `/dashboard/equipment/add`
Comprehensive form for adding new equipment with the following sections:

**Basic Information:**
- Equipment Name *
- Description *
- Category * (select from existing categories)
- Condition * (EXCELLENT, GOOD, FAIR)
- Price Per Day (₦) *
- Availability toggle

**Location Information:**
- Address
- City *
- State * (dropdown of Nigerian states)
- Latitude (optional)
- Longitude (optional)

**Additional Information:**
- Images (JSON array or comma-separated URLs)
- Specifications (JSON object for technical details)

**Example Specifications Format:**
```json
{
  "Engine": "55 HP",
  "Power Steering": "Yes",
  "4WD": "Standard",
  "PTO": "540/1000 RPM"
}
```

**Example Images Format:**
```json
["/images/equipment/tractor.jpg", "/images/equipment/tractor2.jpg"]
```
Or comma-separated:
```
/images/equipment/tractor.jpg, /images/equipment/tractor2.jpg
```

#### **Edit Equipment** - `/dashboard/equipment/edit/[id]`
- Pre-populated form with current equipment data
- Same fields as Add Equipment page
- All changes are saved immediately
- Navigate back to equipment list after update

**Features:**
- Auto-loads existing equipment data
- JSON formatting preserved for images and specifications
- Validation for required fields
- Status updates (available/not available)

---

### 2. Bookings Management

#### **My Bookings** - `/dashboard/bookings`
View bookings for equipment you own (PLATFORM_OWNER role)

**Features:**
- Filter by status (PENDING, CONFIRMED, ACTIVE, COMPLETED, CANCELLED)
- Visual status badges with color coding
- Payment status indicators
- Equipment images and details
- Booking timeline (start date, end date, duration)
- Total price display

**Actions for Platform Owners:**
- **Pending Bookings:**
  - Confirm booking
  - Decline booking (with reason)
- **Confirmed Bookings:**
  - Mark as Active (when farmer picks up equipment)
- **Active Bookings:**
  - Mark as Completed (when returned)

#### **All Bookings Management** - `/dashboard/admin/bookings`
**Admin-only page** to view and manage ALL bookings across the entire platform

**Features:**
- **Statistics Dashboard:**
  - Total bookings count
  - Pending count
  - Confirmed count
  - Active count
  - Completed count
  - Cancelled count

- **Advanced Filters:**
  - Search by equipment name, farmer name, or email
  - Filter by booking status
  - Real-time filtering

- **Comprehensive Table View:**
  - Booking ID (truncated)
  - Equipment name and location
  - Farmer details (name and email)
  - Booking dates and duration
  - Total amount
  - Status badge
  - Payment status badge
  - Quick actions column

**Quick Actions:**
- **Pending:** Confirm or Decline
- **Confirmed:** Activate
- **Active:** Complete
- **All statuses:** View Equipment link

**Status Flow:**
```
PENDING → CONFIRMED → ACTIVE → COMPLETED
   ↓
CANCELLED (can happen at any pending/confirmed stage)
```

---

### 3. Dashboard Overview - `/dashboard`

The main dashboard displays role-specific quick action cards:

**For Platform Owners/Government Entities:**
1. **My Bookings** - View bookings for your equipment
2. **My Equipment** - Manage your equipment listings
3. **Add Equipment** - List new equipment
4. **All Bookings** - Admin view of all platform bookings
5. **Profile Settings** - Update account information

**Card Features:**
- Color-coded backgrounds
- Emoji icons for easy identification
- Hover effects with border highlight
- Direct navigation to feature pages

---

## Access Control

### Role-Based Permissions

**PLATFORM_OWNER Role:**
- Full access to equipment management (own equipment only)
- Can add, edit, and delete equipment
- Can view and manage bookings for owned equipment
- Can view all bookings across platform
- Cannot access farmer-only features

**ADMIN Role:**
- Same permissions as PLATFORM_OWNER
- Future: Additional system-wide administrative capabilities

**FARMER Role:**
- Can view equipment catalog
- Can make bookings
- Can view own bookings only
- Can make payments
- Cannot access admin features

### Route Protection

All admin routes implement automatic redirects:
- Unauthenticated users → `/login?redirect=[intended_page]`
- Unauthorized roles → `/dashboard`
- Access denied pages with clear messaging

---

## User Interface

### Design System

**Colors:**
- Primary: `#021f5c` (Navy Blue)
- Secondary: `#2D7A3E` (Green)
- Accent: `#fdca2e` (Yellow)
- Background: `#f9fafb` (Light Gray)

**Status Colors:**
- Pending: Yellow
- Confirmed: Blue
- Active: Green
- Completed: Gray
- Cancelled: Red

**Payment Status Colors:**
- PENDING: Yellow
- PAID: Green
- FAILED: Red
- REFUNDED: Gray

### Responsive Design
- Mobile-first approach
- Grid layouts adapt to screen size
- Touch-friendly action buttons
- Optimized for tablets and desktops

---

## Data Management

### Equipment Categories
Current categories in system:
1. Tractors
2. Tillers & Cultivators
3. Planting Equipment
4. Harvesting Equipment
5. Irrigation Systems
6. Sprayers
7. Mowers & Cutters
8. Post Harvest Equipment
9. Transport & Handling
10. Power Tools

### Equipment Condition Options
- EXCELLENT
- GOOD
- FAIR

### Booking Statuses
- PENDING - Awaiting confirmation
- CONFIRMED - Approved by owner
- ACTIVE - Equipment currently in use
- COMPLETED - Rental completed
- CANCELLED - Booking cancelled

### Payment Statuses
- PENDING - Awaiting payment
- PAID - Payment completed
- FAILED - Payment failed
- REFUNDED - Payment refunded

---

## API Integration

All admin pages integrate with backend REST API:

**Equipment Endpoints:**
- `GET /api/equipment` - Fetch equipment list
- `POST /api/equipment` - Create new equipment
- `GET /api/equipment/:id` - Get single equipment
- `PATCH /api/equipment/:id` - Update equipment
- `DELETE /api/equipment/:id` - Delete equipment

**Booking Endpoints:**
- `GET /api/bookings` - Fetch bookings
- `PATCH /api/bookings/:id/status` - Update booking status
- `PATCH /api/bookings/:id/cancel` - Cancel booking

**Category Endpoints:**
- `GET /api/categories` - Fetch all categories

---

## Future Enhancements

### Planned Features:
1. **Image Upload:**
   - Direct image upload to server
   - Multiple image management
   - Image compression and optimization
   - Drag-and-drop interface

2. **Analytics Dashboard:**
   - Revenue tracking
   - Equipment utilization rates
   - Booking trends
   - Farmer engagement metrics

3. **Bulk Operations:**
   - Bulk equipment import via CSV
   - Bulk status updates
   - Batch notifications

4. **Advanced Filtering:**
   - Date range filters for bookings
   - Revenue range filters
   - Equipment category filters
   - Location-based filtering

5. **Reporting:**
   - PDF export of bookings
   - Excel export of equipment list
   - Monthly revenue reports
   - Equipment maintenance logs

6. **Notifications:**
   - Email notifications for new bookings
   - SMS alerts for booking confirmations
   - Push notifications for status changes

7. **Farmer Verification:**
   - LGA verification workflow
   - Approval/rejection system
   - Verification status badges
   - Document upload and review

---

## Technical Stack

**Frontend:**
- Next.js 15.5.5 (App Router)
- TypeScript
- Tailwind CSS
- Zustand (State Management)
- Axios (API Client)

**Backend:**
- Node.js/Express
- TypeScript
- Prisma ORM
- SQL Server

**Authentication:**
- JWT-based authentication
- Role-based access control
- Secure token storage

---

## Testing the Admin Features

### Quick Start Guide:

1. **Start the Application:**
   ```bash
   # Backend
   cd backend
   npm run dev

   # Frontend (in separate terminal)
   cd frontend
   npm run dev
   ```

2. **Login as Government Entity:**
   - Navigate to http://localhost:3000/login
   - Email: ibadan-north@oyo.gov.ng
   - Password: Password123

3. **Access Admin Dashboard:**
   - After login, you'll be at `/dashboard`
   - Click on any quick action card

4. **Add Equipment:**
   - Click "Add Equipment" card
   - Fill out the form
   - Submit to create new equipment

5. **Manage Bookings:**
   - Click "All Bookings" to see platform-wide bookings
   - Use filters to find specific bookings
   - Click action buttons to update booking status

6. **Edit Equipment:**
   - Click "My Equipment"
   - Find equipment in list
   - Click "Edit" button
   - Update details and save

---

## Support

For issues or questions:
- Check backend logs at terminal running `npm run dev`
- Check frontend browser console for errors
- Verify authentication token is valid
- Ensure database connection is active

## Database Schema Reference

**Equipment Table:**
- id (UUID)
- ownerId (UUID) - Foreign key to User
- name (String)
- description (String)
- categoryId (UUID)
- pricePerDay (Decimal)
- condition (Enum)
- location fields (String, Decimal)
- isAvailable (Boolean)
- images (JSON String)
- specifications (JSON String)
- timestamps

**Booking Table:**
- id (UUID)
- farmerId (UUID)
- equipmentId (UUID)
- startDate (DateTime)
- endDate (DateTime)
- totalDays (Int)
- totalPrice (Decimal)
- status (Enum)
- paymentStatus (Enum)
- notes (String)
- cancellationReason (String)
- timestamps

**User Table:**
- id (UUID)
- email (String)
- firstName, lastName (String)
- role (Enum: FARMER, PLATFORM_OWNER, ADMIN)
- state, lga (String)
- phoneNumber (String)
- isVerified (Boolean)
- timestamps
