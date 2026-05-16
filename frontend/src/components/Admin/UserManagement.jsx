import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import {
  fetchUsers,
  addUser,
  updateUser,
  deleteUser,
} from "../../redux/slices/adminSlice";

const UserManagement = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user: loggedInUser } = useSelector((state) => state.auth);

  const {
    users = [],
    loading,
    error,
  } = useSelector((state) => state.admin || {});

  const usersList = Array.isArray(users) ? users : [];

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "customer",
  });

  useEffect (() => {
    if (!loggedInUser) {
      navigate("/login");  
      return;
    }

    if (loggedInUser?.role?.toLowerCase() !== "admin") {
      navigate("/");
      return;
    }

    dispatch(fetchUsers());
  }, [loggedInUser, navigate, dispatch]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await dispatch(addUser(formData)).unwrap();

      setFormData({
        name: "",
        email: "",
        password: "",
        role: "customer",
      });
    } catch (err) {
      console.error("Add User Error:", err);
    }
  };

  const handleRoleChange = (singleUser, newRole) => {
    dispatch(
      updateUser({
        id: singleUser._id,
        name: singleUser.name,
        email: singleUser.email,
        role: newRole,
      })
    );
  };

  const handleDeleteUser = (userId) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      dispatch(deleteUser(userId));
    }
  };

  const formatError = (err) => {
    if (!err) return "";
    if (typeof err === "string") return err;
    return err.message || "Something went wrong";
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">User Management</h2>

      {loading && <p>Loading...</p>}

      {error && (
        <p className="text-red-500 mb-4">
          Error: {formatError(error)}
        </p>
      )}

      {/* Add User Form */}
      <div className="p-6 rounded-lg mb-6 bg-white shadow">
        <h3 className="text-lg font-bold mb-4">Add New User</h3>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700">Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700">Role</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            >
              <option value="customer">Customer</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 disabled:bg-gray-400"
          >
            {loading ? "Saving..." : "Add User"}
          </button>
        </form>
      </div>

      {/* Users List */}
      <div className="overflow-x-auto shadow-md sm:rounded-lg bg-white">
        <table className="min-w-full text-left text-gray-500">
          <thead className="bg-gray-100 text-xs uppercase text-gray-700">
            <tr>
              <th className="py-3 px-4">Name</th>
              <th className="py-3 px-4">Email</th>
              <th className="py-3 px-4">Role</th>
              <th className="py-3 px-4">Actions</th>
            </tr>
          </thead>

          <tbody>
            {usersList.length > 0 ? (
              usersList.map((singleUser) => (
                <tr
                  key={singleUser._id}
                  className="border-b hover:bg-gray-50"
                >
                  <td className="p-4 font-medium text-gray-900 whitespace-nowrap">
                    {singleUser.name}
                  </td>

                  <td className="p-4">{singleUser.email}</td>

                  <td className="p-4">
                    <select
                      value={singleUser.role}
                      onChange={(e) =>
                        handleRoleChange(singleUser, e.target.value)
                      }
                      className="p-2 border rounded"
                    >
                      <option value="customer">Customer</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>

                  <td className="p-4">
                    <button
                      onClick={() => handleDeleteUser(singleUser._id)}
                      className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={4}
                  className="p-4 text-center text-gray-500"
                >
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserManagement;