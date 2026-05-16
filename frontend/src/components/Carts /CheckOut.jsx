import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import Paypalbutton from "./Paypalbutton";

// ✅ این باید از redux slice خودت بیاید
import { createCheckout } from "../../redux/slices/checkoutSlice";
import { clearCart } from "../../redux/slices/cartSlice";

const CheckOut = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { cart, loading, error } = useSelector((state) => state.cart);
  const { user } = useSelector((state) => state.auth);

  const [checkoutId, setCheckoutId] = useState(null);
  const [creatingOrder, setCreatingOrder] = useState(false);

  const [shippingAddress, setShippingAddress] = useState({
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    postalCode: "",
    country: "",
    phone: "",
  });

  // ✅ اگر سبد خالی بود برگرد به خانه
  useEffect(() => {
    if (cart && cart.products && cart.products.length === 0) {
      navigate("/");
    }
  }, [cart, navigate]);

  // ✅ ساخت سفارش اولیه
  const handleCreateCheckout = async (e) => {
    e.preventDefault();

    if (!cart || cart.products.length === 0) return;

    try {
      setCreatingOrder(true);

      const res = await dispatch(
        createCheckout({
          checkoutItems: cart.products,
          shippingAddress,
          paymentMethod: "Paypal",
          totalPrice: cart.totalPrice,
        })
      );

      if (res.payload && res.payload._id) {
        setCheckoutId(res.payload._id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCreatingOrder(false);
    }
  };

  // ✅ وقتی پرداخت موفق شد
  const handlePaymentSuccess = async (details) => {
    try {
      const response = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/checkout/${checkoutId}/pay`,
        {
          paymentStatus: "paid",
          paymentDetails: details,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("userToken")}`,
          },
        }
      );

      if (response.status === 200) {
        await finalizeCheckout();
      }
    } catch (error) {
      console.error("Payment Error:", error);
    }
  };

  // ✅ نهایی کردن سفارش
  const finalizeCheckout = async () => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/checkout/${checkoutId}/finalize`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("userToken")}`,
          },
        }
      );

      if (response.status === 200) {
        dispatch(clearCart()); // ✅ خالی کردن سبد
        navigate("/order-confirmation");
      }
    } catch (error) {
      console.error("Finalize Error:", error);
    }
  };

  if (loading) return <p className="text-center mt-10">Loading cart...</p>;
  if (error) return <p className="text-center mt-10 text-red-500">{error}</p>;
  if (!cart || !cart.products || cart.products.length === 0) {
    return <p className="text-center mt-10">Your cart is empty</p>;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto py-10 px-6">
      
      {/* ✅ LEFT SIDE */}
      <div className="bg-white rounded-lg p-6 shadow">
        <h2 className="text-2xl font-semibold mb-6">Checkout</h2>

        <form onSubmit={handleCreateCheckout}>
          <h3 className="text-lg mb-4">Contact Details</h3>

          <input
            type="email"
            value={user?.email || ""}
            disabled
            className="w-full p-2 border rounded mb-4 bg-gray-100"
          />

          <h3 className="text-lg mb-4">Shipping Information</h3>

          {[
            { key: "firstName", placeholder: "First Name" },
            { key: "lastName", placeholder: "Last Name" },
            { key: "address", placeholder: "Address" },
            { key: "city", placeholder: "City" },
            { key: "postalCode", placeholder: "Postal Code" },
            { key: "country", placeholder: "Country" },
            { key: "phone", placeholder: "Phone" },
          ].map((field) => (
            <input
              key={field.key}
              type="text"
              placeholder={field.placeholder}
              value={shippingAddress[field.key]}
              onChange={(e) =>
                setShippingAddress({
                  ...shippingAddress,
                  [field.key]: e.target.value,
                })
              }
              className="w-full p-2 border rounded mb-4"
              required
            />
          ))}

          {!checkoutId ? (
            <button
              type="submit"
              disabled={creatingOrder}
              className="w-full bg-black text-white py-3 rounded hover:bg-gray-800 transition"
            >
              {creatingOrder ? "Processing..." : "Continue to Payment"}
            </button>
          ) : (
            <div className="mt-6">
              <h3 className="text-lg mb-4">Pay with PayPal</h3>
              <Paypalbutton
                amount={cart.totalPrice}
                onSuccess={handlePaymentSuccess}
                onError={() => alert("Payment failed. Try again.")}
              />
            </div>
          )}
        </form>
      </div>

      {/* ✅ RIGHT SIDE */}
      <div className="bg-gray-50 p-6 rounded-lg shadow">
        <h3 className="text-lg mb-4 font-semibold">Order Summary</h3>

        {cart.products.map((product, index) => (
          <div key={index} className="flex justify-between py-2 border-b">
            <span>{product.name}</span>
            <span>${product.price?.toLocaleString()}</span>
          </div>
        ))}

        <div className="flex justify-between mt-4 pt-4 border-t font-semibold">
          <span>Total</span>
          <span>${cart.totalPrice?.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
};

export default CheckOut;