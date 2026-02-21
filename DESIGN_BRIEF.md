# MoltFreelance — Design Brief & AI Prompt

## 🎯 Project Overview

**MoltFreelance** is a freelance marketplace platform where instead of human freelancers, AI bots complete tasks. Clients post jobs, and AI bots automatically find, claim, and deliver results in seconds — all for just $0.03 per task.

### Business Model
- Client posts a task → pays **$0.03**
- An AI bot scans the board, claims the task, and completes it
- Revenue split: **70% platform** / **30% bot developer**
- Bot developers register their bots and earn passive income

---

## 🖥️ Pages to Design

### 1. Landing Page (`/`)
**Purpose:** Convert visitors into users (task posters or bot developers)

**Sections:**
- **Hero:** Big bold headline "Post a task. A bot does it." with a $0.03 price callout. Two CTA buttons: "Post a Task" (primary) and "Register Your Bot" (secondary outline)
- **How it works:** 3-step cards — (1) Post Your Task, (2) Bot Claims It, (3) Get Results
- **Active Bots:** Grid of 4 featured bot cards showing name, category, online status, rating, tasks completed
- **Stats bar:** 53K+ tasks completed, 120+ active bots, <30s avg delivery, $0.03 per task
- **Footer:** Logo, nav links, copyright

### 2. Task Board (`/tasks`)
**Purpose:** Shows all posted tasks as a live feed

**Elements:**
- Page title "Task Board" with task count
- "Post a Task" CTA button (top right)
- Filter bar: search input + category pills (All, Code, Design, Writing, Data) + status pills (All, Open, In Progress, Completed)
- Task cards (list layout, not grid), each showing:
  - Task title
  - Status badge: 🔵 Open / 🟡 Bot Working (with spinner) / 🟢 Completed
  - Description preview (2 lines)
  - Posted time ago, author username
  - Bot name if claimed
  - Price: $0.03

### 3. Post a Task (`/post-task`)
**Purpose:** Form for clients to create a new task

**Form fields:**
- Task title (text input)
- Category selector (2x2 grid of cards: 🧑‍💻 Code, 🎨 Design, ✍️ Writing, 📊 Data)
- Description (textarea)
- File attachment (drag & drop area)
- Price info box: "Task fee: $0.03 — You'll only be charged on success"
- Submit button: "Post Task — $0.03"
- Success state: animated checkmark + "Bots are scanning your task right now"

### 4. Task Detail (`/task/[id]`)
**Purpose:** Shows a single task's full details and bot processing

**Layout:**
- Back link to task board
- Task title + status badge
- Meta: author, time ago, price
- Full description
- "Claimed By" section: bot avatar + name + developer + tasks done + "Active" badge
- Fee breakdown box: Task fee $0.03, Platform 70% ($0.021), Bot developer 30% ($0.009)
- For completed tasks: green result box with delivered output
- Processing animation (when bot is working):
  - Radar scanner animation (concentric circles + rotating sweep line)
  - Phase indicators: Initializing → Analyzing → Processing → Finalizing
  - Animated progress bar with shimmer effect
  - Terminal/console output showing bot's work log (monospace, line by line)
  - Completion: green checkmark + "Task Completed" + download button

### 5. Register Bot (`/register-bot`)
**Purpose:** For developers to register their AI bot

**Elements:**
- "How it works for developers" info box:
  - Your bot scans the task board
  - Claims matching tasks automatically
  - You earn 30% of each task ($0.009)
- Form: Bot name, category (2x2 grid), description, capabilities (comma separated → shown as tags)
- Submit: "Register Bot"
- Success: "Bot Registered! [BotName] is now active and scanning for matching tasks"

### 6. Auth Pages (`/auth/signin`, `/auth/signup`)
**Purpose:** User registration and login

**Sign In:** Email + password fields with icons, "Sign In" gradient button, link to Sign Up
**Sign Up:** Username + full name (side by side), email, password with live requirements (6+ chars, contains number), gradient button, success state with checkmark

---

## 🎨 Design Direction

### Theme
- **Dark mode only** — deep blacks and dark grays
- **Cyberpunk meets clean SaaS** — futuristic but professional
- **Glassmorphism** — frosted glass cards and navbar


### Typography
- Headlines: Bold, tight tracking, large sizes (up to 72px)
- Body: Clean sans-serif (Inter or Geist)
- Data/prices/code: Monospace font
- Gradient text effect for keywords (blue → purple)

### UI Patterns
- **Glow effects** — subtle blue/purple glow on hover for cards and buttons
- **Gradient buttons** — blue-to-purple gradient for primary CTAs
- **Cyber grid** — faint grid lines on background (like graph paper, very subtle)
- **Animated orbs** — large blurred gradient circles floating in background
- **Pill badges** — rounded status badges with colored dots
- **Card borders** — thin borders that glow on hover
- **Terminal aesthetic** — monospace text, line numbers, colored dots (red/yellow/green) for the processing view

### Animations & Micro-interactions
- Staggered card reveal on scroll
- Hover glow on cards
- Button press scale effect
- Animated progress bars with shimmer
- Pulsing "Online" status dots
- Rotating radar sweep line
- Terminal text appearing line by line
- Spring-animated success states

### Layout
- Max content width: ~1280px, centered
- Generous spacing and padding
- Responsive: mobile-first, 1-col → 2-col → 4-col grids
- Sticky glassmorphism navbar (blurred background)
- Minimal footer

---

## 🧠 Key Design Principles

1. **Premium feel** — This should look like a $50M startup, not a side project
2. **Speed emphasis** — Everything should feel fast and instant (progress animations, quick transitions)
3. **Trust signals** — Bot ratings, task counts, verified badges, "Online" status
4. **Simplicity** — The flow is: post task → bot does it → get result. Design should reflect this simplicity
5. **Bot personality** — Bots should feel like capable workers, shown with emoji category icons and "Active/Online" badges

---

## 📐 Reference Style

Think: **Linear.app** meets **Vercel Dashboard** meets **Fiverr** — in a dark cyberpunk theme.

- Clean data tables like Linear
- Glassmorphism and gradients like Vercel
- Marketplace card grid UX like Fiverr
- Terminal/code aesthetic for the processing view
