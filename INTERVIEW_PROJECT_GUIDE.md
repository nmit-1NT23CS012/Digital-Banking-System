# Digital Banking System — Interview Project Guide

> **Evidence policy:** This guide describes the checked-in application source and schema, not claims in promotional documentation. “Implemented” means code exists; it does not imply production readiness or tested correctness. No credentials, real records, or environment-variable values are reproduced here.

## 1. Project overview

This is a two-part web application branded **BankPro**: a React single-page interface backed by an Express API and MySQL. The implemented workflows are account registration/login, viewing a balance/profile and transaction history, transferring between registered users by email, and a role-gated admin screen for user/transaction listing, account freeze/unfreeze, deletion, and adding funds. Evidence: route definitions in [App.jsx](client/src/App.jsx), API routes in [authRoutes.js](server/routes/authRoutes.js), [transactionRoutes.js](server/routes/transactionRoutes.js), and [adminRoutes.js](server/routes/adminRoutes.js); controller actions in [authController.js](server/controllers/authController.js), [transactionController.js](server/controllers/transactionController.js), and [adminController.js](server/controllers/adminController.js).

**Roles:** `user` and `admin`, represented by the `users.role` enum in [schema.sql](schema.sql). Registration creates only `user` accounts (`User.create` in [User.js](server/models/User.js)); there is no admin-bootstrap or role-change API. The schema seeds no accounts. An admin must be provisioned outside the app (for example, in a controlled development database).

**Important limitations / incomplete or mocked behavior**

- Email verification, password reset, profile editing, configurable user roles, payment rails, and a real banking ledger are not implemented. The API has no verification or password-reset routes; the profile page’s `isEditing` state is unused ([TransactionsPage.jsx](client/src/pages/TransactionsPage.jsx), `ProfilePage`).
- Registration gives each new user an initial balance of 10,000 (the model default and schema default); it does not create a corresponding deposit/ledger transaction ([User.js](server/models/User.js), `User.create`; [schema.sql](schema.sql)).
- The account-growth/trend figures in the user dashboard are fixed display values, not calculated business metrics (`DashboardPage` in [DashboardPage.jsx](client/src/pages/DashboardPage.jsx), `AnalyticsCard` in [dashboard/index.jsx](client/src/components/dashboard/index.jsx)). Admin “Server Status” and “Database Status” labels are hardcoded display text, not live health checks ([AdminDashboard.jsx](client/src/pages/AdminDashboard.jsx), `AdminDashboard`).
- The profile’s two-factor, SSL, monitoring, and insurance statements are static text; no corresponding implementation is present (`ProfilePage` in [TransactionsPage.jsx](client/src/pages/TransactionsPage.jsx)).
- Admin user-list selection has no bulk operation, and its “Add Funds” row action calls an undefined `onAddFunds` identifier; the separate overview form is wired to the add-funds API ([admin/index.jsx](client/src/components/admin/index.jsx), `UsersList`; [AdminDashboard.jsx](client/src/pages/AdminDashboard.jsx), `handleAddFundsSubmit`).
- The transfer handler now validates decimal amounts and locks both account rows in its transaction; a small unit test covers amount parsing. MySQL-backed transfer/concurrency and auth-middleware integration tests are still absent.
- README/setup guides advertise behaviors that are absent or only partly present (notably email verification, refresh-token/logout semantics, search/sort over the full history, analytics, profile edits, and comprehensive testing). Treat the source, not those checklists, as authoritative ([README.md](README.md), [INSTALLATION.md](INSTALLATION.md), [QUICK_START.md](QUICK_START.md), [SETUP_COMPLETE.md](SETUP_COMPLETE.md)).

## 2. Tech stack

Versions below are those declared by manifests, with selected installed lock metadata noted where available. `package.json` ranges are not a guarantee of compatible production deployment.

| Technology | Version/range available in workspace | Actual use |
|---|---|---|
| JavaScript, Node.js | Node version is not pinned in manifests; setup docs claim Node 16+ | CommonJS Express server; modern ES modules for Vite frontend. Server bootstrap is [server/index.js](server/index.js); frontend entry is [main.jsx](client/src/main.jsx). |
| React / React DOM | `^18.2.0`; local lock metadata has `18.3.1` | UI components, hooks, and auth context ([client/package.json](client/package.json); [AuthContext.jsx](client/src/context/AuthContext.jsx)). |
| Vite / React plugin | `^8.0.14` / `^4.2.0`; local Vite lock metadata `8.0.14` | Frontend development server and production build; proxy `/api` to local Express ([vite.config.js](client/vite.config.js)). |
| React Router DOM | `^6.17.0` | Browser routing and page navigation ([App.jsx](client/src/App.jsx)). |
| Tailwind CSS, PostCSS, Autoprefixer | `^3.3.5`, `^8.4.31`, `^10.4.16` | Utility CSS, theme configuration, and CSS processing ([tailwind.config.js](client/tailwind.config.js), [postcss.config.js](client/postcss.config.js), [globals.css](client/src/styles/globals.css)). |
| Axios | `^1.6.2` | API client, bearer token attachment, refresh-on-401 attempt ([apiClient.js](client/src/services/apiClient.js)). |
| Framer Motion | `^10.16.4` | UI animation ([pages](client/src/pages), [components](client/src/components)). |
| React Hot Toast | `^2.4.1` | User feedback messages ([AuthContext.jsx](client/src/context/AuthContext.jsx), [TransferPage.jsx](client/src/pages/TransferPage.jsx), [AdminDashboard.jsx](client/src/pages/AdminDashboard.jsx)). |
| Lucide React | `^0.294.0` | UI icons ([AuthPages.jsx](client/src/pages/AuthPages.jsx), [AdminDashboard.jsx](client/src/pages/AdminDashboard.jsx)). |
| Recharts | `^2.10.3` | Declared dependency; no Recharts import/use was found in the application source. The shown analytics use display cards, not charts. |
| Express | `^4.18.2`; local lock metadata `4.22.2` | HTTP server, middleware, and route mounting ([server/index.js](server/index.js)). |
| mysql2 | `^3.6.0`; local lock metadata `3.22.3` | Promise-based MySQL connection pool and parameterized queries ([database.js](server/config/database.js), models). |
| bcryptjs / jsonwebtoken | `^2.4.3` / `^9.0.0`; local lock metadata `2.4.3` / `9.0.3` | Password hash/compare and access/refresh JWT signing/verification ([authController.js](server/controllers/authController.js), [auth.js](server/middleware/auth.js)). |
| dotenv, cors, helmet, cookie-parser | `^16.3.1`, `^2.8.5`, `^7.1.0`, `^1.4.6` | Environment loading, cross-origin policy, security headers, and cookie parsing ([server/index.js](server/index.js)). |
| express-rate-limit, morgan, winston | `^7.1.5`, `^1.10.0`, `^3.11.0` | Request throttling, HTTP request logging, and application/file logging ([server/index.js](server/index.js), [logger.js](server/config/logger.js)). |
| Nodemon | `^3.0.2` development dependency | Restarts the backend in `npm run dev` ([server/package.json](server/package.json)). |

