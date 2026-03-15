import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { useAuth } from '../../context/AuthContext';

export default function AccountScreen() {
  const { logout } = useAuth();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Account</Text>
      <TouchableOpacity style={styles.button} onPress={logout}>
        <Text style={styles.buttonText}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 32 },
  button: {
    backgroundColor: '#DC2626',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 32,
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
