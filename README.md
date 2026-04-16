# sensie

`sensie` is a full-stack PDF explainer app with a React frontend and a FastAPI backend. Users sign in with Google or GitHub via Supabase, upload PDFs, and chat with one active PDF at a time while keeping previous PDFs and chat history available after login.

## Stack

- Frontend: React + Vite + TypeScript
- Backend: FastAPI + asyncpg
- Auth, storage, and database: Supabase
- Embeddings and answers: Gemini API
- Retrieval: Supabase Postgres + `pgvector`

## Project Structure

- `frontend/`: React app
- `backend/`: FastAPI app, SQL schema, ingestion and retrieval logic
- `backend/supabase_schema.sql`: database schema and row-level security policies

## Supabase Setup

1. Create a Supabase project.
2. Enable Google and GitHub providers in `Authentication > Providers`.
3. Create a public site URL for local development:
   - `http://localhost:5173`
4. Create a storage bucket named `pdfs`.
5. Run the SQL in `backend/supabase_schema.sql`.
6. Make sure the `vector` extension is enabled in the database.

## Environment Variables

Copy these example files and fill in real values:

- `frontend/.env.example` -> `frontend/.env`
- `backend/.env.example` -> `backend/.env`

Frontend variables:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_API_URL`
- `VITE_SUPABASE_STORAGE_BUCKET`

Backend variables:

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_DB_URL`
- `GEMINI_API_KEY`
- `FRONTEND_URL`
- `SUPABASE_STORAGE_BUCKET`

## Run Locally

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Backend

Create a Python virtual environment, install dependencies, then start FastAPI:

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -e .
uvicorn app.main:app --reload
```

The frontend runs on `http://localhost:5173` and the backend runs on `http://localhost:8000`.

## Main App Flow

1. User signs in with Google or GitHub using Supabase OAuth.
2. The frontend sends the Supabase bearer token to FastAPI.
3. FastAPI validates the token with Supabase and syncs the user profile.
4. User uploads a PDF through the backend.
5. The backend stores the PDF in Supabase Storage, extracts text, chunks it, embeds it with Gemini, and stores the vectors in Postgres.
6. Chat requests are scoped to the selected `document_id`.
7. Messages are saved so the user can reopen the document and continue later.

## Notes

- The app keeps one active PDF selected in the UI at a time.
- Previous PDFs and chat histories remain accessible from the sidebar.
- The backend currently uses one persisted conversation per user/document pair.

## Checks

Frontend:

```bash
cd frontend
npm run build
```

Backend:

```bash
cd backend
python -m compileall app
pytest
```