Both `package.json` manifests define scripts. Local package-lock files exist in the workspace but `.gitignore` excludes lockfiles; therefore reproducible dependency resolution is not assured if the manifests are used without a committed lockfile ([.gitignore](.gitignore)).

## 3. Folder structure

```text
banking-system/
├── schema.sql                 MySQL database and tables
├── README.md                  Feature/stack claims; some are aspirational
├── INSTALLATION.md            Setup and API-use examples
├── QUICK_START.md             Short setup checklist
├── SETUP_COMPLETE.md          Project summary; contains unverified claims
├── client/
│   ├── index.html             Vite HTML entry
│   ├── package.json           Frontend scripts and dependencies
│   ├── vite.config.js         Port and local API proxy
│   ├── tailwind.config.js     Tailwind theme and dark-mode class strategy
│   └── src/
│       ├── main.jsx, App.jsx  React entry, providers, routes and shell
│       ├── context/, hooks/   Authentication state and hooks
│       ├── pages/             Auth, dashboard, transfer, history/profile, admin
│       ├── components/        Common, layout, dashboard, and admin UI
│       ├── services/          Axios client and API wrapper methods
│       ├── utils/             Formatting and client-side validators
│       └── styles/            Global Tailwind/CSS styles
└── server/
    ├── index.js               Express middleware, route mounting, startup
    ├── config/                MySQL pool and Winston logger
    ├── routes/                HTTP method/path to middleware/controller wiring
    ├── controllers/           Request handlers and application operations
    ├── models/                SQL access classes (no ORM)
    ├── middleware/            JWT/role checks, request validation, error handler
    ├── utils/                  Validators and JSON response wrapper
    └── .env.example           Environment-variable names/template (not real config)
```

No separate backend `services` directory exists. `server/logs/` contains runtime log destinations; log contents are intentionally not reproduced here. `client/dist/` is build output, not the source of truth. No test directory or test files were found.

## 4. System architecture and request lifecycle

The browser renders the React app. `apiClient` sends HTTP requests to `VITE_API_URL` if set, otherwise the frontend’s configured default API URL; Vite also proxies `/api` to the backend in development ([apiClient.js](client/src/services/apiClient.js), [vite.config.js](client/vite.config.js)). Express route handlers call controllers, which call static model methods or—in the transfer handler—SQL directly. Models use a shared mysql2 pool. This is a **layered, MVC-like** structure, not a fully separated MVC/service architecture: routes, controllers, models, and views/UI exist, but business logic is in controllers and no backend service layer is present ([server/index.js](server/index.js), [routes](server/routes), [controllers](server/controllers), [models](server/models)).

Typical request lifecycle:

1. `server/index.js` loads dotenv and configures Helmet, CORS, JSON/url-encoded parsing, cookie-parser, Morgan-to-Winston logging, then global `/api/` rate limiting and stricter login/register rate limiting.
2. The health handler is registered; `/api/auth`, `/api/transactions`, and `/api/admin` routers are mounted.
3. For protected routes, `authMiddleware` reads a bearer token or the `token` cookie, verifies it, reloads the account, rejects missing/frozen users, and sets `req.user` from current database values. Admin routes then run `adminMiddleware`; validators run where configured.
4. Controller code reads/writes through `User`/`Transaction` SQL methods or a dedicated transfer connection and responds through `ApiResponse`.
5. Unknown routes return JSON 404; the final error middleware logs and formats errors. Startup probes MySQL and exits if the connection test fails before listening.

Response envelope is `success`, `message`, `data`, `timestamp` on success; error responses contain `success: false`, `message`, `errors` (usually `null`), and `timestamp` (`ApiResponse.success/error` in [responseHelper.js](server/utils/responseHelper.js)). The health endpoint uses its own `{status, timestamp}` shape ([server/index.js](server/index.js), `/health`).

## 5. Frontend

- **Pages and routes:** `/login`, `/register`, `/`, `/transfer`, `/transactions`, `/profile`, and `/admin` are defined in `App` ([App.jsx](client/src/App.jsx)). `ProtectedRoute` redirects unauthenticated users to login and checks the in-memory `user.role` for the admin page ([ProtectedRoute.jsx](client/src/components/common/ProtectedRoute.jsx)). The admin check improves navigation but is not the security boundary; backend middleware is.
- **Auth and state:** `AuthProvider` keeps `user`, `loading`, and `isAuthenticated` in React state; `useAuth` exposes that context ([AuthContext.jsx](client/src/context/AuthContext.jsx), [useAuth.js](client/src/hooks/useAuth.js)). On mount, a stored token triggers a profile request. Theme choice is stored separately in localStorage (`Header` in [layout/index.jsx](client/src/components/layout/index.jsx)).
- **Forms and client validation:** Register checks nonempty name, email format, password length/character classes, and confirmation; login checks required fields; transfer checks email, numeric-like amount, positive amount, and an upper bound ([AuthPages.jsx](client/src/pages/AuthPages.jsx), [helpers.js](client/src/utils/helpers.js), [TransferPage.jsx](client/src/pages/TransferPage.jsx)). These checks are UX aids; server validation is also used for registration/login/transfer. Client and server checks are not identical.
- **API integration:** `authService`, `transactionService`, and `adminService` wrap API calls ([services/index.js](client/src/services/index.js)). The Axios request interceptor adds a bearer token from localStorage. On a 401, the response interceptor attempts a refresh and retries once; if refresh fails it clears local tokens and navigates to login ([apiClient.js](client/src/services/apiClient.js)). The server-side refresh route only returns a new access token, while the client keeps the existing refresh token.
- **Dashboard:** shows current balance, five recent transactions, quick navigation, and cards. Two trend values and “Account Growth” are static; transaction totals are derived only from the fetched recent-history page, not lifetime aggregates ([DashboardPage.jsx](client/src/pages/DashboardPage.jsx), [dashboard/index.jsx](client/src/components/dashboard/index.jsx)).
- **Transactions:** requests one paginated history page; name/email search and sent/received filtering are applied in browser to that page only, not server-wide. There is no sort control despite documentation claims ([TransactionsPage.jsx](client/src/pages/TransactionsPage.jsx)).
- **Profile:** displays profile values and masked account digits; there is no profile update API or working edit flow. Several security assurances shown there are static content ([TransactionsPage.jsx](client/src/pages/TransactionsPage.jsx), `ProfilePage`).
- **Admin dashboard:** loads users, stats, and first ten transactions; supports freeze/unfreeze/delete and an overview add-funds form. It handles partial fetch failures with `Promise.allSettled` ([AdminDashboard.jsx](client/src/pages/AdminDashboard.jsx)). The user-list “Add Funds” action is broken because `UsersList` references an undefined callback. `Recharts` is not used; metrics are simple cards.
- **Reusable UI:** common inputs/buttons/cards/transaction rows/loading states are in [common/index.jsx](client/src/components/common/index.jsx); sidebar/header/footer and theme toggle are in [layout/index.jsx](client/src/components/layout/index.jsx); tables are in [admin/index.jsx](client/src/components/admin/index.jsx). Sidebar links use full-page anchors; client navigation is not consistently implemented with React Router links.

