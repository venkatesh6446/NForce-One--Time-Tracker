import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { format } from "date-fns";
import {
  fetchTimeEntries,
  createTimeEntry,
  submitTimeEntry,
  updateTimeEntry,
  deleteTimeEntry,
} from "../services/api";

import axios from "axios";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Badge } from "../components/ui/Badge";

import { Plus, Send, Pencil, Trash2, Save, X } from "lucide-react";

export const MyTimesheet = () => {
  const [searchParams] = useSearchParams();
  const [entries, setEntries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [managers, setManagers] = useState([]);
  const [selectedManager, setSelectedManager] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});

  const [formData, setFormData] = useState({
    client: "",
    project: "",
    task: "",
    date: format(new Date(), "yyyy-MM-dd"),
    hours: "",
    description: "",
    clientId: null,
    projectId: null,
    taskId: null,
  });

  const loadEntries = async () => {
    try {
      setIsLoading(true);
      const response = await fetchTimeEntries();
      setEntries(response?.data || response || []);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadManagers = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        "http://localhost:5000/api/auth/managers",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = res.data?.data || res.data || [];
      setManagers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadEntries();
    loadManagers();

    const client = searchParams.get("client") || "";
    const project = searchParams.get("project") || "";
    const task = searchParams.get("task") || "";
    const description = searchParams.get("description") || "";
    const hours = searchParams.get("hours") || "";
    const date = searchParams.get("date") || format(new Date(), "yyyy-MM-dd");
    const clientId = searchParams.get("clientId") || null;
    const projectId = searchParams.get("projectId") || null;
    const taskId = searchParams.get("taskId") || null;

    if (project || task || hours) {
      setFormData({
        client,
        project,
        task,
        date,
        hours: hours ? Number(hours).toFixed(2) : "",
        description,
        clientId: clientId ? Number(clientId) : null,
        projectId: projectId ? Number(projectId) : null,
        taskId: taskId ? Number(taskId) : null,
      });
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (
      !formData.client ||
      !formData.project ||
      !formData.task ||
      !formData.hours ||
      !selectedManager
    ) {
      alert("Please fill all required fields and select a manager");
      return;
    }
    try {
      setIsSubmitting(true);
      const payload = {
        ...formData,
        managerId: selectedManager ? Number(selectedManager) : null,
      };
      await createTimeEntry(payload);
      setFormData({
        client: "",
        project: "",
        task: "",
        date: format(new Date(), "yyyy-MM-dd"),
        hours: "",
        description: "",
        clientId: null,
        projectId: null,
        taskId: null,
      });
      setSelectedManager("");
      await loadEntries();
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitEntry = async (id) => {
    await submitTimeEntry(id);
    await loadEntries();
  };

  const handleDelete = async (id) => {
    try {
      if (!window.confirm("Delete this entry?")) return;
      await deleteTimeEntry(id);
      setEntries((prev) => prev.filter((e) => e.id !== id));
    } catch (error) {
      console.error("DELETE ERROR:", error);
      alert("Delete failed");
    }
  };

  const handleEdit = (entry) => {
    setEditingId(entry.id);
    setEditData({ ...entry });
  };

  const handleSave = async (id) => {
    await updateTimeEntry(id, editData);
    setEditingId(null);
    await loadEntries();
  };

  const getStatusBadgeVariant = (status) => {
    return {
      DRAFT: "default",
      SUBMITTED: "submitted",
      APPROVED: "approved",
      REJECTED: "rejected",
    }[status] || "default";
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-text-primary">My Timesheet</h1>

      <Card className="border-border-subtle">
        <CardHeader>
          <CardTitle className="text-text-primary">Log Time</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid grid-cols-1 md:grid-cols-7 gap-4" onSubmit={handleCreate}>
            <Input name="client" value={formData.client} onChange={handleInputChange} placeholder="Client" />
            <Input name="project" value={formData.project} onChange={handleInputChange} placeholder="Project" />
            <Input name="task" value={formData.task} onChange={handleInputChange} placeholder="Task" />
            <Input type="date" name="date" value={formData.date} onChange={handleInputChange} />
            <Input type="number" step="0.01" name="hours" value={formData.hours} onChange={handleInputChange} placeholder="Hours" />
            <Input name="description" value={formData.description} onChange={handleInputChange} placeholder="Description" />
            <select
              value={selectedManager || ""}
              onChange={(e) => setSelectedManager(e.target.value)}
              className="h-10 rounded-md border border-border-subtle bg-bg-tertiary text-text-primary px-3 py-2 text-sm focus:outline-none focus:border-accent focus:shadow-[0_0_15px_rgba(255,45,45,0.2)] focus:ring-1 focus:ring-accent"
            >
              <option value="">Select Manager</option>
              {managers.map((m) => (
                <option key={m.id} value={m.id} className="bg-bg-secondary">
                  {m.name}
                </option>
              ))}
            </select>
            <Button type="submit">
              <Plus className="w-4 h-4 mr-2" /> Add Entry
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="border-border-subtle">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-bg-tertiary border-b border-border-subtle">
                <tr>
                  <th className="px-4 py-3 text-left text-text-secondary font-medium">Client</th>
                  <th className="px-4 py-3 text-left text-text-secondary font-medium">Date</th>
                  <th className="px-4 py-3 text-left text-text-secondary font-medium">Project</th>
                  <th className="px-4 py-3 text-left text-text-secondary font-medium">Task</th>
                  <th className="px-4 py-3 text-left text-text-secondary font-medium">Description</th>
                  <th className="px-4 py-3 text-left text-text-secondary font-medium">Hours</th>
                  <th className="px-4 py-3 text-left text-text-secondary font-medium">Status</th>
                  <th className="px-4 py-3 text-left text-text-secondary font-medium">ReportedTo</th>
                  <th className="px-4 py-3 text-left text-text-secondary font-medium">Manager Action</th>
                  <th className="px-4 py-3 text-left text-text-secondary font-medium">Edit</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry) => (
                  <tr key={entry.id} className="border-b border-border-subtle hover:bg-bg-tertiary/50 transition-colors">
                    <td className="px-4 py-3 text-text-primary">{entry.client || "-"}</td>
                    <td className="px-4 py-3 text-text-secondary">
                      {format(new Date(entry.entryDate), "MMM dd, yyyy")}
                    </td>
                    <td className="px-4 py-3 text-text-primary">
                      {editingId === entry.id ? (
                        <Input
                          value={editData.project}
                          onChange={(e) =>
                            setEditData({ ...editData, project: e.target.value })
                          }
                        />
                      ) : (
                        entry.project
                      )}
                    </td>
                    <td className="px-4 py-3 text-text-primary">{entry.task}</td>
                    <td className="px-4 py-3 text-text-secondary">
                      {editingId === entry.id ? (
                        <Input
                          value={editData.description}
                          onChange={(e) =>
                            setEditData({
                              ...editData,
                              description: e.target.value,
                            })
                          }
                        />
                      ) : (
                        entry.description
                      )}
                    </td>
                    <td className="px-4 py-3 text-text-primary">{entry.hours} h</td>
                    <td className="px-4 py-3">
                      <Badge variant={getStatusBadgeVariant(entry.status)}>
                        {entry.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-text-secondary">
                      {entry.Manager?.name || "-"}
                    </td>
                    <td className="px-4 py-3">
                      {entry.status === "APPROVED" && (
                        <Badge variant="approved">Approved</Badge>
                      )}
                      {entry.status === "REJECTED" && (
                        <Badge variant="rejected">Rejected</Badge>
                      )}
                      {(entry.status === "DRAFT" ||
                        entry.status === "SUBMITTED") && "-"}
                    </td>
                    <td className="px-4 py-3">
                      {entry.status === "DRAFT" && (
                        <>
                          {editingId === entry.id ? (
                            <>
                              <Button size="sm" onClick={() => handleSave(entry.id)}>
                                <Save className="w-4 h-4" />
                              </Button>
                              <Button size="sm" onClick={() => setEditingId(null)}>
                                <X className="w-4 h-4" />
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button size="sm" onClick={() => handleEdit(entry)}>
                                <Pencil className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => handleSubmitEntry(entry.id)}
                              >
                                <Send className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => handleDelete(entry.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
