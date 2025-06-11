import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions
} from 'react-native';
import { useAuth } from '@/hooks/useAuth';
import goalService from '@/lib/goalService';
import chatService from '@/lib/chatService';
import { Goal } from '@/lib/openai';
import { formatDate, calculatePercentage } from '@/lib/utils';
import {
  VictoryPie,
  VictoryBar,
  VictoryChart,
  VictoryTheme,
  VictoryAxis,
  VictoryLabel
} from 'victory-native';
import { CheckCircle, Circle, ChevronRight, TrendingUp, Award } from 'lucide-react-native';

const { width } = Dimensions.get('window');

const ProgressDashboard: React.FC = () => {
  // State
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [coachingTip, setCoachingTip] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'week' | 'month' | 'all'>('week');
  const [chartType, setChartType] = useState<'pie' | 'bar'>('pie');
  
  // Auth hook
  const { user } = useAuth();

  // Fetch goals and coaching tip
  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // Fetch goals
        const userGoals = await goalService.getUserGoals(user.uid);
        setGoals(userGoals);
        
        // Fetch coaching tip based on goals
        const tip = await chatService.getCoachingTip(user.uid, userGoals);
        setCoachingTip(tip);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setError('Failed to load your progress data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [user]);

  // Filter goals based on active tab
  const getFilteredGoals = (): Goal[] => {
    if (activeTab === 'all') {
      return goals;
    }
    
    const now = new Date();
    const msInDay = 24 * 60 * 60 * 1000;
    
    if (activeTab === 'week') {
      const weekAgo = now.getTime() - (7 * msInDay);
      return goals.filter(goal => goal.updatedAt > weekAgo);
    } else {
      const monthAgo = now.getTime() - (30 * msInDay);
      return goals.filter(goal => goal.updatedAt > monthAgo);
    }
  };

  // Prepare chart data for overall progress
  const getOverallProgressData = () => {
    const filteredGoals = getFilteredGoals();
    
    if (filteredGoals.length === 0) {
      return [
        { x: 'No Goals', y: 1, color: '#E5E7EB' }
      ];
    }
    
    // Calculate completed vs in-progress vs not-started
    const totalGoals = filteredGoals.length;
    const completedGoals = filteredGoals.filter(goal => goal.progress === 100).length;
    const inProgressGoals = filteredGoals.filter(goal => goal.progress > 0 && goal.progress < 100).length;
    const notStartedGoals = filteredGoals.filter(goal => goal.progress === 0).length;
    
    return [
      { x: 'Completed', y: completedGoals, color: '#34D399' },
      { x: 'In Progress', y: inProgressGoals, color: '#3B82F6' },
      { x: 'Not Started', y: notStartedGoals, color: '#E5E7EB' }
    ].filter(segment => segment.y > 0);
  };

  // Prepare chart data for individual goal progress
  const getGoalProgressData = () => {
    const filteredGoals = getFilteredGoals();
    
    if (filteredGoals.length === 0) {
      return [];
    }
    
    // Only show up to 5 goals to avoid overcrowding
    const limitedGoals = filteredGoals.slice(0, 5);
    
    return limitedGoals.map(goal => ({
      x: goal.title.length > 15 ? goal.title.substring(0, 15) + '...' : goal.title,
      y: goal.progress,
      color: getColorForProgress(goal.progress)
    }));
  };

  // Get color based on progress percentage
  const getColorForProgress = (progress: number): string => {
    if (progress < 25) return '#F87171';
    if (progress < 50) return '#FBBF24';
    if (progress < 75) return '#60A5FA';
    return '#34D399';
  };

  // Get summary text for progress
  const getProgressSummary = (): string => {
    const filteredGoals = getFilteredGoals();
    
    if (filteredGoals.length === 0) {
      return 'No goals set yet. Create your first goal to start tracking progress!';
    }
    
    const totalGoals = filteredGoals.length;
    const completedGoals = filteredGoals.filter(goal => goal.progress === 100).length;
    const averageProgress = filteredGoals.reduce((sum, goal) => sum + goal.progress, 0) / totalGoals;
    
    if (completedGoals === totalGoals) {
      return 'Amazing! You\'ve completed all your goals!';
    } else if (completedGoals > 0) {
      return `You've completed ${completedGoals} of ${totalGoals} goals (${Math.round(averageProgress)}% average progress)`;
    } else if (averageProgress > 0) {
      return `You're making progress! Average completion: ${Math.round(averageProgress)}%`;
    } else {
      return 'Time to get started on your goals!';
    }
  };

  // Render loading state
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Loading your progress...</Text>
      </View>
    );
  }

  // Render error state
  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => {
            setLoading(true);
            setError(null);
          }}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Prepare data for charts
  const overallProgressData = getOverallProgressData();
  const goalProgressData = getGoalProgressData();

  return (
    <ScrollView style={styles.container}>
      {/* Coaching Tip */}
      <View style={styles.coachingTipContainer}>
        <View style={styles.coachingTipHeader}>
          <Award size={20} color="#3B82F6" />
          <Text style={styles.coachingTipTitle}>Miles' Tip</Text>
        </View>
        <Text style={styles.coachingTipText}>{coachingTip}</Text>
      </View>
      
      {/* Progress Summary */}
      <View style={styles.summaryContainer}>
        <Text style={styles.summaryTitle}>Progress Summary</Text>
        <Text style={styles.summaryText}>{getProgressSummary()}</Text>
      </View>
      
      {/* Time Range Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'week' && styles.activeTab]}
          onPress={() => setActiveTab('week')}
        >
          <Text style={[styles.tabText, activeTab === 'week' && styles.activeTabText]}>
            This Week
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'month' && styles.activeTab]}
          onPress={() => setActiveTab('month')}
        >
          <Text style={[styles.tabText, activeTab === 'month' && styles.activeTabText]}>
            This Month
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'all' && styles.activeTab]}
          onPress={() => setActiveTab('all')}
        >
          <Text style={[styles.tabText, activeTab === 'all' && styles.activeTabText]}>
            All Time
          </Text>
        </TouchableOpacity>
      </View>
      
      {/* Chart Type Selector */}
      <View style={styles.chartTypeSelectorContainer}>
        <TouchableOpacity
          style={[styles.chartTypeButton, chartType === 'pie' && styles.activeChartTypeButton]}
          onPress={() => setChartType('pie')}
        >
          <Text style={[styles.chartTypeText, chartType === 'pie' && styles.activeChartTypeText]}>
            Overview
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.chartTypeButton, chartType === 'bar' && styles.activeChartTypeButton]}
          onPress={() => setChartType('bar')}
        >
          <Text style={[styles.chartTypeText, chartType === 'bar' && styles.activeChartTypeText]}>
            By Goal
          </Text>
        </TouchableOpacity>
      </View>
      
      {/* Charts */}
      <View style={styles.chartContainer}>
        {getFilteredGoals().length === 0 ? (
          <View style={styles.noDataContainer}>
            <Text style={styles.noDataText}>No goals available for this time period.</Text>
          </View>
        ) : chartType === 'pie' ? (
          <View style={styles.pieChartContainer}>
            <VictoryPie
              data={overallProgressData}
              width={width - 40}
              height={300}
              colorScale={overallProgressData.map(d => d.color)}
              innerRadius={70}
              labelRadius={({ innerRadius }) => (innerRadius || 0) + 30}
              style={{
                labels: { fontSize: 16, fill: '#1F2937' }
              }}
              animate={{ duration: 500 }}
            />
            <View style={styles.pieChartLegend}>
              {overallProgressData.map((d, i) => (
                <View key={i} style={styles.legendItem}>
                  <View style={[styles.legendColor, { backgroundColor: d.color }]} />
                  <Text style={styles.legendText}>{d.x}: {d.y}</Text>
                </View>
              ))}
            </View>
          </View>
        ) : (
          <View style={styles.barChartContainer}>
            <VictoryChart
              domainPadding={20}
              width={width - 40}
              height={300}
              theme={VictoryTheme.material}
            >
              <VictoryAxis
                tickLabelComponent={<VictoryLabel angle={-45} textAnchor="end" />}
                style={{
                  tickLabels: { fontSize: 10, padding: 5 }
                }}
              />
              <VictoryAxis
                dependentAxis
                tickFormat={(t) => `${t}%`}
                style={{
                  tickLabels: { fontSize: 10, padding: 5 }
                }}
              />
              <VictoryBar
                data={goalProgressData}
                x="x"
                y="y"
                style={{
                  data: {
                    fill: ({ datum }) => datum.color,
                    width: 20
                  }
                }}
                animate={{ duration: 500 }}
              />
            </VictoryChart>
          </View>
        )}
      </View>
      
      {/* Goal List */}
      <View style={styles.goalsListContainer}>
        <Text style={styles.sectionTitle}>Your Goals</Text>
        
        {goals.length === 0 ? (
          <View style={styles.noGoalsContainer}>
            <Text style={styles.noGoalsText}>
              You haven't set any goals yet. Create your first goal to start tracking your progress!
            </Text>
          </View>
        ) : (
          goals.map((goal) => (
            <View key={goal.id} style={styles.goalItem}>
              <View style={styles.goalHeader}>
                <View style={styles.goalStatusContainer}>
                  {goal.progress === 100 ? (
                    <CheckCircle size={20} color="#34D399" />
                  ) : (
                    <Circle size={20} color="#3B82F6" />
                  )}
                  <Text style={styles.goalTitle}>{goal.title}</Text>
                </View>
                <ChevronRight size={20} color="#9CA3AF" />
              </View>
              
              <View style={styles.goalProgressContainer}>
                <View style={styles.progressBarContainer}>
                  <View 
                    style={[
                      styles.progressBar,
                      { width: `${goal.progress}%`, backgroundColor: getColorForProgress(goal.progress) }
                    ]} 
                  />
                </View>
                <Text style={styles.progressText}>{goal.progress}%</Text>
              </View>
              
              <View style={styles.goalFooter}>
                <View style={styles.milestonesContainer}>
                  <Text style={styles.milestonesText}>
                    {goal.milestones.filter(m => m.completed).length} of {goal.milestones.length} milestones completed
                  </Text>
                </View>
                <Text style={styles.dateText}>
                  Updated {formatDate(goal.updatedAt)}
                </Text>
              </View>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#6B7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444',
    marginBottom: 16,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  coachingTipContainer: {
    margin: 16,
    padding: 16,
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
  },
  coachingTipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  coachingTipTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginLeft: 8,
  },
  coachingTipText: {
    fontSize: 16,
    color: '#4B5563',
    lineHeight: 22,
  },
  summaryContainer: {
    margin: 16,
    marginTop: 0,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  summaryText: {
    fontSize: 16,
    color: '#4B5563',
    lineHeight: 22,
  },
  tabsContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 4,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
  },
  activeTab: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  activeTabText: {
    color: '#1F2937',
  },
  chartTypeSelectorContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 16,
  },
  chartTypeButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeChartTypeButton: {
    borderBottomColor: '#3B82F6',
  },
  chartTypeText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6B7280',
  },
  activeChartTypeText: {
    color: '#3B82F6',
  },
  chartContainer: {
    marginHorizontal: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    minHeight: 300,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noDataContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  noDataText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  pieChartContainer: {
    alignItems: 'center',
  },
  pieChartLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginTop: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 8,
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 4,
    marginRight: 8,
  },
  legendText: {
    fontSize: 14,
    color: '#4B5563',
  },
  barChartContainer: {
    width: '100%',
  },
  goalsListContainer: {
    margin: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  noGoalsContainer: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  noGoalsText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
  },
  goalItem: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  goalStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  goalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginLeft: 8,
    flex: 1,
  },
  goalProgressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressBarContainer: {
    flex: 1,
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    marginRight: 8,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4B5563',
    width: 40,
    textAlign: 'right',
  },
  goalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  milestonesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  milestonesText: {
    fontSize: 14,
    color: '#6B7280',
  },
  dateText: {
    fontSize: 14,
    color: '#9CA3AF',
  },
});

export default ProgressDashboard;
