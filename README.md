<div align="center">

# 🧠 Orma — Your AI-Powered Digital Memory

### Transform the way you remember the web.

An AI-powered Chrome Extension that captures, understands, organizes, and retrieves everything you learn online.

![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react)
![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb)
![Groq](https://img.shields.io/badge/Groq-Llama%203-000000?style=for-the-badge)
![Chrome Extension](https://img.shields.io/badge/Chrome-Manifest%20V3-4285F4?style=for-the-badge&logo=googlechrome)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-06B6D4?style=for-the-badge&logo=tailwindcss)

---

### 🚀 Hackathon Project

*"Your Second Brain for the Internet."*

</div>

---

# 📖 Overview

**Orma** is an AI-powered Chrome Extension that acts as your **digital memory layer**.

Instead of saving traditional bookmarks, Orma intelligently captures webpage content, generates AI summaries, extracts key insights, organizes related knowledge, and allows users to search or chat with everything they've learned online.

Think of it as **ChatGPT for your own browsing history.**

---

# 🎯 Problem Statement

Every day we discover valuable information online.

Unfortunately:

- 📑 Bookmarks become messy.
- 📚 Notes lose their original context.
- 🔍 Finding old resources becomes difficult.
- 🧠 We forget where we learned something.

Traditional bookmarks only save links.

They don't remember knowledge.

---

# 💡 Solution

Orma transforms your browser into an AI-powered knowledge assistant.

Users can:

- Save webpages with one click
- Generate AI summaries
- Extract important keywords
- Organize knowledge automatically
- Search using natural language
- Chat with saved memories
- Build personal knowledge workspaces

---

# ✨ Features

## 📌 Smart Memory Capture

- Save webpages instantly
- Extract clean article content
- Store metadata
- Organize memories

---

## 🤖 AI Summary

Generate concise summaries using **Groq API (Llama 3)**.

---

## 🔍 Smart Search

Find information using natural language instead of remembering exact website names.

Example:

> "Show me the article about JWT Authentication."

---

## 💬 AI Chat

Ask questions like:

- Summarize everything about React.
- Compare MongoDB vs PostgreSQL.
- Show cybersecurity resources.

---

## 📂 Automatic Workspaces

Related memories are grouped automatically into projects like:

- AI Learning
- Web Development
- Research
- Hackathon
- University

---

# 🏗️ System Architecture

```text
Chrome Extension
        │
        ▼
Content Extraction
        │
        ▼
Node.js Backend
        │
        ▼
MongoDB Atlas
        │
        ▼
Groq API (Llama 3)
        │
 ┌──────┼───────────┐
 ▼      ▼           ▼
Summary Keywords AI Chat
```

---

# 🛠️ Tech Stack

| Category | Technology |
|-----------|------------|
| Frontend | React + Vite |
| Styling | Tailwind CSS |
| Backend | Node.js + Express.js |
| Database | MongoDB Atlas |
| Authentication | JWT |
| Browser Extension | Chrome Manifest V3 |
| AI | Groq API (Llama 3) |
| Search | Semantic Search |
| Deployment | Render + Vercel |

---

# 📁 Project Structure

```bash
Orma/
│
├── backend/
│   ├── controllers/
│   ├── routes/
│   ├── middleware/
│   ├── models/
│   ├── services/
│   ├── config/
│   └── server.js
│
├── frontend/
│   ├── src/
│   ├── pages/
│   ├── components/
│   ├── hooks/
│   └── assets/
│
├── extension/
│   ├── manifest.json
│   ├── background.js
│   ├── content.js
│   └── popup/
│
└── README.md
```

---

# ⚙️ Installation

## Clone Repository

```bash
git clone https://github.com/YOUR_USERNAME/Orma.git

cd Orma
```

---

## Install Backend

```bash
cd backend

npm install
```

---

## Install Frontend

```bash
cd frontend

npm install
```

---

## Environment Variables

Create a `.env` file inside the backend folder.

```env
PORT=5000

MONGODB_URI=your_mongodb_connection

JWT_SECRET=your_secret_key

GROQ_API_KEY=your_groq_api_key

GROQ_MODEL=llama-3.3-70b-versatile
```

---

## Start Backend

```bash
npm run dev
```

---

## Start Frontend

```bash
npm run dev
```

---

# 📱 Chrome Extension

1. Build the extension

```bash
npm run build
```

2. Open

```
chrome://extensions
```

3. Enable

```
Developer Mode
```

4. Click

```
Load Unpacked
```

5. Select

```
extension/
```

---

# 🤖 AI Workflow

```text
User Opens Webpage

↓

Click Save

↓

Extract Content

↓

Store in MongoDB

↓

Groq API

↓

AI Summary

↓

Keywords

↓

Smart Search

↓

AI Chat
```

---

# 📸 Screenshots

### Landing Page

> Add Screenshot Here

---

### Dashboard

> Add Screenshot Here

---

### Browser Extension

> Add Screenshot Here

---

### AI Chat

> Add Screenshot Here

---

# 🚀 Roadmap

- [x] Chrome Extension
- [x] AI Summaries
- [x] JWT Authentication
- [x] MongoDB Integration
- [x] Dashboard
- [x] Smart Search
- [x] AI Chat
- [ ] Browser Sync
- [ ] Team Collaboration
- [ ] Mobile App
- [ ] Offline AI

---

# 👥 Team

## 👩 Mahnoor Fatima

**Team Leader • Backend Developer • AI Developer**

- Backend Architecture
- AI Integration
- Authentication
- Memory Management
- AI Summary
- Smart Search
- AI Chat

---

## 👨 Abdullah

**Backend Developer**

- REST APIs
- Database
- CRUD Operations
- Testing
- Security

---

## 👨 Lokesh Kumar

**Frontend Developer**

- React UI
- Dashboard
- Search
- Chat
- Browser Extension UI

---

## 👨 Talha Abid

**Deployment Engineer**

- Deployment
- GitHub
- Environment Setup
- Documentation
- Production Testing

---

# 🌟 Future Scope

- Cross Browser Support
- Firefox Extension
- Mobile Application
- Team Workspaces
- Voice Notes
- Offline AI
- GitHub Integration
- Notion Integration
- Google Drive Integration

---

# 🤝 Contributing

Contributions, issues, and feature requests are welcome.

Feel free to fork the repository and submit a Pull Request.

---

# 📄 License

This project is developed for educational and hackathon purposes.

---

<div align="center">

## ⭐ If you like this project, don't forget to Star the repository!

Made with ❤️ by **Team Orma**

</div>
