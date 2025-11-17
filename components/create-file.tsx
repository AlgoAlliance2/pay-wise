import { db } from "../src/firebase/firebaseConfig";
import { collection, addDoc } from "firebase/firestore";


export async function testFirestore() {
  try {
    console.log("testFirestore called now");
    const docRef = await addDoc(collection(db, "testCollection"), {
      name: "Test Item",
      timestamp: new Date(),
    });
    console.log("Document written with ID:", docRef.id);
  } catch (error) {
    console.error("Firestore error:", error);
  }
}
