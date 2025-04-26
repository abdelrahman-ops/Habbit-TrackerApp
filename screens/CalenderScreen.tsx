// screens/CalendarScreen.tsx
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { AntDesign } from '@expo/vector-icons';
import AddEventModal from '../components/AddEventModal';

export default function CalendarScreen() {
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [events, setEvents] = useState<Record<string, any>>({});
  const [showModal, setShowModal] = useState(false);

  const addNewEvent = (event: any) => {
    const newEvents = { ...events };
    if (!newEvents[selectedDate]) {
      newEvents[selectedDate] = [];
    }
    newEvents[selectedDate].push(event);
    setEvents(newEvents);
    setShowModal(false);
  };

  return (
    <View style={styles.container}>
      <Calendar
        onDayPress={(day) => setSelectedDate(day.dateString)}
        markedDates={{
          ...Object.keys(events).reduce((acc, date) => {
            acc[date] = { marked: true, dotColor: '#4CAF50' };
            return acc;
          }, {} as Record<string, any>),
          [selectedDate]: { selected: true, selectedColor: '#2196F3' }
        }}
        theme={{
          todayTextColor: '#FF5722',
          selectedDayBackgroundColor: '#2196F3',
          arrowColor: '#2196F3',
        }}
      />

      <View style={styles.eventsContainer}>
        <Text style={styles.sectionTitle}>Events on {selectedDate}</Text>
        <FlatList
          data={events[selectedDate] || []}
          renderItem={({ item }) => (
            <View style={styles.eventItem}>
              <Text style={styles.eventTitle}>{item.title}</Text>
              {item.time && <Text style={styles.eventTime}>{item.time}</Text>}
            </View>
          )}
          keyExtractor={(item, index) => index.toString()}
        />
      </View>

      <TouchableOpacity 
        style={styles.addButton}
        onPress={() => setShowModal(true)}
      >
        <AntDesign name="plus" size={24} color="white" />
      </TouchableOpacity>

      <AddEventModal 
        visible={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={addNewEvent}
        selectedDate={selectedDate}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  eventsContainer: { flex: 1, padding: 16 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 16 },
  eventItem: { 
    backgroundColor: '#f5f5f5', 
    padding: 12, 
    borderRadius: 8, 
    marginBottom: 8 
  },
  eventTitle: { fontSize: 16 },
  eventTime: { fontSize: 14, color: '#666', marginTop: 4 },
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