# Miles AI Coach 🏃‍♂️

> Your personal AI coaching companion for achieving goals and staying motivated

Miles is a React Native/Expo application that provides personalized AI coaching through conversational interactions. Built with Firebase backend and OpenAI GPT-4 integration, Miles helps users track goals, maintain motivation, and build positive habits through an empathetic AI buddy.

## ✨ Features

### 🤖 AI Coaching Companion
- **Conversational Interface**: Natural chat with Miles, your AI coach
- **Personalized Responses**: Context-aware conversations that remember your goals and progress
- **Empathetic Support**: Understanding and encouraging responses tailored to your mood and situation
- **Goal-Oriented Guidance**: Structured support for setting, tracking, and achieving personal goals

### 📊 Progress Tracking & Analytics
- **Goal Management**: Set, track, and celebrate goal completions
- **Progress Visualization**: Weekly progress charts and achievement tracking
- **Conversation Analytics**: Insights into your coaching sessions and topics discussed
- **Streak Tracking**: Monitor consistency and build positive habits

### 🎨 Modern User Experience
- **Beautiful UI**: Clean, accessible design following iOS/Material Design principles
- **Splash Screen**: Professional branded loading experience
- **Responsive Design**: Optimized for all screen sizes and orientations
- **Smooth Animations**: Engaging micro-interactions and transitions

### 🔐 Security & Privacy
- **Firebase Authentication**: Secure email/password and Apple Sign-In ready
- **Environment-Based Configuration**: Secure API key management
- **Data Encryption**: All user data encrypted in transit and at rest
- **Privacy Controls**: User data management and deletion capabilities

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm/yarn
- Expo CLI (`npm install -g @expo/cli`)
- iOS Simulator (macOS) or Android Studio
- Firebase project with Firestore and Authentication enabled
- OpenAI API account

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd miles-ai-coach
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   
   Create `.env` file in the root directory:
   ```env
   # Firebase Configuration
   EXPO_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
   EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
   
   # OpenAI Configuration
   OPENAI_API_KEY=your_openai_api_key
   ```

   > ⚠️ **Security Note**: Never commit `.env` files. See [SETUP.md](./SETUP.md) for detailed configuration instructions.

4. **Firebase Setup**
   - Create a new Firebase project
   - Enable Firestore Database
   - Enable Authentication (Email/Password)
   - Download and place `google-services.json` (Android) in the root directory

5. **Start the development server**
   ```bash
   npx expo start
   ```

6. **Run on device/simulator**
   - Press `i` for iOS Simulator
   - Press `a` for Android Emulator
   - Scan QR code with Expo Go app for physical device

## 📱 App Structure

### Navigation
- **Home**: Main dashboard with goal tracking and quick chat access
- **Chat**: Full conversational interface with Miles
- **Reports**: Analytics and progress visualization
- **Profile**: User settings and account management

### Key Components
- **SplashScreen**: Branded loading experience
- **ChatUI**: Real-time conversation interface
- **ErrorBoundary**: Production-grade error handling
- **AuthProvider**: Secure authentication state management

## 🛠️ Technical Architecture

### Frontend Stack
- **React Native**: Cross-platform mobile development
- **Expo**: Development platform and build tools
- **TypeScript**: Type-safe development
- **Expo Router**: File-based navigation
- **React Context**: State management

### Backend Services
- **Firebase Firestore**: Real-time database
- **Firebase Authentication**: User management
- **Firebase Cloud Functions**: Serverless backend logic
- **OpenAI GPT-4**: AI conversation engine

### Development Tools
- **ESLint & Prettier**: Code quality and formatting
- **Expo Dev Tools**: Debugging and development
- **React Native Debugger**: Advanced debugging

## 🔧 Configuration

### Environment Variables
All sensitive configuration is managed through environment variables. See [SETUP.md](./SETUP.md) for complete setup instructions.

### Firebase Security Rules
```javascript
// Firestore Security Rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /conversations/{conversationId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
    }
  }
}
```

## 🧪 Testing

### Running Tests
```bash
# Unit tests
npm test

# E2E tests (when implemented)
npm run test:e2e

# Type checking
npm run type-check
```

### Test Coverage
- Authentication flows
- Chat functionality
- Goal management
- Error handling
- Navigation

## 📦 Building for Production

### iOS Build
```bash
# Build for iOS
npx expo build:ios

# Or with EAS Build
npx eas build --platform ios
```

### Android Build
```bash
# Build for Android
npx expo build:android

# Or with EAS Build
npx eas build --platform android
```

## 🚀 Deployment

### Expo Application Services (EAS)
```bash
# Configure EAS
npx eas build:configure

# Build and submit to app stores
npx eas submit --platform ios
npx eas submit --platform android
```

## 🔒 Security Considerations

### Data Protection
- All API keys stored securely in environment variables
- User data encrypted in transit and at rest
- Firebase security rules prevent unauthorized access
- No sensitive data logged in production

### Privacy Compliance
- GDPR-compliant data handling
- User consent management
- Data deletion capabilities
- Transparent privacy policy

## 🤝 Contributing

### Development Workflow
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Standards
- Follow TypeScript best practices
- Use ESLint and Prettier configurations
- Write comprehensive tests
- Document complex functionality
- Follow semantic commit messages

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Documentation
- [Setup Guide](./SETUP.md) - Detailed configuration instructions
- [API Documentation](./docs/api.md) - Backend API reference
- [Component Library](./docs/components.md) - UI component documentation

### Getting Help
- 📧 Email: support@miles-ai.com
- 💬 Discord: [Miles AI Community](https://discord.gg/miles-ai)
- 🐛 Issues: [GitHub Issues](https://github.com/your-org/miles-ai-coach/issues)

### Troubleshooting

#### Common Issues
1. **Environment Variables Not Loading**
   - Ensure `.env` file is in root directory
   - Restart Expo development server
   - Check variable names match exactly

2. **Firebase Connection Issues**
   - Verify Firebase configuration
   - Check internet connectivity
   - Ensure Firebase project is active

3. **OpenAI API Errors**
   - Verify API key is valid
   - Check API usage limits
   - Ensure proper error handling

## 🎯 Roadmap

### Upcoming Features
- [ ] Voice interaction with speech-to-text
- [ ] Apple Sign-In integration
- [ ] Advanced analytics dashboard
- [ ] Goal sharing and social features
- [ ] Offline mode support
- [ ] Widget support for iOS/Android

### Performance Improvements
- [ ] Image optimization and caching
- [ ] Bundle size optimization
- [ ] Background sync capabilities
- [ ] Enhanced error recovery

---

**Miles AI Coach** - Empowering personal growth through intelligent coaching 🌟
