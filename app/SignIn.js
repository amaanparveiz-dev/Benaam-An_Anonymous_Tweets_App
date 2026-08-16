import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useState } from 'react';
import {
  Alert,
  Platform,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Button } from 'react-native-paper';
import { heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { auth } from '../firebaseConfig';
import styles from '../styles';
export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleSignIn = async () => {
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
    }
  };

  return (
    <>
        <View style = {styles.TopContainer}>
          <Text style = {styles.LogoText}>Gumnaam</Text>
          <Text style = {styles.SloganText}>Raho</Text>
        </View>

      <StatusBar style="dark" />
      <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
        <ScrollView
          contentContainerStyle={{
            flexGrow: 0.2,
            justifyContent: 'center',
            padding: 20,
            paddingTop: Platform.OS === 'android' ? 40 : 0,
          }}
          keyboardShouldPersistTaps="handled"
        >
          <Text
            style={{
              fontSize: 26,
              fontWeight: 'bold',
              textAlign: 'center',
              marginBottom: 20,
            }}
          >
            Sign In
          </Text>

          <TextInput
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            style={{
              borderWidth: 1,
              borderColor: '#ccc',
              padding: 12,
              borderRadius: 8,
              marginBottom: 16,
            }}
          />

          <TextInput
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            style={{
              borderWidth: 1,
              borderColor: '#ccc',
              padding: 12,
              borderRadius: 8,
              marginBottom: 16,
            }}
          />

<Button
  mode="contained"
  onPress={handleSignIn}
  style={[{ padding: hp(1.2) }, styles.Main_BG]}
  labelStyle={{ color: 'white' }}
>
  Sign In
</Button>

          <TouchableOpacity onPress={() => router.push('/SignUp')}>
            <Text
              style={{
                textAlign: 'center',
                marginTop: 20,
                color: 'gray',
                fontWeight:700,
              }}
            >
              Don’t have an account ? Sign up
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}
