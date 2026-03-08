import { createContext, useContext, useEffect, useState } from "react";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "../firebase";

type Order = {
  id: string;
  customerName: string;
  total: number;
  status: string;
  createdAt: any;
  items: any[];
};

type OrdersContextType = {
  orders: Order[];
  loading: boolean;
};

const OrdersContext = createContext<OrdersContextType>({
  orders: [],
  loading: true,
});

export function OrdersProvider({ children }: { children: React.ReactNode }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));

    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Order[];

      setOrders(data);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  return (
    <OrdersContext.Provider value={{ orders, loading }}>
      {children}
    </OrdersContext.Provider>
  );
}

export function useOrders() {
  return useContext(OrdersContext);
}