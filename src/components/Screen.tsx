import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';

interface ScreenProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}

export function Screen({ children, style }: ScreenProps) {
  const { palette } = useTheme();
  return (
    <SafeAreaView
      edges={['top', 'left', 'right', 'bottom']}
      style={[styles.screen, { backgroundColor: palette.background }, style]}
    >
      {children}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
});