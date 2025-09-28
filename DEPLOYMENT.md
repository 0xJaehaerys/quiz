# Deployment Guide - Gelora Quiz

## 🚀 Deploying to quiz.gelora.study

### Prerequisites

1. **Domain Configuration**: Ensure `quiz.gelora.study` is pointed to your hosting platform
2. **Environment Variables**: Set up required environment variables on your platform
3. **GitHub Repository**: Code is already committed and ready

### Step 1: Replace GitHub Repository Content

The current GitHub repository at https://github.com/0xJaehaerys/quiz contains old project files. To replace it with our new Gelora Quiz project:

```bash
# Force push to replace all content in the GitHub repo
git push -f origin master

# Or if you prefer to use main branch:
git branch -M main
git push -f origin main
```

⚠️ **Warning**: This will completely replace all content in the repository. Make sure you've backed up anything important from the old project.

### Step 2: Deploy to Vercel (Recommended)

1. **Connect GitHub Repository**:
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import from GitHub: `0xJaehaerys/quiz`

2. **Configure Environment Variables**:
   ```env
   NEYNAR_API_KEY=your_neynar_api_key
   NEXT_PUBLIC_NEYNAR_APP_ID=your_neynar_app_id
   NEXT_PUBLIC_PUBLIC_HOST=https://quiz.gelora.study
   SUPABASE_URL=your_supabase_url (optional)
   SUPABASE_ANON_KEY=your_supabase_anon_key (optional)
   ```

3. **Custom Domain**:
   - In Vercel project settings, go to "Domains"
   - Add `quiz.gelora.study`
   - Follow Vercel's instructions to configure DNS

### Step 3: Fix Build Issues (if any)

If there are compilation errors with framer-motion animations:

1. **Option 1 - Remove framer-motion entirely**:
   ```bash
   npm uninstall framer-motion
   ```

2. **Option 2 - Fix motion imports**:
   - Replace `motion` components with regular `div` elements
   - Use CSS animations instead of JavaScript animations

### Step 4: Test the Application

1. **Local Testing**:
   ```bash
   npm run dev
   # Visit http://localhost:3000
   ```

2. **Production Testing**:
   - Visit `https://quiz.gelora.study`
   - Test Farcaster Mini App functionality
   - Verify all routes work correctly

### Step 5: Farcaster Mini App Configuration

1. **Update Farcaster Manifest**:
   - The manifest is available at `https://quiz.gelora.study/.well-known/farcaster.json`
   - Verify it returns correct JSON

2. **Add to Farcaster**:
   - Open Farcaster mobile app
   - Settings → Developer Mode → Enable
   - Add Mini App: `https://quiz.gelora.study/farcaster`

## 🎨 Gelora Theme Features

### Design System
- **Dark theme by default** with graphite background (`#0b0d10`)
- **Turquoise accent** (`#00d0c7`) for interactive elements
- **Large border radius** (2xl for cards, xl for inputs)
- **Generous spacing** and typography with Inter/Geist fonts
- **Subtle animations** with CSS transitions

### Component Variants
- **Button**: `accent`, `ghost`, `outline` variants
- **Badge**: `success`, `default`, `destructive`, `accent` variants
- **Cards**: Hover effects with scale and ring animations

## 🔧 Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEYNAR_API_KEY` | Yes | Neynar API key for Farcaster auth |
| `NEXT_PUBLIC_NEYNAR_APP_ID` | Yes | Neynar App ID |
| `NEXT_PUBLIC_PUBLIC_HOST` | Yes | Public URL: `https://quiz.gelora.study` |
| `SUPABASE_URL` | No | Supabase project URL |
| `SUPABASE_ANON_KEY` | No | Supabase anonymous key |

## 📞 Support

If you encounter any issues during deployment:
1. Check the build logs for specific errors
2. Verify all environment variables are set correctly
3. Test the Farcaster manifest endpoint
4. Ensure DNS is properly configured for the custom domain

---

**Built with ❤️ for Gelora**
