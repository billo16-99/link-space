import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../src/components/Screen';
import { LinkCard } from '../src/components/LinkCard';
import { EmptyState } from '../src/components/EmptyState';
import { useTheme } from '../src/theme/ThemeContext';
import { useResponsive } from '../src/hooks/useResponsive';
import { useRecentLinks, useSpaces } from '../src/hooks/useSpaces';
import { useDeleteLink, useMoveLink, usePinLink } from '../src/hooks/useLinks';

const SURFACE = '#111113';
const BORDER_LIGHT = 'rgba(40,42,49,0.70)';
const ICON_COLOR = '#F4F4F5';

export default function RecentScreen() {
  const { palette } = useTheme();
  const r = useResponsive();
  const recent = useRecentLinks(100);
  const spaces = useSpaces();
  const pinLink = usePinLink();
  const moveLink = useMoveLink();
  const deleteLink = useDeleteLink();

  return (
    <Screen>
      <View style={[styles.header, { paddingHorizontal: r.pagePad }]}>
        <Pressable onPress={() => router.back()} hitSlop={8} accessibilityRole="button"
          style={({ pressed }) => [styles.backBtn, { transform: [{ scale: pressed ? 0.96 : 1 }] }]}>
          <Ionicons name="chevron-back" size={22} color={ICON_COLOR} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: palette.textPrimary }]}>Recently Saved</Text>
        <View style={styles.headerSpacer} />
      </View>

      <FlatList
        data={recent}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[styles.list, { paddingHorizontal: r.pagePad }]}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <LinkCard
            link={item}
            onPress={() => router.push(`/link-preview/${item.id}`)}
            actions={[
              {
                label: item.isPinned ? 'Unpin' : 'Pin to Top',
                icon: 'pin-outline',
                onPress: () => pinLink(item.id, !item.isPinned),
              },
              ...spaces.map((s) => ({
                label: s.name,
                icon: s.icon as keyof typeof Ionicons.glyphMap,
                onPress: () => moveLink(item.id, s.id),
              })),
              { label: 'Inbox', icon: 'file-tray-outline', onPress: () => moveLink(item.id, null) },
              { label: 'Edit', icon: 'create-outline', onPress: () => router.push(`/link-preview/${item.id}`) },
              { label: 'Delete', icon: 'trash-outline', danger: true, onPress: () => deleteLink(item.id) },
            ]}
          />
        )}
        ListEmptyComponent={
          <EmptyState
            icon="time-outline"
            title="Nothing saved yet"
            subtitle="Links you save will show up here."
          />
        }
      />
    </Screen>
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
    borderWidth: 1,
    borderColor: BORDER_LIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '700',
  },
  headerSpacer: {
    width: 40,
  },
  list: {
    paddingBottom: 40,
    gap: 10,
  },
});