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
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Terms from "./pages/Terms";
import Wishlist from "./pages/Wishlist";
import SellerRegister from "./pages/SellerRegister";
import Brands from "./pages/Brands";
import BrandProducts from "./pages/BrandProducts";
import Sale from "./pages/Sale";
import NewArrivals from "./pages/NewArrivals";
import ScrollToTop from "@/components/ScrollToTop";

// Admin Pages (Nested Structure)
import AdminDashboard from "./pages/admin/Dashboard";
import AdminProducts from "./pages/admin/Products";
import AdminCategories from "./pages/admin/Categories";
import AdminStoreCategories from "./pages/admin/StoreCategories";
import AdminOrders from "./pages/admin/Orders";
import AdminStores from "./pages/admin/Stores";
import AdminDelivery from "./pages/admin/Delivery";
import AdminFinance from "./pages/admin/Finance";
import AdminControl from "./pages/admin/Control";
import AdminReviews from "./pages/admin/Reviews";
import AdminStoreRegistrations from "./pages/admin/StoreRegistrations";
import PageBackgrounds from "./pages/admin/PageBackgrounds";

// Store Owner Pages
import { StoreOwnerLayout } from "./components/layout/StoreOwnerLayout";
import StoreOwnerDashboard from "./pages/store-owner/Dashboard";
import StoreOwnerProducts from "./pages/store-owner/Products";
import StoreOwnerOrders from "./pages/store-owner/Orders";
import StoreOwnerProfile from "./pages/store-owner/Profile";
import StoreOwnerDelivery from "./pages/store-owner/Delivery";

// Contexts
import { CartProvider } from "./contexts/CartContext";
import { WishlistProvider } from "./contexts/WishlistContext";
import { AdminProvider } from "./contexts/AdminContext";
import { AuthProvider } from "./contexts/AuthContext";

// Security Components
import { ProtectedRoute } from "./components/ProtectedRoute";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { OfflineIndicator } from "./components/OfflineIndicator";

import { useOrderNotifications } from "./hooks/useOrderNotifications";

const OrderNotificationListener = () => {
  useOrderNotifications();
  return null;
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      retry: 2,
      refetchOnWindowFocus: false,
      networkMode: 'offlineFirst', // Continue serving from cache when offline
    },
    mutations: {
      retry: 1,
      networkMode: 'offlineFirst',
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ErrorBoundary>
      <TooltipProvider>
        <AdminProvider>
          <AuthProvider>
            <WishlistProvider>
              <CartProvider>
                <Toaster />
                <Sonner />
                <OrderNotificationListener />
                <BrowserRouter>
                  <OfflineIndicator />
                  <ScrollToTop />
                  <Routes>
                    {/* Public Routes */}
                    <Route element={<Layout />}>
                      <Route path="/" element={<Home />} />
                      <Route path="/products" element={<Products />} />
                      <Route path="/product/:id" element={<ProductDetail />} />
                      <Route path="/stores" element={<Stores />} />
                      <Route path="/store/:slug" element={<ProductStores />} />
                      <Route path="/cart" element={<Cart />} />
                      <Route path="/wishlist" element={<Wishlist />} />
                      <Route path="/brands" element={<Brands />} />
                      <Route path="/brands/:slug" element={<BrandProducts />} />
                      <Route path="/sale" element={<Sale />} />
                      <Route path="/new-arrivals" element={<NewArrivals />} />
                      <Route path="/checkout" element={<Checkout />} />
                      <Route path="/my-orders" element={<MyOrders />} />
                      <Route path="/profile" element={<Profile />} />
                      <Route path="/login" element={<Login />} />
                      <Route path="/about" element={<About />} />
                      <Route path="/seller-register" element={<SellerRegister />} />
                      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                      <Route path="/terms-conditions" element={<Terms />} />
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
                      <Route path="finance" element={<AdminFinance />} />
                      <Route path="control" element={<AdminControl />} />
                      <Route path="reviews" element={<AdminReviews />} />
                      <Route path="store-registrations" element={<AdminStoreRegistrations />} />
                      <Route path="backgrounds" element={<PageBackgrounds />} />
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
                      <Route path="delivery" element={<StoreOwnerDelivery />} />
                      <Route path="profile" element={<StoreOwnerProfile />} />
                    </Route>

                    {/* 404 */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </BrowserRouter>
              </CartProvider>
            </WishlistProvider>
          </AuthProvider>
        </AdminProvider>
      </TooltipProvider>
    </ErrorBoundary>
  </QueryClientProvider>
);

export default App;
