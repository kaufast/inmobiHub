# Inmobi® Real Estate Platform

A cutting-edge real estate platform that leverages advanced AI technologies to transform property discovery and user engagement through intelligent, interactive, and personalized experiences.

## Key Features

- Interactive property maps with neighborhood insights
- AI-powered property recommendations
- Personalized property matching
- Real-time messaging system
- Multi-modal search (text, image, and voice)
- Property tour scheduling
- Premium analytics for serious buyers
- Firebase Authentication with SMS verification and Apple Keychain
- WebSocket-based real-time notifications
- Responsive mobile-first design
- GDPR-compliant cookie consent

## Tech Stack

- Frontend: React.js with TypeScript and Tailwind CSS
- Backend: Node.js with Express
- Database: PostgreSQL with Drizzle ORM
- Authentication: Firebase Authentication
- AI Integration: Anthropic Claude and OpenAI
- Real-time: WebSocket

## Getting Started

### Prerequisites

- Node.js v20+
- PostgreSQL database
- Firebase project with SMS authentication enabled

### Setup

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Copy the environment variables template:
   ```
   cp .env.example .env
   ```
4. Fill in the environment variables in `.env`
5. Start the development server:
   ```
   npm run dev
   ```

## Firebase Authentication Setup (Coming Tomorrow)

To complete the Firebase authentication setup:

1. Create a Firebase project in the [Firebase Console](https://console.firebase.google.com/)
2. Enable Authentication methods:
   - Phone authentication (for SMS verification)
   - Apple Sign-In (for Apple Keychain integration)
   - Google Sign-In (as an alternative)
3. Add your app's domain to the authorized domains list
4. Copy your Firebase project credentials to the `.env` file

## Deployment

See [deploy-to-vercel.md](./deploy-to-vercel.md) for detailed deployment instructions.

## License

This project is proprietary software. All rights reserved.