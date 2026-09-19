import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Screen } from '../src/components/Screen';
import { useTheme } from '../src/theme/ThemeContext';
import { useResponsive } from '../src/hooks/useResponsive';
import { useSpaces } from '../src/hooks/useSpaces';
import type { AppearanceMode } from '../src/types';
import type { OpenWith } from '../src/lib/settings';
import {
  getDefaultSpace, setDefaultSpace,
  getShowThumbnail, setShowThumbnail,
  getShowTitle, setShowTitle,
  getShowDescription, setShowDescription,
  getOpenWith, setOpenWith,
  getReduceAnimations, setReduceAnimations,
  getLinkReceived, setLinkReceived,
  getAppLock, setAppLock,
} from '../src/lib/settings';

const MODES: { key: AppearanceMode; label: string }[] = [
  { key: 'dark', label: 'Dark' },
  { key: 'light', label: 'Light' },
  { key: 'system', label: 'System' },
];

export default function SettingsScreen() {
  const { palette, mode, setMode } = useTheme();
  const r = useResponsive();
  const insets = useSafeAreaInsets();
  const spaces = useSpaces();

  const [defaultSpaceId, setDefaultSpaceState] = useState<string | null>(getDefaultSpace);
  const [showThumbnail, setShowThumbnailState] = useState(getShowThumbnail);
  const [showTitle, setShowTitleState] = useState(getShowTitle);
  const [showDescription, setShowDescriptionState] = useState(getShowDescription);
  const [openWith, setOpenWithState] = useState<OpenWith>(getOpenWith);
  const [reduceAnims, setReduceAnimsState] = useState(getReduceAnimations);
  const [linkReceived, setLinkReceivedState] = useState(getLinkReceived);
  const [appLock, setAppLockState] = useState(getAppLock);

  function handleDefaultSpace() {
    const options = [{ text: 'None (Inbox)', onPress: () => { setDefaultSpace(null); setDefaultSpaceState(null); } }];
    spaces.forEach((s) => {
      options.push({ text: s.name, onPress: () => { setDefaultSpace(s.id); setDefaultSpaceState(s.id); } });
    });
    Alert.alert('Default Space', 'Where new links are saved by default', options);
  }

  const currentSpaceName = spaces.find((s) => s.id === defaultSpaceId)?.name ?? 'Inbox';

  return (
    <Screen>
      <View style={[styles.header, { paddingHorizontal: r.pagePad, paddingTop: insets.top + 8 }]}>
        <Pressable onPress={() => router.back()} hitSlop={8}
          style={({ pressed }) => [styles.backBtn, { backgroundColor: palette.surface, opacity: pressed ? 0.6 : 1 }]}>
          <Ionicons name="chevron-back" size={22} color={palette.textPrimary} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: palette.textPrimary }]}>Settings</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={[styles.body, { paddingHorizontal: r.pagePad }]} showsVerticalScrollIndicator={false}>

        {/* LINK SPACE */}
        <Text style={[styles.sectionLabel, { color: palette.textTertiary }]}>LINK SPACE</Text>
        <View style={[styles.group, { backgroundColor: palette.surface }]}>
          <Pressable onPress={handleDefaultSpace} style={styles.row}>
            <Ionicons name="folder-outline" size={20} color={palette.textSecondary} />
            <Text style={[styles.rowLabel, { color: palette.textPrimary }]}>Default Space</Text>
            <Text style={[styles.rowValue, { color: palette.textTertiary }]}>{currentSpaceName}</Text>
            <Ionicons name="chevron-forward" size={16} color={palette.textTertiary} />
          </Pressable>
          <View style={[styles.rowBorder, { borderTopColor: palette.border }]} />
          <Pressable onPress={() => router.push('/create-space')} style={styles.row}>
            <Ionicons name="albums-outline" size={20} color={palette.textSecondary} />
            <Text style={[styles.rowLabel, { color: palette.textPrimary }]}>Manage Spaces</Text>
            <Ionicons name="chevron-forward" size={16} color={palette.textTertiary} />
          </Pressable>
          <View style={[styles.rowBorder, { borderTopColor: palette.border }]} />
          <View style={styles.row}>
            <Ionicons name="image-outline" size={20} color={palette.textSecondary} />
            <Text style={[styles.rowLabel, { color: palette.textPrimary }]}>Show Thumbnail</Text>
            <Switch
              value={showThumbnail}
              onValueChange={(v) => { setShowThumbnailState(v); setShowThumbnail(v); }}
              trackColor={{ false: palette.surfaceRaised, true: palette.accent }}
              thumbColor="#FFFFFF"
            />
          </View>
          <View style={[styles.rowBorder, { borderTopColor: palette.border }]} />
          <View style={styles.row}>
            <Ionicons name="text-outline" size={20} color={palette.textSecondary} />
            <Text style={[styles.rowLabel, { color: palette.textPrimary }]}>Show Title</Text>
            <Switch
              value={showTitle}
              onValueChange={(v) => { setShowTitleState(v); setShowTitle(v); }}
              trackColor={{ false: palette.surfaceRaised, true: palette.accent }}
              thumbColor="#FFFFFF"
            />
          </View>
          <View style={[styles.rowBorder, { borderTopColor: palette.border }]} />
          <View style={styles.row}>
            <Ionicons name="document-text-outline" size={20} color={palette.textSecondary} />
            <Text style={[styles.rowLabel, { color: palette.textPrimary }]}>Show Description</Text>
            <Switch
              value={showDescription}
              onValueChange={(v) => { setShowDescriptionState(v); setShowDescription(v); }}
              trackColor={{ false: palette.surfaceRaised, true: palette.accent }}
              thumbColor="#FFFFFF"
            />
          </View>
          <View style={[styles.rowBorder, { borderTopColor: palette.border }]} />
          <Pressable
            onPress={() => {
              Alert.alert('Open Links With', undefined, [
                { text: 'In-app Browser', onPress: () => { setOpenWithState('in-app'); setOpenWith('in-app'); } },
                { text: 'System Browser', onPress: () => { setOpenWithState('system'); setOpenWith('system'); } },
              ]);
            }}
            style={styles.row}
          >
            <Ionicons name="globe-outline" size={20} color={palette.textSecondary} />
            <Text style={[styles.rowLabel, { color: palette.textPrimary }]}>Open Links With</Text>
            <Text style={[styles.rowValue, { color: palette.textTertiary }]}>{openWith === 'in-app' ? 'In-app' : 'System'}</Text>
            <Ionicons name="chevron-forward" size={16} color={palette.textTertiary} />
          </Pressable>
        </View>

        {/* APPEARANCE */}
        <Text style={[styles.sectionLabel, { color: palette.textTertiary }]}>APPEARANCE</Text>
        <View style={[styles.group, { backgroundColor: palette.surface }]}>
          {MODES.map((m) => {
            const active = mode === m.key;
            return (
              <Pressable
                key={m.key}
                onPress={() => setMode(m.key)}
                style={styles.row}
              >
                <Ionicons name={m.key === 'dark' ? 'moon-outline' : m.key === 'light' ? 'sunny-outline' : 'phone-portrait-outline'} size={20} color={active ? palette.accent : palette.textSecondary} />
                <Text style={[styles.rowLabel, { color: palette.textPrimary }]}>{m.label}</Text>
                {active ? <Ionicons name="checkmark-circle" size={20} color={palette.accent} /> : null}
              </Pressable>
            );
          })}
          <View style={[styles.rowBorder, { borderTopColor: palette.border }]} />
          <View style={styles.row}>
            <Ionicons name="resize-outline" size={20} color={palette.textSecondary} />
            <Text style={[styles.rowLabel, { color: palette.textPrimary }]}>Reduce Animations</Text>
            <Switch
              value={reduceAnims}
              onValueChange={(v) => { setReduceAnimsState(v); setReduceAnimations(v); }}
              trackColor={{ false: palette.surfaceRaised, true: palette.accent }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        {/* NOTIFICATIONS */}
        <Text style={[styles.sectionLabel, { color: palette.textTertiary }]}>NOTIFICATIONS</Text>
        <View style={[styles.group, { backgroundColor: palette.surface }]}>
          <View style={styles.row}>
            <Ionicons name="notifications-outline" size={20} color={palette.textSecondary} />
            <Text style={[styles.rowLabel, { color: palette.textPrimary }]}>Link Received</Text>
            <Switch
              value={linkReceived}
              onValueChange={(v) => { setLinkReceivedState(v); setLinkReceived(v); }}
              trackColor={{ false: palette.surfaceRaised, true: palette.accent }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        {/* SECURITY */}
        <Text style={[styles.sectionLabel, { color: palette.textTertiary }]}>SECURITY</Text>
        <View style={[styles.group, { backgroundColor: palette.surface }]}>
          <View style={styles.row}>
            <Ionicons name="lock-closed-outline" size={20} color={palette.textSecondary} />
            <Text style={[styles.rowLabel, { color: palette.textPrimary }]}>App Lock / PIN</Text>
            <Switch
              value={appLock}
              onValueChange={(v) => { setAppLockState(v); setAppLock(v); }}
              trackColor={{ false: palette.surfaceRaised, true: palette.accent }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        {/* DATA */}
        <Text style={[styles.sectionLabel, { color: palette.textTertiary }]}>DATA</Text>
        <View style={[styles.group, { backgroundColor: palette.surface }]}>
          <View style={styles.row}>
            <Ionicons name="cloud-offline-outline" size={20} color={palette.textSecondary} />
            <Text style={[styles.rowLabel, { color: palette.textPrimary }]}>Storage</Text>
            <Text style={[styles.rowValue, { color: palette.textTertiary }]}>On this device</Text>
          </View>
          <View style={[styles.rowBorder, { borderTopColor: palette.border }]} />
          <Pressable onPress={() => Alert.alert('Export', 'Export feature coming soon')} style={styles.row}>
            <Ionicons name="download-outline" size={20} color={palette.textSecondary} />
            <Text style={[styles.rowLabel, { color: palette.textPrimary }]}>Export Links</Text>
            <Ionicons name="chevron-forward" size={16} color={palette.textTertiary} />
          </Pressable>
          <View style={[styles.rowBorder, { borderTopColor: palette.border }]} />
          <Pressable onPress={() => Alert.alert('Cache cleared')} style={styles.row}>
            <Ionicons name="trash-outline" size={20} color={palette.textSecondary} />
            <Text style={[styles.rowLabel, { color: palette.textPrimary }]}>Clear Cache</Text>
            <Ionicons name="chevron-forward" size={16} color={palette.textTertiary} />
          </Pressable>
        </View>

        {/* ABOUT */}
        <Text style={[styles.sectionLabel, { color: palette.textTertiary }]}>ABOUT</Text>
        <View style={[styles.group, { backgroundColor: palette.surface }]}>
          <Pressable onPress={() => Alert.alert('Help & Support')} style={styles.row}>
            <Ionicons name="help-circle-outline" size={20} color={palette.textSecondary} />
            <Text style={[styles.rowLabel, { color: palette.textPrimary }]}>Help & Support</Text>
            <Ionicons name="chevron-forward" size={16} color={palette.textTertiary} />
          </Pressable>
          <View style={[styles.rowBorder, { borderTopColor: palette.border }]} />
          <Pressable onPress={() => Alert.alert('Privacy Policy')} style={styles.row}>
            <Ionicons name="shield-checkmark-outline" size={20} color={palette.textSecondary} />
            <Text style={[styles.rowLabel, { color: palette.textPrimary }]}>Privacy</Text>
            <Ionicons name="chevron-forward" size={16} color={palette.textTertiary} />
          </Pressable>
          <View style={[styles.rowBorder, { borderTopColor: palette.border }]} />
          <Pressable onPress={() => Alert.alert('Terms of Service')} style={styles.row}>
            <Ionicons name="document-outline" size={20} color={palette.textSecondary} />
            <Text style={[styles.rowLabel, { color: palette.textPrimary }]}>Terms</Text>
            <Ionicons name="chevron-forward" size={16} color={palette.textTertiary} />
          </Pressable>
          <View style={[styles.rowBorder, { borderTopColor: palette.border }]} />
          <View style={styles.row}>
            <Ionicons name="information-circle-outline" size={20} color={palette.textSecondary} />
            <Text style={[styles.rowLabel, { color: palette.textPrimary }]}>Version</Text>
            <Text style={[styles.rowValue, { color: palette.textTertiary }]}>1.0.0</Text>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 12,
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
    fontSize: 17,
    fontWeight: '600',
  },
  headerSpacer: { width: 40 },
  body: {
    paddingBottom: 40,
    gap: 8,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: 4,
    marginTop: 8,
  },
  group: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
  },
  rowBorder: {
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  rowLabel: {
    flex: 1,
    fontSize: 15,
  },
  rowValue: {
    fontSize: 13,
  },
});
