import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Pressable, 
  ImageBackground,
  Dimensions,
  Animated,
  FlatList,
  Platform,
  StatusBar,
  SafeAreaView,
  Image
} from 'react-native';
import { Link, useRouter } from 'expo-router';
import { COLORS, FONTS, SPACING, SHADOWS } from '@/constants/theme';
import { ASSETS } from '@/utils/assets';
import Button from '@/components/ui/Button';
import { isAndroid } from '@/utils/platform';

// Define onboarding slides content
// Define slide interface for type safety
interface OnboardingSlide {
  id: string;
  title: string;
  description: string;
  image: any; // Using any for image require type
  variant: 'primary' | 'secondary';
}

const SLIDES: OnboardingSlide[] = [
  {
    id: '1',
    title: 'Voice-First Coaching',
    description: 'Talk with Miles just like you would with a real coach. Miles listens, understands, and responds with empathy and insight.',
    image: require('@/assets/images/onboarding/voice-conversation.png'),
    variant: 'primary',
  },
  {
    id: '2',
    title: 'Set & Track Goals',
    description: 'Define your goals and track your progress over time. Miles helps you break down big aspirations into manageable steps.',
    image: require('@/assets/images/onboarding/goal-setting.png'),
    variant: 'secondary',
  },
  {
    id: '3',
    title: 'Celebrate Progress',
    description: 'Every step forward matters. Miles helps you recognize and celebrate your wins, no matter how small they might seem.',
    image: require('@/assets/images/onboarding/celebrating-progress.png'),
    variant: 'primary',
  },
];

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function OnboardingScreen() {
  const router = useRouter();
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  // Handle completing the onboarding flow
  const completeOnboarding = () => {
    // Navigate to main app
    router.replace('/(tabs)');
  };

  // Handle advancing to the next slide
  const goToNextSlide = () => {
    if (activeIndex === SLIDES.length - 1) {
      completeOnboarding();
      return;
    }
    
    flatListRef.current?.scrollToIndex({
      index: activeIndex + 1,
      animated: true,
    });
  };

  // Handle slide change using React Native's ViewToken type
  const handleOnViewableItemsChanged = useRef(({ 
    viewableItems 
  }: {
    viewableItems: Array<{
      item: OnboardingSlide;
      key: string;
      index: number | null;
      isViewable: boolean;
    }>;
  }) => {
    if (viewableItems[0] && viewableItems[0].index !== null) {
      setActiveIndex(viewableItems[0].index);
    }
  }).current;

  // Render pagination dots
  const renderPagination = () => {
    return (
      <View style={styles.paginationContainer}>
        {SLIDES.map((_, index) => {
          const inputRange = [
            (index - 1) * SCREEN_WIDTH,
            index * SCREEN_WIDTH,
            (index + 1) * SCREEN_WIDTH,
          ];

          // Animate dot width
          const dotWidth = scrollX.interpolate({
            inputRange,
            outputRange: [10, 20, 10],
            extrapolate: 'clamp',
          });

          // Animate dot opacity
          const opacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.3, 1, 0.3],
            extrapolate: 'clamp',
          });

          // Determine dot color based on active slide variant
          const backgroundColor = index === activeIndex 
            ? (SLIDES[activeIndex].variant === 'primary' ? COLORS.teal : COLORS.coral)
            : COLORS.lightGray;

          return (
            <Animated.View
              key={index}
              style={[
                styles.paginationDot,
                { 
                  width: dotWidth,
                  opacity,
                  backgroundColor 
                },
              ]}
            />
          );
        })}
      </View>
    );
  };

  // Render individual slide
  const renderSlide = ({ item, index }: { item: OnboardingSlide; index: number }) => {
    const isLastSlide = index === SLIDES.length - 1;
    
    return (
      <View style={styles.slideContainer}>
        <View style={styles.cardContainer}>
          <View style={styles.imageContainer}>
            <Image 
              source={item.image} 
              style={styles.slideImage}
              resizeMode="contain"
            />
          </View>
          
          <View style={styles.textContainer}>
            <View style={[
              styles.titleContainer,
              { backgroundColor: item.variant === 'primary' ? COLORS.teal : COLORS.coral }
            ]}>
              <Text style={styles.slideTitle}>{item.title}</Text>
            </View>
            
            <Text style={styles.slideDescription}>{item.description}</Text>
          </View>
          
          <Button
            title={isLastSlide ? "Get Started" : "Next"}
            onPress={isLastSlide ? completeOnboarding : goToNextSlide}
            type={item.variant === 'primary' ? 'primary' : 'secondary'}
            size="large"
            fullWidth
          />
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar 
        barStyle="dark-content" 
        backgroundColor={COLORS.white}
      />
      
      <View style={styles.headerContainer}>
        <Text style={styles.heading}>Meet Miles</Text>
        <Text style={styles.subtitle}>Your AI Coaching Companion</Text>
      </View>
      
      <FlatList
        ref={flatListRef}
        data={SLIDES}
        renderItem={renderSlide}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={handleOnViewableItemsChanged}
        viewabilityConfig={{ viewAreaCoveragePercentThreshold: 50 }}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      />
      
      {renderPagination()}
      
      <View style={styles.skipContainer}>
        <Button
          title="Skip"
          onPress={completeOnboarding}
          type="text"
          size="medium"
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  headerContainer: {
    paddingHorizontal: SPACING.large,
    paddingTop: isAndroid ? StatusBar.currentHeight || 0 : 0,
    paddingBottom: SPACING.medium,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heading: {
    fontFamily: FONTS.bold,
    fontSize: 28,
    color: COLORS.navy,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: FONTS.regular,
    fontSize: 16,
    color: COLORS.navy,
    textAlign: 'center',
    marginTop: SPACING.small / 2,
    opacity: 0.8,
  },
  slideContainer: {
    width: SCREEN_WIDTH,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.medium,
  },
  cardContainer: {
    width: SCREEN_WIDTH - SPACING.large * 2,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    overflow: 'hidden',
    ...SHADOWS.medium,
    padding: SPACING.medium,
  },
  imageContainer: {
    height: 180,
    width: '100%',
    backgroundColor: COLORS.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    marginBottom: SPACING.medium,
    padding: SPACING.small,
  },
  slideImage: {
    width: '100%',
    height: '100%',
  },
  textContainer: {
    marginBottom: SPACING.large,
  },
  titleContainer: {
    paddingVertical: SPACING.small,
    paddingHorizontal: SPACING.medium,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: SPACING.medium,
  },
  slideTitle: {
    fontFamily: FONTS.bold,
    fontSize: 20,
    color: COLORS.white,
  },
  slideDescription: {
    fontFamily: FONTS.regular,
    fontSize: 16,
    color: COLORS.navy,
    lineHeight: 24,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: SPACING.medium,
  },
  paginationDot: {
    height: 10,
    borderRadius: 5,
    marginHorizontal: 5,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1.5,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  skipContainer: {
    paddingHorizontal: SPACING.large,
    paddingBottom: SPACING.large,
    alignItems: 'center',
  },
  // Legacy styles kept for backwards compatibility
  contentContainer: {
    flex: 1,
    justifyContent: 'space-between',
    padding: SPACING.xlarge
  },
  button: {
    backgroundColor: COLORS.white,
    paddingVertical: SPACING.medium,
    paddingHorizontal: SPACING.large,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%'
  },
  buttonText: {
    fontFamily: FONTS.semiBold,
    fontSize: 18,
    color: COLORS.navy
  }
});