## 6. Backend

- **Server/bootstrap:** `server/index.js` configures middleware, mounts the three routers, adds `/health`, a JSON 404 handler, and `errorHandler`. It listens on `PORT` or 5000 only after a pool connection ping succeeds.
- **Routes:** [authRoutes.js](server/routes/authRoutes.js), [transactionRoutes.js](server/routes/transactionRoutes.js), [adminRoutes.js](server/routes/adminRoutes.js) are thin Express routers. Their complete endpoint inventory is in section 7.
- **Controllers:** [authController.js](server/controllers/authController.js) handles registration/login/refresh/profile/logout; [transactionController.js](server/controllers/transactionController.js) handles transfer/history/balance; [adminController.js](server/controllers/adminController.js) handles admin actions and aggregations.
- **Models/SQL:** [User.js](server/models/User.js) performs user queries; [Transaction.js](server/models/Transaction.js) performs transaction queries. mysql2 prepared `execute` calls use `?` placeholders for values. There is no ORM or migration framework visible.
- **Validation:** [validation.js](server/middleware/validation.js) checks required registration/login/transfer fields and calls [validators.js](server/utils/validators.js) for email/password/amount checks. Admin add-funds has only a minimal controller check, not the shared validation middleware. There is no general schema-validation library or sanitization layer.
- **Middleware/errors:** [auth.js](server/middleware/auth.js) verifies JWTs and checks the admin role claim. [errorHandler.js](server/middleware/errorHandler.js) maps JWT/validation errors and otherwise uses an error status/message; controller catches often convert errors to a generic endpoint-specific 500 response. Errors are logged, and some transaction history paths also use `console` logging ([transactionController.js](server/controllers/transactionController.js)).
- **Database/log configuration:** [database.js](server/config/database.js) creates a pool with maximum 10 connections and keep-alive. [logger.js](server/config/logger.js) writes Winston JSON logs to error/combined files and to console outside production.
- **No backend service layer:** “services” in frontend is an Axios wrapper; no backend `services/` folder or separate domain service classes are present.

## 7. REST API inventory

All `/api` success responses use the `ApiResponse` envelope described in section 4 unless stated otherwise. Error responses use the shared error shape. IDs below are path parameters, not user-supplied identity for ordinary protected user endpoints.

| Method and endpoint | Authentication / role | Request fields | Successful `data` shape | Handler / evidence |
|---|---|---|---|---|
| `GET /health` | None | None | `{ status: "OK", timestamp }` | Inline health handler in [server/index.js](server/index.js). |
| `POST /api/auth/register` | None; `validateRegister` | JSON: `fullName`, `email`, `password`, `confirmPassword` | `{ userId, accountNumber }` (201) | `register` in [authController.js](server/controllers/authController.js); [authRoutes.js](server/routes/authRoutes.js). |
| `POST /api/auth/login` | None; `validateLogin` | JSON: `email`, `password` | `{ token, refreshToken, user: { id, fullName, email, balance, accountNumber, role } }` | `login` in [authController.js](server/controllers/authController.js). |
| `POST /api/auth/refresh` | No access-token middleware; valid refresh JWT required | JSON: `refreshToken` | `{ token }` | `refresh` in [authController.js](server/controllers/authController.js). |
| `GET /api/auth/profile` | Access JWT | None | `{ id, fullName, email, balance, accountNumber, role, isFrozen, createdAt }` | `getProfile` in [authController.js](server/controllers/authController.js). |
| `POST /api/auth/logout` | Access JWT | None | `data: null`; clears `token` cookie | `logout` in [authController.js](server/controllers/authController.js). |
| `POST /api/transactions/transfer` | Access JWT; `validateTransfer` | JSON: `receiverEmail`, `amount` | `{ transactionId, senderBalance, receiverName, amount, timestamp }` (201) | `transfer` in [transactionController.js](server/controllers/transactionController.js). |
| `GET /api/transactions/history` | Access JWT | Query: `page` (default 1), `limit` (default 10, capped at 20) | `{ transactions: [...], pagination: { total, page, limit, pages } }`; each row includes SQL columns plus `otherUserName`, `otherUserEmail`, `type`, numeric `amount` | `getTransactionHistory` in [transactionController.js](server/controllers/transactionController.js); SQL in [Transaction.js](server/models/Transaction.js). |
| `GET /api/transactions/balance` | Access JWT | None | `{ balance, accountNumber, isFrozen }` | `getBalance` in [transactionController.js](server/controllers/transactionController.js). |
| `GET /api/admin/users` | Access JWT + role `admin` | None | `{ users: [{ id, fullName, email, accountNumber, balance, role, isFrozen, createdAt }] }` | `getAllUsers` in [adminController.js](server/controllers/adminController.js). |
| `PUT /api/admin/freeze/:id` | Access JWT + role `admin` | Path: `id`; no body required | `{ message: "Account frozen" }` | `freezeAccount` in [adminController.js](server/controllers/adminController.js). |
| `PUT /api/admin/unfreeze/:id` | Access JWT + role `admin` | Path: `id`; no body required | `{ message: "Account unfrozen" }` | `unfreezeAccount` in [adminController.js](server/controllers/adminController.js). |
| `DELETE /api/admin/user/:id` | Access JWT + role `admin` | Path: `id`; cannot delete the current admin | `{ message: "User deleted successfully" }` | `deleteUser` in [adminController.js](server/controllers/adminController.js). |
| `POST /api/admin/add-funds` | Access JWT + role `admin` | JSON: `userId`, `amount` | `{ newBalance, message }` | `addFunds` in [adminController.js](server/controllers/adminController.js); route in [adminRoutes.js](server/routes/adminRoutes.js). |
| `GET /api/admin/transactions` | Access JWT + role `admin` | Query: `page` (default 1), `limit` (default 10, capped at 20) | `{ transactions: [...], pagination: { total, page, limit, pages } }`; rows include sender/receiver names/emails | `getAllTransactions` in [adminController.js](server/controllers/adminController.js). |
| `GET /api/admin/stats` | Access JWT + role `admin` | None | `{ totalTransactions, totalTransferred, averageTransactionAmount }` | `getTransactionStats` in [adminController.js](server/controllers/adminController.js). |

