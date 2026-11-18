# Quick start

1. Import `schema.sql` into a local MySQL 8 database:

   ```sh
   mysql -u root -p < schema.sql
   ```

2. In `server/`, copy `.env.example` to `.env`. Configure your local database credentials and replace the example JWT values with two different, randomly generated secrets.
3. Start the API in a terminal:

   ```sh
   cd server
   npm ci
   npm run dev
   ```

4. Start the frontend in a second terminal:

   ```sh
   cd client
   npm ci
   npm run dev
   ```

5. Open `http://localhost:5173` and register a test account.

For requirements, PowerShell instructions, tests, and security notes, see the [README](./README.md). Never commit `.env` or use real financial or personal information with this educational demo.
