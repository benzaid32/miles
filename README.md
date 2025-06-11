# Miles AI Coach 🏃‍♂️

> Your personal AI coaching companion for achieving goals and staying motivated

Miles is a React Native/Expo application that provides personalized AI coaching through conversational interactions. Built with Supabase backend and OpenAI GPT-4 integration, Miles helps users track goals, maintain motivation, and build positive habits through an empathetic AI buddy.

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
- **Supabase Authentication**: Secure email/password and OAuth ready
- **Environment-Based Configuration**: Secure API key management
- **Data Encryption**: All user data encrypted in transit and at rest
- **Privacy Controls**: User data management and deletion capabilities

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm/yarn
- Expo CLI (`npm install -g @expo/cli`)
- iOS Simulator (macOS) or Android Studio
- Supabase project with Database and Authentication enabled
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
   # Supabase Configuration
   EXPO_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   
   # OpenAI Configuration
   OPENAI_API_KEY=your_openai_api_key
   ```

   > ⚠️ **Security Note**: Never commit `.env` files. See [SETUP.md](./SETUP.md) for detailed configuration instructions.

4. **Supabase Setup**
   - Create a new Supabase project
   - Enable Authentication (Email/Password)
   - Run the database schema from SETUP.md
   - Configure Row Level Security policies

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
- **Supabase**: PostgreSQL database with real-time features
- **Supabase Auth**: User management and authentication
- **OpenAI GPT-4**: AI conversation engine

### Development Tools
- **ESLint & Prettier**: Code quality and formatting
- **Expo Dev Tools**: Debugging and development
- **React Native Debugger**: Advanced debugging

## 🔧 Configuration

### Environment Variables
All sensitive configuration is managed through environment variables. See [SETUP.md](./SETUP.md) for complete setup instructions.

### Supabase Row Level Security
```sql
-- Example RLS policy
CREATE POLICY "Users can manage own conversations" ON conversations
  FOR ALL USING (auth.uid() = user_id);
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
- Supabase RLS policies prevent unauthorized access
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

2. **Supabase Connection Issues**
   - Verify Supabase configuration
   - Check internet connectivity
   - Ensure Supabase project is active

3. **OpenAI API Errors**
   - Verify API key is valid
   - Check API usage limits
   - Ensure proper error handling

## 🎯 Roadmap

### Upcoming Features
- [ ] Voice interaction with speech-to-text
- [ ] OAuth integration (Google, Apple)
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