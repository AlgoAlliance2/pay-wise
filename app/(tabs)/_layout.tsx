import { useTheme } from '@/src/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

const TAB_ICON_SIZE = 24;

export default function TabLayout() {
  const { colors } = useTheme();

  const activeColor = '#10B981'; 

  return (
    <Tabs
      screenOptions={{
        // Set colors based on the theme
        tabBarActiveTintColor: activeColor,
        tabBarInactiveTintColor: colors.textSecondary,
        headerShown: false,
        
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
          borderBottomColor: colors.border,
          
          height: Platform.OS === 'ios' ? 90 : 90,
          paddingVertical: Platform.OS === 'ios' ? 10 : 10,
          paddingBottom: Platform.OS === 'ios' ? 25 : 10,
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
          headerShown: true, 
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerTintColor: colors.text,
          href: null, 
        }}
      />
    </Tabs>
  );
}