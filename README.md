# Inmobi - Modern Real Estate Platform

A cutting-edge real estate platform that leverages advanced AI technologies to transform property discovery and user engagement through intelligent, interactive, and personalized experiences.

## Features

- Next.js frontend
- TypeScript
- Tailwind CSS
- Firebase Authentication
- Anthropic AI Chat Integration
- Real-time messaging
- Interactive map integration
- Machine learning recommendations
- PostgreSQL database
- WebSocket communication
- Responsive mobile-first design
- Predictive search functionality
- GDPR-compliant cookie consent system
- User verification system

## Deployment to Vercel

### Prerequisites

1. A Vercel account
2. A GitHub account
3. Neon PostgreSQL database (or other compatible PostgreSQL hosting)
4. API keys for:
   - OpenAI
   - Anthropic
   - Perplexity (optional)
   - Firebase (project ID, app ID, API key)

### Deployment Steps

1. Push this repository to GitHub.

2. In Vercel:
   - Create a new project
   - Connect to your GitHub repository
   - Configure the following settings:
     - Framework Preset: Other
     - Build Command: `npm run build`
     - Output Directory: `dist`
     - Install Command: `npm install`

3. Set up environment variables in Vercel:
   - Copy all variables from `.env.example`
   - Fill in your actual values for each

4. Deploy!

5. After deployment:
   - Add your Vercel domain to Firebase authorized domains for authentication
   - Ensure your database is properly secured

## Local Development

1. Clone the repository
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env` and fill in your values
4. Run the development server: `npm run dev`
5. Access the application at http://localhost:3000

## Database Management

The application uses Drizzle ORM with PostgreSQL. To update the database schema:

```bash
npm run db:push
```

## License

MIT