import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";

// مسیر import ها را مطابق پروژه خودت تنظیم کن
import { fetchAdminProducts } from "../redux/slices/adminProductSlice";
import { fetchAllOrders } from "../redux/slices/adminOrderSlice";

const AdminHomepage = () => {
  const dispatch = useDispatch();

  const {
    products = [],
    loading: productsLoading,
    error: productsError,
  } = useSelector((state) => state.adminProducts);

  const {
    orders = [],
    totalOrders,
    totalSales,
    loading: ordersLoading,
    error: ordersError,
  } = useSelector((state) => state.adminOrders);

  useEffect(() => {
    dispatch(fetchAdminProducts());
    dispatch(fetchAllOrders());
  }, [dispatch]);

  const ordersList = Array.isArray(orders) ? orders : [];
  const productsList = Array.isArray(products) ? products : [];

  const recentOrders = ordersList.slice(0, 5);

  const formatError = (err) => {
    if (!err) return "";
    if (typeof err === "string") return err;
    return err.message || "Something went wrong";
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      {productsLoading || ordersLoading ? (
        <p>Loading...</p>
      ) : productsError ? (
        <p className="text-red-500">
          Error fetching Products: {formatError(productsError)}
        </p>
      ) : ordersError ? (
        <p className="text-red-500">
          Error fetching Orders: {formatError(ordersError)}
        </p>
      ) : (
        <>
          {/* Dashboard Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-4 shadow-md rounded-lg bg-white">
              <h2 className="text-xl font-semibold">Revenue</h2>
              <p className="text-2xl font-bold">
                ${Number(totalSales || 0).toLocaleString()}
              </p>
            </div>

            <div className="p-4 shadow-md rounded-lg bg-white">
              <h2 className="text-xl font-semibold">Total Orders</h2>
              <p className="text-2xl font-bold">
                {totalOrders || ordersList.length}
              </p>

              <Link
                to="/admin/orders"
                className="text-blue-500 hover:underline"
              >
                Manage Orders
              </Link>
            </div>

            <div className="p-4 shadow-md rounded-lg bg-white">
              <h2 className="text-xl font-semibold">Total Products</h2>
              <p className="text-2xl font-bold">{productsList.length}</p>

              <Link
                to="/admin/products"
                className="text-blue-500 hover:underline"
              >
                Manage Products
              </Link>
            </div>
          </div>

          {/* Recent Orders */}
          <div className="mt-8">
            <h2 className="text-2xl font-bold mb-4">Recent Orders</h2>

            <div className="overflow-x-auto bg-white shadow-md rounded-lg">
              <table className="min-w-full text-left text-gray-500">
                <thead className="bg-gray-100 text-xs uppercase text-gray-700">
                  <tr>
                    <th className="py-3 px-4">Order ID</th>
                    <th className="py-3 px-4">User</th>
                    <th className="py-3 px-4">Total Price</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>

                <tbody>
                  {recentOrders.length > 0 ? (
                    recentOrders.map((order) => {
                      const isPaid =
                        order.isPaid ||
                        order.paymentStatus?.toLowerCase() === "paid";

                      const statusText =
                        order.status ||
                        order.paymentStatus ||
                        (isPaid ? "Paid" : "Pending");

                      return (
                        <tr
                          key={order._id}
                          className="border-b hover:bg-gray-50 cursor-pointer"
                        >
                          <td className="p-4 font-medium text-gray-900">
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
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                isPaid
                                  ? "bg-green-100 text-green-700"
                                  : "bg-yellow-100 text-yellow-700"
                              }`}
                            >
                              {statusText}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td
                        colSpan={4}
                        className="p-4 text-center text-gray-500"
                      >
                        No Recent Orders Found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminHomepage;