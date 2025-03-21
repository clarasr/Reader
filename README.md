# RSS Vision - Modern RSS Feed Reader

A modern RSS feed reader with Vision OS-inspired design, Tinder-style article swiping, and powerful reading features.

## Features

- **Modern Design**: Glassmorphic UI inspired by Vision OS with focus on readability
- **For You Page**: Quickly select articles to read later by swiping left or right, Tinder-style
- **Focus Mode**: Distraction-free reading experience with comfortable typography
- **Feed Management**: Organize feeds into groups, monitor feed health, and import/export feeds
- **Advanced Features**:
  - Google authentication with data sync
  - Dark/light theme toggle
  - Keyboard shortcuts for navigation
  - Reading time estimates
  - Text-to-speech functionality
  - Highlighting and note-taking
  - Newsletter to RSS conversion

## Tech Stack

- **Frontend**: Next.js with TypeScript and Tailwind CSS
- **Backend**: Supabase for authentication, database, and storage
- **Libraries**:
  - shadcn/ui for UI components
  - Framer Motion for animations
  - React Swipeable for swipe gestures
  - RSS Parser for feed parsing

## Getting Started

### Prerequisites

- Node.js 18+ and pnpm
- Supabase account with project set up

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/clarasr/Reader.git
   cd Reader
   ```

2. Install dependencies:
   ```
   pnpm install
   ```

3. Set up environment variables:
   Create a `.env.local` file with your Supabase credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

4. Apply the database schema to your Supabase project:
   ```
   node apply-schema.js
   ```

5. Start the development server:
   ```
   pnpm dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment

To deploy the application to your GitHub repository:

```
node deploy-to-github.js
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.
