import { Pressable, ScrollView, StyleSheet, Text, View, Image, Alert, Linking } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Screen } from '../../src/components/Screen';
import { useTheme } from '../../src/theme/ThemeContext';
import { useResponsive } from '../../src/hooks/useResponsive';
import { useLink, useDeleteLink } from '../../src/hooks/useLinks';
import { useSpaces } from '../../src/hooks/useSpaces';
import { brandFor } from '../../src/lib/brand';
import { getDomain } from '../../src/lib/url';

const FALLBACK_IMAGES = [
  require('../../assets/images/sunflower-robot.png'),
  require('../../assets/images/fantom-logo.png'),
];

export default function LinkPreviewScreen() {
  const linkId = useLocalSearchParams<{ id: string }>().id;
  const { palette } = useTheme();
  const r = useResponsive();
  const insets = useSafeAreaInsets();
  const link = useLink(linkId);
  const spaces = useSpaces();
  const deleteLink = useDeleteLink();

  if (!link) {
    return (
      <Screen>
        <View style={[styles.header, { paddingHorizontal: r.pagePad, paddingTop: insets.top + 8 }]}>
          <Pressable onPress={() => router.back()} hitSlop={8}
            style={({ pressed }) => [styles.backBtn, { backgroundColor: palette.surface, opacity: pressed ? 0.6 : 1 }]}>
            <Ionicons name="chevron-back" size={22} color={palette.textPrimary} />
          </Pressable>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.center}>
          <Text style={[styles.notFound, { color: palette.textSecondary }]}>Link not found.</Text>
        </View>
      </Screen>
    );
  }

  const brand = brandFor(link.url);
  const domain = link.domain || getDomain(link.url);
  const space = spaces.find((s) => s.id === link.spaceId);
  const accent = space?.color ?? palette.accent;
  const hasImage = link.thumbnail?.startsWith('http') || link.favicon?.startsWith('http');
  const fallbackImage = FALLBACK_IMAGES[Math.abs(link.id.charCodeAt(0)) % FALLBACK_IMAGES.length];
  const created = new Date(link.createdAt).toLocaleDateString();
  const tags = link.tags ?? [];

  function confirmDelete() {
    Alert.alert('Delete this link?', undefined, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => { deleteLink(linkId); router.back(); } },
    ]);
  }

  return (
    <Screen>
      <View style={[styles.header, { paddingHorizontal: r.pagePad, paddingTop: insets.top + 8 }]}>
        <Pressable onPress={() => router.back()} hitSlop={8}
          style={({ pressed }) => [styles.backBtn, { backgroundColor: palette.surface, opacity: pressed ? 0.6 : 1 }]}>
          <Ionicons name="chevron-back" size={22} color={palette.textPrimary} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: palette.textPrimary }]}>Link Details</Text>
        <Pressable onPress={confirmDelete} hitSlop={8}
          style={({ pressed }) => [styles.iconBtn, { opacity: pressed ? 0.6 : 1 }]}>
          <Ionicons name="trash-outline" size={20} color={palette.danger} />
        </Pressable>
      </View>

      <ScrollView style={styles.flex} contentContainerStyle={[styles.body, { paddingHorizontal: r.pagePad }]}
        showsVerticalScrollIndicator={false}>

        <View style={[styles.hero, { backgroundColor: brand?.bg ?? palette.surface }]}>
          {hasImage ? (
            <Image source={{ uri: (link.thumbnail || link.favicon) ?? undefined }} style={styles.heroImage} />
          ) : brand ? (
            <Text style={[styles.heroBrand, { color: brand.fg }]}>{brand.label}</Text>
          ) : (
            <Image source={fallbackImage} style={styles.heroImage} />
          )}
        </View>

        <Text style={[styles.title, { color: palette.textPrimary }]}>
          {link.title || domain}
        </Text>

        <View style={styles.domainRow}>
          <Ionicons name="globe-outline" size={14} color={palette.textTertiary} />
          <Text style={[styles.domain, { color: palette.textSecondary }]}>{domain}</Text>
        </View>

        <View style={[styles.urlBox, { backgroundColor: palette.surface }]}>
          <Ionicons name="link" size={14} color={palette.textTertiary} />
          <Text numberOfLines={2} style={[styles.urlText, { color: palette.textTertiary }]}>{link.url}</Text>
        </View>

        {space && (
          <View style={styles.infoRow}>
            <View style={[styles.infoIcon, { backgroundColor: `${accent}1A` }]}>
              <Ionicons name={(space.icon ?? 'folder-outline') as any} size={16} color={accent} />
            </View>
            <View style={styles.infoContent}>
              <Text style={[styles.infoLabel, { color: palette.textTertiary }]}>Space</Text>
              <Text style={[styles.infoValue, { color: palette.textPrimary }]}>{space.name}</Text>
            </View>
          </View>
        )}

        {tags.length > 0 && (
          <View style={styles.infoRow}>
            <View style={[styles.infoIcon, { backgroundColor: palette.surfaceRaised }]}>
              <Ionicons name="pricetag-outline" size={16} color={palette.textTertiary} />
            </View>
            <View style={styles.infoContent}>
              <Text style={[styles.infoLabel, { color: palette.textTertiary }]}>Tags</Text>
              <View style={styles.tagChips}>
                {tags.map((tag) => (
                  <View key={tag} style={[styles.tagChip, { backgroundColor: palette.surfaceRaised }]}>
                    <Text style={[styles.tagText, { color: palette.textSecondary }]}>{tag}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        )}

        {link.description ? (
          <View style={styles.infoRow}>
            <View style={[styles.infoIcon, { backgroundColor: palette.surfaceRaised }]}>
              <Ionicons name="document-text-outline" size={16} color={palette.textTertiary} />
            </View>
            <View style={styles.infoContent}>
              <Text style={[styles.infoLabel, { color: palette.textTertiary }]}>Notes</Text>
              <Text style={[styles.notesText, { color: palette.textPrimary }]}>{link.description}</Text>
            </View>
          </View>
        ) : null}

        <View style={styles.infoRow}>
          <View style={[styles.infoIcon, { backgroundColor: palette.surfaceRaised }]}>
            <Ionicons name="calendar-outline" size={16} color={palette.textTertiary} />
          </View>
          <View style={styles.infoContent}>
            <Text style={[styles.infoLabel, { color: palette.textTertiary }]}>Saved</Text>
            <Text style={[styles.infoValue, { color: palette.textPrimary }]}>{created}</Text>
          </View>
        </View>

        {link.isPinned ? (
          <View style={styles.infoRow}>
            <View style={[styles.infoIcon, { backgroundColor: palette.surfaceRaised }]}>
              <Ionicons name="pin" size={16} color={palette.accent} />
            </View>
            <View style={styles.infoContent}>
              <Text style={[styles.infoValue, { color: palette.accent }]}>Pinned</Text>
            </View>
          </View>
        ) : null}

        <Pressable
          onPress={() => Linking.openURL(link.url)}
          style={({ pressed }) => [styles.openBtn, { opacity: pressed ? 0.85 : 1, transform: [{ scale: pressed ? 0.98 : 1 }] }]}
        >
          <Ionicons name="open-outline" size={18} color="#000000" />
          <Text style={styles.openText}>Open Link</Text>
        </Pressable>

        <Pressable
          onPress={() => router.push(`/edit-link/${linkId}`)}
          style={({ pressed }) => [styles.editBtn, { backgroundColor: palette.surface, opacity: pressed ? 0.7 : 1 }]}
        >
          <Ionicons name="create-outline" size={18} color={palette.textPrimary} />
          <Text style={[styles.editText, { color: palette.textPrimary }]}>Edit Link</Text>
        </Pressable>

      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingBottom: 12 },
  backBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 17, fontWeight: '600' },
  headerSpacer: { width: 40 },
  iconBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  notFound: { fontSize: 15 },
  body: { paddingBottom: 40, gap: 16 },
  hero: { height: 180, borderRadius: 16, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  heroImage: { width: '100%', height: '100%' },
  heroBrand: { fontSize: 48, fontWeight: '800' },
  title: { fontSize: 22, fontWeight: '700', letterSpacing: -0.3 },
  domainRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  domain: { fontSize: 14 },
  urlBox: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 14, paddingVertical: 12, borderRadius: 12 },
  urlText: { flex: 1, fontSize: 13 },
  infoRow: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  infoIcon: { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginTop: 2 },
  infoContent: { flex: 1, gap: 4 },
  infoLabel: { fontSize: 12, fontWeight: '500', textTransform: 'uppercase', letterSpacing: 0.5 },
  infoValue: { fontSize: 15, fontWeight: '500' },
  tagChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  tagChip: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  tagText: { fontSize: 13 },
  notesText: { fontSize: 15, lineHeight: 22 },
  openBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, height: 50, borderRadius: 14, backgroundColor: '#F4F4F5', marginTop: 8 },
  openText: { fontSize: 16, fontWeight: '600', color: '#000000' },
  editBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, height: 48, borderRadius: 12, marginTop: 8 },
  editText: { fontSize: 15, fontWeight: '600' },
});
