import AsyncStorage from '@react-native-async-storage/async-storage';

type Habit = {
    id: string;
    name: string;
    color: string;
    completions: Record<string, boolean>;
    createdAt: number;
};

type Event = {
    id: string;
    title: string;
    date: string; // YYYY-MM-DD
    time?: string;
    description?: string;
};

const HABITS_KEY = '@habits_v2';
const EVENTS_KEY = '@events_v2';

export const Storage = {
    // Habits
    async getHabits(): Promise<Habit[]> {
        try {
            const json = await AsyncStorage.getItem(HABITS_KEY);
            return json ? JSON.parse(json) : [];
        } catch (error) {
            console.error('Failed to load habits:', error);
            return [];
        }
    },

    async saveHabits(habits: Habit[]): Promise<void> {
        try {
            await AsyncStorage.setItem(HABITS_KEY, JSON.stringify(habits));
        } catch (error) {
            console.error('Failed to save habits:', error);
            throw error;
        }
    },

    // Events
    async getEvents(): Promise<Event[]> {
        try {
            const json = await AsyncStorage.getItem(EVENTS_KEY);
            return json ? JSON.parse(json) : [];
        } catch (error) {
            console.error('Failed to load events:', error);
            return [];
        }
    },

    async saveEvents(events: Event[]): Promise<void> {
        try {
            await AsyncStorage.setItem(EVENTS_KEY, JSON.stringify(events));
        } catch (error) {
            console.error('Failed to save events:', error);
            throw error;
        }
    },

    // Clear all data (for debugging)
    async clearAll(): Promise<void> {
        try {
        await AsyncStorage.clear();
        } catch (error) {
        console.error('Failed to clear storage:', error);
        throw error;
        }
    }
};