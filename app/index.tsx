// app/index.tsx
import { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { auth } from "../src/firebase/firebaseConfig";
import { useRouter } from "expo-router";

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) {
        router.replace("/(tabs)/home");
      } else {
        router.replace("/(auth)/login");
      }
    });
    return unsubscribe;
  }, []);

  return (
    <View className="flex-1 items-center justify-center">
      <ActivityIndicator size="large" />
    </View>
  );
}
