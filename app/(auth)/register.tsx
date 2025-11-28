// app/(auth)/register.tsx
import React, { useState } from "react";
import {
  Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator,KeyboardAvoidingView, Platform, ScrollView
} from "react-native";

import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/src/firebase/firebaseConfig";
import { useRouter } from "expo-router";
import { getAuthErrorMessage } from "@/src/utils/authErrors";
import { useBehavior } from "./login";

export default function RegisterPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);


  const handleRegister = async () => {
    setError("");

    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      router.replace("/(tabs)/home");
    } catch (err: any) {
      const msg = getAuthErrorMessage(err.code);
      setError(msg);
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const behavior = useBehavior();

  return (
  <KeyboardAvoidingView
    behavior={behavior}
    style={{ flex: 1 }}
  >
    <ScrollView contentContainerStyle={styles.container}>

      <Text style={styles.title}>Create an Account</Text>

      {error !== "" && <Text style={styles.error}>{error}</Text>}

      <TextInput
        placeholder="Email"
        autoCapitalize="none"
        style={styles.input}
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        placeholder="Password"
        secureTextEntry
        style={styles.input}
        value={password}
        onChangeText={setPassword}
      />

      <TextInput
        placeholder="Confirm Password"
        secureTextEntry
        style={styles.input}
        value={confirm}
        onChangeText={setConfirm}
      />

      <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#FFF" />
        ) : (
          <Text style={styles.buttonText}>Sign Up</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push("/(auth)/login")}>
        <Text style={styles.link}>Already have an account? Login</Text>
      </TouchableOpacity>
    </ScrollView>
  </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: "center" },
  title: { fontSize: 28, fontWeight: "bold", textAlign: "center", marginBottom: 20 },
  error: { color: "red", textAlign: "center", marginBottom: 10 },
  input: { borderWidth: 1, borderColor: "#ccc", padding: 16, borderRadius: 12, marginBottom: 12 },
  button: { backgroundColor: "#10B981", padding: 16, borderRadius: 12, marginTop: 8 },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "bold", textAlign: "center" },
  link: { marginTop: 16, textAlign: "center", color: "#2563EB", fontWeight: "600" },
});
