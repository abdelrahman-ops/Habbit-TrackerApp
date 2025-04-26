import { View, Text, TouchableOpacity, Modal, TextInput, StyleSheet } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import { Storage } from '@/services/storage';
import { format } from 'date-fns';

type Event = {
  id: string;
  title: string;
  date: string;
  time?: string;
  description?: string;
};

export default function CalendarScreen() {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [showModal, setShowModal] = useState(false);
  const [newEvent, setNewEvent] = useState<Omit<Event, 'id'>>({ 
    title: '', 
    date: selectedDate 
  });

  useEffect(() => {
    const loadEvents = async () => {
      const loadedEvents = await Storage.getEvents();
      setEvents(loadedEvents);
    };
    loadEvents();
  }, []);

  const markedDates = events.reduce((acc, event) => {
    acc[event.date] = { marked: true, dotColor: '#4CAF50' };
    return acc;
  }, {} as Record<string, { marked: boolean; dotColor: string }>);

  const addEvent = async () => {
    if (!newEvent.title.trim()) return;
    
    const event: Event = {
      ...newEvent,
      id: Math.random().toString(36).substring(7),
    };
    
    const updatedEvents = [...events, event];
    setEvents(updatedEvents);
    await Storage.saveEvents(updatedEvents);
    setShowModal(false);
    setNewEvent({ title: '', date: selectedDate });
  };

  const dayEvents = events.filter(event => event.date === selectedDate);

  return (
    <View style={styles.container}>
      <Calendar
        current={selectedDate}
        onDayPress={day => {
          setSelectedDate(day.dateString);
          setNewEvent(prev => ({ ...prev, date: day.dateString }));
        }}
        markedDates={{
          ...markedDates,
          [selectedDate]: { 
            selected: true, 
            selectedColor: '#2196F3',
            marked: markedDates[selectedDate]?.marked 
          },
        }}
        theme={{
          todayTextColor: '#FF5722',
          selectedDayBackgroundColor: '#2196F3',
          arrowColor: '#2196F3',
        }}
      />

      <View style={styles.eventsContainer}>
        <Text style={styles.sectionTitle}>
          Events on {format(new Date(selectedDate), 'MMMM d, yyyy')}
        </Text>
        
        {dayEvents.length === 0 ? (
          <Text style={styles.noEvents}>No events scheduled</Text>
        ) : (
          dayEvents.map(event => (
            <View key={event.id} style={styles.eventItem}>
              <Text style={styles.eventTitle}>{event.title}</Text>
              {event.time && <Text style={styles.eventTime}>{event.time}</Text>}
              {event.description && (
                <Text style={styles.eventDescription}>{event.description}</Text>
              )}
            </View>
          ))
        )}
      </View>

      <TouchableOpacity 
        style={styles.addButton}
        onPress={() => setShowModal(true)}
      >
        <Ionicons name="add" size={24} color="white" />
      </TouchableOpacity>

      <Modal visible={showModal} animationType="slide">
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Add New Event</Text>
          
          <TextInput
            style={styles.input}
            placeholder="Event title"
            value={newEvent.title}
            onChangeText={text => setNewEvent(prev => ({ ...prev, title: text }))}
          />
          
          <TextInput
            style={styles.input}
            placeholder="Time (optional)"
            value={newEvent.time || ''}
            onChangeText={text => setNewEvent(prev => ({ ...prev, time: text }))}
          />
          
          <TextInput
            style={[styles.input, { height: 100 }]}
            placeholder="Description (optional)"
            multiline
            value={newEvent.description || ''}
            onChangeText={text => setNewEvent(prev => ({ ...prev, description: text }))}
          />

          <View style={styles.buttonRow}>
            <TouchableOpacity 
              style={[styles.button, styles.cancelButton]}
              onPress={() => setShowModal(false)}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.button, styles.saveButton]}
              onPress={addEvent}
            >
              <Text style={styles.buttonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  eventsContainer: { flex: 1, padding: 16 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 16 },
  noEvents: { color: '#666', textAlign: 'center', marginTop: 20 },
  eventItem: { 
    backgroundColor: '#f5f5f5', 
    padding: 12, 
    borderRadius: 8, 
    marginBottom: 8 
  },
  eventTitle: { fontSize: 16, fontWeight: '500' },
  eventTime: { fontSize: 14, color: '#666', marginTop: 4 },
  eventDescription: { fontSize: 14, color: '#666', marginTop: 4 },
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
  modalContainer: { flex: 1, padding: 20 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between' },
  button: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
  },
  cancelButton: { backgroundColor: '#f44336' },
  saveButton: { backgroundColor: '#4CAF50' },
  buttonText: { color: 'white', fontWeight: 'bold' },
});