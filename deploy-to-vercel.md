# Deploying Inmobi® to Vercel

This guide will help you deploy the Inmobi® real estate platform to Vercel.

## Prerequisites

1. A Vercel account (sign up at [vercel.com](https://vercel.com))
2. Vercel CLI installed: `npm i -g vercel`
3. A PostgreSQL database (you can use Neon.tech, Supabase, or any other PostgreSQL provider)

## Environment Variables

You'll need to set up the following environment variables in your Vercel project:

```
DATABASE_URL=your_postgres_connection_string
SESSION_SECRET=your_secure_session_secret

# Firebase settings
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_APP_ID=your_firebase_app_id
```

## Deployment Steps

1. Log in to Vercel CLI:
   ```
   vercel login
   ```

2. From the project root directory, deploy using:
   ```
   vercel
   ```

3. Follow the prompts. When asked about the build command, use the default.

4. After the initial deployment, you can set up your environment variables:
   ```
   vercel env add DATABASE_URL
   vercel env add SESSION_SECRET
   vercel env add VITE_FIREBASE_API_KEY
   vercel env add VITE_FIREBASE_PROJECT_ID
   vercel env add VITE_FIREBASE_APP_ID
   ```

5. Redeploy with the environment variables:
   ```
   vercel --prod
   ```

## After Deployment

1. Make sure to add your Vercel deployment URL to the list of authorized domains in your Firebase project settings.

2. Test all features, especially authentication, to ensure everything is working correctly.

## Troubleshooting

- If you encounter database connection issues, verify that your Vercel deployment can reach your PostgreSQL database (check network policies).
- If WebSocket connections fail, make sure your Vercel deployment is on a plan that supports WebSockets.
- For any authentication issues, check the Firebase console logs.

## Neon Database Migration

If you're using Neon for your PostgreSQL database, you'll need to run migrations:

```bash
# Update the DATABASE_URL environment variable first
export DATABASE_URL=your_neon_connection_string

# Then run migrations
npx drizzle-kit push
```