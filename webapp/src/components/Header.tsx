import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { UserCircle2, LogOut } from "lucide-react";

const Header: React.FC = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg relative">
      <h1 className="text-2xl font-bold tracking-wide">Skimzy</h1>

      <div className="relative">
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center space-x-2 focus:outline-none"
        >
          <UserCircle2 className="w-7 h-7" />
        </button>

        {dropdownOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white text-gray-800 rounded shadow-lg z-50">
            <div className="px-4 py-2 border-b text-sm text-gray-600">
              {/* Replace with real email if available */}
              Logged in as <br /><span className="font-semibold">user@example.com</span>
            </div>
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center space-x-2"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
