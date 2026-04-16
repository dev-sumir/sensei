# Sensie 🧠

Sensie is a professional, high-performance AI workspace designed to help you interact with, query, and extract insights from your PDF documents seamlessly. Built with a modern, 100vh sliding-panel architecture and powered by **Google Gemini 2.5 Flash**, it delivers a deeply immersive and premium document-chat experience.

## ✨ Features

- **Dynamic Workspace Layout:** A modern, scrolling-free 100vh app shell featuring intuitive left and right sliding panels, offering a highly professional desktop aesthetic.
- **Lightning Fast Optimistic UI:** Chats feel instantaneous. Your messages appear the millisecond you hit Enter, while the AI responds with a smooth, native "Typewriter" effect.
- **Rich Markdown Rendering:** Sensie understands and beautifully renders complex AI output, including code blocks, bold text, headings, and lists directly in the chat window.
- **Integrated PDF Preview:** Don't just read the chat. Sensie features a built-in PDF viewer panel that utilizes native "Fit Width" capabilities so you can read along as the AI explains the document.
- **Smart Quota System:** Includes a built-in Free Tier tracker and backend security layer, limiting users to a pristine set of 5 active conversations to prevent API abuse.
- **Drag & Drop Upload:** A beautiful, responsive drop zone replaces standard file uploaders, supporting immediate PDF ingest and chunked vector embedding.

## 🛠 Tech Stack

- **Frontend:** React, TypeScript, Vite
- **Styling:** Vanilla CSS with custom Dark/Neon aesthetics and *Space Grotesk* futuristic typography
- **Backend:** FastAPI (Python)
- **AI Models:** 
  - `gemini-embedding-001` (Document Vectorization)
  - `gemini-2.5-flash` (Conversational Intelligence)
- **Database:** Supabase (PostgreSQL pgvector & Secure Storage Buckets)

## 🚀 Local Setup

### 1. Clone the repository
```bash
git clone https://github.com/dev-sumir/sensei.git
cd sensei
```

### 2. Backend Environment
Navigate to the `backend` directory, install dependencies, and start the FastAPI server:
```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
```
*Note: Ensure you create a `.env` file with your `GEMINI_API_KEY`, `SUPABASE_URL`, and `SUPABASE_SERVICE_KEY` before starting.*
```bash
uvicorn app.main:app --reload
```

### 3. Frontend Environment
Open a new terminal, navigate to the `frontend` directory, and start the React dev server:
```bash
cd frontend
npm install
npm run dev
```

## 🔒 License
MIT License.
