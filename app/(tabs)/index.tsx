import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MessageCircle, Target, TrendingUp, Award, ArrowRight } from 'lucide-react-native';

const COLORS = {
  primary: '#2563eb',
  primaryLight: '#dbeafe',
  secondary: '#10b981',
  white: '#ffffff',
  gray: '#6b7280',
  lightGray: '#f3f4f6',
  dark: '#1f2937',
  background: '#f8fafc',
};

export default function HomeScreen() {
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <LinearGradient
        colors={[COLORS.background, COLORS.white]}
        style={StyleSheet.absoluteFillObject}
      />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Image
            source={{ uri: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop' }}
            style={styles.logo}
          />
          <Text style={styles.appName}>Miles</Text>
        </View>
        <View style={styles.profileContainer}>
          <Image
            source={{ uri: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=80&h=80&fit=crop' }}
            style={styles.profileImage}
          />
        </View>
      </View>

      {/* Welcome Section */}
      <View style={styles.welcomeSection}>
        <Text style={styles.welcomeTitle}>Welcome back!</Text>
        <Text style={styles.welcomeSubtitle}>Ready to continue your journey with Miles?</Text>
      </View>

      {/* Main Action Card */}
      <TouchableOpacity style={styles.mainActionCard} activeOpacity={0.9}>
        <LinearGradient
          colors={[COLORS.primary, '#1d4ed8']}
          style={styles.mainActionGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.mainActionContent}>
            <MessageCircle size={28} color={COLORS.white} />
            <View style={styles.mainActionText}>
              <Text style={styles.mainActionTitle}>Start Conversation</Text>
              <Text style={styles.mainActionSubtitle}>Chat with your AI coach</Text>
            </View>
            <ArrowRight size={24} color={COLORS.white} />
          </View>
        </LinearGradient>
      </TouchableOpacity>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <View style={styles.statIconContainer}>
            <Target size={24} color={COLORS.primary} />
          </View>
          <Text style={styles.statValue}>12</Text>
          <Text style={styles.statLabel}>Active Goals</Text>
        </View>
        
        <View style={styles.statCard}>
          <View style={styles.statIconContainer}>
            <TrendingUp size={24} color={COLORS.secondary} />
          </View>
          <Text style={styles.statValue}>85%</Text>
          <Text style={styles.statLabel}>Progress</Text>
        </View>
        
        <View style={styles.statCard}>
          <View style={styles.statIconContainer}>
            <Award size={24} color={COLORS.primary} />
          </View>
          <Text style={styles.statValue}>7</Text>
          <Text style={styles.statLabel}>Achievements</Text>
        </View>
      </View>

      {/* Recent Activity */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        
        <View style={styles.activityCard}>
          <View style={styles.activityIcon}>
            <MessageCircle size={20} color={COLORS.primary} />
          </View>
          <View style={styles.activityContent}>
            <Text style={styles.activityTitle}>Morning Check-in</Text>
            <Text style={styles.activitySubtitle}>Discussed daily goals and priorities</Text>
            <Text style={styles.activityTime}>2 hours ago</Text>
          </View>
        </View>
        
        <View style={styles.activityCard}>
          <View style={styles.activityIcon}>
            <Target size={20} color={COLORS.secondary} />
          </View>
          <View style={styles.activityContent}>
            <Text style={styles.activityTitle}>Goal Completed</Text>
            <Text style={styles.activitySubtitle}>Finished "Read 30 minutes daily"</Text>
            <Text style={styles.activityTime}>Yesterday</Text>
          </View>
        </View>
      </View>

      {/* Motivational Quote */}
      <View style={styles.quoteCard}>
        <Text style={styles.quoteText}>
          "Every small step you take today brings you closer to your goals."
        </Text>
        <Text style={styles.quoteAuthor}>— Miles, your AI coach</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  appName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.dark,
  },
  profileContainer: {
    padding: 2,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  welcomeSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.dark,
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: COLORS.gray,
    lineHeight: 24,
  },
  mainActionCard: {
    marginHorizontal: 20,
    marginBottom: 30,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: COLORS.dark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  mainActionGradient: {
    padding: 20,
  },
  mainActionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mainActionText: {
    flex: 1,
    marginLeft: 16,
  },
  mainActionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.white,
    marginBottom: 4,
  },
  mainActionSubtitle: {
    fontSize: 14,
    color: COLORS.white,
    opacity: 0.9,
  },
  statsGrid: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 30,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    elevation: 2,
    shadowColor: COLORS.dark,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.dark,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.gray,
    textAlign: 'center',
  },
  sectionContainer: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.dark,
    marginBottom: 16,
  },
  activityCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 1,
    shadowColor: COLORS.dark,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.dark,
    marginBottom: 4,
  },
  activitySubtitle: {
    fontSize: 14,
    color: COLORS.gray,
    marginBottom: 4,
  },
  activityTime: {
    fontSize: 12,
    color: COLORS.gray,
  },
  quoteCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 24,
    marginHorizontal: 20,
    marginBottom: 40,
    elevation: 2,
    shadowColor: COLORS.dark,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  quoteText: {
    fontSize: 16,
    fontStyle: 'italic',
    color: COLORS.dark,
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 12,
  },
  quoteAuthor: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.primary,
    textAlign: 'center',
  },
});