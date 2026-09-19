import { useMemo, useRef, useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Screen } from '../src/components/Screen';
import { DynamicIsland } from '../src/components/DynamicIsland';
import { SectionHeader } from '../src/components/SectionHeader';
import { SearchBar } from '../src/components/SearchBar';
import { QuickActions } from '../src/components/QuickActions';
import { SpaceCard } from '../src/components/SpaceCard';
import { LinkPreviewCard } from '../src/components/LinkPreviewCard';
import { AddLinkPanel } from '../src/components/AddLinkPanel';
import { Button } from '../src/components/Button';
import { PromptModal } from '../src/components/PromptModal';
import { useTheme } from '../src/theme/ThemeContext';
import { type } from '../src/theme/tokens';
import { useResponsive } from '../src/hooks/useResponsive';
import { useLooseLinks } from '../src/hooks/useLinks';
import {
  useDeleteSpace,
  usePinnedLinks,
  useReorderSpaces,
  useSpaceLinkCounts,
  useSpacePreviews,
  useSpaces,
  useUpdateSpace,
} from '../src/hooks/useSpaces';

export default function HomeScreen() {
  const { palette } = useTheme();
  const r = useResponsive();
  const insets = useSafeAreaInsets();
  const flatListRef = useRef<FlatList>(null);

  const spaces = useSpaces();
  const counts = useSpaceLinkCounts();
  const previews = useSpacePreviews();
  const looseLinks = useLooseLinks(10);
  const pinnedLinks = usePinnedLinks();
  const updateSpace = useUpdateSpace();
  const deleteSpace = useDeleteSpace();
  const reorder = useReorderSpaces();

  const [renameTarget, setRenameTarget] = useState<string | null>(null);
  const [pinnedExpanded, setPinnedExpanded] = useState(false);
  const [addLinkOpen, setAddLinkOpen] = useState(false);
  const [addLinkSpaceId, setAddLinkSpaceId] = useState<string | null>(null);
  const [quickAction, setQuickAction] = useState<string | null>(null);
  const renameSpace = renameTarget ? spaces.find((s) => s.id === renameTarget) : null;

  const sortedSpaces = useMemo(() => {
    return [...spaces].sort((a, b) => a.position - b.position);
  }, [spaces]);

  const hasSpaces = sortedSpaces.length > 0;

  function moveSpace(id: string, delta: number) {
    const idx = sortedSpaces.findIndex((s) => s.id === id);
    const target = idx + delta;
    if (idx === -1 || target < 0 || target >= sortedSpaces.length) return;
    const next = [...sortedSpaces];
    const [moved] = next.splice(idx, 1);
    next.splice(target, 0, moved);
    reorder(next.map((s) => s.id));
  }

  function confirmDeleteSpace(spaceId: string, name: string) {
    Alert.alert(`Delete "${name}"?`, 'Its links will move to Inbox.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteSpace(spaceId) },
    ]);
  }

  function openSpaceMenu(spaceId: string, name: string) {
    Alert.alert(name, undefined, [
      { text: 'Open', onPress: () => router.push(`/space/${spaceId}`) },
      { text: 'Rename', onPress: () => setRenameTarget(spaceId) },
      { text: 'Add Link', onPress: () => { setAddLinkSpaceId(spaceId); setAddLinkOpen(true); } },
      { text: 'Move Up', onPress: () => moveSpace(spaceId, -1) },
      { text: 'Move Down', onPress: () => moveSpace(spaceId, 1) },
      { text: 'Delete', style: 'destructive', onPress: () => confirmDeleteSpace(spaceId, name) },
      { text: 'Cancel', style: 'cancel' },
    ]);
  }

  function handleQuickAction(key: string) {
    setQuickAction(key);
    switch (key) {
      case 'recent':
        router.push('/recent');
        break;
      case 'spaces':
        flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
        break;
      case 'add':
        setAddLinkOpen(true);
        break;
    }
    setTimeout(() => setQuickAction(null), 300);
  }

  const settingsSize = r.width < 360 ? 40 : r.width < 412 ? 44 : 48;
  const settingsIconSize = r.width < 360 ? 20 : r.width < 412 ? 22 : 24;
  const avatarSize = r.width < 360 ? 40 : r.width < 412 ? 44 : 48;

  const fixedHeaderTop = insets.top + 64;
  const fixedHeaderHeight = r.searchHeight + 8 + 36 + 8;

  return (
    <Screen>
      {/* Fixed Header — SearchBar + QuickActions */}
      <View
        style={[
          styles.fixedHeader,
          {
            top: fixedHeaderTop,
            height: fixedHeaderHeight,
            paddingHorizontal: r.pagePad,
            backgroundColor: palette.background,
          },
        ]}
        pointerEvents="box-none"
      >
        <SearchBar onPress={() => router.navigate('/search')} />
        <QuickActions active={quickAction} onSelect={handleQuickAction} />
      </View>

      {/* FlatList — scrolls under the fixed header */}
      <FlatList
        ref={flatListRef}
        data={sortedSpaces}
        keyExtractor={(item) => item.id}
        numColumns={r.columns}
        columnWrapperStyle={r.columns > 1 ? [styles.gridRow, { columnGap: r.columnGap }] : undefined}
        contentContainerStyle={[styles.gridContent, { paddingHorizontal: r.pagePad, rowGap: r.rowGap, paddingTop: fixedHeaderTop + fixedHeaderHeight }]}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => (
          <View style={[styles.separator, { backgroundColor: palette.border, marginHorizontal: r.pagePad }]} />
        )}
        ListHeaderComponent={
          <SectionHeader
            title="Saved Link Spaces"
            subtitle="Your links, grouped. Access them anytime."
            titleSize={r.sectionTitleSize}
          />
        }
        renderItem={({ item }) => (
          <SpaceCard
            space={item}
            count={counts[item.id] ?? 0}
            previews={previews[item.id] ?? []}
            onPress={() => router.push(`/space/${item.id}`)}
            onMenu={() => openSpaceMenu(item.id, item.name)}
            onAddLink={() => { setAddLinkSpaceId(item.id); setAddLinkOpen(true); }}
          />
        )}
        ListEmptyComponent={hasSpaces ? null : <EmptySpaces />}
        ListFooterComponent={looseLinks.length > 0 ? (
          <View style={[styles.looseSection, { marginTop: 32 }]}>
            <SectionHeader
              title="Recent Links"
              subtitle="Links not in any Space yet."
              titleSize={r.sectionTitleSize}
            />
            <View style={styles.looseList}>
              {looseLinks.map((link) => (
                <LinkPreviewCard
                  key={link.id}
                  link={link}
                  onPress={() => router.push(`/link-preview/${link.id}`)}
                />
              ))}
            </View>
          </View>
        ) : null}
      />

      {/* Dynamic Island — floats on top of everything */}
      <View style={[styles.islandWrap, { top: 0, height: insets.top + 64, backgroundColor: palette.background }]} pointerEvents="box-none">
        {/* Settings — fixed far left */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Settings"
          onPress={() => router.navigate('/settings')}
          style={({ pressed }) => [
            styles.settingsBtn,
            {
              width: settingsSize,
              height: settingsSize,
              borderRadius: settingsSize / 2,
              top: insets.top + 8,
              backgroundColor: palette.surface,
              transform: [{ scale: pressed ? 0.96 : 1 }],
            },
          ]}
        >
          <Ionicons name="settings-outline" size={settingsIconSize} color={palette.textPrimary} />
        </Pressable>

        {/* Centered wrapper — pill expands from here */}
        <View style={[styles.islandCenter, { top: insets.top + 8 }]}>
          <DynamicIsland
            expanded={pinnedExpanded}
            onToggle={() => setPinnedExpanded(!pinnedExpanded)}
            links={pinnedLinks}
            onLinkPress={(link) => {
              setPinnedExpanded(false);
              router.push(`/link-preview/${link.id}`);
            }}
            onClose={() => setPinnedExpanded(false)}
          />
        </View>

        {/* Profile — fixed far right */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Profile"
          onPress={() => router.navigate('/profile')}
          style={({ pressed }) => [
            styles.avatarBtn,
            {
              width: avatarSize,
              height: avatarSize,
              borderRadius: avatarSize / 2,
              top: insets.top + 8,
              backgroundColor: palette.surface,
              transform: [{ scale: pressed ? 0.96 : 1 }],
            },
          ]}
        >
          <Ionicons name="person" size={Math.round(avatarSize * 0.5)} color={palette.textPrimary} />
        </Pressable>
      </View>

      {/* Backdrop when expanded */}
      {pinnedExpanded ? (
        <Pressable style={styles.backdrop} onPress={() => setPinnedExpanded(false)} />
      ) : null}

      {hasSpaces ? (
        <AddLinkPanel
          expanded={addLinkOpen}
          onOpen={() => setAddLinkOpen(true)}
          onClose={() => { setAddLinkOpen(false); setAddLinkSpaceId(null); }}
          initialSpaceId={addLinkSpaceId}
        />
      ) : null}

      <PromptModal
        visible={renameTarget !== null}
        title={`Rename "${renameSpace?.name ?? ''}"`}
        initialValue={renameSpace?.name ?? ''}
        placeholder="Space name"
        onSubmit={(name) => {
          if (renameTarget) updateSpace(renameTarget, { name });
        }}
        onClose={() => setRenameTarget(null)}
      />
    </Screen>
  );
}