No refresh-token revocation endpoint, admin role-management endpoint, account-number lookup endpoint, or profile-update endpoint is defined. Although user-history pagination is server-side, search/filter are frontend-only. Admin stats use at most the first 1,000 retrieved transaction rows (`getTransactionStats`), so their totals are not guaranteed to represent the complete database.

## 8. Authentication and authorization

1. `validateRegister` requires name/email/password/confirmation; password policy is at least eight characters with uppercase, lowercase, and digit. `register` checks for existing email, hashes with `bcrypt.hash(password, 10)`, generates a 10-character uppercase hexadecimal account number, and calls `User.create`. The model assigns role `user` and initial balance 10,000. No email verification is sent and no admin account is created ([validation.js](server/middleware/validation.js), [validators.js](server/utils/validators.js), `register` in [authController.js](server/controllers/authController.js), `User.create` in [User.js](server/models/User.js)).
2. Login looks up the user by email, rejects a frozen account, compares the hash using bcrypt, then signs an access token (24 hours) containing `id`, `email`, and `role`, and a refresh token (7 days) containing `id` and `email`. It returns both in JSON and also sets the access token as an HttpOnly cookie; `secure` is enabled only when `NODE_ENV` is `production`; `sameSite` is `strict` ([authController.js](server/controllers/authController.js), `login`).
3. The browser stores both tokens in **localStorage** and sends the access token in the `Authorization: Bearer ...` header. The cookie is also sent because Axios uses `withCredentials: true` ([AuthContext.jsx](client/src/context/AuthContext.jsx), [apiClient.js](client/src/services/apiClient.js)).
4. `authMiddleware` verifies the access JWT using `JWT_SECRET`, reloads the user, rejects deleted/frozen accounts, and attaches current database `id`, `email`, and `role` to `req.user`. `adminMiddleware` checks that current role. This is a user-state lookup, not a revocable per-device session ([auth.js](server/middleware/auth.js)).
5. Refresh accepts the refresh token in the request body, verifies it with `JWT_REFRESH_SECRET`, loads the user, rejects frozen accounts, and returns a new 24-hour access token. It does not rotate/revoke the refresh token ([authController.js](server/controllers/authController.js), `refresh`).
6. Logout clears only the access-token cookie on the server. The browser removes both localStorage entries, but the backend does not invalidate either JWT; an already copied token remains usable until expiration ([authController.js](server/controllers/authController.js), `logout`; [AuthContext.jsx](client/src/context/AuthContext.jsx), `logout`).

**Authorization enforcement:** every transaction route requires an access token; every admin route requires both access-token and `adminMiddleware`. Registration fixes new accounts to `user`. The role check is based on the JWT claim, which can remain stale until token expiry; user freeze state is not checked by the authentication middleware.

## 9. MySQL database

The schema creates database `banking_system` if absent, then two tables ([schema.sql](schema.sql)).

### `users`

| Column | Type / behavior | Constraint / index |
|---|---|---|
| `id` | `INT`, auto-increment | Primary key |
| `full_name` | `VARCHAR(255)` | `NOT NULL` |
| `email` | `VARCHAR(255)` | `UNIQUE NOT NULL`; also explicit `idx_email` |
| `password` | `VARCHAR(255)` | `NOT NULL`; contains bcrypt hash from registration |
| `account_number` | `VARCHAR(10)` | `UNIQUE NOT NULL`; also explicit `idx_account_number` |
| `balance` | `DECIMAL(15,2)` | `NOT NULL DEFAULT 10000.00` |
| `role` | `ENUM('user','admin')` | `NOT NULL DEFAULT 'user'` |
| `is_frozen` | `BOOLEAN` | Default `FALSE` (schema does not specify `NOT NULL`) |
| `created_at` | `TIMESTAMP` | Default current timestamp; `idx_created_at` |
| `updated_at` | `TIMESTAMP` | Default current timestamp; auto-update on row update |

Additional indexes: `idx_user_role(role)`, `idx_user_frozen(is_frozen)`. Explicit email/account-number indexes duplicate the indexes MySQL creates to support the unique constraints.

### `transactions`

| Column | Type / behavior | Constraint / index |
|---|---|---|
| `id` | `INT`, auto-increment | Primary key |
| `sender_id`, `receiver_id` | `INT` | Both `NOT NULL`; foreign keys to `users.id`, each `ON DELETE CASCADE`; indexes on both |
| `amount` | `DECIMAL(15,2)` | `NOT NULL`; no positive-amount `CHECK` constraint |
| `transaction_type` | `VARCHAR(50)` | `NOT NULL DEFAULT 'transfer'`; `idx_transaction_type` |
| `status` | `VARCHAR(20)` | `NOT NULL DEFAULT 'completed'`; `idx_status` |
| `created_at` | `TIMESTAMP` | Default current timestamp; `idx_created_at` |

