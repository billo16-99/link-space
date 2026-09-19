import { useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../../src/components/Screen';
import { LinkCard } from '../../src/components/LinkCard';
import { EmptyState } from '../../src/components/EmptyState';
import { MenuSheet, type MenuSheetOption } from '../../src/components/MenuSheet';
import { PromptModal } from '../../src/components/PromptModal';
import { AddLinkFab } from '../../src/components/AddLinkFab';
import { useTheme } from '../../src/theme/ThemeContext';
import { useResponsive } from '../../src/hooks/useResponsive';
import { useDeleteLink, useLinksBySpace, useMoveLink, usePinLink } from '../../src/hooks/useLinks';
import { useDeleteSpace, useSpace, useSpaceLinkCounts, useSpaces, useUpdateSpace } from '../../src/hooks/useSpaces';
import { timeAgo } from '../../src/lib/format';

const SURFACE = '#111113';
const BORDER_LIGHT = 'rgba(40,42,49,0.70)';
const ICON_COLOR = '#F4F4F5';

export default function SpaceDetailScreen() {
  const spaceId = useLocalSearchParams<{ id: string }>().id;
  const { palette } = useTheme();
  const r = useResponsive();
  const space = useSpace(spaceId);
  const links = useLinksBySpace(spaceId);
  const counts = useSpaceLinkCounts();
  const allSpaces = useSpaces();
  const moveLink = useMoveLink();
  const pinLink = usePinLink();
  const deleteLink = useDeleteLink();
  const deleteSpace = useDeleteSpace();
  const updateSpace = useUpdateSpace();

  const [spaceMenuVisible, setSpaceMenuVisible] = useState(false);
  const [renameVisible, setRenameVisible] = useState(false);

  if (!space) {
    return (
      <Screen>
        <View style={[styles.header, { paddingHorizontal: r.pagePad }]}>
          <Pressable onPress={() => router.back()} hitSlop={8} accessibilityRole="button"
            style={({ pressed }) => [styles.backBtn, { transform: [{ scale: pressed ? 0.96 : 1 }] }]}>
            <Ionicons name="chevron-back" size={22} color={ICON_COLOR} />
          </Pressable>
        </View>
        <EmptyState icon="folder-open-outline" title="Space not found" subtitle="It may have been deleted." />
      </Screen>
    );
  }

  const count = counts[space.id] ?? 0;

  function confirmDeleteSpace() {
    if (!space) return;
    setSpaceMenuVisible(false);
    Alert.alert(`Delete "${space.name}"?`, 'Its links will move to Inbox.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => { deleteSpace(space.id); router.back(); } },
    ]);
  }

  function renderLinkMenu(linkId: string): MenuSheetOption[] {
    const link = links.find((l) => l.id === linkId);
    const isPinned = link?.isPinned ?? false;
    return [
      { label: isPinned ? 'Unpin' : 'Pin to Top', icon: 'pin-outline', onPress: () => pinLink(linkId, !isPinned) },
      { label: 'Move to Space…', icon: 'folder-open-outline', onPress: () => AlertMoveTarget(linkId) },
      { label: 'Edit', icon: 'create-outline', onPress: () => router.push(`/link-preview/${linkId}`) },
      { label: 'Delete', icon: 'trash-outline', danger: true, onPress: () => { deleteLink(linkId); } },
    ];
  }

  function AlertMoveTarget(linkId: string) {
    Alert.alert('Move to Space', undefined, [
      ...allSpaces.map((s) => ({ text: s.name, onPress: () => moveLink(linkId, s.id) })),
      { text: 'Inbox', onPress: () => moveLink(linkId, null) },
      { text: 'Cancel', style: 'cancel' as const },
    ]);
  }

  return (
    <Screen>
      <View style={[styles.header, { paddingHorizontal: r.pagePad }]}>
        <Pressable onPress={() => router.back()} hitSlop={8} accessibilityRole="button"
          style={({ pressed }) => [styles.backBtn, { transform: [{ scale: pressed ? 0.96 : 1 }] }]}>
          <Ionicons name="chevron-back" size={22} color={ICON_COLOR} />
        </Pressable>
        <View style={styles.headerCenter}>
          <View style={[styles.spaceIcon, { backgroundColor: `${space.color}1A` }]}>
            <Ionicons name={space.icon as keyof typeof Ionicons.glyphMap} size={16} color={space.color} />
          </View>
          <Text numberOfLines={1} style={[styles.headerTitle, { color: palette.textPrimary }]}>
            {space.name}
          </Text>
        </View>
        <Pressable onPress={() => setSpaceMenuVisible(true)} hitSlop={8} accessibilityRole="button"
          style={({ pressed }) => [styles.moreBtn, { transform: [{ scale: pressed ? 0.96 : 1 }] }]}>
          <Ionicons name="ellipsis-vertical" size={20} color={ICON_COLOR} />
        </Pressable>
      </View>

      <View style={styles.meta}>
        <Text style={[styles.metaText, { color: palette.textTertiary }]}>
          {count} link{count === 1 ? '' : 's'}  ·  {timeAgo(space.createdAt)}
        </Text>
      </View>

      <FlatList
        data={links}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[styles.list, { paddingHorizontal: r.pagePad }]}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <LinkCard link={item} onPress={() => router.push(`/link-preview/${item.id}`)} actions={renderLinkMenu(item.id)} />
        )}
        ListEmptyComponent={
          <EmptyState
            icon="link-outline"
            title="No links here yet"
            subtitle="Save a link into this Space to start building it."
            actionLabel="Add Link"
            onAction={() => router.push({ pathname: '/add-link', params: { spaceId: space.id } })}
          />
        }
      />

      <AddLinkFab onPress={() => router.push({ pathname: '/add-link', params: { spaceId: space.id } })} />

      <MenuSheet
        visible={spaceMenuVisible}
        title={space.name}
        options={[
          { label: 'Rename', icon: 'create-outline', onPress: () => { setSpaceMenuVisible(false); setRenameVisible(true); } },
          { label: 'Delete Space', icon: 'trash-outline', danger: true, onPress: confirmDeleteSpace },
        ]}
        onClose={() => setSpaceMenuVisible(false)}
      />

      <PromptModal
        visible={renameVisible}
        title={`Rename "${space.name}"`}
        initialValue={space.name}
        placeholder="Space name"
        onSubmit={(name) => updateSpace(space.id, { name })}
        onClose={() => setRenameVisible(false)}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: SURFACE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  moreBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: SURFACE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  spaceIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  meta: {
    alignItems: 'center',
    paddingBottom: 14,
  },
  metaText: {
    fontSize: 13,
  },
  list: {
    paddingBottom: 180,
    gap: 10,
  },
});