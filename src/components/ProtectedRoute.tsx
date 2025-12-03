import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
    children: React.ReactNode;
    requiredRole?: "admin" | "store_owner" | "customer";
}

export const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
    const [loading, setLoading] = useState(true);
    const [authorized, setAuthorized] = useState(false);
    const location = useLocation();

    useEffect(() => {
        checkAuth();
    }, [requiredRole]);

    const checkAuth = async () => {
        try {
            // Check if user is logged in
            const { data: { user }, error: userError } = await supabase.auth.getUser();

            if (userError || !user) {
                setAuthorized(false);
                setLoading(false);
                return;
            }

            // If no specific role required, just being logged in is enough
            if (!requiredRole) {
                setAuthorized(true);
                setLoading(false);
                return;
            }

            // Check user role from profiles table
            const { data: profile, error: profileError } = await supabase
                .from("profiles")
                .select("role")
                .eq("id", user.id)
                .single();

            if (profileError || !profile) {
                console.error("Profile fetch error:", profileError);
                setAuthorized(false);
                setLoading(false);
                return;
            }

            // Check if user has the required role
            setAuthorized(profile.role === requiredRole);
        } catch (error) {
            console.error("Auth check error:", error);
            setAuthorized(false);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="text-center space-y-4">
                    <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
                    <p className="text-muted-foreground">جاري التحقق من الصلاحيات...</p>
                </div>
            </div>
        );
    }

    if (!authorized) {
        // Redirect to login with return URL
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return <>{children}</>;
};
