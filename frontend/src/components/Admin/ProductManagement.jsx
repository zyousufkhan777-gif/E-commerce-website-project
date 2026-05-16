import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import {
  deleteProduct,
  fetchAdminProducts,
} from "../../redux/slices/adminProductSlice";

const ProductManagement = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    products = [],
    loading,
    error,
  } = useSelector((state) => state.adminProducts || {});

  useEffect(() => {
    dispatch(fetchAdminProducts());
  }, [dispatch]);

  // ✅ وقتی روی محصول کلیک شود، برود صفحه Product Details
  const handleRowClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  const handleDelete = (e, id) => {
    e.stopPropagation();

    if (window.confirm("Are you sure you want to delete the Product?")) {
      dispatch(deleteProduct(id));
    }
  };

  if (loading) {
    return <p className="text-center mt-10">Loading...</p>;
  }

  if (error) {
    return (
      <p className="text-center mt-10 text-red-500">
        Error: {typeof error === "string" ? error : error.message}
      </p>
    );
  }

  const productsList = Array.isArray(products) ? products : [];

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Product Management</h2>

      <div className="overflow-x-auto shadow-md sm:rounded-lg bg-white">
        <table className="min-w-full text-left text-gray-500">
          <thead className="bg-gray-100 text-xs uppercase text-gray-700">
            <tr>
              <th className="py-3 px-4">Name</th>
              <th className="py-3 px-4">Price</th>
              <th className="py-3 px-4">SKU</th>
              <th className="py-3 px-4">Action</th>
            </tr>
          </thead>

          <tbody>
            {productsList.length > 0 ? (
              productsList.map((product) => (
                <tr
                  key={product._id}
                  onClick={() => handleRowClick(product._id)}
                  className="border-b hover:bg-gray-50 cursor-pointer"
                >
                  <td className="p-4 font-medium text-gray-900">
                    {product.name}
                  </td>

                  <td className="p-4">
                    ${Number(product.price || 0).toLocaleString()}
                  </td>

                  <td className="p-4">{product.sku || "N/A"}</td>

                  <td className="p-4 space-x-2">
                    {/* ✅ Edit جداگانه می‌رود صفحه edit */}
                    <Link
                      to={`/admin/products/${product._id}/edit`}
                      onClick={(e) => e.stopPropagation()}
                      className="bg-yellow-500 text-white px-2 py-1 rounded mr-2 hover:bg-yellow-600"
                    >
                      Edit
                    </Link>

                    <button
                      className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                      onClick={(e) => handleDelete(e, product._id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="4"
                  className="text-center p-4 text-gray-500"
                >
                  No products found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProductManagement;