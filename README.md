# 🛡️ OtakuDuo Admin Panel

The administrative control center for the **OtakuDuo** social matchmaking platform for anime fans and gamers. Built with React 19, Vite, Tailwind CSS v4, Zustand, and React Router v7.

---

## 🚀 Features

- **📊 Central Dashboard**: Real-time metrics overview (total users, verified revenue in INR, active titles, pending moderation reports).
- **👥 User Management**: Full CRUD on user accounts, keyword search, verification toggles, role management (`admin` / `user`), bot flags, and balances adjustments (Compliments, Super Likes, Extra Swipes).
- **🏷️ Anime & Game Categories**: CRUD management for anime genres and game categories with emoji icons and slug generation.
- **🎬 Title Catalog**: Manage official anime series and video game titles with category associations, thumbnail preview, and popularity rating.
- **💎 Monetization & Plans**: Consumable refills (Mana Drops) and premium subscriptions (Otaku Pass) with dynamic perk builders and pricing.
- **💳 Payment Transactions**: Razorpay transaction monitoring, order ID lookup, verified status filters, and manual status overrides.
- **🚩 Moderation & Reports**: Community report queue with direct reported-user ban action and report dismissal.
- **📍 Locations**: Country, State, and City management.
- **✉️ Email Templates**: Transactional HTML templates editor with live HTML preview and SMTP test email dispatcher.

---

## 🛠️ Tech Stack

- **Framework**: [React 19](https://react.dev/) + [Vite](https://vite.dev/)
- **Routing**: [React Router v7](https://reactrouter.com/)
- **State Management**: [Zustand](https://zustand-demo.pmnd.rs/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)

---

## 📋 Prerequisites

Before setting up the admin panel, ensure you have the following installed:

1. **Node.js**: `v18.0.0` or higher (tested on `v25.x`)
2. **Package Manager**: `pnpm` (recommended, `v9+` or `v11+`) or `npm`
3. **OtakuDuo Backend**: The backend server (`otaku_backend_2026`) must be running on port `3005` (or configured URL) with MongoDB connected.

---

## 💻 Installation & Setup Guide

### 1. Navigate to the Admin Panel Directory

From the project root:

```bash
cd otaku_adminpanel_2026
```

### 2. Install Dependencies

Using `pnpm` (recommended):

```bash
pnpm install
```

Or using `npm`:

```bash
npm install
```

---

### 3. Configure Environment Variables

Create a `.env` file in the root of `otaku_adminpanel_2026`:

```bash
cp .env.example .env
```

Ensure the API URL points to the backend admin API:

```env
VITE_API_URL=http://localhost:3005/api/admin
```

> **Note**: If your backend server runs on a different port or host (e.g. production domain), update `VITE_API_URL` accordingly.

---

### 4. Run the Development Server

Start the local development server:

```bash
pnpm dev
```

Or with npm:

```bash
npm run dev
```

The application will start at:
👉 **[http://localhost:5173](http://localhost:5173)**

---

## 🔑 Default Admin Credentials

When the backend (`otaku_backend_2026`) starts up, it automatically initializes a default administrative account if none exists:

| Credential | Value |
| :--- | :--- |
| **Email** | `admin@otakuduo.com` |
| **Password** | `Admin@123456` |
| **Role** | `admin` |

> 💡 On the login page, you can also click the **"Fill Credentials"** shortcut to automatically populate these credentials.

---

## 🏗️ Production Build

To bundle the application for production:

```bash
pnpm build
```

Preview the production build locally:

```bash
pnpm preview
```

---

## 📁 Project Structure

```text
otaku_adminpanel_2026/
├── public/                 # Static assets
├── src/
│   ├── components/
│   │   ├── common/         # Reusable UI (Modal, Badge, Pagination, Tabs, Toast, ConfirmDialog)
│   │   └── layout/         # AdminLayout, Header, and Sidebar
│   ├── pages/              # Module Pages
│   │   ├── LoginPage.jsx
│   │   ├── DashboardPage.jsx
│   │   ├── UsersPage.jsx
│   │   ├── CategoriesPage.jsx
│   │   ├── TitlesPage.jsx
│   │   ├── PlansPage.jsx
│   │   ├── PaymentsPage.jsx
│   │   ├── ReportsPage.jsx
│   │   ├── LocationsPage.jsx
│   │   └── EmailTemplatesPage.jsx
│   ├── services/
│   │   └── api.js          # Centralized fetch client with Bearer auth & 401 handling
│   ├── store/
│   │   ├── useAuthStore.js # Zustand Auth state store
│   │   └── useToastStore.js# Zustand Toast notifications store
│   ├── App.jsx             # React Router routing setup
│   ├── index.css           # Tailwind CSS v4 & custom design tokens
│   └── main.jsx            # Application entry point
├── .env.example            # Environment variables template
├── package.json
└── vite.config.js
```

---

## 🛡️ License

Private & Proprietary - © 2026 OtakuDuo. All rights reserved.
