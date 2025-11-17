import React, { useEffect } from "react";
import { auth, db } from "../../src/firebase/firebaseConfig";
import { testFirestore } from "../../components/create-file";
import { StyleSheet } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Fonts } from '@/constants/theme';


export default function App() {
  useEffect(() => {
  if (!db) {
    console.error("Firestore not initialized!");
    return;
  }
  testFirestore();
}, []);


  return (
    <ThemedView style={styles.titleContainer}>
            <ThemedText
              type="title"
              style={{
                fontFamily: Fonts.rounded,
              }}>
              Explore
            </ThemedText>
            </ThemedView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    color: '#808080',
    bottom: -90,
    left: -35,
    position: 'absolute',
  },
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
  },
});