// components/Loading.js
import { ActivityIndicator, View } from 'react-native';

export default function Loading() {
  return (
    <View style={{ padding: 10 }}>
      <ActivityIndicator size="large" color="#007AFF" />
    </View>
  );
}
