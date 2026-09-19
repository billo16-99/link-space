import { useEffect, useState } from 'react';
import { Stack, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider, useTheme } from '../src/theme/ThemeContext';
import { DataProvider } from '../src/db/DataProvider';
import { getOnboardingCompleted } from '../src/lib/settings';

function OnboardingGate() {
  const [checked, setChecked] = useState(false);
  const { palette, resolvedMode } = useTheme();

  useEffect(() => {
    const completed = getOnboardingCompleted();
    if (!completed) {
      router.replace('/onboarding/splash');
    }
    setChecked(true);
  }, []);

  if (!checked) return null;

  return (
    <>
      <StatusBar style={resolvedMode === 'dark' ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: palette.background },
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="search" />
        <Stack.Screen name="space/[id]" />
        <Stack.Screen name="edit-link/[id]" />
        <Stack.Screen name="link-preview/[id]" />
        <Stack.Screen name="pinned" />
        <Stack.Screen name="recent" />
        <Stack.Screen name="settings" />
        <Stack.Screen name="profile" />
        <Stack.Screen name="create-space" options={{ presentation: 'modal' }} />
        <Stack.Screen name="onboarding/splash" options={{ animation: 'fade' }} />
        <Stack.Screen name="onboarding/welcome" options={{ animation: 'fade' }} />
        <Stack.Screen name="onboarding/choose-spaces" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="onboarding/saving" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="onboarding/ready" options={{ animation: 'slide_from_right' }} />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <DataProvider>
          <OnboardingGate />
        </DataProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
