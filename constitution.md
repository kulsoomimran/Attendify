# Attendify Project Constitution
*Version 1.0.0 — Permanent Technical & Architectural Source of Truth*

This document serves as the absolute authority on engineering decisions, architectural guidelines, directory structures, database schemas, styling rules, and code quality standards for **Attendify**. All development must strictly adhere to these boundaries.

---

## 1. Executive Summary & Design Philosophy
Attendify is a premium enterprise SaaS platform built for attendance management, tracking, and reporting. The technical philosophy is anchored on **absolute type safety**, **modular database design**, and a **refined, minimalist aesthetic** inspired by platforms like Stripe and Linear. 

We prioritize clean layouts, deliberate typography, and high-contrast readable interfaces over visual clutter. Under no circumstances should heavy gradients, glassmorphism, or neon colors be introduced.

---

## 2. Tech Stack Constraints

Every element of the codebase must run on the following approved technology stack:

*   **Frontend Framework**: Next.js 16 (App Router) using Server Components by default.
*   **Language**: TypeScript in Strict Mode (`strict: true` in `tsconfig.json`).
*   **Styling**: Tailwind CSS with custom palette configuration.
*   **Component Library**: shadcn/ui (radix-ui primitives).
*   **Database**: Neon PostgreSQL (Serverless SQL).
*   **ORM**: Prisma ORM.
*   **Authentication**: Better Auth (supporting secure session handling, JWTs, and RBAC).
*   **Schema Validation**: Zod.

---

## 3. Directory & Architecture Rules

### 3.1 Workspace Layout
The directory structure enforces a strict separation of concerns, ensuring features remain modular and testable:

```text
├── app/                      # Next.js App Router Root
│   ├── (auth)/               # Auth-related pages (login, register, reset-password)
│   ├── (dashboard)/          # Application dashboard (guarded routes)
│   │   ├── admin/            # Admin-only dashboard pages
│   │   └── employee/         # Employee-only dashboard pages
│   ├── api/                  # Next.js Route Handlers (Backend endpoints)
│   │   ├── auth/             # Better Auth route handlers
│   │   └── v1/               # Versioned API routes (attendance, organization, users, etc.)
│   ├── layout.tsx            # Root layout
│   └── page.tsx              # Home / Landing redirect
├── components/               # Reusable UI components
│   ├── ui/                   # shadcn/ui components (primitive elements)
│   ├── common/               # Shared compound components (e.g., Sidebar, Navbar)
│   └── features/             # Feature-specific components (e.g., AttendanceTracker, PayrollTable)
├── db/                       # Prisma configuration and migrations
│   └── schema.prisma
├── hooks/                    # Reusable custom React hooks
├── lib/                      # Shared utility code
│   ├── auth.ts               # Better Auth initialization
│   ├── db.ts                 # Prisma Client singleton
│   └── utils.ts              # General utilities (cn helper, formatting)
├── server/                   # Server-only logic, action controllers, and schema validators
│   ├── actions/              # Next.js Server Actions (typed form submissions)
│   ├── services/             # Core business logic layer (Prisma calls, integrations)
│   └── validators/           # Zod schema definitions
├── types/                    # Shared TypeScript interfaces & definitions
└── config/                   # Static app configurations
```

### 3.2 Backend Architecture Rules
*   **Next.js Route Handlers**: Use standard HTTP methods (`GET`, `POST`, `PATCH`, `DELETE`) defined in `route.ts` files inside `app/api/v1/`.
*   **Layered Responsibility**:
    1.  **Route Handlers**: Parse incoming requests, validate payloads using Zod, check authentication/authorization, and return HTTP responses.
    2.  **Services Layer (`server/services/`)**: Contains business logic, interacts with Prisma Client, computes values, and handles mutations. Route Handlers must *never* query Prisma directly; they must delegate to services.
    3.  **Data Access (Prisma)**: Abstracted behind service classes or functions to make switching databases or caching simpler.
*   **Path Aliases**: Always use `@/` to reference root-relative directories (e.g., `@/components/ui/button`, `@/lib/db`). Do not use relative path traversal (`../../`).

---

## 4. Database & Modular Schema Design

The Prisma schema is designed to support strict Role-Based Access Control (RBAC) and contains explicit integration patterns for future domain expansions (Payroll, Multi-company, and Analytics) without breaking core schemas.

