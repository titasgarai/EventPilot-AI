# EventPilot AI ✈️✨
> **GenAI-Powered Event Planning Assistant for Google PromptWars Challenge 2026**
> 
> *"Your AI Project Manager for Any Event"*

[![React](https://img.shields.io/badge/React-18.3-61dafb?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178c6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.0-646cff?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-38b2ac?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Gemini](https://img.shields.io/badge/Google%20Gemini-1.5%20Flash-8e75ff?logo=google&logoColor=white)](https://ai.google.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## 🌟 Executive Summary

**EventPilot AI** is a real, production-ready web application built for the **Google PromptWars Challenge**. It transforms basic event details into a complete, actionable, deeply personalized event plan containing:

1. **Smart Budget Planning & AI Optimizer**: Automatically allocates funds across 9 core categories with real-time recalculation and Gemini-powered cost reduction advice.
2. **Phase-Driven Timeline & 7-Day Sprint Planner**: Sequences tasks from 6 months before to event day with an intelligent 7-day action sprint generator.
3. **Vendor Management & Missing Category Discovery**: Tracks bookings, contacts, and fees, and identifies overlooked vendor categories.
4. **Contextual AI Ideas & Inspiration**: Generates bespoke cultural, culinary, decor, activity, and budget-saving concepts grounded in the event's location, theme, and budget.
5. **Grounded AI Project Manager Chatbot**: A calm, authoritative event planning consultant with full access to live budget, tasks, timeline, guest count, and theme.
6. **Live Gemini Integration + Zero-Failure Demo Mode**: Works natively with Google Gemini API (`gemini-1.5-flash`), with graceful fallback to rich simulated contextual responses if no API key is provided.

---

## 📂 Repository Structure

The codebase is organized following clean architectural principles, modular component design, TypeScript strict typing, and `@/*` path aliases:

```
EventPilot AI/
├── .github/
│   └── workflows/
│       └── ci.yml                # GitHub Actions Continuous Integration workflow
├── src/
│   ├── components/               # Reusable UI component modules
│   │   ├── common/               # Shared UI elements
│   │   │   ├── ApiKeyModal.tsx   # Google Gemini key configuration modal
│   │   │   ├── Modal.tsx         # Accessible backdrop dialog component
│   │   │   ├── Navbar.tsx        # Top navigation with event switcher & AI status
│   │   │   ├── ProgressBar.tsx   # Animated progress visualizer
│   │   │   ├── Sidebar.tsx       # Persistent desktop navigation & countdown pill
│   │   │   ├── StagedGenerationModal.tsx # Multi-step AI animation modal
│   │   │   ├── StatCard.tsx      # Dashboard KPI metric cards
│   │   │   ├── Toast.tsx         # Non-intrusive alert toast manager
│   │   │   └── index.ts          # Barrel export for common components
│   │   ├── events/               # Event management dialogs
│   │   │   ├── MyEventsModal.tsx # Multi-event switcher, duplicator, & manager
│   │   │   └── index.ts
│   │   └── index.ts              # Root components barrel export
│   ├── data/                     # Sample datasets and pre-loaded templates
│   │   ├── demoEvent.ts          # Authentic Bengali wedding demo dataset
│   │   └── index.ts
│   ├── services/                 # External service integrations
│   │   ├── gemini.ts             # Google Gemini GenAI SDK client & fallback engine
│   │   └── index.ts
│   ├── types/                    # Core domain TypeScript interfaces
│   │   └── index.ts              # Event, Budget, Task, Vendor, Idea models
│   ├── utils/                    # Helper functions and client storage
│   │   ├── formatters.ts         # Currency (₹, $, €), dates, and progress math
│   │   ├── storage.ts            # LocalStorage persistence manager
│   │   └── index.ts
│   ├── views/                    # Application pages / views
│   │   ├── AIAssistantView.tsx   # Context-aware event planning chat assistant
│   │   ├── AIIdeasView.tsx       # Categorized creative idea generator & favorites
│   │   ├── BudgetView.tsx        # Expense tracker & "Optimize My Budget" engine
│   │   ├── CreateEventView.tsx   # 4-step event creation wizard with AI generation
│   │   ├── DashboardView.tsx     # Executive event command center & charts
│   │   ├── EventDetailsView.tsx  # Event overview & editable specifications
│   │   ├── LandingPage.tsx       # High-conversion marketing landing page
│   │   ├── TimelineView.tsx      # Milestone timeline & "Plan My Next 7 Days"
│   │   ├── VendorsView.tsx       # Vendor directory & "Find Missing Vendors"
│   │   └── index.ts              # Views barrel export
│   ├── App.tsx                   # Main application router and state coordinator
│   ├── index.css                 # Tailwind CSS styles and scrollbar aesthetics
│   ├── main.tsx                  # React DOM root entry point
│   └── vite-env.d.ts             # Vite environment typings
├── .env.example                  # Environment configuration template
├── .gitignore                    # Standard Git exclusions
├── index.html                    # Single Page Application HTML shell
├── LICENSE                       # MIT License
├── package.json                  # Dependencies & npm scripts
├── postcss.config.js             # PostCSS Tailwind plugins
├── tailwind.config.js            # Custom design tokens, colors & keyframes
├── tsconfig.json                 # TypeScript compiler options & `@/*` path mapping
├── tsconfig.node.json            # Node TypeScript configuration
└── vite.config.ts                # Vite bundler, path aliases & code-splitting
```

---

## 🏗️ Architectural Flow

```
┌────────────────────────────────────────────────────────┐
│                   USER CREATES EVENT                   │
│        (Type, Date, Location, Guests, Budget, Style)   │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│               GOOGLE GEMINI 1.5 FLASH                  │
│       • Structured JSON System Prompt                  │
│       • Staged Loading Progress Callback               │
│       • Zero-Failure Contextual Fallback               │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│                 GENERATED EVENT BLUEPRINT              │
│    • 9-Category Budget  • 7-Phase Timeline             │
│    • Curated Vendors    • Bespoke Ideas & Insights     │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│                   EXECUTIVE DASHBOARD                  │
│   • Recharts Visuals   • Live Countdown Timer          │
│   • Multi-Event Hub    • LocalStorage Persistence      │
└──────────────┬───────────────────────────┬─────────────┘
               │                           │
               ▼                           ▼
┌───────────────────────────┐ ┌──────────────────────────┐
│   SPECIALIZED AI TOOLS    │ │  AI PROJECT MANAGER CHAT │
│ • "Optimize My Budget"    │ │ • Grounded in event state│
│ • "Plan Next 7 Days"      │ │ • Actionable consultant  │
│ • "Find Missing Vendors"  │ │ • Prompt shortcut chips  │
└───────────────────────────┘ └──────────────────────────┘
```

---

## 🚀 Getting Started

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/your-username/eventpilot-ai.git
cd eventpilot-ai
npm install
```

### 2. Configure Environment (Optional)
```bash
cp .env.example .env
```
Add your free Gemini API key:
```env
VITE_GEMINI_API_KEY=AIzaSy...
```
*(If left empty, EventPilot AI automatically runs in Demo Mode with full-fidelity contextual responses!)*

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 4. Build for Production
```bash
npm run build
```
Generates an optimized, code-split bundle in `dist/`.

---

## 🏆 Key Competition Highlights

1. **Clean Code & Modern Structure**:
   - Organized into domain folders (`components/`, `views/`, `services/`, `utils/`, `types/`, `data/`).
   - Clean barrel export index files for intuitive, readable imports.
   - Configured `@/*` path aliases.
2. **Real GenAI Integration**:
   - Structured JSON output with schema enforcement.
   - Staged AI generation modal demonstrating prompt engineering and reasoning phases.
3. **Zero-Failure Reliability**:
   - Graceful offline/missing key simulation engine guaranteeing the app never displays a broken screen during live competition judging.

---

## 📄 License
This project is licensed under the [MIT License](LICENSE).
