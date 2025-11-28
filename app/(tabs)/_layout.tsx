import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Platform } from 'react-native';

const TAB_ICON_SIZE = 24;

export default function TabLayout() {
  const tintColor = '#10B981'; // A pleasant green color for active tabs

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: tintColor,
        headerShown: false, 
        tabBarStyle: {
          height: 90, 
          paddingVertical: Platform.OS === 'ios' ? 10 : 0,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color }) => (
            <Ionicons name="home" size={TAB_ICON_SIZE} color={color} />
          ),
        }}
      />


      <Tabs.Screen
        name="transactions"
        options={{
          title: 'Transactions',
          tabBarIcon: ({ color }) => (
            <Ionicons name="swap-horizontal" size={TAB_ICON_SIZE} color={color} />
          ),
        }}
      />


      <Tabs.Screen
        name="budget"
        options={{
          title: 'Budget',
          tabBarIcon: ({ color }) => (
            <Ionicons name="wallet" size={TAB_ICON_SIZE} color={color} />
          ),
        }}
      />


      <Tabs.Screen
        name="accounts"
        options={{
          title: 'Accounts',
          tabBarIcon: ({ color }) => (
            <Ionicons name="business" size={TAB_ICON_SIZE} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => (
            <Ionicons name="settings" size={TAB_ICON_SIZE} color={color} />
          ),
        }}
      />


      <Tabs.Screen
        name="add-transaction"
        options={{
          title: 'Add Transaction',
          headerShown: true, // Show header for this page when it's opened
          href: null, // Hide this screen from the tab bar completely
        }}
      />
    </Tabs>
  );
}