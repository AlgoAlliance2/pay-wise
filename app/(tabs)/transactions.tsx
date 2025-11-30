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
import { useTheme } from '@/src/context/ThemeContext';

export default function TransactionsScreen() {
  const router = useRouter();
  const { transactions, loading } = useTransactions();
  const { colors } = useTheme();
  const [filter, setFilter] = useState<'All' | 'Income' | 'Expense'>('All');
  const [searchQuery, setSearchQuery] = useState('');

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
    <View style={[styles.container, { backgroundColor: colors.background }]}>

      <View style={[styles.header, { backgroundColor: colors.background }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Transactions</Text>
      </View>

      {/* Search Bar */}
      <View style={[styles.searchContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Ionicons name="search" size={20} color={colors.textSecondary} style={{ marginRight: 8 }} />
        <TextInput
          placeholder="Search transactions..."
          placeholderTextColor={colors.textSecondary}
          style={[styles.searchInput, { color: colors.text }]}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        {['All', 'Income', 'Expense'].map((f) => {
          const isActive = filter === f;
          return (
            <TouchableOpacity
              key={f}
              style={[
                styles.filterButton,
                { backgroundColor: isActive ? colors.text : colors.card }
              ]}
              onPress={() => setFilter(f as any)}
            >
              <Text style={[
                styles.filterText,
                { color: isActive ? colors.background : colors.text }
              ]}>
                {f}
              </Text>
            </TouchableOpacity>
          );
        })}
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
              <View style={[styles.transactionCard, { backgroundColor: colors.card }]}>
                <View style={[styles.iconContainer, { backgroundColor: item.type === 'Income' ? '#E6F4EA' : '#FEE2E2' }]}>
                  <Ionicons
                    name={getCategoryIcon(item.category) as any}
                    size={24}
                    color={item.type === 'Income' ? '#10B981' : '#EF4444'}
                  />
                </View>
                <View style={styles.detailsContainer}>
                  <Text style={[styles.description, { color: colors.text }]}>{item.description || item.category}</Text>
                  <Text style={[styles.categoryDate, { color: colors.textSecondary }]}>{item.category} • {item.date}</Text>
                </View>
                <Text style={[styles.amount, { color: item.type === 'Income' ? '#10B981' : '#EF4444' }]}>
                  {item.type === 'Income' ? '+' : '-'} ${item.amount.toFixed(2)}
                </Text>
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={{ color: colors.textSecondary }}>No transactions found.</Text>
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
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 15,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
  },

  // Search Styles
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
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
    marginRight: 10,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
  },

  // List Styles
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  transactionCard: {
    flexDirection: 'row',
    alignItems: 'center',
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
    marginBottom: 4,
  },
  categoryDate: {
    fontSize: 13,
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