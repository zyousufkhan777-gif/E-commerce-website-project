import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchUserOrders } from "../redux/slices/orderSlice";

const Myorderspage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { orders = [], loading, error } = useSelector((state) => state.orders);

  useEffect(() => {
    dispatch(fetchUserOrders());
  }, [dispatch]);

  const handleRowClick = (orderId) => {
    navigate(`/order/${orderId}`);
  };

  if (loading) return <p className="text-center mt-10">Loading...</p>;

  if (error) {
    return (
      <p className="text-center mt-10 text-red-500">
        Error: {typeof error === "string" ? error : error.message}
      </p>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6">
      <h2 className="text-xl sm:text-2xl font-bold mb-6">My Orders</h2>

      <div className="relative shadow-md sm:rounded-lg overflow-x-auto">
        <table className="min-w-full text-left text-gray-500">
          <thead className="bg-gray-100 text-xs uppercase text-gray-700">
            <tr>
              <th className="py-2 px-4 sm:py-3">Image</th>
              <th className="py-2 px-4 sm:py-3">Order ID</th>
              <th className="py-2 px-4 sm:py-3">Created</th>
              <th className="py-2 px-4 sm:py-3">Shipping Address</th>
              <th className="py-2 px-4 sm:py-3">Items</th>
              <th className="py-2 px-4 sm:py-3">Price</th>
              <th className="py-2 px-4 sm:py-3">Status</th>
            </tr>
          </thead>

          <tbody>
            {orders && orders.length > 0 ? (
              orders.map((order) => {
                const firstItem =
                  order.orderItems?.[0] ||
                  order.checkoutItems?.[0] ||
                  order.CheckoutItems?.[0] ||
                  null;

                const items =
                  order.orderItems ||
                  order.checkoutItems ||
                  order.CheckoutItems ||
                  [];

                const shippingAddress =
                  order.shippingAddress || order.shippingAdress || {};

                const createdDate = order.createdAt || order.createAt;

                return (
                  <tr
                    key={order._id}
                    onClick={() => handleRowClick(order._id)}
                    className="border-b hover:bg-gray-50 cursor-pointer"
                  >
                    <td className="py-2 px-2 sm:py-4 sm:px-4">
                      {firstItem?.image ? (
                        <img
                          src={firstItem.image}
                          alt={firstItem.name || "Product"}
                          className="w-10 h-10 sm:w-12 sm:h-12 object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-200 rounded-lg flex items-center justify-center text-xs">
                          N/A
                        </div>
                      )}
                    </td>

                    <td className="py-2 px-2 sm:py-4 sm:px-4 font-medium text-gray-900 whitespace-nowrap">
                      #{order._id}
                    </td>

                    <td className="py-2 px-2 sm:py-4 sm:px-4">
                      {createdDate ? (
                        <>
                          <div>
                            {new Date(createdDate).toLocaleDateString()}
                          </div>
                          <div className="text-xs text-gray-400">
                            {new Date(createdDate).toLocaleTimeString()}
                          </div>
                        </>
                      ) : (
                        "N/A"
                      )}
                    </td>

                    <td className="py-2 px-2 sm:py-4 sm:px-4">
                      {shippingAddress.city || shippingAddress.country
                        ? `${shippingAddress.city || ""}, ${
                            shippingAddress.country || ""
                          }`
                        : "N/A"}
                    </td>

                    <td className="py-2 px-2 sm:py-4 sm:px-4">
                      {items.length}
                    </td>

                    <td className="py-2 px-2 sm:py-4 sm:px-4">
                      ${order.totalPrice?.toLocaleString() || "0"}
                    </td>

                    <td className="py-2 px-2 sm:py-4 sm:px-4">
                      <span
                        className={`${
                          order.isPaid
                            ? "bg-green-300 text-green-900"
                            : "bg-red-100 text-red-700"
                        } px-2 py-1 rounded-full text-xs sm:text-sm font-medium`}
                      >
                        {order.isPaid ? "Paid" : "Pending"}
                      </span>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan={7}
                  className="py-4 px-4 text-center text-gray-500"
                >
                  You have no orders
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Myorderspage;