### 4.1 Schema Definition (`db/schema.prisma`)

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

// ----------------------------------------------------
// Enums
// ----------------------------------------------------

enum Role {
  ADMIN
  EMPLOYEE
}

enum AttendanceStatus {
  PRESENT
  ABSENT
  LATE
  HALFDAY
  LEAVE
}

// ----------------------------------------------------
// Core Auth Models (Better Auth Compatible)
// ----------------------------------------------------

model User {
  id             String    @id @default(cuid())
  name           String
  email          String    @unique
  emailVerified  Boolean   @default(false)
  image          String?
  role           Role      @default(EMPLOYEE)
  isActive       Boolean   @default(true)
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt

  // Better Auth Relations
  sessions       Session[]
  accounts       Account[]

  // Core Attendance Relations
  attendances    Attendance[]

  // Multi-Company Hook
  // If multi-company is enabled in the future, users belong to organizations.
  organizationId String?
  organization   Organization? @relation(fields: [organizationId], references: [id], onDelete: SetNull)

  // Payroll Hook
  // Link to optional payroll profile for salary details.
  payrollProfile PayrollProfile?

  // Analytics Hook
  // References for audit logs or pre-computed employee summaries.
  analyticsLogs  EmployeeAnalytics[]

  @@index([email])
  @@index([organizationId])
}

model Session {
  id             String   @id @default(cuid())
  userId         String
  token          String   @unique
  expiresAt      DateTime
  ipAddress      String?
  userAgent      String?
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  user           User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
}

model Account {
  id                    String    @id @default(cuid())
  userId                String
  accountId             String
  providerId            String
  accessToken           String?
  refreshToken          String?
  accessTokenExpiresAt  DateTime?
  refreshTokenExpiresAt DateTime?
  scope                 String?
  idToken               String?
  password              String?
  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt

  user                  User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
}

model Verification {
  id         String   @id @default(cuid())
  identifier String
  value      String
  expiresAt  DateTime
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  @@unique([identifier, value])
}

// ----------------------------------------------------
// Multi-Company Hooks
// ----------------------------------------------------

model Organization {
  id          String   @id @default(cuid())
  name        String
  slug        String   @unique
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Relations
  users       User[]

  // Modular expansion placeholders
  settings    Json?    // Open config for tenant-specific policies
}

// ----------------------------------------------------
// Core Domain: Attendance
// ----------------------------------------------------

model Attendance {
  id             String           @id @default(cuid())
  userId         String
  date           DateTime         // Represents the calendar day (Y-M-D)
  clockIn        DateTime
  clockOut       DateTime?
  status         AttendanceStatus @default(PRESENT)
  latitudeIn     Float?
  longitudeIn    Float?
  latitudeOut    Float?
  longitudeOut   Float?
  notes          String?          @db.VarChar(500)
  createdAt      DateTime         @default(now())
  updatedAt      DateTime         @updatedAt

  user           User             @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, date])        // Enforces one attendance record per employee per day
  @@index([userId])
  @@index([date])
}

// ----------------------------------------------------
// Payroll Modular Extension Hook
// ----------------------------------------------------

model PayrollProfile {
  id            String   @id @default(cuid())
  userId        String   @unique
  baseSalary    Decimal  @db.Decimal(12, 2)
  currency      String   @default("USD") @db.VarChar(3)
  paymentCycle  String   @default("MONTHLY") // MONTHLY, BIWEEKLY, WEEKLY
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  user          User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  records       PayrollRecord[]
}

model PayrollRecord {
  id               String         @id @default(cuid())
  payrollProfileId String
  periodStart      DateTime
  periodEnd        DateTime
  grossPay         Decimal        @db.Decimal(12, 2)
  deductions       Decimal        @db.Decimal(12, 2) @default(0.00)
  netPay           Decimal        @db.Decimal(12, 2)
  status           String         @default("PENDING") // PENDING, PAID, VOID
  processedAt      DateTime?
  createdAt        DateTime       @default(now())
  updatedAt        DateTime       @updatedAt

  profile          PayrollProfile @relation(fields: [payrollProfileId], references: [id], onDelete: Cascade)

  @@index([payrollProfileId])
}

