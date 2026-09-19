import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { radius, spacing, type } from '../theme/tokens';

interface TagInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
}

export function TagInput({ value, onChange, placeholder = 'Add tags' }: TagInputProps) {
  const { palette } = useTheme();
  const [draft, setDraft] = useState('');

  function split(input: string): string[] {
    return input
      .split(/[,]+/)
      .map((t) => t.trim())
      .filter(Boolean);
  }

  function commit(input: string) {
    const parts = split(input);
    if (parts.length > 0) {
      const next = [...value];
      for (const part of parts) {
        if (!next.includes(part)) {
          next.push(part);
        }
      }
      onChange(next);
    }
    setDraft('');
  }

  function remove(tag: string) {
    onChange(value.filter((t) => t !== tag));
  }

  return (
    <View style={styles.container}>
      <View style={[styles.inputRow, { backgroundColor: palette.inputBackground }]}>
        <Ionicons name="pricetag-outline" size={16} color={palette.textTertiary} />
        <TextInput
          value={draft}
          onChangeText={setDraft}
          onBlur={() => commit(draft)}
          onSubmitEditing={() => commit(draft)}
          placeholder={value.length === 0 ? placeholder : ''}
          placeholderTextColor={palette.textTertiary}
          style={[styles.input, { color: palette.textPrimary }]}
          autoCapitalize="none"
          returnKeyType="done"
        />
        {draft.trim().length > 0 ? (
          <Pressable onPress={() => commit(draft)} hitSlop={8}>
            <Text style={[type.label, { color: palette.accent, fontWeight: '600' }]}>
              Add
            </Text>
          </Pressable>
        ) : null}
      </View>

      {value.length > 0 ? (
        <View style={styles.chips}>
          {value.map((tag) => (
            <View
              key={tag}
              style={[styles.chip, { backgroundColor: palette.surfaceRaised }]}
            >
              <Text style={[type.caption, { color: palette.textSecondary }]}>{tag}</Text>
              <Pressable onPress={() => remove(tag)} hitSlop={6}>
                <Ionicons name="close" size={14} color={palette.textTertiary} />
              </Pressable>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    height: 46,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
  },
  input: {
    flex: 1,
    fontSize: 15,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm + spacing.xs,
    paddingVertical: spacing.xs + 1,
    borderRadius: radius.pill,
  },
});