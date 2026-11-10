# CampusConnect — University Student Services Portal

[![Institution: Dublin Business School](https://img.shields.io/badge/Institution-Dublin_Business_School_(DBS)-0B2545?style=for-the-badge)](https://www.dbs.ie)
[![Module: B9IS130](https://img.shields.io/badge/Module-B9IS130_Web_Development-10B981?style=for-the-badge)](https://www.dbs.ie)
[![Programme: MSc Computing](https://img.shields.io/badge/Programme-MSc_in_Computing_with_IS-3B82F6?style=for-the-badge)](https://www.dbs.ie)
[![Status: Production Ready](https://img.shields.io/badge/Status-Production_Ready-emerald?style=for-the-badge)]()

> **CampusConnect** is a centralized, production-grade university student services and property recovery web application built for Dublin Business School (DBS). It replaces informal, disconnected social media posts and chat groups with an auditable, role-governed portal where students publish lost/found items, file ownership claims, and receive official campus security verification.

---

## 1. Executive Overview

### The Problem
University campus communities regularly misplace critical belongings—including student ID cards, laptops, keys, headphones, and study materials. Traditionally, students resort to noisy, unstructured channels (e.g. WhatsApp groups, Instagram stories, cork noticeboards), leading to:
- High noise-to-signal ratio and zero searchable history.
- Vulnerability to fraudulent ownership claims with no verification audit trail.
- Total lack of institutional administrative oversight and safe physical handover protocols.

### The CampusConnect Solution
CampusConnect delivers an end-to-end digital recovery lifecycle:
1. **Report:** Students publish structured lost or found notices with campus locations, categories, dates, and photos.
2. **Search & Filter:** Instant multi-parameter filtering by type, category, date, and debounced keyword search.
3. **Claim:** Genuine owners submit confidential claims describing identifying marks (e.g., serial numbers, engravings, phone wallpapers).
4. **Adjudicate:** Campus Security administrators evaluate claims, attach official collection instructions, and transition verified items to `claimed` status.

---

## 2. Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend Client** | **React 18**, **TypeScript**, **Vite**, **Tailwind CSS**, **React Router v6**, **Axios**, **React Hook Form**, **Zod**, **Lucide React** |
| **Backend API** | **Node.js**, **Express.js**, **TypeScript**, **Mongoose ODM**, **Zod**, **Morgan** |
| **Authentication & RBAC** | **JWT (JSON Web Tokens)**, **bcryptjs** (salted hashing, 10 rounds), Role-Based Access Control (`student` vs `admin`) |
| **Security & Hardening** | **Helmet** (HTTP headers), **CORS Whitelist**, **Express-Rate-Limit** (brute-force defense), Parameter Pollution & NoSQL Injection mitigation |
| **Testing Harness** | **Vitest**, **Supertest**, **mongodb-memory-server** |
| **API Documentation** | **Swagger UI / OpenAPI 3.0** (`/api/docs`) |
| **Cloud Deployment** | **Vercel** (Frontend SPA), **Render** (Node.js API), **MongoDB Atlas** (Cloud Database) |

---

## 3. System Architecture & Project Structure

The project employs a clean modular monorepo structure separating client presentation, backend business logic, and academic documentation:

```
campusconnect/
├── client/                     # Frontend Application (React 18 + Vite + Tailwind CSS)
│   ├── src/
│   │   ├── components/         # Atomic UI primitives, Layout, Listing Cards, Claim Modals
│   │   ├── context/            # AuthContext (JWT & User state), ToastContext
│   │   ├── pages/              # 14 distinct application pages
│   │   ├── services/           # Axios HTTP client, token interceptors, typed services
│   │   ├── types/              # Shared TypeScript models and interfaces
│   │   └── App.tsx             # Route definitions and route guards
│   ├── tailwind.config.js      # DBS branded design system
│   └── vite.config.ts          # Vite build config with /api proxy
│
├── server/                     # Backend REST API (Node.js + Express + TypeScript)
│   ├── src/
│   │   ├── config/             # DB connection, env validation, Swagger docs
│   │   ├── controllers/        # Request handling (Auth, Listings, Claims, Admin)
│   │   ├── middleware/         # JWT auth, RBAC role guard, Zod validator, Error handler
│   │   ├── models/             # Mongoose schemas (User, Listing, Claim)
│   │   ├── routes/             # REST API routes
│   │   ├── services/           # Pure business logic and database queries
│   │   ├── utils/              # Standard JSON envelope, token utilities, seed script
│   │   ├── validators/         # Zod schemas for input validation
│   │   ├── app.ts              # Express configuration
│   │   └── server.ts           # Server bootstrap & graceful shutdown
│   ├── tests/                  # Vitest integration test suites
│   └── tsconfig.json
│
├── render.yaml                 # Infrastructure-as-code for Render web service
├── package.json                # Monorepo root orchestrator (concurrent dev script)
└── README.md                   # Project documentation
```

---

## 4. Key Features & 14 Application Views

### Student Capabilities
1. **Landing Page (`/`):** Hero presentation, live counters, 3-step workflow, and recently reported campus items.
2. **Student Registration (`/register`):** Form with Zod validation and strict student role enforcement (users cannot self-register as admin).
3. **Authentication (`/login`):** JWT credential verification with quick-fill demo buttons for evaluators.
4. **Student Dashboard (`/dashboard`):** Overview metrics (Total Lost, Total Found, My Active Listings, My Claims) and quick actions.
5. **Catalog Browser (`/listings`):** Real-time text search, type toggles (All/Lost/Found), category filters, and pagination.
6. **Listing Details (`/listings/:id`):** High-resolution photo preview, item metadata, reporter attribution, and direct claim trigger.
7. **Create Listing (`/create-listing`):** Multi-field form for lost/found property with category and sample image presets.
8. **Edit Listing (`/edit-listing/:id`):** Update listing details or transition status to `claimed` (ownership verified).
9. **My Listings (`/my-listings`):** Personal inventory table with quick edit and deletion controls.
10. **My Claims (`/my-claims`):** Real-time claim status tracking (`pending`, `approved`, `rejected`) with administrative feedback.

### Administrator Capabilities (Campus Security)
11. **Admin Dashboard (`/admin/dashboard`):** Real-time KPI metrics, resolution rates, and pending claims queue.
12. **Listing Moderation (`/admin/listings`):** Campus-wide moderation table allowing status modification or deletion.
13. **Claims Review Console (`/admin/claims`):** Adjudication modal comparing claimant explanation against physical property, approving collections, or rejecting false claims.
14. **404 Not Found (`*`):** Accessible error view with return navigation.

---

## 5. Getting Started (Local Development)

### Prerequisites
- **Node.js:** v18.0.0 or higher (v24.6.0 verified)
- **npm:** v9.0.0 or higher
- **MongoDB:** A free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) connection URI or local MongoDB daemon.

### 1. Clone & Install Dependencies
Clone the repository and install root, server, and client dependencies:
```bash
# Clone repository
git clone https://github.com/your-username/CampusConnect.git
cd CampusConnect

# Install root dependencies
npm install

# Install server dependencies
cd server && npm install && cd ..

# Install client dependencies
cd client && npm install && cd ..
```

### 2. Configure Environment Variables
Create `.env` in `server/` (copy from `server/.env.example`):
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/campusconnect?retryWrites=true&w=majority
JWT_SECRET=campusconnect_development_secret_jwt_key_2026_dbs
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=1000
```

### 3. Seed Realistic University Demo Data
Populate the database with Dublin Business School test accounts and sample listings:
```bash
npm run seed
```
**Demo Accounts Seeded:**
- **Campus Security Admin:** `admin@campusconnect.dbs.ie` / `AdminPass2026!`
- **Student 1 (Ciaran):** `ciaran@student.dbs.ie` / `StudentPass2026!`
- **Student 2 (Aisling):** `aisling@student.dbs.ie` / `StudentPass2026!`

### 4. Run Both Applications Concurrently
From the root directory, start both the Express API and Vite React client simultaneously:
```bash
npm run dev
```
- **Frontend Client:** http://localhost:5173
- **Backend REST API:** http://localhost:5000
- **Interactive Swagger Docs:** http://localhost:5000/api/docs
- **Healthcheck Endpoint:** http://localhost:5000/health

---

## 6. REST API Endpoints

All API endpoints reside under `/api` and return standardized JSON envelopes:

### Authentication (`/api/auth`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register student (role forced to `student`) |
| `POST` | `/api/auth/login` | Public | Authenticate user & receive signed JWT |
| `GET` | `/api/auth/me` | Bearer Token | Retrieve authenticated user profile |

### Listings (`/api/listings`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/listings` | Public | Browse listings with search, type, category, date filters & pagination |
| `GET` | `/api/listings/:id` | Public | Retrieve detailed listing with populated owner profile |
| `POST` | `/api/listings` | Authenticated | Create a new lost or found listing |
| `PUT` | `/api/listings/:id` | Owner / Admin | Update listing details or status |
| `DELETE` | `/api/listings/:id` | Owner / Admin | Permanently delete listing |
| `GET` | `/api/listings/my-listings` | Authenticated | Retrieve authenticated student's listings |

### Claims (`/api/claims`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/claims` | Authenticated | Submit ownership proof for a found item |
| `GET` | `/api/claims/my-claims` | Authenticated | Retrieve student's submitted claims and statuses |
| `GET` | `/api/claims` | Admin Only | Retrieve all submitted claims across campus |
| `PATCH` | `/api/claims/:id/status` | Admin Only | Approve or reject claim with administrative note |

### Admin (`/api/admin`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/admin/dashboard` | Admin Only | Aggregate system KPI metrics |
| `GET` | `/api/admin/users` | Admin Only | Directory of registered campus accounts |
| `PATCH` | `/api/admin/users/:id/status` | Admin Only | Toggle user activation status |

---

## 7. Security & OWASP Defense Architecture

| Threat / Risk | Mitigating Countermeasure in CampusConnect |
|---|---|
| **A01: Broken Access Control** | Express `authorize('admin')` middleware enforces strict role access. Student registration explicitly overrides any supplied role to `student`. Listing update/delete routes verify ownership (`item.userId === req.user.id`) or admin status. |
| **A02: Cryptographic Failures** | Passwords hashed using `bcryptjs` with salt work factor 10. Passwords are excised from responses via Mongoose `toJSON` transforms. JWT tokens signed with SHA-256 and time-bounded expiration (`7d`). |
| **A03: Injection (NoSQL / SQL)** | Input payloads validated against strict Zod schemas before reaching the database. Mongoose type casting rejects object injection operators (`$ne`, `$gt`). |
| **A05: Security Misconfiguration** | Helmet middleware applies HTTP security headers (stripping `X-Powered-By`, configuring HSTS, Content-Security-Policy). CORS whitelist restricts external origins. |
| **A07: Identification Failures** | Express-rate-limit caps authentication attempts to prevent brute-force attacks on `/api/auth/login`. |

---

## 8. Automated Testing

The backend test suite is powered by **Vitest**, **Supertest**, and an in-memory MongoDB environment:
```bash
# Run server tests
npm --prefix server test

# Run in watch mode
npm --prefix server run test:watch
```
Automated test cases verify:
- Registration validation, duplicate email prevention, role escalation immunity.
- Credential authentication, token issuance, and protected profile access.
- Listing CRUD operations, search/filtering, and permission boundaries.
- Claim submission, duplicate prevention, and administrative status transitions.

---

## 9. Academic Assessment Information

- **Institution:** Dublin Business School (DBS)
- **Programme:** MSc in Computing with Information Systems
- **Module:** B9IS130 — Web Development for Information Systems
- **Assessment:** CA1 — Individual Project
- **Deadline:** 10 November 2026, 23:59
- **Marks Distribution:** Application (70%), Technical Report (20%), Presentation & Demonstration (10%)
- **Author:** Candidate MSc in Computing with Information Systems

---

## 10. License & Academic Integrity Notice
This project was developed strictly for academic evaluation at Dublin Business School. All code is original, modular, and adheres to DBS Academic Integrity and Ethics Guidelines.

