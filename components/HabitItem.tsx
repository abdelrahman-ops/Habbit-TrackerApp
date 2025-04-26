// components/HabitItem.tsx
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function HabitItem({ habit }: { habit: { name: string; streak: number } }) {
  return (
    <TouchableOpacity style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.name}>{habit.name}</Text>
        <Text style={styles.streak}>{habit.streak} day streak</Text>
      </View>
      <Ionicons name="checkbox-outline" size={24} color="#4CAF50" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    marginBottom: 8,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  content: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: '500',
  },
  streak: {
    color: '#666',
  },
});