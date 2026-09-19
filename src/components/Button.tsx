import { Pressable, StyleSheet, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { radius, spacing, type } from '../theme/tokens';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';

interface ButtonProps {
  label?: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  iconSize?: number;
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
  icon,
  iconSize = 18,
  size = 'md',
  fullWidth = false,
}: ButtonProps) {
  const { palette } = useTheme();

  const backgrounds: Record<ButtonVariant, string> = {
    primary: palette.accent,
    secondary: palette.surfaceRaised,
    danger: palette.danger,
    ghost: 'transparent',
  };

  const foreground: Record<ButtonVariant, string> = {
    primary: '#FFFFFF',
    secondary: palette.textPrimary,
    danger: '#FFFFFF',
    ghost: palette.textSecondary,
  };

  const height = size === 'sm' ? 36 : size === 'md' ? 44 : 52;
  const font = size === 'lg' ? type.body : type.label;

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor: backgrounds[variant],
          height,
          paddingHorizontal: size === 'sm' ? spacing.md : spacing.lg,
          opacity: disabled ? 0.5 : 1,
          transform: [{ scale: pressed ? 0.98 : 1 }],
          alignSelf: fullWidth ? 'stretch' : 'auto',
        },
        variant === 'ghost' && styles.ghostBorder,
      ]}
    >
      {icon ? (
        <Ionicons name={icon} size={iconSize} color={foreground[variant]} />
      ) : null}
      {label ? (
        <Text style={[font, { color: foreground[variant], fontWeight: '600' }]}>
          {label}
        </Text>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderRadius: radius.lg,
  },
  ghostBorder: {},
});