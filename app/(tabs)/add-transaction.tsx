import React, { useState, useEffect, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, 
  Platform, Alert, ActivityIndicator, KeyboardAvoidingView
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useRouter, useLocalSearchParams } from 'expo-router'; // 1. Import useLocalSearchParams
import { addTransactionToFirestore, deleteTransaction, updateTransaction } from '@/src/services/transactionService';
import { useBehavior } from '@/src/keyboardBehavior';
import { useAccounts } from '@/src/hooks/useAccounts';
import { useBudgets } from '@/src/hooks/useBudgets';
import { DEFAULT_EXPENSE_CATEGORIES, DEFAULT_INCOME_CATEGORIES } from '@/src/constants/categories';

type TransactionType = 'Expense' | 'Income';

export default function AddTransactionScreen() {
  const router = useRouter();
  const behavior = useBehavior();
  const params = useLocalSearchParams(); // 2. Get Params (if coming from Edit)

  // Determine if we are editing
  const isEditing = !!params.id;
  
  // Data Hooks
  const { accounts: realAccounts, loading: accountsLoading } = useAccounts();
  const { budgets, loading: budgetsLoading } = useBudgets();

  // State
  const [type, setType] = useState<TransactionType>('Expense');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [account, setAccount] = useState(''); 
  const [category, setCategory] = useState('');
  const [date, setDate] = useState(new Date().toISOString().substring(0, 10)); 
  const [loading, setLoading] = useState(false);

  // 3. EFFECT: Populate form if Editing
  useEffect(() => {
    if (isEditing) {
      setType(params.type as TransactionType);
      setAmount(params.amount?.toString() || '');
      setDescription(params.description as string || '');
      setAccount(params.account as string || '');
      setCategory(params.category as string || '');
      setDate(params.date as string || '');
    }
  }, [params.id]);

  // Merge Categories (Same as before)
  const currentCategories = useMemo(() => {
    if (type === 'Income') return DEFAULT_INCOME_CATEGORIES;
    const budgetCategoryNames = budgets.map(b => b.category);
    return Array.from(new Set([...DEFAULT_EXPENSE_CATEGORIES, ...budgetCategoryNames])).sort();
  }, [type, budgets]);

  // Set default category (Only if NOT editing)
  useEffect(() => {
    if (!isEditing && currentCategories.length > 0 && !category) {
      setCategory(currentCategories[0]);
    }
  }, [currentCategories, category, isEditing]);

  // Set default account (Only if NOT editing)
  useEffect(() => {
    if (!isEditing && realAccounts.length > 0 && account === '') {
      setAccount(realAccounts[0].name);
    }
  }, [realAccounts, account, isEditing]);

  // --- SAVE Handler ---
  const handleSave = async () => {
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) return Alert.alert('Error', 'Invalid amount');
    if (!account) return Alert.alert('Error', 'Select an account');
    
    setLoading(true);
    try {
      if (isEditing) {
        // UPDATE Existing
        await updateTransaction(params.id as string, {
            type,
            amount: parsedAmount,
            category,
            description,
            date,
            // account: account // Account switching blocked in logic for simplicity
        });
        Alert.alert('Updated', 'Transaction updated successfully');
      } else {
        // CREATE New
        await addTransactionToFirestore(type, parsedAmount, category, description, account, date);
        Alert.alert('Success', 'Transaction saved');
      }
      router.back();
    } catch (error) {
      Alert.alert('Error', 'Operation failed.');
    } finally {
      setLoading(false);
    }
  };

  // --- DELETE Handler ---
  const handleDelete = async () => {
    Alert.alert("Delete Transaction", "This will revert the balance on your account. Are you sure?", [
        { text: "Cancel", style: "cancel" },
        { 
            text: "Delete", 
            style: "destructive",
            onPress: async () => {
                setLoading(true);
                try {
                    await deleteTransaction(params.id as string);
                    router.back();
                } catch (e) {
                    Alert.alert("Error", "Could not delete.");
                    setLoading(false);
                }
            }
        }
    ])
  };

  return (
    <KeyboardAvoidingView behavior={behavior} style={{ flex: 1 }}>
      <ScrollView style={styles.container}>
        
        {/* Dynamic Title */}
        <Text style={styles.screenTitle}>{isEditing ? 'Edit Transaction' : 'New Transaction'}</Text>

        <View style={styles.typeSwitcher}>
          <TouchableOpacity style={[styles.typeButton, type === 'Expense' && styles.typeButtonActive]} onPress={() => setType('Expense')}>
            <Text style={[styles.typeButtonText, type === 'Expense' && styles.typeButtonTextActive]}>Expense</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.typeButton, type === 'Income' && styles.typeButtonActive]} onPress={() => setType('Income')}>
            <Text style={[styles.typeButtonText, type === 'Income' && styles.typeButtonTextActive]}>Income</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Amount ($)</Text>
        <TextInput style={styles.input} placeholder="0.00" keyboardType="numeric" value={amount} onChangeText={setAmount} />

        <Text style={styles.label}>Account</Text>
        <View style={[styles.pickerContainer, isEditing && { backgroundColor: '#EEE' }]}>
            {/* Disable Account switching during Edit to prevent complex math issues */}
            <Picker selectedValue={account} onValueChange={setAccount} enabled={!isEditing && realAccounts.length > 0}>
                {realAccounts.map(acc => <Picker.Item label={acc.name} value={acc.name} key={acc.id} />)}
            </Picker>
        </View>
        {isEditing && <Text style={styles.helperText}>Account cannot be changed while editing.</Text>}

        <Text style={styles.label}>Category</Text>
        <View style={styles.pickerContainer}>
            <Picker selectedValue={category} onValueChange={setCategory}>
                {currentCategories.map((cat, index) => <Picker.Item label={cat} value={cat} key={index} />)}
            </Picker>
        </View>

        <Text style={styles.label}>Date</Text>
        <TextInput style={styles.input} value={date} onChangeText={setDate} />

        <Text style={styles.label}>Description</Text>
        <TextInput style={[styles.input, styles.multilineInput]} value={description} onChangeText={setDescription} multiline numberOfLines={3} />

        {/* Save Button */}
        <TouchableOpacity style={[styles.saveButton, loading && styles.buttonDisabled]} onPress={handleSave} disabled={loading}>
          {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.saveButtonText}>{isEditing ? 'Update Transaction' : 'Save Transaction'}</Text>}
        </TouchableOpacity>

        {/* Delete Button (Only if Editing) */}
        {isEditing && (
            <TouchableOpacity style={styles.deleteButton} onPress={handleDelete} disabled={loading}>
                <Text style={styles.deleteButtonText}>Delete Transaction</Text>
            </TouchableOpacity>
        )}

        <View style={{ height: 50 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#F7F7F7' },
  screenTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: '#111' },
  // ... (Keep existing styles for inputs, pickers, etc)
  typeSwitcher: { flexDirection: 'row', marginBottom: 20, backgroundColor: '#E0E0E0', borderRadius: 10, overflow: 'hidden' },
  typeButton: { flex: 1, paddingVertical: 15, alignItems: 'center' },
  typeButtonActive: { backgroundColor: '#10B981' },
  typeButtonText: { fontSize: 16, fontWeight: '600', color: '#333' },
  typeButtonTextActive: { color: '#FFF' },
  label: { fontSize: 14, fontWeight: '700', color: '#444', marginTop: 15, marginBottom: 5 },
  input: { backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 8, paddingHorizontal: 15, paddingVertical: 12, fontSize: 16, color: '#333' },
  multilineInput: { height: 100, textAlignVertical: 'top', paddingTop: 12 },
  pickerContainer: { backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 8, overflow: Platform.OS === 'ios' ? 'hidden' : 'visible' },
  helperText: { fontSize: 12, color: '#666', marginTop: 4, fontStyle: 'italic' },
  saveButton: { backgroundColor: '#2563EB', padding: 18, borderRadius: 10, marginTop: 30, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 3, elevation: 5 },
  saveButtonText: { color: '#FFF', fontSize: 18, fontWeight: '700' },
  buttonDisabled: { opacity: 0.7, backgroundColor: '#9CA3AF' },
  
  // New Delete Button Style
  deleteButton: { backgroundColor: '#FEE2E2', padding: 18, borderRadius: 10, marginTop: 15, alignItems: 'center' },
  deleteButtonText: { color: '#EF4444', fontSize: 18, fontWeight: '700' },
});