There are no seeded users/transactions, no unique idempotency key, no account/ledger table, no currency field, and no transaction-update/audit history. Deleting a user cascades to their transaction rows, reducing auditability. The account-number validator expects ten digits but account generation uses hexadecimal characters; both fit the `VARCHAR(10)` schema but are not the same format ([validators.js](server/utils/validators.js), `validateAccountNumber`; [authController.js](server/controllers/authController.js), `generateAccountNumber`).

**Conceptual queries only** (illustrative, not executed; use bound values in application code):

```sql
-- Sum transfer rows for one account (direction must be considered separately).
SELECT COUNT(*) AS transfer_count, SUM(amount) AS amount_sum
FROM transactions
WHERE sender_id = ? OR receiver_id = ?;

-- Find the newest rows for an account.
SELECT id, sender_id, receiver_id, amount, status, created_at
FROM transactions
WHERE sender_id = ? OR receiver_id = ?
ORDER BY created_at DESC
LIMIT ? OFFSET ?;

-- Admin user listing deliberately omits the password column.
SELECT id, full_name, email, account_number, balance, role, is_frozen, created_at
FROM users
ORDER BY created_at DESC;
```

## 10. Fund transfer workflow

1. `POST /api/transactions/transfer` runs `authMiddleware`, then `validateTransfer`; request is `receiverEmail` plus `amount` ([transactionRoutes.js](server/routes/transactionRoutes.js), [validation.js](server/middleware/validation.js)).
2. `transfer` gets a pooled connection and starts a SQL transaction.
3. It checks amount range, looks up the sender and rejects missing/frozen sender, looks up receiver by email, prevents self-transfer, and checks sender balance.
4. It computes new balances in JavaScript, updates sender then receiver using bound SQL values, inserts a `completed` transaction row, then commits.
5. On caught errors it rolls back and returns a generic transfer failure; on success it returns transaction ID, sender balance, receiver name, amount, and timestamp. The connection is released in `finally` ([transactionController.js](server/controllers/transactionController.js), `transfer`).

**What exists:** the amount is strictly parsed into integer cents (up to two decimal places; exponent notation and malformed strings are rejected). Sender/receiver rows are selected `FOR UPDATE` using the transfer connection and locked in ascending ID order, then balance updates and transaction insertion use that same SQL transaction. This serializes overlapping transfers touching either account and avoids stale-balance double spending. Database decimal values are converted to cents before arithmetic and back to fixed-point strings for SQL. Relevant code: `parseAmountToCents`/`formatCents` in [validators.js](server/utils/validators.js), `transfer` in [transactionController.js](server/controllers/transactionController.js).

**What is missing or unsafe:**

- The locking and amount-coercion defects reported in the initial security review are fixed in the current code. The repository has unit tests for amount parsing, but no MySQL integration test proving the locking/rollback behavior under concurrent requests.
- No idempotency key, retry deduplication, or unique transaction request identifier; client/network retries may repeat a transfer.
- No receiver-frozen check. A frozen account can still receive transfers.
- The schema itself has no positive-amount CHECK; normal API transfers enforce type/range/precision in middleware and controller.
- Initial balances and admin add-funds are not recorded as ledger entries. Admin add-funds reads a balance and overwrites it via a separate model query, without a transaction or audit row; simultaneous credits can be lost.
- It is a demo balance-transfer workflow, not integration with a real bank, payment processor, settlement system, or double-entry ledger.

The transfer implementation is in `transfer` in [transactionController.js](server/controllers/transactionController.js) and amount helpers in [validators.js](server/utils/validators.js). Admin add-funds uses `findById`/`updateBalance` in [User.js](server/models/User.js) via `addFunds` in [adminController.js](server/controllers/adminController.js). Table definitions are in [schema.sql](schema.sql).

## 11. Admin functionality

- **User management:** admin-only `GET /api/admin/users`; freeze/unfreeze and delete operations. `deleteUser` prevents an admin from deleting their own current ID. The schema cascades that user’s transaction records ([adminRoutes.js](server/routes/adminRoutes.js), [adminController.js](server/controllers/adminController.js), [User.js](server/models/User.js), [schema.sql](schema.sql)).
- **Funds:** `POST /api/admin/add-funds` increases a selected user’s balance. It does not create a transaction/audit record, apply the transfer amount maximum, or use one atomic database increment/transaction. The overview form calls it; the per-row user-list button is broken due to undefined `onAddFunds` ([adminController.js](server/controllers/adminController.js), `addFunds`; [AdminDashboard.jsx](client/src/pages/AdminDashboard.jsx); [admin/index.jsx](client/src/components/admin/index.jsx)).
- **Transaction monitoring:** admin can list paginated transaction rows with sender/receiver names and emails. Stats calculate over at most the first 1,000 retrieved rows; this is a basic listing/summary, not live anomaly monitoring or a complete ledger reconciliation ([adminController.js](server/controllers/adminController.js), `getAllTransactions`, `getTransactionStats`).
- **Freeze enforcement:** login, refresh, and `authMiddleware` reject frozen users, so a frozen user’s existing token no longer authorizes protected endpoints. The transfer handler also checks its sender; it does not check whether the recipient is frozen ([authController.js](server/controllers/authController.js), `login`, `refresh`; [transactionController.js](server/controllers/transactionController.js), `transfer`; [auth.js](server/middleware/auth.js)).
- Admin role provisioning is manual/out-of-band. No admin creation or role edit endpoint exists.

## 12. Security

### Implemented controls

- bcryptjs hashing with 10 rounds and hash comparison (`register`/`login` in [authController.js](server/controllers/authController.js)).
- Signed access and refresh JWTs with configured secrets and expirations; signature/expiry verification in [auth.js](server/middleware/auth.js).
- Admin middleware for admin API routes; route-level auth on profile, transaction, and admin APIs ([routes](server/routes), [auth.js](server/middleware/auth.js)).
- mysql2 `execute` with placeholders for user-supplied values in model/controller SQL ([User.js](server/models/User.js), [Transaction.js](server/models/Transaction.js), [transactionController.js](server/controllers/transactionController.js)).
- Helmet, configured CORS, global API limit and stricter login/register limit, body-size limit, and HttpOnly access-token cookie ([server/index.js](server/index.js), `login` in [authController.js](server/controllers/authController.js)).

### Findings from the initial scoped security review — remediated in the current workspace

