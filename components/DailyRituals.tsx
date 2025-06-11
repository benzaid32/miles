import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Sun, Moon, CircleCheck as CheckCircle, Circle, Clock, Bell } from 'lucide-react-native';
import { COLORS, FONTS, SPACING, SHADOWS } from '@/constants/theme';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/constants/supabase';
import notificationService from '@/lib/notificationService';

interface RitualCompletion {
  id: string;
  user_id: string;
  ritual_type: 'morning' | 'evening';
  completed_at: string;
  reflection?: string;
}

interface DailyRitualsProps {
  onStartRitual: (type: 'morning' | 'evening') => void;
}

export default function DailyRituals({ onStartRitual }: DailyRitualsProps) {
  const { user } = useAuth();
  const [morningCompleted, setMorningCompleted] = useState(false);
  const [eveningCompleted, setEveningCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  useEffect(() => {
    if (user) {
      checkTodayCompletions();
      initializeNotifications();
    }
  }, [user]);

  const checkTodayCompletions = async () => {
    if (!user) return;

    try {
      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('ritual_completions')
        .select('*')
        .eq('user_id', user.id)
        .gte('completed_at', today)
        .lt('completed_at', today + 'T23:59:59');

      if (error) throw error;

      const morningDone = data?.some(r => r.ritual_type === 'morning') || false;
      const eveningDone = data?.some(r => r.ritual_type === 'evening') || false;

      setMorningCompleted(morningDone);
      setEveningCompleted(eveningDone);
    } catch (error) {
      console.error('Error checking ritual completions:', error);
    } finally {
      setLoading(false);
    }
  };

  const initializeNotifications = async () => {
    try {
      const initialized = await notificationService.initialize();
      setNotificationsEnabled(initialized);
      
      if (initialized) {
        // Schedule default rituals if not already scheduled
        const scheduled = await notificationService.getScheduledNotifications();
        const hasMorning = scheduled.some(n => n.content.data?.type === 'morning_ritual');
        const hasEvening = scheduled.some(n => n.content.data?.type === 'evening_reflection');
        
        if (!hasMorning) {
          await notificationService.scheduleMorningRitual(8, 0);
        }
        if (!hasEvening) {
          await notificationService.scheduleEveningReflection(20, 0);
        }
      }
    } catch (error) {
      console.error('Error initializing notifications:', error);
    }
  };

  const markRitualComplete = async (type: 'morning' | 'evening') => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('ritual_completions')
        .insert({
          user_id: user.id,
          ritual_type: type,
          completed_at: new Date().toISOString(),
        });

      if (error) throw error;

      if (type === 'morning') {
        setMorningCompleted(true);
      } else {
        setEveningCompleted(true);
      }
    } catch (error) {
      console.error('Error marking ritual complete:', error);
    }
  };

  const handleStartRitual = (type: 'morning' | 'evening') => {
    onStartRitual(type);
    markRitualComplete(type);
  };

  const setupNotifications = async () => {
    try {
      const initialized = await notificationService.initialize();
      if (initialized) {
        Alert.alert(
          'Notifications Enabled',
          'You\'ll receive gentle reminders for your daily rituals.',
          [{ text: 'Great!' }]
        );
        setNotificationsEnabled(true);
        
        // Schedule rituals
        await notificationService.scheduleMorningRitual(8, 0);
        await notificationService.scheduleEveningReflection(20, 0);
      } else {
        Alert.alert(
          'Notifications Not Available',
          'Please enable notifications in your device settings to receive ritual reminders.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error setting up notifications:', error);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading your rituals...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>Daily Rituals</Text>
        <Text style={styles.subtitle}>
          Start and end your day with intention
        </Text>
      </View>

      {/* Notification Setup */}
      {!notificationsEnabled && (
        <TouchableOpacity style={styles.notificationPrompt} onPress={setupNotifications}>
          <Bell size={20} color={COLORS.primary} />
          <Text style={styles.notificationText}>
            Enable reminders for your daily rituals
          </Text>
        </TouchableOpacity>
      )}

      {/* Morning Ritual */}
      <View style={styles.ritualCard}>
        <LinearGradient
          colors={['#FEF3C7', '#FDE68A']}
          style={styles.ritualGradient}
        >
          <View style={styles.ritualHeader}>
            <View style={styles.ritualIconContainer}>
              <Sun size={24} color="#F59E0B" />
            </View>
            <View style={styles.ritualInfo}>
              <Text style={styles.ritualTitle}>Morning Intention</Text>
              <Text style={styles.ritualTime}>Best time: 7-9 AM</Text>
            </View>
            <View style={styles.ritualStatus}>
              {morningCompleted ? (
                <CheckCircle size={24} color="#10B981" />
              ) : (
                <Circle size={24} color="#6B7280" />
              )}
            </View>
          </View>
          
          <Text style={styles.ritualDescription}>
            Set your intentions for the day and align with your goals
          </Text>
          
          <TouchableOpacity
            style={[
              styles.ritualButton,
              morningCompleted && styles.completedButton
            ]}
            onPress={() => handleStartRitual('morning')}
            disabled={morningCompleted}
          >
            <Text style={[
              styles.ritualButtonText,
              morningCompleted && styles.completedButtonText
            ]}>
              {morningCompleted ? 'Completed Today' : 'Start Morning Ritual'}
            </Text>
          </TouchableOpacity>
        </LinearGradient>
      </View>

      {/* Evening Ritual */}
      <View style={styles.ritualCard}>
        <LinearGradient
          colors={['#E0E7FF', '#C7D2FE']}
          style={styles.ritualGradient}
        >
          <View style={styles.ritualHeader}>
            <View style={styles.ritualIconContainer}>
              <Moon size={24} color="#6366F1" />
            </View>
            <View style={styles.ritualInfo}>
              <Text style={styles.ritualTitle}>Evening Reflection</Text>
              <Text style={styles.ritualTime}>Best time: 7-9 PM</Text>
            </View>
            <View style={styles.ritualStatus}>
              {eveningCompleted ? (
                <CheckCircle size={24} color="#10B981" />
              ) : (
                <Circle size={24} color="#6B7280" />
              )}
            </View>
          </View>
          
          <Text style={styles.ritualDescription}>
            Reflect on your day and celebrate your progress
          </Text>
          
          <TouchableOpacity
            style={[
              styles.ritualButton,
              eveningCompleted && styles.completedButton
            ]}
            onPress={() => handleStartRitual('evening')}
            disabled={eveningCompleted}
          >
            <Text style={[
              styles.ritualButtonText,
              eveningCompleted && styles.completedButtonText
            ]}>
              {eveningCompleted ? 'Completed Today' : 'Start Evening Reflection'}
            </Text>
          </TouchableOpacity>
        </LinearGradient>
      </View>

      {/* Streak Information */}
      <View style={styles.streakCard}>
        <Text style={styles.streakTitle}>Your Ritual Streak</Text>
        <Text style={styles.streakNumber}>7 days</Text>
        <Text style={styles.streakDescription}>
          Consistency builds lasting change. Keep it up!
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.large,
  },
  loadingText: {
    fontFamily: FONTS.medium,
    fontSize: 16,
    color: COLORS.gray,
  },
  header: {
    padding: SPACING.large,
    paddingBottom: SPACING.medium,
  },
  title: {
    fontFamily: FONTS.bold,
    fontSize: 28,
    color: COLORS.dark,
    marginBottom: SPACING.small,
  },
  subtitle: {
    fontFamily: FONTS.regular,
    fontSize: 16,
    color: COLORS.gray,
    lineHeight: 24,
  },
  notificationPrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryLight + '20',
    margin: SPACING.large,
    marginTop: 0,
    padding: SPACING.medium,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.primaryLight,
  },
  notificationText: {
    fontFamily: FONTS.medium,
    fontSize: 14,
    color: COLORS.primary,
    marginLeft: SPACING.small,
    flex: 1,
  },
  ritualCard: {
    margin: SPACING.large,
    marginTop: SPACING.medium,
    borderRadius: 16,
    overflow: 'hidden',
    ...SHADOWS.medium,
  },
  ritualGradient: {
    padding: SPACING.large,
  },
  ritualHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.medium,
  },
  ritualIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.medium,
  },
  ritualInfo: {
    flex: 1,
  },
  ritualTitle: {
    fontFamily: FONTS.bold,
    fontSize: 18,
    color: COLORS.dark,
    marginBottom: 2,
  },
  ritualTime: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: COLORS.gray,
  },
  ritualStatus: {
    marginLeft: SPACING.small,
  },
  ritualDescription: {
    fontFamily: FONTS.regular,
    fontSize: 16,
    color: COLORS.dark,
    lineHeight: 24,
    marginBottom: SPACING.large,
  },
  ritualButton: {
    backgroundColor: COLORS.white,
    paddingVertical: SPACING.medium,
    paddingHorizontal: SPACING.large,
    borderRadius: 12,
    alignItems: 'center',
    ...SHADOWS.small,
  },
  completedButton: {
    backgroundColor: COLORS.gray + '40',
  },
  ritualButtonText: {
    fontFamily: FONTS.semiBold,
    fontSize: 16,
    color: COLORS.dark,
  },
  completedButtonText: {
    color: COLORS.gray,
  },
  streakCard: {
    backgroundColor: COLORS.white,
    margin: SPACING.large,
    marginTop: SPACING.medium,
    padding: SPACING.large,
    borderRadius: 16,
    alignItems: 'center',
    ...SHADOWS.small,
  },
  streakTitle: {
    fontFamily: FONTS.semiBold,
    fontSize: 16,
    color: COLORS.gray,
    marginBottom: SPACING.small,
  },
  streakNumber: {
    fontFamily: FONTS.bold,
    fontSize: 36,
    color: COLORS.primary,
    marginBottom: SPACING.small,
  },
  streakDescription: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: COLORS.gray,
    textAlign: 'center',
  },
});