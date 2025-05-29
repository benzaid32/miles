import React, { ReactNode } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Dimensions,
  Platform,
  StatusBar,
  KeyboardAvoidingView,
  SafeAreaView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SPACING } from '@/constants/theme';

interface ResponsiveLayoutProps {
  children: ReactNode;
  scrollable?: boolean;
  withPadding?: boolean;
  withScroll?: boolean;
  withKeyboardAvoid?: boolean;
  style?: any;
  contentContainerStyle?: any;
  bottomInset?: number;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
export const isSmallDevice = SCREEN_WIDTH < 375 || SCREEN_HEIGHT < 700;
export const isLargeDevice = SCREEN_WIDTH >= 428;

/**
 * ResponsiveLayout component provides consistent layout structure 
 * that adapts to different device sizes and platforms
 */
export const ResponsiveLayout: React.FC<ResponsiveLayoutProps> = ({
  children,
  scrollable = true,
  withPadding = true,
  withScroll = true,
  withKeyboardAvoid = true,
  style,
  contentContainerStyle,
  bottomInset = 80,
}) => {
  const insets = useSafeAreaInsets();
  const statusBarHeight = Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0;
  
  const renderContent = () => {
    const content = (
      <View 
        style={[
          withPadding && styles.contentContainer,
          { paddingBottom: bottomInset },
          contentContainerStyle,
        ]}
      >
        {children}
      </View>
    );
    
    if (scrollable && withScroll) {
      return (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={true}
          overScrollMode="never"
        >
          {content}
        </ScrollView>
      );
    }
    
    return content;
  };
  
  const renderedContent = withKeyboardAvoid ? (
    <KeyboardAvoidingView
      style={styles.keyboardAvoidView}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      {renderContent()}
    </KeyboardAvoidingView>
  ) : (
    renderContent()
  );
  
  return (
    <SafeAreaView 
      style={[
        styles.container,
        { paddingTop: Platform.OS === 'android' ? statusBarHeight : 0 },
        style,
      ]}
    >
      {renderedContent}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  keyboardAvoidView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: isSmallDevice ? SPACING.medium : SPACING.large,
    paddingTop: SPACING.medium,
  },
});

export default ResponsiveLayout;
