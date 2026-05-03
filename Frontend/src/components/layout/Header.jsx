import React, { useState, useEffect } from "react";
import { LogOut, User, Bell } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "../ui/Button";
import { fetchUnreadCount } from "../../services/api";

export const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  const loadUnreadCount = async () => {
    try {
      const response = await fetchUnreadCount();
      setUnreadCount(response?.data?.count || 0);
    } catch (error) {
      console.error("Failed to fetch unread count", error);
    }
  };

  useEffect(() => {
    loadUnreadCount();
    const interval = setInterval(loadUnreadCount, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="h-16 bg-bg-secondary border-b border-border-subtle flex items-center justify-between px-6 shadow-[0_2px_20px_rgba(0,0,0,0.2)]">
      <div className="flex items-center">
        {/* Placeholder for left-side header content like mobile menu toggle */}
      </div>
      <div className="flex items-center gap-4">
        <button
          onClick={() => {
            navigate("/notifications");
            loadUnreadCount();
          }}
          className="relative p-2 text-text-secondary hover:text-accent hover:bg-bg-tertiary rounded-lg transition-all duration-200"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-accent text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full shadow-[0_0_10px_rgba(255,45,45,0.5)]">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>

        <div className="flex items-center gap-2 text-sm text-text-primary">
          <div className="w-8 h-8 bg-accent/15 rounded-full flex items-center justify-center text-accent border border-accent/20">
            <User className="w-4 h-4" />
          </div>
          <span className="font-medium">{user?.name || user?.email || 'User'}</span>
          <span className="text-text-secondary capitalize bg-bg-tertiary px-2 py-0.5 rounded text-xs ml-2 border border-border-subtle">
            {user?.role || 'employee'}
          </span>
        </div>
        <div className="w-px h-6 bg-border-subtle"></div>
        <Button variant="ghost" size="sm" onClick={logout} className="text-text-secondary hover:text-accent gap-2">
          <LogOut className="w-4 h-4" />
          Logout
        </Button>
      </div>
    </header>
  );
};
