import React, { useState, useMemo } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, TextInput, Alert, ActivityIndicator 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
// 1. Import Services & Hooks
import { useBudgets } from '@/src/hooks/useBudgets';
import { useTransactions } from '@/src/hooks/useTransactions'; // We need this to calculate spending!
import { addBudgetToFirestore } from '@/src/services/budgetService';

// --- Types ---
type Budget = {
  id: string;
  category: string;
  limit: number;
  spent: number; // We will calculate this
  color: string;
};

// --- Helper: Icon Mapper ---
const getIconForCategory = (category: string) => {
  const cat = category.toLowerCase();
  if (cat.includes('food') || cat.includes('grocer')) return 'cart';
  if (cat.includes('trans')) return 'car';
  if (cat.includes('rent') || cat.includes('home')) return 'home';
  if (cat.includes('entert')) return 'film';
  return 'wallet';
};

// --- Component: Budget Card ---
const BudgetCard = ({ item }: { item: Budget }) => {
  const progress = Math.min(item.spent / item.limit, 1);
  const isOverBudget = item.spent > item.limit;
  const percentText = item.limit > 0 ? Math.round((item.spent / item.limit) * 100) : 0;

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={[styles.iconContainer, { backgroundColor: item.color + '20' }]}>
          <Ionicons name={getIconForCategory(item.category) as any} size={24} color={item.color} />
        </View>
        <View style={styles.cardTexts}>
          <Text style={styles.categoryTitle}>{item.category}</Text>
          <Text style={styles.amountsText}>
            ${item.spent.toFixed(0)} <Text style={styles.limitText}>/ ${item.limit}</Text>
          </Text>
        </View>
        <Text style={[styles.percentText, { color: isOverBudget ? '#EF4444' : '#666' }]}>
          {percentText}%
        </Text>
      </View>

      <View style={styles.progressBarTrack}>
        <View 
          style={[
            styles.progressBarFill, 
            { 
              width: `${progress * 100}%`,
              backgroundColor: isOverBudget ? '#EF4444' : item.color 
            }
          ]} 
        />
      </View>

      <Text style={styles.remainingText}>
        {isOverBudget 
          ? `Over by $${(item.spent - item.limit).toFixed(0)}`
          : `$${(item.limit - item.spent).toFixed(0)} left to spend`
        }
      </Text>
    </View>
  );
};

