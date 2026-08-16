// app/_layout.js
import * as Notifications from 'expo-notifications';
import { Slot } from 'expo-router';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler'; // ✅ add this
import { PaperProvider } from 'react-native-paper';
import { ThemeProvider } from '../theme';

export default function Layout() {
  // Setup notification handling globally
  useEffect(() => {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });

    const sub1 = Notifications.addNotificationReceivedListener(notification => {
      console.log('📥 Notification received:', notification);
    });

    const sub2 = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('👉 Notification clicked:', response);
    });

    return () => {
      sub1.remove();
      sub2.remove();
    };
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        {(theme) => (
          <PaperProvider theme={theme}>
            <Slot />
          </PaperProvider>
        )}
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
