import React, { useState, useRef, useEffect } from 'react';
import { 
  Text, 
  View, 
  StyleSheet, 
  TouchableOpacity,
  Animated,
  Dimensions,
  Image,
  Platform
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONTS, SPACING, SHADOWS } from '@/constants/theme';
import { useAuth } from '@/hooks/useAuth';
import ChatUI from '@/components/ChatUI';
import MilesAvatar from '@/components/ui/MilesAvatar';
import Button from '@/components/ui/Button';
import ResponsiveLayout, { isSmallDevice } from '@/components/ui/ResponsiveLayout';
import { MessageCircle, ArrowRight, Target, TrendingUp, Calendar, Award } from 'lucide-react-native';

export default function HomeScreen() {
  const { user, profile } = useAuth();
  const [showChat, setShowChat] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  
  // Sample data - in real app, this would come from your services
  const [userStats, setUserStats] = useState({
    totalGoals: 12,
    completedGoals: 8,
    currentStreak: 7,
    totalConversations: 45,
    weeklyProgress: 85,
    recentActivity: "2.5 hrs"
  });

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true
      })
    ]).start();
  }, []);

  const userName = profile?.displayName || user?.displayName || 'there';

  if (showChat) {
    return (
      <ResponsiveLayout scrollable={false} withPadding={false}>
        <View style={styles.chatHeader}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => setShowChat(false)}
          >
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <View style={styles.chatHeaderContent}>
            <MilesAvatar size="small" />
            <Text style={styles.chatHeaderTitle}>Miles</Text>
          </View>
        </View>
        <ChatUI />
      </ResponsiveLayout>
    );
  }

  return (
    <ResponsiveLayout>
      <LinearGradient
        colors={['#F8FAFC', '#F1F5F9']}
        style={StyleSheet.absoluteFillObject}
      />
      
      <Animated.View 
        style={{
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }]
        }}
      >
        {/* Header with Miles Logo and Avatar */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Image
              source={require('@/assets/images/splash-logo.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
            <Text style={styles.appName}>Miles</Text>
          </View>
        </View>

        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeTitle}>Welcome</Text>
          <Text style={styles.welcomeSubtitle}>Track your progress with ease.</Text>
        </View>

        {/* Main Action Button */}
        <TouchableOpacity 
          style={styles.mainActionButton}
          onPress={() => setShowChat(true)}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={[COLORS.primary, COLORS.primaryDark]}
            style={styles.mainActionGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <MessageCircle size={24} color={COLORS.white} />
            <Text style={styles.mainActionText}>Start Conversation</Text>
            <ArrowRight size={24} color={COLORS.white} />
          </LinearGradient>
        </TouchableOpacity>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statsRow}>
            <View style={[styles.statCard, styles.statCardLeft]}>
              <Text style={styles.statLabel}>Total Goals</Text>
              <Text style={styles.statValue}>{userStats.totalGoals}</Text>
            </View>
            
            <View style={[styles.statCard, styles.statCardRight]}>
              <Text style={styles.statLabel}>Recent Activity</Text>
              <Text style={styles.statValueSmall}>{userStats.recentActivity}</Text>
            </View>
          </View>
        </View>

        {/* Progress Section */}
        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressTitle}>This Week's Progress</Text>
            <Text style={styles.progressPercentage}>{userStats.weeklyProgress}%</Text>
          </View>
          
          <View style={styles.progressBarContainer}>
            <View style={styles.progressBarBackground}>
              <Animated.View 
                style={[
                  styles.progressBarFill,
                  { width: `${userStats.weeklyProgress}%` }
                ]}
              />
            </View>
          </View>
          
          <Text style={styles.progressSubtext}>
            Great job! You're {userStats.weeklyProgress}% towards your weekly goal.
          </Text>
        </View>

        {/* Quick Actions Grid */}
        <View style={styles.quickActionsGrid}>
          <TouchableOpacity style={styles.quickActionItem}>
            <View style={styles.quickActionIcon}>
              <Target size={20} color={COLORS.primary} />
            </View>
            <Text style={styles.quickActionText}>Set Goal</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.quickActionItem}>
            <View style={styles.quickActionIcon}>
              <TrendingUp size={20} color={COLORS.primary} />
            </View>
            <Text style={styles.quickActionText}>Progress</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.quickActionItem}>
            <View style={styles.quickActionIcon}>
              <Calendar size={20} color={COLORS.primary} />
            </View>
            <Text style={styles.quickActionText}>Schedule</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.quickActionItem}>
            <View style={styles.quickActionIcon}>
              <Award size={20} color={COLORS.primary} />
            </View>
            <Text style={styles.quickActionText}>Achievements</Text>
          </TouchableOpacity>
        </View>

        {/* Motivational Quote */}
        <View style={styles.motivationCard}>
          <Text style={styles.motivationText}>
            "Every small step you take today brings you closer to your goals."
          </Text>
          <Text style={styles.motivationAuthor}>— Miles, your AI coach</Text>
        </View>
      </Animated.View>
    </ResponsiveLayout>
  );
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const styles = StyleSheet.create({
  
  // Chat Header (when in chat mode)
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.medium,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  backButton: {
    marginRight: SPACING.medium,
  },
  backButtonText: {
    fontFamily: FONTS.medium,
    fontSize: 16,
    color: COLORS.primary,
  },
  chatHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chatHeaderTitle: {
    fontFamily: FONTS.semiBold,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.large,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoImage: {
    width: 40,
    height: 40,
    marginRight: SPACING.small,
  },
  appName: {
    fontFamily: FONTS.bold,
    fontSize: 22,
    color: COLORS.dark,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  userName: {
    fontFamily: FONTS.medium,
    fontSize: 18,
    color: COLORS.dark,
    marginLeft: SPACING.small,
  },

  // Welcome Section
  welcomeSection: {
    alignItems: 'center',
    marginBottom: SPACING.xlarge,
  },
  welcomeTitle: {
    fontFamily: FONTS.bold,
    fontSize: 28,
    color: COLORS.dark,
    marginBottom: SPACING.small / 2,
  },
  welcomeSubtitle: {
    fontFamily: FONTS.regular,
    fontSize: 16,
    color: COLORS.gray,
    textAlign: 'center',
  },

  // Main Action Button
  mainActionButton: {
    marginBottom: SPACING.xlarge,
    borderRadius: 16,
    overflow: 'hidden',
    ...SHADOWS.medium,
  },
  mainActionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.medium + 4,
    paddingHorizontal: SPACING.large,
  },
  mainActionText: {
    fontFamily: FONTS.semiBold,
    fontSize: 18,
    color: COLORS.white,
  },
  
  // Stats Section
  statsContainer: {
    marginBottom: SPACING.large,
    width: '100%',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  statCard: {
    width: '48%',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: isSmallDevice ? SPACING.medium : SPACING.large,
    ...SHADOWS.medium,
    marginBottom: isSmallDevice ? SPACING.small : 0,
  },
  statCardLeft: {
    // Removed this style as it's not needed with the new width
  },
  statCardRight: {
    // Removed this style as it's not needed with the new width
  },
  statLabel: {
    fontFamily: FONTS.medium,
    fontSize: 14,
    color: COLORS.gray,
    marginBottom: SPACING.small / 2,
    textAlign: 'center',
  },
  statValue: {
    fontFamily: FONTS.bold,
    fontSize: 32,
    color: COLORS.dark,
  },
  statValueSmall: {
    fontFamily: FONTS.bold,
    fontSize: 20,
    color: COLORS.dark,
  },

  // Progress Section
  progressSection: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: SPACING.medium,
    marginBottom: SPACING.large,
    ...SHADOWS.small,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.medium,
  },
  progressTitle: {
    fontFamily: FONTS.semiBold,
    fontSize: 16,
    color: COLORS.dark,
  },
  progressPercentage: {
    fontFamily: FONTS.bold,
    fontSize: 18,
    color: COLORS.primary,
  },
  progressBarContainer: {
    marginBottom: SPACING.small,
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: COLORS.lightGray,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 4,
  },
  progressSubtext: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: COLORS.gray,
    textAlign: 'center',
  },

  // Quick Actions Grid
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: SPACING.large,
    width: '100%',
  },
  quickActionItem: {
    width: '48%',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: isSmallDevice ? SPACING.small : SPACING.medium,
    marginBottom: SPACING.medium,
    alignItems: 'center',
    flexDirection: 'row',
    ...SHADOWS.small,
  },
  quickActionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.small,
  },
  quickActionText: {
    fontFamily: FONTS.medium,
    fontSize: 12,
    color: COLORS.dark,
    textAlign: 'center',
  },

  // Motivation Card
  motivationCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: SPACING.medium,
    marginBottom: SPACING.large,
    ...SHADOWS.small,
  },
  motivationText: {
    fontFamily: FONTS.regular,
    fontSize: 16,
    color: COLORS.dark,
    lineHeight: 24,
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: SPACING.small,
  },
  motivationAuthor: {
    fontFamily: FONTS.medium,
    fontSize: 14,
    color: COLORS.primary,
    textAlign: 'center',
  }
});
