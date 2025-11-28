import React, { useMemo } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
// 1. Import the hook
import { useTransactions } from '@/src/hooks/useTransactions';

// --- Components ---

// Updated to accept dynamic balance
const BalanceCard = ({ balance }: { balance: number }) => (
  <View style={styles.card}>
    <Text style={styles.cardTitle}>Total Cash Flow</Text>
    <Text style={[
      styles.balanceAmount, 
      { color: balance >= 0 ? '#333' : '#EF4444' } // Red if negative
    ]}>
      ${balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
    </Text> 
    <View style={styles.balanceChangeContainer}>
        <Ionicons name="information-circle-outline" size={20} color="#666" />
        <Text style={styles.balanceChangeText}>Based on your transaction history</Text>
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
                    <Ionicons name="pie-chart-outline" size={28} color="#3B82F6" />
                    <Text style={styles.actionText}>Budget</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton} onPress={() => router.push('/(tabs)/transactions')}>
                    <Ionicons name="list-outline" size={28} color="#8B5CF6" />
                    <Text style={styles.actionText}>History</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton} onPress={() => router.push('/(tabs)/accounts')}>
                    <Ionicons name="card-outline" size={28} color="#EF4444" />
                    <Text style={styles.actionText}>Accounts</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const RecentTransactionItem = ({ item }: { item: any }) => (
  <View style={styles.transactionRow}>
    <View style={styles.rowLeft}>
      <View style={[
        styles.iconCircle, 
        { backgroundColor: item.type === 'Income' ? '#E6F4EA' : '#FEE2E2' }
      ]}>
        <Ionicons 
          name={item.type === 'Income' ? 'arrow-down' : 'arrow-up'} 
          size={18} 
          color={item.type === 'Income' ? '#10B981' : '#EF4444'} 
        />
      </View>
      <View>
        <Text style={styles.rowTitle}>{item.category}</Text>
        <Text style={styles.rowDate}>{item.date}</Text>
      </View>
    </View>
    <Text style={[
      styles.rowAmount,
      { color: item.type === 'Income' ? '#10B981' : '#EF4444' }
    ]}>
      {item.type === 'Income' ? '+' : '-'} ${item.amount.toFixed(2)}
    </Text>
  </View>
);

// --- Main Screen ---

export default function HomeScreen() {
  const router = useRouter();
  
  // 2. Fetch Real Data
  const { transactions, loading } = useTransactions();

  // 3. Calculate Totals (Memoized for performance)
  const balance = useMemo(() => {
    const income = transactions
      .filter(t => t.type === 'Income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const expense = transactions
      .filter(t => t.type === 'Expense')
      .reduce((sum, t) => sum + t.amount, 0);

    return income - expense;
  }, [transactions]);

  // 4. Get only the last 5 transactions
  const recentActivity = transactions.slice(0, 5);

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#10B981" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        
        <Text style={styles.greeting}>Financial Overview</Text>
        
        {/* Dynamic Balance Card */}
        <BalanceCard balance={balance} />

        {/* Quick Actions */}
        <QuickActions />

        {/* Recent Activity Section */}
        <View style={styles.recentSectionHeader}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/transactions')}>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.recentContainer}>
          {recentActivity.length > 0 ? (
            recentActivity.map((item) => (
              <RecentTransactionItem key={item.id} item={item} />
            ))
          ) : (
            <Text style={styles.emptyText}>No recent transactions.</Text>
          )}
        </View>

      </ScrollView>

      {/* FAB */}
      <TouchableOpacity 
        style={styles.fab} 
        onPress={() => router.push('/(tabs)/add-transaction')}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={32} color="#FFF" />
      </TouchableOpacity>
    </View>
  );
}

// --- Stylesheet ---

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6', // Slightly gray background
  },
  scrollContainer: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 100,
  },
  greeting: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 20,
  },
  
  // Balance Card
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    marginBottom: 25,
  },
  cardTitle: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 8,
    fontWeight: '600',
  },
  balanceAmount: {
    fontSize: 40,
    fontWeight: '800',
    color: '#111',
    marginBottom: 10,
  },
  balanceChangeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  balanceChangeText: {
    marginLeft: 6,
    color: '#6B7280',
    fontSize: 14,
  },
  
  // Quick Actions
  quickActionsContainer: {
    marginBottom: 25,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  actionText: {
    marginTop: 8,
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
  },
  
  // Recent Activity
  recentSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  seeAllText: {
    color: '#2563EB',
    fontWeight: '600',
  },
  recentContainer: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  transactionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rowTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  rowDate: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  rowAmount: {
    fontSize: 16,
    fontWeight: '700',
  },
  emptyText: {
    textAlign: 'center',
    padding: 20,
    color: '#9CA3AF',
  },
  
  // FAB
  fab: {
    position: 'absolute',
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    right: 25,
    bottom: 30,
    backgroundColor: '#111', // Black FAB for modern look
    borderRadius: 30,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
});