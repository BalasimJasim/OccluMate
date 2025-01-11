import React, { useState, useEffect } from "react";
import { useAuth } from "../context/authContext";
import api from "../utils/api";

const AdminDashboard = () => {
  const { user } = useAuth();
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // Form state for adding/editing staff
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "Receptionist",
  });

  // Fetch staff data
  const fetchStaff = async () => {
    try {
      setLoading(true);
      const response = await api.get("/users/staff");
      setStaff(response.data);
      setError(null);
    } catch (err) {
      setError("Failed to fetch staff members");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleAddStaff = async (e) => {
    e.preventDefault();
    try {
      await api.post("/users/staff", formData);
      fetchStaff();
      setFormData({ name: "", email: "", role: "Receptionist" });
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add staff member");
    }
  };

  const handleEditStaff = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/users/staff/${selectedStaff._id}`, formData);
      fetchStaff();
      setIsEditing(false);
      setSelectedStaff(null);
      setFormData({ name: "", email: "", role: "Receptionist" });
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update staff member");
    }
  };

  const handleDeleteStaff = async (staffId) => {
    if (window.confirm("Are you sure you want to delete this staff member?")) {
      try {
        await api.delete(`/users/staff/${staffId}`);
        fetchStaff();
        setError(null);
      } catch (err) {
        setError(
          err.response?.data?.message || "Failed to delete staff member"
        );
      }
    }
  };

  const startEdit = (staffMember) => {
    setSelectedStaff(staffMember);
    setFormData({
      name: staffMember.name,
      email: staffMember.email,
      role: staffMember.role,
    });
    setIsEditing(true);
  };

  if (!user || user.role !== "Admin") {
    return (
      <div className="text-center p-4">Access Denied: Admin only area</div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

      {/* Error Display */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Add/Edit Staff Form */}
      <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <h2 className="text-xl font-semibold mb-4">
          {isEditing ? "Edit Staff Member" : "Add New Staff Member"}
        </h2>
        <form onSubmit={isEditing ? handleEditStaff : handleAddStaff}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Role
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleInputChange}
              className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            >
              <option value="Receptionist">Receptionist</option>
              <option value="Dentist">Dentist</option>
            </select>
          </div>
          <div className="flex items-center justify-between">
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              {isEditing ? "Update Staff" : "Add Staff"}
            </button>
            {isEditing && (
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setSelectedStaff(null);
                  setFormData({ name: "", email: "", role: "Receptionist" });
                }}
                className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Staff List */}
      <div className="bg-white shadow-md rounded px-8 pt-6 pb-8">
        <h2 className="text-xl font-semibold mb-4">Staff Members</h2>
        {loading ? (
          <div className="text-center">Loading...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-4 py-2">Name</th>
                  <th className="px-4 py-2">Email</th>
                  <th className="px-4 py-2">Role</th>
                  <th className="px-4 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {staff.map((staffMember) => (
                  <tr key={staffMember._id} className="border-b">
                    <td className="px-4 py-2">{staffMember.name}</td>
                    <td className="px-4 py-2">{staffMember.email}</td>
                    <td className="px-4 py-2">{staffMember.role}</td>
                    <td className="px-4 py-2">
                      <button
                        onClick={() => startEdit(staffMember)}
                        className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-1 px-2 rounded mr-2"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteStaff(staffMember._id)}
                        className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
