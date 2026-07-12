# 🚛 TransitOps — Smart Fleet & Transport Operations Platform

> **Odoo Hackathon 2026 Submission**  
> Full-stack fleet management system for real-time trip lifecycle, vehicle maintenance tracking, financial analytics, and role-based operations.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Database Schema](#database-schema)
- [API Endpoints](#api-endpoints)
- [Role-Based Access](#role-based-access)
- [Default Credentials](#default-credentials)
- [Business Rules](#business-rules)
- [Screenshots](#screenshots)
- [Team](#team)

---

## Overview

**TransitOps** is an end-to-end fleet and transport operations platform built for logistics companies to manage their vehicles, drivers, trips, maintenance schedules, and financial performance — all from a single dashboard.

The application enforces strict business rules such as preventing double-booking of vehicles/drivers, validating cargo capacity, automating vehicle status transitions during trip dispatch and maintenance, and providing real-time ROI analytics per vehicle.

---

## Features

### 🔐 Shared Core — Authentication & Authorization
- JWT-based authentication with secure password hashing (bcrypt)
- Role-Based Access Control (RBAC) with 4 user roles
- Protected routes on both frontend and backend
- Auto-logout on token expiry with interceptor-based handling

### 🛤️ Operations Module — Trip Management
- Full trip lifecycle: **Draft → Dispatched → Completed / Cancelled**
- Create trips with vehicle, driver, cargo weight, and route details
- Dispatch with atomic row-level locking (prevents double-booking)
- Complete trips with actual distance and fuel log auto-creation
- Cancel dispatched trips with automatic status restoration

### 🚛 Fleet Module — Vehicle & Driver Management
- CRUD operations for vehicles (registration, type, capacity, odometer, region)
- CRUD operations for drivers (license info, safety score, contact details)
- Status filtering (Available, On Trip, In Shop, Retired / Suspended)
- Region-based vehicle search
- Deletion guards — cannot delete vehicles/drivers with active trips

### 🔧 Operations Module — Maintenance
- Create maintenance records that automatically set vehicle status to "In Shop"
- Close maintenance records to restore vehicle to "Available"
- Track maintenance type, description, and cost per vehicle
- Filter by Open / Closed status

### 💰 Operations Module — Finance
- Log fuel consumption per vehicle (optionally linked to trips)
- Track operational expenses by category (Toll, Maintenance, Other)
- Per-vehicle cost summary with ROI calculation
- Fuel efficiency metrics (km/L)

### 📊 Analytics Module — Dashboard & Reports
- Executive dashboard with revenue, cost, net profit, and ROI cards
- Monthly revenue vs. cost bar charts (custom CSS — no charting library)
- Vehicle performance report table with fuel efficiency and ROI per vehicle
- CSV export of the full fleet performance report
- Active vehicle count and open maintenance job counters

---

## Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| **React 18** | UI framework |
| **TypeScript** | Type safety |
| **Vite** | Build tool & dev server |
| **React Router v6** | Client-side routing |
| **TanStack React Query** | Server state management |
| **Axios** | HTTP client with interceptors |
| **Tailwind CSS 3** | Utility-first styling |
| **Lucide React** | Icon library |
| **Zod** | Schema validation |

### Backend
| Technology | Purpose |
|---|---|
| **Node.js + Express** | REST API server |
| **TypeScript** | Type safety |
| **Prisma ORM** | Database access & migrations |
| **PostgreSQL** | Relational database |
| **JSON Web Tokens** | Authentication |
| **bcryptjs** | Password hashing |
| **Zod** | Request validation |

---

## Project Structure

```
operation/
├── client/                          # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── AppShell.tsx        # Main layout wrapper
│   │   │   │   ├── ProtectedRoute.tsx  # Auth & role guard
│   │   │   │   └── Sidebar.tsx         # Navigation sidebar
│   │   │   └── shared/
│   │   │       ├── EmptyState.tsx      # Empty list placeholder
│   │   │       ├── PageHeader.tsx      # Page title component
│   │   │       └── StatusBadge.tsx     # Color-coded status pills
│   │   ├── hooks/
│   │   │   ├── useAnalytics.ts        # Analytics query hooks
│   │   │   ├── useFinance.ts          # Finance query hooks
│   │   │   ├── useFleet.ts            # Fleet CRUD hooks
│   │   │   ├── useMaintenance.ts      # Maintenance query hooks
│   │   │   └── useTrips.ts            # Trip lifecycle hooks
│   │   ├── lib/
│   │   │   ├── api.ts                 # Axios instance + helpers
│   │   │   ├── auth.tsx               # AuthContext & provider
│   │   │   ├── queryClient.ts         # React Query client
│   │   │   └── utils.ts               # cn() utility
│   │   ├── pages/
│   │   │   ├── LoginPage.tsx
│   │   │   ├── analytics/
│   │   │   │   └── AnalyticsPage.tsx
│   │   │   ├── finance/
│   │   │   │   └── FinancePage.tsx
│   │   │   ├── fleet/
│   │   │   │   ├── DriversPage.tsx
│   │   │   │   └── VehiclesPage.tsx
│   │   │   ├── maintenance/
│   │   │   │   ├── CreateMaintenancePage.tsx
│   │   │   │   └── MaintenancePage.tsx
│   │   │   └── trips/
│   │   │       ├── CreateTripPage.tsx
│   │   │       ├── TripDetailPage.tsx
│   │   │       └── TripsPage.tsx
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── tsconfig.json
│   └── vite.config.ts
│
├── server/                          # Express backend
│   ├── prisma/
│   │   ├── schema.prisma              # Database schema
│   │   └── seed.ts                    # Seed script
│   ├── src/
│   │   ├── auth/
│   │   │   ├── auth.routes.ts
│   │   │   ├── auth.schema.ts
│   │   │   └── auth.service.ts
│   │   ├── trips/
│   │   │   ├── trip.routes.ts
│   │   │   ├── trip.schema.ts
│   │   │   └── trip.service.ts
│   │   ├── maintenance/
│   │   │   ├── maintenance.routes.ts
│   │   │   ├── maintenance.schema.ts
│   │   │   └── maintenance.service.ts
│   │   ├── finance/
│   │   │   ├── finance.routes.ts
│   │   │   ├── finance.schema.ts
│   │   │   └── finance.service.ts
│   │   ├── fleet/
│   │   │   ├── fleet.routes.ts
│   │   │   ├── fleet.schema.ts
│   │   │   └── fleet.service.ts
│   │   ├── analytics/
│   │   │   ├── analytics.routes.ts
│   │   │   └── analytics.service.ts
│   │   ├── middleware/
│   │   │   ├── requireAuth.ts
│   │   │   └── requireRole.ts
│   │   ├── shared/
│   │   │   ├── errors.ts
│   │   │   ├── prisma.ts
│   │   │   ├── response.ts
│   │   │   └── validate.ts
│   │   └── index.ts                   # Express app entry
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env
│   └── .env.example
│
└── .gitignore
```

---

## Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **PostgreSQL** ≥ 14 (running locally or a cloud instance)
- **npm** ≥ 9

### 1. Clone the Repository

```bash
git clone https://github.com/DarshanDabhi703/Odoo-Hackathon-2026.git
cd operation
```

### 2. Setup the Backend

```bash
cd server

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your PostgreSQL connection string and a strong JWT_SECRET

# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Seed default users
npm run db:seed

# Start development server (port 3001)
npm run dev
```

### 3. Setup the Frontend

```bash
cd client

# Install dependencies
npm install

# Start development server (port 5173)
npm run dev
```

### 4. Open the App

Navigate to **http://localhost:5173** in your browser.

---

## Database Schema

```
┌─────────────┐     ┌──────────────┐     ┌──────────────┐
│    Users     │     │   Vehicles   │────▶│    Trips      │
│              │     │              │     │              │
│ id           │     │ id           │     │ id           │
│ name         │     │ regNumber    │     │ source       │
│ email        │     │ name         │     │ destination  │
│ passwordHash │     │ type         │     │ vehicleId    │
│ role         │     │ maxLoadKg    │     │ driverId     │
│ createdAt    │     │ odometer     │     │ cargoWeight  │
└─────────────┘     │ acqCost      │     │ distance     │
                    │ status       │     │ revenue      │
┌─────────────┐     │ region       │     │ status       │
│   Drivers    │     └──────┬───────┘     └──────┬───────┘
│              │            │                    │
│ id           │────────────┼────────────────────┘
│ name         │            │
│ licenseNo    │     ┌──────┴───────┐     ┌──────────────┐
│ category     │     │ Maintenance  │     │  Fuel Logs   │
│ licExpiry    │     │    Logs      │     │              │
│ contactNo    │     │              │     │ id           │
│ safetyScore  │     │ id           │     │ vehicleId    │
│ status       │     │ vehicleId    │     │ tripId       │
└─────────────┘     │ type         │     │ liters       │
                    │ cost         │     │ cost         │
                    │ status       │     │ logDate      │
                    └──────────────┘     └──────────────┘

                    ┌──────────────┐
                    │   Expenses   │
                    │              │
                    │ id           │
                    │ vehicleId    │
                    │ category     │
                    │ amount       │
                    │ expenseDate  │
                    │ notes        │
                    └──────────────┘
```

---

## API Endpoints

### Auth
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/api/auth/login` | Login & receive JWT | ❌ |
| `POST` | `/api/auth/register` | Register new user | ❌ |
| `GET` | `/api/auth/me` | Get current user | ✅ |

### Trips
| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| `GET` | `/api/trips` | List trips (filterable) | FleetManager, Driver |
| `GET` | `/api/trips/:id` | Get trip details | FleetManager, Driver |
| `POST` | `/api/trips` | Create draft trip | FleetManager, Driver |
| `PATCH` | `/api/trips/:id/dispatch` | Dispatch trip | FleetManager |
| `PATCH` | `/api/trips/:id/complete` | Complete trip | FleetManager, Driver |
| `PATCH` | `/api/trips/:id/cancel` | Cancel trip | FleetManager |

### Vehicles
| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| `GET` | `/api/vehicles` | List all vehicles | All authenticated |
| `GET` | `/api/vehicles/:id` | Get vehicle by ID | All authenticated |
| `POST` | `/api/vehicles` | Create vehicle | FleetManager |
| `PATCH` | `/api/vehicles/:id` | Update vehicle | FleetManager |
| `DELETE` | `/api/vehicles/:id` | Delete vehicle | FleetManager |

### Drivers
| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| `GET` | `/api/drivers` | List all drivers | All authenticated |
| `GET` | `/api/drivers/:id` | Get driver by ID | All authenticated |
| `POST` | `/api/drivers` | Create driver | FleetManager |
| `PATCH` | `/api/drivers/:id` | Update driver | FleetManager |
| `DELETE` | `/api/drivers/:id` | Delete driver | FleetManager |

### Maintenance
| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| `GET` | `/api/maintenance` | List logs (filterable) | FleetManager, SafetyOfficer |
| `POST` | `/api/maintenance` | Create log (→ In Shop) | FleetManager |
| `PATCH` | `/api/maintenance/:id/close` | Close log (→ Available) | FleetManager |

### Finance
| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| `GET` | `/api/fuel-logs` | List fuel logs | All authenticated |
| `POST` | `/api/fuel-logs` | Add fuel log | FleetManager, Driver |
| `GET` | `/api/expenses` | List expenses | All authenticated |
| `POST` | `/api/expenses` | Add expense | FleetManager |
| `GET` | `/api/vehicles/:id/cost-summary` | Vehicle cost & ROI | FleetManager, FinancialAnalyst |

### Analytics
| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| `GET` | `/api/analytics/overview` | Dashboard metrics | All authenticated |
| `GET` | `/api/analytics/charts` | Monthly revenue vs cost | All authenticated |
| `GET` | `/api/analytics/reports` | Vehicle performance table | FleetManager, FinancialAnalyst |
| `GET` | `/api/analytics/export` | Download CSV report | FleetManager, FinancialAnalyst |

---

## Role-Based Access

| Feature | FleetManager | Driver | SafetyOfficer | FinancialAnalyst |
|---------|:---:|:---:|:---:|:---:|
| Trips — View & Create | ✅ | ✅ | ❌ | ❌ |
| Trips — Dispatch / Cancel | ✅ | ❌ | ❌ | ❌ |
| Vehicles — View | ✅ | ✅ | ✅ | ✅ |
| Vehicles — CRUD | ✅ | ❌ | ❌ | ❌ |
| Drivers — View | ✅ | ❌ | ✅ | ✅ |
| Drivers — CRUD | ✅ | ❌ | ❌ | ❌ |
| Maintenance | ✅ | ❌ | ✅ | ❌ |
| Finance — Fuel Logs | ✅ | ✅ | ❌ | ✅ |
| Finance — Expenses | ✅ | ❌ | ❌ | ✅ |
| Analytics | ✅ | ❌ | ❌ | ✅ |
| CSV Export | ✅ | ❌ | ❌ | ✅ |

---

## Default Credentials

After running `npm run db:seed`, the following accounts are available:

| Email | Password | Role |
|-------|----------|------|
| `fleet@transitops.com` | `password123` | Fleet Manager |
| `driver@transitops.com` | `password123` | Driver |
| `safety@transitops.com` | `password123` | Safety Officer |
| `finance@transitops.com` | `password123` | Financial Analyst |

> ⚠️ **Change the default password and JWT_SECRET before deploying to production.**

---

## Business Rules

| ID | Rule | Enforcement |
|----|------|-------------|
| BR-1 | Unique vehicle registration numbers | DB unique constraint + service validation |
| BR-2 | Retired / In Shop vehicles cannot be dispatched | Checked at dispatch with row lock |
| BR-3 | Expired or suspended drivers cannot be assigned | Checked at dispatch |
| BR-4 | No double-booking of vehicles or drivers | `SELECT ... FOR UPDATE` row-level locks |
| BR-5 | Cargo weight ≤ vehicle max load capacity | Validated at dispatch |
| BR-6 | Dispatch → vehicle & driver status become "On Trip" | Atomic transaction |
| BR-7 | Complete → vehicle & driver restored to "Available" | Atomic transaction |
| BR-8 | Cancel (from Dispatched) → restore "Available" | Atomic transaction |
| BR-9 | Creating maintenance → vehicle becomes "In Shop" | Service side-effect |
| BR-10 | Closing maintenance → vehicle becomes "Available" | Service side-effect |

---

## Screenshots

### Login
![Login Page](docs/screenshots/login.png)

### Trip Management
![Trips Dashboard](docs/screenshots/trips.png)

### Fleet — Vehicles
![Vehicles](docs/screenshots/vehicles.png)

### Fleet — Drivers
![Drivers](docs/screenshots/drivers.png)

### Maintenance Tracking
![Maintenance](docs/screenshots/maintenance.png)

### Finance — Fuel & Expenses
![Finance](docs/screenshots/finance.png)

### Analytics Dashboard
![Analytics](docs/screenshots/analytics.png)

---

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://postgres:password@localhost:5432/transitops` |
| `JWT_SECRET` | Secret key for JWT signing | (set your own) |
| `JWT_EXPIRY` | Token expiration time | `8h` |
| `PORT` | Backend server port | `3001` |
| `NODE_ENV` | Environment mode | `development` |
| `CLIENT_ORIGIN` | Allowed CORS origin | `http://localhost:5173` |

---

## Scripts Reference

### Server (`/server`)
```bash
npm run dev          # Start dev server with hot-reload (tsx watch)
npm run build        # Compile TypeScript to dist/
npm start            # Run compiled production build
npm run db:generate  # Generate Prisma client
npm run db:push      # Push schema to database
npm run db:migrate   # Run Prisma migrations
npm run db:seed      # Seed default users
npm run db:studio    # Open Prisma Studio GUI
```

### Client (`/client`)
```bash
npm run dev          # Start Vite dev server (port 5173)
npm run build        # Type-check + production build
npm run preview      # Preview production build locally
```

---

## License

This project was built for the **Odoo Hackathon 2026**.

---

<p align="center">
  Built with ❤️ by <strong>Team TransitOps</strong>
</p>
