import { useTheme } from '@/src/context/ThemeContext';
import { useAccounts } from '@/src/hooks/useAccounts';
import { addAccountToFirestore } from '@/src/services/accountService';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

type Account = {
  id: string;
  name: string;
  institution: string;
  balance: number;
  type: 'Checking' | 'Savings' | 'Credit Card' | 'Cash';
  color: string;
  isLiability: boolean;
};

export default function AccountsScreen() {
  const { colors } = useTheme();

  const { accounts, loading } = useAccounts();

  const [modalVisible, setModalVisible] = useState(false);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState('');
  const [institution, setInstitution] = useState('');
  const [balance, setBalance] = useState('');
  const [type, setType] = useState<'Checking' | 'Savings' | 'Credit Card' | 'Cash'>('Checking');

  const netWorth = useMemo(() => {
    const assets = accounts
      .filter((a: Account) => !a.isLiability)
      .reduce((sum, a) => sum + a.balance, 0);

    const liabilities = accounts
      .filter((a: Account) => a.isLiability)
      .reduce((sum, a) => sum + a.balance, 0);

    return assets - liabilities;
  }, [accounts]);

  const handleAddAccount = async () => {
    if (!name || !institution || !balance) {
      Alert.alert('Missing Fields', 'Please fill in all fields.');
      return;
    }
    const balanceNum = parseFloat(balance);
    if (isNaN(balanceNum)) {
      Alert.alert('Error', 'Invalid balance amount.');
      return;
    }

    setSaving(true);
    try {
      await addAccountToFirestore(name, institution, balanceNum, type);
      setModalVisible(false);
      setName(''); setInstitution(''); setBalance(''); setType('Checking');
      Alert.alert("Success", "Account added!");
    } catch (e) {
      Alert.alert("Error", "Could not save account.");
    } finally {
      setSaving(false);
    }
  };

  const renderAccountCard = ({ item }: { item: Account }) => (
    <TouchableOpacity
      activeOpacity={0.9}
      style={[styles.card, { backgroundColor: item.color }]}
      onPress={() => Alert.alert('Details', `${item.name}: $${item.balance}`)}
    >
      <View style={styles.cardTop}>
        <Text style={styles.institutionText}>{item.institution}</Text>
        <Ionicons
          name={item.type === 'Credit Card' ? 'card' : item.type === 'Cash' ? 'wallet' : 'business'}
          size={24}
          color="rgba(255,255,255,0.8)"
        />
      </View>

      <View style={styles.cardMiddle}>
        <Text style={styles.accountName}>{item.name}</Text>
        <Text style={styles.accountNumber}>•••• {item.type.toUpperCase()}</Text>
      </View>

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

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>

      {/* Header / Net Worth */}
      <View style={[styles.headerContainer, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>My Accounts</Text>

        {/* Updated Net Worth Card to match Theme */}
        <View style={[styles.netWorthContainer, { backgroundColor: colors.card, shadowColor: colors.text }]}>
          <Text style={[styles.netWorthLabel, { color: colors.textSecondary }]}>Total Net Worth</Text>
          <Text style={[styles.netWorthAmount, { color: colors.text }]}>
            ${netWorth.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </Text>
        </View>
      </View>

      {/* List */}
      <FlatList
        data={accounts}
        keyExtractor={(item) => item.id}
        renderItem={renderAccountCard}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Text style={{ textAlign: 'center', color: colors.textSecondary, marginTop: 30 }}>
            No accounts found. Add one!
          </Text>
        }
      />

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setModalVisible(true)}
      >
        <Ionicons name="add" size={30} color="#FFF" />
      </TouchableOpacity>

      {/* Add Account Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Add New Account</Text>

            <Text style={[styles.label, { color: colors.text }]}>Account Name</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.background, color: colors.text }]}
              placeholder="e.g. Main Checking"
              placeholderTextColor={colors.textSecondary}
              value={name}
              onChangeText={setName}
            />

            <Text style={[styles.label, { color: colors.text }]}>Institution / Bank</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.background, color: colors.text }]}
              placeholder="e.g. Chase"
              placeholderTextColor={colors.textSecondary}
              value={institution}
              onChangeText={setInstitution}
            />

            <Text style={[styles.label, { color: colors.text }]}>Current Balance ($)</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.background, color: colors.text }]}
              placeholder="0.00"
              placeholderTextColor={colors.textSecondary}
              keyboardType="numeric"
              value={balance}
              onChangeText={setBalance}
            />

            <Text style={[styles.label, { color: colors.text }]}>Account Type</Text>
            <View style={[styles.pickerContainer, { backgroundColor: colors.background }]}>
              <Picker
                selectedValue={type}
                onValueChange={(itemValue) => setType(itemValue)}
                dropdownIconColor={colors.text}
                style={{ color: colors.text }}
                itemStyle={{ color: colors.text }}
              >
                <Picker.Item label="Checking" value="Checking" />
                <Picker.Item label="Savings" value="Savings" />
                <Picker.Item label="Credit Card" value="Credit Card" />
                <Picker.Item label="Cash" value="Cash" />
              </Picker>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton, { backgroundColor: colors.background }]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={[styles.cancelButtonText, { color: colors.text }]}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.saveButton]}
                onPress={handleAddAccount}
                disabled={saving}
              >
                {saving ? <ActivityIndicator color="#FFF" /> : <Text style={styles.saveButtonText}>Save</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 }, //
  headerContainer: { paddingTop: 60, paddingHorizontal: 20, paddingBottom: 20, borderBottomWidth: 1 },
  headerTitle: { fontSize: 28, fontWeight: '800', marginBottom: 15 },
  netWorthContainer: { borderRadius: 16, padding: 20, alignItems: 'center', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 5, elevation: 5 },
  netWorthLabel: { fontSize: 14, fontWeight: '600', marginBottom: 5 },
  netWorthAmount: { fontSize: 32, fontWeight: 'bold' },
  listContent: { padding: 20, paddingBottom: 100 },
  card: { borderRadius: 20, padding: 24, marginBottom: 16, height: 180, justifyContent: 'space-between', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 6, elevation: 5 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  institutionText: { color: 'rgba(255,255,255,0.9)', fontSize: 18, fontWeight: '700' },
  cardMiddle: { marginTop: 10 },
  accountName: { color: 'rgba(255,255,255,0.8)', fontSize: 14, marginBottom: 4 },
  accountNumber: { color: '#FFF', fontSize: 18, fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace', letterSpacing: 2, fontWeight: '600' },
  cardBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  balanceLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 12, marginBottom: 2 },
  balanceText: { color: '#FFF', fontSize: 22, fontWeight: 'bold' },
  liabilityBadge: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  liabilityText: { color: '#FFF', fontSize: 10, fontWeight: 'bold', letterSpacing: 1 },
  fab: { position: 'absolute', bottom: 30, right: 30, width: 56, height: 56, borderRadius: 28, backgroundColor: '#2563EB', justifyContent: 'center', alignItems: 'center', shadowColor: '#2563EB', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 4, elevation: 6 },
  // Modal Styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 8, marginTop: 10 },
  input: { borderRadius: 12, padding: 16, fontSize: 16 },
  pickerContainer: { borderRadius: 12, overflow: 'hidden', marginTop: 5 },
  modalButtons: { flexDirection: 'row', marginTop: 30, gap: 15 },
  button: { flex: 1, padding: 16, borderRadius: 12, alignItems: 'center' },
  cancelButton: {},
  saveButton: { backgroundColor: '#2563EB' },
  cancelButtonText: { fontWeight: '600' },
  saveButtonText: { color: '#FFF', fontWeight: '600' },
});