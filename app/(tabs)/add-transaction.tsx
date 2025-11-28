import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TextInput, 
  TouchableOpacity, 
  Platform,
  Alert // Use for simple feedback
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useRouter } from 'expo-router';

// --- Type Definitions (for clarity) ---
type TransactionType = 'Expense' | 'Income';

// --- Placeholder Data ---
const accounts = ['Checking Account', 'Savings Account', 'Credit Card'];
const expenseCategories = ['Groceries', 'Rent', 'Entertainment', 'Transport'];
const incomeCategories = ['Salary', 'Freelance', 'Investment'];

export default function AddTransactionScreen() {
  const router = useRouter();

  // --- State Management ---
  const [type, setType] = useState<TransactionType>('Expense');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [account, setAccount] = useState(accounts[0]);
  const [category, setCategory] = useState(expenseCategories[0]);
  const [date, setDate] = useState(new Date().toISOString().substring(0, 10)); // YYYY-MM-DD format

  // --- Functions ---
  
  const handleSaveTransaction = () => {
    // 1. Basic validation
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount.');
      return;
    }

    // 2. Here, you would normally call a Firebase function or API to save the data
    const transactionData = {
      type,
      amount: parsedAmount,
      description,
      account,
      category,
      date,
      // You'll add user ID and timestamp here later
    };

    console.log('Saving Transaction:', transactionData);

    // 3. Provide feedback and navigate back
    Alert.alert('Success', `${type} of $${parsedAmount.toFixed(2)} saved!`);
    router.back();
  };

  // Determine which category list to use based on transaction type
  const currentCategories = type === 'Expense' ? expenseCategories : incomeCategories;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.typeSwitcher}>
        
        {/* Expense Button */}
        <TouchableOpacity 
          style={[styles.typeButton, type === 'Expense' && styles.typeButtonActive]}
          onPress={() => {
            setType('Expense');
            setCategory(expenseCategories[0]); // Reset category on type change
          }}
        >
          <Text style={[styles.typeButtonText, type === 'Expense' && styles.typeButtonTextActive]}>Expense</Text>
        </TouchableOpacity>

        {/* Income Button */}
        <TouchableOpacity 
          style={[styles.typeButton, type === 'Income' && styles.typeButtonActive]}
          onPress={() => {
            setType('Income');
            setCategory(incomeCategories[0]); // Reset category on type change
          }}
        >
          <Text style={[styles.typeButtonText, type === 'Income' && styles.typeButtonTextActive]}>Income</Text>
        </TouchableOpacity>

      </View>

      {/* Amount Input */}
      <Text style={styles.label}>Amount ($)</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g., 50.00"
        keyboardType="numeric"
        value={amount}
        onChangeText={setAmount}
      />

      {/* Account Picker */}
      <Text style={styles.label}>Account</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={account}
          onValueChange={(itemValue) => setAccount(itemValue)}
          mode="dropdown"
        >
          {accounts.map((acc, index) => (
            <Picker.Item label={acc} value={acc} key={index} />
          ))}
        </Picker>
      </View>

      {/* Category Picker */}
      <Text style={styles.label}>Category</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={category}
          onValueChange={(itemValue) => setCategory(itemValue)}
          mode="dropdown"
        >
          {currentCategories.map((cat, index) => (
            <Picker.Item label={cat} value={cat} key={index} />
          ))}
        </Picker>
      </View>

      {/* Date Input (Simplified) */}
      <Text style={styles.label}>Date</Text>
      <TextInput
        style={styles.input}
        placeholder="YYYY-MM-DD (e.g., 2025-11-28)"
        keyboardType="default"
        value={date}
        onChangeText={setDate}
      />

      {/* Description Input */}
      <Text style={styles.label}>Description (Optional)</Text>
      <TextInput
        style={[styles.input, styles.multilineInput]}
        placeholder="e.g., Dinner with friends"
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={3}
      />
      
      {/* Save Button */}
      <TouchableOpacity 
        style={styles.saveButton} 
        onPress={handleSaveTransaction}
      >
        <Text style={styles.saveButtonText}>Save Transaction</Text>
      </TouchableOpacity>
      
      {/* Spacer for bottom padding */}
      <View style={{ height: 50 }} />
    </ScrollView>
  );
}

// --- Stylesheet ---

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F7F7F7',
  },
  
  // Transaction Type Switcher Styles
  typeSwitcher: {
    flexDirection: 'row',
    marginBottom: 20,
    backgroundColor: '#E0E0E0',
    borderRadius: 10,
    overflow: 'hidden',
  },
  typeButton: {
    flex: 1,
    paddingVertical: 15,
    alignItems: 'center',
  },
  typeButtonActive: {
    backgroundColor: '#10B981', // Active color
  },
  typeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  typeButtonTextActive: {
    color: '#FFF',
  },
  
  // Form Element Styles
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#444',
    marginTop: 15,
    marginBottom: 5,
  },
  input: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
  },
  multilineInput: {
    height: 100,
    textAlignVertical: 'top', // For Android
    paddingTop: 12,
  },
  
  // Picker Styles (needs wrapping View for border)
  pickerContainer: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    // Fixes clipping/overlap issues on iOS
    overflow: Platform.OS === 'ios' ? 'hidden' : 'visible', 
  },

  // Save Button Styles
  saveButton: {
    backgroundColor: '#2563EB',
    padding: 18,
    borderRadius: 10,
    marginTop: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 5,
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
  },
});