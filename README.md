# TransitOps 🚛⚡

**TransitOps** is a modern, high-performance Fleet Command and Analytics Dashboard. Designed with a stunning **Luminous Velocity** glassmorphism aesthetic, it provides real-time intelligence for fleet managers to monitor vehicle utilization, track operational costs, and analyze fuel efficiency.

---

## ✨ Features

- **Real-Time Dashboard**: Monitor active vehicles, pending trips, drivers on duty, and overall fleet utilization percentages.
- **Advanced Analytics & Reports**:
  - **Fuel Efficiency**: Visualize fuel consumption versus distance traveled for each vehicle.
  - **Operational Costs**: Track total expenses, including maintenance, toll, and fuel costs.
  - **ROI Analysis**: Compare net profit against vehicle acquisition costs.
- **Stunning UI/UX**: Built with a dark mode glassmorphism theme (Dark Navy & Accent Cyan), featuring dynamic backgrounds and micro-animations.
- **Authentication**: Secure login flow for authorized fleet managers.
- **CSV Export**: Instantly download your analytics data for external reporting.

---

## 🛠️ Tech Stack

**Frontend (Client):**
- React.js + Vite
- Recharts (for Data Visualization)
- Lucide React (Icons)
- Vanilla CSS + PostCSS (Custom glassmorphism design system)

**Backend (Server):**
- Node.js + Express
- Prisma ORM
- SQLite (Zero-config local database)
- JSON Web Tokens (JWT) for Authentication

---

## 🚀 Getting Started

Follow these steps to run the TransitOps platform locally.

### 1. Database & Backend Setup
Open a terminal and navigate to the `server` directory:

```bash
cd server

# Install dependencies
npm install

# Initialize Prisma Client and push the schema to SQLite
npx prisma generate
npx prisma db push

# Seed the database with realistic fleet data (10 vehicles, trips, expenses)
node prisma/seed.js

# Start the backend server (runs on port 5001)
npm run dev
```

### 2. Frontend Client Setup
Open a **new** terminal window and navigate to the `client` directory:

```bash
cd client

# Install dependencies
npm install

# Start the Vite development server
npm run dev
```

### 3. Usage
- Open your browser and navigate to the local URL provided by Vite (usually `http://localhost:5173` or `http://localhost:5174`).
- You will be greeted by the Login Page.
- **Demo Credentials:**
  - **Email:** `admin@transitops.io`
  - **Password:** `password`
- Click **Sign In** to access the Fleet Overview Dashboard.

---

## 📁 Project Structure

```
TransitOps/
├── client/                 # React frontend application
│   ├── src/
│   │   ├── api/            # Axios API client configuration
│   │   ├── components/     # Reusable UI components (FrameBackground, etc.)
│   │   ├── features/       # Feature-based modules (Analytics, Charts, Filters)
│   │   ├── pages/          # Full page views (Dashboard, Reports, Login, etc.)
│   │   └── index.css       # Core design tokens and glassmorphism utilities
│   └── package.json
└── server/                 # Node.js backend application
    ├── prisma/
    │   ├── schema.prisma   # SQLite database schema
    │   └── seed.js         # Dummy data generation script
    ├── src/
    │   ├── dashboard/      # Dashboard KPI endpoints
    │   ├── reports/        # Analytics aggregation logic
    │   ├── middleware/     # Auth and validation middlewares
    │   └── server.js       # Express app entry point
    └── package.json
```

---

## 💡 Notes for Hackathon Judges
- The database is powered by **SQLite** (`dev.db`), meaning no external Postgres/MySQL servers are required to run this project.
- Authentication currently uses a bypass stub token (`stub-jwt-token`) to ensure seamless testing during the hackathon evaluation without requiring email verification or complex Auth0 setups.
- The `Fleet`, `Operations`, and `Settings` modules are currently stubbed UI placeholders demonstrating routing architecture.
