# MapIt - API Endpoints Reference

## 🚀 Complete API Documentation

This document lists all available API endpoints for the MapIt application, including their methods, parameters, and responses.

---

## 📋 Table of Contents

1. [Authentication](#authentication)
2. [Customer Endpoints](#customer-endpoints)
3. [Admin Endpoints](#admin-endpoints)
4. [Map Endpoints](#map-endpoints)
5. [Zone Endpoints](#zone-endpoints)
6. [Package Endpoints](#package-endpoints)
7. [Database Configuration](#database-configuration)

---

## 🔐 Authentication

### Customer Login
**POST** `/api/login`

**Request Body:**
```json
{
  "email": "customer@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "customer": {
    "customer_id": 1,
    "email": "customer@example.com",
    "first_name": "John",
    "last_name": "Doe"
  }
}
```

### Admin Login
**POST** `/api/admin/login`

**Request Body:**
```json
{
  "email": "admin@mapit.com",
  "password": "adminpass"
}
```

**Response:**
```json
{
  "success": true,
  "admin": {
    "admin_id": 1,
    "email": "admin@mapit.com",
    "first_name": "Admin",
    "last_name": "User"
  }
}
```

### Customer Registration
**POST** `/api/register`

**Request Body:**
```json
{
  "first_name": "John",
  "last_name": "Doe",
  "email": "john@example.com",
  "password": "password123",
  "package_id": 1
}
```

---

## 👤 Customer Endpoints

### Get Customer Maps
**GET** `/api/customer/[id]/maps`

**Parameters:**
- `id` - Customer ID (URL parameter)

**Response:**
```json
{
  "success": true,
  "maps": [
    {
      "map_id": 1,
      "title": "My Map",
      "description": "Description",
      "map_code": "ABC123",
      "country": "Lebanon",
      "zone_count": 5,
      "created_at": "2025-11-03T10:00:00.000Z",
      "active": true
    }
  ]
}
```

### Get Customer Package
**GET** `/api/customer/[id]/package`

**Parameters:**
- `id` - Customer ID (URL parameter)

**Response:**
```json
{
  "success": true,
  "package": {
    "package_id": 2,
    "name": "Starter",
    "price": "5.00",
    "allowed_maps": 3,
    "priority": 2,
    "order_date": "2025-11-01T10:00:00.000Z"
  }
}
```

---

## 👨‍💼 Admin Endpoints

### Get All Maps
**GET** `/api/admin/maps`

**Response:**
```json
{
  "success": true,
  "maps": [
    {
      "map_id": 1,
      "title": "Customer Map",
      "customer_name": "John Doe",
      "customer_email": "john@example.com",
      "zone_count": 5,
      "created_at": "2025-11-03T10:00:00.000Z"
    }
  ]
}
```

### Get Dashboard Statistics
**GET** `/api/admin/stats`

**Response:**
```json
{
  "success": true,
  "stats": {
    "totalCustomers": 21,
    "totalMaps": 28,
    "totalZones": 24,
    "totalOrders": 5,
    "activeMaps": 25,
    "totalRevenue": 125.50
  }
}
```

### Get All Orders
**GET** `/api/admin/orders`

**Response:**
```json
{
  "success": true,
  "orders": [
    {
      "id": 1,
      "customer_name": "John Doe",
      "package_name": "Starter",
      "total": "5.00",
      "status": "completed",
      "date_time": "2025-11-01T10:00:00.000Z"
    }
  ]
}
```

---

## 🗺️ Map Endpoints

### Get Map by ID
**GET** `/api/map/[id]`

**Parameters:**
- `id` - Map ID (URL parameter)

**Response:**
```json
{
  "success": true,
  "map": {
    "map_id": 1,
    "title": "My Map",
    "description": "Description",
    "map_code": "ABC123",
    "customer_id": 1,
    "customer_name": "John Doe",
    "zones": [
      {
        "id": 1,
        "map_id": 1,
        "name": "Zone 1",
        "color": "#FF5733",
        "coordinates": [[33.8547, 35.8623], [33.8548, 35.8625]],
        "created_at": "2025-11-03T10:00:00.000Z"
      }
    ]
  }
}
```

### Get Map Zones
**GET** `/api/map/[id]/zones`

**Parameters:**
- `id` - Map ID (URL parameter)

**Response:**
```json
{
  "success": true,
  "zones": [
    {
      "id": 1,
      "map_id": 1,
      "name": "Zone 1",
      "color": "#FF5733",
      "coordinates": [[33.8547, 35.8623]],
      "created_at": "2025-11-03T10:00:00.000Z"
    }
  ]
}
```

### Create Map
**POST** `/api/map`

**Request Body:**
```json
{
  "title": "New Map",
  "description": "Map description",
  "country": "Lebanon",
  "customer_id": 1,
  "map_code": "UNIQUE123",
  "map_data": {},
  "map_bounds": [[33.0, 35.0], [34.0, 36.0]]
}
```

---

## 📍 Zone Endpoints

### Create Single Zone
**POST** `/api/zone`

**Request Body:**
```json
{
  "map_id": 1,
  "name": "Zone 1",
  "color": "#FF5733",
  "coordinates": [[33.8547, 35.8623], [33.8548, 35.8625]]
}
```

**Response:**
```json
{
  "success": true,
  "zone": {
    "id": 1,
    "map_id": 1,
    "name": "Zone 1",
    "color": "#FF5733",
    "coordinates": "[[33.8547,35.8623],[33.8548,35.8625]]",
    "created_at": "2025-11-03T10:00:00.000Z"
  }
}
```

### Bulk Save Zones
**POST** `/api/zones`

**Request Body:**
```json
{
  "map_id": 1,
  "zones": [
    {
      "name": "Zone 1",
      "color": "#FF5733",
      "coordinates": [[33.8547, 35.8623]]
    },
    {
      "name": "Zone 2",
      "color": "#33FF57",
      "coordinates": [[33.8550, 35.8630]]
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "zones": [
    { "id": 1, "name": "Zone 1", ... },
    { "id": 2, "name": "Zone 2", ... }
  ],
  "count": 2
}
```

---

## 📦 Package Endpoints

### Get All Packages
**GET** `/api/packages`

**Response:**
```json
{
  "success": true,
  "packages": [
    {
      "package_id": 1,
      "name": "Free",
      "price": "0.00",
      "allowed_maps": 1,
      "priority": 1,
      "active": true
    },
    {
      "package_id": 2,
      "name": "Starter",
      "price": "5.00",
      "allowed_maps": 3,
      "priority": 2,
      "active": true
    }
  ]
}
```

---

## 🗄️ Database Configuration

### Environment Variables

For **local development** and **Vercel deployment**, set this environment variable:

```bash
DATABASE_URL=postgresql://postgres.vfqmqcillubgddsdzvlc:SOnclD1eHCYTOWz5@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres
```

### Vercel Setup

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add new variable:
   - **Key**: `DATABASE_URL`
   - **Value**: (Supabase connection string above)
   - **Environments**: Select all (Production, Preview, Development)
4. Redeploy your project

### Local Setup

1. Copy `.env.example` to `.env`
2. Add the `DATABASE_URL` variable
3. Run `npm run server` for backend
4. Run `npm run dev` for frontend

---

## 🛠️ Error Handling

All endpoints return errors in this format:

```json
{
  "success": false,
  "error": "Error message",
  "message": "Detailed error description"
}
```

Common HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request (missing parameters)
- `401` - Unauthorized (invalid credentials)
- `404` - Not Found
- `405` - Method Not Allowed
- `500` - Internal Server Error

---

## 📝 Notes

- All endpoints use **CORS** enabled for cross-origin requests
- Authentication uses **bcrypt** for password hashing
- Database connections use **connection pooling** for performance
- All endpoints support **OPTIONS** preflight requests
- Timestamps are in **ISO 8601 format**

---

## 🔗 Related Files

- `api/_db.js` - Shared database connection pool
- `config/database.js` - Local development database config
- `server.js` - Express server for local development
- `.env` - Environment variables (not in version control)

---

**Last Updated**: November 3, 2025
