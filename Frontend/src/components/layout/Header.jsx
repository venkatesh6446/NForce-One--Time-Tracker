import React from "react";
import { LogOut, User } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { Button } from "../ui/Button";

export const Header = () => {
  const { user, logout } = useAuth();

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      <div className="flex items-center">
        {/* Placeholder for left-side header content like mobile menu toggle */}
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-sm text-gray-700">
          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary">
            <User className="w-4 h-4" />
          </div>
          <span className="font-medium">{user?.name || user?.email || 'User'}</span>
          <span className="text-gray-400 capitalize bg-gray-100 px-2 py-0.5 rounded text-xs ml-2">
            {user?.role || 'employee'}
          </span>
        </div>
        <div className="w-px h-6 bg-gray-200"></div>
        <Button variant="ghost" size="sm" onClick={logout} className="text-gray-500 hover:text-red-600 gap-2">
          <LogOut className="w-4 h-4" />
          Logout
        </Button>
      </div>
    </header>
  );
};