The security review identified the following issues in the pre-fix version. All three are addressed in the current code; the table is retained as a trace of what was fixed. The line references below refer to the reviewed pre-fix code.

| # | Severity | File | Lines | Vulnerability | Confidence |
|---|----------|------|-------|---------------|------------|
| 1 | 🟠 HIGH | [server/controllers/transactionController.js](server/controllers/transactionController.js) | 54-70 | **Fixed:** amount parsing now rejects exponent/malformed values, converts to integer cents, and stores matching fixed-point debit/credit/transaction amounts. | 9/10 |
| 2 | 🟠 HIGH | [server/controllers/transactionController.js](server/controllers/transactionController.js) | 7-10, 21-24, 47-73 | **Fixed:** sender and receiver rows are locked on the transaction connection in stable ID order before balances are checked/updated. | 9/10 |
| 3 | 🟠 HIGH | [server/middleware/auth.js](server/middleware/auth.js) | 5-16, 23-29 | **Fixed:** each authenticated request reloads current role/frozen state; refresh also rejects frozen accounts. | 9/10 |

The fixes are in [server/utils/validators.js](server/utils/validators.js) (`parseAmountToCents`, `validateAmount`), [server/controllers/transactionController.js](server/controllers/transactionController.js) (`transfer`), [server/middleware/auth.js](server/middleware/auth.js) (`authMiddleware`), and [server/controllers/authController.js](server/controllers/authController.js) (`refresh`). Unit cases are in [server/tests/validators.test.js](server/tests/validators.test.js). No database-backed integration test was run.

### Other risks / safeguards not found

- **Token storage:** the frontend stores access and refresh JWTs in localStorage, which makes them accessible to same-origin script execution. No exploitable XSS path was confirmed by the scoped review, but HttpOnly cookies for both tokens plus suitable CSRF controls would reduce exposure ([AuthContext.jsx](client/src/context/AuthContext.jsx), [apiClient.js](client/src/services/apiClient.js)).
- **Logout/revocation:** server logout clears only the access cookie; JWTs are not revoked/blacklisted. Refresh token rotation, reuse detection, issuer/audience checks, and server-side session management are absent (`logout`, `refresh` in [authController.js](server/controllers/authController.js)).
- **Frozen/deleted/role-changed users:** `authMiddleware` now reloads the account and checks current frozen status/role on each protected request; refresh rejects frozen accounts. Frozen receivers can still receive transfers ([auth.js](server/middleware/auth.js), [authController.js](server/controllers/authController.js), [transactionController.js](server/controllers/transactionController.js)).
- **Validation:** there is no general request-schema validation or sanitization. Name length/content, exact decimal scale, and admin add-funds amount range/type are not rigorously constrained. SQL placeholders help against injection in the observed parameterized queries but do not validate business semantics ([validation.js](server/middleware/validation.js), [adminController.js](server/controllers/adminController.js)).
- **CORS/cookies:** CORS allows the configured `FRONTEND_URL` and credentials. Fallback origin in server code is port 5174, whereas Vite and setup docs use 5173. Cookie `secure` depends on `NODE_ENV`; production deployment must use HTTPS and a correct origin ([server/index.js](server/index.js), [vite.config.js](client/vite.config.js)).
- **Rate limiting:** app-wide `/api/` limit is 100 requests per 15 minutes; login and registration also get a 5-per-15-minute limiter that skips successful requests. This is not a full fraud/transfer velocity control ([server/index.js](server/index.js)).
- **Logging/privacy:** auth/controller code logs email addresses, user IDs, and transfer amount metadata; transaction-history handlers also write identifiers to console. Avoid logging sensitive personal/financial data and protect/rotate logs ([authController.js](server/controllers/authController.js), [transactionController.js](server/controllers/transactionController.js), [logger.js](server/config/logger.js)).
- Helmet sets security headers; it does not sanitize React-rendered content or itself establish that the whole app is XSS-safe. No CSP configuration, CSRF middleware, account lockout, MFA, audit ledger, or secure deployment configuration is evidenced.
- `.env.example` is a template only. Required values must be supplied privately; none are reproduced in this guide. `DEFAULT_INITIAL_BALANCE` appears in the template but is not read by server code; model/schema hardcode/default the initial amount ([server/.env.example](server/.env.example), [User.js](server/models/User.js), [schema.sql](schema.sql)).

## 13. Testing, manual evidence, and known bugs

- **Automated tests:** `server/tests/validators.test.js` exercises accepted and rejected amount forms; `server/tests/authMiddleware.test.js` checks current-role and frozen-account behavior. They use Node’s built-in `assert`; `npm test` runs both. There are no MySQL-backed integration tests, frontend tests, or configured test framework. The frontend manifest has build/lint scripts but no test script ([server/package.json](server/package.json), [server/tests/validators.test.js](server/tests/validators.test.js), [server/tests/authMiddleware.test.js](server/tests/authMiddleware.test.js), [client/package.json](client/package.json)).
- **Manual evidence:** setup docs include cURL examples and recommend Postman, but there is no Postman collection or recorded test report in the workspace. Documentation examples are not proof that scenarios were executed ([INSTALLATION.md](INSTALLATION.md), [SETUP_COMPLETE.md](SETUP_COMPLETE.md)).
- **Known code issues:** the three security findings in section 12 were fixed and amount parsing has unit coverage. Remaining issues include undefined `onAddFunds` in the user list; unused `ProfilePage` edit state; selected admin users have no bulk action; history search/filter only applies to currently fetched page; dashboard “growth/trend” and admin system-health values are mocked/static; frozen recipients may receive; admin stats are limited to first 1,000 records. Evidence is cited in sections 5, 10-12.
- **Edge cases not covered by tests:** concurrent database transfers, duplicate/retried transfer, frozen receiver, admin add-funds races, delete-cascade impact, refresh-token revocation, pagination bounds, and database failure/rollback paths. Amount parsing has unit coverage, but these database/API scenarios have not been tested.

## 14. Setup and run instructions

The setup docs advertise Node.js 16+, npm 7+, and MySQL 8+, but the manifests do not pin a Node engine. Validate the installed Vite/runtime requirements on the machine used; do not assume the documented Node minimum is compatible with every currently resolved Vite version ([INSTALLATION.md](INSTALLATION.md), [client/package.json](client/package.json)).

