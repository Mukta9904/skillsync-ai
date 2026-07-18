# SkillSync AI

SkillSync AI is a full-stack interview-preparation application. Users can create an account, submit a job description and resume, and receive an AI-generated interview strategy tailored to that role.

The generated report includes a match score, skill gaps, technical and behavioral interview questions, and a seven-day preparation roadmap. Users can also download an ATS-focused resume PDF tailored to the target job.

## Features

- Secure account registration, login, logout, and protected routes using JWT cookies.
- Resume PDF upload and text extraction.
- Gemini-powered job-to-profile analysis.
- Match score and prioritized skill-gap analysis.
- Technical and behavioral questions with interviewer intent and answer guidance.
- Seven-day interview preparation plan.
- Saved report history per user.
- Tailored resume PDF generation and download.
- Responsive React interface with light/dark themes and animations.

## Tech stack

| Layer | Technologies |
| --- | --- |
| Frontend | React, Vite, React Router, Tailwind CSS, Axios, Framer Motion, Lucide |
| Backend | Node.js, Express, Mongoose, JWT, bcryptjs |
| Database | MongoDB |
| AI | Google GenAI (Gemini) |
| Document processing | Multer, pdf-parse, Puppeteer |

## Project structure

```text
Project/
├── Frontend/                 # React + Vite web application
│   └── src/features/         # Authentication and interview features
├── Backend/                  # Express API
│   └── src/
│       ├── controllers/      # Authentication and report controllers
│       ├── models/           # MongoDB schemas
│       ├── routes/           # API endpoints
│       ├── services/         # Gemini and PDF-generation services
│       └── middlewares/      # JWT and file-upload middleware
└── README.md
```

## Prerequisites

- Node.js 20+ and npm
- A MongoDB database
- A Google GenAI API key with access to the configured Gemini models

## Getting started

### 1. Configure and start the backend

```bash
cd Backend
npm install
```

Create `Backend/.env`:

```dotenv
PORT=3000
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>
JWT_SECRET=<long-random-secret>
GOOGLE_GENAI_API_KEY=<your-google-genai-api-key>
```

`MONGODB_URI` should be the MongoDB cluster URI without the database name; the API uses the `skillsyncai` database.

Start the API:

```bash
npm run dev
```

The backend runs at `http://localhost:3000` by default.

### 2. Start the frontend

Open another terminal:

```bash
cd Frontend
npm install
npm run dev
```

Open the Vite URL shown in the terminal, normally `http://localhost:5173`.

## How to use

1. Register an account or sign in.
2. Paste a detailed job description.
3. Upload a resume PDF and optionally add a short profile summary.
4. Generate the interview strategy.
5. Review the match score, skill gaps, question sets, and preparation roadmap.
6. Download the tailored resume PDF from the report page.

## API endpoints

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/api/auth/register` | Create an account |
| `POST` | `/api/auth/login` | Sign in and receive a session cookie |
| `GET` | `/api/auth/logout` | Sign out |
| `GET` | `/api/auth/get-me` | Get the active user |
| `POST` | `/api/interview/` | Generate an interview report from multipart form data |
| `GET` | `/api/interview/` | List the signed-in user's reports |
| `GET` | `/api/interview/report/:interviewId` | Retrieve a report |
| `POST` | `/api/interview/resume/pdf/:interviewReportId` | Generate a tailored resume PDF |

## Notes

- The frontend and backend are currently configured for local development (`localhost:5173` and `localhost:3000`). Update CORS, cookie settings, and API base URLs before deployment.
- The backend currently parses uploaded resumes as PDFs. Use a PDF resume even though the UI also displays a DOCX option.
- Keep `.env` files and API keys out of version control.

## Available scripts

```bash
# Backend
cd Backend
npm run dev

# Frontend
cd Frontend
npm run dev
npm run build
npm run lint
npm run preview
```

## License

This project is licensed under the ISC License.
