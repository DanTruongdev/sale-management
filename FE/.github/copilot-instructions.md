# AI Coding Guidelines for Sale Management Frontend

## Architecture Overview
This is a Vue 3 SPA for sale management using PrimeVue UI library. Key structure:
- **Layout**: `AppLayout.vue` with topbar/sidebar/footer wrapping `router-view`
- **Routing**: Lazy-loaded components in `views/` (dashboard, uikit docs, auth, table management)
- **Components**: Organized in `components/` with subfolders (dashboard widgets, landing, uikit)
- **Services**: Mock data providers in `service/` (e.g., `ProductService.getProductsData()` returns static arrays)
- **Data Flow**: Components use reactive refs for local state; services provide mock data; no real API integration yet

## Developer Workflows
- **Development**: `npm run dev` (Vite dev server with `--host` for network access)
- **Build**: `npm run build` (Vite production build)
- **Lint**: `npm run lint` (ESLint with Vue/Prettier, auto-fixes)
- **Preview**: `npm run preview` (Serve built files locally)
- **Debugging**: Use Vue DevTools; console logs in components; no test runner configured

## Project Conventions
- **UI Components**: PrimeVue auto-imported via Vite plugin; use `p-` classes for PrimeVue styles
- **Styling**: TailwindCSS for utilities; SCSS in `assets/styles.scss`; theme via `@primeuix/themes/aura`
- **State Management**: Vue 3 Composition API with `ref`/`computed`; no Pinia/Vuex yet
- **Internationalization**: Mix of English/Vietnamese (e.g., table statuses: 'Trống'/'Có khách'); format currency as VND
- **File Naming**: PascalCase for Vue components; camelCase for JS files
- **Imports**: Use `@/` alias for `src/`; lazy import routes for performance

## Integration Points
- **PrimeVue Services**: ToastService and ConfirmationService mounted globally; use `useToast()` in components
- **Charts**: Chart.js integrated via PrimeVue Chart components
- **Icons**: PrimeIcons available as `pi pi-*` classes
- **Demo Data**: Static JSON in `public/demo/` for development (countries, customers, products)

## Key Files to Reference
- `src/main.js`: App setup with PrimeVue theme and services
- `src/router/index.js`: Route definitions with lazy loading
- `src/components/TableManager.vue`: Complex component with drawer, dialogs, table splitting logic
- `src/service/ProductService.js`: Example of mock data service pattern
- `vite.config.mjs`: Build config with PrimeVue auto-import resolver</content>
<parameter name="filePath">.github/copilot-instructions.md