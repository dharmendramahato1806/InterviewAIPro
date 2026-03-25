# InterviewAI Pro (Next.js Version)

This is a unified InterviewAI Pro platform built entirely using Next.js, where both the application logic and UI are handled within a single codebase.
## Getting Started

1.  **Clone/Open the project** in the `interviewai-next` directory.
2.  **Install dependencies**:
    ```bash
    npm install
    ```
3.  **Set up environment variables**:
    The `.env` file should contain your `GROQ_API_KEY` and `GEMINI_API_KEY`.
4.  **Run the development server**:
    ```bash
    npm run dev
    ```
5.  Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

- `app/`: Contains the Next.js App Router pages and components.
  - `components/`: React components (Setup, Interview, Verdict, Loading).
  - `api/`: API Routes (Resume parsing, AI analysis, evaluations).
  - `utils/`: Utility functions for AI communication.
- `public/`: Static assets.

## Features

- **Resume-Aware Interviewing**: The AI reads your uploaded resume to ask personalized questions.
- **Dynamic Questions**: Follow-up questions are generated on the fly based on your previous answers.
- **AI Assessment**: Each answer is evaluated by AI, and a final verdict with scores and feedback is provided.
- **Voice Response**: Integrated speech recognition for hands-free answering.
