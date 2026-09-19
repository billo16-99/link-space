import { Pressable, StyleSheet, Text, View, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { brandFor } from '../lib/brand';
import { getDomain } from '../lib/url';
import { useResponsive } from '../hooks/useResponsive';
import type { Link } from '../types';

const FALLBACK_IMAGES = [
  require('../../assets/images/sunflower-robot.png'),
  require('../../assets/images/fantom-logo.png'),
];

interface LinkPreviewCardProps {
  link: Link;
  onPress?: () => void;
}

export function LinkPreviewCard({ link, onPress }: LinkPreviewCardProps) {
  const { palette } = useTheme();
  const r = useResponsive();
  const brand = brandFor(link.url);
  const domain = link.domain || getDomain(link.url);
  const hasImage = link.thumbnail?.startsWith('http') || link.favicon?.startsWith('http');
  const fallbackImage = FALLBACK_IMAGES[Math.abs(link.id.charCodeAt(0)) % FALLBACK_IMAGES.length];

  const cardH = r.width < 360 ? 120 : r.width < 412 ? 130 : 140;
  const imgSize = cardH - 24;
  const pad = r.width < 360 ? 12 : 14;

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        {
          height: cardH,
          borderRadius: r.width < 360 ? 14 : 16,
          padding: pad,
          backgroundColor: palette.surface,
          transform: [{ scale: pressed ? 0.98 : 1 }],
        },
      ]}
    >
      <View style={[styles.imageWrap, { width: imgSize, height: imgSize, borderRadius: r.width < 360 ? 10 : 12, backgroundColor: brand?.bg ?? palette.surfaceRaised }]}>
        {hasImage ? (
          <Image
            source={{ uri: (link.thumbnail || link.favicon) ?? undefined }}
            style={[styles.image, { borderRadius: r.width < 360 ? 10 : 12 }]}
          />
        ) : brand ? (
          <Text style={[styles.brandLabel, { color: brand.fg, fontSize: Math.round(imgSize * 0.5) }]}>
            {brand.label}
          </Text>
        ) : (
          <Image source={fallbackImage} style={[styles.image, { borderRadius: r.width < 360 ? 10 : 12 }]} />
        )}
      </View>

      <View style={styles.info}>
        <Text style={[styles.title, { color: palette.textPrimary }]} numberOfLines={2}>
          {link.title || domain}
        </Text>
        <Text style={[styles.domain, { color: palette.textSecondary }]} numberOfLines={1}>
          {domain}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  imageWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  brandLabel: {
    fontWeight: '700',
  },
  info: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  domain: {
    fontSize: 13,
    fontWeight: '400',
  },
});