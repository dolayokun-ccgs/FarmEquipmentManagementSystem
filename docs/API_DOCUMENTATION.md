# Farm Equipment Management System - API Documentation

**Base URL:** `http://localhost:5000/api` (Development)

**Version:** 1.0.0

---

## Table of Contents

1. [Authentication](#authentication)
2. [Categories](#categories)
3. [Equipment](#equipment)
4. [Bookings](#bookings)
5. [Error Handling](#error-handling)

---

## Authentication

All authenticated requests require a Bearer token in the Authorization header:

```
Authorization: Bearer <access_token>
```

### Register

Create a new user account.

**Endpoint:** `POST /auth/register`

**Access:** Public

**Request Body:**
```json
{
  "email": "farmer@example.com",
  "password": "SecurePass123!",
  "firstName": "John",
  "lastName": "Farmer",
  "phoneNumber": "+2348012345678",
  "role": "FARMER" // FARMER | PLATFORM_OWNER
}
```

**Response:** `201 Created`
```json
{
  "status": "success",
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "uuid",
      "email": "farmer@example.com",
      "firstName": "John",
      "lastName": "Farmer",
      "phoneNumber": "+2348012345678",
      "role": "FARMER",
      "isVerified": false,
      "createdAt": "2025-01-15T10:00:00Z"
    },
    "accessToken": "eyJhbGci...",
    "refreshToken": "eyJhbGci..."
  }
}
```

---

### Login

Authenticate a user and receive access tokens.

**Endpoint:** `POST /auth/login`

**Access:** Public

**Request Body:**
```json
{
  "email": "farmer@example.com",
  "password": "SecurePass123!"
}
```

**Response:** `200 OK`
```json
{
  "status": "success",
  "message": "Login successful",
  "data": {
    "user": {
      "id": "uuid",
      "email": "farmer@example.com",
      "firstName": "John",
      "lastName": "Farmer",
      "role": "FARMER",
      "isVerified": false,
      "profileImage": null
    },
    "accessToken": "eyJhbGci...",
    "refreshToken": "eyJhbGci..."
  }
}
```

---

### Get Current User

Get the authenticated user's profile.

**Endpoint:** `GET /auth/me`

**Access:** Private

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:** `200 OK`
```json
{
  "status": "success",
  "data": {
    "user": {
      "id": "uuid",
      "email": "farmer@example.com",
      "firstName": "John",
      "lastName": "Farmer",
      "phoneNumber": "+2348012345678",
      "role": "FARMER",
      "isVerified": false,
      "profileImage": null,
      "createdAt": "2025-01-15T10:00:00Z",
      "lastLogin": "2025-01-15T12:00:00Z"
    }
  }
}
```

---

### Logout

Logout the current user.

**Endpoint:** `POST /auth/logout`

**Access:** Private

**Response:** `200 OK`
```json
{
  "status": "success",
  "message": "Logout successful"
}
```

---

## Categories

### Get All Categories

Retrieve all equipment categories.

**Endpoint:** `GET /categories`

**Access:** Public

**Response:** `200 OK`
```json
{
  "status": "success",
  "data": {
    "categories": [
      {
        "id": "uuid",
        "name": "Tractors & Plows",
        "description": "Various types of tractors and plowing equipment",
        "iconUrl": null,
        "parentId": null,
        "createdAt": "2025-01-15T10:00:00Z",
        "subcategories": [],
        "_count": {
          "equipment": 15
        }
      }
    ],
    "count": 8
  }
}
```

---

### Get Category by ID

Get a specific category with its equipment.

**Endpoint:** `GET /categories/:id`

**Access:** Public

**Response:** `200 OK`
```json
{
  "status": "success",
  "data": {
    "category": {
      "id": "uuid",
      "name": "Tractors & Plows",
      "description": "Various types of tractors and plowing equipment",
      "iconUrl": null,
      "parentId": null,
      "createdAt": "2025-01-15T10:00:00Z",
      "subcategories": [],
      "equipment": [
        {
          "id": "uuid",
          "name": "John Deere 5055E",
          "pricePerDay": 5000.00,
          "currency": "NGN",
          "isAvailable": true
        }
      ],
      "_count": {
        "equipment": 15
      }
    }
  }
}
```

---

### Create Category

Create a new category (Admin only).

**Endpoint:** `POST /categories`

**Access:** Private (Admin only)

**Request Body:**
```json
{
  "name": "New Category",
  "description": "Category description",
  "iconUrl": "https://example.com/icon.png",
  "parentId": "uuid" // Optional for subcategories
}
```

**Response:** `201 Created`
```json
{
  "status": "success",
  "message": "Category created successfully",
  "data": {
    "category": {
      "id": "uuid",
      "name": "New Category",
      "description": "Category description",
      "iconUrl": "https://example.com/icon.png",
      "parentId": null,
      "createdAt": "2025-01-15T10:00:00Z"
    }
  }
}
```

---

## Equipment

### Get All Equipment

Get all equipment with filters and pagination.

**Endpoint:** `GET /equipment`

**Access:** Public

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `categoryId` (optional): Filter by category
- `locationState` (optional): Filter by state (e.g., "Lagos")
- `minPrice` (optional): Minimum price per day
- `maxPrice` (optional): Maximum price per day
- `condition` (optional): EXCELLENT | GOOD | FAIR | POOR
- `isAvailable` (optional): true | false
- `search` (optional): Search in name, description, or location

**Example:** `GET /equipment?page=1&limit=10&locationState=Lagos&minPrice=1000&maxPrice=10000`

**Response:** `200 OK`
```json
{
  "status": "success",
  "data": {
    "equipment": [
      {
        "id": "uuid",
        "name": "John Deere 5055E Tractor",
        "description": "55 HP utility tractor perfect for small to medium farms",
        "pricePerDay": 5000.00,
        "currency": "NGN",
        "condition": "EXCELLENT",
        "locationCity": "Ikeja",
        "locationState": "Lagos",
        "locationCountry": "Nigeria",
        "isAvailable": true,
        "images": ["https://blob.url/image1.jpg"],
        "createdAt": "2025-01-15T10:00:00Z",
        "category": {
          "id": "uuid",
          "name": "Tractors & Plows",
          "iconUrl": null
        },
        "owner": {
          "id": "uuid",
          "firstName": "Jane",
          "lastName": "Owner",
          "profileImage": null
        },
        "_count": {
          "reviews": 5,
          "bookings": 12
        }
      }
    ],
    "pagination": {
      "total": 45,
      "page": 1,
      "limit": 10,
      "totalPages": 5
    }
  }
}
```

---

### Get Equipment by ID

Get detailed information about specific equipment.

**Endpoint:** `GET /equipment/:id`

**Access:** Public

**Response:** `200 OK`
```json
{
  "status": "success",
  "data": {
    "equipment": {
      "id": "uuid",
      "name": "John Deere 5055E Tractor",
      "description": "55 HP utility tractor perfect for small to medium farms",
      "pricePerDay": 5000.00,
      "currency": "NGN",
      "condition": "EXCELLENT",
      "locationAddress": "123 Farm Road",
      "locationCity": "Ikeja",
      "locationState": "Lagos",
      "locationCountry": "Nigeria",
      "latitude": 6.5244,
      "longitude": 3.3792,
      "isAvailable": true,
      "images": ["https://blob.url/image1.jpg"],
      "specifications": {
        "horsepower": 55,
        "fuelType": "Diesel",
        "weight": "2000kg"
      },
      "createdAt": "2025-01-15T10:00:00Z",
      "updatedAt": "2025-01-15T10:00:00Z",
      "category": {
        "id": "uuid",
        "name": "Tractors & Plows"
      },
      "owner": {
        "id": "uuid",
        "firstName": "Jane",
        "lastName": "Owner",
        "email": "owner@example.com",
        "phoneNumber": "+2348012345678",
        "profileImage": null
      },
      "reviews": [
        {
          "id": "uuid",
          "rating": 5,
          "comment": "Excellent tractor!",
          "createdAt": "2025-01-14T10:00:00Z",
          "reviewer": {
            "id": "uuid",
            "firstName": "John",
            "lastName": "Farmer",
            "profileImage": null
          }
        }
      ],
      "bookings": [
        {
          "startDate": "2025-01-20T00:00:00Z",
          "endDate": "2025-01-25T00:00:00Z"
        }
      ],
      "_count": {
        "reviews": 5,
        "bookings": 12
      }
    }
  }
}
```

---

### Create Equipment

Create new equipment listing (Platform Owner only).

**Endpoint:** `POST /equipment`

**Access:** Private (Platform Owner/Admin only)

**Request Body:**
```json
{
  "name": "John Deere 5055E Tractor",
  "description": "55 HP utility tractor perfect for small to medium farms",
  "categoryId": "uuid",
  "pricePerDay": 5000,
  "currency": "NGN",
  "condition": "EXCELLENT",
  "locationAddress": "123 Farm Road",
  "locationCity": "Ikeja",
  "locationState": "Lagos",
  "locationCountry": "Nigeria",
  "latitude": 6.5244,
  "longitude": 3.3792,
  "images": ["https://blob.url/image1.jpg", "https://blob.url/image2.jpg"],
  "specifications": {
    "horsepower": 55,
    "fuelType": "Diesel",
    "weight": "2000kg"
  }
}
```

**Response:** `201 Created`
```json
{
  "status": "success",
  "message": "Equipment created successfully",
  "data": {
    "equipment": { /* Equipment object */ }
  }
}
```

---

### Update Equipment

Update existing equipment (Owner only).

**Endpoint:** `PUT /equipment/:id`

**Access:** Private (Owner/Admin only)

**Request Body:** (All fields optional)
```json
{
  "name": "Updated Name",
  "description": "Updated description",
  "pricePerDay": 6000,
  "isAvailable": false,
  "condition": "GOOD"
}
```

**Response:** `200 OK`
```json
{
  "status": "success",
  "message": "Equipment updated successfully",
  "data": {
    "equipment": { /* Updated equipment object */ }
  }
}
```

---

### Delete Equipment

Delete equipment (Owner only).

**Endpoint:** `DELETE /equipment/:id`

**Access:** Private (Owner/Admin only)

**Response:** `200 OK`
```json
{
  "status": "success",
  "message": "Equipment deleted successfully"
}
```

**Note:** Cannot delete equipment with active bookings.

---

### Get My Equipment

Get current user's equipment listings.

**Endpoint:** `GET /equipment/my-equipment`

**Access:** Private (Platform Owner/Admin only)

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)

**Response:** `200 OK` (Same format as Get All Equipment)

---

### Get Equipment by Owner

Get all equipment from a specific owner.

**Endpoint:** `GET /equipment/owner/:ownerId`

**Access:** Public

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)

**Response:** `200 OK` (Same format as Get All Equipment)

---

## Bookings

### Create Booking

Create a new equipment booking.

**Endpoint:** `POST /bookings`

**Access:** Private (Any authenticated user)

**Request Body:**
```json
{
  "equipmentId": "uuid",
  "startDate": "2025-01-20T00:00:00Z",
  "endDate": "2025-01-25T00:00:00Z",
  "notes": "Will pick up at 9am"
}
```

**Response:** `201 Created`
```json
{
  "status": "success",
  "message": "Booking created successfully",
  "data": {
    "booking": {
      "id": "uuid",
      "equipmentId": "uuid",
      "farmerId": "uuid",
      "startDate": "2025-01-20T00:00:00Z",
      "endDate": "2025-01-25T00:00:00Z",
      "totalDays": 5,
      "pricePerDay": 5000.00,
      "totalPrice": 25000.00,
      "status": "PENDING",
      "paymentStatus": "PENDING",
      "notes": "Will pick up at 9am",
      "createdAt": "2025-01-15T10:00:00Z",
      "equipment": {
        "id": "uuid",
        "name": "John Deere 5055E Tractor",
        "category": { "id": "uuid", "name": "Tractors & Plows" },
        "owner": {
          "id": "uuid",
          "firstName": "Jane",
          "lastName": "Owner",
          "email": "owner@example.com",
          "phoneNumber": "+2348012345678"
        }
      },
      "farmer": {
        "id": "uuid",
        "firstName": "John",
        "lastName": "Farmer",
        "email": "farmer@example.com",
        "phoneNumber": "+2348012345678"
      }
    }
  }
}
```

**Error Responses:**
- `400 Bad Request`: Invalid dates or dates in the past
- `404 Not Found`: Equipment not found
- `409 Conflict`: Equipment already booked for selected dates

---

### Get All Bookings

Get bookings filtered by user role.

**Endpoint:** `GET /bookings`

**Access:** Private

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `status` (optional): PENDING | CONFIRMED | ACTIVE | COMPLETED | CANCELLED
- `equipmentId` (optional): Filter by equipment

**Behavior:**
- **Farmers:** See only their own bookings
- **Platform Owners:** See bookings for their equipment
- **Admins:** See all bookings

**Response:** `200 OK`
```json
{
  "status": "success",
  "data": {
    "bookings": [
      {
        "id": "uuid",
        "startDate": "2025-01-20T00:00:00Z",
        "endDate": "2025-01-25T00:00:00Z",
        "totalDays": 5,
        "totalPrice": 25000.00,
        "status": "PENDING",
        "paymentStatus": "PENDING",
        "createdAt": "2025-01-15T10:00:00Z",
        "equipment": { /* Equipment details */ },
        "farmer": { /* Farmer details */ }
      }
    ],
    "pagination": {
      "total": 10,
      "page": 1,
      "limit": 20,
      "totalPages": 1
    }
  }
}
```

---

### Get Booking by ID

Get specific booking details.

**Endpoint:** `GET /bookings/:id`

**Access:** Private (Owner, Farmer, or Admin only)

**Response:** `200 OK`
```json
{
  "status": "success",
  "data": {
    "booking": {
      /* Full booking details with equipment, farmer, and review if exists */
    }
  }
}
```

---

### Update Booking Status

Confirm or reject a booking (Equipment owner only).

**Endpoint:** `PATCH /bookings/:id/status`

**Access:** Private (Equipment Owner/Admin only)

**Request Body:**
```json
{
  "status": "CONFIRMED" // CONFIRMED | CANCELLED | ACTIVE | COMPLETED
}
```

**Response:** `200 OK`
```json
{
  "status": "success",
  "message": "Booking status updated successfully",
  "data": {
    "booking": { /* Updated booking */ }
  }
}
```

---

### Cancel Booking

Cancel a booking (Farmer who made the booking).

**Endpoint:** `PATCH /bookings/:id/cancel`

**Access:** Private (Farmer who made the booking)

**Request Body:**
```json
{
  "cancellationReason": "Change of plans"
}
```

**Response:** `200 OK`
```json
{
  "status": "success",
  "message": "Booking cancelled successfully",
  "data": {
    "booking": { /* Cancelled booking */ }
  }
}
```

**Note:** Cannot cancel completed bookings.

---

### Get Equipment Availability

Check equipment availability for specific dates.

**Endpoint:** `GET /bookings/availability/:equipmentId`

**Access:** Public

**Query Parameters:**
- `startDate` (optional): Check from this date
- `endDate` (optional): Check until this date

**Example:** `GET /bookings/availability/uuid?startDate=2025-01-20&endDate=2025-01-30`

**Response:** `200 OK`
```json
{
  "status": "success",
  "data": {
    "equipmentId": "uuid",
    "bookedDates": [
      {
        "id": "uuid",
        "startDate": "2025-01-22T00:00:00Z",
        "endDate": "2025-01-25T00:00:00Z",
        "status": "CONFIRMED"
      }
    ],
    "isAvailable": false
  }
}
```

---

## Error Handling

All API errors follow this format:

```json
{
  "status": "error",
  "message": "Error description"
}
```

### Common HTTP Status Codes

- `200 OK`: Request successful
- `201 Created`: Resource created successfully
- `400 Bad Request`: Invalid request data
- `401 Unauthorized`: Missing or invalid authentication token
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `409 Conflict`: Resource conflict (e.g., duplicate email, booking conflict)
- `500 Internal Server Error`: Server error

### Password Requirements

Passwords must meet the following criteria:
- At least 8 characters long
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character

---

## Rate Limiting

(To be implemented)

---

## Postman Collection

Import this collection to test all endpoints: (To be created)

---

**Last Updated:** 2025-01-15
**API Version:** 1.0.0
