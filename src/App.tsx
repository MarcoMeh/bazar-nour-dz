import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { AdminLayout } from "@/components/admin/AdminLayout";
import Home from "./pages/Home";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Stores from "./pages/Stores";
import Login from "./pages/Login";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import NotFound from "./pages/NotFound";
import About from "./pages/About";
import ProductStores from "./pages/productstores";
import MyOrders from "./pages/MyOrders";
import Profile from "./pages/Profile";
import ScrollToTop from "@/components/ScrollToTop";

// Admin Pages (Nested Structure)
import AdminDashboard from "./pages/admin/Dashboard";
import AdminProducts from "./pages/admin/Products";
import AdminCategories from "./pages/admin/Categories";
import AdminStoreCategories from "./pages/admin/StoreCategories";
import AdminOrders from "./pages/admin/Orders";
import AdminStores from "./pages/admin/Stores";
import AdminDelivery from "./pages/admin/Delivery";
import AdminControl from "./pages/admin/Control";

// Store Owner Pages
import { StoreOwnerLayout } from "./components/layout/StoreOwnerLayout";
import StoreOwnerDashboard from "./pages/store-owner/Dashboard";
import StoreOwnerProducts from "./pages/store-owner/Products";
import StoreOwnerOrders from "./pages/store-owner/Orders";
import StoreOwnerProfile from "./pages/store-owner/Profile";

// Contexts
import { CartProvider } from "./contexts/CartContext";
import { AdminProvider } from "./contexts/AdminContext";
import { AuthProvider } from "./contexts/AuthContext";

// Security Components
import { ProtectedRoute } from "./components/ProtectedRoute";
import { ErrorBoundary } from "./components/ErrorBoundary";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ErrorBoundary>
      <TooltipProvider>
        <AdminProvider>
          <AuthProvider>
            <CartProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <ScrollToTop />
                <Routes>
                  {/* Public Routes */}
                  <Route element={<Layout />}>
                    <Route path="/" element={<Home />} />
                    <Route path="/products" element={<Products />} />
                    <Route path="/product/:id" element={<ProductDetail />} />
                    <Route path="/stores" element={<Stores />} />
                    <Route path="/productstores" element={<ProductStores />} />
                    <Route path="/cart" element={<Cart />} />
                    <Route path="/checkout" element={<Checkout />} />
                    <Route path="/my-orders" element={<MyOrders />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/about" element={<About />} />
                  </Route>

                  {/* Admin Routes - Protected */}
                  <Route
                    path="/admin"
                    element={
                      <ProtectedRoute requiredRole="admin">
                        <AdminLayout />
                      </ProtectedRoute>
                    }
                  >
                    <Route index element={<AdminDashboard />} />
                    <Route path="products" element={<AdminProducts />} />
                    <Route path="categories" element={<AdminCategories />} />
                    <Route path="store-categories" element={<AdminStoreCategories />} />
                    <Route path="orders" element={<AdminOrders />} />
                    <Route path="stores" element={<AdminStores />} />
                    <Route path="delivery" element={<AdminDelivery />} />
                    <Route path="control" element={<AdminControl />} />
                  </Route>

                  {/* Store Owner Routes - Protected */}
                  <Route
                    path="/store-dashboard"
                    element={
                      <ProtectedRoute requiredRole="store_owner">
                        <StoreOwnerLayout />
                      </ProtectedRoute>
                    }
                  >
                    <Route index element={<StoreOwnerDashboard />} />
                    <Route path="products" element={<StoreOwnerProducts />} />
                    <Route path="orders" element={<StoreOwnerOrders />} />
                    <Route path="profile" element={<StoreOwnerProfile />} />
                  </Route>

                  {/* 404 */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </CartProvider>
          </AuthProvider>
        </AdminProvider>
      </TooltipProvider>
    </ErrorBoundary>
  </QueryClientProvider>
);

export default App;
