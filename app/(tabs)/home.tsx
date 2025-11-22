import { useRouter } from "expo-router";
import { signOut } from "firebase/auth";
import React from "react";
import { Button, Text, View } from "react-native";
import { auth } from "../../src/firebase/firebaseConfig";

export default function Home() {
  const router = useRouter();

  const handleLogout = async () => {
    await signOut(auth);
    router.replace("/(auth)/login");
  };

  return (
    <View className="flex-1 items-center justify-center">
      <Text>Welcome Home!</Text>
      <Button title="Logout" onPress={handleLogout} />
    </View>
  );
}
