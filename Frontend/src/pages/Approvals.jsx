import React, { useState, useEffect } from "react";
import { format } from "date-fns";

// ✅ FIXED PATH
import { fetchTimeEntries, approveTimeEntry, rejectTimeEntry } from "../services/api";

// ✅ FIXED PATHS
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";

import { Check, X } from "lucide-react";

export const Approvals = () => {
  const [entries, setEntries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadEntries = async () => {
    try {
      setIsLoading(true);

      const response = await fetchTimeEntries();

      // ✅ FIX: correct backend response handling
      const data = response?.data || [];

      // ✅ FIX: status should match backend (UPPERCASE)
      const submittedEntries = data.filter(
        (e) => e.status === "SUBMITTED"
      );

      setEntries(submittedEntries);

    } catch (error) {
      console.error("Failed to fetch approvals", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadEntries();
  }, []);

  const handleApprove = async (id) => {
    try {
      await approveTimeEntry(id);
      await loadEntries();
    } catch (error) {
      console.error("Failed to approve", error);
    }
  };

  const handleReject = async (id) => {
    try {
      await rejectTimeEntry(id);
      await loadEntries();
    } catch (error) {
      console.error("Failed to reject", error);
    }
  };

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Approvals</h1>
        <p className="text-gray-500">
          Review and approve submitted time entries.
        </p>
      </div>

      {/* TABLE */}
      <Card>
        <div className="overflow-x-auto min-h-[300px]">

          <table className="w-full text-sm text-left">

            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3">Employee</th>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Project / Task</th>
                <th className="px-6 py-3">Hours</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>

            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="6" className="text-center py-8">
                    Loading entries...
                  </td>
                </tr>

              ) : entries.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-8">
                    No pending approvals
                  </td>
                </tr>

              ) : (
                entries.map((entry) => (
                  <tr key={entry.id} className="border-b">

                    <td className="px-6 py-4 font-medium">
                      {entry.user?.name || `User ${entry.userId}`}
                    </td>

                    <td className="px-6 py-4">
                      {entry.entryDate
                        ? format(new Date(entry.entryDate), "MMM dd, yyyy")
                        : "-"}
                    </td>

                    <td className="px-6 py-4">
                      <div>{entry.projectId}</div>
                      <div className="text-xs text-gray-500">
                        {entry.taskId}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      {entry.hours} h
                    </td>

                    <td className="px-6 py-4">
                      <Badge variant="warning">
                        {entry.status}
                      </Badge>
                    </td>

                    <td className="px-6 py-4 text-right space-x-2">

                      <Button
                        size="sm"
                        className="bg-emerald-100 text-emerald-700"
                        onClick={() => handleApprove(entry.id)}
                      >
                        <Check className="w-4 h-4" />
                        Approve
                      </Button>

                      <Button
                        size="sm"
                        className="bg-red-100 text-red-700"
                        onClick={() => handleReject(entry.id)}
                      >
                        <X className="w-4 h-4" />
                        Reject
                      </Button>

                    </td>

                  </tr>
                ))
              )}
            </tbody>

          </table>
        </div>
      </Card>

    </div>
  );
};