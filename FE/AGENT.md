# AGENT.md (Generated via gitnexus)

## 🚀 Project Overview

**SaleManagement Frontend** is a **Vue 3** single-page application built using **Vite**, **PrimeVue**, **Tailwind CSS**, and **mock data services**. It is a demo-style admin dashboard / management UI for sales, inventory, categories, employees, facilities, tables, and food/drink items.

This document is intended to provide AI agents with a fast, high-level understanding of the repo structure, key entry points, and common patterns.

---

## 🧭 Key Technologies

- **Framework:** Vue 3 (Composition API)
- **Build Tool:** Vite
- **UI Library:** PrimeVue (auto-imported via `@primevue/auto-import-resolver`)
- **Styling:** Tailwind CSS + SCSS (custom layout styles under `src/assets/layout`)
- **Routing:** `vue-router` with lazy-loaded route components
- **Data:** Mock data services in `src/service/` (no real backend integration)

---

## 📁 Core Folder Structure

- `src/main.js` - App bootstrap (PrimeVue config, global services)
- `src/router/index.js` - Main routing definitions (lazy-loaded views)
- `src/layout/` - Layout components (AppLayout, AppSidebar, AppTopbar, AppMenu, etc.)
- `src/components/` - Reusable UI components and widgets (Dashboard widgets, TableManager, etc.)
- `src/views/` - Page-level views (dashboard, CRUD pages, uikit docs, landing page, etc.)
- `src/service/` - Mock data providers (e.g., `ProductService`, `CategoryService`, etc.)
- `public/demo/` - Static demo data (JSON + images) used by mock services and UI demos

---

## 🧩 How the App Starts

1. **Entry Point:** `src/main.js`
   - Creates the Vue app
   - Registers PrimeVue theme & global services (`ToastService`, `ConfirmationService`)
   - Mounts the router

2. **Routing (SPA navigation):** `src/router/index.js`
   - Root layout is `AppLayout.vue`
   - Routes lazily import views under `src/views/`

---

## 🛠️ Common Patterns

### Mock Services

Most data is provided via services in `src/service/`:
- Example: `ProductService.getProducts()` returns static arrays
- Services are plain JS objects with methods returning arrays or `Promise.resolve(data)`

### UI Components

- Uses PrimeVue components (e.g., `DataTable`, `Dialog`, `Dropdown`, etc.)
- Many pages follow a CRUD pattern of `ref()` state + `onMounted()` to load mock data, and methods for add/edit/delete.
- Dialogs use PrimeVue `useToast()` and `useConfirm()` for notifications and confirmation popups.

### Styling

- Layout styles are in `src/assets/layout/` (SCSS)
- Tailwind utilities are used across components (e.g., `flex`, `grid`, `gap-*`)

---

## ▶️ Running the App

From the repo root:

```bash
npm install
npm run dev
```

> Alternative: if using Bun, the project is set up to work with `bun run dev`.

---

## ✅ Helpful Files & Entry Points

- `package.json` – scripts, dependencies
- `vite.config.mjs` – alias `@` → `src`, PrimeVue auto import, Tailwind plugin
- `src/layout/AppLayout.vue` – global scaffold (topbar/sidebar/footer + `router-view`)
- `src/views/pages/` – core feature pages (CRUD, management views)
- `src/views/uikit/` – demo pages for PrimeVue components

---

## 🎯 Notes for AI Assistants

- **Focus on the `src/service/` folder** when trying to understand data shapes and mock APIs.
- **Routing is centralized** in `src/router/index.js` — adding a new page means adding a new route and view component.
- **UI behavior is primarily in setup script of Vue `<script setup>` files**. Many pages use reactive refs and PrimeVue components.

---

*Generated using gitnexus analysis (query + file extraction) to provide a concise project snapshot for AI tooling.*
