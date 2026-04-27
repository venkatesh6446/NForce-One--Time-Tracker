import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import {
  fetchTimeEntries,
  createTimeEntry,
  submitTimeEntry,
  updateTimeEntry,
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

import { Plus, Send, Pencil } from "lucide-react";

export const MyTimesheet = () => {
  const [entries, setEntries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [managers, setManagers] = useState([]);
  const [selectedManager, setSelectedManager] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});

  const [formData, setFormData] = useState({
    project: "",
    task: "",
    date: format(new Date(), "yyyy-MM-dd"),
    hours: "",
    description: "",
  });

  // ================= LOAD ENTRIES =================
  const loadEntries = async () => {
    try {
      setIsLoading(true);
      const response = await fetchTimeEntries();

      if (Array.isArray(response)) setEntries(response);
      else if (response?.data) setEntries(response.data);
      else setEntries([]);
    } catch (error) {
      console.error("Failed to fetch entries", error);
    } finally {
      setIsLoading(false);
    }
  };

  // ================= LOAD MANAGERS =================
  const loadManagers = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get(
        "http://localhost:5000/api/auth/managers",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setManagers(res.data.data || []);
    } catch (err) {
      console.error("Manager fetch error", err);
    }
  };

  useEffect(() => {
    loadEntries();
    loadManagers();
  }, []);

  // ================= INPUT =================
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ================= CREATE =================
  const handleCreate = async (e) => {
    e.preventDefault();

    // ✅ VALIDATION
    if (
      !formData.project ||
      !formData.task ||
      !formData.hours ||
      !selectedManager
    ) {
      alert("Please fill all required fields");
      return;
    }

    try {
      setIsSubmitting(true);

      const payload = {
        project: formData.project,
        task: formData.task,
        date: formData.date,
        hours: Number(formData.hours),
        description: formData.description,
        userId: Number(selectedManager), // ✅ FIXED
      };

      console.log("Sending payload:", payload);

      await createTimeEntry(payload);

      // ✅ RESET FORM
      setFormData({
        project: "",
        task: "",
        date: format(new Date(), "yyyy-MM-dd"),
        hours: "",
        description: "",
      });

      setSelectedManager("");

      await loadEntries();
    } catch (error) {
      console.error("Create error:", error);
      alert("Failed to add entry");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ================= SUBMIT =================
  const handleSubmitEntry = async (id) => {
    try {
      await submitTimeEntry(id);
      await loadEntries();
    } catch (err) {
      console.error(err);
    }
  };

  // ================= EDIT =================
  const handleEdit = (entry) => {
    setEditingId(entry.id);
    setEditData({
      project: entry.project,
      task: entry.task,
      entryDate: entry.entryDate,
      hours: entry.hours,
      description: entry.description,
    });
  };

  const handleSave = async (id) => {
    try {
      await updateTimeEntry(id, {
        project: editData.project,
        task: editData.task,
        entryDate: editData.entryDate,
        hours: Number(editData.hours),
        description: editData.description,
      });

      setEditingId(null);
      await loadEntries();
    } catch (err) {
      console.error(err);
    }
  };

  // ================= STATUS =================
  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case "DRAFT":
        return "default";
      case "SUBMITTED":
        return "warning";
      case "APPROVED":
        return "success";
      case "REJECTED":
        return "danger";
      default:
        return "default";
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">My Timesheet</h1>

      {/* FORM */}
      <Card>
        <CardHeader>
          <CardTitle>Log Time</CardTitle>
        </CardHeader>

        <CardContent>
          <form
            onSubmit={handleCreate}
            className="grid grid-cols-1 md:grid-cols-6 gap-4"
          >
            <Input
              required
              name="project"
              value={formData.project}
              onChange={handleInputChange}
              placeholder="Project"
            />

            <Input
              required
              name="task"
              value={formData.task}
              onChange={handleInputChange}
              placeholder="Task"
            />

            <Input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleInputChange}
            />

            <Input
              type="number"
              name="hours"
              value={formData.hours}
              onChange={handleInputChange}
              placeholder="Hours"
            />

            <Input
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Description"
            />

            <select
              value={selectedManager}
              onChange={(e) => setSelectedManager(e.target.value)}
              className="border p-2 rounded"
              required
            >
              <option value="">Select Manager</option>
              {managers.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>

            <Button type="submit" disabled={isSubmitting}>
              <Plus className="w-4 h-4 mr-1" />
              {isSubmitting ? "Adding..." : "Add Entry"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* TABLE */}
      <Card>
        <table className="w-full text-sm">
          <thead>
            <tr>
              <th>Date</th>
              <th>Project / Task</th>
              <th>Description</th>
              <th>Hours</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {entries.map((entry) => (
              <tr key={entry.id}>
                <td>
                  {format(new Date(entry.entryDate), "MMM dd, yyyy")}
                </td>
                <td>
                  <div>{entry.project}</div>
                  <div className="text-xs">{entry.task}</div>
                </td>
                <td>{entry.description}</td>
                <td>{entry.hours} h</td>
                <td>
                  <Badge variant={getStatusBadgeVariant(entry.status)}>
                    {entry.status}
                  </Badge>
                </td>
                <td>
                  {entry.status === "DRAFT" && (
                    <>
                      <Button size="sm" onClick={() => handleEdit(entry)}>
                        <Pencil />
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleSubmitEntry(entry.id)}
                      >
                        <Send />
                      </Button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
};