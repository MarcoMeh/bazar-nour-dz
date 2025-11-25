import React, { useEffect, useState } from "react";
import { supabase } from '@/integrations/supabase/client';
interface Order {
  id: string;
  customer_name: string;
  customer_phone: string;
  wilaya_id: number;
  address: string;
  delivery_type: string;
  total_price: number;
  delivery_price: number;
  status: string;
  created_at: string;
  items: OrderItem[];
}

interface OrderItem {
  id: string;
  product_id: string | null;
  quantity: number;
  unit_price: number;
  color: string | null;
  size: string | null;
  total: number;
  product: {
    id: string;
    name: string;
    image: string;
  } | null;
}

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  async function loadOrders() {
    setLoading(true);

    const { data, error } = await supabase
      .from("orders")
      .select(
        `
        *,
        order_items (
          id,
          product_id,
          quantity,
          unit_price,
          color,
          size,
          total,
          products (
            id,
            name,
            image
          )
        )
      `
      )
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error loading orders:", error);
      setLoading(false);
      return;
    }

    const formatted = (data as any[]).map((o) => ({
      ...o,
      items: o.order_items.map((item: any) => ({
        ...item,
        product: item.products,
      })),
    }));

    setOrders(formatted);
    setLoading(false);
  }

  async function updateStatus(orderId: string, newStatus: string) {
    const { error } = await supabase
      .from("orders")
      .update({ status: newStatus })
      .eq("id", orderId);

    if (error) return alert("Failed to update status");

    loadOrders();
  }

  if (loading) return <p>Loading orders...</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">All Orders</h1>

      {orders.length === 0 && <p>No orders found.</p>}

      <div className="space-y-6">
        {orders.map((order) => (
          <div
            key={order.id}
            className="border p-4 rounded-lg bg-white shadow"
          >
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">
                Order #{order.id.slice(0, 8)}
              </h2>

              <select
                className="border px-2 py-1 rounded"
                value={order.status}
                onChange={(e) => updateStatus(order.id, e.target.value)}
              >
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <p className="text-sm mt-1">
              <strong>Name:</strong> {order.customer_name}
            </p>
            <p className="text-sm">
              <strong>Phone:</strong> {order.customer_phone}
            </p>
            <p className="text-sm">
              <strong>Address:</strong> {order.address}
            </p>

            <hr className="my-3" />

            <h3 className="font-semibold mb-2">Items:</h3>
            <div className="space-y-3">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 border p-2 rounded"
                >
                  {item.product?.image && (
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-16 h-16 rounded object-cover"
                    />
                  )}

                  <div>
                    <p className="font-semibold">{item.product?.name}</p>
                    <p className="text-sm">
                      Qty: <strong>{item.quantity}</strong>
                    </p>
                    {item.color && (
                      <p className="text-sm">Color: {item.color}</p>
                    )}
                    {item.size && <p className="text-sm">Size: {item.size}</p>}
                    <p className="text-sm">
                      Price: {item.unit_price} × {item.quantity} ={" "}
                      <strong>{item.total} DA</strong>
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <hr className="my-3" />

            <p className="text-sm">
              <strong>Delivery Price:</strong> {order.delivery_price} DA
            </p>
            <p className="text-sm">
              <strong>Total:</strong> {order.total_price} DA
            </p>

            <p className="text-xs text-gray-500 mt-2">
              Created: {new Date(order.created_at).toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
