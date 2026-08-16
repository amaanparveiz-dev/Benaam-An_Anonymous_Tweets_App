import { useRouter } from 'expo-router';
import { onAuthStateChanged } from 'firebase/auth';
import { useContext, useEffect, useState } from 'react';
import { View } from 'react-native';
import { Appbar, List, Switch, Text, useTheme } from 'react-native-paper';
import { auth } from '../firebaseConfig';
import { ThemeContext } from '../theme';

export default function Settings() {
  const { themeMode, toggleTheme } = useContext(ThemeContext);
  const { colors } = useTheme();
  const router = useRouter();
  const [email, setEmail] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, user => {
      setEmail(user?.email || null);
    });
    return () => unsubscribe();
  }, []);

  return (
    <>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Settings" />
      </Appbar.Header>

      <View style={{ padding: 20, flex: 1, backgroundColor: colors.background }}>
        <Text style={{ marginBottom: 20, fontSize: 16, color: colors.onBackground }}>
          Signed in as:{' '}
          <Text
            style={{
              fontWeight: 'bold',
              color: themeMode === 'dark' ? 'white' : 'black',
            }}
          >
            {email ? email : 'Loading...'}
          </Text>
        </Text>

        <List.Item
          title="Dark Mode"
          description={`Currently ${themeMode}`}
          right={() => (
            <Switch
              value={themeMode === 'dark'}
              onValueChange={toggleTheme}
            />
          )}
        />
      </View>
    </>
  );
}
