import { createContext, useContext, useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";

type Product = {
  id: string;
  name: string;
  price: number;
  stock: number;
  images?: string[];
  categories?: string[];
};

type ProductsContextType = {
  products: Product[];
  loading: boolean;
};

const ProductsContext = createContext<ProductsContextType>({
  products: [],
  loading: true,
});

export function ProductsProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "products"), (snapshot) => {
      const data = snapshot.docs.map((doc) => {
        const d = doc.data() as any;

        // odstraníme id z dat, pokud tam je
        const { id, ...rest } = d;

        return {
          id: doc.id,
          ...rest,
        } as Product;
      });

      setProducts(data);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  return (
    <ProductsContext.Provider value={{ products, loading }}>
      {children}
    </ProductsContext.Provider>
  );
}

export function useProducts() {
  return useContext(ProductsContext);
}