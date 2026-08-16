import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { createUserWithEmailAndPassword } from 'firebase/auth';
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

const IS_DARK = true;

export default function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [hidePassword, setHidePassword] = useState(true);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const t = palette.dark;

  const handleSignUp = async () => {
    if (!email.trim() || !password) {
      Alert.alert('Missing info', 'Please enter an email and password.');
      return;
    }
    setLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, email.trim(), password);
      router.replace('/');
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        Alert.alert('Error', 'Email already in use.');
      } else if (error.code === 'auth/invalid-email') {
        Alert.alert('Error', 'Invalid email address.');
      } else if (error.code === 'auth/weak-password') {
        Alert.alert('Error', 'Password should be at least 6 characters.');
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
            <BrandMark icon="sparkles" colors={palette.gradientAccent} />

            <Text style={[typography.display, { color: t.text, textAlign: 'center', marginTop: spacing.md }]}>
              Gumnaam Raho
            </Text>
            <Text style={{ color: t.textMuted, textAlign: 'center', marginTop: 4, marginBottom: spacing.xl }}>
              Join a space built for honesty.
            </Text>

            <GlassCard isDark={IS_DARK}>
              <Text style={[typography.h1, { color: t.text, marginBottom: 4 }]}>
                Create your account
              </Text>
              <Text style={{ color: t.textMuted, marginBottom: spacing.lg }}>
                Your identity stays hidden. Always.
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
                containerStyle={{ marginBottom: 6 }}
              />
              <Text style={{ color: t.textFaint, fontSize: 12, marginBottom: spacing.lg }}>
                Use at least 6 characters.
              </Text>

              <PrimaryButton
                label="Sign Up"
                onPress={handleSignUp}
                loading={loading}
                colors={palette.gradientAccent}
              />

              <View style={{ marginTop: spacing.lg, alignItems: 'center' }}>
                <GhostLink
                  isDark={IS_DARK}
                  label="Already have an account? Sign in"
                  onPress={() => router.push('/SignIn')}
                />
              </View>
            </GlassCard>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}