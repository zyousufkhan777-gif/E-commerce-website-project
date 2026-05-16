import React from "react";
import { FaBoxOpen, FaClipboardList, FaStore, FaUser } from "react-icons/fa6";
import { FaSignOutAlt } from "react-icons/fa";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";

import { clearCart } from "../../redux/slices/cartSlice";
import { logout } from "../../redux/slices/authSlice";

const AdminSidebar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(logout());
    dispatch(clearCart());
    navigate("/");
  };

  const navLinkClass = ({ isActive }) =>
    isActive
      ? "bg-gray-700 text-white py-3 px-4 rounded flex items-center space-x-2"
      : "text-gray-300 hover:text-white hover:bg-gray-700 py-3 px-4 rounded flex items-center space-x-2";

  return (
    <div className="p-6">
      <div className="mb-6">
        <Link to="/admin" className="text-2xl font-medium text-white">
          YShop
        </Link>
      </div>

      <h2 className="text-xl font-medium mb-6 text-center text-white">
        Admin Dashboard
      </h2>

      <nav className="flex flex-col space-y-2">
        <NavLink to="/admin/users" className={navLinkClass}>
          <FaUser />
          <span>Users</span>
        </NavLink>

        <NavLink to="/admin/products" className={navLinkClass}>
          <FaBoxOpen />
          <span>Products</span>
        </NavLink>

        <NavLink to="/admin/orders" className={navLinkClass}>
          <FaClipboardList />
          <span>Orders</span>
        </NavLink>

        <NavLink to="/" className={navLinkClass}>
          <FaStore />
          <span>Shop</span>
        </NavLink>
      </nav>

      <div className="mt-6">
        <button
          onClick={handleLogout}
          className="w-full bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded flex items-center justify-center space-x-2"
        >
          <FaSignOutAlt />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default AdminSidebar;