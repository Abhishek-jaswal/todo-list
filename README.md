# 📝 Supabase To-Do App

A modern full-stack To-Do List built with **React**, **TypeScript**, and **Supabase**. It includes priority tagging, due date reminders, dark mode, advanced filters, and mobile-friendly UX.

---

## 🚀 Features

- ✅ User authentication with Supabase Auth
- 🏷️ Task priority (High / Medium / Low)
- 🗓️ Due date support
- 🌑 Dark mode toggle (with persistence)
- 📊 Filters:
  - Filter by Priority
  - Filter due today
- 🧮 Sorting:
  - Sort by `created_at` or `due_date`
  - Ascending or Descending
- 📱 Mobile responsive UI
- 🧹 Task management:
  - Mark as complete/incomplete
  - Edit text, due date, priority
  - Delete task (with confirmation)
- 🔔 Ready for Due Date Notifications (via Supabase Edge Functions)

---

## 📦 Tech Stack

| Tech        | Purpose                |
|-------------|------------------------|
| React + TS  | Frontend UI & logic    |
| Supabase    | Auth, Database, Edge   |
| TailwindCSS | Styling                |

---

## 📂 Project Structure

src/
├── components/
│ ├── TodoApp.tsx // Main app logic
│ └── TaskCard.tsx // Task UI card
├── context/
│ └── AuthContext.tsx // Auth provider
├── supabase.ts // Supabase client setup

---

## 🛠️ Setup Instructions

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/todo-app.git
cd todo-app
```

## Install dependencies

```bash
npm install
1. Configure Supabase
Create a .env.local file with:

VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-anon-key
Make sure your Supabase project includes a tasks table:

create table tasks (
  id bigint generated always as identity primary key,
  text text,
  completed boolean default false,
  user_id uuid,
  created_at timestamp default now(),
  priority text,
  due_date date,
  reminder_sent boolean default false
);
```

## Run the app

```bash
npm run dev
```

## 📸 Screenshots

## Light Mode Dark Mode

## 📱 Mobile UI

- Fully responsive layout

- Optimized spacing and stacking on small screens

## 👨‍💻 Author

## Abhishek Jaswal

- 📧 <abhishekjaswal1122@gmail.com>
- 🔗 Portfolio
