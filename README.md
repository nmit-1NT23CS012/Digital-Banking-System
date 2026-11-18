# Digital Banking System

A full-stack banking application demo built with React, Express, and MySQL. It provides account registration and login, balance and transaction views, money transfers, and an admin dashboard.

> **Educational project only.** This software is not a real bank and is not suitable for real funds or sensitive financial or personal information. Review the security limitations and test thoroughly before adapting it for any real-world use.

## Features

- Register and sign in with password hashing and JWT-based authentication.
- View account details, balance, and transaction history.
- Transfer funds to another registered user by email. Transfers use a database transaction and lock the affected account rows.
- Admin routes for user management, account freezing, funds adjustment, transactions, and summary statistics.
- Responsive React interface with dark/light theme support.
- Express API with input validation, rate limiting, Helmet, and parameterized MySQL queries.

## Technology

- **Frontend:** React 18, Vite, Tailwind CSS, React Router, Axios
- **Backend:** Node.js, Express, MySQL (`mysql2`), JWT, bcryptjs
- **Tests:** Node.js built-in assertions for backend validators and authentication middleware

## Requirements

- Node.js `20.19+` or `22.12+`
- npm
- MySQL 8+

## Local setup

1. Create the database and tables from the project root:

   ```sh
   mysql -u root -p < schema.sql
   ```

   In PowerShell, the equivalent is:

   ```powershell
   Get-Content .\schema.sql | mysql -u root -p
   ```

2. Configure the backend:

   ```powershell
   cd server
   Copy-Item .env.example .env
   ```

   Edit `server/.env` with your local MySQL credentials. Replace both JWT secrets with separate, randomly generated values (for example, generate each with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`). Never commit `.env`.

3. Install dependencies and start the API:

   ```sh
   npm ci
   npm run dev
   ```

   The API listens on `http://localhost:5000`; its health endpoint is `http://localhost:5000/health`.

4. In a second terminal, start the frontend:

   ```powershell
   cd client
   npm ci
   npm run dev
   ```

   Open `http://localhost:5173`. The Vite development server proxies `/api` requests to the local backend. To configure a different API URL, set `VITE_API_URL` in a local `client/.env` file.

The schema creates empty tables; register accounts through the application. New accounts start with a demo balance of 10,000, as configured in the schema and user model.

## Tests and build

Run backend tests:

```sh
cd server
npm test
```

Build the frontend:

```sh
cd client
npm run build
```

## API overview

All routes are prefixed with `/api`.

| Method | Route | Access |
| --- | --- | --- |
| `POST` | `/auth/register` | Public |
| `POST` | `/auth/login` | Public |
| `POST` | `/auth/refresh` | Refresh token |
| `GET` | `/auth/profile` | Authenticated |
| `POST` | `/auth/logout` | Authenticated |
| `POST` | `/transactions/transfer` | Authenticated |
| `GET` | `/transactions/history` | Authenticated |
| `GET` | `/transactions/balance` | Authenticated |
| `GET` | `/admin/users` | Admin |
| `PUT` | `/admin/freeze/:id` | Admin |
| `PUT` | `/admin/unfreeze/:id` | Admin |
| `DELETE` | `/admin/user/:id` | Admin |
| `POST` | `/admin/add-funds` | Admin |
| `GET` | `/admin/transactions` | Admin |
| `GET` | `/admin/stats` | Admin |

## Project layout

```text
client/       React application
server/       Express API, models, routes, and tests
schema.sql    MySQL database schema
```

## Security and project limitations

- Keep real credentials, tokens, database exports, and logs out of Git. `.env` files and logs are ignored; `.env.example` contains placeholders only.
- Use unique random JWT secrets and a dedicated, least-privilege database account for local testing.
- This demo has no email verification or password-reset flow, and its browser client stores JWTs in `localStorage`. It has not been independently security-audited or tested against a production database.
- Do not deploy it for real banking, payments, or handling real customer data without a professional security, compliance, and reliability review.

See [INSTALLATION.md](./INSTALLATION.md) for additional setup notes and [INTERVIEW_PROJECT_GUIDE.md](./INTERVIEW_PROJECT_GUIDE.md) for a code-oriented project walkthrough.
