import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "@/contexts/CartContext";
import { AdminProvider } from "@/contexts/AdminContext";
import Index from "./pages/Index";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import AdminLogin from "./pages/AdminLogin";
import Admin from "./pages/Admin";
import AdminProducts from "./pages/AdminProducts";
import AdminOrders from "./pages/AdminOrders";
import AdminDelivery from "./pages/AdminDelivery";
import AdminCategories from "./pages/AdminCategories";
import AdminStoreOwner from "./pages/StoreOwners";
import About from "./pages/About";
import NotFound from "./pages/NotFound";
<<<<<<< HEAD
import About from "./pages/About";
=======
import ProductStores from "./pages/productstores";
import AdminStoreOwnerProfile from "./pages/AdminStoreOwnerProfile";
>>>>>>> 5c2b0f6ece8db8775ec6c1819f8ec4f67928f520

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AdminProvider>
        <CartProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/products" element={<Products />} />
              <Route path="/product/:id" element={<ProductDetail />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin" element={<Admin />} />
<<<<<<< HEAD
              <Route path="/about" element={<About />} />
=======
              <Route path="/productstores" element={<ProductStores />} />
>>>>>>> 5c2b0f6ece8db8775ec6c1819f8ec4f67928f520
              <Route path="/admin/products" element={<AdminProducts />} />
            <Route path="/admin/orders" element={<AdminOrders />} />
            <Route path="/admin/delivery" element={<AdminDelivery />} />
            <Route path="/about" element={<About />} />
            <Route path="/admin/categories" element={<AdminCategories />} />
            <Route path="/admin/storeowners" element={<AdminStoreOwner />} />
            <Route path="/admin/adminstoreownerprofile" element={<AdminStoreOwnerProfile />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </CartProvider>
      </AdminProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
