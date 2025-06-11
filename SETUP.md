# Miles AI Coach - Setup Guide

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- Expo CLI (`npm install -g @expo/cli`)
- Supabase project
- OpenAI API key

### 1. Environment Configuration

Create a `.env` file in the root directory:

```bash
# Supabase Configuration (Required)
EXPO_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# OpenAI Configuration (Required for AI features)
OPENAI_API_KEY=your_openai_api_key_here

# App Configuration
EXPO_PUBLIC_APP_ENV=development
```

### 2. Supabase Setup

1. Create a new Supabase project at https://supabase.com
2. Enable Authentication with Email/Password
3. Create the required database tables (see Database Schema below)
4. Add your project configuration to the `.env` file

### 3. Database Schema

Run these SQL commands in your Supabase SQL editor:

```sql
-- Create users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT auth.uid(),
  email TEXT UNIQUE NOT NULL,
  display_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_login TIMESTAMPTZ DEFAULT NOW(),
  is_onboarded BOOLEAN DEFAULT FALSE
);

-- Create conversations table
CREATE TABLE conversations (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  messages JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create goals table
CREATE TABLE goals (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  milestones JSONB NOT NULL DEFAULT '[]',
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user_motivations table
CREATE TABLE user_motivations (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  category TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_motivations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view own profile" ON users
  FOR ALL USING (auth.uid() = id);

CREATE POLICY "Users can manage own conversations" ON conversations
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own goals" ON goals
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own motivations" ON user_motivations
  FOR ALL USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX conversations_user_id_idx ON conversations(user_id);
CREATE INDEX conversations_updated_at_idx ON conversations(updated_at);
CREATE INDEX goals_user_id_idx ON goals(user_id);
CREATE INDEX goals_updated_at_idx ON goals(updated_at);
CREATE INDEX user_motivations_user_id_idx ON user_motivations(user_id);
CREATE INDEX user_motivations_created_at_idx ON user_motivations(created_at);
```

### 4. OpenAI Setup

1. Get an API key from https://platform.openai.com/api-keys
2. Add it to your `.env` file as `OPENAI_API_KEY`

### 5. Installation

```bash
npm install
```

### 6. Development

```bash
# Start development server
npm run dev

# Run on specific platform
npm run ios
npm run android
```

## 🔒 Security Checklist

- [ ] Environment variables are set up correctly
- [ ] `.env` file is in `.gitignore` (already configured)
- [ ] Supabase RLS policies are configured
- [ ] OpenAI API key is secured
- [ ] Production builds use environment-specific configurations

## 🏗️ Architecture Overview

### Core Components
- **Authentication**: Supabase Auth with email/password
- **Database**: Supabase (PostgreSQL) for user data, goals, conversations
- **AI Integration**: OpenAI GPT-4 for coaching conversations
- **State Management**: React Context for auth and app state
- **Navigation**: Expo Router with tab-based navigation

### Key Features
- Voice-first coaching conversations
- Goal setting and progress tracking
- Personalized AI responses
- Offline data persistence
- Cross-platform (iOS/Android/Web)

## 📱 Platform-Specific Notes

### iOS
- Requires iOS 15.1+ (configured in app.json)
- Voice features use native iOS Speech framework

### Android
- Requires API level 21+
- Uses native Android speech recognition
- Adaptive icon configured

### Web
- Fallback for development and testing
- Limited voice features

## 🚀 Deployment

### Development
```bash
expo start
```

### Production Build
```bash
# iOS
expo build:ios

# Android
expo build:android

# Web
npm run build:web
```

### Environment Variables for Production
Ensure all production environment variables are set in your deployment platform:
- Expo EAS Build secrets
- Vercel/Netlify environment variables
- Supabase project configuration

## 🔧 Troubleshooting

### Common Issues

1. **Supabase Connection Issues**
   - Verify environment variables are correct
   - Check Supabase project settings
   - Ensure RLS policies allow authenticated access

2. **OpenAI API Errors**
   - Verify API key is valid and has credits
   - Check rate limits
   - Ensure proper error handling

3. **Build Errors**
   - Clear node_modules and reinstall
   - Check Expo CLI version
   - Verify all dependencies are compatible

### Getting Help
- Check the [Expo documentation](https://docs.expo.dev/)
- Review [Supabase documentation](https://supabase.com/docs)
- See [OpenAI API documentation](https://platform.openai.com/docs)

## 📋 Development Checklist

Before deploying to production:

- [ ] All environment variables configured
- [ ] Supabase RLS policies implemented
- [ ] Error boundaries in place
- [ ] Proper logging implemented
- [ ] Performance optimized
- [ ] Accessibility features tested
- [ ] Cross-platform compatibility verified
- [ ] User data privacy compliance checked