1. From the project root, run `mysql -u <MySQL-user> -p < schema.sql` in Command Prompt or a compatible shell; replace the placeholder with the database username and enter the password only at the prompt. The script creates/uses `banking_system`; it seeds no user data. In an interactive MySQL client, the equivalent is `SOURCE schema.sql;` after changing to the project root.
2. Create `server/.env` from `server/.env.example` and set the variables needed by server code. **Names only:** `NODE_ENV`, `PORT`, `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, `FRONTEND_URL`, `LOG_LEVEL`. `DEFAULT_INITIAL_BALANCE` is shown in the template but unused in code. The frontend optionally reads `VITE_API_URL` ([database.js](server/config/database.js), [server/index.js](server/index.js), [apiClient.js](client/src/services/apiClient.js)).
3. In one terminal run `cd server` then `npm install` and `npm run dev` (production script is `npm start`).
4. In another terminal run `cd client` then `npm install` and `npm run dev`. `npm run build` makes a production build; `npm run preview` serves it for local preview.
5. Defaults in source/configuration: Vite dev server port 5173, Express port 5000, API base `http://localhost:5000/api`, and Vite `/api` proxy to port 5000. Health URL is `http://localhost:5000/health` ([vite.config.js](client/vite.config.js), [apiClient.js](client/src/services/apiClient.js), [server/index.js](server/index.js)).

There is no default user/admin credential. Register a user; to exercise admin routes, an admin role must be provisioned safely outside the application. Do not copy the example template’s placeholder credentials/secrets into deployment.

## 15. Resume claim verification

| Claim | Status | Evidence / qualification |
|---|---|---|
| React / Node / Express / MySQL | **Verified** | React entry/components ([main.jsx](client/src/main.jsx)); Express server ([server/index.js](server/index.js)); mysql2 pool and SQL models ([database.js](server/config/database.js), [User.js](server/models/User.js), [Transaction.js](server/models/Transaction.js)); dependencies in both manifests. |
| MVC | **Partial** | Routes/controllers/models are separated, but there is no backend service layer and controllers contain business logic/SQL operations ([server/routes](server/routes), [server/controllers](server/controllers), [server/models](server/models)). "MVC-like layered backend" is accurate. |
| RESTful APIs | **Verified** | Express routes expose HTTP method/path operations with JSON responses ([authRoutes.js](server/routes/authRoutes.js), [transactionRoutes.js](server/routes/transactionRoutes.js), [adminRoutes.js](server/routes/adminRoutes.js)); see section 7. |
| JWT | **Verified** | `login`/`refresh` sign tokens; `authMiddleware` verifies access tokens and reloads current role/status ([authController.js](server/controllers/authController.js), [auth.js](server/middleware/auth.js)). Token revocation/rotation are absent; do not call the session handling fully secure. |
| bcrypt | **Verified** | `register` hashes with bcryptjs cost 10; `login` uses compare ([authController.js](server/controllers/authController.js)). |
| Role-based authorization | **Verified** | `adminMiddleware` checks the current database role and is applied to all admin routes ([auth.js](server/middleware/auth.js), [adminRoutes.js](server/routes/adminRoutes.js)). Role provisioning remains external; per-token revocation is not implemented. |
| Secure fund transfers | **Partial** | The handler now uses transaction-scoped row locks and integer-cent arithmetic with strict amount parsing; idempotency, a ledger, and database-backed concurrency tests are still absent ([transactionController.js](server/controllers/transactionController.js), [validators.js](server/utils/validators.js), [validators.test.js](server/tests/validators.test.js)). |
| Admin user management | **Partial** | Listing, freeze/unfreeze, delete, and add-funds operations exist ([adminController.js](server/controllers/adminController.js)); no user edit/role management, and the per-row add-funds UI action is broken ([admin/index.jsx](client/src/components/admin/index.jsx)). |
| Transaction monitoring | **Partial** | Admin can list transactions and see simple stats; stats only sum up to 1,000 rows and there is no alerting/continuous monitoring ([adminController.js](server/controllers/adminController.js)). |
| Account freeze/unfreeze | **Partial** | Admin endpoints and DB updates exist; login, refresh, and protected-route middleware enforce frozen status. Frozen users can still receive transfers ([adminController.js](server/controllers/adminController.js), [authController.js](server/controllers/authController.js), [transactionController.js](server/controllers/transactionController.js), [auth.js](server/middleware/auth.js)). |

## 16. Interview preparation

### Truthful 60–90 second introduction

“I built BankPro, a full-stack digital-banking demo with a React and Vite frontend, an Express API, and MySQL persistence. The main flows are registration and login, a user dashboard/profile, transfers between registered users by email, paginated transaction history, and admin operations for viewing users and transactions, freezing accounts, deleting users, and adding funds. The backend is organized into routes, controllers, and SQL-backed models; it uses bcryptjs for password hashes, JWTs for access/refresh tokens, and parameterized mysql2 queries. I addressed review findings by parsing transfer amounts into integer cents, locking both accounts in one SQL transaction, and rechecking current account status and role on protected requests. I’m careful not to describe this as production-ready: there are no real payment rails or MySQL integration tests, idempotency and a full ledger are absent, and some dashboard values are static. My next steps would be focused integration/concurrency tests and making every balance change auditable.”

### 20 likely technical questions with code-grounded answers

1. **What does the application do?**  
   It supports registration/login, balance/profile/history views, email-recipient transfers, and admin user/transaction operations; no real banking integration exists ([App.jsx](client/src/App.jsx), server route files).

2. **How is the frontend structured?**  
   `main.jsx` mounts `AuthProvider` and `App`; `App` defines routes; pages compose shared components and call service wrappers ([main.jsx](client/src/main.jsx), [App.jsx](client/src/App.jsx), [services/index.js](client/src/services/index.js)).

3. **How is authentication state managed?**  
   React Context stores the user and loading/auth flags; `useAuth` reads it. On startup, a stored access token causes a profile fetch ([AuthContext.jsx](client/src/context/AuthContext.jsx), [useAuth.js](client/src/hooks/useAuth.js)).

4. **How does registration work?**  
   Frontend and backend validate fields; backend checks email existence, bcrypt-hashes the password, creates a hex account number, then inserts a `user` with initial balance ([AuthPages.jsx](client/src/pages/AuthPages.jsx), [validation.js](server/middleware/validation.js), `register` in [authController.js](server/controllers/authController.js), `User.create` in [User.js](server/models/User.js)).

