import { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../src/theme/ThemeContext';
import { useResponsive } from '../../src/hooks/useResponsive';

export default function Saving() {
  const { palette } = useTheme();
  const r = useResponsive();
  const insets = useSafeAreaInsets();

  const cardX = useRef(new Animated.Value(-80)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const cardScale = useRef(new Animated.Value(0.8)).current;
  const spaceScale = useRef(new Animated.Value(1)).current;
  const checkOpacity = useRef(new Animated.Value(0)).current;
  const headlineOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const anim = Animated.sequence([
      Animated.delay(400),
      Animated.parallel([
        Animated.timing(cardOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.spring(cardX, { toValue: 0, useNativeDriver: true, damping: 14 }),
        Animated.spring(cardScale, { toValue: 1, useNativeDriver: true, damping: 12 }),
      ]),
      Animated.delay(300),
      Animated.spring(spaceScale, { toValue: 1.1, useNativeDriver: true, damping: 10 }),
      Animated.spring(spaceScale, { toValue: 1, useNativeDriver: true, damping: 12 }),
      Animated.delay(200),
      Animated.timing(checkOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.delay(400),
      Animated.timing(headlineOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]);
    anim.start();
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: palette.background, paddingTop: insets.top + 20 }]}>
      <View style={[styles.header, { paddingHorizontal: r.pagePad }]}>
        <Pressable onPress={() => router.back()} hitSlop={8}
          style={({ pressed }) => [styles.backBtn, { backgroundColor: palette.surface, transform: [{ scale: pressed ? 0.96 : 1 }] }]}>
          <Ionicons name="chevron-back" size={22} color={palette.textPrimary} />
        </Pressable>
        <Pressable onPress={() => router.push('/onboarding/ready')} hitSlop={8}>
          <Text style={[styles.skip, { color: palette.textSecondary }]}>Skip</Text>
        </Pressable>
      </View>

      <View style={styles.visualArea}>
        <Animated.View style={[styles.linkCard, { backgroundColor: palette.surface, borderColor: palette.border, opacity: cardOpacity, transform: [{ translateX: cardX }, { scale: cardScale }] }]}>
          <View style={[styles.cardThumb, { backgroundColor: '#FF0000' }]}>
            <Ionicons name="logo-youtube" size={24} color="#FFFFFF" />
          </View>
          <View style={styles.cardInfo}>
            <Text style={[styles.cardTitle, { color: palette.textPrimary }]} numberOfLines={1}>
              How to build better habits
            </Text>
            <Text style={[styles.cardDomain, { color: palette.textSecondary }]}>youtube.com</Text>
          </View>
        </Animated.View>

        <Animated.View style={[styles.arrow, { opacity: cardOpacity }]}>
          <Ionicons name="arrow-forward" size={20} color={palette.textTertiary} />
        </Animated.View>

        <Animated.View style={[styles.spaceBox, { backgroundColor: palette.surface, borderColor: palette.border, transform: [{ scale: spaceScale }] }]}>
          <View style={[styles.spaceIcon, { backgroundColor: '#A56BFF' }]}>
            <Ionicons name="book" size={20} color="#FFFFFF" />
          </View>
          <Text style={[styles.spaceName, { color: palette.textPrimary }]}>Study</Text>
          <Animated.View style={[styles.checkCircle, { opacity: checkOpacity }]}>
            <Ionicons name="checkmark-circle" size={20} color="#27C76F" />
          </Animated.View>
        </Animated.View>
      </View>

      <Animated.View style={[styles.bottomSection, { paddingHorizontal: r.pagePad, paddingBottom: insets.bottom + 20, opacity: headlineOpacity }]}>
        <Text style={[styles.headline, { color: palette.textPrimary }]}>
          Save anything{'\n'}in seconds.
        </Text>
        <Text style={[styles.subtext, { color: palette.textSecondary }]}>
          Share a link to Link Space whenever you want to save it.
        </Text>

        <Pressable
          onPress={() => router.push('/onboarding/ready')}
          style={({ pressed }) => [styles.primaryBtn, { backgroundColor: palette.accent, transform: [{ scale: pressed ? 0.97 : 1 }] }]}
        >
          <Text style={styles.primaryBtnText}>Continue</Text>
        </Pressable>
      </Animated.View>
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
  skip: {
    fontSize: 14,
    fontWeight: '500',
  },
  visualArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
    paddingHorizontal: 24,
  },
  linkCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    width: '100%',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  cardThumb: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardInfo: {
    flex: 1,
    gap: 2,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  cardDomain: {
    fontSize: 13,
  },
  arrow: {
    paddingVertical: 4,
  },
  spaceBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    width: '100%',
  },
  spaceIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  spaceName: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
  },
  checkCircle: {},
  bottomSection: {
    gap: 12,
  },
  headline: {
    fontSize: 26,
    fontWeight: '700',
    lineHeight: 32,
    letterSpacing: -0.4,
  },
  subtext: {
    fontSize: 15,
    lineHeight: 21,
    marginBottom: 8,
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
