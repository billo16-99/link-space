import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from './Button';
import { useTheme } from '../theme/ThemeContext';
import { spacing, type } from '../theme/tokens';

interface EmptyStateProps {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon = 'link-outline',
  title,
  subtitle,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  const { palette } = useTheme();

  return (
    <View style={styles.container}>
      <View style={[styles.iconWrap, { backgroundColor: palette.surface }]}>
        <Ionicons name={icon} size={36} color={palette.textTertiary} />
      </View>
      <Text style={[type.body, styles.title, { color: palette.textPrimary }]}>
        {title}
      </Text>
      {subtitle ? (
        <Text style={[type.label, { color: palette.textSecondary }]}>{subtitle}</Text>
      ) : null}
      {actionLabel && onAction ? (
        <Button label={actionLabel} icon="add" onPress={onAction} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: spacing.xxl * 2,
    paddingHorizontal: spacing.xl,
    gap: spacing.sm,
  },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  title: {
    fontWeight: '600',
    textAlign: 'center',
  },
});