import { Slot, useRouter } from "expo-router";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../src/firebase/firebaseConfig";
import { useEffect } from "react";

export default function RootLayout() {
  const router = useRouter();
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) router.replace("/(tabs)/home");
      else router.replace("/(auth)/login");
    });

    return unsub;
  }, []);

  return <Slot />;
}
