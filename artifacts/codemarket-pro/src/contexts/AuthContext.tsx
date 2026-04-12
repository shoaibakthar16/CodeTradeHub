import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import {
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  type User,
} from "firebase/auth";
import { auth } from "../lib/firebase";
import { createOrUpdateUserProfile, getUserProfile } from "../lib/firestore";
import type { UserProfile } from "../types";

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        const profile = await getUserProfile(firebaseUser.uid);
        setUserProfile(profile);
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const syncProfile = async (firebaseUser: User, extra?: { displayName?: string }) => {
    try {
      await createOrUpdateUserProfile({
        uid: firebaseUser.uid,
        email: firebaseUser.email!,
        displayName: extra?.displayName || firebaseUser.displayName || "User",
        photoURL: firebaseUser.photoURL || undefined,
        role: "user",
      });
      const profile = await getUserProfile(firebaseUser.uid);
      setUserProfile(profile);
    } catch {
      // Firestore may not be configured yet — auth still works
    }
  };

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });
    const result = await signInWithPopup(auth, provider);
    await syncProfile(result.user);
  };

  const signInWithEmail = async (email: string, password: string) => {
    const result = await signInWithEmailAndPassword(auth, email, password);
    await syncProfile(result.user);
  };

  const signUpWithEmail = async (email: string, password: string, name: string) => {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(result.user, { displayName: name });
    await syncProfile(result.user, { displayName: name });
  };

  const logout = async () => {
    await signOut(auth);
    setUserProfile(null);
  };

  const isAdmin = userProfile?.role === "admin";

  return (
    <AuthContext.Provider
      value={{ user, userProfile, loading, isAdmin, signInWithGoogle, signInWithEmail, signUpWithEmail, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
