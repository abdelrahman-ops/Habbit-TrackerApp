// screens/HabitsScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import AddHabitModal from '../components/AddHabitModal';
import { openDatabase } from '../services/database';

const db = openDatabase();

export default function HabitsScreen() {
  const [habits, setHabits] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    // Load habits from database
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM habits;',
        [],
        (_, { rows: { _array } }) => setHabits(_array),
        (_, error) => { console.log(error); return false; }
      );
    });
  }, []);

  const toggleHabitCompletion = (id: number) => {
    // Update habit completion status in database
    // Then refresh the list
  };

  const addNewHabit = (habitName: string) => {
    db.transaction(tx => {
      tx.executeSql(
        'INSERT INTO habits (name, streak, last_completed) VALUES (?, 0, null);',
        [habitName],
        (_, result) => {
          setHabits([...habits, { id: result.insertId, name: habitName, streak: 0 }]);
          setShowModal(false);
        },
        (_, error) => { console.log(error); return false; }
      );
    });
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={habits}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.habitItem}
            onPress={() => toggleHabitCompletion(item.id)}
          >
            <Text style={styles.habitName}>{item.name}</Text>
            <View style={styles.habitInfo}>
              <Text style={styles.streakText}>Streak: {item.streak}</Text>
              <MaterialIcons 
                name={item.completed ? "check-box" : "check-box-outline-blank"} 
                size={24} 
                color={item.completed ? "#4CAF50" : "#ccc"} 
              />
            </View>
          </TouchableOpacity>
        )}
        keyExtractor={item => item.id.toString()}
      />

      <TouchableOpacity 
        style={styles.addButton}
        onPress={() => setShowModal(true)}
      >
        <MaterialIcons name="add" size={24} color="white" />
      </TouchableOpacity>

      <AddHabitModal 
        visible={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={addNewHabit}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  habitItem: { 
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 2,
  },
  habitName: { fontSize: 16 },
  habitInfo: { flexDirection: 'row', alignItems: 'center' },
  streakText: { marginRight: 12, color: '#666' },
  addButton: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    backgroundColor: '#2196F3',
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
  },
});