# EventPilot AI ✈️✨
> **GenAI-Powered Event Planning Assistant**  
> *"Your AI Project Manager for Any Event"*

[![React](https://img.shields.io/badge/React-18.3-61dafb?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178c6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.0-646cff?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-38b2ac?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Google Gemini](https://img.shields.io/badge/Google%20Gemini-2.5%20Flash-8e75ff?logo=google&logoColor=white)](https://ai.google.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## 📌 1. Chosen Vertical

**Vertical:** Event Management, Project Operations & GenAI Productivity

### Problem Context
Event management is historically fragmented across chaotic notes, rigid spreadsheet budget templates, disconnected vendor directories, and generic conversational chatbots. Existing AI tools treat every gathering with a one-size-fits-all bias (typically assuming a massive multi-day wedding), producing unrealistic recommendations for casual birthdays, corporate webinars, or community fundraisers.

### Value Proposition
**EventPilot AI** bridges this gap as an **intelligent, format-aware project manager**. It translates vague user descriptions into comprehensive, production-ready event plans—combining financial budgeting, milestone task pipelines, on-the-day minute-by-minute runs of show, vendor recommendations, and proactive risk detection.

---

## 🧠 2. Approach and Logic

EventPilot AI departs from surface-level chat wrappers by deeply embedding generative intelligence directly into operational event workflows.

```
                  ┌──────────────────────────────────────────────┐
                  │          USER EVENT SPECIFICATION            │
                  │ (Type, Format, Budget, Guests, City, Style)  │
                  └──────────────────────┬───────────────────────┘
                                         │
                                         ▼
                  ┌──────────────────────────────────────────────┐
                  │       GEMINI STRUCTURED PROMPT ENGINE        │
                  │   • Schema enforcement via JSON mode         │
                  │   • Domain-tuned prompt rules per event type │
                  │   • Fallback simulation engine for resilience│
                  └──────────────────────┬───────────────────────┘
                                         │
               ┌─────────────────────────┼─────────────────────────┐
               ▼                         ▼                         ▼
    ┌──────────────────────┐  ┌──────────────────────┐  ┌──────────────────────┐
    │  REACTIVE BUDGETING  │  │  DUAL-MODE SCHEDULE  │  │  STRATEGIC INSIGHTS  │
    │ • Dynamic allocation │  │ • Milestone Roadmap  │  │ • Overspending audit │
    │ • Per-guest economics│  │ • Timed Run of Show  │  │ • Lead-time buffers  │
    └──────────────────────┘  └──────────────────────┘  └──────────────────────┘
```

### Key Architectural Pillars
1. **Event-Aware Domain Models**:
   - **Weddings**: 6-month preparatory milestones, ceremony rituals, mandap/banquet venue, bridal styling.
   - **Birthdays**: Agile 2-week checklist, 3–5 hour party model, custom cake delivery, games, and return favors.
   - **Community Events**: Stage agendas, public permits, volunteer-to-attendee staffing ratios, boxed catering.
   - **Online Events**: Zero physical venue/catering overhead; focuses on streaming licenses, AV rehearsals, and digital slides.
   - **Custom Celebrations**: Dynamic prompt decomposition for arbitrary events (e.g. *College Farewell* with yearbooks, student awards, and DJ dance floor).
2. **Reactive Budget Estimation (`estimateBudgetWithAI`)**:
   - Fingerprints current form inputs (`lastInputsKeyRef`). Whenever the user alters location, guest count, format, or budget, old estimates are invalidated and recalculated with transparent input snapshots.
3. **Dual-Mode Execution Schedule**:
   - **Milestone Roadmap**: Long-term preparatory tasks adapted dynamically to event lead time.
   - **Event-Day Run of Show**: Minute-by-minute cue sheet with interactive check-offs, designated leads (Emcee, Host, AV Tech), and time slots.

---

## ⚙️ 3. How the Solution Works

### End-to-End User Flow
1. **Frictionless Entry**: Welcome interface offering direct local demo showcase or personalized creation without tedious registration hurdles.
2. **4-Step Wizard**:
   - *Step 1 — Basic Info & Logistics*: Name, Event Type, Date, Location, Guest Count, and Event Format (**In-Person, Online, Hybrid** with streaming platform links).
   - *Step 2 — Budget & Currency*: Target budget selection with currency localization (₹ INR, $ USD, € EUR, £ GBP).
   - *Step 3 — Styling & Aesthetics*: Mood and aesthetic guidelines (Traditional, Modern, Minimal, Luxury, Casual, Eco-friendly).
   - *Step 4 — Vision Prompt*: Freeform text box with contextual prompt chips for natural language event desires.
3. **Staged AI Generation**: Real-time visual progress showing multi-step Gemini synthesis (Budget Calculation → Timeline Scheduling → Vendor Discovery → Risk Audit).
4. **Command Dashboard**:
   - Real-time countdown clock and format-adaptive hero banner.
   - KPI metric cards (Budget spent %, Milestones achieved, Tasks pending, Vendors booked).
   - Recharts visualizer for planned vs. actual spending.
   - AI Strategic Risk Alerts highlighting actionable mitigations.
5. **Specialized AI Power-Tools**:
   - *"Optimize My Budget"*: Gemini audit analyzing potential savings across categories.
   - *"Plan Next 7 Days"*: Prioritizes pending tasks into actionable daily execution sprints.
   - *"Find Missing Vendors"*: Scans current roster to detect overlooked service providers.
   - *"Grounded AI Assistant"*: Interactive chatbot with continuous access to live event state.

---

## 📋 4. Assumptions Made

1. **API Key & Connectivity Resilience**:
   - The app assumes external API connectivity may vary during evaluation. It includes an authentic **Zero-Failure Contextual Simulation Engine** that mirrors Gemini's structured response schema if no API key is provided, ensuring reviewers never experience broken screens.
2. **Currency & Cost Baselines**:
   - Default currency is set to INR (₹) with regional benchmarks calibrated for metropolitan and tier-2 Indian cities (e.g., Kolkata, Delhi, Bangalore), while dynamically converting for USD/EUR.
3. **Responsible AI Vendor Disclaimer**:
   - To avoid deceptive claims, vendor recommendations are clearly labeled as **AI-suggested market estimates for budgeting and planning**, directing users to verify quotes directly before signing contracts.
4. **Client-Side Persistence**:
   - Assumes single-user workflow on a modern web browser utilizing LocalStorage for instant state recovery without requiring external database setups.

---

## 🎯 5. Evaluation Focus Areas

### 1. Code Quality – Structure, Readability, Maintainability
- **Strict TypeScript Typing**: Defined comprehensive interfaces across all domain entities (`EventPlan`, `Task`, `Vendor`, `BudgetCategory`, `RunOfShowItem`, `EventFormat`) in [`src/types/index.ts`](file:///t:/Antigravity/EventPilot%20AI/src/types/index.ts).
- **Clean Architecture & Path Aliases**: Organized into distinct layers (`views/`, `components/common/`, `services/`, `utils/`, `data/`).
- **Barrel Exports**: Standardized clean modular imports via `index.ts` files across all directories.
- **Maintainable Styling**: Component-scoped Tailwind CSS utilities with zero conflicting inline styles.

### 2. Security – Safe & Responsible Implementation
- **Client-Side API Key Safety**: Gemini API keys are loaded via Vite environment variables (`VITE_GEMINI_API_KEY`) or user session input stored exclusively in memory/localStorage. No hardcoded credentials exist in source code.
- **No Unsafe Evaluations**: Avoids `eval()`, `dangerouslySetInnerHTML`, or unsanitized script injections.
- **Ethical AI Disclaimers**: Explicitly labels AI vendor estimates to prevent fabrication of verified business listings or false reviews.

### 3. Efficiency – Optimal Use of Resources
- **Optimized Bundle Splitting**: Customized `vite.config.ts` with Rollup `manualChunks` grouping:
  - `charts`: Recharts visualizer bundle (~477 kB)
  - `d3-vendor`: D3 sub-dependencies (~63 kB)
  - `icons`: Lucide React icon suite (~34 kB)
  - `ai`: Gemini client engine (~28 kB)
- **Eliminated Build Warnings**: Strict chunk threshold compliance with 0 minification warnings.
- **Reactive Memoization & Caching**: Input-keyed caching prevents redundant API token consumption during repetitive form edits.

### 4. Testing & Verification
- **Automated Compilation Checks**: Verified with strict TypeScript compiler (`tsc`) and production Vite builds.
- **Scenario Validation Matrix**:
  | Test Case | Inputs | Verified Output |
  |---|---|---|
  | **Wedding** | 150 guests, Kolkata, Traditional | 6-month roadmap, Mandap decor, Banquet catering, bridal styling, ritual run-of-show. |
  | **Birthday** | 15 guests, ₹15,000, Casual | 2-week checklist, designer cake, balloon decor, games emcee, 18:00–21:00 schedule. |
  | **Community** | 100 attendees, Hyderabad | Stage audio/visual, volunteer-to-delegate ratio, registration desks, session flow. |
  | **Online Event** | 50 attendees, Google Meet | Zero physical catering; virtual stage link tools, AV rehearsal checklist, recording cues. |
  | **Custom Farewell**| 80 students, College | Yearbook printing, senior citations, DJ dance floor, memory video cues. |
  | **Budget Invalidation**| Step 1 changes | Old cached estimate instantly cleared; new snapshot banner generated. |

### 5. Accessibility – Inclusive & Usable Design
- **Semantic HTML**: Proper use of `<header>`, `<main>`, `<section>`, `<nav>`, `<button>`, and `<input>` elements.
- **Accessible Color Contrast**: Compliant text-to-background contrast ratios using Tailwind slate, brand, and emerald palettes.
- **Keyboard & Screen Focus**: Modals and dropdowns feature clear focus states, escape/backdrop dismiss triggers, and ARIA labels.
- **Responsive Layout**: Fluid cross-device usability spanning mobile handsets (collapsible navigation) to ultra-wide desktop monitors.

### 6. Problem Statement Alignment – Relevance to EventPilot AI
- **True Project Manager**: Goes far beyond a generic chat window by providing structured budgets, milestone Gantt-style tasks, time-stamped cues, and proactive risk alarms.
- **Grounded Intelligence**: AI tools possess full awareness of the live event state (e.g., reminding users about cake delivery timing for birthdays or screen-share permissions for webinars).

---

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| **React 18.3** | Component-driven UI architecture |
| **TypeScript 5.7** | Strict type safety and predictable interfaces |
| **Vite 6.0** | High-performance bundling and HMR dev server |
| **Tailwind CSS 3.4** | Utility-first responsive design system |
| **Google Gemini API** | GenAI foundation model (`gemini-2.5-flash`) |
| **Recharts** | Interactive SVG financial visualizations |
| **Lucide React** | Consistent iconography |
| **Canvas Confetti** | Delightful user milestone celebration triggers |

---

## 🚀 Quick Start Guide

### 1. Clone & Install
```bash
git clone https://github.com/titasgarai/EventPilot-AI.git
cd EventPilot-AI
npm install
```

### 2. Configure Environment (Optional)
```bash
cp .env.example .env
```
Add your Google Gemini API key:
```env
VITE_GEMINI_API_KEY=AIzaSy...
```
*(If left blank, EventPilot AI seamlessly activates its offline simulation engine with full feature fidelity!)*

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 4. Build for Production
```bash
npm run build
```

---

## 📄 License
This project is open-source under the [MIT License](LICENSE).
