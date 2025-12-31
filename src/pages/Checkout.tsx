import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Checkout = () => {
  const navigate = useNavigate();
  useEffect(() => {
    navigate("/cart", { replace: true });
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-muted-foreground">جاري تحويلك إلى سلة التسوق...</p>
    </div>
  );
};

export default Checkout;
