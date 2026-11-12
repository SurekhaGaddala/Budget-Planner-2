# Budget Planner

A full-stack personal finance dashboard built with React + Vite, Express, MongoDB, JWT, Redux Toolkit Query, Recharts and the Frankfurter currency API.

## Features
- Register/login with bcrypt password hashing and JWT authentication
- Income and expense transactions (add/delete)
- Monthly budget creation and category allocation
- Savings goals with progress tracking
- Dashboard totals and category analytics
- Financial profile endpoint
- Currency conversion using the public Frankfurter API
- Responsive layout, CSS Grid/Flexbox, semantic HTML, Local Storage
- GitHub Actions frontend build workflow

## Requirements
- Node.js 18+ (Node 20 LTS recommended)
- MongoDB Atlas account or local MongoDB
- VS Code

## Setup
1. Extract the ZIP and open the `budget-planner` folder in VS Code.
2. Open a terminal in the project root and run:
   ```bash
   npm install
   npm --prefix backend install
   npm --prefix frontend install
   ```
3. Create `backend/.env` by copying `backend/.env.example`. Set your MongoDB connection string and a long random JWT secret.
4. Start the backend and frontend together:
   ```bash
   npm run dev
   ```
5. Open http://localhost:5173 and register a new account.

Backend runs at http://localhost:5000. Health check: http://localhost:5000/api/health

## MongoDB Atlas
1. Create a free cluster at https://www.mongodb.com/atlas.
2. Create a database user and password.
3. In Network Access, allow your current IP address.
4. Select Connect > Drivers, copy the Node.js connection string.
5. Replace `<password>` and add `/budget_planner` before the query string.
6. Paste it as `MONGO_URI` in `backend/.env`.

Example:
`MONGO_URI=mongodb+srv://YOUR_USER:YOUR_PASSWORD@YOUR_CLUSTER.mongodb.net/budget_planner?retryWrites=true&w=majority`

Do not share your `.env` file or commit it to GitHub.

## Production deployment (overview)
- Deploy `backend` to Render or Railway. Add `MONGO_URI`, `JWT_SECRET`, and `CLIENT_URL` environment variables.
- Deploy `frontend` to Vercel. Set `VITE_API_URL` to your deployed backend URL plus `/api`.
- Update backend `CLIENT_URL` to your Vercel frontend URL.
- In Vercel, set the frontend root directory to `frontend`.
- Redeploy after adding environment variables.

## GitHub Actions
The workflow in `.github/workflows/frontend-ci.yml` installs frontend dependencies and runs a production build on pushes and pull requests.

## Notes
- This is an academic starter project. Review and customize the UI, validation, categories and reports before submission.
- The currency converter uses Frankfurter's public API and does not require an API key.
