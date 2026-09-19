import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';
import { radius, spacing, type } from '../theme/tokens';

export interface MenuSheetOption {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
  danger?: boolean;
}

interface MenuSheetProps {
  visible: boolean;
  title?: string;
  options: MenuSheetOption[];
  onClose: () => void;
}

export function MenuSheet({ visible, title, options, onClose }: MenuSheetProps) {
  const { palette } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable
          style={[
            styles.sheet,
            {
              backgroundColor: palette.surface,
              paddingBottom: insets.bottom + spacing.md,
            },
          ]}
        >
          {title ? (
            <Text style={[type.label, styles.title, { color: palette.textTertiary }]}>
              {title}
            </Text>
          ) : null}
          {options.map((option, index) => (
            <Pressable
              key={`${option.label}-${index}`}
              accessibilityRole="button"
              onPress={() => {
                onClose();
                option.onPress?.();
              }}
              style={({ pressed }) => [
                styles.option,
                { opacity: pressed ? 0.55 : 1 },
              ]}
            >
              <Ionicons
                name={option.icon}
                size={20}
                color={option.danger ? palette.danger : palette.textPrimary}
              />
              <Text
                style={[
                  type.body,
                  { color: option.danger ? palette.danger : palette.textPrimary },
                ]}
              >
                {option.label}
              </Text>
            </Pressable>
          ))}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    paddingTop: spacing.md,
    paddingHorizontal: spacing.lg,
    gap: spacing.xs,
  },
  title: {
    paddingBottom: spacing.sm,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
  },
});