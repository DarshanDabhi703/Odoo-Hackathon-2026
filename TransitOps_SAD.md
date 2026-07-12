# Software Architecture Document (SAD)
## TransitOps — Smart Transport Operations Platform

| | |
|---|---|
| **Document Owner** | Engineering Team |
| **Status** | Draft |
| **Version** | 1.0 |
| **Related Docs** | TransitOps_PRD.md, TransitOps_TRD.md, TransitOps_Build_Guide.md |

---

## 1. Introduction

### 1.1 Purpose
This document describes the software architecture of TransitOps — the structural decomposition of the system into components, how they interact, the architectural style chosen, and the rationale behind key design decisions. It complements the TRD (which specifies data model and API contracts) by focusing on *structure, views, and design rationale* rather than field-level implementation detail.

### 1.2 Scope
Covers the MVP system as defined in the PRD: a single-organization, web-based transport operations platform with authentication, RBAC, vehicle/driver/trip/maintenance/finance management, and reporting.

### 1.3 Architectural Goals & Constraints
- **Goal:** correctness of business-rule enforcement (double-booking, capacity, compliance) over raw performance or scale.
- **Goal:** buildable end-to-end within an 8-hour hackathon window by a small team.
- **Constraint:** single Postgres instance, single backend service — no distributed system complexity.
- **Constraint:** must support 4 distinct roles with materially different permissions from day one.

---

## 2. Architectural Style

**Layered monolith, client-server, REST over HTTPS.**

Chosen over microservices or event-driven architecture because:
- The domain is small and highly relational (vehicles/drivers/trips share tight referential integrity needs) — a single relational database with transactional guarantees is the simplest correct solution.
- Time constraint (8-hour build) makes network-boundary complexity (service discovery, distributed transactions) counterproductive.
- The core value proposition — atomic, correct status transitions — is best served by ACID transactions in one database, not eventual consistency across services.

```
┌───────────────────────────────────────────────────────────┐
│                      Presentation Layer                     │
│         React SPA (views, forms, role-gated navigation)     │
└───────────────────────────┬───────────────────────────────┘
                             │ REST/JSON over HTTPS (JWT auth)
┌───────────────────────────▼───────────────────────────────┐
│                        API Layer                            │
│      Express routes → validation → controllers              │
└───────────────────────────┬───────────────────────────────┘
                             │
┌───────────────────────────▼───────────────────────────────┐
│                     Domain/Service Layer                    │
│   TripService · MaintenanceService · VehicleService ·       │
│   DriverService · FinanceService · ReportService             │
│   (all business rules + transaction boundaries live here)   │
└───────────────────────────┬───────────────────────────────┘
                             │ Prisma ORM
┌───────────────────────────▼───────────────────────────────┐
│                     Data Layer — PostgreSQL                 │
│   users · vehicles · drivers · trips · maintenance_logs ·    │
│   fuel_logs · expenses                                       │
└───────────────────────────────────────────────────────────┘
```

**Key architectural principle:** the API/controller layer is a thin translation layer only (HTTP ↔ service calls). All business logic — including every rule in the PRD's Section 5 — lives in the service layer so it can be unit-tested independently of HTTP and reused consistently across endpoints.

---

## 3. Architectural Views

### 3.1 Logical View (Module Decomposition)

| Module | Depends On | Purpose |
|---|---|---|
| `auth` | `users` table | Login, JWT issuance, password verification |
| `middleware` | `auth` | `requireAuth`, `requireRole` guards on every route |
| `VehicleService` | `vehicles` table | CRUD, availability filtering (BR-2) |
| `DriverService` | `drivers` table | CRUD, availability filtering (BR-3) |
| `TripService` | Vehicle/DriverService, `trips` table | Full lifecycle state machine (BR-4 to BR-8) |
| `MaintenanceService` | `vehicles`, `maintenance_logs` tables | Lifecycle + vehicle side-effects (BR-9, BR-10) |
| `FinanceService` | `fuel_logs`, `expenses` tables | Logging + cost aggregation |
| `ReportService` | All above | KPI/report computation, CSV export |

Dependency direction is strictly one-way: `ReportService` reads from everything; nothing depends on `ReportService`. `TripService` depends on Vehicle/Driver state but those services never depend back on `TripService` — this avoids circular coupling under time pressure.

### 3.2 Process View (Runtime Behavior)

**Critical path — Dispatch a trip:**
1. Client sends `POST /trips/:id/dispatch` with JWT.
2. `requireAuth` middleware verifies token, attaches user context.
3. `requireRole(['FleetManager','Driver'])` checks permission.
4. Controller calls `TripService.dispatch(tripId)`.
5. Service opens a DB transaction, row-locks trip/vehicle/driver (`SELECT ... FOR UPDATE`), evaluates all business rules in sequence, and either commits the three-table status update or rolls back with a specific error.
6. Controller maps service result to HTTP response (200 or 422 with error code).
7. Client (React Query) invalidates cached vehicle/driver/trip queries and re-renders.

