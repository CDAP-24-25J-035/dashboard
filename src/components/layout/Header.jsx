import React from "react";
import { NavLink } from "react-router-dom";

const Header = () => {
    const navItems = [
        { name: "Anti-Patterns", path: "/anti-patterns" },
        { name: "Insights", path: "/insights" },
        { name: "Trace Explorer", path: "/trace-explorer" },
        { name: "System Architecture", path: "/system-architecture" },
        { name: "Coupling Indexes", path: "/coupling-indexes" },
        // { name: "Settings", path: "/settings" },
    ];

    return (
        <header className="bg-black text-white flex justify-between items-center px-4 py-2">
            {/* Left Section */}
            <div className="flex items-center space-x-6">
                <h1 className="text-lg font-bold">InfraPulse</h1>
                <nav className="flex space-x-4">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.name}
                            to={item.path}
                            className={({ isActive }) =>
                                `px-3 py-2 rounded-md ${
                                    isActive
                                        ? "bg-teal-500 text-black"
                                        : ""
                                }`
                            }
                        >
                            {item.name}
                        </NavLink>
                    ))}
                </nav>
            </div>

            {/* Right Section */}
            <div className="flex items-center space-x-4">
                {/* Dropdown Menu */}
                <div className="relative group">
                    {/* Dropdown Trigger */}
                    <button className="text-white bg-gray-700 px-4 py-2 rounded-md focus:outline-none hover:bg-gray-600">
                        About MicroGraph Insights ▾
                    </button>

                    {/* Dropdown Content */}
                    <div className="absolute top-full right-0 mt-1 bg-white text-black rounded-md shadow-lg hidden group-hover:flex flex-col z-10">
                        <ul className="w-48">
                            <li className="px-4 py-2 hover:bg-gray-200">
                                <a href="https://anti-pattern-analyzer.github.io/docs/">Website / Docs</a>
                            </li>
                            <li className="px-4 py-2 hover:bg-gray-200">
                                <a href="https://github.com/orgs/anti-pattern-analyzer/repositories">GitHub</a>
                            </li>
                            <hr className="border-t my-2" />
                            <li className="px-4 py-2">MicroGraph Insights v1.59.0</li>
                            <li className="px-4 py-2">Commit ed5cc29</li>
                            <li className="px-4 py-2">Build 2024-07-28T00:41:01Z</li>
                            <li className="px-4 py-2">MicroGraph Insights UI v1.59.0</li>
                        </ul>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
