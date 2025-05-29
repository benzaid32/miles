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
import MilesAvatar from '@/components/ui/MilesAvatar';
import Button from '@/components/ui/Button';
import ResponsiveLayout, { isSmallDevice } from '@/components/ui/ResponsiveLayout';
import { Heart, TrendingUp, Clock } from 'lucide-react-native';

interface EmotionalJourneyPoint {
  id: string;
  date: string;
  emotion: string;
  reflection: string;
  color: string;
}

export default function ProgressScreen() {
  // Animation value
  const fadeAnim = useRef(new Animated.Value(0)).current;
  
  // Sample emotional journey data
  const [journeyPoints, setJourneyPoints] = useState<EmotionalJourneyPoint[]>([
    {
      id: '1',
      date: 'Yesterday',
      emotion: 'Understood',
      reflection: 'I felt really seen when I shared my doubts about my career path.',
      color: COLORS.primary
    },
    {
      id: '2',
      date: '3 days ago',
      emotion: 'Hopeful',
      reflection: 'For the first time in weeks, I felt like things might actually get better.',
      color: COLORS.subtleWarmth
    },
    {
      id: '3',
      date: 'Last week',
      emotion: 'Supported',
      reflection: "I realized I don't have to face everything alone.",
      color: '#A3B9C9'
    },
    {
      id: '4',
      date: '2 weeks ago',
      emotion: 'Reflective',
      reflection: 'I started noticing patterns in when I feel most anxious.',
      color: '#A0A7B8'
    }
  ]);
  
  useEffect(() => {
    // Animate content fade in
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true
    }).start();
  }, []);
  
  return (
    <ResponsiveLayout>
      <LinearGradient
        colors={['#F1F5F9', '#F8FAFC']}
        style={StyleSheet.absoluteFillObject}
      />
      
      <View style={styles.header}>
        <Text style={styles.title}>Emotional Journey</Text>
        <Text style={styles.subtitle}>Your growth and reflections over time</Text>
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
          {/* Insight Card */}
          <View style={styles.insightCard}>
            <View style={styles.insightHeader}>
              <MilesAvatar size="small" />
              <View style={styles.insightHeaderText}>
                <Text style={styles.insightTitle}>Miles noticed</Text>
                <Text style={styles.insightSubtitle}>Based on your conversations</Text>
              </View>
            </View>
            
            <Text style={styles.insightContent}>
              You've mentioned feeling "understood" more frequently in the past week. These moments of connection seem to be meaningful for you.
            </Text>
            
            <TouchableOpacity style={styles.insightButton}>
              <Text style={styles.insightButtonText}>Reflect on this</Text>
            </TouchableOpacity>
          </View>
          
          {/* Journey Timeline */}
          <View style={styles.timelineContainer}>
            <Text style={styles.timelineTitle}>Your Emotional Journey</Text>
            
            {journeyPoints.map((point, index) => (
              <View key={point.id} style={styles.timelinePoint}>
                <View style={styles.timelineLine}>
                  <View 
                    style={[
                      styles.timelineDot, 
                      { backgroundColor: point.color }
                    ]} 
                  />
                  {index < journeyPoints.length - 1 && <View style={styles.timelineConnector} />}
                </View>
                
                <View style={styles.timelineContent}>
                  <View style={styles.timelineHeader}>
                    <Text style={styles.timelineDate}>{point.date}</Text>
                    <Text style={[styles.timelineEmotion, { color: point.color }]}>
                      {point.emotion}
                    </Text>
                  </View>
                  
                  <Text style={styles.timelineReflection}>
                    "{point.reflection}"
                  </Text>
                </View>
              </View>
            ))}
          </View>
          
          {/* Reflection Patterns */}
          <View style={styles.patternsCard}>
            <View style={styles.patternHeader}>
              <TrendingUp size={20} color={COLORS.primary} />
              <Text style={styles.patternTitle}>Patterns & Insights</Text>
            </View>
            
            <Text style={styles.patternText}>
              Times when you feel most understood: evenings when sharing personal challenges.
            </Text>
            
            <View style={styles.patternDivider} />
            
            <View style={styles.patternHeader}>
              <Clock size={20} color={COLORS.primary} />
              <Text style={styles.patternTitle}>Recent Activity</Text>
            </View>
            
            <Text style={styles.patternText}>
              4 meaningful conversations in the past week
            </Text>
            
            <Button
              title="Download Journey"
              type="outline"
              size="medium"
              style={styles.downloadButton}
              onPress={() => {}}
            />
          </View>
        </Animated.View>
    </ResponsiveLayout>
  );
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const styles = StyleSheet.create({
  title: {
    fontFamily: FONTS.bold,
    fontSize: 24,
    color: COLORS.dark,
  },
  subtitle: {
    fontFamily: FONTS.regular,
    fontSize: 16,
    color: COLORS.gray,
  },
  header: {
    padding: SPACING.medium,
    paddingBottom: SPACING.small,
  },
  insightCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: isSmallDevice ? SPACING.small : SPACING.medium,
    marginBottom: SPACING.medium,
    ...SHADOWS.medium,
  },
  journeyCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: isSmallDevice ? SPACING.small : SPACING.medium,
    marginBottom: SPACING.medium,
    ...SHADOWS.small,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.medium,
  },
  insightHeaderText: {
    marginLeft: SPACING.small,
  },
  insightTitle: {
    fontFamily: FONTS.bold,
    fontSize: 16,
    color: COLORS.dark,
  },
  insightSubtitle: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: COLORS.gray,
  },
  insightContent: {
    fontFamily: FONTS.medium,
    fontSize: 16,
    color: COLORS.dark,
    lineHeight: 24,
    marginBottom: SPACING.medium,
  },
  insightButton: {
    alignSelf: 'flex-end',
    paddingVertical: SPACING.small / 2,
    paddingHorizontal: SPACING.small,
  },
  insightButtonText: {
    fontFamily: FONTS.medium,
    fontSize: 14,
    color: COLORS.primary,
  },
  timelineContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: SPACING.medium,
    marginBottom: SPACING.medium,
    ...SHADOWS.medium,
  },
  timelineTitle: {
    fontFamily: FONTS.bold,
    fontSize: 18,
    color: COLORS.dark,
    marginBottom: SPACING.medium,
  },
  timelinePoint: {
    flexDirection: 'row',
    marginBottom: SPACING.medium,
  },
  timelineLine: {
    width: 24,
    alignItems: 'center',
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.primary,
    borderWidth: 2,
    borderColor: COLORS.white,
    ...SHADOWS.small,
  },
  timelineConnector: {
    width: 2,
    height: '100%',
    backgroundColor: COLORS.lightGray,
    position: 'absolute',
    top: 12,
    left: 11,
  },
  timelineContent: {
    flex: 1,
    marginLeft: SPACING.small,
  },
  timelineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  timelineDate: {
    fontFamily: FONTS.medium,
    fontSize: 14,
    color: COLORS.gray,
  },
  timelineEmotion: {
    fontFamily: FONTS.bold,
    fontSize: 14,
    color: COLORS.primary,
  },
  timelineReflection: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: COLORS.dark,
    lineHeight: 20,
  },
  patternsCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: SPACING.medium,
    ...SHADOWS.medium,
  },
  patternHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.small,
  },
  patternTitle: {
    fontFamily: FONTS.bold,
    fontSize: 16,
    color: COLORS.dark,
    marginLeft: SPACING.small / 2,
  },
  patternText: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: COLORS.dark,
    lineHeight: 20,
    marginBottom: SPACING.medium,
  },
  patternDivider: {
    height: 1,
    backgroundColor: COLORS.lightGray,
    marginVertical: SPACING.medium,
  },
  downloadButton: {
    marginTop: SPACING.small,
    alignSelf: 'flex-end',
  }
});
