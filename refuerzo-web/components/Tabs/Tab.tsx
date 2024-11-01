    "use client";
    import React from 'react';
    import { Tabs, Tab} from "@nextui-org/react";

    interface TabData {
        key: string;
        title: string;
        content: React.ReactNode;
    }

    interface CustomTabsProps {
        tabs: TabData[];
    }

    const CustomTabs: React.FC<CustomTabsProps> = ({ tabs }) => {
        return (
            <Tabs aria-label="Options" variant={"underlined"} classNames={{ tab: "font-bold mt-5 -ml-2"}}>
                {tabs.map((tab) => (
                    <Tab key={tab.key} title={tab.title}>
                        {tab.content}
                    </Tab>
                ))}
            </Tabs>
        );
    };

    export default CustomTabs;
