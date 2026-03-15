import { StyleSheet, Text, View } from 'react-native';

export default function CombatScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Combat</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  text: { fontSize: 18 },
});
