# AI Support Dashboard

An intelligent, automated support dashboard that uses AI and NLP to efficiently manage, analyze, and respond to support queries received via email. This project combines a React frontend with a Node.js backend, leveraging OpenAI for smart response generation and natural language processing for analytics.

## Features

- **Automated Email Ingestion:** Connects to your support mailbox, fetches new/unread emails, and processes them in real-time.
- **AI-Powered Responses:** Uses OpenAI to generate contextually relevant and professional replies to support queries.
- **Sentiment & Priority Analysis:** Applies NLP to determine sentiment (positive, neutral, negative) and priority (urgent/normal) for incoming emails.
- **Info Extraction:** Extracts contact details, requirements, and sentiment indicators from email content.
- **Knowledge Base Integration:** Matches queries against a knowledge base for quick, relevant answers, improving with usage statistics.
- **Analytics Dashboard:** Tracks key support metrics, including resolved/pending counts, sentiment breakdown, and category-wise statistics.
- **Socket.io Integration:** Enables real-time updates and notifications for the frontend.
- **Bulk Operations:** Perform batch status updates and manage emails efficiently.

## Tech Stack

- **Frontend:** React + Vite
- **Backend:** Node.js, Express
- **Database:** MongoDB
- **AI/NLP:** OpenAI API, Natural Language Processing (via `natural` library)
- **Email:** IMAP for fetching, Nodemailer for sending responses
- **Real-time:** Socket.io

## Setup

### Prerequisites

- Node.js and npm
- MongoDB instance
- OpenAI API Key
- Email account credentials (IMAP/SMTP access)

### Backend

```sh
cd backend
npm install
# Configure MongoDB, OpenAI, and email settings in environment variables or config files
npm start
```

### Frontend

```sh
cd frontend
npm install
npm run dev
```

### Configuration

- Update `backend/src/config/email.js` with your IMAP and SMTP settings.
- Add your OpenAI API key to your environment variables.

## Folder Structure

- `backend/` — Node.js API server, email and AI services, analytics, error handling.
- `frontend/` — React dashboard for visualizing support stats, managing emails, and interacting with AI suggestions.

## Key Backend Services

- **aiService.js:** Handles AI-powered response generation and knowledge base queries.
- **analysisService.js:** Performs sentiment analysis, priority detection, info extraction.
- **emailService.js:** Manages email fetching, parsing, categorization, response, and stats.

## API Endpoints (Examples)

- `GET /api/emails` — List all emails
- `GET /api/emails/fetch` — Fetch new emails
- `PUT /api/emails/:id` — Update email (response/status)
- `POST /api/emails/:id/send` — Send reply
- `GET /api/analytics/stats` — Get analytics/statistics

## Customization & Extensibility

- Expand the knowledge base for smarter answers.
- Add new analytics or dashboard widgets as needed.
- Integrate with other support channels or ticketing systems.

## License

MIT

---

**Contributors:**  
- [RahulChauhan-2002](https://github.com/RahulChauhan-2002)

Feel free to open issues or pull requests for feature suggestions and bug reports!
