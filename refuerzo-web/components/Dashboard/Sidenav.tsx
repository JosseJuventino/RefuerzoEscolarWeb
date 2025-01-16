"use client";

import { useState } from "react";
import { useAuth } from "@/scripts/useAuth";
import { NavItem } from "./NavItem";
import { usePathname } from "next/navigation";

import {
    LayoutDashboardIcon, UserIcon,
    LayersIcon, MoreHorizontalIcon, FileTextIcon
} from "lucide-react";


const Sidenav: React.FC = () => {
    const { user } = useAuth();
    const pathName = usePathname();
    const [activeTab, setActiveTab] = useState("overview");

    return (
        <>
            <div className="hidden md:flex flex-col justify-between h-screen w-64 p-3 bg-white shadow-xl rounded-tr-2xl rounded-br-2xl text-black">
                <div className="space-y-4">
                    <div className="flex flex-row justify-center">
                        <img src="/LogoV2.svg" alt="Logo" className="w-28" />
                    </div>
                    <nav className="space-y-2">
                        <NavItem link="/dashboard" icon={LayoutDashboardIcon} label="Inicio" isActive={pathName === "/dashboard"} />
                        <NavItem link="dashboard/students" icon={UserIcon} label="Alumnos"  isActive={pathName === "/dashboard/students"}/>
                        <NavItem link="dashboard/sections" icon={LayersIcon} label="Secciones" isActive={pathName === "/dashboard/sections"}/>
                        <NavItem link="dashboard/applicants" icon={FileTextIcon} label="Postulaciones" isActive={pathName === "/dashboard/applicants"}/>
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
                        <p className="text-sm font-medium truncate w-full max-w-[10rem]">{user?.displayName || "Guest"}</p>
                        <p className="text-xs text-gray-800 font-medium truncate w-full max-w-[10rem]">{user?.email || "No email available"}</p>
                    </div>
                    <button className="p-1 rounded-md transition-colors duration-200">
                        <MoreHorizontalIcon className="w-5 h-5" />
                    </button>
                </div>
            </div>

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
