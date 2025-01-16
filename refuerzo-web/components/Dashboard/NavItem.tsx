import Link from "next/link";
import React from "react";

const COLOR_TEXT_ACTIVE = "text-[#004aad] font-bold";
const COLOR_BG_ACTIVE = "bg-[#f0f4ff]";

interface NavItemProps {
  icon: React.ElementType;
  label: string;
  badge?: string;
  badgeColor?: string;
    link: string;
    isActive: boolean;
}

export const NavItem: React.FC<NavItemProps> = ({
  icon: Icon,
  label,
    link,
  isActive
}) => {


  return (
    <Link
    href={link}
    className={`relative flex items-center w-full px-3 py-3 cursor-pointer text-left rounded-md transition-colors duration-200 
      ${
        isActive
          ? `${COLOR_TEXT_ACTIVE} ${COLOR_BG_ACTIVE}`
          : "text-gray-500 font-medium hover:text-gray-700"
      }`}
  >
    {isActive && (
       <span className="absolute -left-2 top-0 h-full w-[3px] bg-[#004aad] rounded-full" />
    )}
    <Icon className="w-5 h-5 mr-3" />
    <span className="hidden md:inline">{label}</span>
  </Link>
  );
};
