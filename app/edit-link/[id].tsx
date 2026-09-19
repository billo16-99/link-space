import { useState } from 'react';
import type { ReactNode } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../../src/components/Screen';
import { Button } from '../../src/components/Button';
import { SpacePicker } from '../../src/components/SpacePicker';
import { TagInput } from '../../src/components/TagInput';
import { useTheme } from '../../src/theme/ThemeContext';
import { useResponsive } from '../../src/hooks/useResponsive';
import { useDeleteLink, useLink, useUpdateLink } from '../../src/hooks/useLinks';
import { useSpaces } from '../../src/hooks/useSpaces';

const SURFACE = '#111113';
const BORDER_LIGHT = 'rgba(40,42,49,0.70)';
const ICON_COLOR = '#F4F4F5';

export default function EditLinkScreen() {
  const linkId = useLocalSearchParams<{ id: string }>().id;
  const { palette } = useTheme();
  const r = useResponsive();
  const link = useLink(linkId);
  const spaces = useSpaces();
  const updateLink = useUpdateLink();
  const deleteLink = useDeleteLink();

  const [title, setTitle] = useState(link?.title ?? '');
  const [spaceId, setSpaceId] = useState<string | null>(link?.spaceId ?? null);
  const [tags, setTags] = useState<string[]>(link?.tags ?? []);
  const [notes, setNotes] = useState(link?.description ?? '');

  if (!link) {
    return (
      <Screen>
        <View style={[styles.header, { paddingHorizontal: r.pagePad }]}>
          <Pressable onPress={() => router.back()} hitSlop={8} accessibilityRole="button"
            style={({ pressed }) => [styles.backBtn, { transform: [{ scale: pressed ? 0.96 : 1 }] }]}>
            <Ionicons name="close" size={22} color={ICON_COLOR} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: palette.textPrimary }]}>Edit Link</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.body}>
          <Text style={[styles.notFound, { color: palette.textSecondary }]}>Link not found.</Text>
        </View>
      </Screen>
    );
  }

  function save() {
    updateLink(linkId, {
      title: title.trim() || undefined,
      spaceId,
      description: notes.trim() || null,
      tags,
    });
    router.back();
  }

  function confirmDelete() {
    Alert.alert('Delete this link?', undefined, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => { deleteLink(linkId); router.back(); } },
    ]);
  }

  return (
    <Screen>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={[styles.header, { paddingHorizontal: r.pagePad }]}>
          <Pressable onPress={() => router.back()} hitSlop={8} accessibilityRole="button"
            style={({ pressed }) => [styles.backBtn, { transform: [{ scale: pressed ? 0.96 : 1 }] }]}>
            <Ionicons name="close" size={22} color={ICON_COLOR} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: palette.textPrimary }]}>Edit Link</Text>
          <Pressable onPress={confirmDelete} hitSlop={8} accessibilityRole="button"
            style={({ pressed }) => [styles.deleteBtn, { transform: [{ scale: pressed ? 0.96 : 1 }] }]}>
            <Ionicons name="trash-outline" size={20} color={palette.danger} />
          </Pressable>
        </View>

        <ScrollView style={styles.flex} contentContainerStyle={[styles.body, { paddingHorizontal: r.pagePad }]}
          keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

          <View style={[styles.urlBox, { backgroundColor: palette.surface }]}>
            <Ionicons name="link-outline" size={16} color={palette.textTertiary} />
            <Text numberOfLines={1} style={[styles.urlText, { color: palette.textSecondary }]}>{link.url}</Text>
          </View>

          <Field label="Title">
            <TextInput value={title} onChangeText={setTitle} placeholder="Link title"
              placeholderTextColor={palette.textTertiary}
              style={[styles.input, { backgroundColor: palette.surface, color: palette.textPrimary }]}
              returnKeyType="done" />
          </Field>

          <Field label="Space">
            <SpacePicker spaces={spaces} selectedId={spaceId} onSelect={setSpaceId} />
          </Field>

          <Field label="Tags">
            <TagInput value={tags} onChange={setTags} />
          </Field>

          <Field label="Notes">
            <TextInput value={notes} onChangeText={setNotes} placeholder="Description"
              placeholderTextColor={palette.textTertiary} multiline
              style={[styles.input, styles.multiline, { backgroundColor: palette.surface, color: palette.textPrimary }]} />
          </Field>

          <Button label="Save Changes" icon="checkmark" onPress={save} fullWidth />
        </ScrollView>
      </KeyboardAvoidingView>
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
  flex: { flex: 1 },
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
  deleteBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { paddingBottom: 40, gap: 18 },
  notFound: { fontSize: 15 },
  urlBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
  },
  urlText: { flex: 1, fontSize: 13 },
  field: { gap: 8 },
  fieldLabel: { fontSize: 13, fontWeight: '500' },
  input: {
    height: 48,
    paddingHorizontal: 14,
    borderRadius: 12,
    fontSize: 15,
  },
  multiline: { height: 96, textAlignVertical: 'top', paddingTop: 14 },
});