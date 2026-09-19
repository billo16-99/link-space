import { useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { useResponsive } from '../hooks/useResponsive';

interface HomeHeaderProps {
  pinnedExpanded?: boolean;
  onPinnedToggle?: () => void;
}

export function HomeHeader({ pinnedExpanded = false, onPinnedToggle }: HomeHeaderProps) {
  const { palette } = useTheme();
  const r = useResponsive();

  const pillWidth = r.width < 360 ? 150 : r.width < 412 ? 170 : 190;
  const pillHeight = r.width < 360 ? 42 : r.width < 412 ? 46 : 50;
  const pillRadius = pillHeight / 2;
  const pillIconSize = r.width < 360 ? 18 : r.width < 412 ? 20 : 22;
  const pillFontSize = r.width < 360 ? 15 : r.width < 412 ? 16 : 17;
  const settingsSize = r.width < 360 ? 40 : r.width < 412 ? 44 : 48;
  const settingsIconSize = r.width < 360 ? 20 : r.width < 412 ? 22 : 24;
  const avatarSize = r.width < 360 ? 40 : r.width < 412 ? 44 : 48;

  const chevronRotation = useRef(new Animated.Value(pinnedExpanded ? 180 : 0)).current;

  const toggleChevron = (expand: boolean) => {
    Animated.spring(chevronRotation, {
      toValue: expand ? 180 : 0,
      useNativeDriver: true,
      tension: 60,
      friction: 8,
    }).start();
  };

  const handlePillPress = () => {
    toggleChevron(!pinnedExpanded);
    onPinnedToggle?.();
  };

  const chevronStyle = {
    transform: [{ rotate: chevronRotation.interpolate({
      inputRange: [0, 180],
      outputRange: ['0deg', '180deg'],
    }) }],
  };

  return (
    <View style={styles.container}>
      {/* Left slot — Settings */}
      <View style={[styles.slot, { paddingLeft: 0, marginLeft: -8 }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Settings"
          onPress={() => router.navigate('/settings')}
          style={({ pressed }) => [
            styles.settings,
            {
              width: settingsSize,
              height: settingsSize,
              borderRadius: settingsSize / 2,
              backgroundColor: palette.surface,
              transform: [{ scale: pressed ? 0.96 : 1 }],
            },
          ]}
        >
          <Ionicons name="settings-outline" size={settingsIconSize} color={palette.textPrimary} />
        </Pressable>
      </View>

      {/* Center slot — Pinned Link pill */}
      <View style={styles.slotCenter}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Pinned Link"
          onPress={handlePillPress}
          style={({ pressed }) => [
            styles.pill,
            {
              width: pillWidth,
              height: pillHeight,
              borderRadius: pillRadius,
              backgroundColor: pinnedExpanded ? palette.accentSoft : palette.surface,
              transform: [{ scale: pressed ? 0.97 : 1 }],
            },
          ]}
        >
          <Ionicons name="link" size={pillIconSize} color={palette.textPrimary} />
          <Text style={[styles.pillText, { fontSize: pillFontSize, color: palette.textPrimary }]}>Pinned Link</Text>
          <Animated.View style={chevronStyle}>
            <Ionicons name="chevron-down" size={pillIconSize - 4} color={palette.textPrimary} />
          </Animated.View>
        </Pressable>
      </View>

      {/* Right slot — Profile avatar */}
      <View style={[styles.slot, styles.slotRight, { paddingRight: 0, marginRight: -8 }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Profile"
          onPress={() => router.navigate('/settings')}
          style={({ pressed }) => [
            styles.avatar,
            {
              width: avatarSize,
              height: avatarSize,
              borderRadius: avatarSize / 2,
              backgroundColor: palette.surface,
              transform: [{ scale: pressed ? 0.96 : 1 }],
            },
          ]}
        >
          <Ionicons name="person" size={Math.round(avatarSize * 0.5)} color={palette.textPrimary} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 6,
  },
  slot: {
    flex: 1,
    alignItems: 'flex-start',
  },
  slotCenter: {
    alignItems: 'center',
  },
  slotRight: {
    alignItems: 'flex-end',
  },
  settings: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  pillText: {
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  avatar: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});