5. **How does login work?**  
   The backend loads the user, checks frozen status, compares bcrypt hash, signs a 24-hour access JWT and 7-day refresh JWT, returns them, and sets the access cookie (`login` in [authController.js](server/controllers/authController.js)).

6. **Where are tokens stored and what tradeoff does that create?**  
   The client stores both in localStorage and sends access JWT in a bearer header; this supports reload persistence but exposes tokens to same-origin script execution ([AuthContext.jsx](client/src/context/AuthContext.jsx), [apiClient.js](client/src/services/apiClient.js)).

7. **How are protected/admin routes enforced?**  
   `authMiddleware` verifies the JWT and sets `req.user`; `adminMiddleware` checks the role claim; admin routes apply both ([auth.js](server/middleware/auth.js), [adminRoutes.js](server/routes/adminRoutes.js)).

8. **Does the backend follow MVC?**  
   It has route, controller, and model modules, so it is MVC-like; there is no separate backend service layer and logic remains in controllers ([routes](server/routes), [controllers](server/controllers), [models](server/models)).

9. **How does the app avoid SQL injection?**  
   Observed SQL values are passed as mysql2 `execute` parameters (`?`) rather than concatenated into SQL; this is not a substitute for validating types and business rules ([User.js](server/models/User.js), [Transaction.js](server/models/Transaction.js)).

10. **Describe the transfer sequence.**  
    `transfer` begins a connection transaction, validates sender/receiver/amount, updates balances, inserts a transaction row, commits, or rolls back on caught failure ([transactionController.js](server/controllers/transactionController.js), `transfer`).

11. **Is that transfer concurrency-safe?**  
    The current handler locks sender and receiver rows on the same connection in ascending ID order before checking and updating balances. This addresses stale-balance double spending, but it still needs MySQL-backed concurrency/integration tests ([transactionController.js](server/controllers/transactionController.js)).

12. **What are the database relationships?**  
    Each transaction has sender and receiver foreign keys to `users.id`, both cascading on user deletion; users and transactions are the only tables ([schema.sql](schema.sql)).

13. **How is the user’s transaction history paginated?**  
    Controller clamps page to at least 1 and limit to at most 20, computes offset, queries rows/count, then adds the other party’s name/email ([transactionController.js](server/controllers/transactionController.js), `getTransactionHistory`; [Transaction.js](server/models/Transaction.js)).

14. **What happens when an account is frozen?**  
    Login, refresh, and protected-route middleware reject frozen users; the middleware reads current database status rather than trusting a stale token claim. The transfer path still permits a frozen recipient to receive funds ([authController.js](server/controllers/authController.js), [transactionController.js](server/controllers/transactionController.js), [auth.js](server/middleware/auth.js)).

15. **How is admin access granted?**  
    No API grants it. Registration hardcodes role `user`; a role must be provisioned externally in a controlled database. The admin middleware trusts the JWT role ([User.js](server/models/User.js), [auth.js](server/middleware/auth.js)).

16. **What does the refresh-token flow do?**  
    It verifies the refresh JWT, loads the user, and signs a new access token; it does not rotate/revoke the refresh token, and the client retains it ([authController.js](server/controllers/authController.js), [apiClient.js](client/src/services/apiClient.js)).

17. **What does admin add-funds do?**  
    It reads the target balance, adds a numeric conversion, then updates the balance; it does not create a transaction/ledger entry or wrap the read/write in a transaction ([adminController.js](server/controllers/adminController.js), `addFunds`; [User.js](server/models/User.js), `updateBalance`).

18. **Are the dashboard analytics real?**  
    The user’s transaction counts/sums are based on recent fetched rows, while trend and account-growth values are fixed. Admin stats use a maximum of 1,000 transaction rows ([DashboardPage.jsx](client/src/pages/DashboardPage.jsx), [adminController.js](server/controllers/adminController.js)).

19. **What testing exists?**  
    No automated test files/framework were found. Backend `npm test` is a placeholder that exits with failure; docs show examples/recommendations but not execution evidence ([server/package.json](server/package.json), [client/package.json](client/package.json)).

20. **What would you improve first?**  
    Normalize amounts and use decimal-safe arithmetic; lock/conditionally debit rows in the same DB transaction; enforce frozen status for all tokens; add idempotency and ledger/audit records; then test these with integration/concurrency cases. These are recommendations, not existing features.

### 10 follow-up questions to prepare for

1. How would you make transfers safe under concurrent requests?
2. Why is a double-entry ledger preferable to overwriting one balance column?
3. How would you represent money without JavaScript floating-point errors?
4. How would you implement refresh-token rotation and revocation?
5. What changes would be needed to store tokens only in HttpOnly cookies?
6. How would you ensure frozen accounts cannot use existing access tokens?
7. How should admin privileges be provisioned, audited, and revoked?
8. How would you test rollback, duplicate requests, and simultaneous transfers?
9. What indexes would you consider for transaction history and why?
10. How would you safely migrate from this demo schema to a ledger without losing audit history?

### Design decisions, limitations, and improvements

**Observed design decisions:** client/server separation; browser history routing; React Context for auth; Axios wrapper/interceptors; REST-style Express routers; mysql2 connection pool; SQL models; JWT access/refresh tokens; parameterized queries; schema-level foreign keys and indexes.

**Known tradeoffs/limitations:** access/refresh tokens are in localStorage; controller logic is coupled to SQL; no migration framework; no transfer idempotency or complete ledger; initial/admin funds have no audit entries; frozen recipients can receive; admin stats are truncated; no MySQL-backed integration/concurrency tests.

**Proposed improvements (not implemented):**

1. Add idempotency keys, immutable ledger entries, reconciliation, and audit records for every credit/debit; do not cascade-delete financial history.
2. Add MySQL integration/concurrency tests for row locking, rollback, frozen accounts, and repeated requests.
3. Implement refresh rotation/revocation and consider secure cookie/session handling instead of browser-readable tokens.
4. Add schema-based request validation, safer log redaction, transfer velocity/abuse controls, deployment HTTPS/CORS configuration, and a security-header policy.
5. Replace static dashboard/admin metrics with accurate server-side aggregations; fix the broken admin row action and remove unsupported profile/security claims.
6. Prevent transfers to frozen receivers and add proper admin provisioning/audit workflows and database migrations.

