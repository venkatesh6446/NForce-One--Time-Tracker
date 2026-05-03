import React, { useState, useEffect } from "react";
import { fetchClients, createClient, updateClient, deleteClient } from "../services/api";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Badge } from "../components/ui/Badge";
import { Plus, Pencil, Trash2 } from "lucide-react";

export const Clients = () => {
  const [clients, setClients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    company: "",
    email: "",
    phone: "",
    status: "ACTIVE",
    billingType: "HOURLY",
  });

  const loadClients = async () => {
    try {
      const response = await fetchClients();
      setClients(response?.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadClients();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateClient(editingId, formData);
      } else {
        await createClient(formData);
      }
      setFormData({ name: "", code: "", company: "", email: "", phone: "", status: "ACTIVE", billingType: "HOURLY" });
      setShowForm(false);
      setEditingId(null);
      await loadClients();
    } catch (error) {
      alert("Operation failed");
    }
  };

  const handleEdit = (client) => {
    setFormData({
      name: client.name,
      code: client.code || "",
      company: client.company || "",
      email: client.email || "",
      phone: client.phone || "",
      status: client.status,
      billingType: client.billingType,
    });
    setEditingId(client.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this client?")) return;
    try {
      await deleteClient(id);
      await loadClients();
    } catch (error) {
      alert("Delete failed");
    }
  };

  const selectClassName = "h-10 rounded-md border border-border-subtle bg-bg-tertiary text-text-primary px-3 py-2 text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent";

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Client Management</h1>
          <p className="text-text-secondary">Manage clients and billing types</p>
        </div>
        <Button onClick={() => { setShowForm(true); setEditingId(null); setFormData({ name: "", code: "", company: "", email: "", phone: "", status: "ACTIVE", billingType: "HOURLY" }); }}>
          <Plus className="w-4 h-4 mr-2" />
          Add Client
        </Button>
      </div>

      {showForm && (
        <Card className="border-border-subtle">
          <CardHeader>
            <CardTitle className="text-text-primary">{editingId ? "Edit Client" : "Create Client"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input name="name" value={formData.name} onChange={handleInputChange} placeholder="Client Name" required />
              <Input name="code" value={formData.code} onChange={handleInputChange} placeholder="Client Code" />
              <Input name="company" value={formData.company} onChange={handleInputChange} placeholder="Company" />
              <Input name="email" type="email" value={formData.email} onChange={handleInputChange} placeholder="Email" />
              <Input name="phone" value={formData.phone} onChange={handleInputChange} placeholder="Phone" />
              <select name="status" value={formData.status} onChange={handleInputChange} className={selectClassName}>
                <option value="ACTIVE" className="bg-bg-secondary">Active</option>
                <option value="INACTIVE" className="bg-bg-secondary">Inactive</option>
              </select>
              <select name="billingType" value={formData.billingType} onChange={handleInputChange} className={selectClassName}>
                <option value="HOURLY" className="bg-bg-secondary">Hourly</option>
                <option value="FIXED" className="bg-bg-secondary">Fixed</option>
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
                  <th className="px-4 py-3 text-left text-text-secondary font-medium">Code</th>
                  <th className="px-4 py-3 text-left text-text-secondary font-medium">Company</th>
                  <th className="px-4 py-3 text-left text-text-secondary font-medium">Email</th>
                  <th className="px-4 py-3 text-left text-text-secondary font-medium">Billing Type</th>
                  <th className="px-4 py-3 text-left text-text-secondary font-medium">Status</th>
                  <th className="px-4 py-3 text-left text-text-secondary font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan="7" className="text-center py-8 text-text-secondary">Loading...</td></tr>
                ) : clients.length === 0 ? (
                  <tr><td colSpan="7" className="text-center py-8 text-text-secondary">No clients found</td></tr>
                ) : (
                  clients.map((client) => (
                    <tr key={client.id} className="border-b border-border-subtle hover:bg-bg-tertiary/50 transition-colors">
                      <td className="px-4 py-3 text-text-primary font-medium">{client.name}</td>
                      <td className="px-4 py-3 text-text-secondary">{client.code || "-"}</td>
                      <td className="px-4 py-3 text-text-secondary">{client.company || "-"}</td>
                      <td className="px-4 py-3 text-text-secondary">{client.email || "-"}</td>
                      <td className="px-4 py-3">
                        <Badge variant="primary">{client.billingType}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={client.status === "ACTIVE" ? "success" : "danger"}>
                          {client.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 space-x-2">
                        <Button size="sm" variant="secondary" onClick={() => handleEdit(client)}><Pencil className="w-4 h-4" /></Button>
                        <Button size="sm" variant="danger" onClick={() => handleDelete(client.id)}><Trash2 className="w-4 h-4" /></Button>
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
