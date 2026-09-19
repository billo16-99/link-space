import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { radius, spacing, type } from '../theme/tokens';

interface PromptModalProps {
  visible: boolean;
  title: string;
  initialValue?: string;
  placeholder?: string;
  submitLabel?: string;
  onSubmit: (value: string) => void;
  onClose: () => void;
}

export function PromptModal({
  visible,
  title,
  initialValue = '',
  placeholder,
  submitLabel = 'Save',
  onSubmit,
  onClose,
}: PromptModalProps) {
  const { palette } = useTheme();
  const [value, setValue] = useState(initialValue);

  function reset(delay = false) {
    if (delay) {
      setTimeout(() => setValue(initialValue), 200);
    } else {
      setValue(initialValue);
    }
  }

  function submit() {
    if (value.trim().length === 0) {
      return;
    }
    onClose();
    reset(true);
    onSubmit(value.trim());
  }

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
      onShow={() => setValue(initialValue)}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable
          style={[
            styles.card,
            { backgroundColor: palette.surface },
          ]}
        >
          <Text style={[type.body, styles.title, { color: palette.textPrimary, fontWeight: '600' }]}>
            {title}
          </Text>
          <TextInput
            value={value}
            onChangeText={setValue}
            placeholder={placeholder}
            placeholderTextColor={palette.textTertiary}
            autoFocus
            onSubmitEditing={submit}
            returnKeyType="done"
            style={[
              styles.input,
              {
                backgroundColor: palette.inputBackground,
                color: palette.textPrimary,
              },
            ]}
          />
          <View style={styles.actions}>
            <Pressable onPress={onClose} style={styles.action} accessibilityRole="button">
              <Text style={[type.body, { color: palette.textSecondary }]}>Cancel</Text>
            </Pressable>
            <Pressable onPress={submit} style={styles.action} accessibilityRole="button">
              <Text style={[type.body, { color: palette.accent, fontWeight: '600' }]}>
                {submitLabel}
              </Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    padding: spacing.xxl,
  },
  card: {
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.md,
  },
  title: {
    textAlign: 'center',
  },
  input: {
    height: 46,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    fontSize: 15,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.lg,
  },
  action: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
});