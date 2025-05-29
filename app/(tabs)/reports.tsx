import React, { useState, useRef, useEffect } from 'react';
import { 
  Text, 
  View, 
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONTS, SPACING, SHADOWS } from '@/constants/theme';
import { useAuth } from '@/hooks/useAuth';
import ResponsiveLayout, { isSmallDevice } from '@/components/ui/ResponsiveLayout';
import { 
  TrendingUp, 
  Calendar, 
  Target, 
  MessageCircle, 
  Award,
  BarChart3,
  Download,
  Filter
} from 'lucide-react-native';

export default function ReportsScreen() {
  const { user, profile } = useAuth();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  
  // Sample analytics data - in real app, this would come from your services
  const [analyticsData, setAnalyticsData] = useState({
    weeklyGoals: 8,
    completedGoals: 6,
    totalConversations: 24,
    averageSessionLength: "12 min",
    streakDays: 7,
    improvementScore: 85,
    weeklyProgress: [65, 72, 78, 85, 88, 92, 85],
    topTopics: [
      { name: "Goal Setting", count: 12 },
      { name: "Motivation", count: 8 },
      { name: "Progress Review", count: 6 },
      { name: "Challenges", count: 4 }
    ]
  });

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true
    }).start();
  }, []);

  const renderProgressChart = () => {
    const maxValue = Math.max(...analyticsData.weeklyProgress);
    
    return (
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Weekly Progress</Text>
        <View style={styles.chart}>
          {analyticsData.weeklyProgress.map((value, index) => {
            const height = (value / maxValue) * 100;
            return (
              <View key={index} style={styles.chartBarContainer}>
                <View style={styles.chartBarBackground}>
                  <Animated.View 
                    style={[
                      styles.chartBar,
                      { 
                        height: `${height}%`,
                        backgroundColor: index === analyticsData.weeklyProgress.length - 1 
                          ? COLORS.primary 
                          : COLORS.primaryLight
                      }
                    ]}
                  />
                </View>
                <Text style={styles.chartLabel}>
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][index]}
                </Text>
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  return (
    <ResponsiveLayout>
      <LinearGradient
        colors={['#F8FAFC', '#F1F5F9']}
        style={StyleSheet.absoluteFillObject}
      />
      
      <View style={styles.header}>
        <Text style={styles.title}>Reports</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerButton}>
            <Filter size={20} color={COLORS.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton}>
            <Download size={20} color={COLORS.primary} />
          </TouchableOpacity>
        </View>
      </View>
      
      <Animated.View style={{ opacity: fadeAnim }}>
        {/* Key Metrics */}
        <View style={styles.metricsContainer}>
          <View style={styles.metricsRow}>
            <View style={styles.metricCard}>
              <View style={styles.metricIcon}>
                <Target size={20} color={COLORS.primary} />
              </View>
              <Text style={styles.metricValue}>{analyticsData.completedGoals}/{analyticsData.weeklyGoals}</Text>
              <Text style={styles.metricLabel}>Goals This Week</Text>
            </View>
            
            <View style={styles.metricCard}>
              <View style={styles.metricIcon}>
                <MessageCircle size={20} color={COLORS.primary} />
              </View>
              <Text style={styles.metricValue}>{analyticsData.totalConversations}</Text>
              <Text style={styles.metricLabel}>Conversations</Text>
            </View>
          </View>
          
          <View style={styles.metricsRow}>
            <View style={styles.metricCard}>
              <View style={styles.metricIcon}>
                <Calendar size={20} color={COLORS.primary} />
              </View>
              <Text style={styles.metricValue}>{analyticsData.streakDays}</Text>
              <Text style={styles.metricLabel}>Day Streak</Text>
            </View>
            
            <View style={styles.metricCard}>
              <View style={styles.metricIcon}>
                <Award size={20} color={COLORS.primary} />
              </View>
              <Text style={styles.metricValue}>{analyticsData.improvementScore}%</Text>
              <Text style={styles.metricLabel}>Improvement</Text>
            </View>
          </View>
        </View>

        {/* Progress Chart */}
        <View style={styles.chartCard}>
          {renderProgressChart()}
        </View>

        {/* Session Insights */}
        <View style={styles.insightsCard}>
          <View style={styles.insightsHeader}>
            <BarChart3 size={24} color={COLORS.primary} />
            <Text style={styles.insightsTitle}>Session Insights</Text>
          </View>
          
          <View style={styles.insightItem}>
            <Text style={styles.insightLabel}>Average Session Length</Text>
            <Text style={styles.insightValue}>{analyticsData.averageSessionLength}</Text>
          </View>
          
          <View style={styles.insightItem}>
            <Text style={styles.insightLabel}>Most Active Time</Text>
            <Text style={styles.insightValue}>Evening (7-9 PM)</Text>
          </View>
          
          <View style={styles.insightItem}>
            <Text style={styles.insightLabel}>Preferred Interaction</Text>
            <Text style={styles.insightValue}>Text Chat (78%)</Text>
          </View>
        </View>

        {/* Top Topics */}
        <View style={styles.topicsCard}>
          <Text style={styles.topicsTitle}>Most Discussed Topics</Text>
          
          {analyticsData.topTopics.map((topic, index) => (
            <View key={index} style={styles.topicItem}>
              <View style={styles.topicInfo}>
                <Text style={styles.topicName}>{topic.name}</Text>
                <Text style={styles.topicCount}>{topic.count} times</Text>
              </View>
              <View style={styles.topicBarContainer}>
                <View 
                  style={[
                    styles.topicBar,
                    { 
                      width: `${(topic.count / analyticsData.topTopics[0].count) * 100}%` 
                    }
                  ]}
                />
              </View>
            </View>
          ))}
        </View>

        {/* Achievements */}
        <View style={styles.achievementsCard}>
          <Text style={styles.achievementsTitle}>Recent Achievements</Text>
          
          <View style={styles.achievementItem}>
            <View style={styles.achievementIcon}>
              <Award size={16} color={COLORS.primary} />
            </View>
            <View style={styles.achievementInfo}>
              <Text style={styles.achievementName}>Goal Crusher</Text>
              <Text style={styles.achievementDesc}>Completed 5 goals this week</Text>
            </View>
            <Text style={styles.achievementDate}>Today</Text>
          </View>
          
          <View style={styles.achievementItem}>
            <View style={styles.achievementIcon}>
              <Calendar size={16} color={COLORS.primary} />
            </View>
            <View style={styles.achievementInfo}>
              <Text style={styles.achievementName}>Consistency Champion</Text>
              <Text style={styles.achievementDesc}>7-day conversation streak</Text>
            </View>
            <Text style={styles.achievementDate}>Yesterday</Text>
          </View>
        </View>
      </Animated.View>
    </ResponsiveLayout>
  );
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.medium,
    paddingBottom: SPACING.small,
  },
  title: {
    fontFamily: FONTS.bold,
    fontSize: 24,
    color: COLORS.dark,
  },
  headerActions: {
    flexDirection: 'row',
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: SPACING.small,
    ...SHADOWS.small,
  },
  
  // Metrics Section
  metricsContainer: {
    marginBottom: SPACING.medium,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.small,
  },
  metricCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: SPACING.medium,
    alignItems: 'center',
    width: (SCREEN_WIDTH - SPACING.medium * 3) / 2,
    ...SHADOWS.small,
  },
  metricIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.small,
  },
  metricValue: {
    fontFamily: FONTS.bold,
    fontSize: 24,
    color: COLORS.dark,
    marginBottom: 2,
  },
  metricLabel: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: COLORS.gray,
    textAlign: 'center',
  },

  // Chart Section
  chartCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: isSmallDevice ? SPACING.small : SPACING.medium,
    marginBottom: SPACING.medium,
    ...SHADOWS.small,
  },
  chartContainer: {
    width: '100%',
  },
  chartTitle: {
    fontFamily: FONTS.semiBold,
    fontSize: 16,
    color: COLORS.dark,
    marginBottom: SPACING.medium,
  },
  chart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 120,
    paddingHorizontal: SPACING.small,
  },
  chartBarContainer: {
    alignItems: 'center',
    flex: 1,
  },
  chartBarBackground: {
    width: 20,
    height: 100,
    backgroundColor: COLORS.lightGray,
    borderRadius: 10,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  chartBar: {
    width: '100%',
    borderRadius: 10,
    minHeight: 4,
  },
  chartLabel: {
    fontFamily: FONTS.regular,
    fontSize: 10,
    color: COLORS.gray,
    marginTop: SPACING.small / 2,
  },

  // Insights Section
  insightsCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: isSmallDevice ? SPACING.small : SPACING.medium,
    marginBottom: SPACING.medium,
    ...SHADOWS.small,
  },
  insightsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.medium,
  },
  insightsTitle: {
    fontFamily: FONTS.semiBold,
    fontSize: 16,
    color: COLORS.dark,
    marginLeft: SPACING.small,
  },
  insightItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.small,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  insightLabel: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: COLORS.gray,
  },
  insightValue: {
    fontFamily: FONTS.semiBold,
    fontSize: 14,
    color: COLORS.dark,
  },

  // Topics Section
  topicsCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: isSmallDevice ? SPACING.small : SPACING.medium,
    marginBottom: SPACING.medium,
    ...SHADOWS.small,
  },
  topicsTitle: {
    fontFamily: FONTS.semiBold,
    fontSize: 16,
    color: COLORS.dark,
    marginBottom: SPACING.medium,
  },
  topicItem: {
    marginBottom: SPACING.medium,
  },
  topicInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.small / 2,
  },
  topicName: {
    fontFamily: FONTS.medium,
    fontSize: 14,
    color: COLORS.dark,
  },
  topicCount: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: COLORS.gray,
  },
  topicBarContainer: {
    height: 6,
    backgroundColor: COLORS.lightGray,
    borderRadius: 3,
    overflow: 'hidden',
  },
  topicBar: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 3,
  },

  // Achievements Section
  achievementsCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: SPACING.medium,
    ...SHADOWS.small,
  },
  achievementsTitle: {
    fontFamily: FONTS.semiBold,
    fontSize: 16,
    color: COLORS.dark,
    marginBottom: SPACING.medium,
  },
  achievementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.small,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  achievementIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.small,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementName: {
    fontFamily: FONTS.medium,
    fontSize: 14,
    color: COLORS.dark,
  },
  achievementDesc: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: COLORS.gray,
  },
  achievementDate: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: COLORS.primary,
  },
}); 