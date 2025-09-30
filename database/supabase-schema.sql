-- Gelora Quiz Platform - Supabase Database Schema
-- Production-ready schema with analytics support

-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- ================================================
-- CORE QUIZ TABLES
-- ================================================

-- Quiz categories (normalized)
create table categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  icon text, -- emoji or icon name
  color text default '#00d0c7', -- hex color for UI
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Main quizzes table
create table quizzes (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  category_id uuid references categories(id) on delete set null,
  difficulty text not null check (difficulty in ('easy', 'medium', 'hard')),
  time_limit integer, -- seconds
  total_questions integer not null default 0,
  image_url text,
  is_active boolean default true,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Quiz questions
create table questions (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid not null references quizzes(id) on delete cascade,
  text text not null,
  options jsonb not null, -- array of answer options
  correct_answer integer not null, -- index of correct option (0-based)
  explanation text,
  image_url text,
  order_index integer not null, -- question order in quiz
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  
  -- Constraints
  constraint valid_correct_answer check (correct_answer >= 0 AND correct_answer < jsonb_array_length(options)),
  constraint valid_options check (jsonb_array_length(options) >= 2)
);

-- ================================================
-- USER INTERACTION TABLES
-- ================================================

-- User quiz sessions (tracks individual attempts)
create table quiz_sessions (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid not null references quizzes(id) on delete cascade,
  fid bigint not null, -- Farcaster ID
  username text, -- Farcaster username (denormalized for performance)
  display_name text, -- Farcaster display name
  profile_image text, -- Farcaster profile image URL
  
  -- Quiz results
  score integer not null default 0, -- percentage (0-100)
  correct_answers integer not null default 0,
  total_questions integer not null,
  time_spent integer not null default 0, -- seconds
  
  -- Session metadata
  started_at timestamp with time zone default now(),
  completed_at timestamp with time zone,
  is_completed boolean default false,
  
  -- Performance indexes
  unique(id, fid) -- composite index for faster user queries
);

-- Individual question answers (for detailed analytics)
create table user_answers (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references quiz_sessions(id) on delete cascade,
  question_id uuid not null references questions(id) on delete cascade,
  selected_option integer not null,
  is_correct boolean not null,
  time_spent integer not null default 0, -- seconds spent on this question
  answered_at timestamp with time zone default now()
);

-- ================================================
-- ANALYTICS TABLES  
-- ================================================

-- Question difficulty analytics
create table question_analytics (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references questions(id) on delete cascade unique,
  
  -- Performance metrics
  total_attempts integer default 0,
  correct_attempts integer default 0,
  average_time_spent numeric(5,2) default 0, -- seconds
  difficulty_score numeric(3,2) default 0, -- 0-1 (calculated: incorrect_rate)
  
  -- Time-based analytics
  last_updated timestamp with time zone default now(),
  
  -- Derived fields (updated via triggers)
  success_rate numeric(5,2) generated always as (
    case when total_attempts > 0 
    then (correct_attempts::numeric / total_attempts::numeric) * 100 
    else 0 end
  ) stored
);

-- Quiz performance analytics
create table quiz_analytics (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid not null references quizzes(id) on delete cascade unique,
  
  -- Completion metrics
  total_attempts integer default 0,
  completed_attempts integer default 0,
  average_score numeric(5,2) default 0,
  average_time_spent numeric(8,2) default 0, -- seconds
  
  -- Engagement metrics
  bounce_rate numeric(5,2) default 0, -- % who quit without completing
  retry_rate numeric(5,2) default 0, -- % who attempt multiple times
  
  last_updated timestamp with time zone default now()
);

-- Daily usage analytics (for trends)
create table daily_stats (
  id uuid primary key default gen_random_uuid(),
  date date not null,
  quiz_id uuid references quizzes(id) on delete cascade,
  
  -- Daily metrics
  unique_users integer default 0,
  total_attempts integer default 0,
  completed_attempts integer default 0,
  average_score numeric(5,2) default 0,
  
  unique(date, quiz_id)
);

-- ================================================
-- GAMIFICATION TABLES
-- ================================================

-- Achievement definitions
create table achievements (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text not null,
  icon text not null, -- emoji or icon identifier
  requirement_type text not null check (requirement_type in ('streak', 'score', 'count', 'time', 'perfect')),
  requirement_value integer not null,
  points integer default 0, -- XP points awarded
  rarity text default 'common' check (rarity in ('common', 'rare', 'epic', 'legendary')),
  is_active boolean default true,
  created_at timestamp with time zone default now()
);

-- User achievements (unlocked achievements)
create table user_achievements (
  id uuid primary key default gen_random_uuid(),
  fid bigint not null,
  achievement_id uuid not null references achievements(id) on delete cascade,
  unlocked_at timestamp with time zone default now(),
  
  unique(fid, achievement_id)
);

-- User XP and level tracking
create table user_profiles (
  id uuid primary key default gen_random_uuid(),
  fid bigint not null unique,
  username text,
  display_name text,
  
  -- Gamification
  total_xp integer default 0,
  current_level integer default 1,
  current_streak integer default 0, -- consecutive days with quiz activity
  max_streak integer default 0,
  
  -- Performance stats
  total_quizzes_completed integer default 0,
  total_questions_answered integer default 0,
  total_correct_answers integer default 0,
  average_score numeric(5,2) default 0,
  
  -- Timestamps
  first_quiz_at timestamp with time zone,
  last_active_at timestamp with time zone default now(),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- ================================================
-- INDEXES FOR PERFORMANCE
-- ================================================

-- Quiz sessions indexes (most important for leaderboards)
create index idx_quiz_sessions_quiz_id on quiz_sessions(quiz_id);
create index idx_quiz_sessions_fid on quiz_sessions(fid);
create index idx_quiz_sessions_score on quiz_sessions(score desc, time_spent asc);
create index idx_quiz_sessions_completed on quiz_sessions(completed_at desc) where is_completed = true;

-- Question analytics indexes
create index idx_user_answers_session on user_answers(session_id);
create index idx_user_answers_question on user_answers(question_id);
create index idx_user_answers_time on user_answers(answered_at);

-- Composite index for leaderboards (quiz + performance)
create index idx_leaderboard on quiz_sessions(quiz_id, score desc, time_spent asc, completed_at desc) 
where is_completed = true;

-- User profile indexes
create index idx_user_profiles_xp on user_profiles(total_xp desc);
create index idx_user_profiles_streak on user_profiles(current_streak desc);
create index idx_user_profiles_active on user_profiles(last_active_at desc);

-- ================================================
-- FUNCTIONS AND TRIGGERS
-- ================================================

-- Function to update quiz total_questions when questions are added/removed
create or replace function update_quiz_question_count()
returns trigger as $$
begin
  if TG_OP = 'INSERT' then
    update quizzes set total_questions = total_questions + 1 where id = NEW.quiz_id;
    return NEW;
  elsif TG_OP = 'DELETE' then
    update quizzes set total_questions = total_questions - 1 where id = OLD.quiz_id;
    return OLD;
  end if;
  return null;
end;
$$ language plpgsql;

create trigger trigger_update_quiz_question_count
  after insert or delete on questions
  for each row execute function update_quiz_question_count();

-- Function to update question analytics
create or replace function update_question_analytics()
returns trigger as $$
begin
  insert into question_analytics (question_id, total_attempts, correct_attempts, average_time_spent)
  values (NEW.question_id, 1, case when NEW.is_correct then 1 else 0 end, NEW.time_spent)
  on conflict (question_id) do update set
    total_attempts = question_analytics.total_attempts + 1,
    correct_attempts = question_analytics.correct_attempts + case when NEW.is_correct then 1 else 0 end,
    average_time_spent = ((question_analytics.average_time_spent * question_analytics.total_attempts) + NEW.time_spent) / (question_analytics.total_attempts + 1),
    last_updated = now();
  return NEW;
end;
$$ language plpgsql;

create trigger trigger_update_question_analytics
  after insert on user_answers
  for each row execute function update_question_analytics();

-- Function to update user profile stats
create or replace function update_user_profile()
returns trigger as $$
begin
  if NEW.is_completed = true and (OLD.is_completed is null or OLD.is_completed = false) then
    insert into user_profiles (fid, username, display_name, total_quizzes_completed, total_questions_answered, total_correct_answers)
    values (NEW.fid, NEW.username, NEW.display_name, 1, NEW.total_questions, NEW.correct_answers)
    on conflict (fid) do update set
      username = coalesce(NEW.username, user_profiles.username),
      display_name = coalesce(NEW.display_name, user_profiles.display_name),
      total_quizzes_completed = user_profiles.total_quizzes_completed + 1,
      total_questions_answered = user_profiles.total_questions_answered + NEW.total_questions,
      total_correct_answers = user_profiles.total_correct_answers + NEW.correct_answers,
      average_score = ((user_profiles.average_score * user_profiles.total_quizzes_completed) + NEW.score) / (user_profiles.total_quizzes_completed + 1),
      last_active_at = now(),
      updated_at = now();
  end if;
  return NEW;
end;
$$ language plpgsql;

create trigger trigger_update_user_profile
  after update on quiz_sessions
  for each row execute function update_user_profile();

-- ================================================
-- ROW LEVEL SECURITY (RLS)
-- ================================================

-- Enable RLS on sensitive tables
alter table quiz_sessions enable row level security;
alter table user_answers enable row level security;
alter table user_achievements enable row level security;
alter table user_profiles enable row level security;

-- Users can only see their own data
create policy "Users can view their own quiz sessions" on quiz_sessions
  for select using (fid = (current_setting('app.current_user_fid'))::bigint);

create policy "Users can insert their own quiz sessions" on quiz_sessions
  for insert with check (fid = (current_setting('app.current_user_fid'))::bigint);

create policy "Users can view their own answers" on user_answers
  for select using (
    session_id in (
      select id from quiz_sessions where fid = (current_setting('app.current_user_fid'))::bigint
    )
  );

-- Public read access for leaderboards (no sensitive data exposed)
create policy "Public leaderboard access" on quiz_sessions
  for select using (is_completed = true);

-- ================================================
-- SEED DATA
-- ================================================

-- Insert default categories
insert into categories (name, description, icon, color) values
('Cryptocurrency', 'Bitcoin, Ethereum, and digital currencies', '₿', '#f7931a'),
('Web3 & DApps', 'Decentralized applications and Web3 concepts', '🌐', '#627eea'),
('NFTs', 'Non-fungible tokens and digital collectibles', '🎨', '#ff6b6b'),
('DeFi', 'Decentralized Finance protocols and concepts', '💰', '#1aab8e'),
('Blockchain', 'Blockchain technology and consensus mechanisms', '🔗', '#8b5cf6');

-- Insert sample achievements
insert into achievements (name, description, icon, requirement_type, requirement_value, points, rarity) values
('First Steps', 'Complete your first quiz', '🎯', 'count', 1, 50, 'common'),
('Perfect Score', 'Get 100% on any quiz', '⭐', 'perfect', 1, 100, 'rare'),
('Speed Demon', 'Complete a quiz in under 60 seconds', '⚡', 'time', 60, 150, 'epic'),
('Knowledge Seeker', 'Complete 10 quizzes', '📚', 'count', 10, 500, 'rare'),
('Crypto Expert', 'Get 90%+ on 5 crypto quizzes', '🏆', 'score', 90, 1000, 'legendary'),
('Streak Master', 'Maintain a 7-day quiz streak', '🔥', 'streak', 7, 750, 'epic');

-- Add helpful comments
comment on table quizzes is 'Main quiz definitions with metadata';
comment on table quiz_sessions is 'Individual quiz attempts by users (main table for leaderboards)';
comment on table question_analytics is 'Aggregated statistics for question difficulty analysis';
comment on table user_profiles is 'Gamification stats and user progress tracking';
comment on column quiz_sessions.fid is 'Farcaster ID - primary user identifier';
comment on column question_analytics.difficulty_score is 'Calculated difficulty: 0=easy, 1=very hard';
comment on column user_profiles.current_streak is 'Consecutive days with quiz activity';
