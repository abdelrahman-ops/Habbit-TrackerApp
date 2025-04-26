import { View, Text, StyleSheet } from 'react-native';
import ProgressCircle from '../../components/ProgressCircle';

export default function HomeScreen() {
  const completionRate = 75; // Example value

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Today's Progress</Text>
      <ProgressCircle progress={completionRate} />
      <Text style={styles.subtitle}>
        {completionRate}% of habits completed
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 18,
    marginTop: 20,
    color: '#666',
  },
});