// ----------------------------------------------------
// Analytics Modular Extension Hook
// ----------------------------------------------------

model EmployeeAnalytics {
  id               String   @id @default(cuid())
  userId           String
  month            Int      // 1-12
  year             Int
  totalPresentDays Int      @default(0)
  totalAbsentDays  Int      @default(0)
  totalLateDays    Int      @default(0)
  totalHoursWorked Float    @default(0.0)
  updatedAt        DateTime @updatedAt

  user             User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, month, year])
  @@index([userId])
}
```

### 4.2 Modular Extension Patterns
*   **Foreign Key Decoupling**: If multi-company scale transitions to separate microservices, use `organizationId` matching without tight database-level constraints.
*   **Loose JSON Schemas**: Fields designated as `settings Json?` in the `Organization` or optional configuration blocks in `PayrollProfile` allow new keys to be added dynamically without running migrations.

---

## 5. Design & Styling Directives

Attendify implements a high-end, clean enterprise SaaS aesthetic. The user interface must feel deliberate, solid, and premium.

### 5.1 Color Palette
The exact color palette must be registered in Tailwind's utility class mapping. Do not use random color steps (e.g. `gray-200`, `blue-500`, `green-600`) in code. Utilize these custom tokens:

| Name | Hex Value | CSS Custom Property | Usage |
| :--- | :--- | :--- | :--- |
| **Background** | `#FAFAF7` | `--background` | Core canvas color |
| **Cards / Elev.** | `#FFFFFF` | `--card` | Surfaces, modals, panels |
| **Primary Text** | `#1D1D1D` | `--primary-text` | Titles, body text, high contrast |
| **Secondary Text** | `#666666` | `--secondary-text` | Subtitles, labels, disabled statuses |
| **Accent Sage** | `#A8B5A0` | `--accent-sage` | Buttons, focus indicators, selection accents |
| **Borders** | `#E7EBE3` | `--border` | Dividers, inputs, card lines |

### 5.2 Tailwind CSS Configuration (`tailwind.config.ts`)

Configure tailwind as follows to lock down design values:

```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#FAFAF7",
        card: {
          DEFAULT: "#FFFFFF",
          foreground: "#1D1D1D",
        },
        foreground: "#1D1D1D",
        primary: {
          DEFAULT: "#1D1D1D",
          foreground: "#FAFAF7",
        },
        secondary: {
          DEFAULT: "#666666",
          foreground: "#FAFAF7",
        },
        accent: {
          sage: {
            DEFAULT: "#A8B5A0",
            foreground: "#1D1D1D",
          },
        },
        border: "#E7EBE3",
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "Inter", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
      },
      borderRadius: {
        xl: "12px",
        lg: "8px",
        md: "6px",
      },
      boxShadow: {
        soft: "0 2px 12px -2px rgba(29, 29, 29, 0.04), 0 4px 20px -4px rgba(29, 29, 29, 0.02)",
        elevation: "0 1px 3px rgba(29, 29, 29, 0.05), 0 10px 24px -8px rgba(29, 29, 29, 0.04)",
      },
    },
  },
  plugins: [],
};
export default config;
```

### 5.3 Style Constraints
*   **Forbidden Styles**:
    *   No heavy gradients (e.g. `bg-gradient-to-r from-blue-500 to-indigo-500`).
    *   No glassmorphism (no `backdrop-blur-md bg-white/30`).
    *   No neon effects, glow shadows, or bright saturated primary accents.
*   **Required Styling**:
    *   Cards must use: `bg-card border border-border rounded-xl shadow-soft`.
    *   Buttons must use solid text or muted fills (e.g., solid primary background `#1D1D1D` with white text, or outline variants with `#E7EBE3` borders).
    *   Typography: Keep typography weights light/normal (`font-light` or `font-normal` for headings) while emphasizing contrast through large sizes and minimal padding details.
    *   All interactive elements must feature subtle hover transitions (`transition-all duration-200 ease-in-out`).

---

## 6. Authentication, Authorization & Security

Attendify utilizes **Better Auth** as the security foundation.

### 6.1 Authentication Setup & Session Handling
Better Auth handles native session persistence via secure HTTP-Only cookies.
*   Session validation helper (`lib/auth.ts`):

