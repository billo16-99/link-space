import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useResponsive } from '../hooks/useResponsive';

const BG = '#F4F4F5';
const ICON_BG = '#000000';
const TEXT_COLOR = '#000000';
const ICON_COLOR = '#FFFFFF';

interface AddLinkFabProps {
  onPress?: () => void;
}

export function AddLinkFab({ onPress }: AddLinkFabProps) {
  const insets = useSafeAreaInsets();
  const r = useResponsive();

  const fabW = r.width < 360 ? 140 : r.width < 412 ? 160 : 180;
  const fabH = r.width < 360 ? 44 : r.width < 412 ? 48 : 52;
  const iconCircle = Math.round(fabH * 0.6);
  const plusSize = r.width < 360 ? 16 : 18;
  const fontSize = r.width < 360 ? 14 : 15;

  return (
    <View
      pointerEvents="box-none"
      style={[styles.wrap, { bottom: 20 + insets.bottom }]}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Add Link"
        onPress={onPress}
        style={({ pressed }) => [
          styles.fab,
          {
            width: fabW,
            height: fabH,
            borderRadius: fabH / 2,
            transform: [{ scale: pressed ? 0.97 : 1 }],
          },
        ]}
      >
        <View style={[styles.iconContainer, { width: iconCircle, height: iconCircle, borderRadius: iconCircle / 2 }]}>
          <Ionicons name="add" size={plusSize} color={ICON_COLOR} />
        </View>
        <Text style={[styles.label, { fontSize }]}>Add Link</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  fab: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
    backgroundColor: BG,
    shadowColor: '#000',
    shadowOpacity: 0.22,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  iconContainer: {
    backgroundColor: ICON_BG,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontWeight: '600',
    color: TEXT_COLOR,
    letterSpacing: -0.2,
  },
});