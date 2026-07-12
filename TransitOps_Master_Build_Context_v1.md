# TransitOps Master Build Context v1.0

## Mission

Build a single, production-style transport operations platform in 8
hours. The goal is a stable, integrated system that satisfies all
mandatory requirements before adding bonus features.

## Core Problem

Organizations manage fleet operations with spreadsheets and manual
processes, causing: - Double-booked vehicles/drivers - Missed
maintenance - Expired licenses - Fuel/expense tracking issues - Poor
operational visibility

## Product Vision

A centralized platform managing: - Authentication & RBAC - Vehicles -
Drivers - Trips - Maintenance - Fuel & Expenses - Dashboard & Reports

## Tech Stack (Locked)

-   Frontend: React + Vite + Tailwind + shadcn/ui
-   Backend: Node.js + Express
-   ORM: Prisma
-   Database: PostgreSQL
-   Auth: JWT + bcrypt
-   Charts: Recharts

## Architecture (Locked)

Shared Core - Authentication - RBAC - Database - Shared UI - API
Contracts

Modules 1. Fleet 2. Operations 3. Analytics

## Database Entities

users vehicles drivers trips maintenance_logs fuel_logs expenses

## Mandatory Business Rules

1.  Unique vehicle registration.
2.  Retired/In Shop vehicles unavailable for dispatch.
3.  Expired or suspended drivers cannot be assigned.
4.  No double booking.
5.  Cargo \<= vehicle capacity.
6.  Dispatch -\> vehicle & driver become On Trip.
7.  Complete -\> vehicle & driver become Available.
8.  Cancel -\> restore Available.
9.  Open maintenance -\> In Shop.
10. Close maintenance -\> Available unless Retired.

## Shared API Prefix

/api

Response Success { "success": true, "data": {}, "message": "" }

Response Error { "success": false, "error": { "code": "","message": "" }
}

## Folder Structure

client/ server/ docs/

Server modules: auth/ vehicles/ drivers/ trips/ maintenance/ finance/
reports/ dashboard/ shared/

## Git Rules

-   One repository
-   Feature branches
-   Push at least every hour
-   Meaningful commits
-   Merge only after testing

## Team Ownership

Developer A - Shared Core - Integration - Auth - Git - Architecture

Developer B - Fleet Module

Developer C - Operations + Analytics

## AI Rules

-   Never rename tables.
-   Never rename APIs.
-   Never change shared enums.
-   Never duplicate authentication.
-   Never create a second database.
-   Follow the folder structure exactly.
-   Reuse existing services/components.
-   If information is missing, ask instead of inventing.

## Definition of Done

-   Mandatory workflow passes: Vehicle -\> Driver -\> Trip -\> Dispatch
    -\> Complete -\> Maintenance -\> Dashboard.
-   No business rule violations.
-   Dashboard updates correctly.
-   Clean UI.
-   Demo ready.

------------------------------------------------------------------------

# TransitOps AI Collaboration Protocol

## Everyone receives:

-   This document
-   Module-specific prompt
-   Existing repository

## Nobody may:

-   Modify another module's ownership without approval.
-   Change DB schema after lock.
-   Rename API contracts.
-   Break response format.

## Merge Checklist

-   Builds successfully
-   No API changes
-   No schema changes
-   No duplicate components
-   Business rules still pass

## Module Selection

Choose ONE module only.

1.  Shared Core (Architect)
2.  Fleet
3.  Operations
4.  Analytics

Do not generate code outside your assigned module.
