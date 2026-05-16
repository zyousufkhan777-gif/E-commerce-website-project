import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { clearCart } from "../redux/slices/cartSlice";

const OrderConfirmationPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { checkout } = useSelector((state) => state.checkout);

  // اگر از CheckOut.jsx با navigate state فرستاده شود، از آن استفاده می‌کنیم
  // اگر نه، از checkout داخل Redux استفاده می‌کنیم
  const orderData = location.state?.order || checkout;

  const orderItems =
    orderData?.checkoutItems ||
    orderData?.CheckoutItems ||
    orderData?.checkOutItems ||
    orderData?.orderItems ||
    [];

  useEffect(() => {
    if (!orderData || !orderData._id) {
      navigate("/my-orders", { replace: true });
      return;
    }

    dispatch(clearCart());
    localStorage.removeItem("cart");
  }, [orderData?._id, dispatch, navigate]);

  const calculateEstimatedDelivery = (createdAt) => {
    const orderDate = createdAt ? new Date(createdAt) : new Date();
    orderDate.setDate(orderDate.getDate() + 10);
    return orderDate.toLocaleDateString();
  };

  if (!orderData || !orderData._id) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white">
      <h1 className="text-4xl font-bold text-center text-emerald-700 mb-8">
        Thank You For Your Order
      </h1>

      <div className="p-6 rounded-lg border">
        <div className="flex justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold">
              Order ID: {orderData._id}
            </h2>

            <p className="text-gray-500">
              Order date:{" "}
              {orderData.createdAt
                ? new Date(orderData.createdAt).toLocaleDateString()
                : "N/A"}
            </p>
          </div>

          <div>
            <p className="text-emerald-700 text-sm">
              Estimated Delivery:{" "}
              {calculateEstimatedDelivery(orderData.createdAt)}
            </p>
          </div>
        </div>

        {/* Order Items */}
        <div className="mb-20">
          {orderItems.length > 0 ? (
            orderItems.map((item, index) => (
              <div
                key={item.productId || item._id || index}
                className="flex items-center mb-4"
              >
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-16 h-16 object-cover rounded-md mr-4"
                />

                <div>
                  <h4 className="text-md font-semibold">{item.name}</h4>
                  <p className="text-sm text-gray-500">
                    {item.color} | {item.size}
                  </p>
                </div>

                <div className="ml-auto text-right">
                  <p className="text-md">
                    ${item.price?.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-500">
                    Qty: {item.quantity || 1}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500">No items found.</p>
          )}
        </div>

        {/* Payment and Delivery Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Payment Info */}
          <div>
            <h4 className="text-lg font-semibold mb-2">Payment</h4>
            <p className="text-gray-600">
              {orderData.paymentMethod || orderData.PaymentMethod || "PayPal"}
            </p>

            <p className="text-gray-600 mt-2">
              Status: {orderData.paymentStatus || "Paid"}
            </p>
          </div>

          {/* Delivery Info */}
          <div>
            <h4 className="text-lg font-semibold mb-2">Delivery</h4>

            <p className="text-gray-600">
              {orderData.shippingAddress?.address}
            </p>

            <p className="text-gray-600">
              {orderData.shippingAddress?.city}
              {orderData.shippingAddress?.postalCode
                ? `, ${orderData.shippingAddress.postalCode}`
                : ""}
            </p>

            <p className="text-gray-600">
              {orderData.shippingAddress?.country}
            </p>

            {orderData.shippingAddress?.phone && (
              <p className="text-gray-600">
                Phone: {orderData.shippingAddress.phone}
              </p>
            )}
          </div>
        </div>

        {/* Total */}
        <div className="border-t mt-8 pt-4 flex justify-between text-lg font-semibold">
          <span>Total</span>
          <span>${orderData.totalPrice?.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmationPage;