import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { LayoutDashboard, Clock, CheckSquare } from "lucide-react";
import { cn } from "../../utils/twMerge";

export const Sidebar = () => {
  const { user } = useAuth();
  const location = useLocation();

  // ✅ FIX: normalize role (backend uses UPPERCASE)
  const role = user?.role?.toUpperCase() || "EMPLOYEE";

  const navItems = [
    { name: "Dashboard", path: "/", icon: LayoutDashboard, roles: ["EMPLOYEE", "MANAGER", "ADMIN"] },
    { name: "My Timesheet", path: "/timesheet", icon: Clock, roles: ["EMPLOYEE", "MANAGER", "ADMIN"] },
    { name: "Approvals", path: "/approvals", icon: CheckSquare, roles: ["MANAGER", "ADMIN"] },
  ];

  // ✅ FIX: role filtering
  const visibleItems = navItems.filter((item) =>
    item.roles.includes(role)
  );

  return (
    <div className="flex flex-col w-64 bg-white border-r border-gray-200 h-full">
      
      {/* LOGO */}
      <div className="h-16 flex items-center px-6 border-b border-gray-200">
        <span className="text-xl font-bold text-primary flex items-center gap-2">
          <Clock className="w-6 h-6" />
          NForce Pulse
        </span>
      </div>

      {/* NAV */}
      <div className="flex-1 py-6 px-3 space-y-1">
        {visibleItems.map((item) => {

          // ✅ FIX: better active check (important for nested routes)
          const isActive =
            location.pathname === item.path ||
            location.pathname.startsWith(item.path);

          return (
            <Link
              key={item.name}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.name}
            </Link>
          );
        })}
      </div>

    </div>
  );
};