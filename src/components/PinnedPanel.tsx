import { useEffect, useRef } from 'react';
import { Animated, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { brandFor } from '../lib/brand';
import { getDomain } from '../lib/url';
import type { Link } from '../types';

const FALLBACK_IMAGES = [
  require('../../assets/images/sunflower-robot.png'),
  require('../../assets/images/fantom-logo.png'),
];

const PANEL_BG = '#111113';
const PANEL_BORDER = 'rgba(40,42,49,0.70)';
const TEXT_PRIMARY = '#F4F4F5';
const TEXT_SECONDARY = '#92959F';

interface PinnedPanelProps {
  visible: boolean;
  links: Link[];
  onLinkPress?: (link: Link) => void;
  onClose?: () => void;
}

export function PinnedPanel({ visible, links, onLinkPress, onClose }: PinnedPanelProps) {
  const { palette } = useTheme();
  const animHeight = useRef(new Animated.Value(0)).current;
  const animOpacity = useRef(new Animated.Value(0)).current;
  const isExpanded = useRef(false);

  useEffect(() => {
    if (visible && !isExpanded.current) {
      isExpanded.current = true;
      Animated.parallel([
        Animated.spring(animHeight, {
          toValue: 1,
          useNativeDriver: false,
          tension: 60,
          friction: 9,
        }),
        Animated.timing(animOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else if (!visible && isExpanded.current) {
      isExpanded.current = false;
      Animated.parallel([
        Animated.timing(animOpacity, {
          toValue: 0,
          duration: 120,
          useNativeDriver: true,
        }),
        Animated.timing(animHeight, {
          toValue: 0,
          duration: 200,
          useNativeDriver: false,
        }),
      ]).start();
    }
  }, [visible]);

  const panelHeight = animHeight.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 320],
  });

  return (
    <Animated.View
      style={[
        styles.wrapper,
        {
          maxHeight: panelHeight,
          opacity: animOpacity,
          overflow: 'hidden',
        },
      ]}
      pointerEvents={visible ? 'auto' : 'none'}
    >
      <View style={[styles.panel, { backgroundColor: PANEL_BG }]}>
        {/* Panel header */}
        <View style={styles.panelHeader}>
          <View style={styles.panelHeaderLeft}>
            <Ionicons name="link" size={16} color={palette.accent} />
            <Text style={[styles.panelTitle, { color: TEXT_PRIMARY }]}>Pinned Links</Text>
          </View>
          <Pressable onPress={onClose} hitSlop={8} style={styles.closeBtn}>
            <Ionicons name="chevron-up" size={16} color={TEXT_SECONDARY} />
          </Pressable>
        </View>

        <View style={[styles.divider, { backgroundColor: PANEL_BORDER }]} />

        {/* Links list */}
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
              <Text style={[styles.emptyText, { color: TEXT_SECONDARY }]}>
                No pinned links yet
              </Text>
            </View>
          ) : null}
        </ScrollView>
      </View>
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
        !isLast && styles.linkRowBorder,
        { borderColor: PANEL_BORDER },
        { opacity: pressed ? 0.6 : 1 },
      ]}
    >
      <View style={[styles.linkIcon, { backgroundColor: brand?.bg ?? '#1A1A1E' }]}>
        {hasImage ? (
          <Image source={{ uri: (link.thumbnail || link.favicon) ?? undefined }} style={styles.linkImage} />
        ) : brand ? (
          <Text style={[styles.linkLabel, { color: brand.fg }]}>{brand.label}</Text>
        ) : (
          <Image source={fallbackImage} style={styles.linkImage} />
        )}
      </View>

      <View style={styles.linkInfo}>
        <Text style={[styles.linkTitle, { color: TEXT_PRIMARY }]} numberOfLines={1}>
          {link.title || domain}
        </Text>
        <Text style={[styles.linkDomain, { color: TEXT_SECONDARY }]} numberOfLines={1}>
          {domain}
        </Text>
      </View>

      <Ionicons name="pin" size={12} color={palette.accent} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginHorizontal: 20,
    marginTop: 8,
  },
  panel: {
    borderRadius: 18,
  },
  panelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 10,
  },
  panelHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  panelTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  closeBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: {
    height: 1,
    marginHorizontal: 18,
  },
  list: {
    maxHeight: 260,
  },
  listContent: {
    paddingVertical: 4,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  linkRowBorder: {
    borderBottomWidth: 1,
  },
  linkIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  linkImage: {
    width: '100%',
    height: '100%',
  },
  linkLabel: {
    fontSize: 13,
    fontWeight: '700',
  },
  linkInfo: {
    flex: 1,
    gap: 2,
  },
  linkTitle: {
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  linkDomain: {
    fontSize: 12,
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