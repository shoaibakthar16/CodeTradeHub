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

const ADMIN_EMAILS = ["shoaibakthar1632@gmail.com"];

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        try {
          const isAdminEmail = ADMIN_EMAILS.includes((firebaseUser.email || "").toLowerCase());
          let profile = await getUserProfile(firebaseUser.uid).catch(() => null);

          // Always sync admin emails to ensure role: "admin" is in Firestore
          // Also sync if profile is missing entirely
          if (isAdminEmail || !profile) {
            await createOrUpdateUserProfile({
              uid: firebaseUser.uid,
              email: firebaseUser.email!,
              displayName: firebaseUser.displayName || profile?.displayName || "User",
              photoURL: firebaseUser.photoURL || undefined,
              role: isAdminEmail ? "admin" : "user",
            }).catch(() => null);
            profile = await getUserProfile(firebaseUser.uid).catch(() => null);
          }

          setUserProfile(profile);
        } catch {
          setUserProfile(null);
        }
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const syncProfile = async (firebaseUser: User, extra?: { displayName?: string }) => {
    try {
      const isAdminEmail = ADMIN_EMAILS.includes((firebaseUser.email || "").toLowerCase());
      await createOrUpdateUserProfile({
        uid: firebaseUser.uid,
        email: firebaseUser.email!,
        displayName: extra?.displayName || firebaseUser.displayName || "User",
        photoURL: firebaseUser.photoURL || undefined,
        role: isAdminEmail ? "admin" : "user",
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

  const isAdmin =
    userProfile?.role === "admin" ||
    ADMIN_EMAILS.includes((user?.email || "").toLowerCase());

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
