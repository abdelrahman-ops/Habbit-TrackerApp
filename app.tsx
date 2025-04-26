// App.tsx
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import HabitsScreen from './screens/HabitsScreen';
import CalendarScreen from './screens/CalendarScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <>
      <StatusBar style="auto" />
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Habits">
          <Stack.Screen 
            name="Habits" 
            component={HabitsScreen} 
            options={{ title: 'My Habits' }} 
          />
          <Stack.Screen 
            name="Calendar" 
            component={CalendarScreen} 
            options={{ title: 'My Calendar' }} 
          />
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
}