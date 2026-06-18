# 🎙️ AI Meeting Notes Summarizer

This is an **AI-powered meeting notes tool** that records your voice in real time,
transcribes it live in the browser, and generates a clean structured summary using
**Anthropic Claude AI**. It supports both live audio recording and pasted transcripts,
with summaries broken into Overview, Key Points, Decisions, Action Items, and Next Steps.

This project was **independently developed** as a portfolio and production-ready
full-stack application, deployed on [Render](https://render.com) with secure
API key proxying and zero-build frontend architecture.

---

![Node.js](https://img.shields.io/badge/backend-node.js-green?logo=node.js)
![Express](https://img.shields.io/badge/framework-express-black?logo=express)
![Claude API](https://img.shields.io/badge/AI-Anthropic%20Claude-blueviolet?logo=anthropic)
![Speech API](https://img.shields.io/badge/speech-Web%20Speech%20API-orange)
![Deployment](https://img.shields.io/badge/deployed%20on-render-blueviolet?logo=render)
![Status](https://img.shields.io/badge/status-production--ready-brightgreen)
![License](https://img.shields.io/badge/license-MIT-blue)

---

## 🔗 Live Demo

🌐 [Open App on Render](https://your-app-name.onrender.com)

---

## 📌 Project Highlights

- 🎙️ **Live speech-to-text** recording via Web Speech API (Chrome / Edge)
- 📋 **Paste notes fallback** — works in all browsers
- 🤖 **AI summarization** via Anthropic Claude (claude-sonnet-4-6)
- 🔐 **Secure backend proxy** — API key stored in env variable, never in browser
- 🌙 **Auto dark mode** via CSS `prefers-color-scheme`
- ⚡ **Zero build step** — pure HTML / CSS / Vanilla JS frontend
- ☁️ **One-click deploy** to Render with environment variable support

---

## 🆕 Architecture Overview

| Feature | Approach |
|---|---|
| API Key Security | Stored in `.env`, proxied via Express — never touches the client |
| Frontend | Vanilla JS, no framework, no build step |
| AI Model | Anthropic Claude claude-sonnet-4-6 via `/api/summarize` endpoint |
| Speech Input | Web Speech API (live, in-browser transcription) |
| Fallback Input | Paste notes tab — works in Firefox, Safari, all browsers |
| Deployment | Render Web Service (free tier compatible) |
| Dark Mode | CSS `prefers-color-scheme` — automatic, no JS needed |

---

## 🎯 Technologies Used

- **Node.js + Express** — backend server and API proxy
- **Anthropic Claude API** — AI summarization engine
- **Web Speech API** — live in-browser speech transcription
- **HTML + CSS + Vanilla JS** — zero-dependency frontend
- **CSS Custom Properties** — theming and dark mode
- **Render** — cloud deployment
- **GitHub** — version control with `.env` protection

---

## 🗂 Project Structure

```
meeting-notes-summarizer/
├── public/
│   ├── index.html       # App markup
│   ├── style.css        # Styles + dark mode
│   └── app.js           # Frontend logic — no API key here
├── server/
│   └── index.js         # Express server + Claude proxy
├── .env.example         # Environment variable template (safe to commit)
├── .gitignore           # Excludes .env and node_modules
├── package.json
└── README.md
```

---

## 🔒 Security Architecture

```
Browser (public/app.js)
    │
    │  POST /api/summarize  { text: "..." }
    ▼
Express server (server/index.js)
    │  reads process.env.ANTHROPIC_API_KEY  ← stays here, never leaves
    │  POST api.anthropic.com/v1/messages
    ▼
Anthropic Claude API
    │  { summary: "<h3>...</h3>..." }
    ▼
Browser renders the structured summary
```

---

## 📄 License & Use

© 2025 Vishnu Jagadeesan
All rights reserved.

This project is a **portfolio and production prototype**.

### ❌ Restrictions

- No commercial use without approval
- No redistribution of code or design
- Not licensed for open-source contribution

> © 2025 Vishnu Jagadeesan — For academic, research, and portfolio use only.

---

## 🔗 Contact

- 📧 Email: [vishnujagadeesan10@gmail.com](mailto:vishnujagadeesan10@gmail.com)
- 💼 LinkedIn: [linkedin.com/in/vishnu-jagadeesan](https://www.linkedin.com/in/vishnu-jagadeesan/)
- 🌐 Portfolio: [vishnujagadeesan.com](https://vishnujagadeesan.com)
- 🐙 GitHub: [github.com/Vishnu-Jagadeesan](https://github.com/Vishnu-Jagadeesan)
