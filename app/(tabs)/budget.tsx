import { useTheme } from '@/src/context/ThemeContext';
import { useBudgets } from '@/src/hooks/useBudgets';
import { useTransactions } from '@/src/hooks/useTransactions';
import { addBudgetToFirestore } from '@/src/services/budgetService';
import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

type Budget = {
  id: string;
  category: string;
  limit: number;
  spent: number;
  color: string;
};


const getIconForCategory = (category: string) => {
  const cat = category.toLowerCase();
  if (cat.includes('food') || cat.includes('grocer')) return 'cart';
  if (cat.includes('trans')) return 'car';
  if (cat.includes('rent') || cat.includes('home')) return 'home';
  if (cat.includes('entert')) return 'film';
  return 'wallet';
};


const BudgetCard = ({ item }: { item: Budget }) => {
  const { colors } = useTheme();

  const progress = Math.min(item.spent / item.limit, 1);
  const isOverBudget = item.spent > item.limit;
  const percentText = item.limit > 0 ? Math.round((item.spent / item.limit) * 100) : 0;

  return (
    <View style={[styles.card, { backgroundColor: colors.card }]}>
      <View style={styles.cardHeader}>
        <View style={[styles.iconContainer, { backgroundColor: item.color + '20' }]}>
          <Ionicons name={getIconForCategory(item.category) as any} size={24} color={item.color} />
        </View>
        <View style={styles.cardTexts}>
          <Text style={[styles.categoryTitle, { color: colors.text }]}>{item.category}</Text>
          <Text style={[styles.amountsText, { color: colors.text }]}>
            ${item.spent.toFixed(0)} <Text style={[styles.limitText, { color: colors.textSecondary }]}>/ ${item.limit}</Text>
          </Text>
        </View>
        <Text style={[styles.percentText, { color: isOverBudget ? '#EF4444' : colors.textSecondary }]}>
          {percentText}%
        </Text>
      </View>

      <View style={[styles.progressBarTrack, { backgroundColor: colors.border }]}>
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

      <Text style={[styles.remainingText, { color: colors.textSecondary }]}>
        {isOverBudget
          ? `Over by $${(item.spent - item.limit).toFixed(0)}`
          : `$${(item.limit - item.spent).toFixed(0)} left to spend`
        }
      </Text>
    </View>
  );
};


export default function BudgetScreen() {
  const { colors } = useTheme();

  const [modalVisible, setModalVisible] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [newLimit, setNewLimit] = useState('');
  const [saving, setSaving] = useState(false);

  // Fetch Real Data
  const { budgets, loading: budgetsLoading } = useBudgets();
  const { transactions, loading: transactionsLoading } = useTransactions();

  // Calculate "Spent" for each budget
  const budgetsWithSpending = useMemo(() => {
    return budgets.map((budget: any) => {
      const totalSpent = transactions
        .filter((t: any) =>
          t.type === 'Expense' &&
          t.category.toLowerCase() === budget.category.toLowerCase()
        )
        .reduce((sum: number, t: any) => sum + t.amount, 0);

      return { ...budget, spent: totalSpent };
    });
  }, [budgets, transactions]);

  const totalLimit = budgetsWithSpending.reduce((acc, b) => acc + b.limit, 0);
  const totalSpent = budgetsWithSpending.reduce((acc, b) => acc + b.spent, 0);

  const handleAddBudget = async () => {
    if (!newCategory || !newLimit) {
      Alert.alert('Missing Fields', 'Please fill in both category and limit.');
      return;
    }
    const limitNum = parseFloat(newLimit);
    if (isNaN(limitNum) || limitNum <= 0) return;

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
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#10B981" />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Monthly Budget</Text>

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
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Your Goals</Text>

        {budgetsWithSpending.length === 0 ? (
          <Text style={{ textAlign: 'center', marginTop: 20, color: colors.textSecondary }}>
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
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>New Budget Goal</Text>

            <Text style={[styles.label, { color: colors.text }]}>Category Name</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
              placeholder="e.g. Groceries"
              placeholderTextColor={colors.textSecondary}
              value={newCategory}
              onChangeText={setNewCategory}
            />

            <Text style={[styles.label, { color: colors.text }]}>Monthly Limit ($)</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
              placeholder="e.g. 500"
              placeholderTextColor={colors.textSecondary}
              keyboardType="numeric"
              value={newLimit}
              onChangeText={setNewLimit}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton, { backgroundColor: colors.background }]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={[styles.cancelButtonText, { color: colors.text }]}>Cancel</Text>
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

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 20, paddingTop: 60 },
  headerTitle: { fontSize: 28, fontWeight: '800', marginBottom: 20 },
  summaryCard: { flexDirection: 'row', backgroundColor: '#2f3b57ff', borderRadius: 16, padding: 25, justifyContent: 'space-between', alignItems: 'center', marginBottom: 30, shadowColor: '#2563EB', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 8 },
  summaryLabel: { color: '#BFDBFE', fontSize: 14, marginBottom: 4, fontWeight: '500' },
  summaryValue: { color: '#FFF', fontSize: 24, fontWeight: 'bold' },
  divider: { width: 1, height: '80%', backgroundColor: 'rgba(255,255,255,0.2)' },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 15 },
  card: { padding: 16, borderRadius: 16, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  iconContainer: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  cardTexts: { flex: 1 },
  categoryTitle: { fontSize: 16, fontWeight: '700' },
  amountsText: { fontSize: 14, fontWeight: '600', marginTop: 2 },
  limitText: { fontWeight: '400' },
  percentText: { fontSize: 14, fontWeight: '700' },
  progressBarTrack: { height: 8, borderRadius: 4, overflow: 'hidden', marginBottom: 8 },
  progressBarFill: { height: '100%', borderRadius: 4 },
  remainingText: { fontSize: 12, textAlign: 'right' },
  fab: { position: 'absolute', bottom: 30, right: 30, width: 56, height: 56, borderRadius: 28, backgroundColor: '#111', justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 6 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 8, marginTop: 10 },
  input: { borderRadius: 12, padding: 16, fontSize: 16, borderWidth: 1, borderColor: 'transparent' },
  modalButtons: { flexDirection: 'row', marginTop: 30, gap: 15 },
  button: { flex: 1, padding: 16, borderRadius: 12, alignItems: 'center' },
  cancelButton: {},
  saveButton: { backgroundColor: '#2563EB' },
  cancelButtonText: { fontWeight: '600' },
  saveButtonText: { color: '#FFF', fontWeight: '600' },
});