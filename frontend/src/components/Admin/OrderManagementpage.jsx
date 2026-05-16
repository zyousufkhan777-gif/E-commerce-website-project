import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  fetchAllOrders,
  updateOrderStatus,
} from "../../redux/slices/adminOrderSlice";

const OrderManagementpage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user } = useSelector((state) => state.auth);

  const {
    orders = [],
    loading,
    error,
  } = useSelector((state) => state.adminOrders || {});

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (user?.role?.toLowerCase() !== "admin") {
      navigate("/");
      return;
    }

    dispatch(fetchAllOrders());
  }, [dispatch, user, navigate]);

  const handleStatusChange = (orderId, status) => {
    dispatch(
      updateOrderStatus({
        id: orderId,
        status,
      })
    );
  };

  const formatError = (err) => {
    if (!err) return "";
    if (typeof err === "string") return err;
    return err.message || "Something went wrong";
  };

  if (loading) {
    return <p className="text-center mt-10">Loading...</p>;
  }

  if (error) {
    return (
      <p className="text-center mt-10 text-red-500">
        Error: {formatError(error)}
      </p>
    );
  }

  const ordersList = Array.isArray(orders) ? orders : [];

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Order Management</h2>

      <div className="overflow-x-auto shadow-md sm:rounded-lg bg-white">
        <table className="min-w-full text-left text-gray-500">
          <thead className="bg-gray-100 text-xs uppercase text-gray-700">
            <tr>
              <th className="py-3 px-4">Order ID</th>
              <th className="py-3 px-4">Customer</th>
              <th className="py-3 px-4">Total Price</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Action</th>
            </tr>
          </thead>

          <tbody>
            {ordersList.length > 0 ? (
              ordersList.map((order) => {
                const currentStatus =
                  order.status ||
                  order.deliveryStatus ||
                  (order.isDelivered ? "Delivered" : "Processing");

                return (
                  <tr
                    className="border-b hover:bg-gray-50 cursor-pointer"
                    key={order._id}
                  >
                    <td className="py-4 px-4 font-medium text-gray-900 whitespace-nowrap">
                      #{order._id}
                    </td>

                    <td className="p-4">
                      {order.user?.name ||
                        order.user?.email ||
                        "Unknown User"}
                    </td>

                    <td className="p-4">
                      ${Number(order.totalPrice || 0).toLocaleString()}
                    </td>

                    <td className="p-4">
                      <select
                        value={currentStatus}
                        onChange={(e) =>
                          handleStatusChange(order._id, e.target.value)
                        }
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
                      >
                        <option value="Processing">Processing</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>

                    <td className="p-4">
                      <button
                        onClick={() =>
                          handleStatusChange(order._id, "Delivered")
                        }
                        disabled={currentStatus === "Delivered"}
                        className="bg-green-500 text-white px-3 py-2 rounded hover:bg-green-600 disabled:bg-gray-400"
                      >
                        Mark as Delivered
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan={5}
                  className="p-4 text-center text-gray-500"
                >
                  No Orders found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OrderManagementpage;