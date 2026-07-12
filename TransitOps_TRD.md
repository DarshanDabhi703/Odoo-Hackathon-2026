# Technical Requirements Document (TRD)
## TransitOps — Smart Transport Operations Platform

| | |
|---|---|
| **Document Owner** | Engineering Team |
| **Status** | Draft |
| **Version** | 1.0 |
| **Related Docs** | TransitOps_PRD.md, TransitOps_Build_Document.md, TransitOps_Build_Guide.md |

---

## 1. Purpose

This document specifies the technical implementation of TransitOps: system architecture, data model, API contracts, business-rule enforcement logic, security, and non-functional targets. It translates the PRD's functional requirements into buildable engineering specifications.

---

## 2. System Architecture

### 2.1 High-Level Architecture

```
┌─────────────────┐        HTTPS/JSON        ┌──────────────────┐        SQL         ┌──────────────┐
│   React SPA      │ ───────────────────────▶ │  Express API      │ ─────────────────▶ │  PostgreSQL   │
│  (Vite, Tailwind, │ ◀─────────────────────── │  (Node.js)         │ ◀───────────────── │              │
│   shadcn/ui)      │      JWT in header        │  + Prisma ORM      │                     │              │
└─────────────────┘                            └──────────────────┘                     └──────────────┘
                                                        │
                                                        ▼
                                              Business Rule / Service Layer
                                              (TripService, MaintenanceService,
                                               ReportService)
```

- **Single deployable backend service** — no microservices, no message queue, for MVP/hackathon scope.
- **Stateless API** — auth via JWT, no server-side session store.
- **Service layer isolation** — all business rules live in service modules, never in route handlers, so they're independently testable.

### 2.2 Component Breakdown

| Component | Responsibility |
|---|---|
| `auth` module | Login, password hashing/verification, JWT issuance |
| `middleware/requireAuth` | Verifies JWT, attaches `req.user` |
| `middleware/requireRole` | Checks `req.user.role` against an allowed-roles list |
| `VehicleService` | Vehicle CRUD, availability filtering |
| `DriverService` | Driver CRUD, availability filtering, license/status checks |
| `TripService` | Trip lifecycle state machine + all dispatch validation |
| `MaintenanceService` | Maintenance record lifecycle, vehicle status side-effects |
| `FinanceService` | Fuel logs, expenses, cost aggregation |
| `ReportService` | KPI computation, fuel efficiency, utilization, ROI, CSV export |

---

## 3. Data Model

### 3.1 Entity-Relationship Summary

```
User (role) ──< creates >── Trip
Vehicle ──< 1:N >── Trip
Driver  ──< 1:N >── Trip
Vehicle ──< 1:N >── MaintenanceLog
Vehicle ──< 1:N >── FuelLog ──> optional FK to Trip
Vehicle ──< 1:N >── Expense
```

### 3.2 Schema (Prisma-style / SQL DDL)

```sql
CREATE TYPE user_role AS ENUM ('FleetManager','Driver','SafetyOfficer','FinancialAnalyst');
CREATE TYPE vehicle_status AS ENUM ('Available','On Trip','In Shop','Retired');
CREATE TYPE driver_status AS ENUM ('Available','On Trip','Off Duty','Suspended');
CREATE TYPE trip_status AS ENUM ('Draft','Dispatched','Completed','Cancelled');
CREATE TYPE maintenance_status AS ENUM ('Open','Closed');
CREATE TYPE expense_category AS ENUM ('Toll','Maintenance','Other');

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role user_role NOT NULL,
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reg_number TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  max_load_kg NUMERIC NOT NULL CHECK (max_load_kg > 0),
  odometer NUMERIC DEFAULT 0,
  acquisition_cost NUMERIC NOT NULL,
  status vehicle_status NOT NULL DEFAULT 'Available',
  region TEXT,
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE drivers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  license_number TEXT UNIQUE NOT NULL,
  license_category TEXT NOT NULL,
  license_expiry DATE NOT NULL,
  contact_number TEXT,
  safety_score NUMERIC DEFAULT 100,
  status driver_status NOT NULL DEFAULT 'Available',
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE trips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source TEXT NOT NULL,
  destination TEXT NOT NULL,
  vehicle_id UUID NOT NULL REFERENCES vehicles(id),
  driver_id UUID NOT NULL REFERENCES drivers(id),
  cargo_weight NUMERIC NOT NULL,
  planned_distance NUMERIC NOT NULL,
  actual_distance NUMERIC,
  revenue NUMERIC DEFAULT 0,
  status trip_status NOT NULL DEFAULT 'Draft',
  created_at TIMESTAMP DEFAULT now(),
  dispatched_at TIMESTAMP,
  completed_at TIMESTAMP
);
CREATE INDEX idx_trips_status ON trips(status);
CREATE INDEX idx_trips_vehicle ON trips(vehicle_id);
CREATE INDEX idx_trips_driver ON trips(driver_id);

CREATE TABLE maintenance_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id UUID NOT NULL REFERENCES vehicles(id),
  type TEXT NOT NULL,
  description TEXT,
  cost NUMERIC DEFAULT 0,
  status maintenance_status NOT NULL DEFAULT 'Open',
  created_at TIMESTAMP DEFAULT now(),
  closed_at TIMESTAMP
);
CREATE INDEX idx_maintenance_vehicle ON maintenance_logs(vehicle_id);

CREATE TABLE fuel_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id UUID NOT NULL REFERENCES vehicles(id),
  trip_id UUID REFERENCES trips(id),
  liters NUMERIC NOT NULL CHECK (liters > 0),
  cost NUMERIC NOT NULL CHECK (cost >= 0),
  log_date DATE NOT NULL
);
CREATE INDEX idx_fuel_vehicle ON fuel_logs(vehicle_id);

CREATE TABLE expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id UUID NOT NULL REFERENCES vehicles(id),
  category expense_category NOT NULL,
  amount NUMERIC NOT NULL CHECK (amount >= 0),
  expense_date DATE NOT NULL,
  notes TEXT
);
CREATE INDEX idx_expenses_vehicle ON expenses(vehicle_id);
```

