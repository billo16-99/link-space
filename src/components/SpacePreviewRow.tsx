import { Image, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { useTheme } from '../theme/ThemeContext';
import { brandFor } from '../lib/brand';
import type { LinkPreview } from '../repositories/links';

const FALLBACK_IMAGES = [
  require('../../assets/images/sunflower-robot.png'),
  require('../../assets/images/fantom-logo.png'),
];

interface SpacePreviewRowProps {
  previews: LinkPreview[];
  count: number;
  accent: string;
  iconName: string;
  iconColor: string;
  tileSize?: number;
  overlap?: number;
}

const OVERFLOW_RATIO = 0.75;

export function SpacePreviewRow({
  previews,
  count,
  accent,
  iconName,
  iconColor,
  tileSize = 44,
  overlap = 0,
}: SpacePreviewRowProps) {
  const { palette } = useTheme();
  const [width, setWidth] = useState(0);

  const overflowW = Math.round(tileSize * OVERFLOW_RATIO);
  const gap = overlap > 0 ? -overlap : 6;
  const tileStep = tileSize + gap;

  const maxTiles =
    width > 0
      ? Math.max(1, Math.floor((width - overflowW) / tileStep))
      : 2;

  const tiles = previews.slice(0, maxTiles);
  const overflow = count - tiles.length;

  return (
    <View
      style={styles.row}
      onLayout={(event) => setWidth(event.nativeEvent.layout.width)}
    >
      {tiles.length === 0 ? (
        <View style={[styles.tile, { width: tileSize, height: tileSize, borderRadius: tileSize / 2, backgroundColor: palette.surfaceRaised }]}>
          <Ionicons
            name={iconName as keyof typeof Ionicons.glyphMap}
            size={Math.round(tileSize * 0.55)}
            color={iconColor}
          />
        </View>
      ) : (
        tiles.map((preview, index) => (
          <View key={index} style={index > 0 ? { marginLeft: gap } : undefined}>
            <PreviewTile preview={preview} tileSize={tileSize} index={index} />
          </View>
        ))
      )}

      {overflow > 0 ? (
        <View style={[styles.overflow, { marginLeft: gap, minWidth: overflowW, height: tileSize, borderRadius: tileSize / 2, backgroundColor: palette.surfaceRaised }]}>
          <Text style={[styles.overflowText, { color: palette.textSecondary, fontSize: Math.round(tileSize * 0.28) }]}>
            +{overflow}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

function PreviewTile({ preview, tileSize, index }: { preview: LinkPreview; tileSize: number; index?: number }) {
  const { palette } = useTheme();
  const brand = brandFor(preview.url);

  if (preview.favicon?.startsWith('http')) {
    return (
      <View style={[styles.tile, { width: tileSize, height: tileSize, borderRadius: tileSize / 2, backgroundColor: palette.surfaceRaised, overflow: 'hidden' }]}>
        <Image source={{ uri: preview.favicon }} style={{ width: tileSize, height: tileSize }} />
      </View>
    );
  }

  if (brand) {
    return (
      <View style={[styles.tile, { width: tileSize, height: tileSize, borderRadius: tileSize / 2, backgroundColor: brand.bg }]}>
        <Text style={[styles.brandLabel, { color: brand.fg, fontSize: Math.round(tileSize * 0.42) }]} numberOfLines={1}>
          {brand.label}
        </Text>
      </View>
    );
  }

  const fallbackImage = FALLBACK_IMAGES[(index ?? 0) % FALLBACK_IMAGES.length];
  return (
    <View style={[styles.tile, { width: tileSize, height: tileSize, borderRadius: tileSize / 2, backgroundColor: palette.surfaceRaised, overflow: 'hidden' }]}>
      <Image source={fallbackImage} style={{ width: tileSize, height: tileSize }} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tile: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  overflow: {
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  overflowText: {
    fontWeight: '600',
  },
  brandLabel: {
    fontWeight: '700',
  },
});