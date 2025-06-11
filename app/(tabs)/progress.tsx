import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const COLORS = {
  background: '#f8fafc',
  dark: '#1f2937',
};

export default function ProgressScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Progress Tracking</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  text: {
    fontSize: 18,
    color: COLORS.dark,
  },
});