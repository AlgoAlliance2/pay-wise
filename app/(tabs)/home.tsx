import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

// --- Placeholder Components ---

const BalanceCard = () => (
  <View style={styles.card}>
    <Text style={styles.cardTitle}>Current Net Worth</Text>
    {/* Placeholder for dynamic balance */}
    <Text style={styles.balanceAmount}>$12,500.85</Text> 
    <View style={styles.balanceChangeContainer}>
        <Ionicons name="trending-up" size={20} color="#10B981" />
        <Text style={styles.balanceChangeText}>+ $550.00 this month</Text>
    </View>
  </View>
);

const QuickActions = () => {
    const router = useRouter();

    return (
        <View style={styles.quickActionsContainer}>
            <Text style={styles.sectionTitle}>Quick Access</Text>
            <View style={styles.actionRow}>
                <TouchableOpacity style={styles.actionButton} onPress={() => router.push('/(tabs)/budget')}>
                    <Ionicons name="wallet-outline" size={30} color="#3B82F6" />
                    <Text style={styles.actionText}>View Budgets</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton} onPress={() => router.push('/(tabs)/accounts')}>
                    <Ionicons name="business-outline" size={30} color="#EF4444" />
                    <Text style={styles.actionText}>Manage Accounts</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};


// --- Main Screen Component ---

export default function HomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        
        {/* Header/Greeting */}
        <Text style={styles.greeting}>Hello, User!</Text>
        
        {/* Balance Card */}
        <BalanceCard />

        {/* Quick Actions */}
        <QuickActions />

        {/* Recent Transactions List (Placeholder) */}
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        <View style={styles.recentTransactions}>
            <Text style={{ textAlign: 'center', color: '#666' }}>
                Your recent transactions will appear here.
            </Text>
        </View>

      </ScrollView>

      {/* Floating Action Button (FAB) to Add Transaction */}
      <TouchableOpacity 
        style={styles.fab} 
        // Navigate to the hidden 'add-transaction' screen
        onPress={() => router.push('/(tabs)/add-transaction')}
        activeOpacity={0.8}
      >
        <Ionicons name="add-outline" size={36} color="#FFF" />
      </TouchableOpacity>
    </View>
  );
}

// --- Stylesheet ---

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5', // Light background
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 100, // Make room for the FAB
  },
  greeting: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333',
    marginBottom: 20,
  },
  
  // Balance Card Styles
  card: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 8,
    marginBottom: 25,
  },
  cardTitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  balanceChangeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  balanceChangeText: {
    marginLeft: 5,
    color: '#10B981',
    fontWeight: '600',
  },
  
  // Section Styles
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 15,
    marginTop: 10,
  },

  // Quick Actions Styles
  quickActionsContainer: {
    marginBottom: 25,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 4,
  },
  actionText: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  
  // Recent Transactions Placeholder
  recentTransactions: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    minHeight: 150,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Floating Action Button (FAB) Styles
  fab: {
    position: 'absolute',
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    right: 30,
    bottom: 30,
    backgroundColor: '#2563EB', // A vibrant blue
    borderRadius: 30,
    elevation: 8, // Android shadow
    shadowColor: '#000', // iOS shadow
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
});