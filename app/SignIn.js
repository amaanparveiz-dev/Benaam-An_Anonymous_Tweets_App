import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  Text,
  View,
} from 'react-native';
import {
  BrandMark,
  GhostLink,
  GlassCard,
  PrimaryButton,
  ScreenBackground,
  TextField,
} from '../components/ui';
import { auth } from '../firebaseConfig';
import { palette, spacing, typography } from '../theme';

// Auth screens always use the dark, elegant ambient look â€” regardless of
// the in-app theme toggle â€” since there's no user session yet to read a
// preference from.
const IS_DARK = true;

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [hidePassword, setHidePassword] = useState(true);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const t = palette.dark;

  const handleSignIn = async () => {
    if (!email.trim() || !password) {
      Alert.alert('Missing info', 'Please enter your email and password.');
      return;
    }
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      router.replace('/');
    } catch (error) {
      if (error.code === 'auth/wrong-password') {
        Alert.alert('Error', 'Incorrect password.');
      } else if (error.code === 'auth/user-not-found') {
        Alert.alert('Error', 'User not found.');
      } else if (error.code === 'auth/invalid-email') {
        Alert.alert('Error', 'Invalid email address.');
      } else {
        Alert.alert('Error', 'Something went wrong.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <ScreenBackground isDark={IS_DARK} />
      <SafeAreaView style={{ flex: 1 }}>
        <StatusBar style="light" />
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: spacing.lg }}
            keyboardShouldPersistTaps="handled"
          >
            <BrandMark icon="chatbubbles" />

            <Text style={[typography.display, { color: t.text, textAlign: 'center', marginTop: spacing.md }]}>
              Gumnaam Raho
            </Text>
            <Text style={{ color: t.textMuted, textAlign: 'center', marginTop: 4, marginBottom: spacing.xl }}>
              Speak freely. Stay anonymous.
            </Text>

            <GlassCard isDark={IS_DARK}>
              <Text style={[typography.h1, { color: t.text, marginBottom: 4 }]}>
                Welcome back
              </Text>
              <Text style={{ color: t.textMuted, marginBottom: spacing.lg }}>
                Sign in to keep sharing your whispers
              </Text>

              <TextField
                isDark={IS_DARK}
                icon="mail-outline"
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                containerStyle={{ marginBottom: spacing.md }}
              />

              <TextField
                isDark={IS_DARK}
                icon="lock-closed-outline"
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={hidePassword}
                rightIcon={hidePassword ? 'eye-outline' : 'eye-off-outline'}
                onRightIconPress={() => setHidePassword((v) => !v)}
                containerStyle={{ marginBottom: spacing.lg }}
              />

              <PrimaryButton label="Sign In" onPress={handleSignIn} loading={loading} />

              <View style={{ marginTop: spacing.lg, alignItems: 'center' }}>
                <GhostLink
                  isDark={IS_DARK}
                  label="Don't have an account? Sign up"
                  onPress={() => router.push('/SignUp')}
                />
              </View>
            </GlassCard>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}