### 3.3 Derived/Computed Fields (not stored, computed at query time)
- `vehicle.total_operational_cost` = SUM(fuel_logs.cost) + SUM(maintenance_logs.cost) WHERE vehicle_id = X
- `vehicle.fuel_efficiency` = SUM(trips.actual_distance) / SUM(fuel_logs.liters) WHERE vehicle_id = X
- `vehicle.roi` = (SUM(trips.revenue) − vehicle.total_operational_cost) / vehicle.acquisition_cost
- `fleet_utilization_pct` = COUNT(vehicles WHERE status = 'On Trip') / COUNT(vehicles WHERE status != 'Retired') × 100

---

## 4. API Specification

### 4.1 Conventions
- Base path: `/api`
- Auth: `Authorization: Bearer <JWT>` header on all routes except `/auth/login`
- Response envelope: `{ data, error }` — `error` is `null` on success with a machine-readable `code` and human-readable `message` on failure
- All mutating endpoints validate server-side regardless of client state

### 4.2 Endpoint List

| Method | Path | Roles Allowed | Notes |
|---|---|---|---|
| POST | `/auth/login` | Public | Returns JWT |
| POST | `/auth/register` | FleetManager, SafetyOfficer | Creates a user |
| GET | `/vehicles` | All (read) | Query params: status, type, region |
| GET | `/vehicles/available` | All (read) | Excludes Retired/In Shop/On Trip |
| POST | `/vehicles` | FleetManager | Enforces unique reg_number |
| PATCH | `/vehicles/:id` | FleetManager | Status/field updates |
| GET | `/drivers` | All (read) | Query params: status |
| GET | `/drivers/available` | All (read) | Excludes Suspended/expired/On Trip |
| POST | `/drivers` | SafetyOfficer | Enforces unique license_number |
| PATCH | `/drivers/:id` | SafetyOfficer | Status/field updates |
| POST | `/trips` | FleetManager, Driver | Creates Draft trip |
| POST | `/trips/:id/dispatch` | FleetManager, Driver | Runs full validation chain |
| POST | `/trips/:id/complete` | FleetManager, Driver | Requires final odometer, fuel |
| POST | `/trips/:id/cancel` | FleetManager, Driver | Only valid from Dispatched |
| GET | `/trips` | All (read, scoped) | Query params: status |
| POST | `/maintenance` | FleetManager | Sets vehicle to In Shop |
| POST | `/maintenance/:id/close` | FleetManager | Restores vehicle unless Retired |
| POST | `/fuel-logs` | FleetManager, Driver | |
| POST | `/expenses` | FleetManager | |
| GET | `/dashboard/kpis` | All (read) | Query params: type, status, region |
| GET | `/reports/fuel-efficiency` | FleetManager, FinancialAnalyst | |
| GET | `/reports/utilization` | FleetManager, FinancialAnalyst | |
| GET | `/reports/operational-cost` | FleetManager, FinancialAnalyst | |
| GET | `/reports/roi` | FleetManager, FinancialAnalyst | |
| GET | `/reports/export.csv` | FleetManager, FinancialAnalyst | |

### 4.3 Example Contract — Dispatch

**Request**
```
POST /api/trips/:id/dispatch
Authorization: Bearer <JWT>
```

**Success (200)**
```json
{
  "data": {
    "trip": { "id": "...", "status": "Dispatched", "dispatched_at": "2026-07-12T10:00:00Z" },
    "vehicle": { "id": "...", "status": "On Trip" },
    "driver": { "id": "...", "status": "On Trip" }
  },
  "error": null
}
```

**Failure (422) — business rule violation**
```json
{
  "data": null,
  "error": {
    "code": "CARGO_EXCEEDS_CAPACITY",
    "message": "Cargo weight 620kg exceeds vehicle max load 500kg."
  }
}
```

Standard error codes: `DUPLICATE_REG_NUMBER`, `VEHICLE_NOT_AVAILABLE`, `DRIVER_NOT_AVAILABLE`, `DRIVER_LICENSE_EXPIRED`, `DRIVER_SUSPENDED`, `CARGO_EXCEEDS_CAPACITY`, `INVALID_STATUS_TRANSITION`, `UNAUTHORIZED_ROLE`.

