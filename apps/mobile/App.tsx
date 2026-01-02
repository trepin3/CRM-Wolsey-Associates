import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { API_URL } from './src/config';

export default function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Wolsey & Associates CRM</Text>
      <Text>Mobile app scaffold (Expo + TypeScript)</Text>
      <Text style={styles.small}>Backend: {API_URL}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#faf8f5' },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 8 },
  small: { marginTop: 12, color: '#555' }
});
