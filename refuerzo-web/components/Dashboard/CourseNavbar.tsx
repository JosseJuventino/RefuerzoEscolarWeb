'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, Menu } from 'lucide-react';

type Tab = {
  id: number;
  name: string;
  href: string;
};

type CourseNavbarProps = {
  tabs: Tab[];
  currentTabId: number;
};

const CourseNavbar: React.FC<CourseNavbarProps> = ({ tabs, currentTabId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const currentTab = tabs.find(tab => tab.id === currentTabId);

  return (
    <nav className="bg-white shadow fixed w-full z-30 md:mt-0">
      {/* Desktop Navigation */}
      <div className="hidden md:block">
        <div className="max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex">
              <div className="sm:-my-px sm:flex space-x-8">
                {tabs.map((tab) => (
                  <Link
                    key={tab.id}
                    href={tab.href}
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${tab.id === currentTabId
                      ? 'border-indigo-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                      }`}
                  >
                    {tab.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden">
        <div className="px-4 py-2">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="w-full flex items-center justify-between py-2 text-sm font-medium text-gray-900"
          >
            <span className="flex items-center text-blue_principal">
              <Menu className="h-5 w-5 mr-2 " />
              {currentTab?.name || 'Navegación'}
            </span>
            <ChevronDown
              className={`h-5 w-5 transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''
                }`}
            />
          </button>

          {/* Mobile Menu Dropdown */}
          {isOpen && (
            <div className="absolute left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
              {tabs.map((tab) => (
                <Link
                  key={tab.id}
                  href={tab.href}
                  onClick={() => setIsOpen(false)}
                  className={`block px-4 py-3 text-sm font-medium ${tab.id === currentTabId
                    ? 'bg-indigo-50 text-indigo-600'
                    : 'text-gray-700 hover:bg-gray-50'
                    }`}
                >
                  {tab.name}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default CourseNavbar;