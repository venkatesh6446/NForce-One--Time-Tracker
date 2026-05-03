import React, { useState, useEffect } from "react";
import { fetchTasks, createTask, updateTask, deleteTask, fetchProjects } from "../services/api";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Badge } from "../components/ui/Badge";
import { Plus, Pencil, Trash2 } from "lucide-react";

export const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    projectId: "",
    isBillableDefault: true,
    status: "PENDING",
  });

  const loadData = async () => {
    try {
      const [tasksRes, projectsRes] = await Promise.all([
        fetchTasks(),
        fetchProjects(),
      ]);
      setTasks(tasksRes?.data || []);
      setProjects(projectsRes?.data || []);
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
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        projectId: formData.projectId ? Number(formData.projectId) : null,
        isBillableDefault: formData.isBillableDefault === "true" || formData.isBillableDefault === true,
      };
      if (editingId) {
        await updateTask(editingId, payload);
      } else {
        await createTask(payload);
      }
      setFormData({ title: "", description: "", category: "", projectId: "", isBillableDefault: true, status: "PENDING" });
      setShowForm(false);
      setEditingId(null);
      await loadData();
    } catch (error) {
      alert("Operation failed");
    }
  };

  const handleEdit = (task) => {
    setFormData({
      title: task.title,
      description: task.description || "",
      category: task.category || "",
      projectId: task.projectId || "",
      isBillableDefault: task.isBillableDefault,
      status: task.status,
    });
    setEditingId(task.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this task?")) return;
    try {
      await deleteTask(id);
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
          <h1 className="text-2xl font-bold text-text-primary">Task Management</h1>
          <p className="text-text-secondary">Manage tasks and categories</p>
        </div>
        <Button onClick={() => { setShowForm(true); setEditingId(null); setFormData({ title: "", description: "", category: "", projectId: "", isBillableDefault: true, status: "PENDING" }); }}>
          <Plus className="w-4 h-4 mr-2" />
          Add Task
        </Button>
      </div>

      {showForm && (
        <Card className="border-border-subtle">
          <CardHeader>
            <CardTitle className="text-text-primary">{editingId ? "Edit Task" : "Create Task"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input name="title" value={formData.title} onChange={handleInputChange} placeholder="Task Title" required />
              <select name="projectId" value={formData.projectId} onChange={handleInputChange} className={selectClassName}>
                <option value="" className="bg-bg-secondary">Select Project</option>
                {projects.map((p) => <option key={p.id} value={p.id} className="bg-bg-secondary">{p.name}</option>)}
              </select>
              <Input name="category" value={formData.category} onChange={handleInputChange} placeholder="Category" />
              <select name="isBillableDefault" value={formData.isBillableDefault} onChange={handleInputChange} className={selectClassName}>
                <option value="true" className="bg-bg-secondary">Billable</option>
                <option value="false" className="bg-bg-secondary">Non-Billable</option>
              </select>
              <select name="status" value={formData.status} onChange={handleInputChange} className={selectClassName}>
                <option value="PENDING" className="bg-bg-secondary">Pending</option>
                <option value="IN_PROGRESS" className="bg-bg-secondary">In Progress</option>
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
                  <th className="px-4 py-3 text-left text-text-secondary font-medium">Title</th>
                  <th className="px-4 py-3 text-left text-text-secondary font-medium">Project</th>
                  <th className="px-4 py-3 text-left text-text-secondary font-medium">Category</th>
                  <th className="px-4 py-3 text-left text-text-secondary font-medium">Billable</th>
                  <th className="px-4 py-3 text-left text-text-secondary font-medium">Status</th>
                  <th className="px-4 py-3 text-left text-text-secondary font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan="6" className="text-center py-8 text-text-secondary">Loading...</td></tr>
                ) : tasks.length === 0 ? (
                  <tr><td colSpan="6" className="text-center py-8 text-text-secondary">No tasks found</td></tr>
                ) : (
                  tasks.map((task) => (
                    <tr key={task.id} className="border-b border-border-subtle hover:bg-bg-tertiary/50 transition-colors">
                      <td className="px-4 py-3 text-text-primary font-medium">{task.title}</td>
                      <td className="px-4 py-3 text-text-secondary">{task.Project?.name || "-"}</td>
                      <td className="px-4 py-3 text-text-secondary">{task.category || "-"}</td>
                      <td className="px-4 py-3">
                        <Badge variant={task.isBillableDefault ? "success" : "warning"}>
                          {task.isBillableDefault ? "Billable" : "Non-Billable"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={task.status === "COMPLETED" ? "success" : task.status === "IN_PROGRESS" ? "primary" : "default"}>
                          {task.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 space-x-2">
                        <Button size="sm" variant="secondary" onClick={() => handleEdit(task)}><Pencil className="w-4 h-4" /></Button>
                        <Button size="sm" variant="danger" onClick={() => handleDelete(task.id)}><Trash2 className="w-4 h-4" /></Button>
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
