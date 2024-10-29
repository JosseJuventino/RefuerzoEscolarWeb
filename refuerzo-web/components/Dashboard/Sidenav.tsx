"use client";

import { useState } from "react";
import { useAuth } from "@/scripts/useAuth";
import useUserStore from "@/scripts/userStore";
import {
    SearchIcon, LayoutDashboardIcon, UserIcon,
    LayersIcon, MoreHorizontalIcon,
} from "lucide-react";

interface NavItemProps {
    icon: React.ElementType;
    label: string;
    badge?: string;
    badgeColor?: string;
}

const NavItem: React.FC<NavItemProps> = ({ icon: Icon, label, badge, badgeColor = "bg-blue-500" }) => (
    <button className="flex items-center w-full px-3 py-2 text-left rounded-md hover:bg-[#004e8f] transition-colors duration-200">
        <Icon className="w-5 h-5 mr-3" />
        <span className="hidden md:inline">{label}</span>
        {badge && (
            <span className={`ml-auto px-2 py-0.5 text-xs font-medium rounded-full ${badgeColor}`}>
                {badge}
            </span>
        )}
    </button>
);

const Sidenav: React.FC = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState("overview");

    return (
        <>
            {/* Sidebar para pantallas medianas en adelante */}
            <div className="hidden md:flex flex-col justify-between h-screen w-64 p-3 bg-[#003C71] text-white">
                <div className="space-y-4">
                    <div className="flex flex-row justify-center">
                        <img src="/Logo.svg" alt="Logo" className="w-28" />
                    </div>
                    <div className="relative">
                        <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search"
                            className="w-full pl-10 pr-4 py-2 rounded-md bg-[#004e8f] text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0066bd]"
                        />
                    </div>
                    <nav className="space-y-1">
                        <NavItem icon={LayoutDashboardIcon} label="Inicio" />
                        <NavItem icon={UserIcon} label="Alumnos" />
                        <NavItem icon={LayersIcon} label="Secciones" badge="8" badgeColor="bg-blue-500" />
                    </nav>
                </div>
                <div className="flex items-center space-x-2 mt-4">
                    {user?.photoURL ? (
                        <img
                            src={user.photoURL}
                            alt="User avatar"
                            className="w-8 h-8 rounded-full"
                        />
                    ) : (
                        <img
                            src="/placeholder.svg?height=32&width=32"
                            alt="Default avatar"
                            className="w-8 h-8 rounded-full"
                        />
                    )}
                    <div className="flex-1">
                        <p className="text-sm font-medium">{user?.displayName || "Guest"}</p>
                        <p className="text-xs text-gray-300">{user?.email || "No email available"}</p>
                    </div>
                    <button className="p-1 rounded-md hover:bg-[#004e8f] transition-colors duration-200">
                        <MoreHorizontalIcon className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Barra de navegación inferior para pantallas pequeñas */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 bg-[#003C71] text-white">
                <nav className="flex justify-around items-center h-16">
                    <button
                        onClick={() => setActiveTab("overview")}
                        className={`flex flex-col items-center ${activeTab === "overview" ? "text-blue-300" : ""}`}
                    >
                        <LayoutDashboardIcon className="w-6 h-6" />
                        <span className="text-xs">Inicio</span>
                    </button>
                    <button
                        onClick={() => setActiveTab("alumnos")}
                        className={`flex flex-col items-center ${activeTab === "alumnos" ? "text-blue-300" : ""}`}
                    >
                        <UserIcon className="w-6 h-6" />
                        <span className="text-xs">Alumnos</span>
                    </button>
                    <button
                        onClick={() => setActiveTab("secciones")}
                        className={`flex flex-col items-center ${activeTab === "secciones" ? "text-blue-300" : ""}`}
                    >
                        <LayersIcon className="w-6 h-6" />
                        <span className="text-xs">Secciones</span>
                    </button>
                </nav>
            </div>
        </>
    );
};

export default Sidenav;
