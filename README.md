# Stud — AI PM Journey Tracker 🚀

> **A Personal Career Operating System for Aspiring AI Product Managers.**

Stud is a cross-platform operating system designed to guide, structure, and track your transition into a world-class AI Product Manager. It provides an end-to-end framework: from daily study routines and milestone deliverables to job application tracking, networking CRM, and deep work focus sessions.

---

## 🌟 Key Features

### 📅 30-Day AI PM Sprint Track
- **Curated 4-Week Journey**: Structured into 4 progressive phases:
  1. *Product Fundamentals & User Research* (Days 1–7)
  2. *PRDs, Roadmaps, Prioritization & Figma* (Days 8–14)
  3. *SQL, Product Analytics & A/B Testing* (Days 15–21)
  4. *AI Product Management & Portfolio* (Days 22–30)
- **Daily 3-Step Formula**:
  - ⏱️ **30 min**: Watch & Learn (Curated video lessons & guides)
  - 🛠️ **60 min**: Hands-on Practice (Apply concepts directly to Stud)
  - 📝 **30 min**: Review & Save (Document decisions & submit deliverable)
- **1-Click External Links**: Direct links to top industry YouTube lessons, Product School guides, and framework templates.

### 📊 Real-Time Analytics & Career Readiness
- **⚡ 7-Day Study Momentum**: Visual velocity spline chart tracking focus minutes logged and topics completed against your weekly goal.
- **🎯 Career Readiness Index**: Concentric multi-ring chart measuring mastery across *AI Architecture*, *PRDs & Discovery*, *Coding Practice*, and *Habit Consistency*.
- **💼 Application Kanban & Funnel**: Job tracker with pipeline stages (*Wishlist*, *Applied*, *OA / Screen*, *Interview*, *Offer*, *Archived*) and interview response rate metrics.

### ⏱️ Deep Work & Focus Engine
- **Floating & Fullscreen Pomodoro Timer**: Seamlessly track study sprints.
- **Auto-Logging**: Completed focus sessions are stored and graphed in your weekly momentum analytics.

### 📁 Career Vault & Networking CRM
- **📄 Resume Vault**: Version-controlled resume storage mapped to target job roles.
- **🤝 Networking CRM**: Track recruiter and mentor outreach with follow-up nudges and quick contact adding.
- **📑 PRD Builder**: Markdown-enabled product requirement documentation editor.

---

## 🏗️ Architecture & Tech Stack

- **Frontend**: React Native, Expo 51, React Native Web, TypeScript (Strict Mode).
- **Design System**: Liquid Glass aesthetics, skeuomorphic controls, dark mode, responsive layouts (Mobile, Tablet, Desktop).
- **Local Storage / Offline-First**: Dexie.js (IndexedDB) with instant local updates and zero latency.
- **Backend / Cloud**: Supabase (PostgreSQL, Row Level Security, Edge Functions, Cloud Storage).
- **Visualization**: React Native SVG, custom Bezier spline curves, multi-ring radial charts.

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/kshekhawat214-cloud/Stud.git
   cd Stud
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Copy the example environment file and add your Supabase credentials:
   ```bash
   cp .env.example .env
   ```
   Edit `.env`:
   ```env
   EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   ```
   *(Note: The application includes full offline-first database fallback and will function locally even without remote Supabase credentials).*

4. **Start the development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:8081](http://localhost:8081) in your browser.

---

## 📜 Available Scripts

| Command | Action |
| :--- | :--- |
| `npm run dev` | Starts the Expo web development server |
| `npm start` | Starts the Expo interactive CLI (Web, iOS, Android) |
| `npm run lint` | Type-checks the codebase (`tsc --noEmit`) |
| `npm run build` | Exports the production static bundle |

---

## 🔒 Security & Privacy

All local user data, progress tracking, and session histories are stored client-side in IndexedDB via Dexie. Environment keys, tokens, and sensitive credentials are excluded from source control via `.gitignore`.
