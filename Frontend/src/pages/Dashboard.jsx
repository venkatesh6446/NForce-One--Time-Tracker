import React, { useEffect, useState } from "react";
import { getDashboardStats } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/Card";
import { Clock, CheckCircle, AlertCircle, BarChart3, Users, FolderOpen, Building } from "lucide-react";

export const Dashboard = () => {
  const [stats, setStats] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  const isManagerOrAdmin = user?.role === "MANAGER" || user?.role === "ADMIN";
  const isAdmin = user?.role === "ADMIN";

  useEffect(() => {
    const loadStats = async () => {
      try {
        const response = await getDashboardStats();
        setStats(response?.data || {});
      } catch (error) {
        console.error("Failed to load dashboard data", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadStats();
  }, []);

  const statCards = [
    {
      title: "Total Hours This Week",
      value: `${stats.totalWeekHours || 0}h`,
      icon: Clock,
      color: "text-accent",
      bgColor: "bg-accent/20",
      shadowColor: "shadow-[0_0_30px_rgba(255,45,45,0.15)]",
    },
    {
      title: "Billable Hours",
      value: `${stats.billableWeekHours || 0}h`,
      icon: BarChart3,
      color: "text-accent",
      bgColor: "bg-accent/20",
      shadowColor: "shadow-[0_0_30px_rgba(255,45,45,0.15)]",
    },
    {
      title: "Non-Billable Hours",
      value: `${stats.nonBillableWeekHours || 0}h`,
      icon: Clock,
      color: "text-text-secondary",
      bgColor: "bg-bg-tertiary",
      shadowColor: "",
    },
    {
      title: "Draft Entries",
      value: stats.draftEntries || 0,
      icon: AlertCircle,
      color: "text-yellow-400",
      bgColor: "bg-yellow-500/20",
      shadowColor: "shadow-[0_0_20px_rgba(250,204,21,0.15)]",
    },
  ];

  if (isManagerOrAdmin) {
    statCards.push({
      title: "Pending Approvals",
      value: stats.pendingApprovals || 0,
      icon: CheckCircle,
      color: "text-green-400",
      bgColor: "bg-green-500/20",
      shadowColor: "shadow-[0_0_20px_rgba(34,197,94,0.15)]",
    });
  }

  if (isAdmin) {
    statCards.push(
      { title: "Total Users", value: stats.totalUsers || 0, icon: Users, color: "text-blue-400", bgColor: "bg-blue-500/20", shadowColor: "shadow-[0_0_20px_rgba(59,130,246,0.15)]" },
      { title: "Active Projects", value: stats.totalProjects || 0, icon: FolderOpen, color: "text-teal-400", bgColor: "bg-teal-500/20", shadowColor: "shadow-[0_0_20px_rgba(45,212,191,0.15)]" },
      { title: "Active Clients", value: stats.totalClients || 0, icon: Building, color: "text-rose-400", bgColor: "bg-rose-500/20", shadowColor: "shadow-[0_0_20px_rgba(251,113,133,0.15)]" }
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Dashboard</h1>
        <p className="text-text-secondary">Welcome back, {user?.name || "User"}!</p>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((n) => (
            <Card key={n} className="animate-pulse border-border-subtle">
              <CardHeader className="flex justify-between pb-2">
                <div className="h-4 w-1/2 bg-bg-tertiary rounded"></div>
                <div className="h-4 w-4 bg-bg-tertiary rounded-full"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 w-1/3 bg-bg-tertiary rounded mb-2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {statCards.map((card) => (
            <Card key={card.title} className={`hover:${card.shadowColor} border-border-subtle`}>
              <CardHeader className="flex justify-between pb-2">
                <CardTitle className="text-sm text-text-secondary">{card.title}</CardTitle>
                <div className={`p-2 rounded-full ${card.bgColor} border border-border-subtle`}>
                  <card.icon className={`w-4 h-4 ${card.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className={`text-3xl font-bold ${card.color === 'text-accent' ? 'text-text-primary drop-shadow-[0_0_10px_rgba(255,45,45,0.3)]' : 'text-text-primary'}`}>{card.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {isManagerOrAdmin && stats.teamData && stats.teamData.length > 0 && (
        <Card className="border-border-subtle">
          <CardHeader>
            <CardTitle className="text-text-primary">Team Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-bg-tertiary border-b border-border-subtle">
                  <tr>
                    <th className="px-4 py-3 text-left text-text-secondary font-medium">Name</th>
                    <th className="px-4 py-3 text-left text-text-secondary font-medium">Email</th>
                    <th className="px-4 py-3 text-left text-text-secondary font-medium">Week Hours</th>
                    <th className="px-4 py-3 text-left text-text-secondary font-medium">Entries</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.teamData.map((member) => (
                    <tr key={member.userId} className="border-b border-border-subtle hover:bg-bg-tertiary/50 transition-colors">
                      <td className="px-4 py-3 text-text-primary font-medium">{member.name}</td>
                      <td className="px-4 py-3 text-text-secondary">{member.email}</td>
                      <td className="px-4 py-3 text-text-primary">{member.weekHours}h</td>
                      <td className="px-4 py-3 text-text-primary">{member.entriesCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
