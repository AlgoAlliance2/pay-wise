import { DEFAULT_EXPENSE_CATEGORIES, DEFAULT_INCOME_CATEGORIES } from '@/src/constants/categories';
import { useTheme } from '@/src/context/ThemeContext';
import { useAccounts } from '@/src/hooks/useAccounts';
import { useBudgets } from '@/src/hooks/useBudgets';
import { useBehavior } from '@/src/keyboardBehavior';
import { addTransactionToFirestore, deleteTransaction, updateTransaction } from '@/src/services/transactionService';
import { Picker } from '@react-native-picker/picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput, TouchableOpacity,
  View
} from 'react-native';

type TransactionType = 'Expense' | 'Income';

export default function AddTransactionScreen() {
  const router = useRouter();
  const behavior = useBehavior();
  const params = useLocalSearchParams();

  const { colors, isDarkMode } = useTheme();

  const isEditing = !!params.id;

  const { accounts: realAccounts } = useAccounts();
  const { budgets } = useBudgets();

  const [type, setType] = useState<TransactionType>('Expense');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [account, setAccount] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState(new Date().toISOString().substring(0, 10));
  const [loading, setLoading] = useState(false);

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

  const currentCategories = useMemo(() => {
    if (type === 'Income') return DEFAULT_INCOME_CATEGORIES;
    const budgetCategoryNames = budgets.map(b => b.category);
    return Array.from(new Set([...DEFAULT_EXPENSE_CATEGORIES, ...budgetCategoryNames])).sort();
  }, [type, budgets]);

  useEffect(() => {
    if (!isEditing && currentCategories.length > 0 && !category) {
      setCategory(currentCategories[0]);
    }
  }, [currentCategories, category, isEditing]);

  useEffect(() => {
    if (!isEditing && realAccounts.length > 0 && account === '') {
      setAccount(realAccounts[0].name);
    }
  }, [realAccounts, account, isEditing]);

  const handleSave = async () => {
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) return Alert.alert('Error', 'Invalid amount');
    if (!account) return Alert.alert('Error', 'Select an account');

    setLoading(true);
    try {
      if (isEditing) {
        await updateTransaction(params.id as string, {
          type,
          amount: parsedAmount,
          category,
          description,
          date,
        });
        Alert.alert('Updated', 'Transaction updated successfully');
      } else {
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
    <KeyboardAvoidingView behavior={behavior} style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>

        <Text style={[styles.screenTitle, { color: colors.text }]}>
          {isEditing ? 'Edit Transaction' : 'New Transaction'}
        </Text>

        <View style={[styles.typeSwitcher, { backgroundColor: colors.border }]}>
          <TouchableOpacity
            style={[styles.typeButton, type === 'Expense' && styles.typeButtonActive]}
            onPress={() => setType('Expense')}
          >
            <Text style={[styles.typeButtonText, { color: type === 'Expense' ? '#FFF' : colors.text }]}>Expense</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.typeButton, type === 'Income' && styles.typeButtonActive]}
            onPress={() => setType('Income')}
          >
            <Text style={[styles.typeButtonText, { color: type === 'Income' ? '#FFF' : colors.text }]}>Income</Text>
          </TouchableOpacity>
        </View>

        <Text style={[styles.label, { color: colors.text }]}>Amount ($)</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
          placeholder="0.00"
          placeholderTextColor={colors.textSecondary}
          keyboardType="numeric"
          value={amount}
          onChangeText={setAmount}
        />

        <Text style={[styles.label, { color: colors.text }]}>Account</Text>
        <View style={[
          styles.pickerContainer,
          { backgroundColor: colors.card, borderColor: colors.border },
          // If editing, grey it out differently for dark mode
          isEditing && { backgroundColor: isDarkMode ? '#333' : '#EEE' }
        ]}>
          <Picker
            selectedValue={account}
            onValueChange={setAccount}
            enabled={!isEditing && realAccounts.length > 0}
            dropdownIconColor={colors.text}
            style={{ color: colors.text }}
            itemStyle={{ color: colors.text }}
          >
            {realAccounts.map(acc => <Picker.Item label={acc.name} value={acc.name} key={acc.id} />)}
          </Picker>
        </View>
        {isEditing && <Text style={[styles.helperText, { color: colors.textSecondary }]}>Account cannot be changed while editing.</Text>}

        <Text style={[styles.label, { color: colors.text }]}>Category</Text>
        <View style={[styles.pickerContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Picker
            selectedValue={category}
            onValueChange={setCategory}
            dropdownIconColor={colors.text}
            style={{ color: colors.text }}
            itemStyle={{ color: colors.text }}
          >
            {currentCategories.map((cat, index) => <Picker.Item label={cat} value={cat} key={index} />)}
          </Picker>
        </View>

        <Text style={[styles.label, { color: colors.text }]}>Date</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
          value={date}
          onChangeText={setDate}
          placeholderTextColor={colors.textSecondary}
        />

        <Text style={[styles.label, { color: colors.text }]}>Description</Text>
        <TextInput
          style={[styles.input, styles.multilineInput, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={3}
          placeholderTextColor={colors.textSecondary}
        />

        {/* Save Button */}
        <TouchableOpacity style={[styles.saveButton, loading && styles.buttonDisabled]} onPress={handleSave} disabled={loading}>
          {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.saveButtonText}>{isEditing ? 'Update Transaction' : 'Save Transaction'}</Text>}
        </TouchableOpacity>

        {/* Delete Button */}
        {isEditing && (
          <TouchableOpacity
            style={[styles.deleteButton, { backgroundColor: isDarkMode ? '#3f1a1a' : '#FEE2E2' }]}
            onPress={handleDelete}
            disabled={loading}
          >
            <Text style={styles.deleteButtonText}>Delete Transaction</Text>
          </TouchableOpacity>
        )}
        <View style={{ height: 50 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  screenTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  typeSwitcher: { flexDirection: 'row', marginBottom: 20, borderRadius: 10, overflow: 'hidden' },
  typeButton: { flex: 1, paddingVertical: 15, alignItems: 'center' },
  typeButtonActive: { backgroundColor: '#10B981' },
  typeButtonText: { fontSize: 16, fontWeight: '600' },
  label: { fontSize: 14, fontWeight: '700', marginTop: 15, marginBottom: 5 },
  input: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 15, paddingVertical: 12, fontSize: 16 },
  multilineInput: { height: 100, textAlignVertical: 'top', paddingTop: 12 },
  pickerContainer: { borderWidth: 1, borderRadius: 8, overflow: Platform.OS === 'ios' ? 'hidden' : 'visible' },
  helperText: { fontSize: 12, marginTop: 4, fontStyle: 'italic' },
  saveButton: { backgroundColor: '#2563EB', padding: 18, borderRadius: 10, marginTop: 30, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 3, elevation: 5 },
  saveButtonText: { color: '#FFF', fontSize: 18, fontWeight: '700' },
  buttonDisabled: { opacity: 0.7, backgroundColor: '#9CA3AF' },
  deleteButton: { padding: 18, borderRadius: 10, marginTop: 15, alignItems: 'center' },
  deleteButtonText: { color: '#EF4444', fontSize: 18, fontWeight: '700' },
});