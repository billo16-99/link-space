import { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../src/theme/ThemeContext';
import { useResponsive } from '../../src/hooks/useResponsive';
import { setOnboardingCompleted } from '../../src/lib/settings';

export default function Ready() {
  const { palette } = useTheme();
  const r = useResponsive();
  const insets = useSafeAreaInsets();
  const scale = useRef(new Animated.Value(0.9)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, damping: 14 }),
      Animated.timing(opacity, { toValue: 1, duration: 500, useNativeDriver: true }),
    ]).start();
  }, []);

  function finish() {
    setOnboardingCompleted(true);
    router.replace('/');
  }

  return (
    <View style={[styles.container, { backgroundColor: palette.background, paddingTop: insets.top + 20 }]}>
      <View style={[styles.header, { paddingHorizontal: r.pagePad }]}>
        <Pressable onPress={() => router.back()} hitSlop={8}
          style={({ pressed }) => [styles.backBtn, { backgroundColor: palette.surface, transform: [{ scale: pressed ? 0.96 : 1 }] }]}>
          <Ionicons name="chevron-back" size={22} color={palette.textPrimary} />
        </Pressable>
        <View style={{ width: 40 }} />
      </View>

      <Animated.View style={[styles.center, { opacity, transform: [{ scale }] }]}>
        <View style={[styles.checkWrap, { backgroundColor: palette.accent }]}>
          <Ionicons name="checkmark" size={48} color="#FFFFFF" />
        </View>
        <Text style={[styles.headline, { color: palette.textPrimary }]}>You're ready.</Text>
        <Text style={[styles.subtext, { color: palette.textSecondary }]}>
          Start saving the things you want to come back to.
        </Text>
      </Animated.View>

      <View style={[styles.footer, { paddingHorizontal: r.pagePad, paddingBottom: insets.bottom + 20 }]}>
        <Pressable
          onPress={finish}
          style={({ pressed }) => [styles.primaryBtn, { backgroundColor: palette.accent, transform: [{ scale: pressed ? 0.97 : 1 }] }]}
        >
          <Text style={styles.primaryBtnText}>Start Saving</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 20,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    paddingHorizontal: 24,
  },
  checkWrap: {
    width: 88,
    height: 88,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  headline: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  subtext: {
    fontSize: 15,
    lineHeight: 21,
    textAlign: 'center',
  },
  footer: {
    gap: 12,
  },
  primaryBtn: {
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
