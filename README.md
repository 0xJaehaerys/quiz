# Gelora Quiz - Farcaster Mini App

🎯 **Interactive quiz platform built for the Farcaster ecosystem**

Test your Web3 knowledge with beautifully designed quizzes featuring the Gelora brand aesthetic. Built as a native Farcaster Mini App with seamless authentication and social sharing.

🌐 **Live at**: [quiz.gelora.study](https://quiz.gelora.study)

## 🚀 Features

- **Farcaster Integration**: Built as a Mini App with seamless Farcaster authentication
- **Interactive Quizzes**: Multiple-choice questions with real-time feedback
- **Social Features**: Leaderboards and result sharing
- **Mobile Optimized**: Designed for the Farcaster mobile experience
- **Dark Theme**: Elegant design with Farcaster-friendly aesthetics

## 🛠 Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui with Radix UI primitives
- **Farcaster**: @farcaster/miniapp-sdk for Mini App integration
- **Authentication**: @neynar/react for Farcaster auth
- **Backend**: Next.js API routes
- **Database**: Supabase (optional, falls back to mock data)
- **Styling**: Tailwind CSS with custom animations

## 📋 Prerequisites

- Node.js 18+ 
- npm or pnpm package manager
- Farcaster account for testing
- (Optional) Neynar API credentials
- (Optional) Supabase project

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd gelora-farcaster-quiz
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   pnpm install
   ```

3. **Environment setup**
   ```bash
   cp .env.example .env.local
   ```

4. **Configure environment variables**
   
   Edit `.env.local` with your settings:
   
   ```env
   # Required for production
   NEYNAR_API_KEY=your_neynar_api_key
   NEXT_PUBLIC_NEYNAR_APP_ID=your_neynar_app_id
   NEXT_PUBLIC_PUBLIC_HOST=your_public_url
   
   # Optional (for persistent leaderboards)
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

## 🚀 Development

1. **Start the development server**
   ```bash
   npm run dev
   ```

2. **Open in browser**
   Navigate to `http://localhost:3000`

3. **Test Mini App functionality**
   - For full Mini App testing, you'll need to set up tunneling (see deployment section)
   - The app will show instructions when not running in Farcaster environment

## 🌐 Deployment & Testing

### Local Testing with Tunnel

1. **Set up tunnel** (using cloudflared or ngrok)
   ```bash
   # Using cloudflared (recommended)
   cloudflared tunnel --url localhost:3000
   
   # Using ngrok
   ngrok http 3000
   ```

2. **Update environment variables**
   ```env
   NEXT_PUBLIC_PUBLIC_HOST=https://your-tunnel-url.trycloudflare.com
   ```

3. **Update Farcaster manifest**
   The app automatically uses `NEXT_PUBLIC_PUBLIC_HOST` for manifest URLs

4. **Test in Farcaster**
   - Open Farcaster mobile app
   - Go to Settings → Developer Mode → Enable
   - Add Mini App URL: `https://your-tunnel-url.trycloudflare.com/farcaster`

### Production Deployment

1. **Deploy to Vercel** (recommended)
   ```bash
   npm run build
   vercel --prod
   ```

2. **Update environment variables on Vercel**
   Add all environment variables in Vercel dashboard

3. **Verify manifest**
   Check `https://your-domain.vercel.app/.well-known/farcaster.json`

## 🔐 Getting API Credentials

### Neynar API

1. Visit [Neynar Dashboard](https://neynar.com)
2. Create an account and new app
3. Get your API key and App ID
4. Add to environment variables

### Supabase (Optional)

1. Create project at [Supabase](https://supabase.com)
2. Get URL and anon key from settings
3. Run the schema from `lib/supabase.ts` to create tables
4. Add to environment variables

## 📱 Farcaster Mini App Setup

### Adding to Farcaster

1. **Enable Developer Mode**
   - Open Farcaster app
   - Settings → Developer Mode → Enable

2. **Add Mini App**
   - Developer section → Add Mini App
   - Enter your app URL: `https://your-domain.com/farcaster`

3. **Test the App**
   - Mini App should appear in your Farcaster app
   - Test authentication and quiz functionality

### Manifest Configuration

The app includes:
- **Manifest endpoint**: `/farcaster/manifest`
- **Well-known file**: `/.well-known/farcaster.json`
- **Icon and splash**: `/icon.svg`, `/splash.svg`

## 🎮 Usage

### For Players

1. **Access via Farcaster**: Open the Mini App in Farcaster mobile app
2. **Sign In**: Authenticate with your Farcaster account
3. **Choose Quiz**: Browse categories and select a quiz
4. **Play**: Answer questions within time limits
5. **Share Results**: Share your score with the Farcaster community

### For Developers

1. **Add Quizzes**: Edit `lib/quizzes.ts` to add new quiz content
2. **Customize Themes**: Modify `app/globals.css` for styling
3. **Extend Features**: Add new components in `components/`

## 📁 Project Structure

```
├── app/                          # Next.js App Router
│   ├── (web)/page.tsx           # Landing page
│   ├── (mini)/farcaster/        # Mini App routes
│   │   ├── page.tsx             # Mini App home
│   │   ├── quizzes/page.tsx     # Quiz catalog
│   │   ├── quiz/[id]/page.tsx   # Quiz player
│   │   └── manifest.ts          # Farcaster manifest
│   ├── api/                     # API routes
│   │   ├── quizzes/             # Quiz endpoints
│   │   └── fc/                  # Farcaster endpoints
│   ├── globals.css              # Global styles
│   └── layout.tsx               # Root layout
├── components/                   # React components
│   ├── ui/                      # shadcn/ui components
│   ├── providers/               # Context providers
│   ├── QuizCard.tsx             # Quiz card component
│   └── QuizPlayer.tsx           # Quiz player component
├── lib/                         # Utility libraries
│   ├── fc.ts                    # Farcaster SDK helpers
│   ├── neynar.ts                # Neynar API client
│   ├── quizzes.ts               # Quiz data & logic
│   ├── supabase.ts              # Supabase client
│   └── utils.ts                 # General utilities
├── types/                       # TypeScript types
├── public/                      # Static assets
│   ├── .well-known/            # Farcaster manifest
│   ├── icon.svg                # App icon
│   └── manifest.json           # PWA manifest
└── README.md                   # This file
```

## 🎨 Theming (Gelora)

The app uses a custom dark theme called "Gelora" with carefully crafted design tokens for an elegant, minimalist experience.

### Design System

- **Typography**: Inter for UI text, Geist Mono for code/numbers
- **Radius**: Large rounded corners (2xl for cards/buttons, xl for inputs)
- **Shadows**: Soft, subtle shadows with ring effects on hover/focus
- **Animations**: Lightweight framer-motion transitions (100-150ms)
- **Spacing**: Generous padding and margins for breathing room

### Color Tokens

The Gelora theme uses HSL color values defined in `app/globals.css`:

```css
:root {
  /* Main backgrounds */
  --bg: 220 22% 4%;              /* #0b0d10 - main background */
  --panel: 220 20% 8%;           /* #12151a - secondary panels */
  --card: 220 18% 10%;           /* #12161c - card backgrounds */
  
  /* Text colors */
  --foreground: 218 27% 94%;     /* #e6ecf3 - primary text */
  --muted: 218 11% 65%;          /* #8b94a7 - secondary text */
  
  /* Accent (Gelora turquoise) */
  --accent: 179 100% 41%;        /* #00d0c7 - brand accent */
  --accent-foreground: 183 100% 5%; /* #001a18 - accent text */
  
  /* Borders and UI elements */
  --border: 220 15% 17%;         /* #1d222b - borders */
  --ring: 179 100% 55%;          /* #16ffe3 - focus rings */
}
```

### Utility Classes

The theme includes custom utility classes for common patterns:

```css
/* Containers */
.gelora-container          /* Max-width container with responsive padding */
.gelora-card               /* Card with proper styling and padding */

/* Buttons */
.gelora-button-accent      /* Primary accent button */
.gelora-button-ghost       /* Ghost button variant */
.gelora-button-outline     /* Outline button variant */

/* Typography */
.gelora-typography-h1      /* Consistent heading styles */
.gelora-text-primary       /* Primary text color */
.gelora-text-secondary     /* Muted text color */

/* Layout */
.gelora-section-padding    /* Consistent section spacing */
.gelora-card-hover         /* Card hover effects */
```

### Component Variants

shadcn/ui components are customized with Gelora-specific variants:

**Button Variants:**
- `accent` - Gelora turquoise with hover effects
- `ghost` - Transparent with subtle hover
- `outline` - Border with accent hover states

**Badge Variants:**
- `success` - Green for easy difficulty
- `default` - Muted for medium difficulty  
- `destructive` - Red for hard difficulty
- `accent` - Gelora turquoise for highlights

**Card Styling:**
- Rounded corners (rounded-2xl)
- Subtle borders and backgrounds
- Hover effects with scale and ring

### Customizing Colors

To modify the Gelora theme colors:

1. **Edit CSS variables in `app/globals.css`:**
   ```css
   :root {
     --accent: 179 100% 41%;  /* Change this HSL value */
     --bg: 220 22% 4%;        /* Adjust background darkness */
     /* ... other variables */
   }
   ```

2. **The color system uses HSL values** for better manipulation:
   - Hue (0-360): Color wheel position
   - Saturation (0-100%): Color intensity  
   - Lightness (0-100%): Brightness level

3. **All components automatically inherit** the new colors through CSS variables

### Animation System

Gelora uses subtle micro-animations powered by framer-motion:

- **Entrance**: Fade + slight upward motion (0.12-0.16s)
- **Stagger**: Children animate with 40ms delays
- **Hover**: Scale transforms (1.01-1.02) with ring effects
- **Focus**: Ring animations for accessibility

### Adding New Quizzes

Edit `lib/quizzes.ts`:

```typescript
export const mockQuizzes: Quiz[] = [
  {
    id: 'your-quiz-id',
    title: 'Your Quiz Title',
    description: 'Quiz description',
    category: 'Your Category',
    difficulty: 'easy' | 'medium' | 'hard',
    totalQuestions: 5,
    timeLimit: 300, // seconds
    questions: [
      {
        id: 'q1',
        text: 'Your question?',
        options: ['Option A', 'Option B', 'Option C', 'Option D'],
        correctAnswer: 0, // index of correct option
        explanation: 'Explanation of the answer'
      }
      // ... more questions
    ]
  }
  // ... more quizzes
]
```

## 🔧 Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript checks

## 📝 Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEYNAR_API_KEY` | Yes | Neynar API key for Farcaster auth |
| `NEXT_PUBLIC_NEYNAR_APP_ID` | Yes | Neynar App ID |
| `NEXT_PUBLIC_PUBLIC_HOST` | Yes | Public URL for Mini App |
| `SUPABASE_URL` | No | Supabase project URL |
| `SUPABASE_ANON_KEY` | No | Supabase anonymous key |

## 🐛 Troubleshooting

### Common Issues

1. **"Open in Farcaster" message**
   - App is not running in Farcaster environment
   - Use tunnel URL and add to Farcaster Developer section

2. **Authentication not working**
   - Check Neynar API credentials
   - Verify app is added to Farcaster properly

3. **Quizzes not loading**
   - Check API routes are working (`/api/quizzes/list`)
   - Verify mock data in `lib/quizzes.ts`

4. **Manifest not found**
   - Check `.well-known/farcaster.json` is accessible
   - Verify `NEXT_PUBLIC_PUBLIC_HOST` is set correctly

### Development Tips

- Use browser dev tools to test Mini App functionality
- Check console for Farcaster SDK errors
- Test with mock data before implementing Supabase
- Use tunnel for testing real Farcaster integration

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is open source and available under the MIT License.

## 🔗 Links

- [Farcaster Mini Apps Documentation](https://docs.farcaster.xyz/developers/mini-apps/overview)
- [Neynar API Documentation](https://neynar.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [shadcn/ui Components](https://ui.shadcn.com/)

---

Built with ❤️ for the Farcaster community
