import React from "react";

const Header: React.FC = () => (
  <header className="flex items-center justify-between px-6 py-4 bg-white shadow-md">
    <h1 className="text-2xl font-bold">Skimzy</h1>
    <nav className="space-x-4">
      <button className="text-gray-700 hover:text-gray-900">Library</button>
      <button className="text-gray-700 hover:text-gray-900">Upload</button>
      <button className="text-gray-700 hover:text-gray-900">Help</button>
    </nav>
    <div className="flex items-center space-x-2">
      <span className="text-gray-700">Jane Doe</span>
      <button className="text-gray-500 hover:text-gray-700">Logout</button>
    </div>
  </header>
);

export default Header;
