import React, { useState, useEffect } from "react";
import {
  getEmployeeHoursReport,
  getProjectHoursReport,
  getUtilizationReport,
  getBillingSummary,
  fetchProjects,
  fetchClients,
} from "../services/api";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Badge } from "../components/ui/Badge";
import { BarChart3, Download } from "lucide-react";
import { format } from "date-fns";

export const Reports = () => {
  const [activeTab, setActiveTab] = useState("employee-hours");
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [projects, setProjects] = useState([]);
  const [clients, setClients] = useState([]);
  const [filters, setFilters] = useState({
    startDate: format(new Date(new Date().getFullYear(), new Date().getMonth(), 1), "yyyy-MM-dd"),
    endDate: format(new Date(), "yyyy-MM-dd"),
    projectId: "",
    clientId: "",
    department: "",
  });

  useEffect(() => {
    fetchProjects().then((res) => setProjects(res?.data || []));
    fetchClients().then((res) => setClients(res?.data || []));
  }, []);

  useEffect(() => {
    loadReport();
  }, [activeTab]);

  const loadReport = async () => {
    setIsLoading(true);
    try {
      let response;
      switch (activeTab) {
        case "employee-hours":
          response = await getEmployeeHoursReport(filters);
          break;
        case "project-hours":
          response = await getProjectHoursReport(filters);
          break;
        case "utilization":
          response = await getUtilizationReport(filters);
          break;
        case "billing":
          response = await getBillingSummary(filters);
          break;
        default:
          response = { data: [] };
      }
      setData(response?.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const exportCSV = () => {
    if (!data.length) return;
    const headers = Object.keys(data[0]).join(",");
    const rows = data.map((row) => Object.values(row).join(",")).join("\n");
    const csv = `${headers}\n${rows}`;
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${activeTab}-report.csv`;
    a.click();
  };

  const tabs = [
    { id: "employee-hours", label: "Employee Hours" },
    { id: "project-hours", label: "Project Hours" },
    { id: "utilization", label: "Utilization" },
    { id: "billing", label: "Billing Summary" },
  ];

  const renderTableHeader = (headers) => (
    <thead className="bg-bg-tertiary border-b border-border-subtle">
      <tr>
        {headers.map((h) => (
          <th key={h} className="px-4 py-3 text-left text-text-secondary font-medium">{h}</th>
        ))}
      </tr>
    </thead>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Reports</h1>
          <p className="text-text-secondary">View and export time tracking reports</p>
        </div>
        <Button onClick={exportCSV} disabled={!data.length} className="shadow-[0_0_20px_rgba(255,45,45,0.3)]">
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
      </div>

      <Card className="border-border-subtle">
        <CardContent className="pt-6">
          <div className="flex gap-4 mb-4 flex-wrap">
            <Input name="startDate" type="date" value={filters.startDate} onChange={handleFilterChange} />
            <Input name="endDate" type="date" value={filters.endDate} onChange={handleFilterChange} />
            <select
              name="projectId"
              value={filters.projectId}
              onChange={handleFilterChange}
              className="h-10 rounded-md border border-border-subtle bg-bg-tertiary text-text-primary px-3 py-2 text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
            >
              <option value="" className="bg-bg-secondary">All Projects</option>
              {projects.map((p) => <option key={p.id} value={p.id} className="bg-bg-secondary">{p.name}</option>)}
            </select>
            <select
              name="clientId"
              value={filters.clientId}
              onChange={handleFilterChange}
              className="h-10 rounded-md border border-border-subtle bg-bg-tertiary text-text-primary px-3 py-2 text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
            >
              <option value="" className="bg-bg-secondary">All Clients</option>
              {clients.map((c) => <option key={c.id} value={c.id} className="bg-bg-secondary">{c.name}</option>)}
            </select>
            <Input name="department" value={filters.department} onChange={handleFilterChange} placeholder="Department" />
            <Button onClick={loadReport} className="shadow-[0_0_15px_rgba(255,45,45,0.2)]">
              <BarChart3 className="w-4 h-4 mr-2" />Generate
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border-subtle">
        <CardHeader>
          <div className="flex gap-2 flex-wrap">
            {tabs.map((tab) => (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? "primary" : "secondary"}
                size="sm"
                onClick={() => setActiveTab(tab.id)}
                className={activeTab === tab.id ? "shadow-[0_0_15px_rgba(255,45,45,0.3)]" : ""}
              >
                {tab.label}
              </Button>
            ))}
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-text-secondary">Loading...</div>
          ) : data.length === 0 ? (
            <div className="text-center py-8 text-text-secondary">No data found. Adjust filters and generate report.</div>
          ) : activeTab === "employee-hours" ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                {renderTableHeader(["Employee", "Project", "Task", "Date", "Hours", "Billable", "Status"])}
                <tbody>
                  {data.map((entry, i) => (
                    <tr key={i} className="border-b border-border-subtle hover:bg-bg-tertiary/50 transition-colors">
                      <td className="px-4 py-3 text-text-primary">{entry.User?.name || "-"}</td>
                      <td className="px-4 py-3 text-text-primary">{entry.Project?.name || "-"}</td>
                      <td className="px-4 py-3 text-text-primary">{entry.Task?.title || "-"}</td>
                      <td className="px-4 py-3 text-text-secondary">{entry.entryDate}</td>
                      <td className="px-4 py-3 text-text-primary">{entry.hours}h</td>
                      <td className="px-4 py-3">
                        <Badge variant={entry.isBillable ? "success" : "warning"}>
                          {entry.isBillable ? "Yes" : "No"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={entry.status === "APPROVED" ? "approved" : entry.status === "SUBMITTED" ? "submitted" : "default"}>
                          {entry.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : activeTab === "project-hours" ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                {renderTableHeader(["Project", "Client", "Employee", "Date", "Hours"])}
                <tbody>
                  {data.map((entry, i) => (
                    <tr key={i} className="border-b border-border-subtle hover:bg-bg-tertiary/50 transition-colors">
                      <td className="px-4 py-3 text-text-primary">{entry.Project?.name || "-"}</td>
                      <td className="px-4 py-3 text-text-primary">{entry.Client?.name || "-"}</td>
                      <td className="px-4 py-3 text-text-primary">{entry.User?.name || "-"}</td>
                      <td className="px-4 py-3 text-text-secondary">{entry.entryDate}</td>
                      <td className="px-4 py-3 text-text-primary">{entry.hours}h</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : activeTab === "utilization" ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                {renderTableHeader(["Employee", "Department", "Total Hours", "Billable", "Non-Billable", "Utilization %"])}
                <tbody>
                  {data.map((u, i) => (
                    <tr key={i} className="border-b border-border-subtle hover:bg-bg-tertiary/50 transition-colors">
                      <td className="px-4 py-3 text-text-primary">{u.name}</td>
                      <td className="px-4 py-3 text-text-secondary">{u.department || "-"}</td>
                      <td className="px-4 py-3 text-text-primary">{u.totalHours}h</td>
                      <td className="px-4 py-3 text-text-primary">{u.billableHours}h</td>
                      <td className="px-4 py-3 text-text-primary">{u.nonBillableHours}h</td>
                      <td className="px-4 py-3">
                        <Badge variant={u.utilizationPercent >= 70 ? "success" : u.utilizationPercent >= 50 ? "warning" : "danger"}>
                          {u.utilizationPercent}%
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : activeTab === "billing" ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                {renderTableHeader(["Client", "Project", "Total Billable Hours"])}
                <tbody>
                  {data.map((b, i) => (
                    <tr key={i} className="border-b border-border-subtle hover:bg-bg-tertiary/50 transition-colors">
                      <td className="px-4 py-3 text-text-primary">{b.clientName}</td>
                      <td className="px-4 py-3 text-text-primary">{b.projectName}</td>
                      <td className="px-4 py-3 text-text-primary">{b.totalHours}h</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
};
