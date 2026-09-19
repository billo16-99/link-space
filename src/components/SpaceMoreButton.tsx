import { Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';

interface SpaceMoreButtonProps {
  onPress?: () => void;
  iconSize?: number;
}

export function SpaceMoreButton({ onPress, iconSize = 17 }: SpaceMoreButtonProps) {
  const { palette } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="More options"
      hitSlop={{ top: 14, bottom: 14, left: 10, right: 10 }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        { opacity: pressed ? 0.6 : 1 },
      ]}
    >
      <Ionicons name="ellipsis-vertical" size={iconSize} color={palette.textTertiary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
});