# Tonly EV Fleet Management System

Full-stack fleet management platform for Tonly's 20 EV trucks — built with Next.js 15, Prisma, PostgreSQL, and NextAuth v5.

## Features

- **Multi-role auth**: Worker, Technician, Supervisor, Charging Operator
- **20 EV trucks** pre-loaded in database with realistic data
- **Fault reporting**: Technicians report faults with severity levels; critical faults auto-flag trucks
- **Task management**: Supervisors create & assign tasks; Kanban board view; technicians update status
- **Charging logs**: Manual entry or Excel bulk import with template download
- **Real-time dashboard**: KPI cards, status distribution pie chart, recent activity
- **Role-based access**: Each role sees only relevant features

## Quick Start

### 1. Prerequisites
- Node.js 18+
- PostgreSQL database
- npm or yarn

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment
```bash
cp .env.local.example .env.local
```
Edit `.env.local` with your database URL and a secret key:
```
DATABASE_URL="postgresql://user:password@localhost:5432/tonly_fleet"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-a-strong-32-char-secret-here"
```

### 4. Setup database
```bash
npx prisma generate
npx prisma db push
npm run db:seed
```

### 5. Run development server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000)

## Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Supervisor | supervisor@tonly.com | password123 |
| Technician | tech@tonly.com | password123 |
| Worker | worker@tonly.com | password123 |
| Charging Operator | charger@tonly.com | password123 |

## Role Permissions

| Feature | Worker | Technician | Supervisor | Charging Operator |
|---------|--------|------------|------------|-------------------|
| Dashboard | ✅ | ✅ | ✅ | ✅ |
| View Trucks | ✅ | ✅ | ✅ | ✅ |
| Change Truck Status | ❌ | ❌ | ✅ | ❌ |
| Report Faults | ❌ | ✅ | ✅ | ❌ |
| Update Fault Status | ❌ | ✅ | ✅ | ❌ |
| Create/Assign Tasks | ❌ | ❌ | ✅ | ❌ |
| Update Task Status | ❌ | ✅ | ✅ | ❌ |
| Log Charging | ❌ | ❌ | ✅ | ✅ |
| Import Excel | ❌ | ❌ | ✅ | ✅ |
| View Users | ❌ | ❌ | ✅ | ❌ |

## Excel Import Format

Download the template from the Charging page. Columns:
- `truckId` — e.g. TNL-001
- `startTime` — e.g. 2025-01-15 08:00
- `endTime` — optional
- `startBattery` — percentage (0-100)
- `endBattery` — optional
- `kwhDelivered` — optional float
- `stationId` — e.g. CS-01
- `cost` — optional float (USD)
- `notes` — optional

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL + Prisma ORM
- **Auth**: NextAuth v5 (JWT, credentials)
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Excel**: SheetJS (xlsx)
- **Icons**: Lucide React

## Scripts

```bash
npm run dev          # Development server
npm run build        # Production build
npm run db:push      # Push schema to DB
npm run db:seed      # Seed trucks + demo users
npm run db:studio    # Prisma Studio GUI
```
