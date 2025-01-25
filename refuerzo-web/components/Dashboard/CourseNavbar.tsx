import React from 'react';
import Link from 'next/link';

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
  return (
    <nav className="bg-white shadow md:mt-0 mt-20 fixed w-full z-10">
      <div className="max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex">
            <div className="sm:-my-px ml-6 sm:flex space-x-8">
              {tabs.map((tab) => (
                <Link
                  key={tab.id}
                  href={tab.href}
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    tab.id === currentTabId
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
    </nav>
  );
};

export default CourseNavbar;
