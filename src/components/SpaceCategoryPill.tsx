import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { hexToRgba } from '../lib/color';
import { radius, type } from '../theme/tokens';

interface SpaceCategoryPillProps {
  label: string;
  accent: string;
  height?: number;
  dotSize?: number;
  fontSize?: number;
}

export function SpaceCategoryPill({ label, accent, height = 40, dotSize = 10, fontSize = 15 }: SpaceCategoryPillProps) {
  const { palette } = useTheme();
  return (
    <View
      style={[
        styles.pill,
        {
          height,
          paddingHorizontal: Math.round(height * 0.4),
          backgroundColor: hexToRgba(accent, 0.08),
        },
      ]}
    >
      <View style={[styles.dot, { width: dotSize, height: dotSize, borderRadius: dotSize / 2, backgroundColor: accent }]} />
      <Text style={[type.category, { fontSize, color: accent }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    borderRadius: radius.pill,
    alignSelf: 'flex-start',
  },
  dot: {},
});