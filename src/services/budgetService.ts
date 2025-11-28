import { 
  collection, 
  addDoc, 
  query, 
  where, 
  onSnapshot,
  Timestamp 
} from "firebase/firestore";
import { db, auth } from "@/src/firebase/firebaseConfig";

// Helper to assign a random color to new budgets
const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];
const getRandomColor = () => COLORS[Math.floor(Math.random() * COLORS.length)];

export const addBudgetToFirestore = async (category: string, limit: number) => {
  const user = auth.currentUser;
  if (!user) throw new Error("User not authenticated");

  try {
    await addDoc(collection(db, "budgets"), {
      userId: user.uid,
      category, // e.g., "Groceries"
      limit,    // e.g., 500
      color: getRandomColor(),
      createdAt: Timestamp.now(),
    });
  } catch (error) {
    console.error("Error adding budget:", error);
    throw error;
  }
};

export const listenToBudgets = (onUpdate: (data: any[]) => void) => {
  const user = auth.currentUser;
  if (!user) return () => {};

  const q = query(
    collection(db, "budgets"),
    where("userId", "==", user.uid)
  );

  return onSnapshot(q, (snapshot) => {
    const budgets = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    onUpdate(budgets);
  });
};