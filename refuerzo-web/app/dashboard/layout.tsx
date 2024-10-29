"use client";

import Sidenav from "@/components/Dashboard/Sidenav";

interface SidenavProps {
    children: React.ReactNode;
}

const JobslyLayout: React.FC<SidenavProps> = ({ children }) => {
    return (
        <div className="flex h-screen">
            <Sidenav />
            <main className="flex-1 p-6 bg-gray-100 overflow-y-auto">
                {children}
            </main>
        </div>
    );
};

export default JobslyLayout;
