import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import { db, auth } from "../firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
} from "firebase/auth";

import { setDoc, doc, getDoc } from "firebase/firestore";

type AuthContextValue = {
  user: any;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (
    firstName: string,
    lastName: string,
    email: string,
    password: string
  ) => Promise<boolean>;
  logout: () => Promise<void>;
  updateUserProfile: (data: Partial<UserProfile>) => void;
};

type UserProfile = {
  uid: string;
  email: string;
  firstName?: string;
  lastName?: string;
  photoURL?: string;
  createdAt?: number;
};

type AuthProviderProps = {
  children: ReactNode;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const snap = await getDoc(doc(db, "users", firebaseUser.uid));

        if (snap.exists()) {
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            ...snap.data(),
          });
        } else {
          setUser(firebaseUser);
        }
      } else {
        setUser(null);
      }

      setLoading(false);
    });

    return () => unsub();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return true;
    } catch {
      return false;
    }
  };

  const register = async (
    firstName: string,
    lastName: string,
    email: string,
    password: string
  ) => {
    try {
      const userCred = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      await setDoc(doc(db, "users", userCred.user.uid), {
        firstName,
        lastName,
        email,
        createdAt: Date.now(),
      });

      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  const logout = () => signOut(auth);

  const updateUserProfile = (data: Partial<any>) => {
    setUser((prev: any) => ({ ...prev, ...data }));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,
        updateUserProfile,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}