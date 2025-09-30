# 🚀 Gelora Quiz - Production Setup Instructions

## Phase 1: Foundation Setup ✅ COMPLETED

### Critical Issues FIXED:
- ✅ **Database Architecture**: Migrated from hardcoded mock data to production-ready Supabase
- ✅ **API Security**: Added rate limiting middleware (30 requests/minute)
- ✅ **Error Handling**: Implemented Error Boundaries with graceful degradation
- ✅ **Mobile Optimization**: Complete responsive design overhaul

---

## 🗄️ **Step 1: Supabase Database Setup**

### 1.1 Create Supabase Project
1. Go to [supabase.com](https://supabase.com) and create a new project
2. Choose a database password and region
3. Wait for project initialization (2-3 minutes)

### 1.2 Run Database Schema
1. Go to **SQL Editor** in your Supabase dashboard
2. Copy and paste the entire content from `database/supabase-schema.sql`
3. Click **Run** to create all tables, triggers, and functions

### 1.3 Get API Keys
1. Go to **Settings** > **API**
2. Copy the following values:
   - `Project URL` → `SUPABASE_URL`
   - `anon/public` key → `SUPABASE_ANON_KEY` 
   - `service_role` key → `SUPABASE_SERVICE_KEY`

---

## ⚙️ **Step 2: Environment Configuration**

### 2.1 Create .env.local file:
```bash
# Supabase Configuration
SUPABASE_URL="your-project-url"
SUPABASE_ANON_KEY="your-anon-key"  
SUPABASE_SERVICE_KEY="your-service-key"

# Farcaster Configuration  
NEYNAR_API_KEY="your-neynar-api-key"
NEXT_PUBLIC_NEYNAR_APP_ID="your-neynar-app-id"

# App Configuration
NEXT_PUBLIC_PUBLIC_HOST="https://your-domain.com"
NODE_ENV="production"
```

### 2.2 Get Neynar API Keys
1. Go to [neynar.com](https://neynar.com) 
2. Create developer account
3. Create new app and get API keys

---

## 📦 **Step 3: Install Dependencies & Migrate Data**

```bash
# Install new dependencies
npm install @supabase/supabase-js dotenv tsx

# Migrate quiz data from mock to database
npm run migrate

# This will:
# ✅ Create categories (Crypto, Web3, NFTs, DeFi, Blockchain)  
# ✅ Insert all quizzes with proper relationships
# ✅ Insert questions with analytics setup
# ✅ Verify data integrity
```

---

## 🔍 **Step 4: Test Integration**

### 4.1 Development Testing
```bash
npm run dev
```

Check console logs:
- ✅ `📋 Fetching quizzes from database...`
- ✅ `✅ Successfully fetched X quizzes`  
- ✅ `🔐 Applying rate limit to...`

### 4.2 API Endpoint Testing
Test these endpoints:
- `GET /api/quizzes/list` → Should return database quizzes
- `GET /api/quizzes/[id]` → Should return quiz with questions
- `POST /api/quizzes/submit` → Should save to database

### 4.3 Rate Limiting Testing
```bash
# Test rate limiting (should get 429 after 30 requests)
for i in {1..35}; do curl http://localhost:3000/api/quizzes/list; done
```

---

## 🚨 **Step 5: Troubleshooting**

### Database Connection Issues
```bash
# Check if environment variables are loaded
npm run dev
# Look for: "Supabase not configured. Using mock data."
```

### Migration Issues  
```bash
# Re-run migration with debug info
npm run migrate
# Check logs for specific SQL errors
```

### API Issues
Check browser DevTools → Network:
- Look for 500 errors with detailed error messages
- Check `X-RateLimit-*` headers

---

## 📊 **Database Schema Overview**

### Core Tables:
- **`quizzes`** - Quiz metadata with categories
- **`questions`** - Questions with proper ordering  
- **`quiz_sessions`** - User attempts (leaderboards)
- **`user_answers`** - Individual answers (analytics)

### Analytics Tables:
- **`question_analytics`** - Question difficulty analysis
- **`quiz_analytics`** - Quiz performance metrics
- **`daily_stats`** - Usage trends

### Gamification Tables:  
- **`achievements`** - Available achievements
- **`user_achievements`** - Unlocked user achievements
- **`user_profiles`** - XP, levels, streaks

---

## 🔥 **Key Improvements Made**

### 🗄️ **Database Architecture**
- Production-ready PostgreSQL schema
- Proper relationships and constraints
- Real-time analytics with triggers
- Row Level Security (RLS) policies

### 🛡️ **Security**
- Rate limiting: 30 req/minute per IP
- CORS headers for Farcaster domains
- XSS protection headers
- Input validation with Zod schemas

### ⚡ **Performance**  
- Optimized database indexes
- Efficient queries with joins
- Fallback to mock data if DB fails
- Cached leaderboards

### 📱 **Error Handling**
- Error Boundaries at component/page/critical levels
- Graceful degradation for API failures
- Development vs production error details
- User-friendly error messages

### 🎯 **Analytics Ready**
- Question difficulty tracking
- User performance analytics  
- Daily usage statistics
- Achievement unlocking system

---

## 🚀 **Next Steps (Phase 2)**

After Phase 1 is working:

1. **Real-time Features**
   - Live leaderboard updates with Supabase Realtime
   - Push notifications for challenges
   
2. **Advanced Analytics** 
   - Question difficulty analysis dashboard
   - User learning paths
   
3. **Gamification**
   - Achievement system activation
   - XP and leveling mechanics

4. **Social Features**
   - Friend challenges
   - Quiz sharing in Farcaster feeds

---

## ✅ **Checklist**

- [ ] Supabase project created
- [ ] Database schema applied
- [ ] Environment variables configured  
- [ ] Dependencies installed
- [ ] Migration completed successfully
- [ ] API endpoints tested
- [ ] Rate limiting verified
- [ ] Error boundaries tested
- [ ] Production deployment ready

**🎉 Ready for production deployment!**
