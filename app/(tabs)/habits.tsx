import { 
    View, 
    Text, 
    TextInput, 
    FlatList, 
    TouchableOpacity, 
    StyleSheet, 
    Animated,
    Alert,
    Keyboard,
    Platform
  } from 'react-native';
  import { Ionicons } from '@expo/vector-icons';
  import { useState, useEffect, useRef } from 'react';
  import { Storage } from '@/services/storage';
  import { generateUUID } from '@/utils/uuid';
  import Swipeable from 'react-native-gesture-handler/Swipeable';
  import { useColorScheme } from '@/hooks/useColorScheme';
  import * as Haptics from 'expo-haptics';
  
  type Habit = {
    id: string;
    name: string;
    color: string;
    completions: Record<string, boolean>;
    createdAt: number;
  };
  
  const COLORS = ['#FF6B6B', '#48D1CC', '#9370DB', '#FFA500', '#20B2AA'];
  
  export default function HabitsScreen() {
    const colorScheme = useColorScheme();
    const [habits, setHabits] = useState<Habit[]>([]);
    const [newHabitName, setNewHabitName] = useState('');
    const [isAdding, setIsAdding] = useState(false);
    const swipeableRefs = useRef<{[key: string]: Swipeable | null}>({});
    const inputRef = useRef<TextInput>(null);
    const animatedValues = useRef(new Map()).current;
  
    // Load habits on mount
    useEffect(() => {
      const loadHabits = async () => {
        try {
          const loadedHabits = await Storage.getHabits();
          // Sort by creation date (newest first)
          const sortedHabits = loadedHabits.sort((a, b) => b.createdAt - a.createdAt);
          setHabits(sortedHabits);
          
          // Initialize animated values
          sortedHabits.forEach(habit => {
            animatedValues.set(habit.id, new Animated.Value(0));
          });
        } catch (error) {
          console.error('Failed to load habits:', error);
        }
      };
      loadHabits();
    }, []);
  
    // Add new habit with animation
    const addHabit = async () => {
      if (!newHabitName.trim()) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        Alert.alert('Oops!', 'Please enter a habit name');
        return;
      }
      
      try {
        setIsAdding(true);
        Keyboard.dismiss();
        
        const newHabit: Habit = {
            id: generateUUID(), // Use our custom function
            name: newHabitName,
            color: COLORS[Math.floor(Math.random() * COLORS.length)],
            completions: {},
            createdAt: Date.now()
        };
        
        // Add animation value for new habit
        const newValue = new Animated.Value(0);
        animatedValues.set(newHabit.id, newValue);
        
        // Animate entry
        setHabits([newHabit, ...habits]);
        await Storage.saveHabits([newHabit, ...habits]);
        
        Animated.spring(newValue, {
          toValue: 1,
          useNativeDriver: true,
          friction: 5,
        }).start();
        
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setNewHabitName('');
        
        // Focus input for next entry
        setTimeout(() => inputRef.current?.focus(), 100);
      } catch (error) {
        Alert.alert('Error', 'Failed to save habit');
        console.error(error);
      } finally {
        setIsAdding(false);
      }
    };
  
    // Delete confirmation with haptic feedback
    const confirmDelete = (id: string) => {
      Haptics.selectionAsync();
      Alert.alert(
        'Delete Habit',
        'Are you sure you want to delete this habit?',
        [
          { 
            text: 'Cancel', 
            onPress: () => {
              swipeableRefs.current[id]?.close();
              Haptics.selectionAsync();
            }, 
            style: 'cancel' 
          },
          { 
            text: 'Delete', 
            onPress: () => {
              deleteHabit(id);
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            }, 
            style: 'destructive' 
          },
        ]
      );
    };
  
    // Delete habit with animation
    const deleteHabit = async (id: string) => {
      try {
        const habitToDelete = habits.find(h => h.id === id);
        if (!habitToDelete) return;
        
        const animValue = animatedValues.get(id);
        if (animValue) {
          Animated.timing(animValue, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }).start(() => {
            const updatedHabits = habits.filter(habit => habit.id !== id);
            setHabits(updatedHabits);
            Storage.saveHabits(updatedHabits);
            animatedValues.delete(id);
          });
        }
      } catch (error) {
        Alert.alert('Error', 'Failed to delete habit');
        console.error(error);
      }
    };
  
    // Swipeable delete action
    const renderRightActions = (id: string, progress: Animated.AnimatedInterpolation) => {
      const trans = progress.interpolate({
        inputRange: [0, 1],
        outputRange: [100, 0],
      });
  
      return (
        <Animated.View 
          style={[
            styles.rightAction, 
            { 
              transform: [{ translateX: trans }],
              backgroundColor: colorScheme === 'dark' ? '#1E1E1E' : '#F8F9FA'
            }
          ]}
        >
          <TouchableOpacity 
            style={[
              styles.deleteButton,
              { backgroundColor: '#FF5252' }
            ]} 
            onPress={() => {
              swipeableRefs.current[id]?.close();
              confirmDelete(id);
            }}
          >
            <Ionicons name="trash" size={24} color="white" />
          </TouchableOpacity>
        </Animated.View>
      );
    };
  
    // Calculate streak with emoji variation
    const calculateStreak = (completions: Record<string, boolean>) => {
      const completedDays = Object.keys(completions).filter(date => completions[date]);
      const streak = completedDays.length;
      
      if (streak === 0) return 'No streak yet';
      if (streak < 3) return `${streak} day streak 🔥`;
      if (streak < 7) return `${streak} day streak 💪`;
      if (streak < 14) return `${streak} day streak 🚀`;
      return `${streak} day streak 🌟`;
    };
  
    const isDarkMode = colorScheme === 'dark';
  
    return (
      <View style={[
        styles.container,
        isDarkMode ? styles.darkContainer : styles.lightContainer
      ]}>
        <Text style={[
          styles.header,
          isDarkMode ? styles.darkText : styles.lightText
        ]}>
          My Habits
        </Text>
        
        <View style={[
          styles.inputContainer,
          isDarkMode ? styles.darkInputContainer : styles.lightInputContainer
        ]}>
          <TextInput
            ref={inputRef}
            style={[
              styles.input,
              isDarkMode ? styles.darkInput : styles.lightInput
            ]}
            placeholder="Enter new habit..."
            placeholderTextColor={isDarkMode ? '#888' : '#999'}
            value={newHabitName}
            onChangeText={setNewHabitName}
            onSubmitEditing={addHabit}
            returnKeyType="done"
            blurOnSubmit={false}
          />
          <TouchableOpacity 
            style={[
              styles.addButton, 
              isAdding && styles.addButtonDisabled,
              { backgroundColor: '#4CAF50' }
            ]} 
            onPress={addHabit}
            disabled={isAdding}
          >
            <Ionicons 
              name={isAdding ? "ellipsis-horizontal" : "add"} 
              size={24} 
              color="white" 
            />
          </TouchableOpacity>
        </View>
  
        {habits.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons 
              name="list-outline" 
              size={48} 
              color={isDarkMode ? '#444' : '#ddd'} 
            />
            <Text style={[
              styles.emptyText,
              isDarkMode ? styles.darkText : styles.lightText
            ]}>
              No habits yet
            </Text>
            <Text style={[
              styles.emptySubtext,
              isDarkMode ? styles.darkSubtext : styles.lightSubtext
            ]}>
              Add your first habit above
            </Text>
          </View>
        ) : (
          <FlatList
            data={habits}
            renderItem={({ item }) => {
              const animValue = animatedValues.get(item.id) || new Animated.Value(1);
              return (
                <Animated.View
                  style={{
                    opacity: animValue,
                    transform: [{
                      translateY: animValue.interpolate({
                        inputRange: [0, 1],
                        outputRange: [50, 0],
                      })
                    }]
                  }}
                >
                  <Swipeable
                    ref={ref => swipeableRefs.current[item.id] = ref}
                    renderRightActions={(progress) => renderRightActions(item.id, progress)}
                    rightThreshold={40}
                    friction={2}
                    containerStyle={styles.swipeableContainer}
                  >
                    <TouchableOpacity 
                      style={[
                        styles.habitItem,
                        isDarkMode ? styles.darkHabitItem : styles.lightHabitItem,
                        { borderLeftColor: item.color }
                      ]}
                      activeOpacity={0.7}
                      onPress={() => {
                        Haptics.selectionAsync();
                        // Add your habit completion logic here
                      }}
                    >
                      <View style={styles.habitContent}>
                        <Text style={[
                          styles.habitName,
                          isDarkMode ? styles.darkText : styles.lightText
                        ]}>
                          {item.name}
                        </Text>
                        <View style={styles.streakContainer}>
                          <Ionicons name="flame" size={16} color="#FF9800" />
                          <Text style={[
                            styles.streakText,
                            isDarkMode ? styles.darkSubtext : styles.lightSubtext
                          ]}>
                            {calculateStreak(item.completions)}
                          </Text>
                        </View>
                      </View>
                      <Ionicons 
                        name="chevron-forward" 
                        size={20} 
                        color={isDarkMode ? '#555' : '#888'} 
                      />
                    </TouchableOpacity>
                  </Swipeable>
                </Animated.View>
              );
            }}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContent}
            ItemSeparatorComponent={() => (
              <View style={[
                styles.separator,
                isDarkMode ? styles.darkSeparator : styles.lightSeparator
              ]} />
            )}
          />
        )}
      </View>
    );
  }
  
  const styles = StyleSheet.create({
    // Base styles
    container: {
      flex: 1,
      padding: 20,
    },
    header: {
      fontSize: 28,
      fontWeight: 'bold',
      marginBottom: 20,
      fontFamily: Platform.OS === 'ios' ? 'Helvetica Neue' : 'sans-serif-medium',
    },
    inputContainer: {
      flexDirection: 'row',
      marginBottom: 20,
      borderRadius: 12,
      overflow: 'hidden',
    },
    input: {
      flex: 1,
      paddingHorizontal: 16,
      paddingVertical: 14,
      fontSize: 16,
      fontFamily: Platform.OS === 'ios' ? 'Helvetica Neue' : 'sans-serif',
    },
    addButton: {
      width: 50,
      height: 50,
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
      marginLeft: 10,
    },
    addButtonDisabled: {
      opacity: 0.7,
    },
    habitItem: {
      borderRadius: 12,
      padding: 16,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderLeftWidth: 6,
    },
    habitContent: {
      flex: 1,
    },
    habitName: {
      fontSize: 18,
      fontWeight: '500',
      marginBottom: 4,
      fontFamily: Platform.OS === 'ios' ? 'Helvetica Neue' : 'sans-serif-medium',
    },
    streakContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    streakText: {
      fontSize: 14,
      marginLeft: 4,
      fontFamily: Platform.OS === 'ios' ? 'Helvetica Neue' : 'sans-serif',
    },
    rightAction: {
      width: 80,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 12,
    },
    deleteButton: {
      width: '100%',
      height: '100%',
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
    },
    emptyState: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 40,
    },
    emptyText: {
      fontSize: 18,
      marginTop: 16,
      fontFamily: Platform.OS === 'ios' ? 'Helvetica Neue' : 'sans-serif-medium',
    },
    emptySubtext: {
      fontSize: 14,
      marginTop: 8,
      fontFamily: Platform.OS === 'ios' ? 'Helvetica Neue' : 'sans-serif',
    },
    listContent: {
      paddingBottom: 20,
    },
    separator: {
      height: 10,
    },
    swipeableContainer: {
      borderRadius: 12,
      marginVertical: 4,
    },
  
    // Light mode styles
    lightContainer: {
      backgroundColor: '#F8F9FA',
    },
    lightText: {
      color: '#333',
    },
    lightSubtext: {
      color: '#666',
    },
    lightInputContainer: {
      backgroundColor: 'white',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    lightInput: {
      backgroundColor: 'white',
      color: '#333',
    },
    lightHabitItem: {
      backgroundColor: 'white',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    lightSeparator: {
      backgroundColor: '#F8F9FA',
    },
  
    // Dark mode styles
    darkContainer: {
      backgroundColor: '#121212',
    },
    darkText: {
      color: '#FFF',
    },
    darkSubtext: {
      color: '#AAA',
    },
    darkInputContainer: {
      backgroundColor: '#1E1E1E',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 2,
    },
    darkInput: {
      backgroundColor: '#1E1E1E',
      color: '#FFF',
    },
    darkHabitItem: {
      backgroundColor: '#1E1E1E',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.2,
      shadowRadius: 2,
      elevation: 1,
    },
    darkSeparator: {
      backgroundColor: '#121212',
    },
  });