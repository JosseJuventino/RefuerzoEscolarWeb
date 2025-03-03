import Link from "next/link";
import React, { useState } from "react";
import { ChevronDownIcon } from "lucide-react";

const COLOR_TEXT_ACTIVE = "text-[#004aad] font-bold";
const COLOR_BG_ACTIVE = "bg-[#f0f4ff]";
const TRANSITION = "transition-all duration-200 ease-in-out";

interface SubItem {
  path: string;
  name: string;
  icon?: React.ElementType;
}

interface NavItemProps {
  icon: React.ElementType;
  label: string;
  link?: string;
  isActive: boolean;
  subItems?: SubItem[];
  currentPath?: string;
}

export const NavItem: React.FC<NavItemProps> = ({
  icon: Icon,
  label,
  link,
  isActive,
  subItems,
  currentPath
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const hasSubItems = subItems && subItems.length > 0;


  const handleClick = (e: React.MouseEvent) => {
    if (hasSubItems) {
      e.preventDefault();
      setIsOpen(!isOpen);
    }
  };

  return (
    <div className="group">
      <Link
        href={link || "#"}
        onClick={handleClick}
        className={`relative flex items-center w-full px-3 py-3 cursor-pointer rounded-md ${TRANSITION}
          ${isActive
            ? `${COLOR_TEXT_ACTIVE} ${COLOR_BG_ACTIVE}`
            : "text-gray-600 hover:text-[#004aad] hover:bg-[#f0f4ff]/50"
          }`}
      >
        {isActive && (
          <span className="absolute -left-2 top-0 h-full w-[3px] bg-[#004aad] rounded-full" />
        )}

        <Icon className={`w-5 h-5 mr-3 ${isActive ? "text-[#004aad]" : "text-gray-500"}`} />

        <span className="flex-1">{label}</span>

        {hasSubItems && (
          <ChevronDownIcon
            className={`w-4 h-4 ml-2 ${TRANSITION} ${isOpen ? "rotate-180" : ""
              } ${isActive ? "text-[#004aad]" : "text-gray-500"}`}
          />
        )}
      </Link>

      {hasSubItems && (
        <div
          className={`overflow-hidden ${TRANSITION} ${isOpen ? "max-h-96" : "max-h-0"
            }`}
        >
          <div className="pl-8 mt-1 space-y-1">
            {subItems.map((subItem) => {
              const SubIcon = subItem.icon;
              const isSubItemActive = currentPath === subItem.path;
              return (
                <Link
                  key={subItem.path}
                  href={subItem.path}
                  className={`flex items-center px-3 py-2 text-sm rounded-md ${TRANSITION}
                    ${isSubItemActive
                      ? "text-[#004aad] font-medium bg-[#f0f4ff] hover:bg-[#f0f4ff]"
                      : "text-gray-500 hover:text-[#004aad] hover:bg-gray-100"
                    }`}
                >
                  {SubIcon && (
                    <SubIcon className="w-4 h-4 font-bold mr-3 text-current" />
                  )}
                  <span>{subItem.name}</span>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};