"use client";

import Image from "next/image";
import { useAuth } from "@/scripts/useAuth";
import { NavItem } from "./NavItem";
import { usePathname } from "next/navigation";
import { useState } from "react";

import {
  LayoutDashboardIcon,
  UserIcon,
  LayersIcon,
  MoreHorizontalIcon,
  FileTextIcon,
  BookOpen,
  MenuIcon,
  XIcon,
  UsersRoundIcon
} from "lucide-react";

const Sidenav: React.FC = () => {
  const { user } = useAuth();
  const pathName = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const userCourses = [
    { label: "Matemática 1", link: "/dashboard/courses/matematica1" },
    { label: "Matemática 2", link: "/dashboard/courses/matematica2" },
    { label: "Matemática 3", link: "/dashboard/courses/matematica3" },
  ];

  const toggleMenu = () => setIsMenuOpen((prev) => !prev);

  return (
    <>
      <div className="md:hidden fixed z-[200] w-full flex items-center justify-between px-4 py-2 bg-white h-20 ">
        <button
          onClick={toggleMenu}
          className="text-gray-800 hover:text-gray-900 focus:outline-none"
        >
          {isMenuOpen ? <XIcon className="w-6 h-60" /> : <MenuIcon className="w-6 h-6" />}
        </button>
        <img src="/LogoColorido.svg" alt="Logo" className="w-12" />
      </div>

      <div className="hidden md:flex flex-col justify-between h-screen w-64 p-3 bg-white shadow-xl rounded-tr-2xl rounded-br-2xl text-black">
        <div className="space-y-4">
          <div className="flex flex-row justify-center">
            <img src="/LogoColorido.svg" alt="Logo" className="w-28" />
          </div>
          <nav className="space-y-2">
            <NavItem link="/dashboard" icon={LayoutDashboardIcon} label="Inicio" isActive={pathName === "/dashboard"} />
            <NavItem link="/dashboard/students" icon={UserIcon} label="Alumnos" isActive={pathName === "/dashboard/students"} />
            <NavItem icon={BookOpen} label="Mis cursos" isActive={pathName.startsWith("/dashboard/courses")} subItems={userCourses} />
            <NavItem link="/dashboard/sections" icon={LayersIcon} label="Secciones" isActive={pathName === "/dashboard/sections"} />
            <NavItem link="/dashboard/applicants" icon={FileTextIcon} label="Postulaciones" isActive={pathName === "/dashboard/applicants"} />
            <NavItem link="/dashboard/recomendators" icon={UsersRoundIcon} label="Recomendadores" isActive={pathName === "/dashboard/recomendators"} />
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
            <Image
              src="/placeholder.svg?height=32&width=32"
              alt="Default avatar"
              width={32}
              height={32}
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

      {isMenuOpen && (
        <div className="md:hidden fixed inset-0 z-[500] flex">
          <div className="flex flex-col justify-between h-full w-64 p-3 bg-white shadow-xl rounded-tr-2xl rounded-br-2xl">
            <div className="space-y-4">
              <div className="flex flex-row justify-center">
                <img src="/LogoColorido.svg" alt="Logo" className="w-28" />
              </div>
              <nav className="space-y-2">
                <NavItem link="/dashboard" icon={LayoutDashboardIcon} label="Inicio" isActive={pathName === "/dashboard"} badgeColor="blue-100"/>
                <NavItem link="/dashboard/students" icon={UserIcon} label="Alumnos" isActive={pathName === "/dashboard/students"} />
                <NavItem icon={BookOpen} label="Mis cursos" isActive={pathName.startsWith("/dashboard/courses")} subItems={userCourses} />
                <NavItem link="/dashboard/sections" icon={LayersIcon} label="Secciones" isActive={pathName === "/dashboard/sections"} />
                <NavItem link="/dashboard/applicants" icon={FileTextIcon} label="Postulaciones" isActive={pathName === "/dashboard/applicants"} />
                <NavItem link="/dashboard/recomendators" icon={UsersRoundIcon} label="Recomendadores" isActive={pathName === "/dashboard/recomendators"} />
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
                <Image
                  src="/placeholder.svg?height=32&width=32"
                  alt="Default avatar"
                  width={32}
                  height={32}
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
          <div
            className="flex-1 bg-black bg-opacity-50"
            onClick={toggleMenu}
          ></div>
        </div>
      )}
    </>
  );
};

export default Sidenav;
