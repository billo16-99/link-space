import { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../src/theme/ThemeContext';
import { useResponsive } from '../../src/hooks/useResponsive';

function FloatingCard({ delay, x, y, color, icon }: { delay: number; x: number; y: number; color: string; icon: string }) {
  const floatY = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.spring(floatY, { toValue: -8, useNativeDriver: true, damping: 12 }),
      ]),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(floatY, { toValue: -12, duration: 2000, useNativeDriver: true }),
        Animated.timing(floatY, { toValue: -4, duration: 2000, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <Animated.View style={[styles.floatingCard, { left: x, top: y, opacity, transform: [{ translateY: floatY }] }]}>
      <View style={[styles.miniCard, { backgroundColor: color }]}>
        <Ionicons name={icon as any} size={16} color="#FFFFFF" />
      </View>
    </Animated.View>
  );
}

export default function Welcome() {
  const { palette } = useTheme();
  const r = useResponsive();
  const insets = useSafeAreaInsets();
  const headlineOpacity = useRef(new Animated.Value(0)).current;
  const headlineY = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(600),
      Animated.parallel([
        Animated.timing(headlineOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(headlineY, { toValue: 0, duration: 500, useNativeDriver: true }),
      ]),
    ]).start();
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: palette.background, paddingTop: insets.top + 40 }]}>
      <View style={styles.topSection}>
        <Text style={[styles.wordmark, { color: palette.textPrimary }]}>Link Space</Text>
      </View>

      <View style={styles.visualArea}>
        <FloatingCard delay={200} x={r.width * 0.15} y={80} color="#A56BFF" icon="logo-youtube" />
        <FloatingCard delay={400} x={r.width * 0.55} y={40} color="#20D889" icon="logo-github" />
        <FloatingCard delay={600} x={r.width * 0.35} y={140} color="#22B5E8" icon="musical-notes" />
        <FloatingCard delay={800} x={r.width * 0.7} y={120} color="#F5C21A" icon="cart" />

        <View style={[styles.spaceOrb, { backgroundColor: palette.surface, borderColor: palette.border }]}>
          <Ionicons name="folder" size={28} color={palette.accent} />
        </View>
      </View>

      <Animated.View style={[styles.bottomSection, { opacity: headlineOpacity, transform: [{ translateY: headlineY }] }]}>
        <Text style={[styles.headline, { color: palette.textPrimary }]}>
          Your links, finally{'\n'}in their place.
        </Text>
        <Text style={[styles.subtext, { color: palette.textSecondary }]}>
          Save, organize, and find everything you want to come back to.
        </Text>

        <View style={styles.actions}>
          <Pressable
            onPress={() => router.push('/onboarding/choose-spaces')}
            style={({ pressed }) => [styles.primaryBtn, { backgroundColor: palette.accent, transform: [{ scale: pressed ? 0.97 : 1 }] }]}
          >
            <Text style={styles.primaryBtnText}>Get Started</Text>
          </Pressable>

          <Pressable
            onPress={() => {
              const { setOnboardingCompleted } = require('../../src/lib/settings');
              setOnboardingCompleted(true);
              router.replace('/');
            }}
            style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1, paddingVertical: 12 }]}
          >
            <Text style={[styles.secondaryText, { color: palette.textSecondary }]}>I already have an account</Text>
          </Pressable>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topSection: {
    alignItems: 'center',
    paddingBottom: 20,
  },
  wordmark: {
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  visualArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  floatingCard: {
    position: 'absolute',
  },
  miniCard: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  spaceOrb: {
    width: 72,
    height: 72,
    borderRadius: 24,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  bottomSection: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    gap: 12,
  },
  headline: {
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 34,
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  subtext: {
    fontSize: 15,
    lineHeight: 21,
    textAlign: 'center',
    marginBottom: 8,
  },
  actions: {
    gap: 4,
    alignItems: 'center',
  },
  primaryBtn: {
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
