import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

// --- Types ---
type Account = {
  id: string;
  name: string;
  institution: string;
  balance: number;
  type: 'Checking' | 'Savings' | 'Credit Card' | 'Cash';
  last4Digits?: string;
  color: string;
  isLiability: boolean; // True for Credit Cards/Loans
};

// --- Mock Data ---
const MOCK_ACCOUNTS: Account[] = [
  { 
    id: '1', 
    name: 'Primary Checking', 
    institution: 'Chase Bank', 
    balance: 2450.50, 
    type: 'Checking', 
    last4Digits: '8842', 
    color: '#1E293B', // Dark Slate
    isLiability: false 
  },
  { 
    id: '2', 
    name: 'High Yield Savings', 
    institution: 'Ally Bank', 
    balance: 12500.00, 
    type: 'Savings', 
    last4Digits: '9001', 
    color: '#059669', // Emerald Green
    isLiability: false 
  },
  { 
    id: '3', 
    name: 'Platinum Rewards', 
    institution: 'Amex', 
    balance: 450.25, 
    type: 'Credit Card', 
    last4Digits: '1234', 
    color: '#7C3AED', // Violet
    isLiability: true // This is debt!
  },
  { 
    id: '4', 
    name: 'Wallet Cash', 
    institution: 'Cash', 
    balance: 85.00, 
    type: 'Cash', 
    color: '#D97706', // Amber
    isLiability: false 
  },
];

export default function AccountsScreen() {
  const router = useRouter();

  // --- Calculate Net Worth ---
  const assets = MOCK_ACCOUNTS.filter(a => !a.isLiability).reduce((sum, a) => sum + a.balance, 0);
  const liabilities = MOCK_ACCOUNTS.filter(a => a.isLiability).reduce((sum, a) => sum + a.balance, 0);
  const netWorth = assets - liabilities;

  // --- Render Single Account Card ---
  const renderAccountCard = ({ item }: { item: Account }) => (
    <TouchableOpacity 
      activeOpacity={0.9} 
      style={[styles.card, { backgroundColor: item.color }]}
      onPress={() => Alert.alert('Account Details', `Viewing details for ${item.name}`)}
    >
      {/* Card Top: Bank Name & Icon */}
      <View style={styles.cardTop}>
        <Text style={styles.institutionText}>{item.institution}</Text>
        <Ionicons 
          name={item.type === 'Credit Card' ? 'card' : item.type === 'Cash' ? 'wallet' : 'business'} 
          size={24} 
          color="rgba(255,255,255,0.8)" 
        />
      </View>

      {/* Card Middle: Account Name & Number */}
      <View style={styles.cardMiddle}>
        <Text style={styles.accountName}>{item.name}</Text>
        {item.last4Digits && (
          <Text style={styles.accountNumber}>•••• •••• •••• {item.last4Digits}</Text>
        )}
      </View>

      {/* Card Bottom: Balance */}
      <View style={styles.cardBottom}>
        <View>
          <Text style={styles.balanceLabel}>Current Balance</Text>
          <Text style={styles.balanceText}>
            ${item.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </Text>
        </View>
        {item.isLiability && (
          <View style={styles.liabilityBadge}>
             <Text style={styles.liabilityText}>DEBT</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      
      {/* Header / Net Worth Summary */}
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>My Accounts</Text>
        <View style={styles.netWorthContainer}>
           <Text style={styles.netWorthLabel}>Total Net Worth</Text>
           <Text style={styles.netWorthAmount}>
             ${netWorth.toLocaleString('en-US', { minimumFractionDigits: 2 })}
           </Text>
        </View>
      </View>

      {/* Accounts List */}
      <FlatList
        data={MOCK_ACCOUNTS}
        keyExtractor={(item) => item.id}
        renderItem={renderAccountCard}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      {/* Add Account Button (FAB) */}
      <TouchableOpacity 
        style={styles.fab}
        onPress={() => Alert.alert('Add Account', 'This would open a form to link a bank or add cash.')}
      >
        <Ionicons name="add" size={30} color="#FFF" />
      </TouchableOpacity>
    </View>
  );
}

// --- Stylesheet ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  headerContainer: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111',
    marginBottom: 15,
  },
  netWorthContainer: {
    backgroundColor: '#111',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  netWorthLabel: {
    color: '#9CA3AF',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 5,
  },
  netWorthAmount: {
    color: '#FFF',
    fontSize: 32,
    fontWeight: 'bold',
  },

  // List Styles
  listContent: {
    padding: 20,
    paddingBottom: 100, // Space for FAB
  },
  
  // Card Styles
  card: {
    borderRadius: 20,
    padding: 24,
    marginBottom: 16,
    height: 180, // Fixed height for standard card look
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  institutionText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 18,
    fontWeight: '700',
  },
  cardMiddle: {
    marginTop: 10,
  },
  accountName: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    marginBottom: 4,
  },
  accountNumber: {
    color: '#FFF',
    fontSize: 18,
    fontFamily: 'Courier', // Monospace font helps it look like a card number
    letterSpacing: 2,
    fontWeight: '600',
  },
  cardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  balanceLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    marginBottom: 2,
  },
  balanceText: {
    color: '#FFF',
    fontSize: 22,
    fontWeight: 'bold',
  },
  liabilityBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  liabilityText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1,
  },

  // FAB
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 6,
  },
});