```typescript
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { db } from "@/lib/db";

export const auth = betterAuth({
  database: prismaAdapter(db, {
    provider: "postgresql",
  }),
  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "EMPLOYEE",
      },
      isActive: {
        type: "boolean",
        defaultValue: true,
      },
      organizationId: {
        type: "string",
        required: false,
      },
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24,     // Update session every 24 hours
  },
});
```

### 6.2 Strict Role-Based Access Control (RBAC)
We enforce role constraints at both the routing level (Next.js Middleware) and programmatic access levels (Route Handlers/Server Actions).

#### Next.js Route Guarding:
*   `ADMIN` Role: Access to user configuration, system properties, global analytics, configurations, and payroll structures.
*   `EMPLOYEE` Role: Access to personal dashboards, checking in/out, view own past logs, and viewing own payroll details.

#### Access Control Guard Utility (`server/auth-guards.ts`):
```typescript
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { Role } from "@prisma/client";

export async function getSessionOrThrow() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user) {
    throw new Error("UNAUTHORIZED");
  }

  if (!session.user.isActive) {
    throw new Error("USER_INACTIVE");
  }

  return session;
}

export async function validateRole(allowedRoles: Role[]) {
  const session = await getSessionOrThrow();
  if (!allowedRoles.includes(session.user.role as Role)) {
    throw new Error("FORBIDDEN");
  }
  return session;
}
```

---

## 7. Code Quality & Technical Integrity

### 7.1 Absolute Type Safety
*   Never write `any` types. If a boundary format is complex, define it explicitly or use `unknown` with runtime validators (Zod).
*   API returns must be statically typed. Define shared TypeScript interfaces for payload responses to prevent API misalignment.

### 7.2 API Handler Pattern
All Next.js Route Handlers must validate payloads, catch errors cleanly, and return standard JSON.

*Template Handler (`app/api/v1/attendance/clock-in/route.ts`):*
```typescript
import { NextResponse } from "next/server";
import { getSessionOrThrow } from "@/server/auth-guards";
import { clockInSchema } from "@/server/validators/attendance";
import { recordClockIn } from "@/server/services/attendance-service";
import { ZodError } from "zod";

export async function POST(req: Request) {
  try {
    // 1. Authenticate & Authorize
    const session = await getSessionOrThrow();
    const userId = session.user.id;

    // 2. Parse and Validate Request Payload
    const body = await req.json();
    const parsedData = clockInSchema.parse(body);

    // 3. Execute Service Business Logic
    const attendanceRecord = await recordClockIn(userId, parsedData);

    // 4. Return Standard Success Response
    return NextResponse.json({
      success: true,
      data: attendanceRecord,
    }, { status: 201 });

  } catch (error) {
    // 5. Unified Error Response handling
    if (error instanceof ZodError) {
      return NextResponse.json({
        success: false,
        error: "Validation failed",
        details: error.flatten().fieldErrors,
      }, { status: 400 });
    }

    const message = error instanceof Error ? error.message : "Internal Server Error";
    const status = message === "UNAUTHORIZED" ? 401 : message === "FORBIDDEN" ? 403 : 500;

    return NextResponse.json({
      success: false,
      error: message,
    }, { status });
  }
}
```

### 7.3 Component Design & Composition Rules
1.  **Server Components by Default**: Avoid adding `"use client"` unless the component explicitly needs event listeners (e.g. `onClick`), React Hooks (`useState`, `useEffect`), or custom contexts.
2.  **Compound Component Composition**: When building advanced forms or grids, decompose elements into small components inside the card (e.g., `<AttendanceCard.Header>`, `<AttendanceCard.ClockBtn>`).
3.  **Forwarding Refs**: Custom reusable primitives must support standard utility props and correctly forward DOM references to underlying UI elements using React's `forwardRef`.

---

## 8. Development Verification Checklist
Before submitting features or closing tasks, verify the implementation meets these rules:
- [ ] No compilation warnings or `any` usages in the code.
- [ ] API routes verified with client validation schemas (Zod).
- [ ] Role check wrappers active on all protected action paths.
- [ ] Theme checks: Checked backgrounds are `#FAFAF7`, lines are `#E7EBE3`, cards are pure `#FFFFFF`, buttons are sage `#A8B5A0` or core darks `#1D1D1D`.
- [ ] No gradient or neon assets exist in styled UI screens.
