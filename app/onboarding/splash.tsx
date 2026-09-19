import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { useTheme } from '../../src/theme/ThemeContext';

export default function Splash() {
  const { palette } = useTheme();
  const scale = useRef(new Animated.Value(0.8)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, damping: 12, stiffness: 100 }),
      Animated.timing(opacity, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();

    const timer = setTimeout(() => {
      router.replace('/onboarding/welcome');
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: palette.background }]}>
      <Animated.View style={[styles.logoWrap, { transform: [{ scale }], opacity }]}>
        <View style={[styles.logoIcon, { backgroundColor: palette.accent }]}>
          <View style={styles.logoInner}>
            <View style={[styles.logoDot, { backgroundColor: '#FFFFFF' }]} />
          </View>
        </View>
        <Animated.Text style={[styles.wordmark, { color: palette.textPrimary, opacity }]}>
          Link Space
        </Animated.Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoWrap: {
    alignItems: 'center',
    gap: 16,
  },
  logoIcon: {
    width: 80,
    height: 80,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoInner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  wordmark: {
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
});