// --- Main Screen ---
export default function BudgetScreen() {
  const [modalVisible, setModalVisible] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [newLimit, setNewLimit] = useState('');
  const [saving, setSaving] = useState(false);

  // 2. Fetch Real Data
  const { budgets, loading: budgetsLoading } = useBudgets();
  const { transactions, loading: transactionsLoading } = useTransactions();

  // 3. Calculate "Spent" for each budget
  const budgetsWithSpending = useMemo(() => {
    return budgets.map((budget: any) => {
      // Find all EXPENSES that match this budget's category
      const totalSpent = transactions
        .filter((t: any) => 
          t.type === 'Expense' && 
          t.category.toLowerCase() === budget.category.toLowerCase()
        )
        .reduce((sum: number, t: any) => sum + t.amount, 0);

      return { ...budget, spent: totalSpent };
    });
  }, [budgets, transactions]);

  // 4. Calculate Totals for Summary Header
  const totalLimit = budgetsWithSpending.reduce((acc, b) => acc + b.limit, 0);
  const totalSpent = budgetsWithSpending.reduce((acc, b) => acc + b.spent, 0);

  // 5. Save Function
  const handleAddBudget = async () => {
    if (!newCategory || !newLimit) {
      Alert.alert('Missing Fields', 'Please fill in both category and limit.');
      return;
    }
    const limitNum = parseFloat(newLimit);
    if(isNaN(limitNum) || limitNum <= 0) return;

    setSaving(true);
    try {
      await addBudgetToFirestore(newCategory, limitNum);
      setModalVisible(false);
      setNewCategory('');
      setNewLimit('');
      Alert.alert("Success", "Budget goal added!");
    } catch (e) {
      Alert.alert("Error", "Could not save budget.");
    } finally {
      setSaving(false);
    }
  };

  const isLoading = budgetsLoading || transactionsLoading;

  if (isLoading) {
     return (
       <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
         <ActivityIndicator size="large" color="#10B981" />
       </View>
     );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.headerTitle}>Monthly Budget</Text>

        {/* Summary Card */}
        <View style={styles.summaryCard}>
          <View>
            <Text style={styles.summaryLabel}>Total Spent</Text>
            <Text style={styles.summaryValue}>${totalSpent.toFixed(0)}</Text>
          </View>
          <View style={styles.divider} />
          <View>
            <Text style={styles.summaryLabel}>Total Budget</Text>
            <Text style={styles.summaryValue}>${totalLimit.toFixed(0)}</Text>
          </View>
        </View>

        {/* Budget List */}
        <Text style={styles.sectionTitle}>Your Goals</Text>
        
        {budgetsWithSpending.length === 0 ? (
          <Text style={{ textAlign: 'center', marginTop: 20, color: '#999' }}>
            No budget goals set. Add one below!
          </Text>
        ) : (
          budgetsWithSpending.map((budget) => (
            <BudgetCard key={budget.id} item={budget} />
          ))
        )}

        <View style={{ height: 100 }} /> 
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity 
        style={styles.fab} 
        onPress={() => setModalVisible(true)}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={30} color="#FFF" />
      </TouchableOpacity>

      {/* Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>New Budget Goal</Text>
            
            <Text style={styles.label}>Category Name</Text>
            <TextInput 
              style={styles.input} 
              placeholder="e.g. Groceries" // Matching transaction category names is key!
              value={newCategory}
              onChangeText={setNewCategory}
            />

            <Text style={styles.label}>Monthly Limit ($)</Text>
            <TextInput 
              style={styles.input} 
              placeholder="e.g. 500"
              keyboardType="numeric"
              value={newLimit}
              onChangeText={setNewLimit}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.button, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.button, styles.saveButton]}
                onPress={handleAddBudget}
                disabled={saving}
              >
                {saving ? (
                   <ActivityIndicator color="#FFF" />
                ) : (
                   <Text style={styles.saveButtonText}>Save</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </View>
  );
}

// Reuse your existing styles...
const styles = StyleSheet.create({
  // ... (Paste the exact same styles from the previous version of budget.tsx)
  // Or if you need me to paste them again, let me know, but they haven't changed!
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  scrollContent: { padding: 20, paddingTop: 60 },
  headerTitle: { fontSize: 28, fontWeight: '800', color: '#111', marginBottom: 20 },
  summaryCard: { flexDirection: 'row', backgroundColor: '#2563EB', borderRadius: 16, padding: 25, justifyContent: 'space-between', alignItems: 'center', marginBottom: 30, shadowColor: '#2563EB', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 8 },
  summaryLabel: { color: '#BFDBFE', fontSize: 14, marginBottom: 4, fontWeight: '500' },
  summaryValue: { color: '#FFF', fontSize: 24, fontWeight: 'bold' },
  divider: { width: 1, height: '80%', backgroundColor: 'rgba(255,255,255,0.2)' },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#374151', marginBottom: 15 },
  card: { backgroundColor: '#FFF', padding: 16, borderRadius: 16, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  iconContainer: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  cardTexts: { flex: 1 },
  categoryTitle: { fontSize: 16, fontWeight: '700', color: '#1F2937' },
  amountsText: { fontSize: 14, fontWeight: '600', color: '#111', marginTop: 2 },
  limitText: { color: '#9CA3AF', fontWeight: '400' },
  percentText: { fontSize: 14, fontWeight: '700' },
  progressBarTrack: { height: 8, backgroundColor: '#E5E7EB', borderRadius: 4, overflow: 'hidden', marginBottom: 8 },
  progressBarFill: { height: '100%', borderRadius: 4 },
  remainingText: { fontSize: 12, color: '#6B7280', textAlign: 'right' },
  fab: { position: 'absolute', bottom: 30, right: 30, width: 56, height: 56, borderRadius: 28, backgroundColor: '#111', justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 6 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#FFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  label: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8, marginTop: 10 },
  input: { backgroundColor: '#F3F4F6', borderRadius: 12, padding: 16, fontSize: 16 },
  modalButtons: { flexDirection: 'row', marginTop: 30, gap: 15 },
  button: { flex: 1, padding: 16, borderRadius: 12, alignItems: 'center' },
  cancelButton: { backgroundColor: '#F3F4F6' },
  saveButton: { backgroundColor: '#2563EB' },
  cancelButtonText: { color: '#374151', fontWeight: '600' },
  saveButtonText: { color: '#FFF', fontWeight: '600' },
});