import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";

export default function UserManagement() {
  const [users, setUsers] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [message, setMessage] = useState("");

  const usersPerPage = 10;

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "DELIVERY",
  });

  /* ================= FETCH USERS ================= */

  const fetchUsers = async () => {
    const res = await fetch("/api/admin/user/get");
    const data = await res.json();
    if (data.success) setUsers(data.users);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  /* ================= CREATE / UPDATE ================= */

  const handleSubmit = async () => {
    const url = editingUser
      ? `/api/admin/user/update?id=${editingUser.id}`
      : "/api/admin/user/create";

    const method = editingUser ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();

    if (data.success) {
      setShowModal(false);
      setEditingUser(null);
      setForm({
        name: "",
        email: "",
        phone: "",
        password: "",
        role: "DELIVERY",
      });
      fetchUsers();
    } else {
      setMessage(data.message);
    }
  };

  /* ================= DELETE ================= */

  const handleDelete = async (id: number) => {
    await fetch(`/api/admin/user/delete?id=${id}`, {
      method: "DELETE",
    });
    fetchUsers();
  };

  /* ================= PAGINATION ================= */

  const normalUsers = users.filter(
    (u) => u.role === "USER"
  );

  const indexOfLast = currentPage * usersPerPage;
  const indexOfFirst = indexOfLast - usersPerPage;
  const currentUsers = normalUsers.slice(
    indexOfFirst,
    indexOfLast
  );

  const totalPages = Math.ceil(
    normalUsers.length / usersPerPage
  );

  const admins = users.filter(
    (u) => u.role === "ADMIN"
  );

  const delivery = users.filter(
    (u) => u.role === "DELIVERY"
  );

  return (
    <AdminLayout>
      <div className="p-6 space-y-10">

        {/* ================= HEADER ================= */}
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-bold">
            User Management
          </h2>

          <button
            onClick={() => setShowModal(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg"
          >
            + Add User
          </button>
        </div>

        {/* ================= ADMIN CARDS ================= */}
        <div>
          <h3 className="text-xl font-semibold mb-3">
            Admin Accounts
          </h3>
          <div className="grid grid-cols-3 gap-4">
            {admins.map((u) => (
              <div
                key={u.id}
                className="bg-white shadow rounded-xl p-4 border"
              >
                <h4 className="font-semibold">{u.name}</h4>
                <p className="text-sm">{u.email}</p>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => {
                      setEditingUser(u);
                      setForm({
                        name: u.name,
                        email: u.email,
                        phone: u.phone,
                        password: "",
                        role: u.role,
                      });
                      setShowModal(true);
                    }}
                    className="bg-yellow-500 text-white px-2 py-1 rounded text-xs"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(u.id)}
                    className="bg-red-600 text-white px-2 py-1 rounded text-xs"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ================= DELIVERY CARDS ================= */}
        <div>
          <h3 className="text-xl font-semibold mb-3">
            Delivery Boys
          </h3>
          <div className="grid grid-cols-3 gap-4">
            {delivery.map((u) => (
              <div
                key={u.id}
                className="bg-white shadow rounded-xl p-4 border"
              >
                <h4 className="font-semibold">{u.name}</h4>
                <p className="text-sm">{u.email}</p>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => {
                      setEditingUser(u);
                      setForm({
                        name: u.name,
                        email: u.email,
                        phone: u.phone,
                        password: "",
                        role: u.role,
                      });
                      setShowModal(true);
                    }}
                    className="bg-yellow-500 text-white px-2 py-1 rounded text-xs"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(u.id)}
                    className="bg-red-600 text-white px-2 py-1 rounded text-xs"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ================= USER TABLE ================= */}
        <div>
          <h3 className="text-xl font-semibold mb-3">
            Customers
          </h3>

          <div className="bg-white shadow rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-3 text-left">Name</th>
                  <th className="p-3 text-left">Email</th>
                  <th className="p-3 text-left">Phone</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {currentUsers.map((u) => (
                  <tr key={u.id} className="border-t">
                    <td className="p-3">{u.name}</td>
                    <td className="p-3">{u.email}</td>
                    <td className="p-3">{u.phone}</td>
                    <td className="p-3 text-right space-x-2">
                      <button
                        onClick={() => {
                          setEditingUser(u);
                          setForm({
                            name: u.name,
                            email: u.email,
                            phone: u.phone,
                            password: "",
                            role: u.role,
                          });
                          setShowModal(true);
                        }}
                        className="bg-yellow-500 text-white px-2 py-1 rounded text-xs"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(u.id)}
                        className="bg-red-600 text-white px-2 py-1 rounded text-xs"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex justify-center mt-4 gap-2">
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`px-3 py-1 rounded ${
                  currentPage === i + 1
                    ? "bg-green-600 text-white"
                    : "bg-gray-200"
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>

        {/* ================= MODAL ================= */}
        {showModal && (
          <div className="fixed inset-0 bg-black/40 flex justify-center items-center">
            <div className="bg-white w-full max-w-md p-6 rounded-xl shadow-lg space-y-4">
              <h3 className="text-xl font-bold">
                {editingUser ? "Edit User" : "Add User"}
              </h3>

              <input
                placeholder="Name"
                className="w-full border p-2 rounded"
                value={form.name}
                onChange={(e) =>
                  setForm({ ...form, name: e.target.value })
                }
              />

              <input
                placeholder="Email"
                className="w-full border p-2 rounded"
                value={form.email}
                onChange={(e) =>
                  setForm({ ...form, email: e.target.value })
                }
              />

              <input
                placeholder="Phone"
                className="w-full border p-2 rounded"
                value={form.phone}
                onChange={(e) =>
                  setForm({ ...form, phone: e.target.value })
                }
              />

              {!editingUser && (
                <input
                  placeholder="Password"
                  type="password"
                  className="w-full border p-2 rounded"
                  value={form.password}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      password: e.target.value,
                    })
                  }
                />
              )}

              <select
                className="w-full border p-2 rounded"
                value={form.role}
                onChange={(e) =>
                  setForm({
                    ...form,
                    role: e.target.value,
                  })
                }
              >
                <option value="DELIVERY">
                  Delivery
                </option>
                <option value="ADMIN">
                  Admin
                </option>
                <option value="USER">
                  User
                </option>
              </select>

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-3 py-1 border rounded"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  className="px-3 py-1 bg-green-600 text-white rounded"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
