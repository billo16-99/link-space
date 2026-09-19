import { useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Screen } from '../src/components/Screen';
import { EmptyState } from '../src/components/EmptyState';
import { useTheme } from '../src/theme/ThemeContext';
import { useResponsive } from '../src/hooks/useResponsive';
import { useSearch } from '../src/hooks/useSpaces';
import { getRecentSearches, addRecentSearch, clearRecentSearches } from '../src/lib/recentSearches';
import { brandFor } from '../src/lib/brand';
import { getDomain } from '../src/lib/url';
import type { SearchFilter } from '../src/repositories/search';
import type { Link } from '../src/types';

const FILTERS: { key: SearchFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'spaces', label: 'Spaces' },
  { key: 'pinned', label: 'Pinned' },
  { key: 'recent', label: 'Recent' },
  { key: 'tags', label: 'Tags' },
];

function CompactLink({ link, onPress }: { link: Link; onPress: () => void }) {
  const { palette } = useTheme();
  const r = useResponsive();
  const brand = brandFor(link.url);
  const domain = link.domain || getDomain(link.url);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.compactRow, { opacity: pressed ? 0.6 : 1 }]}
    >
      <View style={[styles.compactIcon, { backgroundColor: brand?.bg ?? palette.surfaceRaised }]}>
        {brand ? (
          <Text style={{ color: brand.fg, fontSize: 13, fontWeight: '700' }}>{brand.label}</Text>
        ) : (
          <Ionicons name="globe-outline" size={16} color={palette.textTertiary} />
        )}
      </View>
      <View style={styles.compactInfo}>
        <Text style={[styles.compactTitle, { color: palette.textPrimary }]} numberOfLines={1}>
          {link.title || domain}
        </Text>
        <Text style={[styles.compactDomain, { color: palette.textTertiary }]} numberOfLines={1}>
          {domain}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={14} color={palette.textTertiary} />
    </Pressable>
  );
}

export default function SearchScreen() {
  const { palette } = useTheme();
  const r = useResponsive();
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<SearchFilter>('all');
  const [recentSearches, setRecentSearches] = useState(getRecentSearches());
  const { links, spaces } = useSearch(query, filter);

  useEffect(() => {
    if (query.trim().length > 0) {
      const timer = setTimeout(() => addRecentSearch(query), 800);
      return () => clearTimeout(timer);
    }
  }, [query]);

  function handleSubmit() {
    if (query.trim().length > 0) {
      addRecentSearch(query);
      setRecentSearches(getRecentSearches());
    }
  }

  return (
    <Screen>
      <View style={[styles.searchBar, { paddingHorizontal: r.pagePad, paddingTop: insets.top + 8 }]}>
        <View style={[styles.inputWrap, { backgroundColor: palette.surface }]}>
          <Ionicons name="search" size={16} color={palette.textTertiary} />
          <TextInput
            autoFocus
            value={query}
            onChangeText={setQuery}
            placeholder="Search links, spaces, tags..."
            placeholderTextColor={palette.textPlaceholder}
            style={[styles.input, { color: palette.textPrimary }]}
            autoCapitalize="none"
            returnKeyType="search"
            onSubmitEditing={handleSubmit}
            selectionColor="#27C76F"
          />
          {query.length > 0 ? (
            <Pressable onPress={() => setQuery('')} hitSlop={8}>
              <Ionicons name="close-circle" size={16} color={palette.textTertiary} />
            </Pressable>
          ) : null}
        </View>
        <Pressable onPress={() => router.back()} hitSlop={8} style={({ pressed }) => [{ opacity: pressed ? 0.5 : 1 }]}>
          <Text style={[styles.cancelText, { color: palette.accent }]}>Cancel</Text>
        </Pressable>
      </View>

      <View style={styles.filterScroll}>
        {FILTERS.map((f) => {
          const active = filter === f.key;
          return (
            <Pressable
              key={f.key}
              onPress={() => setFilter(f.key)}
              style={[
                styles.filterPill,
                {
                  backgroundColor: active ? palette.accent : palette.surface,
                },
              ]}
            >
              <Text style={[styles.filterText, { color: active ? '#FFFFFF' : palette.textSecondary }]}>
                {f.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {query.trim().length === 0 ? (
        <View style={[styles.recentSection, { paddingHorizontal: r.pagePad }]}>
          {recentSearches.length > 0 ? (
            <>
              <View style={styles.recentHeader}>
                <Text style={[styles.sectionTitle, { color: palette.textSecondary }]}>Recent</Text>
                <Pressable onPress={() => { clearRecentSearches(); setRecentSearches([]); }} hitSlop={8}>
                  <Text style={[styles.clearText, { color: palette.textTertiary }]}>Clear</Text>
                </Pressable>
              </View>
              {recentSearches.map((term) => (
                <Pressable
                  key={term}
                  onPress={() => setQuery(term)}
                  style={styles.recentRow}
                >
                  <Ionicons name="time-outline" size={16} color={palette.textTertiary} />
                  <Text style={[styles.recentTerm, { color: palette.textPrimary }]}>{term}</Text>
                  <Ionicons name="arrow-forward" size={14} color={palette.textTertiary} />
                </Pressable>
              ))}
            </>
          ) : (
            <EmptyState
              icon="search-outline"
              title="Search your links"
              subtitle="Find links, spaces, and tags."
            />
          )}
        </View>
      ) : (
        <FlatList
          data={links}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[styles.results, { paddingHorizontal: r.pagePad }]}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <CompactLink link={item} onPress={() => router.push(`/link-preview/${item.id}`)} />
          )}
          ListHeaderComponent={
            spaces.length > 0 ? (
              <View style={styles.spacesBlock}>
                <Text style={[styles.sectionTitle, { color: palette.textSecondary }]}>Spaces</Text>
                {spaces.map((space) => (
                  <Pressable
                    key={space.id}
                    onPress={() => router.push(`/space/${space.id}`)}
                    style={styles.spaceRow}
                  >
                    <View style={[styles.spaceDot, { backgroundColor: space.color }]} />
                    <Text style={[styles.spaceName, { color: palette.textPrimary }]}>{space.name}</Text>
                    <Ionicons name="chevron-forward" size={14} color={palette.textTertiary} />
                  </Pressable>
                ))}
              </View>
            ) : null
          }
          ListEmptyComponent={
            <EmptyState
              icon="search-outline"
              title="No matches"
              subtitle="Try different keywords."
            />
          }
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingBottom: 12,
  },
  inputWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    height: 44,
    paddingHorizontal: 14,
    borderRadius: 12,
  },
  input: {
    flex: 1,
    fontSize: 15,
  },
  cancelText: {
    fontSize: 15,
    fontWeight: '500',
  },
  filterScroll: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  filterPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  filterText: {
    fontSize: 13,
    fontWeight: '500',
  },
  recentSection: {
    flex: 1,
    gap: 4,
  },
  recentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 8,
  },
  clearText: {
    fontSize: 13,
    fontWeight: '500',
  },
  recentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
  },
  recentTerm: {
    flex: 1,
    fontSize: 15,
  },
  results: {
    paddingBottom: 40,
  },
  compactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
  },
  compactIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  compactInfo: {
    flex: 1,
    gap: 2,
  },
  compactTitle: {
    fontSize: 15,
    fontWeight: '500',
  },
  compactDomain: {
    fontSize: 12,
  },
  spacesBlock: {
    gap: 4,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingBottom: 8,
  },
  spaceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
  },
  spaceDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  spaceName: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
  },
});
