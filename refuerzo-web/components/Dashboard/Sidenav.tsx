"use client";

import Image from "next/image";
import Link from "next/link";
import { NavItem } from "./NavItem";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import {
  LayoutDashboardIcon,
  UserIcon,
  LayersIcon,
  MoreHorizontalIcon,
  FileTextIcon,
  BookOpen,
  MenuIcon,
  XIcon,
  UsersRoundIcon,
  LogOut,
  UserCircle,
  Settings,
  Users2Icon
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";


const Sidenav: React.FC = () => {
  const pathName = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const { data: session } = useSession();
  const user = session?.user;

  useEffect(() => {
    setIsMounted(true);

    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Datos estáticos
  const userCourses = [
    { name: "Matemática", path: '/dashboard/my-courses/matematica' },
  ];

  const users = [
    { name: "Alumnos", path: '/dashboard/students', icon: UserIcon },
    { name: "Recomendadores", path: '/dashboard/recomendators', icon: UsersRoundIcon },
    { name: "Tutores", path: '/dashboard/tutors', icon: Users2Icon },
    { name: "Profesores", path: '/dashboard/teachers', icon: Users2Icon }
  ];

  // Handlers
  const toggleMobileMenu = () => setIsMenuOpen((prev) => !prev);
  const handleLogout = () => signOut({ callbackUrl: '/' });

  // Skeleton loader para SSR
  if (!isMounted) {
    return (
      <div className="hidden md:flex flex-col justify-between h-screen w-64 p-3 bg-white shadow-xl rounded-tr-2xl rounded-br-2xl text-black">
        <div className="space-y-4">
          <div className="flex justify-center">
            <div className="w-28 h-28 bg-gray-200 rounded-full animate-pulse" />
          </div>
          <nav className="space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={`skeleton-nav-${i}`} className="h-10 bg-gray-200 rounded animate-pulse" />
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-2 mt-4">
          <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
            <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }
  const UserMenu = ({ mobile = false }: { mobile?: boolean }) => (
    <div className="relative" ref={userMenuRef}>
      <button
        onClick={() => setShowUserMenu(!showUserMenu)}
        className="p-1 rounded-md hover:bg-gray-100 transition-colors"
        aria-label="User menu"
      >
        <MoreHorizontalIcon className="w-5 h-5" />
      </button>

      {showUserMenu && (
        <div className={`absolute bottom-full mb-2 right-0 w-48 bg-white rounded-lg shadow-xl border z-50 ${mobile ? 'origin-bottom-right' : 'origin-bottom'
          }`}>
          <Link
            href="/dashboard/profile"
            className="flex items-center px-4 py-3 hover:bg-gray-50 transition-colors text-sm text-gray-700"
            onClick={() => setShowUserMenu(false)}
          >
            <UserCircle className="w-5 h-5 mr-2 text-gray-500" />
            Mi perfil
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-4 py-3 hover:bg-gray-50 transition-colors text-sm text-red-500"
          >
            <LogOut className="w-5 h-5 mr-2" />
            Cerrar sesión
          </button>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Mobile Header */}
      <header className="md:hidden fixed z-[200] w-full flex items-center justify-between px-4 py-2 bg-white h-20 shadow-sm">
        <button
          onClick={toggleMobileMenu}
          className="text-gray-800 hover:text-gray-900 transition-colors"
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <XIcon className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
        </button>
        <Image
          src="/LogoColorido.svg"
          alt="Company Logo"
          width={48}
          height={48}
          className="w-12 h-12"
          priority
        />
      </header>

      <aside className="hidden md:flex flex-col justify-between h-screen w-64 p-3 bg-white shadow-xl rounded-tr-2xl rounded-br-2xl">
        <div className="flex flex-col flex-1 overflow-hidden">
          <div className="flex justify-center">
            <Image
              src="/LogoColorido.svg"
              alt="Company Logo"
              width={112}
              height={112}
              className="w-28 h-28"
              priority
            />
          </div>
          <div className="flex-1 overflow-y-auto overscroll-contain py-2">
            <nav className="space-y-2 overflow-y-auto mr-3">
              <NavItem
                link="/dashboard"
                icon={LayoutDashboardIcon}
                label="Inicio"
                isActive={pathName === "/dashboard"}
              />

              <NavItem
                icon={UserIcon}
                label="Usuarios"
                isActive={pathName.startsWith("/dashboard/students") || pathName.startsWith("/dashboard/recomendators")}
                subItems={users}
                currentPath={pathName}
              />
              <NavItem
                icon={BookOpen}
                label="Mis cursos"
                isActive={pathName.startsWith("/dashboard/my-courses")}
                subItems={userCourses}
                currentPath={pathName}
              />
              <NavItem
                link="/dashboard/courses"
                icon={LayersIcon}
                label="Cursos"
                isActive={pathName === "/dashboard/courses"}
              />
              <NavItem
                link="/dashboard/applicants"
                icon={FileTextIcon}
                label="Postulaciones"
                isActive={pathName === "/dashboard/applicants"}
              />

              <NavItem
                link="/dashboard/advanced-options"
                icon={Settings}
                label="Opciones avanzadas"
                isActive={pathName === "/dashboard/advanced-options"}
              />
            </nav>
          </div>
        </div>

        <div className="flex items-center gap-2 mt-4 pt-4 border-t" suppressHydrationWarning>
          <div className="flex items-center gap-2 flex-1">
            {user?.image ? (
              <img
                src={user.image}
                alt="User avatar"
                className="w-8 h-8 object-cover rounded-full"
                width={32}
                height={32}
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                <UserCircle className="w-5 h-5 text-gray-400" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {user?.name || "Invitado"}
              </p>
              <p className="text-xs text-gray-600 truncate">
                {user?.email || "No disponible"}
              </p>
            </div>
          </div>
          <UserMenu />
        </div>
      </aside>

      {/* Mobile Sidebar */}
      {isMenuOpen && (
        <div className="md:hidden fixed inset-0 z-[500] flex">
          <div className="flex flex-col justify-between h-full w-64 p-3 bg-white shadow-xl rounded-tr-2xl rounded-br-2xl">
            <div className="flex-1 overflow-hidden">
              <div className="flex justify-center">
                <Image
                  src="/LogoColorido.svg"
                  alt="Company Logo"
                  width={112}
                  height={112}
                  className="w-28 h-28"
                  priority
                />
              </div>
              <div className="flex-1 overflow-y-auto overscroll-contain py-2">
                <nav className="space-y-2 overflow-y-auto">
                  <NavItem
                    link="/dashboard"
                    icon={LayoutDashboardIcon}
                    label="Inicio"
                    isActive={pathName === "/dashboard"}
                  />
                  <NavItem
                    icon={UserIcon}
                    label="Usuarios"
                    isActive={pathName.startsWith("/dashboard/students") || pathName.startsWith("/dashboard/recomendators")}
                    subItems={users}
                    currentPath={pathName}
                  />
                  <NavItem
                    icon={BookOpen}
                    label="Mis cursos"
                    isActive={pathName.startsWith("/dashboard/my-courses")}
                    subItems={userCourses}
                    currentPath={pathName}
                  />

                  <NavItem
                    link="/dashboard/courses"
                    icon={LayersIcon}
                    label="Cursos"
                    isActive={pathName === "/dashboard/courses"}
                  />
                  <NavItem
                    link="/dashboard/applicants"
                    icon={FileTextIcon}
                    label="Postulaciones"
                    isActive={pathName === "/dashboard/applicants"}
                  />

                  <NavItem
                    link="/dashboard/advanced-options"
                    icon={Settings}
                    label="Opciones avanzadas"
                    isActive={pathName === "/dashboard/advanced-options"}
                  />
                </nav>
              </div>
            </div>

            {/* Mobile User Section */}
            <div className="flex items-center gap-2 mt-4 pt-4 border-t">
              <div className="flex items-center gap-2 flex-1">
                {user?.image ? (
                  <img
                    src={user.image}
                    alt="User avatar"
                    className="w-8 object-cover h-8 rounded-full"
                    width={32}
                    height={32}
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                    <UserCircle className="w-5 h-5 text-gray-400" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {user?.name || "Invitado"}
                  </p>
                  <p className="text-xs text-gray-600 truncate">
                    {user?.email || "No disponible"}
                  </p>
                </div>
              </div>
              <UserMenu mobile />
            </div>
          </div>
          <div
            className="flex-1 bg-black/50 backdrop-blur-sm"
            onClick={toggleMobileMenu}
          />
        </div>
      )}
    </>
  );
};

export default Sidenav;