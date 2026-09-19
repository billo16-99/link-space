import { useEffect, useRef } from 'react';
import { Animated, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { useResponsive } from '../hooks/useResponsive';
import { brandFor } from '../lib/brand';
import { getDomain } from '../lib/url';
import type { Link } from '../types';

const FALLBACK_IMAGES = [
  require('../../assets/images/sunflower-robot.png'),
  require('../../assets/images/fantom-logo.png'),
];

const SURFACE = '#111113';
const SURFACE_ELEVATED = '#1A1A1E';
const BORDER = 'rgba(40,42,49,0.70)';
const TEXT_PRIMARY = '#F4F4F5';
const TEXT_SECONDARY = '#92959F';
const ICON_COLOR = '#F4F4F5';

interface DynamicIslandProps {
  expanded: boolean;
  onToggle: () => void;
  links: Link[];
  onLinkPress?: (link: Link) => void;
  onClose?: () => void;
}

export function DynamicIsland({ expanded, onToggle, links, onLinkPress, onClose }: DynamicIslandProps) {
  const { palette } = useTheme();
  const r = useResponsive();
  const animWidth = useRef(new Animated.Value(0)).current;
  const animHeight = useRef(new Animated.Value(0)).current;
  const animRadius = useRef(new Animated.Value(25)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;
  const isExpandedRef = useRef(false);

  const pillW = r.width < 360 ? 150 : r.width < 412 ? 170 : 190;
  const pillH = r.width < 360 ? 42 : r.width < 412 ? 46 : 50;
  const expandedW = r.width - 48;
  const expandedH = 340;

  useEffect(() => {
    if (expanded && !isExpandedRef.current) {
      isExpandedRef.current = true;
      Animated.parallel([
        Animated.spring(animWidth, {
          toValue: expandedW,
          useNativeDriver: false,
          tension: 65,
          friction: 10,
        }),
        Animated.spring(animHeight, {
          toValue: expandedH,
          useNativeDriver: false,
          tension: 65,
          friction: 10,
        }),
        Animated.spring(animRadius, {
          toValue: 24,
          useNativeDriver: false,
          tension: 65,
          friction: 10,
        }),
      ]).start(() => {
        Animated.timing(contentOpacity, {
          toValue: 1,
          duration: 180,
          useNativeDriver: true,
        }).start();
      });
    } else if (!expanded && isExpandedRef.current) {
      isExpandedRef.current = false;
      Animated.parallel([
        Animated.timing(contentOpacity, {
          toValue: 0,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.spring(animWidth, {
          toValue: pillW,
          useNativeDriver: false,
          tension: 65,
          friction: 10,
        }),
        Animated.spring(animHeight, {
          toValue: pillH,
          useNativeDriver: false,
          tension: 65,
          friction: 10,
        }),
        Animated.spring(animRadius, {
          toValue: pillH / 2,
          useNativeDriver: false,
          tension: 65,
          friction: 10,
        }),
      ]).start();
    }
  }, [expanded]);

  // Initialize size on mount
  useEffect(() => {
    animWidth.setValue(pillW);
    animHeight.setValue(pillH);
    animRadius.setValue(pillH / 2);
  }, []);

  const containerStyle = {
    width: animWidth,
    height: animHeight,
    borderRadius: animRadius,
  };

  return (
    <Animated.View
      style={[
        styles.container,
        containerStyle,
        {
          backgroundColor: expanded ? SURFACE_ELEVATED : SURFACE,
        },
      ]}
    >
      {/* Pill — always visible */}
      <Pressable
        onPress={onToggle}
        style={({ pressed }) => [
          styles.pill,
          {
            height: pillH,
            opacity: pressed ? 0.8 : 1,
          },
        ]}
      >
        <Ionicons name="link" size={r.width < 360 ? 18 : 20} color={ICON_COLOR} />
        <Text style={[styles.pillText, { fontSize: r.width < 360 ? 15 : 16 }]}>Pinned Link</Text>
        <Animated.View style={{ opacity: contentOpacity }}>
          <Ionicons name="chevron-up" size={16} color={TEXT_SECONDARY} />
        </Animated.View>
      </Pressable>

      {/* Expanded content */}
      <Animated.View style={[styles.expandedContent, { opacity: contentOpacity }]}>
        <View style={[styles.divider, { backgroundColor: BORDER }]} />

        <ScrollView
          style={styles.list}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled
        >
          {links.map((link, index) => (
            <PinnedLinkRow
              key={link.id}
              link={link}
              isLast={index === links.length - 1}
              onPress={() => onLinkPress?.(link)}
            />
          ))}
          {links.length === 0 ? (
            <View style={styles.empty}>
              <Ionicons name="pin-outline" size={28} color={TEXT_SECONDARY} />
              <Text style={[styles.emptyText, { color: TEXT_SECONDARY }]}>No pinned links yet</Text>
            </View>
          ) : null}
        </ScrollView>
      </Animated.View>
    </Animated.View>
  );
}

function PinnedLinkRow({ link, isLast, onPress }: { link: Link; isLast: boolean; onPress: () => void }) {
  const { palette } = useTheme();
  const brand = brandFor(link.url);
  const domain = link.domain || getDomain(link.url);
  const hasImage = link.thumbnail?.startsWith('http') || link.favicon?.startsWith('http');
  const fallbackImage = FALLBACK_IMAGES[Math.abs(link.id.charCodeAt(0)) % FALLBACK_IMAGES.length];

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.linkRow,
        !isLast && { borderBottomWidth: 1, borderBottomColor: BORDER },
        { opacity: pressed ? 0.6 : 1 },
      ]}
    >
      {/* Image preview — like SpaceCard preview tiles */}
      <View style={[styles.linkIcon, { backgroundColor: brand?.bg ?? '#1A1A1E' }]}>
        {hasImage ? (
          <Image source={{ uri: (link.thumbnail || link.favicon) ?? undefined }} style={styles.linkImage} />
        ) : brand ? (
          <Text style={[styles.linkLabel, { color: brand.fg }]}>{brand.label}</Text>
        ) : (
          <Image source={fallbackImage} style={styles.linkImage} />
        )}
      </View>

      {/* Info — title + domain */}
      <View style={styles.linkInfo}>
        <Text style={[styles.linkTitle, { color: TEXT_PRIMARY }]} numberOfLines={1}>
          {link.title || domain}
        </Text>
        <Text style={[styles.linkDomain, { color: TEXT_SECONDARY }]} numberOfLines={1}>
          {domain}
        </Text>
      </View>

      {/* Pin indicator */}
      <Ionicons name="pin" size={14} color={palette.accent} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    overflow: 'hidden',
    zIndex: 200,
    elevation: 20,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 16,
  },
  pillText: {
    fontWeight: '600',
    color: TEXT_PRIMARY,
    letterSpacing: -0.2,
  },
  expandedContent: {
    flex: 1,
  },
  divider: {
    height: 1,
    marginHorizontal: 16,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingVertical: 4,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  linkIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  linkImage: {
    width: '100%',
    height: '100%',
  },
  linkLabel: {
    fontSize: 14,
    fontWeight: '700',
  },
  linkInfo: {
    flex: 1,
    gap: 3,
  },
  linkTitle: {
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  linkDomain: {
    fontSize: 13,
  },
  empty: {
    alignItems: 'center',
    gap: 8,
    paddingVertical: 28,
  },
  emptyText: {
    fontSize: 14,
  },
});