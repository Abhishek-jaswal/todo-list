# TaskFlow ✅

A modern, full-stack todo application built with React, TypeScript, and PocketBase — featuring real-time data sync, user authentication, dark/light mode, and a clean responsive UI.

**Live Demo → [abhishek-todolist.vercel.app](https://abhishek-todolist.vercel.app)**

---

## Screenshots

> Dark Mode &nbsp;|&nbsp; Light Mode

*(Add screenshots here)*

---

## Features

- 🔐 **User Authentication** — Secure sign up / login via PocketBase Auth (supports OAuth2)
- 🌙 **Dark & Light Mode** — System-aware with manual toggle, preference saved to localStorage
- ✅ **Full CRUD** — Create, edit, complete, and delete tasks
- 🎯 **Priority Levels** — High / Medium / Low with color-coded indicators
- 📅 **Due Dates** — Overdue detection with visual warnings
- 🔍 **Filter & Sort** — Filter by priority, due today; sort by created date or due date
- 💫 **Smooth Animations** — Powered by Framer Motion for fluid transitions
- 📱 **Responsive Design** — Works seamlessly on mobile and desktop
- ☁️ **Cloud Storage** — All tasks synced to PocketBase (PostgreSQL-backed)

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + TypeScript |
| Styling | Inline styles with CSS-in-JS tokens |
| Animations | Framer Motion |
| Backend | PocketBase (self-hosted on AWS EC2) |
| Database | PocketBase (SQLite) |
| Hosting | Vercel (frontend) · AWS EC2 (backend) |
| Auth | PocketBase Auth + OAuth2 |

---

## Getting Started

### Prerequisites

- Node.js 18+
- A running PocketBase instance

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/taskflow.git
cd taskflow

# Install dependencies
npm install

# Create environment file
cp .env.example .env
```

### Environment Variables

Create a `.env` file in the root:

```env
VITE_POCKETBASE_URL=https://your-pocketbase-url.com
```

### Run Locally

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## PocketBase Setup

### 1. Create the `tasks` collection

In your PocketBase Admin (`/_/`), create a collection called `tasks` with these fields:

| Field | Type | Required |
|-------|------|----------|
| `text` | Text | ✅ |
| `completed` | Bool | ✅ |
| `priority` | Select (`Low`, `Medium`, `High`) | |
| `due_date` | Text | |
| `user` | Relation → users | ✅ |

### 2. Set collection rules

Under **API Rules**, set all rules to only allow authenticated users to access their own records:

```
@request.auth.id != "" && user = @request.auth.id
```

### 3. Add your frontend domain to allowed origins

Go to **Settings → Application** and add:
```
https://your-vercel-app.vercel.app
```

---

## Project Structure

```
src/
├── components/
│   ├── TodoApp.tsx       # Main app shell, state management
│   └── TaskCard.tsx      # Individual task card component
├── context/
│   └── AuthContext.tsx   # Auth state & logout logic
├── lib/
│   └── pocketbase.ts     # PocketBase client instance
└── main.tsx
```

---

## Deployment

### Frontend (Vercel)

```bash
npm run build
# Push to GitHub → import repo on vercel.com → auto-deploys on every push
```

### Backend (AWS EC2 + PocketBase)

PocketBase is self-hosted on an AWS EC2 instance and managed as a systemd service for reliability:

```bash
# SSH into your EC2 instance and set up PocketBase as a service
sudo nano /etc/systemd/system/pocketbase.service
sudo systemctl enable pocketbase
sudo systemctl start pocketbase
```

---

## Roadmap

- [ ] Drag and drop task reordering
- [ ] Task categories / labels
- [ ] Email reminders for due tasks
- [ ] Subtasks / checklists
- [ ] Collaborative task sharing

---

## Author

**Abhishek** — [@yourgithub](https://github.com/Abhishek-jaswal)

---

## License

MIT © Abhishek