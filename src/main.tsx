import ReactDOM from "react-dom/client";
import AppRoutes from "./routes/AppRoutes";
import { AuthProvider } from "./providers/AuthProvider";
import { Toaster } from "react-hot-toast";
import { ProductsProvider } from "./providers/ProductsProvider";


ReactDOM.createRoot(document.getElementById('root')!).render(
    <AuthProvider>
      <ProductsProvider>
        <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "#111",
            color: "white",
            border: "1px solid #333",
          },
        }}
      />
      <AppRoutes />
      </ProductsProvider>
    </AuthProvider>
)
