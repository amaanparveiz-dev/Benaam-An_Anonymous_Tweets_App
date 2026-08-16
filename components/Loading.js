// components/Loading.js
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { palette } from '../theme';

export default function Loading() {
  return (
    <View style={styles.wrap}>
      <ActivityIndicator size="large" color={palette.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
});