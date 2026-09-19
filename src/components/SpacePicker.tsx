import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { radius, spacing, type } from '../theme/tokens';
import type { Space } from '../types';

interface SpacePickerProps {
  spaces: Space[];
  selectedId: string | null;
  onSelect: (spaceId: string | null) => void;
  showInbox?: boolean;
}

const INBOX_PLACEHOLDER_ID = '__inbox__';

export function SpacePicker({
  spaces,
  selectedId,
  onSelect,
  showInbox = true,
}: SpacePickerProps) {
  const { palette } = useTheme();

  const inboxSelected = selectedId === null;

  function select(spaceId: string | null) {
    onSelect(spaceId);
  }

  return (
    <View style={styles.container}>
      {showInbox ? (
        <Pressable
          onPress={() => select(null)}
          style={[
            styles.chip,
            {
              backgroundColor: inboxSelected ? palette.accent : palette.surfaceRaised,
            },
          ]}
        >
          <Ionicons
            name="file-tray-outline"
            size={16}
            color={inboxSelected ? '#FFFFFF' : palette.textPrimary}
          />
          <Text
            style={[
              type.label,
              { color: inboxSelected ? '#FFFFFF' : palette.textPrimary },
            ]}
          >
            Inbox
          </Text>
        </Pressable>
      ) : null}
      {spaces.map((space) => {
        const selected = space.id === selectedId;
        return (
          <Pressable
            key={space.id}
            onPress={() => select(space.id)}
            style={[
              styles.chip,
              {
              backgroundColor: selected ? space.color : palette.surfaceRaised,
            },
            ]}
          >
            <Ionicons name={space.icon as keyof typeof Ionicons.glyphMap} size={15} color={selected ? '#FFFFFF' : space.color} />
            <Text
              style={[
                type.label,
                { color: selected ? '#FFFFFF' : palette.textPrimary },
              ]}
            >
              {space.name}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
  },
});