import React, { useState, useRef, useEffect } from 'react';
import { 
  Text, 
  View, 
  StyleSheet, 
  TouchableOpacity,
  Image,
  Animated,
  Switch,
  Dimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  User, 
  Bell, 
  Moon, 
  Lock, 
  HelpCircle, 
  ChevronRight,
  FileText,
  LogOut
} from 'lucide-react-native';
import { COLORS, FONTS, SPACING, SHADOWS } from '@/constants/theme';
import { useAuth } from '@/hooks/useAuth';
import MilesAvatar from '@/components/ui/MilesAvatar';
import Button from '@/components/ui/Button';
import ResponsiveLayout, { isSmallDevice } from '@/components/ui/ResponsiveLayout';

export default function ProfileScreen() {
  // Animation value
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const { user, profile, signOut } = useAuth();
  
  // UI States
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  
  // User data from auth
  const userData = {
    name: profile?.displayName || user?.displayName || 'User',
    email: user?.email || 'No email',
    sessionCount: 28, // TODO: Get from actual data
    joinedDate: 'October 2023', // TODO: Get from profile.createdAt
    preferredTopics: ['Work-life balance', 'Stress management', 'Personal growth'] // TODO: Get from user preferences
  };
  
  useEffect(() => {
    // Animate content fade in
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true
    }).start();
  }, []);
  
  const renderSettingsItem = (
    icon: React.ReactNode,
    title: string,
    subtitle?: string,
    rightElement?: React.ReactNode,
    onPress?: () => void
  ) => (
    <TouchableOpacity 
      style={styles.settingsItem}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.settingsItemIcon}>
        {icon}
      </View>
      
      <View style={styles.settingsItemContent}>
        <Text style={styles.settingsItemTitle}>{title}</Text>
        {subtitle && <Text style={styles.settingsItemSubtitle}>{subtitle}</Text>}
      </View>
      
      <View style={styles.settingsItemRight}>
        {rightElement || <ChevronRight size={20} color={COLORS.gray} />}
      </View>
    </TouchableOpacity>
  );
  
  return (
    <ResponsiveLayout>
      <LinearGradient
        colors={['#F1F5F9', '#F8FAFC']}
        style={StyleSheet.absoluteFillObject}
      />
      
      <View style={styles.header}>
        <Text style={styles.title}>Your Profile</Text>
      </View>
      
      <Animated.View style={{
        opacity: fadeAnim,
          transform: [{
            translateY: fadeAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [20, 0]
            })
          }]
        }}>
          {/* User Profile Card */}
          <View style={styles.profileCard}>
            <View style={styles.profileHeader}>
              <View style={styles.profileAvatarContainer}>
                <Image 
                  source={{ uri: 'https://randomuser.me/api/portraits/people/32.jpg' }}
                  style={styles.profileAvatar}
                />
                <TouchableOpacity style={styles.editAvatarButton}>
                  <Text style={styles.editAvatarText}>Edit</Text>
                </TouchableOpacity>
              </View>
              
              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>{userData.name}</Text>
                <Text style={styles.profileEmail}>{userData.email}</Text>
                <View style={styles.profileStatsBadge}>
                  <Text style={styles.profileStatsText}>
                    {userData.sessionCount} conversations
                  </Text>
                </View>
              </View>
            </View>
            
            <View style={styles.connectionSection}>
              <MilesAvatar size="small" />
              <View style={styles.connectionInfo}>
                <Text style={styles.connectionTitle}>Your connection with Miles</Text>
                <Text style={styles.connectionSubtitle}>
                  Member since {userData.joinedDate}
                </Text>
              </View>
            </View>
            
            <View style={styles.topicsContainer}>
              <Text style={styles.topicsTitle}>Topics you've explored:</Text>
              <View style={styles.topicTags}>
                {userData.preferredTopics.map((topic, index) => (
                  <View key={index} style={styles.topicTag}>
                    <Text style={styles.topicTagText}>{topic}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
          
          {/* Settings Section */}
          <View style={styles.settingsSection}>
            <Text style={styles.sectionTitle}>Settings</Text>
            
            {renderSettingsItem(
              <Bell size={22} color={COLORS.primary} />,
              'Notifications',
              'Conversation reminders and updates',
              <Switch
                value={notifications}
                onValueChange={setNotifications}
                trackColor={{ false: '#E2E8F0', true: COLORS.primaryLight }}
                thumbColor={notifications ? COLORS.primary : '#F1F5F9'}
              />
            )}
            
            {renderSettingsItem(
              <Moon size={22} color={COLORS.primary} />,
              'Dark Mode',
              'Switch to dark theme',
              <Switch
                value={darkMode}
                onValueChange={setDarkMode}
                trackColor={{ false: '#E2E8F0', true: COLORS.primaryLight }}
                thumbColor={darkMode ? COLORS.primary : '#F1F5F9'}
              />
            )}
            
            {renderSettingsItem(
              <Lock size={22} color={COLORS.primary} />,
              'Privacy & Security',
              'Manage your data and security settings'
            )}
          </View>
          
          {/* Help & Support Section */}
          <View style={styles.settingsSection}>
            <Text style={styles.sectionTitle}>Help & Support</Text>
            
            {renderSettingsItem(
              <HelpCircle size={22} color={COLORS.primary} />,
              'FAQ & Help Center',
              'Get answers to common questions'
            )}
            
            {renderSettingsItem(
              <FileText size={22} color={COLORS.primary} />,
              'Terms of Service',
              'Review our terms and conditions'
            )}
          </View>
          
          {/* Sign Out Button */}
          <TouchableOpacity 
            style={styles.signOutButton}
            onPress={async () => {
              try {
                await signOut();
              } catch (error) {
                console.error('Sign out error:', error);
              }
            }}
          >
            <LogOut size={20} color={COLORS.error} />
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>
          
          <Text style={styles.versionText}>Miles AI v1.0.2</Text>
        </Animated.View>
    </ResponsiveLayout>
  );
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const styles = StyleSheet.create({
  header: {
    paddingBottom: SPACING.medium,
    marginBottom: SPACING.small,
  },
  title: {
    fontFamily: FONTS.bold,
    fontSize: 24,
    color: COLORS.dark,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.medium,
    paddingBottom: 100,
  },
  profileCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: isSmallDevice ? SPACING.small : SPACING.medium,
    marginBottom: SPACING.large,
    ...SHADOWS.medium,
  },
  profileHeader: {
    flexDirection: 'row',
    marginBottom: SPACING.medium,
  },
  profileAvatarContainer: {
    position: 'relative',
    marginRight: SPACING.medium,
  },
  profileAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: COLORS.white,
    ...SHADOWS.small,
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    ...SHADOWS.small,
  },
  editAvatarText: {
    fontFamily: FONTS.medium,
    fontSize: 12,
    color: COLORS.white,
  },
  profileInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  profileName: {
    fontFamily: FONTS.bold,
    fontSize: 18,
    color: COLORS.dark,
    marginBottom: 2,
  },
  profileEmail: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: COLORS.gray,
    marginBottom: 8,
  },
  profileStatsBadge: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  profileStatsText: {
    fontFamily: FONTS.medium,
    fontSize: 12,
    color: COLORS.primary,
  },
  connectionSection: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
    paddingTop: SPACING.medium,
    marginBottom: SPACING.medium,
  },
  connectionInfo: {
    marginLeft: SPACING.small,
  },
  connectionTitle: {
    fontFamily: FONTS.medium,
    fontSize: 16,
    color: COLORS.dark,
  },
  connectionSubtitle: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: COLORS.gray,
  },
  topicsContainer: {
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
    paddingTop: SPACING.medium,
  },
  topicsTitle: {
    fontFamily: FONTS.medium,
    fontSize: 16,
    color: COLORS.dark,
    marginBottom: SPACING.small,
  },
  topicTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 5,
  },
  topicTag: {
    backgroundColor: COLORS.background,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
    ...SHADOWS.small,
  },
  topicTagText: {
    fontFamily: FONTS.medium,
    fontSize: 14,
    color: COLORS.dark,
  },
  settingsSection: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    marginBottom: SPACING.large,
    paddingVertical: isSmallDevice ? SPACING.small/2 : SPACING.small,
    ...SHADOWS.small,
  },
  sectionTitle: {
    fontFamily: FONTS.bold,
    fontSize: 18,
    color: COLORS.dark,
    marginBottom: SPACING.medium,
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.small,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
    marginBottom: SPACING.small,
  },
  settingsItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.small,
  },
  settingsItemContent: {
    flex: 1,
  },
  settingsItemTitle: {
    fontFamily: FONTS.medium,
    fontSize: 16,
    color: COLORS.dark,
  },
  settingsItemSubtitle: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: COLORS.gray,
  },
  settingsItemRight: {
    marginLeft: SPACING.small,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.medium,
    marginBottom: SPACING.medium,
  },
  signOutText: {
    fontFamily: FONTS.medium,
    fontSize: 16,
    color: COLORS.error,
    marginLeft: SPACING.small,
  },
  versionText: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: COLORS.gray,
    textAlign: 'center',
    marginBottom: SPACING.large,
  }
});
