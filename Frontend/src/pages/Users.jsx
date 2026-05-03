import React, { useState, useEffect } from "react";
import {
  fetchUsers,
  createUser,
  updateUser,
  deleteUser,
  toggleUserStatus,
  getManagers,
} from "../services/api";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Badge } from "../components/ui/Badge";
import { Plus, Pencil, Trash2, UserPlus, Power } from "lucide-react";

export const Users = () => {
  const [users, setUsers] = useState([]);
  const [managers, setManagers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "EMPLOYEE",
    department: "",
    managerId: "",
    defaultHours: 8,
  });

  const loadData = async () => {
    try {
      const [usersRes, managersRes] = await Promise.all([
        fetchUsers(),
        getManagers(),
      ]);
      setUsers(usersRes?.data || []);
      setManagers(managersRes?.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData, managerId: formData.managerId ? Number(formData.managerId) : null };
      if (editingId) {
        await updateUser(editingId, payload);
      } else {
        await createUser(payload);
      }
      setFormData({ name: "", email: "", password: "", role: "EMPLOYEE", department: "", managerId: "", defaultHours: 8 });
      setShowForm(false);
      setEditingId(null);
      await loadData();
    } catch (error) {
      alert(error.response?.data?.message || "Operation failed");
    }
  };

  const handleEdit = (user) => {
    setFormData({
      name: user.name,
      email: user.email,
      password: "",
      role: user.role,
      department: user.department || "",
      managerId: user.managerId || "",
      defaultHours: user.defaultHours || 8,
    });
    setEditingId(user.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this user?")) return;
    try {
      await deleteUser(id);
      await loadData();
    } catch (error) {
      alert("Delete failed");
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      await toggleUserStatus(id);
      await loadData();
    } catch (error) {
      alert("Status update failed");
    }
  };

  const selectClassName = "h-10 rounded-md border border-border-subtle bg-bg-tertiary text-text-primary px-3 py-2 text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent";

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">User Management</h1>
          <p className="text-text-secondary">Manage system users and roles</p>
        </div>
        <Button onClick={() => { setShowForm(true); setEditingId(null); setFormData({ name: "", email: "", password: "", role: "EMPLOYEE", department: "", managerId: "", defaultHours: 8 }); }}>
          <UserPlus className="w-4 h-4 mr-2" />
          Add User
        </Button>
      </div>

      {showForm && (
        <Card className="border-border-subtle">
          <CardHeader>
            <CardTitle className="text-text-primary">{editingId ? "Edit User" : "Create User"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input name="name" value={formData.name} onChange={handleInputChange} placeholder="Full Name" required />
              <Input name="email" type="email" value={formData.email} onChange={handleInputChange} placeholder="Email" required />
              <Input name="password" type="password" value={formData.password} onChange={handleInputChange} placeholder={editingId ? "Leave blank to keep current" : "Password"} />
              <select name="role" value={formData.role} onChange={handleInputChange} className={selectClassName}>
                <option value="EMPLOYEE" className="bg-bg-secondary">Employee</option>
                <option value="MANAGER" className="bg-bg-secondary">Manager</option>
                <option value="ADMIN" className="bg-bg-secondary">Admin</option>
              </select>
              <Input name="department" value={formData.department} onChange={handleInputChange} placeholder="Department" />
              <Input name="defaultHours" type="number" value={formData.defaultHours} onChange={handleInputChange} placeholder="Default Hours" />
              <select name="managerId" value={formData.managerId} onChange={handleInputChange} className={selectClassName}>
                <option value="" className="bg-bg-secondary">Select Manager</option>
                {managers.map((m) => (
                  <option key={m.id} value={m.id} className="bg-bg-secondary">{m.name}</option>
                ))}
              </select>
              <div className="flex gap-2">
                <Button type="submit">{editingId ? "Update" : "Create"}</Button>
                <Button type="button" variant="secondary" onClick={() => { setShowForm(false); setEditingId(null); }}>Cancel</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card className="border-border-subtle">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-bg-tertiary border-b border-border-subtle">
                <tr>
                  <th className="px-4 py-3 text-left text-text-secondary font-medium">Name</th>
                  <th className="px-4 py-3 text-left text-text-secondary font-medium">Email</th>
                  <th className="px-4 py-3 text-left text-text-secondary font-medium">Role</th>
                  <th className="px-4 py-3 text-left text-text-secondary font-medium">Department</th>
                  <th className="px-4 py-3 text-left text-text-secondary font-medium">Manager</th>
                  <th className="px-4 py-3 text-left text-text-secondary font-medium">Status</th>
                  <th className="px-4 py-3 text-left text-text-secondary font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan="7" className="text-center py-8 text-text-secondary">Loading...</td></tr>
                ) : users.length === 0 ? (
                  <tr><td colSpan="7" className="text-center py-8 text-text-secondary">No users found</td></tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.id} className="border-b border-border-subtle hover:bg-bg-tertiary/50 transition-colors">
                      <td className="px-4 py-3 text-text-primary font-medium">{user.name}</td>
                      <td className="px-4 py-3 text-text-secondary">{user.email}</td>
                      <td className="px-4 py-3">
                        <Badge variant={user.role === "ADMIN" ? "danger" : user.role === "MANAGER" ? "warning" : "default"}>
                          {user.role}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-text-secondary">{user.department || "-"}</td>
                      <td className="px-4 py-3 text-text-secondary">{user.Manager?.name || "-"}</td>
                      <td className="px-4 py-3">
                        <Badge variant={user.isActive ? "success" : "danger"}>
                          {user.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 space-x-2">
                        <Button size="sm" variant="secondary" onClick={() => handleEdit(user)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="secondary" onClick={() => handleToggleStatus(user.id)}>
                          <Power className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="danger" onClick={() => handleDelete(user.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
