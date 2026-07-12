# Product Requirements Document (PRD)
## TransitOps — Smart Transport Operations Platform

| | |
|---|---|
| **Document Owner** | Product/Engineering Team |
| **Status** | Draft |
| **Version** | 1.0 |
| **Last Updated** | July 12, 2026 |

---

## 1. Overview

### 1.1 Problem Statement
Logistics companies commonly manage vehicles, drivers, dispatch, maintenance, and expenses through spreadsheets and manual logbooks. This causes scheduling conflicts, underutilized vehicles, missed maintenance windows, expired driver licenses going unnoticed, inaccurate expense tracking, and a lack of operational visibility for decision-makers.

### 1.2 Product Vision
TransitOps is a centralized, role-based web platform that digitizes the complete lifecycle of transport operations — from vehicle and driver onboarding through dispatch, maintenance, fuel/expense tracking, and operational analytics — while enforcing the business rules that prevent unsafe or invalid dispatch decisions.

### 1.3 Objectives
- Eliminate manual scheduling errors (double-booked vehicles/drivers, overloaded cargo).
- Guarantee compliance (no dispatch with expired licenses or suspended drivers).
- Provide real-time operational and financial visibility (utilization, cost, ROI).
- Replace spreadsheet-based tracking with an auditable, rule-enforced system of record.

---

## 2. Target Users & Personas

| Persona | Role | Primary Needs |
|---|---|---|
| **Fleet Manager** | Oversees fleet assets, maintenance, and vehicle lifecycle | Full visibility and control over vehicle status, maintenance scheduling, operational efficiency |
| **Driver** | Creates trips, assigns vehicles/drivers, monitors deliveries | Fast, error-proof trip creation and dispatch |
| **Safety Officer** | Ensures driver compliance | License validity tracking, safety score monitoring, ability to suspend drivers |
| **Financial Analyst** | Reviews costs and profitability | Read-only access to expense, fuel, maintenance cost, and ROI data |

---

## 3. Scope

### 3.1 In Scope (MVP)
- Email/password authentication with Role-Based Access Control (RBAC)
- Vehicle registry (CRUD)
- Driver management (CRUD)
- Trip lifecycle management with automated status transitions
- Maintenance workflow with automated vehicle status changes
- Fuel and expense logging with cost aggregation
- Operational dashboard with KPIs and filters
- Reports & analytics (fuel efficiency, utilization, operational cost, ROI)
- CSV export

### 3.2 Out of Scope (MVP)
- Native mobile apps (responsive web only)
- Real-time GPS tracking / live map view
- Third-party payroll or accounting system integration
- Multi-tenant/organization support (single-org assumed for MVP)
- PDF export (optional/bonus, not required)

### 3.3 Bonus / Post-MVP Candidates
- Email reminders for expiring driver licenses
- Vehicle document management (insurance, registration file uploads)
- Search, filters, and sorting across all list views
- Dark mode
- PDF export

---

## 4. Functional Requirements

### 4.1 Authentication & Access Control
- FR-1: Users must log in with email and password to access any part of the application.
- FR-2: The system must support four roles: Fleet Manager, Driver, Safety Officer, Financial Analyst.
- FR-3: Every screen and action must be gated by role-appropriate permissions (see Section 6, RBAC Matrix).

### 4.2 Dashboard
- FR-4: The dashboard must display: Active Vehicles, Available Vehicles, Vehicles in Maintenance, Active Trips, Pending Trips, Drivers On Duty, and Fleet Utilization (%).
- FR-5: KPIs must be filterable by vehicle type, status, and region.

### 4.3 Vehicle Registry
- FR-6: Vehicles must have: Registration Number (unique), Name/Model, Type, Maximum Load Capacity, Odometer, Acquisition Cost, and Status.
- FR-7: Vehicle status must be one of: Available, On Trip, In Shop, Retired.
- FR-8: Registration Number uniqueness must be enforced by the system; duplicate entries must be rejected.

### 4.4 Driver Management
- FR-9: Drivers must have: Name, License Number, License Category, License Expiry Date, Contact Number, Safety Score, and Status.
- FR-10: Driver status must be one of: Available, On Trip, Off Duty, Suspended.

### 4.5 Trip Management
- FR-11: Trip creation requires: source, destination, an available vehicle, an available driver, cargo weight, and planned distance.
- FR-12: Trip status must follow the lifecycle: Draft → Dispatched → Completed → Cancelled.
- FR-13: The vehicle/driver selection pool during trip creation must exclude any vehicle or driver that is not currently eligible for dispatch (see Section 5, Business Rules).

### 4.6 Maintenance
- FR-14: Users with appropriate permissions can create maintenance records against a vehicle.
- FR-15: Creating an active maintenance record must automatically set the vehicle's status to In Shop, removing it from the dispatch selection pool.
- FR-16: Closing a maintenance record must restore the vehicle to Available, unless the vehicle has been separately marked Retired.

### 4.7 Fuel & Expense Management
- FR-17: The system must support logging fuel entries (liters, cost, date) per vehicle.
- FR-18: The system must support logging other expenses (e.g., tolls, maintenance) per vehicle.
- FR-19: The system must automatically compute total operational cost (Fuel + Maintenance) per vehicle.

### 4.8 Reports & Analytics
- FR-20: The system must display Fuel Efficiency (Distance ÷ Fuel), Fleet Utilization, Operational Cost, and Vehicle ROI [(Revenue − (Maintenance + Fuel)) ÷ Acquisition Cost].
- FR-21: Reports must support CSV export.
- FR-22 (optional): Reports may support PDF export.

