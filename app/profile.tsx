import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Screen } from '../src/components/Screen';
import { useTheme } from '../src/theme/ThemeContext';
import { useResponsive } from '../src/hooks/useResponsive';
import type { Palette } from '../src/theme/tokens';

interface MenuItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  subtitle?: string;
  onPress: () => void;
  palette: Palette;
}

function MenuItem({ icon, label, subtitle, onPress, palette }: MenuItemProps) {
  return (
    <Pressable onPress={onPress} style={styles.row}>
      <Ionicons name={icon} size={20} color={palette.textSecondary} />
      <View style={styles.menuContent}>
        <Text style={[styles.menuLabel, { color: palette.textPrimary }]}>{label}</Text>
        {subtitle ? <Text style={[styles.menuSubtitle, { color: palette.textTertiary }]}>{subtitle}</Text> : null}
      </View>
      <Ionicons name="chevron-forward" size={16} color={palette.textTertiary} />
    </Pressable>
  );
}

export default function ProfileScreen() {
  const { palette } = useTheme();
  const r = useResponsive();
  const insets = useSafeAreaInsets();
  return (
    <Screen>
      <View style={[styles.header, { paddingHorizontal: r.pagePad, paddingTop: insets.top + 8 }]}>
        <Pressable onPress={() => router.back()} hitSlop={8}
          style={({ pressed }) => [styles.backBtn, { backgroundColor: palette.surface, opacity: pressed ? 0.6 : 1 }]}>
          <Ionicons name="chevron-back" size={22} color={palette.textPrimary} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: palette.textPrimary }]}>Profile</Text>
        <View style={styles.headerSpacer} />
      </View>
      <ScrollView contentContainerStyle={[styles.body, { paddingHorizontal: r.pagePad }]} showsVerticalScrollIndicator={false}>
        <View style={styles.avatarSection}>
          <View style={[styles.avatar, { backgroundColor: palette.surfaceRaised }]}>
            <Ionicons name="person" size={48} color={palette.textTertiary} />
          </View>
          <Text style={[styles.name, { color: palette.textPrimary }]}>Local Profile</Text>
          <Text style={[styles.username, { color: palette.textTertiary }]}>No account required</Text>
        </View>
        <View style={[styles.group, { backgroundColor: palette.surface }]}>
          <MenuItem icon="create-outline" label="Edit Profile" onPress={() => {}} palette={palette} />
          <View style={[styles.rowBorder, { borderTopColor: palette.border }]} />
          <MenuItem icon="person-circle-outline" label="Account" subtitle="Local storage" onPress={() => {}} palette={palette} />
          <View style={[styles.rowBorder, { borderTopColor: palette.border }]} />
          <MenuItem icon="cloud-outline" label="Sync & Backup" subtitle="Coming soon" onPress={() => {}} palette={palette} />
          <View style={[styles.rowBorder, { borderTopColor: palette.border }]} />
          <MenuItem icon="lock-closed-outline" label="Security" onPress={() => router.push('/settings')} palette={palette} />
        </View>
        <View style={[styles.group, { backgroundColor: palette.surface }]}>
          <MenuItem icon="settings-outline" label="Settings" onPress={() => router.push('/settings')} palette={palette} />
          <View style={[styles.rowBorder, { borderTopColor: palette.border }]} />
          <MenuItem icon="help-circle-outline" label="Help & Support" onPress={() => {}} palette={palette} />
        </View>
        <View style={{ height: 40 }} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', paddingBottom: 12 },
  backBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 17, fontWeight: '600' },
  headerSpacer: { width: 40 },
  body: { paddingBottom: 40, gap: 16 },
  avatarSection: { alignItems: 'center', paddingVertical: 24, gap: 8 },
  avatar: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center' },
  name: { fontSize: 20, fontWeight: '700' },
  username: { fontSize: 14 },
  group: { borderRadius: 16, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16 },
  rowBorder: { borderTopWidth: StyleSheet.hairlineWidth },
  menuContent: { flex: 1 },
  menuLabel: { fontSize: 15 },
  menuSubtitle: { fontSize: 12, marginTop: 2 },
});
