import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../src/components/Screen';
import { LinkPreviewCard } from '../src/components/LinkPreviewCard';
import { EmptyState } from '../src/components/EmptyState';
import { useTheme } from '../src/theme/ThemeContext';
import { useResponsive } from '../src/hooks/useResponsive';
import { usePinnedLinks } from '../src/hooks/useSpaces';

export default function PinnedScreen() {
  const { palette } = useTheme();
  const r = useResponsive();
  const pinned = usePinnedLinks();

  return (
    <Screen>
      <View style={[styles.header, { paddingHorizontal: r.pagePad }]}>
        <Pressable onPress={() => router.back()} hitSlop={8} accessibilityRole="button"
          style={({ pressed }) => [styles.backBtn, { backgroundColor: palette.surface, transform: [{ scale: pressed ? 0.96 : 1 }] }]}>
          <Ionicons name="chevron-back" size={22} color={palette.textPrimary} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: palette.textPrimary }]}>Pinned</Text>
        <View style={styles.headerSpacer} />
      </View>

      <FlatList
        data={pinned}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[styles.list, { paddingHorizontal: r.pagePad }]}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <LinkPreviewCard
            link={item}
            onPress={() => router.push(`/link-preview/${item.id}`)}
          />
        )}
        ListEmptyComponent={
          <EmptyState
            icon="pin-outline"
            title="No pinned links"
            subtitle="Pin links from their menu to keep them handy."
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