---

## 5. Business Rules (Non-Negotiable)

| ID | Rule |
|---|---|
| BR-1 | Vehicle registration number must be unique. |
| BR-2 | Retired or In Shop vehicles must never appear in the dispatch selection. |
| BR-3 | Drivers with expired licenses or Suspended status cannot be assigned to trips. |
| BR-4 | A driver or vehicle already marked On Trip cannot be assigned to another trip. |
| BR-5 | Cargo Weight must not exceed the vehicle's maximum load capacity. |
| BR-6 | Dispatching a trip automatically changes both the vehicle and driver status to On Trip. |
| BR-7 | Completing a trip automatically changes both the vehicle and driver status back to Available. |
| BR-8 | Cancelling a dispatched trip restores the vehicle and driver to Available. |
| BR-9 | Creating an active maintenance record automatically changes vehicle status to In Shop. |
| BR-10 | Closing maintenance restores the vehicle to Available (unless Retired). |

All rules must be enforced server-side, regardless of what the client UI allows the user to select, to prevent invalid states from race conditions or client bypass.

---

## 6. RBAC Matrix

| Capability | Fleet Manager | Driver | Safety Officer | Financial Analyst |
|---|:---:|:---:|:---:|:---:|
| Vehicle CRUD | Full | — | View | View |
| Driver CRUD | View | — | Full | View |
| Trip create/dispatch/complete/cancel | Full | Full | — | — |
| Maintenance CRUD | Full | — | — | View |
| Fuel/Expense entry | Full | Own trips | — | View |
| Reports & Analytics | Full | Own trips | Compliance view | Full |
| CSV Export | Full | — | — | Full |

---

## 7. Data Requirements

**Entities:** Users, Roles, Vehicles, Drivers, Trips, Maintenance Logs, Fuel Logs, Expenses.

**Key relationships:**
- A Trip references exactly one Vehicle and one Driver.
- A Maintenance Log references exactly one Vehicle.
- A Fuel Log references one Vehicle and, optionally, one Trip.
- An Expense references exactly one Vehicle.

---

## 8. Non-Functional Requirements

| Category | Requirement |
|---|---|
| Usability | Responsive web interface, usable on desktop and mobile viewports |
| Security | Passwords hashed at rest; authenticated sessions required for all routes; role checks enforced server-side |
| Data Integrity | Unique constraints (registration number, license number); atomic status transitions across related entities |
| Performance | Dashboard KPIs and reports should reflect the latest data on load/refresh, no significant staleness |
| Auditability | Status changes (trip, vehicle, driver, maintenance) should be traceable to the action that caused them |

---

## 9. Success Metrics

| Metric | Target Signal |
|---|---|
| Dispatch error rate | Zero invalid dispatches (overloaded cargo, expired license, double-booking) reach the database |
| Data integrity | Zero duplicate registration numbers or orphaned status states |
| Operational visibility | Fleet Manager/Financial Analyst can retrieve utilization, cost, and ROI figures without manual calculation |
| Adoption proxy (demo context) | Full example workflow (vehicle → driver → trip → dispatch → complete → maintenance → reports) completes without manual data correction |

---

## 10. Assumptions & Open Questions

- **Revenue source (for ROI):** the spec defines ROI as (Revenue − (Maintenance + Fuel)) ÷ Acquisition Cost but does not define where Revenue originates. **Assumption:** Revenue is captured per trip (manually entered or derived from distance × rate) and summed per vehicle. This should be confirmed with stakeholders before being treated as final.
- **Single organization scope:** MVP assumes one organization/tenant; multi-tenant support is not addressed.
- **Region field:** assumed to be a free-text or simple enum field on Vehicle for dashboard filtering; no geographic/mapping features are implied.
- **Safety Score:** input mechanism (manual entry vs. computed from trip history/incidents) is not specified in the source requirements and should be clarified.

---

## 11. Example End-to-End Scenario (Acceptance Reference)

1. Register vehicle "Van-05," max capacity 500 kg → status Available.
2. Register driver "Alex" with a valid license.
3. Create a trip with cargo weight 450 kg.
4. System validates 450 kg ≤ 500 kg and permits dispatch.
5. Vehicle and driver statuses automatically become On Trip.
6. Complete the trip, entering final odometer and fuel consumed.
7. System marks both Vehicle and Driver Available again.
8. Create a maintenance record (e.g., Oil Change) → vehicle automatically becomes In Shop and disappears from dispatch options.
9. Reports update to reflect the latest trip and fuel data.

This scenario should pass without manual intervention and serves as the baseline acceptance test for the trip/maintenance workflow.

---

## 12. Milestones (Hackathon Context)

| Milestone | Deliverable |
|---|---|
| M1 | Auth + RBAC, Vehicle/Driver CRUD |
| M2 | Trip lifecycle with full business-rule enforcement |
| M3 | Maintenance workflow |
| M4 | Fuel/Expense tracking + cost aggregation |
| M5 | Dashboard, reports, CSV export |
| M6 | Polish, bonus features, demo readiness |

---

## 13. Appendix

- Reference mockup: Excalidraw link provided by stakeholders (interactive; verify final UI against it directly).
- Related documents: `TransitOps_Build_Document.md` (technical architecture), `TransitOps_Build_Guide.md` (execution steps), `TransitOps_AI_Build_Prompt.md` (AI-assisted build prompt).
