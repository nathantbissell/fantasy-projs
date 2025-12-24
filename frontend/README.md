# CPFFL Frontend (Next.js)

Next.js (App Router) + React + TypeScript splash page that surfaces CPFFL league standings from the serverless API (Lambda + DynamoDB). Mantine powers the UI and Recharts renders quick visuals.

## Getting started

```bash
cd frontend
npm install
npm run dev
```

Then open the printed localhost URL (default `3000`).

## Environment

Create a `.env.local` file in `frontend/` with your deployed API Gateway base URL:

```
NEXT_PUBLIC_API_BASE_URL=https://<api-id>.execute-api.<region>.amazonaws.com
```

The page calls `${NEXT_PUBLIC_API_BASE_URL}/league/2025` to load live standings. If the env var is missing or the request fails, demo standings render instead.

## Scripts

- `npm run dev` - start Next dev server
- `npm run build` - production build
- `npm run start` - start production server
- `npm run lint` - run Next lint
- `npm run typecheck` - run TypeScript without emitting files
