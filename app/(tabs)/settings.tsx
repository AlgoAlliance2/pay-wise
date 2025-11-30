import { useTheme } from '@/src/context/ThemeContext';
import { auth } from '@/src/firebase/firebaseConfig';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { signOut } from 'firebase/auth';
import React from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

type SettingItemProps = {
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  label: string;
  type?: 'link' | 'toggle' | 'button';
  value?: boolean;
  onToggle?: (val: boolean) => void;
  onPress?: () => void;
  isDestructive?: boolean;
  textColor?: string;
};

const SettingItem = ({
  icon,
  color,
  label,
  type = 'link',
  value,
  onToggle,
  onPress,
  isDestructive = false,
  textColor = '#111'
}: SettingItemProps) => (
  <TouchableOpacity
    style={styles.itemContainer}
    onPress={onPress}
    disabled={type === 'toggle'}
    activeOpacity={0.7}
  >
    <View style={styles.itemLeft}>
      <View style={[styles.iconContainer, { backgroundColor: color }]}>
        <Ionicons name={icon} size={20} color="#FFF" />
      </View>
      <Text style={[
        styles.itemLabel,
        isDestructive && styles.destructiveLabel,
        !isDestructive && { color: textColor }
      ]}>
        {label}
      </Text>
    </View>

    <View style={styles.itemRight}>
      {type === 'toggle' && (
        <Switch
          value={value}
          onValueChange={onToggle}
          trackColor={{ false: '#E5E7EB', true: '#10B981' }}
          thumbColor="#FFF"
        />
      )}
      {type === 'link' && (
        <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
      )}
    </View>
  </TouchableOpacity>
);

export default function SettingsScreen() {
  const router = useRouter();
  const user = auth.currentUser;


  const { colors, isDarkMode, toggleTheme } = useTheme();

  const handleLogout = async () => {
    Alert.alert(
      "Log Out",
      "Are you sure you want to log out?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Log Out",
          style: "destructive",
          onPress: async () => {
            try {
              await signOut(auth);

              router.replace('/(auth)/login');
            } catch (error) {
              Alert.alert("Error", "Failed to log out. Please try again.");
            }
          }
        }
      ]
    );
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>

      <Text style={[styles.headerTitle, { color: colors.text }]}>Settings</Text>

      {/* Profile Section */}
      <View style={[styles.profileSection, { backgroundColor: colors.card, shadowColor: isDarkMode ? '#000' : '#CCC' }]}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user?.email?.charAt(0).toUpperCase()}</Text>
        </View>
        <View style={styles.profileInfo}>
          <Text style={[styles.profileName, { color: colors.text }]}>My Account</Text>
          <Text style={[styles.profileEmail, { color: colors.textSecondary }]}>{user?.email}</Text>
        </View>
        <TouchableOpacity style={styles.editButton}>
          <Text style={styles.editButtonText}>Edit</Text>
        </TouchableOpacity>
      </View>

      <Text style={[styles.sectionHeader, { color: colors.textSecondary }]}>Preferences</Text>

      <View style={[styles.sectionContainer, { backgroundColor: colors.card }]}>
        <View style={styles.itemContainer}>
          <View style={styles.itemLeft}>
            <View style={[styles.iconContainer, { backgroundColor: '#6366F1' }]}>
              <Ionicons name="moon" size={20} color="#FFF" />
            </View>
            <Text style={[styles.itemLabel, { color: colors.text }]}>Dark Mode</Text>
          </View>
          <Switch
            value={isDarkMode}
            onValueChange={toggleTheme}
            trackColor={{ false: '#E5E7EB', true: '#10B981' }}
          />
        </View>

      </View>

      <Text style={[styles.sectionHeader, { color: colors.textSecondary }]}>Support</Text>
      <View style={[styles.sectionContainer, { backgroundColor: colors.card }]}>
        <SettingItem
          icon="help-buoy"
          color="#10B981"
          label="Help Center"
          textColor={colors.text}
          onPress={() => { }}
        />
        <View style={[styles.separator, { backgroundColor: colors.background }]} />
        <SettingItem
          icon="lock-closed"
          color="#8B5CF6"
          label="Privacy Policy"
          textColor={colors.text}
          onPress={() => { }}
        />
      </View>


      <Text style={[styles.sectionHeader, { color: colors.textSecondary }]}>Account</Text>
      <View style={[styles.sectionContainer, { backgroundColor: colors.card }]}>
        <SettingItem
          icon="log-out"
          color="#EF4444"
          label="Log Out"
          type="button"
          isDestructive
          onPress={handleLogout}
        />
      </View>

      <Text style={styles.versionText}>Version 1.0.0 • Built with Expo</Text>
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  headerTitle: {
    fontSize: 30,
    fontWeight: '800',
    marginBottom: 20,
  },

  // Profile Section
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: '#6B7280',
  },
  editButton: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  editButtonText: {
    color: '#2563EB',
    fontWeight: '600',
    fontSize: 12,
  },

  // Grouped Lists
  sectionHeader: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 8,
    marginLeft: 10,
    textTransform: 'uppercase',
  },
  sectionContainer: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  separator: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginLeft: 50,
  },

  // Setting Item
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  itemLabel: {
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '500',
  },
  destructiveLabel: {
    color: '#EF4444',
    fontWeight: '600',
  },
  itemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  // Footer
  versionText: {
    textAlign: 'center',
    color: '#9CA3AF',
    fontSize: 13,
    marginBottom: 20,
  },
});