This is a **synchronous, single-transaction** process — deliberately avoided any async/queue-based dispatch to keep the critical correctness path simple and immediately consistent.

### 3.3 Deployment View

```
┌────────────────┐       ┌──────────────────┐       ┌───────────────┐
│  Vercel/Netlify │──────▶│  Render/Railway    │──────▶│  Managed        │
│  (React static   │HTTPS  │  (Node/Express)    │  TCP  │  PostgreSQL     │
│   build)          │       │  single instance    │       │  (Neon/Railway/│
└────────────────┘       └──────────────────┘       │  Supabase)      │
                                                       └───────────────┘
```

- Frontend and backend deployed independently, communicating over HTTPS.
- No CDN/edge logic beyond static asset hosting.
- No caching layer (Redis, etc.) in MVP — not needed at this data scale.

### 3.4 Data View

See TRD Section 3 for full schema. Architecturally significant point: **all cross-entity consistency (vehicle/driver/trip status) is enforced via application-level transactions, not database triggers**, so that business-rule error messages remain in the application layer where they can be surfaced clearly to the UI — a trigger-based approach would push rule logic into SQL and make specific error messaging harder to produce.

---

## 4. Key Design Decisions & Rationale

| Decision | Alternative Considered | Rationale |
|---|---|---|
| Monolithic backend | Microservices (Vehicle svc, Trip svc, etc.) | Domain is small and tightly coupled by referential integrity; microservices would require distributed transactions to preserve BR-6/BR-7 atomicity — unnecessary complexity for this scope |
| Business rules in service layer | Rules in DB triggers/stored procedures | Keeps logic testable in application code and allows precise, human-readable error messages surfaced to the UI |
| Synchronous dispatch transaction | Async/queue-based dispatch (e.g., dispatch request → worker processes it) | Correctness (no double-booking) matters more than throughput at this scale; synchronous transaction with row locks is simplest correct solution |
| JWT stateless auth | Server-side session store | Simpler to deploy (no session store infra), sufficient for single-org MVP |
| Server-side re-validation of all dispatch rules | Trust client-filtered dropdowns | Client filtering is UX only; server must be the single source of truth to prevent race conditions and bypass |
| Single Postgres instance | Read replicas / sharding | Not justified at MVP data volume; premature optimization |

---

## 5. Cross-Cutting Concerns

### 5.1 Security
- AuthN via JWT; AuthZ via role middleware on every route (see TRD Section 6).
- No architectural reliance on frontend for access control — every permission check is duplicated server-side.

### 5.2 Error Handling
- Service layer throws typed domain errors (e.g., `CargoExceedsCapacityError`) mapped to HTTP 422 with a stable `code` + `message` — see TRD Section 4.3 for the error contract.
- Unhandled errors fall through to a global Express error handler returning HTTP 500 with no internal detail leaked to the client.

### 5.3 Concurrency
- Row-level locking (`SELECT ... FOR UPDATE`) inside service transactions is the sole mechanism preventing double-assignment of a vehicle/driver — no optimistic locking or external lock manager introduced.

### 5.4 Extensibility (Post-MVP)
- Multi-tenancy: would require an `org_id` column threaded through every table and every service query — not present in MVP schema, flagged as a future migration if needed.
- Async workflows (e.g., scheduled license-expiry email reminders): can be added as a standalone cron/worker process reading from the existing `drivers` table without touching the core transactional path.
- Additional roles/permissions: the `requireRole` middleware pattern scales to new roles without structural change.

---

## 6. Architecturally Significant Requirements Traceability

| Requirement (PRD/TRD) | Architectural Mechanism |
|---|---|
| BR-1 Unique registration number | DB `UNIQUE` constraint on `vehicles.reg_number` |
| BR-2 Retired/In Shop excluded from dispatch | `VehicleService.getAvailable()` filter, re-checked in `TripService.dispatch()` |
| BR-3 Expired/Suspended drivers excluded | `DriverService.getAvailable()` filter, re-checked in `TripService.dispatch()` |
| BR-4 No double-booking | Row locks (`FOR UPDATE`) + status check inside dispatch transaction |
| BR-5 Cargo ≤ capacity | Validation inside `TripService.dispatch()` before commit |
| BR-6/BR-7/BR-8 Atomic status transitions | Single DB transaction spanning trip/vehicle/driver updates |
| BR-9/BR-10 Maintenance status side-effects | Single DB transaction in `MaintenanceService.create()`/`.close()` |
| RBAC (all roles) | `requireRole` middleware on every protected route |

---

## 7. Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Business rule logic drifts between frontend filtering and backend validation | Backend is the sole authority; frontend filters are UX convenience only, never the enforcement point |
| Concurrent dispatch race condition | Row-level locking within transactions (Section 5.3) |
| Undefined "Revenue" source skews ROI reporting | Explicit assumption documented (see PRD Section 10 / TRD Section 10); flagged for stakeholder confirmation |
| Single Postgres instance is a single point of failure | Acceptable for MVP/demo scope; noted as a scaling gap, not addressed in this architecture |
