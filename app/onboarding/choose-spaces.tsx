import { useState, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../src/theme/ThemeContext';
import { useResponsive } from '../../src/hooks/useResponsive';

const SUGGESTED_SPACES = [
  { id: 'study', name: 'Study', icon: 'book', color: '#A56BFF' },
  { id: 'watch', name: 'Watch Later', icon: 'play-circle', color: '#22B5E8' },
  { id: 'ideas', name: 'Ideas', icon: 'bulb', color: '#F5C21A' },
  { id: 'shopping', name: 'Shopping', icon: 'cart', color: '#FF5C68' },
  { id: 'travel', name: 'Travel', icon: 'airplane', color: '#20D889' },
  { id: 'music', name: 'Music', icon: 'musical-notes', color: '#E85CFF' },
  { id: 'work', name: 'Work', icon: 'briefcase', color: '#8890FF' },
];

export default function ChooseSpaces() {
  const { palette } = useTheme();
  const r = useResponsive();
  const insets = useSafeAreaInsets();
  const [selected, setSelected] = useState<string[]>([]);

  function toggle(id: string) {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  return (
    <View style={[styles.container, { backgroundColor: palette.background, paddingTop: insets.top + 20 }]}>
      <View style={[styles.header, { paddingHorizontal: r.pagePad }]}>
        <Pressable onPress={() => router.back()} hitSlop={8}
          style={({ pressed }) => [styles.backBtn, { backgroundColor: palette.surface, transform: [{ scale: pressed ? 0.96 : 1 }] }]}>
          <Ionicons name="chevron-back" size={22} color={palette.textPrimary} />
        </Pressable>
        <Pressable onPress={() => router.push('/onboarding/saving')} hitSlop={8}>
          <Text style={[styles.skip, { color: palette.textSecondary }]}>Skip</Text>
        </Pressable>
      </View>

      <View style={[styles.content, { paddingHorizontal: r.pagePad }]}>
        <Text style={[styles.headline, { color: palette.textPrimary }]}>
          Create spaces for the{'\n'}things you care about.
        </Text>
        <Text style={[styles.subtext, { color: palette.textSecondary }]}>
          Keep your links together by what they mean to you.
        </Text>

        <View style={styles.chipGrid}>
          {SUGGESTED_SPACES.map((space) => {
            const isSelected = selected.includes(space.id);
            return (
              <Pressable
                key={space.id}
                onPress={() => toggle(space.id)}
                style={({ pressed }) => [
                  styles.chip,
                  {
                    backgroundColor: isSelected ? space.color : palette.surface,
                    borderColor: isSelected ? space.color : palette.border,
                    transform: [{ scale: pressed ? 0.95 : 1 }],
                  },
                ]}
              >
                <Ionicons name={space.icon as any} size={18} color={isSelected ? '#FFFFFF' : palette.textSecondary} />
                <Text style={[styles.chipText, { color: isSelected ? '#FFFFFF' : palette.textPrimary }]}>
                  {space.name}
                </Text>
                {isSelected && <Ionicons name="checkmark-circle" size={16} color="#FFFFFF" />}
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={[styles.footer, { paddingHorizontal: r.pagePad, paddingBottom: insets.bottom + 20 }]}>
        <Pressable
          onPress={() => router.push('/onboarding/saving')}
          style={({ pressed }) => [
            styles.primaryBtn,
            { backgroundColor: palette.accent, transform: [{ scale: pressed ? 0.97 : 1 }] },
          ]}
        >
          <Text style={styles.primaryBtnText}>
            {selected.length > 0 ? `Continue (${selected.length})` : 'Continue'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 20,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skip: {
    fontSize: 14,
    fontWeight: '500',
  },
  content: {
    flex: 1,
    gap: 12,
  },
  headline: {
    fontSize: 26,
    fontWeight: '700',
    lineHeight: 32,
    letterSpacing: -0.4,
  },
  subtext: {
    fontSize: 15,
    lineHeight: 21,
    marginBottom: 8,
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    height: 48,
    borderRadius: 14,
    borderWidth: 1.5,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '600',
  },
  footer: {
    gap: 12,
  },
  primaryBtn: {
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
