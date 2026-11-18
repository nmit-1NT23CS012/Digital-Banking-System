# Installation

See the [README](./README.md) for requirements, environment configuration, test commands, and a complete local setup.

## Quick setup

1. Install Node.js 20.19+ (or 22.12+) and MySQL 8+.
2. From the project root, create the schema:

   ```sh
   mysql -u root -p < schema.sql
   ```

3. In `server/`, copy `.env.example` to `.env`, then set your local MySQL credentials and two separate random JWT secrets. Do not commit `.env`.
4. In `server/`, run `npm ci` and `npm run dev`.
5. In another terminal, run `npm ci` and `npm run dev` from `client/`.
6. Open `http://localhost:5173` and register a test account.

This is an educational demo. Do not use real financial or personal data.
