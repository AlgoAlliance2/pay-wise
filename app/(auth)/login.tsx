// app/(auth)/login.tsx
import { auth } from "@/src/firebase/firebaseConfig";
import { useBehavior } from "@/src/keyboardBehavior";
import { getAuthErrorMessage } from "@/src/utils/authErrors";
import { useRouter } from "expo-router";
import { sendPasswordResetEmail, signInWithEmailAndPassword } from "firebase/auth";
import React, { useState } from "react";
import {
  ActivityIndicator, KeyboardAvoidingView,
  ScrollView,
  StyleSheet,
  Text, TextInput, TouchableOpacity
} from "react-native";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError("");
    setMessage("");
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.replace("/(tabs)/home");
    } catch (err: any) {
      const msg = getAuthErrorMessage(err.code);
      setError(msg);
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError("Enter your email first.");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      setMessage("Password reset link sent to your email.");
    } catch (err: any) {
      setError(getAuthErrorMessage(err.code));
    }
  };

  const behavior = useBehavior();

  return (
  <KeyboardAvoidingView
    behavior={behavior}
    style={{ flex: 1 }}
  >
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Welcome Back</Text>

      {error !== "" && <Text style={styles.error}>{error}</Text>}
      {message !== "" && <Text style={styles.message}>{message}</Text>}

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

      <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#FFF" />
        ) : (
          <Text style={styles.buttonText}>Login</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={handleForgotPassword}>
        <Text style={styles.forgot}>Forgot Password?</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push("/(auth)/register")}>
        <Text style={styles.link}>Create an account</Text>
      </TouchableOpacity>
  </ScrollView>
</KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: "center" },
  title: { fontSize: 28, fontWeight: "bold", textAlign: "center", marginBottom: 20 },
  error: { color: "red", textAlign: "center", marginBottom: 10 },
  message: { color: "green", textAlign: "center", marginBottom: 10 },
  input: { borderWidth: 1, borderColor: "#ccc", padding: 16, borderRadius: 12, marginBottom: 12 },
  button: { backgroundColor: "#2563EB", padding: 16, borderRadius: 12, marginTop: 8 },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "bold", textAlign: "center" },
  forgot: { textAlign: "center", marginTop: 12, color: "#6366F1" },
  link: { marginTop: 16, textAlign: "center", color: "#2563EB", fontWeight: "600" },
});
