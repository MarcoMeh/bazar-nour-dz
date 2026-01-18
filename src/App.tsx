import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Skeleton } from "@/components/ui/skeleton";

// Lazy Loaded Pages
const Home = lazy(() => import("./pages/Home"));
const Products = lazy(() => import("./pages/Products"));
const ProductDetail = lazy(() => import("./pages/ProductDetail"));
const Stores = lazy(() => import("./pages/Stores"));
const Login = lazy(() => import("./pages/Login"));
const Cart = lazy(() => import("./pages/Cart"));
const NotFound = lazy(() => import("./pages/NotFound"));
const About = lazy(() => import("./pages/About"));
const Contact = lazy(() => import("./pages/Contact"));
const StoreFront = lazy(() => import("./pages/StoreFront"));
const MyOrders = lazy(() => import("./pages/MyOrders"));
const Profile = lazy(() => import("./pages/Profile"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const Terms = lazy(() => import("./pages/Terms"));
const Wishlist = lazy(() => import("./pages/Wishlist"));
const SellerRegister = lazy(() => import("./pages/SellerRegister"));
const Brands = lazy(() => import("./pages/Brands"));
const BrandProducts = lazy(() => import("./pages/BrandProducts"));
const Sale = lazy(() => import("./pages/Sale"));
const NewArrivals = lazy(() => import("./pages/NewArrivals"));

// Admin Pages
const AdminDashboard = lazy(() => import("./pages/admin/Dashboard"));
const AdminProducts = lazy(() => import("./pages/admin/Products"));
const AdminCategories = lazy(() => import("./pages/admin/Categories"));
const AdminStoreCategories = lazy(() => import("./pages/admin/StoreCategories"));
const AdminOrders = lazy(() => import("./pages/admin/Orders"));
const AdminStores = lazy(() => import("./pages/admin/Stores"));
const AdminDelivery = lazy(() => import("./pages/admin/Delivery"));
const AdminFinance = lazy(() => import("./pages/admin/Finance"));
const AdminControl = lazy(() => import("./pages/admin/Control"));
const AdminReviews = lazy(() => import("./pages/admin/Reviews"));
const AdminStoreRegistrations = lazy(() => import("./pages/admin/StoreRegistrations"));
const PageBackgrounds = lazy(() => import("./pages/admin/PageBackgrounds"));
const AdminPromoCodes = lazy(() => import("./pages/admin/PromoCodes"));
const AdminSettings = lazy(() => import("./pages/admin/Settings"));

// Store Owner Pages
import { StoreOwnerLayout } from "./components/layout/StoreOwnerLayout";
const StoreOwnerDashboard = lazy(() => import("./pages/store-owner/Dashboard"));
const StoreOwnerProducts = lazy(() => import("./pages/store-owner/Products"));
const StoreOwnerOrders = lazy(() => import("./pages/store-owner/Orders"));
const StoreOwnerProfile = lazy(() => import("./pages/store-owner/Profile"));
const StoreOwnerDelivery = lazy(() => import("./pages/store-owner/Delivery"));

import ScrollToTop from "@/components/ScrollToTop";

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

const App = () => {
  // Remove splash screen when App mounts
  import("react").then(({ useEffect }) => {
    useEffect(() => {
      const splash = document.getElementById('splash-screen');
      if (splash) {
        splash.style.opacity = '0';
        setTimeout(() => splash.remove(), 500);
      }
    }, []);
  });

  return (
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
                    <Suspense fallback={
                      <div className="flex items-center justify-center min-h-screen bg-slate-50">
                        <div className="flex flex-col items-center gap-4">
                          <Skeleton className="h-12 w-12 rounded-full animate-pulse" />
                          <div className="h-4 w-24 bg-slate-200 rounded animate-pulse" />
                        </div>
                      </div>
                    }>
                      <Routes>
                        {/* Public Routes */}
                        <Route element={<Layout />}>
                          <Route path="/" element={<Home />} />
                          <Route path="/products" element={<Products />} />
                          <Route path="/product/:id" element={<ProductDetail />} />
                          <Route path="/about" element={<About />} />
                          <Route path="/contact" element={<Contact />} />
                          <Route path="/stores" element={<Stores />} />
                          <Route path="/store/:slug" element={<StoreFront />} />
                          <Route path="/cart" element={<Cart />} />
                          <Route path="/wishlist" element={<Wishlist />} />
                          <Route path="/brands" element={<Brands />} />
                          <Route path="/brands/:slug" element={<BrandProducts />} />
                          <Route path="/sale" element={<Sale />} />
                          <Route path="/new-arrivals" element={<NewArrivals />} />
                          <Route
                            path="/my-orders"
                            element={
                              <ProtectedRoute>
                                <MyOrders />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/profile"
                            element={
                              <ProtectedRoute>
                                <Profile />
                              </ProtectedRoute>
                            }
                          />
                          <Route path="/login" element={<Login />} />
                          <Route path="/about" element={<About />} />
                          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                          <Route path="/terms-conditions" element={<Terms />} />
                        </Route>

                        <Route path="/seller-register" element={<SellerRegister />} />

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
                          <Route path="promo-codes" element={<AdminPromoCodes />} />
                          <Route path="settings" element={<AdminSettings />} />
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
                    </Suspense>
                  </BrowserRouter>
                </CartProvider>
              </WishlistProvider>
            </AuthProvider>
          </AdminProvider>
        </TooltipProvider>
      </ErrorBoundary>
    </QueryClientProvider>
  );
};

export default App;
