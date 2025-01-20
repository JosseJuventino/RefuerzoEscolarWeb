"use client";

import Image from "next/image";
import { useAuth } from "@/scripts/useAuth";
import { NavItem } from "./NavItem";
import { usePathname } from "next/navigation";

import {
    LayoutDashboardIcon, UserIcon,
    LayersIcon, MoreHorizontalIcon, FileTextIcon, BookOpen
} from "lucide-react";

const Sidenav: React.FC = () => {
    const { user } = useAuth();
    const pathName = usePathname();
  
    const userCourses = [
      { label: "Matemática 1", link: "/dashboard/courses/matematica1" },
      { label: "Matemática 2", link: "/dashboard/courses/matematica2" },
      { label: "Matemática 3", link: "/dashboard/courses/matematica3" },
    ];
  
    return (
      <>
        <div className="hidden md:flex flex-col justify-between h-screen w-64 p-3 bg-white shadow-xl rounded-tr-2xl rounded-br-2xl text-black">
          <div className="space-y-4">
            <div className="flex flex-row justify-center">
              <Image src="/LogoColorido.svg" alt="Logo" className="w-28" />
            </div>
            <nav className="space-y-2">
              <NavItem link="/dashboard" icon={LayoutDashboardIcon} label="Inicio" isActive={pathName === "/dashboard"} />
              <NavItem link="/dashboard/students" icon={UserIcon} label="Alumnos" isActive={pathName === "/dashboard/students"} />
              <NavItem icon={BookOpen} label="Mis cursos" isActive={pathName.startsWith("/dashboard/courses")} subItems={userCourses} />
              <NavItem link="/dashboard/sections" icon={LayersIcon} label="Secciones" isActive={pathName === "/dashboard/sections"} />
              <NavItem link="/dashboard/applicants" icon={FileTextIcon} label="Postulaciones" isActive={pathName === "/dashboard/applicants"} />
            </nav>
          </div>
          <div className="flex items-center space-x-2 mt-4">
            {user?.photoURL ? (
              <Image
                src={user.photoURL}
                alt="User avatar"
                className="w-8 h-8 rounded-full"
              />
            ) : (
              <Image
                src="/placeholder.svg?height=32&width=32"
                alt="Default avatar"
                className="w-8 h-8 rounded-full"
              />
            )}
            <div className="flex-1">
              <p className="text-sm font-medium truncate w-full max-w-[10rem]">
                {user?.displayName || "Guest"}
              </p>
              <p className="text-xs text-gray-800 font-medium truncate w-full max-w-[10rem]">
                {user?.email || "No email available"}
              </p>
            </div>
            <button className="p-1 rounded-md transition-colors duration-200">
              <MoreHorizontalIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </>
    );
  };
  
  export default Sidenav;
  