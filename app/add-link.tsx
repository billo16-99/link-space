import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../src/theme/ThemeContext';
import { useResponsive } from '../src/hooks/useResponsive';
import { normalizeUrl, isValidUrl, getDomain } from '../src/lib/url';
import { fetchMetadata, type LinkMetadata } from '../src/lib/metadata';
import { brandFor } from '../src/lib/brand';
import { useDuplicateCheck, useSaveLink } from '../src/hooks/useLinks';
import { useSpaces } from '../src/hooks/useSpaces';
import { hexToRgba } from '../src/lib/color';

const FALLBACK_IMAGES = [
  require('../assets/images/sunflower-robot.png'),
  require('../assets/images/fantom-logo.png'),
];

export default function AddLinkScreen() {
  const params = useLocalSearchParams();
  const initialUrl = typeof params.url === 'string' ? params.url : '';
  const initialSpaceId = typeof params.spaceId === 'string' ? params.spaceId : null;

  const { palette } = useTheme();
  const r = useResponsive();
  const insets = useSafeAreaInsets();
  const urlInputRef = useRef<TextInput>(null);

  const spaces = useSpaces();
  const saveLink = useSaveLink();
  const findDuplicate = useDuplicateCheck();

  const [url, setUrl] = useState(initialUrl);
  const [title, setTitle] = useState('');
  const [spaceId, setSpaceId] = useState<string | null>(initialSpaceId);
  const [tags, setTags] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [preview, setPreview] = useState<LinkMetadata | null>(null);
  const [urlStatus, setUrlStatus] = useState<'idle' | 'valid' | 'invalid' | 'duplicate'>('idle');
  const [detailsExpanded, setDetailsExpanded] = useState(false);
  const [saved, setSaved] = useState(false);
  const [duplicateInfo, setDuplicateInfo] = useState<{ spaceName: string } | null>(null);
  const [spacePickerOpen, setSpacePickerOpen] = useState(false);

  const detailsRotation = useRef(new Animated.Value(0)).current;
  const successOpacity = useRef(new Animated.Value(0)).current;

  const canSave = url.trim().length > 0 && !loading && urlStatus !== 'invalid';

  useEffect(() => {
    const timer = setTimeout(() => urlInputRef.current?.focus(), 300);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (initialUrl) {
      validateAndFetch(initialUrl);
    }
  }, []);

  useEffect(() => {
    Animated.timing(detailsRotation, {
      toValue: detailsExpanded ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [detailsExpanded]);

  const validateAndFetch = useCallback(async (input: string) => {
    const trimmed = input.trim();
    if (!trimmed) {
      setUrlStatus('idle');
      setPreview(null);
      return;
    }

    const normalized = normalizeUrl(trimmed);
    if (!normalized) {
      setUrlStatus('invalid');
      setPreview(null);
      return;
    }

    const existing = findDuplicate(normalized);
    if (existing) {
      const space = spaces.find((s) => s.id === existing.spaceId);
      setUrlStatus('duplicate');
      setDuplicateInfo({ spaceName: space?.name ?? 'Recent Links' });
      setPreview(null);
      return;
    }

    setUrlStatus('valid');
    setDuplicateInfo(null);

    setFetching(true);
    const meta = await fetchMetadata(normalized);
    setFetching(false);
    setPreview(meta);
    if (meta.title && !title.trim()) {
      setTitle(meta.title);
    }
  }, [findDuplicate, spaces, title]);

  function handleUrlChange(text: string) {
    setUrl(text);
    setUrlStatus('idle');
    setPreview(null);
    setDuplicateInfo(null);

    if (isValidUrl(text.trim())) {
      validateAndFetch(text);
    }
  }

  async function handlePasteFromClipboard() {
    try {
      const content = await Clipboard.getStringAsync();
      if (content && isValidUrl(content.trim())) {
        setUrl(content);
        validateAndFetch(content);
      }
    } catch {}
  }

  async function handleSave() {
    if (!canSave) return;
    const normalized = normalizeUrl(url.trim());
    if (!normalized) return;

    setLoading(true);
    const meta = preview ?? (await fetchMetadata(normalized));
    saveLink({
      url: normalized,
      title: title.trim() || undefined,
      spaceId,
      description: notes.trim() || null,
      favicon: meta?.favicon ?? null,
      thumbnail: meta?.thumbnail ?? null,
      tags,
    });
    setLoading(false);

    setSaved(true);
    Animated.sequence([
      Animated.timing(successOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      Animated.delay(600),
      Animated.timing(successOpacity, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start(() => router.back());
  }

  const brand = preview?.domain ? brandFor(preview.domain) : null;
  const fallbackImage = FALLBACK_IMAGES[0];

  const selectedSpace = spaces.find((s) => s.id === spaceId);
  const selectedCategory = selectedSpace ? (selectedSpace.id === 'space-1' ? 'Personal' : selectedSpace.id === 'space-2' ? 'Work' : selectedSpace.id === 'space-3' ? 'Entertainment' : selectedSpace.id === 'space-4' ? 'Shopping' : null) : null;
  const accentColor = selectedCategory === 'Personal' ? '#A56BFF' : selectedCategory === 'Work' ? '#20D889' : selectedCategory === 'Entertainment' ? '#22B5E8' : selectedCategory === 'Shopping' ? '#F5C21A' : palette.accent;

  const chevronStyle = { transform: [{ rotate: detailsRotation.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] }) }] };

  return (
    <View style={[styles.sheet, { backgroundColor: palette.background, paddingBottom: insets.bottom + 16 }]}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {/* Drag handle */}
        <View style={styles.handleWrap}>
          <View style={[styles.handle, { backgroundColor: palette.textTertiary }]} />
        </View>

        {/* Header */}
        <View style={[styles.header, { paddingHorizontal: r.pagePad }]}>
          <View style={styles.headerLeft}>
            <Text style={[styles.headerTitle, { color: palette.textPrimary }]}>Add Link</Text>
          </View>
          <Pressable onPress={() => router.back()} hitSlop={8} accessibilityRole="button"
            style={({ pressed }) => [{ opacity: pressed ? 0.5 : 1 }]}>
            <Ionicons name="close" size={22} color={palette.textTertiary} />
          </Pressable>
        </View>
        <Text style={[styles.subtitle, { color: palette.textSecondary, paddingHorizontal: r.pagePad }]}>
          Save a link to your Space
        </Text>

        <ScrollView style={styles.flex} contentContainerStyle={[styles.body, { paddingHorizontal: r.pagePad }]}
          keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

          {/* URL Input */}
          <View style={[styles.urlBox, { backgroundColor: palette.surface }]}>
            <Ionicons name="link" size={18} color={palette.textSecondary} />
            <TextInput
              ref={urlInputRef}
              value={url}
              onChangeText={handleUrlChange}
              placeholder="Paste a link..."
              placeholderTextColor={palette.textPlaceholder}
              style={[styles.urlInput, { color: palette.textPrimary }]}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
              returnKeyType="done"
              onSubmitEditing={() => isValidUrl(url.trim()) && validateAndFetch(url)}
            />
            {url.length === 0 ? (
              <Pressable onPress={handlePasteFromClipboard} hitSlop={8}
                style={({ pressed }) => [{ opacity: pressed ? 0.5 : 1 }]}>
                <Ionicons name="clipboard-outline" size={18} color={palette.accent} />
              </Pressable>
            ) : (
              <Pressable onPress={() => { setUrl(''); setUrlStatus('idle'); setPreview(null); setDuplicateInfo(null); }}
                hitSlop={8} style={({ pressed }) => [{ opacity: pressed ? 0.5 : 1 }]}>
                <Ionicons name="close-circle" size={18} color={palette.textTertiary} />
              </Pressable>
            )}
          </View>

          {/* URL Status */}
          {urlStatus === 'valid' && !fetching && (
            <View style={styles.statusRow}>
              <Ionicons name="checkmark-circle" size={14} color={palette.success} />
              <Text style={[styles.statusText, { color: palette.success }]}>Link detected</Text>
            </View>
          )}
          {urlStatus === 'invalid' && (
            <View style={styles.statusRow}>
              <Ionicons name="alert-circle" size={14} color={palette.danger} />
              <Text style={[styles.statusText, { color: palette.danger }]}>This doesn't look like a valid link</Text>
            </View>
          )}
          {urlStatus === 'duplicate' && duplicateInfo && (
            <View style={[styles.statusRow, { backgroundColor: hexToRgba(palette.accent, 0.08) }]}>
              <Ionicons name="information-circle" size={14} color={palette.accent} />
              <Text style={[styles.statusText, { color: palette.accent }]}>
                Already saved to {duplicateInfo.spaceName}
              </Text>
            </View>
          )}

          {/* Link Preview */}
          {fetching && (
            <View style={[styles.previewCard, { backgroundColor: palette.surface }]}>
              <View style={[styles.skeleton, { backgroundColor: palette.surfaceRaised }]} />
              <View style={[styles.skeletonText, { backgroundColor: palette.surfaceRaised }]} />
              <View style={[styles.skeletonTextShort, { backgroundColor: palette.surfaceRaised }]} />
            </View>
          )}

          {!fetching && preview && (
            <View style={[styles.previewCard, { backgroundColor: palette.surface }]}>
              <View style={[styles.previewIcon, { backgroundColor: brand?.bg ?? palette.surfaceRaised, overflow: 'hidden' }]}>
                {preview.favicon ? (
                  <View style={{ width: '100%', height: '100%' }}>
                    <Ionicons name="globe-outline" size={28} color={palette.textTertiary} />
                  </View>
                ) : brand ? (
                  <Text style={{ color: brand.fg, fontSize: 20, fontWeight: '700' }}>{brand.label}</Text>
                ) : (
                  <Ionicons name="globe-outline" size={28} color={palette.textTertiary} />
                )}
              </View>
              <View style={styles.previewInfo}>
                <Text style={[styles.previewTitle, { color: palette.textPrimary }]} numberOfLines={2}>
                  {preview.title || title || getDomain(url)}
                </Text>
                <Text style={[styles.previewDomain, { color: palette.textSecondary }]} numberOfLines={1}>
                  {preview.domain}
                </Text>
              </View>
            </View>
          )}

          {/* Save to Space */}
          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: palette.textSecondary }]}>Save to Space</Text>
            <Pressable
              onPress={() => setSpacePickerOpen(!spacePickerOpen)}
              style={({ pressed }) => [
                styles.spaceSelector,
                { backgroundColor: palette.surface, opacity: pressed ? 0.8 : 1 },
              ]}
            >
              {selectedSpace ? (
                <View style={styles.spaceSelected}>
                  <View style={[styles.spaceDot, { backgroundColor: accentColor }]} />
                  <Text style={[styles.spaceName, { color: palette.textPrimary }]}>{selectedSpace.name}</Text>
                </View>
              ) : (
                <Text style={[styles.spacePlaceholder, { color: palette.textTertiary }]}>Choose a Space</Text>
              )}
              <Ionicons name="chevron-down" size={16} color={palette.textTertiary} />
            </Pressable>

            {spacePickerOpen && (
              <View style={[styles.spaceList, { backgroundColor: palette.surface }]}>
                {spaces.map((space) => {
                  const cat = space.id === 'space-1' ? 'Personal' : space.id === 'space-2' ? 'Work' : space.id === 'space-3' ? 'Entertainment' : space.id === 'space-4' ? 'Shopping' : null;
                  const acc = cat === 'Personal' ? '#A56BFF' : cat === 'Work' ? '#20D889' : cat === 'Entertainment' ? '#22B5E8' : cat === 'Shopping' ? '#F5C21A' : palette.accent;
                  const isSelected = space.id === spaceId;
                  return (
                    <Pressable
                      key={space.id}
                      onPress={() => { setSpaceId(space.id); setSpacePickerOpen(false); }}
                      style={({ pressed }) => [
                        styles.spaceOption,
                        { opacity: pressed ? 0.7 : 1 },
                      ]}
                    >
                      <View style={[styles.spaceDot, { backgroundColor: acc }]} />
                      <Text style={[styles.spaceOptionName, { color: palette.textPrimary }]}>{space.name}</Text>
                      {isSelected && <Ionicons name="checkmark" size={16} color={palette.accent} />}
                    </Pressable>
                  );
                })}
                <View style={[styles.spaceDivider, { backgroundColor: palette.surfaceRaised }]} />
                <Pressable
                  onPress={() => { setSpacePickerOpen(false); router.push('/create-space'); }}
                  style={({ pressed }) => [styles.spaceOption, { opacity: pressed ? 0.7 : 1 }]}
                >
                  <Ionicons name="add-circle-outline" size={18} color={palette.accent} />
                  <Text style={[styles.spaceOptionName, { color: palette.accent }]}>Create New Space</Text>
                </Pressable>
              </View>
            )}
          </View>

          {/* Add Details */}
          <Pressable
            onPress={() => setDetailsExpanded(!detailsExpanded)}
            style={({ pressed }) => [styles.detailsToggle, { opacity: pressed ? 0.7 : 1 }]}
          >
            <Text style={[styles.detailsLabel, { color: palette.textSecondary }]}>Add details</Text>
            <Animated.View style={chevronStyle}>
              <Ionicons name="chevron-down" size={16} color={palette.textTertiary} />
            </Animated.View>
          </Pressable>

          {detailsExpanded && (
            <View style={styles.detailsSection}>
              <View style={styles.field}>
                <Text style={[styles.fieldLabel, { color: palette.textSecondary }]}>Title</Text>
                <TextInput
                  value={title}
                  onChangeText={setTitle}
                  placeholder="Page title (auto-filled)"
                  placeholderTextColor={palette.textPlaceholder}
                  style={[styles.input, { backgroundColor: palette.surface, color: palette.textPrimary }]}
                  returnKeyType="done"
                />
              </View>

              <View style={styles.field}>
                <Text style={[styles.fieldLabel, { color: palette.textSecondary }]}>Tags</Text>
                <View style={[styles.tagInput, { backgroundColor: palette.surface }]}>
                  <Ionicons name="pricetag-outline" size={16} color={palette.textTertiary} />
                  <TextInput
                    value={tags.join(', ')}
                    onChangeText={(t) => setTags(t.split(',').map(s => s.trim()).filter(Boolean))}
                    placeholder="Add tags"
                    placeholderTextColor={palette.textPlaceholder}
                    style={[styles.tagTextInput, { color: palette.textPrimary }]}
                    autoCapitalize="none"
                    returnKeyType="done"
                  />
                </View>
                {tags.length > 0 && (
                  <View style={styles.tagChips}>
                    {tags.map((tag) => (
                      <View key={tag} style={[styles.tagChip, { backgroundColor: palette.surfaceRaised }]}>
                        <Text style={[styles.tagChipText, { color: palette.textSecondary }]}>{tag}</Text>
                        <Pressable onPress={() => setTags(tags.filter(t => t !== tag))} hitSlop={6}>
                          <Ionicons name="close" size={12} color={palette.textTertiary} />
                        </Pressable>
                      </View>
                    ))}
                  </View>
                )}
              </View>

              <View style={styles.field}>
                <Text style={[styles.fieldLabel, { color: palette.textSecondary }]}>Note</Text>
                <TextInput
                  value={notes}
                  onChangeText={setNotes}
                  placeholder="Add a note..."
                  placeholderTextColor={palette.textPlaceholder}
                  multiline
                  style={[styles.input, styles.multiline, { backgroundColor: palette.surface, color: palette.textPrimary }]}
                />
              </View>
            </View>
          )}

          {/* Save Button */}
          <Pressable
            onPress={handleSave}
            disabled={!canSave}
            style={({ pressed }) => [
              styles.saveBtn,
              {
                backgroundColor: canSave ? '#F4F4F5' : palette.surfaceRaised,
                opacity: canSave ? (pressed ? 0.85 : 1) : 0.5,
                transform: [{ scale: pressed && canSave ? 0.98 : 1 }],
              },
            ]}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#000000" />
            ) : (
              <Text style={[styles.saveBtnText, { color: canSave ? '#000000' : palette.textTertiary }]}>
                Save Link
              </Text>
            )}
          </Pressable>
        </ScrollView>

        {/* Success Overlay */}
        {saved && (
          <Animated.View style={[styles.successOverlay, { opacity: successOpacity }]}>
            <View style={[styles.successCard, { backgroundColor: palette.surface }]}>
              <Ionicons name="checkmark-circle" size={28} color={palette.success} />
              <Text style={[styles.successText, { color: palette.textPrimary }]}>
                Saved to {selectedSpace?.name ?? 'Recent Links'}
              </Text>
            </View>
          </Animated.View>
        )}
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  sheet: {
    flex: 1,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  handleWrap: {
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 4,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    paddingBottom: 4,
  },
  headerLeft: { flex: 1 },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 14,
    paddingBottom: 20,
  },
  body: {
    gap: 16,
    paddingBottom: 24,
  },
  urlBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    height: 50,
    paddingHorizontal: 14,
    borderRadius: 14,
  },
  urlInput: {
    flex: 1,
    fontSize: 16,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 4,
  },
  statusText: {
    fontSize: 13,
  },
  previewCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 14,
  },
  skeleton: {
    width: 48,
    height: 48,
    borderRadius: 10,
  },
  skeletonText: {
    height: 14,
    width: '70%',
    borderRadius: 4,
  },
  skeletonTextShort: {
    height: 12,
    width: '40%',
    borderRadius: 4,
  },
  previewIcon: {
    width: 48,
    height: 48,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewInfo: {
    flex: 1,
    gap: 3,
  },
  previewTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  previewDomain: {
    fontSize: 13,
  },
  section: {
    gap: 8,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  spaceSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 48,
    paddingHorizontal: 14,
    borderRadius: 12,
  },
  spaceSelected: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  spaceDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  spaceName: {
    fontSize: 15,
    fontWeight: '500',
  },
  spacePlaceholder: {
    fontSize: 15,
  },
  spaceList: {
    borderRadius: 12,
    padding: 4,
  },
  spaceOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  spaceOptionName: {
    flex: 1,
    fontSize: 15,
  },
  spaceDivider: {
    height: 1,
    marginVertical: 4,
  },
  detailsToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  detailsLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  detailsSection: {
    gap: 14,
  },
  field: {
    gap: 6,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  input: {
    height: 46,
    paddingHorizontal: 14,
    borderRadius: 12,
    fontSize: 15,
  },
  multiline: {
    height: 80,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  tagInput: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    height: 46,
    paddingHorizontal: 14,
    borderRadius: 12,
  },
  tagTextInput: {
    flex: 1,
    fontSize: 15,
  },
  tagChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  tagChipText: {
    fontSize: 12,
  },
  saveBtn: {
    height: 50,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  saveBtnText: {
    fontSize: 16,
    fontWeight: '600',
  },
  successOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  successCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 14,
  },
  successText: {
    fontSize: 15,
    fontWeight: '600',
  },
});
