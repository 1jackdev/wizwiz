import { StyleSheet, Text, View } from 'react-native';

export default function StatSheetScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Character Stat Sheet</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  text: { fontSize: 18 },
});
