import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  TextInput 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

// --- Types ---
type Transaction = {
  id: string;
  type: 'Income' | 'Expense';
  amount: number;
  category: string;
  date: string;
  description: string;
};

// --- Mock Data (For visualization) ---
const MOCK_DATA: Transaction[] = [
  { id: '1', type: 'Expense', amount: 45.50, category: 'Groceries', date: '2025-11-28', description: 'Weekly shopping' },
  { id: '2', type: 'Income', amount: 3500.00, category: 'Salary', date: '2025-11-25', description: 'Monthly Salary' },
  { id: '3', type: 'Expense', amount: 12.00, category: 'Transport', date: '2025-11-24', description: 'Uber ride' },
  { id: '4', type: 'Expense', amount: 120.00, category: 'Entertainment', date: '2025-11-22', description: 'Concert tickets' },
  { id: '5', type: 'Income', amount: 200.00, category: 'Freelance', date: '2025-11-20', description: 'Logo design' },
  { id: '6', type: 'Expense', amount: 5.50, category: 'Food', date: '2025-11-19', description: 'Coffee' },
];

export default function TransactionsScreen() {
  const router = useRouter();
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

  // --- Filter Logic ---
  const filteredData = MOCK_DATA.filter(item => {
    const matchesType = filter === 'All' || item.type === filter;
    const matchesSearch = item.description.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  // --- Render Single Item ---
  const renderItem = ({ item }: { item: Transaction }) => (
    <View style={styles.transactionCard}>
      {/* Icon Container */}
      <View style={[
        styles.iconContainer, 
        { backgroundColor: item.type === 'Income' ? '#E6F4EA' : '#FEE2E2' } // Light Green vs Light Red
      ]}>
        <Ionicons 
          name={getCategoryIcon(item.category) as any} 
          size={24} 
          color={item.type === 'Income' ? '#10B981' : '#EF4444'} 
        />
      </View>

      {/* Details */}
      <View style={styles.detailsContainer}>
        <Text style={styles.description}>{item.description}</Text>
        <Text style={styles.categoryDate}>{item.category} • {item.date}</Text>
      </View>

      {/* Amount */}
      <Text style={[
        styles.amount,
        { color: item.type === 'Income' ? '#10B981' : '#EF4444' }
      ]}>
        {item.type === 'Income' ? '+' : '-'} ${item.amount.toFixed(2)}
      </Text>
    </View>
  );

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

      {/* Transactions List */}
      <FlatList
        data={filteredData}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={{ color: '#888' }}>No transactions found.</Text>
          </View>
        }
      />
    </View>
  );
}

// --- Stylesheet ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    paddingTop: 50, // Safe area padding
    paddingHorizontal: 20,
    paddingBottom: 15,
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111',
  },
  
  // Search Styles
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

  // Filter Styles
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
    backgroundColor: '#111', // Active is dark
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4B5563',
  },
  filterTextActive: {
    color: '#FFF',
  },

  // List Styles
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
    // Soft shadow
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