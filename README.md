# Route53 Clone

A functional clone of the AWS Route53 console — recreating the DNS management
**user experience** (hosted zones, records, navigation, search, pagination,
modals) with real persistence, rather than implementing actual DNS resolution.

Built for the Scaler SDE Fullstack Assignment.

- **Frontend:** Next.js 16 (App Router, TypeScript, Tailwind CSS)
- **Backend:** FastAPI (Python)
- **Database:** SQLite (via SQLAlchemy ORM)

---

## 1. Setup Instructions

### Prerequisites
- Node.js 20.9+ (Node 22 LTS recommended)
- Python 3.11+
- npm

### Backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt

uvicorn app.main:app --reload --port 8000
```

The API is now running at `https://route53-clone-isc4.onrender.com`.
Interactive API docs (Swagger UI): `https://route53-clone-isc4.onrender.com/docs`

On first run, it automatically:
- Creates `route53.db` (SQLite file) with all tables
- Seeds a demo user: **username `admin`, password `admin123`**

### Frontend

In a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Visit `http://localhost:3000`. It talks to the backend at the URL configured
in `frontend/.env.local` (defaults to `https://route53-clone-isc4.onrender.com`).

Log in with `admin` / `admin123`.

### Running both at once

Two terminals, one for each command above. There's no monorepo tooling — this
keeps things simple and matches the `frontend/` + `backend/` structure
required by the assignment.

---

## 2. Architecture Overview

```
┌──────────────────┐        HTTP / JSON        ┌──────────────────┐        ┌──────────────┐
│   Next.js (TS)   │  ───────────────────────►  │     FastAPI      │  ────► │    SQLite     │
│  (frontend/)     │  ◄───────────────────────  │   (backend/)     │  ◄──── │ route53.db   │
└──────────────────┘                             └──────────────────┘        └──────────────┘
```

**Frontend (`frontend/`)**
- Next.js App Router, one route per screen (`src/app/**/page.tsx`)
- `src/lib/api.ts` — a single Axios instance that attaches the session token
  to every request and redirects to `/login` on a 401
- `src/lib/auth-context.tsx` — React context wrapping login/logout state,
  persisted to `localStorage` so a page refresh keeps you logged in
- `src/lib/toast-context.tsx` — global toast notifications for
  create/update/delete feedback
- `src/components/layout/` — `TopNav`, `SideNav`, `AppShell` (auth guard +
  page chrome), styled to resemble the real AWS Console (navy top bar,
  orange primary buttons, blue links)
- `src/components/ui/` — shared building blocks: `Modal`, `ConfirmDialog`,
  `Pagination`, `SearchInput`, `Badge`, `PageHeader`, `EmptyState`
- `src/components/zones/`, `src/components/records/` — feature-specific
  create/edit forms

**Backend (`backend/`)**
- `app/main.py` — FastAPI app, CORS, table creation, demo user seed
- `app/models.py` — SQLAlchemy ORM models (`User`, `HostedZone`, `DNSRecord`)
- `app/schemas.py` — Pydantic request/response schemas (validation)
- `app/auth.py` — mocked bearer-token auth dependency
- `app/routers/` — one router per resource (`auth_router`, `zones`, `records`)
- `app/database.py` — SQLite engine/session setup

**Why this split:** the frontend never touches the database directly — every
read/write goes through the FastAPI layer, which is the only thing that owns
the SQLite file. This mirrors how the real Route53 console talks to AWS's
backend APIs rather than a database directly.

---

## 3. Database Schema

Three tables, all in `backend/route53.db`:

### `users`
| Column | Type | Notes |
|---|---|---|
| id | string (UUID) | primary key |
| username | string | unique |
| password | string | plaintext — mocked auth only, not for production |
| session_token | string | set on login, cleared on logout; nullable |
| created_at | datetime | |

### `hosted_zones`
| Column | Type | Notes |
|---|---|---|
| id | string (UUID) | primary key |
| domain_name | string | e.g. `example.com`, unique |
| comment | text | optional description |
| zone_type | string | `Public` or `Private` |
| record_count | integer | denormalized count, kept in sync on record CRUD |
| created_at | datetime | |
| updated_at | datetime | |

### `dns_records`
| Column | Type | Notes |
|---|---|---|
| id | string (UUID) | primary key |
| hosted_zone_id | string | foreign key → `hosted_zones.id`, cascades on delete |
| name | string | e.g. `www.example.com` |
| record_type | string | one of `A, AAAA, CNAME, TXT, MX, NS, PTR, SRV, CAA` |
| value | text | record value(s), newline-separated for multi-value records |
| ttl | integer | seconds, default 300 |
| routing_policy | string | default `Simple` |
| created_at | datetime | |
| updated_at | datetime | |

**Relationship:** one `HostedZone` → many `DNSRecord` (`ON DELETE CASCADE` —
deleting a zone deletes its records). Just like real Route53, creating a
hosted zone automatically creates an `NS` record for it.

---

## 4. API Overview

Base URL: `https://route53-clone-isc4.onrender.com`. All routes except `/api/auth/login` and
`/api/health` require an `Authorization: Bearer <token>` header.

### Auth
| Method | Path | Description |
|---|---|---|
| POST | `/api/auth/login` | Exchange username/password for a session token |
| POST | `/api/auth/logout` | Invalidate the current session token |
| GET | `/api/auth/me` | Get the current logged-in user |

### Hosted Zones
| Method | Path | Description |
|---|---|---|
| GET | `/api/hosted-zones?search=&page=&page_size=` | List zones (searchable, paginated) |
| POST | `/api/hosted-zones` | Create a zone |
| GET | `/api/hosted-zones/{zone_id}` | Get one zone |
| PUT | `/api/hosted-zones/{zone_id}` | Update comment / type |
| DELETE | `/api/hosted-zones/{zone_id}` | Delete a zone (and its records) |

### DNS Records (nested under a zone)
| Method | Path | Description |
|---|---|---|
| GET | `/api/hosted-zones/{zone_id}/records?search=&record_type=&page=&page_size=` | List records (searchable, filterable by type, paginated) |
| POST | `/api/hosted-zones/{zone_id}/records` | Create a record |
| GET | `/api/hosted-zones/{zone_id}/records/{record_id}` | Get one record |
| PUT | `/api/hosted-zones/{zone_id}/records/{record_id}` | Update a record |
| DELETE | `/api/hosted-zones/{zone_id}/records/{record_id}` | Delete a record |

Full interactive documentation with request/response schemas is auto-generated
by FastAPI at `/docs` (Swagger) and `/redoc`.

---

## 5. What's implemented vs mocked

**Fully implemented (persisted in SQLite):**
- Login / logout / session persistence (survives page refresh)
- Hosted Zones: create, view, edit, delete, search, pagination
- DNS Records: create, view, edit, delete, search, filter by type, pagination
- Toast notifications on every create/update/delete
- Confirmation modal before destructive deletes

**Mocked (placeholder "Coming soon" pages, per assignment scope):**
- Dashboard, Traffic Policies, Health Checks, Resolver, Profiles
- IAM / AWS Accounts / Organizations / Billing — not present, out of scope

---

## 6. Deployment notes

- **Frontend:** deploys cleanly to Vercel — set `NEXT_PUBLIC_API_URL` to your
  deployed backend URL as an environment variable.
- **Backend:** deploys to any host that runs a long-lived Python process
  (Render, Railway, Fly.io). SQLite is a single file, so make sure your host
  gives you persistent disk (not ephemeral storage) if you want data to
  survive restarts/redeploys.
# route53-clone
