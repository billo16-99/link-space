import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Easing,
  KeyboardAvoidingView,
  PanResponder,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';
import { useResponsive } from '../hooks/useResponsive';
import { normalizeUrl, isValidUrl } from '../lib/url';
import { fetchMetadata, type LinkMetadata } from '../lib/metadata';
import { useDuplicateCheck, useSaveLink } from '../hooks/useLinks';
import { useSpaces } from '../hooks/useSpaces';
import { hexToRgba } from '../lib/color';

interface AddLinkPanelProps {
  expanded: boolean;
  onOpen: () => void;
  onClose: () => void;
  initialSpaceId?: string | null;
}

function spaceAccent(id: string | null | undefined, fallback: string): string {
  if (!id) return fallback;
  const m: Record<string, string> = { 'space-1': '#A56BFF', 'space-2': '#20D889', 'space-3': '#22B5E8', 'space-4': '#F5C21A' };
  return m[id] ?? fallback;
}

export function AddLinkPanel({ expanded, onOpen, onClose, initialSpaceId }: AddLinkPanelProps) {
  const { palette } = useTheme();
  const r = useResponsive();
  const insets = useSafeAreaInsets();
  const urlRef = useRef<TextInput>(null);
  const spaces = useSpaces();
  const saveLink = useSaveLink();
  const findDup = useDuplicateCheck();

  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [spaceId, setSpaceId] = useState<string | null>(initialSpaceId ?? null);
  const [tags, setTags] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [preview, setPreview] = useState<LinkMetadata | null>(null);
  const [urlStatus, setUrlStatus] = useState<'idle' | 'valid' | 'invalid' | 'duplicate'>('idle');
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [dupInfo, setDupInfo] = useState<{ spaceName: string } | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [saved, setSaved] = useState(false);

  const slideAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const swipeY = useRef(new Animated.Value(0)).current;
  const saveScale = useRef(new Animated.Value(1)).current;
  const saveCheckmark = useRef(new Animated.Value(0)).current;

  const FAB_W = r.width < 360 ? 140 : r.width < 412 ? 160 : 180;
  const FAB_H = r.width < 360 ? 44 : r.width < 412 ? 48 : 52;
  const BOT = 20 + insets.bottom;
  const PANEL_H = r.height;
  const canSave = url.trim().length > 0 && !loading && urlStatus !== 'invalid';

  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dy) > 10 && g.dy > 0,
      onPanResponderMove: (_, g) => {
        if (g.dy > 0) {
          swipeY.setValue(g.dy);
        }
      },
      onPanResponderRelease: (_, g) => {
        if (g.dy > 120 || (g.vy > 0.5 && g.dy > 30)) {
          onCloseRef.current();
        } else {
          Animated.spring(swipeY, { toValue: 0, useNativeDriver: true, damping: 18, stiffness: 180 }).start();
        }
      },
    })
  ).current;

  useEffect(() => {
    if (!expanded && !saved) {
      const t = setTimeout(() => {
        setUrl(''); setTitle(''); setSpaceId(initialSpaceId ?? null);
        setTags([]); setNotes(''); setPreview(null);
        setUrlStatus('idle'); setDetailsOpen(false);
        setDupInfo(null); setPickerOpen(false);
      }, 350);
      return () => clearTimeout(t);
    }
  }, [expanded, saved, initialSpaceId]);

  useEffect(() => {
    if (expanded) {
      slideAnim.setValue(PANEL_H);
      fadeAnim.setValue(0);
      swipeY.setValue(0);
      Animated.parallel([
        Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, damping: 18, stiffness: 180 }),
        Animated.timing(fadeAnim, { toValue: 1, duration: 250, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, { toValue: PANEL_H, duration: 280, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.timing(fadeAnim, { toValue: 0, duration: 180, easing: Easing.in(Easing.cubic), useNativeDriver: true }),
        Animated.timing(swipeY, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]).start();
    }
  }, [expanded]);

  useEffect(() => {
    if (saved) {
      Animated.sequence([
        Animated.spring(saveScale, { toValue: 0.92, useNativeDriver: true, damping: 12, stiffness: 300 }),
        Animated.spring(saveScale, { toValue: 1, useNativeDriver: true, damping: 14, stiffness: 200 }),
      ]).start();
      Animated.timing(saveCheckmark, { toValue: 1, duration: 200, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
    } else {
      saveCheckmark.setValue(0);
    }
  }, [saved]);

  const validate = useCallback(async (input: string) => {
    const t = input.trim();
    if (!t) { setUrlStatus('idle'); setPreview(null); return; }
    const n = normalizeUrl(t);
    if (!n) { setUrlStatus('invalid'); setPreview(null); return; }
    const d = findDup(n);
    if (d) {
      const sp = spaces.find(s => s.id === d.spaceId);
      setUrlStatus('duplicate');
      setDupInfo({ spaceName: sp?.name ?? 'Recent Links' });
      setPreview(null);
      return;
    }
    setUrlStatus('valid'); setDupInfo(null); setFetching(true);
    const m = await fetchMetadata(n);
    setFetching(false); setPreview(m);
    if (m.title && !title.trim()) setTitle(m.title);
  }, [findDup, spaces, title]);

  function onUrlChange(text: string) {
    setUrl(text); setUrlStatus('idle'); setPreview(null); setDupInfo(null);
    if (isValidUrl(text.trim())) validate(text);
  }

  async function onPaste() {
    try {
      const c = await Clipboard.getStringAsync();
      if (c && isValidUrl(c.trim())) { setUrl(c); validate(c); }
    } catch {}
  }

  async function onSave() {
    if (!canSave) return;
    const n = normalizeUrl(url.trim());
    if (!n) return;
    setLoading(true);
    const m = preview ?? (await fetchMetadata(n));
    saveLink({ url: n, title: title.trim() || undefined, spaceId, description: notes.trim() || null, favicon: m?.favicon ?? null, thumbnail: m?.thumbnail ?? null, tags });
    setLoading(false); setSaved(true);
    setTimeout(() => {
      setSaved(false); onClose();
      setTimeout(() => {
        setUrl(''); setTitle(''); setSpaceId(initialSpaceId ?? null);
        setTags([]); setNotes(''); setPreview(null);
        setUrlStatus('idle'); setDetailsOpen(false);
        setDupInfo(null); setPickerOpen(false);
      }, 350);
    }, 800);
  }

  const selSpace = spaces.find(s => s.id === spaceId);
  const accent = spaceAccent(spaceId, palette.accent);

  if (!expanded) {
    return (
      <View style={[styles.fabWrap, { bottom: BOT }]}>
        <Pressable
          onPress={onOpen}
          style={({ pressed }) => [
            styles.fab,
            {
              width: FAB_W,
              height: FAB_H,
              borderRadius: FAB_H / 2,
              opacity: pressed ? 0.85 : 1,
              transform: [{ scale: pressed ? 0.97 : 1 }],
            },
          ]}
        >
          <View style={[styles.fabIcon, { backgroundColor: '#000000' }]}>
            <Ionicons name="add" size={r.width < 360 ? 16 : 18} color="#FFFFFF" />
          </View>
          <Text style={[styles.fabLabel, { fontSize: r.width < 360 ? 14 : 15 }]}>Add Link</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <>
      <Pressable style={[styles.backdrop, { bottom: BOT + FAB_H + 8 }]} onPress={onClose} />

      <Animated.View
        style={[
          styles.panel,
          {
            backgroundColor: '#000000',
            bottom: 0,
            opacity: fadeAnim,
            transform: [{ translateY: Animated.add(slideAnim, swipeY) }],
          },
        ]}
        {...panResponder.panHandlers}
      >
        <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.handleWrap}><View style={[styles.handle, { backgroundColor: palette.textTertiary }]} /></View>
          <View style={styles.header}>
            <Text style={[styles.headerTitle, { color: palette.textPrimary }]}>Add Link</Text>
            <Pressable onPress={onClose} hitSlop={8} style={({ pressed }) => [{ opacity: pressed ? 0.5 : 1 }]}>
              <Ionicons name="close" size={22} color={palette.textTertiary} />
            </Pressable>
          </View>
          <ScrollView style={styles.flex} contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            <View style={[styles.urlBox, { backgroundColor: palette.surface }]}>
              <Ionicons name="link" size={18} color={palette.textSecondary} />
              <TextInput ref={urlRef} value={url} onChangeText={onUrlChange} placeholder="Paste a link..." placeholderTextColor={palette.textPlaceholder} style={[styles.urlInput, { color: palette.textPrimary }]} selectionColor="#27C76F" autoCapitalize="none" autoCorrect={false} keyboardType="url" returnKeyType="done" onSubmitEditing={() => isValidUrl(url.trim()) && validate(url)} />
              {url.length === 0 ? (
                <Pressable onPress={onPaste} hitSlop={8} style={({ pressed }) => [{ opacity: pressed ? 0.5 : 1 }]}>
                  <Ionicons name="clipboard-outline" size={18} color={palette.accent} />
                </Pressable>
              ) : (
                <Pressable onPress={() => { setUrl(''); setUrlStatus('idle'); setPreview(null); setDupInfo(null); }} hitSlop={8} style={({ pressed }) => [{ opacity: pressed ? 0.5 : 1 }]}>
                  <Ionicons name="close-circle" size={18} color={palette.textTertiary} />
                </Pressable>
              )}
            </View>

            {urlStatus === 'valid' && !fetching && <View style={styles.statusRow}><Ionicons name="checkmark-circle" size={14} color={palette.success} /><Text style={[styles.statusText, { color: palette.success }]}>Link detected</Text></View>}
            {urlStatus === 'invalid' && <View style={styles.statusRow}><Ionicons name="alert-circle" size={14} color={palette.danger} /><Text style={[styles.statusText, { color: palette.danger }]}>Not a valid link</Text></View>}
            {urlStatus === 'duplicate' && dupInfo && <View style={[styles.statusRow, { backgroundColor: hexToRgba(palette.accent, 0.08) }]}><Ionicons name="information-circle" size={14} color={palette.accent} /><Text style={[styles.statusText, { color: palette.accent }]}>Already saved to {dupInfo.spaceName}</Text></View>}

            {fetching && <View style={[styles.preview, { backgroundColor: palette.surface }]}><View style={[styles.skel, { backgroundColor: palette.surfaceRaised }]} /><View style={[styles.skelT, { backgroundColor: palette.surfaceRaised }]} /><View style={[styles.skelS, { backgroundColor: palette.surfaceRaised }]} /></View>}
            {!fetching && preview && (
              <View style={[styles.preview, { backgroundColor: palette.surface }]}>
                <View style={[styles.prevIcon, { backgroundColor: palette.surfaceRaised }]}>
                  {preview.favicon ? <Ionicons name="globe-outline" size={28} color={palette.textTertiary} /> : <Text style={{ color: palette.textTertiary, fontSize: 20, fontWeight: '700' }}>{(preview.domain || '?')[0].toUpperCase()}</Text>}
                </View>
                <View style={{ flex: 1, gap: 3 }}>
                  <Text style={[styles.prevTitle, { color: palette.textPrimary }]} numberOfLines={2}>{preview.title || title || preview.domain}</Text>
                  <Text style={[styles.prevDomain, { color: palette.textSecondary }]} numberOfLines={1}>{preview.domain}</Text>
                </View>
              </View>
            )}

            <View style={{ gap: 8 }}>
              <Text style={[styles.label, { color: palette.textSecondary }]}>Save to Space</Text>
              <Pressable onPress={() => setPickerOpen(!pickerOpen)} style={({ pressed }) => [styles.pickerBtn, { backgroundColor: palette.surface, opacity: pressed ? 0.8 : 1 }]}>
                {selSpace ? <View style={styles.pickerSelected}><View style={[styles.dot, { backgroundColor: accent }]} /><Text style={[styles.pickerName, { color: palette.textPrimary }]}>{selSpace.name}</Text></View> : <Text style={[styles.pickerPlaceholder, { color: palette.textTertiary }]}>Choose a Space</Text>}
                <Ionicons name="chevron-down" size={16} color={palette.textTertiary} />
              </Pressable>
              {pickerOpen && (
                <View style={[styles.pickerList, { backgroundColor: palette.surface }]}>
                  {spaces.map(sp => {
                    const a = spaceAccent(sp.id, palette.accent);
                    return (
                      <Pressable key={sp.id} onPress={() => { setSpaceId(sp.id); setPickerOpen(false); }} style={({ pressed }) => [styles.pickerItem, { opacity: pressed ? 0.7 : 1 }]}>
                        <View style={[styles.dot, { backgroundColor: a }]} />
                        <Text style={[styles.pickerItemName, { color: palette.textPrimary }]}>{sp.name}</Text>
                        {sp.id === spaceId && <Ionicons name="checkmark" size={16} color={palette.accent} />}
                      </Pressable>
                    );
                  })}
                </View>
              )}
            </View>

            <Pressable onPress={() => setDetailsOpen(!detailsOpen)} style={({ pressed }) => [styles.detailsToggle, { opacity: pressed ? 0.7 : 1 }]}>
              <Text style={[styles.detailsLabel, { color: palette.textSecondary }]}>Add details</Text>
              <Ionicons name="chevron-down" size={16} color={palette.textTertiary} style={{ transform: [{ rotate: detailsOpen ? '180deg' : '0deg' }] }} />
            </Pressable>

            {detailsOpen && (
              <View style={{ gap: 14 }}>
                <View style={{ gap: 6 }}>
                  <Text style={[styles.label, { color: palette.textSecondary }]}>Title</Text>
                  <TextInput value={title} onChangeText={setTitle} placeholder="Page title (auto-filled)" placeholderTextColor={palette.textPlaceholder} style={[styles.input, { backgroundColor: palette.surface, color: palette.textPrimary }]} selectionColor="#27C76F" returnKeyType="done" />
                </View>
                <View style={{ gap: 6 }}>
                  <Text style={[styles.label, { color: palette.textSecondary }]}>Tags</Text>
                  <View style={[styles.tagRow, { backgroundColor: palette.surface }]}>
                    <Ionicons name="pricetag-outline" size={16} color={palette.textTertiary} />
                    <TextInput value={tags.join(', ')} onChangeText={t => setTags(t.split(',').map(s => s.trim()).filter(Boolean))} placeholder="Add tags" placeholderTextColor={palette.textPlaceholder} style={[styles.tagInput, { color: palette.textPrimary }]} selectionColor="#27C76F" autoCapitalize="none" returnKeyType="done" />
                  </View>
                  {tags.length > 0 && <View style={styles.tagChips}>{tags.map(t => (
                    <View key={t} style={[styles.tagChip, { backgroundColor: palette.surfaceRaised }]}>
                      <Text style={{ fontSize: 12, color: palette.textSecondary }}>{t}</Text>
                      <Pressable onPress={() => setTags(tags.filter(x => x !== t))} hitSlop={6}><Ionicons name="close" size={12} color={palette.textTertiary} /></Pressable>
                    </View>
                  ))}</View>}
                </View>
                <View style={{ gap: 6 }}>
                  <Text style={[styles.label, { color: palette.textSecondary }]}>Note</Text>
                  <TextInput value={notes} onChangeText={setNotes} placeholder="Add a note..." placeholderTextColor={palette.textPlaceholder} multiline style={[styles.input, styles.multi, { backgroundColor: palette.surface, color: palette.textPrimary }]} selectionColor="#27C76F" />
                </View>
              </View>
            )}

            <Animated.View style={{ transform: [{ scale: saveScale }], marginTop: 8 }}>
              <Pressable onPress={onSave} disabled={!canSave} style={({ pressed }) => [styles.saveBtn, { backgroundColor: saved ? '#27C76F' : canSave ? '#F4F4F5' : palette.surfaceRaised, opacity: canSave ? (pressed ? 0.85 : 1) : 0.5 }]}>
                {loading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : saved ? (
                  <Animated.View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, opacity: saveCheckmark }}>
                    <Ionicons name="checkmark" size={20} color="#FFFFFF" />
                    <Text style={[styles.saveText, { color: '#FFFFFF' }]}>Saved</Text>
                  </Animated.View>
                ) : (
                  <Text style={[styles.saveText, { color: canSave ? '#000000' : palette.textTertiary }]}>Save Link</Text>
                )}
              </Pressable>
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  fabWrap: { position: 'absolute', left: 0, right: 0, alignItems: 'center', zIndex: 200 },
  fab: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 14, backgroundColor: '#F4F4F5', shadowColor: '#000', shadowOpacity: 0.22, shadowRadius: 24, shadowOffset: { width: 0, height: 8 }, elevation: 8 },
  fabIcon: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  fabLabel: { fontWeight: '600', color: '#000000', letterSpacing: -0.2 },
  backdrop: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 150 },
  panel: { position: 'absolute', left: 16, right: 16, overflow: 'hidden', zIndex: 200 },
  handleWrap: { alignItems: 'center', paddingTop: 10, paddingBottom: 4 },
  handle: { width: 36, height: 4, borderRadius: 2 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 8, paddingBottom: 4 },
  headerTitle: { fontSize: 20, fontWeight: '700' },
  scroll: { gap: 16, paddingHorizontal: 20, paddingBottom: 24 },
  urlBox: { flexDirection: 'row', alignItems: 'center', gap: 10, height: 50, paddingHorizontal: 14, borderRadius: 14 },
  urlInput: { flex: 1, fontSize: 16 },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 4 },
  statusText: { fontSize: 13 },
  preview: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: 14 },
  skel: { width: 48, height: 48, borderRadius: 10 },
  skelT: { height: 14, width: '70%', borderRadius: 4 },
  skelS: { height: 12, width: '40%', borderRadius: 4 },
  prevIcon: { width: 48, height: 48, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  prevTitle: { fontSize: 15, fontWeight: '600' },
  prevDomain: { fontSize: 13 },
  label: { fontSize: 13, fontWeight: '500' },
  pickerBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', height: 48, paddingHorizontal: 14, borderRadius: 12 },
  pickerSelected: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  pickerName: { fontSize: 15, fontWeight: '500' },
  pickerPlaceholder: { fontSize: 15 },
  pickerList: { borderRadius: 12, padding: 4 },
  pickerItem: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 12, paddingHorizontal: 12 },
  pickerItemName: { flex: 1, fontSize: 15 },
  detailsToggle: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 4 },
  detailsLabel: { fontSize: 14, fontWeight: '500' },
  input: { height: 46, paddingHorizontal: 14, borderRadius: 12, fontSize: 15 },
  multi: { height: 80, textAlignVertical: 'top', paddingTop: 12 },
  tagRow: { flexDirection: 'row', alignItems: 'center', gap: 8, height: 46, paddingHorizontal: 14, borderRadius: 12 },
  tagInput: { flex: 1, fontSize: 15 },
  tagChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  tagChip: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  saveBtn: { height: 50, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  saveText: { fontSize: 16, fontWeight: '600' },
});
