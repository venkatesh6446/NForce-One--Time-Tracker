import React, { useState, useEffect } from "react";
import { format } from "date-fns";

import { fetchTimeEntries, approveTimeEntry, rejectTimeEntry } from "../services/api";

import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/Card";
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
      const data = response?.data || [];
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
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Approvals</h1>
        <p className="text-text-secondary">
          Review and approve submitted time entries.
        </p>
      </div>

      <Card className="border-border-subtle">
        <CardContent className="p-0">
          <div className="overflow-x-auto min-h-[300px]">
            <table className="w-full text-sm">
              <thead className="bg-bg-tertiary border-b border-border-subtle">
                <tr>
                  <th className="px-3 py-3 text-left text-text-secondary font-medium">EmpID</th>
                  <th className="px-3 py-3 text-left text-text-secondary font-medium">Name</th>
                  <th className="px-3 py-3 text-left text-text-secondary font-medium">Client</th>
                  <th className="px-3 py-3 text-left text-text-secondary font-medium">Project</th>
                  <th className="px-3 py-3 text-left text-text-secondary font-medium">Task</th>
                  <th className="px-3 py-3 text-left text-text-secondary font-medium">Description</th>
                  <th className="px-3 py-3 text-center text-text-secondary font-medium">Status</th>
                  <th className="px-3 py-3 text-right text-text-secondary font-medium">Action</th>
                </tr>
              </thead>

              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan="8" className="text-center py-8 text-text-secondary">
                      Loading entries...
                    </td>
                  </tr>
                ) : entries.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center py-8 text-text-secondary">
                      No pending approvals
                    </td>
                  </tr>
                ) : (
                  entries.map((entry) => (
                    <tr key={entry.id} className="border-b border-border-subtle hover:bg-bg-tertiary/50 transition-colors">
                      <td className="px-3 py-3 text-text-primary font-medium">
                        {entry.userId}
                      </td>
                      <td className="px-3 py-3 text-text-primary">
                        {entry.User?.name || entry.user?.name || "Unknown"}
                      </td>
                      <td className="px-3 py-3 text-text-secondary">
                        {entry.client || "-"}
                      </td>
                      <td className="px-3 py-3 text-text-secondary">
                        {entry.project || "-"}
                      </td>
                      <td className="px-3 py-3 text-text-secondary">
                        {entry.task || "-"}
                      </td>
                      <td className="px-3 py-3 text-text-secondary max-w-[200px] truncate" title={entry.description || ""}>
                        {entry.description || "-"}
                      </td>
                      <td className="px-3 py-3 text-center">
                        <Badge variant="submitted">
                          {entry.status}
                        </Badge>
                      </td>
                      <td className="px-3 py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            className="bg-green-600/20 text-green-400 border border-green-500/30 hover:bg-green-600/30"
                            onClick={() => handleApprove(entry.id)}
                          >
                            <Check className="w-3.5 h-3.5" />
                            Approve
                          </Button>

                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => handleReject(entry.id)}
                          >
                            <X className="w-3.5 h-3.5" />
                            Reject
                          </Button>
                        </div>
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
