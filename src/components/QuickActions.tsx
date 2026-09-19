import { useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { useResponsive } from '../hooks/useResponsive';

interface QuickAction {
  key: string;
  label: string;
  icon: string;
  iconFilled?: string;
}

interface QuickActionsProps {
  active?: string | null;
  onSelect?: (key: string) => void;
}

const ACTIONS: QuickAction[] = [
  { key: 'recent', label: 'Recent', icon: 'time-outline', iconFilled: 'time' },
  { key: 'spaces', label: 'Spaces', icon: 'grid-outline', iconFilled: 'grid' },
  { key: 'add', label: '+ Add', icon: 'add-outline', iconFilled: 'add' },
];

export function QuickActions({ active, onSelect }: QuickActionsProps) {
  const { palette } = useTheme();
  const r = useResponsive();

  const pillHeight = r.width < 360 ? 32 : r.width < 412 ? 34 : 36;
  const fontSize = r.width < 360 ? 12 : 13;
  const iconSize = r.width < 360 ? 13 : 14;
  const gap = r.width < 360 ? 6 : 8;

  return (
    <View style={[styles.row, { gap }]}>
      {ACTIONS.map((action) => {
        const isActive = active === action.key;
        const scaleAnim = useRef(new Animated.Value(1)).current;

        function onPressIn() {
          Animated.spring(scaleAnim, { toValue: 0.96, useNativeDriver: true, damping: 15, stiffness: 400 }).start();
        }

        function onPressOut() {
          Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, damping: 15, stiffness: 400 }).start();
        }

        const isAdd = action.key === 'add';
        const bgColor = isActive ? palette.accent : isAdd ? palette.accentSoft : palette.surface;
        const textColor = isActive ? '#FFFFFF' : isAdd ? palette.accent : palette.textSecondary;
        const iconName = isActive && action.iconFilled ? action.iconFilled : action.icon;

        return (
          <Animated.View key={action.key} style={{ transform: [{ scale: scaleAnim }] }}>
            <Pressable
              onPress={() => onSelect?.(action.key)}
              onPressIn={onPressIn}
              onPressOut={onPressOut}
              style={[
                styles.pill,
                {
                  height: pillHeight,
                  paddingHorizontal: r.width < 360 ? 10 : 12,
                  borderRadius: pillHeight / 2,
                  backgroundColor: bgColor,
                },
              ]}
            >
              <Ionicons name={iconName as any} size={iconSize} color={textColor} />
              <Text style={[styles.label, { color: textColor, fontSize }]}>{action.label}</Text>
            </Pressable>
          </Animated.View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  label: {
    fontWeight: '500',
    letterSpacing: -0.1,
  },
});
