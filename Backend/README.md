# AI Interview Strategy API

Production-oriented Node.js API for AI-assisted interview preparation. It provides account sessions, generates interview strategies from a job description and candidate profile, stores reports in MongoDB, and produces AI-tailored resume PDFs.

> **Deployment status:** source files pass Node syntax validation. This repository is not yet production-ready as-is: it has no production start/test scripts, CORS permits local origins only, and several security and reliability actions listed in [Production hardening](#production-hardening) must be completed before public deployment.

## Capabilities

- User registration and login with bcrypt password hashing and one-day JWT cookie sessions.
- Logout token blacklist and optional session restoration endpoint.
- Authenticated interview-report generation using Gemini structured JSON output.
- PDF resume text extraction, with a 5 MB in-memory upload limit.
- Per-user report listing and report-detail retrieval.
- Tailored resume generation as a downloadable PDF using Puppeteer.
- MongoDB persistence for users, blacklisted tokens, and interview reports.

## Stack

| Area | Implementation |
| --- | --- |
| Runtime/API | Node.js, Express 5 |
| Database | MongoDB, Mongoose |
| Auth | JWT, HTTP-only cookies, bcryptjs |
| AI | Google GenAI SDK / Gemini (`gemini-3-flash-preview`) |
| Upload/PDF parsing | Multer memory storage, pdf-parse |
| PDF generation | Puppeteer |
| Validation | Zod and zod-to-json-schema |

## Prerequisites

- Node.js 20+ and npm.
- A MongoDB deployment reachable from the server.
- A Google GenAI API key with access to the configured Gemini model.
- System libraries required by Chromium/Puppeteer when deploying to a minimal Linux container or serverless platform.

## Setup

```bash
cd Backend
npm ci
```

Create a local `.env` file (never commit it):

```dotenv
PORT=3000
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>
JWT_SECRET=<a-long-random-secret>
GOOGLE_GENAI_API_KEY=<your-key>
```

`MONGODB_URI` should be the cluster/database prefix; the service appends the database name `skillsyncai`.

Start development mode:

```bash
npm run dev
```

The API listens on `PORT`, defaulting to `3000`.

## Environment variables

| Variable | Required | Description |
| --- | --- | --- |
| `PORT` | No | HTTP port; defaults to `3000`. |
| `MONGODB_URI` | Yes | MongoDB connection prefix. The application appends `/skillsyncai`. |
| `JWT_SECRET` | Yes | Secret used to sign and verify one-day session tokens. |
| `GOOGLE_GENAI_API_KEY` | Yes | Credential used for Gemini report and resume generation. |

## API overview

Protected routes require the `token` cookie. Browser clients must send credentials and the API must allow the exact client origin.

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| POST | `/api/auth/register` | Public | Creates a user from `username`, `email`, and `password`, then sets a session cookie. |
| POST | `/api/auth/login` | Public | Authenticates `email` and `password`, then sets a session cookie. |
| GET | `/api/auth/logout` | Public | Clears the session cookie and blacklists its token if present. |
| GET | `/api/auth/get-me` | Optional session | Returns the signed-in user or `user: null`. |
| POST | `/api/interview/` | Protected | Generates and persists a report from multipart fields and an optional `resume` upload. |
| GET | `/api/interview/` | Protected | Lists the current user's reports; content-heavy fields are omitted. |
| GET | `/api/interview/report/:interviewId` | Protected | Returns one report belonging to the current user. |
| POST | `/api/interview/resume/pdf/:interviewReportId` | Protected | Generates a tailored resume and returns `application/pdf`. |

### Generate a report

`POST /api/interview/` is `multipart/form-data` and accepts:

| Field | Required | Notes |
| --- | --- | --- |
| `jobDescription` | Yes | Non-empty target role description. |
| `selfDescription` | Conditional | Required when no extractable resume text is supplied. |
| `resume` | Conditional | Uploaded in memory, limited to 5 MB. The current parser expects PDF content. |

The saved report includes `title`, `matchScore`, technical and behavioral question arrays, `skillGaps`, a day-by-day `preparationPlan`, input data, ownership, and timestamps.

## Architecture

```text
src/
├── index.js                         # Environment loading, DB connection, HTTP startup
├── app.js                           # Express middleware, CORS, route mounting
├── controllers/                     # HTTP orchestration for auth and reports
├── db/                              # Mongoose connection
├── middlewares/                     # JWT/blacklist checks and Multer configuration
├── models/                          # User, report, and token-blacklist schemas
├── routes/                          # Public and protected API routes
└── services/ai.service.js           # Gemini prompts/schema and Puppeteer PDF rendering
```

## Production hardening

Complete these items before exposing the API publicly:

- Add a `start` script (for example `node src/index.js`), a test suite, linting, and CI checks; only `npm run dev` exists today.
- Replace the local-only CORS allowlist in `src/app.js` with an environment-driven list of exact production frontend origins. Keep `credentials: true`; do not use `*` with cookies.
- Set session cookies with `httpOnly: true`, `secure: true`, an explicit suitable `sameSite` value, expiry/max-age, and matching clear-cookie options. Serve all production traffic over HTTPS.
- Add centralized error handling and request validation. Several interview controller failures currently propagate to Express's default error handler.
- Restrict uploaded files by MIME type and verify their content. The frontend advertises DOCX support, but this backend sends every upload to `pdf-parse`; either implement DOCX extraction or accept PDFs only.
- Enforce body size limits, rate limiting, request timeouts, security headers (for example Helmet), structured logging, observability, and a health/readiness endpoint.
- **Fix PDF authorization:** `POST /api/interview/resume/pdf/:interviewReportId` currently fetches by report ID without also filtering by `req.user.id`. Scope that query to the current user to prevent cross-account report access.
- Sanitize or constrain model-produced HTML before passing it to Puppeteer, and put resource/concurrency limits around Chromium and Gemini requests.
- Set TTL cleanup on blacklisted-token records or use short-lived/revocable sessions; the current blacklist grows indefinitely.
- Use a managed secret store, rotate `JWT_SECRET` and GenAI keys, restrict database network access, and back up MongoDB.

## Deployment notes

Build this as a stateful API service, not a static site. Provide persistent MongoDB, outbound access to the Google GenAI API, and a Puppeteer-compatible Chromium runtime. Configure a reverse proxy/load balancer for TLS and forward the real protocol so secure cookies work correctly. The frontend must use the deployed API base URL and send requests with credentials.

## Verification

```bash
# Syntax validation for all source files
Get-ChildItem src -Recurse -Filter *.js | ForEach-Object { node --check $_.FullName }
```

This command passes for the current source tree. Functional testing still requires MongoDB and Google GenAI credentials.
