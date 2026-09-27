# 🌿 EcoCollect — Waste Collection Management Platform
### FIT FEST 2026 — Solo Hackathon MVP

[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg)](https://opensource.org/licenses/MIT)
[![Node](https://img.shields.io/badge/Node.js-v18%2B-forest.svg)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-18.x-blue.svg)](https://react.dev)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-18-blue.svg)](https://www.postgresql.org)
[![Cloud Run](https://img.shields.io/badge/Deploy-Cloud%20Run-4285F4.svg)](https://cloud.google.com/run)

A complete, software-only civic waste management and collection platform engineered to connect citizens and municipal dispatch services for sustainable waste segregation, scheduled pickups, real-time lifecycle tracking, and administrative operations analytics.

---

## 📌 Problem & Civic Mission

1. **For Citizens**: Households often struggle with understanding proper waste disposal guidelines for different materials (hazardous, e-waste, bulky vs organic). Pickups are cumbersome to schedule and lack transparent status updates.
2. **For Collection Services**: Municipal crews and recyclers struggle to organize collection schedules, prioritize hazardous/bulky dispatches, and maintain visibility into neighborhood diversion rates.
3. **The Solution**: **EcoCollect** provides an intuitive, environmental civic portal where citizens select verified waste categories, review practical disposal protocols, schedule morning/afternoon/evening pickups, and track their pickup with a unique civic tracking code. Municipal administrators access a centralized dispatch console to filter requests, allocate crew/trucks, transition workflows, and inspect live diversion analytics.

---

## 🏗️ System Architecture & Workflow Diagrams

### 1. Citizen Request & Tracking Flow
```
┌─────────────────┐       ┌──────────────────────┐       ┌────────────────────────┐
│  Landing Page   │ ────> │  Select Waste Stream │ ────> │ Read Segregation Rules │
└─────────────────┘       └──────────────────────┘       └────────────────────────┘
                                                                      │
                                                                      ▼
┌─────────────────┐       ┌──────────────────────┐       ┌────────────────────────┐
│ Receive WC Code │ <──── │ Submit Request Modal │ <──── │ Enter Address & Slot   │
│  WC-2026-0001   │       └──────────────────────┘       └────────────────────────┘
         │
         ▼
┌────────────────────────────────────────────────────────────────────────┐
│  Track Request Lifecycle:                                              │
│  [✓ Request Submitted] ➔ [✓ Confirmed] ➔ [● Pickup Assigned] ➔ [○ Collected] │
└────────────────────────────────────────────────────────────────────────┘
         │
         ▼
┌────────────────────────────────────────────────────────────────────────┐
│  Pickup History (/history): Lookup all previous requests by phone      │
└────────────────────────────────────────────────────────────────────────┘
```

### 2. Municipal Admin Dispatch & Analytics Flow
```
┌────────────────────────────────────────────────────────────────────────┐
│  Administrative Portal (/admin)                                         │
│  - Total Collection Requests  - Pending Pickups                        │
│  - Today's Pickups            - Completed Collections                  │
└────────────────────────────────────────────────────────────────────────┘
         │
         ├──────────────────────────────┬──────────────────────────────┐
         ▼                              ▼                              ▼
┌──────────────────┐           ┌──────────────────┐           ┌──────────────────┐
│ Requests Dispatch│           │ Crew & Vehicle   │           │ Live Analytics   │
│ - Search by ID   │           │ Allocation       │           │ - Recharts Donut │
│ - Filter Status  │ ────>     │ - Assign Driver  │ ────>     │ - Pipeline Bar   │
│ - Filter Stream  │           │ - Dispatch Notes │           │ - Scheduled Area │
│ - Date Selector  │           │ - Audit Trail    │           │ - Diversion KPIs │
└──────────────────┘           └──────────────────┘           └──────────────────┘
```

---

## 🛠️ Technology Stack

| Layer | Technologies | Key Highlights |
| :--- | :--- | :--- |
| **Frontend** | React 18, Vite, Tailwind CSS, React Router v6, Axios, Lucide React, Recharts | Environmental civic palette, reactive toast alerts, zero mock data |
| **Backend** | Node.js, Express.js, Prisma ORM, CORS, Dotenv | RESTful API, audit logging, Cloud Run `0.0.0.0` port readiness |
| **Database** | PostgreSQL 18 | Relational schema (`WasteCategory`, `CollectionRequest`, `RequestStatusHistory`, `User`) |
| **Containerization**| Docker, Multi-stage builds, Nginx | Google Cloud Run and Docker Compose production-ready |

---

## 🎨 Civic Environmental Design System

The application deliberately incorporates a purpose-built civic theme rather than a generic corporate CRM:
- **Primary Green** (`#16A34A`): Action buttons, interactive highlights, timeline checkmarks.
- **Forest Dark** (`#166534`): Brand typography, civic headings, table headers.
- **Soft Mint** (`#DCFCE7`): Badge backgrounds, active category selection pills.
- **Civic Background** (`#F7FAF7`): Nature-inspired warm canvas.
- **Dark Charcoal** (`#172017`): High-contrast text, civic dark footer.
- **Status Accents**: Amber (Pending), Blue (Confirmed), Purple (Assigned), Emerald (Collected), Rose/Red (Cancelled / Hazardous).

---

## 🌟 Key Application Features

### 1. Landing Page (`/`)
- **Hero Section**: *"Smarter Waste Collection. Cleaner Communities."*
- **Problem Section**: *"Where does this waste go?"* with live database-rendered stream cards (Organic, Recyclable, Paper/Cardboard, E-Waste, Plastic, Bulky, Hazardous).
- **How It Works**:
  1. *Select Waste* — Identify disposal stream and safety guidelines.
  2. *Schedule Pickup* — Choose date and morning/afternoon/evening slot.
  3. *Track Collection* — Monitor civic dispatch step-by-step.
- **Built for Cleaner Communities** (4 Civic Pillars):
  - ♻️ *Responsible Disposal*
  - 📍 *Easy Pickup Scheduling*
  - 🔄 *Transparent Tracking*
  - 📊 *Organized Collection*
- **Call-to-Action**: Direct modal booking trigger *"Schedule a Pickup"*.

### 2. Citizen Request Booking Wizard
- Accessible via modal from any category card or header button.
- Step-by-step guidance:
  - Material stream verification with dynamic Segregation Tips.
  - Citizen name, phone number, and street address.
  - Date picker (today or future dates only) and preferred time window.
- Instant submission yielding a formatted tracking code: `WC-2026-XXXX`.

### 3. Real-Time Tracking (`/track`)
- Enter civic request number (e.g., `WC-2026-0001` or `WC-2026-0027`).
- Displays complete request specifications:
  - Waste Category
  - Pickup Location
  - Scheduled Date & Time
  - Assigned Collector / Truck
  - Current Status
- **Visual Status Timeline with Timestamps**:
  `✓ Request Submitted ➔ ✓ Confirmed ➔ ● Pickup Assigned ➔ ○ Collected`
- Displays exact audit notes recorded by dispatch admins at each milestone.

### 4. Dedicated Pickup History (`/history`)
- Citizen enters phone number to retrieve all past and active pickups.
- Summary cards display waste category icon, tracking number, pickup date, location, and status badges.
- Direct *"View Details"* button jumps straight to the visual tracker.

### 5. Administrative Dashboard (`/admin`)
- **Immediate Top Metric Cards**:
  - **Total Collection Requests**
  - **Pending Pickups**
  - **Today's Pickups**
  - **Completed Collections**
- **Dispatch Management**:
  - Filter by Status (`ALL`, `PENDING`, `CONFIRMED`, `ASSIGNED`, `COLLECTED`, `CANCELLED`).
  - Filter by Waste Stream dropdown.
  - Filter by specific date or live text search.
  - Detail Drawer: Transition statuses along strict state transitions, assign driver/crew (`EcoTruck #04`), and write dispatch notes recorded to `RequestStatusHistory`.
- **Collection Analytics (Recharts)**:
  - Waste Stream Distribution (Donut Chart)
  - Dispatch Workflow Pipeline (Bar Chart)
  - Scheduled Pickup Timeline (Area Chart)
  - Civic Environmental Diversion KPIs (Kg Diverted, Diversion Rate).

### 6. UX Polish & Micro-Interactions
- **Empty States**:
  *"No pickup requests yet. Schedule your first collection and help keep your community clean."*
- **Loading States**:
  *"Loading collection requests..."*
- **Error States**:
  *"We couldn't load your requests. Please try again."*
- **Toast Notifications**: Interactive toast alerts for booking submission, copy-to-clipboard, status updates, and network errors.

---

## 📡 REST API Documentation

### Base URL: `http://localhost:5001` (or Cloud Run URL)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Service health check |
| `GET` | `/api/waste-categories` | List all 7 standard waste categories |
| `GET` | `/api/waste-categories/:id` | Single waste category details |
| `POST` | `/api/requests` | Create new collection request |
| `GET` | `/api/requests/track/:code` | Track request by request number (`WC-2026-XXXX`) |
| `GET` | `/api/requests/user/:phone` | Citizen pickup history by mobile phone |
| `GET` | `/api/requests/:id/history` | Audit trail of status transitions for a request |
| `GET` | `/api/admin/requests` | Admin requests list with filters and search |
| `PATCH` | `/api/admin/requests/:id/status` | Update status, collector name, and notes |
| `GET` | `/api/admin/stats` | Fast numeric counts for the 4 dashboard KPI cards |
| `GET` | `/api/admin/analytics` | Aggregated stream metrics and diversion rates |

### Example cURL Commands

#### Health Check
```bash
curl -X GET http://localhost:5001/api/health
```
**Response:**
```json
{
  "status": "ok",
  "service": "waste-collection-api"
}
```

#### Submit Pickup Request
```bash
curl -X POST http://localhost:5001/api/requests \
  -H "Content-Type: application/json" \
  -d '{
    "categoryId": "a638fba8-e722-413c-8a98-eb774928e56d",
    "citizenName": "Priya Sharma",
    "citizenPhone": "9876543210",
    "pickupAddress": "Flat 402, Green Meadows, Kothrud",
    "pickupCity": "Pune",
    "preferredDate": "2026-10-01",
    "preferredTime": "Morning (08:00 AM - 11:00 AM)",
    "notes": "Cardboard boxes and glass bottles segregated"
  }'
```
**Response (201 Created):**
```json
{
  "success": true,
  "message": "Collection request scheduled successfully.",
  "data": {
    "id": "e0b0cf79-e582-4211-a836-7c1ec02a0a26",
    "requestNumber": "WC-2026-0028",
    "status": "PENDING",
    "citizenName": "Priya Sharma",
    "citizenPhone": "9876543210",
    "preferredDate": "2026-10-01",
    "preferredTime": "Morning (08:00 AM - 11:00 AM)"
  }
}
```

#### Track Request by Code
```bash
curl -X GET http://localhost:5001/api/requests/track/WC-2026-0028
```

#### Lookup Pickup History by Phone
```bash
curl -X GET http://localhost:5001/api/requests/user/9876543210
```

#### Admin Stats Endpoint
```bash
curl -X GET http://localhost:5001/api/admin/stats
```
**Response:**
```json
{
  "success": true,
  "data": {
    "total": 8,
    "pending": 2,
    "today": 3,
    "completed": 2,
    "totalRequests": 8,
    "pendingRequests": 2,
    "todayPickups": 3,
    "completedCollections": 2
  }
}
```

---

## ⚡ Local Setup & Development

### Prerequisites
- **Node.js** (v18.x or v20.x recommended)
- **npm** (v9+ or v10+)
- **PostgreSQL 16+** running on `localhost:5432`

### 1. Database Configuration
Ensure PostgreSQL is active. In your PostgreSQL shell or GUI:
```sql
CREATE DATABASE waste_management_db;
```

### 2. Backend Installation & Migration
```bash
cd backend
npm install

# Verify your .env connection string:
# DATABASE_URL="postgresql://postgres:password@localhost:5432/waste_management_db?schema=public"
# PORT=5001

# Push Prisma schema to create tables
npx prisma db push

# Seed categories and sample requests
node prisma/seed.js

# Start backend server
npm start
```
*Backend will be running at `http://localhost:5001`.*

### 3. Frontend Installation & Startup
```bash
cd ../frontend
npm install

# Launch Vite development server
npm run dev
```
*Frontend will be running at `http://localhost:5173`.*

---

## ☁️ Google Cloud Run Deployment

Both services feature production-grade multi-stage Dockerfiles designed for Google Cloud Run containerized deployment.

### 1. Deploying the Backend Container
```bash
cd backend

# Build and tag image with Google Cloud Build
gcloud builds submit --tag gcr.io/[PROJECT_ID]/ecocollect-backend

# Deploy service to Cloud Run
gcloud run deploy ecocollect-backend \
  --image gcr.io/[PROJECT_ID]/ecocollect-backend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars DATABASE_URL="postgresql://user:password@[CLOUD_SQL_IP]:5432/waste_management_db?schema=public",NODE_ENV="production"
```

### 2. Deploying the Frontend Container
```bash
cd ../frontend

# Build and tag Nginx-based frontend container
gcloud builds submit --tag gcr.io/[PROJECT_ID]/ecocollect-frontend

# Deploy service to Cloud Run
gcloud run deploy ecocollect-frontend \
  --image gcr.io/[PROJECT_ID]/ecocollect-frontend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

---

## 🐳 Docker Compose (Unified Local Stack)

To run the complete ecosystem in isolated Docker containers:
```bash
docker-compose up --build
```
- Frontend UI: `http://localhost`
- Backend API: `http://localhost:5001`
- PostgreSQL: `localhost:5432`

---

## 🏆 FIT FEST 2026 Solo Hackathon Verification Checklist

- [x] **Phase 1: Foundation & Waste Categories**
  - PostgreSQL database initialized with Prisma ORM.
  - 7 standard categories seeded with segregation guidelines.
  - Express API initialized with health check `{"status":"ok","service":"waste-collection-api"}`.
  - Responsive civic landing page with Hero, "Where does this waste go?", "How it works", 4 pillars, and CTA.
- [x] **Phase 2: Citizen Request Flow**
  - Multi-step modal booking wizard with instant tracking code generation (`WC-2026-XXXX`).
  - Date and time slot validation with address capturing.
- [x] **Phase 3: Tracking & Pickup History**
  - `/track` route with visual timeline (`✓ Request Submitted ➔ ✓ Confirmed ➔ ● Pickup Assigned ➔ ○ Collected`).
  - `/history` route with phone number lookup and request history cards.
  - Relational `RequestStatusHistory` audit table logging old status, new status, timestamp, and notes.
- [x] **Phase 4: Administrative Dashboard**
  - 4 immediate KPI cards: *Total Collection Requests*, *Pending Pickups*, *Today's Pickups*, *Completed Collections*.
  - Search, status filtering, category filtering, driver allocation, and dispatch notes.
- [x] **Phase 5: Analytics & Polish**
  - Recharts Donut, Bar, and Area charts for live municipal diversion metrics.
  - Exact empty, loading, and error states across all pages.
  - Reactive toast notification system.
  - Clean Vite production build with zero warnings or errors.
  - Multi-stage Dockerfiles and Cloud Run readiness.
