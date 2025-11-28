import { 
  collection, 
  addDoc, 
  query, 
  where, 
  onSnapshot,
  Timestamp 
} from "firebase/firestore";
import { db, auth } from "@/src/firebase/firebaseConfig";

// Helper for card colors
const CARD_COLORS = {
  'Checking': '#1E293B',    // Dark Slate
  'Savings': '#059669',     // Emerald
  'Credit Card': '#7C3AED', // Violet
  'Cash': '#D97706',        // Amber
};

export const addAccountToFirestore = async (
  name: string,
  institution: string,
  balance: number,
  type: 'Checking' | 'Savings' | 'Credit Card' | 'Cash'
) => {
  const user = auth.currentUser;
  if (!user) throw new Error("User not authenticated");

  try {
    await addDoc(collection(db, "accounts"), {
      userId: user.uid,
      name,
      institution,
      balance,
      type,
      // Automatically determine if it's a debt/liability
      isLiability: type === 'Credit Card', 
      color: CARD_COLORS[type] || '#333',
      createdAt: Timestamp.now(),
    });
  } catch (error) {
    console.error("Error adding account:", error);
    throw error;
  }
};

export const listenToAccounts = (onUpdate: (data: any[]) => void) => {
  const user = auth.currentUser;
  if (!user) return () => {};

  const q = query(
    collection(db, "accounts"),
    where("userId", "==", user.uid)
  );

  return onSnapshot(q, (snapshot) => {
    const accounts = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    onUpdate(accounts);
  });
};