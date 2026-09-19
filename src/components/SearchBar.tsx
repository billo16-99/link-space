import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { type } from '../theme/tokens';
import { useResponsive } from '../hooks/useResponsive';

interface SearchBarProps {
  onPress?: () => void;
  placeholder?: string;
}

export function SearchBar({ onPress, placeholder = 'Search links, spaces, or tags...' }: SearchBarProps) {
  const { palette } = useTheme();
  const r = useResponsive();

  const barHeight = r.searchHeight;
  const barRadius = r.width < 360 ? 14 : 16;
  const filterSize = r.width < 360 ? 28 : 32;
  const iconSize = r.width < 360 ? 15 : 16;
  const fontSize = r.width < 360 ? 13 : 14;
  const gap = r.width < 360 ? 10 : 12;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={placeholder}
      onPress={onPress}
      style={({ pressed }) => [
        styles.bar,
        {
          height: barHeight,
          paddingHorizontal: gap,
          borderRadius: barRadius,
          backgroundColor: palette.surface,
          transform: [{ scale: pressed ? 0.99 : 1 }],
        },
      ]}
    >
      <Ionicons name="search" size={iconSize} color={palette.textSecondary} />
      <Text
        style={[styles.placeholder, { color: palette.textPlaceholder, fontSize }]}
        numberOfLines={1}
      >
        {placeholder}
      </Text>
      <View
        style={[
          styles.filter,
          {
            width: filterSize,
            height: filterSize,
            borderRadius: filterSize / 2,
            backgroundColor: palette.background,
          },
        ]}
      >
        <Ionicons name="options-outline" size={iconSize} color={palette.textSecondary} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  placeholder: {
    flex: 1,
  },
  filter: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});