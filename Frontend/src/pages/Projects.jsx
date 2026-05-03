import React, { useState, useEffect } from "react";
import { fetchProjects, createProject, updateProject, deleteProject, fetchClients, getManagers } from "../services/api";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Badge } from "../components/ui/Badge";
import { Plus, Pencil, Trash2 } from "lucide-react";

export const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [clients, setClients] = useState([]);
  const [managers, setManagers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: "",
    clientId: "",
    managerId: "",
    startDate: "",
    endDate: "",
    budgetHours: "",
    budgetAmount: "",
    status: "ACTIVE",
  });

  const loadData = async () => {
    try {
      const [projectsRes, clientsRes, managersRes] = await Promise.all([
        fetchProjects(),
        fetchClients(),
        getManagers(),
      ]);
      setProjects(projectsRes?.data || []);
      setClients(clientsRes?.data || []);
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
      const payload = {
        ...formData,
        clientId: formData.clientId ? Number(formData.clientId) : null,
        managerId: formData.managerId ? Number(formData.managerId) : null,
        budgetHours: formData.budgetHours ? Number(formData.budgetHours) : null,
        budgetAmount: formData.budgetAmount ? Number(formData.budgetAmount) : null,
      };
      if (editingId) {
        await updateProject(editingId, payload);
      } else {
        await createProject(payload);
      }
      setFormData({ name: "", code: "", description: "", clientId: "", managerId: "", startDate: "", endDate: "", budgetHours: "", budgetAmount: "", status: "ACTIVE" });
      setShowForm(false);
      setEditingId(null);
      await loadData();
    } catch (error) {
      alert("Operation failed");
    }
  };

  const handleEdit = (project) => {
    setFormData({
      name: project.name,
      code: project.code || "",
      description: project.description || "",
      clientId: project.clientId || "",
      managerId: project.managerId || "",
      startDate: project.startDate || "",
      endDate: project.endDate || "",
      budgetHours: project.budgetHours || "",
      budgetAmount: project.budgetAmount || "",
      status: project.status,
    });
    setEditingId(project.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this project?")) return;
    try {
      await deleteProject(id);
      await loadData();
    } catch (error) {
      alert("Delete failed");
    }
  };

  const selectClassName = "h-10 rounded-md border border-border-subtle bg-bg-tertiary text-text-primary px-3 py-2 text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent";

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Project Management</h1>
          <p className="text-text-secondary">Manage projects and budgets</p>
        </div>
        <Button onClick={() => { setShowForm(true); setEditingId(null); setFormData({ name: "", code: "", description: "", clientId: "", managerId: "", startDate: "", endDate: "", budgetHours: "", budgetAmount: "", status: "ACTIVE" }); }}>
          <Plus className="w-4 h-4 mr-2" />
          Add Project
        </Button>
      </div>

      {showForm && (
        <Card className="border-border-subtle">
          <CardHeader>
            <CardTitle className="text-text-primary">{editingId ? "Edit Project" : "Create Project"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input name="name" value={formData.name} onChange={handleInputChange} placeholder="Project Name" required />
              <Input name="code" value={formData.code} onChange={handleInputChange} placeholder="Project Code" />
              <select name="clientId" value={formData.clientId} onChange={handleInputChange} className={selectClassName}>
                <option value="" className="bg-bg-secondary">Select Client</option>
                {clients.map((c) => <option key={c.id} value={c.id} className="bg-bg-secondary">{c.name}</option>)}
              </select>
              <select name="managerId" value={formData.managerId} onChange={handleInputChange} className={selectClassName}>
                <option value="" className="bg-bg-secondary">Select Manager</option>
                {managers.map((m) => <option key={m.id} value={m.id} className="bg-bg-secondary">{m.name}</option>)}
              </select>
              <Input name="startDate" type="date" value={formData.startDate} onChange={handleInputChange} />
              <Input name="endDate" type="date" value={formData.endDate} onChange={handleInputChange} />
              <Input name="budgetHours" type="number" value={formData.budgetHours} onChange={handleInputChange} placeholder="Budget Hours" />
              <Input name="budgetAmount" type="number" value={formData.budgetAmount} onChange={handleInputChange} placeholder="Budget Amount" />
              <select name="status" value={formData.status} onChange={handleInputChange} className={selectClassName}>
                <option value="ACTIVE" className="bg-bg-secondary">Active</option>
                <option value="INACTIVE" className="bg-bg-secondary">Inactive</option>
                <option value="COMPLETED" className="bg-bg-secondary">Completed</option>
              </select>
              <div className="md:col-span-3">
                <Input name="description" value={formData.description} onChange={handleInputChange} placeholder="Description" />
              </div>
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
                  <th className="px-4 py-3 text-left text-text-secondary font-medium">Client</th>
                  <th className="px-4 py-3 text-left text-text-secondary font-medium">Budget Hours</th>
                  <th className="px-4 py-3 text-left text-text-secondary font-medium">Budget Amount</th>
                  <th className="px-4 py-3 text-left text-text-secondary font-medium">Status</th>
                  <th className="px-4 py-3 text-left text-text-secondary font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan="7" className="text-center py-8 text-text-secondary">Loading...</td></tr>
                ) : projects.length === 0 ? (
                  <tr><td colSpan="7" className="text-center py-8 text-text-secondary">No projects found</td></tr>
                ) : (
                  projects.map((project) => (
                    <tr key={project.id} className="border-b border-border-subtle hover:bg-bg-tertiary/50 transition-colors">
                      <td className="px-4 py-3 text-text-primary font-medium">{project.name}</td>
                      <td className="px-4 py-3 text-text-secondary">{project.code || "-"}</td>
                      <td className="px-4 py-3 text-text-secondary">{project.Client?.name || "-"}</td>
                      <td className="px-4 py-3 text-text-primary">{project.budgetHours || "-"}</td>
                      <td className="px-4 py-3 text-text-primary">${project.budgetAmount || "-"}</td>
                      <td className="px-4 py-3">
                        <Badge variant={project.status === "ACTIVE" ? "success" : project.status === "COMPLETED" ? "primary" : "danger"}>
                          {project.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 space-x-2">
                        <Button size="sm" variant="secondary" onClick={() => handleEdit(project)}><Pencil className="w-4 h-4" /></Button>
                        <Button size="sm" variant="danger" onClick={() => handleDelete(project.id)}><Trash2 className="w-4 h-4" /></Button>
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
