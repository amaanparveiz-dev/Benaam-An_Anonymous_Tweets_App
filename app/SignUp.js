import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { useState } from 'react';
import {
  Alert,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Button, PaperProvider } from 'react-native-paper';
import { heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { auth } from '../firebaseConfig';
import styles from '../styles';
export default function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleSignUp = async () => {
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
    }
  };

  return (
    <PaperProvider>

       <View style = {styles.TopContainer}>
          <Text style = {styles.LogoText}>Gumnaam</Text>
          <Text style = {styles.SloganText}>Raho</Text>
        </View>
      <StatusBar style="auto" />
      <View style={{ flex: 0.5, justifyContent: 'center', padding: 20 }}>
        <Text
          style={{
            fontSize: 26,
            fontWeight: 'bold',
            textAlign: 'center',
            marginBottom: 20,
          }}
        >
          Sign Up
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
  onPress={handleSignUp}
  style={[{ padding: hp(1.2) }, styles.Main_BG]}
  labelStyle={{ color: 'white' }}
>
  Sign Up
</Button>

        <TouchableOpacity onPress={() => router.push('/SignIn')}>
          <Text style={{ textAlign: 'center', marginTop: 20, color: 'gray' ,fontWeight:700 }}>
            Already have an account ? Sign in
          </Text>
        </TouchableOpacity>
      </View>
    </PaperProvider>
  );
}
