import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Bell } from 'lucide-react-native';
import { COLORS, FONTS, SPACING, SHADOWS } from '@/constants/theme';

export default function Header() {
  return (
    <View style={styles.headerContainer}>
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <LinearGradient
            colors={[COLORS.teal, COLORS.coral]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0.8 }}
            style={styles.logoBackground}
          >
            <View style={styles.logoIcon}>
              <View style={styles.logoInner} />
            </View>
          </LinearGradient>
          <Text style={styles.logoText}>Miles</Text>
        </View>
        
        <View style={styles.rightContainer}>
          <TouchableOpacity style={styles.notificationButton}>
            <Bell color={COLORS.gray} size={24} strokeWidth={1.5} />
          </TouchableOpacity>
          
          <TouchableOpacity>
            <Image
              source={{ uri: 'https://images.pexels.com/photos/3763188/pexels-photo-3763188.jpeg?auto=compress&cs=tinysrgb&w=200' }}
              style={styles.avatar}
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: COLORS.white,
    paddingTop: Platform.OS === 'ios' ? 0 : SPACING.medium,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.medium,
    paddingVertical: SPACING.medium,
    backgroundColor: COLORS.white,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoBackground: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoIcon: {
    width: 24,
    height: 24,
    backgroundColor: 'white',
    borderRadius: 6,
    transform: [{ rotate: '45deg' }],
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoInner: {
    width: 12,
    height: 12,
    borderRadius: 3,
    backgroundColor: COLORS.coral,
    transform: [{ rotate: '-45deg' }],
  },
  logoText: {
    fontFamily: FONTS.bold,
    fontSize: 22,
    color: COLORS.navy,
    marginLeft: SPACING.small,
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.medium,
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.small,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: COLORS.white,
    ...SHADOWS.small,
  },
});