import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { type } from '../theme/tokens';
import { formatCount } from '../lib/format';
import { categoryAccent, categoryFor } from './spaceCategories';
import { SpaceCategoryPill } from './SpaceCategoryPill';
import { SpacePreviewRow } from './SpacePreviewRow';
import { SpaceMoreButton } from './SpaceMoreButton';
import { useResponsive } from '../hooks/useResponsive';
import type { Space } from '../types';
import type { LinkPreview } from '../repositories/links';

interface SpaceCardProps {
  space: Space;
  count: number;
  previews: LinkPreview[];
  onPress?: () => void;
  onMenu?: () => void;
  onAddLink?: () => void;
}

export function SpaceCard({
  space,
  count,
  previews,
  onPress,
  onMenu,
  onAddLink,
}: SpaceCardProps) {
  const { palette } = useTheme();
  const r = useResponsive();
  const category = categoryFor(space.id);
  const accent = category ? categoryAccent(category, space.color) : space.color;

  const cardHeight = r.width < 360 ? 170 : r.width < 412 ? 185 : 200;
  const pad = r.width < 360 ? 14 : r.width < 412 ? 16 : 18;

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        {
          height: cardHeight,
          borderRadius: r.width < 360 ? 16 : 18,
          padding: pad,
          backgroundColor: palette.surface,
          transform: [{ scale: pressed ? 0.98 : 1 }],
        },
      ]}
    >
      {/* Top row: category pill left, three-dot menu right */}
      <View style={styles.topRow}>
        {category ? (
          <SpaceCategoryPill
            label={category}
            accent={accent}
            height={r.width < 360 ? 30 : 34}
            dotSize={r.width < 360 ? 5 : 6}
            fontSize={11}
          />
        ) : (
          <View style={styles.placeholder} />
        )}
        <SpaceMoreButton onPress={onMenu} iconSize={r.width < 360 ? 14 : 16} />
      </View>

      {/* Preview icons row — overlapping */}
      <View style={styles.previewWrap}>
        <SpacePreviewRow
          previews={previews}
          count={count}
          accent={accent}
          iconName={space.icon}
          iconColor={accent}
          tileSize={r.width < 360 ? 32 : 36}
          overlap={6}
        />
      </View>

      {/* Title and link count */}
      <View style={styles.info}>
        <Text style={[styles.title, { color: palette.textPrimary }]} numberOfLines={1}>
          {space.name}
        </Text>
        <Text style={[styles.count, { color: palette.textSecondary }]}>
          {formatCount(count)} link{count === 1 ? '' : 's'}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    overflow: 'hidden',
    justifyContent: 'space-between',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  placeholder: {
    width: 1,
    height: 30,
  },
  previewWrap: {},
  info: {
    gap: 2,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: -0.3,
  },
  count: {
    fontSize: 13,
    fontWeight: '400',
  },
});