import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { onAuthStateChanged } from 'firebase/auth';
import { useContext, useEffect, useState } from 'react';
import { Alert, Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { Switch } from 'react-native-paper';
import { GlassCard, GlassIconButton, ScreenBackground } from '../components/ui';
import { auth } from '../firebaseConfig';
import { glass, palette, radius, spacing, ThemeContext, typography } from '../theme';

export default function Settings() {
  const { themeMode, toggleTheme, tokens } = useContext(ThemeContext);
  const darkMode = tokens.isDark;
  const t = darkMode ? palette.dark : palette.light;
  const g = darkMode ? glass.dark : glass.light;
  const router = useRouter();
  const [email, setEmail] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, user => {
      setEmail(user?.email || null);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = () => {
    Alert.alert('Log out?', '', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log out',
        style: 'destructive',
        onPress: async () => {
          await auth.signOut();
          router.replace('/SignIn');
        },
      },
    ]);
  };

  return (
    <View style={{ flex: 1 }}>
      <ScreenBackground isDark={darkMode} ambient={tokens.ambient} />
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.topBar}>
          <GlassIconButton icon="chevron-back" isDark={darkMode} onPress={() => router.back()} />
          <Text style={[typography.h1, { color: t.text }]}>Settings</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={{ padding: spacing.lg }}>
          <GlassCard isDark={darkMode} style={styles.profileCard}>
            <View style={styles.profileRow}>
              <View style={styles.avatar}>
                <Ionicons name="person" size={22} color="#fff" />
              </View>
              <View style={{ marginLeft: spacing.sm, flex: 1 }}>
                <Text style={[typography.caption, { color: t.textFaint }]}>SIGNED IN AS</Text>
                <Text style={[typography.bodyStrong, { color: t.text }]} numberOfLines={1}>
                  {email || 'Loadingâ€¦'}
                </Text>
              </View>
            </View>
          </GlassCard>

          <Text style={[typography.caption, { color: t.textFaint, marginTop: spacing.lg, marginBottom: spacing.sm, marginLeft: 4 }]}>
            PREFERENCES
          </Text>
          <GlassCard isDark={darkMode} padded={false}>
            <View style={styles.row}>
              <View style={styles.rowLeft}>
                <Ionicons name={darkMode ? 'moon' : 'sunny-outline'} size={19} color={palette.primary} />
                <View style={{ marginLeft: spacing.sm }}>
                  <Text style={[typography.body, { color: t.text }]}>Dark mode</Text>
                  <Text style={{ color: t.textFaint, fontSize: 12 }}>Currently {themeMode}</Text>
                </View>
              </View>
              <Switch value={darkMode} onValueChange={toggleTheme} color={palette.primary} />
            </View>
          </GlassCard>

          <Text style={[typography.caption, { color: t.textFaint, marginTop: spacing.lg, marginBottom: spacing.sm, marginLeft: 4 }]}>
            ACCOUNT
          </Text>
          <GlassCard isDark={darkMode} padded={false}>
            <Pressable style={styles.row} onPress={handleLogout}>
              <View style={styles.rowLeft}>
                <Ionicons name="log-out-outline" size={19} color={palette.danger} />
                <Text style={[typography.body, { color: palette.danger, marginLeft: spacing.sm }]}>
                  Log out
                </Text>
              </View>
            </Pressable>
          </GlassCard>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  profileCard: {},
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: palette.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});