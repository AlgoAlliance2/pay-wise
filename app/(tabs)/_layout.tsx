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
        // Optional: Hide the header bar on all tab screens, we'll add custom headers inside each screen
        // headerShown: false, 
        // tabBarStyle: {
        //   // Adjust padding for better look on different platforms
        //   height: Platform.OS === 'ios' ? 90 : 60, 
        //   paddingVertical: Platform.OS === 'ios' ? 10 : 0,
        // },
      }}
    >
      {/* 1. HOME / DASHBOARD Tab */}
      <Tabs.Screen
        name="home" // Corresponds to app/(tabs)/home.tsx
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color }) => (
            <Ionicons name="home" size={TAB_ICON_SIZE} color={color} />
          ),
        }}
      />

      {/* 2. TRANSACTIONS Tab */}
      <Tabs.Screen
        name="transactions" // Corresponds to app/(tabs)/transactions.tsx
        options={{
          title: 'Transactions',
          tabBarIcon: ({ color }) => (
            <Ionicons name="swap-horizontal" size={TAB_ICON_SIZE} color={color} />
          ),
        }}
      />

      {/* 3. BUDGETING Tab */}
      <Tabs.Screen
        name="budget" // Corresponds to app/(tabs)/budget.tsx
        options={{
          title: 'Budget',
          tabBarIcon: ({ color }) => (
            <Ionicons name="wallet" size={TAB_ICON_SIZE} color={color} />
          ),
        }}
      />

      {/* 4. ACCOUNTS Tab */}
      <Tabs.Screen
        name="accounts" // Corresponds to app/(tabs)/accounts.tsx
        options={{
          title: 'Accounts',
          tabBarIcon: ({ color }) => (
            <Ionicons name="business" size={TAB_ICON_SIZE} color={color} />
          ),
        }}
      />

      {/* 5. SETTINGS Tab */}
      <Tabs.Screen
        name="settings" // Corresponds to app/(tabs)/settings.tsx
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => (
            <Ionicons name="settings" size={TAB_ICON_SIZE} color={color} />
          ),
        }}
      />

      {/* IMPORTANT: Add a screen for 'add-transaction'. 
        We hide it from the tab bar but keep it in the stack so we can navigate to it.
      */}
      <Tabs.Screen
        name="add-transaction" // Corresponds to app/(tabs)/add-transaction.tsx
        options={{
          title: 'Add Transaction',
          headerShown: true, // Show header for this page when it's opened
          href: null, // Hide this screen from the tab bar completely
        }}
      />
    </Tabs>
  );
}