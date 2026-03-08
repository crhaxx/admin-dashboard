import { createContext, useContext, useEffect, useState } from "react";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "../firebase";

const UsersContext = createContext<any>(null);

export type User = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  createdAt?: any;
  lastLogin?: any;
  deleted?: boolean;
  disabled?: boolean;
};

export const UsersProvider = ({ children }: any) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "users"), orderBy("createdAt", "desc"));

    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        ...(doc.data() as User),
        id: doc.id,
      }));

      const filtered = data.filter((u) => !u.deleted);

      setUsers(filtered);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  return (
    <UsersContext.Provider value={{ users, loading }}>
      {children}
    </UsersContext.Provider>
  );
};

export const useUsers = () => useContext(UsersContext);