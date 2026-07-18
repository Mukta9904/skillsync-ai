# AI Interview Strategy - Frontend

Production-oriented React client for an AI-assisted interview-preparation workflow. Authenticated users can submit a job description with a resume or profile summary, review generated interview strategies, revisit previous reports, and download a tailored resume as a PDF.

> **Deployment status:** the app builds successfully for production. Before publishing, configure the API origin and ensure the backend permits the deployed frontend origin; the current source uses a localhost API URL (see [Configuration](#configuration)). `npm run lint` currently reports existing source-quality errors, so linting should be resolved and enforced in CI before a production release.

## Features

- Cookie-based registration, login, logout, and session restoration.
- Route protection for the dashboard and individual interview reports.
- Job-description analysis with a PDF/DOCX resume upload or manual profile summary.
- Generated match score, skill-gap indicators, technical and behavioral questions, and a preparation roadmap.
- Report history and report-detail routes.
- Client-triggered download of a generated resume PDF.
- Responsive UI, light/dark theme controls, Tailwind CSS, Lucide icons, and Framer Motion transitions.

## Technology

| Area | Implementation |
| --- | --- |
| Framework | React 19, Vite 8 |
| Routing | React Router 7 |
| Styling | Tailwind CSS 4 |
| HTTP | Axios with `withCredentials: true` |
| UI motion/icons | Framer Motion, Lucide React |
| Code quality | ESLint 10 |

## Quick start

**Prerequisites:** Node.js 20.19+ or 22.12+ (required by Vite 8), npm, and the companion backend running locally.

```bash
cd Frontend
npm ci
npm run dev
```

Vite prints the local URL (normally `http://localhost:5173`). The backend is expected at `http://localhost:3000` by default.

## Scripts

```bash
npm run dev      # Start the Vite development server
npm run build    # Create an optimized production bundle in dist/
npm run preview  # Serve the built bundle locally
npm run lint     # Run ESLint across the project
```

## Configuration

The two Axios clients currently define their API origin directly:

- `src/features/auth/services/auth.api.js`
- `src/features/interview/services/interview.api.js`

Both use `http://localhost:3000` and send cookies on cross-origin requests. For a deployable configuration, replace this with a Vite environment value, for example `import.meta.env.VITE_API_BASE_URL`, and provide it through `.env.production` or your hosting platform. Do not commit environment files containing secrets.

Because authentication uses cookies, production must use HTTPS and the API must be configured with the exact frontend origin, credentialed CORS, and appropriately scoped `Secure`/`SameSite` cookies. The bundled backend currently allowlists local Vite origins only, so its CORS configuration also needs a deployed-origin update.

## API contract

All requests target the configured API origin and include cookies.

| Method | Endpoint | Purpose |
| --- | --- | --- |
| POST | `/api/auth/register` | Create an account |
| POST | `/api/auth/login` | Start a session |
| GET | `/api/auth/logout` | End a session |
| GET | `/api/auth/get-me` | Restore the current user |
| POST | `/api/interview/` | Submit `jobDescription`, `selfDescription`, and optional `resume` multipart file |
| GET | `/api/interview/` | List the signed-in user's reports |
| GET | `/api/interview/report/:interviewId` | Get one report |
| POST | `/api/interview/resume/pdf/:interviewReportId` | Receive a resume PDF blob |

The UI accepts `.pdf` and `.docx` resume files and presents a 5 MB limit; enforce the same limit and file validation server-side.

## Application routes

| Route | Access | Screen |
| --- | --- | --- |
| `/login` | Public | Sign in |
| `/register` | Public | Account creation |
| `/` | Authenticated | Create and browse interview strategies |
| `/interview/:interviewId` | Authenticated | Strategy details and PDF resume download |

## Project structure

```text
src/
├── app.routes.jsx                    # Browser routes and guards
├── App.jsx                           # Provider composition and router
├── features/
│   ├── auth/                         # Session context, APIs, forms, route guard
│   └── interview/                    # Report state, API client, dashboard and report view
├── index.css                         # Tailwind import
└── main.jsx                          # React entry point
```

## Release checklist

- Set a production API base URL; remove hard-coded localhost origins.
- Update backend CORS and cookie settings for the deployed frontend domain.
- Run `npm ci`, `npm run lint`, and `npm run build` in CI; fix the current lint findings before treating the release as production-ready.
- Deploy `dist/` to static hosting and configure an SPA rewrite to `index.html` so direct links such as `/interview/:interviewId` work.
- Validate login, protected-route redirects, multipart uploads, report loading, and PDF download against the production API.
- Review the externally hosted Unsplash authentication-page images for availability, performance, and licensing requirements.
