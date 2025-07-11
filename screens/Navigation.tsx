import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { Text, View } from 'react-native';
import HomeScreen from './HomeScreen';
import DownloadScreen from './DownloadScreen';

// Simple icon components
const HomeIcon = ({ color }: { color: string }) => (
  <View style={{ 
    width: 24, 
    height: 24, 
    backgroundColor: color, 
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center'
  }}>
    <View style={{ width: 12, height: 12, backgroundColor: '#fff', borderRadius: 6 }} />
  </View>
);

const DownloadIcon = ({ color }: { color: string }) => (
  <View style={{ 
    width: 24, 
    height: 24, 
    backgroundColor: color, 
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center'
  }}>
    <View style={{ width: 12, height: 8, backgroundColor: '#fff', borderRadius: 2 }} />
  </View>
);

const Tab = createBottomTabNavigator();

const Navigation = () => {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor: '#007AFF',
          tabBarInactiveTintColor: '#8E8E93',
          headerShown: false,
          tabBarStyle: {
            backgroundColor: '#fff',
            borderTopColor: '#eee',
            elevation: 8,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
          },
        }}
      >
        <Tab.Screen
          name="Home"
          component={HomeScreen}
          options={{
            tabBarIcon: ({ color }) => <HomeIcon color={color} />,
            tabBarLabel: ({ color }) => (
              <Text style={{ color, fontSize: 12, marginBottom: 3, fontWeight: '500' }}>Home</Text>
            ),
          }}
        />
        <Tab.Screen
          name="Downloads"
          component={DownloadScreen}
          options={{
            tabBarIcon: ({ color }) => <DownloadIcon color={color} />,
            tabBarLabel: ({ color }) => (
              <Text style={{ color, fontSize: 12, marginBottom: 3, fontWeight: '500' }}>Downloads</Text>
            ),
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

export default Navigation; 