import { useState } from 'react';
import type { ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../src/components/Screen';
import { Button } from '../src/components/Button';
import { useTheme } from '../src/theme/ThemeContext';
import { useResponsive } from '../src/hooks/useResponsive';
import { SPACE_COLORS } from '../src/theme/tokens';
import { useAddSpace } from '../src/hooks/useSpaces';

const SURFACE = '#111113';
const BORDER_LIGHT = 'rgba(40,42,49,0.70)';
const ICON_COLOR = '#F4F4F5';

const ICON_CHOICES: (keyof typeof Ionicons.glyphMap)[] = [
  'folder', 'book', 'briefcase', 'cart', 'musical-notes', 'film',
  'game-controller', 'rocket', 'heart', 'star', 'globe', 'code-slash', 'camera', 'wallet',
];

export default function CreateSpaceScreen() {
  const { palette } = useTheme();
  const r = useResponsive();
  const addSpace = useAddSpace();
  const [name, setName] = useState('');
  const [icon, setIcon] = useState<keyof typeof Ionicons.glyphMap>('folder');
  const [color, setColor] = useState<string>(SPACE_COLORS[0]);

  const canSave = name.trim().length > 0;

  function save() {
    if (!canSave) return;
    addSpace({ name, icon, color });
    router.back();
  }

  return (
    <Screen>
      <View style={[styles.header, { paddingHorizontal: r.pagePad }]}>
        <Pressable onPress={() => router.back()} hitSlop={8} accessibilityRole="button"
          style={({ pressed }) => [styles.backBtn, { transform: [{ scale: pressed ? 0.96 : 1 }] }]}>
          <Ionicons name="close" size={22} color={ICON_COLOR} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: palette.textPrimary }]}>New Space</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={[styles.body, { paddingHorizontal: r.pagePad }]} showsVerticalScrollIndicator={false}>
        <View style={[styles.preview, { backgroundColor: `${color}1A` }]}>
          <View style={[styles.previewIcon, { backgroundColor: color }]}>
            <Ionicons name={icon} size={28} color="#FFFFFF" />
          </View>
          <Text style={[styles.previewName, { color: palette.textPrimary }]}>
            {name.trim() || 'Space Name'}
          </Text>
        </View>

        <Field label="Name">
          <TextInput value={name} onChangeText={setName} placeholder="e.g. Study Links"
            placeholderTextColor={palette.textTertiary}
            style={[styles.input, { backgroundColor: palette.surface, color: palette.textPrimary }]}
            returnKeyType="done" />
        </Field>

        <Field label="Icon">
          <View style={styles.iconGrid}>
            {ICON_CHOICES.map((choice) => {
              const active = icon === choice;
              return (
                <Pressable key={choice} accessibilityRole="button" onPress={() => setIcon(choice)}
                  style={[styles.iconChoice, { backgroundColor: active ? color : palette.surface }]}>
                  <Ionicons name={choice} size={20} color={active ? '#FFFFFF' : palette.textSecondary} />
                </Pressable>
              );
            })}
          </View>
        </Field>

        <Field label="Color">
          <View style={styles.colorRow}>
            {SPACE_COLORS.map((choice) => {
              const active = color === choice;
              return (
                <Pressable key={choice} accessibilityRole="button" accessibilityLabel={`Color ${choice}`}
                  onPress={() => setColor(choice)}
                  style={[styles.colorChoice, { borderColor: active ? palette.textPrimary : 'transparent' }]}>
                  <View style={[styles.colorSwatch, { backgroundColor: choice }]}>
                    {active ? <Ionicons name="checkmark" size={16} color="#FFFFFF" /> : null}
                  </View>
                </Pressable>
              );
            })}
          </View>
        </Field>

        <Button label="Create Space" icon="checkmark" onPress={save} disabled={!canSave} fullWidth />
      </ScrollView>
    </Screen>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  const { palette } = useTheme();
  return (
    <View style={styles.field}>
      <Text style={[styles.fieldLabel, { color: palette.textSecondary }]}>{label}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 16,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: SURFACE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '700',
  },
  headerSpacer: { width: 40 },
  body: { paddingBottom: 40, gap: 18 },
  preview: {
    alignItems: 'center',
    gap: 10,
    paddingVertical: 24,
    borderRadius: 16,
  },
  previewIcon: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewName: { fontSize: 17, fontWeight: '600' },
  field: { gap: 8 },
  fieldLabel: { fontSize: 13, fontWeight: '500' },
  input: {
    height: 48,
    paddingHorizontal: 14,
    borderRadius: 12,
    fontSize: 15,
  },
  iconGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  iconChoice: {
    width: 46,
    height: 46,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  colorChoice: {
    width: 38,
    height: 38,
    borderRadius: 999,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorSwatch: {
    width: 30,
    height: 30,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
});