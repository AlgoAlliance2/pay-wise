import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Modal, 
  TextInput,
  Platform,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

// --- Types ---
type Budget = {
  id: string;
  category: string;
  limit: number;
  spent: number;
  icon: string;
  color: string;
};

// --- Mock Data ---
const MOCK_BUDGETS: Budget[] = [
  { id: '1', category: 'Groceries', limit: 500, spent: 350, icon: 'cart', color: '#10B981' }, // Green
  { id: '2', category: 'Transport', limit: 200, spent: 180, icon: 'car', color: '#F59E0B' }, // Orange (Warning)
  { id: '3', category: 'Entertainment', limit: 150, spent: 160, icon: 'film', color: '#EF4444' }, // Red (Over)
  { id: '4', category: 'Dining Out', limit: 300, spent: 120, icon: 'restaurant', color: '#3B82F6' }, // Blue
];

// --- Custom Progress Bar Component ---
const BudgetCard = ({ item }: { item: Budget }) => {
  const progress = Math.min(item.spent / item.limit, 1); // Cap at 100% for the bar width
  const isOverBudget = item.spent > item.limit;
  const percentText = Math.round((item.spent / item.limit) * 100);

  return (
    <View style={styles.card}>
      {/* Header: Icon + Category + Amount */}
      <View style={styles.cardHeader}>
        <View style={[styles.iconContainer, { backgroundColor: item.color + '20' }]}>
          <Ionicons name={item.icon as any} size={24} color={item.color} />
        </View>
        <View style={styles.cardTexts}>
          <Text style={styles.categoryTitle}>{item.category}</Text>
          <Text style={styles.amountsText}>
            ${item.spent.toFixed(0)} <Text style={styles.limitText}>/ ${item.limit}</Text>
          </Text>
        </View>
        <Text style={[
          styles.percentText, 
          { color: isOverBudget ? '#EF4444' : '#666' }
        ]}>
          {percentText}%
        </Text>
      </View>

      {/* Progress Bar Track */}
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

      {/* Footer Message */}
      <Text style={styles.remainingText}>
        {isOverBudget 
          ? `Over by $${(item.spent - item.limit).toFixed(0)}`
          : `$${(item.limit - item.spent).toFixed(0)} left to spend`
        }
      </Text>
    </View>
  );
};

export default function BudgetScreen() {
  const [modalVisible, setModalVisible] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [newLimit, setNewLimit] = useState('');

  // Calculate totals for the summary header
  const totalLimit = MOCK_BUDGETS.reduce((acc, b) => acc + b.limit, 0);
  const totalSpent = MOCK_BUDGETS.reduce((acc, b) => acc + b.spent, 0);

  const handleAddBudget = () => {
    if (!newCategory || !newLimit) {
      Alert.alert('Missing Fields', 'Please fill in both category and limit.');
      return;
    }
    setModalVisible(false);
    setNewCategory('');
    setNewLimit('');
    Alert.alert('Success', 'Budget created! (This is a mock action)');
  };

  return (
    <View style={styles.container}>
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Page Title */}
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
        {MOCK_BUDGETS.map((budget) => (
          <BudgetCard key={budget.id} item={budget} />
        ))}

        <View style={{ height: 100 }} /> 
      </ScrollView>

      {/* FAB to Add Budget */}
      <TouchableOpacity 
        style={styles.fab} 
        onPress={() => setModalVisible(true)}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={30} color="#FFF" />
      </TouchableOpacity>

      {/* Create Budget Modal */}
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
              placeholder="e.g. Travel"
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
              >
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollContent: {
    padding: 20,
    paddingTop: 60,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111',
    marginBottom: 20,
  },

  // Summary Card
  summaryCard: {
    flexDirection: 'row',
    backgroundColor: '#2563EB',
    borderRadius: 16,
    padding: 25,
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  summaryLabel: {
    color: '#BFDBFE', // Light blue
    fontSize: 14,
    marginBottom: 4,
    fontWeight: '500',
  },
  summaryValue: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  divider: {
    width: 1,
    height: '80%',
    backgroundColor: 'rgba(255,255,255,0.2)',
  },

  // Budget Cards
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 15,
  },
  card: {
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardTexts: {
    flex: 1,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
  },
  amountsText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111',
    marginTop: 2,
  },
  limitText: {
    color: '#9CA3AF',
    fontWeight: '400',
  },
  percentText: {
    fontSize: 14,
    fontWeight: '700',
  },
  
  // Custom Progress Bar
  progressBarTrack: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  remainingText: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'right',
  },

  // FAB
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#111',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    marginTop: 10,
  },
  input: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    marginTop: 30,
    gap: 15,
  },
  button: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#F3F4F6',
  },
  saveButton: {
    backgroundColor: '#2563EB',
  },
  cancelButtonText: {
    color: '#374151',
    fontWeight: '600',
  },
  saveButtonText: {
    color: '#FFF',
    fontWeight: '600',
  },
});