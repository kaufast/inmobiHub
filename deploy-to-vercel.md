# Deploying Inmobi® to Vercel

This guide will help you deploy the Inmobi® real estate platform to Vercel.

## Prerequisites

1. A Vercel account (sign up at [vercel.com](https://vercel.com))
2. A GitHub repository with your Inmobi project (for easier deployment)
3. A PostgreSQL database - we recommend using [Neon.tech](https://neon.tech) which integrates well with Vercel

## Setting Up Neon Database (Recommended)

1. Sign up for a free account at [Neon.tech](https://neon.tech)
2. Create a new project
3. In your project dashboard, find and copy your connection string which looks like:
   ```
   postgres://username:password@hostname/database
   ```
4. Keep this connection string safe for the environment variables setup

## Environment Variables

You'll need to set up the following environment variables in your Vercel project:

```
DATABASE_URL=your_neon_postgres_connection_string
SESSION_SECRET=your_secure_session_secret

# Firebase settings (for authentication)
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_APP_ID=your_firebase_app_id

# AI Services (if used)
OPENAI_API_KEY=your_openai_api_key
ANTHROPIC_API_KEY=your_anthropic_api_key
```

## Deployment Steps

### Option 1: Deploy from GitHub (Recommended)

1. Push your project to GitHub
2. Log in to Vercel and click "Add New Project"
3. Import your GitHub repository
4. Configure the project:
   - Framework Preset: Other
   - Root Directory: ./
   - Build Command: npm run build
   - Output Directory: dist
5. Add all your environment variables from the list above
6. Click "Deploy"

### Option 2: Deploy with Vercel CLI

1. Install Vercel CLI and log in:
   ```
   npm i -g vercel
   vercel login
   ```

2. From the project root directory, deploy using:
   ```
   vercel
   ```

3. Follow the prompts and set up your environment variables when asked.

4. For production deployment:
   ```
   vercel --prod
   ```

## After Deployment

1. Add your Vercel deployment URL (e.g., `your-project.vercel.app`) to the list of authorized domains in your Firebase project settings.

2. If you're using Neon database, run migrations against your production database:
   ```bash
   # Set DATABASE_URL to your Neon connection string
   export DATABASE_URL=your_neon_connection_string
   
   # Run migrations
   npx drizzle-kit push
   ```

3. Test all features, especially authentication and database operations.

## Troubleshooting

- **Database connection issues**: Check that your Neon database has the appropriate access policies. By default, Neon allows connections from anywhere.

- **Authentication issues**: Verify that your Firebase project has the correct authentication methods enabled and that your Vercel deployment URL is in the authorized domains list.

- **Deployment failures**: Check the Vercel deployment logs for specific errors.

- **WebSocket limitations**: Note that Vercel's serverless functions don't support long-lived WebSocket connections. For extensive real-time features, consider using a service like Pusher or Firebase Realtime Database instead.

## Keeping Your App Updated

After making changes to your local project:

1. Push changes to GitHub
2. Vercel will automatically deploy your updates if you're using GitHub integration
3. For manual deployments, run `vercel --prod` from your project directory