function EmptySpaces() {
  const { palette } = useTheme();
  const r = useResponsive();
  return (
    <View style={styles.empty}>
      <View style={[styles.emptyIcon, { backgroundColor: palette.surface }]}>
        <Ionicons name="folder-open-outline" size={r.iconSize + 10} color={palette.textTertiary} />
      </View>
      <Text style={[type.body, { color: palette.textPrimary, fontWeight: '600' }]}>
        No Link Spaces yet
      </Text>
      <Text style={[type.label, styles.emptyText, { color: palette.textSecondary }]}>
        Create a Space to start organizing your saved links.
      </Text>
      <Button label="Create Space" icon="add" onPress={() => router.navigate('/create-space')} />
    </View>
  );
}

const styles = StyleSheet.create({
  fixedHeader: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 80,
    gap: 8,
  },
  separator: {
    height: 1,
  },
  islandWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 100,
  },
  islandCenter: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    alignItems: 'center',
  },
  settingsBtn: {
    position: 'absolute',
    left: 12,
    top: 4,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 90,
  },
  avatarBtn: {
    position: 'absolute',
    right: 12,
    top: 4,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 90,
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 50,
  },
  gridContent: {
    paddingBottom: 180,
  },
  gridRow: {
    paddingHorizontal: 0,
  },
  empty: {
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingTop: 56,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  emptyText: {
    textAlign: 'center',
    marginBottom: 8,
  },
  looseSection: {
    gap: 12,
  },
  looseList: {
    gap: 10,
  },
});