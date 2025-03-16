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
    <nav className="bg-white py-0 sm:py-0 shadow md:mt-0 fixed w-full z-30">
      <div className="max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 overflow-x-auto whitespace-nowrap items-center justify-between scrollbar-thin">
          <div className="flex">
            <div className="sm:-my-px ml-6 sm:flex">
              {tabs.map((tab) => (
                <Link
                  key={tab.id}
                  href={tab.href}
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium mr-5 ${
                    tab.id === currentTabId
                      ? 'border-indigo-500 text-gray-900'
                      : 'border-transparent  md:py-0 text-gray-500 hover:border-gray-300 hover:text-gray-700'
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