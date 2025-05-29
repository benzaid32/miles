# Miles AI Coach - Setup Guide

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- Expo CLI (`npm install -g @expo/cli`)
- Firebase project
- OpenAI API key

### 1. Environment Configuration

Create a `.env` file in the root directory:

```bash
# Firebase Configuration (Required)
EXPO_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key_here
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id

# OpenAI Configuration (Required for AI features)
OPENAI_API_KEY=your_openai_api_key_here

# App Configuration
EXPO_PUBLIC_APP_ENV=development
```

### 2. Firebase Setup

1. Create a new Firebase project at https://console.firebase.google.com
2. Enable Authentication with Email/Password
3. Create a Firestore database
4. Add your app configuration to the `.env` file
5. Download `google-services.json` for Android (already included as placeholder)

### 3. OpenAI Setup

1. Get an API key from https://platform.openai.com/api-keys
2. Add it to your `.env` file as `OPENAI_API_KEY`

### 4. Installation

```bash
npm install
```

### 5. Development

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
- [ ] Firebase security rules are configured
- [ ] OpenAI API key is secured in backend/cloud functions
- [ ] Production builds use environment-specific configurations

## 🏗️ Architecture Overview

### Core Components
- **Authentication**: Firebase Auth with email/password
- **Database**: Firestore for user data, goals, conversations
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
- Firebase project configuration

## 🔧 Troubleshooting

### Common Issues

1. **Firebase Connection Issues**
   - Verify environment variables are correct
   - Check Firebase project settings
   - Ensure Firestore rules allow authenticated access

2. **OpenAI API Errors**
   - Verify API key is valid and has credits
   - Check rate limits
   - Ensure proper error handling in cloud functions

3. **Build Errors**
   - Clear node_modules and reinstall
   - Check Expo CLI version
   - Verify all dependencies are compatible

### Getting Help
- Check the [Expo documentation](https://docs.expo.dev/)
- Review [Firebase documentation](https://firebase.google.com/docs)
- See [OpenAI API documentation](https://platform.openai.com/docs)

## 📋 Development Checklist

Before deploying to production:

- [ ] All environment variables configured
- [ ] Firebase security rules implemented
- [ ] Error boundaries in place
- [ ] Proper logging implemented
- [ ] Performance optimized
- [ ] Accessibility features tested
- [ ] Cross-platform compatibility verified
- [ ] User data privacy compliance checked 