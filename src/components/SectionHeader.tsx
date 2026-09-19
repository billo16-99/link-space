import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { type } from '../theme/tokens';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  titleSize?: number;
}

export function SectionHeader({ title, subtitle, titleSize = 28 }: SectionHeaderProps) {
  const { palette } = useTheme();
  return (
    <View style={styles.wrap}>
      <Text style={[type.title, { fontSize: titleSize, color: palette.textPrimary }]}>{title}</Text>
      {subtitle ? (
        <Text style={[type.subtitle, { color: palette.textSecondary }]}>{subtitle}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 6,
  },
});