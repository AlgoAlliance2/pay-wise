import { db, auth } from "@/src/firebase/firebaseConfig";
import {
  collection,
  doc,
  Timestamp,
  runTransaction,
  query,
  where,
  getDocs,
  orderBy,
  onSnapshot,
  DocumentData,
  QuerySnapshot
} from "firebase/firestore";

export const addTransactionToFirestore = async (
  type: 'Income' | 'Expense',
  amount: number,
  category: string,
  description: string,
  accountName: string, // We receive the Name from the UI
  dateString: string
) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error("User not authenticated");

    // 1. First, we need to find the Account ID based on the Name
    // (Because our Dropdown sends the name, not the ID)
    const accountsRef = collection(db, "accounts");
    const q = query(
      accountsRef,
      where("userId", "==", user.uid),
      where("name", "==", accountName)
    );

    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      throw new Error(`Account '${accountName}' not found.`);
    }

    // Get the reference to the specific account document
    const accountDoc = querySnapshot.docs[0];
    const accountRef = doc(db, "accounts", accountDoc.id);

    // 2. Run the Firestore Transaction (Atomic Operation)
    await runTransaction(db, async (transaction) => {

      // A. Read the latest account data (Vital for accurate balance)
      const sfDoc = await transaction.get(accountRef);
      if (!sfDoc.exists()) {
        throw new Error("Account does not exist!");
      }

      const currentBalance = sfDoc.data().balance || 0;
      let newBalance = currentBalance;

      // B. Calculate the New Balance
      if (type === 'Income') {
        newBalance = currentBalance + amount;
      } else {
        newBalance = currentBalance - amount;
      }

      // C. Update the Account Balance
      transaction.update(accountRef, { balance: newBalance });

      // D. Create the Transaction Record
      const newTransactionRef = doc(collection(db, "transactions"));
      transaction.set(newTransactionRef, {
        userId: user.uid,
        type,
        amount,
        category,
        description,
        account: accountName,
        date: dateString,
        createdAt: Timestamp.now(),
      });
    });

    console.log("Transaction successfully committed!");
    return true;

  } catch (e) {
    console.error("Transaction failed: ", e);
    throw e;
  }
};


export const listenToTransactions = (onUpdate: (data: any[]) => void) => {
  const user = auth.currentUser;

  if (!user) {
    console.log("No user logged in");
    return () => { }; // Return empty unsubscribe function
  }

  // Define the query: "Get transactions for THIS user, ordered by Date (newest first)"
  const q = query(
    collection(db, "transactions"),
    where("userId", "==", user.uid),
    orderBy("date", "desc"),
    orderBy("createdAt", "desc") // Secondary sort for items added same day
  );

  // Start listening
  const unsubscribe = onSnapshot(q, (snapshot: QuerySnapshot<DocumentData>) => {
    const transactions = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Call the callback with the new data
    onUpdate(transactions);
  }, (error) => {
    console.error("Error listening to transactions: ", error);
  });

  return unsubscribe; // Return the cleanup function
};


export const deleteTransaction = async (transactionId: string) => {
  try {
    await runTransaction(db, async (transaction) => {
      const transRef = doc(db, "transactions", transactionId);
      const transDoc = await transaction.get(transRef);

      if (!transDoc.exists()) throw new Error("Transaction not found");

      const transData = transDoc.data();
      const accountName = transData.account;
      const amount = transData.amount;
      const type = transData.type;

      // Find the account to revert balance
      // Note: In a production app, storing accountId on the transaction is safer than name
      // But for this MVP, we look up by name again or assume we passed the ID.
      // Let's look up by name as per previous logic:
      const accountsRef = collection(db, "accounts");
      const q = query(
        accountsRef,
        where("userId", "==", auth.currentUser?.uid),
        where("name", "==", accountName)
      );
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const accountDoc = querySnapshot.docs[0];
        const accountRef = doc(db, "accounts", accountDoc.id);
        const currentBalance = accountDoc.data().balance;

        // REVERT Logic
        let newBalance = currentBalance;
        if (type === 'Income') {
          newBalance = currentBalance - amount; // Remove income
        } else {
          newBalance = currentBalance + amount; // Refund expense
        }

        transaction.update(accountRef, { balance: newBalance });
      }

      // Finally, delete the transaction
      transaction.delete(transRef);
    });
  } catch (error) {
    console.error("Error deleting transaction:", error);
    throw error;
  }
};

// 2. UPDATE Transaction
export const updateTransaction = async (
  transactionId: string,
  newData: any
) => {
  // For simplicity, we will restrict Account switching in Edit mode.
  // We only calculate balance diff if Amount or Type changed.
  try {
    await runTransaction(db, async (transaction) => {
      const transRef = doc(db, "transactions", transactionId);
      const transDoc = await transaction.get(transRef);
      if (!transDoc.exists()) throw new Error("Transaction not found");

      const oldData = transDoc.data();

      // If amount or type changed, update account
      if (oldData.amount !== newData.amount || oldData.type !== newData.type) {
        const accountsRef = collection(db, "accounts");
        const q = query(accountsRef, where("userId", "==", auth.currentUser?.uid), where("name", "==", oldData.account));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const accountDoc = querySnapshot.docs[0];
          const accountRef = doc(db, "accounts", accountDoc.id);
          const currentBalance = accountDoc.data().balance;

          // 1. Revert Old (Undo the old transaction)
          let tempBalance = currentBalance;
          if (oldData.type === 'Income') tempBalance -= oldData.amount;
          else tempBalance += oldData.amount;

          // 2. Apply New (Do the new transaction)
          if (newData.type === 'Income') tempBalance += newData.amount;
          else tempBalance -= newData.amount;

          transaction.update(accountRef, { balance: tempBalance });
        }
      }

      // Update Transaction Doc
      transaction.update(transRef, newData);
    });
  } catch (error) {
    console.error("Error updating:", error);
    throw error;
  }
}