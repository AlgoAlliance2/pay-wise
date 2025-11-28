import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  TextInput,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTransactions } from '@/src/hooks/useTransactions';

// --- Types ---
type Transaction = {
  id: string;
  type: 'Income' | 'Expense';
  amount: number;
  category: string;
  date: string;
  description: string;
  account: string; // Ensure this exists in your type
};

export default function TransactionsScreen() {
  const router = useRouter();
  const { transactions, loading } = useTransactions();
  const [filter, setFilter] = useState<'All' | 'Income' | 'Expense'>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // --- Helper: Get Icon based on Category ---
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Groceries': return 'cart-outline';
      case 'Salary': return 'cash-outline';
      case 'Transport': return 'car-outline';
      case 'Entertainment': return 'film-outline';
      case 'Freelance': return 'laptop-outline';
      default: return 'wallet-outline';
    }
  };

  const filteredData = transactions.filter((item: any) => {
    const matchesType = filter === 'All' || item.type === filter;
    const desc = item.description ? item.description.toLowerCase() : '';
    const cat = item.category ? item.category.toLowerCase() : '';
    const query = searchQuery.toLowerCase();
    const matchesSearch = desc.includes(query) || cat.includes(query);
    return matchesType && matchesSearch;
  });

  return (
    <View style={styles.container}>
      
      {/* Header Area */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Transactions</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#999" style={{ marginRight: 8 }} />
        <TextInput 
          placeholder="Search transactions..." 
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        {['All', 'Income', 'Expense'].map((f) => (
          <TouchableOpacity 
            key={f} 
            style={[styles.filterButton, filter === f && styles.filterButtonActive]}
            onPress={() => setFilter(f as any)}
          >
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
              {f}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Handle Loading State */}
      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#10B981" />
        </View>
      ) : (
        <FlatList
          data={filteredData}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          // --- UPDATED RENDER ITEM ---
          renderItem={({ item }) => (
            <TouchableOpacity 
              activeOpacity={0.7}
              onPress={() => router.push({
                pathname: '/(tabs)/add-transaction',
                params: { 
                  id: item.id,
                  type: item.type,
                  amount: item.amount,
                  category: item.category,
                  description: item.description || '',
                  date: item.date,
                  account: item.account
                }
              })}
            >
              <View style={styles.transactionCard}>
                <View style={[styles.iconContainer, { backgroundColor: item.type === 'Income' ? '#E6F4EA' : '#FEE2E2' }]}>
                  <Ionicons 
                    name={getCategoryIcon(item.category) as any} 
                    size={24} 
                    color={item.type === 'Income' ? '#10B981' : '#EF4444'} 
                  />
                </View>
                <View style={styles.detailsContainer}>
                  <Text style={styles.description}>{item.description || item.category}</Text>
                  <Text style={styles.categoryDate}>{item.category} • {item.date}</Text>
                </View>
                <Text style={[styles.amount, { color: item.type === 'Income' ? '#10B981' : '#EF4444' }]}>
                  {item.type === 'Income' ? '+' : '-'} ${item.amount.toFixed(2)}
                </Text>
              </View>
            </TouchableOpacity>
          )}
          // ---------------------------
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={{ color: '#888' }}>No transactions found.</Text>
            </View>
          }
        />
      )}
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 15,
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    marginHorizontal: 20,
    marginTop: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginTop: 15,
    marginBottom: 10,
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: '#E5E7EB',
    marginRight: 10,
  },
  filterButtonActive: {
    backgroundColor: '#111',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4B5563',
  },
  filterTextActive: {
    color: '#FFF',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  transactionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  detailsContainer: {
    flex: 1,
  },
  description: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  categoryDate: {
    fontSize: 13,
    color: '#6B7280',
  },
  amount: {
    fontSize: 16,
    fontWeight: '700',
  },
  emptyState: {
    alignItems: 'center', 
    marginTop: 50
  }
});