import React, { useEffect, useState } from "react";

// ✅ FIXED PATHS
import { fetchTimeEntries } from "../services/api";
import { useAuth } from "../context/AuthContext";

import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/Card";
import { Clock, CheckCircle, AlertCircle, BarChart3 } from "lucide-react";

export const Dashboard = () => {
  const [stats, setStats] = useState({
    totalHours: 0,
    billableHours: 0,
    pendingApprovals: 0,
    completedTasks: 0,
  });

  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  const isManagerOrAdmin =
    user?.role === "MANAGER" || user?.role === "ADMIN";

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const response = await fetchTimeEntries();

        // ✅ FIX: handle backend response properly
        const entries = response?.data || [];

        let total = 0;
        let pending = 0;

        entries.forEach((entry) => {
          total += Number(entry.hours || 0);

          if (entry.status === "SUBMITTED") {
            pending += 1;
          }
        });

        setStats({
          totalHours: total,
          billableHours: Math.round(total * 0.8), // mock logic
          pendingApprovals: pending,
          completedTasks: entries.filter(
            (e) => e.status === "APPROVED"
          ).length,
        });

      } catch (error) {
        console.error("Failed to load dashboard data", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const statCards = [
    {
      title: "Total Hours This Month",
      value: stats.totalHours,
      icon: Clock,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Billable Hours",
      value: stats.billableHours,
      icon: BarChart3,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      title: "Completed Tasks",
      value: stats.completedTasks,
      icon: CheckCircle,
      color: "text-emerald-600",
      bgColor: "bg-emerald-100",
    },
  ];

  if (isManagerOrAdmin) {
    statCards.push({
      title: "Pending Approvals",
      value: stats.pendingApprovals,
      icon: AlertCircle,
      color: "text-amber-600",
      bgColor: "bg-amber-100",
    });
  }

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500">
          Welcome back, {user?.name || "User"}!
        </p>
      </div>

      {/* LOADING */}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((n) => (
            <Card key={n} className="animate-pulse">
              <CardHeader className="flex justify-between pb-2">
                <div className="h-4 w-1/2 bg-gray-200 rounded"></div>
                <div className="h-4 w-4 bg-gray-200 rounded-full"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 w-1/3 bg-gray-200 rounded mb-2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (

        /* STATS */
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {statCards.map((card) => (
            <Card key={card.title}>
              <CardHeader className="flex justify-between pb-2">
                <CardTitle className="text-sm text-gray-500">
                  {card.title}
                </CardTitle>

                <div className={`p-2 rounded-full ${card.bgColor}`}>
                  <card.icon className={`w-4 h-4 ${card.color}`} />
                </div>
              </CardHeader>

              <CardContent>
                <div className="text-3xl font-bold text-gray-900">
                  {card.value}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};