---

## 5. Business Rule Enforcement — Sequence Logic

### 5.1 `TripService.dispatch(tripId, userId)` — pseudocode

```
BEGIN TRANSACTION
  trip = SELECT trip FOR UPDATE WHERE id = tripId
  IF trip.status != 'Draft': ABORT with INVALID_STATUS_TRANSITION

  vehicle = SELECT vehicle FOR UPDATE WHERE id = trip.vehicle_id
  IF vehicle.status != 'Available': ABORT with VEHICLE_NOT_AVAILABLE

  driver = SELECT driver FOR UPDATE WHERE id = trip.driver_id
  IF driver.status != 'Available': ABORT with DRIVER_NOT_AVAILABLE
  IF driver.license_expiry < CURRENT_DATE: ABORT with DRIVER_LICENSE_EXPIRED
  IF driver.status == 'Suspended': ABORT with DRIVER_SUSPENDED

  IF trip.cargo_weight > vehicle.max_load_kg: ABORT with CARGO_EXCEEDS_CAPACITY

  UPDATE trip SET status = 'Dispatched', dispatched_at = now()
  UPDATE vehicle SET status = 'On Trip'
  UPDATE driver SET status = 'On Trip'
COMMIT
```

`SELECT ... FOR UPDATE` row locks are used to prevent two concurrent dispatch requests from double-assigning the same vehicle/driver — this is the concrete mechanism behind BR-4 under concurrent load.

### 5.2 `MaintenanceService.create` / `.close` — pseudocode

```
create(vehicleId, details):
  BEGIN TRANSACTION
    INSERT INTO maintenance_logs (...) status = 'Open'
    UPDATE vehicles SET status = 'In Shop' WHERE id = vehicleId
  COMMIT

close(logId):
  BEGIN TRANSACTION
    log = SELECT maintenance_logs WHERE id = logId
    UPDATE maintenance_logs SET status = 'Closed', closed_at = now() WHERE id = logId
    vehicle = SELECT vehicles FOR UPDATE WHERE id = log.vehicle_id
    IF vehicle.status != 'Retired':
      UPDATE vehicles SET status = 'Available' WHERE id = log.vehicle_id
  COMMIT
```

---

## 6. Security

| Concern | Implementation |
|---|---|
| Password storage | bcrypt, cost factor ≥ 10 |
| Auth tokens | JWT, short expiry (e.g., 8h), signed with server secret from env var |
| Transport | HTTPS enforced in production |
| Authorization | Role check middleware on every protected route; never rely on frontend hiding of UI elements |
| Input validation | Schema validation (e.g., Zod/Joi) on every request body before it reaches the service layer |
| SQL injection | Prevented via Prisma parameterized queries; no raw string concatenation |
| Secrets | DB credentials, JWT secret via environment variables, never committed to source |

---

## 7. Non-Functional Requirements

| Category | Target |
|---|---|
| Availability | Single-instance acceptable for MVP/demo; no HA requirement |
| Consistency | Strong consistency for all status transitions (single Postgres instance, transactional writes) |
| Latency | Dashboard/report endpoints should respond in-line with typical REST API expectations for the dataset size involved (no specific SLA defined for MVP) |
| Scalability | Not a primary requirement for MVP; schema/indexes chosen to keep common queries (status filters, vehicle/driver lookups) efficient as data grows |
| Browser support | Modern evergreen browsers (Chrome, Edge, Firefox, Safari), responsive down to mobile widths |

---

## 8. Testing Strategy

| Layer | Approach |
|---|---|
| Unit | Service-layer functions (`TripService`, `MaintenanceService`) tested in isolation against each business rule (BR-1 through BR-10) with both pass and fail cases |
| Integration | API-level tests hitting real endpoints against a test database, covering the full trip lifecycle end-to-end |
| Manual/Acceptance | The example scenario in the PRD (Van-05 / Alex, 450kg) run manually as a smoke test before demo |
| Concurrency | Manual or scripted test firing two simultaneous dispatch requests against the same vehicle/driver to confirm row-locking prevents double-assignment |

---

## 9. Deployment

| Environment | Target |
|---|---|
| Frontend | Vercel (or Netlify) — static build from Vite |
| Backend | Render or Railway — Node process with environment-configured DB connection |
| Database | Managed Postgres (Railway, Neon, or Supabase) |
| CI | On push to main: run lint + tests, then auto-deploy both frontend and backend |

**Environment variables required:** `DATABASE_URL`, `JWT_SECRET`, `JWT_EXPIRY`, `PORT`, frontend `VITE_API_BASE_URL`.

---

## 10. Open Technical Questions

- Should `revenue` be entered manually per trip, or computed from a rate table (distance × rate/km, possibly varying by vehicle type)? Affects both schema and ROI report accuracy.
- Should `safety_score` be manually editable by the Safety Officer, or derived from trip/incident history? Current schema treats it as a manually editable numeric field.
- Is multi-vehicle-type rate/cost differentiation needed for ROI, or is a flat model acceptable for MVP?
