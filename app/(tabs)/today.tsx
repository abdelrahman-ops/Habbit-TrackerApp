import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Storage } from '@/services/storage';
import { format } from 'date-fns';

export default function TodayScreen() {
    type Habit = {
        id: string;
        name: string;
        color: string;
        completions: { [date: string]: boolean };
    };

    const [habits, setHabits] = useState<Habit[]>([]);
    const today = format(new Date(), 'yyyy-MM-dd');

    useEffect(() => {
        const loadHabits = async () => {
        const loadedHabits = await Storage.getHabits();
        setHabits(loadedHabits);
        };
        loadHabits();
    }, []);

    const toggleHabitCompletion = async (habitId: string) => {
        const updatedHabits = habits.map(habit => {
        if (habit.id === habitId) {
            return {
            ...habit,
            completions: {
                ...habit.completions,
                [today]: !habit.completions[today],
            },
            };
        }
        return habit;
        });
        
        setHabits(updatedHabits);
        await Storage.saveHabits(updatedHabits);
    };

    return (
        <View style={styles.container}>
        <Text style={styles.title}>Today's Habits</Text>
        <FlatList
            data={habits}
            renderItem={({ item }) => (
            <TouchableOpacity 
                style={styles.habitItem}
                onPress={() => toggleHabitCompletion(item.id)}
            >
                <View style={[styles.colorIndicator, { backgroundColor: item.color }]} />
                <Text style={styles.habitName}>{item.name}</Text>
                <Ionicons
                name={item.completions[today] ? "checkbox" : "square-outline"}
                size={24}
                color={item.completions[today] ? "#4CAF50" : "#ccc"}
                />
            </TouchableOpacity>
            )}
            keyExtractor={item => item.id}
        />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16 },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
    habitItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        marginBottom: 8,
        backgroundColor: '#fff',
        borderRadius: 8,
    },
    colorIndicator: {
        width: 16,
        height: 16,
        borderRadius: 8,
        marginRight: 12,
    },
    habitName: { flex: 1, fontSize: 16 },
});