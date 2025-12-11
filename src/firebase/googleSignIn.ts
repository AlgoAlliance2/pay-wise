import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { auth } from './firebaseConfig';

export function useGoogleSignIn() {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Configurarea se face o singură dată la inițializarea aplicației
    GoogleSignin.configure({
      // Client ID-ul de tip WEB din Google Cloud Console
      webClientId: '845420920754-fm8j6nnl98u12mjm0fprl0n2mmcas872.apps.googleusercontent.com', 
      offlineAccess: true,
    });
  }, []);

  const signInWithGoogle = async () => {
    setLoading(true);
    try {
      // 1. Verifică serviciile Google (doar pt Android)
      await GoogleSignin.hasPlayServices();
      
      // 2. Deschide fereastra nativă de login
      const response = await GoogleSignin.signIn();
      
      // 3. Extrage idToken-ul (ACESTA ESTE RĂSPUNSUL STANDARD)
      // Tipul complet: { idToken: string, user: User, ... }
      const idToken = (response as any).idToken;

      if (!idToken) {
        throw new Error("Nu s-a putut obține ID Token-ul de la Google.");
      }

      // 4. Autentificare în Firebase cu token-ul primit
      const credential = GoogleAuthProvider.credential(idToken);
      await signInWithCredential(auth, credential);
      
      console.log("SUCCESS: Google Sign-In + Firebase login!");
    } catch (error: any) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        console.log("Logare anulată de utilizator.");
      } else if (error.code === statusCodes.IN_PROGRESS) {
        console.log("Logarea este deja în curs.");
      } else {
        console.error("Eroare Google Sign-In:", error);
        alert("Eroare la logarea cu Google. Detalii: " + error.code);
      }
    } finally {
      setLoading(false);
    }
  };

  return { signInWithGoogle, loading };
}