# Stud — Universal Career Operating System & Learning Tracker 🎓🚀

> **The all-in-one personal operating system to structure, track, and master any course, career roadmap, coding practice, and job hunt.**

Whether you are preparing for **Software Engineering**, **Product Management**, **Data Science**, **AI/ML Engineering**, **UX/UI Design**, or tracking any university or self-paced online course, **Stud** gives you a unified command center.

---

## 🌟 Why Stud?

Most learners juggle bookmarks across YouTube, spreadsheets for job applications, Notion for notes, and external timers for study sessions. 

**Stud replaces that fragmentation with a single, offline-first operating system:**

| Problem | Stud Solution |
| :--- | :--- |
| **Scattered course videos & notes** | Centralized, phase-by-phase roadmaps with direct 1-click resource links |
| **Losing study momentum** | 7-day study momentum velocity curve + habit consistency tracking |
| **Interview unreadiness** | 4-layer career readiness index combining practice, theory, and habits |
| **Disorganized job search** | Interactive Kanban board tracking applications from wishlist to offer |
| **Inconsistent focus** | Built-in Pomodoro focus timer that automatically logs minutes to your stats |
| **Fragmented portfolios** | Built-in Resume Vault, PRD / Case Study builder, and networking CRM |

---

## 🗺️ Supported Career Tracks & Custom Courses

Stud includes pre-configured tracks for 10 major technical and product paths, and allows full customization for any course:

- 🎯 **Product Management** — Product discovery, user interviews, roadmap prioritization, and business models.
- 🤖 **AI Product Management** — LLM system architecture, AI product requirements (PRDs), evaluation, and ethics.
- 💻 **Software Engineering** — Data structures, algorithms, system design, and coding interview prep.
- 🔧 **Backend Engineering** — Scalable API design, relational/NoSQL databases, microservices, and security.
- 🖥️ **Frontend Engineering** — Modern component architecture, responsive glassmorphism UI, and performance.
- 📊 **Data Science** — Statistical analysis, Python, machine learning algorithms, and predictive modeling.
- ⚙️ **Machine Learning Engineering** — Deep learning, PyTorch, model deployment, pipelines, and MLOps.
- 📈 **Data Analytics** — Advanced SQL, BI dashboarding, cohort retention analysis, and executive storytelling.
- 🎨 **UX/UI Design** — Design thinking, Figma prototyping, usability testing, and design systems.
- ☁️ **DevOps & Cloud** — CI/CD pipelines, Docker, Kubernetes, infrastructure-as-code, and cloud monitoring.
- 📚 **Custom Courses & Bootcamps** — Add your own syllabus, milestones, and deliverables for any degree or certification.

---

## ⚡ Core Features

### 1. 📅 Milestone Roadmaps & Sprint Trackers
- Structured phases with deliverables, milestones, and daily study formulas (Watch & Learn ⏱️ 30m, Hands-on Practice 🛠️ 60m, Review & Save 📝 30m).
- 1-click external links directly to YouTube courses, documentation, and tools.

### 2. 📊 Dynamic Performance & Momentum Analytics
- **⚡ 7-Day Study Momentum**: Spline curve measuring your focus velocity against your weekly targets.
- **🎯 Career Readiness Index**: Concentric multi-ring chart measuring mastery across domain architecture, practical documentation, problem solving, and habits.
- **🔥 Daily Habit Consistency**: Habit streak tracking with zero-friction daily checkboxes.

### 3. 💼 Career Application Pipeline (Kanban Board)
- Track opportunities across pipeline stages: `Wishlist` ➔ `Applied` ➔ `OA / Screen` ➔ `Interview` ➔ `Offer` ➔ `Archived`.
- Real-time interview response rate calculations and offer counters.

### 4. 💻 Coding Practice Suite (130+ Curated Problems)
- Master algorithms and technical questions categorized by topic, difficulty, and role tags.
- Track attempt history and solutions directly within the app.

### 5. ⏱️ Deep Work & Focus Timer
- Integrated Pomodoro focus timer with floating mini-player and fullscreen modal.
- Focus sessions are automatically persisted into your personal analytics and weekly velocity graph.

### 6. 📁 Career Vault, PRDs & Networking CRM
- **📄 Resume Vault**: Version-controlled resumes mapped to specific target roles.
- **📑 PRD & Case Study Builder**: Draft clean product requirements or technical case studies with instant Markdown export.
- **🤝 Networking CRM**: Track recruiter and mentor outreach with 30-day stale contact nudges.

---

## 🏗️ Architecture & Tech Stack

- **Framework**: React Native, Expo 51, React Native Web.
- **Language**: TypeScript (Strict Mode).
- **Styling**: Vanilla CSS tokens, Liquid Glass aesthetics, skeuomorphic controls, dark mode, responsive layouts (Mobile, Tablet, Desktop).
- **Storage / Database**: 
  - **Offline-First**: Dexie.js (IndexedDB) for instant local updates without latency.
  - **Cloud Sync**: Supabase (PostgreSQL, Row Level Security, Edge Functions, Storage).
- **Data Visualizations**: React Native SVG with smooth Bezier spline paths and radial multi-ring meters.

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
   *(Note: Stud runs 100% offline out-of-the-box using local IndexedDB, even without Supabase credentials).*

4. **Start the development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:8081](http://localhost:8081) in your browser.

---

## 📜 Available Scripts

| Command | Action |
| :--- | :--- |
| `npm run dev` | Starts the web development server |
| `npm start` | Starts the Expo interactive runner (Web, iOS, Android) |
| `npm run lint` | Runs TypeScript type checking (`tsc --noEmit`) |
| `npm run build` | Exports the production static web bundle |

---

## 🔒 Security & Data Privacy

- **Safe By Default**: All user progress, focus sessions, and notes are stored securely in client-side IndexedDB.
- **Zero Secret Leaks**: All confidential keys, credentials, and `.env` files are strictly isolated from source control.
- **Portability**: Full JSON backup export and restore available under Settings.
