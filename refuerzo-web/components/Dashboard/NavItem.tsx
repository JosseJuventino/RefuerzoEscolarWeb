import Link from "next/link";
import React, { useState } from "react";
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";

const COLOR_TEXT_ACTIVE = "text-[#004aad] font-bold";
const COLOR_BG_ACTIVE = "bg-[#f0f4ff]";

interface NavItemProps {
  icon: React.ElementType;
  label: string;
  link?: string;
  isActive: boolean;
  badge?: string;
  badgeColor?: string;
  subItems?: { label: string; link: string }[];
}

export const NavItem: React.FC<NavItemProps> = ({
  icon: Icon,
  label,
  link,
  isActive,
  subItems,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSubItem, setActiveSubItem] = useState<string | null>(null);
  const hasSubItems = subItems && subItems.length > 0;

  const handleClick = (e: React.MouseEvent) => {
    if (hasSubItems) {
      e.preventDefault();
      setIsOpen((prev) => !prev);
    }
  };

  const handleSubItemClick = (subItemLink: string) => {
    setActiveSubItem(subItemLink);
  };

  return (
    <div>
      <Link
        href={link || "#"}
        onClick={handleClick}
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
        <span className="">{label}</span>
        {hasSubItems && (
          <span className="ml-auto">
            {isOpen ? (
              <ChevronUpIcon className="w-4 h-4" />
            ) : (
              <ChevronDownIcon className="w-4 h-4" />
            )}
          </span>
        )}
      </Link>

      {hasSubItems && isOpen && (
        <div className="pl-5 mt-2 space-y-1">
          {subItems.map((subItem) => (
            <div
              key={subItem.link}
              className={`py-2 px-5 rounded-md cursor-pointer transition-colors duration-200 ${
                activeSubItem === subItem.link ? COLOR_BG_ACTIVE : "hover:bg-[#f0f4ff]"
              }`}
              onClick={() => handleSubItemClick(subItem.link)}
            >
              <Link
                href={subItem.link}
                className={`block text-sm ${
                  activeSubItem === subItem.link
                    ? `${COLOR_TEXT_ACTIVE}`
                    : "text-gray-500 hover:text-[#004aad]"
                }`}
              >
                {subItem.label}
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
