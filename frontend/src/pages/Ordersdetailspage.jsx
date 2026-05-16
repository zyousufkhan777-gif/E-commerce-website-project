import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useParams } from "react-router-dom";
import { fetchOrderDetails } from "../redux/slices/orderSlice";

const Ordersdetailspage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();

  const { orderDetails, loading, error } = useSelector(
    (state) => state.orders
  );

  // اگر route صفحه سفارش‌های من در پروژه‌ات /my-order است، این را تغییر بده
  const MY_ORDERS_PATH = "/my-orders";

  useEffect(() => {
    if (id) {
      dispatch(fetchOrderDetails(id));
    }
  }, [dispatch, id]);

  if (loading) {
    return <p className="text-center mt-10">Loading...</p>;
  }

  if (error) {
    return (
      <p className="text-center mt-10 text-red-500">
        Error: {typeof error === "string" ? error : error?.message}
      </p>
    );
  }

  const order = orderDetails?.order || orderDetails;

  if (!order) {
    return (
      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        <p>No order detail found</p>
        <Link to={MY_ORDERS_PATH} className="text-blue-500 hover:underline">
          Back To My Orders
        </Link>
      </div>
    );
  }

  const orderItems =
    order.orderItems ||
    order.checkoutItems ||
    order.CheckoutItems ||
    order.checkOutItems ||
    [];

  const shippingAddress =
    order.shippingAddress || order.shippingAdress || {};

  const createdDate = order.createdAt || order.createAt;

  const isPaid =
    order.isPaid || order.paymentStatus?.toLowerCase() === "paid";

  const isDelivered =
    order.isDelivered || order.deliveryStatus?.toLowerCase() === "delivered";

  const paymentMethod =
    order.paymentMethod || order.PaymentMethod || "PayPal";

  const shippingMethod =
    order.shippingMethod || order.deliveryMethod || "Standard Shipping";

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6">
      <h2 className="text-2xl md:text-3xl font-bold mb-6">
        Order Details
      </h2>

      <div className="p-4 sm:p-6 rounded-lg border bg-white">
        {/* Order Info */}
        <div className="flex flex-col sm:flex-row justify-between mb-8">
          <div>
            <h3 className="text-lg md:text-xl font-semibold">
              Order ID: #{order._id}
            </h3>

            <p className="text-gray-600">
              {createdDate ? new Date(createdDate).toLocaleString() : "N/A"}
            </p>
          </div>

          <div className="flex flex-col items-start sm:items-end mt-4 sm:mt-0">
            {/* Payment Status */}
            <span
              className={`${
                isPaid
                  ? "bg-green-700 text-white"
                  : "bg-red-100 text-red-700"
              } px-3 py-1 rounded-full text-sm font-medium mb-2`}
            >
              {isPaid ? "Paid" : "Pending"}
            </span>

            {/* Delivery Status */}
            <span
              className={`${
                isDelivered
                  ? "bg-green-700 text-white"
                  : "bg-yellow-100 text-yellow-700"
              } px-3 py-1 rounded-full text-sm font-medium`}
            >
              {isDelivered ? "Delivered" : "Pending Delivery"}
            </span>
          </div>
        </div>

        {/* Payment & Shipping */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 mb-8">
          {/* Payment Info */}
          <div>
            <h4 className="text-lg font-semibold mb-2">Payment Info</h4>
            <p>Payment Method: {paymentMethod}</p>
            <p>Status: {isPaid ? "Paid" : "Unpaid"}</p>
          </div>

          {/* Shipping Info */}
          <div>
            <h4 className="text-lg font-semibold mb-2">Shipping Info</h4>
            <p>Shipping Method: {shippingMethod}</p>

            <p>
              Address:{" "}
              {shippingAddress.address
                ? shippingAddress.address
                : "N/A"}
            </p>

            <p>
              {shippingAddress.city || "N/A"}
              {shippingAddress.country
                ? `, ${shippingAddress.country}`
                : ""}
            </p>

            {shippingAddress.postalCode && (
              <p>Postal Code: {shippingAddress.postalCode}</p>
            )}

            {shippingAddress.phone && (
              <p>Phone: {shippingAddress.phone}</p>
            )}
          </div>

          {/* Total Info */}
          <div>
            <h4 className="text-lg font-semibold mb-2">Order Summary</h4>
            <p>
              Total Price: $
              {order.totalPrice?.toLocaleString() || "0"}
            </p>
            <p>Items: {orderItems.length}</p>
          </div>
        </div>

        {/* Product List */}
        <div className="overflow-x-auto">
          <h4 className="text-lg font-semibold mb-4">Products</h4>

          <table className="min-w-full text-gray-600 mb-4">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-2 px-4 text-left">Name</th>
                <th className="py-2 px-4 text-left">Unit Price</th>
                <th className="py-2 px-4 text-left">Quantity</th>
                <th className="py-2 px-4 text-left">Total</th>
              </tr>
            </thead>

            <tbody>
              {orderItems.length > 0 ? (
                orderItems.map((item, index) => {
                  const productId =
                    typeof item.productId === "object"
                      ? item.productId._id
                      : item.productId || item.product || item._id;

                  const quantity = item.quantity || item.qty || 1;
                  const price = Number(item.price || 0);
                  const itemTotal = price * quantity;

                  return (
                    <tr
                      key={productId || index}
                      className="border-b"
                    >
                      <td className="py-2 px-4 flex items-center">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name || "Product"}
                            className="w-12 h-12 object-cover rounded-lg mr-4"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gray-200 rounded-lg mr-4 flex items-center justify-center text-xs">
                            N/A
                          </div>
                        )}

                        {productId ? (
                          <Link
                            to={`/product/${productId}`}
                            className="text-blue-500 hover:underline"
                          >
                            {item.name}
                          </Link>
                        ) : (
                          <span>{item.name || "Product"}</span>
                        )}
                      </td>

                      <td className="py-2 px-4">
                        ${price.toLocaleString()}
                      </td>

                      <td className="py-2 px-4">{quantity}</td>

                      <td className="py-2 px-4">
                        ${itemTotal.toLocaleString()}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={4}
                    className="py-4 px-4 text-center text-gray-500"
                  >
                    No products found
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Back to Orders Link */}
          <Link
            to={MY_ORDERS_PATH}
            className="text-blue-500 hover:underline"
          >
            Back To My Orders
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Ordersdetailspage;